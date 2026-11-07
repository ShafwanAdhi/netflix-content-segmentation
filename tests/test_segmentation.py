"""Task 4 geometry, frozen assignments, privacy boundaries and HTTP exploration."""

import numpy as np
import pytest
from fastapi.testclient import TestClient
from netflix_api.main import create_app
from netflix_ml.tasks.task_04.service import Segmentation, load_segmentation
from netflix_ml.tasks.task_04.training import FEATURES


@pytest.fixture(scope="module")
def segmentation():
    return load_segmentation()


def test_frozen_assignments_match_pipeline(segmentation):
    service = segmentation
    frame = service.assignments
    assert len(frame) == 8783
    assert frame.entity_key.is_unique
    assert len(service.results["experiments"]) == 27
    assert sum(row["size"] for row in service.results["profiles"]) == len(frame)
    assert set(frame.cluster) == set(range(service.results["k"]))
    assert np.array_equal(service.pipeline.predict(frame[FEATURES]), frame.cluster)
    assert service.results["selected"]["eligible"]
    assert all(len(row["seed_scores"]) == 3 for row in service.results["experiments"])


def test_excluded_metadata_cannot_change_geometry(segmentation):
    encoder = segmentation.pipeline.named_steps["features"]
    frame = segmentation.assignments.iloc[:10].copy()
    expected = encoder.transform(frame)
    for column in ["rating", "show_id", "title", "director", "date_added"]:
        frame[column] = "Completely changed"
    assert np.array_equal(expected, encoder.transform(frame))
    movie = segmentation.assignments.query("type == 'Movie'").head(1)
    tv = segmentation.assignments.query("type == 'TV Show'").head(1)
    assert np.all(encoder.transform(movie)[:, -1] == 0)
    assert np.all(encoder.transform(tv)[:, -2] == 0)
    unknown = movie.copy()
    unknown["country"] = "Unseen country"
    assert np.isfinite(encoder.transform(unknown)).all()


def test_segmentation_api_filters_and_pagination(segmentation):
    with TestClient(create_app()) as client:
        response = client.get("/api/v1/tasks/4/results")
        assert response.status_code == 200
        assert response.json()["run_id"] == segmentation.metadata["run_id"]
        assert client.get("/api/v1/tasks").json()[0]["status"] == "ready"
        first = client.get("/api/v1/tasks/4/titles?limit=25").json()
        second = client.get("/api/v1/tasks/4/titles?limit=25&offset=25").json()
        assert first["total"] == 8783
        assert not {row["show_id"] for row in first["items"]} & {row["show_id"] for row in second["items"]}
        filtered = client.get("/api/v1/tasks/4/titles?cluster=0&content_type=Movie").json()
        assert all(row["cluster"] == 0 and row["type"] == "Movie" for row in filtered["items"])
        title = first["items"][0]["title"]
        result = client.get("/api/v1/tasks/4/titles", params={"q": title}).json()
        assert any(row["title"] == title for row in result["items"])
        assert client.get("/api/v1/tasks/4/titles?q=NoSuchTitle_abcdef999").json()["total"] == 0
        for query in ["cluster=999", "cluster=-1", "offset=-1", "limit=101", "content_type=Bad"]:
            assert client.get(f"/api/v1/tasks/4/titles?{query}").status_code == 422


def test_corrupt_bundle_rejected(tmp_path):
    (tmp_path / "checksums.json").write_text('{"results.json":"wrong"}')
    (tmp_path / "results.json").write_text("{}")
    with pytest.raises(ValueError, match="integrity"):
        Segmentation(tmp_path)
