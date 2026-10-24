# One Energy View — working challenge brief

Source: the official challenge text supplied by the team in this conversation. This is a focused working summary; the original workspace remains recoverable in `.archive/`.

## Problem

Customers with existing solar PV and/or battery storage see energy across separate equipment interfaces. They struggle to understand production, consumption, storage and grid exchange together. O&M teams can discover underperformance or configuration problems after energy or money has been lost.

## Users to validate

- Residential prosumers with installed PV/BESS.
- Commercial/industrial prosumers, including 200–400 kW sites.
- Installers and O&M teams responsible for mixed-brand fleets.

Primary persona remains a discovery decision. Investigate their last actual incident, existing tools, discovery delay, measurable consequences and access to data.

## Required prototype behavior

The brief requires at least one capability beyond a chatbot reading a pasted file: join independent sources, track changes over time, or trigger an action. Our proposed vertical slice implements all three: normalized measurements + a suitable baseline + contract/price context → historical evidence → a maintenance work order.

Work alongside existing inverters and energy-management systems. Start with read access and respect access permissions/data boundaries.

## Sources and constraints

StoreNet Ireland and OPSD Konstanz provide historical measured reference data. PVGIS supplies modeled historical PV output for site geometry. OPCOM supplies market observations. Actual supplier terms determine valuation. Huawei Northbound access is gated; Fronius provides local read interfaces; Deye integrations depend on model/logger/access.

Keep measured reference data, historical models, simulated faults, assumed prices and interview evidence separately labelled. The current demo uses simulated brand-labelled sites, not real vendor connections.

## Corrections to retain

The supplied brief's blanket “quantity compensation up to 400 kW” statement conflicts with the legal text checked during research. The battleplan distinguishes ≤200 kW quantitative compensation from the 200–400 kW financial-settlement band, subject to applicable methodology and actual contract. Do not infer hourly retail/export prices from PZU alone.

PVGIS `seriescalc` is historical modeled output, not today's production forecast. “Earlier detection” and savings require real incident outcomes and valid counterfactuals.

Market counts/vendor shares supplied in the brief are dated context, not evidence of our customers' pain. Do not apply US utility-scale loss rates to Romanian households.

## Success at the mentor checkpoint

A specific persona, exact interview quotes and counterevidence, a source-labelled working energy view, an inspectable time-series finding, and a genuine local or external ticket action. Report remaining integration gaps explicitly.

See [battleplan](../CHALLENGE_1_ENERGY_BATTLEPLAN.md), [interview kit](CUSTOMER_DISCOVERY.md), and [data sources](../data/energy-research/SOURCES.md).
