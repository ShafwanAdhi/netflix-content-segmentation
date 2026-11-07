# Task 4 experiment protocol

## Mixed metadata geometry

Use five explicit source columns: `type`, `country`, `listed_in`, `release_year`, `duration`. Exclude rating, identifiers, title, director and date added. Split comma-separated genre/country tokens, trim and deduplicate per title. Fit separate indicator vocabularies, L2-normalize each categorical block, and multiply by amplitude weights: genre **1.0**, type **0.35**, country **0.35**. Squared Euclidean contributions depend on squared amplitudes; these are design choices favoring genre similarity, not learned importance.

Release year uses RobustScaler. Parse duration into minutes for Movies and seasons for TV Shows; fit separate RobustScalers to log(1+duration). Clip scaled numeric values to [-3,3], divide by 3, and apply amplitude **0.25** to year and duration. The other content type's duration is structural zero. Unknown tokens transform to zero indicators without crashing. The active run has 133 fitted dimensions.

The encoder fits the full deduplicated catalog because the objective describes that catalog. No held-out generalization is claimed. There is no label-driven selection or classification accuracy. This pipeline never alters Task 3's frozen split or models.

## Predeclared comparison

Configuration: `configs/task-04/experiment.json`. Compare KMeans, MiniBatchKMeans and diagonal GaussianMixture, k=2 through 10, seeds 42, 43, 44: **27 candidates / 81 fits**, then a final winner refit at seed 42. KMeans: n_init=10, max_iter=300; MiniBatch: same, batch_size=1024. GMM: n_init=1, max_iter=200, reg_covar=0.0001. CPU threads are restricted to one for reproducibility.

Use one seed-42 sample of 1,500 rows for every candidate's silhouette, Davies–Bouldin and Calinski–Harabasz in full weighted geometry. Report silhouette mean and population standard deviation across seeds. Compute mean pairwise adjusted Rand index across all catalog assignments for three seeds. ARI measures initialization sensitivity on the same data, not bootstrap stability or future performance.

Eligibility: requested k present, every cluster at least 1% of catalog for all seeds, no recorded convergence failure. All 27 active candidates passed. Select highest mean silhouette; exact ties: lower Davies–Bouldin, lower k, then KMeans, MiniBatchKMeans, GMM. Freeze selection in the bundle. Profiles/assignments use the final seed-42 fit; comparison scores summarize three runs rather than pretending to be that single refit's scores.

## Visualization and interpretation

Fit PCA2 on full geometry after selection. Plot a proportional sample per cluster targeting 2,500 total; rounding gives **2,501** points. Scores and selection use all 133 dimensions, never 2D coordinates. PCA preserves only 25.9% variance; displayed distances and overlap are incomplete approximations.

Profiles report size, type counts, top multi-label genres/countries, median year, separate minute/season medians, and five titles nearest to the group mean in full geometry. Names summarize the two most frequent genres. IDs are arbitrary and may change across runs. Explorer search/type filters affect the title table; the profile describes the whole cluster.

## Limitations and next experiments

KMeans k=10 is at the upper boundary. Best-within-range is the supported claim. Modest silhouette and ARI show imperfect separation and initialization sensitivity. Weights, genre conventions, placeholders and deduplication affect results. GMM's diagonal Gaussian assumptions are weak for binary indicators; it is a comparison baseline. No human semantic validation or audience outcomes are available. Expanded k ranges, alternative metrics/embeddings, weight ablations and bootstrap stability remain planned research; no such results are claimed.
