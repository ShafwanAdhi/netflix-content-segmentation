# Project capabilities

Explore descriptive content groups using mixed catalog metadata. Compare clustering algorithms, inspect internal validation and seed stability, and browse cluster profiles with a PCA projection. These groups are not verified audience segments.

| Capability | Implementation and evidence |
| --- | --- |
| Prepare numerical and categorical features | CatalogEncoder, dataset card, hashes, cleaning mapping, feature exclusion and units tests |
| Apply clustering algorithms | KMeans, MiniBatchKMeans, GaussianMixture; 81 recorded candidate fits |
| Group similar content | 8,783 assignments, 10 profiles, explorer with filters and representatives |
| Visualize clusters | Interactive PCA map, sizes chart, standalone figure, notebook figure links |
| Interpret clustering results | Report, model card, profiles and examples; geometry/2D limitations |

The web application has five sections: `/overview`, `/dataset`, `/explore`, `/evaluation` and `/methodology`. All displayed model results come from a validated saved run. Inspect [methodology](methodology.md), [model card](model-card.md) and [verification](../VERIFICATION.md) for practical limits and recorded checks.
