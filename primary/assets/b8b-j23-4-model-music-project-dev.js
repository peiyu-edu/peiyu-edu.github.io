/* j23-4 only: ephemeral project worksheet. No ledger or shared runtime hooks. */
(() => {
  'use strict';
  const root = document.getElementById('j23-projects');
  if (!root || document.body.dataset.sec !== 'j23-4') return;
  const host = root.querySelector('#j23-project-workspace');
  if (!host || host.dataset.ready) return;
  host.dataset.ready = 'true';
  const $ = id => root.querySelector('#' + id);
  const field = (id, title, type = 'text') => `<label>${title}<input id="${id}" type="${type}" autocomplete="off"></label>`;
  const area = (id, title) => `<label>${title}<textarea id="${id}" maxlength="5000"></textarea></label>`;
  const choose = (id, title, opts) => `<label>${title}<select id="${id}"><option value="">请选择</option>${opts.map(([v,t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const status = id => `<p id="${id}" role="status" aria-live="polite"></p>`;
  const buttons = (id, title) => `<div class="entry-bar"><button type="submit">${title}</button><button type="reset" id="${id}-reset">清空重来</button></div>`;
  const plan = prefix => area(prefix + '-plan', '计划：问题、器材、单位、步骤、读数精度及控制条件') + area(prefix + '-roles', '分工与实施记录：可写角色代号、时间、实际做了什么；独立练习请注明');
  const measurement = (id, title, units) => `<details class="more" id="${id}-panel"><summary>${title}</summary><form id="${id}-form" novalidate>
    ${plan(id)}
    ${choose(id + '-source', '数据来源（切换将清空读数）', [['virtual','虚拟读数练习'],['reported','我自行记录的实测数据（自报）']])}
    <p>虚拟读数是模拟器产生的练习数据。${id === 'water' ? '虚拟容器计时前已有少量水，累计体积含起始水量。' : ''}实测请控制${id === 'water' ? '水龙头开度、收集容器和开始时刻' : '纸杯型号、叠放方式和测量基准'}，重复测量并记录精度。</p>
    <div class="entry-bar"><button type="button" id="${id}-read">采下一次虚拟读数</button></div>
    <p id="${id}-reading"></p>
    ${area(id + '-data', `测量表：每行两个十进制数，用英文逗号分开；${units}。至少3行，至多12行`)}
    <p>数值只收半角十进制小数（至多6位小数），可带正负号；不用科学记数、算式或分数，不把内部空格拼接成数字。显示值约取6位小数。</p>
    <button type="button" id="${id}-organize">整理读数，供选点</button>
    <div class="project-grid">${choose(id + '-first','选第一个建模点',[])}${choose(id + '-second','选第二个建模点',[])}</div>
    ${area(id + '-reason','选点理由：为何可靠、间距是否合适；其余哪些点留作检验？')}
    <p>先用两点列关于 k、b 的方程，填 y = kx + b 的系数，四舍五入到小数点后3位或更精确。两个系数均允许末位误差0.0005。k = 0 是常数情形，不能叫一次函数。</p>
    <div class="project-grid">${field(id + '-k','我的 k')}${field(id + '-b','我的 b')}${field(id + '-x','想估计的横坐标')}${field(id + '-y','按我的模型计算的纵坐标（误差限0.001）')}</div>
    ${area(id + '-scope','适用范围与误差说明：测量区间、控制条件、误差来源，是否外推？')}
    ${buttons(id,'核对模型、其它点与估计')}${status(id + '-feedback')}
    <canvas id="${id}-plot" width="560" height="300" role="img" aria-label="测量点与所选模型图" hidden></canvas>
    <div class="project-table" id="${id}-table"></div>
    <pre id="${id}-result"></pre>
  </form></details>`;
  host.innerHTML = measurement('water','滴水：时间—累计体积','时间/秒（非负），累计体积/毫升（非负）') +
    measurement('cups','纸杯：杯数—叠放总高','杯数（至少1的整数），总高/厘米（正数）') +
    `<details class="more" id="design-panel"><summary>自主方案：在数量与材料约束下采购</summary><form id="design-form" novalidate>
    <p>自行设定一个两种物品的采购项目：固定总件数 N，x 件甲、N−x 件乙。填写单价与每件占用材料；材料可以是包装纸面积、木料长度等，单位须一致。比较只覆盖这里给定的两类物品、固定 N 与全部约束，不代表现实所有方案。</p>
    ${plan('design')}${area('design-context','物品、材料单位、需求来源与比较目标（本表比较总费用最少）')}
    <div class="project-grid">${field('design-n','总件数 N（1至200整数）')}${field('design-p','甲单价')}${field('design-q','乙单价')}${field('design-a','甲每件耗材')}${field('design-b','乙每件耗材')}${field('design-m','可用材料总量')}${field('design-lo','甲件数下限（整数）')}${field('design-hi','甲件数上限（整数）')}${field('design-x','我的甲件数方案（整数）')}</div>
    ${area('design-why','我的论证：写出费用式、全部约束、比较范围及为什么选此方案')}
    ${area('design-revision','交流与修订：比较过什么替代方案？有哪些条件需要回到现实核实？')}
    ${buttons('design','核对可行性并比较本范围费用')}${status('design-feedback')}<pre id="design-result"></pre>
    </form></details>
    <details class="more" id="music-panel"><summary>音乐项目：计划 → 实施 → 时间音高图 → 报告与评价</summary>
    <form id="music-form" novalidate>
    <p>用自己设计或选择的一段短旋律进行有限体验。先确定基音与时间单位，再记录分工、来源和实施；不需上传音频，不自动播放。可结合原音乐页的三分损益与五度活动。</p>
    ${plan('music')}${area('music-material','选曲或原创说明、资料来源、基音与时间单位；实施中怎样检查读数？')}
    <h4>1. 十二平均律的根式计算</h4>
    <p>背景约定：相邻半音频率之比相同，12次相乘应得到一个八度的频率比2。用本阶段根式 r = √(√(∛2))，先按“开立方、再开平方、再开平方”计算；再将所得数连续相乘12次。这里仅计算0至12个半音。</p>
    <div class="project-grid">${field('music-r','计算所得 r（至少6位小数，误差限0.0000005）')}${field('music-product','将近似 r 连乘12次的结果（误差限0.0001）')}${field('music-base','自选基音频率/Hz（20至2000）')}</div>
    <h4>2. 制作时间—音高图</h4>
    <p>每行写“开始,结束,半音编号”。时间为0至60之间的小数；结束大于开始。编号为0至12整数；和弦用 + 连接多个不同编号；休止用大写 R。所有时间段约定为［开始,结束），即含开始、不含结束。0号是基音，不是0 Hz。纵轴用半音数，各行不按五线谱位置混用。</p>
    ${area('music-events','自己的旋律事件表（1至24行）')}
    ${choose('music-judgment','在整个观察区间［0,最后结束时刻）上，时间是否对应唯一音高？', [['yes','每个时刻都恰有一个音高'],['no','存在无音高或多个音高的时刻']])}
    ${area('music-why','判断理由：检查和弦、空白/休止及交接边界；如排除休止，说明新的取值范围')}
    ${buttons('music','绘图并核对数值与对应关系')}${status('music-feedback')}
    <canvas id="music-plot" width="560" height="300" role="img" aria-label="学生事件表的时间与半音编号图" hidden></canvas>
    <div class="project-table" id="music-table"></div><pre id="music-result"></pre>
    </form>
    ${area('music-show','选做：自选乐曲或小乐器设计的展示稿；写清设计、材料、成果与局限（不认证实物制作）')}
    ${area('music-review','开放评价：证据是否可复查？坐标约定和数学说明是否清楚？同伴/音乐老师建议及修订；未交流可写自评')}
    </details>
    <details class="more" id="report-panel"><summary>整理项目报告与自核</summary>
    <p>至少完成一个工作台再整理。报告会列出当前已核数值与原样记录的说明；自由文字、实测和合作只属自报，不会获得“全部正确”认证。音乐完整流程还需在开放评价中写下自己的反思或交流意见。</p>
    <button type="button" id="project-report">整理当前报告</button>
    ${status('project-feedback')}<pre id="project-output"></pre>
    <button type="button" id="project-copy">复制报告</button>
    </details>`;

  const results = {};
  const redraws = {};
  const fail = message => { throw new Error(message); };
  const text = id => $(id).value.trim();
  function num(raw) {
    const s = String(raw).trim();
    if (s.length > 16 || !/^[+-]?(?:\d{1,7}(?:\.\d{1,6})?|\.\d{1,6})$/.test(s)) fail('请用半角十进制数，至多6位小数，不含内部空格、算式或其它词元。');
    const v = Number(s);
    if (!Number.isFinite(v) || Math.abs(v) > 1000000) fail('数值的绝对值不能超过1000000。');
    return v === 0 ? 0 : v;
  }
  const value = id => num(text(id));
  const integer = v => Number.isInteger(v);
  const fmt = v => (Math.abs(v) < 0.0000005 ? 0 : v).toFixed(6).replace(/\.?0+$/,'');
  const near = (a,b,tol) => Math.abs(a-b) <= tol + Number.EPSILON * 8 * Math.max(1,Math.abs(a),Math.abs(b));
  function need(ids) { if (ids.some(id => !text(id))) fail('请先填写计划、说明与记录；文字仅记录，不自动判定质量。'); }
  function tell(id, message, state = 'recorded') { $(id).textContent = message; $(id).dataset.state = state; }
  function clearReport() { $('project-output').textContent = ''; $('project-feedback').textContent = ''; }
  function invalidate(id) {
    delete results[id];
    delete redraws[id];
    for (const suffix of ['feedback','result','table']) { const e = $(id + '-' + suffix); if (e) { e.textContent = ''; delete e.dataset.state; } }
    const canvas = $(id + '-plot'); if (canvas) canvas.hidden = true;
    clearReport();
  }
  function guard(id, fn) {
    try { fn(); } catch (e) { invalidate(id); tell(id + '-feedback', e.message, 'retry'); }
  }
  function table(id, headers, rows) {
    const t = document.createElement('table'), tr = document.createElement('tr');
    headers.forEach(s => { const c = document.createElement('th'); c.scope = 'col'; c.textContent = s; tr.append(c); });
    const head = document.createElement('thead'); head.append(tr); t.append(head);
    const body = document.createElement('tbody');
    rows.forEach(row => { const line = document.createElement('tr'); row.forEach(s => { const c = document.createElement('td'); c.textContent = s; line.append(c); }); body.append(line); });
    t.append(body); $(id).replaceChildren(t);
  }
  function chart(id, data, model, music = false) {
    const canvas = $(id), c = canvas.getContext('2d');
    if (!c) return;
    canvas.hidden = false;
    const cs = getComputedStyle(root), fg = cs.getPropertyValue('--fg').trim() || '#222', accent = cs.getPropertyValue('--a').trim() || '#146f99';
    c.clearRect(0,0,560,300); c.strokeStyle = fg; c.fillStyle = fg; c.font = '20px sans-serif';
    const xmax = Math.max(1,...data.map(p => music ? p.end : p[0]));
    const ys = music ? [0,12] : [...data.map(p=>p[1]),...data.map(p=>model.k*p[0]+model.b)];
    const ymin = music ? 0 : Math.min(0,...ys), ymax = music ? 12 : Math.max(1,...ys);
    const X = x => 65 + 450*x/xmax, Y = y => 250 - 210*(y-ymin)/(ymax-ymin || 1);
    c.beginPath(); c.moveTo(65,30); c.lineTo(65,250); c.lineTo(530,250); c.stroke();
    c.textAlign = 'left'; c.fillText(music ? '半音数' : 'y',5,22); c.fillText(music ? '时间' : 'x',475,290);
    for (let i=0;i<=3;i++) { c.textAlign=i===0?'left':i===3?'right':'center'; c.fillText(fmt(xmax*i/3),X(xmax*i/3),275); }
    c.textAlign = 'left';
    c.fillText(fmt(ymin),5,250); c.fillText(fmt(ymax),5,48);
    c.strokeStyle = accent; c.fillStyle = accent; c.lineWidth = 3;
    if (music) {
      for (const event of data) for (const note of event.notes) {
        c.beginPath(); c.moveTo(X(event.start),Y(note)); c.lineTo(X(event.end),Y(note)); c.stroke();
        c.beginPath(); c.arc(X(event.start),Y(note),4,0,2*Math.PI); c.fill();
        c.clearRect(X(event.end)-5,Y(note)-5,10,10); c.beginPath(); c.arc(X(event.end),Y(note),4,0,2*Math.PI); c.stroke();
      }
    } else {
      const xmin = Math.min(...data.map(p=>p[0]));
      if (model.discrete) {
        // Cup count is integer: show model marks only at the recorded cup counts.
        for (const [x] of data) { const px=X(x), py=Y(model.k*x+model.b); c.beginPath(); c.moveTo(px-6,py); c.lineTo(px+6,py); c.moveTo(px,py-6); c.lineTo(px,py+6); c.stroke(); }
      } else {
        c.beginPath(); c.moveTo(X(xmin),Y(model.k*xmin+model.b)); c.lineTo(X(xmax),Y(model.k*xmax+model.b)); c.stroke();
      }
      data.forEach(p=>{c.beginPath();c.arc(X(p[0]),Y(p[1]),5,0,2*Math.PI);c.fill();});
    }
  }
  function setupMeasure(id) {
    let prepared = null, count = 0;
    const form = $(id+'-form');
    const drop = () => { prepared = null; for (const key of ['first','second']) $(id+'-'+key).replaceChildren(new Option('请选择','')); };
    const parse = () => {
      const lines = text(id+'-data').split(/\r?\n/);
      if (lines.length < 3 || lines.length > 12 || !text(id+'-source')) fail('先选来源，并记录3至12行数据，留出其它点检验。');
      const rows = lines.map(line => { const pair=line.split(','); if(pair.length!==2) fail('每行必须是两个数，用一个英文逗号分隔。'); return pair.map(num); });
      if (new Set(rows.map(p=>p[0])).size !== rows.length) fail('横坐标不能重复；重复测量请先另行整理并说明。');
      if (rows.some(([x,y])=>id==='water' ? x<0 || y<0 : !integer(x) || x<1 || y<=0)) fail(id==='water' ? '时间和累计体积必须非负。' : '杯数须为至少1的整数，总高须为正。');
      return rows;
    };
    form.addEventListener('input', e => { invalidate(id); delete redraws[id]; if(e.target.id===id+'-data') drop(); });
    form.addEventListener('change', e => {
      invalidate(id); delete redraws[id];
      if(e.target.id===id+'-source') { $(id+'-data').value=''; $(id+'-reading').textContent=''; count=0; drop(); }
    });
    $(id+'-read').addEventListener('click',()=>guard(id,()=>{
      if(text(id+'-source')!=='virtual') fail('请先选“虚拟读数练习”；不会把模拟数据标成实测。');
      if(count>=12) fail('本次虚拟读数已到12条；可清空重来。');
      const x=id==='water'?count*10:count+1;
      const offsets = [0,.1,-.1,.2,-.05,.05];
      const y=id==='water'?2+.74*x+offsets[count%6]:9.4+1.55*(x-1)+offsets[count%6];
      const line=fmt(x)+','+fmt(y);
      $(id+'-data').value += (text(id+'-data')?'\n':'')+line;
      $(id+'-reading').textContent='虚拟读数 #'+(++count)+'：'+line+'（非实测）';
      drop(); invalidate(id); delete redraws[id];
    }));
    $(id+'-organize').addEventListener('click',()=>guard(id,()=>{
      invalidate(id); prepared=parse();
      for (const key of ['first','second']) {
        const sel=$(id+'-'+key);sel.replaceChildren(new Option('请选择',''));
        prepared.forEach(([x,y],i)=>sel.add(new Option(`${i+1}：(${fmt(x)}, ${fmt(y)})`,String(i))));
      }
      tell(id+'-feedback','已整理读数。请选择两个不同点，先自己求系数，再用其余点检验。');
    }));
    form.addEventListener('submit',e=>{e.preventDefault();guard(id,()=>{
      invalidate(id);
      need([id+'-plan',id+'-roles',id+'-reason',id+'-scope']);
      if(!prepared || text(id+'-first')==='' || text(id+'-second')==='') fail('先整理当前数据，再选两个建模点。');
      const i=Number(text(id+'-first')),j=Number(text(id+'-second'));
      if(i===j) fail('两点必须不同且横坐标不同。');
      const [x1,y1]=prepared[i],[x2,y2]=prepared[j],k0=(y2-y1)/(x2-x1),b0=y1-k0*x1;
      const k=value(id+'-k'),b=value(id+'-b');
      if(!near(k,k0,.0005)||!near(b,b0,.0005)) fail('系数与所选两点不符（允许各0.0005舍入误差）；请检查两次代入与方程组。');
      if(k0===0) fail('这两点给出 k = 0，是常数模型，不能据此建立一次函数；请重看数据或测量条件。');
      if(k0<0 || k<=0) fail('本次累计滴水/叠杯增长情境不支持递减模型；请核对数据、选点和测量条件。');
      const x=value(id+'-x'),y=value(id+'-y');
      if(id==='water'?x<0:!integer(x)||x<1) fail('估计的时间须非负，杯数须为至少1的整数。');
      if(y<0 || (id==='cups' && y===0) || k*x+b<0) fail('估计的体积不能为负，叠杯高度须为正。');
      if(!near(y,k*x+b,.001)) fail('估计值未与自己填入的模型相符（允许0.001误差）；请代入检查。');
      const xmin=Math.min(...prepared.map(p=>p[0])),xmax=Math.max(...prepared.map(p=>p[0]));
      const rows=prepared.map(([a,v],n)=>[String(n+1),fmt(a),fmt(v),fmt(k*a+b),fmt(v-(k*a+b)),n===i||n===j?'建模点':'另留检验']);
      table(id+'-table',['点','x','读数y','模型值','读数−模型','用途'],rows);
      const other=prepared.filter((_,n)=>n!==i&&n!==j).map(([a,v])=>Math.abs(v-(k*a+b)));
      const output=`来源：${text(id+'-source')==='virtual'?'虚拟练习（非实测）':'学生自报实测（软件未认证）'}\n由第${i+1}、${j+1}点建模；以所填近似系数作检验：y ≈ ${fmt(k)}x + (${fmt(b)})。\n另留检验点最大绝对差约 ${fmt(Math.max(...other))}。两点吻合不证明真实规律，仍需按仪器精度与控制条件判断。${id==='cups'?'纸杯图只在已记录的整数杯数处画点：圆点为读数，十字为模型值，不连接成连续杯数图象。':''}\n测量横坐标范围：${fmt(xmin)} 至 ${fmt(xmax)}。估计 x = ${fmt(x)}，y ≈ ${fmt(k*x+b)}。${x<xmin||x>xmax?'这是范围外的外推，可靠性尚未验证。':'这是测量范围内的估计，也只在本次条件下参考。'}`;
      $(id+'-result').textContent=output;results[id]=output;
      redraws[id]=()=>chart(id+'-plot',prepared,{k,b,discrete:id==='cups'});redraws[id]();
      tell(id+'-feedback','数值核对已完成；误差、适用范围和分工文字待你按准则自核/互评，未认证真实合作。','numeric');
    });});
    form.addEventListener('reset',()=>{invalidate(id);delete redraws[id];drop();count=0;$(id+'-reading').textContent='';});
  }
  setupMeasure('water');setupMeasure('cups');

  const design=$('design-form');
  for(const event of ['input','change'])design.addEventListener(event,()=>invalidate('design'));
  design.addEventListener('reset',()=>invalidate('design'));
  design.addEventListener('submit',e=>{e.preventDefault();guard('design',()=>{
    invalidate('design');need(['design-plan','design-roles','design-context','design-why','design-revision']);
    const n=value('design-n'),p=value('design-p'),q=value('design-q'),a=value('design-a'),b=value('design-b'),m=value('design-m'),lo=value('design-lo'),hi=value('design-hi'),x=value('design-x');
    if(!integer(n)||n<1||n>200||![lo,hi,x].every(integer))fail('总件数须为1至200整数；上下限与我的甲件数均须为整数。');
    if([p,q,a,b,m,lo,hi].some(v=>v<0)||lo>hi||hi>n)fail('价格、材料非负；甲件数须满足 0 ≤ 下限 ≤ 上限 ≤ N。');
    // Decimal material constraints are compared as exact scaled integers, not rounded floats.
    const scale=v=>BigInt(Math.round(v*1000000));
    const aa=scale(a),bb=scale(b),mm=scale(m);
    const feasible=[];
    for(let t=lo;t<=hi;t++)if(aa*BigInt(t)+bb*BigInt(n-t)<=mm)feasible.push(t);
    if(!feasible.length)fail('当前全部约束下没有可行整数方案；请记录冲突并修订需求或材料。');
    if(!feasible.includes(x))fail('我的方案违反数量、范围或材料约束；不能参与费用最优比较。');
    const pp=scale(p),qq=scale(q),cost=t=>pp*BigInt(t)+qq*BigInt(n-t);
    let best=cost(feasible[0]);for(const t of feasible)if(cost(t)<best)best=cost(t);
    const winners=feasible.filter(t=>cost(t)===best);
    const output=`本次比较固定 N = ${n}，乙件数 N−x；约束 x、N−x 均为非负整数，${lo} ≤ x ≤ ${hi}，${fmt(a)}x + ${fmt(b)}(N−x) ≤ ${fmt(m)}。\n费用 C = ${fmt(p-q)}x + ${fmt(q*n)}。可行甲件数：${feasible.join('、')}。\n本范围最低费用 ${fmt(Number(best)/1000000)}，对应甲件数 ${winners.join('、')}。${p===q?'系数为0，所有可行方案同费。':p>q?'费用随甲件数增加而增加。':'费用随甲件数增加而减少。'}\n我的方案 x = ${x}，费用 ${fmt(Number(cost(x))/1000000)}；${cost(x)===best?'达到本次给定范围最低费用。':'可行但未达到本次给定范围最低费用，可比较后修订。'}\n论证文字仅记录；不声称在任意物品、总数或未录入条件下全局最优。`;
    $('design-result').textContent=output;results.design=output;tell('design-feedback','已核给定数值的可行性与本范围费用比较；自主论证和现实条件待自核/交流。','numeric');
  });});

  const music=$('music-form');
  for(const event of ['input','change'])music.addEventListener(event,()=>{invalidate('music');delete redraws.music;});
  music.addEventListener('reset',()=>{invalidate('music');delete redraws.music;$('music-show').value='';$('music-review').value='';});
  function events() {
    const lines=text('music-events').split(/\r?\n/);if(lines.length<1||lines.length>24)fail('事件表需1至24行。');
    return lines.map(line=>{
      const parts=line.split(',');if(parts.length!==3)fail('事件表每行需开始,结束,编号（或R）。');
      const start=num(parts[0]),end=num(parts[1]),tone=parts[2].trim();
      if(start<0||end>60||end<=start)fail('每段须满足 0 ≤ 开始 < 结束 ≤ 60。');
      let notes=[];
      if(tone!=='R'){
        if(!/^\d{1,2}(?:\+\d{1,2}){0,5}$/.test(tone))fail('音高用0至12整数；和弦以+连接；休止只写R，不能写0Hz。');
        notes=tone.split('+').map(Number);
        if(notes.some(n=>n<0||n>12)||new Set(notes).size!==notes.length)fail('编号须在0至12，和弦内不重复。');
      }
      return {start,end,notes};
    });
  }
  music.addEventListener('submit',e=>{e.preventDefault();guard('music',()=>{
    invalidate('music');need(['music-plan','music-roles','music-material','music-why']);
    const r=value('music-r'),product=value('music-product'),base=value('music-base'),exact=Math.sqrt(Math.sqrt(Math.cbrt(2)));
    if(!near(r,exact,.0000005)||!near(product,2,.0001))fail('请检查嵌套根式计算和12次连乘：r保留至少6位小数，积应在规定精度内接近一个八度。');
    if(base<20||base>2000)fail('本体验基音频率限定20至2000 Hz。');
    const data=events(),end=Math.max(...data.map(p=>p.end)),bounds=[...new Set([0,...data.flatMap(p=>[p.start,p.end])])].sort((a,b)=>a-b);
    const segments=[];
    for(let i=0;i<bounds.length-1;i++){
      const t=bounds[i],active=data.filter(e=>e.start<=t&&t<e.end),notes=[...new Set(active.flatMap(e=>e.notes))].sort((a,b)=>a-b);
      // An explicit rest overlapping a sounding event is contradictory notation; ask for revision.
      if(active.some(e=>!e.notes.length)&&notes.length)fail('同一时间段同时写休止与有声音，请先澄清声部/修改记录。');
      segments.push({start:t,end:bounds[i+1],notes});
    }
    const isFunction=segments.every(s=>s.notes.length===1),judgment=text('music-judgment');
    if(!judgment)fail('先作出对应关系判断，再看核对结果。');
    if((judgment==='yes')!==isFunction)fail('请逐段检查：整个观察区间内，每个时刻是否都有且只有一个不同音高？注意休止、和弦及半开边界。');
    let frequency=base;const rows=[];
    for(let i=0;i<=12;i++){rows.push([String(i),fmt(frequency)]);frequency*=exact;}
    table('music-table',['半音编号','频率/Hz（根式值逐次相乘）'],rows);
    let accumulated=1;for(let i=0;i<12;i++)accumulated*=r;
    const output=`r = √(√(∛2)) ≈ ${fmt(exact)}；你输入的近似 r 连乘12次约 ${fmt(accumulated)}，因舍入可略偏离2。根式本身先平方两次、再立方，恰好得2。\n图上实心左端包含、空心右端不包含；时间范围［0,${fmt(end)}）。纵轴为半音编号，编号0的频率是${fmt(base)} Hz。休止/空白没有音高，不画在0 Hz。\n${segments.map(s=>`［${fmt(s.start)},${fmt(s.end)}）：${!s.notes.length?'无音高（休止/空白）':s.notes.length>1?'多个音高 '+s.notes.join('、'):'唯一音高 '+s.notes[0]}`).join('\n')}\n${isFunction?'在本次约定的整个区间上，每个时刻恰有一个音高，可看作时间的函数，图象分段为常数，并非一次函数。':'在本次整个区间上不满足每个时刻恰有一个音高。可以重新选有声的时间范围或指定单一声部，再讨论对应关系。'}\n这里的判断依赖所选坐标、声部与时间范围；项目文字、选曲和展示是开放评价。`;
    $('music-result').textContent=output;results.music=output;redraws.music=()=>chart('music-plot',segments,null,true);redraws.music();
    tell('music-feedback','数值与所选对应关系已核对；请继续写展示稿、开放评价与修订，未认证真实实施/合作。','numeric');
  });});
  for(const id of ['music-show','music-review'])$(id).addEventListener('input',clearReport);
  $('project-report').addEventListener('click',()=>{
    clearReport();
    const ids=Object.keys(results);if(!ids.length){tell('project-feedback','先完成至少一个工作台的数值核对。','retry');return;}
    if(results.music && !text('music-review')){tell('project-feedback','音乐完整报告还需开放评价（可自评），请记录证据、局限和修订。','retry');return;}
    const parts=['项目报告（当前页面草稿）\n数字仅按当前给定条件核对；以下文字、实测和合作均为自报记录，未自动认证。'];
    for(const id of ids){
      parts.push('\n'+({water:'滴水',cups:'纸杯',design:'自主方案',music:'音乐项目'})[id]+'\n'+results[id]);
      root.querySelectorAll('#'+id+'-panel textarea').forEach(el=>{if(el.value.trim())parts.push(el.parentElement.firstChild.textContent+'：\n'+el.value.trim());});
    }
    parts.push('\n自核/互评准则：能否复查数据与来源？约束、误差和适用范围是否充分？图与单位是否一致？建议/修订是否落实？没有真实交流请如实写独立练习或自评。');
    $('project-output').textContent=parts.join('\n');tell('project-feedback','报告已整理；请按准则自核或交同伴/音乐老师评价，未自动评优。');
  });
  $('project-copy').addEventListener('click',async()=>{
    const report=$('project-output').textContent;
    if(!report){tell('project-feedback','先整理当前报告。','retry');return;}
    try{await navigator.clipboard.writeText(report);tell('project-feedback','已复制当前报告。');}
    catch{tell('project-feedback','浏览器未允许复制，可直接选中上方报告文字自行复制。','retry');}
  });
  new MutationObserver(()=>Object.values(redraws).forEach(draw=>draw())).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
  if(window.matchMedia)window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>Object.values(redraws).forEach(draw=>draw()));
})();
