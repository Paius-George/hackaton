# One Energy View

Innovation Labs AI-Validation Bootcamp · Challenge 1 · Energy / Prosumers & O&M

A shared view of solar production, consumption, battery storage and grid exchange, with evidence-based maintenance triage and contract-aware energy recommendations.

## Start here

- **[Master battleplan](CHALLENGE_1_ENERGY_BATTLEPLAN.md)** — architecture, ten winner adaptations, validation priorities and four-hour role split.
- **[Challenge brief](docs/CHALLENGE_BRIEF.md)** — scope, users, constraints and important source corrections.
- **[Customer discovery kit — RO / EN](docs/CUSTOMER_DISCOVERY.md)** — hypotheses, six interview questions, recruitment routes and installer contacts.
- **[Ten relevant hackathon winners](data/energy-research/WINNERS.md)** — focused inspiration, with original award evidence preserved.
- **[Data sources and provenance](data/energy-research/SOURCES.md)** — PVGIS, StoreNet, OPSD, OPCOM, vendor access and billing inputs.

## Run the prototype

Python 3.9+ with standard-library dependencies only. Run commands from this folder.

```sh
# Request a live PVGIS historical model; fleet faults and default tariffs are simulated.
python3 energy_data_pipeline.py

# Explicit offline synthetic baseline; no network required.
python3 energy_data_pipeline.py --synthetic-baseline

# Local work-order action UI at http://127.0.0.1:8765
python3 energy_data_pipeline.py --synthetic-baseline --serve
```

New runs save JSON, a standalone HTML dashboard and source checksums under `data/energy-demo/<run>/`. The action UI creates local work orders; external ticket delivery requires a separately configured team-owned webhook. Details and input formats are in the battleplan.

## Open an existing demo

- **[PVGIS historical-model demo](data/energy-demo/20261024T080732.479965Z/dashboard.html)** — saved run declares a live-fetched historical PVGIS model; brand-labelled fleet telemetry and faults are simulated.
- **[Fully synthetic test demo](data/energy-demo/20261024T074224.210660Z/dashboard.html)** — offline fixture used for invariant checks.

Neither is a real connected Huawei/Deye/Fronius fleet. Financial outputs are scenario estimates, not verified customer savings. [Historical verification results](data/energy-research/verification.json).

## Active folder

```text
README.md
CHALLENGE_1_ENERGY_BATTLEPLAN.md
energy_data_pipeline.py
LICENSE
docs/
  CHALLENGE_BRIEF.md
  CUSTOMER_DISCOVERY.md
data/
  energy-research/
    WINNERS.md
    SOURCES.md
    winner-evidence.json
    contract.example.json
    verification.json
    cleanup-manifest.json
  energy-demo/
    <saved runs: dashboard.html, dashboard.json, raw baseline, manifest>
.archive/
  <verified original-workspace backups>
```

The active project contains only the energy work and its supporting evidence. General hackathon catalogs, other challenges, scraper tooling, caches and nested duplicate folders were removed from the active tree after archival verification. Original source paths in winner records and historical inventory descriptions refer to that archived research.

**Recovery:** original files and distinct draft variants remain in [.archive](.archive/README.md). Any edits detected during cleanup were preserved in an additional archive. Extract into a separate folder before restoring individual files; see the [cleanup record](data/energy-research/cleanup-manifest.json).
