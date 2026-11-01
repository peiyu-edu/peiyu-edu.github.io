import { floorState, legendre, parsePrediction } from './math.mjs';

const $ = (id) => document.getElementById(id);
let floor = null;
let count = null;
const ns = 'http://www.w3.org/2000/svg';
function svg(tag, attrs, text) {
  const el = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  if (text !== undefined) el.textContent = text;
  return el;
}
function drawStairs(reveal = false) {
  const drawing = $('stairs-drawing');
  drawing.replaceChildren();
  const X = (x) => 44 + (x + 6) * 36;
  const Y = (y) => 356 - (y + 6) * 26;
  drawing.append(svg('line', { x1:X(-6), y1:Y(0), x2:X(6), y2:Y(0), class:'axis' }),
    svg('line', { x1:X(0), y1:Y(-6), x2:X(0), y2:Y(6), class:'axis' }));
  for (let k = -6; k <= 6; k += 1) {
    drawing.append(svg('text', { x:X(k), y:382, 'text-anchor':'middle' }, k),
      svg('text', { x:26, y:Y(k) + 5, 'text-anchor':'end' }, k));
    if (k < 6) drawing.append(
      svg('line', { x1:X(k), y1:Y(k), x2:X(k + 1), y2:Y(k), class:'step' }),
      svg('circle', { cx:X(k + 1), cy:Y(k), r:4, class:'open' }));
    drawing.append(svg('circle', { cx:X(k), cy:Y(k), r:4, class:'closed' }));
  }
  drawing.append(svg('text', { x:491, y:Y(0) - 8 }, 'x'),
    svg('text', { x:X(0) + 10, y:22 }, 'y'));
  if (floor) {
    drawing.append(svg('line', { x1:X(floor.x), y1:32, x2:X(floor.x), y2:361, class:'current' }));
    if (reveal) drawing.append(svg('circle', { cx:X(floor.x), cy:Y(floor.floor), r:6, class:'marker' }));
  }
}
function updateFloor() {
  $('floor-result').hidden = true;
  $('floor-result').replaceChildren();
  $('floor-guess').value = '';
  $('floor-feedback').textContent = '';
  try {
    if ($('x').value === '') throw new Error('请填写横坐标 x。');
    floor = floorState(Number($('x').value));
    $('floor-error').textContent = '';
    $('x-slide').value = String(floor.x);
  } catch (error) {
    floor = null;
    $('floor-error').textContent = error.message;
  }
  drawStairs();
}
function updateCount() {
  $('legendre-result').hidden = true;
  $('legendre-result').replaceChildren();
  $('count-placeholder').hidden = false;
  $('legendre-guess').value = '';
  $('legendre-feedback').textContent = '';
  try {
    count = legendre($('n').value, Number($('p').value));
    $('legendre-error').textContent = '';
    const small = count.n <= 100n;
    $('n-slide').disabled = !small;
    if (small) $('n-slide').value = String(count.n);
    $('range-note').textContent = small ? '可用滑条逐数观察。' : '当前 n 超过 100；小范围滑条已停用，修改文本可回到小范围。';
  } catch (error) {
    count = null;
    $('n-slide').disabled = false;
    $('legendre-error').textContent = error.message;
    $('range-note').textContent = '请修正参数；也可移动滑条恢复一个合法的 n。';
  }
}
function paragraph(parent, text) {
  const el = document.createElement('p');
  el.textContent = text;
  parent.append(el);
}
function revealCount() {
  const result = $('legendre-result');
  result.replaceChildren();
  paragraph(result, `v_${count.p}(${count.n}!) = ${count.total}`);
  paragraph(result, count.n <= 100n ? '完整整点：圆圈中的数是本层 pʲ 的正倍数。' : '大整数：显示精确计数与相对条形，不画截断点阵。');
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = '按 p 的幂逐层计数（最后一行为首个零项）';
  table.append(caption);
  const head = document.createElement('thead');
  const hr = document.createElement('tr');
  for (const title of ['层 j', 'pʲ', '⌊n / pʲ⌋']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = title;
    hr.append(th);
  }
  head.append(hr);
  table.append(head);
  const body = document.createElement('tbody');
  count.rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    for (const value of [index + 1, row.power, row.count]) {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.append(td);
    }
    const cell = tr.lastElementChild;
    if (row.count > 0n) {
      const bar = document.createElement('span');
      bar.className = 'bar';
      bar.setAttribute('aria-hidden', 'true');
      const first = count.rows[0].count;
      bar.style.width = `${Number(row.count * 10000n / first) / 100}%`;
      cell.append(bar);
    }
    body.append(tr);
    if (count.n <= 100n && row.count > 0n) {
      const dotsRow = document.createElement('tr');
      const dotsCell = document.createElement('td');
      dotsCell.colSpan = 3;
      const dots = document.createElement('div');
      dots.className = 'dots';
      dots.setAttribute('aria-label', `第 ${index + 1} 层的完整倍数列`);
      for (let m = row.power; m <= count.n; m += row.power) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = String(m);
        dots.append(dot);
      }
      dotsCell.append(dots);
      dotsRow.append(dotsCell);
      body.append(dotsRow);
    }
  });
  table.append(body);
  result.append(table);
  result.hidden = false;
  $('count-placeholder').hidden = true;
}
$('x').addEventListener('input', updateFloor);
$('x-slide').addEventListener('input', () => { $('x').value = $('x-slide').value; updateFloor(); });
for (const button of document.querySelectorAll('[data-x]')) button.addEventListener('click', () => {
  $('x').value = button.dataset.x;
  updateFloor();
});
for (const id of ['n', 'p']) $(id).addEventListener('input', updateCount);
$('n-slide').addEventListener('input', () => { $('n').value = $('n-slide').value; updateCount(); });
for (const button of document.querySelectorAll('[data-case]')) button.addEventListener('click', () => {
  const cases = { empty:['0', '2'], above:['7', '11'], large:['1000000000000000000000000000000', '2'] };
  [$('n').value, $('p').value] = cases[button.dataset.case];
  updateCount();
});
$('floor-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!floor) { $('floor-feedback').textContent = '请先修正 x。'; return; }
  const guess = parsePrediction($('floor-guess').value);
  if (guess === null) { $('floor-feedback').textContent = '请先填写整数预测。'; return; }
  const correct = guess === BigInt(floor.floor);
  $('floor-feedback').textContent = correct ? '预测正确。对照边界再试一个负数。' : '再看定义：寻找不超过 x 的最大整数，而不是朝 0 截断。';
  const roundedFraction = Number(floor.fraction.toPrecision(15));
  const fractionText = roundedFraction >= 1 ? '接近 1，但严格小于 1' : `约为 ${roundedFraction}`;
  $('floor-result').textContent = `当前 x = ${floor.x}；⌊x⌋ = ${floor.floor}；截断值 = ${floor.trunc}；小数部分${fractionText}。${floor.floor} ≤ ${floor.x} < ${floor.floor + 1}。`;
  $('floor-result').hidden = false;
  drawStairs(true);
});
$('legendre-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!count) { $('legendre-feedback').textContent = '请先修正 n 和素数 p。'; return; }
  const guess = parsePrediction($('legendre-guess').value);
  if (guess === null) { $('legendre-feedback').textContent = '请先填写整数预测。'; return; }
  $('legendre-feedback').textContent = guess === count.total ? '预测正确。每个 p 的倍数先贡献一层，更高次幂再贡献额外层。' : '预测还不一致。展开各层，留意高次幂的倍数会重复贡献。';
  revealCount();
});
$('theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
});
window.addEventListener('pageshow', () => { updateFloor(); updateCount(); });
updateFloor();
updateCount();
