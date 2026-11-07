"""Block-balanced mixed metadata representation with explicit duration units."""

import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction import DictVectorizer
from sklearn.preprocessing import RobustScaler, normalize
from sklearn.utils.validation import check_is_fitted


def tokens(value):
    return sorted({part.strip() for part in str(value).split(",") if part.strip()})


class CatalogEncoder(TransformerMixin, BaseEstimator):
    """Fit on the catalog; ratings/IDs/titles/directors/dates are never inspected."""

    def __init__(self, weights=None):
        self.weights = weights

    def _numeric(self, frame):
        amount = frame.duration.str.extract(r"^(\d+)")[0].astype(float).to_numpy()
        movies = frame.type.eq("Movie").to_numpy()
        return amount, movies

    def fit(self, X, y=None):
        self.vectorizers_ = {}
        for block, column in [("type", "type"), ("genre", "listed_in"), ("country", "country")]:
            rows = [{token: 1.0 for token in tokens(value)} for value in X[column]]
            self.vectorizers_[block] = DictVectorizer(sparse=False).fit(rows)
        self.year_scaler_ = RobustScaler().fit(X[["release_year"]])
        amount, movies = self._numeric(X)
        self.movie_scaler_ = RobustScaler().fit(np.log1p(amount[movies]).reshape(-1, 1))
        self.tv_scaler_ = RobustScaler().fit(np.log1p(amount[~movies]).reshape(-1, 1))
        return self

    def transform(self, X):
        check_is_fitted(self, ["vectorizers_", "year_scaler_"])
        weights = self.weights or {
            "type": 0.35,
            "genre": 1.0,
            "country": 0.35,
            "year": 0.25,
            "duration": 0.25,
        }
        blocks = []
        for block, column in [("type", "type"), ("genre", "listed_in"), ("country", "country")]:
            rows = [{token: 1.0 for token in tokens(value)} for value in X[column]]
            blocks.append(normalize(self.vectorizers_[block].transform(rows)) * weights[block])
        year = np.clip(self.year_scaler_.transform(X[["release_year"]]), -3, 3) / 3
        blocks.append(year * weights["year"])
        amount, movies = self._numeric(X)
        duration = np.zeros((len(X), 2))
        if movies.any():
            duration[movies, 0] = (
                np.clip(self.movie_scaler_.transform(np.log1p(amount[movies]).reshape(-1, 1))[:, 0], -3, 3)
                / 3
            )
        if (~movies).any():
            duration[~movies, 1] = (
                np.clip(self.tv_scaler_.transform(np.log1p(amount[~movies]).reshape(-1, 1))[:, 0], -3, 3) / 3
            )
        blocks.append(duration * weights["duration"])
        return np.hstack(blocks)

    def get_feature_names_out(self, input_features=None):
        return np.array(
            [
                f"{name}={token}"
                for name, encoder in self.vectorizers_.items()
                for token in encoder.get_feature_names_out()
            ]
            + ["release_year", "movie_minutes", "tv_seasons"]
        )
