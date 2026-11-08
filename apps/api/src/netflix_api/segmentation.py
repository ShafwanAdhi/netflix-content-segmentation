"""Task 4 HTTP schemas and read-only routes."""

from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel


class Frequency(BaseModel):
    name: str
    count: int


class Representative(BaseModel):
    show_id: str
    title: str
    type: str
    release_year: int
    duration: str


class ClusterProfile(BaseModel):
    id: int
    name: str
    size: int
    share: float
    movie_count: int
    tv_count: int
    median_year: float
    genres: list[Frequency]
    countries: list[Frequency]
    median_movie_minutes: float | None
    median_tv_seasons: float | None
    representatives: list[Representative]


class ProjectionPoint(BaseModel):
    show_id: str
    title: str
    type: str
    cluster: int
    x: float
    y: float


class ClusteringCandidate(BaseModel):
    algorithm: str
    k: int
    silhouette_mean: float
    silhouette_std: float
    davies_bouldin: float
    calinski_harabasz: float
    stability_ari: float
    minimum_share: float
    eligible: bool
    seconds: float
    seed_scores: list[dict[str, Any]]
    diagnostics: list[str]


class SegmentationResults(BaseModel):
    run_id: str
    algorithm: str
    k: int
    catalog_rows: int
    raw_rows: int
    removed_rows: int
    sample_size: int
    feature_count: int
    selected: ClusteringCandidate
    experiments: list[ClusteringCandidate]
    profiles: list[ClusterProfile]
    projection: list[ProjectionPoint]
    projection_variance: float
    feature_weights: dict[str, float]
    seed: int
    scope: str


class CatalogTitle(Representative):
    country: str
    listed_in: str
    cluster: int


class TitlePage(BaseModel):
    run_id: str
    total: int
    offset: int
    limit: int
    items: list[CatalogTitle]


router = APIRouter(prefix="/api/v1/tasks/4", tags=["Segmentation"])


def service(request):
    value = getattr(request.app.state, "segmentation", None)
    if value is None:
        raise HTTPException(
            503,
            detail="Validated segmentation artifacts are unavailable. Run train_segmentation.py first.",
        )
    return value


@router.get("/results", response_model=SegmentationResults)
def results(request: Request):
    return service(request).results


@router.get("/titles", response_model=TitlePage)
def titles(
    request: Request,
    cluster: int | None = Query(default=None, ge=0),
    content_type: Literal["Movie", "TV Show"] | None = None,
    q: str = Query(default="", max_length=200),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=25, ge=1, le=100),
):
    value = service(request)
    if cluster is not None and cluster >= value.results["k"]:
        raise HTTPException(422, detail="Cluster does not exist in the active run")
    return value.titles(cluster, content_type, q.strip(), offset, limit)
