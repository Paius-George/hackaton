import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
  useDragControls,
  useIsPresent,
} from "motion/react";
import {
  Sun,
  Battery,
  House,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  Layers,
  ScanLine,
  Plug,
  ChevronRight,
  X,
  Check,
  Play,
  Pause,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  ShieldCheck,
  Globe,
  Upload,
  TriangleAlert,
  CheckCircle2,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { Card, Press, Segments, PhysicalTrack, sheetSpring } from "./Fluid";
import {
  M,
  type Data,
  type Controls,
  type Imports,
  type Row,
  type Day,
} from "./model";
import fallback from "./fallback.json";
import {
  AdvisorSection,
  BatterySizingSection,
  CostsPlanningSection,
  RoofClimatologySection,
} from "./SolarStudio";

type View =
  | "overview"
  | "performance"
  | "schedule"
  | "costs"
  | "fleet"
  | "case"
  | "connections";
type Receipt = {
  case_id: string;
  created_at: string;
  status: string;
  destination: string;
};
type Case = {
  status: string;
  decision: string;
  notes: string;
  receipt?: Receipt;
  history: { status: string; at: string }[];
  uncertain?: boolean;
};
type Saved = {
  site: string;
  persona: string;
  view: View;
  lang: string;
  commercial: boolean;
  period: string;
  reserve: number;
  terminalLock: boolean;
  flex: string;
  start: number;
  end: number;
  policy: string;
  cases: Record<string, Case>;
  imports: Imports;
  proposal: boolean;
};
const STORE = "oev-apple-v1",
  names: Record<string, string> = {
    A: "București Nord",
    B: "Ilfov Sud",
    C: "București Vest",
  },
  brands: Record<string, string> = {
    A: "Huawei SUN2000",
    B: "Deye SUN-10K",
    C: "Fronius Symo",
  };
const initial: Saved = {
  site: "C",
  persona: "owner",
  view: "overview",
  lang: "ro",
  commercial: false,
  period: "day",
  reserve: 20,
  terminalLock: true,
  flex: "none",
  start: 10,
  end: 16,
  policy: "residential",
  cases: {},
  imports: {},
  proposal: false,
};
function load(): Saved {
  try {
    const x = JSON.parse(localStorage.getItem(STORE) || "null");
    return x ? { ...initial, ...x } : initial;
  } catch {
    return initial;
  }
}
const fmt = (v: number | null | undefined, d = 1) =>
  v == null || !Number.isFinite(v)
    ? "—"
    : new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      }).format(v);
const pct = (v: number | null) => (v === null ? "—" : fmt(v * 100) + "%");
const states = [
  "CANDIDATE",
  "REVIEWED",
  "ACTION_REQUESTED",
  "ACTION_ACCEPTED",
  "IN_PROGRESS",
  "RESOLVED_PENDING_CHECK",
  "VERIFIED",
];
const views: { id: View; ro: string; en: string; icon: typeof House }[] = [
  { id: "overview", ro: "Acasă", en: "Overview", icon: House },
  { id: "performance", ro: "Producție", en: "Performance", icon: Activity },
  { id: "schedule", ro: "Baterie", en: "Schedule", icon: Battery },
  { id: "costs", ro: "Costuri", en: "Costs", icon: Layers },
  { id: "fleet", ro: "Instalații", en: "Fleet", icon: Sun },
  { id: "case", ro: "Diagnostic", en: "Diagnostic", icon: ScanLine },
  { id: "connections", ro: "Conexiuni", en: "Connections", icon: Plug },
];
function App() {
  const [s, set] = useState<Saved>(load),
    [data, setData] = useState<Data>(() =>
      M.validate(window.__ENERGY_DATA__ || fallback),
    ),
    [origin, setOrigin] = useState(
      window.__ENERGY_DATA__
        ? "Pipeline JSON · embedded"
        : "Bundled historical reference",
    ),
    [server, setServer] = useState(false),
    [stage, setStage] = useState(false),
    [tour, setTour] = useState<number | null>(null),
    [paused, setPaused] = useState(false),
    [sheet, setSheet] = useState(false),
    [insightOpen, setInsightOpen] = useState(false),
    [anchor, setAnchor] = useState({ x: window.innerWidth / 2, y: 350 }),
    [dayIndex, setDayIndex] = useState(13),
    [threshold, setThreshold] = useState(-12),
    [missing, setMissing] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [storageOK, setStorageOK] = useState(true),
    [preview, setPreview] = useState<{
      kind: string;
      map: Record<string, number>;
      count: number;
    } | null>(null);
  const reduced = useReducedMotion(),
    trigger = useRef<HTMLElement | null>(null),
    sending = useRef(false);
  const tr = (ro: string, en: string) => (s.lang === "ro" ? ro : en);
  const patch = useCallback(
    (v: Partial<Saved>) => set((old) => ({ ...old, ...v })),
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch {
      setStorageOK(false);
    }
  }, [s]);
  useEffect(() => {
    document.documentElement.lang = s.lang;
  }, [s.lang]);
  useEffect(() => {
    const controller = new AbortController();
    if (location.protocol === "file:") return;
    fetch("/api/demo-capabilities", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => setServer(!!c?.sqlite_work_orders))
      .catch(() => {});
    if (!window.__ENERGY_DATA__)
      fetch("/dashboard.json", { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((d) => {
          setData(M.validate(d));
          setOrigin("dashboard.json · local pipeline");
        })
        .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 6000);
      return () => clearTimeout(t);
    }
  }, [message]);
  const controls: Controls = useMemo(
    () => ({
      commercial: s.commercial,
      policy: s.policy,
      reserve: s.reserve,
      terminalLock: s.terminalLock,
      flex: s.flex,
      start: s.start,
      end: s.end,
      missing: missing ? { [s.site]: true } : {},
    }),
    [
      s.commercial,
      s.policy,
      s.reserve,
      s.terminalLock,
      s.flex,
      s.start,
      s.end,
      s.site,
      missing,
    ],
  );
  const rows = useMemo(
    () => M.rowsFor(data, s.site, controls, s.imports),
    [data, s.site, controls, s.imports],
  );
  const days = useMemo(() => M.daily(rows), [rows]);
  const active = days[Math.min(dayIndex, days.length - 1)],
    last = days.at(-1)!;
  const selected = s.period === "day" ? last.rows : rows;
  const totals = useMemo(() => M.totals(selected), [selected]);
  const finance = useMemo(
    () => M.financial(selected, controls),
    [selected, controls],
  );
  const opt = useMemo(() => M.optimize(last.rows, controls), [last, controls]);
  const dayMoney = useMemo(
    () =>
      active?.complete
        ? M.financial(active.rows, {
            ...controls,
            reserve: 20,
            terminalLock: true,
            flex: "none",
          }).pvExposure
        : null,
    [active, controls],
  );
  const insightAmount = s.site === "B" ? finance.dispatch : finance.pvExposure;
  const insightDaily =
    insightAmount === null || finance.days <= 0
      ? null
      : insightAmount / finance.days;
  const rule =
    s.site === "B" ? "dispatch_mistiming" : "persistent_pv_shortfall";
  const windowKey =
    days
      .slice(-7)
      .map((d) => d.date)
      .join("_") +
    "|" +
    s.commercial +
    "|" +
    JSON.stringify(s.imports);
  const caseID = M.key(s.site, rule, windowKey),
    current = s.cases[caseID] || {
      status: "CANDIDATE",
      decision: "",
      notes: "",
      history: [],
    };
  const updateCase = (v: Partial<Case>) =>
    set((old) => ({
      ...old,
      cases: { ...old.cases, [caseID]: { ...current, ...v } },
    }));
  const changeStatus = (status: string) =>
    updateCase({
      status,
      history: [...current.history, { status, at: new Date().toISOString() }],
    });
  const signature = (id: string) =>
    id === "A"
      ? tr("Plafonare la prânz", "Noon cap signature")
      : id === "B"
        ? tr("Program baterie ineficient", "Suboptimal battery dispatch")
        : tr("Subperformanță persistentă", "Persistent PV shortfall");
  const openCase = (id: string, el?: HTMLElement) => {
    if (el) {
      trigger.current = el;
      const r = el.getBoundingClientRect();
      setAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    patch({ site: id, persona: "ops" });
    setSheet(true);
  };
  const annualReplayLoad = (M.totals(rows).load / days.length) * 365;
  const selectBuilding = (id: string) => {
    patch({ site: id });
    setMissing(false);
    setMessage(
      tr(
        "Clădire selectată în Dashboard: Site " + id + ".",
        "Building selected in the Dashboard: Site " + id + ".",
      ),
    );
  };
  const createTicket = useCallback(async () => {
    if (sending.current || current.receipt || current.uncertain) return;
    if (
      current.status !== "REVIEWED" ||
      current.decision !== "anomaly" ||
      !totals.complete
    ) {
      setMessage(
        tr(
          "Confirmă evaluarea și completitudinea datelor.",
          "Confirm assessment and data completeness.",
        ),
      );
      return;
    }
    sending.current = true;
    setBusy(true);
    const requested: Case = {
      ...current,
      status: "ACTION_REQUESTED",
      uncertain: server,
      history: [
        ...current.history,
        { status: "ACTION_REQUESTED", at: new Date().toISOString() },
      ],
    };
    const storeCase = (c: Case) => {
      set((old) => {
        const next = { ...old, cases: { ...old.cases, [caseID]: c } };
        try {
          localStorage.setItem(STORE, JSON.stringify(next));
        } catch {
          /* Memory state remains available. */
        }
        return next;
      });
    };
    storeCase(requested);
    const payload = {
      idempotency_key: caseID,
      site_id: s.site,
      rule_id: rule,
      evidence_window: windowKey,
      decision: current.decision,
      notes: current.notes,
      mode: "APPLE_UI_SIMULATED_REPLAY",
      estimated_pv_value_ron_per_day:
        finance.pvExposure === null ? null : finance.pvExposure / finance.days,
    };
    try {
      let receipt: Receipt;
      if (server) {
        const r = await fetch("/tickets/" + caseID, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": caseID,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
        if (!r.ok) {
          storeCase({ ...requested, status: "REVIEWED", uncertain: false });
          throw Error("HTTP " + r.status);
        }
        receipt = {
          ...(await r.json()),
          destination: "SQLite · local work order",
        };
      } else
        receipt = {
          case_id: caseID,
          created_at: new Date().toISOString(),
          status: "ACCEPTED_LOCAL_ONLY",
          destination: storageOK
            ? "Browser localStorage"
            : "Session memory only",
        };
      storeCase({
        ...requested,
        status: "ACTION_ACCEPTED",
        uncertain: false,
        receipt,
        history: [
          ...requested.history,
          { status: "ACTION_ACCEPTED", at: receipt.created_at },
        ],
      });
      setMessage(
        tr(
          "Ticket înregistrat. Aceeași cheie previne duplicatele.",
          "Ticket registered. The same key prevents duplicates.",
        ),
      );
    } catch (e) {
      setMessage(
        tr(
          "Confirmarea nu a sosit. Verifică destinația înainte de retrimitere. ",
          "No confirmation. Reconcile the destination before retry. ",
        ) + String(e),
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }, [
    current,
    caseID,
    s.site,
    rule,
    windowKey,
    server,
    totals.complete,
    finance,
    storageOK,
    s.lang,
  ]);
  const story = [
    {
      view: "fleet",
      persona: "ops",
      title: tr(
        "Mai întâi, instalația care are nevoie de noi.",
        "First, the installation that needs us.",
      ),
    },
    {
      view: "performance",
      persona: "ops",
      title: tr(
        "Șapte zile sănătoase. Apoi, o abatere persistentă.",
        "Seven healthy days. Then a persistent shortfall.",
      ),
    },
    {
      view: "case",
      persona: "ops",
      title: tr("Dovezi înainte de diagnostic.", "Evidence before diagnosis."),
    },
    {
      view: "case",
      persona: "ops",
      title: tr(
        "O intervenție urmărită, fără duplicate.",
        "A traceable intervention. No duplicates.",
      ),
    },
    {
      view: "schedule",
      persona: "owner",
      title: tr(
        "Pentru proprietar: o alegere clară.",
        "For the owner: one clear choice.",
      ),
    },
  ];
  const goStory = useCallback(
    (i: number) => {
      const step = story[i];
      patch({
        site: "C",
        view: step.view as View,
        persona: step.persona,
        period: "fortnight",
        commercial: false,
        policy: "residential",
        reserve: 20,
        terminalLock: true,
        flex: "none",
      });
      setMissing(false);
      setDayIndex(13);
      setSheet(i === 2 || i === 3);
      setTour(i);
      setStage(true);
    },
    [s.lang],
  );
  useEffect(() => {
    if (tour === null || paused || reduced) return;
    const timer = setTimeout(() => {
      if (tour < 4) goStory(tour + 1);
      else {
        setTour(null);
        setMessage(
          tr(
            "Tur complet. Explorează liber.",
            "Tour complete. Explore freely.",
          ),
        );
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [tour, paused, reduced, goStory]);
  // A tour never signs a technician assessment or creates a ticket automatically.
  const closeSheet = useCallback(() => {
    setSheet(false);
    setInsightOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);
  const navigation = (v: string) => {
    patch({ view: v as View });
    if (v === "case") {
      setAnchor({ x: window.innerWidth / 2, y: 130 });
      setSheet(true);
    }
  };
  const card = (children: ReactNode, className = "", focus = false) => (
    <Card className={className} stage={stage} focus={focus}>
      {children}
    </Card>
  );
  const metric = (
    label: string,
    value: number | null | undefined,
    unit: string,
    color: string,
    sub: string,
    icon: ReactNode,
  ) =>
    card(
      <>
        <div className="eyebrow metric-label">
          {icon}
          {label}
        </div>
        <div className={"metric " + color}>
          {fmt(value)}
          <small>{unit}</small>
        </div>
        <p className="caption">{sub}</p>
      </>,
      "metric-card",
      false,
    );
  function performance(compact = false) {
    return (
      <Performance
        days={days}
        active={active}
        index={dayIndex}
        onIndex={setDayIndex}
        money={dayMoney}
        compact={compact}
        tr={tr}
      />
    );
  }
  function insightDetails() {
    const battery = s.site === "B";
    const nextChecks = battery
      ? [
          tr(
            "Compară încărcarea și descărcarea cu intervalele de consum și tarifele.",
            "Compare charging and discharging with consumption windows and tariffs.",
          ),
          tr(
            "Verifică rezerva minimă și aceeași energie în baterie la finalul zilei.",
            "Check the minimum reserve and equal stored energy at day end.",
          ),
          tr(
            "Revizuiește propunerea înainte de a salva programul bateriei.",
            "Review the proposal before saving a battery schedule.",
          ),
        ]
      : [
          tr(
            "Compară producția observată cu modelul și verifică dacă lipsesc măsurători.",
            "Compare observed production with the model and check for missing measurements.",
          ),
          tr(
            "Verifică umbrirea, murdăria și limitele de export sau de putere.",
            "Review shading, soiling, and export or power limits.",
          ),
          tr(
            "Dacă abaterea persistă, cere o verificare O&M înainte de o intervenție.",
            "If the shortfall persists, request an O&M review before a field visit.",
          ),
        ];
    return (
      <div className="insight-details">
        <span className={"badge " + (battery ? "green" : "coral")}>
          {signature(s.site)}
        </span>
        <p className="insight-explanation">
          {battery
            ? tr(
                "Comparăm programul observat cu o alternativă fezabilă, păstrând producția PV și energia finală din baterie constante. Suma arată oportunitatea estimată în scenariul curent.",
                "We compare observed dispatch with a feasible alternative, keeping PV production and final stored energy constant. The amount shows the estimated opportunity in the current scenario.",
              )
            : tr(
                "Producția observată este comparată cu modelul pentru aceeași perioadă. Abaterea este un semnal de verificat, nu dovada unei defecțiuni.",
                "Observed production is compared with the model for the same period. A shortfall is a signal to review, not proof of a fault.",
              )}
        </p>
        <div className="insight-detail-stats">
          <div>
            <span>
              {battery
                ? tr("Oportunitate estimată", "Estimated opportunity")
                : tr("Expunere estimată", "Estimated exposure")}
            </span>
            <strong className={battery ? "battery" : "coral"}>
              {fmt(insightDaily, 2)} <small>RON / {tr("zi", "day")}</small>
            </strong>
          </div>
          <div>
            <span>{tr("Producție observată", "Observed production")}</span>
            <strong>
              {fmt(totals.pv, 2)} <small>kWh</small>
            </strong>
          </div>
          <div>
            <span>{tr("Producție modelată", "Modeled production")}</span>
            <strong>
              {fmt(totals.expected, 2)} <small>kWh</small>
            </strong>
          </div>
          <div>
            <span>{tr("Abatere față de model", "Difference from model")}</span>
            <strong>{pct(totals.residual)}</strong>
          </div>
        </div>
        <section className="insight-calculation">
          <h3>
            {tr("Cum se calculează suma", "How the estimate is calculated")}
          </h3>
          {insightDaily === null ? (
            <p>
              {tr(
                "Date insuficiente pentru o estimare financiară. Verifică măsurătorile în Producție.",
                "Insufficient data for a financial estimate. Review measurements in Performance.",
              )}
            </p>
          ) : (
            <>
              <p>
                {fmt(insightAmount, 2)} RON ÷ {finance.days}{" "}
                {tr(
                  finance.days === 1 ? "zi" : "zile",
                  finance.days === 1 ? "day" : "days",
                )}{" "}
                ={" "}
                <b>
                  {fmt(insightDaily, 2)} RON / {tr("zi", "day")}
                </b>
              </p>
              <p>
                {battery
                  ? tr(
                      "Diferența modelată dintre programul observat și alternativa fezabilă, conform scenariului de contract. Nu se adună cu expunerea PV.",
                      "The modeled difference between observed dispatch and a feasible alternative under the contract scenario. It is not added to PV exposure.",
                    )
                  : tr(
                      "Valoarea subproducției în scenariul de contract selectat, cu consumul și bateria constante. Estimarea nu reprezintă o pierdere facturată sau o economie garantată.",
                      "The value of the PV shortfall under the selected contract scenario, with load and battery held constant. This is not an invoiced loss or guaranteed saving.",
                    )}
              </p>
            </>
          )}
          <small>
            {tr("Perioada analizată", "Analysis period")}:{" "}
            {s.period === "day" ? last.date : `${days[0]?.date} → ${last.date}`}{" "}
            · {tr("Replay demonstrativ", "Demo replay")}
          </small>
        </section>
        <section>
          <h3>{tr("Ce verifici în continuare", "What to check next")}</h3>
          <ol className="insight-checklist">
            {nextChecks.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
        </section>
        <div className="insight-detail-actions">
          <Press
            className="action"
            onClick={() => {
              setInsightOpen(false);
              if (s.persona === "ops") openCase(s.site);
              else navigation(battery ? "schedule" : "performance");
            }}
          >
            {s.persona === "ops"
              ? tr("Deschide diagnostic O&M", "Open O&M diagnostic")
              : battery
                ? tr("Compară programul bateriei", "Compare battery schedules")
                : tr("Verifică producția", "Review production")}
            <ArrowUpRight size={16} />
          </Press>
          <Press
            className="secondary"
            onClick={() => {
              setInsightOpen(false);
              navigation("costs");
            }}
          >
            {tr("Vezi calculul costurilor", "Review cost calculation")}
          </Press>
        </div>
      </div>
    );
  }
  function overview() {
    return (
      <div className="bento-grid overview-grid">
        <div className="metrics-row">
          {metric(
            tr("Producție solară", "Solar production"),
            totals.pv,
            "kWh",
            "solar",
            tr("față de model", "versus model") + " " + pct(totals.residual),
            <Sun size={15} />,
          )}
          {metric(
            tr("Consum total", "Site consumption"),
            totals.load,
            "kWh",
            "load",
            tr("Locuință + consumatori", "Home + appliances"),
            <House size={15} />,
          )}
          {metric(
            tr("Baterie", "Battery"),
            totals.soc,
            "%",
            "battery",
            "↑ " +
              fmt(totals.charge) +
              " / ↓ " +
              fmt(totals.discharge) +
              " kWh",
            <Battery size={15} />,
          )}
          {metric(
            tr("Import din rețea", "Grid import"),
            totals.imp,
            "kWh",
            "coral",
            tr("Export", "Export") + " " + fmt(totals.exp) + " kWh",
            <ArrowDownLeft size={15} />,
          )}
        </div>
        {card(
          <>
            <div className="card-title">
              <div>
                <span className="eyebrow">ENERGY IN PERSPECTIVE</span>
                <h2>{tr("Totul, conectat.", "Everything, connected.")}</h2>
              </div>
              <span
                className={"badge " + (totals.complete ? "green" : "coral")}
              >
                <i />
                {totals.complete
                  ? tr("Balanță verificată", "Balance checked")
                  : tr("Date insuficiente", "Insufficient data")}
              </span>
            </div>
            <EnergyFlow totals={totals} brand={brands[s.site]} tr={tr} />
            <div className="balance">
              <ShieldCheck size={14} />
              {totals.balance === null
                ? tr("Date insuficiente", "Insufficient data")
                : "PV + Import + Discharge = Load + Export + Charge · Δ " +
                  fmt(Math.abs(totals.balance), 4) +
                  " kWh"}
            </div>
          </>,
          "flow-card",
          true,
        )}
        {card(
          <>
            <span className="eyebrow coral">
              {tr("UN SEMNAL, O ACȚIUNE", "ONE SIGNAL, ONE ACTION")}
            </span>
            <div className="insight-icon">
              <ScanLine size={28} />
            </div>
            <h2>
              {s.site === "B"
                ? tr(
                    "Bateria poate lucra mai bine.",
                    "Your battery can work smarter.",
                  )
                : tr(
                    "Soarele e același. Producția, nu.",
                    "Same sunlight. Less energy.",
                  )}
            </h2>
            <p>
              {s.site === "B"
                ? tr(
                    "Compară programul observat cu alternativa fezabilă. Păstrăm aceeași energie în baterie la final.",
                    "Compare observed dispatch with a feasible alternative, keeping the same stored energy at day end.",
                  )
                : tr(
                    "Abaterea se repetă în replay. Cere o verificare a limitelor și umbririi înainte de o intervenție.",
                    "The replay shows a repeating shortfall. Review limits and shading before a field visit.",
                  )}
            </p>
            <div className="insight-value">
              {fmt(insightDaily, 2)} <small>RON / {tr("zi", "day")}</small>
            </div>
            <span className="caption">
              {s.site === "B"
                ? tr(
                    "Oportunitate estimată de reprogramare",
                    "Estimated scheduling opportunity",
                  )
                : tr(
                    "Expunere estimată, nu pierdere facturată",
                    "Estimated exposure, not invoiced loss",
                  )}
            </span>
            <Press
              className="action full"
              onClick={() => {
                trigger.current = document.activeElement as HTMLElement;
                const rect = trigger.current?.getBoundingClientRect();
                if (rect)
                  setAnchor({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                  });
                setInsightOpen(true);
              }}
            >
              {tr("Vezi ce poți schimba", "See what you can change")}
              <ArrowUpRight size={17} />
            </Press>
          </>,
          "insight-card",
          false,
        )}
        {card(performance(true), "mini-performance", false)}
        {card(
          <>
            <div className="card-title">
              <h3>{tr("Stocare cu sens.", "Storage, with purpose.")}</h3>
              <Battery size={20} className="battery" />
            </div>
            <div className="battery-visual">
              <div style={{ width: totals.soc + "%" }} />
              <span>
                {fmt(totals.soc, 0)}
                <small>%</small>
              </span>
            </div>
            <div className="split">
              <span>{tr("Rezervă backup", "Backup reserve")}</span>
              <strong>{fmt(s.reserve, 0)}%</strong>
            </div>
            <p className="caption">10 kWh · 3 kW AC · 95% round-trip</p>
            <Press
              className="text-action"
              onClick={() => navigation("schedule")}
            >
              {tr("Ajustează rezerva", "Adjust reserve")}
              <ChevronRight size={16} />
            </Press>
          </>,
          "storage-card",
          false,
        )}
      </div>
    );
  }
  function schedule() {
    return (
      <div className="bento-grid schedule-grid">
        {card(
          <>
            <div className="card-title">
              <div>
                <span className="eyebrow battery">DISPATCH LAB</span>
                <h2>
                  {tr(
                    "Energia, la momentul potrivit.",
                    "Energy, at the right moment.",
                  )}
                </h2>
              </div>
              <span className="badge">
                {tr("Benchmark retrospectiv", "Retrospective benchmark")}
              </span>
            </div>
            <p className="muted">
              {tr(
                "Informație completă · Fără comandă directă în echipament",
                "Perfect information · No direct equipment command",
              )}
            </p>
            <div className="chart-legend">
              <span>
                <i className="dot muted-dot" />
                {tr("SoC observat", "Observed SoC")}
              </span>
              <span>
                <i className="dot green-dot" />
                {tr("Alternativă fezabilă", "Feasible alternative")}
              </span>
            </div>
            <LineChart
              series={[
                last.rows.map((r) => r.soc_end_pct),
                opt.available ? opt.socs : [],
              ]}
              colors={["#727781", "#30D158"]}
              ceiling={100}
              labels={last.rows.map((r) => String(r.hour).padStart(2, "0"))}
              unit="%"
            />
            <div className="chart-legend">
              <span>
                {tr(
                  "AC încărcare + / descărcare −",
                  "AC charge + / discharge −",
                )}{" "}
                · 3 kW
              </span>
            </div>
            <DispatchBars
              rows={last.rows}
              deltas={opt.available ? opt.deltas : []}
            />
            {!opt.available && (
              <div className="notice coral">
                {tr(
                  "Rezerva depășește SoC inițial de 50% sau programul nu este fezabil. Nu adăugăm energie fictivă.",
                  "Reserve exceeds initial 50% SoC or schedule is infeasible. No fictitious energy added.",
                )}
              </div>
            )}
            <div className="schedule-summary">
              <div>
                <span className="eyebrow">
                  {tr("OPORTUNITATE SEPARATĂ", "SEPARATE OPPORTUNITY")}
                </span>
                <strong className="battery">
                  {fmt(opt.available ? opt.saving : null, 2)}{" "}
                  <small>RON / {tr("zi", "day")}</small>
                </strong>
              </div>
              <div className="caption">
                {tr(
                  "SoC final observat / alternativă",
                  "Terminal SoC observed / alternative",
                )}
                <br />
                <b>
                  {fmt(last.rows.at(-1)?.soc_end_pct, 0)}% /{" "}
                  {opt.available ? fmt(opt.terminal * 10, 0) + "%" : "—"}
                </b>
              </div>
            </div>
            <p className="caption">
              {tr(
                "Normalizare frontend la randament round-trip 95%; sursa Python folosește 95% pe fiecare sens.",
                "Frontend normalized to 95% round-trip efficiency; Python source uses 95% each way.",
              )}
            </p>
          </>,
          "schedule-chart",
          true,
        )}
        {card(
          <>
            <span className="eyebrow">
              {tr("CONTROL FIZIC", "DIRECT CONTROL")}
            </span>
            <h2>{tr("Păstrează o rezervă.", "Keep a little in reserve.")}</h2>
            <ReserveControl
              value={s.reserve}
              commit={(v) => patch({ reserve: v })}
              label={tr("Rezervă backup SoC", "Backup reserve SoC")}
            />
            <div className="split caption">
              <span>20% · {tr("protecție descărcare", "discharge floor")}</span>
              <span>90% · {tr("limită hardware", "hardware limit")}</span>
            </div>
            <div className="divider" />
            <label className="toggle-row">
              <span>
                {tr("Aceeași energie la final", "Equal terminal energy")}
                <small>Equal terminal SoC lock</small>
              </span>
              <input
                type="checkbox"
                checked={s.terminalLock}
                onChange={(e) => patch({ terminalLock: e.target.checked })}
              />
            </label>
            <label className="field-label">
              {tr("Consumator flexibil", "Flexible appliance")}
              <select
                value={s.flex}
                onChange={(e) => patch({ flex: e.target.value })}
              >
                <option value="none">{tr("Niciunul", "None")}</option>
                <option value="ev">EV · 4 kWh</option>
                <option value="boiler">Boiler · 2 kWh</option>
                <option value="heat">
                  {tr("Pompă de căldură", "Heat pump")} · 3 kWh
                </option>
              </select>
            </label>
            <div className="time-inputs">
              <label>
                {tr("De la", "From")}
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={s.start}
                  onChange={(e) =>
                    patch({ start: Math.max(0, Math.min(23, +e.target.value)) })
                  }
                />
              </label>
              <label>
                {tr("Până la", "Until")}
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={s.end}
                  onChange={(e) =>
                    patch({ end: Math.max(0, Math.min(24, +e.target.value)) })
                  }
                />
              </label>
            </div>
            <Press
              className="action full"
              disabled={!opt.available}
              onClick={() => {
                patch({ proposal: !s.proposal });
                setMessage(
                  tr(
                    "Propunere salvată local. Nicio comandă transmisă.",
                    "Proposal saved locally. No equipment command sent.",
                  ),
                );
              }}
            >
              {s.proposal ? (
                <Check size={16} />
              ) : (
                <SlidersHorizontal size={16} />
              )}{" "}
              {s.proposal
                ? tr("Program propus salvat", "Proposed schedule saved")
                : tr("Salvează propunerea", "Save proposal")}
            </Press>
            <p className="caption">
              {tr(
                "Adăugăm aceeași energie flexibilă în ambele scenarii. Economiile sunt ascunse dacă SoC final diferă.",
                "Both scenarios include equal flexible-load energy. Savings are withheld if terminal SoC differs.",
              )}
            </p>
          </>,
          "reserve-card",
          false,
        )}
        <div className="studio-embed">
          <BatterySizingSection
            lang={s.lang}
            annualReplayLoad={annualReplayLoad}
          />
        </div>
      </div>
    );
  }
  function costs() {
    const buckets = [
      {
        title: tr(
          "Cost conform scenariului de contract",
          "Contract scenario cost",
        ),
        value: finance.observed,
        unit: "RON",
        text: tr(
          "Energie observată · cost net al intervalului selectat",
          "Observed energy · net cost in selected window",
        ),
        color: "load",
      },
      {
        title: tr("Expunere din subproducție PV", "PV shortfall exposure"),
        value:
          finance.pvExposure === null
            ? null
            : finance.pvExposure / finance.days,
        unit: "RON / zi",
        text: tr(
          "Consum și baterie constante",
          "Load and battery held constant",
        ),
        color: "coral",
      },
      {
        title: tr("Oportunitate reprogramare baterie", "Dispatch opportunity"),
        value:
          finance.dispatch === null ? null : finance.dispatch / finance.days,
        unit: "RON / zi",
        text: tr(
          "PV și SoC final constante",
          "PV and terminal SoC held constant",
        ),
        color: "battery",
      },
      {
        title: tr("Rezultat post-intervenție", "Post-intervention result"),
        value: null,
        unit: "Pending",
        text: tr(
          "Necesită măsurători după reparație",
          "Requires measurements after repair",
        ),
        color: "muted",
      },
    ];
    return (
      <>
        <div className="policy-bar">
          <label>
            {tr(
              "Regulă de contract · scenariu, nu consultanță juridică",
              "Contract rule · scenario, not legal advice",
            )}
            <select
              value={s.policy}
              onChange={(e) => patch({ policy: e.target.value })}
            >
              <option value="residential">
                ≤200 kW ·{" "}
                {tr("Compensare cantitativă", "Quantity compensation")}
              </option>
              <option value="commercial">
                200–400 kW ·{" "}
                {tr("PZU mediu ponderat lunar", "Monthly weighted PZU")}
              </option>
            </select>
          </label>
          <span className="caption">
            Law 160/2026 ·{" "}
            {tr(
              "reguli de brief, implementarea ANRE nevalidată",
              "brief policy, ANRE implementation unverified",
            )}
          </span>
        </div>
        <div className="ledger-grid">
          {buckets.map((b, i) => (
            <Card key={i} className="ledger-card" stage={stage} focus={i === 1}>
              <span className="eyebrow">
                0{i + 1} / {tr("REGISTRU SEPARAT", "SEPARATE LEDGER")}
              </span>
              <h2>{b.title}</h2>
              <div className={"metric " + b.color}>
                {b.value === null && i === 3 ? "Pending" : fmt(b.value, 2)}
                <small>{b.unit}</small>
              </div>
              <p className="muted">{b.text}</p>
            </Card>
          ))}
        </div>
        <div className="notice">
          <ShieldCheck size={19} />
          {tr(
            "Aceste patru registre NU se adună. Sunt comparații diferite și pot suprapune aceiași kWh. Un ticket acceptat nu dovedește economii.",
            "These four ledgers are NEVER added. They are different comparisons and may overlap the same kWh. An accepted ticket does not prove savings.",
          )}
        </div>
        <div className="studio-embed">
          <CostsPlanningSection
            lang={s.lang}
            annualReplayLoad={annualReplayLoad}
          />
        </div>
      </>
    );
  }
  const fleet = useMemo(
    () =>
      data.sites
        .map((site) => {
          const rs = M.rowsFor(data, site.site_id, controls, s.imports),
            ds = M.daily(rs),
            recent = ds.slice(-7),
            f = M.financial(
              recent.flatMap((d) => d.rows),
              { ...controls, reserve: 20, flex: "none", terminalLock: true },
            ),
            residual = recent.every((d) => d.complete)
              ? recent.reduce((a, d) => a + (d.residual || 0), 0) /
                recent.length
              : null,
            coverage =
              recent.reduce((a, d) => a + d.coverage, 0) / recent.length;
          return {
            id: site.site_id,
            ds,
            recent,
            f,
            residual,
            coverage,
            score:
              ((Math.abs(residual || 0) * (f.pvExposure || 0)) / 7) * coverage,
          };
        })
        .sort((a, b) => b.score - a.score),
    [data, controls, s.imports],
  );
  function fleetView() {
    return (
      <div className="bento-grid fleet-grid">
        {card(
          <>
            <div className="card-title">
              <div>
                <span className="eyebrow">FLEET INTELLIGENCE</span>
                <h2>
                  {tr(
                    "Atenție acolo unde contează.",
                    "Attention, where it matters.",
                  )}
                </h2>
              </div>
              <span className="badge coral">
                3 {tr("instalații · replay", "sites · replay")}
              </span>
            </div>
            <div className="fleet-table" role="table">
              <div className="fleet-row fleet-heading" role="row">
                <span>{tr("Instalație / adaptor", "Site / adapter")}</span>
                <span>{tr("Abatere 7 zile", "7-day residual")}</span>
                <span>{tr("Semnal candidat", "Candidate signature")}</span>
                <span>{tr("Expunere / zi", "Exposure / day")}</span>
                <span>{tr("Dovezi", "Evidence")}</span>
                <span />
              </div>
              {fleet.map((f, i) => (
                <motion.button
                  key={f.id}
                  type="button"
                  className="fleet-row"
                  whileTap={reduced ? undefined : { scale: 0.97 }}
                  onPointerDown={(e) => {
                    if (!reduced)
                      e.currentTarget.style.transform = "scale(.97)";
                  }}
                  onPointerUp={(e) => (e.currentTarget.style.transform = "")}
                  onClick={(e) => openCase(f.id, e.currentTarget)}
                >
                  <span className="site-cell">
                    <b className="site-glyph">0{i + 1}</b>
                    <span>
                      <strong>
                        Site {f.id} · {names[f.id]}
                      </strong>
                      <small>
                        {brands[f.id]} · {s.commercial ? 250 : 6} kWp
                        <br />
                        35° tilt · 0° azimuth
                      </small>
                    </span>
                  </span>
                  <strong
                    className={
                      f.residual !== null && f.residual < -0.12
                        ? "coral"
                        : "battery"
                    }
                  >
                    {pct(f.residual)}
                  </strong>
                  <span>
                    {signature(f.id)}
                    <small>
                      {f.id === "B"
                        ? "Elena P."
                        : f.id === "A"
                          ? "Andrei M."
                          : "Mihai R."}{" "}
                      · CANDIDATE
                    </small>
                  </span>
                  <span>
                    <b>
                      {fmt(
                        f.f.pvExposure === null ? null : f.f.pvExposure / 7,
                        2,
                      )}{" "}
                      RON
                    </b>
                    <small>
                      {fmt(f.f.shortfall === null ? null : f.f.shortfall / 7)}{" "}
                      kWh
                    </small>
                  </span>
                  <span>
                    <span className="badge green">
                      {fmt(f.coverage * 100, 0)}%
                    </span>
                    <small>
                      {tr("Replay istoric", "Historical replay")}
                      <br />
                      {f.recent.at(-1)?.date}
                    </small>
                  </span>
                  <ArrowUpRight size={20} />
                </motion.button>
              ))}
            </div>
            <p className="caption">
              {tr(
                "Prioritate = |abatere PV| × expunere RON conform contractului × acoperire. Problema de dispatch se evaluează separat.",
                "Priority = |PV residual| × contract-aware RON exposure × coverage. Dispatch issues are evaluated separately.",
              )}
            </p>
          </>,
          "fleet-main",
          true,
        )}
        {card(
          <>
            <span className="eyebrow coral">
              {tr("DOVEZI ÎNAINTE DE ACȚIUNE", "EVIDENCE BEFORE ACTION")}
            </span>
            <h2>
              {tr(
                "Un semnal nu este un diagnostic.",
                "A signal is not a diagnosis.",
              )}
            </h2>
            <p>
              {tr(
                "Verificăm geometria, continuitatea datelor și limitele hardware. Tehnicianul decide următorul pas.",
                "Check geometry, data continuity and hardware limits. The technician decides the next step.",
              )}
            </p>
            <div className="big-ratio">
              14 <small>{tr("zile de context", "days of context")}</small>
            </div>
            <span className="badge">Huawei · Deye · Fronius</span>
          </>,
          "fleet-aside",
          false,
        )}
      </div>
    );
  }
  function diagnostics(inSheet = false) {
    const checks = [
      [
        "Channel completeness",
        totals.complete
          ? tr("Acoperire completă în replay", "Complete replay coverage")
          : tr("Date insuficiente", "Insufficient data"),
        totals.complete,
      ],
      [
        "PVGIS geometry match",
        (s.commercial ? "250" : "6") +
          " kWp / 35° / 0° · " +
          tr("scenariu potrivit", "matched scenario"),
        true,
      ],
      [
        "Inverter AC rating",
        tr(
          "Rating / tensiune AC neconfirmate",
          "AC rating / voltage unconfirmed",
        ),
        false,
      ],
      [
        "Smart meter cross-check",
        tr(
          "Canal simulat, nu verificare independentă",
          "Simulated channel, not independent verification",
        ),
        false,
      ],
      [
        "Battery SoC conservation",
        "95% round-trip · " + tr("normalizat frontend", "frontend normalized"),
        true,
      ],
    ];
    return (
      <div className={"diagnostic-content " + (inSheet ? "in-sheet" : "")}>
        <div className="diagnostic-hero">
          <span className="badge coral">{signature(s.site)}</span>
          <h2>
            {tr("De la semnal la certitudine.", "From signal to certainty.")}
          </h2>
          <p>
            {tr(
              "Candidat, nu cauză fizică demonstrată.",
              "A candidate, not a proven physical cause.",
            )}
          </p>
        </div>
        <div className="state-stepper" aria-label="Case workflow">
          {states.map((st, i) => (
            <span
              key={st}
              className={
                current.status === st
                  ? "current"
                  : states.indexOf(current.status) > i
                    ? "done"
                    : ""
              }
            >
              <i>
                {states.indexOf(current.status) > i ? (
                  <Check size={10} />
                ) : (
                  i + 1
                )}
              </i>
              {st.replaceAll("_", " ")}
            </span>
          ))}
        </div>
        <div className="diagnostic-columns">
          <section>
            <h3>
              {tr("Verificări deterministe", "Deterministic cross-checks")}
            </h3>
            <div className="checks">
              {checks.map(([a, b, ok]) => (
                <div key={String(a)}>
                  {ok ? (
                    <CheckCircle2 className="battery" size={17} />
                  ) : (
                    <TriangleAlert className="solar" size={17} />
                  )}
                  <span>
                    <b>{a}</b>
                    <small>{b}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="ai-brief">
              <span className="eyebrow">
                {tr(
                  "BRIEF STRUCTURAT · REGULI LOCALE, FĂRĂ LLM LIVE",
                  "STRUCTURED BRIEF · LOCAL RULES, NO LIVE LLM",
                )}
              </span>
              <h4>{tr("Observații măsurate", "Measured facts")}</h4>
              <p>
                {last.date} · {pct(last.residual)}{" "}
                {tr("față de model;", "versus model;")}{" "}
                {M.persistence(days, threshold)}{" "}
                {tr(
                  "zile consecutive sub prag. Telemetrie simulată.",
                  "consecutive days below threshold. Simulated telemetry.",
                )}
              </p>
              <h4>{tr("Ipoteze candidate", "Candidate hypotheses")}</h4>
              <p>
                {s.site === "A"
                  ? tr(
                      "Limită de export, plafonare AC sau tensiune de rețea.",
                      "Export limit, AC clipping or grid voltage.",
                    )
                  : s.site === "B"
                    ? tr(
                        "Program orar nepotrivit, rezervă sau mod tarifar.",
                        "Mistimed schedule, reserve or tariff mode.",
                      )
                    : tr(
                        "Umbrire / murdărie, limitare de export sau configurație greșită.",
                        "Shading / soiling, export limitation or configuration error.",
                      )}
              </p>
              <h4>
                {tr(
                  "Verificări înainte de deplasare",
                  "Checks before a site visit",
                )}
              </h4>
              <p>
                {tr(
                  "Confirmă ratingul AC, alarmele, tensiunea, configurația exportului și SoC în aplicația instalatorului.",
                  "Confirm AC rating, alarms, voltage, export configuration and SoC in the installer app.",
                )}
              </p>
            </div>
          </section>
          <section className="assessment">
            <h3>{tr("Evaluarea tehnicianului", "Technician assessment")}</h3>
            <label className="field-label">
              {tr("Decizie", "Decision")}
              <select
                value={current.decision}
                disabled={!!current.receipt || busy}
                onChange={(e) =>
                  updateCase({ decision: e.target.value, status: "CANDIDATE" })
                }
              >
                <option value="">
                  {tr("Alege o evaluare", "Choose assessment")}
                </option>
                <option value="anomaly">
                  {tr("Confirmă anomalie", "Confirm anomaly")}
                </option>
                <option value="normal">
                  {tr(
                    "Condiție normală de operare",
                    "Normal operating condition",
                  )}
                </option>
                <option value="insufficient">
                  {tr("Date insuficiente", "Insufficient data")}
                </option>
              </select>
            </label>
            <label className="field-label">
              {tr("Note de verificare", "Review notes")}
              <textarea
                rows={3}
                value={current.notes}
                onChange={(e) => updateCase({ notes: e.target.value })}
                placeholder={tr(
                  "Ce ai verificat concret?",
                  "What did you actually check?",
                )}
              />
            </label>
            {["CANDIDATE", "REOPENED"].includes(current.status) && (
              <Press
                className="secondary full"
                disabled={!current.decision}
                onClick={() => changeStatus("REVIEWED")}
              >
                <Check size={16} />
                {tr("Salvează evaluarea", "Save assessment")}
              </Press>
            )}
            <Press
              className="action full"
              disabled={
                !!current.receipt ||
                busy ||
                current.status !== "REVIEWED" ||
                current.decision !== "anomaly" ||
                !totals.complete ||
                current.uncertain
              }
              onClick={() => void createTicket()}
            >
              {current.receipt ? <Check size={16} /> : <Send size={16} />}{" "}
              {busy
                ? tr("Se înregistrează…", "Registering…")
                : current.receipt
                  ? tr("Ticket înregistrat", "Ticket registered")
                  : tr("Creează Ticket O&M", "Create O&M ticket")}
            </Press>
            {current.uncertain && (
              <p className="notice coral">
                {tr(
                  "Confirmare incertă. Verifică SQLite înainte de a relua cererea.",
                  "Confirmation uncertain. Reconcile SQLite before retry.",
                )}
              </p>
            )}
            <AnimatePresence>
              {current.receipt && (
                <motion.div
                  className="receipt"
                  initial={{
                    opacity: 0,
                    y: reduced ? 0 : 18,
                    scale: reduced ? 1 : 0.96,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={reduced ? { duration: 0.15 } : sheetSpring}
                >
                  <div className="receipt-head">
                    <div className="receipt-mark">
                      <Check size={24} />
                    </div>
                    <span>
                      ONE ENERGY VIEW<small>DESTINATION RECEIPT</small>
                    </span>
                    <ShieldCheck size={22} />
                  </div>
                  <h3>
                    {tr(
                      "Intervenție înregistrată.",
                      "Intervention registered.",
                    )}
                  </h3>
                  <div className="receipt-line">
                    <span>Case / idempotency_key</span>
                    <code>{current.receipt.case_id}</code>
                  </div>
                  <div className="receipt-line">
                    <span>{tr("Destinație", "Destination")}</span>
                    <b>{current.receipt.destination}</b>
                  </div>
                  <div className="receipt-line">
                    <span>Timestamp</span>
                    <b>
                      {new Date(current.receipt.created_at).toLocaleString(
                        "ro-RO",
                      )}
                    </b>
                  </div>
                  <span className="badge green">{current.receipt.status}</span>
                  <p>
                    {tr(
                      "Confirmă înregistrarea, nu reparația sau economiile.",
                      "Proves registration, not repair or realized savings.",
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {current.status === "ACTION_ACCEPTED" && (
              <Press
                className="secondary full"
                onClick={() => changeStatus("IN_PROGRESS")}
              >
                {tr("Începe intervenția", "Start intervention")}
              </Press>
            )}
            {current.receipt && current.status === "REVIEWED" && (
              <Press
                className="secondary full"
                onClick={() => changeStatus("IN_PROGRESS")}
              >
                {tr(
                  "Reia intervenția existentă",
                  "Resume existing intervention",
                )}
              </Press>
            )}
            {current.status === "VERIFIED" && (
              <Press
                className="secondary full"
                onClick={() => changeStatus("REOPENED")}
              >
                {tr("Redeschide cazul", "Reopen case")}
              </Press>
            )}
            {current.status === "IN_PROGRESS" && (
              <Press
                className="secondary full"
                onClick={() => changeStatus("RESOLVED_PENDING_CHECK")}
              >
                {tr(
                  "Rezolvat · așteaptă verificare",
                  "Resolved · pending check",
                )}
              </Press>
            )}
            {current.status === "RESOLVED_PENDING_CHECK" && (
              <div className="split">
                <Press
                  className="secondary"
                  onClick={() => {
                    changeStatus("VERIFIED");
                    setMessage(
                      tr(
                        "Doar workflow demonstrativ verificat; rezultatul financiar rămâne Pending.",
                        "Demo workflow checked only; financial outcome remains Pending.",
                      ),
                    );
                  }}
                >
                  {tr("Verificare demo", "Demo check")}
                </Press>
                <Press
                  className="secondary"
                  onClick={() => changeStatus("REOPENED")}
                >
                  {tr("Redeschide", "Reopen")}
                </Press>
              </div>
            )}
            <details>
              <summary>
                {tr("Cheie stabilă și istoric", "Stable key and history")}
              </summary>
              <code className="key-block">{caseID}</code>
              {current.history.map((h, i) => (
                <p className="caption" key={i}>
                  {h.status} · {h.at}
                </p>
              ))}
            </details>
          </section>
        </div>
      </div>
    );
  }
  async function importCSV(file: File, kind: string) {
    try {
      const parsed = M.parseCSV(await file.text(), kind),
        map = M.importMap(parsed, kind);
      if (
        !Object.keys(map).some((stamp) =>
          data.timeseries.some(
            (r) => new Date(r.timestamp).toISOString() === stamp,
          ),
        )
      )
        throw Error("No overlapping replay timestamps");
      setPreview({ kind, map, count: parsed.length });
    } catch (e) {
      setMessage(String(e));
    }
  }
  function connections() {
    const adapters = [
      [
        "Huawei FusionSolar",
        "pyhfs Northbound · 1 call/min · session queue",
        "PV · BESS · SoC · grid",
        "Mock · no active session",
      ],
      [
        "Fronius Solar API",
        "/solar_api/v1/GetPowerFlowRealtimeData.fcgi",
        "PV · meter · BESS capability-dependent",
        "Mock · local interface reference",
      ],
      [
        "Deye / Solarman",
        "Authorized gateway adapter",
        "PV · SoC · AC power",
        "Mock · access required",
      ],
      [
        "Smart Meter / CSV",
        "Normalized hourly import",
        "Consumption · grid import/export",
        "Simulated / custom CSV",
      ],
      [
        "EU JRC PVGIS",
        "Geometry cache · historical 2020",
        "Expected hourly PV · 35° tilt",
        "Cached historical model",
      ],
      [
        "OPCOM / Contract JSON",
        "PZU intervals + independent retail policy",
        "RON/MWh · import/export rule",
        "Scenario · contract not verified",
      ],
    ];
    return (
      <>
        <div className="connections-grid">
          {adapters.map(([title, url, ch, status]) => (
            <Card key={title} stage={stage} focus={title === "EU JRC PVGIS"}>
              <div className="card-title">
                <Plug size={22} className="cyan" />
                <span className="badge">
                  {tr("Referință / replay", "Reference / replay")}
                </span>
              </div>
              <h3>{title}</h3>
              <code>{url}</code>
              <p className="muted">{ch}</p>
              <p className="caption">
                {status}
                <br />
                {tr("Ultima sursă", "Source timestamp")}: {data.fetched_at}
                <br />
                {tr(
                  "Fără poll live sau blocare activă",
                  "No live poll or active lock",
                )}
              </p>
            </Card>
          ))}
        </div>
        <Card className="import-card">
          <div>
            <span className="eyebrow">BRING YOUR OWN SIGNAL</span>
            <h2>
              {tr("Datele tale. Același format.", "Your data. Same language.")}
            </h2>
            <p className="muted">
              {tr(
                "CSV rămâne în browser. Importul actualizează graficele și proveniența.",
                "CSV stays in the browser. Imports update charts and provenance.",
              )}
            </p>
          </div>
          <div className="import-actions">
            {["load", "price"].map((kind) => (
              <label className="file-button" key={kind}>
                <Upload size={16} />
                {kind === "load"
                  ? "normalized-load.csv"
                  : "normalized-opcom.csv"}
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void importCSV(f, kind);
                    e.target.value = "";
                  }}
                />
              </label>
            ))}
            <label className="file-button">
              <Upload size={16} />
              dashboard.json
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  try {
                    const f = e.target.files?.[0];
                    if (f) {
                      setData(M.validate(JSON.parse(await f.text())));
                      patch({ imports: {} });
                      setOrigin("Custom dashboard.json");
                    }
                  } catch (err) {
                    setMessage(String(err));
                  }
                }}
              />
            </label>
          </div>
          {preview && (
            <div className="csv-preview">
              <b>
                {preview.count} {tr("rânduri validate", "validated rows")} ·{" "}
                {preview.kind}
              </b>
              <pre>
                {JSON.stringify(
                  Object.entries(preview.map).slice(0, 3),
                  null,
                  2,
                )}
              </pre>
              <Press
                className="action"
                onClick={() => {
                  patch({
                    imports:
                      preview.kind === "price"
                        ? { ...s.imports, prices: preview.map }
                        : {
                            ...s.imports,
                            loads: {
                              ...s.imports.loads,
                              [s.site]: preview.map,
                            },
                          },
                  });
                  setPreview(null);
                  setMessage(
                    tr(
                      "Import aplicat în browser.",
                      "Import applied in browser.",
                    ),
                  );
                }}
              >
                {tr("Aplică importul", "Apply import")}
              </Press>
            </div>
          )}
          <Press className="text-action" onClick={() => patch({ imports: {} })}>
            {tr("Resetează importurile", "Reset imports")}
          </Press>
        </Card>
      </>
    );
  }
  const title =
    s.view === "overview"
      ? tr("Energia ta. Într-o singură privire.", "Your energy. In one view.")
      : s.view === "performance"
        ? tr("Vezi ce lipsea din imagine.", "See what was missing.")
        : s.view === "schedule"
          ? tr("Mai mult din fiecare kilowatt.", "More from every kilowatt.")
          : s.view === "fleet"
            ? tr(
                "Imaginea de ansamblu. Fiecare detaliu.",
                "The bigger picture. Every detail.",
              )
            : s.view === "costs"
              ? tr(
                  "Patru registre. Fără confuzii.",
                  "Four ledgers. No confusion.",
                )
              : s.view === "case"
                ? tr(
                    "Dovezi. Decizie. Intervenție.",
                    "Evidence. Decision. Action.",
                  )
                : tr(
                    "Surse clare. Date de încredere.",
                    "Clear sources. Trusted data.",
                  );
  return (
    <MotionConfig reducedMotion="user">
      <div className={"app " + (stage ? "stage" : "")}>
        <header className="topbar">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigation("overview");
            }}
          >
            <span className="brand-mark">
              <Zap size={19} fill="currentColor" />
            </span>
            <span>
              ONE ENERGY VIEW<small>ENERGY, IN PERSPECTIVE.</small>
            </span>
          </a>
          <div className="header-center">
            <span className="live-dot" />
            {tr("Spațiul tău energetic", "Your energy workspace")}
          </div>
          <div className="header-actions">
            <Press
              label={tr("Mod Prezentare Scenă", "Keynote Stage Mode")}
              className={"stage-button " + (stage ? "active" : "")}
              onClick={() => setStage(!stage)}
            >
              <Maximize2 size={15} />
              <span> {tr("Mod Prezentare Scenă", "Keynote Stage Mode")}</span>
            </Press>
            <Press
              className="tour-button"
              onClick={() => {
                setPaused(!!reduced);
                goStory(0);
              }}
            >
              <Play size={13} fill="currentColor" />
              {tr("Mod Demonstrație Juriu", "Jury guided tour")}
            </Press>
            <Press
              className="language"
              onClick={() => patch({ lang: s.lang === "ro" ? "en" : "ro" })}
            >
              <Globe size={14} />
              {s.lang.toUpperCase()}
            </Press>
          </div>
        </header>
        <main inert={sheet || insightOpen}>
          <div className="workspace-bar">
            <div className="site-control">
              <span className="site-orb">
                <Sun size={20} />
              </span>
              <label className="sr-only" htmlFor="site">
                {tr("Instalație", "Site")}
              </label>
              <motion.select
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={sheetSpring}
                id="site"
                value={s.site}
                onChange={(e) => {
                  patch({ site: e.target.value });
                  setMissing(false);
                }}
              >
                <option value="A">
                  Site A — București Nord · Huawei SUN2000
                </option>
                <option value="B">Site B — Ilfov Sud · Deye SUN-10K</option>
                <option value="C">
                  Site C — București Vest · Fronius Symo
                </option>
              </motion.select>
              <span className="capacity">
                {s.commercial ? "250" : "6"} kWp / 10 kWh
              </span>
            </div>
            <div className="workspace-right">
              <label className="commercial-toggle">
                <input
                  type="checkbox"
                  checked={s.commercial}
                  onChange={(e) =>
                    patch({
                      commercial: e.target.checked,
                      policy: e.target.checked ? "commercial" : "residential",
                    })
                  }
                />
                <span>250 kWp Commercial</span>
              </label>
              <select
                aria-label={tr("Perioadă", "Period")}
                value={s.period}
                onChange={(e) => patch({ period: e.target.value })}
              >
                <option value="day">
                  {tr("Ziua curentă · replay 24h", "Current replay day · 24h")}
                </option>
                <option value="fortnight">
                  {tr("Fereastra de 14 zile", "14-day window")}
                </option>
              </select>
            </div>
          </div>
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {s.persona === "owner"
                  ? "YOUR HOME, CONNECTED."
                  : "OPERATIONS, IN FOCUS."}
              </span>
              <h1 className="tracking-tight">{title}</h1>
              <p>
                {tr(
                  "Producție. Consum. Stocare. O imagine care are sens.",
                  "Generation. Consumption. Storage. One meaningful picture.",
                )}
              </p>
            </div>
            <Segments
              id="persona"
              value={s.persona}
              label="Persona"
              onChange={(v) => {
                patch({
                  persona: v,
                  view:
                    v === "owner" && ["fleet", "case"].includes(s.view)
                      ? "overview"
                      : s.view,
                });
                if (v === "owner") setSheet(false);
              }}
              items={[
                {
                  id: "owner",
                  label: (
                    <>
                      <House size={15} />
                      {tr("Prosumator", "Prosumer")}
                    </>
                  ),
                },
                {
                  id: "ops",
                  label: (
                    <>
                      <ScanLine size={15} />
                      {tr("Echipa O&M", "O&M Team")}
                    </>
                  ),
                },
              ]}
            />
          </div>
          <nav>
            <Segments
              id="navigation"
              value={s.view}
              label={tr("Ecrane", "Views")}
              onChange={navigation}
              items={views
                .filter(
                  (v) =>
                    s.persona === "ops" || !["fleet", "case"].includes(v.id),
                )
                .map((v) => ({
                  id: v.id,
                  label: (
                    <>
                      <v.icon size={16} />
                      {s.lang === "ro" ? v.ro : v.en}
                    </>
                  ),
                }))}
            />
            <span className="nav-context">
              {names[s.site]} <span>·</span>{" "}
              {s.period === "day" ? last.date : "01–14 JUN 2020"}
            </span>
          </nav>
          <div className="content">
            <AnimatePresence mode="popLayout" initial={false}>
              <ScreenTransition key={s.view} reduced={!!reduced}>
                {s.view === "overview" ? (
                  overview()
                ) : s.view === "performance" ? (
                  <div className="performance-grid">
                    {card(performance(), "main-performance", true)}
                    {card(
                      <>
                        <span className="eyebrow">SIGNAL QUALITY</span>
                        <h3>
                          {tr(
                            "Persistență, nu zgomot.",
                            "Persistence, not noise.",
                          )}
                        </h3>
                        <div className="big-ratio coral">
                          {M.persistence(days, threshold)}
                          <small>
                            {tr("zile consecutive", "consecutive days")}
                          </small>
                        </div>
                        <label className="field-label">
                          {tr("Prag abatere", "Residual threshold")} {threshold}
                          %
                          <input
                            type="range"
                            min={-30}
                            max={-5}
                            value={threshold}
                            onChange={(e) => setThreshold(+e.target.value)}
                          />
                        </label>
                        <label className="toggle-row">
                          <span>
                            {tr(
                              "Simulează poll lipsă",
                              "Simulate missing poll",
                            )}
                            <small>
                              {tr(
                                "Gol, niciodată zero producție",
                                "A gap, never zero production",
                              )}
                            </small>
                          </span>
                          <input
                            type="checkbox"
                            checked={missing}
                            onChange={(e) => setMissing(e.target.checked)}
                          />
                        </label>
                        <p className="caption">
                          {tr(
                            "Zilele 1–7 sănătos · zilele 8–14 anomalie injectată. Model istoric geometry-matched, nu forecast meteo actual.",
                            "Days 1–7 healthy · days 8–14 injected fault. Geometry-matched historical model, not a current weather forecast.",
                          )}
                        </p>
                        <Press
                          className="action full"
                          onClick={() => openCase(s.site)}
                        >
                          {tr("Inspectează dovezile", "Inspect evidence")}
                          <ArrowUpRight size={16} />
                        </Press>
                      </>,
                      "signal-card",
                      false,
                    )}
                    <div className="studio-embed">
                      <RoofClimatologySection
                        lang={s.lang}
                        annualReplayLoad={annualReplayLoad}
                        data={data}
                        controls={controls}
                        imports={s.imports}
                        activeSite={s.site}
                        onSelectSite={selectBuilding}
                        onDiagnostic={(id) => openCase(id)}
                      />
                    </div>
                  </div>
                ) : s.view === "schedule" ? (
                  schedule()
                ) : s.view === "costs" ? (
                  costs()
                ) : s.view === "fleet" ? (
                  fleetView()
                ) : s.view === "case" ? (
                  <>
                    {card(diagnostics(), "case-page", true)}
                    <div className="studio-embed">
                      <AdvisorSection site={s.site} lang={s.lang} />
                    </div>
                  </>
                ) : (
                  connections()
                )}
              </ScreenTransition>
            </AnimatePresence>
          </div>
          <footer>
            <div>
              <span className="provenance-dot" />
              PVGIS JRC: {String(
                data.sources.pvgis?.kind || "historical",
              )} 2020 <span>·</span> Telemetry: simulated replay <span>·</span>{" "}
              Tariff: scenario policy{" "}
              {Object.keys(s.imports).length > 0 && (
                <b className="cyan"> · Custom CSV overlay</b>
              )}
            </div>
            <span>
              {origin} · {server ? "SQLite connected" : "Local browser mode"}
            </span>
          </footer>
          {s.commercial && (
            <div className="scenario-note">
              250 kWp{" "}
              {tr(
                "scenariu: PV ×41,67 / consum ×30; BESS ilustrativ 10 kWh. Nu dimensionare reală.",
                "scenario: PV ×41.67 / load ×30; illustrative 10 kWh BESS. Not real sizing.",
              )}
            </div>
          )}
          {!storageOK && (
            <div className="notice coral">
              {tr(
                "Stocarea locală indisponibilă. Datele interactive rămân doar în această sesiune.",
                "Local storage unavailable. Interactive state is session-only.",
              )}
            </div>
          )}
        </main>
        <AnimatePresence>
          {(sheet || insightOpen) && (
            <DiagnosticSheet
              anchor={anchor}
              close={closeSheet}
              title={
                insightOpen
                  ? tr(
                      s.site === "B"
                        ? "Un program mai bun pentru baterie"
                        : "De ce este producția sub model",
                      s.site === "B"
                        ? "A better battery schedule"
                        : "Why production is below the model",
                    )
                  : "Site " + s.site + " · " + names[s.site]
              }
              eyebrow={
                insightOpen
                  ? tr("UN SEMNAL, O ACȚIUNE", "ONE SIGNAL, ONE ACTION")
                  : undefined
              }
              reduced={!!reduced}
            >
              {insightOpen ? insightDetails() : diagnostics(true)}
            </DiagnosticSheet>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {tour !== null && (
            <motion.aside
              className="tour-panel"
              initial={{ opacity: 0, y: reduced ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="tour-step">
                0{tour + 1}
                <small>/ 05</small>
              </div>
              <div>
                <span className="eyebrow">
                  KEYNOTE STORY ·{" "}
                  {reduced ? "MANUAL · REDUCED MOTION" : "60 SECONDS"}
                </span>
                <strong>{story[tour].title}</strong>
                {tour === 3 && (
                  <small>
                    {tr(
                      "Evaluarea și ticketul necesită confirmarea ta în fișa de diagnostic.",
                      "Assessment and ticket require your explicit confirmation in the diagnostic sheet.",
                    )}
                  </small>
                )}
              </div>
              <div className="tour-controls">
                <Press
                  className="icon-button"
                  disabled={tour === 0}
                  onClick={() => goStory(Math.max(0, tour - 1))}
                  label="Previous"
                >
                  <ArrowLeft size={17} />
                </Press>
                <Press
                  className="icon-button"
                  onClick={() => setPaused(!paused)}
                  label={paused ? "Play" : "Pause"}
                >
                  {paused ? <Play size={17} /> : <Pause size={17} />}
                </Press>
                <Press
                  className="icon-button"
                  onClick={() =>
                    tour < 4
                      ? goStory(tour + 1)
                      : (setTour(null), setSheet(false))
                  }
                  label="Next"
                >
                  <ArrowRight size={17} />
                </Press>
                <Press
                  className="icon-button"
                  onClick={() => {
                    setTour(null);
                    setSheet(false);
                  }}
                  label="Close tour"
                >
                  <X size={17} />
                </Press>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {message && (
            <motion.div
              role="status"
              className="toast"
              initial={{ opacity: 0, y: reduced ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
const ScreenTransition = forwardRef<
  HTMLDivElement,
  { children: ReactNode; reduced: boolean }
>(function ScreenTransition({ children, reduced }, ref) {
  const present = useIsPresent();
  return (
    <motion.div
      ref={ref}
      role="tabpanel"
      inert={!present}
      aria-hidden={!present}
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
});

function LineChart({
  series,
  colors,
  ceiling,
  labels,
  unit = "kWh",
}: {
  series: (number | null)[][];
  colors: string[];
  ceiling?: number;
  labels: string[];
  unit?: string;
}) {
  const max =
      ceiling ||
      Math.max(1, ...series.flat().filter((v): v is number => v !== null)) *
        1.15,
    n = Math.max(...series.map((s) => s.length)),
    x = (i: number) => 45 + (i / Math.max(1, n - 1)) * 835,
    y = (v: number) => 205 - (v / max) * 170;
  return (
    <svg
      className="line-chart"
      viewBox="0 0 920 240"
      role="img"
      aria-label={"Chart " + unit}
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={colors[0]} stopOpacity=".15" />
          <stop offset="1" stopColor={colors[0]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line
            x1="45"
            x2="880"
            y1={y(t * max)}
            y2={y(t * max)}
            stroke="white"
            strokeOpacity=".065"
          />
          <text x="0" y={y(t * max) + 4}>
            {fmt(t * max, 0)}
          </text>
        </g>
      ))}
      {series.map((s, j) => (
        <path
          key={j}
          d={s
            .map((v, i) =>
              v === null
                ? ""
                : `${i === 0 || s[i - 1] === null ? "M" : "L"}${x(i)},${y(v)}`,
            )
            .join(" ")}
          fill="none"
          stroke={colors[j]}
          strokeWidth={j === 0 ? 2 : 3}
          strokeDasharray={j === 0 ? "5 6" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {labels.map((l, i) =>
        i % Math.max(1, Math.floor(n / 6)) === 0 || i === n - 1 ? (
          <text key={i} x={x(i)} y="233" textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}
function Performance({
  days,
  active,
  index,
  onIndex,
  money,
  compact,
  tr,
}: {
  days: Day[];
  active: Day;
  index: number;
  onIndex: (v: number) => void;
  money: number | null;
  compact: boolean;
  tr: (a: string, b: string) => string;
}) {
  const top = Math.max(...days.map((d) => d.expected)) * 1.15,
    n = days.length,
    x = (i: number) => 38 + (i / (n - 1)) * 824,
    y = (v: number) => 195 - (v / top) * 155;
  return (
    <>
      <div className="card-title">
        <div>
          <span className="eyebrow">PVGIS × TELEMETRY</span>
          <h2>
            {compact
              ? tr("Când apare diferența.", "When the gap appears.")
              : tr("Același soare. Două curbe.", "Same sun. Two stories.")}
          </h2>
        </div>
        <span className="badge">14 {tr("zile", "days")}</span>
      </div>
      <div className="chart-legend">
        <span>
          <i className="dot solar-dot" />
          PVGIS expected
        </span>
        <span>
          <i className="dot blue-dot" />
          {tr("PV observat", "Actual PV")}
        </span>
        <span>
          <i className="dot coral-dot" />
          {tr("Anomalie injectată", "Injected anomaly")}
        </span>
      </div>
      <div className="scrub-chart">
        <svg
          viewBox="0 0 900 245"
          role="img"
          aria-label="14-day actual versus expected PV"
        >
          <defs>
            <linearGradient id="pv-area" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#0A84FF" stopOpacity=".22" />
              <stop offset="1" stopColor="#0A84FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x={x(6.5)}
            y="10"
            width={x(13) - x(6.5)}
            height="188"
            fill="#FF453A"
            opacity=".035"
          />
          {[0, 0.33, 0.66, 1].map((t) => (
            <g key={t}>
              <line
                x1="38"
                x2="862"
                y1={y(top * t)}
                y2={y(top * t)}
                stroke="white"
                strokeOpacity=".07"
              />
              <text x="0" y={y(top * t) + 4}>
                {fmt(top * t, 0)}
              </text>
            </g>
          ))}
          <text x="55" y="20" fill="#30D158">
            01—07 · HEALTHY
          </text>
          <text x="650" y="20" fill="#FF453A">
            08—14 · DIVERGENCE
          </text>
          {days.every((d) => d.complete) && (
            <path
              d={
                "M" +
                x(0) +
                ",195 " +
                days.map((d, i) => `L${x(i)},${y(d.pv ?? 0)}`).join(" ") +
                " L" +
                x(n - 1) +
                ",195 Z"
              }
              fill="url(#pv-area)"
            />
          )}
          {[
            { key: "expected" as const, color: "#FFD60A", dash: "5 6" },
            { key: "pv" as const, color: "#0A84FF", dash: undefined },
          ].map((s) => (
            <path
              key={s.key}
              d={days
                .map((d, i) =>
                  d[s.key] === null
                    ? ""
                    : `${i === 0 || days[i - 1][s.key] === null ? "M" : "L"}${x(i)},${y(d[s.key]!)}`,
                )
                .join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="3"
              strokeDasharray={s.dash}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {days.map((d, i) =>
            d.complete ? (
              <circle
                key={i}
                cx={x(i)}
                cy={y(d.pv!)}
                r={i === index ? 5 : 2.8}
                fill={i >= 7 ? "#FF453A" : "#0A84FF"}
                stroke={i === index ? "white" : "none"}
                strokeWidth="2"
              />
            ) : (
              <g key={i}>
                <rect
                  x={x(i) - 12}
                  y="30"
                  width="24"
                  height="170"
                  fill="#7b8190"
                  opacity=".2"
                />
                <text x={x(i)} y="100" textAnchor="middle">
                  ?
                </text>
              </g>
            ),
          )}
          {days.map((_, i) => (
            <text key={i} x={x(i)} y="232" textAnchor="middle">
              {String(i + 1).padStart(2, "0")}
            </text>
          ))}
        </svg>
        <PhysicalTrack
          min={0}
          max={n - 1}
          value={index}
          onChange={onIndex}
          kind="timeline"
          label={tr(
            "Ziua selectată din seria de 14 zile",
            "Selected day in 14-day time series",
          )}
        />
      </div>
      <div className="scrub-readout" aria-live="polite">
        <div>
          <small>{active.date}</small>
          <strong>
            {active.complete ? fmt(active.pv) : "—"} <em>kWh</em>
          </strong>
        </div>
        <div>
          <small>PVGIS expected</small>
          <strong className="solar">
            {fmt(active.expected)} <em>kWh</em>
          </strong>
        </div>
        <div>
          <small>{tr("Abatere", "Residual")}</small>
          <strong
            className={
              active.residual !== null && active.residual < -0.12
                ? "coral"
                : "battery"
            }
          >
            {pct(active.residual)}
          </strong>
        </div>
        {!compact && (
          <div>
            <small>
              {tr("Expunere PV · estimată", "PV exposure · estimate")}
            </small>
            <strong>
              {fmt(money, 2)} <em>RON</em>
            </strong>
          </div>
        )}
      </div>
      {!active.complete && (
        <div className="notice coral">
          {tr(
            "Date insuficiente · poll lipsă, nu zero producție",
            "Insufficient data · missing poll, not zero production",
          )}
        </div>
      )}
      {!compact && (
        <div className="residual-band">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => onIndex(i)}
              className={i === index ? "selected" : ""}
              style={{
                background:
                  d.residual === null
                    ? "#3e4149"
                    : d.residual < -0.12
                      ? "#ff453a30"
                      : "#30d15820",
                color:
                  d.residual === null
                    ? "#a3a3ad"
                    : d.residual < -0.12
                      ? "#FF453A"
                      : "#30D158",
              }}
              aria-label={d.date + " residual " + pct(d.residual)}
            >
              <small>{i + 1}</small>
              <b>
                {d.residual === null ? "?" : fmt(d.residual * 100, 0) + "%"}
              </b>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function EnergyFlow({
  totals: t,
  brand,
  tr,
}: {
  totals: ReturnType<typeof M.totals>;
  brand: string;
  tr: (a: string, b: string) => string;
}) {
  const reduce = useReducedMotion();
  const nodes = [
    {
      x: 80,
      y: 135,
      label: tr("Panouri PV", "Solar PV"),
      value: fmt(t.pv) + " kWh",
      color: "#FFD60A",
      icon: Sun,
    },
    {
      x: 340,
      y: 135,
      label: brand,
      value: tr("Invertor", "Inverter"),
      color: "#e4e4eb",
      icon: Zap,
    },
    {
      x: 610,
      y: 135,
      label: tr("Casă · Consum", "Home · Load"),
      value: fmt(t.load) + " kWh",
      color: "#0A84FF",
      icon: House,
    },
    {
      x: 340,
      y: 325,
      label: tr("Baterie BESS", "BESS storage"),
      value: fmt(t.soc, 0) + "% SoC",
      color: "#30D158",
      icon: Battery,
    },
    {
      x: 610,
      y: 325,
      label: tr("Rețea", "Grid"),
      value: "↓ " + fmt(t.imp) + " / ↑ " + fmt(t.exp) + " kWh",
      color: "#64D2FF",
      icon: Plug,
    },
  ];
  const paths = [
    { d: "M145 135 H275", color: "#FFD60A", id: "pv" },
    { d: "M405 135 H545", color: "#0A84FF", id: "load" },
    { d: "M340 200 V260", color: "#30D158", id: "bess" },
    { d: "M405 155 C480 155 460 325 545 325", color: "#64D2FF", id: "grid" },
  ];
  return (
    <svg
      className="energy-flow"
      viewBox="0 0 720 425"
      role="img"
      aria-label="Solar panels to inverter, home, battery and grid"
    >
      <defs>
        {nodes.map((n, i) => (
          <radialGradient key={i} id={"node-glow-" + i}>
            <stop stopColor={n.color} stopOpacity=".15" />
            <stop offset="1" stopColor={n.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {paths.map((p) => (
        <g key={p.id}>
          <path
            id={"flow-" + p.id}
            d={p.d}
            stroke={p.color}
            strokeOpacity=".18"
            strokeWidth="2"
            fill="none"
          />
          {!reduce &&
            [0, 1, 2].map((i) => (
              <circle key={i} r="3" fill={p.color}>
                <animateMotion
                  dur="3s"
                  begin={-i + "s"}
                  repeatCount="indefinite"
                >
                  <mpath href={"#flow-" + p.id} />
                </animateMotion>
              </circle>
            ))}
        </g>
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="80" fill={"url(#node-glow-" + i + ")"} />
          <rect
            x={n.x - 48}
            y={n.y - 48}
            width="96"
            height="96"
            rx="28"
            fill="#1c1c20"
            stroke={n.color}
            strokeOpacity=".23"
          />
          <foreignObject x={n.x - 15} y={n.y - 15} width="30" height="30">
            <n.icon size={30} color={n.color} strokeWidth={1.5} />
          </foreignObject>
          <text x={n.x} y={n.y + 75} textAnchor="middle" className="flow-label">
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 96}
            textAnchor="middle"
            fill={n.color}
            className="flow-value"
          >
            {n.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
function DispatchBars({ rows, deltas }: { rows: Row[]; deltas: number[] }) {
  const eta = Math.sqrt(0.95),
    ac = (d: number) => (d >= 0 ? d / eta : d * eta);
  return (
    <svg
      viewBox="0 0 920 110"
      className="dispatch-bars"
      role="img"
      aria-label="Observed and feasible AC charge discharge kW"
    >
      <line x1="40" x2="880" y1="50" y2="50" stroke="#ffffff20" />
      {rows.map((r, i) => {
        const obs = ac(r.delta),
          alt = ac(deltas[i] ?? 0),
          x = 45 + i * 35;
        return (
          <g key={i}>
            <rect
              x={x}
              y={50 - Math.max(0, obs) * 12}
              width="10"
              height={Math.abs(obs) * 12}
              rx="2"
              fill="#6e7480"
            />
            <rect
              x={x + 12}
              y={50 - Math.max(0, alt) * 12}
              width="10"
              height={Math.abs(alt) * 12}
              rx="2"
              fill={alt >= 0 ? "#30D158" : "#64D2FF"}
            />
          </g>
        );
      })}
      <text x="0" y="20">
        +3
      </text>
      <text x="0" y="90">
        −3
      </text>
    </svg>
  );
}
function DiagnosticSheet({
  children,
  anchor,
  close,
  title,
  reduced,
  eyebrow = "CHECKED DIAGNOSTIC WORKFLOW",
}: {
  children: ReactNode;
  anchor: { x: number; y: number };
  close: () => void;
  title: string;
  reduced: boolean;
  eyebrow?: string;
}) {
  const dialog = useRef<HTMLDivElement>(null),
    previous = useRef<HTMLElement | null>(null),
    dragControls = useDragControls();
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key === "Tab") {
        const els = [
            ...dialog.current!.querySelectorAll<HTMLElement>(
              'button:not(:disabled),select:not(:disabled),input,textarea,summary,[tabindex="0"]',
            ),
          ].filter((el) => el.getClientRects().length > 0),
          first = els[0],
          last = els.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", key);
      previous.current?.focus();
    };
  }, [close, title]);
  return (
    <div className="sheet-layer">
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        drag={reduced ? false : "y"}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 380, bounceDamping: 28 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 650) close();
        }}
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-title"
        tabIndex={-1}
        className="diagnostic-sheet"
        style={{
          transformOrigin: `${Math.max(0, anchor.x - (window.innerWidth - Math.min(1060, window.innerWidth - 40)) / 2)}px ${Math.max(0, anchor.y - 80)}px`,
        }}
        initial={{
          opacity: 0,
          scale: reduced ? 1 : 0.86,
          y: reduced ? 0 : Math.min(100, anchor.y / 4),
          filter: reduced ? "blur(0px)" : "blur(10px)",
        }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 50 }}
        transition={reduced ? { duration: 0.15 } : sheetSpring}
      >
        <div
          className="sheet-drag-zone"
          onPointerDown={(e) => {
            if (!reduced) dragControls.start(e);
          }}
          aria-hidden="true"
        >
          <span />
        </div>
        <div className="sheet-top">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 id="diagnostic-title">{title}</h2>
          </div>
          <Press
            className="icon-button"
            onClick={close}
            label="Close diagnostic"
          >
            <X size={21} />
          </Press>
        </div>
        <div className="sheet-scroll">{children}</div>
      </motion.div>
    </div>
  );
}
function ReserveControl({
  value,
  commit,
  label,
}: {
  value: number;
  commit: (v: number) => void;
  label: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <>
      <div className="reserve-number battery">
        {fmt(draft, 0)}
        <small>%</small>
      </div>
      <PhysicalTrack
        min={20}
        max={90}
        value={draft}
        onChange={setDraft}
        onCommit={commit}
        label={label}
      />
    </>
  );
}
export default App;
