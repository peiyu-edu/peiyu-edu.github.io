/* J24-P: an in-memory mathematical investigation, isolated from learning records. */
(function () {
  'use strict';
  var root = document.getElementById('health-project');
  if (!root || document.body.dataset.sec !== 'j8b-p2') return;
  root.innerHTML = `
<style>
#health-project { overflow-wrap:anywhere }
#health-project .hp-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px }
#health-project label { display:block;margin:8px 0;font-weight:600 }
#health-project input,#health-project textarea,#health-project select { display:block;box-sizing:border-box;width:100%;max-width:100%;font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--muted);border-radius:6px;padding:9px;min-height:44px }
#health-project button { min-height:44px;margin:5px 5px 5px 0;white-space:normal }
#health-project .hp-scroll { overflow-x:auto;max-width:100% }
#health-project table { border-collapse:collapse;width:100%;font-size:15px }
#health-project th,#health-project td { border:1px solid var(--line);padding:7px;text-align:left }
#health-project svg { width:100%;height:auto;display:block;background:var(--card) }
#health-project pre { white-space:pre-wrap;overflow-wrap:anywhere;font:inherit }
#health-project .hp-feedback { min-height:1.8em;padding:8px 0 }
</style>
<h3>③ 自主调查工作台：从方案到报告</h3>
<p>5～8 人可分工拟方案、编卡、抽签、核算和展示；独立练习也可以。<b>只使用你们虚构的匿名数学实验数据</b>，不测量身体，不填姓名、学号或真实学生信息。先在纸上编好总体的匿名数据卡，再抽取卡片并录入；不要看完抽签结果再挑好看的数。这里记录的是模拟调查，不是现实调查证明。</p>
<p class="small">本区刷新即清空，不保存、不上传、不改变学习记录或学生导出。图表与草稿只是本次模拟的计算证据；文字是开放准则自核，没有自动项目完成分数。</p>
<div class="card" id="hp-plan">
<h4>1．拟计划与无放回抽签</h4>
<label>研究问题（可用数据回答）<textarea id="hp-question" rows="2"></textarea></label>
<div class="hp-grid"><label>虚构总体容量 N（2～80）<input id="hp-N" type="number" min="2" max="80" step="1"></label><label>计划样本容量 n（2～N）<input id="hp-n" type="number" min="2" max="80" step="1"></label></div>
<label>对象范围、编卡方法、为何选这个样本量、分工与隐私安排<textarea id="hp-plan-note" rows="3"></textarea></label>
<p class="small">总体编号为 1～N。把同形同质卡片充分混匀，不放回抽 n 张。下面用均匀随机整数模拟该过程：第 i 次从剩余 N−i+1 个位置等机会选一个并交换；每个编号最终入样机会为 n/N。随机不保证某一次一定有代表性，不能反复抽到喜欢的结果才保留。</p>
<button type="button" class="btn" id="hp-draw">执行一次随机抽签</button><button type="button" class="btn ghost" id="hp-reset">清空本项目</button>
<div id="hp-sample" class="hp-feedback" role="status" aria-live="polite"></div>
</div>
<div class="card" id="hp-collect">
<h4>2．自己收集与整理模拟记录</h4>
<p>抽签后从已编好的纸卡抄数据，一行一张，仅录抽中编号。列序固定为：<b>编号,立定跳远cm,体重kg,身高cm,肺活量mL,跑步用时s,自选量</b>。可用英文逗号或中文逗号；无表头。未记录的量填 <b>-</b>，不要填 0 冒充缺失。漏录整张卡也会计为缺失。跑步须是同一距离/规则，写入方案。</p>
<p class="small">计算范围封闭为：跳远 (0,400]，体重 (0,200]，身高 (0,250]，肺活量 (0,10000]，用时 (0,3600]，自选量 [0,10000]；单位如上。各测量值、自选量及下列各处切点用普通十进制数（可带正负号，最多12位小数；整数保留），不写科学计数法或数字碎片。切点也须有限；超出精度会提示改写，不会静默舍入。这只是软件数学练习的范围，不是生理或医学标准。BMI=kg÷(cm÷100)²，单位 kg/m²，体重和正身高都齐全才计算。</p>
<label>本次抽中卡片的模拟记录<textarea id="hp-data" rows="6" spellcheck="false"></textarea></label>
<div class="hp-grid"><label>分析指标<select id="hp-metric"><option value="jump">立定跳远（cm）</option><option value="bmi">BMI（kg/m²）</option><option value="lung">肺活量（mL）</option><option value="run">跑步用时（s）</option><option value="custom">自选生活项目的量</option></select></label><label>自选量的名称与单位（迁移时填写）<input id="hp-custom"></label></div>
<label>频数分组切点（1～8 个严格递增数，逗号分隔；按你的数据自己拟）<input id="hp-cuts" inputmode="decimal"></label>
<label>图的纵轴<select id="hp-chart"><option value="count">频数（张）</option><option value="percent">百分比（%）</option></select></label>
<p class="small">区间依次是 x＜首切点、左闭右开中间组、x≥末切点，末组无上界，所以最大值不会丢。空组也保留；百分比分母是所选指标的有效记录数，不是 N 或计划 n。百分比四舍五入后合计可能略偏离100%。原数据与切点精确显示；平均数、方差、BMI等计算量及图上数值为约数，通常保留4位小数，极小非零数用科学计数法。最优切分位置用精确值比较，不按显示值判并列。</p>
<button type="button" class="btn" id="hp-analyze">整理并分析本次样本</button>
<div id="hp-analysis" class="hp-feedback" role="status" aria-live="polite"></div>
<div id="hp-evidence" hidden></div>
</div>
<div class="card">
<h4>3．自己核算、估计与数据分组</h4>
<div class="hp-grid"><label>你算的样本平均数<input id="hp-answer-mean" inputmode="decimal"></label><label>你算的样本方差（除以有效个数）<input id="hp-answer-var" inputmode="decimal"></label><label>估计频数组第几组（从1起）<input id="hp-answer-group" type="number" min="1" step="1"></label><label>你估计总体中该组约有多少张<input id="hp-answer-est" inputmode="decimal"></label></div>
<button type="button" class="btn" id="hp-check">核对本次计算</button><div id="hp-check-out" class="hp-feedback" role="status" aria-live="polite"></div>
<p class="small">若无缺失，可用本次样本平均数、方差估计模拟总体相应统计量；所选组频率×N 得估计张数，不是实数清点。若存在漏录或缺项，下面只作有效记录的描述，不直接推总体；先补齐或说明为何缺失、怎样可能造成偏差。</p>
<label>排序后你要试的切分位置 k（前 k 个为第一组，其余为第二组）<input id="hp-split" type="number" min="1" step="1"></label><button type="button" class="btn" id="hp-group">比较组内离差平方和</button>
<div id="hp-group-out" class="hp-feedback" role="status" aria-live="polite"></div>
<p class="small">只在本次指标有效数据内枚举两组非空的 n有效−1 种连续切分。数值越相近可尝试放一起；相等数若被位置切开，不能用单一数值界线区分。分组不代表健康等级或给学生贴标签。</p>
</div>
<div class="card">
<h4>4．自拟 BMI 区间，与给定区间比较</h4>
<p>本工作台不提供医学阈值或课本具体标准表。由老师给定<b>数学练习用</b>区间，或自行模拟一套作对照；两套区间必须都标明用途。自拟切点可参考本次 BMI 的四分位数或分组，但需说明理由。以下只叫第1、2…组，不作“健康/不健康”诊断；真实未成年人的判定另需核对年龄、性别及现行官方适用标准。</p>
<label>给定区间切点（数学练习用）<input id="hp-given" inputmode="decimal"></label><label>给定区间的来源/模拟方式与适用对象<input id="hp-given-note"></label>
<label>你自拟的 BMI 切点<input id="hp-own" inputmode="decimal"></label><label>自拟理由、比较后发现的差异与可能原因<textarea id="hp-own-note" rows="3"></textarea></label>
<button type="button" class="btn" id="hp-compare">比较两套分组</button><div id="hp-compare-out" class="hp-feedback" role="status" aria-live="polite"></div>
</div>
<div class="card">
<h4>5．肺活量与跑步表现：自己看散点</h4>
<p>使用同一张卡上同时有效的肺活量与用时配对。横轴肺活量（mL），纵轴用时（s）；<b>用时越小，跑步表现越好</b>。只观察趋势，不求相关系数或回归式。数据太少、重合或范围窄时也可报告“看不清趋势”。</p>
<button type="button" class="btn" id="hp-scatter">绘制本次配对散点</button><div id="hp-scatter-out" class="hp-feedback" role="status" aria-live="polite"></div>
<label>你的图上观察：引用两处点或点群，并说出局限<textarea id="hp-trend" rows="3"></textarea></label>
<label>怎样解释这个图？<select id="hp-inference"><option value="">请先自己判断</option><option value="cause">据此证明肺活量增大会使跑步变快</option><option value="sample">只描述本次样本关系，不能推出因果</option></select></label><div id="hp-inference-out" class="hp-feedback" role="status" aria-live="polite"></div>
</div>
<div class="card">
<h4>6．研究报告、展示与同伴评价</h4>
<p>将下列草稿与本次计算证据组成报告，展示时解释抽样、分母、单位和结论范围。小组互相追问：换样本会怎样？缺失会偏向谁？哪句话超出了图表证据？<b>输入文字只供自核；系统无法确认纸卡、展示或同伴评价确已发生。</b></p>
<label>数据来源与实施过程、记录中的问题<textarea id="hp-source" rows="2"></textarea></label>
<label>主要发现与证据；估计的对象及条件<textarea id="hp-findings" rows="3"></textarea></label>
<label>样本局限、反例与下一次改进<textarea id="hp-limits" rows="3"></textarea></label>
<label>展示提纲：问题→方法→两条证据→谨慎结论<textarea id="hp-talk" rows="2"></textarea></label>
<label>同伴反馈草稿：指出具体图/数/句，提出一个追问或修改建议（不填姓名）<textarea id="hp-peer" rows="3"></textarea></label>
<label>根据反馈打算怎样修改<textarea id="hp-revise" rows="2"></textarea></label>
<button type="button" class="btn" id="hp-report">汇集当前报告草稿与自核提示</button><div id="hp-report-out" class="hp-feedback" role="status" aria-live="polite"></div>
<pre id="hp-report-draft"></pre>
<details class="more"><summary>选做：迁移到其它生活项目</summary><p>例如虚构的图书借阅时长、纸飞机飞行距离或每日阅读分钟数。先清空本项目，重新定义总体、单位、样本量和卡片；选择“自选生活项目的量”，填第7列，其余量可填 -。重新走抽样→录入→频数图→统计与分组→估计→报告全链。无身高体重或肺活量时，BMI 比较和散点环节如实写“不适用”，不用凑数。迁移数据同样只用虚构匿名数。</p></details>
</div>`;
  var $ = function (id) { return document.getElementById('hp-' + id); };
  var sample = null, result = null, comparison = '', scatterEvidence = '', grouping = '';
  var names = {jump:'立定跳远（cm）',bmi:'BMI（kg/m²）',lung:'肺活量（mL）',run:'跑步用时（s）'};
  function node(tag, text, parent) { var el = document.createElement(tag); el.textContent = text; if (parent) parent.appendChild(el); return el; }
  // Local exact quantities: accepted decimal inputs, BMI, interval tests and SSE.
  function gcd(a,b) { a=a<0n?-a:a;while(b){var t=a%b;a=b;b=t;}return a; }
  function q(n,d) { d=d===undefined?1n:d;if(d<0n){n=-n;d=-d;}var g=gcd(n,d);return [n/g,d/g]; }
  var Z=q(0n);
  function plus(a,b){return q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);}
  function minus(a,b){return q(a[0]*b[1]-b[0]*a[1],a[1]*b[1]);}
  function times(a,b){return q(a[0]*b[0],a[1]*b[1]);}
  function over(a,b){return q(a[0]*b[1],a[1]*b[0]);}
  function cmp(a,b){var n=a[0]*b[1]-b[0]*a[1];return n<0n?-1:n>0n?1:0;}
  function integer(n){return q(BigInt(n));}
  function decimal(raw){
    var s=raw.trim();
    if(s.length>330 || !/^[+-]?(?:[0-9]+(?:\.[0-9]{1,12})?|\.[0-9]{1,12})$/.test(s) || !Number.isFinite(Number(s)))throw Error('数据和切点暂未核对这种写法：请用有限的普通十进制数，最多12位小数，不拆开数字；不会自动舍入。');
    var negative=s[0]==='-';s=s.replace(/^[+-]/,'');var p=s.split('.');
    return q((negative?-1n:1n)*BigInt((p[0]||'0')+(p[1]||'')),10n**BigInt((p[1]||'').length));
  }
  function key(a){return a[0]+'/'+a[1];}
  function exact(a){
    var d=a[1],twos=0,fives=0;while(d%2n===0n){d/=2n;twos++;}while(d%5n===0n){d/=5n;fives++;}
    if(d!==1n)return key(a);
    var places=Math.max(twos,fives),n=a[0]<0n?-a[0]:a[0],digits=String(n*(10n**BigInt(places)/a[1])).padStart(places+1,'0');
    return (a[0]<0n?'-':'')+(places?digits.slice(0,-places)+'.'+digits.slice(-places):digits);
  }
  function approx(a){
    if(!a[0])return 0;
    var n=String(a[0]<0n?-a[0]:a[0]),d=String(a[1]),nh=n.slice(0,15),dh=d.slice(0,15);
    return (a[0]<0n?-1:1)*Number(nh)/Number(dh)*Math.pow(10,n.length-d.length-nh.length+dh.length);
  }
  function f(n) { n=Array.isArray(n)?approx(n):n;return n!==0 && Math.abs(n)<0.00005?Number(n.toExponential(4)).toString():String(Math.round((n+Number.EPSILON)*10000)/10000); }
  function clearReport() { $('report-out').textContent = ''; $('report-draft').textContent = ''; }
  function clearAnalysis() {
    result = null; comparison = ''; scatterEvidence = ''; grouping = '';
    ['analysis','evidence','check-out','group-out','compare-out','scatter-out','inference-out'].forEach(function (id) { $(id).replaceChildren(); });
    $('evidence').hidden = true;
    ['answer-mean','answer-var','answer-group','answer-est','split','inference'].forEach(function (id) { $(id).value = ''; });
    clearReport();
  }
  function invalidatePlan() { sample = null; $('sample').textContent = '方案已编辑，需重新抽签；旧录入不会自动转成新样本。'; clearAnalysis(); }
  function med(a) { var m=a.length>>1;return a.length%2?a[m]:over(plus(a[m-1],a[m]),integer(2)); }
  function moments(values){var sum=Z,squares=Z;values.forEach(function(x){sum=plus(sum,x);squares=plus(squares,times(x,x));});return {sum:sum,squares:squares};}
  function ss(m,n){return minus(m.squares,over(times(m.sum,m.sum),integer(n)));}
  function stats(values) {
    var s=values.slice().sort(cmp),n=s.length,m=moments(s),sse=ss(m,n),counts=new Map();
    s.forEach(function(v){var k=key(v),c=counts.get(k)||{value:v,n:0};c.n++;counts.set(k,c);});
    var max=Math.max.apply(null,Array.from(counts.values()).map(function(c){return c.n;}));
    return {s:s,n:n,mean:over(m.sum,integer(n)),variance:over(sse,integer(n)),ss:sse,median:med(s),q1:n>1?med(s.slice(0,n>>1)):null,q3:n>1?med(s.slice(Math.ceil(n/2))):null,modes:max>1?Array.from(counts.values()).filter(function(c){return c.n===max;}).map(function(c){return c.value;}):[]};
  }
  function cuts(id) {
    var raw=$(id).value.trim().split(/[,，]/);
    if(!$(id).value.trim()||raw.length>8||raw.some(function(v){return !v.trim();}))throw Error('切点需为1～8个有限数，用逗号分隔。');
    var a=raw.map(decimal);
    if(a.some(function(v,i){return i&&cmp(v,a[i-1])<=0;}))throw Error('切点必须严格递增，不能重复或倒序。');
    return a;
  }
  function index(v,c) { var i=0;while(i<c.length&&cmp(v,c[i])>=0)i++;return i; }
  function labels(c) { return c.map(function(v,i){return i?exact(c[i-1])+' ≤ x < '+exact(v):'x < '+exact(v);}).concat(['x ≥ '+exact(c[c.length-1])]); }
  function rand(bound) {
    if (!window.crypto || !window.crypto.getRandomValues) throw Error('此浏览器没有可用随机源；请在纸上充分混匀抽签后换支持此功能的浏览器练习。');
    var a = new Uint32Array(1), limit = Math.floor(4294967296/bound)*bound;
    do { window.crypto.getRandomValues(a); } while(a[0]>=limit);
    return a[0]%bound;
  }
  function table(headers,rows,parent) {
    var wrap=node('div','',parent); wrap.className='hp-scroll';
    var t=node('table','',wrap), head=node('thead','',t), hr=node('tr','',head);
    headers.forEach(function(x){var th=node('th',x,hr);th.scope='col';});
    var body=node('tbody','',t);rows.forEach(function(r){var tr=node('tr','',body);r.forEach(function(x){node('td',String(x),tr);});});
  }
  function svg(parent,label) { var s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('viewBox','0 0 620 320');s.setAttribute('role','img');s.setAttribute('aria-label',label);parent.appendChild(s);return s; }
  function shape(s,tag,attrs,text) { var e=document.createElementNS(s.namespaceURI,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k]);});if(text!==undefined)e.textContent=text;s.appendChild(e);return e; }
  function bars(c,counts,n) {
    var percent=$('chart').value==='percent', values=counts.map(function(v){return percent?v*100/n:v;}), max=Math.max(1,Math.max.apply(null,values));
    var s=svg($('evidence'),'本次样本频数分组'+(percent?'百分比图':'频数图'));
    shape(s,'text',{x:16,y:22,fill:'var(--fg)','font-size':16},percent?'百分比（%），从0起':'频数（张），从0起');
    shape(s,'line',{x1:42,x2:600,y1:270,y2:270,stroke:'var(--fg)'});
    values.forEach(function(v,i){var w=550/values.length,x=45+i*w,h=v/max*190;
      shape(s,'rect',{x:x+5,y:270-h,width:Math.max(2,w-10),height:h,fill:'var(--a)'});
      shape(s,'text',{x:x+w/2,y:Math.max(40,260-h),'text-anchor':'middle',fill:'var(--fg)','font-size':16},f(v)+(percent?'%':''));
      shape(s,'text',{x:x+w/2,y:295,'text-anchor':'middle',fill:'var(--fg)','font-size':16},'组'+(i+1));
    });
  }
  function readRows() {
    if(!sample)throw Error('先填写总体/样本容量并执行抽签。');
    if(!$('data').value.trim())throw Error('录入你从纸卡收集的模拟记录后再分析。');
    var map=new Map(), caps=[400,200,250,10000,3600,10000];
    $('data').value.trim().split(/\n/).forEach(function(line,i){
      var a=line.split(/[,，]/).map(function(v){return v.trim();});
      if(a.length!==7)throw Error('第'+(i+1)+'行需恰好7列，缺项用 -。');
      var id=Number(a[0]);
      if(!a[0] || !Number.isInteger(id) || !sample.ids.includes(id))throw Error('第'+(i+1)+'行编号未在本次样本中。');
      if(map.has(id))throw Error('编号'+id+'重复，不能重复计数。');
      var values=a.slice(1).map(function(v,j){if(v==='-')return null;
        var x=decimal(v);
        if(cmp(x,integer(caps[j]))>0 || (j===5?cmp(x,Z)<0:cmp(x,Z)<=0))throw Error('第'+(i+1)+'行第'+(j+2)+'列超出所示数学范围或不是数，缺项用 -。');return x;
      });
      var row={id:id,exact:{}};
      ['jump','weight','height','lung','run','custom'].forEach(function(k,j){row.exact[k]=values[j];row[k]=values[j]===null?null:approx(values[j]);});
      row.exact.bmi=row.weight!==null&&row.height!==null?over(times(integer(10000),row.exact.weight),times(row.exact.height,row.exact.height)):null;
      row.bmi=row.exact.bmi===null?null:approx(row.exact.bmi);
      map.set(id,row);
    });return Array.from(map.values());
  }
  function ready() { if(!result)throw Error('请先整理并分析当前样本；编辑后旧证据已清除。');return result; }
  function action(id,out,fn) { $(id).addEventListener('click',function(){try{fn();}catch(e){$(out).textContent=e.message;}}); }
  action('draw','sample',function(){
    invalidatePlan();
    var N=Number($('N').value),n=Number($('n').value);
    if(!Number.isInteger(N)||N<2||N>80||!Number.isInteger(n)||n<2||n>N)throw Error('N需为2～80整数，n需为2～N整数。');
    var pool=Array.from({length:N},function(_,i){return i+1;}),trace=[];
    for(var i=0;i<n;i++){var j=i+rand(N-i);trace.push('第'+(i+1)+'次：剩余'+(N-i)+'个位置，选第'+(j-i+1)+'个，得编号'+pool[j]);var t=pool[i];pool[i]=pool[j];pool[j]=t;}
    sample={N:N,n:n,ids:pool.slice(0,n)};
    $('sample').textContent='本次样本编号（抽取顺序）：'+sample.ids.join('、')+'。每个编号入样机会 '+n+'/'+N+'。总体 '+N+' 张，计划样本 '+n+' 张。\n'+trace.join('；')+'。请按此样本收集记录。';
  });
  action('analyze','analysis',function(){
    clearAnalysis();var rows=readRows(),metric=$('metric').value,c=cuts('cuts');
    if(metric==='custom'&&!$('custom').value.trim())throw Error('先填写自选量名称与单位。');
    var v=rows.filter(function(r){return r[metric]!==null;}).map(function(r){return r.exact[metric];});
    if(!v.length)throw Error('所选指标没有有效记录，请补录或换指标；不把缺失算成0。');
    var st=stats(v),counts=Array(c.length+1).fill(0);v.forEach(function(x){counts[index(x,c)]++;});
    result={rows:rows,metric:metric,cuts:c,counts:counts,stats:st,missing:sample.n-v.length,name:names[metric]||$('custom').value.trim()};
    $('analysis').textContent='总体 '+sample.N+' 张；抽中 '+sample.n+' 张；已录 '+rows.length+' 张；整张漏录 '+(sample.n-rows.length)+' 张；'+result.name+'有效 '+v.length+'，缺失 '+result.missing+'（含整张漏录与已录缺项）。'+(result.missing?'有缺失，只描述有效记录，不直接推总体。':(sample.n===sample.N?'已录全体且无缺失，本次统计就是这个模拟总体的统计；属于全查，不再是抽样估计。':'无缺失，可谨慎用样本估计模拟总体；换样本可能会变。'));
    var box=$('evidence');box.hidden=false;
    table(['组','区间','频数','百分比（分母 '+v.length+'）'],labels(c).map(function(l,i){return [i+1,l,counts[i],f(counts[i]*100/v.length)+'%'];}).concat([['合计','全部有效值',v.length,'100%（未舍入）']]),box);
    bars(c,counts,v.length);
    node('p','排序：'+st.s.map(exact).join('、'),box);
    node('p','统计量（显示约数）：平均数 '+f(st.mean)+'；中位数 '+f(st.median)+'；众数 '+(st.modes.length?st.modes.map(exact).join('、'):'无（没有重复数据）')+'；方差 '+f(st.variance)+'（'+result.name+'的单位平方，分母 '+st.n+'）；Q1 '+(st.q1===null?'样本不足':f(st.q1))+'，Q2 '+f(st.median)+'，Q3 '+(st.q3===null?'样本不足':f(st.q3))+'。四分位数按课本：奇数个时中位数不进两半。',box);
    if(metric==='run')node('p','用时小表示跑得更快，不能把数大误说成表现更好。',box);
  });
  action('check','check-out',function(){
    var r=ready(),s=r.stats,g=Number($('answer-group').value)-1;
    if(['answer-mean','answer-var','answer-group','answer-est'].some(function(id){return !$(id).value.trim()||!Number.isFinite(Number($(id).value));}))throw Error('四个待答栏都需填写有限数。');
    if(!Number.isInteger(g)||g<0||g>=r.counts.length)throw Error('频数组号不在本次表内。');
    if(r.missing)throw Error('有缺失：先补齐，或在报告中只描述有效记录，不把它直接推总体。');
    var expected=sample.N*r.counts[g]/s.n;
    var ok=Math.abs(Number($('answer-mean').value)-approx(s.mean))<=0.01 && Math.abs(Number($('answer-var').value)-approx(s.variance))<=0.01 && Math.abs(Number($('answer-est').value)-expected)<=0.01;
    $('check-out').textContent=ok?(sample.n===sample.N?'本次全查核算相符（允许误差0.01），该组张数为本次模拟总体的直接计数；不证明现实调查已发生。':'本次核算相符（允许误差0.01）。估计张数是约数；不证明总体实际如此，也不证明调查已经完成。'):'尚不相符：平均数用有效数据总和÷个数，方差用离差平方和÷个数；估计该组约有 N×该组频数÷样本有效数。可修改重试。';
  });
  action('group','group-out',function(){
    var r=ready(),s=r.stats.s,k=Number($('split').value);
    if(!Number.isInteger(k)||k<1||k>=s.length)throw Error('切分位置需为1～有效个数−1整数，两组都非空。');
    var options=[],total=moments(s),left={sum:Z,squares:Z};
    for(var i=1;i<s.length;i++){left.sum=plus(left.sum,s[i-1]);left.squares=plus(left.squares,times(s[i-1],s[i-1]));var right={sum:minus(total.sum,left.sum),squares:minus(total.squares,left.squares)};options.push(plus(ss(left,i),ss(right,s.length-i)));}
    var best=options.reduce(function(a,b){return cmp(a,b)<=0?a:b;}),all=[];options.forEach(function(v,i){if(cmp(v,best)===0)all.push(i+1);});
    var out=$('group-out');out.replaceChildren();
    grouping='本次 k='+k+'，两组内离差平方和合计 '+f(options[k-1])+'；最小值 '+f(best)+'，所有最优位置 '+all.join('、')+'。数值为约数显示，精确0仍写0；最优位置按精确值比较。'+(cmp(s[k-1],s[k])===0?'此处相等值被按位置分开，不对应严格数值界线。':'本次分界两侧数为 '+exact(s[k-1])+' 与 '+exact(s[k])+'。');
    node('p',grouping,out);table(['切分位置 k','两组内离差平方和（显示约数）'],options.map(function(v,i){return [i+1,f(v)];}),out);clearReport();
  });
  action('compare','compare-out',function(){
    var r=ready(),given=cuts('given'),own=cuts('own'),rows=r.rows.filter(function(x){return x.bmi!==null;});
    if(!$('given-note').value.trim()||!$('own-note').value.trim())throw Error('请写给定区间的数学练习来源/适用对象，以及自拟理由；文字只供自核。');
    if(!rows.length)throw Error('没有体重与正身高齐全的BMI，不能比较；生活迁移可如实记不适用。');
    var out=$('compare-out');out.replaceChildren();
    var gc=Array(given.length+1).fill(0),oc=Array(own.length+1).fill(0);
    var record=rows.map(function(x){var a=index(x.exact.bmi,given),b=index(x.exact.bmi,own);gc[a]++;oc[b]++;return [x.id,f(x.bmi),a+1,b+1];});
    comparison='BMI有效 '+rows.length+'，缺失 '+(sample.n-rows.length)+'；给定切点 '+given.map(exact).join('、')+'；自拟切点 '+own.map(exact).join('、')+'。分组均只作数学比较，不是医学结论。';
    node('p',comparison,out);
    table(['方案','区间','频数','百分比（有效BMI为分母）'],labels(given).map(function(l,i){return ['给定组'+(i+1),l,gc[i],f(gc[i]*100/rows.length)+'%'];}).concat(labels(own).map(function(l,i){return ['自拟组'+(i+1),l,oc[i],f(oc[i]*100/rows.length)+'%'];})),out);
    table(['匿名卡号','BMI（约数）','给定组号','自拟组号'],record,out);clearReport();
  });
  action('scatter','scatter-out',function(){
    var r=ready(),pairs=r.rows.filter(function(x){return x.lung!==null&&x.run!==null;}),out=$('scatter-out');out.replaceChildren();
    if(!pairs.length)throw Error('没有肺活量与跑步用时同时有效的配对记录。');
    scatterEvidence='配对有效 '+pairs.length+'，配对缺失 '+(sample.n-pairs.length)+'；纵轴是用时，越小跑步表现越好。只能描述本次样本，不能推出因果。';node('p',scatterEvidence,out);
    var s=svg(out,'本次配对散点图：横轴肺活量mL，纵轴跑步用时s');
    var xmax=Math.max.apply(null,pairs.map(function(x){return x.lung;}))*1.1,ymax=Math.max.apply(null,pairs.map(function(x){return x.run;}))*1.1;
    shape(s,'line',{x1:60,x2:590,y1:260,y2:260,stroke:'var(--fg)'});shape(s,'line',{x1:60,x2:60,y1:40,y2:260,stroke:'var(--fg)'});
    for(var i=0;i<=4;i++){var x=60+530*i/4,y=260-210*i/4;shape(s,'text',{x:x,y:281,'font-size':14,fill:'var(--fg)','text-anchor':'middle'},f(xmax*i/4));shape(s,'text',{x:54,y:y+4,'font-size':14,fill:'var(--fg)','text-anchor':'end'},f(ymax*i/4));}
    shape(s,'text',{x:310,y:310,'font-size':16,fill:'var(--fg)'},'肺活量（mL）');shape(s,'text',{x:10,y:24,'font-size':16,fill:'var(--fg)'},'跑步用时（s）');
    pairs.forEach(function(p){var e=shape(s,'circle',{cx:60+530*p.lung/xmax,cy:260-210*p.run/ymax,r:5,fill:'var(--a)'});var title=document.createElementNS(s.namespaceURI,'title');title.textContent='卡'+p.id+'：'+exact(p.exact.lung)+' mL，'+exact(p.exact.run)+' s';e.appendChild(title);});
    node('p','重合点可能遮挡，以下逐卡表保留所有配对：',out);table(['卡号','肺活量（mL）','用时（s）'],pairs.map(function(p){return [p.id,exact(p.exact.lung),exact(p.exact.run)];}),out);clearReport();
  });
  $('inference').addEventListener('change',function(){
    $('inference-out').textContent=this.value==='cause'?'不能据此推出因果。跑步还可能与训练、距离、记录误差等有关；模拟卡也不是生理实验。':this.value==='sample'?'推断边界合适；请结合当前散点写自己的观察，不把样本趋势断言为总体规律。':'';clearReport();
  });
  action('report','report-out',function(){
    var r=ready(),s=r.stats,fields=['question','plan-note','source','findings','limits','talk','peer','revise'],missing=fields.filter(function(id){return !$(id).value.trim();});
    $('report-out').textContent='开放草稿自核：'+(missing.length?'还有 '+missing.length+' 项文字未记录。':'各文字栏已有记录，请按准则检查内容。')+' 核对证据是否支持结论、单位/分母是否说明、局限是否具体；这不证明调查、展示或互评确已发生。';
    $('report-draft').textContent='模拟调查报告草稿（未认证）\n问题：'+$('question').value+'\n方案：'+$('plan-note').value+'\n数据来源与过程：'+$('source').value+'\n抽样：总体 '+sample.N+'，样本 '+sample.n+'，编号 '+sample.ids.join('、')+'\n有效记录：'+s.n+'；所选指标缺失 '+r.missing+'\n指标与单位：'+r.name+'\n切点：'+r.cuts.map(exact).join('、')+'\n频数：'+r.counts.join('、')+'；百分比分母 '+s.n+'\n统计量（显示约数）：平均数 '+f(s.mean)+'，中位数 '+f(s.median)+'，众数 '+(s.modes.length?s.modes.map(exact).join('、'):'无')+'，方差 '+f(s.variance)+'，Q1 '+(s.q1===null?'不足':f(s.q1))+'，Q3 '+(s.q3===null?'不足':f(s.q3))+'\n估计条件：'+(r.missing?'有缺失，不直接推总体。':(sample.n===sample.N?'全体无缺失，统计量即该模拟总体的统计量，不再是抽样估计。':'无缺失，简单随机样本只能作总体的近似估计。'))+'\n数据分组：'+(grouping||'尚未比较')+'\nBMI比较：'+(comparison||'尚未比较/迁移时可不适用')+'\n给定区间来源：'+$('given-note').value+'\n自拟理由与差异：'+$('own-note').value+'\n散点证据：'+(scatterEvidence||'尚未作图/迁移时可不适用')+'\n图上观察：'+$('trend').value+'\n解释边界：'+($('inference').value==='sample'?'限于本次样本，不能推出因果':'尚未选择谨慎解释，请自核')+'\n发现：'+$('findings').value+'\n局限与改进：'+$('limits').value+'\n展示提纲：'+$('talk').value+'\n同伴反馈草稿：'+$('peer').value+'\n修改计划：'+$('revise').value;
  });
  ['N','n','question','plan-note'].forEach(function(id){$(id).addEventListener('input',invalidatePlan);});
  ['data','cuts','metric','chart','custom'].forEach(function(id){$(id).addEventListener('input',clearAnalysis);});
  ['given','given-note','own','own-note'].forEach(function(id){$(id).addEventListener('input',function(){comparison='';$('compare-out').replaceChildren();clearReport();});});
  ['answer-mean','answer-var','answer-group','answer-est'].forEach(function(id){$(id).addEventListener('input',function(){$('check-out').textContent='';});});
  $('split').addEventListener('input',function(){grouping='';$('group-out').replaceChildren();clearReport();});
  ['source','findings','limits','talk','peer','revise','trend'].forEach(function(id){$(id).addEventListener('input',clearReport);});
  $('reset').addEventListener('click',function(){root.querySelectorAll('input,textarea').forEach(function(el){el.value='';});$('metric').value='jump';$('chart').value='count';$('inference').value='';sample=null;clearAnalysis();$('sample').textContent='已清空。请从新方案开始。';});
})();
