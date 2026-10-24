/** Executes the actual production bundle in a simulated DOM, not a browser.
 * This catches bundler-only initialization failures that tsc cannot catch.
 */
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import ts from "typescript";
const html = readFileSync(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(
  (m) => m[1],
);
assert(scripts.length > 0, "Production JS must be embedded");
assert(!/<script[^>]+src=/.test(html), "No external script dependency");
assert(!/<link[^>]+rel="stylesheet"/.test(html), "No external CSS dependency");
const fixture = JSON.parse(
  readFileSync(new URL("../src/fallback.json", import.meta.url), "utf8"),
);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function run(reduced = false, sqlite = false) {
  const errors = [],
    console = new VirtualConsole();
  console.on("jsdomError", (e) => errors.push(e));
  console.on("error", (e) => errors.push(e));
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
    {
      url: "http://localhost:5173",
      runScripts: "outside-only",
      pretendToBeVisual: true,
      virtualConsole: console,
    },
  );
  const w = dom.window;
  let requests = 0;
  const backendTickets = new Map();
  w.matchMedia = (q) => ({
    matches: reduced && q.includes("prefers-reduced-motion"),
    media: q,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  });
  w.fetch = async (path, opts) => {
    if (path === "/api/demo-capabilities")
      return { ok: true, json: async () => ({ sqlite_work_orders: sqlite }) };
    if (path === "/dashboard.json")
      return { ok: true, json: async () => fixture };
    if (path.startsWith("/tickets/")) {
      requests++;
      const p = JSON.parse(opts.body);
      assert.equal(p.site_id, "C");
      assert.equal(p.decision, "anomaly");
      let receipt = backendTickets.get(p.idempotency_key);
      if (!receipt) {
        receipt = {
          case_id: p.idempotency_key,
          created_at: new Date().toISOString(),
          status: "CREATED_SQLITE_LOCAL",
        };
        backendTickets.set(p.idempotency_key, receipt);
      }
      return { ok: true, json: async () => receipt };
    }
    throw Error("Unexpected request " + path);
  };
  w.AbortSignal.timeout = () => new w.AbortController().signal;
  w.Element.prototype.setPointerCapture = function (id) {
    this._capture = id;
  };
  w.Element.prototype.hasPointerCapture = function (id) {
    return this._capture === id;
  };
  w.Element.prototype.releasePointerCapture = function () {
    delete this._capture;
  };
  w.Element.prototype.getBoundingClientRect = function () {
    return {
      left: 100,
      top: 100,
      width: 700,
      height: 100,
      right: 800,
      bottom: 200,
      x: 100,
      y: 100,
      toJSON() {},
    };
  };
  for (const js of scripts) {
    // jsdom evaluates scripts, not ES modules; replace only module URL AST nodes.
    const converted = ts.transpileModule(js, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
      transformers: {
        before: [
          (context) => (root) => {
            function visit(node) {
              if (
                ts.isPropertyAccessExpression(node) &&
                ts.isMetaProperty(node.expression) &&
                node.name.text === "url"
              )
                return ts.factory.createStringLiteral("http://localhost:5173/");
              return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(root, visit);
          },
        ],
      },
    }).outputText;
    w.eval(converted.replace(/\bexport\s*\{\s*\};?\s*$/, ""));
  }
  await pause(160);
  const doc = w.document,
    body = () => doc.body.textContent;
  const find = (selector, text) =>
    [...doc.querySelectorAll(selector)].find((el) =>
      el.textContent.includes(text),
    );
  const click = async (el) => {
    assert(el, "Control exists");
    assert(!el.disabled, "Control enabled");
    el.click();
    await pause(220);
  };
  const tab = async (text) => click(find("[role=tab]", text));
  const button = async (text) => click(find("button", text));
  assert(doc.querySelector("h1"), "Production React root must render");
  assert(body().includes("Energia ta."), "Default Romanian overview");
  assert.equal(doc.querySelectorAll(".metric-card").length, 4);
  assert.equal(doc.querySelectorAll("#site option").length, 3);
  assert.equal(
    doc.querySelector(".overview-grid .ase-map-card"),
    null,
    "Removed campus card stays absent",
  );
  const insightTrigger = doc.querySelector(".insight-card .action");
  insightTrigger.focus();
  const originalEstimate = doc
    .querySelector(".insight-value")
    .textContent.trim()
    .split(/\s/)[0];
  await click(insightTrigger);
  assert(
    doc.querySelector(".insight-details"),
    "Insight card opens a contextual popup",
  );
  assert(
    doc.querySelector("main").hasAttribute("inert"),
    "Popup blocks background interaction",
  );
  assert(
    doc
      .querySelector(".insight-detail-stats strong")
      .textContent.includes(originalEstimate),
    "Popup matches the card estimate",
  );
  assert.equal(doc.querySelectorAll(".insight-checklist li").length, 3);
  assert(body().includes("Cum se calculează suma"));
  doc.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await pause(700);
  assert(
    !doc.querySelector(".insight-details"),
    "Escape dismisses insight popup",
  );
  assert.equal(
    doc.activeElement,
    insightTrigger,
    "Focus returns to the insight card",
  );
  await click(insightTrigger);
  await button("Verifică producția");
  assert(
    doc.querySelector(".main-performance"),
    "PV insight opens production review",
  );
  await tab("Acasă");
  const sitePicker = doc.querySelector("#site"),
    originalSite = sitePicker.value;
  sitePicker.value = "B";
  sitePicker.dispatchEvent(new w.Event("change", { bubbles: true }));
  await pause(120);
  const batteryEstimate = doc
    .querySelector(".insight-value")
    .textContent.trim()
    .split(/\s/)[0];
  await click(doc.querySelector(".insight-card .action"));
  assert(
    doc
      .querySelector(".insight-detail-stats strong")
      .textContent.includes(batteryEstimate),
    "Battery insight uses dispatch opportunity",
  );
  await button("Compară programul bateriei");
  assert(
    doc.querySelector(".schedule-grid"),
    "Battery insight opens scheduling",
  );
  sitePicker.value = originalSite;
  sitePicker.dispatchEvent(new w.Event("change", { bubbles: true }));
  await pause(120);
  await tab("Producție");
  let track = doc.querySelector(".main-performance [role=slider]");
  track.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  await pause(50);
  assert.equal(track.getAttribute("aria-valuenow"), "0");
  assert(body().includes("0,00"));
  track.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  await pause(50);
  assert(body().includes("-18,0%"));
  // True pointer events exercise capture, offset, cancellation and edge bounds.
  function pointer(el, type, x) {
    const e = new w.MouseEvent(type, { bubbles: true, clientX: x, button: 0 });
    Object.defineProperty(e, "pointerId", { value: 7 });
    el.dispatchEvent(e);
  }
  pointer(track, "pointerdown", 800);
  pointer(track, "pointermove", 100);
  await pause(40);
  assert.equal(track.getAttribute("aria-valuenow"), "0");
  pointer(track, "pointercancel", 100);
  await pause(50);
  assert.equal(
    track.getAttribute("aria-valuenow"),
    "13",
    "Cancel restores committed day",
  );
  // Roof geometry, tilt/azimuth sizing and climatology live in Performance.
  assert(body().includes("Scor solar euristic"));
  // 1:1 Watt's Up roof-drawing workflow on the ASE satellite image.
  assert(doc.querySelector(".roof-workshop"), "Roof workshop embedded");
  assert(body().includes("Trasează Acoperișul"));
  const mapCanvas = doc.querySelector(".rw-canvas");
  await click(doc.querySelector('[aria-label="Mărește"]'));
  assert.notEqual(
    mapCanvas.getAttribute("viewBox"),
    "0 0 1000 640",
    "Zoom changes the actual image view",
  );
  await click(doc.querySelector('[aria-label="Nord sus · resetează vederea"]'));
  assert.equal(mapCanvas.getAttribute("viewBox"), "0 0 1000 640");
  await button("Importă din locația mea");
  assert(body().includes("Localizarea nu este disponibilă"));
  let locateSuccess, locateError;
  Object.defineProperty(w.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition(success, error) {
        locateSuccess = success;
        locateError = error;
      },
    },
  });
  await button("Importă din locația mea");
  assert(
    find("button", "Se importă locația").disabled,
    "No duplicate location request while loading",
  );
  locateError({ code: 1 });
  await pause(80);
  assert(body().includes("Accesul la locație a fost refuzat"));
  await button("Importă din locația mea");
  locateSuccess({
    coords: { latitude: 44.448, longitude: 26.097, accuracy: 12 },
  });
  await pause(80);
  assert(body().includes("44.44800, 26.09700 · ±12 m"));
  assert(body().includes("Imaginea afișată rămâne ASE"));
  await button("Trasează Acoperișul");
  assert(body().includes("0/4 puncte selectate"));
  assert.equal(
    doc.querySelector(".rw-viewport .rw-center-pill"),
    null,
    "Drawing progress does not overlap map controls",
  );
  assert.equal(
    doc.querySelector(".rw-viewport .rw-toast"),
    null,
    "Drawing toast sits outside the photo",
  );
  assert.equal(
    doc.querySelector(".rw-viewport .rw-btn.draw"),
    null,
    "Drawing action sits below the photo",
  );
  assert(body().includes("Mod desen activat"), "Drawing mode toast shown");
  const rwSvg = doc.querySelector(".roof-workshop .rw-canvas");
  const rwClick = async (fx, fy) => {
    rwSvg.dispatchEvent(
      new w.MouseEvent("click", {
        bubbles: true,
        clientX: 100 + fx * 700,
        clientY: 100 + fy * 100,
        button: 0,
      }),
    );
    await pause(60);
  };
  await rwClick(0.4, 0.5);
  await rwClick(0.5, 0.47);
  assert(body().includes("2/4 puncte selectate"));
  await rwClick(0.53, 0.6);
  await rwClick(0.43, 0.63);
  assert(body().includes("Contur complet! Arie:"));
  assert(body().includes("m²"));
  await button("Analizează Acoperișul");
  await pause(900);
  assert(doc.querySelector(".rw-modal"), "Results modal opens");
  assert(body().includes("SOLAR ANALYSIS RESULTS"));
  assert(body().includes("USER-DEFINED LAYOUT"));
  assert(body().includes("4 ROOF PTS"));
  assert(body().includes("SIMULATED DEMO SAMPLE"));
  assert(body().includes("41,54 kWh"));
  const selectedSite = fixture.sites.find(
    (site) => site.site_id === doc.querySelector("#site").value,
  );
  const shortfall = new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(selectedSite.pv_shortfall_value_last_7d_ron));
  assert(
    body().includes(`${shortfall} RON`),
    "Popup uses the active Dashboard site",
  );
  assert.equal(
    doc.querySelector(".rw-modal-layer").parentElement,
    doc.body,
    "Results escape transformed and clipped map containers",
  );
  assert.equal(
    doc.body.style.overflow,
    "hidden",
    "Background scrolling locked",
  );
  assert.equal(
    doc.activeElement,
    doc.querySelector(".rw-modal"),
    "Dialog receives focus",
  );
  const originalRandom = w.Math.random;
  for (const [index, expectedScore] of [62, 76, 88, 96].entries()) {
    doc.dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await pause(600);
    assert.equal(doc.body.style.overflow, "", "Scroll restored on close");
    await button("Redraw");
    await rwClick(0.4, 0.5);
    await rwClick(0.5, 0.47);
    await rwClick(0.53, 0.6);
    w.Math.random = () => (index + 0.5) / 4;
    await rwClick(0.43, 0.63);
    w.Math.random = originalRandom;
    await button("Analizează Acoperișul");
    await pause(900);
    const displayedScore = () =>
      doc.querySelector(".rw-score-card strong").textContent;
    assert.equal(
      displayedScore(),
      `${expectedScore}/100`,
      "Each random score is reachable",
    );
    assert(body().includes("Scor demonstrativ ales aleatoriu"));
    await click(doc.querySelector('.rw-modal button[aria-label="Închide"]'));
    await pause(600);
    await button("Analizează Acoperișul");
    await pause(900);
    assert.equal(
      displayedScore(),
      `${expectedScore}/100`,
      "Reopening preserves drawing score",
    );
  }
  await button("O&M și Impact Rețea");
  assert(
    body().includes("persistent_underperformance_candidate"),
    "Fault signature surfaced",
  );
  await button("Următorii pași");
  assert(body().includes("Voltech Energy"));
  assert(body().includes("Casa Verde Fotovoltaice"));
  await button("Selectează în Dashboard / Creează Ticket O&M");
  assert(doc.querySelector("[role=dialog]"), "O&M sheet opens from modal CTA");
  doc.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await pause(900);
  assert(!doc.querySelector("[role=dialog]"));
  const missing = doc.querySelector(".signal-card input[type=checkbox]");
  await click(missing);
  assert(body().includes("Date insuficiente"));
  assert(body().includes("— RON"));
  await click(missing);
  await tab("Baterie");
  assert(
    doc.querySelector(".battery-sizing"),
    "Battery sizing simulator embedded in Schedule",
  );
  track = doc.querySelector(".reserve-card [role=slider]");
  track.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "End", bubbles: true }),
  );
  await pause(50);
  assert.equal(track.getAttribute("aria-valuenow"), "90");
  assert(body().includes("Nu adăugăm energie fictivă"));
  track.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  await pause(50);
  pointer(track, "pointerdown", 100);
  pointer(track, "pointermove", -500);
  await pause(20);
  assert.equal(track.getAttribute("aria-valuenow"), "20");
  pointer(track, "pointerup", -500);
  await pause(50);
  assert.equal(track.getAttribute("aria-valuenow"), "20");
  const lock = doc.querySelector(".reserve-card input[type=checkbox]");
  await click(lock);
  assert(body().includes("— RON"));
  await click(lock);
  await button("Salvează propunerea");
  assert(JSON.parse(w.localStorage.getItem("oev-apple-v1")).proposal);
  await tab("Costuri");
  assert.equal(doc.querySelectorAll(".ledger-card").length, 4);
  assert(body().includes("NU se adună"));
  // Bill extractor, tariff calculator, ROI/NPV and report now live inside Costs.
  assert.equal(doc.querySelectorAll(".studio-table-wrap tbody tr").length, 25);
  assert(body().includes("Comparația este blocată"));
  const confirm = doc.querySelector(".studio-embed .toggle-row input");
  await click(confirm);
  assert(doc.querySelector(".bill-comparison"));
  await button("Adaugă zona în comparație");
  assert.equal(doc.querySelectorAll(".equity-heatmap>div").length, 1);
  assert(body().includes("Raport Solar Studio"));
  await tab("Conexiuni");
  assert.equal(doc.querySelectorAll(".connections-grid .bento").length, 6);
  await tab("Echipa O&M");
  await tab("Instalații");
  assert.equal(doc.querySelectorAll("button.fleet-row").length, 3);
  const fleetRow = [...doc.querySelectorAll("button.fleet-row")].find((el) =>
    el.textContent.includes("Site C"),
  );
  await click(fleetRow);
  assert(doc.querySelector("[role=dialog]"));
  assert(doc.querySelector("main").hasAttribute("inert"));
  const decision = doc.querySelector("[role=dialog] .assessment select");
  decision.value = "anomaly";
  decision.dispatchEvent(new w.Event("change", { bubbles: true }));
  await pause(50);
  await button("Salvează evaluarea");
  await button("Creează Ticket O&M");
  const receipt = doc.querySelector(".receipt");
  assert(receipt, "Ticket receipt visible");
  assert(receipt.textContent.includes(sqlite ? "SQLite" : "localStorage"));
  assert(
    find("button", "Ticket înregistrat").disabled,
    "Repeat ticket disabled",
  );
  assert.equal(requests, sqlite ? 1 : 0, "Only one authorized delivery");
  const saved = JSON.parse(w.localStorage.getItem("oev-apple-v1"));
  const c = Object.values(saved.cases).find((c) => c.receipt);
  assert.equal(c.status, "ACTION_ACCEPTED");
  assert(c.receipt.case_id.startsWith("oev-c-"));
  doc.dispatchEvent(
    new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await pause(900);
  assert(!doc.querySelector("main").hasAttribute("inert"));
  assert(!doc.querySelector("[role=dialog]"));
  // Romanian diagnostic Q&A advisor now lives in the O&M workflow.
  await tab("Diagnostic");
  assert(
    doc.querySelector(".advisor-card"),
    "AI advisor embedded in Diagnostic",
  );
  await button("Rulează analiza locală");
  await pause(850);
  assert.equal(doc.querySelectorAll(".analysis-steps li").length, 5);
  assert(doc.querySelector(".local-answer"));
  await button("RO");
  assert(body().includes("EN"));
  await button("EN");
  await button("Mod Prezentare Scenă");
  assert(doc.querySelector(".app.stage"));
  await button("Mod Demonstrație Juriu");
  assert(doc.querySelector(".tour-panel"));
  assert.equal(doc.querySelectorAll(".tour-panel .tour-step").length, 1);
  assert.equal(errors.length, 0, errors.map(String).join("\n"));
  dom.window.close();
  return {
    mode: reduced ? "reduced-motion" : "springs",
    destination: sqlite ? "mock SQLite transport" : "localStorage",
    errors: errors.length,
  };
}
console.log("PASS", await run(false, false));
console.log("PASS", await run(true, true));
