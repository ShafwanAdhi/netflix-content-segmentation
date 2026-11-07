# Task 4 submission package

Status: prepared for local review, **not externally submitted**. Run `20261106T115043590368Z`. See the [requirements matrix](../../docs/tasks/task-04/requirements.md).

## Contents and verification

- Source: frontend, backend, shared ML workspace, Task 4 code, configs, tests and lockfiles.
- Results: immutable clustering bundle, comparison, all assignments, profiles, report figures and executed notebook.
- Evidence: [actual screenshot index](screenshots/README.md), browser verification, automated verification and SHA-256 manifest.
- Runtime: both Task 3 and Task 4 active bundles so both tabs function.

The ZIP excludes raw/processed source CSVs, caches, dependencies, built frontend, temporary browser output and other ZIPs. The derived assignment table is included because the explorer needs it. Use for private review; public redistribution permissions are not established. Rebuilding/training requires the supplied original CSV and documented environment setup.

```powershell
uv run python scripts/verify_segmentation_submission.py --package
```

This creates `netflix-ml-lab-task-04.zip` and a manifest with hashes. Checks must pass and screenshots must match the active run before packaging. After retraining, replay the automated/browser checks, recapture screenshots and regenerate the notebook/report/evidence before creating a new package.

To run and record the four automated commands, add `--checks`. The complete suite requires the original CSV and Task 3 prepared data; execute the root Task 3 preparation command first when starting from the packaged source. Serving the website only requires the two included bundles, not the raw data.

## Re-record browser evidence

Start the production preview and open a named Chrome session with Playwright CLI, then use this PowerShell sequence from the root. The JSON records actual assertions; do not replace it with a handwritten success flag.

```powershell
New-Item -ItemType Directory -Force output/playwright/task-04 | Out-Null
npx --yes --package @playwright/cli playwright-cli -s=segments open http://127.0.0.1:8000 --browser chrome
npx --yes --package @playwright/cli playwright-cli -s=segments run-code --filename=scripts/browser-check-segmentation.js --json | Out-File -Encoding utf8 output/playwright/task-04/browser-result.json
```

Inspect the six PNGs, copy them into `submissions/task-04/screenshots`, and record evidence using the following project-owned Python code (run from the root). Update screenshot captions/run IDs and regenerated report/notebook before verification if the active run changes.

```python
import json, shutil
from datetime import UTC, datetime
from netflix_ml.shared.io import root, digest, write_json
from scripts.verify_segmentation_submission import SCREENSHOTS, source_hashes
base = root()
saved = json.loads((base / 'output/playwright/task-04/browser-result.json').read_text(encoding='utf-8-sig'))
assert not saved.get('isError'), saved
result = json.loads(saved['result'])
assert result['passed'] and not result['errors']
destination = base / 'submissions/task-04'
result['screenshots'] = {}
for name in SCREENSHOTS:
    target = destination / 'screenshots' / name
    shutil.copy2(base / 'output/playwright/task-04' / name, target)
    result['screenshots'][name] = digest(target)
result['source_hashes'] = source_hashes(base)
result['recorded_at'] = datetime.now(UTC).isoformat()
result['viewport_widths'] = [1440, 768, 390]
write_json(destination / 'browser-verification.json', result)
```

Then run `uv run python scripts/verify_segmentation_submission.py --checks --package`. Close the named CLI browser after capture. Hashes bind the evidence to the reviewed source; do not refresh them without checking that the recorded browser assertions apply to that source.

## Demonstration sequence

1. Introduce the independent internship project; Tasks 3 and 4 are implemented, 5 and 6 planned.
2. Open Task 4 Overview: show 8,783 entities, silhouette/stability, PCA's 25.9% variance limitation and group sizes.
3. Select Cluster 0, inspect genres/countries and nearest-centroid examples. Search `Patton`, show pagination, then filter TV Show to demonstrate an honest empty state. Open cluster 5 for a TV profile.
4. Open Evaluation: compare all 27 candidates, three seeds each. Explain why k=10 wins within 2–10 and why the upper-bound result is not a global optimum.
5. Open Methodology: mixed metadata, independent duration units, feature weights, excluded rating and no held-out accuracy claim.
6. Switch to Task 3 and run a Movie example. Show mobile navigation and Task 5/6 planned status.
7. Point to source, report, notebook, model card and checks. Cluster names summarize catalog metadata, not verified audience behavior.

## Portal checklist

- Upload source ZIP and required actual screenshots to the official assignment form once its URL/fields are known.
- Include a GitHub URL only if later published; none is currently claimed.
- Video is optional; the script above is provided, no video recording is claimed.
- Verify portal file limits and keep the final receipt after user submission.
- Public hosting and portal submission were not performed by this delivery.
