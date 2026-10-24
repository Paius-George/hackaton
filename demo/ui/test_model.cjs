// Run: node ui/test_model.cjs — no packages required.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const M = require('./model.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/demo-data.js','utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.OEV_FALLBACK));
M.validate(data);
const controls = {commercial:false,policy:'residential',reserve:20,terminalLock:true,flex:'none',start:10,end:16,missing:{}};
for (const site of ['A','B','C']) {
  const rows = M.rowsFor(data,site,controls), days = M.daily(rows);
  assert.equal(days.length,14);
  for (const r of rows) assert(Math.abs(r.pv_kwh+r.grid_import_kwh+r.battery_discharge_kwh-r.load_kwh-r.grid_export_kwh-r.battery_charge_kwh)<1e-8);
  const opt = M.optimize(days.at(-1).rows,controls);
  assert(opt.available && opt.comparable);
  assert(Math.abs(opt.terminal-opt.observedTerminal)<1e-8);
  assert(opt.socs.every(v=>v>=20&&v<=90));
  assert(opt.flows.every(f=>f.battery_charge_kwh<=3.00001&&f.battery_discharge_kwh<=3.00001));
  assert(opt.saving>=-1e-7);
  // Reconstruct SoC independently from proposed AC power and round-trip efficiency.
  let stored=opt.initial;
  for(let i=0;i<24;i++) {
    const f=opt.flows[i];
    stored+=f.battery_charge_kwh*Math.sqrt(.95)-f.battery_discharge_kwh/Math.sqrt(.95);
    assert(Math.abs(stored-opt.socs[i]/10)<1e-8);
  }
  assert(M.financial(rows,controls).complete);
}
const rows = M.rowsFor(data,'C',controls), days=M.daily(rows);
assert(Math.abs(days.at(-1).residual+.18)<1e-8);
assert.equal(M.persistence(days,-12),7);
assert.equal(M.persistence(days,-20),0);
const missing=M.rowsFor(data,'C',{...controls,missing:{C:true}});
assert.equal(M.daily(missing).at(-1).pv,null);
assert.equal(M.totals(missing).pv,null);
assert.equal(M.financial(missing,controls).observed,null);
assert.equal(M.optimize(M.daily(missing).at(-1).rows,controls).available,false);
assert.equal(M.optimize(days.at(-1).rows,{...controls,terminalLock:false}).saving,null);
const flexible=M.optimize(days.at(-1).rows,{...controls,reserve:50,flex:'ev'});
assert(flexible.available&&flexible.comparable);
assert(flexible.socs.every(s=>s>=50));
assert(Math.abs(M.sum(flexible.loads)-M.sum(flexible.observedLoads))<1e-8);
assert.equal(M.optimize(days.at(-1).rows,{...controls,flex:'ev',start:10,end:11}).available,false);
const parsed=M.parseCSV('timestamp,duration_minutes,price_ron_mwh\n2020-06-14T00:00:00Z,15,-100\n2020-06-14T00:15:00Z,45,500','price');
assert.equal(Object.values(M.importMap(parsed,'price'))[0],350);
assert.throws(()=>M.parseCSV('timestamp,load_kw\n2020-06-14,2','load'));
assert.throws(()=>M.parseCSV('timestamp,load_kw\n2020-06-14T00:00:00Z,-1','load'));
assert.throws(()=>M.parseCSV('timestamp,load_kw\n2020-06-14T00:00:00Z,1\n2020-06-14T00:00:00Z,2','load'));
assert.throws(()=>M.importMap(M.parseCSV('timestamp,duration_minutes,price_ron_mwh\n2020-06-14T00:00:00Z,60,100\n2020-06-14T00:30:00Z,60,200','price'),'price'));
const stamp=rows.at(-1).timestamp;
const updated=M.rowsFor(data,'C',controls,{loads:{C:{[stamp]:10}},prices:{[stamp]:2000}});
assert.equal(updated.at(-1).load_kwh,10);
assert.equal(updated.at(-1).pzu_ron_mwh,2000);
assert.equal(updated.at(-1).buy,rows.at(-1).buy); // A fixed retail tariff stays fixed.
const commercial=M.rowsFor(data,'C',{...controls,commercial:true,policy:'commercial'});
assert(Math.abs(commercial[0].sell-.5)<1e-8);
assert(Math.abs(M.sum(commercial,'expected_kwh')/M.sum(rows,'expected_kwh')-250/6)<1e-8);
assert.equal(M.key('C','rule','window'),M.key('C','rule','window'));
assert.notEqual(M.key('C','rule','window'),M.key('B','rule','window'));
console.log('PASS — balance; 3-site / 14-day data; independently reconstructed battery SoC; 3kW, reserve and capacity limits; equal terminal energy; load conservation; missing-data gates; CSV duration/overlap validation; import overlays; contract separation; stable keys.');
