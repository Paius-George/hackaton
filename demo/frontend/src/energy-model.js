/* Pure calculations shared by the standalone UI and its verification script. */
(function (root) {
  'use strict';
  const ETA = Math.sqrt(.95), CAPACITY = 10, STEP = .25;
  const sum = (xs, key) => xs.reduce((a, x) => a + Number(key ? x[key] || 0 : x || 0), 0);
  const finite = x => x !== null && x !== '' && Number.isFinite(Number(x));
  const hour = timestamp => Number(new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Bucharest',hour:'2-digit',hourCycle:'h23'}).format(new Date(timestamp)));
  const iso = value => new Date(value).toISOString();
  function validate(data) {
    if (!data || !Array.isArray(data.sites) || !Array.isArray(data.timeseries) || !data.timeseries.length) throw Error('Expected sites[] and timeseries[] in dashboard.json.');
    const ids = new Set(data.sites.map(s => String(s.site_id)));
    if (!['A','B','C'].every(id => ids.has(id))) throw Error('The demo requires sites A, B and C.');
    for (const r of data.timeseries) {
      if (!ids.has(String(r.site_id)) || !/(Z|[+-]\d\d:\d\d)$/.test(r.timestamp) || !Number.isFinite(Date.parse(r.timestamp))) throw Error('Invalid site or timezone-aware timestamp.');
      for (const k of ['expected_kwh','load_kwh']) if (!finite(r[k]) || Number(r[k]) < 0) throw Error('Invalid '+k);
      if (r.pv_kwh !== null && (!finite(r.pv_kwh) || Number(r.pv_kwh) < 0)) throw Error('Invalid pv_kwh');
    }
    return data;
  }
  function flow(pv, load, delta, eta = ETA) {
    const charge = Math.max(0, delta) / eta, discharge = Math.max(0, -delta) * eta;
    const net = load + charge - pv - discharge;
    return {battery_charge_kwh:charge,battery_discharge_kwh:discharge,grid_import_kwh:Math.max(0,net),grid_export_kwh:Math.max(0,-net)};
  }
  function rowsFor(data, site, controls, imports = {}) {
    const originalSite = data.sites.find(s=>s.site_id===site), sourceCommercial = Number(originalSite.kwp)>200;
    const pvScale = (controls.commercial ? 250 : 6) / Number(originalSite.kwp || 6);
    const loadScale = controls.commercial === sourceCommercial ? 1 : controls.commercial ? 30 : 1/30;
    const contract = data.sources?.retail_contract || {};
    const prices = imports.prices || {}, loads = imports.loads?.[site] || {};
    let result = data.timeseries.filter(r=>r.site_id===site).map(raw=>{
      const stamp = iso(raw.timestamp), price = prices[stamp] ?? Number(raw.pzu_ron_mwh ?? 500);
      const load = loads[stamp] ?? Number(raw.load_kwh)*loadScale;
      const delta = (Number(raw.soc_end_pct ?? 50)-Number(raw.soc_start_pct ?? 50))/100*CAPACITY;
      const buy = contract.import_mode==='pzu_linked' ? price/1000 + Number(contract.import_adder_ron_kwh ?? .4) : Number(contract.import_ron_kwh ?? raw.buy ?? 1.3);
      const sell = controls.policy==='commercial' ? Number(contract.monthly_weighted_pzu_ron_mwh ?? 500)/1000 : Number(contract.active_energy_ron_kwh ?? .6);
      const missing = raw.pv_kwh===null || raw.quality==='missing' || raw.quality==='stale';
      const row = {...raw,timestamp:stamp,date:stamp.slice(0,10),hour:hour(stamp),pv_kwh:missing?null:Number(raw.pv_kwh)*pvScale,
        expected_kwh:Number(raw.expected_kwh)*pvScale,load_kwh:load,delta,buy,sell,pzu_ron_mwh:price,quality:missing?'missing':'good',duration:1};
      Object.assign(row,flow(row.pv_kwh??0,load,delta));
      return row;
    }).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
    if (controls.missing?.[site]) {
      const lastDate=result.at(-1)?.date, target=result.find(r=>r.date===lastDate&&r.hour===12);
      if(target){target.pv_kwh=null;target.quality='stale';for(const k of ['grid_import_kwh','grid_export_kwh'])target[k]=null;}
    }
    return result;
  }
  function daily(rows) {
    const groups = new Map();for(const r of rows){if(!groups.has(r.date))groups.set(r.date,[]);groups.get(r.date).push(r);}
    return [...groups].map(([date,rs])=>{
      const complete=rs.length===24&&rs.every(r=>r.pv_kwh!==null&&r.quality==='good');
      const expected=sum(rs,'expected_kwh'),pv=complete?sum(rs,'pv_kwh'):null;
      return {date,rows:rs,complete,coverage:rs.filter(r=>r.quality==='good').length/24,expected,pv,residual:complete&&expected>.1?(pv-expected)/expected:null};
    });
  }
  function totals(rows) {
    const complete=rows.length>0&&rows.every(r=>r.quality==='good'&&r.pv_kwh!==null);
    const out={complete,coverage:rows.length?rows.filter(r=>r.quality==='good').length/rows.length:0,expected:sum(rows,'expected_kwh'),load:sum(rows,'load_kwh'),soc:rows.at(-1)?.soc_end_pct??50};
    for(const [key,field] of Object.entries({pv:'pv_kwh',imp:'grid_import_kwh',exp:'grid_export_kwh',charge:'battery_charge_kwh',discharge:'battery_discharge_kwh'}))out[key]=complete?sum(rows,field):null;
    out.balance=complete?out.pv+out.imp+out.discharge-out.load-out.exp-out.charge:null;
    out.residual=complete&&out.expected>.1?(out.pv-out.expected)/out.expected:null;
    return out;
  }
  const cost = (r,delta=r.delta,load=r.load_kwh,pv=r.pv_kwh,wear=0) => {
    const f=flow(pv,load,delta);return f.grid_import_kwh*r.buy-f.grid_export_kwh*r.sell+Math.abs(delta)*wear;
  };
  function optimize(rows,{reserve=20,terminalLock=true,flex='none',start=10,end=16}={}) {
    if(rows.length!==24||rows.some(r=>r.pv_kwh===null||r.quality!=='good'))return {available:false,reason:'incomplete'};
    const min=Math.ceil(Math.max(20,reserve)/100*CAPACITY/STEP),max=36;
    const initial=Number(rows[0].soc_start_pct??50)/100*CAPACITY,terminal=Number(rows.at(-1).soc_end_pct??50)/100*CAPACITY;
    const initialIndex=Math.round(initial/STEP),target=Math.round(terminal/STEP);
    if(Math.abs(initialIndex*STEP-initial)>1e-5 || (terminalLock&&Math.abs(target*STEP-terminal)>1e-5)||initialIndex<min||initialIndex>max)return {available:false,reason:'initial state incompatible with reserve/discretization'};
    const flexEnergy={none:0,ev:4,boiler:2,heat:3}[flex]??0,duration=2;
    const inWindow=h=>start<=end?h>=start&&h<end:h>=start||h<end;
    const candidates=flexEnergy?rows.map((r,i)=>i).filter(i=>i+duration<=24&&rows.slice(i,i+duration).every(r=>inWindow(r.hour))):[-1];
    if(!candidates.length)return {available:false,reason:'flexible load window is too short'};
    const observedLoads=rows.map(r=>r.load_kwh+(flexEnergy&&[18,19].includes(r.hour)?flexEnergy/duration:0));
    let best=null;
    for(const selected of candidates){
      const loads=rows.map((r,i)=>r.load_kwh+(selected>=0&&i>=selected&&i<selected+duration?flexEnergy/duration:0));
      let costs=new Map([[initialIndex,0]]),hist=[];
      for(let t=0;t<24;t++){
        const next=new Map(),parent=new Map(),r=rows[t];
        for(const [old,c]of costs)for(let n=min;n<=max;n++){
          const delta=(n-old)*STEP;
          if(delta/ETA>3+1e-8||-delta*ETA>3+1e-8)continue;
          const v=c+cost(r,delta,loads[t],r.pv_kwh,.05);
          if(!next.has(n)||v<next.get(n)){next.set(n,v);parent.set(n,old);}
        }
        costs=next;hist.push(parent);
      }
      const ending=terminalLock?target:[...costs.keys()].reduce((a,b)=>costs.get(a)<costs.get(b)?a:b);
      if(!costs.has(ending))continue;
      if(best&&best.cost<=costs.get(ending))continue;
      let cursor=ending,deltas=Array(24),socs=Array(24);
      for(let t=23;t>=0;t--){socs[t]=cursor*STEP/CAPACITY*100;const prev=hist[t].get(cursor);deltas[t]=(cursor-prev)*STEP;cursor=prev;}
      best={available:true,cost:costs.get(ending),deltas,socs,loads,observedLoads,initial,terminal:ending*STEP,observedTerminal:terminal,flexEnergy,flexStart:selected<0?null:rows[selected].hour,eta:ETA};
    }
    if(!best)return {available:false,reason:'unreachable terminal state'};
    best.observedCost=sum(rows.map((r,i)=>cost(r,r.delta,observedLoads[i],r.pv_kwh,.05)));
    best.comparable=terminalLock&&Math.abs(best.terminal-terminal)<1e-8;
    best.saving=best.comparable?best.observedCost-best.cost:null;
    best.flows=rows.map((r,i)=>flow(r.pv_kwh,best.loads[i],best.deltas[i]));
    return best;
  }
  function financial(rows, controls) {
    const ds=daily(rows), complete=ds.length>0&&ds.every(d=>d.complete);
    if(!complete)return {complete:false,days:ds.length,observed:null,pvExposure:null,dispatch:null,shortfall:null};
    let observed=0,pvExposure=0,dispatch=0,comparable=true;
    for(const day of ds){
      for(const r of day.rows){observed+=cost(r);pvExposure+=cost(r)-cost(r,r.delta,r.load_kwh,r.expected_kwh);}
      const opt=optimize(day.rows,controls);if(!opt.available||!opt.comparable)comparable=false;else dispatch+=opt.saving;
    }
    return {complete:true,days:ds.length,observed,pvExposure,dispatch:comparable?dispatch:null,shortfall:sum(rows,'expected_kwh')-sum(rows,'pv_kwh')};
  }
  function persistence(ds,threshold=-12){let streak=0,max=0;for(const d of ds){streak=d.complete&&d.residual!==null&&d.residual*100<=threshold?streak+1:0;max=Math.max(max,streak);}return max;}
  function parseCSV(text,kind){
    if(text.length>2_000_000)throw Error('CSV maximum 2 MB.');
    text=text.replace(/^\uFEFF/,'');const delim=text.split(/\r?\n/)[0].includes(';')?';':',';
    const lines=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===delim&&!quoted){row.push(cell.trim());cell='';}else if(c==='\n'&&!quoted){row.push(cell.trim());if(row.some(Boolean))lines.push(row);row=[];cell='';}else if(c!=='\r')cell+=c;}
    if(quoted)throw Error('Unclosed CSV quote.');row.push(cell.trim());if(row.some(Boolean))lines.push(row);
    const headers=lines.shift()||[],required=kind==='load'?['timestamp','load_kw']:['timestamp','duration_minutes','price_ron_mwh'];
    if(!required.every(x=>headers.includes(x)))throw Error('Required: '+required.join(', '));
    const parsed=lines.map((v,i)=>{const r=Object.fromEntries(headers.map((h,j)=>[h,v[j]]));if(!/(Z|[+-]\d\d:\d\d)$/.test(r.timestamp)||!Number.isFinite(Date.parse(r.timestamp)))throw Error('Timezone-aware timestamp required, row '+(i+2));for(const k of required.slice(1))if(!finite(r[k]))throw Error('Invalid '+k+', row '+(i+2));if(kind==='load'&&Number(r.load_kw)<0)throw Error('Negative load.');if(kind==='price'&&(Number(r.duration_minutes)<=0||Number(r.duration_minutes)>1440))throw Error('Invalid duration_minutes.');return {...r,timestamp:iso(r.timestamp)};});
    if(!parsed.length)throw Error('CSV contains no measurements.');
    const seen=new Set();for(const r of parsed){if(seen.has(r.timestamp))throw Error('Duplicate timestamp: '+r.timestamp);seen.add(r.timestamp);}
    return parsed;
  }
  function importMap(parsed,kind){
    if(kind==='load')return Object.fromEntries(parsed.map(r=>{if(new Date(r.timestamp).getUTCMinutes()!==0||new Date(r.timestamp).getUTCSeconds()!==0)throw Error('load_kw rows must be hourly and aligned to HH:00 UTC.');return [r.timestamp,Number(r.load_kw)];}));
    const bins={};let previousEnd=-Infinity;
    for(const r of [...parsed].sort((a,b)=>a.timestamp.localeCompare(b.timestamp))){let start=Date.parse(r.timestamp),end=start+Number(r.duration_minutes)*60000;if(start<previousEnd)throw Error('Overlapping OPCOM intervals.');previousEnd=end;
      while(start<end){const boundary=Math.floor(start/3600000)*3600000,key=new Date(boundary).toISOString(),stop=Math.min(end,boundary+3600000),minutes=(stop-start)/60000;const b=bins[key]||(bins[key]={weighted:0,minutes:0});b.weighted+=Number(r.price_ron_mwh)*minutes;b.minutes+=minutes;start=stop;}}
    return Object.fromEntries(Object.entries(bins).filter(([,b])=>Math.abs(b.minutes-60)<1e-6).map(([k,b])=>[k,b.weighted/b.minutes]));
  }
  function key(site,rule,window){const value=[site,rule,window].join('|');let h=2166136261;for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);return 'oev-'+site.toLowerCase()+'-'+(h>>>0).toString(16).padStart(8,'0');}
  const api={ETA,CAPACITY,STEP,sum,finite,hour,validate,flow,rowsFor,daily,totals,cost,optimize,financial,persistence,parseCSV,importMap,key};
  root.EnergyModel=api; // Browser-only adapter; calculations match ui/model.js.
})(typeof window!=='undefined'?window:globalThis);
