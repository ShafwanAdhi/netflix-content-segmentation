# Task 4 — Netflix Content Segmentation

Status: **Implemented locally; frozen results and submission evidence included.** Tasks 3 and 4 work independently. Task 5 is implemented independently; Task 6 is independently implemented as historical catalog-entry analytics.

The assignment asks for mixed numerical/categorical preparation, clustering, group visualization and interpretation (supplied assignment PDF, slide 9). This implementation discovers descriptive content groups. The dataset has no viewer behavior, popularity, revenue or ground-truth audience segments.

## Reproduce and review

Complete the root [environment setup](../../../README.md). Place the original supplied CSV at `data/raw/Dataset.csv`; its SHA-256 is verified before preparation. Then run:

```powershell
uv run python scripts/train_segmentation.py
uv run python scripts/build_segmentation_notebook.py
pnpm dev
```

Training includes deterministic preparation, 81 candidate fits, selection, final fitting and evaluation/report generation. It creates a new immutable run folder and activates it after its files and checksum manifest are written. Restart the API after activation. There is no test split: this is a transductive analysis of the given catalog, not a supervised prediction benchmark. Starting the website never trains a model.

Open `/tasks/4/overview`, `/tasks/4/explore`, `/tasks/4/evaluation` and `/tasks/4/methodology`. The explorer supports cluster deep links, content-type filters, literal title search and server pagination.

## Verified experiment

Run `20261106T115043590368Z`: **KMeans, k=10**, 8,783 entities, 133 feature dimensions. Mean silhouette **0.2408**, population standard deviation **0.0034**, initialization stability ARI **0.6620**. PCA's two components explain **25.9%** of feature variance. These are internal diagnostics, not accuracy or evidence of actual audience segments.

The winner is at the upper search boundary (2–10). It is the best candidate within that declared comparison, not a proven optimal number of groups. Separation is modest and seed sensitivity remains material. Expanding the range, testing alternative geometry, and resampling stability are future experiments; they have not been performed.

- [Dataset and preparation](dataset-card.md)
- [Methodology and experiment protocol](methodology.md)
- [Model card and interpretation](model-card.md)
- [Requirements and completion evidence](requirements.md)
- [Full generated comparison and profiles](../../../reports/task-04/final_report.md)
- [Executed analysis notebook](../../../notebooks/task-04/01_segmentation.ipynb)
- [Submission guide](../../../submissions/task-04/README.md)

## Ownership

`packages/ml/src/netflix_ml/tasks/task_04` owns preparation, encoding, fitting and read-only exploration. `apps/api/src/netflix_api/segmentation.py` owns HTTP contracts; `apps/web/src/features/task-04` owns pages. The assignment source and Task 3 audit are references; feature weighting and selection are project decisions. sklearn, pandas, NumPy, matplotlib and frontend libraries provide the algorithms and UI primitives.
