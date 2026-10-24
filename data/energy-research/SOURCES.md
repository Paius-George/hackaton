# One Energy View — data and evidence

[Project home](../../README.md) · [Winner patterns](WINNERS.md)

| Source | Purpose | Boundary |
| --- | --- | --- |
| [PVGIS JRC API](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/using-pvgis-5/api-non-interactive-service_en) | Geometry-matched modeled PV baseline. | Historical model, not today's forecast. Keep original timestamps/geometry. |
| [StoreNet descriptor](https://www.nature.com/articles/s41597-024-03454-2.pdf), [dataset](https://doi.org/10.6084/m9.figshare.c.6829134) | Irish measured household PV, load, battery, SoC and grid reference traces. | Historical Irish data; never claim these are Romanian vendor measurements. |
| [OPSD household data](https://data.open-power-system-data.org/household_data/) | Konstanz load/PV/grid reference traces. | Cumulative measurements, missingness/interpolation and source geometry require care. |
| [OPCOM](https://www.opcom.ro/acasa/ro) | Delivery-interval market prices and published monthly weighted PZU. | Not automatically the customer's import/export tariff. |
| Supplier contract and bills | Applicable energy valuation and settlement. | `contract.example.json` is illustrative; replace from actual documents. |
| [Huawei pyhfs](https://github.com/guillaumeblanc/pyhfs) | Understand Northbound access and payloads. | Suitable API account required; current demo has no active Huawei connector. |
| [Fronius API](https://www.fronius.com/en/help-center/solar-energy/products/monitoring-control/solutions/open-interfaces/fronius-solar-api-json-) | Authorized local read integration. | Hardware/model/API activation and available meter channels vary. |
| [Law 160/2026](https://legislatie.just.ro/Public/DetaliiDocument/312476) | Settlement regime context. | Confirm applicable ANRE implementation and actual supplier terms. |

## Local evidence

- `winner-evidence.json`: the ten original selected project records, including historical source paths and award evidence.
- `verification.json`: historical offline checks; its live-network status describes that earlier verification run, not every later demo.
- `contract.example.json`: illustrative values, not a supplier offer or current tariff assertion.
- `cleanup-manifest.json`: archive location and cleanup counts.

## Existing demos

Run-folder `manifest.json` files preserve their original checksums. The older fixture uses a synthetic baseline. The later saved run declares a live-fetched PVGIS historical model; its fleet faults remain simulated. Check each `dashboard.json` source labels before presenting it. Neither demo validates real vendor connectivity, measured Romanian savings or customer demand.
