/* Only j11-1. No persistence, shared checker, or learning-record hooks. */
(function () {
  'use strict';
  const root = document.getElementById('j11-self');
  if (!root || document.body.dataset.sec !== 'j11-1' || root.dataset.j11SelfReady) return;
  root.dataset.j11SelfReady = 'true';
  const $ = id => root.querySelector('#j11-' + id);
  const say = (id, text) => { $(id + '-feedback').textContent = text; };
  const clear = id => say(id, '');

  // Closed syntax, exact rationals: no NFKC, eval, whitespace deletion, or sampling.
  function number(raw) {
    const s = raw.trim();
    if (s.length > 48 || !/^[+\-−]?(?:[0-9]+(?:\.[0-9]+)?|[0-9]+\/[0-9]+)$/.test(s)) return null;
    const negative = s[0] === '-' || s[0] === '−';
    const t = /^[+\-−]/.test(s) ? s.slice(1) : s;
    let n, d;
    if (t.includes('/')) {
      const p = t.split('/'); n = BigInt(p[0]); d = BigInt(p[1]);
    } else {
      const p = t.split('.'); d = 10n ** BigInt(p[1] ? p[1].length : 0);
      n = BigInt(p[0] + (p[1] || ''));
    }
    if (d === 0n) return null;
    return { n: negative ? -n : n, d };
  }
  const equal = (a, b) => a && b && a.n * b.d === b.n * a.d;
  const integer = n => ({ n: BigInt(n), d: 1n });
  const zero = integer(0), three = integer(3), distance = integer(96), capacity = integer(18);
  // 18 / (5/2) = 36/5 minutes, without rounded decimal comparison.
  const fullTime = { n: 36n, d: 5n };
  const flip = op => ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=' })[op];
  function relation(raw, count) {
    if (raw.length > 180) return null;
    const p = raw.trim().split(/(<=|>=|≤|≥|<|>)/).map(x => x.trim());
    if (p.length !== count * 2 + 1 || p.some(x => !x)) return null;
    for (let i = 1; i < p.length; i += 2) p[i] = p[i].replace('≤', '<=').replace('≥', '>=');
    return p;
  }
  const tripNumber = raw => /^[+\-−]?[0-9]+(?:\.[0-9]+)?$/.test(raw.trim()) ? number(raw) : null;
  function bound(raw, variable, op, endpoint, parse = number) {
    const p = relation(raw, 1);
    if (!p) return false;
    return (p[0] === variable && p[1] === op && equal(parse(p[2]), endpoint)) ||
      (p[2] === variable && flip(p[1]) === op && equal(parse(p[0]), endpoint));
  }
  function chain(raw, variable, high) {
    const p = relation(raw, 2);
    if (!p || p[2] !== variable) return false;
    return (p[1] === '<=' && p[3] === '<=' && equal(number(p[0]), zero) && equal(number(p[4]), high)) ||
      (p[1] === '>=' && p[3] === '>=' && equal(number(p[0]), high) && equal(number(p[4]), zero));
  }
  function trip(raw, kind) {
    const p = relation(raw, 1);
    if (!p) return false;
    function coefficient(s) {
      const m = kind === 'distance' ? s.match(/^(.+?)\s*\*?\s*v$/) : s.match(/^(.+?)\s*\/\s*v$/);
      if (m) return tripNumber(m[1]);
      const reverse = kind === 'distance' && s.match(/^v\s*\*\s*(.+)$/);
      return reverse ? tripNumber(reverse[1]) : null;
    }
    const left = coefficient(p[0]), right = coefficient(p[2]);
    const k = kind === 'distance' ? three : distance;
    const n = kind === 'distance' ? distance : three;
    const op = kind === 'distance' ? '>=' : '<=';
    return (equal(left, k) && p[1] === op && equal(tripNumber(p[2]), n)) ||
      (equal(right, k) && flip(p[1]) === op && equal(tripNumber(p[0]), n));
  }

  $('check-trip').addEventListener('click', () => {
    if (!bound($('speed-domain').value, 'v', '>', zero, tripNumber)) {
      say('trip', '先核速度前提：路程为正，所用时间为正，速度也须为正；零速度不能作时间式的除数。请按约定写出这个严格不等关系。'); return;
    }
    if (!trip($('distance').value, 'distance')) {
      say('trip', '请核路程式：用规定时间乘速度，与要完成的路程比较；准时到达也允许。仅核对输入约定中的原始列式，其他写法请依准则自核。'); return;
    }
    if (!trip($('time').value, 'time')) {
      say('trip', '请核时间式：所需时间用路程除以正速度，与规定时间比较，并包含准时到达。不要把字母分母改成数字，也不必解它。'); return;
    }
    say('trip', '速度前提和两种原始列式核对通过。一个比较路程（km），另一个比较时间（h）；两式描述同一要求。这里只列含字母分母的不等式，不继续求解。');
  });
  $('check-water').addEventListener('click', () => {
    if (!bound($('water-algebra').value, 't', '<=', fullTime)) {
      say('water', '先单看不溢出：把水量上界代入 V＝2.5t，再除以正数 2.5，方向不变。这里只填这一条条件给出的代数范围，使用精确端点。'); return;
    }
    if (!chain($('water-volume').value, 'V', capacity)) {
      say('water', '水量的完整范围还要含“非负”。空容器的开始状态、恰好装满的停止状态都允许；请把下界和上界同时连写。'); return;
    }
    if (!chain($('water-time').value, 't', fullTime)) {
      say('water', '时间的完整范围还要含“从开始算起”的限制。把容量除以正注水速度求精确停止时间，并连写两端；不要把实际可行范围只写成一个上界。'); return;
    }
    say('water', '三项范围核对通过。不溢出单独给出 t≤7.2；实际还须 t≥0，所以 0≤t≤7.2 min，水量为 0≤V≤18 L。负时间虽可满足单独的代数上界，却不属于本题的实际过程。开始与装满两端都包含，期间连续取值。');
  });
  for (const id of ['speed-domain', 'distance', 'time']) $(id).addEventListener('input', () => clear('trip'));
  for (const id of ['water-algebra', 'water-volume', 'water-time']) $(id).addEventListener('input', () => clear('water'));
  $('reset-trip').addEventListener('click', () => {
    for (const id of ['speed-domain', 'distance', 'time']) $(id).value = '';
    clear('trip');
  });
  $('reset-water').addEventListener('click', () => {
    for (const id of ['water-algebra', 'water-volume', 'water-time']) $(id).value = '';
    clear('water');
  });
  $('self-review').addEventListener('click', () => {
    say('review', '请逐条自核：①图是否包含方向上全部实数（包括非整数），端点是否按原式判断；②行程式是否用同一速度，单位分别为 km 和 h，正速度前提是否写清；③注水是否同时顾及非负、容量和停止时刻。此处只提供准则，不认证你的解释。');
  });
  $('reflection').addEventListener('input', () => clear('review'));
  $('reset-reflection').addEventListener('click', () => { $('reflection').value = ''; clear('review'); });

  const svg = $('drawing'), ns = 'http://www.w3.org/2000/svg';
  const tasks = [
    { end: { n: -3n, d: 2n }, style: 'closed', ray: 'left' },
    { end: integer(2), style: 'open', ray: 'right' },
    { end: zero, style: 'closed', ray: 'right' },
    { end: integer(-2), style: 'open', ray: 'left' }
  ];
  const drawing = { origin: null, unit: null, end: null };
  function node(tag, attrs, text, parent = svg) {
    const e = document.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    parent.appendChild(e); return e;
  }
  const X = i => 40 + 40 * i;
  function draw() {
    svg.replaceChildren();
    node('line', { x1: 20, y1: 135, x2: 540, y2: 135, stroke: 'var(--fg)', 'stroke-width': 2 });
    node('path', { d: 'M540 135 l-10 -6 v12 z', fill: 'var(--fg)' });
    for (let i = 0; i < 13; i++) {
      const g = node('g', { role: 'button', tabindex: '0', 'aria-label': '在刻度 ' + (i + 1) + ' 落笔' });
      node('rect', { x: X(i) - 19, y: 110, width: 38, height: 55, fill: 'transparent' }, undefined, g);
      node('line', { x1: X(i), y1: 130, x2: X(i), y2: 140, stroke: 'var(--fg)', 'stroke-width': 2 }, undefined, g);
      node('text', { x: X(i), y: 190, fill: 'var(--muted)', 'text-anchor': 'middle', 'font-size': 17 }, String(i + 1), g);
      g.addEventListener('click', () => place(i));
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(i); svg.querySelectorAll('[role="button"]')[i].focus(); }
      });
    }
    for (const [key, label] of [['origin', '0'], ['unit', '1']]) {
      if (drawing[key] !== null) node('text', { x: X(drawing[key]), y: key === 'origin' ? 162 : 110, fill: 'var(--fg)', 'font-size': 21, 'font-weight': 700, 'text-anchor': 'middle' }, label);
    }
    if (drawing.end !== null) {
      const x = X(drawing.end), direction = $('ray').value, style = $('end-style').value;
      node('line', { x1: x, y1: 80, x2: x, y2: 130, stroke: 'var(--a)', 'stroke-dasharray': '4 4' });
      if (direction) {
        const tip = direction === 'left' ? 20 : 540, sign = direction === 'left' ? -1 : 1;
        node('line', { x1: x, y1: 80, x2: tip, y2: 80, stroke: 'var(--a)', 'stroke-width': 4 });
        node('path', { d: `M${tip} 80 l${-sign * 12} -7 v14 z`, fill: 'var(--a)' });
      }
      if (style) node('circle', { cx: x, cy: 80, r: 8, stroke: 'var(--a)', 'stroke-width': 3, fill: style === 'closed' ? 'var(--a)' : 'var(--card)' });
      else node('text', { x, y: 85, fill: 'var(--fg)', 'text-anchor': 'middle', 'font-size': 20 }, '×');
    }
    const n = key => drawing[key] === null ? '未落笔' : '刻度 ' + (drawing[key] + 1);
    $('drawing-note').textContent = `你的选择：原点 ${n('origin')}；单位点 ${n('unit')}；端点 ${n('end')}。下排编号仅用于定位刻度，不是数轴上的数值。`;
  }
  function place(i) {
    clear('draw');
    const tool = $('tool').value;
    if (!tool) { say('draw', '请先选择落笔对象。'); return; }
    drawing[tool] = i; draw();
  }
  $('place').addEventListener('click', () => {
    if ($('tick').value === '') { say('draw', '请先选刻度编号，或直接点图上的刻度。'); return; }
    place(Number($('tick').value));
  });
  $('check-draw').addEventListener('click', () => {
    const { origin, unit, end } = drawing;
    if ([origin, unit, end].some(v => v === null) || !$('end-style').value || !$('ray').value) {
      say('draw', '作品还未完成：请亲自标原点、单位点、端点，并选空实和射线方向。'); return;
    }
    if (unit <= origin) { say('draw', '正方向向右，表示数 1 的单位点须在原点右侧，且不能重合。请重新设置单位长度。'); return; }
    const task = tasks[Number($('draw-task').value)];
    if (!equal({ n: BigInt(end - origin), d: BigInt(unit - origin) }, task.end)) {
      say('draw', '按你设置的原点和单位长度数一数：目前端点的位置与任务不符。可以改端点，也可重新选原点和单位长度。'); return;
    }
    if ($('end-style').value !== task.style) { say('draw', '请把端点代回任务原式：端点本身能否包含？再检查空心还是实心。'); return; }
    if ($('ray').value !== task.ray) { say('draw', '端点位置与空实核对通过。再按大小关系检查：应该包含端点哪一侧的所有数？'); return; }
    say('draw', '作品结构核对通过：原点、单位长度、端点、空实和射线方向符合任务。射线覆盖这一侧的全部实数，包含刻度之间的非整数；这一结论来自整体表示规则，不是有限个试数。');
  });
  for (const id of ['end-style', 'ray']) $(id).addEventListener('change', () => { clear('draw'); draw(); });
  for (const id of ['tool', 'tick']) $(id).addEventListener('change', () => clear('draw'));
  function resetDrawing() {
    for (const key of Object.keys(drawing)) drawing[key] = null;
    for (const id of ['tool', 'tick', 'end-style', 'ray']) $(id).value = '';
    clear('draw'); draw();
  }
  $('draw-task').addEventListener('change', resetDrawing);
  $('reset-draw').addEventListener('click', resetDrawing);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
  draw();
})();
