# One Energy View · Apple fluid interface specification

## A. Feel audit

Scores describe the existing `ui/` implementation before redesign (1 absent, 5 excellent).

| Quality | Score | Evidence and implementation target |
|---|---:|---|
| Response | 2 | `ui/app.js` delegates click actions; render replaces HTML. Add immediate pointer-down compression to actions and interactive cards. |
| Directness | 2 | SVG point inspection and native range inputs exist; no captured timeline playhead. Track the pointer without spring lag during a drag. |
| Interruptibility | 2 | Navigation re-renders the screen. Use persistent shared-layout pills and interruptible Motion values. |
| Springs | 1 | No physics engine in the current vanilla app. Use separate layout and sheet spring tokens. |
| Spatial consistency | 3 | Shared shell and site identity exist; fleet navigates away. Expand a sheet from the selected row and return focus there. |
| Materials | 3 | `ui/styles.css` has slate cards and borders. Replace with obsidian, top-lit solid bento surfaces, and selective floating material. |
| Reduced motion | 3 | Existing stylesheet provides reduced-motion overrides. Add reactive `useReducedMotion`, no spatial travel, no autoplay tour, 150 ms opacity. |

The requested `senior-frontend` skill was not installed in either local skills or plugin directories. This specification implements the supplied brief directly; it does not claim to activate an unavailable skill.

## B. Interaction redesign

### Persona and view controls

Happy path: pointer-down compresses the hit target immediately, click/keyboard commits selection; a glass `layoutId` indicator travels inside a stable `LayoutGroup`. Persona exposes the appropriate views without changing physical site identity. Interrupt/reverse: a new selection retargets the current spring, without a queue or exit-before-entry wait. Edges: each control has a minimum 44 px target and arrow/Home/End keyboard selection. Reduced motion: independent 150 ms opacity indicators, no shared positional animation.

### Timeline and reserve

Happy path: capture the primary pointer; preserve the grab offset when the existing handle is grabbed, or seek to the track when pressed elsewhere. Motion values update outside React for continuous handle motion; day changes alone update derived counters. Timeline snaps magnetically to 14 dates on release. Reserve moves continuously and commits an integer percentage on release. Both accept arrows/Home/End and announce committed values.

Interrupt/reverse: pointer-down stops any settling spring, retaining its current physical location. Project release momentum by 120 ms, clamp, then spring to the closest valid target. A reversal updates velocity immediately. Pointer cancellation settles to the last committed value and releases capture.

Edges: reserve is physically 20–90%, with exponential resistance `sign(delta) * 9 * (1 - exp(-abs(delta)/9))` beyond either edge. The optimizer may reject a reserve above the replay's initial 50% rather than manufacturing energy. Timeline uses the same resistance with a smaller visual overshoot. Reduced motion: preserve direct pointer tracking, disable momentum/overshoot, snap immediately; opacity-only state feedback.

### O&M diagnostic sheet

Happy path: a fleet row supplies a viewport anchor; sheet materializes from that context using transform origin, scale, translation and blur. Modal dialog traps focus; Escape, backdrop and a visible close button restore focus to the source row. Drag handle moves the sheet directly; distance or release velocity dismisses it. Interrupt/reverse: Motion's drag spring returns from the released position and velocity. Opening another site changes evidence atomically, never mixes receipts. Edges: only the handle captures vertical dismissal; evidence body scrolls normally. Reduced motion: no blur/scale/translation/drag travel; 150 ms opacity open/close, explicit dismiss remains.

## C. Motion specification

| Role | Token |
|---|---|
| Layout/pill/card reposition | `type: spring, stiffness: 300, damping: 35, mass: 1` (near-critical; reference 0.4 s / damping ratio 1.0) |
| Sheet / focused story card | `type: spring, stiffness: 380, damping: 28, mass: 1` (reference response 0.32 s / ratio 0.82) |
| Reduced-motion transitions | `type: tween, duration: 0.15`, opacity only |
| Pointer-down | Immediate 0.97 scale, then spring release; no delayed click feedback |

The supplied stiffness/damping pairs are the implementation tokens; their mathematical ratios at unit mass are approximately 1.01 and 0.72, so response/ratio labels are design references rather than physically identical parameterizations. Never use CSS `@keyframes` for scrub, sheet drag, tab/persona switch or gesture settling. No autonomous decorative motion in reduced motion.

## D. Materials and hierarchy

Canvas #000000–#090A0F. Bento cards rgba(28,28,30,.85), white 8% hairline with top-lit border. Floating navbar, segmented controls and modal use rgba(38,38,42,.65), blur(24px) saturate(180%). Avoid translucent layers nested on bright glass. SF system typography; tight large headings; every measurement uses tabular numerals. Solar #FFD60A; battery #30D158; load #0A84FF; anomaly/import #FF453A; export #64D2FF. Labels and icons accompany colors.

Stage mode increases metric size and focuses the current story surface. Other cards dim to .35 and scale .98, but remain reachable. The five-step jury tour can pause/advance/reverse; reduced motion disables automatic progression. A local ticket receipt demonstrates registration, never a physical repair.

## E. Implementation checklist

- [x] React + TypeScript + Tailwind + Motion, self-contained production HTML.
- [x] Existing dashboard schema and existing pure energy model reused.
- [x] Seven screens, two personas, RO/EN, three sites, commercial policy scenario.
- [x] Captured pointer gestures, grab offset, rubber bands, momentum and keyboard equivalents.
- [x] Modal focus containment, Escape, restore focus and scroll lock.
- [x] Separate financial buckets, missing-data handling, equal terminal SoC, historical provenance.
- [x] Persisted assessment, deterministic idempotency key and local/SQLite destination receipt.
- [x] Stage mode, interruptible guided path, reduced-motion fallback.
- [x] Build and calculation verification; see frontend/README.md for limits.

## F. Five do's / five don'ts

**Do:** keep site identity visible; explain one owner action; expose simulated/historical data; show missing polls as gaps; require review before creating a case ticket.

**Don't:** add overlapping financial buckets; call historical PVGIS a current forecast; imply a browser receipt repaired hardware; bypass SoC feasibility; use perpetual animation or low contrast to make operational data look cinematic.

Implementation references: [Motion shared layouts](https://motion.dev/docs/react-layout-animations), [Motion reduced motion](https://motion.dev/docs/react-use-reduced-motion), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).
