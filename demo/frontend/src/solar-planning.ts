/** Independent Romania-focused planning implementation, inspired by Watts-Up workflows. */
export type Point = { lat: number; lon: number };
export type Climate = {
  latitude: number;
  longitude: number;
  monthly_psh: number[];
  kind: string;
  source_url: string;
  fetched_at: string;
  header?: Record<string, unknown>;
};
export type Planning = {
  address: string;
  latitude: number;
  longitude: number;
  polygon: Point[];
  area: number;
  usablePct: number;
  panelW: number;
  panelArea: number;
  orientation: number;
  shadePct: number;
  soilingPct: number;
  performanceRatio: number;
  monthlyPsh: number[];
  climate: Climate | null;
  annualLoad: number;
  selfConsumptionPct: number;
  importPrice: number;
  exportPrice: number;
  fixedMonthly: number;
  costPerKwp: number;
  grant: number;
  maintenance: number;
  cleaning: number;
  degradationPct: number;
  escalationPct: number;
  discountPct: number;
  co2KgKwh: number;
  treeKgYear: number;
  loanApr: number;
  loanYears: number;
  downPct: number;
  ppaPrice: number;
  monthlyBill: number;
  billKwh: number;
  billDays: number;
  billConfirmed: boolean;
  billKind: "before" | "after";
  incomeAnnual: number;
  rentersPct: number;
  households: number;
  installations: number;
  incomeReference: number;
  adoptionReferencePct: number;
  burdenReferencePct: number;
};
export const MONTHS = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const defaults: Planning = {
  address: "București · scenariu",
  latitude: 44.4268,
  longitude: 26.1025,
  polygon: [],
  area: 65,
  usablePct: 75,
  panelW: 450,
  panelArea: 2.1,
  orientation: 1,
  shadePct: 8,
  soilingPct: 3,
  performanceRatio: 0.8,
  monthlyPsh: [1.4, 2.1, 3.3, 4.5, 5.7, 6.3, 6.4, 5.7, 4.2, 2.8, 1.6, 1.2],
  climate: null,
  annualLoad: 4500,
  selfConsumptionPct: 55,
  importPrice: 1.3,
  exportPrice: 0.6,
  fixedMonthly: 15,
  costPerKwp: 4500,
  grant: 0,
  maintenance: 300,
  cleaning: 150,
  degradationPct: 0.5,
  escalationPct: 2,
  discountPct: 5,
  co2KgKwh: 0.2,
  treeKgYear: 22,
  loanApr: 7,
  loanYears: 10,
  downPct: 20,
  ppaPrice: 0.8,
  monthlyBill: 500,
  billKwh: 350,
  billDays: 30,
  billConfirmed: false,
  billKind: "before",
  incomeAnnual: 90000,
  rentersPct: 20,
  households: 1000,
  installations: 50,
  incomeReference: 90000,
  adoptionReferencePct: 10,
  burdenReferencePct: 10,
};
export const cities = [
  { name: "București", lat: 44.4268, lon: 26.1025 },
  { name: "Cluj-Napoca", lat: 46.7712, lon: 23.6236 },
  { name: "Timișoara", lat: 45.7489, lon: 21.2087 },
  { name: "Iași", lat: 47.1585, lon: 27.6014 },
  { name: "Constanța", lat: 44.1598, lon: 28.6348 },
  { name: "Brașov", lat: 45.6579, lon: 25.6012 },
  { name: "Oradea", lat: 47.0465, lon: 21.9189 },
  { name: "Ploiești", lat: 44.9367, lon: 26.0129 },
  { name: "Sibiu", lat: 45.7983, lon: 24.1256 },
  { name: "Craiova", lat: 44.3302, lon: 23.7949 },
];
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
/** Heuristic tilt factor for Bucharest latitude; 35° is the reference optimum. */
export const tiltFactor = (tiltDeg: number) =>
  clamp(1 - Math.abs(clamp(tiltDeg, 0, 90) - 35) / 100, 0.55, 1);
/** Heuristic azimuth factor; 0° (south) is the reference optimum. */
export const azimuthFactor = (azimuthDeg: number) => {
  const a = ((((azimuthDeg + 180) % 360) + 360) % 360) - 180;
  return clamp(1 - Math.abs(a) / 220, 0.45, 1);
};
function cross(a: Point, b: Point, c: Point) {
  return (b.lon - a.lon) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lon - a.lon);
}
export function polygonArea(points: Point[]) {
  if (points.length < 3) return 0;
  if (
    points.length > 100 ||
    points.some(
      (p) =>
        !Number.isFinite(p.lat) ||
        !Number.isFinite(p.lon) ||
        p.lat < 43 ||
        p.lat > 49 ||
        p.lon < 20 ||
        p.lon > 30,
    )
  )
    throw Error("Poligon invalid: maximum 100 vârfuri în România.");
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      const a = points[i],
        b = points[(i + 1) % points.length],
        c = points[j],
        d = points[(j + 1) % points.length];
      if (
        cross(a, b, c) * cross(a, b, d) < 0 &&
        cross(c, d, a) * cross(c, d, b) < 0
      )
        throw Error("Laturile poligonului se intersectează.");
    }
  const lat =
    ((points.reduce((a, p) => a + p.lat, 0) / points.length) * Math.PI) / 180;
  const xy = points.map((p) => ({
    x: (p.lon - points[0].lon) * 111320 * Math.cos(lat),
    y: (p.lat - points[0].lat) * 111320,
  }));
  return (
    Math.abs(
      xy.reduce(
        (a, p, i) =>
          a + p.x * xy[(i + 1) % xy.length].y - xy[(i + 1) % xy.length].x * p.y,
        0,
      ),
    ) / 2
  );
}
export function validateClimate(x: unknown, lat: number, lon: number): Climate {
  const c = x as Climate;
  if (
    !c ||
    !Array.isArray(c.monthly_psh) ||
    c.monthly_psh.length !== 12 ||
    c.monthly_psh.some((v) => !Number.isFinite(v) || v <= 0 || v > 12) ||
    Math.abs(c.latitude - lat) > 0.001 ||
    Math.abs(c.longitude - lon) > 0.001
  )
    throw Error("Climatologie invalidă sau coordonate diferite.");
  return c;
}
export function analyze(p: Planning) {
  const area = p.polygon.length >= 3 ? polygonArea(p.polygon) : p.area;
  const usable = (area * p.usablePct) / 100,
    panels = Math.floor(usable / p.panelArea),
    kwp = (panels * p.panelW) / 1000;
  const climate =
    p.climate &&
    Math.abs(p.climate.latitude - p.latitude) < 0.001 &&
    Math.abs(p.climate.longitude - p.longitude) < 0.001
      ? p.climate
      : null;
  const irradiance = climate?.monthly_psh || p.monthlyPsh;
  const factor =
    p.performanceRatio *
    p.orientation *
    (1 - p.shadePct / 100) *
    (1 - p.soilingPct / 100);
  const monthly = irradiance.map((sun, i) => sun * DAYS[i] * kwp * factor),
    annual = monthly.reduce((a, v) => a + v, 0),
    psh = irradiance.reduce((a, v, i) => a + v * DAYS[i], 0) / 365,
    cf = kwp ? annual / (kwp * 8760) : 0;
  const scores = [
    {
      name: "Acoperiș",
      weight: 0.3,
      value: clamp((usable / 100) * p.orientation * 100, 0, 100),
    },
    { name: "Iradiere", weight: 0.25, value: clamp((psh / 5) * 100, 0, 100) },
    { name: "Capacitate", weight: 0.2, value: clamp((kwp / 10) * 100, 0, 100) },
    {
      name: "Randament",
      weight: 0.15,
      value: clamp((cf / 0.18) * 100, 0, 100),
    },
    {
      name: "Obstacole",
      weight: 0.1,
      value: clamp(100 - p.shadePct - p.soilingPct, 0, 100),
    },
  ];
  const score = scores.reduce((a, v) => a + v.value * v.weight, 0),
    grossCost = kwp * p.costPerKwp,
    grant = Math.min(grossCost, p.grant),
    netCost = grossCost - grant;
  let cumulative = -netCost,
    npv = -netCost,
    payback: number | null = null,
    totalPv = 0,
    totalNet = 0;
  const years = Array.from({ length: 25 }, (_, i) => {
    const generation = annual * (1 - p.degradationPct / 100) ** i,
      self = Math.min((generation * p.selfConsumptionPct) / 100, p.annualLoad),
      exports = Math.max(0, generation - self),
      rate = (1 + p.escalationPct / 100) ** i,
      gross = (self * p.importPrice + exports * p.exportPrice) * rate,
      opex = p.maintenance + p.cleaning,
      net = gross - opex,
      previous = cumulative;
    cumulative += net;
    npv += net / (1 + p.discountPct / 100) ** (i + 1);
    totalNet += net;
    totalPv += generation;
    if (payback === null && cumulative >= 0 && net > 0)
      payback = i + Math.max(0, -previous) / net;
    return {
      year: i + 1,
      generation,
      self,
      exports,
      gross,
      opex,
      net,
      cumulative,
      co2: (generation * p.co2KgKwh) / 1000,
    };
  });
  const first = years[0],
    principal = netCost * (1 - p.downPct / 100),
    n = p.loanYears * 12,
    r = p.loanApr / 1200,
    payment =
      principal === 0
        ? 0
        : r === 0
          ? principal / n
          : (principal * r) / (1 - (1 + r) ** -n);
  const monthlyBaseline = (p.annualLoad * p.importPrice) / 12 + p.fixedMonthly;
  const monthlyWithPv =
    (Math.max(0, p.annualLoad - first.self) * p.importPrice -
      first.exports * p.exportPrice) /
      12 +
    p.fixedMonthly;
  const bill = p.billConfirmed
    ? {
        current: p.monthlyBill,
        projected:
          p.billKind === "before"
            ? Math.max(
                Math.min(p.monthlyBill, (p.fixedMonthly * p.billDays) / 30),
                p.monthlyBill -
                  ((first.self * p.importPrice) / 365) * p.billDays,
              )
            : null,
        exportCredit: ((first.exports * p.exportPrice) / 365) * p.billDays,
        loadEstimate: (p.billKwh * 365) / p.billDays,
      }
    : null;
  const loanYears = years.map((y) => ({
    ...y,
    cash: y.net - (y.year <= p.loanYears ? payment * 12 : 0),
  }));
  return {
    area,
    usable,
    panels,
    kwp,
    monthly,
    annual,
    psh,
    cf,
    scores,
    score,
    grossCost,
    grant,
    netCost,
    years,
    payback: payback as number | null,
    npv,
    totalNet,
    profit: cumulative,
    roi: netCost ? (cumulative / netCost) * 100 : null,
    co2Annual: (annual * p.co2KgKwh) / 1000,
    co2Lifetime: (totalPv * p.co2KgKwh) / 1000,
    trees: (annual * p.co2KgKwh) / p.treeKgYear,
    payment,
    principal,
    loanYears,
    loanLifetimeInterest: payment * n - principal,
    monthlyBaseline,
    monthlyWithPv,
    bill,
    climateMode: climate
      ? "NASA climatologie orizontală"
      : "Scenariu lunar editabil · nu extrapolare din replay",
  };
}
export function equity(p: Planning) {
  const burden =
      p.incomeAnnual > 0
        ? ((p.monthlyBill * 12) / p.incomeAnnual) * 100
        : Infinity,
    adoption = p.households > 0 ? (p.installations / p.households) * 100 : 0;
  const components = [
    {
      name: "Venit / acces",
      max: 40,
      value: 40 * clamp(p.incomeAnnual / p.incomeReference, 0, 1),
    },
    {
      name: "Drept de utilizare",
      max: 30,
      value: 30 * (1 - p.rentersPct / 100),
    },
    {
      name: "Povară energetică",
      max: 20,
      value: 20 * (1 - clamp(burden / p.burdenReferencePct, 0, 1)),
    },
    {
      name: "Adopție locală",
      max: 10,
      value: 10 * clamp(adoption / p.adoptionReferencePct, 0, 1),
    },
  ];
  const score = components.reduce((a, c) => a + c.value, 0),
    barriers = [];
  if (p.incomeAnnual < p.incomeReference)
    barriers.push(
      "Venit sub pragul de scenariu; verifică finanțarea accesibilă.",
    );
  if (p.rentersPct > 40)
    barriers.push(
      "Pondere mare de chiriași; clarifică acordul proprietarilor și comunitățile de energie.",
    );
  if (burden >= p.burdenReferencePct)
    barriers.push(
      "Povară energetică ridicată; cere sprijin social/consiliere înaintea unui credit.",
    );
  if (adoption < p.adoptionReferencePct)
    barriers.push(
      "Adopție sub pragul ales; investighează accesul la informare și instalatori.",
    );
  return { score, burden, adoption, components, barriers };
}
function amount(s: string) {
  const clean = s.replace(/[\s\u00a0]/g, "");
  if (!clean.includes(",") && /^\d{1,3}(\.\d{3})+$/.test(clean))
    return Number(clean.replace(/\./g, ""));
  return Number(
    clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean,
  );
}
export function extractBill(text: string) {
  const total = [
    ...text.matchAll(
      /(?:total\s+(?:de\s+)?plat[aă]|sold\s+(?:de\s+)?plat[aă]|amount\s+due)[^\d\n]{0,30}([\d][\d .\u00a0]*[,.]\d{2})(?![\d.,])\s*(?:lei|RON)?/gi,
    ),
  ]
    .map((m) => amount(m[1]))
    .filter((v) => Number.isFinite(v) && v > 0);
  const energy = [...text.matchAll(/([\d]+(?:[.,]\d+)?)\s*kWh\b/gi)]
    .map((m) => amount(m[1]))
    .filter((v) => v > 0);
  return { totals: [...new Set(total)], kwh: [...new Set(energy)] };
}
export function summary(p: Planning, a: ReturnType<typeof analyze>) {
  return `# Raport Solar Studio — ${p.address}\n\nScenariu de planificare, separat de telemetria instalației.\n\n- Coordonate: ${p.latitude}, ${p.longitude}\n- Suprafață proiectată: ${a.area.toFixed(1)} m²; utilizabilă: ${a.usable.toFixed(1)} m²\n- ${a.panels} panouri, ${a.kwp.toFixed(2)} kWp; scor euristic ${a.score.toFixed(0)}/100\n- Producție anuală modelată: ${a.annual.toFixed(0)} kWh; sursă: ${a.climateMode}\n- Investiție netă: ${a.netCost.toFixed(0)} RON; grant introdus: ${a.grant.toFixed(0)} RON, eligibilitate neconfirmată\n- Recuperare: ${a.payback === null ? "nu se recuperează în 25 ani" : a.payback.toFixed(1) + " ani"}; NPV: ${a.npv.toFixed(0)} RON\n- Rezultat 25 ani: ${a.profit.toFixed(0)} RON; CO₂ scenariu: ${a.co2Annual.toFixed(2)} t/an\n\n## Verificări necesare\n\nModel simplificat: iradiere orizontală, orientare/umbrire presupuse, autoconsum fix, fără simulare anuală orară. Factura și eligibilitatea se confirmă separat. Nu reprezintă ofertă, diagnostic CV sau randament garantat.\n\n## Concepte\n\nInspirat de https://github.com/deepanshgandhi/Watts-Up, commit d5849f4682b47855f815efb6ea03470833b012de. Implementare independentă în RON; fără EIA/SUA sau credit fiscal federal.\n`;
}
export function download(name: string, text: string, mime = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type: mime })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
