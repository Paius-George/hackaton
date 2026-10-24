import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Check,
  FileUp,
  LocateFixed,
  MapPin,
  Maximize,
  Minimize,
  Navigation,
  Plus,
  Minus,
  Pencil,
  X,
  Zap,
} from "lucide-react";
import { Press, sheetSpring } from "./Fluid";
import { BUILDINGS, H, STATUS, W, fmt, type SiteSummary } from "./ase-map";
import satelliteImage from "./ase-satellite.png";
import { M, type Controls, type Data, type Imports } from "./model";
import { extractBill } from "./solar-planning";

/**
 * 1:1 replication of the Watt's Up interactive roof-drawing workflow,
 * locked to the ASE Piața Romană satellite viewport. All numbers in the
 * results modal use dashboard.json / nasa-bucharest.json, except the randomized demo score.
 */
const MX = (0.0033 * 111320 * Math.cos((44.448 * Math.PI) / 180)) / W,
  MY = (0.0024 * 111320) / H;
const DEMO_SCORES = [62, 76, 88, 96] as const;
type Pt = { x: number; y: number };
function areaM2(pts: Pt[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i],
      q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return (Math.abs(a) / 2) * MX * MY;
}
const INSTALLERS = [
  ["Alternative Home Energy", "0720 022 934"],
  ["Green Point Solutions", "0759 046 556"],
  ["Voltech Energy", "021 222 0358"],
  ["Fotovoltis", "0768 718 474"],
  ["ElectricMark", "0757 337 628"],
];

export default function AseRoofWorkshop({
  data,
  controls,
  imports,
  lang,
  activeSite,
  onSelectSite,
  onDiagnostic,
}: {
  data: Data;
  controls: Controls;
  imports: Imports;
  lang: string;
  activeSite: string;
  onSelectSite: (id: string) => void;
  onDiagnostic: (id: string) => void;
}) {
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  const reduced = useReducedMotion();
  const target = activeSite;
  const [mode, setMode] = useState<"idle" | "draw" | "done">("idle"),
    [pts, setPts] = useState<Pt[]>([]),
    [score, setScore] = useState<number | null>(null),
    [toast, setToast] = useState<string | null>(null),
    [analyzing, setAnalyzing] = useState(false),
    [modal, setModal] = useState(false),
    [tab, setTab] = useState("analysis"),
    [billText, setBillText] = useState(""),
    [billMethod, setBillMethod] = useState(""),
    [billConfirmed, setBillConfirmed] = useState(false),
    [bill, setBill] = useState<number | null>(null),
    [msg, setMsg] = useState(""),
    [zoom, setZoom] = useState(1),
    [fullscreen, setFullscreen] = useState(false),
    [locating, setLocating] = useState(false),
    [location, setLocation] = useState<{
      latitude: number;
      longitude: number;
      accuracy: number;
    } | null>(null),
    [locationError, setLocationError] = useState(""),
    viewport = useRef<HTMLDivElement>(null),
    svg = useRef<SVGSVGElement>(null),
    dialog = useRef<HTMLDivElement>(null),
    analysisTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(analysisTimer.current), []);
  useEffect(() => {
    if (!modal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setModal(false);
      if (e.key !== "Tab") return;
      const items = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]',
      );
      if (!items?.length) {
        e.preventDefault();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialog.current)
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [modal]);
  const building = BUILDINGS.find((b) => b.id === target)!;
  const site = data.sites.find((s) => s.site_id === target) as unknown as
      SiteSummary | undefined,
    contract = (data.sources?.retail_contract || {}) as Record<string, string>,
    day14 = site?.days?.[13],
    expected = day14?.expected_kwh ?? null,
    actual = day14?.actual_kwh ?? null,
    divergence = site?.last_7d_divergence,
    shortfall =
      site?.pv_shortfall_value_last_7d_ron != null
        ? Number(site.pv_shortfall_value_last_7d_ron)
        : null,
    dispatch =
      site?.dispatch_opportunity_last_7d_ron != null
        ? Number(site.dispatch_opportunity_last_7d_ron)
        : null,
    fault = site?.fault_signature || "",
    kwp = controls.commercial ? 250 : 6,
    panels = controls.commercial ? 555 : 15,
    importPrice = Number(contract.import_ron_kwh ?? 1.3),
    activePrice = Number(contract.active_energy_ron_kwh ?? 0.6),
    pzu = Number(contract.monthly_weighted_pzu_ron_mwh ?? 500);
  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === viewport.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === viewport.current)
        await document.exitFullscreen();
      else if (viewport.current?.requestFullscreen)
        await viewport.current.requestFullscreen();
      else
        setMsg(
          tr(
            "Ecranul complet nu este disponibil în acest browser.",
            "Fullscreen is unavailable in this browser.",
          ),
        );
    } catch {
      setMsg(
        tr(
          "Ecranul complet nu este disponibil în acest browser.",
          "Fullscreen is unavailable in this browser.",
        ),
      );
    }
  };
  const viewWidth = W / zoom,
    viewHeight = H / zoom;
  const viewX = (W - viewWidth) / 2,
    viewY = (H - viewHeight) / 2;
  const area = pts.length === 4 ? areaM2(pts) : null;
  const candidates = useMemo(() => extractBill(billText), [billText]);
  const siteState = useMemo(() => {
    const ds = M.daily(M.rowsFor(data, target, controls, imports));
    return {
      persistence: M.persistence(ds, -12),
      residual: ds.at(-1)?.residual ?? null,
    };
  }, [data, target, controls, imports]);
  const eventPoint = (e: React.MouseEvent<SVGSVGElement>): Pt => {
    const r = svg.current!.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(W, viewX + ((e.clientX - r.left) / r.width) * viewWidth),
      ),
      y: Math.max(
        0,
        Math.min(H, viewY + ((e.clientY - r.top) / r.height) * viewHeight),
      ),
    };
  };
  const importLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(
        tr(
          "Localizarea nu este disponibilă în acest browser.",
          "Location is unavailable in this browser.",
        ),
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === 1
            ? tr(
                "Accesul la locație a fost refuzat. Permite localizarea în browser și încearcă din nou.",
                "Location access was denied. Allow location in your browser and try again.",
              )
            : error.code === 3
              ? tr(
                  "Localizarea a durat prea mult. Încearcă din nou.",
                  "Location timed out. Please try again.",
                )
              : tr(
                  "Locația nu a putut fi determinată. Încearcă din nou.",
                  "Your location could not be determined. Please try again.",
                ),
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };
  const startDraw = () => {
    window.clearTimeout(analysisTimer.current);
    setAnalyzing(false);
    setScore(null);
    setPts([]);
    setMode("draw");
    setToast(
      tr(
        "Mod desen activat — apasă 4 colțuri ale acoperișului",
        "Drawing mode activated — Click 4 corners of the roof to outline it",
      ),
    );
  };
  const redraw = () => {
    window.clearTimeout(analysisTimer.current);
    setAnalyzing(false);
    setScore(null);
    setPts([]);
    setModal(false);
    setMode("draw");
    setToast(
      tr(
        "Mod desen activat — apasă 4 colțuri ale acoperișului",
        "Drawing mode activated — Click 4 corners of the roof to outline it",
      ),
    );
  };
  const onCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "draw") return;
    const p = eventPoint(e),
      next = [...pts, p];
    setPts(next);
    if (next.length >= 4) {
      setScore(DEMO_SCORES[Math.floor(Math.random() * DEMO_SCORES.length)]);
      setMode("done");
      setToast(
        tr(
          "Contur complet! Arie: " + fmt(areaM2(next), 0) + " m²",
          "Roof outline complete! Area: " + fmt(areaM2(next), 0) + " m²",
        ),
      );
    }
  };
  const analyze = async () => {
    if (pts.length !== 4 || analyzing) return;
    if (document.fullscreenElement === viewport.current) {
      try {
        await document.exitFullscreen();
      } catch {
        setMsg(
          tr(
            "Ieși din ecran complet pentru a vedea rezultatele.",
            "Exit fullscreen to view the results.",
          ),
        );
        return;
      }
    }
    setAnalyzing(true);
    setToast(
      tr(
        "Se analizează cu poligonul desenat…",
        "Analyzing with user-drawn polygon...",
      ),
    );
    analysisTimer.current = window.setTimeout(() => {
      setAnalyzing(false);
      setToast(null);
      setTab("analysis");
      setModal(true);
    }, 600);
  };
  async function billFile(file: File) {
    setMsg("");
    setBillConfirmed(false);
    try {
      if (file.size > 8 * 1024 * 1024) throw Error("Maximum 8 MB.");
      if (/\.(txt|csv)$/i.test(file.name)) {
        setBillText(await file.text());
        setBillMethod(tr("Text local", "Local text"));
        return;
      }
      if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
        try {
          const pdfjs = await import("./bill-pdf");
          const text = await pdfjs.pdfText(file);
          if (text.trim().length > 30) {
            setBillText(text.slice(0, 50000));
            setBillMethod(tr("PDF text · în browser", "PDF text · in browser"));
            return;
          }
        } catch {
          /* fall through to server OCR */
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
      setBillMethod(result.method + " · localhost");
    } catch (err) {
      setMsg(String(err));
    }
  }
  const dailySelf = (actual ?? expected ?? 0) * 0.55,
    monthlySave = bill
      ? Math.min(bill * 0.85, dailySelf * importPrice * 30)
      : 0,
    after = bill ? bill - monthlySave : null,
    annual = bill ? monthlySave * 12 : null,
    co2T = expected ? (expected * 365 * 0.2) / 1000 : null,
    trees = expected ? (expected * 365 * 0.2) / 22 : null,
    annualScenario =
      shortfall !== null && dispatch !== null
        ? ((shortfall + dispatch) / 7) * 365
        : null;
  const scoreLabel =
    score === null
      ? ""
      : score >= 90
        ? tr("Potential excepțional", "Exceptional potential")
        : score >= 85
          ? tr("Potential puternic", "Strong potential")
          : score >= 70
            ? tr("Potențial bun", "Good potential")
            : tr("Potențial moderat", "Moderate potential");
  return (
    <div className="roof-workshop">
      <div className="rw-viewport" ref={viewport}>
        <div className="rw-map-place">
          <MapPin size={18} />
          <div>
            <b>ASE Piața Romană</b>
            <span>{tr("București, România", "Bucharest, Romania")}</span>
          </div>
        </div>
        <div className="rw-map-top-controls">
          <button
            type="button"
            className="rw-map-button rw-map-compass"
            onClick={() => setZoom(1)}
            aria-label={tr(
              "Nord sus · resetează vederea",
              "North up · reset view",
            )}
            title={tr("Resetează vederea", "Reset view")}
          >
            <Navigation size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            className="rw-map-button"
            onClick={toggleFullscreen}
            aria-label={
              fullscreen
                ? tr("Ieși din ecran complet", "Exit fullscreen")
                : tr("Ecran complet", "Fullscreen")
            }
            title={tr("Ecran complet", "Fullscreen")}
          >
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
        <div
          className="rw-map-zoom"
          role="group"
          aria-label={tr("Zoom hartă", "Map zoom")}
        >
          <button
            type="button"
            className="rw-map-button"
            aria-label={tr("Mărește", "Zoom in")}
            disabled={zoom >= 4}
            onClick={() => setZoom((z) => Math.min(4, z * 1.5))}
          >
            <Plus size={22} />
          </button>
          <button
            type="button"
            className="rw-map-button"
            aria-label={tr("Micșorează", "Zoom out")}
            disabled={zoom <= 1}
            onClick={() => setZoom((z) => Math.max(1, z / 1.5))}
          >
            <Minus size={22} />
          </button>
        </div>
        <div className="rw-map-attribution">
          <span>
            {tr("Satelit · Imagine importată", "Satellite · Imported image")}
          </span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <svg
          ref={svg}
          viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="none"
          className={
            "ase-canvas rw-canvas" + (mode === "draw" ? " drawing" : "")
          }
          role="img"
          aria-label={tr(
            "Imagine satelit ASE Piața Romană cu desenare acoperiș",
            "ASE Piața Romană satellite image with roof drawing",
          )}
          onClick={onCanvasClick}
        >
          <image
            href={satelliteImage}
            x="0"
            y="0"
            width={W}
            height={H}
            preserveAspectRatio="none"
          />
          {pts.length > 1 && (
            <polyline
              points={pts.map((p) => p.x + "," + p.y).join(" ")}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          )}
          {pts.length === 4 && (
            <polygon
              points={pts.map((p) => p.x + "," + p.y).join(" ")}
              fill="rgba(245, 158, 11, 0.35)"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          )}
          {pts.map((p, i) => (
            <g key={i} pointerEvents="none">
              <circle
                cx={p.x}
                cy={p.y}
                r="7"
                fill="#F59E0B"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="rw-pt-num"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        {createPortal(
          <AnimatePresence>
            {modal && (
              <div className="rw-modal-layer">
                <motion.div
                  className="rw-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setModal(false)}
                  aria-hidden="true"
                />
                <motion.div
                  ref={dialog}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                  aria-label={tr(
                    "Rezultate analiza solară",
                    "Solar analysis results",
                  )}
                  className="rw-modal"
                  initial={{
                    opacity: 0,
                    scale: reduced ? 1 : 0.88,
                    y: reduced ? 0 : 26,
                    filter: reduced ? "blur(0px)" : "blur(10px)",
                  }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    scale: reduced ? 1 : 0.94,
                    y: reduced ? 0 : 18,
                  }}
                  transition={reduced ? { duration: 0.15 } : sheetSpring}
                >
                  <div className="rw-banner">
                    <div>
                      <span className="eyebrow">WATT'S UP WORKFLOW</span>
                      <h3>SOLAR ANALYSIS RESULTS</h3>
                      <small>
                        {building.name} · {building.sub}
                      </small>
                    </div>
                    <Press
                      className="icon-button"
                      onClick={() => setModal(false)}
                      label={tr("Închide", "Close")}
                    >
                      <X size={19} />
                    </Press>
                  </div>
                  <div className="rw-pills">
                    <span className="rw-pill blue">USER-DEFINED LAYOUT</span>
                    <span className="rw-pill amber">4 ROOF PTS</span>
                    <span className="rw-pill demo">SIMULATED DEMO SAMPLE</span>
                  </div>
                  <div className="rw-score-row">
                    <div className="rw-score-card">
                      <small>{tr("SCOR SOLAR", "SOLAR SCORE")}</small>
                      <strong>
                        {score ?? "—"}
                        <em>/100</em>
                      </strong>
                      <b>{scoreLabel}</b>
                    </div>
                    <div className="rw-confidence">
                      <span>
                        {tr(
                          "Scor demonstrativ ales aleatoriu la finalizarea desenului.",
                          "Demo score randomly assigned when the drawing is completed.",
                        )}
                      </span>
                      <div className="rw-confidence-bar">
                        <i style={{ width: `${score ?? 0}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="rw-snapshot">
                    <div>
                      <span>{tr("Putere sistem", "System size")}</span>
                      <b>
                        {fmt(kwp, 1)} <em>kWp</em>
                      </b>
                    </div>
                    <div>
                      <span>{tr("Producție zilnică", "Daily output")}</span>
                      <b>
                        {fmt(expected, 2)} <em>kWh</em>
                        <small className="muted">
                          {" "}
                          · {tr("observat", "actual")} {fmt(actual, 2)}
                        </small>
                      </b>
                    </div>
                    <div>
                      <span>{tr("Acoperiș utilizabil", "Usable roof")}</span>
                      <b>
                        {fmt(area, 0)} <em>m²</em>
                      </b>
                    </div>
                    <div>
                      <span>{tr("Panouri maxime", "Max panels")}</span>
                      <b>
                        {panels} <em>≈400–450 W</em>
                      </b>
                    </div>
                  </div>
                  <div
                    className="rw-subtabs"
                    role="tablist"
                    aria-label={tr("Sectiuni", "Sections")}
                  >
                    {(
                      [
                        ["analysis", tr("Analiză", "Analysis")],
                        [
                          "grid",
                          tr("O&M și Impact Rețea", "O&M & Grid Impact"),
                        ],
                        ["steps", tr("Următorii pași", "Next Steps")],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={tab === id}
                        className={tab === id ? "selected" : ""}
                        onClick={() => setTab(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {tab === "analysis" && (
                    <div className="rw-tab">
                      <div className="rw-narrative">
                        <span className="eyebrow">
                          {tr(
                            "REZUMAT · REGULI LOCALE, FĂRĂ LLM LIVE",
                            "SUMMARY · LOCAL RULES, NO LIVE LLM",
                          )}
                        </span>
                        <p>
                          {tr(
                            `Sit ${target} · ${building.name}. În Ziua 14, ${fmt(actual, 2)} kWh observați din ${fmt(expected, 2)} kWh așteptați (PVGIS JRC geometry-matched). Divergență 7 zile ${divergence === undefined ? "—" : fmt(-divergence, 1) + "%"}; expunere subproducție ${fmt(shortfall, 2)} RON; oportunitate dispatch baterie ${fmt(dispatch, 2)} RON. ` +
                              (fault ===
                              "possible_dispatch_mistiming_injected_scenario"
                                ? "Semnătură: mistiming dispatch — compară programul observat cu alternativa cu același SoC final."
                                : "Semnătură: subperformanță persistentă — verifică umbrirea, limitele de export și murdăria înainte de o deplasare."),
                            `Site ${target} · ${building.name}. On Day 14, ${fmt(actual, 2)} kWh observed from ${fmt(expected, 2)} kWh expected (PVGIS JRC geometry-matched). 7-day divergence ${divergence === undefined ? "—" : fmt(-divergence, 1) + "%"}; PV shortfall exposure ${fmt(shortfall, 2)} RON; battery dispatch opportunity ${fmt(dispatch, 2)} RON. ` +
                              (fault ===
                              "possible_dispatch_mistiming_injected_scenario"
                                ? "Signature: dispatch mistiming — compare observed dispatch with the same-terminal-SoC alternative."
                                : "Signature: persistent underperformance — review shading, export limits and soiling before a field visit."),
                          )}
                        </p>
                      </div>
                      <div className="rw-kpis">
                        <div className="solar">
                          <span>SOLAR PANELS</span>
                          <b>{panels}</b>
                        </div>
                        <div className="cyan">
                          <span>SYSTEM SIZE</span>
                          <b>
                            {fmt(kwp, 1)}
                            <em> kWp</em>
                          </b>
                        </div>
                        <div className="blue">
                          <span>EXPECTED vs ACTUAL (14d)</span>
                          <b>
                            {fmt(expected, 2)}
                            <em> vs {fmt(actual, 2)} kWh</em>
                          </b>
                        </div>
                        <div className="amber">
                          <span>SOLAR SCORE</span>
                          <b>
                            {score ?? "—"}
                            <em>/100</em>
                          </b>
                        </div>
                      </div>
                      <div className="rw-two">
                        <div className="rw-card">
                          <h4>
                            {tr("Outlook financiar", "Financial outlook")}
                          </h4>
                          <div className="rw-terms">
                            <span>
                              {tr("Import", "Import")}{" "}
                              <b>{fmt(importPrice, 2)} RON/kWh</b>
                            </span>
                            <span>
                              {tr("Energie activă", "Active energy")}{" "}
                              <b>{fmt(activePrice, 2)} RON/kWh</b>
                            </span>
                            <span>
                              PZU <b>{fmt(pzu, 0)} RON/MWh</b>
                            </span>
                            <span className="wide caption">
                              Legea 160/2026 ·{" "}
                              {controls.commercial
                                ? tr(
                                    "decontare PZU mediu ponderat lunar",
                                    "monthly weighted PZU settlement",
                                  )
                                : tr(
                                    "compensare cantitativă",
                                    "quantitative compensation",
                                  )}
                            </span>
                          </div>
                          <p className="muted">
                            {tr(
                              "Valoare anualizată de scenariu (subproducție + dispatch, din dashboard.json):",
                              "Annualized scenario value (shortfall + dispatch, from dashboard.json):",
                            )}{" "}
                            <b>{fmt(annualScenario, 0)} RON</b>
                          </p>
                        </div>
                        <div className="rw-card">
                          <h4>
                            {tr("Impact de mediu", "Environmental impact")}
                          </h4>
                          <div className="rw-terms">
                            <span>
                              CO₂ {tr("evitat", "offset")}{" "}
                              <b>{fmt(co2T, 2)} t/an</b>
                            </span>
                            <span>
                              {tr("Arbori echivalenți", "Tree equivalent")}{" "}
                              <b>{fmt(trees, 0)}/an</b>
                            </span>
                            <span className="wide caption">
                              {tr(
                                "Factor ipotetic 0,2 kg CO₂/kWh · 22 kg/arbore. Nu credit de carbon certificat.",
                                "Hypothetical factor 0.2 kg CO₂/kWh · 22 kg/tree. Not certified carbon credit.",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="rw-bill">
                        <h4>
                          {tr("Compară cu factura ta", "Compare your bill")}
                        </h4>
                        <label className="file-button">
                          <FileUp size={15} />
                          {tr(
                            "Factură PDF / PNG / TXT",
                            "PDF / PNG / TXT bill",
                          )}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void billFile(f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <p className="caption">
                          {billMethod ||
                            tr(
                              "PDF cu text: procesat în browser. Scanat: OCR local pe server.",
                              "Text PDF: processed in browser. Scanned: local server OCR.",
                            )}
                        </p>
                        {candidates.totals.length > 0 && (
                          <div className="rw-bill-candidates">
                            {candidates.totals.map((v) => (
                              <Press
                                key={v}
                                className="secondary"
                                onClick={() => setBill(v)}
                              >
                                {tr("Total candidat", "Candidate total")}:{" "}
                                {fmt(v, 2)} RON
                              </Press>
                            ))}
                          </div>
                        )}
                        <label className="toggle-row">
                          <span>
                            {tr(
                              "Am verificat suma facturii",
                              "I verified the bill amount",
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={billConfirmed}
                            disabled={bill === null}
                            onChange={(e) => setBillConfirmed(e.target.checked)}
                          />
                        </label>
                        {bill !== null && billConfirmed ? (
                          <div className="rw-bill-compare">
                            <div>
                              <span>
                                {tr("FACTURA CURENTĂ", "CURRENT BILL")}
                              </span>
                              <b>{fmt(bill, 2)} RON</b>
                            </div>
                            <div>
                              <span>
                                {tr("DUPĂ SOLAR + BESS", "AFTER SOLAR + BESS")}
                              </span>
                              <b className="battery">{fmt(after!, 2)} RON</b>
                            </div>
                            <div>
                              <span>
                                {tr("ECONOMII ANUALE", "ANNUAL SAVINGS")}
                              </span>
                              <b className="solar">{fmt(annual!, 0)} RON</b>
                            </div>
                          </div>
                        ) : (
                          <p className="caption">
                            {tr(
                              "Comparația se activează după alegerea totalului și confirmarea ta. Scenariu: 55% autoconsum × preț import; taxe și restanțe nu sunt reconstruite.",
                              "Comparison unlocks after choosing a total and confirming. Scenario: 55% self-consumption × import price; taxes and arrears are not reconstructed.",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {tab === "grid" && (
                    <div className="rw-tab">
                      <div className="rw-card">
                        <h4>{tr("Semnătură O&M", "O&M signature")}</h4>
                        <span className="badge coral">
                          {STATUS[fault]?.[lang === "ro" ? 0 : 1] ?? fault}
                        </span>
                        <code className="rw-fault">{fault}</code>
                        <p className="muted">
                          {tr(
                            `Replay istoric · ${siteState.persistence} zile consecutive sub pragul −12% · ultima abatere ${siteState.residual === null ? "—" : fmt(siteState.residual * 100, 1) + "%"}. Candidat, nu cauză fizică demonstrată.`,
                            `Historical replay · ${siteState.persistence} consecutive days below the −12% threshold · last residual ${siteState.residual === null ? "—" : fmt(siteState.residual * 100, 1) + "%"}. A candidate, not a proven physical cause.`,
                          )}
                        </p>
                      </div>
                      <div className="rw-card">
                        <h4>
                          {tr(
                            "Stare microgrid Piața Romană",
                            "Piața Romană microgrid status",
                          )}
                        </h4>
                        <div className="rw-microgrid">
                          {["A", "B", "C"].map((id) => {
                            const s = data.sites.find(
                              (x) => x.site_id === id,
                            ) as unknown as SiteSummary | undefined;
                            return (
                              <div
                                key={id}
                                className={id === target ? "selected" : ""}
                              >
                                <b>
                                  Sit {id} ·{" "}
                                  {
                                    BUILDINGS.find(
                                      (x) => x.id === id,
                                    )!.brand.split(" ")[0]
                                  }
                                </b>
                                <span className="badge coral">
                                  {STATUS[s?.fault_signature || ""]?.[
                                    lang === "ro" ? 0 : 1
                                  ] ?? s?.fault_signature}
                                </span>
                                <small>
                                  {fmt(
                                    s?.pv_shortfall_value_last_7d_ron != null
                                      ? Number(s.pv_shortfall_value_last_7d_ron)
                                      : null,
                                    2,
                                  )}{" "}
                                  RON ·{" "}
                                  {fmt(
                                    s?.dispatch_opportunity_last_7d_ron != null
                                      ? Number(
                                          s.dispatch_opportunity_last_7d_ron,
                                        )
                                      : null,
                                    2,
                                  )}{" "}
                                  RON dispatch
                                </small>
                              </div>
                            );
                          })}
                        </div>
                        <p className="caption">
                          {tr(
                            "Toate valorile din dashboard.json · replay istoric, nu telemetrie live.",
                            "All values from dashboard.json · historical replay, not live telemetry.",
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {tab === "steps" && (
                    <div className="rw-tab">
                      <div className="rw-card">
                        <h4>
                          {tr(
                            "Instalatori locali verificați",
                            "Verified local installers",
                          )}
                        </h4>
                        <table className="rw-table">
                          <thead>
                            <tr>
                              <th>{tr("Firmă", "Company")}</th>
                              <th>{tr("Telefon", "Phone")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {INSTALLERS.map(([name, phone]) => (
                              <tr key={name}>
                                <td>{name}</td>
                                <td>{phone}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="caption">
                          {tr(
                            "București / Ilfov · reconfirmă disponibilitatea și autorizările.",
                            "Bucharest / Ilfov · reconfirm availability and authorizations.",
                          )}
                        </p>
                      </div>
                      <div className="rw-card">
                        <h4>
                          {tr(
                            "Incentive și reguli de facturare",
                            "Incentives & billing rules",
                          )}
                        </h4>
                        <table className="rw-table">
                          <thead>
                            <tr>
                              <th>{tr("Program", "Program")}</th>
                              <th>{tr("Regulă", "Rule")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Legea 160/2026 · ≤200 kW</td>
                              <td>
                                {tr(
                                  "Compensare cantitativă · import 1,30 RON/kWh · activ 0,60 RON/kWh",
                                  "Quantity compensation · import 1.30 RON/kWh · active 0.60 RON/kWh",
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Legea 160/2026 · 200–400 kW</td>
                              <td>
                                {tr(
                                  "Decontare PZU mediu ponderat lunar · 500 RON/MWh",
                                  "Monthly weighted PZU settlement · 500 RON/MWh",
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>Casa Verde Fotovoltaice</td>
                              <td>
                                {tr(
                                  "Grant AFM · eligibilitatea se confirmă în sesiunea în vigoare",
                                  "AFM grant · eligibility confirmed in the current session",
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td>
                                {tr(
                                  "Fondul pentru Modernizare",
                                  "Modernization Fund",
                                )}
                              </td>
                              <td>
                                {tr(
                                  "Sprijin pentru eficiență energetică · verifică apelul activ",
                                  "Energy-efficiency support · check the active call",
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="caption">
                          {tr(
                            "Reguli de brief; implementarea ANRE nevalidată. Nu consultanță juridică.",
                            "Brief policy; ANRE implementation unverified. Not legal advice.",
                          )}
                        </p>
                      </div>
                      <Press
                        className="rw-cta"
                        onClick={() => {
                          onSelectSite(target);
                          onDiagnostic(target);
                          setModal(false);
                        }}
                      >
                        <Check size={16} />
                        {tr(
                          "Selectează în Dashboard / Creează Ticket O&M",
                          "Select in Dashboard / Create O&M Ticket",
                        )}
                      </Press>
                    </div>
                  )}
                  {activeSite === target && (
                    <p className="caption rw-active-note">
                      {tr(
                        `Sit ${target} este clădirea activă în Dashboard.`,
                        `Site ${target} is the active Dashboard building.`,
                      )}
                    </p>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>
      <div className="rw-status-area">
        {mode === "draw" && (
          <div className="rw-center-pill" aria-live="polite">
            <span className="rw-dots">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} className={i < pts.length ? "on" : ""} />
              ))}
            </span>
            {pts.length}/4 {tr("puncte selectate", "points selected")}
          </div>
        )}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              className={"rw-toast" + (analyzing ? " analyzing" : "")}
              initial={{ opacity: 0, y: reduced ? 0 : -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0.15 } : sheetSpring}
              role="status"
            >
              {analyzing &&
                (!reduced ? (
                  <motion.span
                    className="rw-spinner"
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.9,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <span className="rw-spinner static">…</span>
                ))}
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        {msg && (
          <div className="notice coral rw-msg" role="status">
            {msg}
          </div>
        )}
      </div>
      <div className="rw-location">
        <div className="rw-draw-actions">
          {mode !== "done" ? (
            <Press className="rw-btn draw" onClick={startDraw}>
              <Pencil size={15} /> {tr("Trasează Acoperișul", "Draw Roof")}
            </Press>
          ) : (
            <>
              <Press
                className="rw-btn analyze"
                disabled={analyzing}
                onClick={analyze}
              >
                <Zap size={15} />{" "}
                {tr("Analizează Acoperișul", "Analyze Drawn Roof")}
              </Press>
              <Press className="rw-btn ghost" onClick={redraw}>
                {tr("Redraw", "Redraw")}
              </Press>
            </>
          )}
        </div>

        <Press
          className="rw-btn ghost"
          onClick={importLocation}
          disabled={locating}
        >
          <LocateFixed size={16} />
          {locating
            ? tr("Se importă locația…", "Importing location…")
            : tr("Importă din locația mea", "Import from my location")}
        </Press>
        <div role="status" aria-live="polite">
          {location && (
            <p className="caption">
              {tr("Locație importată", "Location imported")}:{" "}
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} ·
              ±{Math.round(location.accuracy)} m
              <br />
              {tr(
                "Imaginea afișată rămâne ASE Piața Romană.",
                "The displayed image remains ASE Piața Romană.",
              )}
            </p>
          )}
          {locationError && <p className="caption coral">{locationError}</p>}
        </div>
      </div>
      <p className="caption">
        {tr(
          "Flux 1:1 din demo-ul Watt's Up: căutare → 4 colțuri → analiză → rezultate. Aria provine din poligonul desenat pe imaginea ASE. Scorul este demonstrativ, ales aleatoriu; datele energetice provin din dashboard.json.",
          "1:1 flow from the Watt's Up demo: search → 4 corners → analyze → results. Area comes from the polygon drawn on the ASE image. The demo score is random; energy data comes from dashboard.json.",
        )}
      </p>
    </div>
  );
}
