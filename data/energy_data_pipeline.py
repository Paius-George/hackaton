#!/usr/bin/env python3
"""Energy evidence demo. Standard library only. Default: live PVGIS historical call,
explicitly simulated fleet/prices/contract. Never silently replaces failed live data.
No external messages or device commands. --serve adds a local ticket action UI.
"""
import argparse
import csv
import hashlib
import json
import math
import os
import sqlite3
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer
from pathlib import Path
from zoneinfo import ZoneInfo

TZ = ZoneInfo('Europe/Bucharest')
D = lambda x: Decimal(str(x))
PVGIS = 'https://re.jrc.ec.europa.eu/api/v5_2/seriescalc'
SITES = [('A', 'Huawei', 6.0), ('B', 'Deye', 6.0), ('C', 'Fronius', 6.0)]


def money(x):
    return str(D(x).quantize(D('.01'), rounding=ROUND_HALF_UP))


def stamp(s):
    t = datetime.fromisoformat(s.replace('Z', '+00:00'))
    if t.tzinfo is None:
        raise ValueError('Timezone required: ' + s)
    return t.astimezone(timezone.utc)


def load_csv(path):
    with Path(path).open(newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def request_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'EnergyBootcampDemo/1.0'}), timeout=35) as r:
        return json.load(r)


def baseline(args, out):
    query = dict(lat=44.4268, lon=26.1025, startyear=args.year, endyear=args.year,
                 pvcalculation=1, peakpower=1, loss=14, angle=35, aspect=0, outputformat='json')
    url = PVGIS + '?' + urllib.parse.urlencode(query)
    if args.synthetic_baseline:
        rows = []
        start = datetime(args.year, 6, 1, tzinfo=timezone.utc)
        for i in range(14 * 24):
            t = start + timedelta(hours=i)
            h = t.astimezone(TZ).hour
            p = max(0, math.sin(math.pi * (h - 6) / 14)) * .78
            rows.append({'time': t.strftime('%Y%m%d:%H%M'), 'P': p * 1000, 'G(i)': p * 1100})
        raw = {'outputs': {'hourly': rows}, 'warning': 'SYNTHETIC BASELINE TEST FIXTURE'}
        mode = 'synthetic_test_fixture'
    elif args.pvgis_json:
        raw = json.loads(Path(args.pvgis_json).read_text())
        mode = 'cached_pvgis_response_unverified_origin'
    else:
        raw = request_json(url)
        mode = 'live_api_historical_model'
    (out / 'pvgis-raw.json').write_text(json.dumps(raw, ensure_ascii=False))
    result = []
    for r in raw['outputs']['hourly']:
        t = datetime.strptime(r['time'], '%Y%m%d:%H%M').replace(tzinfo=timezone.utc)
        if t.month == 6 and 1 <= t.day <= 14:
            # PVGIS timestamps can have a minute offset. Keep original and explicit bin.
            result.append({'timestamp': t.replace(minute=0).isoformat(), 'source_timestamp': t.isoformat(),
                           'expected_kwh_per_kwp': float(r['P']) / 1000, 'irradiance_w_m2': r.get('G(i)')})
    if len(result) != 336:
        raise ValueError('Expected 336 hourly June 1-14 records; found ' + str(len(result)))
    result.sort(key=lambda r: r['timestamp'])
    return result, {'kind': mode, 'url': url, 'period': f'{args.year}-06-01/14',
                    'warning': 'Historical same-weather replay baseline; not current forecast or measured generation.'}


def profile(args):
    if not args.profile_csv:
        return None, {'kind': 'synthetic_household_load', 'warning': 'No StoreNet/OPSD rows loaded.'}
    rows = load_csv(args.profile_csv)
    bins = defaultdict(list)
    for r in rows:
        # Explicit normalized profile contract: timestamp with timezone, load_kw.
        t = stamp(r['timestamp'])
        val = float(r['load_kw'])
        if not math.isfinite(val) or val < 0:
            raise ValueError('load_kw must be finite and nonnegative')
        bins[t.astimezone(TZ).hour].append(val)
    if len(bins) != 24:
        raise ValueError('Profile needs all 24 local hours')
    return {h: sum(v) / len(v) for h, v in bins.items()}, {
        'kind': 'user_supplied_historical_load_shape_replayed', 'path': str(args.profile_csv),
        'sha256': hashlib.sha256(Path(args.profile_csv).read_bytes()).hexdigest(),
        'warning': 'Hourly shape replayed in Bucharest; not measured Romanian multi-brand telemetry.'}


def prices(args, times):
    if not args.prices_csv:
        return {t: (D('250') if 10 <= stamp(t).astimezone(TZ).hour <= 16 else
                    D('900') if 18 <= stamp(t).astimezone(TZ).hour <= 22 else D('500')) for t in times}, {'kind': 'synthetic_PZU_scenario', 'unit': 'RON/MWh'}
    buckets = defaultdict(list)
    for r in load_csv(args.prices_csv):
        t = stamp(r['timestamp']).replace(minute=0, second=0, microsecond=0).isoformat()
        duration = int(r['duration_minutes'])
        if duration not in (15, 60):
            raise ValueError('Price interval must be 15 or 60 minutes')
        buckets[t].append((D(r['price_ron_mwh']), duration, stamp(r['timestamp'])))
    result = {}
    for t in times:
        values = buckets.get(t, [])
        if sum(v[1] for v in values) != 60 or len(set(v[2] for v in values)) != len(values):
            raise ValueError('Missing/duplicate/overlapping hourly price coverage: ' + t)
        minutes = {v[2].minute for v in values}
        if not (len(values) == 1 and values[0][1] == 60 and minutes == {0}) and not (
                len(values) == 4 and all(v[1] == 15 for v in values) and minutes == {0, 15, 30, 45}):
            raise ValueError('Price intervals do not tile hour: ' + t)
        result[t] = sum(v[0] * v[1] for v in values) / 60
    return result, {'kind': 'user_supplied_price_export', 'path': str(args.prices_csv),
                    'sha256': hashlib.sha256(Path(args.prices_csv).read_bytes()).hexdigest(), 'unit': 'RON/MWh'}


def rate(contract, kwp, market):
    # Simplified energy-value scenario, not full monthly invoice reconciliation.
    buy = D(contract['import_ron_kwh']) if contract['import_mode'] == 'fixed' else market / 1000 + D(contract['import_adder_ron_kwh'])
    if kwp <= 200:
        sell = D(contract['active_energy_ron_kwh'])
        regime = 'le_200_active_energy_credit_scenario'
    elif kwp <= 400:
        sell = D(contract['monthly_weighted_pzu_ron_mwh']) / 1000
        regime = 'gt_200_le_400_monthly_PZU_scenario'
    else:
        raise ValueError('Above 400 kW unsupported')
    return buy, sell, regime


def flow(pv, load, delta):
    # delta = change in stored battery energy, positive charge. 95% each-way efficiency.
    charge = delta / .95 if delta > 0 else 0
    discharge = -delta * .95 if delta < 0 else 0
    net = load + charge - pv - discharge
    return max(0, net), max(0, -net), charge, discharge


def interval_cost(pv, load, delta, buy, sell, wear):
    imp, exp, _, _ = flow(pv, load, delta)
    return D(imp) * buy - D(exp) * sell + D(abs(delta)) * wear


def optimize(day, terminal, wear):
    # Discrete perfect-information benchmark, 10kWh battery, 20-90% SoC, 3kW AC limit.
    step = .25
    states = range(8, 37)
    start = 20  # 5kWh
    costs, paths = {start: D(0)}, {start: []}
    for r in day:
        nxt, history = {}, {}
        for old, cost in costs.items():
            for new in states:
                delta = (new - old) * step
                if delta > 3 * .95 + 1e-8 or -delta * .95 > 3 + 1e-8:
                    continue
                c = cost + interval_cost(r['pv_kwh'], r['load_kwh'], delta, D(r['buy']), D(r['sell']), wear)
                if new not in nxt or c < nxt[new]:
                    nxt[new] = c; history[new] = paths[old] + [delta]
        costs, paths = nxt, history
    end = round(terminal / step)
    if end not in costs:
        raise ValueError('Terminal battery state unreachable')
    return costs[end], paths[end]


def simulate(base, shape, market, contract, commercial):
    all_rows, site_summaries, tickets = [], [], []
    for site_id, brand, default_kwp in SITES:
        kwp = 250.0 if commercial else default_kwp
        # Commercial uses same illustrative 10kWh battery, explicitly not a sizing recommendation.
        days = defaultdict(list)
        for b in base:
            t = stamp(b['timestamp']); h = t.astimezone(TZ).hour
            expected = b['expected_kwh_per_kwp'] * kwp
            faulty = t.day >= 8
            pv = expected
            if faulty and site_id == 'A' and 11 <= h <= 15:
                pv = min(expected, kwp * .42)
            if faulty and site_id == 'C':
                pv = expected * .82
            load = shape[h] if shape else .35 + (.8 if 7 <= h <= 9 else 0) + (1.4 if 18 <= h <= 22 else 0)
            if commercial:
                load *= 30
            buy, sell, regime = rate(contract, kwp, market[b['timestamp']])
            r = {'site_id': site_id, 'brand_label': brand, 'timestamp': b['timestamp'],
                 'expected_kwh': expected, 'pv_kwh': pv, 'load_kwh': load,
                 'buy': str(buy), 'sell': str(sell), 'pzu_ron_mwh': str(market[b['timestamp']]),
                 'regime': regime, 'provenance': 'SIMULATED_TELEMETRY_BRAND_LABEL_NOT_CONNECTOR',
                 'baseline_source_timestamp': b['source_timestamp']}
            days[t.date().isoformat()].append(r)
        day_stats = []
        for date, day in sorted(days.items()):
            soc = 5.0; actual_cost = D(0); actual_wear = D(0); healthy_cost = D(0)
            for i, r in enumerate(day):
                h = stamp(r['timestamp']).astimezone(TZ).hour
                if i == len(day) - 1:
                    delta = 5.0 - soc
                elif site_id == 'B' and stamp(r['timestamp']).day >= 8:
                    delta = min(1, 9 - soc) if 2 <= h <= 4 else -min(1, soc - 2) if 6 <= h <= 8 else 0
                else:
                    surplus = r['pv_kwh'] - r['load_kwh']
                    delta = min(2, max(0, surplus) * .95, 9 - soc) if surplus > 0 else -min(2, -surplus / .95, soc - 2)
                    # Keep final one-hour restoration within the 3kW AC charge/discharge limit.
                    if i >= 20:
                        delta = min(max(5 - soc, -2), 2)
                old = soc; soc += delta
                imp, exp, charge, discharge = flow(r['pv_kwh'], r['load_kwh'], delta)
                if charge > 3.00001 or discharge > 3.00001 or not 2 - 1e-8 <= soc <= 9 + 1e-8:
                    raise ValueError('Battery bounds violated')
                r.update(grid_import_kwh=imp, grid_export_kwh=exp, battery_charge_kwh=charge,
                         battery_discharge_kwh=discharge, soc_start_pct=old * 10, soc_end_pct=soc * 10)
                buy, sell = D(r['buy']), D(r['sell'])
                actual_cost += interval_cost(r['pv_kwh'], r['load_kwh'], delta, buy, sell, D(0))
                actual_wear += D(abs(delta)) * D(contract['battery_wear_ron_kwh_stored'])
                healthy_cost += interval_cost(r['expected_kwh'], r['load_kwh'], delta, buy, sell, D(0))
            optimum, dispatch = optimize(day, soc, D(contract['battery_wear_ron_kwh_stored']))
            for r, delta in zip(day, dispatch):
                r['counterfactual_battery_delta_kwh'] = delta
            expected = sum(r['expected_kwh'] for r in day); actual = sum(r['pv_kwh'] for r in day)
            day_stats.append({'date': date, 'expected_kwh': expected, 'actual_kwh': actual,
                              'shortfall_kwh': max(0, expected - actual),
                              'divergence_fraction': (expected - actual) / expected if expected else None,
                              'actual_net_energy_value_ron': money(actual_cost),
                              'pv_shortfall_scenario_ron': money(actual_cost - healthy_cost),
                              'dispatch_opportunity_including_wear_ron': money(actual_cost + actual_wear - optimum),
                              'counterfactual_kind': 'perfect_information_discrete_daily_optimum_same_terminal_SoC'})
            all_rows.extend(day)
        recent = day_stats[-7:]
        divergence = sum(d['shortfall_kwh'] for d in recent) / max(1e-9, sum(d['expected_kwh'] for d in recent))
        if site_id == 'B':
            fault = 'possible_dispatch_mistiming_injected_scenario'
        else:
            fault = 'persistent_underperformance_candidate' if divergence > .12 else 'no_threshold_breach'
        summary = {'site_id': site_id, 'brand_label': brand, 'kwp': kwp, 'battery_capacity_kwh': 10,
                   'days': day_stats, 'rolling_14d_shortfall_kwh': sum(d['shortfall_kwh'] for d in day_stats),
                   'last_7d_divergence': divergence, 'fault_signature': fault,
                   'pv_shortfall_value_last_7d_ron': money(sum(D(d['pv_shortfall_scenario_ron']) for d in recent)),
                   'dispatch_opportunity_last_7d_ron': money(sum(D(d['dispatch_opportunity_including_wear_ron']) for d in recent))}
        site_summaries.append(summary)
        key = hashlib.sha256((site_id + '|' + fault + '|' + recent[0]['date']).encode()).hexdigest()[:16]
        tickets.append({'idempotency_key': key, 'site_id': site_id, 'status': 'DRAFT_NOT_SENT',
                        'title_ro': f'Verificare O&M — sit {site_id}: {fault}',
                        'signature': fault, 'estimated_kwh_shortfall_per_day': sum(d['shortfall_kwh'] for d in recent) / 7,
                        'estimated_pv_value_ron_per_day': money(sum(D(d['pv_shortfall_scenario_ron']) for d in recent) / 7),
                        'warning': 'Synthetic fault evidence. Candidate diagnosis; not a verified physical cause.'})
    return all_rows, site_summaries, tickets


def render_html(payload):
    # Bundle the frontend and this exact payload into one offline-capable file.
    # Ingestion, simulation and valuation above remain unchanged.
    # A production React build is a single inlined HTML file. Prefer it when
    # available; retain the dependency-free original for unbuilt checkouts.
    react_build = Path(__file__).resolve().parent / 'frontend' / 'dist' / 'index.html'
    if react_build.is_file():
        safe = json.dumps(payload, ensure_ascii=False, allow_nan=False).replace('<', '\\u003c')
        return react_build.read_text(encoding='utf-8').replace(
            '<head>', '<head><script>window.__ENERGY_DATA__ = ' + safe + ';</script>', 1)
    ui = Path(__file__).resolve().parent / 'ui'
    html = (ui / 'index.html').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">',
                        '<style>' + (ui / 'styles.css').read_text(encoding='utf-8') + '</style>')
    safe_json = json.dumps(payload, ensure_ascii=False, allow_nan=False).replace('<', '\\u003c')
    html = html.replace('<script src="demo-data.js"></script>',
                        '<script>window.__ENERGY_DATA__ = ' + safe_json + ';</script>')
    for asset in ['model.js', 'app.js']:
        html = html.replace('<script src="' + asset + '"></script>',
                            '<script>' + (ui / asset).read_text(encoding='utf-8') + '</script>')
    return html


def send_tickets(out, tickets):
    url = os.environ.get('ENERGY_TICKET_WEBHOOK')
    if not url:
        raise ValueError('--send-tickets requires ENERGY_TICKET_WEBHOOK')
    with sqlite3.connect(out.parent / 'delivery.sqlite') as con:
        con.execute('CREATE TABLE IF NOT EXISTS deliveries (id TEXT PRIMARY KEY, status TEXT)')
        for ticket in tickets:
            key = ticket['idempotency_key']
            if con.execute('SELECT id FROM deliveries WHERE id=?', (key,)).fetchone():
                ticket['delivery'] = 'ALREADY_ATTEMPTED_CHECK_RECEIPT'; continue
            con.execute('INSERT INTO deliveries VALUES (?,?)', (key, 'ATTEMPT_STARTED'))
            con.commit()
            try:
                req = urllib.request.Request(url, data=json.dumps(ticket, ensure_ascii=False).encode(),
                    headers={'Content-Type':'application/json', 'Idempotency-Key':key}, method='POST')
                with urllib.request.urlopen(req, timeout=15) as response:
                    ticket['delivery'] = 'HTTP_ACCEPTED_' + str(response.status)
                con.execute('UPDATE deliveries SET status=? WHERE id=?', (ticket['delivery'], key))
            except Exception:
                ticket['delivery'] = 'UNKNOWN_RECONCILE_BEFORE_RETRY'
                con.execute('UPDATE deliveries SET status=? WHERE id=?', (ticket['delivery'], key))
            con.commit()
    (out / 'action-receipts.json').write_text(json.dumps(tickets, ensure_ascii=False, indent=2))


def serve(out, tickets):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path.startswith('/api/solar/'):
                from solar_services import get_response
                result = get_response(self.path)
                status, payload = result or (404, {'error': 'Unknown Solar Studio endpoint'})
                self.send_response(status); self.send_header('Content-Type', 'application/json')
                self.end_headers(); self.wfile.write(json.dumps(payload, allow_nan=False).encode()); return
            if self.path == '/api/demo-capabilities':
                data = json.dumps({'sqlite_work_orders': True, 'external_webhook': False}).encode()
                self.send_response(200); self.send_header('Content-Type', 'application/json')
                self.end_headers(); self.wfile.write(data); return
            if self.path == '/dashboard.json':
                data = (out / 'dashboard.json').read_bytes();self.send_response(200)
                self.send_header('Content-Type', 'application/json');self.end_headers();self.wfile.write(data);return
            if self.path not in ['/', '/index.html', '/dashboard.html']:
                self.send_error(404); return
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers(); self.wfile.write((out / 'dashboard.html').read_bytes())
        def do_POST(self):
            if self.path.startswith('/api/solar/'):
                from solar_services import post_response
                try:
                    size = int(self.headers.get('Content-Length', '0'))
                except ValueError:
                    self.send_error(400); return
                if not 0 < size <= 8 * 1024 * 1024:
                    self.send_error(413); return
                status, payload = post_response(self.path, self.rfile.read(size),
                                                self.headers.get('Content-Type', ''))
                self.send_response(status); self.send_header('Content-Type', 'application/json')
                self.end_headers(); self.wfile.write(json.dumps(payload, allow_nan=False).encode()); return
            if not self.path.startswith('/tickets/'):
                self.send_error(404); return
            key = self.path.removeprefix('/tickets/')
            ticket = next((t for t in tickets if t['idempotency_key'] == key), None)
            # The interactive demo submits its stable site/rule/window key to the
            # same local endpoint. Legacy form posts still use the pipeline draft.
            if self.headers.get('Content-Type', '').startswith('application/json'):
                try:
                    size = int(self.headers.get('Content-Length', '0'))
                    if not 0 < size <= 65536:
                        self.send_error(413); return
                    candidate = json.loads(self.rfile.read(size))
                    if (candidate.get('idempotency_key') != key or
                            candidate.get('site_id') not in {t['site_id'] for t in tickets} or
                            len(key) > 100 or not all(c.isalnum() or c in '-_' for c in key)):
                        self.send_error(400); return
                    ticket = candidate
                except (ValueError, TypeError, AttributeError):
                    self.send_error(400); return
            if not ticket:
                self.send_error(404);return
            with sqlite3.connect(out.parent / 'work-orders.sqlite') as con:
                con.execute('CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, payload TEXT NOT NULL)')
                stored = con.execute('SELECT payload FROM tickets WHERE id=?', (key,)).fetchone()
                created_at = (json.loads(stored[0]).get('created_at') if stored else None) or datetime.now(timezone.utc).isoformat()
                con.execute('INSERT OR IGNORE INTO tickets VALUES (?,?)', (key, json.dumps({**ticket,
                            'created_at': created_at, 'status': 'OPEN_LOCAL_WORK_ORDER'}, ensure_ascii=False)))
            receipt = {'case_id': key, 'created_at': created_at, 'status': 'ALREADY_EXISTS' if stored else 'CREATED_SQLITE_LOCAL'}
            self.send_response(200); self.send_header('Content-Type', 'application/json')
            self.end_headers(); self.wfile.write(json.dumps(receipt).encode())
    print('Local action UI: http://127.0.0.1:8765 (no external notification/device action)')
    ThreadingHTTPServer(('127.0.0.1',8765), Handler).serve_forever()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--year',type=int,default=2020)
    p.add_argument('--pvgis-json',type=Path)
    p.add_argument('--synthetic-baseline',action='store_true',help='Explicit offline synthetic test mode')
    p.add_argument('--profile-csv',type=Path,help='Normalized StoreNet/OPSD shape: timestamp,load_kw')
    p.add_argument('--prices-csv',type=Path,help='Normalized OPCOM export: timestamp,duration_minutes,price_ron_mwh')
    p.add_argument('--contract-json',type=Path)
    p.add_argument('--commercial',action='store_true',help='250kWp settlement scenario, not measured site')
    p.add_argument('--out',type=Path,default=Path('data/energy-demo'))
    p.add_argument('--serve',action='store_true')
    p.add_argument('--send-tickets',action='store_true',help='POST synthetic-labelled ticket evidence to configured team webhook')
    args=p.parse_args()
    out=args.out / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ');out.mkdir(parents=True)
    try:
        base, baseline_meta = baseline(args,out)
        shape, profile_meta = profile(args)
        market, price_meta = prices(args,[r['timestamp'] for r in base])
        contract = json.loads(args.contract_json.read_text()) if args.contract_json else {
            'import_mode':'fixed','import_ron_kwh':'1.30','import_adder_ron_kwh':'.40',
            'active_energy_ron_kwh':'.60','monthly_weighted_pzu_ron_mwh':'500',
            'battery_wear_ron_kwh_stored':'.05','provenance':'ILLUSTRATIVE_NOT_A_REAL_CONTRACT'}
        if contract['import_mode'] not in ('fixed','pzu_linked'):
            raise ValueError('import_mode must be fixed or pzu_linked')
        for field in ['import_ron_kwh','import_adder_ron_kwh','active_energy_ron_kwh','monthly_weighted_pzu_ron_mwh','battery_wear_ron_kwh_stored']:
            if not D(contract[field]).is_finite():raise ValueError('Nonfinite contract field '+field)
        rows,summaries,tickets=simulate(base,shape,market,contract,args.commercial)
        payload={'schema_version':'1.0','fetched_at':datetime.now(timezone.utc).isoformat(),
                 'mode':'HISTORICAL_REPLAY_WITH_INJECTED_FAULTS',
                 'sources':{'pvgis':baseline_meta,'telemetry':profile_meta,'market':price_meta,'retail_contract':contract},
                 'billing_warning':'Scenario estimate, not exact invoiced loss. Monthly credits/taxes/contract implementation not reconciled.',
                 'forecast_warning':'Perfect-information historical benchmark; not a deployable forecast optimizer.',
                 'sites':summaries,'timeseries':rows,'ticket_drafts':tickets,
                 'connector_status':{'Huawei':'mock_label','Deye':'mock_label','Fronius':'mock_label'}}
        if args.send_tickets:send_tickets(out,tickets)
        (out/'dashboard.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2,allow_nan=False))
        (out/'dashboard.html').write_text(render_html(payload))
        (out/'manifest.json').write_text(json.dumps({'files':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir() if f.is_file()}},indent=2))
        print('Saved '+str(out/'dashboard.json'))
        for s in summaries:print(s['site_id'],s['fault_signature'],'7d PV value RON',s['pv_shortfall_value_last_7d_ron'],'dispatch opportunity',s['dispatch_opportunity_last_7d_ron'])
        if args.serve:serve(out,tickets)
        return 0
    except Exception as exc:
        (out/'error.json').write_text(json.dumps({'status':'FAILED_NO_SILENT_FALLBACK','error':str(exc)},indent=2))
        print('FAILED: '+str(exc)+'; use --synthetic-baseline only for explicitly synthetic testing.',file=sys.stderr)
        return 2


if __name__=='__main__':sys.exit(main())
