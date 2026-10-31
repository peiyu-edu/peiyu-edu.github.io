/* Page-local grid construction; proof writing remains a manual self-check. */
(function () {
  'use strict';
  function mount() {
    if (!document.body || document.body.dataset.sec !== 'j28-2') return;
    const root = document.getElementById('j28-workshop');
    if (!root || root.dataset.mounted === 'true') return;
    root.dataset.mounted = 'true';
    const find = (id) => root.querySelector('#' + id);
    const fields = Array.from(root.querySelectorAll('[data-jw-coord]'));
    const pointButtons = Array.from(root.querySelectorAll('[data-jw-point]'));
    const grid = find('jw-grid');
    const feedback = find('jw-feedback');
    const tasks = [
      {o: [1, 0], p: [[1, 3], [4, 2], [2, 0]]},
      {o: [0, 0], p: [[0, 0], [3, 0], [1, 2]]},
      {o: [1, -1], p: [[-2, 0], [0, 2], [3, -3]]}
    ];
    const names = ['A', 'B', 'C'];
    let taskIndex = 0, selected = 0, cursor = [0, 0], connected = false;
    // Closed ASCII grammar: one digit 0..6, optional sign, outer ASCII space/tab.
    // No normalization, eval, parseFloat, or removal of internal whitespace.
    function integer(raw) {
      const match = raw.match(/^[ \t]*[+-]?[0-6][ \t]*/);
      return match && match[0] === raw ? Number(raw) : null;
    }
    function points() {
      return names.map((_, i) => {
        const x = integer(fields[2 * i].value), y = integer(fields[2 * i + 1].value);
        return x === null || y === null ? null : [x, y];
      });
    }
    const sx = (x) => 210 + 28 * x;
    const sy = (y) => 210 - 28 * y;
    const line = (a, b, stroke, dash = '') => '<line x1="' + sx(a[0]) + '" y1="' + sy(a[1]) + '" x2="' + sx(b[0]) + '" y2="' + sy(b[1]) + '" stroke="' + stroke + '" stroke-width="2" stroke-dasharray="' + dash + '"/>';
    const polygon = (p, stroke) => '<polygon points="' + p.map((v) => sx(v[0]) + ',' + sy(v[1])).join(' ') + '" fill="none" stroke="' + stroke + '" stroke-width="3"/>';
    function dot(p, label, color) {
      return '<circle cx="' + sx(p[0]) + '" cy="' + sy(p[1]) + '" r="4" fill="' + color + '"/><text x="' + (sx(p[0]) + (p[0] > 4 ? -7 : 7)) + '" y="' + (sy(p[1]) - 9) + '" text-anchor="' + (p[0] > 4 ? 'end' : 'start') + '" fill="' + color + '" font-size="14">' + label + '</text>';
    }
    function draw() {
      const task = tasks[taskIndex], made = points();
      let h = '<rect width="420" height="420" fill="var(--card)"/>';
      for (let i = -6; i <= 6; i++) {
        h += '<line x1="' + sx(i) + '" y1="42" x2="' + sx(i) + '" y2="378" stroke="var(--line)"/>';
        h += '<line x1="42" y1="' + sy(i) + '" x2="378" y2="' + sy(i) + '" stroke="var(--line)"/>';
        h += '<text x="' + sx(i) + '" y="404" text-anchor="middle" fill="var(--muted)" font-size="12">' + i + '</text>';
        h += '<text x="12" y="' + (sy(i) + 4) + '" fill="var(--muted)" font-size="12">' + i + '</text>';
      }
      h += polygon(task.p, 'var(--fg)');
      const labels = new Map();
      function labelAt(p, label, color) {
        const key = p.join(',');
        if (labels.has(key)) labels.get(key).label += '/' + label;
        else labels.set(key, {p, label, color});
      }
      task.p.forEach((p, i) => labelAt(p, names[i], 'var(--fg)'));
      made.forEach((p, i) => {
        if (!p) return;
        h += line(task.p[i], p, 'var(--muted)', '4 4');
        labelAt(p, names[i] + '′', 'var(--accent)');
      });
      if (connected && made.every(Boolean)) h += polygon(made, 'var(--accent)');
      labelAt(task.o, 'O', 'var(--fg)');
      labels.forEach(({p, label, color}) => { h += dot(p, label, color); });
      h += '<rect x="' + (sx(cursor[0]) - 8) + '" y="' + (sy(cursor[1]) - 8) + '" width="16" height="16" fill="none" stroke="var(--fg)" stroke-width="2"/>';
      grid.innerHTML = h;
      find('jw-cursor').textContent = '待作 ' + names[selected] + '′；光标 (' + cursor.join(', ') + ')。黑实线为原图，虚线连接你作的对应点。';
    }
    function invalidate() {
      connected = false;
      feedback.textContent = '作图已改动，请重新连图、检查。';
      draw();
    }
    function place(x, y) {
      cursor = [x, y];
      fields[2 * selected].value = String(x);
      fields[2 * selected + 1].value = String(y);
      invalidate();
    }
    pointButtons.forEach((button, i) => button.addEventListener('click', () => {
      selected = i;
      pointButtons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      draw();
    }));
    fields.forEach((input) => input.addEventListener('input', invalidate));
    grid.addEventListener('click', (event) => {
      const matrix = grid.getScreenCTM();
      if (!matrix) return;
      const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      if (local.x < 42 || local.x > 378 || local.y < 42 || local.y > 378) return;
      place(Math.round((local.x - 210) / 28), Math.round((210 - local.y) / 28));
    });
    grid.addEventListener('keydown', (event) => {
      const delta = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1]}[event.key];
      if (delta) {
        event.preventDefault();
        cursor = cursor.map((v, i) => Math.max(-6, Math.min(6, v + delta[i])));
        draw();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        place(cursor[0], cursor[1]);
      }
    });
    find('jw-connect').addEventListener('click', () => {
      if (points().some((p) => p === null)) {
        feedback.textContent = '请先填好三个对应点；坐标须符合上面的整数语法。';
        return;
      }
      connected = true;
      draw();
      feedback.textContent = '已按对应顶点次序连图；请检查。';
    });
    find('jw-check').addEventListener('click', () => {
      const made = points(), task = tasks[taskIndex];
      if (made.some((p) => p === null)) {
        feedback.textContent = '尚有空白或格式不符的坐标；请按整数语法重填。';
        return;
      }
      if (!connected) {
        feedback.textContent = '请先按对应顶点次序连成整图，再检查。';
        return;
      }
      const wrong = made.findIndex((p, i) => p.some((v, j) => v + task.p[i][j] !== 2 * task.o[j]));
      feedback.textContent = wrong < 0
        ? '本题三个对应点与顺次连图核对通过。网格坐标已逐点核对 O 为中点；这不认证纸笔作品或一般性证明。'
        : names[wrong] + '′ 尚不符合条件：检查是否过 O、在反向且等距；若原顶点就是 O，应留在 O。请修改后重新连图。';
    });
    function reset() {
      fields.forEach((input) => { input.value = ''; });
      connected = false; selected = 0; cursor = [0, 0];
      pointButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === 0)));
      const task = tasks[taskIndex];
      find('jw-task').textContent = '第 ' + (taskIndex + 1) + ' 题：O(' + task.o.join(', ') + ')；' + task.p.map((p, i) => names[i] + '(' + p.join(', ') + ')').join('，') + '。作三角形 ABC 关于 O 的对称图形。';
      feedback.textContent = '待你作图；目前没有对应点。';
      draw();
    }
    find('jw-reset').addEventListener('click', reset);
    find('jw-next').addEventListener('click', () => { taskIndex = (taskIndex + 1) % tasks.length; reset(); });
    const self = find('jw-self'), proofStatus = find('jw-proof-status');
    function clearSelf() {
      self.checked = false;
      proofStatus.textContent = '尚未自核；文字不由机器判真。';
    }
    find('jw-proof').addEventListener('input', clearSelf);
    self.addEventListener('change', () => {
      proofStatus.textContent = self.checked ? '已记录你的自核声明；页面没有判定证明正确。请核对每一步理由，必要时请同伴复核。' : '尚未自核；文字不由机器判真。';
    });
    find('jw-proof-reset').addEventListener('click', () => {
      root.querySelectorAll('textarea').forEach((input) => { input.value = ''; });
      find('jw-reference').open = false;
      clearSelf();
    });
    reset();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
