/* j4-2 only. Exact rational coefficient vectors; no sampling, storage or global API. */
(function () {
  'use strict';
  const root = document.getElementById('j42-self');
  if (!root || document.body.dataset.sec !== 'j4-2' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  function rat(a, b = 1n) {
    if (!b) throw Error('zero divisor');
    if (b < 0n) { a = -a; b = -b; }
    let x = a < 0n ? -a : a, y = b;
    while (y) { const t = x % y; x = y; y = t; }
    return [a / x, b / x];
  }
  const add = (a, b) => rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
  const neg = a => [-a[0], a[1]];
  const mono = (key, q) => new Map([[key, q]]);
  const scalar = q => mono('', q);
  const clean = p => new Map([...p].filter(([, q]) => q[0]));
  function plus(a, b) {
    const p = new Map(a);
    for (const [k, q] of b) p.set(k, add(p.get(k) || [0n, 1n], q));
    return clean(p);
  }
  function scale(p, q) { return clean(new Map([...p].map(([k, r]) => [k, mul(r, q)]))); }
  function numeric(p) { p = clean(p); return !p.size || (p.size === 1 && p.has('')); }
  const value = p => p.get('') || [0n, 1n];
  function product(a, b) {
    if (numeric(a)) return scale(b, value(a));
    if (numeric(b)) return scale(a, value(b));
    // Only juxtaposed individual variable factors form a monomial. No algebraic product expansion.
    if (a.size !== 1 || b.size !== 1) throw Error('unsupported product');
    const [ka, qa] = [...a][0], [kb, qb] = [...b][0];
    const key = (ka + kb).split('').sort().join('');
    if (key.length > 4) throw Error('degree limit');
    return mono(key, mul(qa, qb));
  }
  function parse(raw) {
    if (raw.length > 400 || !raw.trim()) throw Error('length');
    // Explicit mappings only; superscripts stay exponent tokens, never NFKC digits.
    const s = raw.replace(/−/g, '-').replace(/×|·/g, '*');
    const ts = []; let pos = 0;
    while (pos < s.length) {
      if (/\s/u.test(s[pos])) { pos++; continue; }
      const m = /^(?:\d+(?:\.\d+)?|[xyabn]|[+*/()^\-]|[²³])/.exec(s.slice(pos));
      if (!m) throw Error('token');
      const t = m[0];
      if (/^\d/.test(t) && (t.replace('.', '').length > 12 || (t.split('.')[1] || '').length > 8)) throw Error('number limit');
      ts.push(t); pos += t.length;
    }
    let i = 0;
    const peek = () => ts[i];
    function atom() {
      let node, t = ts[i++];
      if (t === '(') { node = sum(); if (ts[i++] !== ')') throw Error('bracket'); node = {type:'group', child:node}; }
      else if (/^\d/.test(t || '')) {
        const [a, b = ''] = t.split('.'); node = {type:'num', q:rat(BigInt(a + b), 10n ** BigInt(b.length))};
      } else if (/^[xyabn]$/.test(t || '')) node = {type:'var', name:t};
      else throw Error('atom');
      if (peek() === '^' || peek() === '²' || peek() === '³') {
        t = ts[i++]; const e = t === '^' ? ts[i++] : t === '²' ? '2' : '3';
        if (!['2','3'].includes(e) || !['var','num','group'].includes(node.type)) throw Error('power');
        if (node.type === 'group' && hasVars(node.child)) throw Error('polynomial power');
        node = {type:'pow', child:node, e:Number(e)};
      }
      return node;
    }
    function unary() {
      if (peek() === '+' || peek() === '-') { const op = ts[i++]; return {type:'sign', op, child:unary()}; }
      return atom();
    }
    function term() {
      let n = unary();
      while (true) {
        const t = peek();
        if (t === '*' || t === '/') { i++; n = {type:'op', op:t, left:n, right:unary()}; }
        else if (t && (/^[xyabn]$/.test(t) || t === '(')) n = {type:'op', op:'implicit', left:n, right:unary()};
        else break; // number-number adjacency (including whitespace) is never multiplication.
      }
      return n;
    }
    function sum() {
      let n = term();
      while (peek() === '+' || peek() === '-') { const op = ts[i++]; n = {type:'op', op, left:n, right:term()}; }
      return n;
    }
    const ast = sum(); if (i !== ts.length) throw Error('trailing');
    return {ast, p:evalNode(ast)};
  }
  function hasVars(n) { return n.type === 'var' || !!(n.child && hasVars(n.child)) || !!(n.left && (hasVars(n.left) || hasVars(n.right))); }
  function evalNode(n) {
    if (n.type === 'num') return scalar(n.q);
    if (n.type === 'var') return mono(n.name, [1n, 1n]);
    if (n.type === 'group') return evalNode(n.child);
    if (n.type === 'sign') return scale(evalNode(n.child), [n.op === '-' ? -1n : 1n, 1n]);
    if (n.type === 'pow') {
      const p = evalNode(n.child);
      if (numeric(p)) { let q = [1n, 1n]; for (let k = 0; k < n.e; k++) q = mul(q, value(p)); return scalar(q); }
      if (n.child.type !== 'var') throw Error('power');
      return mono(n.child.name.repeat(n.e), [1n, 1n]);
    }
    const a = evalNode(n.left), b = evalNode(n.right);
    if (n.op === '+') return plus(a, b);
    if (n.op === '-') return plus(a, scale(b, [-1n, 1n]));
    if (n.op === '/') {
      if (hasVars(n.right) || !numeric(b) || !value(b)[0]) throw Error('divisor');
      return scale(a, rat(value(b)[1], value(b)[0]));
    }
    if (hasVars(n.left) && hasVars(n.right)) {
      // Individual letters may be juxtaposed; x*y and (x+1)*y belong to a later chapter.
      const bare = z => z.type === 'var' || (z.type === 'pow' && z.child.type === 'var') ||
        (z.type === 'op' && z.op === 'implicit' && bare(z.left) && bare(z.right));
      if (n.op !== 'implicit' || !bare(n.right) || !(bare(n.left) || isCoefficientMonomial(n.left))) throw Error('later product');
    }
    return product(a, b);
  }
  function isCoefficientMonomial(n) {
    if (n.type === 'sign') return isCoefficientMonomial(n.child);
    if (n.type === 'var' || (n.type === 'pow' && n.child.type === 'var')) return true;
    if (n.type !== 'op' || !['implicit','*','/'].includes(n.op)) return false;
    try { return numeric(evalNode(n.left)) || (numeric(evalNode(n.right)) && isCoefficientMonomial(n.left)) ||
      (n.op === 'implicit' && isCoefficientMonomial(n.left) && n.right.type === 'var'); } catch { return false; }
  }
  function same(a, b) {
    a = clean(a); b = clean(b);
    return a.size === b.size && [...a].every(([k,q]) => b.has(k) && q[0] === b.get(k)[0] && q[1] === b.get(k)[1]);
  }
  function compare(a, b) {
    try { return same(parse(a).p, parse(b).p) ? 'equal' : 'different'; } catch { return 'manual'; }
  }
  function numberCompare(a, b) {
    try { const p = parse(a); return hasVars(p.ast) ? 'manual' : same(p.p, parse(b).p) ? 'equal' : 'different'; } catch { return 'manual'; }
  }
  function terms(n, sign = 1n) {
    if (n.type === 'op' && ['+','-'].includes(n.op)) return [...terms(n.left, sign), ...terms(n.right, n.op === '-' ? -sign : sign)];
    if (n.type === 'sign') return terms(n.child, n.op === '-' ? -sign : sign);
    // A term cannot hide a sum or a bracket; stage checks examine uncombined signed terms.
    function hasGroup(z) { return z.type === 'group' || (z.left && (hasGroup(z.left) || hasGroup(z.right))) || (z.child && hasGroup(z.child)); }
    if (hasGroup(n)) throw Error('not expanded');
    const p = scale(evalNode(n), [sign,1n]);
    if (p.size > 1) throw Error('term');
    return [p];
  }
  const sig = p => JSON.stringify([...clean(p)].map(([k,q]) => [k,q.map(String)]));
  function bag(raw) { return terms(parse(raw).ast).map(sig).sort().join('|'); }
  const source = '3(x^2-2xy+1)-(x^2-5xy-4)';
  const expanded = '3x^2-6xy+3-x^2+5xy+4';
  const answer = '2x^2-xy+7';
  function expandedCheck(s) { try { return bag(s) === bag(expanded) ? 'equal' : 'different'; } catch { return 'manual'; } }
  function groupCheck(s, key) {
    const expected = {xx:'3x^2-x^2', xy:'-6xy+5xy', '':'3+4'}[key];
    try { return bag(s) === bag(expected) ? 'equal' : 'different'; } catch { return 'manual'; }
  }
  function finalCheck(s, sorted) {
    try {
      const p = parse(s), t = terms(p.ast);
      if (!same(p.p, parse(answer).p) || t.length !== 3 || t.some(v => !v.size) || new Set(t.map(v => [...v.keys()][0])).size !== 3) return 'different';
      if (sorted && t.map(v => [...v.keys()][0]).join(',') !== 'xx,xy,') return 'different';
      return 'equal';
    } catch { return 'manual'; }
  }

  function simplifiedPair(raw, expected) {
    try {
      let n = parse(raw).ast;
      if (!same(evalNode(n),parse(expected).p)) return 'different';
      while (n.type === 'group') n = n.child;
      if (n.type === 'op' && ['implicit','*'].includes(n.op)) {
        if (!hasVars(n.left)) n = n.right;
        else if (!hasVars(n.right)) n = n.left;
        while (n.type === 'group') n = n.child;
      }
      const t = terms(n);
      return t.length === 2 && t.every(p=>p.size===1) && new Set(t.map(p=>[...p.keys()][0])).size === 2 ? 'equal' : 'different';
    } catch { return 'manual'; }
  }

  const mount = root.querySelector('[data-self-mount]');
  const field = (id, label, multiline = false) => `<label for="${id}">${label}</label><${multiline ? 'textarea' : 'input'} id="${id}" name="${id}" ${multiline ? '' : 'type="text" autocomplete="off"'}></${multiline ? 'textarea' : 'input'}>`;
  const status = id => `<div class="self-status" id="${id}" role="status" aria-live="polite"></div>`;
  const actions = '<div class="ctrl"><button class="btn" type="submit">核对式子与自核准则</button><button class="btn ghost" type="reset">重写本活动</button></div>';
  const checks = labels => labels.map(label => `<label><input style="width:auto" type="checkbox"> ${label}</label>`).join('');
  mount.innerHTML = `
  <h4>一、每一步由你写</h4>
  <p>独立化简：3(x² − 2xy + 1) − (x² − 5xy − 4)。每行另写依据，不把“答案一样”当作依据。</p>
  <form id="j42-process" novalidate>
    ${field('j42-expand','1. 去括号后的完整一行（暂不合并）')}
    ${field('j42-why1','这一行为什么能这样去括号？',true)}
    <p>2. 把上行每一项连符号抄入三组，每项恰用一次。每组填写未合并的加减式；组的顺序由你选。</p>
    ${[1,2,3].map(i => field('j42-group'+i,'第 '+i+' 组的各项')).join('')}
    ${field('j42-why2','说明每组为什么是同类项，归组用了什么运算律。',true)}
    ${field('j42-combine','3. 合并后的整式（此行不要求排序）')}
    ${field('j42-why3','合并时什么相加、什么不变？写出依据。',true)}
    ${field('j42-sort','4. 按 x 的指数从高到低排列（常数放最后）')}
    ${field('j42-why4','重新排列时，符号如何处理？依据是什么？',true)}
    ${actions}${status('j42-process-out')}
  </form>
  <h4>二、同一道题，两条路都亲自算</h4>
  <p>还是上面的原式。取 x = −2，y = 3。先按原式算，再用你化简的式子算；把负数代入时用括号。数值框可写纯数字算式。</p>
  <form id="j42-evaluate" novalidate>
    ${field('j42-direct-work','直接代入原式：写代入后的数式与中间计算。',true)}
    ${field('j42-first','直接算：原式中第一个括号连同外面的系数的值')}
    ${field('j42-second','直接算：原式中被减的第二个括号的值')}
    ${field('j42-direct','直接算：原式的值')}
    ${field('j42-own-simple','不看示范，填写你得到的化简式')}
    ${field('j42-simple-work','先化简再代入：写代入与计算过程。',true)}
    ${field('j42-simple','先化简再算：所得值')}
    ${field('j42-compare','比较两条算路：各算了哪些乘法、加减或乘方？哪条对你方便，原因是什么？',true)}
    ${actions}${status('j42-evaluate-out')}
  </form>
  <h4>三、位值列式，再加减说理</h4>
  <p>一个两位自然数的十位数字是 a（1 至 9），个位数字是 b（0 至 9）。交换数字后，按十位与个位的位值计数；b = 0 时反写所得数只有一位，不能再叫两位数。</p>
  <form id="j42-digits" novalidate>
    ${field('j42-original','由你列出原数的式子')}${field('j42-reverse','由你列出反写所得数的式子')}
    ${field('j42-sum','写两数之和，并自行化简')}${field('j42-difference','写原数减反写数的差，并自行化简')}
    ${field('j42-digit-why','说明两个数字各占什么位，怎样列式、去括号、合并；和与差各有什么规律？b = 0 时如何解释？',true)}
    ${actions}${status('j42-digits-out')}
  </form>
  <h4>四、月历：先试数，再一般说明</h4>
  <p>下面是一个虚构月份的月历，空白格没有日期。选择一个<strong>同月、无空白</strong>的 2×2 方块。试着比较两条对角线日期的和，再自己用字母说明。</p>
  <table aria-label="虚构月份的日期"><thead><tr>${['一','二','三','四','五','六','日'].map(x=>'<th>'+x+'</th>').join('')}</tr></thead><tbody>${Array.from({length:5},(_,r)=>'<tr>'+Array.from({length:7},(_,c)=>{const n=r*7+c-1;return '<td>'+(n>=1&&n<=30?n:'')+'</td>';}).join('')+'</tr>').join('')}</tbody></table>
  <form id="j42-calendar" novalidate>
    ${field('j42-date','选定方块的左上日期（整数）')}
    ${field('j42-date-tr','具体方块的右上日期')}${field('j42-date-bl','具体方块的左下日期')}${field('j42-date-br','具体方块的右下日期')}
    ${field('j42-observed1','左上与右下的具体日期和')}${field('j42-observed2','右上与左下的具体日期和')}
    ${field('j42-observation','写你的特殊观察；说明所选方块没有空白格。',true)}
    <button class="btn" type="button" id="j42-observe-check">核对具体观察，进入一般说明</button>${status('j42-observe-out')}
    <fieldset id="j42-calendar-general" hidden disabled><legend>再用字母一般说明</legend>
    <p>一般情形：用 n 表示你选择的完整方块左上日期。其余三格分别怎样表示？写完再核对，不把某个月或几个例子当成一般证明。</p>
    ${field('j42-tr','右上日期的式子')}${field('j42-bl','左下日期的式子')}${field('j42-br','右下日期的式子')}
    ${field('j42-diag1','左上与右下之和的化简式')}${field('j42-diag2','右上与左下之和的化简式')}
    ${field('j42-calendar-proof','自由说明：为什么这些式子表示日期？两和为何有这样的关系？什么情况下不能这样套用？',true)}
    ${actions}${status('j42-calendar-out')}</fieldset><button class="btn ghost" type="reset">重选方块</button>
  </form>
  <h4>五、两位自然数被 3 整除：从算例到理由</h4>
  <p>自选一个能被3整除、另一个不能被3整除的两位自然数，分别检查它与它的数字和能否被 3 整除。再设十位数字为 a、个位数字为 b（范围同活动三），用位值与整式加减说明一般情形。这里只证明两位数，不把两个算例当成所有自然数的证明。</p>
  <form id="j42-three" novalidate>
    ${field('j42-num1','第一个两位自然数（能被3整除）')}${field('j42-num2','另一个两位自然数（不能被3整除）')}
    ${[1,2].map(i => field('j42-dsum'+i,'第 '+i+' 个数的数字和') + field('j42-nrem'+i,'第 '+i+' 个数除以3的余数') + field('j42-srem'+i,'第 '+i+' 个数字和除以3的余数')).join('')}
    ${field('j42-three-try','写下两次数值检查的计算过程和观察。',true)}
    <button class="btn" type="button" id="j42-trials-check">核对两例，进入一般说明</button>${status('j42-trials-out')}
    <fieldset id="j42-three-general" hidden disabled><legend>再用字母一般说明</legend>
    ${field('j42-number','一般两位数的位值式')}
    ${field('j42-remainder','原数减去数字和，化简得到什么？')}
    ${field('j42-split','把原数改写成“3 的倍数 + 数字和”的式子')}
    ${field('j42-three-proof','用文字说明：前一部分为什么是 3 的倍数？为什么原数能否被 3 整除与数字和一致？两个方向都说明。',true)}
    ${actions}${status('j42-three-out')}</fieldset><button class="btn ghost" type="reset">重新试数</button>
  </form>`;

  const get = id => root.querySelector('#' + id).value;
  function feedback(id, results, prose, criteria) {
    const out = root.querySelector('#' + id);
    const issues = results.filter(([,r]) => r !== 'equal');
    out.textContent = issues.length ? issues.map(([name,r]) => name + (r === 'manual' ? '：暂未核对，请按输入约定改写；合法想法也可留待人工核对。' : '：与本步要求不符，请检查符号、漏项和本步操作。')).join(' ') : '本步式子核对相符。';
    if (prose.some(id => !get(id).trim())) out.textContent += ' 文字记录尚未填全，请补写自己的过程与理由。';
    else out.textContent += ' 文字已记录，未自动判真。';
    const d = document.createElement('details'); d.className = 'more';
    const s = document.createElement('summary'); s.textContent = '展开自核准则（文字请逐条自己核对）'; d.append(s);
    const p = document.createElement('p'); p.textContent = criteria; d.append(p);
    const box = document.createElement('div'); box.innerHTML = checks(['我已逐项检查上述准则；仍有疑问的地方留给人工核对。']); d.append(box); out.append(d);
  }
  function wire(id, out, run) {
    const f = root.querySelector('#' + id);
    f.addEventListener('submit', e => { e.preventDefault(); run(); });
    const clear = () => { root.querySelector('#' + out).textContent = ''; };
    f.addEventListener('input', e => { if (e.target.type !== 'checkbox') clear(); });
    f.addEventListener('change', e => { if (e.target.type !== 'checkbox') clear(); });
    f.addEventListener('reset', clear);
  }
  wire('j42-process', 'j42-process-out', () => {
    const rows = [1,2,3].map(i => get('j42-group'+i));
    let grouping = 'different';
    const keys = ['xx','xy',''];
    const matches = rows.map(s => keys.findIndex(k => groupCheck(s,k) === 'equal'));
    if (new Set(matches).size === 3 && !matches.includes(-1)) grouping = 'equal';
    else if (rows.some(s => {try {bag(s); return false;} catch {return true;}})) grouping = 'manual';
    feedback('j42-process-out', [['去括号',expandedCheck(get('j42-expand'))],['三组逐项归组',grouping],['合并',finalCheck(get('j42-combine'),false)],['降幂排序',finalCheck(get('j42-sort'),true)]],
      ['j42-why1','j42-why2','j42-why3','j42-why4'], '去括号：括号外的数连符号乘每一项，减一个括号时每项变号。找同类项只看字母和各自指数，归组用加法交换律、结合律，每项带原符号且恰用一次。合并用分配律，系数相加、字母和指数不变；排序按 x 指数降序，交换位置时符号随项走。式子相等不能代替这些理由。');
  });
  wire('j42-evaluate','j42-evaluate-out', () => {
    const results = [['第一部分',numberCompare(get('j42-first'),'51')],['被减部分',numberCompare(get('j42-second'),'30')],['直接求值',numberCompare(get('j42-direct'),'21')],['独立化简式',finalCheck(get('j42-own-simple'),false)],['化简后求值',numberCompare(get('j42-simple'),'21')]];
    feedback('j42-evaluate-out',results,['j42-direct-work','j42-simple-work','j42-compare'], '负数代入先加括号，先乘方后乘除、最后加减。原式直接算要保留被减部分的整体；先化简后，抵消的项不用再求值。核对两路每个中间值与最终值，再根据自己写下的运算比较工作量。数值相符尚不能证明所写代入过程、比较理由都正确；本次代入也不是恒等的证明。');
  });
  wire('j42-digits','j42-digits-out', () => feedback('j42-digits-out',[
    ['原数',compare(get('j42-original'),'10a+b')],['反写',compare(get('j42-reverse'),'10b+a')],['和',simplifiedPair(get('j42-sum'),'11a+11b')],['差',simplifiedPair(get('j42-difference'),'9a-9b')]],['j42-digit-why'],
    '十位数字贡献它的十倍，个位贡献它本身。求差时被减数整体加括号；和可写成 11(a+b)，差可写成 9(a-b)，用分配律解释倍数关系。a 是1至9的数字，b 是0至9的数字；若称反写数为两位数，还须 b 非0。b=0时位值式仍成立，但反写数为一位数。'));
  function splitCheck(raw) {
    try {
      let ast = parse(raw).ast;
      while (ast.type === 'group') ast = ast.child;
      if (ast.type !== 'op' || ast.op !== '+') return 'different';
      const a = evalNode(ast.left), b = evalNode(ast.right);
      const nine = parse('9a').p, digits = parse('a+b').p;
      return (same(a,nine) && same(b,digits)) || (same(b,nine) && same(a,digits)) ? 'equal' : 'different';
    } catch { return 'manual'; }
  }
  function whole(raw, min, max) { if (!/^\s*\d{1,2}\s*$/.test(raw)) return null; const n = Number(raw); return n>=min && n<=max ? n : null; }
  function calendarValid(n) { return n !== null && (n+1)%7 !== 6 && n+8 <= 30; }
  function calendarTrial() {
    const n = whole(get('j42-date'),1,30);
    return [['具体方块存在性',calendarValid(n)?'equal':n===null?'manual':'different'],
      ...[['j42-date-tr',n+1],['j42-date-bl',n+7],['j42-date-br',n+8],['j42-observed1',2*n+8],['j42-observed2',2*n+8]].map(([id,v]) => [root.querySelector('label[for="'+id+'"]').textContent,numberCompare(get(id),String(v))])];
  }
  function threeTrial() {
    const a = whole(get('j42-num1'),10,99), b = whole(get('j42-num2'),10,99);
    const results = [['两个两位数的条件',a!==null&&b!==null&&a%3===0&&b%3!==0?'equal':a===null||b===null?'manual':'different']];
    for (const [i,n] of [[1,a],[2,b]]) {
      const ds = n===null ? 0 : Math.floor(n/10)+n%10;
      for (const [prefix,v] of [['dsum',ds],['nrem',n%3],['srem',ds%3]]) results.push(['第'+i+'例'+prefix,numberCompare(get('j42-'+prefix+i),String(v))]);
    }
    return results;
  }
  function stageGate(formId, button, stage, out, before, trial, prose) {
    const f = root.querySelector('#'+formId), box = root.querySelector('#'+stage);
    function close() { box.hidden = true; box.disabled = true; root.querySelector('#'+out).textContent=''; }
    root.querySelector('#'+button).addEventListener('click', () => {
      const rs = trial();
      const pass = rs.every(([,r])=>r==='equal') && get(prose).trim();
      box.hidden = !pass; box.disabled = !pass;
      root.querySelector('#'+out).textContent = pass ? '具体数值核对相符；观察文字未自动判真。现在请用字母一般说明。' : rs.filter(([,r])=>r!=='equal').map(([name,r])=>name+(r==='manual'?'：暂未核对，请改写。':'：请重算或重选。')).join(' ') + (!get(prose).trim()?' 请先记录具体观察。':'');
    });
    f.addEventListener('input', e => { if (before.includes(e.target.id)) close(); });
    f.addEventListener('reset', close);
  }
  stageGate('j42-calendar','j42-observe-check','j42-calendar-general','j42-observe-out',
    ['j42-date','j42-date-tr','j42-date-bl','j42-date-br','j42-observed1','j42-observed2','j42-observation'],calendarTrial,'j42-observation');
  stageGate('j42-three','j42-trials-check','j42-three-general','j42-trials-out',
    ['j42-num1','j42-num2','j42-dsum1','j42-dsum2','j42-nrem1','j42-nrem2','j42-srem1','j42-srem2','j42-three-try'],threeTrial,'j42-three-try');
  wire('j42-calendar','j42-calendar-out', () => {
    if (root.querySelector('#j42-calendar-general').disabled) return;
    feedback('j42-calendar-out',[
      ...calendarTrial(),['右上',compare(get('j42-tr'),'n+1')],['左下',compare(get('j42-bl'),'n+7')],['右下',compare(get('j42-br'),'n+8')],['一条对角线和',compare(get('j42-diag1'),'2n+8')],['另一条对角线和',compare(get('j42-diag2'),'2n+8')]],['j42-observation','j42-calendar-proof'],
      '先核选的四格确为同月相邻两行两列，不能跨周末换到下一行，也不能用空白格。左右相邻差1、上下相邻差7；一般两条对角线的和都化为2n+8，所以相等。具体算例只作观察，字母表示所有满足条件的方块才是一般说明；不得跨月或跨空白套用。');
  });
  wire('j42-three','j42-three-out', () => {
    if (root.querySelector('#j42-three-general').disabled) return;
    feedback('j42-three-out',[
      ...threeTrial(),['位值式',compare(get('j42-number'),'10a+b')],['减数字和',compare(get('j42-remainder'),'9a')],['拆成倍数与数字和',splitCheck(get('j42-split'))]],['j42-three-try','j42-three-proof'],
      '先亲算两个不同例子，再核一般式10a+b=9a+(a+b)。9a是3的倍数：它等于3乘整数3a。若数字和是3的倍数，加上9a仍是；若原数是3的倍数，减去9a后数字和也是。两个方向都用整数的倍数说明，不用同余或整除符号；这里仅论两位数，未证明任意位数。算例记录与自由说明未自动判真。');
  });
})();
