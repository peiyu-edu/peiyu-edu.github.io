/* j24-4 only: exact arithmetic; student work lives solely in this closure/DOM. */
(function () {
  'use strict';
  const root = document.getElementById('group-cut-lab');
  if (!root || document.body.dataset.sec !== 'j24-4') return;
  const $ = id => root.querySelector('#gc-' + id);
  const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
  const q = (a, b = 1n) => { const g = gcd(a, b); return {a: a / g, b: b / g}; };
  const add = (x, y) => q(x.a * y.b + y.a * x.b, x.b * y.b);
  const sub = (x, y) => q(x.a * y.b - y.a * x.b, x.b * y.b);
  const mul = (x, y) => q(x.a * y.a, x.b * y.b);
  const eq = (x, y) => x.a * y.b === y.a * x.b;
  const cmp = (x, y) => x.a * y.b < y.a * x.b ? -1 : eq(x, y) ? 0 : 1;
  const fmt = x => x.b === 1n ? String(x.a) : x.a + '/' + x.b;
  function number(raw, answer = false) {
    const s = raw.trim();
    if (s.length > 40) throw Error('数字过长。');
    if (answer && /^[+-]?\d{1,18}\/[1-9]\d{0,17}$/.test(s)) {
      const [a, b] = s.split('/'); return q(BigInt(a), BigInt(b));
    }
    const limit = answer ? 12 : 3;
    if (!new RegExp('^[+-]?\\d{1,10}(?:\\.\\d{1,' + limit + '})?$').test(s)) {
      throw Error(answer ? '请填普通数字或精确整数分数，勿填算式、内部空格或上下标。' : '数据须为普通整数或最多3位小数；勿填算式、内部空格或上下标。');
    }
    const sign = s[0] === '-' ? -1n : 1n;
    const [a, b = ''] = s.replace(/^[+-]/, '').split('.');
    return q(sign * BigInt(a + b), 10n ** BigInt(b.length));
  }
  function tokens(raw) {
    const items = raw.trim().split(/[,，\n]/);
    if (items.some(s => !s.trim())) throw Error('不能有空项或连续分隔符；用逗号或换行分项。');
    return items;
  }
  function stats(entries) {
    const mean = mul(entries.reduce((s, x) => add(s, x.v), q(0n)), q(1n, BigInt(entries.length)));
    const sse = entries.reduce((s, x) => { const d = sub(x.v, mean); return add(s, mul(d, d)); }, q(0n));
    return {n: q(BigInt(entries.length)), mean, sse};
  }
  const fields = ['n1', 'mean1', 'sse1', 'n2', 'mean2', 'sse2', 'within'];
  const labels = ['第一组条目数', '第一组均值', '第一组离差平方和', '第二组条目数', '第二组均值', '第二组离差平方和', '组内离差平方和合计'];
  let state = null;
  function clearRecord() { $('record-status').textContent = ''; $('record-output').replaceChildren(); }
  function clearWork() {
    $('work').hidden = true; $('rows').replaceChildren(); $('progress').textContent = '';
    $('choice').replaceChildren(new Option('请选择', ''));
    $('reason').value = ''; $('selfcheck').checked = false; clearRecord();
    if (state) state.rows = [];
  }
  function invalidate() {
    clearWork(); state = null; $('prepared').hidden = true;
    $('sorted').textContent = ''; $('allowed').textContent = ''; $('candidates').value = '';
    $('status').textContent = ''; $('build-status').textContent = '';
  }
  const desc = entries => entries.map(x => '原' + x.id + '号=' + fmt(x.v)).join('，');
  function prepare() {
    invalidate();
    try {
      const entries = tokens($('data').value).map((s, i) => ({v: number(s), id: i + 1}));
      if (entries.length < 2 || entries.length > 10) throw Error('本活动只支持2—10项，不会截断数据或只展示部分切法。');
      if (entries.some(x => cmp(x.v, q(-10000n)) < 0 || cmp(x.v, q(10000n)) > 0)) throw Error('每项须在−10000至10000内。');
      const unit = $('unit').value.trim(), rule = $('rule').value, order = $('order').value;
      if (!unit || unit.length > 20 || !['value', 'index'].includes(rule) || !['sort', 'sorted'].includes(order)) throw Error('请填写统一单位，并选择顺序和分组规则。');
      if (order === 'sorted' && entries.some((x, i) => i && cmp(entries[i - 1].v, x.v) > 0)) throw Error('当前数据并未从小到大排列，请改正或选择工具排序。');
      entries.sort((x, y) => cmp(x.v, y.v) || x.id - y.id);
      const allowed = [];
      for (let k = 1; k < entries.length; k++) if (rule === 'index' || cmp(entries[k - 1].v, entries[k].v) < 0) allowed.push(k);
      state = {entries, unit, rule, allowed, rows: []};
      $('prepared').hidden = false;
      $('sorted').textContent = '排序后（重复值保留原编号）：' + desc(entries) + '。共' + entries.length + '项，单位：' + unit + '。';
      $('allowed').textContent = '允许边界编号：' + (allowed.join('，') || '无') + '。' + (rule === 'value' ? '只在不同值之间切，相同值不能拆到两边。' : '按人数/索引切；允许相同值跨组，不是按值域阈值分组。');
      $('status').textContent = allowed.length ? '已整理。请亲自列全允许边界后建立空表。' : '所有值相同，按值无法分成两个非空组；可重新选按人数分组，或更换数据。';
    } catch (e) { $('status').textContent = e.message; }
  }
  function progress() {
    const count = state.rows.filter(r => r.checked).length;
    $('progress').textContent = '已核对 ' + count + '/' + state.rows.length + ' 刀。' + (count === state.rows.length ? '请比较全表，再选择并说明；没有自动推荐。' : '全部核对后才能暂存选择。');
  }
  function build() {
    clearWork(); $('build-status').textContent = '';
    if (!state) return;
    try {
      if (!state.allowed.length) throw Error('当前规则无允许切法，不能建立两非空组。');
      const list = tokens($('candidates').value).map(s => { if (!/^[1-9]$/.test(s.trim())) throw Error('边界编号须为1—9的单个整数。'); return Number(s.trim()); });
      if (new Set(list).size !== list.length || list.length !== state.allowed.length || state.allowed.some(k => !list.includes(k))) throw Error('候选边界须无重复且恰好列全当前规则允许的边界；不接受漏刀或额外边界。');
      $('work').hidden = false;
      for (const k of state.allowed) {
        const a = state.entries.slice(0, k), b = state.entries.slice(k), s1 = stats(a), s2 = stats(b);
        const row = {k, checked: false, calculated: false, expected: [s1.n, s1.mean, s1.sse, s2.n, s2.mean, s2.sse, add(s1.sse, s2.sse)]};
        const card = document.createElement('div'); card.className = 'gc-row'; card.dataset.cut = k;
        const title = document.createElement('h4'); title.textContent = '切在第' + k + '项后'; card.append(title);
        const groups = document.createElement('p'); groups.textContent = '第一组：' + desc(a) + '；第二组：' + desc(b) + '。'; card.append(groups);
        const calc = document.createElement('button'); calc.type = 'button'; calc.className = 'btn ghost'; calc.textContent = '计算第' + k + '刀参考'; calc.dataset.action = 'calculate';
        const reference = document.createElement('p'); reference.dataset.reference = ''; reference.setAttribute('aria-live', 'polite');
        calc.onclick = () => {
          row.calculated = true;
          reference.textContent = labels.map((l, i) => l + '：' + fmt(row.expected[i])).join('；') + '。均值单位：' + state.unit + '；离差平方和单位：(' + state.unit + ')²。请亲自转填，按精确值核对。';
        };
        card.append(calc, reference);
        const grid = document.createElement('div'); grid.className = 'gc-grid';
        const feedback = document.createElement('p'); feedback.dataset.feedback = ''; feedback.setAttribute('role', 'status');
        row.inputs = fields.map((key, i) => {
          const label = document.createElement('label'); label.textContent = labels[i];
          const input = document.createElement('input'); input.type = 'text'; input.autocomplete = 'off'; input.dataset.field = key;
          input.setAttribute('aria-label', '第' + k + '刀' + labels[i]);
          input.oninput = () => { row.checked = false; feedback.textContent = ''; clearRecord(); progress(); };
          label.append(input); grid.append(label); return input;
        });
        const check = document.createElement('button'); check.type = 'button'; check.className = 'btn'; check.textContent = '核对第' + k + '刀'; check.dataset.action = 'check';
        check.onclick = () => {
          row.checked = false; clearRecord();
          try {
            if (!row.calculated) throw Error('请先亲自调用本行计算器，再填表核对。');
            const values = row.inputs.map(input => number(input.value, true));
            const bad = values.findIndex((v, i) => !eq(v, row.expected[i]));
            if (bad !== -1) throw Error(labels[bad] + '尚不一致，请检查本组均值、条目数与平方和；循环小数填精确分数。');
            row.checked = true; feedback.textContent = '本行计算表核对一致（借助工具），请继续比较各刀。';
          } catch (e) { feedback.textContent = e.message; }
          progress();
        };
        card.append(grid, check, feedback); $('rows').append(card); state.rows.push(row);
        $('choice').append(new Option('第' + k + '项后', String(k)));
      }
      progress(); $('build-status').textContent = '本表列全当前规则允许的' + state.allowed.length + '刀，每组均非空。';
    } catch (e) { $('build-status').textContent = e.message; }
  }
  function record() {
    clearRecord();
    if (!state || !state.rows.length || state.rows.some(r => !r.checked)) { $('record-status').textContent = '请先完成全部切法的计算表核对。'; return; }
    const chosen = state.rows.find(r => String(r.k) === $('choice').value);
    if (!chosen || !$('reason').value.trim() || !$('selfcheck').checked) { $('record-status').textContent = '请选择边界、填写自己的依据，并按准则自核；系统不自动评价文字。'; return; }
    const all = stats(state.entries), weighted = mul(add(mul(chosen.expected[0], chosen.expected[1]), mul(chosen.expected[3], chosen.expected[4])), q(1n, BigInt(state.entries.length)));
    const summary = document.createElement('p');
    summary.textContent = '本页暂存：' + (state.rule === 'value' ? '按值分组' : '按人数/索引分组') + '，第' + chosen.k + '项后切。第一组：' + desc(state.entries.slice(0, chosen.k)) + '；第二组：' + desc(state.entries.slice(chosen.k)) + '。所选组内离差平方和=' + fmt(chosen.expected[6]) + ' (' + state.unit + ')²。按组条目数加权合并均值=' + fmt(weighted) + ' ' + state.unit + '，与原数据均值=' + fmt(all.mean) + ' ' + state.unit + '一致。';
    const reason = document.createElement('p'); reason.textContent = '我的依据：' + $('reason').value.trim();
    $('record-output').append(summary, reason);
    $('record-status').textContent = '已在本页暂存选择与说明。仅计算表核对一致；开放解释未判对，不认证最优、真实采集或合作。刷新或重置即清空。';
  }
  $('form').addEventListener('submit', e => e.preventDefault());
  $('form').addEventListener('reset', invalidate);
  ['data', 'unit', 'order', 'rule'].forEach(id => $(id).addEventListener('input', invalidate));
  $('candidates').addEventListener('input', () => { clearWork(); $('build-status').textContent = ''; });
  ['choice', 'reason', 'selfcheck'].forEach(id => $(id).addEventListener('input', clearRecord));
  $('prepare').onclick = prepare; $('build').onclick = build; $('record').onclick = record;
}());
