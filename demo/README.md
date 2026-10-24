# One Energy View · Apple Keynote frontend

React 19, TypeScript, Tailwind 4 and Motion. Seven views share the original energy model and dashboard schema. The original `ui/` implementation remains available.

## Run

```sh
cd frontend
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/dashboard.json`, `/api` and `/tickets` to the existing Python server on port 8765. If unavailable, the app uses the bundled historical PVGIS snapshot, simulated telemetry and scenario prices. No live vendor connection is implied.

For the complete production demo, from the repository root:

```sh
cd frontend && npm run build && cd ..
python3 energy_data_pipeline.py --synthetic-baseline --serve
```

Open **http://127.0.0.1:8765**. `render_html()` prefers the built React application and embeds that run's exact JSON. Ingestion, simulation, financial calculations and existing ticket endpoint remain intact. Without a React build, Python still renders the original standalone UI.

**Offline:** `frontend/dist/index.html` is one self-contained HTML file with all JS, CSS and fallback data embedded. Generated pipeline `dashboard.html` files embed the exact run's data instead. No runtime CDN or adjacent assets are required. Browser storage availability for `file:` URLs depends on the browser; memory-only operation is labeled if persistence fails.

## Present

- **Mod Prezentare Scenă:** enlarged metrics, active-card spotlight and dimmed context. Toggle again to restore normal contrast.
- **Mod Demonstrație Juriu:** five story steps, 12 seconds each: fleet C → 14-day divergence → checked diagnostic sheet → ticket workflow → owner battery schedule. Previous/next/pause/close remain available. In stage overview, lower context cards move out of the story frame; their full detail remains in the dedicated tabs. Reduced motion uses manual progression.
- The tour does **not** sign a technician assessment. In the ticket step, choose **Confirmă anomalie**, save the review, then create the local work order. Registration is never presented as repair or realized savings.
- Timeline: drag, tap the track, use Arrow/Home/End keys, or select a residual-day cell.
- Reserve: captured 1:1 dragging, exponential edge resistance, projected release and spring settling. Keyboard Home/End sets 20/90%. Above the replay's initial 50% reserve, the optimizer correctly withholds an infeasible schedule.
- Modal sheet: context-anchored opening, captured drag handle, velocity/distance dismissal, Escape, focus containment and return to the source control. Sheet content scrolls independently.

## Data and state

`src/energy-model.js` is the original `ui/model.js` calculation engine with only its final UMD export changed to a browser export for Vite. Keep calculation changes synchronized deliberately. The source dataset retains original provenance. Displayed AC flows use 95% round-trip normalization, as in the original interactive UI; the Python simulator uses 95% each way. This difference is labeled.

Local storage key: `oev-apple-v1`. Stores preferences, reserve/terminal lock, proposal toggle, CSV overlays, assessments, case events and destination receipts. Keys derive from site + rule + evidence dates + scenario/import revision. A pending unconfirmed network delivery is blocked from blind retries; reconcile the local SQLite record before attempting another delivery. A button press cannot silently create a second ticket.

CSV imports remain local: hourly normalized load for the selected site; duration-weighted OPCOM prices for all sites. Imports require timezone-aware timestamps and overlapping replay dates. Reject overlapping price intervals, duplicate timestamps and negative loads. Imported hourly PZU does not replace the contract's configured monthly weighted settlement price.

Commercial mode scales the PV to 250 kWp and load ×30 while retaining illustrative 10 kWh storage. It is a scenario, not a real installation design. Law 160/2026 labels reflect the supplied brief and configured scenario; applicability and ANRE implementation have not been independently validated here.

Four financial buckets stay separate. Missing polls remain null/gaps. A workflow marked VERIFIED is explicitly a demo workflow check; the post-intervention financial result remains Pending.

## Validation

```sh
npm run build
npm test
cd ..
node ui/test_model.cjs
python3 -m py_compile energy_data_pipeline.py
# With the local demo already serving on 8765:
python3 frontend/tests/server-integration.py
```

- Production build passes TypeScript and Tailwind compilation; package audit found zero vulnerabilities at installation.
- `npm test` executes the **built bundle** in jsdom with both normal/reduced-motion media queries. Covers all seven views, captured pointer moves/cancel, reserve limits, infeasible reserve, terminal-energy gate, missing-data withholding, stored proposal, reviewed ticket/receipt, duplicate button protection, mocked SQLite transport, Escape and stage/tour controls. This is DOM simulation, not a rendering or frame-rate benchmark.
- The real local server integration test verifies exact embedded JSON and a single SQLite record after two identical ticket submissions. It creates/reuses one clearly labeled synthetic case.
- The existing calculation suite independently verifies SoC conservation, AC power limits, financial separation, CSV weighting and stable keys.
- Before the user's instruction to stop MCP use, native Chrome checks confirmed the dark bento layout, healthy/fault day readouts, missing-data gaps, reserve 90% infeasibility, and hidden savings when terminal lock is off. A production-only UMD export issue discovered then was subsequently fixed and covered by the built-bundle test. No MCP was used afterward.
- Final visual regression, projector 16:9 timing/frame rate, tablet touch feel and OS-level reduced-motion switching were **not** measured. Responsive styles target desktop/tablet and smaller screens; the simulated DOM tests cannot validate actual layout.

Design rationale and original feel audit: [APPLE_UI_SPEC.md](../APPLE_UI_SPEC.md). Concept provenance: [dashboard architecture](../docs/ONE_ENERGY_VIEW_DASHBOARD_ARCHITECTURE.md).


## Solar Studio — extensions inspired by Watts-Up

Open the **Solar Studio** tab: roof editor / monthly potential / 25-year investment / bill / energy access / assistant / report. Full source-by-source comparison and honest integration limits: [WATTS_UP_FEATURE_AUDIT.md](../docs/WATTS_UP_FEATURE_AUDIT.md).

- Existing operational views and their financial ledger are unchanged. Planning profiles are separate and use RON.
- NASA data loads through `POST /api/solar/climate`. A real Bucharest climatology snapshot is embedded for offline use. Manual monthly values remain available.
- PDF text extraction uses bundled PDF.js. Local server text/OCR fallback accepts genuine PDF/PNG/JPEG up to 8 MB. Optional Python dependencies: `python3 -m pip install -r requirements-solar-optional.txt`; image OCR additionally needs `tesseract` in PATH. They are already available in the tested workspace. If absent, manual text/amount entry works.
- Reports export Markdown/JSON/CSV. **Tipărește / Salvează PDF** uses the browser print dialog and a report-only print stylesheet.
- Optional external AI: export `OEV_AI_ENDPOINT` (HTTPS chat/completions URL), `OEV_AI_KEY`, `OEV_AI_MODEL` before starting Python. Credentials remain server-side. The explicit AI button sends question + bounded numeric assumptions, not bills or address. No automatic .env loading. See `solar-services.env.example`.
- No model weights or service credentials are borrowed from Watts-Up. Google satellite/CV, Dedalus web research and conversational ElevenLabs remain unconfigured integrations, with functional local alternatives labeled as such.

Additional checks from the root:

```sh
python3 -m unittest discover -s tests -p test_solar_services.py -v
```

`npm test` now also checks planning calculations and every Solar Studio subview in the built bundle. jsdom adapts ES-module `import.meta.url` metadata for simulation; it does not execute the PDF worker or measure actual browser rendering.
