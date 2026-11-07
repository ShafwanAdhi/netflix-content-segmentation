# Task 4 dataset card

Source: user-supplied `Dataset.csv`, SHA-256 `90b02beeb554921f81d3b9a774d0f7766f6a65240162565f6b4082165dc2a1d3`. The immutable source remains in `data/raw`. Source redistribution permission is not established; original CSV and processed copies are excluded from review ZIPs. The package includes derived title assignments used by the local explorer and is intended for private assignment review, not public dataset redistribution.

The 8,790 rows contain Netflix catalog metadata suitable for content segmentation. There are no viewing histories, demographics, watch time, review scores or commercial outcomes. `rating` is a content advisory category and is excluded from clustering. This historical snapshot is not the current Netflix catalog.

## Preparation

The source hash fixes the audited snapshot. Validate required cells, unique source IDs, Movie/TV Show types, positive integer duration and matching units. All required cells in this snapshot are populated. Keep the semantic missing-country token `Not Given` as an explicit indicator: it means unknown origin, not a real country. Director is excluded. Inactive movie/TV duration is structural zero in its own scaled field, not an invented zero-length title.

Entity key: trimmed, casefolded title + type + release year. Retain the first source row; log every removed ID to retained ID. Seven rows are removed, leaving **8,783 entities**. See [cleaning log](../../../reports/task-04/cleaning_log.json). This includes three exact content duplicates and four previously reviewed case/space variants. Rating conflicts do not define identity; ratings never enter fitting. This identity is approximate: distinct remakes sharing title/type/year could be merged, and alternate spellings can survive.

Task 3 retains its earlier frozen manifests and training-only grouped entity policy. Task 4 applies independent entity deduplication to the whole catalog; these counts are intentionally different. Existing Task 3 provenance is unchanged. Date-added anomalies have no role because that field is excluded.

## Audit trail and limitations

Inputs: type, multi-label genre/country, release year, separate film minutes / TV seasons. Titles and IDs support exploration and traceability only. Derived assignments retain other source columns for audit, but those cannot enter the explicitly selected fitting features. No external data is joined.

The cleaning log records raw/prepared hashes and all seven mappings. Each bundle records the prepared hash, configuration, versions and feature names. Genre/country counts can exceed cluster size because titles have multiple tokens. Source placeholders and source-specific genre conventions affect interpretation; missing origin is not recovered.
