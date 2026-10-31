/* j9-2 only. Disposable paper-measurement notes and student-designed formations. */
(function () {
  'use strict';
  // Return hundredths, so a decimal multiplication is checked without rounding.
  function hundredths(raw) {
    var s = String(raw).trim();
    if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(s)) return null;
    var parts = s.split('.');
    return Number(parts[0]) * 100 + Number(((parts[1] || '') + '00').slice(0, 2));
  }
  function integer(raw, limit) {
    var s = String(raw).trim().replace(/−/g, '-');
    if (!/^[+-]?\d{1,2}$/.test(s)) return null;
    var n = Number(s);
    return Math.abs(n) <= limit ? n : null;
  }
  function design(raw, dxRaw, dyRaw) {
    var lines = String(raw).trim().split(/\r?\n/);
    if (lines.length < 2 || lines.length > 6) throw Error('请填写 2～6 行演员位置，每行一个代号和一对整数坐标。');
    var ids = new Set(), positions = new Set();
    var points = lines.map(function (line) {
      var bits = line.split(',').map(function (s) { return s.trim(); });
      if (bits.length !== 3 || !/^P[1-6]$/.test(bits[0])) throw Error('每行只用 P1～P6 代号和两个英文逗号，不填写真实姓名或地址。');
      var x = integer(bits[1], 4), y = integer(bits[2], 4);
      if (x === null || y === null) throw Error('原坐标须为 −4～4 的整数，不填分数、单位或算式。');
      if (ids.has(bits[0]) || positions.has(x + ',' + y)) throw Error('演员代号和原位置都不能重复。');
      ids.add(bits[0]); positions.add(x + ',' + y);
      return {id: bits[0], x: x, y: y};
    });
    var dx = integer(dxRaw, 3), dy = integer(dyRaw, 3);
    if (dx === null || dy === null) throw Error('全体横、纵位移须为 −3～3 的整数，0 也要填写。');
    return {points: points, dx: dx, dy: dy};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {hundredths: hundredths, integer: integer, design: design};
  if (typeof document === 'undefined' || !document.getElementById('j92-island-mount')) return;
  document.getElementById('j92-island-mount').innerHTML = `<h3>先自己做 ③：双海岛，先作图再测量</h3>
<div class="card j92-task" id="j92-islands">
<p>在一张<b>虚构海图</b>上，观测站 O 的正北方向朝纸面上方。海岛 B 在 O 的<b>北偏东 35°</b>方向，距 O <b>8 km</b>；海岛 C 在 O 的<b>北偏西 55°</b>方向，距 O <b>6 km</b>。不求精确距离，用直尺、量角器作图与测量估计两岛间的距离。</p>
<ol>
<li>先在纸上画 O 和南北、东西方向线，徒手画两条大致方向的射线，标清 B、C 应在哪一侧。</li>
<li>选择下方比例尺，自己算出 OB、OC 应画多少厘米并记在纸边。用量角器从正北分别向东量 35°、向西量 55°，画射线；用直尺在射线上截取相应长度，标出 B、C，再连接 BC。保留这张图。</li>
<li>用纸尺量 BC（建议读到 0.1 cm），记录图距，再根据同一比例尺<b>自己换算</b>实际距离；结果写“约”。不要用屏幕上的显示厘米代替纸尺实测。</li>
<li>估计一次读数可能相差多少厘米，换算为距离误差。重新量一次，并说明比例尺大小、画角、端点与读尺怎样影响结果。这里的读数误差估计不包含全部作图误差。</li>
</ol>
<form id="j92-island-form" novalidate>
<label>作图比例尺 <select id="j92-scale"><option value="2">图上 1 cm 代表实际 2 km（1∶200000）</option><option value="3">图上 1 cm 代表实际 3 km（1∶300000）</option></select></label>
<p class="small">换比例尺需要重新作图、测量。下面只整理你报告的纸笔记录，不认证实际作图或测量已经完成。</p>
<div class="j92-controls">
<label>我量得 BC 图距（cm）<input id="j92-length" inputmode="decimal" autocomplete="off"></label>
<label>我换算的两岛距离，约（km）<input id="j92-distance" inputmode="decimal" autocomplete="off"></label>
<label>我估计读数最多相差（cm）<input id="j92-read-error" inputmode="decimal" autocomplete="off"></label>
<label>对应距离最多相差（km）<input id="j92-km-error" inputmode="decimal" autocomplete="off"></label>
</div>
<label>我的测量与误差说明：纸边 OB、OC 长度；第二次 BC 读数；哪些步骤可能导致偏差？<textarea id="j92-island-note" rows="3" maxlength="600"></textarea></label>
<p class="small">数字填普通非负小数，最多两位小数（不填单位或算式）；BC 图距须大于 0 且不超过 10 cm，读数误差须大于 0 且不超过 0.5 cm。此任务只用作图、测量与比例尺换算，不用勾股或三角函数求精确值。</p>
<button class="btn" type="submit">核对换算，整理测量记录</button>
</form>
<p id="j92-island-status" class="j92-status" role="status" aria-live="polite"></p>
<p class="small">说明自行核对：两条射线是否从正北量起、分居东西？OB、OC 是否用了同一比例尺？第二次读数与第一次接近吗？距离是否写了“约”和 km？能说出至少一种作图误差和一种读数误差吗？页面只核对两次乘法；文字与纸笔作品请按以上准则自查。</p>
</div>
`;
  document.getElementById('j92-formation-mount').innerHTML = `<h3>先自己做 ④：设计演员点阵与统一位移</h3>
<div class="card j92-task" id="j92-formation">
<p>给 2～6 位<b>虚构演员</b>设计舞台点阵，也可以用四点排成方阵。只用代号 P1～P6，不填写真实人名、学校或地址。舞台每格 1 个单位，x 向右、y 向上。先设计原位置和全体统一的位移，再独立填写新位置。</p>
<form id="j92-design-form" novalidate>
<label>原点阵，每行“代号, 横坐标, 纵坐标”（英文逗号）<textarea id="j92-design-points" rows="6" maxlength="180" spellcheck="false" placeholder="自行填写 2～6 行；例如一行可写 P1, -2, 1"></textarea></label>
<p class="small">每个原坐标为 −4～4 的整数；代号、位置都不能重复。位移为 −3～3 的整数，正表示右或上，负表示左或下；允许 (0, 0) 比较原新阵重合。改设计后旧作答和旧作品立即清除。</p>
<div class="j92-controls">
<label>全体横向位移 <input id="j92-design-dx" inputmode="numeric" value="" autocomplete="off"></label>
<label>全体纵向位移 <input id="j92-design-dy" inputmode="numeric" value="" autocomplete="off"></label>
</div>
<label>设计说明：为什么这样排？原点和两轴怎样约定？统一位移表示什么，怎样保持队形？<textarea id="j92-design-note" rows="3" maxlength="500"></textarea></label>
<button class="btn" type="submit">确定原阵，开始填写新位置</button>
</form>
<p id="j92-design-status" class="j92-status" role="status" aria-live="polite"></p>
<div id="j92-formation-work" hidden>
<svg id="j92-formation-fig" class="fig" viewBox="0 0 480 480" role="img" aria-label="自编演员点阵坐标图，原阵用圆点，新阵核对后用方框"></svg>
<form id="j92-formation-form" novalidate>
<table><thead><tr><th scope="col">代号与原位置</th><th scope="col">新横坐标</th><th scope="col">新纵坐标</th></tr></thead><tbody id="j92-formation-rows"></tbody></table>
<button class="btn" type="submit">核对新位置并生成我的作品</button>
</form>
<p id="j92-formation-status" class="j92-status" role="status" aria-live="polite"></p>
<div id="j92-formation-art" hidden>
<p><b>我的队形作品</b>：圆点为原阵，方框为新阵。图形位置相邻时，以坐标表区分代号。</p>
<table><thead><tr><th scope="col">代号</th><th scope="col">原位置</th><th scope="col">新位置</th></tr></thead><tbody id="j92-art-rows"></tbody></table>
<p id="j92-art-note" style="white-space:pre-wrap;overflow-wrap:anywhere"></p>
<p class="small">坐标已核对；说明未自动评为正确。请自查：原点、方向、单位是否齐全？每人是否用了同一位移？能否用一对演员前后的横、纵坐标差说明相对位置不变？本作品只在当前页面临时显示，可自行抄画留存。</p>
</div>
</div>
</div>
`;
  var $ = function (id) { return document.getElementById(id); }, current = null;
  function text(parent, tag, value) {
    var e = document.createElement(tag); e.textContent = value; parent.appendChild(e); return e;
  }
  function clearIsland() { $('j92-island-status').textContent = ''; }
  $('j92-island-form').addEventListener('input', clearIsland);
  $('j92-scale').addEventListener('change', function () {
    ['j92-length', 'j92-distance', 'j92-read-error', 'j92-km-error', 'j92-island-note'].forEach(function (id) { $(id).value = ''; });
    $('j92-island-status').textContent = '已换比例尺：请重新作图和测量，原记录已清空。';
  });
  $('j92-island-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var scale = Number($('j92-scale').value), length = hundredths($('j92-length').value), distance = hundredths($('j92-distance').value);
    var error = hundredths($('j92-read-error').value), kmError = hundredths($('j92-km-error').value), status = $('j92-island-status');
    if (![2, 3].includes(scale) || length === null || length <= 0 || length > 1000 || distance === null || error === null || error <= 0 || error > 50 || kmError === null) {
      status.textContent = '请按范围填写四个普通小数，最多两位小数；不要加单位、算式或其他文字。'; return;
    }
    if (distance !== length * scale || kmError !== error * scale) {
      status.textContent = '换算尚不一致。图距和读数误差都要分别乘“1 cm 代表的 km 数”，再检查 cm、km 单位。'; return;
    }
    if (!$('j92-island-note').value.trim()) { status.textContent = '乘法换算一致。请再填写作图长度、第二次读数和误差说明，按下方准则自查。'; return; }
    status.textContent = '换算一致（仅核乘法）：你报告图距 ' + length / 100 + ' cm，按 1 cm 代表 ' + scale + ' km，估计两岛相距约 ' + distance / 100 +
      ' km。按你估计的读数误差，对应距离误差约不超过 ' + kmError / 100 + ' km；未计全部作图误差。这不是精确答案，也未核实图画得准或已实测。你的说明：' + $('j92-island-note').value.trim();
  });
  function clearArt() {
    $('j92-formation-art').hidden = true;
    $('j92-art-rows').replaceChildren(); $('j92-art-note').textContent = '';
    $('j92-formation-status').textContent = '';
    if (current) draw(false);
  }
  function clearDesign() {
    current = null; clearArt(); $('j92-formation-work').hidden = true;
    $('j92-formation-fig').replaceChildren(); $('j92-formation-rows').replaceChildren();
    $('j92-design-status').textContent = '设计已修改，请重新确定原阵；旧作答与作品已清除。';
  }
  $('j92-design-form').addEventListener('input', clearDesign);
  var ns = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs) {
    var e = document.createElementNS(ns, tag);
    Object.keys(attrs).forEach(function (key) { e.setAttribute(key, attrs[key]); });
    $('j92-formation-fig').appendChild(e); return e;
  }
  function draw(moved) {
    $('j92-formation-fig').replaceChildren();
    var X = function (v) { return 240 + 26 * v; }, Y = function (v) { return 240 - 26 * v; };
    for (var i = -8; i <= 8; i++) {
      svg('line', {x1: X(i), y1: Y(8), x2: X(i), y2: Y(-8), stroke: i === 0 ? 'var(--fg)' : 'var(--line)'});
      svg('line', {x1: X(-8), y1: Y(i), x2: X(8), y2: Y(i), stroke: i === 0 ? 'var(--fg)' : 'var(--line)'});
      if (i !== 0 && i % 2 === 0) {
        svg('text', {x: X(i), y: 257, fill: 'var(--muted)', 'font-size': 13, 'text-anchor': 'middle'}).textContent = i;
        svg('text', {x: 234, y: Y(i) + 4, fill: 'var(--muted)', 'font-size': 13, 'text-anchor': 'end'}).textContent = i;
      }
    }
    [['x →', 449, 235], ['y ↑', 242, 23], ['O', 226, 257]].forEach(function (v) {
      svg('text', {x: v[1], y: v[2], fill: 'var(--fg)', 'font-size': 15}).textContent = v[0];
    });
    current.points.forEach(function (p) {
      svg('circle', {cx: X(p.x), cy: Y(p.y), r: 5, fill: 'var(--a)'});
      svg('text', {x: X(p.x) + 7, y: Y(p.y) - 8, fill: 'var(--fg)', 'font-size': 14}).textContent = p.id;
      if (moved) {
        svg('rect', {class: 'j92-new-actor', x: X(p.x + current.dx) - 7, y: Y(p.y + current.dy) - 7, width: 14, height: 14, fill: 'none', stroke: 'var(--no)', 'stroke-width': 2});
        svg('text', {x: X(p.x + current.dx) + 8, y: Y(p.y + current.dy) + 17, fill: 'var(--fg)', 'font-size': 14}).textContent = p.id + '′';
      }
    });
  }
  $('j92-design-form').addEventListener('submit', function (ev) {
    ev.preventDefault(); clearDesign();
    try { current = design($('j92-design-points').value, $('j92-design-dx').value, $('j92-design-dy').value); }
    catch (error) { $('j92-design-status').textContent = error.message; return; }
    if (!$('j92-design-note').value.trim()) { current = null; $('j92-design-status').textContent = '请先写设计说明，之后按作品下的准则自查；说明不自动判对。'; return; }
    $('j92-design-status').textContent = '原阵已确定。请独立填新坐标；新阵与作品表暂不显示。';
    current.points.forEach(function (p) {
      var row = document.createElement('tr'); $('j92-formation-rows').appendChild(row);
      var head = text(row, 'th', p.id + ' (' + p.x + ', ' + p.y + ')'); head.scope = 'row';
      ['x', 'y'].forEach(function (axis) {
        var cell = document.createElement('td'), input = document.createElement('input'); row.appendChild(cell); cell.appendChild(input);
        input.id = 'j92-new-' + p.id + '-' + axis; input.inputMode = 'numeric'; input.autocomplete = 'off';
        input.setAttribute('aria-label', p.id + ' 的新' + (axis === 'x' ? '横' : '纵') + '坐标');
      });
    });
    $('j92-formation-work').hidden = false; draw(false);
  });
  $('j92-formation-form').addEventListener('input', function (ev) { ev.target.removeAttribute('aria-invalid'); clearArt(); });
  $('j92-formation-form').addEventListener('submit', function (ev) {
    ev.preventDefault(); clearArt(); if (!current) return;
    var issues = [];
    current.points.forEach(function (p) {
      ['x', 'y'].forEach(function (axis) {
        var input = $('j92-new-' + p.id + '-' + axis), value = integer(input.value, 7), expected = p[axis] + (axis === 'x' ? current.dx : current.dy);
        var valid = value !== null && value === expected; input.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if (!valid) issues.push(p.id + ' 的' + (axis === 'x' ? '横' : '纵') + '坐标');
      });
    });
    if (issues.length) { $('j92-formation-status').textContent = '请检查：' + issues.join('、') + '。每个演员都用原坐标加同一个位移，不把位移当成新坐标。'; return; }
    draw(true);
    current.points.forEach(function (p) {
      var row = document.createElement('tr'); $('j92-art-rows').appendChild(row);
      var head = text(row, 'th', p.id); head.scope = 'row';
      text(row, 'td', '(' + p.x + ', ' + p.y + ')'); text(row, 'td', '(' + (p.x + current.dx) + ', ' + (p.y + current.dy) + ')');
    });
    $('j92-art-note').textContent = '统一位移：横向 ' + current.dx + '，纵向 ' + current.dy + '。\n我的设计说明：' + $('j92-design-note').value.trim();
    $('j92-formation-status').textContent = '所有演员的新坐标一致符合所选位移。' + (current.dx === 0 && current.dy === 0 ? '此次位移为零，新旧阵重合。' : '已生成原阵与新阵。');
    $('j92-formation-art').hidden = false;
  });
})();
