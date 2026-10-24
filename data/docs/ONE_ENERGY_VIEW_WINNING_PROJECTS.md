# Winning hackathon projects for One Energy View

Research date: 24 October 2026. Theme: one view of the energy a Romanian prosumer produces, consumes and stores, with useful early warnings for O&M teams.

The catalogue contains **57 competitive prize-winning projects**, **6 separately labelled recognitions**, and **5 useful leads without an established competitive win**. A [machine-readable companion](../data/energy-research/one-energy-view-project-catalogue.json) preserves the same entries and evidence classifications.

This catalogue combines the preserved workspace winners with new Devpost research. It is a broad, deduplicated research set, not a claim to have exhausted every hackathon ever held. Rankings and adaptations are our assessment; published award labels are evidence of recognition, not proof of field performance or explanations from judges.

## Read these first

| Priority | Project and award evidence | What the project describes | What to adapt for our challenge |
| --- | --- | --- | --- |
| 1 | [WattWise](https://devpost.com/software/hackthe6ix-bqlrik) — Hack the 6ix 2024, 2nd Place | Two Arduino devices stream measurements through MQTT into an Express service and DynamoDB; dashboard, predictions and unusual-use alerts. | The clearest small prototype architecture: two independent sources, one timestamped ledger, history and alerts. Replace devices with inverter and meter adapters. |
| 2 | [PERWER](https://devpost.com/software/perwer) — Africa Deep Tech Challenge 2025, IHS Power Management Category | Sensor gateway monitors power flows, temperatures and battery condition for mini-grids and telecom sites. | Normalize PV, battery and grid channels, retain freshness, and build a fleet view. Its reported ESP32/GSM/Wi-Fi design also informs low-connectivity sites. |
| 3 | [GridVeda](https://devpost.com/software/gridveda) — TreeHacks 2026, Stanford Ecopreneurship Sustainability: Best prototyping process | Transformer diagnostics, historical evidence and an operator interface with AI explanations. | A ranked O&M queue with drill-down evidence. Replace transformer chemistry with PV/meter/SoC observations and an appropriate solar baseline. |
| 4 | [Gridly](https://devpost.com/software/gridly-0h29vm) — 2026 EnergyHack@GT, Best Use of Vultr | Household load scheduling using a PuLP MILP optimizer, deadlines, safety thresholds and Matter hardware. | Schedule a flexible load using PV forecasts, the customer's actual tariff and battery constraints. Keep a reserve/override and explain the selected window. |
| 5 | [Soleil](https://devpost.com/software/soleil) — Chainlink Fall Hackathon 2021, Social Impact Prize | Solar monitoring credentials, scheduled API adapters and hourly production records; originally SolarEdge only. | Installer-authorized connector onboarding and scheduled collection. Add Huawei/Fronius/Deye adapters; retain the data-access mechanism without the token economy. |
| 6 | [SolarOps](https://devpost.com/software/solarops-wfjumy) — GreenPioneers, 1st Place Overall; MEGA Hackathon 2025, Gold Medal | Solar forecasting from weather, image-based fault detection and operator dashboards. | Compare actual production to expected output, show evidence and alternative causes, then request an inspection. Do not infer a dirty string from a production deficit alone. |
| 7 | [Challenge 1 – Better Batteries](https://devpost.com/software/challenge-1-better-batteries) — HackSheffield 8, Solar Zero & HeatIO: Optimise Battery Usage | A year of customer data used to evaluate PV/battery configurations and costs. | Replay household PV/load/BESS history and compare feasible dispatch policies with equal terminal SoC. Report modeled opportunity separately from realized savings. |
| 8 | [WattsUp](https://devpost.com/software/wp-fn35se) — 2026 EnergyHack@GT, 3rd Place Overall | Consumption dashboard, device information, personalized tips and household comparison; based on a 500-home dataset. | A simple household view of today's flows and one evidence-backed action. Its submission lists stronger automatic scheduling as future work. |
| 9 | [BYODevice Demand Response](https://devpost.com/software/byodevice-demand-response) — Minds + Machines Appathon: Ecomagination Challenge, 1st Place Enterprise Track | Combines weather/load forecasting, hourly price and carbon signals with an API for device scheduling. | Expose recommended consumption/discharge intervals through Home Assistant, with a separate operator view. This is especially relevant to the brief's two personas. |
| 10 | [SolarCulator](https://devpost.com/software/solarculator) — IDEAHACK 2020, 3rd Place | Solar generation/savings calculator; its stack explicitly lists JRC photovoltaic geographic data and geocoding. | A compact site-setup form feeding PVGIS: coordinates, capacity and installation parameters. Extend it with measured output and a history of deviations. |
| 11 | [Energy Dashboard and Anomaly Detection](https://devpost.com/software/nwl-hackathon) — Energy management reports for local authorities, Runner up | Compares sites with their own histories and similar sites while considering seasonality; Azure SQL and Tableau. | Persistent deviations and peer comparison, with seasonality and coverage checks. Its story proposes a notification system; do not treat that as verified delivery. |
| 12 | [CERBERUS](https://devpost.com/software/cerberus-afm1zu) — 2026 EnergyHack@GT, Best Use of Gemini API | Classical telemetry models followed by fast AI triage, deeper analysis and escalation. | A cheap deterministic screening stage, an evidence review stage and a technician decision. Adapt escalation, not automatic electrical isolation. |

These are distinct projects: **WattWise** above is `/hackthe6ix-bqlrik`; **WattsUp** is `/wp-fn35se`; **Watt's Up** below is `/watt-s-up`; **Watts Up** below is `/watts-up`. Similar names do not imply the same team or product.

## More competitive winners: solar production, site setup and maintenance

Each linked project page supports its award and original description. The adaptation column is proposed work for One Energy View.

| Project | Hackathon / recorded prize | Relevant mechanism and adaptation |
| --- | --- | --- |
| [Watt's Up](https://devpost.com/software/watt-s-up) | HackPrinceton Fall 2025 — Best Overall Hack | Maps, roof segmentation and NASA irradiance joined into generation and financial estimates. Adapt geometry-aware onboarding and source-linked generation estimates. Mainly a pre-installation tool. |
| [SolarVision](https://devpost.com/software/solarvision-ign0ro) | SunnyHacks Feb 2026 — 1st Place; GenAI Dev Hackathon — 1st place | Rooftop, climate and finance views. Adapt a clear site summary; keep feasibility estimates separate from measured operational performance. Ignore its unrelated participation awards. |
| [SolarX](https://devpost.com/software/solarx) | HackNC 2020 — Best Hack for Sustainability – Explorer; Wolfram Award | Offline-first solar cost/savings guidance and installer/subsidy discovery. Adapt accessible onboarding and cached household summaries. Smart-home monitoring appears as future work. |
| [TerraWatt](https://devpost.com/software/the-test-test) | 2026 EnergyHack@GT — 2nd Place Overall | Site constraints, weather/irradiance and scenario optimization for farms. Adapt constraint-aware explanations for SME sites; avoid rebuilding a farm-layout planner. |
| [RoofGrid](https://devpost.com/software/roofgrid) | InfinityX Global Hackathon 2K26 — Grand Winner | Maps, roof access paths, obstacles, production and editable financial assumptions. Adapt transparent assumptions and installer handoff. Other shortlist/feedback badges are not additional championships. |
| [RESOLV](https://devpost.com/software/resolv) | Robotech 2026 — 2nd Place Autonomous Track | Solar-panel inspection, sensor feedback and mechanical cleaning. Adapt the detection → inspection evidence → maintenance action loop; no cleaning robot is needed for our software MVP. |
| [sunfixr](https://devpost.com/software/sunfixr-so1ig) | SfunCube Solar Hackathon 2015 — 2nd Place | Microgrid maintenance knowledge and access to expert help. Adapt a technician checklist and escalation history attached to each site's incident. |
| [SolarPi](https://devpost.com/software/solarpi) | `smartenergyhackathon.devpost.com` — 1st; project created in 2017, event title currently rendered as “_” | Raspberry Pi collects inverter production and exposes it through an API/mobile app. Adapt a local gateway. Do not copy its unsupported universal neighbor-production tolerance. |
| [Suntrayce 2.0](https://devpost.com/software/suntrayce-2-0) | HackBU 2022 — #2 Best Hack; Most Technical Hack | Web interface connected to Arduino solar tracking. Adapt a visible command/acknowledgment loop for a lab smart load. Hardware actuation is the transferable pattern. |
| [SUNSET](https://devpost.com/software/sunset-self-adjusting-universal-solar-energy-tracker) | SMathHacks 2024 — Renewable Energy, 1st place | Solar-angle optimization and simulation. Adapt explicit tilt/orientation inputs and modeled-vs-observed reasoning, not its broad production-loss claims. |
| [imperium](https://devpost.com/software/imperium-agpd5c) | uwEnergyHacks — Problem Question 1; Best use of Google Cloud Platform | GIS-based identification of solar opportunities and client action plans. Adapt installer-facing portfolio qualification and evidence exports. Lower priority after panels are installed. |

## More competitive winners: household visibility, flexible loads and batteries

| Project | Hackathon / recorded prize | Relevant mechanism and adaptation |
| --- | --- | --- |
| [WattaSave](https://devpost.com/software/wattasave) | BloomKnights — Best Clean Energy Solution [OneEthos] | Provider peak periods, appliance duration and household availability feed a schedule. Adapt a recommendation that fits the owner's routine; track estimated and achieved savings separately. |
| [Innovative Solar Demand Response](https://devpost.com/software/innovative-solar-demand-response) | Apps for Energy — Popular Choice, Second Prize | Uses household interval demand to size PV/storage and shift evening demand. Adapt interval-level PV/load/BESS replay. The public-vote award is not an overall judged first prize. |
| [Second Life](https://devpost.com/software/winhacks-2024-egl-title-tbd) | WinHacks 2024 — Second Place Overall | Battery passport/inventory for reuse in microgrids. Adapt asset identity, installation metadata and service history. Live battery state-of-health monitoring is listed as future work. |
| [Polito's Martians](https://devpost.com/software/polito-s-martians) | MATLAB HackaTOn: Mission on Mars — Second place | Simulated solar/battery microgrid with MPPT, bus control and parameter sweeps. Adapt energy-balance checks and stress scenarios; Mars parameters do not transfer to Romanian homes. |
| [EnergyXchange](https://devpost.com/software/energyxchange) | 2026 EnergyHack@GT — Best Use of Auth0 | Household and operator views, event commitments, historical baselines and outcome verification. Adapt opt-in load-shifting events and their measured follow-up; omit financial penalties from the hackathon MVP. |
| [Electrigrid](https://devpost.com/software/ee-8ipv5n) | Hacked 2026 — Energy / Power Stream, 1st | Household dashboard and administrator view. Adapt two personas over one ledger. The submission says devices are simulated and live smart-home APIs/SMS are next steps. |
| [GreenPeak](https://devpost.com/software/greenpeak) | CS Base Climate Hack — Wolfram Award | Home energy dashboard, abnormal-use detection and IoT control concepts. Adapt the household health summary and accessible alerts; published capabilities need a code/demo check before reuse. |
| [myDominion](https://devpost.com/software/mydominion) | Power The Future DesignAthon — First Place | A home power-meter prototype feeds Firebase and an app. Adapt meter → timestamped database → owner view; combine it with inverter observations. |
| [Watt By Watt](https://devpost.com/software/watt-by-watt) | AthenaHacks 2023 — Best Energy Innovation Hack, Chevron | Streamlit joins regional energy/financial data into recommendations. Adapt a small understandable cost view grounded in the actual household's tariff. |
| [Watt](https://devpost.com/software/watt) | HackDuke 2016 — Energy & Environment Track Winner | Combines household/appliance information with energy and cost datasets. Adapt appliance metadata and transparent cost comparison; it is a simplified calculator, not a live monitor. |
| [AppliScan](https://devpost.com/software/team-nars) | 2026 EnergyHack@GT — 1st Place Overall | Appliance-model OCR, ENERGY STAR lookup and lifetime cost analysis. Adapt easy appliance identification for flexible-load setup; EU/Romanian product and tariff data must replace US assumptions. |
| [Watts Up](https://devpost.com/software/watts-up) | DeltaHacks XI — Best Environmental Hack; Powering Tomorrow | EV charging availability, scheduling, dynamic pricing and booking workflow. Adapt EV charging windows and user override; a shared charger marketplace is outside our MVP. |
| [Greenie](https://devpost.com/software/greenie-dktq3x) | Hack@CEWIT 2023 — IoT Security Savvy Award | Arduino/cloud building-energy prototype. Adapt hardware-to-dashboard separation. The published description is sparse, so inspect its code before choosing it as an implementation reference. |
| [Watt a Waste](https://devpost.com/software/watt-a-waste) | Snowday '17 — Top Hack w/ Mentor | Arduino light-use timing connected to a Java app. Adapt the smallest physical-signal-to-history demo; usefulness is mainly educational, not O&M-grade diagnosis. |

## More competitive winners: telemetry, prices and auditable operations

| Project | Hackathon / recorded prize | Relevant mechanism and adaptation |
| --- | --- | --- |
| [OpenGrid](https://ethglobal.com/showcase/opengrid-68swe) | ETHGlobal New York 2025 — Chainlink: Connect the World; Flow Builder Pool | External smart-meter retrieval and distribution. Adapt authorized meter access and canonical timestamps; use ordinary storage unless a blockchain requirement emerges. Local evidence retained in `winner-evidence.json`. |
| [flexgrid](https://devpost.com/software/flexgrid-j3tb9s) | 2026 EnergyHack@GT — Best Use of Solana | M5Stack environmental sensors → FastAPI → MongoDB → dashboard/history. Adapt telemetry freshness and environmental context. Its on-chain demo uses a manually triggered memo, not proof of automatic control. |
| [Fdascab](https://devpost.com/software/uh-energy-dashboard) | Hawaii Annual Code Challenge 2018 — High School Division Winner | Multi-building CSV ingestion and time-series charts. Adapt a robust multi-site importer. Anomaly detection is future work in its submission. |
| [GRID](https://devpost.com/software/grid-38zo0l) | HackLondon 2026 — Societies Track prize | Time-varying grid simulation, scenario placement and viability reports. Adapt site/fleet what-if comparison with explicit assumptions, rather than a national-grid simulation. |
| [Northpole](https://devpost.com/software/northpole) | Chainlink Spring 2022 — Top Quality Projects | Nord Pool adapter and time-bounded price settlement. Adapt delivery-period alignment, price provenance and settlement-period records; do not add options trading. |
| [EcoVerse](https://devpost.com/software/eco-verse) | Chainlink Spring 2023 — Top Quality Projects | Distributor production/consumption, market prices and regulatory tariffs joined for hourly community calculations. Adapt the separation between meter observations, market prices and billing rules. |
| [BERClean](https://devpost.com/software/berclean) | Whose Hacks? Our Hacks! — 1st Place | Market prices compared with marginal carbon costs. Adapt a clear cost/carbon trade-off. The team describes analysis and mockups, not a fully implemented consumer app. |
| [Power Down](https://devpost.com/software/solar-city) | DataHacks 2026 — Most Innovative Idea, Basement | Several public datasets joined into an interactive energy decision simulator with formulas and fallback labels. Adapt source transparency and an editable Romanian scenario. |
| [Phantom Busters](https://devpost.com/software/phantom-busters) | 2026 EnergyHack@GT — Best Use of ElevenLabs | Workload traces → modeled energy metrics → classifier → timestamped explanations and decision logs. Adapt evidence-linked decisions. VM traces are not direct measured household electricity. |
| [kassi](https://devpost.com/software/kassi-synthetic-load-generation) | Splunk Agentic Ops Hackathon 2026 — Grand Prize | Audited investigation/remediation state machine. Adapt ingest → quality check → anomaly → cross-check → ticket → follow-up. Architectural match; original domain is software operations. Local evidence retained. |
| [Realtrack](https://ethglobal.com/showcase/realtrack-f4kyd) | ETHGlobal Buenos Aires 2025 — EVVM custom Service/Chain, 3rd place | Batched IoT measurements with evidence history. Adapt sensor provenance, missing-data flags and ticket attachments. Architectural match from cold-chain monitoring. Local evidence retained. |
| [Energy Agent AI](https://devpost.com/software/energy-agent-ai) | Google Cloud ADK Hackathon 2025 — North America regional winner | Customer analytics with explained prioritization and operational follow-through. Adapt site ranking by evidence quality and estimated loss; its original task is customer retention, using simulated data. Local evidence retained. |
| [GreenOps](https://devpost.com/software/greenops-gzp4aj) | Google Cloud ADK Hackathon 2025 — Asia Pacific regional winner | Coordinated cloud-sustainability auditing and recommendations. Adapt reviewed intervention cards and subsequent outcome tracking; original domain is cloud infrastructure. Local evidence retained. |
| [EdgeFinder](https://ethglobal.com/showcase/edgefinder-vwc52) | ETHGlobal Buenos Aires 2025 — EVVM MATE integration, 5th place | Matches equivalent objects across sources before comparing prices. Adapt consistent interval/site matching and feasible schedule alternatives. Original domain is prediction markets. Local evidence retained. |
| [HawkWatch](https://devpost.com/software/hawkwatch) | TreeHacks 2025 — Grand Prize / 1st place, as recorded locally | Event detection, timestamped evidence and alert delivery. Adapt incident deduplication and an actual O&M ticket receipt. Architectural match, not solar-specific. Local evidence retained. |
| [Eco Fast Track](https://devpost.com/software/apartment-monitoring) | HackUTD 2024 — Veolia | Water sensors, historical aggregation, property-manager/tenant views and email warnings. Adapt the dual-persona sensor-to-alert workflow to energy. |
| [Leafully](https://appsforenergy.devpost.com/submissions/7987-leafully) | Apps for Energy — Best Overall Application, Grand Prize | Green Button interval history translated into accessible household explanations. Adapt historical context and plain Romanian wording, while retaining kWh and RON as the main units. |
| [Melon](https://devpost.com/software/melon-energy-star-green-button-benchmark) | Apps for Energy — Best Overall Application, Second Prize | Building metadata and utility data feed ENERGY STAR benchmarking and next steps. Adapt comparable-site grouping; normalize capacity, orientation and weather before comparing PV sites. |
| [VELObill](https://appsforenergy.devpost.com/submissions/7930-velobill-the-utility-bill-of-the-future) | Apps for Energy — Best Overall Application, Third Prize; Popular Choice, Grand Prize | Utility data in one view, historical peaks, goals and improvement plans. Adapt the unified owner screen and progress tracking; do not use a monthly bill as a substitute for interval telemetry. |
| [wotz](https://devpost.com/software/wotz) | Apps for Energy — Student Award, Grand Prize | Makes interval electricity usage understandable to households. Adapt the explanatory UX and temporal detail, not appliance-level certainty from a single aggregate meter. |

## Relevant recognition, kept separate from competitive placements

| Project | Exact type of recognition | Useful adaptation |
| --- | --- | --- |
| [BatteryForgeAI](https://devpost.com/software/batteryforgeai) | Gemini 3 Hackathon — Honorable Mentions | Specialist agents, physics tools, battery logs and fleet views. Strong BESS architecture reference. The page explicitly describes simulated fleet packs and direct BMS ingestion as future work. |
| [SolarGIS](https://devpost.com/software/solargis) | LaunchLab — Honorable Mention | pvlib, irradiance/weather APIs, shading geometry and caching. Useful for explaining expected output and why a naive baseline can flag false faults. |
| [SolarScope](https://devpost.com/software/solarscope) | World's Largest Hackathon presented by Bolt — Regional Highlights, EMEA | Geometry-first solar setup and understandable reports. Already present in our local winners; a regional highlight is not an overall championship. |
| [GridPulse](https://devpost.com/software/gridpulse) | NextGenHacks — Top 9 Finalists | Grid modeling and explanatory metrics. A finalist is not necessarily a prize winner. |
| [SunShiftAI](https://devpost.com/software/sunshiftai) | Code for Impact 2025 — Finalist Certificate and named sponsor benefits | Weather, price and grid scores mapped to appliance windows. Use the scheduling UX as inspiration; fixed weighted scores are not proof of an optimum. |
| [agentawim](https://ethglobal.com/showcase/agentawim-upa37) | Agentic Ethereum 2025 — Coinbase AgentKit Pool Prize, recorded in archive | Sensor-linked green-generation accounting. Pool awards are identified separately; the energy-data capture is more useful than the token mechanism. |

## Useful leads that are not established competitive winners

| Project | Evidence status | Why keep the link |
| --- | --- | --- |
| [NetFridge](https://devpost.com/software/netfridge) | Winner badge observed on the live `watt` results; exact event/prize not established in this pass | Card describes LMP, WattTime and FlexBox data used to schedule refrigerator grid services. Strong multi-source flexible-load lead, but do not invent an award. |
| [afterimage](https://devpost.com/software/afterimage-ibp376) | OpenCV AI Competition 2026 submission; no award displayed on the inspected page | Particularly useful O&M pattern: same-asset baseline memory, input-quality gates, measured changes, human review and an auditable action trace. Do not mistake its discussion of prior winners for an award it won. |
| [Zenith](https://devpost.com/software/zenith-solar-to-grid-intelligence-platform) | Hacksocial 2026 — Formaloo Credits; not sufficient evidence of a competitive placement | Solar feasibility, finance and microgrid optimization. Keep as product inspiration with its prototype limitations. |
| [SolarPulse AI](https://devpost.com/software/solarpulse-ai) | Local archive lists ForgeHacks “All Participants” only | Solar monitoring/thermal-fault idea; thematic relevance does not establish a win. |
| [BuildIQ](https://devpost.com/software/buildiq) | Frostbyte Hackathon — Participation & Completion Recognition | Useful simulator and dashboard lead; live hardware and stronger predictive maintenance are future work. |

Other local records excluded from the winner list: Groundwork, Smart Campus Energy & HVAC Optimization, AI-Powered Smart Energy Management for Sustainable Campuses, Automated Hostel Utility Management Dashboard and the mobility hub entry carry “All Participants” awards. Orbital Assets and NOOR mention solar/energy but address asteroid finance and storytelling, rather than prosumer operations. The search result named Smart Meter is a parking-meter project. Penumbra uses a color inverter, not a PV inverter.

## A concrete combination for our prototype

1. **WattWise / PERWER / Soleil:** adapters collect inverter, battery and grid-meter intervals into a common ledger. Keep source timestamps, units, quality and last-successful-read time.
2. **SolarCulator / SolarGIS:** site geometry and a physics baseline explain expected production. A live PVGIS historical-series request is not today's weather-adjusted forecast; add appropriate weather data before making that claim.
3. **GridVeda / Energy Dashboard / kassi:** track persistent residuals, inspect alternative causes and open a source-linked O&M case. A shortfall can come from weather, shading, curtailment, missing readings or an actual fault.
4. **Gridly / Better Batteries / BYODevice:** compare feasible load/BESS schedules under the customer's actual import/export contract. Enforce reserve SoC, power limits, efficiency, wear and equal terminal SoC.
5. **HawkWatch / Eco Fast Track:** trigger one real team-owned ticket/webhook and retain its receipt. Deduplicate repeated detections and record whether a technician confirmed the suspected problem.

That demonstrates all three capabilities in the brief: independent data joins, history, and a verifiable external action. The project pages do not establish Huawei/Fronius/Deye integrations for us; those adapters still require separate implementation and access.

Choose the problem from interviews. These projects suggest implementation mechanisms; they do not establish what Romanian owners will pay for. A useful first test is whether an installer can show a recent case where normal vendor monitoring missed a costly issue, and whether the joined evidence would have changed the next action.

## Searches and evidence trail

Local sources inspected:

- [Existing ten-project index](../data/energy-research/WINNERS.md).
- [Preserved full winner records](../data/energy-research/winner-evidence.json).
- [Original battleplan and adaptations](../CHALLENGE_1_ENERGY_BATTLEPLAN.md).
- The JSON project records inside `.archive/pre-energy-cleanup-20261024-111342.zip`, read without restoring unrelated folders.
- [Expanded local energy-candidate extraction](../data/energy-research/expanded-local-energy-candidates.json). Contains keyword matches, including irrelevant and non-winning records; it is not itself an approved winners list.

Discovery began with the requested [popular watt search](https://devpost.com/software/popular?query=watt). The web extractor could not load it; Chrome loaded it successfully. Its first page showed 24 of 300 matches, including irrelevant projects. The `solar is:winner` search was also read in Chrome; `inverter is:winner` showed eight matches, including SolarPi, RoofGrid and SolarGIS, plus false positives. The first page of `battery is:winner` was inspected too; many matches concerned unrelated battery-powered devices. Additional discovery used indexed Devpost searches for energy, batteries, smart meters, microgrids, photovoltaics, forecasting, tariffs, demand response, monitoring and anomalies. Award details were checked on project pages/search extracts or retained local evidence, rather than inferred from popularity.

Reusable links below include additional proposed keyword searches; they are not a claim that every page or pagination result was exhaustively inspected:

| Keyword | Devpost popular search |
| --- | --- |
| watt | [Search](https://devpost.com/software/popular?query=watt) |
| solar | [Search](https://devpost.com/software/popular?query=solar) |
| photovoltaic | [Search](https://devpost.com/software/popular?query=photovoltaic) |
| inverter | [Search](https://devpost.com/software/popular?query=inverter) |
| battery | [Search](https://devpost.com/software/popular?query=battery) |
| BESS | [Search](https://devpost.com/software/popular?query=BESS) |
| energy | [Search](https://devpost.com/software/popular?query=energy) |
| grid | [Search](https://devpost.com/software/popular?query=grid) |
| microgrid | [Search](https://devpost.com/software/popular?query=microgrid) |
| prosumer | [Search](https://devpost.com/software/popular?query=prosumer) |
| smart meter | [Search](https://devpost.com/software/popular?query=smart%20meter) |
| energy monitoring | [Search](https://devpost.com/software/popular?query=energy%20monitoring) |
| energy management | [Search](https://devpost.com/software/popular?query=energy%20management) |
| demand response | [Search](https://devpost.com/software/popular?query=demand%20response) |
| load shifting | [Search](https://devpost.com/software/popular?query=load%20shifting) |
| time of use | [Search](https://devpost.com/software/popular?query=time%20of%20use) |
| tariff | [Search](https://devpost.com/software/popular?query=tariff) |
| power forecasting | [Search](https://devpost.com/software/popular?query=power%20forecasting) |
| anomaly detection | [Search](https://devpost.com/software/popular?query=anomaly%20detection) |
| predictive maintenance | [Search](https://devpost.com/software/popular?query=predictive%20maintenance) |
| home assistant | [Search](https://devpost.com/software/popular?query=home%20assistant) |
| Modbus | [Search](https://devpost.com/software/popular?query=Modbus) |
| MQTT | [Search](https://devpost.com/software/popular?query=MQTT) |
| PVGIS | [Search](https://devpost.com/software/popular?query=PVGIS) |
| digital twin | [Search](https://devpost.com/software/popular?query=digital%20twin) |

Add `is:winner` in the site's search box to filter award-tagged entries, then read **Submitted to** on each project. Participation benefits, finalist certificates and pool awards require separate labels even when Devpost calls them “Winner.”

Especially useful event galleries: [2026 EnergyHack@GT](https://energyhack-gt-26.devpost.com/project-gallery), [Apps for Energy](https://appsforenergy.devpost.com/project-gallery), and [uwEnergyHacks](https://uwenergyhacks.devpost.com/project-gallery). For a closely aligned challenge, read the [HackSheffield 8 battery winner](https://devpost.com/software/challenge-1-better-batteries).

Technical descriptions are team-reported and have not been independently reproduced. Numerical accuracy, savings and early-warning claims from submissions are deliberately not adopted as expected Romanian results. In particular, integrate power over time to obtain energy: kW × hours = kWh; do not copy WattWise's incorrect “watts per hour equals energy” wording.
