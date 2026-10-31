/* Page-local train research workshop. No storage, ledger or network requests. */
(function () {
  'use strict';
  if (document.body.dataset.sec !== 'j9a-p1') return;
  const root = document.getElementById('b9a-p1-workshop');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'yes';
  const host = root.querySelector('#p1-workspace');
  host.innerHTML = `
<style>
#b9a-p1-workshop {overflow-wrap:anywhere}
#b9a-p1-workshop fieldset {min-width:0;border:1px solid var(--line);margin:16px 0;padding:12px}
#b9a-p1-workshop label {display:block;margin:8px 0}
#b9a-p1-workshop input:not([type=checkbox]),#b9a-p1-workshop textarea,#b9a-p1-workshop select {box-sizing:border-box;width:100%;min-width:0;padding:9px;font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--muted);border-radius:4px}
#b9a-p1-workshop input[type=checkbox] {width:20px;height:20px;vertical-align:middle}
#b9a-p1-workshop textarea {min-height:90px}
#b9a-p1-workshop button {min-height:44px;margin:4px 4px 4px 0;white-space:normal;color:var(--fg);background:var(--card);border:1px solid var(--muted)}
#b9a-p1-workshop .p1-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#b9a-p1-workshop .p1-station {border-top:1px solid var(--line);margin-top:12px}
#b9a-p1-workshop .p1-status {min-height:2em;color:var(--fg)}
#b9a-p1-workshop svg {width:100%;height:auto;background:var(--card);color:var(--fg)}
@media(max-width:500px){#b9a-p1-workshop .p1-grid {grid-template-columns:1fr}}
</style>
<fieldset id="p1-data"><legend>一、采集资料（全部由你填写）</legend>
<p>选同一方向、同一路线的三个至八个连续停靠站，包含所选区间起终点。未列出的停靠站会使连线仅能作粗略插值，请在限制中注明；本工具不处理折返。</p>
<div class="p1-grid">
<label>车次<input id="p1-train" maxlength="40"></label>
<label>运行日期（YYYY-MM-DD）<input id="p1-travel" maxlength="10"></label>
<label>查询日期（YYYY-MM-DD）<input id="p1-query" maxlength="10"></label>
<label>时刻表来源链接<input id="p1-time-url" type="url"></label>
<label>时刻表标题/查询条件/表行<textarea id="p1-time-note"></textarea></label>
<label>里程来源链接<input id="p1-distance-url" type="url"></label>
<label>里程来源标题、页码/表行、原单位及换算<textarea id="p1-distance-note"></textarea></label>
</div>
<p>时间封闭格式：<b>D HH:mm</b>，D 为从首站出发日算起的日序号0—6，例如次日写1，再写空格和24小时制时分；不能只凭时钟倒退猜跨日。距离用 ASCII 非负十进制（最多两位小数），单位km，首站累计距离填0，其后严格增加且不超过10000。沿程里程若是从线路另一端计起，应先换算成本区间首站起算的累计距离。保留原精度，不编多余小数。</p>
<div id="p1-stations"></div>
<button type="button" class="btn ghost" id="p1-add-row">增加一站</button><button type="button" class="btn ghost" id="p1-remove-row">删除末站</button>
<label><input type="checkbox" id="p1-source-self"> 我已自行核对官方时刻/里程、日期、车次和同一路线（仅自报，软件不能验证来源真实性）</label>
<button type="button" class="btn" id="p1-validate">检查表内一致性，开始作图</button><p class="p1-status" id="p1-data-status" role="status"></p>
</fieldset>
<fieldset><legend>二、亲自建立分段路程—时间图</legend>
<p>先在纸上把各到发时刻换成“首站出发后经过的分钟数”。纵轴为沿所选正向路线的累计路程s（km），横轴t（min），不是速度。选择每个到发事件，填写自己的(t,s)，逐个落点；也可触摸/点击空图取近似坐标后再修正数值。按事件顺序连线。中途到达和出发应分别落点，即使距离相同；零停站时两个事件会重合。</p>
<label>要描的到发事件<select id="p1-event" disabled></select></label>
<div class="p1-grid"><label>t / min<input id="p1-x" inputmode="decimal"></label><label>s / km<input id="p1-y" inputmode="decimal"></label></div>
<button type="button" class="btn" id="p1-place">落点/替换该点</button><button type="button" class="btn ghost" id="p1-clear-point">删该点</button><button type="button" class="btn" id="p1-check-plot">核对整张图</button>
<svg id="p1-plot" viewBox="0 0 560 340" role="img" aria-label="自己建立的路程时间图"></svg>
<p id="p1-point-list" class="small"></p><p class="p1-status" id="p1-plot-status" role="status"></p>
<p>用相邻移动事件的“路程差÷时间差”解释斜率，单位km/min；乘60才是km/h。用到达—出发的时间差解释水平段。只连接时刻表点是区间平均速度模型，不能证明区间实际匀速，不能从这张图直接读出最高速度。已有的v–t图中水平段表示速度不变，在这张s–t图中含义不同。</p>
</fieldset>
<fieldset><legend>三、比较明确假设下的两个方案</legend>
<p>A 是你采集的时刻表，B 只是假设：同一路线、区间运行时间不变，表内每个中途站停靠均缩短r分钟，出发时刻不变。不减少停站数，不冒称铁路可执行调度；上下客、安全间隔、线路容量及加减速限制仍需另外研究。</p>
<label>每站缩短r / min<input id="p1-reduction" inputmode="decimal"></label>
<p>先自己列“方案 / 总用时min / 总路程km / 含停站平均速度km/h / 与A相比节省min”比较表，再填写下列结果（四舍五入到两位小数）；若r大于任一站停靠时间，应修正假设。</p>
<div class="p1-grid"><label>B总用时 / min<input id="p1-b-total" inputmode="decimal"></label><label>节省时间 / min<input id="p1-saving" inputmode="decimal"></label><label>A平均速度 / km/h<input id="p1-a-speed" inputmode="decimal"></label><label>B平均速度 / km/h<input id="p1-b-speed" inputmode="decimal"></label></div>
<button type="button" class="btn" id="p1-compare">核对数值比较</button><p class="p1-status" id="p1-compare-status" role="status"></p>
</fieldset>
<fieldset id="p1-report"><legend>四、留下研究成果（只在本机下载）</legend>
<p>写问题→资料与单位→自己的图→比较与理由→假设和限制→下一步。以下文字只按准则自核，不自动判定研究、团队合作或纸笔作图已经完成。页面不自动保存，刷新会清空；下载后自行保管，不含姓名或购票资料。</p>
<label>研究问题与选区间的理由<textarea id="p1-question"></textarea></label>
<label>用数据解释一段斜率、一段停站水平段及v–t与s–t区别<textarea id="p1-explain"></textarea></label>
<label>方案比较结论：引用比较表，解释收益与代价<textarea id="p1-conclusion"></textarea></label>
<label>资料可信度、模型假设、精度和限制（哪些未证实？）<textarea id="p1-limits"></textarea></label>
<label>下一步；若实际合作，记分工与分歧处理（不填姓名；独立完成可如实写）<textarea id="p1-process"></textarea></label>
<label><input type="checkbox" id="p1-self-data"> 自核：来源可复查、同日期同车次同路线、时刻/耗时/单位已区分。</label>
<label><input type="checkbox" id="p1-self-graph"> 自核：已独立作图，核过斜率与停站段；纸笔/操作过程由我自行核实。</label>
<label><input type="checkbox" id="p1-self-report"> 自核：结论引用数据，列明假设、精度、限制和真实工作过程。</label>
<button type="button" class="btn" id="p1-download">下载研究记录 Markdown</button><button type="button" class="btn ghost" id="p1-reset">清空整个项目</button>
<p class="p1-status" id="p1-report-status" role="status"></p>
</fieldset>`;
  const $ = id => root.querySelector('#p1-' + id);
  const num = raw => {
    const s = raw.replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '');
    return /^(?:0|[1-9][0-9]{0,8})(?:\.[0-9]{1,2})?$/.test(s) && Number(s) <= 999999999 ? Number(s) : null;
  };
  const time = raw => {
    const m = /^([0-6]) ([01][0-9]|2[0-3]):([0-5][0-9])$/.exec(raw);
    return m ? +m[1] * 1440 + +m[2] * 60 + +m[3] : null;
  };
  function date(raw) {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(raw)) return false;
    const d = new Date(raw + 'T00:00:00Z');
    return Number.isFinite(+d) && d.toISOString().slice(0, 10) === raw && +raw.slice(0, 4) >= 2000;
  }
  function url(raw) { try { return /^https?:$/.test(new URL(raw).protocol); } catch (_) { return false; } }
  const text = id => $(id).value.trim();
  const say = (id, s) => { $(id + '-status').textContent = s; };
  let data = null, points = [], plotOK = false, compareOK = false;
  function clearSelf() {
    ['self-data', 'self-graph', 'self-report'].forEach(id => { $(id).checked = false; });
    say('report', '');
  }
  function invalidate() {
    data = null; points = []; plotOK = compareOK = false;
    $('event').innerHTML = ''; $('event').disabled = true;
    ['x', 'y'].forEach(id => { $(id).value = ''; });
    ['data', 'plot', 'compare'].forEach(id => say(id, ''));
    clearSelf(); draw();
  }
  function rows() { return [...$('stations').children]; }
  function redrawRows() {
    rows().forEach((row, i, all) => {
      row.querySelector('b').textContent = '第' + (i + 1) + '站';
      const a = row.querySelector('[data-field=arr]'), d = row.querySelector('[data-field=dep]');
      a.disabled = i === 0; d.disabled = i === all.length - 1;
      if (a.disabled) a.value = '';
      if (d.disabled) d.value = '';
      row.querySelectorAll('input').forEach(input => {
        input.setAttribute('aria-label', '第' + (i + 1) + '站 ' + input.parentElement.firstChild.textContent);
      });
    });
    $('add-row').disabled = rows().length >= 8;
    $('remove-row').disabled = rows().length <= 3;
    invalidate();
  }
  function addRow() {
    if (rows().length >= 8) return;
    const row = document.createElement('div'); row.className = 'p1-station';
    row.innerHTML = '<b></b><div class="p1-grid"><label>站名<input data-field="name" maxlength="40"></label><label>累计km<input data-field="km" inputmode="decimal"></label><label>到达 D HH:mm<input data-field="arr" maxlength="7"></label><label>出发 D HH:mm<input data-field="dep" maxlength="7"></label></div>';
    $('stations').append(row); redrawRows();
  }
  function collect() {
    if (!text('train') || !date(text('travel')) || !date(text('query')) || !url(text('time-url')) || !url(text('distance-url')) || !text('time-note') || !text('distance-note')) throw Error('请补全车次、有效日期、http(s)来源链接及可复查的表行/里程说明。');
    if (!$('source-self').checked) throw Error('请先自行核对来源并勾选自报；软件只检查表内一致性。');
    const stations = rows().map((row, i, all) => {
      const v = k => row.querySelector('[data-field=' + k + ']').value;
      const item = {name:v('name').trim(), km:num(v('km')), arr:i ? time(v('arr')) : null, dep:i < all.length - 1 ? time(v('dep')) : null};
      if (!item.name || /[\x00-\x1f\x7f]/.test(item.name) || (item.km === null || item.km > 10000) || (i && item.arr === null) || (i < all.length - 1 && item.dep === null)) throw Error('第' + (i + 1) + '站存在空项、非法距离或时间格式。');
      if (!i && (item.km !== 0 || item.dep >= 1440)) throw Error('首站累计距离必须为0，出发日序号为0。');
      return item;
    });
    const events = [{name:stations[0].name + ' 出发', t:0, s:0}];
    const base = stations[0].dep, dwell = [];
    stations.forEach((row, i) => {
      if (!i) return;
      if (row.km <= stations[i - 1].km || row.arr <= stations[i - 1].dep) throw Error('站间距离须递增，下一到达须晚于上一出发；请检查日期与路线。');
      events.push({name:row.name + ' 到达', t:row.arr - base, s:row.km});
      if (i < stations.length - 1) {
        if (row.dep < row.arr) throw Error('出发不能早于本站到达；跨日须显式填写日序号。');
        dwell.push(row.dep - row.arr);
        events.push({name:row.name + ' 出发', t:row.dep - base, s:row.km});
      }
    });
    return {stations, events, dwell, total:events[events.length - 1].t, distance:stations[stations.length - 1].km};
  }
  function validate() {
    invalidate();
    try {
      data = collect(); points = Array(data.events.length).fill(null);
      data.events.forEach((event, i) => { const option = document.createElement('option'); option.value = i; option.textContent = event.name; $('event').append(option); });
      $('event').disabled = false;
      say('data', '表内顺序与格式一致。来源真实性仍为你的自报。请自己换算分钟并逐个落点，未自动生成运行图。'); draw();
    } catch (e) { say('data', e.message); }
  }
  function draw() {
    const svg = $('plot'); svg.replaceChildren();
    const add = (tag, attrs, content) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (content !== undefined) el.textContent = content;
      svg.append(el); return el;
    };
    const xmax = data ? data.total : 100, ymax = data ? data.distance : 100;
    add('path', {d:'M65 25V275H530', fill:'none', stroke:'currentColor', 'stroke-width':2});
    const label = (x, y, s, anchor) => add('text', {x,y,fill:'currentColor','font-size':20,'text-anchor':anchor || 'middle'},s);
    label(40,300,'0'); label(295,320,'t / min'); label(30,45,'s');
    label(500,300,String(xmax)); label(75,55,String(ymax),'start');
    const xy = p => [65 + p.t / xmax * 435, 275 - p.s / ymax * 220];
    let prior = null;
    points.forEach((p, i) => {
      if (!p) { prior = null; return; }
      const q = xy(p);
      if (prior) add('line', {x1:prior[0],y1:prior[1],x2:q[0],y2:q[1],stroke:'currentColor','stroke-width':2});
      add('rect', {'data-p1-point':i,x:q[0]-4,y:q[1]-4,width:8,height:8,fill:'currentColor'});
      prior = q;
    });
    $('point-list').textContent = data ? data.events.map((e,i) => e.name + '：' + (points[i] ? '(' + points[i].t + ', ' + points[i].s + ')' : '尚未落点')).join('；') : '检查资料表后，空图按你的区间范围设置坐标。';
  }
  function changePlot() { plotOK = false; say('plot',''); clearSelf(); }
  function place() {
    changePlot();
    if (!data) return say('plot','请先检查资料表。');
    const t = num($('x').value), s = num($('y').value);
    if (t === null || s === null || t > data.total || s > data.distance) return say('plot','请输入图内非负坐标，ASCII十进制最多两位小数；不要把时刻直接写成耗时。');
    points[+$('event').value] = {t,s}; draw();
    say('plot','已放置你的点，尚未判定；可改数值重试或核对整图。');
  }
  function checkPlot() {
    changePlot();
    if (!data) return say('plot','请先检查资料表。');
    const bad = data.events.findIndex((e,i) => !points[i] || Math.abs(points[i].t-e.t) > 0.010001 || Math.abs(points[i].s-e.s) > 0.010001);
    if (bad >= 0) return say('plot','请重查“' + data.events[bad].name + '”的点：先算相对首站的分钟数，再核累计km。');
    plotOK = true; say('plot','全部事件坐标与本表一致（容差0.01）；连线是你建立的分段平均模型。斜率解释、真实采集和纸笔过程仍需按准则自核。');
  }
  function comparison() {
    if (!data) throw Error('请先检查资料表。');
    const r = num($('reduction').value);
    if (r === null || data.dwell.some(d => r > d)) throw Error('r须为非负十进制且不大于每一个中途站的实际停靠分钟数。');
    const saving = r * data.dwell.length, total = data.total - saving;
    return {r, saving, total, aSpeed:60*data.distance/data.total, bSpeed:60*data.distance/total};
  }
  function compare() {
    compareOK = false; clearSelf();
    try {
      const c = comparison(), wanted = [c.total,c.saving,c.aSpeed,c.bSpeed];
      const actual = ['b-total','saving','a-speed','b-speed'].map(id => num($(id).value));
      if (actual.some((v,i) => v === null || Math.abs(v - wanted[i]) > 0.010001)) throw Error('比较数值还需检查：扣除的是每个中途站的r分钟，平均速度用总路程÷总小时（包含停站）。');
      compareOK = true; say('compare','数值与所填模型一致（容差0.01）。只有假设成立时B才有该收益，不能据此宣布真实调度可行。');
    } catch(e) { say('compare',e.message); }
  }
  function report() {
    if (!data || !plotOK || !compareOK) throw Error('请先完成表内检查、整图核对和数值比较。');
    if (['question','explain','conclusion','limits','process'].some(id => !text(id)) || ['self-data','self-graph','self-report'].some(id => !$(id).checked)) throw Error('请完成报告文字并逐项自核；文字存在不等于研究已被软件认证。');
    const c = comparison();
    const lines = ['# 高铁数量关系：我的研究记录', '本机记录；来源/实作/文字为学生自报，未自动认证；B为假设方案。',
      '车次：'+text('train'), '运行日期：'+text('travel'), '查询日期：'+text('query'),
      '时刻来源：'+text('time-url'), text('time-note'), '里程来源：'+text('distance-url'),text('distance-note'),
      '## 原始采集表（时刻=日序号*1440+时*60+分；距离km）'];
    data.stations.forEach(row => lines.push(row.name+' | 累计 '+row.km+' | 到达绝对min '+(row.arr===null?'—':row.arr)+' | 出发绝对min '+(row.dep===null?'—':row.dep)));
    lines.push('## 我填写的图点（按事件顺序连接，t/min，s/km）');
    points.forEach((p,i) => lines.push(data.events[i].name+'：('+p.t+', '+p.s+')'));
    lines.push('## 方案比较表', '方案 | 总用时min | 总路程km | 平均km/h | 比A节省min',
      'A采集 | '+data.total+' | '+data.distance+' | '+c.aSpeed.toFixed(2)+' | 0',
      'B假设 | '+c.total+' | '+data.distance+' | '+c.bSpeed.toFixed(2)+' | '+c.saving,
      '假设：每个表内中途站缩短'+c.r+'min；区间运行时间/路线不变。');
    ['question','explain','conclusion','limits','process'].forEach(id => lines.push('## '+$(id).parentElement.firstChild.textContent,text(id)));
    lines.push('## 自核（学生自行确认，未机器验真）','来源与单位、独立作图和斜率、证据与限制：本次均已自报核对。','软件仅检查封闭数值任务，不认证一般证明、真实车次、实际团队经历或调度安全性。');
    return lines.join('\n\n');
  }
  $('add-row').onclick = addRow;
  $('remove-row').onclick = () => { if(rows().length>3){$('stations').lastElementChild.remove();redrawRows();} };
  $('data').addEventListener('input',e=>{if(e.target!==$('source-self'))$('source-self').checked=false;invalidate();});
  $('validate').onclick = validate; $('place').onclick = place; $('check-plot').onclick = checkPlot;
  $('event').onchange = () => {
    const p = points[+$('event').value]; $('x').value=p?p.t:''; $('y').value=p?p.s:'';
    say('plot','');
  };
  ['x','y'].forEach(id => {
    $(id).addEventListener('input',changePlot);
    $(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();place();}});
  });
  $('clear-point').onclick=()=>{if(data){points[+$('event').value]=null;changePlot();draw();}};
  $('plot').addEventListener('click',e=>{
    if(!data)return;
    const matrix=$('plot').getScreenCTM(); if(!matrix)return;
    const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    if(p.x<65||p.x>500||p.y<55||p.y>275)return;
    $('x').value=((p.x-65)/435*data.total).toFixed(2);
    $('y').value=((275-p.y)/220*data.distance).toFixed(2); changePlot();
    say('plot','已读取近似坐标，请修正后按落点；也可直接用键盘输入。');
  });
  ['reduction','b-total','saving','a-speed','b-speed'].forEach(id=>$(id).addEventListener('input',()=>{compareOK=false;say('compare','');clearSelf();}));
  $('compare').onclick=compare;
  $('report').addEventListener('input',e=>{if(e.target.type!=='checkbox')clearSelf();else say('report','');});
  $('download').onclick=()=>{
    try{
      const content=report(), blob=new Blob([content],{type:'text/markdown;charset=utf-8'}), link=document.createElement('a'), href=URL.createObjectURL(blob);
      link.href=href;link.download='train-research.md';link.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
      say('report','研究记录已下载到本机。自核勾选为自报，资料与实际工作仍请自己核实。');
    }catch(e){say('report',e.message);}
  };
  $('reset').onclick=()=>{
    root.querySelectorAll('input,textarea').forEach(el=>{el.value='';if(el.type==='checkbox')el.checked=false;});
    $('stations').replaceChildren();for(let i=0;i<3;i++)addRow();invalidate();
    say('report','本项目已清空；上方原实验和练习不受影响。');
  };
  for(let i=0;i<3;i++)addRow();
})();
