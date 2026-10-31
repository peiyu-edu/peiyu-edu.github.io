/* Single-lesson project. Drafts stay in DOM/memory; no ledger or network writes. */
(function () {
  'use strict';
  function integer(s, lo, hi) {
    // Deliberately no NFKC or whitespace removal inside a token.
    s = s.trim();
    if (!/^(0|[1-9][0-9]*)$/.test(s)) throw Error('请用普通十进制整数；不要用上标、算式或在数字中间加空格。');
    const n = Number(s);
    if (!Number.isSafeInteger(n) || n < lo || n > hi) throw Error('整数范围应为 ' + lo + '—' + hi + '。');
    return n;
  }
  function options(s) {
    const a = s.trim().split(/\r?\n/).map(x => x.trim());
    if (a.length < 2 || a.length > 6 || a.some(x => !x)) throw Error('选项需2—6行，每行写一个名称和判定规则。');
    if (new Set(a).size !== a.length) throw Error('有完全重复的选项，请修改；语义是否重漏仍需你自核。');
    return a;
  }
  function lines(s) {
    if (!s.trim()) throw Error('请先填写记录。');
    return s.trim().split(/\r?\n/).map(x => {
      const pair = x.trim().split(/[,，]/).map(v => v.trim());
      if (pair.length !== 2) throw Error('每行恰好两项，用一个逗号分隔。');
      return pair;
    });
  }
  function records(s, ids, k) {
    const result = [], seen = new Set();
    for (const [a, b] of lines(s)) {
      const id = integer(a, 1, 80);
      if (!ids.includes(id)) throw Error('编号不在本轮名单：' + id);
      if (seen.has(id)) throw Error('编号重复：' + id + '。请回查原始记录，不能重复计数。');
      if (!/^[A-F]$/.test(b) || b.charCodeAt(0) - 65 >= k) throw Error('代码不属于本问卷选项，请按大写代码记录。');
      seen.add(id); result.push([id, b]);
    }
    if (seen.size !== ids.length) throw Error('本轮还缺 ' + (ids.length - seen.size) + ' 项；保留未响应记录并复核，不擅自换签。');
    return result;
  }
  function frequencies(rows, k) {
    const a = Array(k).fill(0);
    rows.forEach(r => a[r[1].charCodeAt(0) - 65]++);
    return a;
  }
  function countInput(s, k, total) {
    const out = Array(k).fill(null);
    for (const [a, b] of lines(s)) {
      const i = a.charCodeAt(0) - 65;
      if (!/^[A-F]$/.test(a) || i >= k || out[i] !== null) throw Error('频数表代码须各出现一次，与选项对应。');
      out[i] = integer(b, 0, total);
    }
    if (out.some(x => x === null)) throw Error('每个选项都要写频数，包括0。');
    return out;
  }
  function draw(n, total, below) {
    const a = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = 0; i < n; i++) {
      const j = i + below(total - i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }
  function below(n) {
    const cap = Math.floor(4294967296 / n) * n, a = new Uint32Array(1);
    do { crypto.getRandomValues(a); } while (a[0] >= cap);
    return a[0] % n;
  }
  // Count/total are exact integers; round to the nearest tenth of a percent,
  // choosing the higher tenth at a tie. No binary floating-point decision.
  function percentageOneDecimal(count, total) {
    if (!Number.isSafeInteger(count) || !Number.isSafeInteger(total) ||
        total <= 0 || count < 0 || count > total) {
      throw new RangeError('Percentage requires integer counts from 0 to a positive total.');
    }
    const denominator = BigInt(total), scaled = BigInt(count) * 1000n;
    const quotient = scaled / denominator, remainder = scaled % denominator;
    const tenths = quotient + (2n * remainder >= denominator ? 1n : 0n);
    return String(tenths / 10n) + '.' + String(tenths % 10n);
  }
  const api = { integer, options, records, frequencies, countInput, draw, percentageOneDecimal };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined' || document.body?.dataset.sec !== 'j12-1') return;
  const root = document.getElementById('own-survey');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = id => root.querySelector('#os-' + id), form = $('form');
  const value = id => $(id).value.trim();
  let active = null, smallDone = false, organized = false, history = [];
  function say(id, text) { $(id).textContent = text; }
  function draft() { return Array.from(form.querySelectorAll('input,textarea,select')).map(x => [x.id, x.value]); }
  function clearData() { organized = false; say('data-out', ''); $('chart').replaceChildren(); }
  function clearActive() { active = null; clearData(); say('task', ''); say('cards', ''); $('raw').value = ''; $('counts').value = ''; }
  function needDraft() {
    if (!value('question') || !value('definition')) throw Error('先写调查问题和概念规则；文字正确性仍需人工自核。');
    return options(value('options'));
  }
  function attempt(id, fn) {
    try { fn(); } catch (e) { say(id, e.message); }
  }
  function prepare(total, n, method) {
    const opts = needDraft();
    if (history.length && !value('reason')) throw Error('已有封存稿。请写新一轮/重抽的理由，旧稿不会被覆盖。');
    active = { total, n, method, ids: draw(n, total, below), opts, source: value('source') };
    clearData(); $('raw').value = ''; $('counts').value = '';
    say('task', (active.source === 'model' ? '模型模拟' : '学生自行观察，尚未核验') + '；' + (method === 'all' ? '全面调查' : '简单随机抽样') + '；范围1—' + total + '，本轮名单（保持抽取顺序）：' + active.ids.join('、') + '。原始值请逐项录入，未响应另作记录，不替换编号。');
    $('model').hidden = active.source !== 'model';
    $('model').open = false;
    say('cards', active.source === 'model' ? active.ids.map(id => id + ':' + String.fromCharCode(65 + (id - 1) % opts.length)).join('；') + '（虚构代码，与真实物品无对应保证）' : '');
  }
  $('draft').onclick = () => attempt('preview', () => {
    const opts = needDraft();
    say('preview', '你的问卷草稿：' + value('question') + '\n规则：' + value('definition') + '\n' + opts.map((x, i) => String.fromCharCode(65 + i) + '：' + x).join('；') + '\n请按下面准则自核，程序未判合格。');
    $('rubric').hidden = false;
  });
  $('small').onclick = () => attempt('task', () => { prepare(8, 8, 'all'); smallDone = false; });
  $('cost').onclick = () => attempt('cost-out', () => {
    const t = integer(value('time'), 1, 120);
    say('cost-out', '按逐个查看、不并行的模型：小箱8个需 ' + (8 * t) + ' 分钟；全校80个需 ' + (80 * t) + ' 分钟。先自己权衡，再选调查办法。只调查一部分并估计全体，才叫抽样调查。真实耗时还受准备、往返等影响。');
  });
  $('expand').onclick = () => attempt('task', () => {
    if (!smallDone) throw Error('先完成小箱8个的原始记录和划记频数核对，再扩大范围。');
    const t = integer(value('time'), 1, 120), method = value('method');
    if (!method || !value('decision') || !value('range') || !value('capacity')) throw Error('先选办法，分别写成本理由、范围评价与容量评价；这些理由需人工评价。');
    const n = method === 'all' ? 80 : integer(value('size'), 1, 79);
    prepare(80, n, method);
    say('cost-out', '本方案逐个查看预计 ' + (n * t) + ' 分钟，全面查看需 ' + (80 * t) + ' 分钟。容量 ' + n + '；这不是精度保证。');
  });
  $('organize').onclick = () => attempt('data-out', () => {
    clearData();
    if (!active) throw Error('先准备本轮调查名单。');
    if (!value('origin')) throw Error('请如实写数据来源与划记/核查说明。');
    const rows = records(value('raw'), active.ids, active.opts.length);
    if (active.source === 'model' && rows.some(([id, c]) => c !== String.fromCharCode(65 + (id - 1) % active.opts.length))) throw Error('录入与虚构代码卡不符，请逐项回查，不为结论修改记录。');
    const freq = frequencies(rows, active.opts.length), entered = countInput(value('counts'), active.opts.length, active.n);
    if (freq.some((x, i) => x !== entered[i])) throw Error('你的频数表与原始记录不一致。请逐行划记，检查漏记或重记后重试。');
    const stamp = JSON.stringify({ active, rows, draft: draft().filter(x => x[0] !== 'os-reason') });
    if (history.length && history[history.length - 1].stamp !== stamp && !value('reason')) throw Error('请写本轮修订/新一轮理由；原始旧稿必须保留。');
    if (!history.length || history[history.length - 1].stamp !== stamp) history.push({ stamp, text: draft().map(x => x.join(': ')).join('\n') + '\n名单: ' + active.ids.join(',') });
    organized = true;
    if (active.total === 8) smallDone = true;
    const table = document.createElement('table'), caption = table.createCaption();
    caption.textContent = (active.source === 'model' ? '模拟数据' : '学生自录数据（未核实）') + '频数表与条形图；横向条长从0起，每条满宽表示本轮总数' + active.n + '。';
    const header = table.insertRow();
    for (const title of ['选项', '划记对照/频数', '占本轮比例/条形']) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = title; header.append(th); }
    freq.forEach((n, i) => {
      const tr = table.insertRow();
      tr.insertCell().textContent = String.fromCharCode(65 + i) + '：' + active.opts[i];
      tr.insertCell().textContent = '正'.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5) + ' / ' + n;
      const td = tr.insertCell(); td.textContent = percentageOneDecimal(n, active.n) + '%';
      const bar = document.createElement('div'); bar.className = 'os-bar'; bar.style.width = (n / active.n * 100) + '%'; bar.setAttribute('aria-hidden', 'true'); td.append(bar);
    });
    $('chart').append(table);
    say('data-out', '编号、代码与频数结构核对一致，合计 ' + active.n + '。图由程序生成供对照；请核对自己的纸上划记和条形图。比例四舍五入可能不恰好合100%。未自动核实问卷语义、真实观察、手绘或同伴活动。');
    say('history', '已在本页内存保留 ' + history.length + ' 版原始稿，刷新/清空会失去；请及时本地导出。');
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    say('review', '成果评价（人工自核/同伴讨论，不自动授予合格）：\n①问卷中立、定义清楚、选项互斥覆盖吗？用边界物品试填。\n②小箱是否逐个记录？扩大范围为何选择该办法？\n③名单是否覆盖总体且机会相等？容量与时间取舍有何依据？容量大不能补救范围偏差。\n④原始稿、划记、表、图是否互相一致？真实数据有来源和同伴核验吗？\n⑤样本结论是否只作估计，承认换样本可能不同？方案修改有理由且保留旧数据吗？\n本页当前' + (organized ? '记录结构已核对；' : '尚无本轮结构核对结果；') + '不证明调查已真实完成。把问卷、方案、原稿、图表、结论及修改理由一起交给同伴/老师评价。');
  });
  form.addEventListener('input', e => {
    say('review', '');
    const id = e.target.id;
    if (['os-question', 'os-definition', 'os-options', 'os-source'].includes(id)) {
      smallDone = false; clearActive(); say('preview', ''); $('rubric').hidden = true;
    } else if (['os-raw', 'os-counts', 'os-origin', 'os-reason'].includes(id)) {
      if (active?.total === 8 && id !== 'os-reason') smallDone = false;
      clearData();
    } else if (['os-method', 'os-size', 'os-time'].includes(id)) {
      say('cost-out', '');
      if (active?.total === 80) clearActive();
    }
  });
  $('export').onclick = () => {
    const text = '调查项目草稿；真实活动未由程序核验。\n' + history.map((h, i) => '\n---封存稿' + (i + 1) + '---\n' + h.text).join('\n') + '\n---当前草稿---\n' + draft().map(x => x.join(': ')).join('\n') + '\n当前名单: ' + (active ? active.ids.join(',') : '未准备');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'survey-draft.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  form.addEventListener('reset', () => {
    active = null; smallDone = false; organized = false; history = [];
    for (const id of ['preview', 'cost-out', 'task', 'cards', 'data-out', 'review', 'history']) say(id, '');
    $('chart').replaceChildren(); $('rubric').hidden = true; $('model').hidden = false; $('model').open = false;
  });
})();
