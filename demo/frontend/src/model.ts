import "./energy-model.js";
export type Row = {
  timestamp: string;
  site_id: string;
  date: string;
  hour: number;
  pv_kwh: number | null;
  expected_kwh: number;
  load_kwh: number;
  soc_start_pct: number;
  soc_end_pct: number;
  delta: number;
  quality: string;
  buy: number;
  sell: number;
  pzu_ron_mwh: number;
  grid_import_kwh: number;
  battery_charge_kwh: number;
  battery_discharge_kwh: number;
  grid_export_kwh: number;
};
export type Data = {
  sites: { site_id: string; kwp: number; brand_label: string }[];
  timeseries: Row[];
  sources: Record<string, Record<string, unknown>>;
  fetched_at: string;
};
export type Controls = {
  commercial: boolean;
  policy: string;
  reserve: number;
  terminalLock: boolean;
  flex: string;
  start: number;
  end: number;
  missing: Record<string, boolean>;
};
export type Imports = {
  prices?: Record<string, number>;
  loads?: Record<string, Record<string, number>>;
};
export type Day = {
  date: string;
  rows: Row[];
  complete: boolean;
  coverage: number;
  expected: number;
  pv: number | null;
  residual: number | null;
};
export type Totals = {
  complete: boolean;
  pv: number | null;
  load: number;
  soc: number;
  expected: number;
  residual: number | null;
  imp: number | null;
  exp: number | null;
  charge: number | null;
  discharge: number | null;
  balance: number | null;
};
export type Opt = {
  available: boolean;
  reason?: string;
  socs: number[];
  deltas: number[];
  saving: number | null;
  terminal: number;
  observedTerminal: number;
  comparable: boolean;
  flexStart: number | null;
};
export type Finance = {
  complete: boolean;
  days: number;
  observed: number | null;
  pvExposure: number | null;
  dispatch: number | null;
  shortfall: number | null;
};
export interface Model {
  validate(data: unknown): Data;
  rowsFor(
    data: Data,
    site: string,
    controls: Controls,
    imports: Imports,
  ): Row[];
  daily(rows: Row[]): Day[];
  totals(rows: Row[]): Totals;
  optimize(rows: Row[], controls: Controls): Opt;
  financial(rows: Row[], controls: Controls): Finance;
  persistence(days: Day[], threshold: number): number;
  key(site: string, rule: string, window: string): string;
  parseCSV(text: string, kind: string): Record<string, string>[];
  importMap(
    rows: Record<string, string>[],
    kind: string,
  ): Record<string, number>;
}
declare global {
  interface Window {
    EnergyModel: Model;
    __ENERGY_DATA__?: Data;
  }
}
export const M = window.EnergyModel;
