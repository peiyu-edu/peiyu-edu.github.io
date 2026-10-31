/* j5-3 only: finite original tasks; exact rational affine checks, no student storage. */
(function () {
  'use strict';
  const root = document.getElementById('applied-transfer');
  if (!root || document.body.dataset.sec !== 'j5-3' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  const field = (id, label, prose = false) => `<label for="${id}">${label}</label><${prose ? 'textarea' : 'input'} id="${id}" ${prose ? 'rows="3" maxlength="1200"' : 'type="text" maxlength="160" autocomplete="off"'}></${prose ? 'textarea' : 'input'}>`;
  const choice = (id, label, options) => `<label for="${id}">${label}</label><select id="${id}"><option value="">先选择</option>${options.map(([v,t]) => `<option value="${v}">${t}</option>`).join('')}</select>`;
  const buttons = '<div class="at-buttons"><button type="submit">核对我的模型、数值与检验</button><button type="reset">清空本项重做</button></div>';
  const output = id => `<div id="${id}-out" role="status" aria-live="polite"></div>`;
  const analysis = prefix => field(prefix+'-analysis','先分析：x表示哪个量、单位和实际范围是什么？相关量怎样表示，等量关系是什么？',true);
  const reasoning = prefix => field(prefix+'-work','写出你的解方程过程与每步依据；再写实际性检查和带单位的完整答语。',true);
  root.innerHTML = `<style>
#applied-transfer{overflow-wrap:anywhere}#applied-transfer [hidden]{display:none!important}#applied-transfer label{display:block;margin-top:12px}#applied-transfer input,#applied-transfer select,#applied-transfer textarea{box-sizing:border-box;width:100%;max-width:100%;padding:9px;border:1px solid var(--muted);border-radius:6px;background:var(--card);color:var(--fg);font:inherit}#applied-transfer button,#applied-transfer a{font:inherit;min-height:44px;white-space:normal}#applied-transfer .at-buttons{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}#applied-transfer table{width:100%;table-layout:fixed;border-collapse:collapse}#applied-transfer th,#applied-transfer td{padding:6px;border:1px solid var(--line);overflow-wrap:anywhere}#applied-transfer [role=status]{margin:10px 0}#applied-transfer :focus-visible{outline:3px solid var(--a);outline-offset:3px}
</style>
<h2>换一个情境，自己分析、列式、求解和检验</h2>
<p>以下数据与故事均为本页自编。每项先写自己的分析与过程，再核数值。各题只用一个未知数 x；式子框不写单位，单位写在分析和答语中。草稿只在本页内存，刷新清空，不写学习账本。</p>
<p id="at-syntax">数值框：半角整数、有限小数（如0.5，至多6位小数）或整数分数（如−3/2，分母为正整数）；整数部分、分子与分母至多6位，不写多余前导0。可用开头的+、-、−，忽略首尾空白，不拼接数内空白。式子框另可用 x、括号、+ − * × / ÷；乘号只可在数与x或左括号间省略，除数不能含x。方程用一个=，本区核对两量直接相等或交换左右；其它合法路线保留纸笔自核。不支持上下标，不输入幂、百分号、科学记数法或单位。</p>
<details class="more" open><summary>一、顺水和逆水：同一段航程</summary>
<p>在平稳河段，水速为2千米/时，船静水速度不变。船顺水航行2小时、逆水航行3小时，两次路程相同，不计停靠。已知顺水速度为静水速度加水速，逆水速度为静水速度减水速。设静水速度为x千米/时，求静水速度和这段路程。先整理速度、时间、路程，再找相等关系。</p>
<form id="at-boat" novalidate>${analysis('at-boat')}
<table><thead><tr><th>方向</th><th>时间（时）</th><th>由你填写的量</th></tr></thead><tbody><tr><td>顺水</td><td>2</td><td>${field('at-boat-down','速度式（千米/时）')}${field('at-boat-d1','路程式（千米）')}</td></tr><tr><td>逆水</td><td>3</td><td>${field('at-boat-up','速度式（千米/时）')}${field('at-boat-d2','路程式（千米）')}</td></tr></tbody></table>
${field('at-boat-equation','把两次路程直接相等，自己列方程')}${reasoning('at-boat')}${field('at-boat-x','静水速度的数值（千米/时）')}${field('at-boat-distance','这段路程（千米）')}${field('at-boat-left','代回你所列原方程：左边的值')}${field('at-boat-right','原方程右边的值')}${buttons}${output('at-boat')}</form></details>
<details class="more"><summary>二、销售盈亏：先留下估计</summary>
<p>一家社区商店把两件不同商品各卖150元。第一件的成本利润率为25%，第二件为−25%（亏损率25%），均以各自进价为基数。合起来是盈、亏还是持平？先估计并说明理由，再分别用一元一次方程求每件的进价；两件各自设当件进价为x元，分开列、分开解，不联立两个未知数。</p>
<form id="at-sale-predict">${choice('at-sale-guess','我的估计',[['gain','盈利'],['loss','亏损'],['same','持平']])}${field('at-sale-guess-why','估计的理由：两个25%的基数是否相同？',true)}<button type="submit">记下估计，再算进价</button>${output('at-sale-predict')}</form>
<div id="at-sale-calculation" hidden><form id="at-sale" novalidate>
${analysis('at-sale')}${field('at-sale-e1','第一件：用当件进价x表示售价的式子')}${field('at-sale-e2','第二件：用当件进价x表示售价的式子')}${field('at-sale-q1','第一件的售价关系方程')}${field('at-sale-q2','第二件的售价关系方程')}${reasoning('at-sale')}
${field('at-sale-c1','第一件进价（元）')}${field('at-sale-c2','第二件进价（元）')}${field('at-sale-l1','第一件原方程左边的值')}${field('at-sale-r1','第一件原方程右边的值')}${field('at-sale-l2','第二件原方程左边的值')}${field('at-sale-r2','第二件原方程右边的值')}${field('at-sale-total','总进价（元）')}${field('at-sale-profit','总利润（元，亏损写负数）')}${field('at-sale-reflect','回看我的估计：现在是否修改？用两件进价和百分比基数解释，不能只写“抵消”。',true)}${buttons}${output('at-sale')}</form></div></details>
<details class="more"><summary>三、球赛积分：先从原始表取条件</summary>
<p>某次社区球赛每队赛8场，没有平局；每胜一场积分相同，每负一场积分也相同。积分规则暂未告诉你，先从已完成两队的记录求出每胜、每负一场的分值，再判断新队记录是否可能。这里不使用额外的证明术语。</p>
<table><thead><tr><th>队伍</th><th>胜（场）</th><th>负（场）</th><th>积分（分）</th></tr></thead><tbody><tr><td>甲</td><td>0</td><td>8</td><td>8</td></tr><tr><td>乙</td><td>5</td><td>3</td><td>18</td></tr></tbody></table>
<form id="at-ball" novalidate>${choice('at-ball-case','选择新队声称的8场总积分',[['18','18分'],['19','19分'],['6','6分']])}${field('at-ball-extract','先写从哪一行求负一场分值，怎样再用另一行求胜一场分值。',true)}${field('at-ball-loss','每负一场（分）')}${field('at-ball-win','每胜一场（分）')}${analysis('at-ball')}
<p>本区设新队胜x场。负场数用含x式表示，先列积分关系再求解。若得到分数或负数，也先如实写出代数结果，再判断实际性。</p>
${field('at-ball-other','负场数的式子')}${field('at-ball-score','总积分的式子')}${field('at-ball-equation','你的总积分方程')}${reasoning('at-ball')}${field('at-ball-x','方程求出的x（场）')}${field('at-ball-y','按同一x算出的负场数（场）')}${field('at-ball-left','代原方程左边的值')}${field('at-ball-right','代原方程右边的值')}${choice('at-ball-domain','实际性判断',[['valid','胜负都是0到8的整数，可能'],['fraction','场数不是整数，不可能'],['negative','出现负场数或场数超过8，不可能']])}${buttons}${output('at-ball')}</form></details>
<details class="more"><summary>四、先试几种页数，再研究临界</summary>
<p>沿用本页“方案比较：理由也由你写”的报价：甲每页0.5元；乙前40页每页0.7元，超过40页的部分每页0.3元。页数为非负整数，不印不收费。这里先自己试值、记费用与选择，再到原工具研究分界和三段结论。至多留8条不同页数记录，修改同一页数会替换该条。</p>
<form id="at-trial" novalidate>${field('at-trial-n','我选的页数（0到500的整数）')}${field('at-trial-a','我算甲的费用（元）')}${field('at-trial-b','我算乙的费用（元）')}${choice('at-trial-pick','这次应选',[['a','甲便宜'],['b','乙便宜'],['same','两家一样']])}<button type="submit">核对并留下这一行</button><button type="reset">清空试值记录</button>${output('at-trial')}</form>
<table><thead><tr><th>页数</th><th>甲费（元）</th><th>乙费（元）</th><th>我的选择</th></tr></thead><tbody id="at-trial-rows"></tbody></table>
<p>至少试3个不同页数，包含前40页与超过40页，并找到两家分别更便宜的例子；不足时继续换数，不先求临界。</p>
${field('at-trial-question','试值后，我要进一步研究什么问题？对选择变化有什么猜测？',true)}<button type="button" id="at-trial-next">整理观察，继续原比较工具</button>${output('at-trial-next')}<p id="at-trial-link" hidden><a href="#plan-form">到本页原方案工具：自主列费用式、求分界、用差式解释三段</a></p></details>
<details class="more"><summary>五、木杆挂重物：明确给定的平衡模型</summary>
<p>只研究一个自编的虚拟模型：忽略杆重，支点固定，相同小物的重量相同。题目给定“平衡时，左右两边的小物个数×挂点到支点距离相等”，本题据此列式，不要求把物理定理当已学知识。左侧3个小物挂在离支点8厘米处；右侧2个小物的挂点离支点为(x+2)厘米，右侧只允许挂在离支点大于0且不超过16厘米处。求x与右侧挂点距离。</p>
<p>先预测挂点向外移会让右侧上述乘积怎样变化，再用模型亲自列、解、检。若无实物可只做虚拟任务；网页不认证真实装置或器具安全。</p>
<form id="at-rod" novalidate>${field('at-rod-predict','我的预测和理由；若将来实物验证，准备怎样记录并核对？未做就写计划。',true)}${analysis('at-rod')}${field('at-rod-left-expr','左侧“个数×距离”的数值算式')}${field('at-rod-right-expr','右侧“个数×距离”的含x式')}${field('at-rod-equation','用给定平衡关系列方程')}${reasoning('at-rod')}${field('at-rod-x','x的值（厘米）')}${field('at-rod-distance','右侧挂点到支点距离（厘米）')}${field('at-rod-left','代回原方程左边的值')}${field('at-rod-right','代回原方程右边的值')}${choice('at-rod-domain','挂点是否在本题允许范围',[['yes','在允许范围内'],['no','超出或不为正']])}${buttons}${output('at-rod')}</form></details>
<details class="more"><summary>六、数学文化选学：自编仿古分物</summary>
<p>借“盈不足”题材作一个分物故事：同一批物资换两种分法，一种分完有余，一种不够。以下村落、物资和数字均为本页自编，<strong>不是古籍原题</strong>。用今人的字母方程体验两种分法中同一总量的关系；不据此断言古人采用本页的记号和算法。</p>
<p>村里把同一批种子按整袋分给若干户。若每户4袋，还余9袋；若每户6袋，则少7袋。每户按同一办法分得相同袋数，户数和总袋数都是正整数。设户数为x，求户数和种子总袋数。这里“少7袋”指现有总数比所需数少7袋。</p>
<form id="at-culture" novalidate>${analysis('at-culture')}${field('at-culture-e1','按每户4袋，表示现有总袋数的式子')}${field('at-culture-e2','按每户6袋，表示现有总袋数的式子')}${field('at-culture-equation','同一现有总数的两种表示相等，列方程')}${reasoning('at-culture')}${field('at-culture-x','户数（户）')}${field('at-culture-bags','种子总数（袋）')}${field('at-culture-left','代原方程左边的值')}${field('at-culture-right','代原方程右边的值')}${choice('at-culture-domain','实际性判断',[['yes','两问量均为正整数，符合分物条件'],['no','存在非正数或非整数']])}${field('at-culture-reflect','用自己的话比较“有余”和“不足”怎样进入两种总量式；指出哪些是题设、哪些是你的推断。',true)}${buttons}${output('at-culture')}</form></details>`;
  const $ = id => root.querySelector('#'+id);
  const get = id => $(id).value;
  const require = (ok, message) => { if (!ok) throw Error(message); };
  const unsupported = '暂未核对此写法。请按本区输入约定改写；这不表示其它合法数学想法错误。';
  const gcd = (a,b) => { a = a<0n?-a:a; while(b) [a,b]=[b,a%b]; return a; };
  function q(n,d=1n) { require(d!==0n,'除以0没有意义，请检查分母。'); if(d<0n){n=-n;d=-d;}const g=gcd(n,d);n/=g;d/=g;require(n.toString().length<70&&d.toString().length<70,unsupported);return[n,d]; }
  const add=(a,b)=>q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]), neg=a=>[-a[0],a[1]], mul=(a,b)=>q(a[0]*b[0],a[1]*b[1]), div=(a,b)=>q(a[0]*b[1],a[1]*b[0]);
  const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1], Z=q(0n), O=q(1n), same=(a,b)=>eq(a[0],b[0])&&eq(a[1],b[1]);
  const text=a=>a[0].toString()+(a[1]===1n?'':'/'+a[1]);
  function number(raw) {
    const s=raw.trim().replace(/−/g,'-');
    require(s.length<=160 && /^[+-]?(?:0|[1-9][0-9]{0,5})(?:\.[0-9]{1,6}|\s*\/\s*(?:[1-9][0-9]{0,5}))?$/.test(s),unsupported);
    if(s.includes('/')) {const[a,b]=s.split('/');return q(BigInt(a.trim()),BigInt(b.trim()));}
    const sign=s[0]==='-'?-1n:1n, u=s.replace(/^[+-]/,''),[a,b='']=u.split('.');return q(sign*BigInt(a+b),10n**BigInt(b.length));
  }
  function parse(raw) {
    require(raw.trim() && raw.length<=160,unsupported);
    const s=raw.replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/'), ts=[];let i=0;
    while(i<s.length){if(/\s/.test(s[i])){i++;continue;}const m=/^(?:0|[1-9][0-9]{0,5})(?:\.[0-9]{1,6})?/.exec(s.slice(i));
      if(m){ts.push({t:'n',v:m[0]});i+=m[0].length;}else{require('x()+-*/'.includes(s[i]),unsupported);ts.push({t:s[i++]});}require(ts.length<=100,unsupported);}
    let at=0;const kind=()=>ts[at]?.t;
    const plus=(a,b)=>({v:[add(a.v[0],b.v[0]),add(a.v[1],b.v[1])],hasX:a.hasX||b.hasX});
    const scale=(a,k)=>({v:a.v.map(v=>mul(v,k)),hasX:a.hasX});
    function atom(){const t=ts[at++];require(t,unsupported);if(t.t==='n')return{v:[Z,number(t.v)],hasX:false};if(t.t==='x')return{v:[O,Z],hasX:true};
      if(t.t==='+'||t.t==='-'){const a=atom();return t.t==='-'?scale(a,q(-1n)):a;}require(t.t==='(',unsupported);const a=sum();require(kind()===')',unsupported);at++;return a;}
    function product(){let a=atom();while(true){let op=kind();const implicit=(ts[at-1]?.t==='n')&&(op==='x'||op==='(');if(implicit)op='*';else if(op==='*'||op==='/')at++;else break;const b=atom();
      if(op==='*'){require(!(a.hasX&&b.hasX),unsupported);a=scale(a.hasX?a:b,a.hasX?b.v[1]:a.v[1]);}else{require(!b.hasX,unsupported);a=scale(a,div(O,b.v[1]));}}
      return a;}
    function sum(){let a=product();while(kind()==='+'||kind()==='-'){const op=ts[at++].t,b=product();a=plus(a,op==='-'?scale(b,q(-1n)):b);}return a;}
    const a=sum();require(at===ts.length,unsupported);return a.v;
  }
  const expression=(id,want)=>require(same(parse(get(id)),parse(want)),$(id).previousElementSibling.textContent+'：与本题数量关系尚未核对相符，请检查量、符号和单位。');
  const scalar=(id,want)=>require(eq(number(get(id)),number(String(want))),$(id).previousElementSibling.textContent+'：数值尚未相符，请重新计算，不先取近似。');
  function model(id,left,right){const sides=get(id).split('=');require(sides.length===2,'方程请填写一个等号，两边表示同一个量。');const a=sides.map(parse),l=parse(left),r=parse(right);require((same(a[0],l)&&same(a[1],r))||(same(a[0],r)&&same(a[1],l)),'本区核对上述两个量直接相等（可换左右）；其它合法建模路线请保留纸笔，暂未核对。');}
  function prose(...ids){for(const id of ids)require(get(id).trim(),'请先填写自己的分析、过程、答语或反思。文字只供自核，不自动判真。');}
  function clear(id){$(id+'-out').replaceChildren();}
  function complete(id,criteria){const out=$(id+'-out');out.textContent='本题式子、数值和已填检验核对相符；文字已记录，未自动判真，也未认证任何线下经历。';const d=document.createElement('details'),s=document.createElement('summary'),p=document.createElement('p');s.textContent='对照我的文字与实际条件，自核或修改';p.textContent=criteria;d.append(s,p);out.append(d);}
  function wire(id,run){const f=$(id);f.addEventListener('submit',e=>{e.preventDefault();clear(id);try{run();}catch(e){$(id+'-out').textContent=e.message;}});for(const ev of ['input','change','reset'])f.addEventListener(ev,()=>clear(id));}
  wire('at-boat',()=>{prose('at-boat-analysis','at-boat-work');expression('at-boat-down','x+2');expression('at-boat-up','x-2');expression('at-boat-d1','2(x+2)');expression('at-boat-d2','3(x-2)');model('at-boat-equation','2(x+2)','3(x-2)');scalar('at-boat-x',10);scalar('at-boat-distance',24);scalar('at-boat-left',24);scalar('at-boat-right',24);complete('at-boat','顺逆速度分别加、减同一水速；两次路程相等。检查你写的变形是否两边同动、是否正确分配。静水速度大于水速，逆水速度为正；时间、速度、路程单位一致。答语应回答静水速度和航程两问；这不是含未知数分母的方程。');});
  let saleReady=false;
  function revokeSale(){saleReady=false;$('at-sale-calculation').hidden=true;clear('at-sale');clear('at-sale-predict');}
  for(const ev of ['input','change'])$('at-sale-predict').addEventListener(ev,revokeSale);
  wire('at-sale-predict',()=>{require(['gain','loss','same'].includes(get('at-sale-guess')),'请先作出自己的估计。');prose('at-sale-guess-why');saleReady=true;$('at-sale-calculation').hidden=false;$('at-sale-predict-out').textContent='估计已记录，尚未判对错。现在分别求进价，再比较收入与总成本。';});
  wire('at-sale',()=>{require(saleReady,'先留下自己的估计；修改估计后须重新提交。');prose('at-sale-analysis','at-sale-work','at-sale-reflect');expression('at-sale-e1','1.25x');expression('at-sale-e2','0.75x');model('at-sale-q1','1.25x','150');model('at-sale-q2','0.75x','150');scalar('at-sale-c1',120);scalar('at-sale-c2',200);for(const id of ['l1','r1','l2','r2'])scalar('at-sale-'+id,150);scalar('at-sale-total',320);scalar('at-sale-profit',-20);complete('at-sale','两件分开设当件进价为x，按各自成本计算25%，两件的x并非同一个数。售价=进价+利润；成本均应为正。收入减总进价才是总利润。把核算后的结论与自己的原估计对照，说明基数不同为什么不能直接抵消；网页不自动核验这段解释。');});
  function ballClear(){clear('at-ball');}
  $('at-ball-case').addEventListener('change',()=>{for(const el of $('at-ball').querySelectorAll('input,textarea,select'))if(el.id!=='at-ball-case')el.value='';ballClear();});
  wire('at-ball',()=>{const total=get('at-ball-case');require(['18','19','6'].includes(total),'先选择新队记录。');prose('at-ball-extract','at-ball-analysis','at-ball-work');scalar('at-ball-loss',1);scalar('at-ball-win',3);expression('at-ball-other','8-x');expression('at-ball-score','3x+(8-x)');model('at-ball-equation','3x+(8-x)',total);const x=div(add(number(total),q(-8n)),q(2n)),y=add(q(8n),neg(x));scalar('at-ball-x',text(x));scalar('at-ball-y',text(y));scalar('at-ball-left',total);scalar('at-ball-right',total);const expected=x[1]!==1n?'fraction':x[0]<0n||x[0]>8n?'negative':'valid';require(get('at-ball-domain')===expected,'重新检查胜负场数是否都是0到8的整数；方程算通不等于记录可行。');complete('at-ball','先从全负队提取负一场分值，再从有胜场的队提取胜一场分值。胜负场合计8，以一个未知数表达另一量。分别代原方程两边，再判断是否为允许范围内的整数。分数场数、负场数、超过总场数都不合本题实际；请在自己的答语中写明理由。');});
  const trials=new Map();
  function closeTrialNext(){clear('at-trial-next');$('at-trial-link').hidden=true;}
  $('at-trial-question').addEventListener('input',closeTrialNext);
  wire('at-trial',()=>{const n=number(get('at-trial-n'));require(n[1]===1n&&n[0]>=0n&&n[0]<=500n,'页数应为0到500的整数，本区只核对这一范围。');const k=n[0],a=q(k,2n),b=k<=40n?q(7n*k,10n):add(q(28n),q(3n*(k-40n),10n));scalar('at-trial-a',text(a));scalar('at-trial-b',text(b));const pick=eq(a,b)?'same':a[0]*b[1]<b[0]*a[1]?'a':'b';require(get('at-trial-pick')===pick,'先核对两费，再比较哪家省钱。');require(trials.has(String(k))||trials.size<8,'本轮已留8个页数，可改同一页数或清空重做。');trials.set(String(k),{n:k,a,b,pick});$('at-trial-rows').replaceChildren();for(const row of trials.values()){const tr=document.createElement('tr');for(const val of [row.n.toString(),text(row.a),text(row.b),{a:'甲',b:'乙',same:'同价'}[row.pick]]){const td=document.createElement('td');td.textContent=val;tr.append(td);}$('at-trial-rows').append(tr);}closeTrialNext();$('at-trial-out').textContent='这一行费用和选择已核对并记录；继续换页数观察，几行数值不能证明所有页数的选择。';});
  $('at-trial').addEventListener('reset',()=>{trials.clear();$('at-trial-rows').replaceChildren();$('at-trial-question').value='';closeTrialNext();});
  $('at-trial-next').addEventListener('click',()=>{closeTrialNext();try{const rows=[...trials.values()];require(rows.length>=3,'请先留下至少3个不同页数的有效记录。');require(rows.some(r=>r.n>0n&&r.n<=40n)&&rows.some(r=>r.n>40n),'请同时观察前40页与超过40页的费用。');require(rows.some(r=>r.pick==='a')&&rows.some(r=>r.pick==='b'),'还没有两家分别省钱的记录，请再换一些页数比较。');prose('at-trial-question');$('at-trial-link').hidden=false;$('at-trial-next-out').textContent='试值与问题已记录，问题文字未自动判真。接着在原工具自己列费用式、求相等时的页数，并用差式自核三段；试值观察不能替代一般说明。';}catch(e){$('at-trial-next-out').textContent=e.message;}});
  wire('at-rod',()=>{prose('at-rod-predict','at-rod-analysis','at-rod-work');expression('at-rod-left-expr','3*8');expression('at-rod-right-expr','2(x+2)');model('at-rod-equation','3*8','2(x+2)');scalar('at-rod-x',10);scalar('at-rod-distance',12);scalar('at-rod-left',24);scalar('at-rod-right',24);require(get('at-rod-domain')==='yes','请根据实际挂点距离检查本题给定范围。');complete('at-rod','本题把平衡数量关系直接作为题设，不据网页计算认证实际杆能平衡。挂点到支点距离是x+2，不是x；先用同一关系列式，再代原两边核。实际距离为正且不超过16厘米；回答x与挂点距离两问。预测、装置计划和任何实物记录均由自己或同伴核对，没做就保留计划。');});
  wire('at-culture',()=>{prose('at-culture-analysis','at-culture-work','at-culture-reflect');expression('at-culture-e1','4x+9');expression('at-culture-e2','6x-7');model('at-culture-equation','4x+9','6x-7');scalar('at-culture-x',8);scalar('at-culture-bags',41);scalar('at-culture-left',41);scalar('at-culture-right',41);require(get('at-culture-domain')==='yes','请核户数、总袋数的正整数条件及两种分法。');complete('at-culture','同一现有总数，一种是已分数量加余数，一种是所需数量减不足数。把求出的户数代回两式，是否给同一个总数？正整数条件与两种分法都满足，答语须含户与袋。此题故事与数字自编，只体验盈不足关系，不当古籍原题或历史算法的证据。');});
})();
