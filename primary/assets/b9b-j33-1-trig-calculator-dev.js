/* This workspace belongs only to j33-1; no learning-state or storage writes. */
(function () {
  'use strict';
  if (!document.body || document.body.dataset.sec !== 'j33-1') return;
  var root = document.getElementById('j33-calculator');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  function byId(name) { return root.querySelector('#j33-calc-' + name); }
  var form = byId('form'), fn = byId('function'), direction = byId('direction');
  var known = byId('known'), estimate = byId('estimate');
  var result = byId('result'), explain = byId('explain');
  var minimum = 0.000001;
  function clear() {
    result.textContent = '';
    explain.hidden = true;
    explain.open = false;
    known.removeAttribute('aria-invalid');
    estimate.removeAttribute('aria-invalid');
  }
  function inverse() { return direction.value === 'inverse'; }
  function configure() {
    clear();
    byId('known-label').textContent = inverse() ? '2. 输入 ' + fn.value + ' θ 的值（无单位）' : '2. 输入锐角 θ（度）';
    byId('estimate-label').textContent = inverse() ? '3. 先填你的角度估计（度）' : '3. 先填你的比值估计（无单位）';
    byId('range').textContent = !inverse() ? '本工作区：0.000001 ≤ θ ≤ 89.999999（度）。' :
      fn.value === 'tan' ? '本工作区：0.000001 ≤ tan θ ≤ 1000000。' : '本工作区：0.000001 ≤ ' + fn.value + ' θ ≤ 0.999999。';
  }
  function number(text) {
    var token = text.trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) return null;
    var value = Number(token);
    return Number.isFinite(value) ? value : null;
  }
  function format(value) { return Number(value.toPrecision(8)).toString(); }
  function fail(field, text) {
    field.setAttribute('aria-invalid', 'true');
    result.textContent = text;
    field.focus();
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clear();
    var x = number(known.value), g = number(estimate.value);
    if (x === null) { fail(known, '请填一个完整、有限的十进制数，不带单位、算式或其它文字。'); return; }
    var max = !inverse() ? 89.999999 : fn.value === 'tan' ? 1000000 : 0.999999;
    if (x < minimum || x > max) {
      fail(known, '未计算：输入不在上方明示的本工作区范围内。数学范围另见说明；请自行修改输入，不会自动夹值。'); return;
    }
    if (g === null || g < 0 || (inverse() ? g > 90 : fn.value !== 'tan' && g > 1)) {
      fail(estimate, inverse() ? '先填一个 0～90 的角度估计（单位为度），再核验。' : '先填非负的比值估计；sin、cos 的估计不超过 1，再核验。'); return;
    }
    // Preserve the accepted token in labels; only function readouts are rounded.
    var inputLabel = known.value.trim();
    var value, display;
    var rad = Math.PI / 180;
    if (inverse()) {
      value = (fn.value === 'sin' ? Math.asin(x) : fn.value === 'cos' ? Math.acos(x) : Math.atan(x)) / rad;
      display = fn.value + ' θ = ' + inputLabel + ' 时，θ ≈ ' + format(value) + '°';
    } else {
      // Use the small complementary angle near 90°, especially for tan.
      var small = (x > 45 ? 90 - x : x) * rad;
      if (fn.value === 'tan') value = x > 45 ? Math.cos(small) / Math.sin(small) : Math.tan(small);
      else value = (fn.value === 'sin') === (x > 45) ? Math.cos(small) : Math.sin(small);
      // 1-cos(t)=2sin²(t/2), so even a value rounded to 1 keeps its gap.
      var nearOne = (fn.value === 'sin' && x > 45) || (fn.value === 'cos' && x <= 45);
      display = fn.value + ' ' + inputLabel + '° ≈ ' +
        (nearOne && value > 0.999999 ? '1 − ' + format(2 * Math.pow(Math.sin(small / 2), 2)) : format(value)) + '（比值，无单位）';
    }
    result.textContent = '你的估计：' + format(g) + (inverse() ? '°' : '（比值）') + '。计算读数：' + display +
      '。请比较估计与读数，再展开检查方法。读数和差值均为近似值。';
    explain.hidden = false;
  });
  [known, estimate].forEach(function (input) { input.addEventListener('input', clear); });
  [fn, direction].forEach(function (select) {
    select.addEventListener('change', function () { known.value = ''; estimate.value = ''; configure(); });
  });
  form.addEventListener('reset', function () {
    // Native reset applies select defaults after the reset event.
    setTimeout(configure, 0);
  });
  configure();
})();
