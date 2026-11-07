# Task 4 model card

Active bundle: `artifacts/task-04/20261106T115043590368Z`. KMeans, k=10, final seed 42. The exact sklearn version is recorded in metadata and checked at load time. Purpose: exploratory grouping of the supplied historical catalog. See the [protocol](methodology.md).

| Internal diagnostic | Active comparison result |
| --- | ---: |
| Mean silhouette | 0.2408 |
| Silhouette population std, three seeds | 0.0034 |
| Mean Davies–Bouldin | 1.734 |
| Mean Calinski–Harabasz | 160.1 |
| Mean pairwise seed ARI | 0.6620 |
| PCA2 explained variance | 25.9% |

Best within k=2–10, at the upper boundary. These values indicate partial structure; they do not establish semantic truth, a globally optimal k, or predictive accuracy.

| ID | Descriptive top genres | Titles |
| --- | --- | ---: |
| 0 | Stand-Up Comedy / Music & Musicals | 343 |
| 1 | Dramas / International Movies | 1,914 |
| 2 | International TV Shows / Docuseries | 1,359 |
| 3 | Action & Adventure / International Movies | 636 |
| 4 | Children & Family Movies / Comedies | 584 |
| 5 | Kids' TV / TV Comedies | 556 |
| 6 | Comedies / International Movies | 1,222 |
| 7 | Documentaries / International Movies | 864 |
| 8 | TV Dramas / International TV Shows | 747 |
| 9 | Thrillers / Horror Movies | 558 |

Groups largely follow genre/type because genre has the largest weight and the source taxonomy separates Movies and TV Shows. Similarity supports browsing and descriptive portfolio review. It cannot justify audience targeting, popularity forecasting, investment decisions or content advisory certification. Names are descriptive, not externally validated classes.

The API validates checksums, identity and sklearn compatibility before loading trusted project-owned joblib files. It exposes frozen results and assigned titles; no remote training or new-title membership endpoint exists. Missing/corrupt Task 4 artifacts produce 503 independently of Task 3 readiness. Checksums detect changes relative to the manifest, not trustworthiness of arbitrary joblib files.

Verification covers save/load assignment parity, feature exclusion, duration units, unknown tokens, deduplication, API filters, artifact corruption, responsive UI and Task 3 regression. See [submission evidence](../../../submissions/task-04/README.md). Public hosting, portal submission, video and human evaluation have not been performed.
