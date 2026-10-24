import nasaReference from "./nasa-bucharest.json";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sun,
  FileText,
  Users,
  MessagesSquare,
  Download,
  Upload,
  Volume2,
  Square,
  ExternalLink,
  Check,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { Card, Press } from "./Fluid";
import {
  analyze,
  azimuthFactor,
  clamp,
  defaults,
  download,
  equity,
  extractBill,
  MONTHS,
  polygonArea,
  summary,
  tiltFactor,
  validateClimate,
  type Planning,
} from "./solar-planning";
import type { Controls, Data, Imports } from "./model";
import AseRoofWorkshop from "./ase-roof-workshop";

const KEY = "oev-solar-studio-v1";
const fields: Partial<
  Record<keyof Planning, [string, number, number, number?]>
> = {
  area: ["Suprafață planimetrică (m²)", 1, 100000],
  usablePct: ["Suprafață utilizabilă (%)", 0, 100],
  panelW: ["Putere panou (W)", 100, 1000],
  panelArea: ["Suprafață / panou (m²)", 0.5, 5, 0.1],
  orientation: ["Factor orientare / înclinare", 0.1, 1.3, 0.01],
  shadePct: ["Pierdere umbrire (%)", 0, 95],
  soilingPct: ["Pierdere murdărie (%)", 0, 50],
  performanceRatio: [
    "Performance ratio (fără umbrire / murdărie)",
    0.1,
    1,
    0.01,
  ],
  annualLoad: ["Consum anual (kWh)", 0, 10000000],
  selfConsumptionPct: ["Autoconsum din PV (%)", 0, 100],
  importPrice: ["Preț import energie (RON/kWh)", 0, 10, 0.01],
  exportPrice: ["Credit / preț export (RON/kWh)", 0, 10, 0.01],
  fixedMonthly: ["Cost fix lunar (RON)", 0, 10000],
  costPerKwp: ["Investiție brută (RON/kWp)", 0, 50000],
  grant: ["Grant confirmat / scenariu (RON)", 0, 10000000],
  maintenance: ["Mentenanță anuală (RON)", 0, 100000],
  cleaning: ["Curățare anuală (RON)", 0, 100000],
  degradationPct: ["Degradare anuală (%)", 0, 10, 0.1],
  escalationPct: ["Creștere anuală preț energie (%)", -10, 20, 0.1],
  discountPct: ["Rată de actualizare NPV (%)", 0, 30, 0.1],
  co2KgKwh: ["Factor emisii ipotetic (kg CO₂/kWh)", 0, 2, 0.01],
  treeKgYear: ["Absorbție ipotetică / arbore (kg/an)", 1, 100],
  loanApr: ["Dobândă anuală credit (%)", 0, 50, 0.1],
  loanYears: ["Durată credit (ani)", 1, 25],
  downPct: ["Avans (%)", 0, 100],
  ppaPrice: ["Preț PPA ipotetic (RON/kWh)", 0, 10, 0.01],
  monthlyBill: ["Valoare factură (RON)", 0, 100000],
  billKwh: ["Consum din factură (kWh)", 0, 1000000],
  billDays: ["Zile facturate", 1, 366],
  incomeAnnual: ["Venit anual gospodărie (RON)", 0, 10000000],
  rentersPct: ["Chiriași în zonă (%)", 0, 100],
  households: ["Gospodării în zonă", 1, 10000000],
  installations: ["Instalații PV în zonă", 0, 10000000],
  incomeReference: ["Prag venit ales (RON/an)", 1, 10000000],
  adoptionReferencePct: ["Prag adopție ales (%)", 0.1, 100, 0.1],
  burdenReferencePct: ["Prag povară ales (%)", 0.1, 100, 0.1],
};
function load(): Planning {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || "null");
    return sanitize({ ...defaults, climate: nasaReference, ...x });
  } catch {
    return { ...defaults, climate: nasaReference };
  }
}
function sanitize(input: unknown): Planning {
  const p = input as Planning;
  if (!p || typeof p !== "object") throw Error("Profil invalid.");
  const out = { ...defaults, ...p };
  for (const [key, config] of Object.entries(fields)) {
    const v = Number(out[key as keyof Planning]);
    if (!Number.isFinite(v) || v < config[1] || v > config[2])
      throw Error("Valoare invalidă: " + key);
    (out as unknown as Record<string, unknown>)[key] = v;
  }
  if (
    typeof out.address !== "string" ||
    out.address.length > 300 ||
    !Number.isFinite(out.latitude) ||
    out.latitude < 43 ||
    out.latitude > 49 ||
    !Number.isFinite(out.longitude) ||
    out.longitude < 20 ||
    out.longitude > 30
  )
    throw Error("Adresă / coordonate RO invalide.");
  if (
    !Array.isArray(out.monthlyPsh) ||
    out.monthlyPsh.length !== 12 ||
    out.monthlyPsh.some((v) => !Number.isFinite(v) || v <= 0 || v > 12)
  )
    throw Error("Sunt necesare 12 valori lunare valide.");
  if (!Array.isArray(out.polygon)) throw Error("Poligon invalid.");
  if (out.polygon.length >= 3) polygonArea(out.polygon);
  if (out.climate) validateClimate(out.climate, out.latitude, out.longitude);
  return out;
}
const number = (v: number | null, d = 1) =>
  v === null || !Number.isFinite(v)
    ? "—"
    : new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      }).format(v);
const resources = [
  {
    name: "AFM · programe și liste de instalatori validați",
    url: "https://www.afm.ro/",
    text: "Verifică sesiunea, ghidul în vigoare și statutul instalatorului. Grant implicit: 0 RON.",
  },
  {
    name: "ANRE · prosumatori și autorizări",
    url: "https://www.anre.ro/",
    text: "Confirmă regimul contractului și calificările relevante, fără a presupune eligibilitate.",
  },
  {
    name: "APCE · comunități de energie",
    url: "https://asociatiaprosumatorilor.ro/",
    text: "Punct de pornire pentru comunități și experiențe ale prosumatorilor.",
  },
  {
    name: "Fii Prosumator · resurse și comunitate",
    url: "https://fiiprosumator.ro/",
    text: "Resurse de informare. Verifică data fiecărei explicații juridice.",
  },
];
const installers = [
  [
    "Alternative Home Energy",
    "0720 022 934",
    "https://alternative-energy.ro/contact/",
  ],
  [
    "Green Point Solutions",
    "0759 046 556",
    "https://greenpointsolutions.ro/pages/contact",
  ],
  ["Voltech Energy", "021 222 0358", "https://www.voltech.ro/contact/"],
  ["Fotovoltis", "0768 718 474", "https://fotovoltis.ro/contact-fotovoltis/"],
  ["ElectricMark", "0757 337 628", "https://www.electricmark.ro/contact/"],
];
function usePlanningState() {
  const [p, set] = useState<Planning>(load),
    [storage, setStorage] = useState(true),
    [msg, setMsg] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      setStorage(false);
    }
  }, [p]);
  const patch = (v: Partial<Planning>) => set((old) => ({ ...old, ...v }));
  return { p, set, patch, storage, msg, setMsg };
}
function Field({
  p,
  patch,
  k,
}: {
  p: Planning;
  patch: (v: Partial<Planning>) => void;
  k: keyof Planning;
}) {
  const config = fields[k]!;
  return (
    <label className="studio-field">
      <span>{config[0]}</span>
      <input
        type="number"
        step={config[3] || 1}
        min={config[1]}
        max={config[2]}
        value={p[k] as number}
        onChange={(event) =>
          patch({
            [k]: clamp(Number(event.target.value), config[1], config[2]),
            ...(["monthlyBill", "billKwh", "billDays"].includes(k)
              ? { billConfirmed: false }
              : {}),
          })
        }
      />
    </label>
  );
}
function Stat({
  label,
  value,
  unit,
  color = "solar",
}: {
  label: string;
  value: number | null;
  unit: string;
  color?: string;
}) {
  return (
    <div className="studio-stat">
      <small>{label}</small>
      <strong className={color}>
        {number(value)}
        <em>{unit}</em>
      </strong>
    </div>
  );
}
function Notice({
  msg,
  setMsg,
  storage,
}: {
  msg: string;
  setMsg: (v: string) => void;
  storage: boolean;
}) {
  return (
    <>
      {!storage && (
        <div className="notice coral">
          Stocare indisponibilă; exportă profilul înainte de închidere.
        </div>
      )}
      {msg && (
        <div className="notice" role="status">
          {msg}
          <Press className="text-action" onClick={() => setMsg("")}>
            Închide
          </Press>
        </div>
      )}
    </>
  );
}

/** Roof geometry, tilt/azimuth sizing and NASA POWER climatology (Performance tab). */
export function RoofClimatologySection({
  lang,
  annualReplayLoad,
  data,
  controls,
  imports,
  activeSite,
  onSelectSite,
  onDiagnostic,
}: {
  lang: string;
  annualReplayLoad: number;
  data: Data;
  controls: Controls;
  imports: Imports;
  activeSite: string;
  onSelectSite: (id: string) => void;
  onDiagnostic: (id: string) => void;
}) {
  const { p, patch, storage, msg, setMsg } = usePlanningState(),
    [tiltDeg, setTiltDeg] = useState(35),
    [azimuthDeg, setAzimuthDeg] = useState(0);
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  const tuned = useRef(false);
  useEffect(() => {
    if (!tuned.current) {
      tuned.current = true;
      return;
    }
    patch({
      orientation: clamp(
        tiltFactor(tiltDeg) * azimuthFactor(azimuthDeg),
        0.1,
        1.3,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiltDeg, azimuthDeg]);
  const a = useMemo(() => {
    try {
      return analyze(p);
    } catch {
      return analyze({ ...p, polygon: [] });
    }
  }, [p]);
  const field = (k: keyof Planning) => <Field p={p} patch={patch} k={k} />;
  return (
    <div className="studio-section">
      <Notice msg={msg} setMsg={setMsg} storage={storage} />
      <div className="studio-two-col">
        <Card className="rw-card-wrap">
          <div className="card-title">
            <div>
              <span className="eyebrow">
                WATT'S UP WORKFLOW · ASE PIAȚA ROMANĂ
              </span>
              <h2>
                {tr(
                  "Desenează acoperișul pe imaginea satelit.",
                  "Draw the roof on the satellite image.",
                )}
              </h2>
            </div>
            <span className="badge">
              {tr("4 puncte · analiza 1:1", "4 points · 1:1 analysis")}
            </span>
          </div>
          <AseRoofWorkshop
            data={data}
            controls={controls}
            imports={imports}
            lang={lang}
            activeSite={activeSite}
            onSelectSite={onSelectSite}
            onDiagnostic={onDiagnostic}
          />
        </Card>
        <Card>
          <h3>{tr("Geometrie și ipoteze", "Geometry and assumptions")}</h3>
          <div className="studio-fields">
            {field("area")}
            {field("usablePct")}
            {field("panelW")}
            {field("panelArea")}
            {field("shadePct")}
            {field("soilingPct")}
            {field("performanceRatio")}
          </div>
          <div className="divider" />
          <h3>{tr("Înclinare și azimut", "Tilt and azimuth")}</h3>
          <label className="field-label">
            {tr("Înclinare acoperiș", "Roof tilt")} {tiltDeg}°
            <input
              type="range"
              min={0}
              max={90}
              value={tiltDeg}
              onChange={(e) => setTiltDeg(+e.target.value)}
            />
          </label>
          <label className="field-label">
            {tr("Azimut (0° = sud)", "Azimuth (0° = south)")} {azimuthDeg}°
            <input
              type="range"
              min={-180}
              max={180}
              value={azimuthDeg}
              onChange={(e) => setAzimuthDeg(+e.target.value)}
            />
          </label>
          <p className="caption">
            {tr("Factor orientare rezultat", "Resulting orientation factor")}{" "}
            {number(p.orientation, 2)} · {tr("referință", "reference")}: 35° /
            0° = 1,00
          </p>
          <p className="caption">
            {p.polygon.length >= 3
              ? "Poligonul înlocuiește suprafața manuală. Suprafață orizontală, nu aria reală a versantului."
              : "Fără poligon: suprafață introdusă manual."}{" "}
            Nu este segmentare CV. Dispunerea reală, retragerile și structura se
            confirmă de instalator.
          </p>
        </Card>
      </div>
      <Card>
        <div className="studio-stats">
          <Stat label="Capacitate din suprafață" value={a.kwp} unit="kWp" />
          <Stat
            label="Producție anuală modelată"
            value={a.annual}
            unit="kWh/an"
          />
          <Stat
            label="Scor solar euristic"
            value={a.score}
            unit="/100"
            color="battery"
          />
          <Stat
            label="Factor de capacitate"
            value={a.cf * 100}
            unit="%"
            color="cyan"
          />
        </div>
        <div className="card-title">
          <div>
            <span className="eyebrow">12 MONTHS · NO REPLAY EXTRAPOLATION</span>
            <h2>Un an, lună cu lună.</h2>
          </div>
          <Sun className="solar" />
        </div>
        <BarChart values={a.monthly} labels={MONTHS} />
        <p className="caption">
          {a.climateMode} · Panouri: {a.panels} · Suprafață utilizabilă:{" "}
          {number(a.usable)} m². Model simplificat, nu proiect electric.
        </p>
        <details className="studio-details">
          <summary>Editează iradierea lunară de scenariu (kWh/m²/zi)</summary>
          <div className="monthly-inputs">
            {p.monthlyPsh.map((v, i) => (
              <label key={i}>
                {MONTHS[i]}
                <input
                  type="number"
                  min=".1"
                  max="12"
                  step=".1"
                  value={v}
                  onChange={(event) =>
                    patch({
                      monthlyPsh: p.monthlyPsh.map((old, j) =>
                        i === j ? clamp(+event.target.value, 0.1, 12) : old,
                      ),
                      climate: null,
                    })
                  }
                />
              </label>
            ))}
          </div>
        </details>
        <div className="divider" />
        <h3>De unde vine scorul?</h3>
        <p className="caption">
          Euristică de scenariu 0–100, nu scor AI validat.
        </p>
        <div className="score-list">
          {a.scores.map((c) => (
            <div key={c.name}>
              <span>
                {c.name} <small>{c.weight * 100}%</small>
              </span>
              <div className="score-bar">
                <i style={{ width: c.value + "%" }} />
              </div>
              <b>{number(c.value, 0)}</b>
            </div>
          ))}
        </div>
        <div className="divider" />
        <h3>
          <Leaf size={17} className="battery" /> Impact de mediu · ipoteze
        </h3>
        <Stat
          label="CO₂ anual / 25 ani"
          value={a.co2Annual}
          unit="t/an"
          color="battery"
        />
        <p className="muted">
          {number(a.co2Lifetime)} t în 25 ani · {number(a.trees, 0)} arbori
          echivalenți/an (analogie ilustrativă).
        </p>
        <div className="studio-fields">
          {field("co2KgKwh")}
          {field("treeKgYear")}
        </div>
        <p className="caption">
          Factor introdus de utilizator; nu credit de carbon certificat sau
          emisii marginale măsurate.
        </p>
      </Card>
      <p className="caption">
        {tr(
          "Consum de referință din replay pentru scenariu: " +
            Math.round(annualReplayLoad) +
            " kWh/an (extrapolare etichetată, nu măsurătoare anuală).",
          "Reference replay consumption for scenario: " +
            Math.round(annualReplayLoad) +
            " kWh/year (labeled extrapolation, not an annual measurement).",
        )}
      </p>
    </div>
  );
}

/** Appliance load-shifting support and battery sizing simulator (Schedule tab). */
export function BatterySizingSection({
  lang,
  annualReplayLoad,
}: {
  lang: string;
  annualReplayLoad: number;
}) {
  const { p, patch, storage, msg, setMsg } = usePlanningState(),
    [busy, setBusy] = useState(false);
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  const a = useMemo(() => {
    try {
      return analyze(p);
    } catch {
      return analyze({ ...p, polygon: [] });
    }
  }, [p]);
  const field = (k: keyof Planning) => <Field p={p} patch={patch} k={k} />;
  const first = a.years[0],
    batteryKwh = 10,
    eveningNeed = (first.self / 365) * 0.4,
    autonomy = (batteryKwh * 0.7) / Math.max(0.01, eveningNeed);
  return (
    <Card className="battery-sizing">
      <div className="card-title">
        <div>
          <span className="eyebrow">
            LOAD-SHIFTING & BATTERY SIZING · ANNUAL SCENARIO
          </span>
          <h2>
            {tr("Dimensionare în context real.", "Sizing in real context.")}
          </h2>
        </div>
        <span className="badge">
          {tr("Scenariu anual separat", "Separate annual scenario")}
        </span>
      </div>
      <Notice msg={msg} setMsg={setMsg} storage={storage} />
      <div className="studio-stats">
        <Stat
          label={tr("PV anual modelat", "Modeled annual PV")}
          value={a.annual}
          unit="kWh/an"
        />
        <Stat
          label={tr(
            "Autoconsum modelat · an 1",
            "Modeled self-consumption · yr 1",
          )}
          value={first.self}
          unit="kWh/an"
          color="battery"
        />
        <Stat
          label={tr("Export modelat · an 1", "Modeled export · yr 1")}
          value={first.exports}
          unit="kWh/an"
          color="cyan"
        />
        <Stat
          label={tr(
            "Acoperire seră cu BESS 10 kWh",
            "Evening coverage with 10 kWh BESS",
          )}
          value={autonomy}
          unit="×"
          color="load"
        />
      </div>
      <div className="studio-fields">
        {field("annualLoad")}
        {field("selfConsumptionPct")}
      </div>
      <Press
        className="secondary"
        disabled={busy}
        onClick={() => patch({ annualLoad: Math.round(annualReplayLoad) })}
      >
        {tr(
          "Preia consumul din replay ×365 (scenariu etichetat)",
          "Use replay consumption ×365 (labeled scenario)",
        )}
      </Press>
      <p className="caption">
        {tr(
          "Estimare de dimensionare: BESS 10 kWh · 3 kW AC · 95% round-trip. Autonomia de seară presupune 70% lățime utilă și 40% din autoconsum pe intervalul de vârf. Nu comandă echipamentul și nu înlocuiește un studiu de dimensionare.",
          "Sizing estimate: 10 kWh BESS · 3 kW AC · 95% round-trip. Evening autonomy assumes 70% usable width and 40% of self-consumption in the peak window. It does not command equipment and does not replace a sizing study.",
        )}
      </p>
    </Card>
  );
}

/** Bill PDF/OCR extractor, tariff calculator, ROI/NPV/payback, equity, report (Costs tab). */
export function CostsPlanningSection({
  lang,
  annualReplayLoad,
}: {
  lang: string;
  annualReplayLoad: number;
}) {
  const { p, set, patch, storage, msg, setMsg } = usePlanningState(),
    [busy, setBusy] = useState(false),
    [billText, setBillText] = useState(""),
    [extraction, setExtraction] = useState(""),
    [history, setHistory] = useState<
      { name: string; score: number; burden: number }[]
    >(() => {
      try {
        return JSON.parse(localStorage.getItem(KEY + "-areas") || "[]");
      } catch {
        return [];
      }
    });
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  useEffect(() => {
    try {
      localStorage.setItem(KEY + "-areas", JSON.stringify(history));
    } catch {
      /* storage flag handled by usePlanningState */
    }
  }, [history]);
  const a = useMemo(() => {
      try {
        return analyze(p);
      } catch {
        return analyze({ ...p, polygon: [] });
      }
    }, [p]),
    e = useMemo(() => equity(p), [p]);
  const candidates = useMemo(() => extractBill(billText), [billText]);
  const report = summary(p, a);
  const field = (k: keyof Planning) => <Field p={p} patch={patch} k={k} />;
  async function billFile(file: File) {
    setBusy(true);
    setMsg("");
    patch({ billConfirmed: false });
    try {
      if (file.size > 8 * 1024 * 1024) throw Error("Maximum 8 MB.");
      if (/\.(txt|csv)$/i.test(file.name)) {
        setBillText(await file.text());
        setExtraction("Text local · necesită confirmare");
        return;
      }
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        try {
          const pdfjs = await import("./bill-pdf");
          const text = await pdfjs.pdfText(file);
          if (text.trim().length > 30) {
            setBillText(text.slice(0, 50000));
            setExtraction("PDF text · procesat în browser");
            return;
          }
        } catch {
          setExtraction(
            "PDF în browser indisponibil; încercare explicită pe serverul local.",
          );
        }
      }
      const r = await fetch("/api/solar/bill-text", {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
        signal: AbortSignal.timeout(90000),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error || "OCR indisponibil");
      setBillText(result.text);
      setExtraction(result.method + " · localhost, fără upload extern");
    } catch (err) {
      setMsg(String(err) + " · Poți lipi textul sau completa manual.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="studio-section">
      <Notice msg={msg} setMsg={setMsg} storage={storage} />
      <div className="studio-two-col">
        <Card>
          <h2>Fluxuri, nu promisiuni.</h2>
          <CashChart values={a.years.map((y) => y.cumulative)} />
          <p className="caption">
            Recuperarea include mentenanța și curățarea. „—” înseamnă că
            investiția nu este recuperată în interval. Model nominal
            simplificat: fără taxe, finanțare în fluxul cash sau înlocuiri de
            echipamente.
          </p>
          <div className="studio-stats">
            <Stat label="Investiție netă" value={a.netCost} unit="RON" />
            <Stat
              label="Recuperare cu O&M inclus"
              value={a.payback}
              unit="ani"
              color="battery"
            />
            <Stat label="NPV · 25 ani" value={a.npv} unit="RON" color="cyan" />
            <Stat label="ROI · 25 ani" value={a.roi} unit="%" color="load" />
          </div>
          <div className="studio-fields">
            {field("annualLoad")}
            {field("selfConsumptionPct")}
            {field("importPrice")}
            {field("exportPrice")}
            {field("fixedMonthly")}
            {field("costPerKwp")}
            {field("grant")}
            {field("maintenance")}
            {field("cleaning")}
            {field("degradationPct")}
            {field("escalationPct")}
            {field("discountPct")}
          </div>
          <Press
            className="secondary"
            onClick={() => patch({ annualLoad: Math.round(annualReplayLoad) })}
          >
            Preia consumul din replay ×365 (scenariu etichetat)
          </Press>
          <p className="caption">
            Dacă folosești această opțiune, consumul este o extrapolare de
            scenariu, nu consum anual măsurat. PV anual rămâne modelat separat.
          </p>
        </Card>
        <Card>
          <h3>Cash, credit sau PPA?</h3>
          <div className="studio-fields">
            {field("loanApr")}
            {field("loanYears")}
            {field("downPct")}
            {field("ppaPrice")}
          </div>
          <div className="finance-options">
            <div>
              <b>Cash</b>
              <strong>{number(a.netCost, 0)} RON</strong>
              <small>
                Cost inițial · {number(a.years[0].net / 12)} RON/lună beneficiu
                net anualizat
              </small>
            </div>
            <div>
              <b>Credit amortizat</b>
              <strong>{number(a.payment)} RON/lună</strong>
              <small>
                Avans {number(a.netCost - a.principal, 0)} RON · dobândă totală{" "}
                {number(a.loanLifetimeInterest, 0)} RON
              </small>
              <small>
                Flux după rată, anul 1:{" "}
                {number(a.years[0].net / 12 - a.payment)} RON/lună
              </small>
            </div>
            <div>
              <b>PPA · ipoteză simplificată</b>
              <strong>
                {number((a.years[0].self * (p.importPrice - p.ppaPrice)) / 12)}{" "}
                RON/lună
              </strong>
              <small>
                Beneficiu pe autoconsum; fără investiție, fără venit export,
                fără ofertă contractuală reală.
              </small>
            </div>
          </div>
          <h3>Detaliu anual</h3>
          <div className="studio-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>An</th>
                  <th>kWh</th>
                  <th>Net RON</th>
                  <th>Cumulat</th>
                </tr>
              </thead>
              <tbody>
                {a.years.map((y) => (
                  <tr key={y.year}>
                    <td>{y.year}</td>
                    <td>{number(y.generation, 0)}</td>
                    <td>{number(y.net, 0)}</td>
                    <td>{number(y.cumulative, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Press
            className="secondary"
            onClick={() =>
              download(
                "one-energy-investitie-25-ani.csv",
                "an,kwh,beneficiu_brut_ron,operare_ron,net_ron,cumulat_ron\n" +
                  a.years
                    .map((y) =>
                      [
                        y.year,
                        y.generation,
                        y.gross,
                        y.opex,
                        y.net,
                        y.cumulative,
                      ].join(","),
                    )
                    .join("\n"),
                "text/csv",
              )
            }
          >
            Export flux financiar CSV
          </Press>
        </Card>
      </div>
      <div className="studio-two-col">
        <Card>
          <span className="eyebrow">SAVINGS MIRROR · RON</span>
          <h2>Ce spune factura?</h2>
          <p className="muted">
            PDF cu text: procesat în browser. Imagine / PDF scanat: OCR local pe
            server, dacă este disponibil. Nu trimitem facturi către Gemini sau
            alte servicii.
          </p>
          <label className="file-button bill-drop">
            <Upload size={25} />
            Alege factură PDF / PNG / JPEG / TXT
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
              onChange={(event) => {
                const f = event.target.files?.[0];
                if (f) void billFile(f);
                event.target.value = "";
              }}
            />
          </label>
          <p className="caption">
            {extraction ||
              (busy
                ? "Se procesează…"
                : "Poți completa manual fără să încarci o factură.")}
          </p>
          <label className="studio-field">
            <span>Text extras / lipit (verifică înainte de aplicare)</span>
            <textarea
              rows={8}
              value={billText}
              maxLength={50000}
              onChange={(event) => {
                setBillText(event.target.value);
                patch({ billConfirmed: false });
              }}
            />
          </label>
          <div className="bill-candidates">
            {candidates.totals.map((value) => (
              <Press
                key={value}
                className="secondary"
                onClick={() =>
                  patch({ monthlyBill: value, billConfirmed: false })
                }
              >
                Total candidat: {number(value, 2)} RON
              </Press>
            ))}
            {candidates.kwh.slice(0, 6).map((value) => (
              <Press
                key={value}
                className="secondary"
                onClick={() => patch({ billKwh: value, billConfirmed: false })}
              >
                {number(value)} kWh
              </Press>
            ))}
          </div>
          <p className="caption">
            Candidații nu sunt aplicați automat. Suma totală poate conține
            restanțe și penalități. Pentru imagini, OCR folosește engleză și
            poate greși.
          </p>
        </Card>
        <Card>
          <h3>Confirmă datele înainte de comparație</h3>
          <div className="studio-fields">
            {field("monthlyBill")}
            {field("billKwh")}
            {field("billDays")}
          </div>
          <label className="studio-field">
            <span>Tipul facturii</span>
            <select
              value={p.billKind}
              onChange={(event) =>
                patch({
                  billKind: event.target.value as Planning["billKind"],
                  billConfirmed: false,
                })
              }
            >
              <option value="before">
                Factură fără PV / scenariu înainte de instalare
              </option>
              <option value="after">Factură după instalare PV</option>
            </select>
          </label>
          <label className="toggle-row">
            <span>Am verificat suma, kWh și perioada</span>
            <input
              type="checkbox"
              checked={p.billConfirmed}
              onChange={(event) =>
                patch({ billConfirmed: event.target.checked })
              }
            />
          </label>
          {a.bill ? (
            <>
              <div className="bill-comparison">
                <Stat
                  label="Factură introdusă"
                  value={a.bill.current}
                  unit="RON"
                  color="load"
                />
                <Stat
                  label="Factură import · scenariu PV"
                  value={a.bill.projected}
                  unit="RON"
                  color="battery"
                />
              </div>
              <p className="muted">
                Credit export separat: {number(a.bill.exportCredit)} RON /
                perioada facturii (sezonalitate necuprinsă).
              </p>
              <p className="caption">
                {p.billKind === "after"
                  ? "Nu estimăm retroactiv o factură „înainte” dintr-o factură post-PV fără fluxurile măsurate."
                  : "Autoconsumul reduce energia de import; taxele și restanțele nu sunt reconstruite automat. Fără pragul arbitrar 46,8% din proiectul SUA."}
              </p>
              <Press
                className="secondary"
                onClick={() =>
                  patch({ annualLoad: Math.round(a.bill!.loadEstimate) })
                }
              >
                Folosește {number(a.bill.loadEstimate, 0)} kWh/an ca extrapolare
                de consum
              </Press>
            </>
          ) : (
            <div className="notice">
              Comparația este blocată până la confirmarea ta.
            </div>
          )}
          <div className="divider" />
          <p className="caption">
            Modelul anual de planificare nu modifică niciunul dintre cele patru
            registre financiare din ecranul Costuri.
          </p>
        </Card>
      </div>
      <div className="studio-two-col">
        <Card>
          <span className="eyebrow">ENERGY EQUITY & ACCESS · SCENARIO</span>
          <h2>Cine poate avea acces?</h2>
          <div className="big-ratio cyan">
            {number(e.score, 0)}
            <small>/100 · indice de scenariu, fără date INS încărcate</small>
          </div>
          <div className="score-list">
            {e.components.map((c) => (
              <div key={c.name}>
                <span>{c.name}</span>
                <div className="score-bar">
                  <i style={{ width: (c.value / c.max) * 100 + "%" }} />
                </div>
                <b>
                  {number(c.value)} / {c.max}
                </b>
              </div>
            ))}
          </div>
          <p className="caption">
            Scorul nu stabilește eligibilitatea la finanțare, credit sau
            sprijin. Date introduse manual, praguri configurabile, fără import
            Census SUA.
          </p>
          <div className="studio-fields">
            {field("incomeAnnual")}
            {field("rentersPct")}
            {field("households")}
            {field("installations")}
            {field("incomeReference")}
            {field("adoptionReferencePct")}
            {field("burdenReferencePct")}
          </div>
        </Card>
        <Card>
          <h3>Bariere de investigat</h3>
          <p className="muted">
            Povară: {number(e.burden)}% · Adopție: {number(e.adoption)}%
          </p>
          {e.barriers.length ? (
            e.barriers.map((b) => (
              <p key={b} className="notice">
                {b}
              </p>
            ))
          ) : (
            <p className="notice">
              Nicio barieră semnalată de pragurile alese. Nu constituie dovadă
              de acces real.
            </p>
          )}
          <Press
            className="secondary"
            onClick={() =>
              setHistory((old) =>
                [
                  ...old.filter((v) => v.name !== p.address),
                  { name: p.address, score: e.score, burden: e.burden },
                ].slice(-12),
              )
            }
          >
            Adaugă zona în comparație
          </Press>
          <div className="equity-heatmap">
            {history.map((h) => (
              <div
                key={h.name}
                style={{
                  background:
                    h.score < 35
                      ? "#ff453a22"
                      : h.score < 65
                        ? "#ffd60a18"
                        : "#30d15818",
                }}
              >
                <b>{h.name}</b>
                <strong>{number(h.score, 0)}</strong>
                <small>Povară {number(h.burden)}%</small>
              </div>
            ))}
          </div>
          <p className="caption">
            Hartă comparativă de scenarii salvate manual, nu hartă oficială de
            cartiere.
          </p>
          <Press className="text-action" onClick={() => setHistory([])}>
            Golește comparația locală
          </Press>
        </Card>
      </div>
      <Card className="studio-report">
        <div className="card-title">
          <div>
            <span className="eyebrow">A REPORT YOU CAN INSPECT</span>
            <h2>Ipoteze, rezultate și surse.</h2>
          </div>
          <FileText className="cyan" />
        </div>
        <div className="studio-actions">
          <Press
            className="action"
            onClick={() =>
              download("one-energy-solar-report.md", report, "text/markdown")
            }
          >
            <Download size={16} />
            Raport Markdown
          </Press>
          <Press
            className="secondary"
            onClick={() =>
              download(
                "one-energy-solar-profile.json",
                JSON.stringify(
                  {
                    schema: "oev-solar-studio/1",
                    profile: p,
                    analysis: a,
                    equity: e,
                    generated_at: new Date().toISOString(),
                    source: "Independent adaptation of Watts-Up d5849f4",
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            Export profil + rezultate JSON
          </Press>
          <Press className="secondary" onClick={() => window.print()}>
            Tipărește / Salvează PDF
          </Press>
          <label className="file-button">
            <Upload size={14} />
            Import profil JSON
            <input
              type="file"
              accept=".json"
              onChange={async (event) => {
                try {
                  const f = event.target.files?.[0];
                  if (!f) return;
                  if (f.size > 2 * 1024 * 1024)
                    throw Error("Profil maxim 2 MB.");
                  const obj = JSON.parse(await f.text());
                  set(sanitize(obj.profile || obj));
                  setMsg("Profil validat și încărcat local.");
                } catch (err) {
                  setMsg(String(err));
                }
              }}
            />
          </label>
        </div>
        <pre className="report-text">{report}</pre>
        <p className="caption">
          Concepte inspectate la commit{" "}
          <a
            href="https://github.com/deepanshgandhi/Watts-Up/tree/d5849f4682b47855f815efb6ea03470833b012de"
            target="_blank"
            rel="noreferrer"
          >
            d5849f4
          </a>
          . Implementare independentă; repository-ul inspectat nu include o
          licență la rădăcină. Vezi docs/WATTS_UP_FEATURE_AUDIT.md.
        </p>
      </Card>
      <div className="print-report">
        <h1>One Energy View · Solar Studio</h1>
        <pre>{report}</pre>
        <h2>Ipoteze</h2>
        <pre>{JSON.stringify(p, null, 2)}</pre>
      </div>
    </div>
  );
}

/** Romanian diagnostic Q&A bounded to local scenario metrics (Case / Diagnostic tab). */
export function AdvisorSection({ site, lang }: { site: string; lang: string }) {
  const { p, msg, setMsg } = usePlanningState(),
    [aiAvailable, setAiAvailable] = useState(false),
    [busy, setBusy] = useState(false),
    [steps, setSteps] = useState<string[]>([]),
    [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState("");
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  useEffect(() => {
    if (location.protocol !== "file:")
      fetch("/api/solar/capabilities")
        .then((r) => (r.ok ? r.json() : null))
        .then((c) => setAiAvailable(!!c?.external_llm))
        .catch(() => {});
  }, []);
  const a = useMemo(() => {
    try {
      return analyze(p);
    } catch {
      return analyze({ ...p, polygon: [] });
    }
  }, [p]);
  const report = summary(p, a);
  async function runAnalysis() {
    setSteps([]);
    setBusy(true);
    const values = [
      "Geometrie verificată local",
      "Producție lunară calculată din climatologie / scenariu",
      "Flux financiar 25 ani calculat",
      "Surse pentru instalatori și finanțări pregătite",
      "Rezumat determinist pregătit · fără LLM",
    ];
    for (const value of values) {
      await new Promise((resolve) => setTimeout(resolve, 140));
      setSteps((old) => [...old, value]);
    }
    setAnswer(report);
    setBusy(false);
  }
  async function externalAdvice() {
    setBusy(true);
    try {
      const response = await fetch("/api/solar/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          metrics: {
            kwp: a.kwp,
            annual_kwh: a.annual,
            net_cost_ron: a.netCost,
            payback_years: a.payback,
            npv_ron: a.npv,
            self_consumption_pct: p.selfConsumptionPct,
            assumptions: {
              irradiance: a.climateMode,
              shade_pct: p.shadePct,
              import_ron_kwh: p.importPrice,
              export_ron_kwh: p.exportPrice,
            },
          },
        }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setAnswer(
        "AI extern configurat · explicație neverificată · " +
          result.model +
          "\n\n" +
          result.text,
      );
    } catch (err) {
      setMsg(String(err));
    } finally {
      setBusy(false);
    }
  }
  const speak = () => {
    if (!("speechSynthesis" in window)) {
      setMsg("Vocea browserului nu este disponibilă.");
      return;
    }
    window.speechSynthesis.cancel();
    const text = new SpeechSynthesisUtterance(
      `Scenariu pentru ${p.address}. Capacitate ${a.kwp.toFixed(1)} kilowați. Producție estimată ${a.annual.toFixed(0)} kilowați oră pe an. Recuperare ${a.payback === null ? "neatinsă în 25 ani" : a.payback.toFixed(1) + " ani"}. Ipotezele trebuie confirmate.`,
    );
    text.lang = lang === "ro" ? "ro-RO" : "en-GB";
    window.speechSynthesis.speak(text);
  };
  function ask() {
    const q = question.toLowerCase();
    setAnswer(
      /factur|bill/.test(q)
        ? `Factura este ${p.billConfirmed ? "confirmată manual" : "neconfirmată"}. Modelul separă factura de import de creditul de export; nu deduce diagnostice din suma totală.`
        : /grant|finan|afm/.test(q)
          ? "Grantul introdus este " +
            number(a.grant, 0) +
            " RON. Eligibilitatea nu este verificată automat. Deschide AFM și confirmă sesiunea înainte de a-l folosi."
          : /umbr|shade|scor/.test(q)
            ? `Scor euristic ${number(a.score, 0)}/100. Umbrire presupusă ${p.shadePct}%, murdărie ${p.soilingPct}%. Nu am analizat imaginea cu un model CV.`
            : /bater|defect|anom/.test(q)
              ? `Diagnosticul instalației ${site} este în ecranul Diagnostic. Modelul anual este un scenariu separat și nu dovedește o cauză fizică.`
              : report,
    );
  }
  return (
    <Card className="advisor-card">
      <div className="card-title">
        <div>
          <span className="eyebrow">CHECKED PLANNING WORKFLOW · Q&A</span>
          <h2>Întreabă în contextul diagnosticului.</h2>
        </div>
        <MessagesSquare className="cyan" />
      </div>
      <Notice msg={msg} setMsg={setMsg} storage={true} />
      <div className="studio-two-col">
        <div>
          <p className="muted">
            Orchestrare locală deterministă: geometrie → climatologie → economie
            → resurse → rezumat. Nu pretinde apeluri Gemini / Dedalus.
          </p>
          <Press
            className="action"
            disabled={busy}
            onClick={() => void runAnalysis()}
          >
            <Check size={15} />
            Rulează analiza locală
          </Press>
          <ol className="analysis-steps">
            {steps.map((step) => (
              <li key={step}>
                <Check size={14} />
                {step}
              </li>
            ))}
          </ol>
          <label className="studio-field">
            <span>Întreabă despre factură, grant, scor sau baterie</span>
            <input
              value={question}
              maxLength={300}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") ask();
              }}
            />
          </label>
          <Press className="secondary" onClick={ask}>
            Explică datele locale <ArrowRight size={15} />
          </Press>
          <Press
            className="secondary"
            disabled={!aiAvailable || busy}
            onClick={() => void externalAdvice()}
          >
            Explică prin furnizorul AI configurat
          </Press>
          <p className="caption">
            {aiAvailable
              ? "La cerere trimitem întrebarea și ipotezele numerice către furnizorul configurat; nu trimitem factura sau adresa."
              : "AI extern neconfigurat. Explicațiile locale funcționează fără chei."}
          </p>
          {answer && <pre className="local-answer">{answer}</pre>}
          <div className="studio-actions">
            <Press className="secondary" onClick={speak}>
              <Volume2 size={16} />
              Citește rezumatul
            </Press>
            <Press
              className="secondary"
              onClick={() => {
                if ("speechSynthesis" in window)
                  window.speechSynthesis.cancel();
              }}
            >
              <Square size={13} />
              Oprește vocea
            </Press>
          </div>
          <p className="caption">
            Sinteză vocală a browserului; vocea RO depinde de sistem. Nu este
            conversație ElevenLabs și nu folosește microfonul.
          </p>
        </div>
        <div>
          <h3>Instalatori · puncte de contact din cercetarea locală</h3>
          <p className="caption">
            București / Ilfov · surse păstrate în CUSTOMER_DISCOVERY.md.
            Reconfirmă disponibilitatea și autorizările; fără ratinguri
            inventate.
          </p>
          <div className="installer-list">
            {installers.map(([name, phone, url]) => (
              <div key={name}>
                <strong>{name}</strong>
                <a href={"tel:" + phone.replaceAll(" ", "")}>{phone}</a>
                <a href={url} target="_blank" rel="noreferrer">
                  Sursa contactului <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
          <a
            className="secondary"
            target="_blank"
            rel="noreferrer"
            href={
              "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent("instalatori fotovoltaice " + p.address)
            }
          >
            Caută instalatori în localitatea aleasă <ExternalLink size={14} />
          </a>
          <div className="divider" />
          <h3>Finanțare și sprijin · surse de verificat</h3>
          {resources.map((r) => (
            <a
              className="resource-link"
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noreferrer"
            >
              <b>
                {r.name}
                <ExternalLink size={12} />
              </b>
              <small>{r.text}</small>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(1, ...values);
  return (
    <svg
      viewBox="0 0 800 280"
      className="studio-chart"
      role="img"
      aria-label="Producție estimată pe luni în kWh"
    >
      {values.map((v, i) => (
        <g key={i}>
          <rect
            x={25 + i * 64}
            y={220 - (v / max) * 170}
            width="32"
            height={(v / max) * 170}
            rx="6"
            fill="#FFD60A"
            opacity={0.45 + i / 24}
          />
          <text x={41 + i * 64} y={210 - (v / max) * 170} textAnchor="middle">
            {number(v, 0)}
          </text>
          <text x={41 + i * 64} y="250" textAnchor="middle">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
function CashChart({ values }: { values: number[] }) {
  const min = Math.min(0, ...values),
    max = Math.max(1, ...values),
    y = (v: number) => 220 - ((v - min) / (max - min)) * 180;
  return (
    <svg
      viewBox="0 0 800 280"
      className="studio-chart"
      role="img"
      aria-label="Cash flow cumulat 25 ani RON"
    >
      <line x1="20" x2="780" y1={y(0)} y2={y(0)} stroke="#ffffff30" />
      <polyline
        points={values
          .map((v, i) => 20 + (i / 24) * 760 + "," + y(v))
          .join(" ")}
        stroke="#30D158"
        fill="none"
        strokeWidth="3"
      />
      {[0, 4, 9, 14, 19, 24].map((i) => (
        <g key={i}>
          <circle
            cx={20 + (i / 24) * 760}
            cy={y(values[i])}
            r="4"
            fill="#30D158"
          />
          <text x={20 + (i / 24) * 760} y="250" textAnchor="middle">
            An {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
