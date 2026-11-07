"""Validated read-only segmentation bundle and paginated title exploration."""

from pathlib import Path

import joblib
import pandas as pd
import sklearn

from netflix_ml.shared.io import digest, read_json, root


class Segmentation:
    def __init__(self, bundle: Path):
        checksums = read_json(bundle / "checksums.json")
        for name, expected in checksums.items():
            if Path(name).name != name or digest(bundle / name) != expected:
                raise ValueError("Task 4 artifact integrity check failed")
        self.metadata = read_json(bundle / "metadata.json")
        self.results = read_json(bundle / "results.json")
        if (
            self.metadata["sklearn"] != sklearn.__version__
            or self.metadata["run_id"] != self.results["run_id"]
        ):
            raise ValueError("Task 4 environment or artifact identity mismatch")
        self.pipeline = joblib.load(bundle / "pipeline.joblib")
        self.assignments = pd.read_csv(bundle / "assignments.csv")
        if (
            len(self.assignments) != self.results["catalog_rows"]
            or self.assignments.show_id.duplicated().any()
        ):
            raise ValueError("Task 4 assignment count or identity is invalid")

    def titles(self, cluster=None, content_type=None, query="", offset=0, limit=25):
        rows = self.assignments
        if cluster is not None:
            rows = rows[rows.cluster == cluster]
        if content_type:
            rows = rows[rows.type == content_type]
        if query:
            rows = rows[rows.title.str.contains(query, case=False, regex=False)]
        columns = ["show_id", "title", "type", "release_year", "duration", "country", "listed_in", "cluster"]
        return {
            "run_id": self.metadata["run_id"],
            "total": len(rows),
            "offset": offset,
            "limit": limit,
            "items": rows.iloc[offset : offset + limit][columns].to_dict("records"),
        }


def load_segmentation():
    pointer = read_json(root() / "artifacts/task-04/active.json")
    run_id = pointer["run_id"]
    if Path(run_id).name != run_id:
        raise ValueError("Invalid Task 4 run identity")
    bundle = root() / "artifacts/task-04" / run_id
    if digest(bundle / "checksums.json") != pointer["checksums_sha256"]:
        raise ValueError("Task 4 checksum manifest does not match the active pointer")
    return Segmentation(bundle)
