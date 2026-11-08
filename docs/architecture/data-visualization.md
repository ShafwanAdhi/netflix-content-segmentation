# Data visualization

The interface uses neutral surfaces, typography and structural borders. Color identifies data categories, series and magnitude. Text, symbols and values complement color throughout the workspace.

| Data | Encoding | Additional cue |
| --- | --- | --- |
| Cluster ID | Ten stable colors indexed by the actual cluster ID | Cluster ID, labelled legend and distinct point symbols |
| Clustering algorithm | Distinct line colors | Algorithm name, dash pattern and visible points |

The palette is defined in `apps/web/src/lib/dataColors.ts`; presentation rules live in `apps/web/src/data-visualization.css`. About Dataset uses text and tables for variables and row accounting. Methodology uses neutral workflow steps. Charts retain labelled axes, legends or tooltips; data tables scroll within their own region.

## Interpretation and accessibility

Cluster colors do not establish semantic correctness or separation in the full feature space. PCA overlap is a projection approximation. Ten hues cannot be guaranteed perceptually distinct for every form of color-vision deficiency; IDs, symbols and filters provide complementary cues.

Reduced motion, keyboard navigation, focus indicators, error states and responsive layout remain part of the chart interactions. Color styling does not modify input data, model selection, predictions or saved results.

## Verification

`scripts/browser-check-data-colors.js` inspects the rendered charts and relevant interactions. Run it against a built application preview on port 8000 using Playwright CLI. [Recorded production checks](../../verification/production/data-color-result.json) and [verification guidance](../VERIFICATION.md) identify the checked run and source revision.
