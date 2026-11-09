# Content Segmentation: dataset card

Source: historical `Dataset.csv`, SHA-256 `90b02beeb554921f81d3b9a774d0f7766f6a65240162565f6b4082165dc2a1d3`. The immutable source remains in `data/raw`. Source redistribution permission is not established; original CSV and processed copies are excluded from version control. Derived cluster membership supports the explorer; source redistribution rights remain unverified.

The 8,790 rows contain Netflix catalog metadata suitable for content segmentation. There are no viewing histories, demographics, watch time, review scores or commercial outcomes. `rating` is a content advisory category and is excluded from clustering. This historical snapshot is not the current Netflix catalog.

## Preparation

The source hash fixes the audited snapshot. Validate required cells, unique source IDs, Movie/TV Show types, positive integer duration and matching units. All required cells in this snapshot are populated. Keep the semantic missing-country token `Not Given` as an explicit indicator: it means unknown origin, not a real country. Director is excluded. Inactive movie/TV duration is structural zero in its own scaled field, not an invented zero-length title.

Entity key: trimmed, casefolded title + type + release year. Retain the first source row; log every removed ID to retained ID. Seven rows are removed, leaving **8,783 entities**. See [cleaning log](../../reports/task-04/cleaning_log.json). This includes three exact content duplicates and four previously reviewed case/space variants. Rating conflicts do not define identity; ratings never enter fitting. This identity is approximate: distinct remakes sharing title/type/year could be merged, and alternate spellings can survive.

Date-added anomalies do not affect clustering because this field is excluded from the fitting features.

## Audit trail and limitations

Inputs: type, multi-label genre/country, release year, separate film minutes / TV seasons. Titles and IDs support exploration and traceability only. Derived assignments retain other source columns for audit, but those cannot enter the explicitly selected fitting features. No external data is joined.

The cleaning log records raw/prepared hashes and all seven mappings. Each bundle records the prepared hash, configuration, versions and feature names. Genre/country counts can exceed cluster size because titles have multiple tokens. Source placeholders and source-specific genre conventions affect interpretation; missing origin is not recovered.

## Provenance and reproduction boundary

The structured [provenance record](../../data/provenance.json) is bound to the audited source SHA-256 and is included in the generated dataset profile. **Upstream source unverified. Redistribution permission unverified.** Public candidate datasets were reviewed on 9 November 2026; none established the exact byte lineage and transformation history of this input. No upstream license is attributed to the supplied CSV.

Observed release years are 1925–2021; date-added values span 2008-01-01 through 2021-09-25. The maximum date-added value is not a known acquisition date. Acquisition date and upstream version remain unknown.

**Artifact inference** works with the bundled model without raw data. **Training reproduction** requires the exact supplied CSV with the documented hash; there is no verified public download instruction for that input. Raw CSV remains excluded from Git. Run `uv run python scripts/refresh_dataset.py` after changing an active run; the generator checks the provenance hash before emitting the profile.
