/* Page-local exact arithmetic for the j2-3 observation activity. */
(function () {
  'use strict';
  var root = document.getElementById('power-pattern-lab');
  if (!root || document.body.dataset.sec !== 'j2-3') return;
  root.innerHTML = `<style>  #power-pattern-lab input,#power-pattern-lab select,#power-pattern-lab textarea{box-sizing:border-box;width:100%;max-width:100%;padding:9px;border:1px solid var(--muted);border-radius:6px;background:var(--card);color:var(--fg);font:inherit;}
  #power-pattern-lab label{display:block;margin:8px 0;min-width:0;}
  #power-pattern-lab .pp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px;}
  #power-pattern-lab fieldset{min-width:0;margin:10px 0;padding:12px;border:1px solid var(--line);border-radius:8px;}
  #power-pattern-lab legend{font-weight:600;}
  #power-pattern-lab button{min-height:44px;background:var(--card);color:var(--fg);margin:4px 4px 4px 0;}
  #power-pattern-lab :focus-visible{outline:3px solid var(--a);outline-offset:2px;}
</style>
    <h3>先记录，再用自己的话归纳</h3>
    <p>暂时不看上面的法则和读数，先笔算并填写自己的记录。可回看消息传播：第 n 轮的连乘中有几个 3？省略号只省去了中间未写出的相同因数，不能把个数省掉。</p>
    <p class="small" id="pp-syntax">本活动只用正整数指数。数值填写半角整数、有限小数（至多三位小数）或整数分数 p/q；可用开头的 +、- 或 −，分母用正整数且不能为 0。不填算式、字母、科学记数法或数内空格；只忽略首尾空白。不讨论其他指数。</p>
    <p class="small">这里只核对填写的数值和符号，不写入学习记录。改动会清除本组旧反馈；可重试或清空。键盘 Tab 逐格移动，Enter 提交本组。</p>
    <form data-pp="powers" aria-describedby="pp-syntax">
      <h4>① 对照正数、负数、0 与特殊底数</h4>
      <div class="pp-grid"><fieldset><legend>2¹</legend><label>展开后相同因数的个数<input name="p1-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="p1-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="p1-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>2³</legend><label>展开后相同因数的个数<input name="p3-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="p3-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="p3-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>(−3)¹</legend><label>展开后相同因数的个数<input name="n1-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="n1-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="n1-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>(−3)²</legend><label>展开后相同因数的个数<input name="n2-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="n2-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="n2-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>(−3)³</legend><label>展开后相同因数的个数<input name="n3-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="n3-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="n3-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>0⁴</legend><label>展开后相同因数的个数<input name="z-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="z-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="z-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>1⁵</legend><label>展开后相同因数的个数<input name="one-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="one-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="one-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>(−1)⁶</legend><label>展开后相同因数的个数<input name="minusone-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="minusone-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="minusone-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset>
<fieldset><legend>(−1/2)³</legend><label>展开后相同因数的个数<input name="fraction-count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我算得的幂值<input name="fraction-value" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="fraction-sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label></fieldset></div>
      <label>把 (−3)³ 完整展开成重复乘法<input name="expansion" type="text" maxlength="100" autocomplete="off"></label>
      <p class="small">因数之间用 × 或 *，负因数加括号；这里不写等号、幂或省略号。</p>
      <fieldset><legend>括号对照：分别计算</legend><label>(−3)² 的值<input name="bracket" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>−3² 的值<input name="prefix" type="text" inputmode="text" maxlength="90" autocomplete="off"></label></fieldset>
      <label>我的归纳：幂的符号由什么决定？0、1、−1 和指数 1 有什么特点？<textarea name="reflection" rows="3" maxlength="900"></textarea></label>
      <button class="btn" type="submit">核对记录并查看自核准则</button><button class="btn ghost" type="reset">清空这组重试</button>
      <p class="result" data-feedback aria-live="polite">先填写记录，再核对。</p>
    </form>
    <form data-pp="next" aria-describedby="pp-syntax">
      <h4>② 用归纳预测一个新例，再展开验证</h4>
      <p>自选底数（−9 到 9 之间，整数、小数或分数；整数部分、分子、分母各至多三位），指数选 1 至 6。建议换一个负底数并换一次奇偶，再试 0 或 ±1。先按归纳预测，再写出全部相同因数验算。</p>
      <label>我选的底数<input name="base" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>我选的指数<input name="exponent" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>展开的因数个数<input name="count" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>幂的符号<select name="sign"><option value="">请选择</option><option value="positive">正</option><option value="negative">负</option><option value="zero">零</option></select></label><label>我预测的幂值<input name="prediction" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>展开连乘算得的值<input name="verified" type="text" inputmode="text" maxlength="90" autocomplete="off"></label>
      <label>完整重复乘法<input name="expansion" type="text" maxlength="140" autocomplete="off"></label>
      <p class="small">因数间用 × 或 *，负数与分数因数加括号；指数是 1 时只写该因数。</p>
      <button class="btn" type="submit">核对这个新例</button><button class="btn ghost" type="reset">清空新例</button>
      <p class="result" data-feedback aria-live="polite">自选底数与正整数指数后，先预测。</p>
    </form>
    <form data-pp="tens" aria-describedby="pp-syntax">
      <h4>③ 10 的正整数次幂：零与位数</h4>
      <p>先写完整整数，再数有几个 0、共有几位。这里的整数位数包含开头的 1。</p>
      <div class="pp-grid"><fieldset><legend>10¹</legend><label>完整十进制整数<input name="t1-value" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>零的个数<input name="t1-zeros" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>整数位数<input name="t1-digits" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label></fieldset>
<fieldset><legend>10²</legend><label>完整十进制整数<input name="t2-value" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>零的个数<input name="t2-zeros" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>整数位数<input name="t2-digits" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label></fieldset>
<fieldset><legend>10³</legend><label>完整十进制整数<input name="t3-value" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>零的个数<input name="t3-zeros" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>整数位数<input name="t3-digits" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label></fieldset>
<fieldset><legend>10⁵</legend><label>完整十进制整数<input name="t5-value" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>零的个数<input name="t5-zeros" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>整数位数<input name="t5-digits" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label></fieldset></div>
      <fieldset><legend>用 k 表示正整数指数，写出我的归纳</legend>
        <label>10ᵏ 的零的个数<input name="zero-rule" type="text" maxlength="10" autocomplete="off"></label>
        <label>10ᵏ 的整数位数<input name="digit-rule" type="text" maxlength="10" autocomplete="off"></label>
        <p class="small">仅填写 k、k+1、k-1 或 2k 中的一种写法；使用半角符号，不在数式内加空格。</p>
      </fieldset>
      <fieldset><legend>下一例：先预测 10⁶，再用重复乘法验证</legend><label>我预测的完整整数<input name="next-value" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我预测的零的个数<input name="next-zeros" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>我预测的整数位数<input name="next-digits" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label><label>完整重复乘法<input name="next-expansion" type="text" inputmode="text" maxlength="90" autocomplete="off"></label><label>连乘验证得到的整数<input name="next-verified" type="text" inputmode="numeric" maxlength="90" autocomplete="off"></label></fieldset>
      <label>我的解释：指数每增加 1，为什么零和位数会这样变？<textarea name="reflection" rows="3" maxlength="900"></textarea></label>
      <button class="btn" type="submit">核对数值与归纳式，查看自核准则</button><button class="btn ghost" type="reset">清空 10 的幂记录</button>
      <p class="result" data-feedback aria-live="polite">先记录几组，再归纳并验证下一例。</p>
    </form>
    <p class="small">有限个例子支持猜想，不能作为一般证明。核对后请用重复乘法与乘法符号法则解释理由；页面不判断自由文字是否正确，也不认证纸笔或同伴活动已经发生。</p>
  `;
  function fail(message) { throw new Error(message); }
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) { var t = a % b; a = b; b = t; } return a || 1n; }
  function rational(n, d) { var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function parse(raw) {
    var s = raw.trim().replace(/−/g, '-');
    if (!/^[+-]?\d{1,40}(?:\.\d{1,3}|\/\d{1,40})?$/.test(s)) fail('数值格式不合约定，请检查空白、符号与整数/小数/分数的写法。');
    var parts;
    if (s.includes('/')) { parts = s.split('/'); if (BigInt(parts[1]) === 0n) fail('分母不能为 0。'); return rational(BigInt(parts[0]), BigInt(parts[1])); }
    if (s.includes('.')) { parts = s.split('.'); return rational(BigInt(parts[0] + parts[1]), 10n ** BigInt(parts[1].length)); }
    return rational(BigInt(s), 1n);
  }
  function same(a, b) { return a.n * b.d === b.n * a.d; }
  function power(a, n) { return rational(a.n ** BigInt(n), a.d ** BigInt(n)); }
  function field(form, name) { return form.elements.namedItem(name); }
  function read(form, name) { return field(form, name).value; }
  function numberMatches(form, name, expected, label) {
    if (!same(parse(read(form, name)), expected)) fail(label + '还不一致，请按重复乘法重算。');
  }
  function integer(form, name, expected, label) {
    var s = read(form, name).trim();
    if (!/^\d{1,3}$/.test(s) || Number(s) !== expected) fail(label + '还不一致，请重新数一数。');
  }
  function signMatches(form, name, a, label) {
    var sign = a.n === 0n ? 'zero' : a.n > 0n ? 'positive' : 'negative';
    if (read(form, name) !== sign) fail(label + '的符号还需检查：先数负因数，0 另看。');
  }
  function expansion(form, name, base, n) {
    var s = read(form, name).trim();
    if (!s || s.length > 140) fail('请写完整的重复乘法。');
    var tokens = s.split(/[×*]/);
    if (tokens.length !== n) fail('重复乘法的因数个数与指数不一致。');
    tokens.forEach(function (token) {
      var t = token.trim(), wrapped = t.startsWith('(') && t.endsWith(')');
      if (wrapped) t = t.slice(1, -1);
      if ((base.n < 0n || t.includes('/')) && !wrapped) fail('负数和分数因数请整体加括号。');
      if (!same(parse(t), base)) fail('重复乘法中的每个因数都要等于底数。');
    });
  }
  var records = [ ['p1','2',1], ['p3','2',3], ['n1','-3',1], ['n2','-3',2], ['n3','-3',3], ['z','0',4], ['one','1',5], ['minusone','-1',6], ['fraction','-1/2',3] ];
  function checkPowers(form) {
    records.forEach(function (row) {
      var id = row[0], a = power(parse(row[1]), row[2]);
      integer(form, id + '-count', row[2], row[1] + ' 的 ' + row[2] + ' 次幂的因数个数');
      numberMatches(form, id + '-value', a, row[1] + ' 的 ' + row[2] + ' 次幂值');
      signMatches(form, id + '-sign', a, row[1] + ' 的 ' + row[2] + ' 次幂');
    });
    expansion(form, 'expansion', parse('-3'), 3);
    numberMatches(form, 'bracket', parse('9'), '括号负底数的平方');
    numberMatches(form, 'prefix', parse('-9'), '平方后取相反数');
    return '数值、符号、因数个数与展开已核对。自由归纳未自动判定。请自核：是否说明正底数的幂为正；负底数由负因数个数的奇偶定符号；0 的正整数次幂为 0；1 的幂为 1，−1 的幂随奇偶交替；指数 1 时仍是底数本身？括号中的负号属于底数，前置负号在乘方之后处理。请从乘法符号法则解释，不把这张有限表当一般证明。';
  }
  function checkNext(form) {
    var baseText = read(form, 'base').trim().replace(/−/g, '-');
    if (!/^[+-]?\d{1,3}(?:\.\d{1,3}|\/\d{1,3})?$/.test(baseText)) fail('自选底数的整数、分子与分母各限三位，小数部分至多三位。');
    var a = parse(baseText), s = read(form, 'exponent').trim();
    if (a.n < -9n * a.d || a.n > 9n * a.d) fail('自选底数限 −9 到 9。');
    if (!/^[1-6]$/.test(s)) fail('这里只选 1 至 6 的正整数指数。');
    var n = Number(s), result = power(a, n);
    integer(form, 'count', n, '展开的因数个数');
    signMatches(form, 'sign', result, '新例');
    numberMatches(form, 'prediction', result, '预测值');
    expansion(form, 'expansion', a, n);
    numberMatches(form, 'verified', result, '连乘验算值');
    return '这个新例的预测、展开、因数个数与验算值一致。再换底数或奇偶试一次；例子支持归纳，不能代替一般说明。';
  }
  function decimalInteger(form, name, expected, label) {
    var s = read(form, name).trim();
    if (!/^(?:0|[1-9]\d{0,9})$/.test(s) || BigInt(s) !== expected) fail(label + '请写完整的十进制整数，再检查每一位。');
  }
  function checkTens(form) {
    [1,2,3,5].forEach(function (k) {
      decimalInteger(form, 't' + k + '-value', 10n ** BigInt(k), '10 的 ' + k + ' 次幂');
      integer(form, 't' + k + '-zeros', k, '本行零的个数');
      integer(form, 't' + k + '-digits', k + 1, '本行整数位数');
    });
    if (read(form, 'zero-rule').trim() !== 'k' || read(form, 'digit-rule').trim() !== 'k+1') fail('归纳式还需检查：对照零的个数、开头的 1 与总位数的关系。');
    decimalInteger(form, 'next-value', 1000000n, '下一例预测');
    integer(form, 'next-zeros', 6, '下一例零的个数');
    integer(form, 'next-digits', 7, '下一例整数位数');
    expansion(form, 'next-expansion', parse('10'), 6);
    decimalInteger(form, 'next-verified', 1000000n, '下一例验算');
    return '数值记录、归纳式和下一例已核对：k 为正整数时，10ᵏ 有 k 个 0、k+1 位。自由解释未自动判定。自核准则：是否说清从一个 10 起，每多乘一个 10 就在十进制整数末尾添一个 0，连同开头的 1 数总位数？有限表只提供观察，不能用几行记录代替这个一般理由。';
  }
  var checks = { powers: checkPowers, next: checkNext, tens: checkTens };
  root.querySelectorAll('form[data-pp]').forEach(function (form) {
    var output = form.querySelector('[data-feedback]');
    function clear() { output.textContent = '已修改，请重新核对；自由文字只按准则自核。'; }
    form.addEventListener('input', clear);
    form.addEventListener('change', clear);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      try { output.textContent = checks[form.dataset.pp](form); }
      catch (error) { output.textContent = '暂未核对通过：' + error.message; }
    });
    form.addEventListener('reset', function () {
      output.textContent = '已清空，请重新填写；尚未核对。';
      form.querySelector('input').focus();
    });
  });
})();
