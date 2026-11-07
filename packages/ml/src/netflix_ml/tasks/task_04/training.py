"""Reproducible catalog segmentation with geometry and seed-stability diagnostics."""

import itertools
import platform
import time
import warnings
from datetime import UTC, datetime
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sklearn
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    adjusted_rand_score,
    calinski_harabasz_score,
    davies_bouldin_score,
    silhouette_score,
)
from sklearn.mixture import GaussianMixture
from sklearn.pipeline import Pipeline
from threadpoolctl import threadpool_limits

from netflix_ml.shared.io import digest, read_json, root, write_json
from netflix_ml.tasks.task_04.features import CatalogEncoder, tokens

FEATURES = ["type", "country", "listed_in", "release_year", "duration"]


def prepare(config):
    base = root()
    source = base / "data/raw/Dataset.csv"
    if digest(source) != config["source_sha256"]:
        raise ValueError("Source hash differs from the reviewed dataset")
    data = pd.read_csv(source)
    if data[FEATURES + ["show_id", "title"]].isna().any().any():
        raise ValueError("Unexpected missing cells require review")
    if data.show_id.duplicated().any() or not data.type.isin(["Movie", "TV Show"]).all():
        raise ValueError("Invalid source IDs or content types")
    units = data.duration.str.extract(r"^(\d+) (min|Seasons?)$")
    if units.isna().any().any() or (units[0].astype(int) <= 0).any():
        raise ValueError("Invalid duration")
    if not (data.type.eq("Movie") == units[1].eq("min")).all():
        raise ValueError("Type and duration unit differ")
    # Title/type/year identifies the reviewed case/space variants. Rating is not an identity key.
    data["entity_key"] = (
        data.title.str.casefold().str.strip() + "|" + data.type + "|" + data.release_year.astype(str)
    )
    duplicate_mapping = []
    seen = {}
    for _, row in data.iterrows():
        if row.entity_key in seen:
            duplicate_mapping.append({"removed_id": row.show_id, "retained_id": seen[row.entity_key]})
        else:
            seen[row.entity_key] = row.show_id
    catalog = data.drop_duplicates("entity_key").reset_index(drop=True)
    for name in ["type", "country", "listed_in"]:
        catalog[name] = catalog[name].str.strip()
    path = base / "data/processed/task-04/catalog.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    catalog.to_csv(path, index=False)
    cleaning = {
        "raw_rows": len(data),
        "catalog_rows": len(catalog),
        "removed_rows": len(data) - len(catalog),
        "duplicate_mapping": duplicate_mapping,
        "source_sha256": digest(source),
        "catalog_sha256": digest(path),
        "policy": "Retain first source row per normalized title/type/year; rating is excluded from deduplication and fitting",
    }
    write_json(base / "reports/task-04/cleaning_log.json", cleaning)
    return catalog, cleaning


def estimator(algorithm, k, seed):
    if algorithm == "kmeans":
        return KMeans(n_clusters=k, n_init=10, max_iter=300, random_state=seed)
    if algorithm == "minibatch_kmeans":
        return MiniBatchKMeans(n_clusters=k, n_init=10, max_iter=300, batch_size=1024, random_state=seed)
    return GaussianMixture(
        n_components=k, covariance_type="diag", n_init=1, max_iter=200, reg_covar=1e-4, random_state=seed
    )


def frequencies(values, n=5):
    counts = pd.Series([v for value in values for v in tokens(value)]).value_counts()
    return [{"name": str(key), "count": int(count)} for key, count in counts.head(n).items()]


def train(config_path: Path | None = None):
    base = root()
    config = read_json(config_path or base / "configs/task-04/experiment.json")
    catalog, cleaning = prepare(config)
    run_id = datetime.now(UTC).strftime("%Y%m%dT%H%M%S%fZ")
    bundle = base / "artifacts/task-04" / run_id
    bundle.mkdir(parents=True, exist_ok=False)
    encoder = CatalogEncoder(config["weights"])
    with threadpool_limits(limits=1):
        X = encoder.fit_transform(catalog[FEATURES])
        rng = np.random.default_rng(config["final_seed"])
        sample = np.sort(rng.choice(len(X), min(config["silhouette_sample"], len(X)), replace=False))
        rows = []
        for algorithm, k in itertools.product(
            ["kmeans", "minibatch_kmeans", "gaussian_mixture"], config["cluster_counts"]
        ):
            print(f"Task 4: {algorithm}, k={k}, seeds={config['seeds']}", flush=True)
            scores, label_sets, diagnostics = [], [], []
            start = time.monotonic()
            for seed in config["seeds"]:
                model = estimator(algorithm, k, seed)
                with warnings.catch_warnings(record=True) as caught:
                    warnings.simplefilter("always")
                    labels = model.fit_predict(X)
                counts = np.bincount(labels, minlength=k)
                valid = len(set(labels[sample])) > 1 and len(set(labels[sample])) < len(sample)
                scores.append(
                    {
                        "seed": seed,
                        "silhouette": float(silhouette_score(X[sample], labels[sample])) if valid else -1.0,
                        "davies_bouldin": float(davies_bouldin_score(X[sample], labels[sample]))
                        if valid
                        else 1e10,
                        "calinski_harabasz": float(calinski_harabasz_score(X[sample], labels[sample]))
                        if valid
                        else 0.0,
                        "minimum_share": float(counts.min() / len(X)),
                        "actual_clusters": len(set(labels)),
                    }
                )
                label_sets.append(labels)
                diagnostics.extend(str(w.message) for w in caught)
                if not getattr(model, "converged_", True):
                    diagnostics.append(f"seed {seed}: did not converge")
            stability = float(
                np.mean([adjusted_rand_score(a, b) for a, b in itertools.combinations(label_sets, 2)])
            )
            eligible = all(
                row["actual_clusters"] == k and row["minimum_share"] >= config["minimum_cluster_share"]
                for row in scores
            ) and not any("converge" in message.lower() for message in diagnostics)
            row = {
                "algorithm": algorithm,
                "k": k,
                "silhouette_mean": float(np.mean([s["silhouette"] for s in scores])),
                "silhouette_std": float(np.std([s["silhouette"] for s in scores])),
                "davies_bouldin": float(np.mean([s["davies_bouldin"] for s in scores])),
                "calinski_harabasz": float(np.mean([s["calinski_harabasz"] for s in scores])),
                "stability_ari": stability,
                "minimum_share": min(s["minimum_share"] for s in scores),
                "eligible": eligible,
                "seconds": round(time.monotonic() - start, 3),
                "seed_scores": scores,
                "diagnostics": sorted(set(diagnostics)),
            }
            rows.append(row)
            write_json(bundle / "progress.json", rows)
        order = {"kmeans": 0, "minibatch_kmeans": 1, "gaussian_mixture": 2}
        eligible = [row for row in rows if row["eligible"]]
        if not eligible:
            raise ValueError(
                "No nondegenerate converged candidate; inspect diagnostics before changing the protocol"
            )
        selected = max(
            eligible,
            key=lambda r: (r["silhouette_mean"], -r["davies_bouldin"], -r["k"], -order[r["algorithm"]]),
        )
        model = estimator(selected["algorithm"], selected["k"], config["final_seed"])
        labels = model.fit_predict(X)
        projector = PCA(n_components=2, random_state=config["final_seed"])
        coordinates = projector.fit_transform(X)
    pipeline = Pipeline([("features", encoder), ("cluster", model)])
    joblib.dump(pipeline, bundle / "pipeline.joblib", compress=3)
    joblib.dump(projector, bundle / "projection.joblib", compress=3)
    catalog["cluster"] = labels
    catalog["x"], catalog["y"] = coordinates[:, 0], coordinates[:, 1]
    catalog.to_csv(bundle / "assignments.csv", index=False)
    profiles = []
    for cluster in range(selected["k"]):
        mask = labels == cluster
        group = catalog.loc[mask]
        center = X[mask].mean(axis=0)
        nearest = np.where(mask)[0][np.argsort(np.linalg.norm(X[mask] - center, axis=1))[:5]]
        genres = frequencies(group.listed_in)
        countries = frequencies(group.country)
        # Names are descriptive top-genre summaries, not claims of objectively true categories.
        name = " / ".join(item["name"] for item in genres[:2])
        movie_duration = group.loc[group.type == "Movie", "duration"].str.extract(r"^(\d+)")[0].astype(float)
        seasons = group.loc[group.type == "TV Show", "duration"].str.extract(r"^(\d+)")[0].astype(float)
        profiles.append(
            {
                "id": cluster,
                "name": name,
                "size": len(group),
                "share": len(group) / len(catalog),
                "movie_count": int(group.type.eq("Movie").sum()),
                "tv_count": int(group.type.eq("TV Show").sum()),
                "median_year": float(group.release_year.median()),
                "genres": genres,
                "countries": countries,
                "median_movie_minutes": float(movie_duration.median()) if len(movie_duration) else None,
                "median_tv_seasons": float(seasons.median()) if len(seasons) else None,
                "representatives": catalog.iloc[nearest][
                    ["show_id", "title", "type", "release_year", "duration"]
                ].to_dict("records"),
            }
        )
    rng = np.random.default_rng(config["final_seed"])
    projection_idx = []
    for profile in profiles:
        indices = np.where(labels == profile["id"])[0]
        size = min(len(indices), max(1, round(config["projection_sample"] * profile["share"])))
        projection_idx.extend(rng.choice(indices, size, replace=False).tolist())
    projection = catalog.iloc[sorted(projection_idx)][
        ["show_id", "title", "type", "cluster", "x", "y"]
    ].to_dict("records")
    metadata = {
        "run_id": run_id,
        "source_sha256": cleaning["source_sha256"],
        "catalog_sha256": cleaning["catalog_sha256"],
        "python": platform.python_version(),
        "sklearn": sklearn.__version__,
        "config": config,
        "feature_names": encoder.get_feature_names_out().tolist(),
        "feature_count": X.shape[1],
        "catalog_rows": len(catalog),
        "scope": "Transductive descriptive segmentation of the supplied historical catalog",
    }
    result = {
        "run_id": run_id,
        "algorithm": selected["algorithm"],
        "k": selected["k"],
        "catalog_rows": len(catalog),
        "raw_rows": cleaning["raw_rows"],
        "removed_rows": cleaning["removed_rows"],
        "sample_size": len(sample),
        "feature_count": X.shape[1],
        "selected": selected,
        "experiments": rows,
        "profiles": profiles,
        "projection": projection,
        "projection_variance": float(projector.explained_variance_ratio_.sum()),
        "feature_weights": config["weights"],
        "seed": config["final_seed"],
        "scope": metadata["scope"],
    }
    write_json(bundle / "metadata.json", metadata)
    write_json(bundle / "results.json", result)
    write_json(
        bundle / "selection.json",
        {"selected": selected, "rule": config["selection"], "selected_at": datetime.now(UTC).isoformat()},
    )
    pd.DataFrame(
        [{k: v for k, v in row.items() if k not in ["seed_scores", "diagnostics"]} for row in rows]
    ).to_csv(bundle / "comparison.csv", index=False)
    write_json(bundle / "checksums.json", {p.name: digest(p) for p in bundle.iterdir() if p.is_file()})
    write_json(
        base / "artifacts/task-04/active.json",
        {"run_id": run_id, "checksums_sha256": digest(bundle / "checksums.json")},
    )
    render_reports(result)
    print(
        f"Selected {selected['algorithm']} k={selected['k']}; silhouette={selected['silhouette_mean']:.4f}; run={run_id}",
        flush=True,
    )
    return result


def render_reports(result):
    base = root()
    folder = base / "reports/task-04"
    figures = folder / "figures"
    figures.mkdir(parents=True, exist_ok=True)
    points = pd.DataFrame(result["projection"])
    fig, ax = plt.subplots(figsize=(10, 7))
    for profile in result["profiles"]:
        group = points[points.cluster == profile["id"]]
        ax.scatter(group.x, group.y, s=8, alpha=0.5, label=f"{profile['id']}: {profile['name']}")
    ax.set(
        title="Catalog clusters — descriptive PCA projection",
        xlabel="Principal component 1",
        ylabel="Principal component 2",
    )
    ax.legend(fontsize=7, loc="best")
    fig.tight_layout()
    fig.savefig(figures / "cluster_projection.png", dpi=150)
    plt.close(fig)
    fig, ax = plt.subplots(figsize=(10, 5))
    for algorithm in ["kmeans", "minibatch_kmeans", "gaussian_mixture"]:
        rows = [row for row in result["experiments"] if row["algorithm"] == algorithm]
        ax.errorbar(
            [r["k"] for r in rows],
            [r["silhouette_mean"] for r in rows],
            yerr=[r["silhouette_std"] for r in rows],
            marker="o",
            capsize=3,
            label=algorithm,
        )
    ax.set(
        title="Internal validation — fixed catalog sample, three seeds",
        xlabel="Number of clusters",
        ylabel="Mean silhouette (higher is better)",
    )
    ax.legend()
    fig.tight_layout()
    fig.savefig(figures / "model_comparison.png", dpi=150)
    plt.close(fig)
    text = f"# Task 4 — Content segmentation results\n\nRun `{result['run_id']}`. **{result['algorithm']}**, **k={result['k']}**, selected by mean silhouette across three seeds.\n\n"
    text += f"{result['catalog_rows']:,} unique title/type/year entities from {result['raw_rows']:,} raw rows; {result['removed_rows']} repeated entity rows removed. {result['feature_count']} weighted feature dimensions. Ratings, title, ID, director and date-added are excluded from fitting.\n\n"
    text += f"Internal scores use a fixed random sample of {result['sample_size']} titles in the full weighted feature space. PCA is visualization only; its two components explain {result['projection_variance']:.1%} of feature variance.\n\n"
    text += "## Candidate comparison\n\n| Algorithm | k | Silhouette mean | Std | Davies-Bouldin ↓ | Calinski-Harabasz ↑ | Seed ARI ↑ | Eligible |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |\n"
    for r in result["experiments"]:
        text += f"| {r['algorithm']} | {r['k']} | {r['silhouette_mean']:.4f} | {r['silhouette_std']:.4f} | {r['davies_bouldin']:.3f} | {r['calinski_harabasz']:.1f} | {r['stability_ari']:.3f} | {r['eligible']} |\n"
    text += "\n## Cluster profiles\n\n"
    for profile in result["profiles"]:
        text += f"### Cluster {profile['id']} — {profile['name']}\n\n{profile['size']} titles ({profile['share']:.1%}); {profile['movie_count']} Movies / {profile['tv_count']} TV Shows. Median release year {profile['median_year']:.0f}. Film minutes: {profile['median_movie_minutes']}; TV seasons: {profile['median_tv_seasons']}.\n\n"
        text += "Top genres: " + ", ".join(f"{r['name']} ({r['count']})" for r in profile["genres"]) + ".\n\n"
        text += (
            "Top countries: "
            + ", ".join(f"{r['name']} ({r['count']})" for r in profile["countries"])
            + ".\n\n"
        )
        text += (
            "Nearest-centroid examples: "
            + "; ".join(row["title"] for row in profile["representatives"])
            + ".\n\n"
        )
    text += "## Interpretation and limitations\n\nThese are descriptive catalog groups, not verified audience segments or popularity classes. Feature weights define similarity; changing them can change groups. Internal metrics compare geometric compactness and separation, not human semantic correctness. Seed ARI measures initialization sensitivity on the same catalog, not resampling stability or future performance. Cluster IDs are arbitrary. The PCA sample is proportional by group and is not the full catalog; overlap in 2D can conceal separation in higher dimensions. The selected k is at the upper boundary of the tested range 2-10, so it is best within this comparison, not a globally optimal group count. Genre/country counts are multi-label and can sum beyond group size. No classifier accuracy, holdout-generalization claim, or calibrated membership probability is reported.\n"
    (folder / "final_report.md").write_text(text, encoding="utf-8")
