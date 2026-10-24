import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { MapPin, X } from "lucide-react";
import { Press, sheetSpring } from "./Fluid";
import { M, type Controls, type Data, type Imports } from "./model";
import nasaReference from "./nasa-bucharest.json";

/**
 * Offline, bounded satellite viewport of the ASE Piața Romană block.
 * Bounding box: 44.4468°N–44.4492°N, 26.0955°E–26.0988°E (Bucharest).
 * The canvas is a stylized high-contrast satellite rendering bundled in the
 * single-file build: no map SDK, no API key, no network requests.
 */
export const BBOX = {
    south: 44.4468,
    north: 44.4492,
    west: 26.0955,
    east: 26.0988,
  },
  W = 1000,
  H = 640,
  x = (lon: number) => ((lon - BBOX.west) / (BBOX.east - BBOX.west)) * W,
  y = (lat: number) => ((BBOX.north - lat) / (BBOX.north - BBOX.south)) * H;

export type Building = {
  id: string;
  name: string;
  sub: string;
  brand: string;
  color: string;
  lat: number;
  lon: number;
  roof: string;
  statusKey: string;
  place: "right" | "left" | "center";
};
export const BUILDINGS: Building[] = [
  {
    id: "B",
    name: "ASE Facultatea de Marketing",
    sub: "Clădirea 6 · colțul NV al campusului",
    brand: "Deye SUN-10K",
    color: "#0A84FF",
    lat: 44.4486,
    lon: 26.0962,
    roof: "168,124 266,112 280,184 182,198",
    statusKey: "possible_dispatch_mistiming_injected_scenario",
    place: "right",
  },
  {
    id: "C",
    name: "Clădirea Virgil Madgearu",
    sub: "Facultatea de Cibernetică · Calea Dorobanți 15-17",
    brand: "Fronius Symo",
    color: "#30D158",
    lat: 44.4479,
    lon: 26.0978,
    roof: "646,314 754,302 770,378 662,392",
    statusKey: "persistent_underperformance_candidate",
    place: "left",
  },
  {
    id: "A",
    name: "Academia de Studii Economice",
    sub: "Clădirea Ion N. Angelescu · Piața Romană 6",
    brand: "Huawei SUN2000",
    color: "#FF453A",
    lat: 44.4475,
    lon: 26.0969,
    roof: "368,414 470,402 494,472 392,488",
    statusKey: "persistent_underperformance_candidate",
    place: "center",
  },
];
export const STATUS: Record<string, [string, string]> = {
  persistent_underperformance_candidate: [
    "Candidat subperformanță persistentă",
    "Persistent underperformance candidate",
  ],
  possible_dispatch_mistiming_injected_scenario: [
    "Mistiming dispatch · scenariu injectat",
    "Dispatch mistiming · injected scenario",
  ],
};
export const fmt = (v: number | null | undefined, d = 1) =>
  v == null || !Number.isFinite(v)
    ? "—"
    : new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      }).format(v);
const pct = (v: number | null) => (v === null ? "—" : fmt(v * 100) + "%");

export type SiteSummary = {
  site_id: string;
  last_7d_divergence?: number;
  pv_shortfall_value_last_7d_ron?: string;
  dispatch_opportunity_last_7d_ron?: string;
  rolling_14d_shortfall_kwh?: number;
  fault_signature?: string;
  days?: { expected_kwh: number; actual_kwh: number | null }[];
};

/** Shared stylized satellite base scene (streets, blocks, labels) of the ASE block. */
export function AseBaseScene({
  buildingLabels = false,
}: {
  buildingLabels?: boolean;
}) {
  return (
    <>
      <defs>
        <linearGradient id="ase-bg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#151a15" />
          <stop offset=".5" stopColor="#10141a" />
          <stop offset="1" stopColor="#0b0e13" />
        </linearGradient>
        <radialGradient id="ase-park" cx=".5" cy=".5" r=".7">
          <stop stopColor="#20301f" />
          <stop offset="1" stopColor="#182418" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ase-road" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#2b3038" />
          <stop offset="1" stopColor="#242932" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ase-bg)" />
      <g className="ase-parks">
        <ellipse cx="120" cy="120" rx="150" ry="110" fill="url(#ase-park)" />
        <ellipse cx="880" cy="150" rx="170" ry="120" fill="url(#ase-park)" />
        <ellipse cx="90" cy="560" rx="140" ry="100" fill="url(#ase-park)" />
        <ellipse cx="850" cy="580" rx="190" ry="110" fill="url(#ase-park)" />
      </g>
      <g className="ase-roads" stroke="url(#ase-road)" fill="none">
        <path d="M0 508 L624 566" strokeWidth="26" />
        <path d="M612 640 L1000 596" strokeWidth="24" />
        <path d="M608 640 L556 0" strokeWidth="24" />
        <path d="M0 342 L556 322" strokeWidth="14" />
        <path d="M0 176 L548 156" strokeWidth="12" />
        <path d="M170 0 L206 640" strokeWidth="12" />
        <path d="M336 404 L560 416" strokeWidth="10" />
        <path d="M820 0 L856 640" strokeWidth="11" />
        <path d="M624 566 L980 120" strokeWidth="12" />
      </g>
      <g
        className="ase-roads-inner"
        stroke="#3a404b"
        strokeDasharray="14 18"
        fill="none"
        strokeOpacity=".5"
      >
        <path d="M0 508 L624 566" strokeWidth="1.5" />
        <path d="M608 640 L556 0" strokeWidth="1.5" />
      </g>
      <g className="ase-blocks">
        {[
          [40, 30, 110, 120],
          [190, 24, 120, 108],
          [350, 20, 130, 96],
          [40, 220, 96, 96],
          [176, 232, 150, 70],
          [420, 190, 96, 110],
          [560, 60, 70, 120],
          [640, 40, 130, 90],
          [810, 190, 120, 110],
          [660, 470, 110, 100],
          [830, 440, 130, 110],
          [40, 430, 110, 60],
          [220, 560, 140, 60],
          [700, 170, 110, 100],
        ].map(([bx, by, bw, bh], i) => (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx="7"
              fill="#1c222a"
              stroke="#ffffff0d"
            />
            <rect
              x={bx + 10}
              y={by + 10}
              width={bw - 34}
              height={bh - 34}
              rx="4"
              fill="#232a33"
            />
          </g>
        ))}
      </g>
      <g className="ase-plaza">
        <rect
          x="596"
          y="546"
          width="110"
          height="62"
          rx="12"
          fill="#282e37"
          stroke="#ffffff12"
        />
        <ellipse cx="651" cy="577" rx="26" ry="16" fill="#303743" />
        <text x="651" y="626" textAnchor="middle" className="ase-street-label">
          PIAȚA ROMANĂ
        </text>
      </g>
      <g className="ase-street-names" fill="#8a8f99" fillOpacity=".6">
        <text
          x="60"
          y="494"
          transform="rotate(5.4 60 494)"
          className="ase-street-label"
        >
          B-DUL DACIA
        </text>
        <text
          x="572"
          y="120"
          transform="rotate(-84 572 120)"
          className="ase-street-label"
        >
          Calea Dorobanți
        </text>
        <text
          x="760"
          y="618"
          transform="rotate(-5 760 618)"
          className="ase-street-label"
        >
          B-DUL CAROL I
        </text>
        <text
          x="60"
          y="330"
          transform="rotate(-2 60 330)"
          className="ase-street-label"
        >
          Str. Dionisie Lupu
        </text>
      </g>
      {buildingLabels && (
        <g className="ase-building-labels" fill="#c7cbd4" fillOpacity=".78">
          <text x="430" y="392" textAnchor="middle" className="ase-blabel">
            ACADEMIA DE STUDII ECONOMICE
          </text>
          <text x="224" y="100" textAnchor="middle" className="ase-blabel">
            FACULTATEA DE MARKETING · CLĂDIREA 6
          </text>
          <text x="706" y="292" textAnchor="middle" className="ase-blabel">
            CLĂDIREA VIRGIL MADGEARU
          </text>
          <text x="560" y="470" textAnchor="middle" className="ase-blabel">
            BBS
          </text>
        </g>
      )}
      <g className="ase-trees" fill="#2b422c">
        <circle cx="530" cy="470" r="9" />
        <circle cx="548" cy="486" r="7" />
        <circle cx="300" cy="420" r="8" />
        <circle cx="620" cy="380" r="8" />
        <circle cx="150" cy="330" r="9" />
        <circle cx="720" cy="520" r="9" />
        <circle cx="900" cy="330" r="10" />
      </g>
      <g className="ase-scale">
        <path
          d="M30 614 H130 M30 608 V620 M130 608 V620"
          stroke="#9ba0ab"
          strokeWidth="1.5"
        />
        <text x="30" y="600" fill="#9ba0ab" className="ase-scale-text">
          ≈ 210 m
        </text>
        <text x={W - 46} y="36" fill="#9ba0ab" className="ase-scale-text">
          N ↑
        </text>
      </g>
    </>
  );
}

export default function AseCampusMap({
  data,
  controls,
  imports,
  activeSite,
  lang,
  onSelect,
  onDiagnostic,
}: {
  data: Data;
  controls: Controls;
  imports: Imports;
  activeSite: string;
  lang: string;
  onSelect: (id: string) => void;
  onDiagnostic: (id: string) => void;
}) {
  const tr = (ro: string, en: string) => (lang === "ro" ? ro : en);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (open === null) return;
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  const metrics = useMemo(() => {
    const out: Record<
      string,
      {
        expected: number | null;
        actual: number | null;
        divergence: number | null;
        shortfall: number | null;
        shortfallKwh: number | null;
        dispatch: number | null;
        coverage: number;
      }
    > = {};
    for (const b of BUILDINGS) {
      // Metrics come strictly from the established dashboard.json site
      // summaries (PVGIS JRC daily model + counterfactual valuation).
      const s = data.sites.find((x) => x.site_id === b.id) as unknown as
        SiteSummary | undefined;
      const ds = M.daily(M.rowsFor(data, b.id, controls, imports)),
        recent = ds.slice(-7),
        complete = recent.length > 0 && recent.every((d) => d.complete);
      const fallback = {
        expected: ds[13]?.expected ?? null,
        actual: ds[13]?.pv ?? null,
        divergence: complete
          ? recent.reduce((a, d) => a + (d.residual ?? 0), 0) / recent.length
          : null,
        coverage:
          recent.reduce((a, d) => a + d.coverage, 0) /
          Math.max(1, recent.length),
      };
      const f = M.financial(
        recent.flatMap((d) => d.rows),
        { ...controls, reserve: 20, flex: "none", terminalLock: true },
      );
      const d14 = s?.days?.[13];
      out[b.id] = {
        expected: d14?.expected_kwh ?? fallback.expected,
        actual: d14 ? d14.actual_kwh : fallback.actual,
        divergence:
          typeof s?.last_7d_divergence === "number"
            ? -s.last_7d_divergence
            : fallback.divergence,
        shortfall:
          s?.pv_shortfall_value_last_7d_ron != null
            ? Number(s.pv_shortfall_value_last_7d_ron)
            : f.pvExposure,
        shortfallKwh:
          s?.rolling_14d_shortfall_kwh != null
            ? s.rolling_14d_shortfall_kwh / 14
            : f.shortfall,
        dispatch:
          s?.dispatch_opportunity_last_7d_ron != null
            ? Number(s.dispatch_opportunity_last_7d_ron)
            : f.dispatch,
        coverage: fallback.coverage,
      };
    }
    return out;
  }, [data, controls, imports]);
  const contract =
    controls.policy === "commercial"
      ? tr(
          "200–400 kW · PZU mediu ponderat (500 RON/MWh)",
          "200–400 kW · Monthly weighted PZU (500 RON/MWh)",
        )
      : tr(
          "≤200 kW · Compensare cantitativă (1,30 RON/kWh import · 0,60 RON/kWh activ)",
          "≤200 kW · Quantity compensation (1.30 RON/kWh import · 0.60 RON/kWh active)",
        );
  const selected = BUILDINGS.find((b) => b.id === open) || null,
    m = selected ? metrics[selected.id] : null;
  return (
    <div className="ase-map">
      <div className="ase-viewport">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="ase-canvas"
          role="img"
          aria-label={tr(
            "Vedere satelit stilizată a campusului ASE, Piața Romană, București",
            "Stylized satellite view of the ASE campus, Piața Romană, Bucharest",
          )}
        >
          <AseBaseScene />
          {BUILDINGS.map((b) => (
            <g
              key={b.id}
              className={"ase-roof" + (activeSite === b.id ? " active" : "")}
              role="button"
              tabIndex={0}
              aria-label={b.name + " · Sit " + b.id + " · " + b.brand}
              onClick={() => setOpen(b.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(b.id);
                }
              }}
            >
              <polygon
                points={b.roof}
                fill={b.color}
                fillOpacity={open === b.id ? ".3" : ".16"}
                stroke={b.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <polygon points={b.roof} fill="#ffffff" fillOpacity=".05" />
            </g>
          ))}
          {BUILDINGS.map((b) => {
            const px = x(b.lon),
              py = y(b.lat);
            return (
              <g
                key={b.id + "-pin"}
                className={"ase-pin" + (activeSite === b.id ? " active" : "")}
                role="button"
                tabIndex={0}
                aria-label={
                  tr("Deschide detaliile sitului", "Open site details") +
                  " " +
                  b.id
                }
                onClick={() => setOpen(b.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(b.id);
                  }
                }}
              >
                <circle
                  cx={px}
                  cy={py}
                  r="18"
                  fill={b.color}
                  fillOpacity=".16"
                />
                <circle
                  cx={px}
                  cy={py}
                  r="12"
                  fill="rgba(24,24,28,.9)"
                  stroke={b.color}
                  strokeWidth="2"
                />
                <text
                  x={px}
                  y={py + 4}
                  textAnchor="middle"
                  fill={b.color}
                  className="ase-pin-letter"
                >
                  {b.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <AnimatePresence>
        {selected && m && (
          <div key={"ase-pop-" + selected.id} className="ase-details">
            <motion.div
              role="dialog"
              aria-label={selected.name + " · Sit " + selected.id}
              className="ase-popover"
              initial={{
                opacity: 0,
                scale: reduced ? 1 : 0.86,
                y: reduced ? 0 : 14,
                filter: reduced ? "blur(0px)" : "blur(8px)",
              }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                scale: reduced ? 1 : 0.94,
                y: reduced ? 0 : 8,
              }}
              transition={reduced ? { duration: 0.15 } : sheetSpring}
            >
              <div className="ase-pop-head">
                <div>
                  <span className="eyebrow">
                    <MapPin size={12} /> {selected.brand} · 6.0 kWp · 10 kWh
                    BESS
                  </span>
                  <h4>
                    {selected.name} — Sit {selected.id}
                  </h4>
                  <small>{selected.sub}</small>
                </div>
                <Press
                  className="icon-button"
                  onClick={() => setOpen(null)}
                  label="Close"
                >
                  <X size={17} />
                </Press>
              </div>
              <div className="ase-pop-tags">
                <span className="ase-demo-pill">SIMULATED DEMO SAMPLE</span>
                <span className="badge coral">
                  {lang === "ro"
                    ? STATUS[selected.statusKey][0]
                    : STATUS[selected.statusKey][1]}
                </span>
              </div>
              <div className="ase-metrics">
                <div>
                  <span>
                    {tr("PV așteptat (Ziua 14)", "Expected PV (Day 14)")}
                  </span>
                  <b className="solar">
                    {fmt(m.expected)} <em>kWh</em>
                  </b>
                </div>
                <div>
                  <span>
                    {tr("PV observat (Ziua 14)", "Actual PV (Day 14)")}
                  </span>
                  <b>
                    {fmt(m.actual)} <em>kWh</em>
                  </b>
                </div>
                <div>
                  <span>{tr("Divergență 7 zile", "7-day divergence")}</span>
                  <b
                    className={
                      m.divergence !== null && m.divergence < -0.12
                        ? "coral"
                        : "battery"
                    }
                  >
                    {pct(m.divergence === null ? null : m.divergence)}
                  </b>
                </div>
                <div>
                  <span>
                    {tr(
                      "Expunere subproducție · 7 zile",
                      "PV shortfall exposure · 7d",
                    )}
                  </span>
                  <b className="coral">
                    {fmt(m.shortfall, 2)} <em>RON</em>
                  </b>
                </div>
                <div>
                  <span>
                    {tr(
                      "Oportunitate baterie · 7 zile",
                      "Dispatch opportunity · 7d",
                    )}
                  </span>
                  <b className="battery">
                    {fmt(m.dispatch, 2)} <em>RON</em>
                  </b>
                </div>
                <div>
                  <span>
                    {tr("Subproducție PV · 14 zile", "PV shortfall · 14d")}
                  </span>
                  <b className="coral">
                    {fmt(m.shortfallKwh, 2)} <em>kWh</em>
                  </b>
                </div>
                <div className="wide">
                  <span>{tr("Regim contract", "Contract regime")}</span>
                  <b>{contract}</b>
                </div>
              </div>
              <p className="caption">
                {tr(
                  "Surse: dashboard.json (replay istoric) · PVGIS JRC geometry-matched · NASA POWER PSH Iun " +
                    fmt(nasaReference.monthly_psh[5], 2) +
                    " kWh/m²/zi · acoperire " +
                    fmt(m.coverage * 100, 0) +
                    "%",
                  "Sources: dashboard.json (historical replay) · PVGIS JRC geometry-matched · NASA POWER PSH Jun " +
                    fmt(nasaReference.monthly_psh[5], 2) +
                    " kWh/m²/day · coverage " +
                    fmt(m.coverage * 100, 0) +
                    "%",
                )}
              </p>
              <div className="ase-pop-actions">
                <Press className="action" onClick={() => onSelect(selected.id)}>
                  {tr(
                    "Selectează această clădire în Dashboard",
                    "Select this building in the Dashboard",
                  )}
                </Press>
                <Press
                  className="secondary"
                  onClick={() => onDiagnostic(selected.id)}
                >
                  {tr("Deschide Diagnostic O&M", "Open O&M Diagnostic")}
                </Press>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="ase-legend">
        {BUILDINGS.map((b) => (
          <button
            key={b.id}
            type="button"
            className={open === b.id ? "selected" : ""}
            onClick={() => setOpen(open === b.id ? null : b.id)}
          >
            <i style={{ background: b.color }} />
            <span>
              <b>
                Sit {b.id} · {b.name}
              </b>
              <small>
                {b.brand} ·{" "}
                {fmt(
                  metrics[b.id]?.divergence === null
                    ? null
                    : (metrics[b.id]?.divergence ?? 0) * 100,
                  1,
                )}
                %
              </small>
            </span>
          </button>
        ))}
        <span className="caption ase-provenance">
          {tr(
            "Eșantion demonstrativ simulat · vedere satelit stilizată, 100% offline",
            "Simulated demo sample · stylized satellite view, 100% offline",
          )}
        </span>
      </div>
    </div>
  );
}
