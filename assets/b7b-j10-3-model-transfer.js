/* j10-3 only: finite original models; all work remains in page memory. */
(function () {
  'use strict';
  const root = document.getElementById('model-transfer');
  if (!root || document.body.dataset.sec !== 'j10-3' || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const style = document.createElement('style');
  style.textContent = '#model-transfer input,#model-transfer select,#model-transfer textarea{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:5px;padding:8px;box-sizing:border-box;max-width:100%;min-height:44px}#model-transfer input{width:7em}#model-transfer textarea{display:block;width:100%;min-height:5em}#model-transfer .mt-number{display:inline-block;width:7em;min-height:44px;height:44px;vertical-align:middle;resize:vertical}#model-transfer label{display:inline-block;margin:6px}#model-transfer button{min-height:44px;margin:6px;white-space:normal}#model-transfer .mt-scroll{overflow:auto}#model-transfer table{border-collapse:collapse;width:100%}#model-transfer td,#model-transfer th{border:1px solid var(--line);padding:6px}#model-transfer svg{width:100%;height:auto;max-width:560px;color:var(--fg)}#model-transfer output{display:block;overflow-wrap:anywhere;min-height:2em}#model-transfer .mt-pair{display:flex;flex-wrap:wrap;gap:8px}';
  root.appendChild(style);
  function element(tag, text, parent) { const e = document.createElement(tag); if (text !== null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function card(id, title, intro) { const e = element('form', null, root); e.id = id; e.className = 'card'; element('h3', title, e); element('p', intro, e); return e; }
  function field(parent, title, name, long) { const l = element('label', title + ' ', parent), e = element('textarea', null, l); e.name = name; e.setAttribute('aria-label', title); if (!long) { e.className = 'mt-number'; e.rows = 1; e.inputMode = 'decimal'; e.maxLength = 80; } else e.maxLength = 1600; return e; }
  function choose(parent, title, name, options) { const l = element('label', title + ' ', parent), e = element('select', null, l); e.name = name; options.forEach(([v,t]) => { const o = element('option', t, e); o.value = v; }); return e; }
  function note(parent, text) { return element('p', text, parent); }
  function controls(form, check, action) { const submit = element('button', check, form); submit.type = 'submit'; const reset = element('button', '清空本任务', form); reset.type = 'reset'; const out = element('output', '', form); out.setAttribute('aria-live', 'polite'); form.addEventListener('submit', ev => { ev.preventDefault(); try { out.textContent = action(form); } catch (e) { out.textContent = e.message; } }); form.addEventListener('input', () => { out.textContent = ''; }); form.addEventListener('change', () => { out.textContent = ''; }); form.addEventListener('reset', () => { out.textContent = ''; }); return out; }
  // Exact, bounded literal grammar. No expression evaluation or compatibility folding.
  const gcd = (a,b) => b ? gcd(b,a%b) : a;
  function rat(n,d=1n) { if (!d) throw Error('分母不能为0；请改写。'); if (d<0n) {n=-n;d=-d;} const g=gcd(n<0n?-n:n,d); return [n/g,d/g]; }
  function literal(raw) {
    const s=raw.trim(), m=s.match(/^([+-]?\d{1,9})(?:\.(\d{1,6})|[ \t]*\/[ \t]*([+-]?\d{1,9}))?$/);
    if (!m) throw Error('暂未核对：数值须为普通整数、最多6位小数或整数分数；数字中不能插空白，不收算式、单位、指数、上标。');
    if (m[3] !== undefined) return rat(BigInt(m[1]),BigInt(m[3]));
    const den=10n**BigInt((m[2]||'').length), neg=m[1].startsWith('-');
    return rat(BigInt(m[1])*den+(neg?-1n:1n)*BigInt(m[2]||0),den);
  }
  const eq=(a,b)=>a[0]*b[1]===b[0]*a[1];
  const mul=(a,b)=>rat(a[0]*b[0],a[1]*b[1]);
  const sub=(a,b)=>rat(a[0]*b[1]-b[0]*a[1],a[1]*b[1]);
  function val(f,k) { return literal(f.elements[k].value); }
  function equals(f,k,n,d=1) { if (!eq(val(f,k),rat(BigInt(n),BigInt(d)))) throw Error('请重查“'+f.elements[k].getAttribute('aria-label')+'”；此栏的数值尚不符合题给关系。'); }
  function relation(f,prefix,wanted,original) { const got=['a','b','c'].map(k=>val(f,prefix+k)); const want=wanted.map(n=>Array.isArray(n)?rat(BigInt(n[0]),BigInt(n[1])):rat(BigInt(n))); if (original && got.some((n,i)=>!eq(n,want[i]))) throw Error('此处按原记录的包数和金额填未倍乘三项；其它等价写法请留纸上核对。'); const pivot=want.findIndex(n=>n[0]!==0n); if (pivot<0 || !got[pivot][0]) throw Error('本行不能写成三个0；请按题给这一条关系列式。'); if (got.some((n,i)=>!eq(mul(n,want[pivot]),mul(got[pivot],want[i])))) throw Error('这行不是所标那一条原数量关系的等价倍式；请核对各项含义和单位。'); }
  function equation(f,prefix,title,variables) { note(f,title+'：按 a×'+variables[0]+' + b×'+variables[1]+' = c 填三个数。'+(prefix.startsWith('v')?'本题此行先不倍乘。':'可用非零共同倍数。')); const p=element('div',null,f); p.className='mt-pair'; field(p,title+'的a',prefix+'a');field(p,title+'的b',prefix+'b');field(p,title+'的c',prefix+'c'); }
  note(root,'以下是四项自编任务。先分析，再列、解、验、答。数值按有限指定格式精确核对，文字解释只按准则自检；网页不认证纸笔、同伴讨论或实际实验已经发生。作答只留当前页，刷新即清空，不写学习账本。');
  note(root,'输入：有符号普通整数（最多9位）、有限小数（最多6位）或整数分数。首尾可留空白，分数线两侧可留空格/制表符；数位之间不可插空白。可写负分母，不能为0。不收单位、上标、指数或算式；其它合法写法请在纸上核对，不据此判数学错误。');

  const crates=card('mt-crates','⑥ 从图取条件：称箱子，最后回答整包质量','同种箱子每箱质量不变。图中每次称重都不含空托盘。要把一箱A、两箱B放在一个空托盘上，空托盘重2 kg，求这整包的质量。先别把所求总质量直接设成箱重：想清楚先求哪两个中间量。');
  const picture=element('div',null,crates);
  picture.innerHTML='<svg viewBox="0 0 560 200" role="img" aria-label="两次称箱示意，箱上字母表示种类，右侧给每次总质量"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="15" y="20" width="330" height="65"/><rect x="15" y="115" width="330" height="65"/></g><g fill="currentColor" font-size="23"><text x="28" y="60">[A] [A] [A] [B] [B]</text><text x="370" y="60">共34 kg</text><text x="28" y="155">[A] [A] [B] [B] [B]</text><text x="370" y="155">共31 kg</text></g></svg>';
  field(crates,'我的独立分析：先求什么，再怎样得到整包质量？','analysis',true);
  const orientation=choose(crates,'我用x表示哪种箱子每箱的质量？y表示另一种。','orientation',[['','先选设元方式'],['A','x表示A，y表示B'],['B','x表示B，y表示A']]);
  field(crates,'把x、y的完整含义和共同单位写清楚','meaning',true);
  const wrap=element('div',null,crates);wrap.className='mt-scroll';const table=element('table',null,wrap);const head=element('tr',null,element('thead',null,table));['称重','A箱数','B箱数','总质量（kg）'].forEach(t=>element('th',t,head));const body=element('tbody',null,table);
  [1,2].forEach(i=>{const row=element('tr',null,body);element('th','第'+i+'次',row);[['A','A箱数'],['B','B箱数'],['mass','质量kg']].forEach(([k,t])=>field(element('td',null,row),'第'+i+'次'+t,'table'+i+k));});
  field(crates,'第一条原数量关系（文字）','relation1',true);field(crates,'第二条原数量关系（文字）','relation2',true);
  equation(crates,'c1','第一次称重关系',['x','y']);equation(crates,'c2','第二次称重关系',['x','y']);
  field(crates,'我的消元过程（包括中间方程和依据，按准则自核）','work',true);
  field(crates,'解得x（kg/箱）','x');field(crates,'解得y（kg/箱）','y');
  field(crates,'代回第一次称重所得总质量（kg）','check1');field(crates,'代回第二次称重所得总质量（kg）','check2');field(crates,'原问题所问整包质量（kg，含托盘）','answer');
  controls(crates,'核对数值关系，再自检说明',f=>{if (!f.elements.orientation.value) throw Error('先决定x、y表示哪一种箱子，再列式。'); ['analysis','meaning','relation1','relation2','work'].forEach(k=>{if (!f.elements[k].value.trim()) throw Error('先留下独立分析、含义/单位、两条关系和消元过程；文字稍后按准则自核。');});[['table1A',3],['table1B',2],['table1mass',34],['table2A',2],['table2B',3],['table2mass',31]].forEach(([k,n])=>equals(f,k,n));const a=f.elements.orientation.value==='A';relation(f,'c1',a?[3,2,34]:[2,3,34]);relation(f,'c2',a?[2,3,31]:[3,2,31]);equals(f,'x',a?8:5);equals(f,'y',a?5:8);equals(f,'check1',34);equals(f,'check2',31);equals(f,'answer',20);return '本题指定数值与两条原关系核对通过。文字尚未判真：请逐项自核箱数是否来自图、未知量是否是每箱质量、单位是否统一；逐式检查消元而非只看末值；最后是否把中间量还原成原问整包并计入空托盘。';});
  orientation.addEventListener('change',()=>{['c1a','c1b','c1c','c2a','c2b','c2c','x','y','check1','check2','answer'].forEach(k=>{crates.elements[k].value='';});});

  const compare=card('mt-compare','⑦ 分析之后：用另一种表示向同伴说明','先完成上面的独立分析。保留自己的原稿，再任选图、表、式中的两种表示同一信息：可在纸上标箱子组合、整理数量表，或用等式对应两次称重。也可用前面的饮品/分地任务比较不同方法。');
  choose(compare,'我的第一种表示','first',[['','先选'],['图','图'],['表','表'],['式','式']]);choose(compare,'另一种表示','second',[['','先选'],['图','图'],['表','表'],['式','式']]);field(compare,'两种表示怎样对应同一条件？写具体标记、表中行列或式中项。','link',true);
  choose(compare,'交流状态（如实选）','status',[['','先选'],['planned','尚未交流，记录准备追问'],['discussed','已交流，只记录方法与分歧']]);field(compare,'我的追问/同伴的不同方法：哪里相同，哪里更方便？','peer',true);field(compare,'我保留或修改哪一步？理由是什么？','revision',true);
  controls(compare,'记录说明并打开自核准则',f=>{if (!f.elements.first.value||!f.elements.second.value||f.elements.first.value===f.elements.second.value) throw Error('先选两种不同的表示。');if (!f.elements.status.value||['link','peer','revision'].some(k=>!f.elements[k].value.trim())) throw Error('请如实记录对应关系、追问或分歧，以及保留/修改理由。');return '仅记录已填写，不判文字正确或交流已发生。自核：是否先保留个人分析？两表示是否用了同一两条独立信息和同一单位？能逐项指出图、表、式的对应吗？比较是否具体到条件、消元倍数或还原问量，而非只说更快？未交流时是否明确写的是准备追问？';});

  const tires=card('mt-tires','⑧ 轮胎换位：把每条胎的总磨损量记作1','自编理想模型：一辆两轮车的两条新胎相同，每条胎在前位单独行驶10000 km会磨损完，在后位单独行驶6000 km会磨损完。假定两位置单位里程磨损率恒定且可相加，途中只交换前后位置一次，希望两胎同时恰好磨损完。胎A换位前在前位，换位后在后位；胎B的位置相反。换位前行m km，换位后行n km。请建两条胎各自的磨损关系，求换位安排并检验；这是限定模型，不承诺真实轮胎寿命。');
  field(tires,'我的建模分析：总量1、两段路程与两条胎怎样对应？','analysis',true);field(tires,'前位每km磨损量（总量的几分之几）','front');field(tires,'后位每km磨损量（总量的几分之几）','rear');
  equation(tires,'t1','胎A两段磨损合为1',['m','n']);equation(tires,'t2','胎B两段磨损合为1',['m','n']);field(tires,'我的求解过程与非负路程前提（自行逐步核看）','work',true);field(tires,'换位前m（km）','m');field(tires,'换位后n（km）','n');field(tires,'两段总里程（km）','distance');
  note(tires,'分别填写每条胎的两段磨损，再写相加的结果；换位前是否已有一条胎用完？请回到两个原关系检查。');
  [['a1','胎A换位前磨损'],['a2','胎A换位后磨损'],['asum','胎A总磨损'],['b1','胎B换位前磨损'],['b2','胎B换位后磨损'],['bsum','胎B总磨损']].forEach(([k,t])=>field(tires,t,k));field(tires,'解释：换位时是否都未用完？为何不能把两胎总量一起当1？模型忽略了什么？','limits',true);
  controls(tires,'核对两胎数值与原关系',f=>{if (['analysis','work','limits'].some(k=>!f.elements[k].value.trim())) throw Error('先写分析、求解过程与实际边界说明，之后按准则自核。');equals(f,'front',1,10000);equals(f,'rear',1,6000);relation(f,'t1',[[1,10000],[1,6000],1]);relation(f,'t2',[[1,6000],[1,10000],1]);equals(f,'m',3750);equals(f,'n',3750);equals(f,'distance',7500);[['a1',3,8],['a2',5,8],['asum',1,1],['b1',5,8],['b2',3,8],['bsum',1,1]].forEach(([k,a,b])=>equals(f,k,a,b));return '指定磨损率、两胎原关系、两段里程与逐胎检验的数值核对通过。解释另自核：m、n是否非负？换位时每条胎磨损是否小于1，最终是否各为1？每条胎的1是自身全部可用磨损量；总量相加不能替代逐胎条件。恒定/相同/可相加是假设，路况、材质、安全更换等未计入；结果不作真实车辆寿命承诺。';});

  const conflict=card('mt-conflict','⑨ 这份记录能成立吗？只研究这两份记录','同一商店、同一时刻，两种固定规格文具包的单价都不变，且没有折扣或额外费用。记录甲：买2包A和3包B，共31元；记录乙：买4包A和6包B，共65元。设x、y分别为A、B每包单价（元/包）。先各自列式，再比较这两批的组合，写清依据。');
  note(conflict,'这两行按原记录的包数和金额填未倍乘的三项；下面按这两行作相减。');
  equation(conflict,'v1','甲的原记录',['x','y']);equation(conflict,'v2','乙的原记录',['x','y']);choose(conflict,'我作的比较','direction',[['','先选'],['forward','乙式减去甲式的2倍'],['reverse','甲式的2倍减去乙式']]);field(conflict,'比较后x的系数','zeroX');field(conflict,'比较后y的系数','zeroY');field(conflict,'比较后的右边','difference');choose(conflict,'对这份具体记录的结论','conclusion',[['','先判断'],['none','没有同时满足两记录的单价'],['some','可以找到同时满足两记录的单价']]);field(conflict,'用组合倍数与金额说明你的结论，指出依赖哪条价格假设。','reason',true);
  controls(conflict,'核对这份记录的分析',f=>{relation(f,'v1',[2,3,31],true);relation(f,'v2',[4,6,65],true);if (!f.elements.direction.value) throw Error('先选定比较的顺序。');equals(f,'zeroX',0);equals(f,'zeroY',0);equals(f,'difference',f.elements.direction.value==='forward'?3:-3);if (f.elements.conclusion.value!=='none') throw Error('请再比较：相同单价、同倍组合时，两份记录能同时成立吗？');if (!f.elements.reason.value.trim()) throw Error('先留下对记录矛盾和价格假设的解释，再按准则自核。');return '这个具体记录的列式、相减和结论核对通过。解释未自动判真：相同单价下乙组合是甲的2倍，金额也须对应；比较后左边为0而右边非0，所以明示假设下记录不能同时成立。若现实里有优惠/费用，先重查假设；这里不推广无解的一般判据，也不同于方程有解但件数非整数的情形。';});
}());
