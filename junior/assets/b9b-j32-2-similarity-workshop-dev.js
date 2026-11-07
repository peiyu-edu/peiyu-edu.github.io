/* Page-local finite-condition workshop. No persistence, completion credit or proof parser. */
(function () {
  'use strict';
  if (document.body.dataset.sec !== 'j32-2') return;
  var root = document.getElementById('b9b-similarity');
  if (!root) return;
  // 表单放在这里，课页才能守住 60 KB 上限；只此一页使用。
  root.innerHTML = `
<h2>自主工作单：先对应、再论证、后计算</h2>
<p>本单支持下列六种固定条件包，以及有限正数的同倍率三角形和阳光测高模型。机器只核对这些条件包的结构化答案和数值；理由、纸笔证明、真实测量均由你按准则自核，不评定任意证明。</p>
<p class="small">所有新待答项初始留空；先尝试，再点“展开核对说明”。编辑任一项会撤销旧核对结果。答案仅在本页内存中使用。</p>
<form id="sw-proof" class="card" novalidate>
<h3>1. 选对应点，组成判定链</h3>
<label>选择条件包 <select name="case"><option value="">请选择</option><option value="a">A 字平行截线</option><option value="x">X（8）字平行截线</option><option value="sas">两边与夹角</option><option value="sss">三边数据</option><option value="short">只有一角</option><option value="flat">共线退化</option></select></label>
<p data-facts>先选条件包；在纸上画图，标明已知条件。不要按图形外观猜对应。</p>
<fieldset><legend>标出可用于判定的关系（可多选；只选条件包能推出的）</legend>
<label><input type="checkbox" name="e1"> <span data-e1>第一条关系</span></label>
<label><input type="checkbox" name="e2"> <span data-e2>第二条关系</span></label>
<label><input type="checkbox" name="e3"> <span data-e3>第三条关系</span></label>
</fieldset>
<p data-order>先选择条件包，再配点。若条件不足或退化，留空对应点。</p>
<div class="sw-grid"><label>第1个顶点对应 <select name="v0"><option value="">请选择</option><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option></select></label><label>第2个顶点对应 <select name="v1"><option value="">请选择</option><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option></select></label><label>第3个顶点对应 <select name="v2"><option value="">请选择</option><option>A</option><option>B</option><option>C</option><option>D</option><option>E</option><option>F</option></select></label></div>
<label>所用判定 <select name="rule"><option value="">请选择</option><option>AA</option><option>SAS</option><option>SSS</option><option>条件不足</option><option>非三角形</option></select></label>
<label>你的理由链（写出条件如何支持所选判定；相似时写正确顺序的相似式）<textarea name="reason" rows="3"></textarea></label>
<p class="small">理由文字不自动判真。完成结构核对后，仍须逐条检查“已知→关系→判定→相似式”的依据。</p>
<button class="btn" type="submit">核对结构</button> <button class="btn ghost" type="button" data-explain disabled>展开核对说明</button> <button class="btn ghost" type="reset">清空重试</button>
<p role="status" data-result></p><div data-guide hidden></div>
</form>
<form id="sw-ratio" class="card" novalidate>
<h3>2. 自拟合法边长与倍率</h3>
<p>自己给 △ABC 的 AB、BC、CA 赋值（统一 cm）。把三条边均乘倍率 t，得到 △DEF，A↔D、B↔E、C↔F。填写 △ABC 对 △DEF 的相似比、DE 长、△DEF 周长和两三角形面积比（ABC 在前）。输入可用小数或分数；答案四舍五入到小数点后四位或填精确分数。</p>
<p class="small">边长范围 0.1–100 cm，倍率范围 0.1–10；给定值最多三位小数，须满足严格三角形不等式。本单不接受域外数值或退化三角形。</p>
<div class="sw-grid"><label>AB（cm）<input name="a" inputmode="decimal" autocomplete="off"></label><label>BC（cm）<input name="b" inputmode="decimal" autocomplete="off"></label><label>CA（cm）<input name="c" inputmode="decimal" autocomplete="off"></label><label>倍率 t<input name="t" inputmode="decimal" autocomplete="off"></label><label>ABC 对 DEF 的相似比<input name="k" inputmode="decimal" autocomplete="off"></label><label>DE（cm）<input name="edge" inputmode="decimal" autocomplete="off"></label><label>DEF 周长（cm）<input name="perimeter" inputmode="decimal" autocomplete="off"></label><label>面积 ABC / 面积 DEF<input name="area" inputmode="decimal" autocomplete="off"></label></div>
<label>先写对应边比例和长度/面积关系，再解释顺序 <textarea name="reason" rows="3"></textarea></label>
<button class="btn" type="submit">核对数值</button> <button class="btn ghost" type="button" data-explain disabled>展开核对说明</button> <button class="btn ghost" type="reset">清空重试</button>
<p role="status" data-result></p><div data-guide hidden></div>
</form>
<form id="sw-shadow" class="card" novalidate>
<h3>3. 自拟测高模型，写比例和单位</h3>
<p>给定标杆高 h、标杆影长 s、目标影长 L（都以 m 计，0.1–100，最多三位小数），求目标高 H。可以拟数据，也可安全地在平地观察影子；输入数字不代表你已完成实际测量。</p>
<label>本次条件 <select name="conditions"><option value="">请选择</option><option value="sun">同一时刻地点、平行阳光、水平地面、两物竖直</option><option value="time">两次测量不同时刻，未给光线方向关系</option><option value="lean">物体倾斜，未给倾角</option><option value="lamp">点光源照明，未给光源位置</option></select></label>
<div class="sw-grid"><label>标杆高 h（m）<input name="h" inputmode="decimal" autocomplete="off"></label><label>标杆影长 s（m）<input name="s" inputmode="decimal" autocomplete="off"></label><label>目标影长 L（m）<input name="l" inputmode="decimal" autocomplete="off"></label></div>
<label>模型或结论 <select name="model"><option value="">请选择</option><option value="right">H/L = h/s</option><option value="reverse">H/L = s/h</option><option value="mix">H/s = h/L</option><option value="unsupported">给定条件不足以使用这个模型</option></select></label>
<label>目标高 H（仅模型适用时填写；四位小数或精确分数）<input name="height" inputmode="decimal" autocomplete="off"></label>
<label>结果单位 <select name="unit"><option value="">请选择</option><option>m</option><option>cm</option><option>m²</option></select></label>
<label>画两三角形，标直角和光线夹角；写对应关系、所列比例及模型假设 <textarea name="reason" rows="3"></textarea></label>
<button class="btn" type="submit">核对模型与结果</button> <button class="btn ghost" type="button" data-explain disabled>展开核对说明</button> <button class="btn ghost" type="reset">清空重试</button>
<p role="status" data-result></p><div data-guide hidden></div>
</form>
<form id="sw-aa" class="card" novalidate>
<h3>4. 选学：AA 判定为什么成立？（文字准则自核）</h3>
<p>已知两个非退化三角形 △ABC、△DEF，∠A=∠D、∠B=∠E。尝试用过点作平行线、平行截线的相似结论及全等说明 △ABC∽△DEF。在纸上补图；本项不要求证明所有相似判定定理。</p>
<label>你的证明尝试 <textarea name="reason" rows="5"></textarea></label>
<button class="btn" type="submit">查看自核准则</button> <button class="btn ghost" type="reset">清空重试</button>
<p role="status" data-result></p><div data-guide hidden></div>
</form>
<noscript><p>交互核对需要 JavaScript。可先纸笔完成任务，再参考本页原讲解自核。</p></noscript>
`;
  var cases = {
    a: {
      facts: '△ABC：AB=10、AC=13、BC=14。D、E 分别在 AB、AC 内部，AD=4、AE=5.2，DE∥BC。考察 △ADE 与 △ABC。',
      order: '按 △ADE 的 A、D、E 顺序选 △ABC 的对应点，并在理由中写相似式。',
      evidence: ['DE∥BC，给出 ∠ADE=∠ABC（同位角）', '∠DAE=∠BAC（公共角）', 'AD/DB 等于 AD/AB'],
      vertices: 'ABC', rule: 'AA', mask: [true, true, false],
      guide: '平行线同位角与公共角给 AA：△ADE∽△ABC。AD/AB=AE/AC=DE/BC=0.4。AB=AD+DB，所以 AD/DB=4/6 不能替代 AD/AB。自核：两个角是否写清、配点是否来自角、分母是否整边。'
    },
    x: {
      facts: '△ABC：AB=10、AC=13、BC=14。D 在 BA 过 A 的延长线上，E 在 CA 过 A 的延长线上，AD=6、AE=7.8，DE∥BC。考察 △ADE 与 △ABC（X/8 字型）。',
      order: '按 △ADE 的 A、D、E 顺序选 △ABC 的对应点，并在理由中写相似式。',
      evidence: ['DE∥BC，给出 ∠ADE=∠ABC（内错角）', '∠DAE=∠BAC（对顶角）', 'DB=AB−AD'],
      vertices: 'ABC', rule: 'AA', mask: [true, true, false],
      guide: '内错角与对顶角给 AA：△ADE∽△ABC。AD/AB=AE/AC=DE/BC=0.6（长度比为正）。DB=DA+AB=16，所以 AD/DB=6/16 不是相似比。自核：A 两侧射线不要当成公共角，整边和部分边不要混用。'
    },
    sas: {
      facts: '两个非退化三角形：AB=4、AC=6、∠A=60°；DF=8、DE=12、∠D=60°。考察 △ABC 与另一个三角形。',
      order: '按 △ABC 的 A、B、C 顺序选 △DEF 的对应点，并在理由中写相似式。',
      evidence: ['AB/DF=AC/DE', '∠A=∠D，且它们是上述两边的夹角', '∠B=∠E 是已知条件'],
      vertices: 'DFE', rule: 'SAS', mask: [true, true, false],
      guide: 'AB/DF=4/8=AC/DE=6/12=1/2；相等角 A、D 是这两边的夹角，所以 SAS 得 △ABC∽△DFE。不能把非夹角换进来用 SSA。自核文字是否指出“夹角”，而不是只写一个角相等。'
    },
    sss: {
      facts: '两个非退化三角形：AB=4、BC=5、CA=6；DF=8、FE=10、ED=12。考察 △ABC 与另一个三角形。',
      order: '按 △ABC 的 A、B、C 顺序选 △DEF 的对应点，并在理由中写相似式。',
      evidence: ['AB/DF=BC/FE', 'BC/FE=CA/ED', '只要两组边的比相等就一定相似'],
      vertices: 'DFE', rule: 'SSS', mask: [true, true, false],
      guide: '4/8=5/10=6/12=1/2，三组对应边成比例，以 SSS 得 △ABC∽△DFE。两组边比没有夹角条件不足。自核：三边是否一一配对、相似式顺序是否一致。'
    },
    short: {
      facts: '两个非退化三角形只知道 ∠A=∠D=60°；其它边角关系未知。是否足以证明 △ABC 与 △DEF 相似？',
      order: '条件不足时不写确定的相似式，对应点留空。',
      evidence: ['∠A=∠D', '∠B=∠E 是已知条件', '三组对应边已知成比例'],
      vertices: '', rule: '条件不足', mask: [true, false, false],
      guide: '只给一对角相等，不够 AA，也没有 SAS 或 SSS 的边比。只能说条件不足，不能断言两个三角形一定不相似。相似的例子和不相似的例子都可能满足一角为 60°。'
    },
    flat: {
      facts: '第一组边长 AB=1、BC=2、CA=3；第二组 DE=2、EF=4、FD=6。有人说三组边比相同，所以是相似三角形。',
      order: '先检查是否存在三角形；若不存在，对应点留空。',
      evidence: ['1+2=3、2+4=6，两组均退化', '两组都满足严格三角形不等式', '比例相等足以忽略三角形存在性'],
      vertices: '', rule: '非三角形', mask: [true, false, false],
      guide: '1+2=3、2+4=6，三点共线，不能组成非退化三角形。SSS 相似判定的前提是两个三角形存在，不能对共线线段套用。'
    }
  };
  function field(form, name) { return form.elements.namedItem(name); }
  function value(form, name) { return field(form, name).value.trim(); }
  function number(text) {
    var part = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
    if (!new RegExp('^' + part + '(?:/' + part + ')?$').test(text)) return NaN;
    var xs = text.split('/').map(Number);
    if (xs.some(function (x) { return !Number.isFinite(x) || Math.abs(x) > 1e6; })) return NaN;
    if (xs.length === 2 && xs[1] === 0) return NaN;
    var n = xs.length === 2 ? xs[0] / xs[1] : xs[0];
    return Number.isFinite(n) ? n : NaN;
  }
  function num(form, name) { return number(value(form, name)); }
  function given(n, max) { return Number.isFinite(n) && n >= 0.1 && n <= max && Math.abs(n * 1000 - Math.round(n * 1000)) < 1e-8; }
  // Keep the original token/range admission. Judge accepted values from their
  // strings: decimal answers equal the exact four-place rounding; fractions
  // equal the unrounded rational target. Display/geometry still use Numbers.
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) { var r = a % b; a = b; b = r; } return a; }
  function rational(n, d) {
    if (d < 0n) { n = -n; d = -d; }
    var g = gcd(n, d); return [n / g, d / g];
  }
  function decimal(text) {
    var negative = text[0] === '-';
    var parts = text.replace(/^[+-]/, '').split('.');
    return rational((negative ? -1n : 1n) * BigInt((parts[0] || '0') + (parts[1] || '')), 10n ** BigInt((parts[1] || '').length));
  }
  function exact(text) {
    if (!Number.isFinite(number(text))) return null;
    var parts = text.split('/').map(decimal);
    return parts.length === 1 ? parts[0] : divide(parts[0], parts[1]);
  }
  function add(a, b) { return rational(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function multiply(a, b) { return rational(a[0] * b[0], a[1] * b[1]); }
  function divide(a, b) { return rational(a[0] * b[1], a[1] * b[0]); }
  function equal(a, b) { return a[0] * b[1] === b[0] * a[1]; }
  function roundedFour(a) {
    var negative = a[0] < 0n, scaled = (negative ? -a[0] : a[0]) * 10000n;
    var whole = scaled / a[1], remainder = scaled % a[1];
    if (2n * remainder >= a[1]) whole++;
    return rational((negative ? -1n : 1n) * whole, 10000n);
  }
  function answer(form, name, target) {
    var text = value(form, name), actual = exact(text);
    return actual !== null && equal(actual, text.includes('/') ? target : roundedFour(target));
  }
  function message(form, text) { form.querySelector('[data-result]').textContent = text; }
  function clear(form) {
    message(form, '');
    var guide = form.querySelector('[data-guide]'); guide.hidden = true; guide.textContent = '';
    var explain = form.querySelector('[data-explain]'); if (explain) explain.disabled = true;
  }
  function guide(form, text) {
    var box = form.querySelector('[data-guide]'); box.textContent = text; box.hidden = false;
  }
  function proofCase() {
    var form = root.querySelector('#sw-proof'), c = cases[value(form, 'case')];
    form.querySelector('[data-facts]').textContent = c ? c.facts : '先选条件包；在纸上画图，标明已知条件。不要按图形外观猜对应。';
    form.querySelector('[data-order]').textContent = c ? c.order : '先选择条件包，再配点。若条件不足或退化，留空对应点。';
    ['e1', 'e2', 'e3'].forEach(function (n, i) {
      form.querySelector('[data-' + n + ']').textContent = c ? c.evidence[i] : ['第一条关系', '第二条关系', '第三条关系'][i];
    });
  }
  root.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('input', function () { clear(form); });
    form.addEventListener('change', function (ev) {
      clear(form);
      if (form.id === 'sw-proof' && ev.target.name === 'case') {
        Array.from(form.elements).forEach(function (el) {
          if (el.name && el.name !== 'case') { if (el.type === 'checkbox') el.checked = false; else el.value = ''; }
        });
        proofCase();
      }
    });
    form.addEventListener('reset', function () { clear(form); if (form.id === 'sw-proof') setTimeout(proofCase, 0); });
    var explain = form.querySelector('[data-explain]');
    if (explain) explain.addEventListener('click', function () {
      if (form.id === 'sw-proof') guide(form, cases[value(form, 'case')].guide);
      if (form.id === 'sw-ratio') guide(form, '自核：DE/AB=EF/BC=FD/CA=t，所以本题所问 ABC 对 DEF 的相似比 k=1/t；DE=t·AB，DEF 周长=t(AB+BC+CA)；面积 ABC/面积 DEF=1/t²。面积比没有长度单位。逐条检查文字模型，不以数值吻合代替理由。');
      if (form.id === 'sw-shadow') guide(form, '适用时：两物竖直给直角，平行光与水平地面给另一对角，AA 得相似。高度对高度、影长对影长：H/L=h/s，H=hL/s，输出单位 m。其它条件未给足，不能由这一模型确定 H；并非断言实际一定不相似。真实活动是否完成需自己核实。');
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); clear(form);
      if (!value(form, 'reason')) { message(form, '请先写下自己的尝试；也可把纸笔思路简述在这里。文字只供准则自核。'); return; }
      if (form.id === 'sw-proof') {
        var c = cases[value(form, 'case')];
        if (!c) { message(form, '请先选条件包。'); return; }
        var vertices = [0, 1, 2].map(function (i) { return value(form, 'v' + i); });
        var ok = c.mask.every(function (b, i) { return field(form, 'e' + (i + 1)).checked === b; }) &&
          value(form, 'rule') === c.rule && vertices.join('') === c.vertices &&
          (c.vertices ? vertices.every(Boolean) : vertices.every(function (v) { return !v; }));
        message(form, ok ? '该条件包的关系选择、对应顺序与判定匹配。理由文字尚未判定，请展开逐条自核。' : '结构尚未匹配。检查关系是否有依据、是否存在三角形、对应点顺序和判定条件；可修改重试或展开说明。');
      }
      if (form.id === 'sw-ratio') {
        var a = num(form, 'a'), b = num(form, 'b'), d = num(form, 'c'), t = num(form, 't');
        if (![a, b, d].every(function (n) { return given(n, 100); }) || !given(t, 10) || Math.min(a + b - d, a + d - b, b + d - a) <= 1e-9) {
          message(form, '数据超出本单范围或不能组成非退化三角形。检查正数、范围、三位小数和严格三角形不等式。'); return;
        }
        var qa = exact(value(form, 'a')), qb = exact(value(form, 'b')), qc = exact(value(form, 'c')), qt = exact(value(form, 't'));
        var one = [1n, 1n];
        var checks = [['k', divide(one, qt)], ['edge', multiply(qt, qa)], ['perimeter', multiply(qt, add(add(qa, qb), qc))], ['area', divide(one, multiply(qt, qt))]];
        var good = checks.every(function (pair) { return answer(form, pair[0], pair[1]); });
        message(form, good ? '本次数值与约定方向一致（容许四位小数舍入）。比例和理由仍须按准则自核。' : '数值尚未全部匹配。检查比例方向、对应边、周长和面积平方关系；四位小数或精确分数均可重试。');
      }
      if (form.id === 'sw-shadow') {
        var h = num(form, 'h'), s = num(form, 's'), l = num(form, 'l'), condition = value(form, 'conditions');
        if (!condition || ![h, s, l].every(function (n) { return given(n, 100); })) {
          message(form, '请选择条件并检查三项长度：0.1–100 m、最多三位小数。'); return;
        }
        if (condition !== 'sun') {
          var limited = value(form, 'model') === 'unsupported' && !value(form, 'height') && !value(form, 'unit');
          message(form, limited ? '模型适用性选择匹配：所给条件不足以用本模型确定高度。文字理由仍须自核。' : '条件不支持本单的阳光比例模型。选择适用性结论，并将无法确定的高度与单位留空。');
        } else {
          var height = divide(multiply(exact(value(form, 'h')), exact(value(form, 'l'))), exact(value(form, 's')));
          var match = value(form, 'model') === 'right' && answer(form, 'height', height) && value(form, 'unit') === 'm';
          message(form, match ? '模型选择、数值和单位匹配（容许四位小数舍入）。画图、对应和假设的文字请逐条自核。' : '模型、结果或单位尚未匹配。检查对应关系、比例方向及量纲，再重试。');
        }
      }
      if (form.id === 'sw-aa') {
        message(form, '已打开自核准则；没有自动评定证明正确，也不表示纸笔活动已完成。');
        guide(form, '一种自核路线：①在射线 AB 上取 M 使 AM=DE（必要时用延长线）；过 M 作 MN∥BC，交射线 AC 于 N。②由平行截线已知结论，△AMN∽△ABC。③∠A=∠D，∠AMN=∠B=∠E，AM=DE，以 ASA 得 △AMN≌△DEF（对应 A↔D、M↔E、N↔F）。④由全等及相似的对应角边关系推出 △ABC∽△DEF。逐步检查取点存在、延长线情况、每个等角依据与对应顺序。不要把待证明的 AA 相似判定用作中间依据。此为选学文字自核，不是任意证明判定器。');
      }
      if (explain) explain.disabled = false;
    });
  });
})();
