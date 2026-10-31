/* 本课独占；不写学习记录。数值判断用有理数精确运算，不用抽点判等价。 */
(function () {
  'use strict';
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  function rat(n, d = 1n) {
    if (!d) throw Error('分母不能是零');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n < 0n ? -n : n, d);
    return [n / g, d / g];
  }
  function number(s) {
    s = s.trim().replace(/−/g, '-');
    // 只接受完整数值词元：不折叠上标，也不删除内部空白。
    if (!/^[+-]?(?:\d{1,4}(?:\.\d{1,3})?|\d{1,4}\/\d{1,4})$/.test(s)) throw Error('数值限四位以内整数、至多三位小数或整数/正整数；数中不能插空格');
    if (s.includes('/')) { const [a, b] = s.split('/'); return rat(BigInt(a), BigInt(b)); }
    const parts = s.split('.'); const d = 10n ** BigInt(parts[1]?.length || 0);
    return rat(BigInt(s.replace('.', '')), d);
  }
  const cmp = (a, b) => { const d = a[0] * b[1] - b[0] * a[1]; return d < 0n ? -1 : d > 0n ? 1 : 0; };
  const div = (a, b) => rat(a[0] * b[1], a[1] * b[0]);
  const value = a => Number(a[0]) / Number(a[1]);
  const text = a => a[1] === 1n ? String(a[0]) : a.join('/');
  const symbol = s => s.replace('≥', '>=').replace('≤', '<=');
  const reverse = s => ({ '>': '<', '<': '>', '>=': '<=', '<=': '>=' })[s];
  function ray(v, op) { return { type: 'ray', v, dir: op[0] === '>' ? 1 : -1, inc: op.includes('=') }; }
  function declaration(s, simple = false) {
    s = symbol(s.trim().replace(/−/g, '-'));
    const m = s.match(/^([+-]?(?:\d{1,4}(?:\.\d{1,3})?|\d{1,4}\/\d{1,4})?)\s*x\s*(>=|<=|>|<)\s*(\S+)$/);
    if (!m || (simple && m[1] !== '')) throw Error(simple ? '这里请写 x 与一个数的大小关系' : '合并行请写 数字系数x 与一个数的大小关系；不含常数项');
    const a = number(m[1] === '' || m[1] === '+' ? '1' : m[1] === '-' ? '-1' : m[1]);
    if (a[0] === 0n) throw Error('零系数不能除；此处不接受退化式');
    return ray(div(number(m[3]), a), a[0] < 0n ? reverse(m[2]) : m[2]);
  }
  function common(a, b) {
    if (a.dir === b.dir) {
      const c = cmp(a.v, b.v) * a.dir;
      return c ? (c > 0 ? a : b) : { ...a, inc: a.inc && b.inc };
    }
    const l = a.dir > 0 ? a : b, h = a.dir < 0 ? a : b;
    const c = cmp(l.v, h.v);
    if (c > 0 || (!c && !(l.inc && h.inc))) return { type: 'none' };
    return !c ? { type: 'point', v: l.v } : { type: 'segment', lo: l.v, hi: h.v, li: l.inc, ri: h.inc };
  }
  function equal(a, b) {
    if (a.type !== b.type) return false;
    if (a.type === 'none') return true;
    if (a.type === 'point') return cmp(a.v, b.v) === 0;
    if (a.type === 'ray') return cmp(a.v, b.v) === 0 && a.dir === b.dir && a.inc === b.inc;
    return cmp(a.lo, b.lo) === 0 && cmp(a.hi, b.hi) === 0 && a.li === b.li && a.ri === b.ri;
  }
  const bank = [
    ['2x + 3 ≥ 1；5 − x > 2', '2x>=-2', '-x>-3'],
    ['−2x < −4；3x ≥ 6', '-2x<-4', '3x>=6'],
    ['2x ≤ 4；−3x ≤ −6', '2x<=4', '-3x<=-6'],
    ['−2x > −4；3x ≥ 6', '-2x>-4', '3x>=6'],
    ['−2x ≥ 2；3x < 6', '-2x>=2', '3x<6'],
    ['2x > 0；−3x > −3', '2x>0', '-3x>-3']
  ];
  const api = { number, cmp, common, equal, declaration, bank, text };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined' || document.body?.dataset.sec !== 'j11-3') return;
  const root = document.getElementById('self-system-dev');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = s => root.querySelector(s);
  function node(tag, attrs = {}, content = '') {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    e.textContent = content; return e;
  }
  function field(parent, title, id, area = false) {
    const label = node('label', {}, title); const input = node(area ? 'textarea' : 'input', { id, ...(area ? { rows: 3 } : { type: 'text', autocomplete: 'off' }) });
    label.append(input); parent.append(label); return input;
  }
  function select(parent, title, id, choices) {
    const label = node('label', {}, title), e = node('select', { id });
    e.append(node('option', { value: '' }, '请选择'));
    choices.forEach(([v, t]) => e.append(node('option', { value: v }, t)));
    label.append(e); parent.append(label); return e;
  }
  function button(parent, title, id, action) {
    const e = node('button', { type: 'button', id }, title); e.addEventListener('click', action); parent.append(e); return e;
  }
  const work = $('#ss-work');
  const chooser = select(work, '选择一组（每组都要亲自完成）', 'ss-case', bank.map((_, i) => [String(i), '第 ' + (i + 1) + ' 组']));
  const prompt = node('p', { id: 'ss-prompt' }, '先选择一组。'); work.append(prompt);
  const fields = [];
  for (let i = 1; i <= 2; i++) {
    const group = node('fieldset'); group.append(node('legend', {}, '不等式' + i)); work.append(group);
    fields.push([
      field(group, '自己写变形过程及依据（自核，不自动判文字）', 'ss-process-' + i, true),
      field(group, '移项合并后的式子', 'ss-merged-' + i),
      field(group, '系数化为 1 后的解集', 'ss-solved-' + i)
    ]);
  }
  const status = node('p', { id: 'ss-status', role: 'status' });
  button(work, '检查两式', 'ss-check', () => {
    status.textContent = ''; if (chooser.value === '') { status.textContent = '请先选题。'; return; }
    try {
      fields.forEach((f, i) => {
        if (!f[0].value.trim()) throw Error('请写两式的变形过程与依据；文字仍需自核');
        const expect = declaration(bank[+chooser.value][i + 1]);
        if (!equal(declaration(f[1].value), expect)) throw Error('第' + (i + 1) + '式的合并行不等价，请检查移项及方向');
        if (!equal(declaration(f[2].value, true), expect)) throw Error('第' + (i + 1) + '式的最终解集不等价，请检查除数的正负');
      });
      status.textContent = '两式合并行和最终解集等价。中间文字未自动认证：请自核每一步是否同加减、负数乘除是否变号，再亲画三个范围。';
    } catch (e) { status.textContent = e.message; }
  });
  work.append(status);
  const drawing = $('#ss-drawing');
  const rows = [];
  for (let i = 0; i < 3; i++) {
    const group = node('fieldset'); group.append(node('legend', {}, i < 2 ? '画不等式' + (i + 1) + '的范围' : '亲自画公共部分'));
    drawing.append(group);
    const type = select(group, '范围形状', 'ss-type-' + i, i < 2 ? [['ray', '向一边延伸']] : [['none', '没有公共点'], ['point', '一个点'], ['ray', '向一边延伸'], ['segment', '两点之间']]);
    const v = field(group, '端点（两点之间时填左端）', 'ss-v-' + i);
    const inc = select(group, '该端点', 'ss-inc-' + i, [['yes', '实心'], ['no', '空心']]);
    const dir = select(group, '延伸方向（仅射线）', 'ss-dir-' + i, [['1', '向右'], ['-1', '向左']]);
    const hi = field(group, '右端点（仅两点之间）', 'ss-hi-' + i);
    const ri = select(group, '右端点（仅两点之间）', 'ss-ri-' + i, [['yes', '实心'], ['no', '空心']]);
    const row = { type, v, inc, dir, hi, ri }; rows.push(row);
    function adapt() {
      [v, inc].forEach(e => e.disabled = !type.value || type.value === 'none');
      inc.disabled = !type.value || ['none', 'point'].includes(type.value);
      dir.disabled = type.value !== 'ray'; hi.disabled = ri.disabled = type.value !== 'segment';
    }
    type.addEventListener('change', adapt); adapt();
  }
  const active = select(drawing, '点数轴时设置哪个端点', 'ss-active', [['0', '第一式端点'], ['1', '第二式端点'], ['2', '公共部分端点或左端'], ['3', '公共部分右端']]);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'ss-axis'; svg.setAttribute('viewBox', '0 0 400 260'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '学生绘制的同一数轴，三行依次为第一式、第二式和公共部分'); drawing.append(svg);
  function sv(tag, attr, content = '') {
    const e = document.createElementNS(svg.namespaceURI, tag); if (tag === 'text') attr['font-size'] = 22; Object.entries(attr).forEach(([k, v]) => e.setAttribute(k, v)); e.textContent = content; svg.append(e); return e;
  }
  const X = n => 60 + (n + 4) * 35;
  function render() {
    svg.replaceChildren();
    const fg = getComputedStyle(root).color;
    sv('line', { x1: 50, x2: 355, y1: 218, y2: 218, stroke: fg });
    sv('text', { x: 355, y: 213, fill: fg }, '→');
    for (let k = -4; k <= 4; k++) { sv('line', { x1: X(k), x2: X(k), y1: 214, y2: 222, stroke: fg }); sv('text', { x: X(k), y: 244, fill: fg, 'text-anchor': 'middle' }, String(k)); }
    rows.forEach((r, i) => {
      const y = 40 + i * 65; sv('text', { x: 5, y: y + 6, fill: fg }, ['①', '②', '公共'][i]);
      try {
        const a = read(r); if (a.type === 'none') { sv('text', { x: 90, y, fill: fg }, '无公共点'); return; }
        const point = (v, inc) => sv('circle', { cx: X(value(v)), cy: y, r: 7, stroke: fg, 'stroke-width': 2, fill: inc ? fg : 'var(--card)' });
        let l, h;
        if (a.type === 'segment') { l = a.lo; h = a.hi; }
        else if (a.type === 'point') { point(a.v, true); return; }
        else { l = a.dir > 0 ? a.v : number('-4'); h = a.dir > 0 ? number('4') : a.v; }
        sv('line', { x1: X(value(l)), x2: X(value(h)), y1: y, y2: y, stroke: fg, 'stroke-width': 4 });
        if (a.type === 'segment') { point(l, a.li); point(h, a.ri); }
        else { point(a.v, a.inc); sv('text', { x: a.dir > 0 ? 355 : 40, y: y + 5, fill: fg }, a.dir > 0 ? '→' : '←'); }
      } catch (_) { /* 未作答的行保持空白。 */ }
    });
  }
  function need(e) { if (e.value === '') throw Error('请完成图形所需的形状、端点、空实心和方向'); return e.value; }
  function read(r) {
    const type = need(r.type); if (type === 'none') return { type };
    const v = number(need(r.v)); if (cmp(v, number('-4')) < 0 || cmp(v, number('4')) > 0) throw Error('本绘图区端点限 −4 到 4');
    if (type === 'point') return { type, v };
    const inc = need(r.inc) === 'yes';
    if (type === 'ray') return { type, v, inc, dir: +need(r.dir) };
    const hi = number(need(r.hi));
    if (cmp(v, hi) >= 0 || cmp(hi, number('4')) > 0) throw Error('两点之间需左端小于右端且都在绘图区内；重合时请选单点或无公共点');
    return { type, lo: v, hi, li: inc, ri: need(r.ri) === 'yes' };
  }
  svg.addEventListener('pointerdown', e => {
    if (active.value === '') return;
    const box = svg.getBoundingClientRect(); const x = (e.clientX - box.left) * 400 / box.width;
    const n = Math.max(-4, Math.min(4, Math.round(((x - 60) / 35 - 4) * 2) / 2));
    const k = +active.value; const input = k === 3 ? rows[2].hi : rows[k].v;
    if (input.disabled) return;
    input.value = String(n); input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const integers = field(drawing, '另外写全部整数解（逗号分隔；没有写“无”，无穷多个写“无穷多个”）', 'ss-integers');
  const drawStatus = node('p', { id: 'ss-draw-status', role: 'status' });
  button(drawing, '画出我的输入', 'ss-draw', () => { drawStatus.textContent = ''; try { rows.forEach(read); render(); drawStatus.textContent = '已画出你的输入，尚未核对。'; } catch (e) { drawStatus.textContent = e.message; } });
  function integerAnswer(a) {
    if (a.type === 'ray') return '无穷多个';
    if (a.type === 'none') return '无';
    if (a.type === 'point') return a.v[1] === 1n ? text(a.v) : '无';
    const out = [];
    for (let k = Math.ceil(value(a.lo)); k <= Math.floor(value(a.hi)); k++) {
      const q = rat(BigInt(k)); const l = cmp(q, a.lo), h = cmp(q, a.hi);
      if ((l > 0 || (!l && a.li)) && (h < 0 || (!h && a.ri))) out.push(String(k));
    }
    return out.join(',') || '无';
  }
  button(drawing, '核对三行图和整数解', 'ss-draw-check', () => {
    drawStatus.textContent = '';
    try {
      if (chooser.value === '') throw Error('请先选题');
      const a = declaration(bank[+chooser.value][1]), b = declaration(bank[+chooser.value][2]), c = common(a, b);
      [a, b, c].forEach((expected, i) => { if (!equal(read(rows[i]), expected)) throw Error('第' + (i + 1) + '行图需重看端点、方向和公共部分'); });
      const s = integers.value.trim().replace(/，/g, ',').replace(/−/g, '-');
      if (s !== integerAnswer(c)) throw Error('三行图正确；整数解请从实数范围内另挑，按从小到大完整列出，不要把两种域混同');
      render(); drawStatus.textContent = '三行范围与全部整数解核对通过。实数范围和整数解分别检查；图由你的输入构成。';
    } catch (e) { drawStatus.textContent = e.message; }
  }); drawing.append(drawStatus);
  function clearWork() {
    work.querySelectorAll('input,textarea').forEach(e => e.value = '');
    drawing.querySelectorAll('input,select').forEach(e => e.value = '');
    rows.forEach(r => r.type.dispatchEvent(new Event('change')));
    status.textContent = drawStatus.textContent = ''; render();
  }
  chooser.addEventListener('change', () => { clearWork(); prompt.textContent = chooser.value === '' ? '先选择一组。' : bank[+chooser.value][0]; });
  button(work, '重做本组', 'ss-reset', clearWork);
  root.addEventListener('input', e => {
    if (e.target.closest('#ss-work')) status.textContent = '';
    if (e.target.closest('#ss-drawing')) { drawStatus.textContent = ''; render(); }
    if (e.target.closest('#ss-model')) $('#ss-model-status').textContent = '';
    if (e.target.closest('#ss-reflect')) $('#ss-reflect-status').textContent = '';
  });
  root.addEventListener('change', e => {
    if (e.target.closest('#ss-drawing')) { drawStatus.textContent = ''; render(); }
    if (e.target.closest('#ss-model')) $('#ss-model-status').textContent = '';
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)'); mq?.addEventListener('change', render);
  render();

  // 分物问题：学生填原始条件、两次求解、还原及比较；文字只按准则自核。
  const model = $('#ss-model');
  const open = [];
  ['设人数法：未知数、单位及正整数条件', '设人数法：同一批书的数量关系、剩余与不足条件、求解过程', '设书本数法：未知数、单位、人数的表达式及正整数条件', '设书本数法：不足条件、除法前的正数条件、求解过程', '比较：两法列式、计算和确定全部答案各有什么不同？为什么表示同一实际量？'].forEach((s, i) => open.push(field(model, s, 'ss-model-open-' + i, true)));
  const nlo = field(model, '设人数法得到人数范围的下界（含端点）', 'ss-nlo');
  const nhi = field(model, '人数范围的上界（含端点）', 'ss-nhi');
  const blo = field(model, '设书本数法得到书本数范围的下界（含端点）', 'ss-blo');
  const bhi = field(model, '书本数范围的上界（含端点）', 'ss-bhi');
  const pairs = field(model, '全部“人数,书本数”组合，每组用分号分开，按人数递增', 'ss-pairs');
  const conditions = [];
  ['我核对了剩余条件与不足条件都针对同一批书，单位分别是人、本、本/人', '我检查了人数为正整数；除法中的人数表达式严格大于零', '我从书本数范围还原人数，排除了人数不为整数的候选', '我逐组代回剩余和不足条件，列全了问到的人数与书本数，没有把一个解当唯一'].forEach((s, i) => {
    const l = node('label'); const c = node('input', { type: 'checkbox', id: 'ss-condition-' + i }); l.append(c, document.createTextNode(s)); model.append(l); conditions.push(c);
  });
  button(model, '核对范围和全部组合，再自核过程', 'ss-model-check', () => {
    const out = $('#ss-model-status'); out.textContent = '';
    try {
      if (open.some(e => !e.value.trim()) || conditions.some(e => !e.checked)) throw Error('请完成两法和比较，再逐项自核；勾选只是你的声明');
      [nlo, nhi, blo, bhi].forEach((e, i) => { if (cmp(number(e.value), number(['6', '8', '23', '29'][i])) !== 0) throw Error('范围还需检查：从剩余关系代入不足条件，再考虑人数为正整数'); });
      const groups = pairs.value.trim().split(/[;；]/).map(s => s.trim().split(/[,，]/).map(x => number(x)));
      if (groups.length !== 3 || groups.some((g, i) => g.length !== 2 || cmp(g[0], number(String(i + 6))) || cmp(g[1], number(String(3 * (i + 6) + 5))))) throw Error('请核对全部可行组合；连续的书本数范围里不是每个整数都符合人数条件');
      out.textContent = '范围及全部人数—书本数组合核对通过。开放建模、推导及比较未自动认证，请展开准则逐行自核或请老师核看。';
    } catch (e) { out.textContent = e.message; }
  });
  model.append($('#ss-model-status'));
  button(model, '清空两种方法重做', 'ss-model-reset', () => { model.querySelectorAll('input,textarea').forEach(e => { e.value = ''; e.checked = false; }); $('#ss-model-status').textContent = ''; });
  button($('#ss-reflect'), '查看归纳自核准则', 'ss-reflect-check', () => {
    $('#ss-reflect-status').textContent = '自核：是否写出分别解两式→同一数轴画两范围→找公共部分？是否说明数轴帮助比较方向、开闭端点、有无公共点？实数范围与整数筛选是否分开？文字不自动判正确，也不证明你已完成纸笔或同伴活动。';
  });
  button($('#ss-reflect'), '清空归纳', 'ss-reflect-reset', () => { $('#ss-reflection').value = ''; $('#ss-reflect-status').textContent = ''; });
})();
