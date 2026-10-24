import { readFileSync } from "node:fs";
import ts from "typescript";
import assert from "node:assert/strict";
const source = readFileSync(
  new URL("../src/solar-planning.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const { defaults, analyze, polygonArea, equity, extractBill, validateClimate } =
  await import(
    "data:text/javascript;base64," + Buffer.from(js).toString("base64")
  );
const p = structuredClone(defaults),
  a = analyze(p);
assert.equal(a.monthly.length, 12);
assert.equal(a.years.length, 25);
assert(Math.abs(a.monthly.reduce((x, y) => x + y, 0) - a.annual) < 1e-6);
assert.equal(a.panels, Math.floor((p.area * p.usablePct) / 100 / p.panelArea));
assert(a.years.every((y) => y.self <= p.annualLoad && y.self <= y.generation));
assert(Math.abs(a.years[0].self + a.years[0].exports - a.annual) < 1e-6);
assert(analyze({ ...p, shadePct: 40 }).annual < a.annual);
assert(analyze({ ...p, maintenance: 10000 }).payback === null);
assert(analyze({ ...p, maintenance: 10000 }).npv < a.npv);
assert.equal(
  analyze({ ...p, loanApr: 0 }).payment,
  a.principal / (p.loanYears * 12),
);
assert.equal(analyze({ ...p, grant: 1e10 }).netCost, 0);
assert.equal(analyze({ ...p, grant: 1e10 }).roi, null);
assert.equal(analyze({ ...p, billConfirmed: false }).bill, null);
assert.equal(
  analyze({ ...p, billConfirmed: true, billKind: "after" }).bill.projected,
  null,
);
assert(analyze({ ...p, billConfirmed: true }).bill.exportCredit >= 0);
assert.equal(analyze({ ...p, area: 1 }).kwp, 0);
const lat = p.latitude,
  lon = p.longitude,
  dx = 10 / (111320 * Math.cos((lat * Math.PI) / 180)),
  dy = 10 / 111320;
const polygon = [
  { lat, lon },
  { lat, lon: lon + dx },
  { lat: lat + dy, lon: lon + dx },
  { lat: lat + dy, lon },
];
assert(Math.abs(polygonArea(polygon) - 100) < 0.01);
assert(Math.abs(polygonArea([...polygon].reverse()) - 100) < 0.01);
assert.throws(() =>
  polygonArea([polygon[0], polygon[2], polygon[1], polygon[3]]),
);
const low = equity({
  ...p,
  incomeAnnual: 10000,
  rentersPct: 80,
  installations: 0,
  monthlyBill: 1000,
});
const high = equity({
  ...p,
  incomeAnnual: 200000,
  rentersPct: 0,
  installations: 200,
  monthlyBill: 50,
});
assert(low.score >= 0 && low.score <= 100 && high.score > low.score);
assert(low.barriers.length >= 3);
assert.equal(
  extractBill("Total de plată: 1.234,56 lei\nConsum: 250 kWh").totals[0],
  1234.56,
);
assert.equal(extractBill("Total de plata: 500.20 RON").totals[0], 500.2);
assert.equal(extractBill("Amount due: 125.40").totals[0], 125.4);
assert.deepEqual(extractBill("Factura nr 99999, data 24/10/2026").totals, []);
const climate = JSON.parse(
  readFileSync(new URL("../src/nasa-bucharest.json", import.meta.url), "utf8"),
);
assert(validateClimate(climate, p.latitude, p.longitude));
assert.throws(() => validateClimate(climate, 46, 23));
assert(analyze({ ...p, climate }).climateMode.includes("NASA"));
assert(!analyze({ ...p, climate, latitude: 46 }).climateMode.includes("NASA"));
console.log(
  "PASS — roof geometry; annual climate; energy allocation; net payback/NPV; zero-interest loan; grant bounds; confirmed bill; access index; Romanian bill amounts; climate-coordinate match.",
);
