/* J31-B: bounded student enumeration, page-local draft only. */
(function () {
  'use strict';
  const root = document.getElementById('se-workspace');
  if (!root || document.body.dataset.sec !== 'j31-2' || root.dataset.mounted) return;
  root.dataset.mounted = 'yes';
  root.innerHTML = `
<label>选择试验 <select id="se-experiment"><option value="cards">编号卡抽两次</option><option value="dice">两枚骰子</option><option value="tree">三枚硬币树</option></select></label>
<div id="se-config"></div>
<p id="se-condition"></p>
<label>先写：全部结果为什么等可能？<textarea id="se-reason"></textarea></label>
<label>选择你所使用的依据 <select id="se-model"><option value="">请选择</option><option value="objects">分清对象与次序，固定步数，同一步各节点可选数相同且节点内等可能</option><option value="colors">只有几种颜色，就直接把颜色类等分</option><option value="leaves">任意树只要每个节点分支等可能，所有末端就等可能</option></select></label>
<p class="small">文字依据只供自己或同伴按题设核对，程序不认证自由文字。颜色相同的对象仍须编号；不规则树的末端不能盲目等分。</p>
<div id="se-editor"></div>
<label>事件 A <select id="se-event"></select></label>
<label>写出事件含义和圈选依据（自主圈选时，须逐项自行核对）<textarea id="se-event-reason"></textarea></label>
<p>点你写出的结果来圈选，再点取消。键盘 Tab 定位，Enter 或空格圈选。机器只核声明的模板；自主圈选只核计数，不认证文字与圈选相符。</p>
<div id="se-circles" class="se-circles" role="group" aria-label="圈选我的结果"></div>
<p>本局约定：A 发生甲胜，其余结果乙胜，无平局、奖惩相同；只比较获胜机会。</p>
<label>我数的 m <input id="se-m" class="se-number" inputmode="numeric" autocomplete="off"></label>
<label>我数的 n <input id="se-n" class="se-number" inputmode="numeric" autocomplete="off"></label>
<p>我约分后的概率（整数也写成分母为 1 的分数）</p>
<label>约分后分子 <input id="se-pnum" class="se-number" inputmode="numeric" autocomplete="off"></label>
<label>约分后分母 <input id="se-pden" class="se-number" inputmode="numeric" autocomplete="off"></label>
<label>双方获胜机会 <select id="se-fair"><option value="">请选择</option><option value="equal">相等</option><option value="different">不相等</option></select></label>
<div class="ctrl"><button type="button" class="btn" id="se-check">核对我的尝试</button><button type="button" class="btn ghost" id="se-reset">清空重做</button></div>
<p id="se-feedback" class="result" role="status" aria-live="polite">待你填写与圈选后核对。</p>`;
  const $ = id => root.querySelector('#se-' + id);
  let rows = [], cols = [], entries = [], selected = new Set();
  const cards = ['红1', '红2', '蓝3'];
  const dice = ['1', '2', '3', '4', '5', '6'];
  const kind = () => $('experiment').value;
  const replace = () => kind() !== 'cards' || $('replace').value === 'yes';
  const split = s => s.split(/[,，、\s]+/u).filter(Boolean);
  const pair = s => s.trim().replace(/^[（(]/u, '').replace(/[）)]$/u, '').split(/[,，]/u).map(x => x.trim()).join(',');
  function stale() { $('feedback').textContent = '草稿已变更，请重新核对。'; }
  function clearCircles() { selected.clear(); entries = []; $('circles').replaceChildren(); }
  function circles(list) {
    clearCircles(); entries = list;
    list.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ghost'; b.textContent = s || '未填路径';
      b.setAttribute('aria-pressed', 'false'); b.dataset.index = i;
      b.onclick = () => {
        if (selected.has(i)) selected.delete(i); else selected.add(i);
        b.setAttribute('aria-pressed', String(selected.has(i))); stale();
      };
      $('circles').append(b);
    });
  }
  function field(label, id) {
    const l = document.createElement('label'); l.textContent = label + ' ';
    const input = document.createElement('input'); input.id = id;
    input.autocomplete = 'off'; l.append(input); return l;
  }
  function treePaths() {
    let paths = [''];
    for (let level = 1; level <= 3; level++) {
      paths = paths.flatMap((p, i) => [0, 1].map(j => p + $('edge-' + level + '-' + (i * 2 + j)).value.trim()));
    }
    return paths;
  }
  function treeEditor() {
    $('editor').innerHTML = '<p>三层空白树：按第1、2、3枚的次序，在每条分支填“正”或“反”。同一节点的两个分支应列全且不同。缩进表示从属关系。</p>';
    function grow(parent, level, index) {
      if (level > 3) return;
      for (let j = 0; j < 2; j++) {
        const k = index * 2 + j, box = document.createElement('div'); box.className = 'se-branch';
        box.append(field('第' + level + '枚，节点' + (index + 1) + '分支' + (j + 1), 'se-edge-' + level + '-' + k));
        parent.append(box); grow(box, level + 1, k);
      }
    }
    grow($('editor'), 1, 0);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.id = 'se-paths'; b.textContent = '整理我填的路径供圈选';
    b.onclick = () => { circles(treePaths()); stale(); };
    $('editor').append(b);
  }
  function tableEditor() {
    $('editor').innerHTML = `<p>自己填写行、列标签，用逗号分隔。行代表第一步，列代表第二步。然后创建空表，逐格填有序结果，用逗号分开两项；不合法的格填 ×。不放回时剔除同一对象的格（两轴同序时在对角线）。</p>
<label>行标签 <input id="se-rows" autocomplete="off"></label><label>列标签 <input id="se-cols" autocomplete="off"></label>
<button type="button" class="btn ghost" id="se-grid">按我的标签建空表</button><div id="se-table" class="se-scroll"></div>`;
    $('grid').onclick = () => {
      rows = split($('rows').value); cols = split($('cols').value); clearCircles(); stale();
      if (!rows.length || !cols.length || rows.length > 6 || cols.length > 6) { $('feedback').textContent = '请先尝试填写两轴标签，每轴1至6项。'; return; }
      const table = document.createElement('table'), tr = document.createElement('tr');
      const corner = document.createElement('th'); corner.textContent = '第一步↓ / 第二步→'; tr.append(corner);
      cols.forEach(c => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = c; tr.append(th); }); table.append(tr);
      rows.forEach((r, i) => {
        const line = document.createElement('tr'), head = document.createElement('th'); head.scope = 'row'; head.textContent = r; line.append(head);
        cols.forEach((c, j) => {
          const td = document.createElement('td'), input = document.createElement('input');
          input.id = 'se-cell-' + i + '-' + j; input.setAttribute('aria-label', '第' + (i + 1) + '行第' + (j + 1) + '列的有序结果'); input.autocomplete = 'off'; td.append(input); line.append(td);
        }); table.append(line);
      });
      $('table').replaceChildren(table);
      const b = document.createElement('button'); b.type = 'button'; b.id = 'se-list'; b.className = 'btn ghost'; b.textContent = '整理我写的合法结果供圈选';
      b.onclick = () => { circles(rows.flatMap((r, i) => cols.map((c, j) => pair($('cell-' + i + '-' + j).value))).filter(s => s && s !== '×')); stale(); };
      $('table').append(b);
    };
  }
  function setup() {
    rows = []; cols = []; clearCircles();
    $('config').innerHTML = kind() === 'cards' ? '<label>抽卡方式 <select id="se-replace"><option value="yes">放回</option><option value="no">不放回</option></select></label>' : '';
    $('condition').textContent = kind() === 'cards' ? '三张除颜色编号外完全相同的卡：红1、红2、蓝3。每次充分洗匀后随机抽一张，记录先后。' : kind() === 'dice' ? '两枚质地均匀的骰子分为第一枚、第二枚，各掷一次，互不影响；分别记录点数。' : '三枚质地均匀的硬币编号1、2、3，各抛一次，互不影响；固定三步，同一步每个节点都有正、反两个等可能选择。';
    const options = [['', '请选择事件'], ['all', '所有合法结果'], ['none', '没有结果'], ...(kind() === 'tree' ? [['k2', '恰有两个正面'], ['ge2', '至少两个正面']] : kind() === 'dice' ? [['sum7', '两数和为7'], ['same', '两数相同']] : [['color', '两张颜色相同'], ['same', '两次同一张卡']]), ['custom', '自主圈选（只核计数）']];
    $('event').replaceChildren(...options.map(([value, text]) => new Option(text, value)));
    ['reason', 'event-reason', 'm', 'n', 'pnum', 'pden', 'model', 'fair'].forEach(id => { $(id).value = ''; });
    if (kind() === 'tree') treeEditor(); else tableEditor();
    if ($('replace')) $('replace').onchange = () => {
      clearCircles(); tableEditor(); ['m', 'n', 'pnum', 'pden', 'fair', 'reason', 'model', 'event-reason', 'event'].forEach(id => { $(id).value = ''; }); stale();
    };
    $('feedback').textContent = '待你填写与圈选后核对。';
  }
  function validEnumeration() {
    if (kind() === 'tree') {
      for (let l = 1; l <= 3; l++) for (let i = 0; i < 2 ** l; i += 2) {
        const a = $('edge-' + l + '-' + i).value.trim(), b = $('edge-' + l + '-' + (i + 1)).value.trim();
        if (![a, b].includes('正') || ![a, b].includes('反')) return false;
      }
      const paths = treePaths(); return new Set(paths).size === 8 && entries.join('|') === paths.join('|');
    }
    const labels = kind() === 'cards' ? cards : dice;
    const axesOK = axis => axis.length === labels.length && new Set(axis).size === labels.length && axis.every(x => labels.includes(x));
    if (!axesOK(rows) || !axesOK(cols) || split($('rows').value).join('|') !== rows.join('|') || split($('cols').value).join('|') !== cols.join('|')) return false;
    const legal = [];
    for (let i = 0; i < rows.length; i++) for (let j = 0; j < cols.length; j++) {
      const value = pair($('cell-' + i + '-' + j).value);
      if (!replace() && rows[i] === cols[j]) { if (value !== '×') return false; }
      else { if (value !== rows[i] + ',' + cols[j]) return false; legal.push(value); }
    }
    return legal.join('|') === entries.join('|') && new Set(legal).size === legal.length;
  }
  function hit(s) {
    const event = $('event').value, a = s.split(',');
    if (event === 'all') return true;
    if (event === 'none') return false;
    if (event === 'same') return a[0] === a[1];
    if (event === 'color') return a[0][0] === a[1][0];
    if (event === 'sum7') return Number(a[0]) + Number(a[1]) === 7;
    const heads = [...s].filter(x => x === '正').length;
    return event === 'k2' ? heads === 2 : heads >= 2;
  }
  const integer = id => /^(0|[1-9][0-9]*)$/.test($(id).value.trim()) ? Number($(id).value.trim()) : NaN;
  function gcd(a, b) { while (b) { const t = a % b; a = b; b = t; } return a; }
  $('check').onclick = () => {
    const out = $('feedback');
    if (!$('reason').value.trim() || !$('event-reason').value.trim()) { out.textContent = '先尝试写出等可能依据和事件依据；文字按准则自行核对。'; return; }
    if ($('model').value !== 'objects') { out.textContent = '等可能依据尚不成立：不能把颜色类或不规则树的末端直接等分。请回看对象编号、固定步数和同层分支条件。'; return; }
    if (!validEnumeration()) { out.textContent = '列举尚未通过：检查轴标签是否分清对象、顺序是否正确、是否漏重、不放回同一对象格是否填×；树每个节点须有正反两支。修改后重新整理供圈选。'; return; }
    if (!$('event').value) { out.textContent = '请选择事件后再圈选。'; return; }
    if ($('event').value !== 'custom' && entries.some((s, i) => hit(s) !== selected.has(i))) { out.textContent = '事件圈选有漏选或多选，请逐项对照所选事件的条件。'; return; }
    const m = selected.size, n = entries.length, g = gcd(m, n);
    if (integer('m') !== m || integer('n') !== n) { out.textContent = '计数尚未通过：m数圈中的合法结果，n数全部合法结果，两者都要填。'; return; }
    if (integer('pnum') !== m / g || integer('pden') !== n / g) { out.textContent = '约分尚未通过：把自己填写的m/n约成最简分数，0或1也写分母1。'; return; }
    if ($('fair').value !== (m * 2 === n ? 'equal' : 'different')) { out.textContent = '机会判断尚未通过：比较甲圈中的结果数与乙剩余的结果数。'; return; }
    out.textContent = ($('event').value === 'custom' ? '自主圈选的计数、约分和机会比较核对通过；程序未认证事件文字与圈选相符。' : '合法结果不重不漏，模板事件圈选、计数、约分和机会比较核对通过。') + ' 等可能与事件的文字论证仍须按题设自行或请同伴核对。';
  };
  root.addEventListener('input', e => {
    stale();
    if (e.target.closest('#se-editor')) clearCircles();
  });
  $('event').onchange = () => { selected.clear(); $('circles').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false')); stale(); };
  root.addEventListener('change', stale);
  $('experiment').onchange = setup;
  $('reset').onclick = setup;
  setup();
})();
