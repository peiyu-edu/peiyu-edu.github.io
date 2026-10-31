/* J30:186. Private to j9a-p2; no ledger, persistence, or shared contracts. */
(function () {
  'use strict';
  const root = document.getElementById('j9a-load-workshop');
  if (!root || document.body.dataset.sec !== 'j9a-p2' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  root.innerHTML = `
    <style>
      #j9a-load-workshop {overflow-wrap:anywhere}
      #j9a-load-workshop fieldset {min-width:0;border:1px solid var(--line);border-radius:12px;padding:12px;margin:14px 0}
      #j9a-load-workshop legend {font-weight:700}
      #j9a-load-workshop label {display:block;margin:8px 0}
      #j9a-load-workshop input:not([type=checkbox]), #j9a-load-workshop select,
      #j9a-load-workshop textarea {font:inherit;color:var(--ink);background:var(--card);border:1px solid var(--muted);border-radius:6px;padding:8px;max-width:100%;box-sizing:border-box}
      #j9a-load-workshop input:not([type=checkbox]) {width:8em}
      #j9a-load-workshop textarea {width:100%;min-height:100px}
      #j9a-load-workshop textarea.lw-number {width:8em;height:44px;min-height:44px;resize:vertical}
      #j9a-load-workshop .lw-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:12px}
      #j9a-load-workshop button {margin:6px 4px 6px 0;min-height:44px;white-space:normal}
      #j9a-load-workshop table {width:100%;border-collapse:collapse;font-size:15px}
      #j9a-load-workshop th, #j9a-load-workshop td {border:1px solid var(--line);padding:6px;word-break:normal}
      #j9a-load-workshop :focus-visible {outline:3px solid var(--accent);outline-offset:3px}
      #j9a-load-workshop .lw-feedback {min-height:1.8em;white-space:pre-line}
      #j9a-load-workshop svg {display:block;width:100%;height:auto;background:var(--card);color:var(--ink)}
    </style>
    <h2>包裹装载与两站调度：先建模，再比较</h2>
    <p>原创模拟数据任务。先写自己的关系和两份装载表，再检查。目标是比较<b>本题限定的整齐装载方案的有效容量</b>，并找出一趟车还能服务多少件乙站订单。</p>
    <details class="more" open><summary>数据与真实限制：每个结论都要带上它们</summary>
      <ul>
        <li>车厢内尺寸长120、宽90、高60 cm，门口净宽75、高60 cm；箱子按箱边平行车边、逐个直进门，不倾斜。进门时的横宽不能超过75 cm。</li>
        <li>同一方案只用一种标准箱：底面宽x、长100−x、高20 cm。x仅从20、30、40、50、60、70、80 cm中选。箱体外尺寸视为占位尺寸，暂忽略壁厚。</li>
        <li>箱子标有向上箭头，20 cm边必须竖直；只许水平转90°。全车统一朝向、整齐行列层，不混朝向、不错缝、不斜摆。最多3层；按本题假设每箱承受上面两箱，货物已固定。</li>
        <li>每件装好货的箱子质量均为4 kg，车辆允许货物总质量40 kg。空间余隙不能塞半件；各方向容纳件数取不超过尺寸商的整数。</li>
        <li>一趟车走仓库O→甲站A→乙站B。仓库装甲站4件和乙站t件；甲站先卸4件，再取6件送乙站；乙站全部卸空。乙站仓库订单最多8件，甲站待取6件均须取走。中途不丢弃、不留货、无其它站。</li>
        <li>同一趟始终用选定标准箱；甲站允许重新整理，站内有暂放区，不计整理时间。每段都须满足件数、重量、方向、长度及门口限制。</li>
      </ul>
      <p>两阶段分别只有一个变化量：设计箱体时研究V(x)，固定设计后研究整数t。用已学面积、体积、整除取整和一元关系逐项比较，不用多元极值或线性规划。数值枚举只能证明这14个候选（7个尺寸×2个朝向）的比较结论，不能宣称任意装箱方式全局最优。</p>
    </details>
    <fieldset data-part="model"><legend>1　自主建立数量关系</legend>
      <p>先在纸上从底面积推到体积。把V(x)展开成ax²+bx（单位cm³），填写有符号系数；再分别表示仓库出发与甲站出发的在车件数。</p>
      <label>体积二次项系数 a <textarea class="lw-number" rows="1" id="lw-a" inputmode="decimal" autocomplete="off"></textarea></label>
      <label>体积一次项系数 b <textarea class="lw-number" rows="1" id="lw-b" inputmode="decimal" autocomplete="off"></textarea></label>
      <label>仓库出发件数 n₀=t+ <textarea class="lw-number" rows="1" id="lw-before" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>甲站出发件数 n₁=t+ <textarea class="lw-number" rows="1" id="lw-after" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>我的关系依据（体积因子、装卸先后与单位）<textarea id="lw-model-note"></textarea></label>
      <p class="small">输入框只识别ASCII有符号整数（可有首尾空格、绝对值不超过1000000），不识别小数、式子、科学计数、全角数或内部空格；这些其它数学写法请留在纸上核读。自由文字不会被机器判为证明。</p>
      <button class="btn" type="button" id="lw-check-model">检查数量关系</button>
      <p class="lw-feedback" id="lw-model-feedback" role="status"></p>
    </fieldset>
    <h3>2　先填两份装载数据，比较可行容量</h3>
    <p>选两份不同候选，可以比较相同尺寸的不同朝向。朝向0：长100−x沿车长、x沿车宽；朝向90：x沿车长、100−x沿车宽。请填写几何行列层乘积G；有效容量C还要检查门口和载重，进不了门时C=0。有效满载体积=C×V(x)，与车厢体积之比只是体积利用率。</p>
    <div class="lw-grid" id="lw-designs"></div>
    <label>我的比较说明：哪份的件数与满载体积较大？是否都能执行本趟调度？为什么不能只用体积比？<textarea id="lw-compare-note"></textarea></label>
    <button class="btn" type="button" id="lw-compare">提交比较并展开14个候选核对表</button>
    <p class="lw-feedback" id="lw-compare-feedback" role="status"></p>
    <div id="lw-enumeration" hidden></div>
    <fieldset data-part="route"><legend>3　选自己的设计安排两站运输</legend>
      <label>用于调度的已检查设计 <select id="lw-route-design"><option value="">请选择</option><option value="0">我的设计一</option><option value="1">我的设计二</option></select></label>
      <label>我安排仓库发往乙站的件数 t <textarea class="lw-number" rows="1" id="lw-t" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>仓库出发在车件数 <textarea class="lw-number" rows="1" id="lw-n0" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>甲站先卸再装后的在车件数 <textarea class="lw-number" rows="1" id="lw-n1" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>该设计可执行任务时 t的最大值（无解则选下方） <textarea class="lw-number" rows="1" id="lw-max" inputmode="numeric" autocomplete="off"></textarea></label>
      <label><input id="lw-no-route" type="checkbox"> 我认为该设计没有能取走全部6件的方案</label>
      <label>我的两段约束、比较理由与调整办法<textarea id="lw-route-note"></textarea></label>
      <button class="btn" type="button" id="lw-check-route">核查两段运输</button>
      <p class="lw-feedback" id="lw-route-feedback" role="status"></p>
    </fieldset>
    <fieldset data-part="report"><legend>4　写研究报告，自核实际意义</legend>
      <p>纸笔、同伴讨论或摆模型都可以。报告需写数据来源（本题模拟）、变量与范围、装载数据表、至少两方案比较、两段不超载的证据、结论适用范围，以及现实还需核查的门缝/壁厚/强度/装卸通道等。若做了模型，写实际观察和与计算不同之处，不把模拟结果当真实物流认证。</p>
      <label>我的报告与下一步改进<textarea id="lw-report"></textarea></label>
      <label><input type="checkbox" id="lw-self-data"> 我已核对每项尺寸、单位、整数与车辆限制</label>
      <label><input type="checkbox" id="lw-self-flow"> 我已写两段件数/质量及两方案比较的理由</label>
      <label><input type="checkbox" id="lw-self-limit"> 我已写清有限枚举范围、假设与尚需实测的限制</label>
      <button class="btn" type="button" id="lw-selfcheck">记录本人的准则自核</button>
      <p class="lw-feedback" id="lw-report-feedback" role="status"></p>
    </fieldset>
    <details class="more"><summary>本次尝试与反馈记录（刷新或重做后清空）</summary><ol id="lw-log"></ol></details>
    <p class="small">所有输入只留在本页内存，不上传、不存储、不写正式学习账本。数值核对只核本题数据，报告和实作仅本人准则自核，不能自动签“文字正确”或“已掌握”。</p>
    <button class="btn" type="button" id="lw-reset">清空并重新建模</button>
  `;
  const $ = id => root.querySelector('#' + id);
  const names = ['一', '二'];
  $('lw-designs').innerHTML = names.map((name, i) => `
    <fieldset data-design="${i}"><legend>我的设计${name}</legend>
      <label>x（cm）<select id="lw-x${i}"><option value="">请选择</option>${[20,30,40,50,60,70,80].map(x => `<option value="${x}">${x}</option>`).join('')}</select></label>
      <label>统一朝向（度）<select id="lw-o${i}"><option value="">请选择</option><option value="0">0</option><option value="90">90</option></select></label>
      <label>沿车长的件数 <textarea class="lw-number" rows="1" id="lw-nx${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>沿车宽的件数 <textarea class="lw-number" rows="1" id="lw-ny${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>竖直层数 <textarea class="lw-number" rows="1" id="lw-nz${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>几何整齐排放件数 G <textarea class="lw-number" rows="1" id="lw-g${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>有效容量 C（件）<textarea class="lw-number" rows="1" id="lw-c${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <label>有效满载体积（cm³）<textarea class="lw-number" rows="1" id="lw-vol${i}" inputmode="numeric" autocomplete="off"></textarea></label>
      <button class="btn" type="button" id="lw-check${i}">核对设计${name}</button>
      <p class="lw-feedback" id="lw-design-feedback${i}" role="status"></p>
      <div id="lw-figure${i}"></div>
    </fieldset>`).join('');
  const checked = [null, null];
  let modelOK = false;
  let logCount = 0;
  function intValue(id) {
    const s = $(id).value.trim();
    if (!/^[+-]?(?:0|[1-9][0-9]{0,6})$/.test(s)) return null;
    const n = Number(s);
    return Number.isSafeInteger(n) && Math.abs(n) <= 1000000 ? n : null;
  }
  function message(id, text) { $(id).textContent = text; }
  function record(text) {
    const li = document.createElement('li');
    li.textContent = (++logCount) + '. ' + text;
    $('lw-log').appendChild(li);
    // Keep a bounded in-memory history, no student object serialization.
    if ($('lw-log').children.length > 30) $('lw-log').firstElementChild.remove();
  }
  function row(i) {
    const x = Number($('lw-x' + i).value), o = $('lw-o' + i).value;
    if (![20,30,40,50,60,70,80].includes(x) || !['0','90'].includes(o)) return null;
    const l = o === '0' ? 100 - x : x;
    const w = o === '0' ? x : 100 - x;
    const nx = Math.floor(120 / l), ny = Math.floor(90 / w), nz = 3;
    const g = nx * ny * nz;
    const c = w > 75 ? 0 : Math.min(g, Math.floor(40 / 4));
    return {x, o, l, w, nx, ny, nz, g, c, vol:c * 20 * x * (100-x)};
  }
  function signature(r) { return r ? r.x + ':' + r.o : ''; }
  function clearCompare() {
    $('lw-enumeration').hidden = true;
    $('lw-enumeration').replaceChildren();
    message('lw-compare-feedback', '');
  }
  function clearRoute() { message('lw-route-feedback', ''); }
  function clearReport() { message('lw-report-feedback', ''); }
  function draw(i, r) {
    // Only after an actual attempt: this is feedback, not a pre-answer diagram.
    let rects = '';
    for (let a = 0; a < r.nx; a++) for (let b = 0; b < r.ny; b++) {
      rects += `<rect x="${20+a*r.l*2}" y="${20+b*r.w*2}" width="${r.l*2}" height="${r.w*2}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    }
    $('lw-figure' + i).innerHTML = `<p>整齐网格底层示意（不是任意装箱证明）；可用层数${r.nz}，门口${r.w<=75?'可通过':'不可通过'}。有效容量还需受载重限制。</p><svg viewBox="0 0 280 220" role="img" aria-label="已提交设计的底层整齐排放示意"><rect x="20" y="20" width="240" height="180" fill="none" stroke="currentColor" stroke-width="3"/>${rects}</svg>`;
  }
  $('lw-check-model').addEventListener('click', () => {
    const vals = ['a','b','before','after'].map(k => intValue('lw-'+k));
    if (vals.some(v => v === null) || !$('lw-model-note').value.trim()) {
      message('lw-model-feedback', '请先填完四个支持语法的整数和自己的关系依据，再提交。'); return;
    }
    modelOK = vals.every((v, i) => v === [-20,2000,4,6][i]);
    const text = modelOK
      ? '数值关系核对一致：V(x)=20x(100−x)=−20x²+2000x；n₀=t+4，n₁=(t+4)−4+6=t+6。文字依据仍请本人或同伴核读。'
      : '请重试：底面积是x(100−x)，还须乘高20；仓库装甲站4件和乙站t件，甲站先卸4再取6。对照你的系数和常数重新推导。';
    message('lw-model-feedback', text); record('建模：'+text);
  });
  [0,1].forEach(i => {
    $('lw-check'+i).addEventListener('click', () => {
      const r = row(i), keys = ['nx','ny','nz','g','c','vol'];
      const vals = keys.map(k => intValue('lw-'+k+i));
      if (!r || vals.some(v => v === null)) {
        message('lw-design-feedback'+i, '请先选尺寸和朝向，填完六个支持语法的整数。'); return;
      }
      checked[i] = vals.every((v,k) => v === r[keys[k]]) ? r : null;
      const text = (checked[i] ? '数据一致。' : '数据尚不一致，请修正后重试。') +
        `沿长/宽/高的件数=${r.nx}/${r.ny}/${r.nz}，G=${r.g}；门口横宽${r.w}cm${r.w<=75?'≤75，可过':'＞75，不可过'}；载重至多10件，所以C=${r.c}，有效满载体积${r.vol}cm³。`;
      message('lw-design-feedback'+i, text); draw(i,r); clearCompare(); clearRoute(); clearReport();
      record('设计'+names[i]+'，x='+r.x+'，朝向'+r.o+'：'+text);
    });
    root.querySelector('[data-design="'+i+'"]').addEventListener('input', () => {
      checked[i] = null;
      message('lw-design-feedback'+i, ''); $('lw-figure'+i).replaceChildren();
      clearCompare(); clearRoute(); clearReport();
    });
    // Selects send change as well as input in browsers; guard stale state in either case.
    root.querySelector('[data-design="'+i+'"]').addEventListener('change', () => {
      checked[i] = null;
      message('lw-design-feedback'+i, ''); $('lw-figure'+i).replaceChildren();
      clearCompare(); clearRoute(); clearReport();
    });
  });
  $('lw-compare').addEventListener('click', () => {
    const [a,b] = checked;
    if (!modelOK || !a || !b || signature(a) === signature(b) || !$('lw-compare-note').value.trim()) {
      message('lw-compare-feedback', '先核对数量关系、两份不同候选的完整数据，并写自己的比较理由。'); return;
    }
    const text = `两方案容量为${a.c}与${b.c}件，满载体积为${a.vol}与${b.vol}cm³。甲站取6件，因此容量至少6件才可能完成路线。你的文字比较没有自动判真，请结合下表核读。`;
    message('lw-compare-feedback',text); record('比较：'+text);
    let body = '';
    const all = [];
    for (const x of [20,30,40,50,60,70,80]) for (const o of ['0','90']) {
      const l = o==='0'?100-x:x, w=o==='0'?x:100-x;
      const g=Math.floor(120/l)*Math.floor(90/w)*3;
      const c=w>75?0:Math.min(g,10), vol=c*20*x*(100-x);
      all.push({x,o,c,vol});
      body += `<tr><td>${x}</td><td>${o}</td><td>${g}</td><td>${w>75?'不通过':'通过'}</td><td>${c}</td><td>${vol}</td></tr>`;
    }
    const maxC=Math.max(...all.map(r=>r.c)), maxV=Math.max(...all.map(r=>r.vol));
    $('lw-enumeration').innerHTML = `<table><caption>仅限题设14个候选；0件也保留为不可用证据</caption><thead><tr><th>x<br>cm</th><th>朝向<br>度</th><th>G<br>件</th><th>门口</th><th>C<br>件</th><th>满载<br>cm³</th></tr></thead><tbody>${body}</tbody></table><p>本表最大容量${maxC}件；最大有效满载体积${maxV}cm³，由x=40、朝向0或x=60、朝向90取得。容量相同未必体积相同，请逐行比较。单箱V(x)=−20(x−50)²+50000在x=50最大，但该箱的整齐装载容量只有6件，所以“单箱最大”不能推出“全车有效满载体积最大”。体积商给必要上界，不保证箱边放得下。</p>`;
    $('lw-enumeration').hidden = false;
  });
  $('lw-check-route').addEventListener('click', () => {
    const index = $('lw-route-design').value;
    const r = ['0','1'].includes(index) ? checked[Number(index)] : null;
    if (!modelOK || !r || !$('lw-route-note').value.trim()) {
      message('lw-route-feedback','请先核对关系和所选设计，并写两段约束理由。'); return;
    }
    const no = $('lw-no-route').checked;
    if (no) {
      if (['t','n0','n1','max'].some(k=>$('lw-'+k).value.trim())) {
        message('lw-route-feedback','若主张无解，请清空四个数值框；若给数值方案，请取消无解。'); return;
      }
      const text = r.c<6
        ? '无解判断与数据一致：即使t=0，甲站出发仍需装6件，超过该设计容量。理由请人工核读。'
        : '无解判断不成立：本设计容量至少6件，请从t=0起逐项检查，并给出可执行方案。';
      message('lw-route-feedback',text); record('调度：'+text); return;
    }
    const vals = ['t','n0','n1','max'].map(k=>intValue('lw-'+k));
    if(vals.some(v=>v===null)) {message('lw-route-feedback','请填完四个支持语法的整数，或主张无解后清空数值框。'); return;}
    const [t,n0,n1,m] = vals, bound=Math.min(8,r.c-6);
    const ok = t>=0 && t<=8 && t+4<=r.c && t+6<=r.c && n0===t+4 && n1===t+6 && m===bound && bound>=0;
    const text = (ok?'该数值调度可执行，最大值填写一致。':'该数值调度或最大值尚不成立，请调整重试。')+
      `本设计C=${r.c}；n₀=t+4≤C、n₁=t+6≤C，且0≤t≤8为整数。`+
      (bound<0 ? '即使t=0也装不下甲站的6件，无解。' : `因此0≤t≤${bound}，最大t=${bound}。`) +
      `你填写t=${t}，应在车${t+4}/${t+6}件、质量${4*(t+4)}/${4*(t+6)}kg；各段都要核对。文字理由由本人/同伴核读。`;
    message('lw-route-feedback',text); record('调度：'+text);
  });
  $('lw-selfcheck').addEventListener('click',()=>{
    if (!$('lw-report').value.trim() || !['data','flow','limit'].every(k=>$('lw-self-'+k).checked)) {
      message('lw-report-feedback','请先写报告，并逐项自核后勾选三条准则。'); return;
    }
    const text='已记录本人声明的三项准则自核；网页未判断报告、纸笔证明、同伴讨论或模型实作正确，也未认证真实物流可行。';
    message('lw-report-feedback',text); record(text);
  });
  root.querySelector('[data-part="model"]').addEventListener('input',()=>{
    modelOK=false; message('lw-model-feedback',''); clearCompare(); clearRoute(); clearReport();
  });
  $('lw-compare-note').addEventListener('input',()=>{clearCompare();clearReport();});
  root.querySelector('[data-part="route"]').addEventListener('input',()=>{clearRoute();clearReport();});
  root.querySelector('[data-part="route"]').addEventListener('change',()=>{clearRoute();clearReport();});
  root.querySelector('[data-part="report"]').addEventListener('input',clearReport);
  root.querySelector('[data-part="report"]').addEventListener('change',clearReport);
  $('lw-reset').addEventListener('click',()=>{
    root.querySelectorAll('input,textarea,select').forEach(el=>{
      if(el.type==='checkbox') el.checked=false; else el.value='';
    });
    checked.fill(null); modelOK=false; logCount=0;
    root.querySelectorAll('.lw-feedback').forEach(el=>{el.textContent='';});
    $('lw-log').replaceChildren(); [0,1].forEach(i=>$('lw-figure'+i).replaceChildren()); clearCompare();
    $('lw-a').focus();
  });
}());
