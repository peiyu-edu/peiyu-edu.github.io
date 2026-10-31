/* j26-2 only. No learning-store writes: a sketch/prose is a self-check artifact. */
(function () {
  'use strict';
  const tasks = [
    { a: 1, h: 1, k: -1 },
    { a: -0.5, h: -1, k: 2 },
    { a: 0.5, h: 0, k: -2 },
    { a: 0, h: 0, k: 2 }
  ];
  // These coefficients generate the actual graphs, including exact zero cases.
  const graphs = [
    { a: 0.5, h: -1, k: -2 },
    { a: -0.5, h: -1, k: 2 },
    { a: 0.5, h: 1, k: -2 },
    { a: -0.5, h: 2, k: 2 },
    { a: 0.5, h: -2, k: -0.5 },
    { a: -0.5, h: 0, k: 0 }
  ];
  function value(t, x) { return t.a * (x - t.h) ** 2 + t.k; }
  function sign(n) { return n === 0 ? '0' : n > 0 ? '+' : '-'; }
  // A closed, full-token grammar, not an expression evaluator or Unicode normalizer.
  function number(raw) {
    const s = raw.trim();
    if (!s || s.length > 24) return null;
    const m = /^([+\-−]?)(?:(\d{1,12})(?:\.(\d{1,6}))?|\.(\d{1,6}))(?:\/([+\-−]?\d{1,12}))?$/.exec(s);
    if (!m || (m[5] && (m[3] || m[4]))) return null;
    const decimals = m[3] || m[4] || '';
    let n = BigInt((m[2] || '0') + decimals);
    let d = 10n ** BigInt(decimals.length);
    if (m[1] === '-' || m[1] === '−') n = -n;
    if (m[5]) {
      const den = BigInt(m[5].replace('−', '-'));
      if (den === 0n) return null;
      d *= den;
    }
    if (d < 0n) { n = -n; d = -d; }
    return { n, d };
  }
  // All task ordinates are halves, checked exactly, without a floating tolerance.
  function equals(n, expected) { return !!n && n.n * 2n === BigInt(expected * 2) * n.d; }
  function answers(t) {
    const b = -2 * t.a * t.h, c = value(t, 0);
    return [t.a, b, c, value(t, 1), value(t, -1), 2 * t.a + b].map(sign);
  }
  const api = { tasks, graphs, value, number, equals, answers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  function mount() {
    const root = document.getElementById('j26-workshop');
    if (!root || document.body.dataset.sec !== 'j26-2' || root.dataset.mounted) return;
    root.dataset.mounted = '1';
    const get = id => root.querySelector('#' + id);
    const grid = get('jw-grid'), graph = get('js-grid');
    const NS = 'http://www.w3.org/2000/svg';
    function node(tag, attrs, text) {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (text !== undefined) el.textContent = text;
      return el;
    }
    const px = x => 40 + (x + 4) * 40, py = y => 360 - (y + 3) * 40;
    function base(svg) {
      svg.replaceChildren();
      for (let i = 0; i <= 16; i++) {
        const s = i % 2 ? 0.4 : 0.8;
        svg.append(node('path', { d: `M${40 + i * 20} 40V360 M40 ${40 + i * 20}H360`, stroke: 'var(--muted)', opacity: s, 'stroke-width': 0.5, fill: 'none' }));
      }
      svg.append(node('path', { d: `M40 ${py(0)}H365 M${px(0)} 35V360`, stroke: 'var(--fg)', 'stroke-width': 1.5, fill: 'none' }));
      for (let x = -4; x <= 4; x += 2) svg.append(node('text', { x: px(x), y: 384, 'text-anchor': 'middle', 'font-size': 20, fill: 'var(--fg)' }, x));
      for (let y = -3; y <= 5; y += 2) svg.append(node('text', { x: 30, y: py(y) + 6, 'text-anchor': 'end', 'font-size': 20, fill: 'var(--fg)' }, y));
      svg.append(node('text', { x: 380, y: py(0) + 6, 'font-size': 20, fill: 'var(--fg)' }, 'x'));
      svg.append(node('text', { x: px(0) - 5, y: 24, 'font-size': 20, fill: 'var(--fg)' }, 'y'));
    }
    let t, marks, cursor, stroke, drawing = false;
    function invalidate() { get('jw-feedback').textContent = ''; }
    function render() {
      base(grid);
      marks.forEach((p, i) => {
        if (!p) return;
        grid.append(node('circle', { cx: px(p.x), cy: py(p.y), r: 5, fill: 'var(--a)' }));
        grid.append(node('text', { x: px(p.x) + 8, y: py(p.y) - 8, 'font-size': 20, fill: 'var(--a)' }, i + 1));
      });
      if (stroke.length) {
        // Midpoint quadratic interpolation rounds the student's own stroke only.
        let d = `M${px(stroke[0].x)} ${py(stroke[0].y)}`;
        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1], now = stroke[i];
          d += ` Q${px(prev.x)} ${py(prev.y)} ${px((prev.x + now.x) / 2)} ${py((prev.y + now.y) / 2)}`;
        }
        const end = stroke[stroke.length - 1];
        d += ` L${px(end.x)} ${py(end.y)}`;
        grid.append(node('path', { d, stroke: 'var(--b)', 'stroke-width': 2.5, fill: 'none' }));
      }
      grid.append(node('path', { d: `M${px(cursor.x) - 7} ${py(cursor.y)}h14 M${px(cursor.x)} ${py(cursor.y) - 7}v14`, stroke: 'var(--no)', 'stroke-width': 2, fill: 'none' }));
      get('jw-cursor').textContent = `游标 (${cursor.x}, ${cursor.y})；${get('jw-mode').value === 'point' ? '回车为选中行落点' : '空格增加曲线取样点'}。`;
    }
    function reset() {
      t = tasks[Number(get('jw-case').value)];
      marks = Array(5).fill(null); cursor = { x: 0, y: 0 }; stroke = []; drawing = false;
      get('jw-mode').value = 'point'; invalidate();
      get('jw-domain').textContent = t.a === 0
        ? 'a=0 时是常数函数，不是二次函数。不能把五点法的抛物线结论套在它上面；请换一道非退化任务。'
        : '请独立计算，尚未填入任何函数值或落点。';
      const table = get('jw-table'); table.replaceChildren();
      if (t.a !== 0) {
        table.innerHTML = '<table><thead><tr><th>选行</th><th>x</th><th>你算的 y</th><th>已落点</th></tr></thead><tbody></tbody></table>';
        for (let i = 0; i < 5; i++) {
          const tr = document.createElement('tr');
          const x = t.h + i - 2;
          tr.innerHTML = `<td><input type="radio" name="jw-row" value="${i}" aria-label="选择第${i + 1}行" ${i === 0 ? 'checked' : ''}></td><td>${x}</td><td><input type="text" id="jw-y-${i}" aria-label="第${i + 1}行函数值" autocomplete="off" spellcheck="false"></td><td id="jw-mark-${i}">未落</td>`;
          table.querySelector('tbody').append(tr);
          get('jw-y-' + i).addEventListener('input', () => {
            marks[i] = null; stroke = []; get('jw-mark-' + i).textContent = '未落'; invalidate(); render();
          });
        }
      }
      render();
    }
    function place() {
      if (t.a === 0) return;
      const i = Number(root.querySelector('[name="jw-row"]:checked').value);
      marks[i] = { ...cursor }; stroke = []; invalidate();
      get('jw-mark-' + i).textContent = `(${cursor.x}, ${cursor.y})`;
      render();
    }
    function locate(event) {
      const p = grid.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
      const c = p.matrixTransform(grid.getScreenCTM().inverse());
      const x = (c.x - 40) / 40 - 4, y = (360 - c.y) / 40 - 3;
      if (x < -4 || x > 4 || y < -3 || y > 5) return false;
      cursor = { x: Math.round(x * 2) / 2, y: Math.round(y * 2) / 2 };
      return true;
    }
    grid.addEventListener('pointerdown', e => {
      if (t.a === 0 || !locate(e)) return;
      e.preventDefault(); grid.focus();
      if (get('jw-mode').value === 'point') place();
      else { stroke = [{ ...cursor }]; drawing = true; grid.setPointerCapture(e.pointerId); invalidate(); render(); }
    });
    grid.addEventListener('pointermove', e => {
      if (!drawing || !locate(e)) return;
      if (stroke.length < 2000) stroke.push({ ...cursor });
      render();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => grid.addEventListener(name, () => { drawing = false; }));
    grid.addEventListener('keydown', e => {
      if (t.a === 0) return;
      const moves = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] };
      if (moves[e.key]) {
        e.preventDefault();
        cursor.x = Math.max(-4, Math.min(4, cursor.x + moves[e.key][0]));
        cursor.y = Math.max(-3, Math.min(5, cursor.y + moves[e.key][1])); render();
      } else if (e.key === 'Enter' && get('jw-mode').value === 'point') { e.preventDefault(); place(); }
      else if (e.key === ' ' && get('jw-mode').value === 'curve') {
        e.preventDefault(); if (stroke.length < 2000) stroke.push({ ...cursor }); invalidate(); render();
      }
    });
    get('jw-case').addEventListener('change', reset);
    get('jw-reset').addEventListener('click', reset);
    get('jw-mode').addEventListener('change', () => { drawing = false; render(); });
    get('jw-clear').addEventListener('click', () => { stroke = []; invalidate(); render(); });
    get('jw-check').addEventListener('click', () => {
      if (t.a === 0) { get('jw-feedback').textContent = '本题 a=0，不适用抛物线五点作图。'; return; }
      const notes = [];
      for (let i = 0; i < 5; i++) {
        const x = t.h + i - 2, y = value(t, x), n = number(get('jw-y-' + i).value);
        if (!n) notes.push(`第${i + 1}行：先按声明格式填写数值，检查分母不为零。`);
        else if (!equals(n, y)) notes.push(`第${i + 1}行：代入 x=${x} 后，先算括号再平方，再乘 a，最后加常数；注意负数平方和负系数的区别。`);
        if (!marks[i]) notes.push(`第${i + 1}行：尚未落点。`);
        else if (marks[i].x !== x || marks[i].y !== y) notes.push(`第${i + 1}行：落点与本行正确坐标不符，横纵轴每小格均为0.5，请重放。`);
      }
      get('jw-feedback').textContent = notes.length ? notes.join(' ') : '五行表值和五处落点均符合本题。请完成平滑连接并逐项自检；此结果不判定曲线质量或作图能力。';
    });
    const labels = ['a', 'b', 'c', 'a+b+c', 'a−b+c', '2a+b'];
    const reasons = ['开口方向', '对称轴 h 与 a 的符号', '与 y 轴交点高度', 'x=1 处图象高度', 'x=−1 处图象高度', 'h 与 1 的大小及 a 的符号'];
    function clearSigns() {
      get('js-feedback').replaceChildren(); get('js-reason').value = '';
      get('js-questions').replaceChildren();
      labels.forEach((text, i) => {
        const label = document.createElement('label');
        label.append(document.createTextNode(text + '：'));
        const s = document.createElement('select'); s.id = 'js-sign-' + i; s.setAttribute('aria-label', text + ' 的符号');
        [['', '请选择符号'], ['+', '大于零'], ['0', '等于零'], ['-', '小于零']].forEach(([v, l]) => s.add(new Option(l, v)));
        const r = document.createElement('select'); r.id = 'js-basis-' + i; r.setAttribute('aria-label', text + ' 的判断依据');
        r.add(new Option('请选择依据', '')); reasons.forEach((l, j) => r.add(new Option(l, String(j))));
        label.append(s, r); get('js-questions').append(label);
      });
    }
    function showGraph() {
      clearSigns(); const g = graphs[Number(get('js-case').value)]; base(graph);
      get('js-condition').textContent = `已知对称轴为直线 x=${g.h}；横纵每小格0.5。请根据图象作答，所有标示位置都按所给精确条件判断。`;
      graph.append(node('path', { d: `M${px(g.h)} 40V360`, stroke: 'var(--b)', 'stroke-width': 2, 'stroke-dasharray': '5 5' }));
      // Clip by sampling the visible vertical interval: no off-frame coordinates.
      let d = '', pen = false;
      for (let j = 0; j <= 640; j++) {
        const x = -4 + j / 80, y = value(g, x);
        if (y < -3 || y > 5) { pen = false; continue; }
        d += `${pen ? 'L' : 'M'}${px(x)} ${py(y)} `; pen = true;
      }
      graph.append(node('path', { d, stroke: 'var(--a)', 'stroke-width': 2.5, fill: 'none' }));
      [-1, 0, 1].forEach(x => {
        const y = value(g, x);
        if (y < -3 || y > 5) return;
        graph.append(node('path', { d: `M${px(x)} ${py(0)}V${py(y)} M${px(x) - 6} ${py(y)}h12`, stroke: 'var(--no)', 'stroke-width': 2, fill: 'none' }));
      });
    }
    get('js-case').addEventListener('change', showGraph);
    get('js-reset').addEventListener('click', clearSigns);
    get('js-questions').addEventListener('change', () => get('js-feedback').replaceChildren());
    get('js-reason').addEventListener('input', () => get('js-feedback').replaceChildren());
    get('js-check').addEventListener('click', () => {
      const g = graphs[Number(get('js-case').value)], expected = answers(g), out = get('js-feedback'); out.replaceChildren();
      const explanations = [
        'a 由开口方向判定。', 'b=−2ah，必须结合 a 与轴的位置。', 'c=f(0)，看与 y 轴交点。',
        'a+b+c=f(1)，看 x=1 处在 x 轴的哪一侧或轴上。', 'a−b+c=f(−1)，看 x=−1 处在 x 轴的哪一侧或轴上。',
        `2a+b=2a(1−h)，本图 h=${g.h}，结合开口判断 a 的符号；h=1 才使此式为零。`
      ];
      labels.forEach((l, i) => {
        const s = get('js-sign-' + i).value, r = get('js-basis-' + i).value;
        const p = document.createElement('p');
        if (!s || !r) p.textContent = l + '：还需要选择符号和依据。';
        else p.textContent = `${l}：${s === expected[i] && Number(r) === i ? '符号与依据相符' : '请修订符号或依据'}。${explanations[i]}`;
        out.append(p);
      });
      const p = document.createElement('p'); p.textContent = '以上仅核对这幅图的封闭选项；所写推理请与一般关系逐项自核，不自动认定为正确证明。'; out.append(p);
    });
    reset(); showGraph();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
