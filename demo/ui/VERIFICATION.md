# Frontend demo verification

Verified against the local application on 24 October 2026.

## Automated calculations and integration

- `node ui/test_model.cjs` passes: all three sites / 14 days, AC energy balance, reconstructed battery SoC, 3 kW limits, 20–90% bounds, reserve, equal terminal energy and flexible-load energy conservation.
- Missing PV readings return unknown totals, unavailable optimization and unavailable financial results rather than zero-production claims.
- CSV checks cover timezone validation, invalid/negative loads, duplicate timestamps, overlapping market intervals, negative prices and duration-weighted hourly prices.
- Fixed retail tariffs remain fixed when OPCOM prices change; commercial export valuation and 250 kWp scaling are checked independently.
- JavaScript syntax checks and Python compilation pass.
- The running Python command serves the new UI and its generated JSON at port 8765.
- A browser-created ticket was verified in SQLite. Two repeated POSTs for that same key returned `ALREADY_EXISTS`; the database retained exactly one row for the key.
- The generated HTML contains inline styles, both application scripts and its exact data payload. It has no external script or stylesheet dependencies.

## Browser walkthrough

- All seven screens rendered and were inspected through normal browser interaction.
- The five-step jury tour reached a real SQLite receipt, then switched to the owner schedule.
- The tour includes 12-second autoplay steps, pause/resume and manual navigation. Its full state/action path was exercised interactively; a one-click autoplay run also completed in the owner schedule with equal terminal SoC displayed.
- A separate static-only server exercised the built-in fallback and browser-storage receipt without a backend ticket API.
- Assessment text and workflow state survived reload. The workflow advanced through intervention, pending check and demo-only verification, then reopened and resumed the existing intervention.
- Unlocking equal terminal SoC removed the savings claim. Flexible EV scheduling, reserve changes, EN translation and commercial policy switching updated the interface.
- A normalized load CSV was selected in the native file picker, previewed, then applied. The selected day's load updated to 60 kWh.
- An OPCOM CSV was previewed/applied; the price chart showed the uploaded 1,200/300 RON/MWh intervals.
- Missing-poll simulation produced chart gaps labelled “Date insuficiente”; all three financial amounts became unavailable while the outcome remained pending.
- Full-page visual inspection covered the energy-flow overview; the SQLite receipt screenshot is also retained under `screenshots/`.

Direct `file://` navigation is blocked by the browser automation policy, so direct-file execution could not be exercised through that tool. Standalone asset embedding and static-server behavior were checked instead. The application has a file-protocol path that uses embedded/bundled data and skips server detection. No browser security setting was changed.

Hardware adapters, tariff inputs and the diagnostic brief remain explicitly labelled demonstration/scenario components. No live LLM, external notification or physical device command was tested or claimed.


## Visual and UX design system elevation

- Re-architected topbar into a unified, high-density, frosted glass sticky header (`backdrop-filter: blur(20px)`), reducing vertical overhead from 220px to 96px while keeping all controls (Site selector, 24h/14d period switch, 250 kWp commercial toggle, Persona switcher, Jury tour button, and RO/EN language switcher).
- Data visualizations upgraded from harsh linear segments to silky smooth Catmull-Rom cubic Bézier splines with luminous vertical area gradients and glowing terminal markers.
- Handcrafted animated SVG Energy Flow hero diagram with smooth curved energy conduits, moving photons with SVG `animateMotion`, interactive node status rings, and live energy balance verification indicator.
- Redesigned the Guided Jury Tour from a jarring light modal into an executive floating glass presentation HUD with step timeline, animated 12s progress countdown, play/pause controls, and clear presentation narrative.
- Added URL hash routing (`#overview`, `#performance`, `#schedule`, `#costs`, `#fleet`, `#case`, `#connections`) enabling direct deep-linking and browser forward/back navigation.
- High-contrast WCAG 2.1 AA accessible typography with tabular numerals for energy telemetry and currency values.
