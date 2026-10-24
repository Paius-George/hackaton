# One Energy View — interactive frontend demo

No npm install, build tool, CDN, API key or internet connection is required.

## Open it

**Live local SQLite demo:** from the project root, run:

```sh
python3 energy_data_pipeline.py --synthetic-baseline --serve
```

Open **http://127.0.0.1:8765**. This serves the seven-screen application using the run's exact generated payload. Ticket creation writes to the existing local SQLite work-order database. The server integration changes rendering, static delivery and the local ticket endpoint; ingestion/simulation/valuation functions remain unchanged.

**Offline:** open [index.html](index.html) directly. It uses the included snapshot of the existing PVGIS historical-model demo, with simulated telemetry and scenario tariffs. All browser interactions work without networking. Tickets and assessments stay in browser storage.

**One shareable file:** [dashboard.html](dashboard.html) is the packaged single-file demo. Each pipeline run also writes a new `dashboard.html` in its output folder with CSS, JavaScript and that run's exact JSON embedded. Open either file directly, or send it as one artifact. It needs no adjacent assets. Saved historical dashboards created before this change retain their original older UI.

**Static hosting:** serve this `ui` directory. An optional `dashboard.json` placed alongside `index.html` overrides the fallback. Otherwise, the bundled snapshot is used with a visible fallback notice. Custom pipeline JSON can also be loaded in Connections without uploading it to a remote service.

## Jury walkthrough

Click **Mod demonstrație juriu** once in the header. The five steps advance automatically every 12 seconds (about 60 seconds total); Pause and Continue also allow manual control:

1. Fleet queue with Site C selected.
2. Healthy days 1–7 against the injected 18% shortfall on days 8–14.
3. Deterministic checks and bounded Romanian explanation.
4. Save a clearly marked demo assessment and create one deduplicated local work order with a receipt.
5. Owner view of a feasible battery schedule and equal terminal energy.

The tour creates a local demo record. It never calls an external webhook or controls equipment. Repeat tours reuse the same incident key. A local receipt proves registration, not repair or realized savings.

## Controls

- RO/EN, all three sites, current replay day/14-day window, household/O&M personas.
- Commercial scenario: 250 kWp and scaled load, retaining an illustrative 10 kWh battery. This is not equipment sizing advice.
- Residual threshold and missing-poll simulation. Missing readings produce gaps and insufficient-data states, never zero-production claims.
- Battery reserve, flexible appliance, allowed window, equal terminal SoC and benchmark/proposal labels.
- Cost policy selector. The four financial buckets remain separate.
- Technician assignment, assessment, notes, ticket receipt and reviewed workflow transitions.
- CSV preview/import and source JSON loading/export in Connections.

## CSV inputs

Download a matching sample in Connections, change its values, select it and click Apply. Files are parsed in the browser. Load imports affect the selected site; market-price imports affect every site. Only timestamps overlapping the active source dataset are applied.

```csv
timestamp,load_kw
2020-06-14T00:00:00Z,0.7
```

Load rows must be hourly, aligned to HH:00 UTC, timezone-aware, nonnegative and unique. A load value is interpreted as mean kW over the next hour.

```csv
timestamp,duration_minutes,price_ron_mwh
2020-06-14T00:00:00Z,15,-100
2020-06-14T00:15:00Z,45,500
```

OPCOM imports reject overlapping intervals and duration-weight prices into fully covered hours. Negative prices are allowed. Imported prices update the price chart, and update import cost only when the source contract is PZU-linked. The commercial monthly weighted export price stays a separate contract input.

## Calculation boundaries

The browser retains the source JSON but recalculates replay AC flows at **95% round-trip efficiency**, matching the UI specification. The Python demonstration uses 95% **each way** (90.25% round trip); the UI explicitly labels this difference. Displayed browser costs therefore need not equal the older Python summary fields.

The alternative schedule uses a discrete dynamic program: 10 kWh, 0.25 kWh state increments, 20–90% SoC, 3 kW AC and configurable reserve. A reserve above the day's initial 50% is unavailable. Disabling equal terminal SoC removes the savings figure. An added EV/boiler/heat-pump load is a declared scenario, with the same total flexible energy in both alternatives.

PV exposure fixes load and stored-energy changes. Dispatch opportunity fixes PV and total scenario-load energy and includes a declared wear cost. They are overlapping counterfactuals and must not be summed. VERIFIED in the demo means the workflow was checked locally; real financial outcomes remain pending.

## Files and checks

- `index.html`, `styles.css`, `app.js`: shell, visual system and interactive screens.
- `model.js`: pure parsing, normalization, balance, financial and scheduling calculations.
- `demo-data.js`: built-in snapshot from the existing historical demo's `dashboard.json`.
- `test_model.cjs`: dependency-free calculation checks.

```sh
node ui/test_model.cjs
node --check ui/app.js
python3 -m py_compile energy_data_pipeline.py
```

The [architecture document](../docs/ONE_ENERGY_VIEW_DASHBOARD_ARCHITECTURE.md) maps concepts to their winning hackathon sources. The frontend adds no real vendor integration or live LLM call.
