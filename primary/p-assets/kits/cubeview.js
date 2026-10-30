/* 培玉 · 小学数学 — 公共教具：小正方体 3D 舞台（cubeview）。加载：<script defer src="../p-assets/kits/cubeview.js"></script>（放在 manip.js 后面）。
   登记一个 kind：cubeview。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘都能用；有「重来」。
   把小正方体摆成的物体画成能转的立体图（正投影，不近大远小）：
     · 拖动（或聚焦后按方向键）转着看；点「前面 / 左面 / 上面（/ 右面）」，舞台转到正对那个方向，
       这时画面上看到的就是那个方向的「看到的图形」；
     · 下面一排小图对照各个方向看到的图形，点小图也会转过去；默认没转过去看之前小图盖着「？」，先想再看；
     · edit：点格子给那个位置加一层（加满再点就清空），可以自己调块数；
     · target：给出前面、左面（等）要看到的图形，摆的时候逐个方向核对，connect 时还要求每块和别的块整面贴合。
     <div class="manip" data-manip="cubeview" data-cfg='{"g":[[1,1,0],[0,1,0]]}'></div>
   物体用高度表 g[排][列] 给出：g[0] 是最前面一排，每排从左往右；数是这个位置叠几层。
   cfg：
     g        高度表（单个物体）。
     objs     [{"n":"甲","g":[[…],[…]]}, …]：几个物体，出一排按钮选物体（和 g 二选一）。
     dirs     要对照的方向，默认 ["front","left","top"]；可以加 "right"。
     show     "visit"（默认）：没转过去看过的方向，小图盖着「？」；"all"：一开始全部显示。
     same     true：转到一个方向时，读数里说还有哪几个物体（objs）从这个方向看到的形状一样（平移后相同就算一样）。
     edit     true：出「摆一摆」格子按钮，每点一下这个位置加一层，到 maxH 再点清空。
     maxH     edit 时每个位置最多几层，默认 3（1–4）。
     rows, cols  edit 时底板几排几列（默认取 g 的大小；没有 g 时 2 × 3）。
     target   {"front":[2,1,2],"left":[2,1]}：每个方向每一列要看到几层（左面按看到的从左往右，也就是从后排到前排；
              右面从前排到后排；前面从左列到右列）。给了 target 就逐个方向核对。
     connect  true：还要核对每块小正方体至少有一个面和别的块整面贴合（不能孤零零地放着）。
     presets  [{"n":"最少的摆法","g":[[…],[…]]}, …]：一键摆好的按钮。
     view     起始角度 [水平转角, 俯角]，默认 [30, 25]（从右前上方看）。
   纯函数（页面和测试共用）：
     PeiyuManip.cubeViews(g)     → {front, left, right, top}，每个是 {w, h, cells:[[x, y]…], hidden, count}；
                                     x 从左往右、y 从下往上（上面看时 y=0 是最前排）；hidden 是这个方向完全被挡住的小正方体个数。
     PeiyuManip.cubeConnected(g) → 所有小正方体是否整面相连成一块。
     PeiyuManip.cubeLonely(g)    → 有几块孤零零（六个面都没贴着别的块；只有 1 块时算 0）。
     PeiyuManip.cubeCamera(yaw, pitch) → {R, U, F, V}：屏幕右、屏幕上、视线方向、指向观察者的方向。
   每次变化在根元素上抛 manip:change（detail：obj、g、count、dir、ok）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  var NS = U.NS;
  var DIR = {
    front: { name: "前面", yaw: 0, pitch: 0 },
    left: { name: "左面", yaw: -90, pitch: 0 },
    right: { name: "右面", yaw: 90, pitch: 0 },
    top: { name: "上面", yaw: 0, pitch: 90 }
  };
  var RAD = Math.PI / 180;

  /* ---------- 纯函数 ---------- */
  function dimsOf(g) {
    var R = g.length, C = 0, H = 0;
    g.forEach(function (row) { C = Math.max(C, row.length); row.forEach(function (v) { H = Math.max(H, v || 0); }); });
    return { R: R, C: C, H: H };
  }
  function at(g, r, c) { return (g[r] && g[r][c]) || 0; }
  function cubeCount(g) { var t = 0; g.forEach(function (row) { row.forEach(function (v) { t += v || 0; }); }); return t; }
  function cubeViews(g) {
    var d = dimsOf(g), R = d.R, C = d.C, r, c, l, i;
    var front = { w: C, h: d.H, cells: [], hidden: 0 }, left = { w: R, h: d.H, cells: [], hidden: 0 },
      right = { w: R, h: d.H, cells: [], hidden: 0 }, top = { w: C, h: R, cells: [], hidden: 0 };
    for (c = 0; c < C; c++) { var m = 0; for (r = 0; r < R; r++) m = Math.max(m, at(g, r, c)); for (l = 0; l < m; l++) front.cells.push([c, l]); }
    for (i = 0; i < R; i++) {
      var rl = R - 1 - i, ml = 0, mr = 0;
      for (c = 0; c < C; c++) { ml = Math.max(ml, at(g, rl, c)); mr = Math.max(mr, at(g, i, c)); }
      for (l = 0; l < ml; l++) left.cells.push([i, l]);
      for (l = 0; l < mr; l++) right.cells.push([i, l]);
    }
    for (r = 0; r < R; r++) for (c = 0; c < C; c++) if (at(g, r, c) > 0) top.cells.push([c, r]);
    for (r = 0; r < R; r++) for (c = 0; c < C; c++) for (l = 0; l < at(g, r, c); l++) {
      var k;
      for (k = 0; k < r; k++) if (at(g, k, c) > l) { front.hidden++; break; }
      for (k = 0; k < c; k++) if (at(g, r, k) > l) { left.hidden++; break; }
      for (k = c + 1; k < C; k++) if (at(g, r, k) > l) { right.hidden++; break; }
      if (l < at(g, r, c) - 1) top.hidden++;
    }
    [front, left, right, top].forEach(function (v) { v.count = v.cells.length; });
    return { front: front, left: left, right: right, top: top };
  }
  function cubeConnected(g) {
    var list = [], seen = {}, r, c, l;
    for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) for (l = 0; l < (g[r][c] || 0); l++) list.push([r, c, l]);
    if (list.length < 2) return true;
    var key = function (p) { return p.join(","); }, stack = [list[0]];
    seen[key(list[0])] = 1;
    var n = 1;
    while (stack.length) {
      var p = stack.pop();
      [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(function (d) {
        var q = [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
        if (q[2] < 0 || q[2] >= at(g, q[0], q[1]) || seen[key(q)]) return;
        seen[key(q)] = 1; n++; stack.push(q);
      });
    }
    return n === list.length;
  }
  /* 孤零零的块：六个面都没有贴着别的块 */
  function cubeLonely(g) {
    var n = 0, r, c, l;
    for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) for (l = 0; l < (g[r][c] || 0); l++) {
      var nb = l > 0 || l < g[r][c] - 1 || at(g, r - 1, c) > l || at(g, r + 1, c) > l || at(g, r, c - 1) > l || at(g, r, c + 1) > l;
      if (!nb) n++;
    }
    return cubeCount(g) < 2 ? 0 : n;
  }
  /* 世界坐标：x 向右（列）、y 向上（层）、z 向后（排）。yaw 0 是站在正前方，正值往右边转；pitch 是俯角。 */
  function cubeCamera(yaw, pitch) {
    var t = yaw * RAD, p = pitch * RAD;
    var V = [Math.sin(t) * Math.cos(p), Math.sin(p), -Math.cos(t) * Math.cos(p)];
    var F = [-V[0], -V[1], -V[2]];
    var R = [Math.cos(t), 0, Math.sin(t)];
    var Up = [F[1] * R[2] - F[2] * R[1], F[2] * R[0] - F[0] * R[2], F[0] * R[1] - F[1] * R[0]];
    return { R: R, U: Up, F: F, V: V };
  }
  function viewSig(v) {
    if (!v.cells.length) return "";
    var mx = Infinity, my = Infinity;
    v.cells.forEach(function (q) { mx = Math.min(mx, q[0]); my = Math.min(my, q[1]); });
    return v.cells.map(function (q) { return (q[0] - mx) + "," + (q[1] - my); }).sort().join(" ");
  }
  function colsOf(v) {
    var out = [];
    for (var i = 0; i < v.w; i++) out.push(0);
    v.cells.forEach(function (q) { out[q[0]] = Math.max(out[q[0]], q[1] + 1); });
    return out;
  }
  window.PeiyuManip.cubeViews = cubeViews;
  window.PeiyuManip.cubeConnected = cubeConnected;
  window.PeiyuManip.cubeLonely = cubeLonely;
  window.PeiyuManip.cubeCamera = cubeCamera;

  var CSS = '.manip[data-manip="cubeview"] svg.stage{touch-action:none;cursor:grab;max-width:520px}' +
    '.manip[data-manip="cubeview"] svg.stage:focus-visible{outline:3px solid var(--hl);outline-offset:2px}' +
    '.manip[data-manip="cubeview"] .cv-views{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0 2px}' +
    '.manip[data-manip="cubeview"] .cv-views button{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:96px;min-height:44px;padding:6px 8px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);font:inherit;font-size:15px;cursor:pointer}' +
    '.manip[data-manip="cubeview"] .cv-views button[aria-pressed="true"]{border-color:var(--a);background:var(--ok-soft);font-weight:700}' +
    '.manip[data-manip="cubeview"] .cv-views button.ok{border-color:var(--a)}' +
    '.manip[data-manip="cubeview"] .cv-views button.no{border-color:var(--no)}' +
    '.manip[data-manip="cubeview"] .cv-views button:focus-visible{outline:3px solid var(--hl);outline-offset:2px}' +
    '.manip[data-manip="cubeview"] .cv-views .cv-pair{display:flex;gap:8px;align-items:flex-end}' +
    '.manip[data-manip="cubeview"] .cv-views .cv-sub{font-size:14px;color:var(--muted);font-weight:400}' +
    '.manip[data-manip="cubeview"] .cv-views .cv-q{font-size:22px;font-weight:700;color:var(--muted);line-height:1.4}' +
    '.manip[data-manip="cubeview"] .cv-edit{display:grid;gap:6px;justify-content:center;margin:8px auto 2px}' +
    '.manip[data-manip="cubeview"] .cv-edit button{min-width:64px;min-height:44px;padding:4px 6px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);font:inherit;font-size:15px;cursor:pointer;line-height:1.3}' +
    '.manip[data-manip="cubeview"] .cv-edit button.on{background:var(--hl-soft);font-weight:700}' +
    '.manip[data-manip="cubeview"] .cv-edit button:focus-visible{outline:3px solid var(--hl);outline-offset:2px}' +
    '.manip[data-manip="cubeview"] .cv-cap{text-align:center;font-size:15px;color:var(--muted);margin:6px 0 0}';
  function injectCSS() {
    if (document.getElementById("cubeview-css")) return;
    var s = document.createElement("style"); s.id = "cubeview-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  function clone(g) { return g.map(function (row) { return row.slice(); }); }
  function blank(R, C) { var g = []; for (var r = 0; r < R; r++) { g.push([]); for (var c = 0; c < C; c++) g[r].push(0); } return g; }
  function rowName(r, R) { return R === 2 ? (r === 0 ? "前排" : "后排") : R === 3 ? ["前排", "中排", "后排"][r] : "第 " + (r + 1) + " 排（从前往后）"; }
  function colName(c, C) { return C === 2 ? ["左", "右"][c] : C === 3 ? ["左", "中", "右"][c] : "第 " + (c + 1) + " 个"; }

  function cubeview(root, cfg) {
    injectCSS();
    var objs = Array.isArray(cfg.objs) && cfg.objs.length ? cfg.objs.map(function (o, i) { return { n: o.n || "物体 " + (i + 1), g: clone(o.g) }; }) : null;
    var edit = !!cfg.edit;
    var maxH = Math.max(1, Math.min(4, cfg.maxH || 3));
    var base = objs ? objs[0].g : cfg.g ? clone(cfg.g) : null;
    var R0 = cfg.rows || (base ? base.length : 2), C0 = cfg.cols || (base ? dimsOf(base).C : 3);
    var start = base ? clone(base) : blank(R0, C0);
    var dirs = (Array.isArray(cfg.dirs) && cfg.dirs.length ? cfg.dirs : ["front", "left", "top"]).filter(function (d) { return DIR[d]; });
    if (cfg.target) Object.keys(cfg.target).forEach(function (d) { if (DIR[d] && dirs.indexOf(d) < 0) dirs.push(d); });
    var showAll = cfg.show === "all" || !!cfg.target;
    var view0 = Array.isArray(cfg.view) ? cfg.view : [30, 25];
    var st = { obj: 0, g: clone(start), yaw: view0[0], pitch: view0[1], dir: null, seen: {}, anim: 0 };
    var W = 360, HS = 250;

    while (root.firstChild) root.removeChild(root.firstChild);
    var objBox = null;
    if (objs && objs.length > 1) {
      objBox = U.h("div", "ctrls"); objBox.setAttribute("role", "group"); objBox.setAttribute("aria-label", "选一个物体");
      objs.forEach(function (o, i) { objBox.appendChild(U.btn(o.n, function () { pickObj(i); }, "物体 " + o.n)); });
      root.appendChild(objBox);
    }
    var svg = U.el("svg", { class: "stage", viewBox: "0 0 " + W + " " + HS, role: "img", tabindex: "0",
      "aria-label": "小正方体摆成的物体，拖动或按方向键可以转着看" });
    root.appendChild(svg);
    var dirBox = U.h("div", "ctrls"); dirBox.setAttribute("role", "group"); dirBox.setAttribute("aria-label", "转到一个方向");
    var dirBtns = {};
    dirs.forEach(function (d) { dirBtns[d] = dirBox.appendChild(U.btn("转到" + DIR[d].name, function () { turnTo(d); }, "转到" + DIR[d].name + "，正对着看")); });
    dirBtns.free = dirBox.appendChild(U.btn("斜着看", function () { turnTo(null); }, "转回斜着看的样子"));
    root.appendChild(dirBox);
    var viewBox = U.h("div", "cv-views"); viewBox.setAttribute("role", "group"); viewBox.setAttribute("aria-label", "各个方向看到的图形");
    root.appendChild(viewBox);
    var editBox = null, editBtns = [];
    if (edit) {
      var cap = U.h("p", "cv-cap", "摆一摆：点一个位置加一层（上面是后排，下面是前排）");
      root.appendChild(cap);
      editBox = U.h("div", "cv-edit"); editBox.setAttribute("role", "group"); editBox.setAttribute("aria-label", "摆小正方体的位置");
      root.appendChild(editBox);
    }
    var ctl = U.h("div", "ctrls");
    (Array.isArray(cfg.presets) ? cfg.presets : []).forEach(function (p) {
      ctl.appendChild(U.btn(p.n, function () { st.g = clone(p.g); fixDims(); draw(true); }));
    });
    ctl.appendChild(U.btn("重来", reset));
    root.appendChild(ctl);
    var read = U.h("p", "read"); read.setAttribute("aria-live", "polite");
    root.appendChild(read);

    function fixDims() {
      if (!edit) return;
      var g = blank(R0, C0);
      for (var r = 0; r < R0; r++) for (var c = 0; c < C0; c++) g[r][c] = Math.min(maxH, at(st.g, r, c));
      st.g = g;
    }
    fixDims();
    function buildEdit() {
      if (!editBox) return;
      while (editBox.firstChild) editBox.removeChild(editBox.firstChild);
      editBox.style.gridTemplateColumns = "repeat(" + C0 + ", auto)";
      editBtns = [];
      for (var r = R0 - 1; r >= 0; r--) for (var c = 0; c < C0; c++) (function (r, c) {
        var b = U.btn("", function () { st.g[r][c] = (st.g[r][c] + 1) % (maxH + 1); draw(true); });
        b.dataset.r = r; b.dataset.c = c;
        editBox.appendChild(b); editBtns.push(b);
      })(r, c);
    }
    buildEdit();

    function pickObj(i) { st.obj = i; st.g = clone(objs[i].g); st.seen = {}; if (st.dir) st.seen[st.dir] = 1; draw(true); }
    function reset() {
      stop();
      st.obj = 0; st.g = clone(start); fixDims(); st.yaw = view0[0]; st.pitch = view0[1]; st.dir = null; st.seen = {};
      draw(true);
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function turnTo(d) {
      var ty = d ? DIR[d].yaw : view0[0], tp = d ? DIR[d].pitch : view0[1];
      var y0 = st.yaw, p0 = st.pitch;
      var dy = ((ty - y0) % 360 + 540) % 360 - 180;
      stop();
      var finish = function () { stop(); st.yaw = y0 + dy; st.pitch = tp; st.dir = d; if (d) st.seen[d] = 1; draw(true); };
      if (reduce || !window.requestAnimationFrame) { finish(); return; }
      var t0 = null, T = 420;
      st.dir = null;
      var stepA = function (ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / T), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        st.yaw = y0 + dy * e; st.pitch = p0 + (tp - p0) * e;
        if (k < 1) { draw(false); st.anim = requestAnimationFrame(stepA); } else finish();
      };
      st.anim = requestAnimationFrame(stepA);
      /* 标签页在后台时浏览器不跑动画帧：到时间直接转到位 */
      st.guard = setTimeout(finish, T + 250);
    }
    function stop() { cancelAnimationFrame(st.anim); clearTimeout(st.guard); }

    /* 拖动转视角 */
    var drag = null;
    svg.addEventListener("pointerdown", function (e) {
      stop();
      drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch, moved: false };
      try { svg.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      st.yaw = drag.yaw + dx * 0.6; st.pitch = Math.max(0, Math.min(90, drag.pitch + dy * 0.5));
      st.dir = snapDir(); if (st.dir) st.seen[st.dir] = 1;
      draw(false);
    });
    var endDrag = function () { if (drag) { drag = null; draw(true); } };
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    svg.addEventListener("keydown", function (e) {
      var k = e.key, step = 15;
      if (k === "ArrowLeft") st.yaw -= step; else if (k === "ArrowRight") st.yaw += step;
      else if (k === "ArrowUp") st.pitch = Math.min(90, st.pitch + step); else if (k === "ArrowDown") st.pitch = Math.max(0, st.pitch - step);
      else return;
      e.preventDefault(); stop();
      st.dir = snapDir(); if (st.dir) st.seen[st.dir] = 1;
      draw(true);
    });
    function snapDir() {
      var y = ((st.yaw % 360) + 540) % 360 - 180;
      if (st.pitch >= 87) return dirs.indexOf("top") >= 0 ? "top" : null;
      if (st.pitch > 3) return null;
      var best = null;
      ["front", "left", "right"].forEach(function (d) { if (dirs.indexOf(d) >= 0 && Math.abs(((y - DIR[d].yaw) % 360 + 540) % 360 - 180) <= 3) best = d; });
      return best;
    }

    /* ---------- 画立体 ---------- */
    function P(cam, C, s, ox, oy, p) {
      var q = [p[0] - C[0], p[1] - C[1], p[2] - C[2]];
      return [ox + s * (q[0] * cam.R[0] + q[1] * cam.R[1] + q[2] * cam.R[2]), oy - s * (q[0] * cam.U[0] + q[1] * cam.U[1] + q[2] * cam.U[2])];
    }
    var FACES = [
      { n: [0, 0, -1], k: "z", v: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], nb: [-1, 0, 0] },
      { n: [0, 0, 1], k: "z", v: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]], nb: [1, 0, 0] },
      { n: [-1, 0, 0], k: "x", v: [[0, 0, 1], [0, 0, 0], [0, 1, 0], [0, 1, 1]], nb: [0, -1, 0] },
      { n: [1, 0, 0], k: "x", v: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]], nb: [0, 1, 0] },
      { n: [0, 1, 0], k: "y", v: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], nb: [0, 0, 1] },
      { n: [0, -1, 0], k: "y", v: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]], nb: [0, 0, -1] }
    ];
    var FILL = { z: "var(--hl-soft)", x: "var(--line)", y: "var(--ok-soft)" };
    function frame() {
      var R = edit ? R0 : st.g.length, C = edit ? C0 : dimsOf(st.g).C, H = Math.max(edit ? maxH : dimsOf(st.g).H, 1);
      if (objs) objs.forEach(function (o) { var d = dimsOf(o.g); R = Math.max(R, d.R); C = Math.max(C, d.C); H = Math.max(H, d.H); });
      var rad = 0.5 * Math.sqrt(R * R + C * C + H * H);
      var s = Math.min((HS - 64) / (2 * rad), (W - 70) / (2 * rad), 58);
      return { R: R, C: C, H: H, s: s, ctr: [C / 2, H / 2, R / 2], ox: W / 2, oy: HS / 2 - 8 };
    }
    function draw(full) {
      var g = st.g, cam = cubeCamera(st.yaw, st.pitch), fr = frame(), s = fr.s, C = fr.ctr;
      var pr = function (p) { return P(cam, C, s, fr.ox, fr.oy, p); };
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      /* 底板：每个位置一格虚线 */
      var gr, gc, gp;
      for (gr = 0; gr < fr.R; gr++) for (gc = 0; gc < fr.C; gc++) {
        if (!edit && !(gr < g.length && gc < g[gr].length)) continue;
        gp = [[gc, 0, gr], [gc + 1, 0, gr], [gc + 1, 0, gr + 1], [gc, 0, gr + 1]].map(pr);
        U.el("path", { d: "M" + gp.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join("L") + "Z",
          style: "fill:none;stroke:var(--dim);stroke-width:1;stroke-dasharray:3 3" }, svg);
      }
      /* 小正方体：从远到近画；每块只画朝向观察者、旁边没有别的块的面 */
      var cubes = [], r, c, l;
      for (r = 0; r < g.length; r++) for (c = 0; c < g[r].length; c++) for (l = 0; l < (g[r][c] || 0); l++) cubes.push([r, c, l]);
      cubes.forEach(function (q) { q.d = (q[1] + 0.5 - C[0]) * cam.F[0] + (q[2] + 0.5 - C[1]) * cam.F[1] + (q[0] + 0.5 - C[2]) * cam.F[2]; });
      cubes.sort(function (a, b) { return b.d - a.d; });
      var EPS = 1e-6;
      cubes.forEach(function (q) {
        var r0 = q[0], c0 = q[1], l0 = q[2];
        FACES.forEach(function (f) {
          var dot = f.n[0] * cam.V[0] + f.n[1] * cam.V[1] + f.n[2] * cam.V[2];
          if (dot <= EPS) return;
          if (at(g, r0 + f.nb[0], c0 + f.nb[1]) > l0 + f.nb[2] && l0 + f.nb[2] >= 0) return;
          var pts = f.v.map(function (v) { return pr([c0 + v[0], l0 + v[1], r0 + v[2]]); });
          U.el("path", { d: "M" + pts.map(function (p2) { return p2[0].toFixed(2) + "," + p2[1].toFixed(2); }).join("L") + "Z",
            "data-k": r0 + "," + c0 + "," + l0 + "," + f.k,
            style: "fill:" + FILL[f.k] + ";stroke:var(--fg);stroke-width:1.5;stroke-linejoin:round" }, svg);
        });
      });
      /* 方向标记 */
      var g0 = pr([fr.C / 2, 0, fr.R / 2]);
      var lab = function (p, t) {
        var q = pr(p), ex = q[0] - g0[0], ey = q[1] - g0[1], L = Math.sqrt(ex * ex + ey * ey);
        if (L > 8) { q = [q[0] + ex / L * 16, q[1] + ey / L * 16 + 6]; } else q = [q[0], q[1] + 22];
        var tx = U.el("text", { x: q[0].toFixed(1), y: q[1].toFixed(1), "text-anchor": "middle",
          style: "fill:var(--muted);font-size:20px;font-weight:700" }, svg);
        tx.textContent = t;
      };
      lab([fr.C / 2, 0, -0.2], "前");
      lab([-0.2, 0, fr.R / 2], "左");
      svg.__cv = { cam: cam, s: s, ctr: C, ox: fr.ox, oy: fr.oy };
      if (full) panels();
      sync();
    }

    /* ---------- 各方向看到的图形 ---------- */
    function mini(v, ref, cell) {
      var w = Math.max(v.w, ref ? ref.w : 0, 1), hh = Math.max(v.h, ref ? ref.h : 0, 1), Z = cell || 22;
      var m = U.el("svg", { viewBox: "0 0 " + (w * Z + 4) + " " + (hh * Z + 4), width: w * Z + 4, height: hh * Z + 4, "aria-hidden": "true" });
      for (var a = 0; a < w; a++) for (var b = 0; b < hh; b++)
        U.el("rect", { x: 2 + a * Z, y: 2 + (hh - 1 - b) * Z, width: Z, height: Z, style: "fill:none;stroke:var(--line);stroke-width:1;stroke-dasharray:2 2" }, m);
      v.cells.forEach(function (q) {
        U.el("rect", { x: 2 + q[0] * Z, y: 2 + (hh - 1 - q[1]) * Z, width: Z, height: Z, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:1.5" }, m);
      });
      return m;
    }
    function targetView(d) {
      var t = cfg.target[d], cells = [], hmax = 0;
      t.forEach(function (n, i) { for (var l = 0; l < n; l++) cells.push([i, l]); hmax = Math.max(hmax, n); });
      return { w: t.length, h: hmax, cells: cells };
    }
    function check() {
      if (!cfg.target) return null;
      var vs = cubeViews(st.g), res = { all: true, by: {} };
      Object.keys(cfg.target).forEach(function (d) {
        var got = colsOf(vs[d]), want = cfg.target[d], ok = want.length === got.length && want.every(function (n, i) { return n === got[i]; });
        res.by[d] = ok; if (!ok) res.all = false;
      });
      res.lonely = cubeLonely(st.g);
      return res;
    }
    var viewBtns = {};
    function panels() {
      var vs = cubeViews(st.g), chk = check();
      /* 按钮节点只建一次，之后只换里面的内容：重建会让键盘焦点丢到 body */
      dirs.forEach(function (d) {
        var b = viewBtns[d];
        if (!b) {
          b = U.h("button"); b.type = "button";
          b.addEventListener("click", function () { turnTo(d); });
          viewBox.appendChild(b); viewBtns[d] = b;
        }
        while (b.firstChild) b.removeChild(b.firstChild);
        b.className = "";
        var open = showAll || st.seen[d];
        var title = U.h("span", "", "从" + DIR[d].name + "看");
        b.appendChild(title);
        if (!open) {
          b.appendChild(U.h("span", "cv-q", "？"));
          b.appendChild(U.h("span", "cv-sub", "先想，再转过去"));
          b.setAttribute("aria-label", "从" + DIR[d].name + "看：还没看，点一下转过去");
        } else if (chk && cfg.target[d]) {
          var pair = U.h("span", "cv-pair");
          var w1 = U.h("span"); w1.appendChild(mini(targetView(d), vs[d])); w1.appendChild(U.h("span", "cv-sub", "<br>要求"));
          var w2 = U.h("span"); w2.appendChild(mini(vs[d], targetView(d))); w2.appendChild(U.h("span", "cv-sub", "<br>你摆的"));
          pair.appendChild(w1); pair.appendChild(w2); b.appendChild(pair);
          b.appendChild(U.h("span", "cv-sub", chk.by[d] ? "对上了" : "还没对上"));
          b.className = chk.by[d] ? "ok" : "no";
          b.setAttribute("aria-label", "从" + DIR[d].name + "看：" + (chk.by[d] ? "和要求一样" : "和要求还不一样") + "，点一下转过去");
        } else {
          b.appendChild(mini(vs[d]));
          b.appendChild(U.h("span", "cv-sub", vs[d].count + " 个方格"));
          b.setAttribute("aria-label", "从" + DIR[d].name + "看：" + vs[d].count + " 个方格，点一下转过去");
        }
      });
      if (editBtns.length) editBtns.forEach(function (b) {
        var r = +b.dataset.r, c = +b.dataset.c, n = st.g[r][c];
        b.innerHTML = rowName(r, R0) + colName(c, C0) + "<br><b>" + n + "</b> 层";
        b.className = n ? "on" : "";
        b.setAttribute("aria-label", rowName(r, R0) + colName(c, C0) + "：" + n + " 层，点一下加一层");
      });
      if (objBox) [].forEach.call(objBox.children, function (b, i) { b.setAttribute("aria-pressed", i === st.obj ? "true" : "false"); });
      readout(vs, chk);
    }
    function readout(vs, chk) {
      var n = cubeCount(st.g), d = st.dir, msg, cls = "";
      var who = objs ? objs[st.obj].n + "：" : "";
      if (chk) {
        var parts = Object.keys(cfg.target).map(function (k) { return DIR[k].name + "看" + (chk.by[k] ? "对了" : "还不对"); });
        msg = parts.join("，") + "，共 " + n + " 块。";
        if (n && cfg.connect && chk.lonely) msg += "有 " + chk.lonely + " 块孤零零的，没有面和别的块整面贴合，不合要求。";
        else if (chk.all && n) { msg += "符合要求。"; cls = "ok"; }
      } else if (!d) {
        msg = who + "用了 " + n + " 个小正方体。拖一拖可以转着看；点「转到…」正对着看。";
      } else {
        var v = vs[d];
        msg = who + "从" + DIR[d].name + "看，看到 " + v.count + " 个方格；" + (v.hidden ? "有 " + v.hidden + " 个小正方体被挡住，看不到。" : "每个小正方体都看得到。");
        cls = "ok";
        if (cfg.same && objs) {
          var sig = viewSig(v), same = [];
          objs.forEach(function (o, i) { if (i !== st.obj && viewSig(cubeViews(o.g)[d]) === sig) same.push(o.n); });
          msg += same.length ? "从" + DIR[d].name + "看，" + same.join("、") + "看到的形状和它一样。" : "从" + DIR[d].name + "看，别的物体看到的形状都和它不一样。";
        }
      }
      read.className = "read" + (cls ? " " + cls : "");
      read.textContent = msg;
      U.emit(root, { obj: st.obj, g: clone(st.g), count: n, dir: d, ok: chk ? chk.all && (!cfg.connect || !chk.lonely) : null });
    }
    var lastDir;
    function sync() {
      Object.keys(dirBtns).forEach(function (k) { dirBtns[k].setAttribute("aria-pressed", (k === "free" ? st.dir === null && st.yaw === view0[0] && st.pitch === view0[1] : st.dir === k) ? "true" : "false"); });
      Object.keys(viewBtns).forEach(function (k) { viewBtns[k].setAttribute("aria-pressed", st.dir === k ? "true" : "false"); });
      if (st.dir !== lastDir) { lastDir = st.dir; panels(); }
    }
    draw(true);
  }
  window.PeiyuManip.register("cubeview", cubeview);
})();
