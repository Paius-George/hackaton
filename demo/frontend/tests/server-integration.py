"""Run against an already running local demo: python3 frontend/tests/server-integration.py.
Creates/reuses ONE synthetic C work order with the same site/rule/window key as the UI.
"""
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import urllib.request

base = 'http://127.0.0.1:8765'
root = Path(__file__).resolve().parents[2]
data = json.load(urllib.request.urlopen(base + '/dashboard.json'))
html = urllib.request.urlopen(base + '/').read().decode()
embedded = re.search(r'window.__ENERGY_DATA__ = (.*?);</script>', html).group(1)
assert json.loads(embedded) == data
assert '<script src=' not in html
assert '<!doctype html>' in html[:50].lower()
assert 'EnergyModel' in html
assert json.load(urllib.request.urlopen(base + '/api/demo-capabilities'))['sqlite_work_orders']

dates = sorted({row['timestamp'][:10] for row in data['timeseries'] if row['site_id'] == 'C'})[-7:]
window = '_'.join(dates) + '|false|{}'
value = '|'.join(['C', 'persistent_pv_shortfall', window])
hash_value = 2166136261
for character in value:
    hash_value = ((hash_value ^ ord(character)) * 16777619) & 0xffffffff
key = 'oev-c-' + format(hash_value, '08x')
payload = {'site_id': 'C', 'idempotency_key': key, 'rule_id': 'persistent_pv_shortfall',
           'evidence_window': window, 'decision': 'anomaly', 'mode': 'APPLE_UI_SIMULATED_REPLAY',
           'notes': 'Automated local demo verification. Simulated evidence, no physical diagnosis.'}

def send():
    request = urllib.request.Request(base + '/tickets/' + key, data=json.dumps(payload).encode(),
                                     headers={'Content-Type': 'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(request))

first, second = send(), send()
assert first['case_id'] == second['case_id'] == key
assert second['status'] == 'ALREADY_EXISTS'
assert first['created_at'] == second['created_at']
with sqlite3.connect(root / 'data/energy-demo/work-orders.sqlite') as connection:
    assert connection.execute('SELECT COUNT(*) FROM tickets WHERE id=?', (key,)).fetchone()[0] == 1
print('PASS — production HTTP + exact embedded JSON + real SQLite deduplication:', key)
