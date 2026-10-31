/* angleline: reusable geometry experiments extracted from p3a-u5-1/2/3/4.
 * Read-only reuse references: p4a-u2-1/2/3 (measurement/drawing), p4a-u5
 * (triangle alignment). Existing lessons are not migrated by this module.
 * Load primary.js, manip.js, then this file; data-manip="angleline".
 * cfg (JSON object, all optional):
 *   preset: exact authored source behavior, takes precedence over mode/options:
 *     p3a-u5-1:lines|points|distance; p3a-u5-2:compare|construct;
 *     p3a-u5-3:angle|right; p3a-u5-4:classify|combine.
 *     Example: {"preset":"p3a-u5-1:points"}. No source DOM IDs are queried;
 *     keep the original root id in the lesson. Each mount owns its state.
 *     Presets retain authored numbers, drawings/aria, controls, per-task reset,
 *     dynamic say and interact.what payloads. combine includes ordered counting.
 *     Their manip:change payload is {mode,preset,...originalState}; no answer
 *     IDs or learning writes are added. Unknown presets use normal mode/defaults.
 *   mode: "lines" (default), "points", "distance", "compass", "angle",
 *         "right", "classify", "combine", "count".
 *   lines: kind "seg"|"rayAB"|"rayBA"|"line" (seg), ax 60..180 (100),
 *          bx ax+40..300 (260), ruler boolean (true); 40 drawing units/cm.
 *   compass: task "compare"|"copy"|"path" (compare), ab .5..5 (3; compare/copy),
 *            cd .5..5 (4; compare), slant -25..25 (-15; compare/copy),
 *            illusion boolean (false; compare). Inapplicable controls are hidden.
 *            copy repeats AB three times; path transfers 3 cm + 4 cm.
 *   angle: angle 0..180 (60), base -30..30 (0; compare/classify), arm 65..115 (100),
 *          other 0..180 (60), otherArm 65..115 (70),
 *          tool "triangle"|"protractor"|"none" (triangle),
 *          task "compare"|"draw" (compare), left boolean (false).
 *          Draw uses a horizontal left/right starting ray: align centre/zero,
 *          mark, draw; wrong-scale counterexample. Misalignment blocks marking.
 *   classify: same angle/base/arm/tool options (angle defaults 80).
 *   right: task "compare"|"fold"|"draw" (fold), base -30..30 (0; compare/draw).
 *   points: task "one"|"two"|"segments"|"rays" (one).
 *   combine: combo 0..3 (0): 90+45, 60+45, 30+45, 45+45;
 *            task "combine"|"recognize" (combine).
 *   count: rays 3|4 (4); filter 0..3 (0=all,1=adjacent,2=two,3=three).
 *   distance: no options; length-conserving route straightening.
 * Numbers must be finite; invalid values use defaults, valid values clamp.
 * Every mode has reset. Pointer/touch and keyboard sliders support arrows,
 * Home/End; controls are native buttons/ranges. manip:change is observational
 * state (mode plus mode-specific geometry), never an answer/learning write.
 */
(function () {
  "use strict";
  var U = window.PeiyuManip.util, el = U.el, h = U.h;
  var scope = '.manip[data-manip="angleline"]:not([data-angleline-preset])';
  var style = document.createElement("style");
  style.textContent = scope + '{--al-ink:var(--fg);--al-fill:var(--hl-soft);}' +
    scope + ' [hidden]{display:none!important;}' +
    scope + ' .stage{width:100%;max-width:360px;display:block;margin:auto;touch-action:none;overflow:visible;}' +
    scope + ' .stage text{font-size:19px;fill:var(--al-ink);}' +
    scope + ' .al-field{display:flex;flex-wrap:wrap;gap:.5em;align-items:center;font-size:17px;margin:.5em 0;}' +
    scope + ' input{min-height:44px;max-width:100%;flex:1;min-width:120px;accent-color:var(--a);}' +
    scope + ' button{min-height:44px;font-size:17px;}' +
    scope + ' [role="slider"]{cursor:grab;outline-offset:3px;}' +
    scope + ' [role="slider"]:focus{outline:3px solid var(--c);}' +
    scope + ' .read{font-size:17px;overflow-wrap:anywhere;}' +
    scope + ' .al-note{font-size:17px;}';
  style.textContent += '.manip[data-angleline-preset]{max-width:100%;overflow-x:auto}' +
    '.manip[data-angleline-preset] svg.stage{min-width:340px}' +
    '.manip[data-angleline-preset^="p3a-u5-1:"] svg.stage{min-width:364px}';
  document.head.appendChild(style);
  function num(v, fallback, lo, hi) {
    return typeof v === "number" && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
  }
  function choice(v, list, fallback) { return list.indexOf(v) < 0 ? fallback : v; }
  function pt(x, y, a, r) { var d = a * Math.PI / 180; return [x + r * Math.cos(d), y - r * Math.sin(d)]; }
  function kind(a) { return a === 0 ? "零角" : a < 90 ? "锐角" : a === 90 ? "直角" : a < 180 ? "钝角" : "平角"; }
  function round(n) { return Math.round(n * 100) / 100; }

  // Named source presets retain authored controls, drawings, speech and event IDs.
  function source1(root, key) {
"use strict";
var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP;
function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.innerHTML = s; return e; }
function btn(label, fn, par) { var b = h("button", "", label); b.type = "button"; b.addEventListener("click", fn); par.appendChild(b); return b; }
function readout(node, html, say, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    if (say && P) {
      var speech = node.appendChild(P.sayButton(say));
      // The original dynamic handler owns this node; initSay must not bind twice.
      if (speech.nodeType === 1) speech.setAttribute("data-say-init", "1");
      speech.addEventListener("click", function (e) { P.say(say, e.currentTarget); });
    }
  }
function logI(what, d) { if (P) P.log("interact", Object.assign({ what: what }, d || {})); }
    var factories = {
      lines: function (root) {


    var st = { mode: "seg", ax: 100, bx: 260, ruler: true };
    var svg = el("svg", { viewBox: "0 0 360 195", class: "stage", role: "group", "aria-label": "线段、射线、直线互动实验" }, root);
    svg.style.touchAction = "none";
    var g = el("g", {}, svg);
    var ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read);
    var mBtns = {};
    [
      ["seg", "线段 AB"],
      ["rayAB", "射线 AB →"],
      ["rayBA", "← 射线 BA"],
      ["line", "↔ 直线 AB（直线 l）"]
    ].forEach(function (it) {
      mBtns[it[0]] = btn(it[1], function () { st.mode = it[0]; draw(); logI("u5-lines-mode", { mode: it[0] }); }, ctr);
    });
    var rBtn = btn("拿尺子量一量", function () { st.ruler = !st.ruler; draw(); }, ctr2);
    btn("点 A 左移", function () { st.ax = Math.max(60, st.ax - 20); draw(); }, ctr2);
    btn("点 B 右移", function () { st.bx = Math.min(300, st.bx + 20); draw(); }, ctr2);
    btn("重来", function () { st.mode = "seg"; st.ax = 100; st.bx = 260; st.ruler = true; draw(); }, ctr2);

    var dragging = null;
    function getSvgX(e) {
      var r = svg.getBoundingClientRect();
      return r.width ? (e.clientX - r.left) / r.width * 360 : null;
    }
    svg.addEventListener("pointerdown", function (e) {
      var px = getSvgX(e);
      if (px === null) return;
      var da = Math.abs(px - st.ax), db = Math.abs(px - st.bx);
      if (Math.min(da, db) > 28) return;
      dragging = da <= db ? "A" : "B";
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var px = getSvgX(e);
      if (px === null) return;
      if (dragging === "A") {
        st.ax = Math.max(60, Math.min(st.bx - 60, Math.round(px / 10) * 10));
      } else {
        st.bx = Math.min(300, Math.max(st.ax + 60, Math.round(px / 10) * 10));
      }
      draw();
    });
    svg.addEventListener("pointerup", function () { dragging = null; });
    svg.addEventListener("pointercancel", function () { dragging = null; });

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      for (var k in mBtns) mBtns[k].setAttribute("aria-pressed", k === st.mode ? "true" : "false");
      rBtn.setAttribute("aria-pressed", st.ruler ? "true" : "false");
      var y = 78, ax = st.ax, bx = st.bx, cm = Math.round((bx - ax) / 40 * 10) / 10;

      // 光束/延伸效果
      if (st.mode === "rayAB" || st.mode === "line") {
        el("polygon", { points: ax + "," + y + " 354," + (y - 22) + " 354," + (y + 22), style: "fill:var(--hl-soft);opacity:0.75" }, g);
      }
      if (st.mode === "rayBA" || st.mode === "line") {
        el("polygon", { points: bx + "," + y + " 6," + (y - 22) + " 6," + (y + 22), style: "fill:var(--hl-soft);opacity:0.75" }, g);
      }

      var x1 = (st.mode === "rayBA" || st.mode === "line") ? 8 : ax;
      var x2 = (st.mode === "rayAB" || st.mode === "line") ? 352 : bx;
      el("line", { x1: x1, y1: y, x2: x2, y2: y, style: "stroke:var(--a);stroke-width:4.5;stroke-linecap:round" }, g);

      // 延伸端提示箭头（虚线说明无限延伸）
      if (st.mode === "rayAB" || st.mode === "line") {
        el("text", { x: 308, y: y - 14, "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "无限延伸 →";
      }
      if (st.mode === "rayBA" || st.mode === "line") {
        el("text", { x: 52, y: y - 14, "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "← 无限延伸";
      }
      if (st.mode === "line") {
        el("text", { x: 338, y: y + 26, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-style:italic;font-weight:700" }, g).textContent = "l";
      }

      // 点 A 与点 B
      var aIsEnd = (st.mode === "seg" || st.mode === "rayAB");
      var bIsEnd = (st.mode === "seg" || st.mode === "rayBA");
      el("circle", { cx: ax, cy: y, r: aIsEnd ? 7.5 : 4.5, style: "fill:" + (aIsEnd ? "var(--no)" : "var(--fg)") + ";stroke:var(--card);stroke-width:2;cursor:ew-resize" }, g);
      el("circle", { cx: bx, cy: y, r: bIsEnd ? 7.5 : 4.5, style: "fill:" + (bIsEnd ? "var(--no)" : "var(--fg)") + ";stroke:var(--card);stroke-width:2;cursor:ew-resize" }, g);
      el("text", { x: ax, y: y - 16, "text-anchor": "middle", style: "fill:var(--fg);font-size:17px;font-weight:700" }, g).textContent = aIsEnd ? "A（端点）" : "A";
      el("text", { x: bx, y: y - 16, "text-anchor": "middle", style: "fill:var(--fg);font-size:17px;font-weight:700" }, g).textContent = bIsEnd ? "B（端点）" : "B";

      // 尺子
      if (st.ruler) {
        var ry = 115, rw = 260, rx = Math.min(92, ax - 10);
        el("rect", { x: rx, y: ry, width: rw, height: 42, rx: 5, style: "fill:var(--bg);stroke:var(--fg);stroke-width:2" }, g);
        for (var i = 0; i <= 6; i++) {
          var tx = ax + i * 40;
          if (tx > rx + rw - 10) break;
          el("line", { x1: tx, y1: ry, x2: tx, y2: ry + 12, style: "stroke:var(--fg);stroke-width:2" }, g);
          el("text", { x: tx, y: ry + 30, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, g).textContent = String(i);
        }
        el("text", { x: rx + rw - 20, y: ry + 30, "text-anchor": "middle", style: "fill:var(--muted);font-size:15px;font-weight:700" }, g).textContent = "cm";
        if (st.mode === "seg") {
          el("text", { x: 180, y: 182, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "有 2 个端点，尺子量出线段 AB 长 " + cm + " 厘米";
        } else {
          el("text", { x: 180, y: 182, "text-anchor": "middle", style: "fill:var(--no);font-size:16px;font-weight:700" }, g).textContent = "无限延伸没有尽头，尺子再长也量不完！";
        }
      }

      if (st.mode === "seg") {
        readout(read, "<b>线段 AB</b>（或线段 BA）：有 <b>2 个端点</b>（A 和 B），不能向两端延伸，能用尺子量出长度（<b>" + cm + " 厘米</b>）。", "线段AB，有两个端点，可以量出长度。", "ok");
      } else if (st.mode === "rayAB") {
        readout(read, "<b>射线 AB</b>：只有 <b>1 个端点 A</b>，经过点 B 向右<b>无限延伸</b>，量不出长度（端点 A 写在前）。", "射线AB，只有一个端点A，向一端无限延伸，量不出长度。");
      } else if (st.mode === "rayBA") {
        readout(read, "<b>射线 BA</b>：只有 <b>1 个端点 B</b>，经过点 A 向左<b>无限延伸</b>，和射线 AB 方向相反，不是同一条射线！", "射线BA，以B为端点向左无限延伸，和射线AB方向相反。");
      } else {
        readout(read, "<b>直线 AB</b>（或<b>直线 l</b>）：<b>没有端点</b>（0 个端点），向左右两端<b>无限延伸</b>，量不出长度。", "直线AB，也叫直线l，没有端点，向两端无限延伸。");
      }

      U.emit(root, Object.assign({mode: "lines", preset: "p3a-u5-1:lines"}, st));
    }
    draw();

      },
      points: function (root) {


    var st = { tab: "one", count: 1, tryMiss: false, pickIdx: 0 };
    var svg = el("svg", { viewBox: "0 0 360 185", class: "stage", role: "group", "aria-label": "过点画直线与数线段射线" }, root);
    var g = el("g", {}, svg);
    var ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read);
    var tBtns = {};
    [
      ["one", "过 1 个点 P 画直线"],
      ["two", "过 A、B 两点画直线"],
      ["count", "直线上数线段和射线"]
    ].forEach(function (it) {
      tBtns[it[0]] = btn(it[1], function () { st.tab = it[0]; st.count = 1; st.tryMiss = false; st.pickIdx = 0; rebuildCtr2(); draw(); logI("u5-pts-tab", { tab: it[0] }); }, ctr);
    });

    function rebuildCtr2() {
      while (ctr2.firstChild) ctr2.removeChild(ctr2.firstChild);
      if (st.tab === "one") {
        btn("再画 1 条直线", function () { st.count = Math.min(12, st.count + 1); draw(); }, ctr2);
        btn("一口气画 12 条", function () { st.count = 12; draw(); }, ctr2);
        btn("重来", function () { st.count = 1; draw(); }, ctr2);
      } else if (st.tab === "two") {
        btn("过 A、B 画直线", function () { st.tryMiss = false; draw(); }, ctr2);
        btn("偏一点点试试", function () { st.tryMiss = true; draw(); }, ctr2);
        btn("重来", function () { st.tryMiss = false; draw(); }, ctr2);
      } else {
        [
          ["全部 3 条线段", 0],
          ["线段 PQ", 1],
          ["线段 PR（长）", 2],
          ["线段 QR", 3],
          ["全部 6 条射线", 4]
        ].forEach(function (it) {
          btn(it[0], function () { st.pickIdx = it[1]; draw(); }, ctr2);
        });
        btn("重来", function () { st.pickIdx = 0; draw(); }, ctr2);
      }
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      for (var k in tBtns) tBtns[k].setAttribute("aria-pressed", k === st.tab ? "true" : "false");
      if (st.tab === "one") {
        var cx = 180, cy = 92, R = 140;
        for (var i = 0; i < st.count; i++) {
          var ang = (i * Math.PI) / 12;
          var dx = Math.cos(ang) * R, dy = Math.sin(ang) * R;
          el("line", { x1: (cx - dx).toFixed(1), y1: (cy - dy).toFixed(1), x2: (cx + dx).toFixed(1), y2: (cy + dy).toFixed(1), style: "stroke:" + (i === st.count - 1 ? "var(--a)" : "var(--b)") + ";stroke-width:" + (i === st.count - 1 ? 3 : 2) + ";opacity:" + (i === st.count - 1 ? 1 : 0.65) }, g);
        }
        el("circle", { cx: cx, cy: cy, r: 6.5, style: "fill:var(--no);stroke:var(--card);stroke-width:2" }, g);
        el("text", { x: cx + 18, y: cy - 12, "text-anchor": "middle", style: "fill:var(--no);font-size:18px;font-weight:700" }, g).textContent = "P";
        readout(read, "已经经过点 P 画了 <b>" + st.count + " 条</b>直线。只要换个方向就能继续画——<b>过一点可以画无数条直线</b>！", "过一点可以画无数条直线。", "ok");
      } else if (st.tab === "two") {
        var ax = 95, ay = 105, bx = 265, by = 75;
        el("line", { x1: 20, y1: 118.2, x2: 340, y2: 61.8, style: "stroke:var(--a);stroke-width:3.5" }, g);
        if (st.tryMiss) {
          el("line", { x1: 20, y1: 95, x2: 340, y2: 125, style: "stroke:var(--no);stroke-width:2.5;stroke-dasharray:6 4" }, g);
          el("text", { x: 180, y: 152, "text-anchor": "middle", style: "fill:var(--no);font-size:15px;font-weight:700" }, g).textContent = "穿过 A 但偏了一点，就漏掉了 B！";
        }
        el("circle", { cx: ax, cy: ay, r: 6.5, style: "fill:var(--no);stroke:var(--card);stroke-width:2" }, g);
        el("circle", { cx: bx, cy: by, r: 6.5, style: "fill:var(--no);stroke:var(--card);stroke-width:2" }, g);
        el("text", { x: ax, y: ay - 14, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "A";
        el("text", { x: bx, y: by - 14, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "B";
        readout(read, st.tryMiss ? "只要歪一点点，就穿不过点 B 了。所以<b>过两点只能画 1 条直线</b>！" : "同时穿过 A、B 两个点的直线是唯一确定的：<b>过两点只能画 1 条直线</b>。", "过两点只能画一条直线。", "ok");
      } else {
        var px = 75, qx = 175, rx = 275, ly = 65;
        el("line", { x1: 18, y1: ly, x2: 342, y2: ly, style: "stroke:var(--line);stroke-width:3" }, g);
        var pts = [["P", px], ["Q", qx], ["R", rx]];
        if (st.pickIdx === 0) {
          // 展示全部 3 条线段拱弧
          el("line", { x1: px, y1: ly + 28, x2: qx, y2: ly + 28, style: "stroke:var(--a);stroke-width:4" }, g);
          el("text", { x: (px + qx) / 2, y: ly + 46, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "① 线段 PQ";
          el("line", { x1: qx, y1: ly + 56, x2: rx, y2: ly + 56, style: "stroke:var(--b);stroke-width:4" }, g);
          el("text", { x: (qx + rx) / 2, y: ly + 74, "text-anchor": "middle", style: "fill:var(--b);font-size:16px;font-weight:700" }, g).textContent = "② 线段 QR";
          el("line", { x1: px, y1: ly + 88, x2: rx, y2: ly + 88, style: "stroke:var(--c);stroke-width:4" }, g);
          el("text", { x: (px + rx) / 2, y: ly + 108, "text-anchor": "middle", style: "fill:var(--c);font-size:16px;font-weight:700" }, g).textContent = "③ 线段 PR（长线段）";
          readout(read, "直线上 P、Q、R 三个点：以 P 为左端点有 <b>PQ、PR</b>（2 条），以 Q 为左端点有 <b>QR</b>（1 条），共 <b>2 + 1 = 3 条线段</b>。", "共有三条线段：线段PQ、线段PR和线段QR。", "ok");
        } else if (st.pickIdx >= 1 && st.pickIdx <= 3) {
          var segs = [
            [px, qx, "线段 PQ", "线段 PQ"],
            [px, rx, "线段 PR（长线段）", "线段 PR（以 P、R 为端点的长线段）"],
            [qx, rx, "线段 QR", "线段 QR"]
          ][st.pickIdx - 1];
          el("line", { x1: segs[0], y1: ly, x2: segs[1], y2: ly, style: "stroke:var(--a);stroke-width:6" }, g);
          el("text", { x: 180, y: 135, "text-anchor": "middle", style: "fill:var(--a);font-size:17px;font-weight:700" }, g).textContent = "当前高亮：" + segs[2];
          readout(read, "当前高亮：<b>" + segs[3] + "</b>，有两个固定的端点。", segs[3]);
        } else {
          // 6 条射线
          pts.forEach(function (pt, idx) {
            var ry = 102 + idx * 25;
            el("circle", { cx: pt[1], cy: ry, r: 4.5, style: "fill:var(--a)" }, g);
            el("line", { x1: pt[1], y1: ry, x2: 18, y2: ry, style: "stroke:var(--b);stroke-width:2.5" }, g);
            el("line", { x1: pt[1], y1: ry, x2: 342, y2: ry, style: "stroke:var(--a);stroke-width:2.5" }, g);
            el("text", { x: pt[1], y: ry - 6, "text-anchor": "middle", style: "fill:var(--fg);font-size:15px;font-weight:700" }, g).textContent = pt[0] + " 向左、向右各 1 条";
          });
          readout(read, "P、Q、R 每个点都能<b>向左射出 1 条、向右射出 1 条</b>，所以共有 <b>3 × 2 = 6 条射线</b>！", "每个点向左右各引出一条射线，三个点共有六条射线。", "ok");
        }
        pts.forEach(function (pt) {
          el("circle", { cx: pt[1], cy: ly, r: 6, style: "fill:var(--no);stroke:var(--card);stroke-width:2" }, g);
          el("text", { x: pt[1], y: ly - 14, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = pt[0];
        });
      }

      U.emit(root, Object.assign({mode: "points", preset: "p3a-u5-1:points"}, st));
    }
    rebuildCtr2();
    draw();

      },
      distance: function (root) {


    var st = { open1: false, open2: false };
    var svg = el("svg", { viewBox: "0 0 360 205", class: "stage", role: "group", "aria-label": "两点间三条路线拉直比较长度" }, root);
    var g = el("g", {}, svg);
    var ctr = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(read);
    var b1 = btn("把 ① 号弯路拉直", function () { st.open1 = !st.open1; draw(); logI("u5-dist-1"); }, ctr);
    var b2 = btn("把 ② 号折线拉直", function () { st.open2 = !st.open2; draw(); logI("u5-dist-2"); }, ctr);
    btn("全部拉直比一比", function () { st.open1 = true; st.open2 = true; draw(); logI("u5-dist-all"); }, ctr);
    btn("重来", function () { st.open1 = false; st.open2 = false; draw(); }, ctr);

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      b1.setAttribute("aria-pressed", st.open1 ? "true" : "false");
      b2.setAttribute("aria-pressed", st.open2 ? "true" : "false");
      // 统一比例尺：1 米 = 18px。
      // 路线 3（线段 AB）：长 180px = 10 米（A(90,66) -> B(270,66)）
      // 路线 2（下折线）：两段各 108px（sqrt(90^2 + 59.6992^2) = 108），总长 216px = 12 米
      // 路线 1（上拱弯路）：两段对称斜坡各 65px（sqrt(39^2 + 52^2) = 65，3-4-5 直角三角形）+ 顶部两段各 52px（dx=51, dy=sqrt(52^2-51^2)=10.1489），总长精确 = 65 + 52 + 52 + 65 = 234.0px = 13 米
      var ax = 90, bx = 270, my = 68;
      var p1 = el("path", { d: "M90 68 L129 16 L180 5.8511 L231 16 L270 68", style: "fill:none;stroke:var(--b);stroke-width:3;stroke-linejoin:round" }, g);
      el("text", { x: 180, y: 26, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g).textContent = "① 弯路";
      var p3 = el("line", { x1: ax, y1: my, x2: bx, y2: my, style: "stroke:var(--a);stroke-width:4" }, g);
      el("text", { x: 180, y: my - 8, "text-anchor": "middle", style: "fill:var(--a);font-size:15px;font-weight:700" }, g).textContent = "③ 线段 AB";
      var p2 = el("polyline", { points: "90,68 180,127.6992 270,68", style: "fill:none;stroke:var(--c);stroke-width:3;stroke-linejoin:round" }, g);
      el("text", { x: 180, y: 114, "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "② 折线路";

      el("circle", { cx: ax, cy: my, r: 6, style: "fill:var(--fg)" }, g);
      el("circle", { cx: bx, cy: my, r: 6, style: "fill:var(--fg)" }, g);
      el("text", { x: ax - 18, y: my + 6, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "A";
      el("text", { x: bx + 18, y: my + 6, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "B";

      // 下方对齐比较区（严格使用上方路径的真实 getTotalLength() 保持 1:1 长度守恒）
      var len1 = p1.getTotalLength(), len2 = p2.getTotalLength(), len3 = p3.getTotalLength();
      var x0 = 16;
      el("line", { x1: x0, y1: 132, x2: x0, y2: 198, style: "stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 3" }, g);
      el("line", { x1: x0 + len3, y1: 132, x2: x0 + len3, y2: 198, style: "stroke:var(--a);stroke-width:1.5;stroke-dasharray:4 3" }, g);
      // 线段 AB 基准条
      el("line", { x1: x0, y1: 144, x2: x0 + len3, y2: 144, style: "stroke:var(--a);stroke-width:5;stroke-linecap:round" }, g);
      el("text", { x: x0 + len3 + 8, y: 149, "text-anchor": "start", style: "fill:var(--a);font-size:14px;font-weight:700" }, g).textContent = "③ 10米（最短）";

      if (st.open1) {
        el("line", { x1: x0, y1: 168, x2: x0 + len1, y2: 168, style: "stroke:var(--b);stroke-width:5;stroke-linecap:round" }, g);
        el("text", { x: x0 + len1 + 8, y: 173, "text-anchor": "start", style: "fill:var(--b);font-size:14px;font-weight:700" }, g).textContent = "① 拉直：13米";
      }
      if (st.open2) {
        el("line", { x1: x0, y1: 191, x2: x0 + len2, y2: 191, style: "stroke:var(--c);stroke-width:5;stroke-linecap:round" }, g);
        el("text", { x: x0 + len2 + 8, y: 196, "text-anchor": "start", style: "fill:var(--c);font-size:14px;font-weight:700" }, g).textContent = "② 拉直：12米";
      }

      if (st.open1 && st.open2) {
        readout(read, "拉直对齐一看：① 弯路长 <b>13 米</b>，② 折线路长 <b>12 米</b>，③ 线段 AB 长 <b>10 米（最短）</b>！<b>两点间所有连线中线段最短</b>，这 10 米就是 A、B <b>两点间的距离</b>。", "两点间所有连线中线段最短，这条线段的长度叫作两点间的距离。", "ok");
      } else {
        readout(read, "点上面的按钮，把 ① 号弯路（13 米）和 ② 号折线（12 米）按原长拉直，和 ③ 号线段 AB（10 米）左端对齐比长短。", "点按钮把弯路和折线拉直比一比。");
      }

      U.emit(root, Object.assign({mode: "distance", preset: "p3a-u5-1:distance"}, st));
    }
    draw();

      }
    };
    factories[key](root);
  }
  function source2(root, key) {
"use strict";
var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP;
function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.innerHTML = s; return e; }
function btn(label, fn, par) { var b = h("button", "", label); b.type = "button"; b.addEventListener("click", fn); par.appendChild(b); return b; }
function readout(node, html, say, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    if (say && P) {
      var speech = node.appendChild(P.sayButton(say));
      // The original dynamic handler owns this node; initSay must not bind twice.
      if (speech.nodeType === 1) speech.setAttribute("data-say-init", "1");
      speech.addEventListener("click", function (e) { P.say(say, e.currentTarget); });
    }
  }
function logI(what, d) { if (P) P.log("interact", Object.assign({ what: what }, d || {})); }
function drawCompass(g, nx, ny, px, py, showLabels) {
    var mx = (nx + px) / 2, my = (ny + py) / 2;
    var dx = px - nx, dy = py - ny, dist = Math.sqrt(dx * dx + dy * dy) || 1;
    var hLen = Math.max(42, Math.min(62, 74 - dist * 0.12));
    // 垂直向上偏置作为圆规铰链顶点
    var ux = dy / dist, uy = -dx / dist;
    if (uy > 0) { ux = -ux; uy = -uy; }
    var hx = mx + ux * hLen, hy = my + uy * hLen;
    // 手柄
    el("line", { x1: hx.toFixed(1), y1: hy.toFixed(1), x2: (hx + ux * 13).toFixed(1), y2: (hy + uy * 13).toFixed(1), style: "stroke:var(--fg);stroke-width:5.5;stroke-linecap:round" }, g);
    // 两只脚
    el("line", { x1: hx.toFixed(1), y1: hy.toFixed(1), x2: nx.toFixed(1), y2: ny.toFixed(1), style: "stroke:var(--c);stroke-width:4.5;stroke-linecap:round" }, g);
    el("line", { x1: hx.toFixed(1), y1: hy.toFixed(1), x2: px.toFixed(1), y2: py.toFixed(1), style: "stroke:var(--c);stroke-width:4.5;stroke-linecap:round" }, g);
    // 针尖与笔芯尖
    el("circle", { cx: hx.toFixed(1), cy: hy.toFixed(1), r: 5, style: "fill:var(--fg)" }, g);
    el("circle", { cx: nx.toFixed(1), cy: ny.toFixed(1), r: 4, style: "fill:var(--no)" }, g);
    el("circle", { cx: px.toFixed(1), cy: py.toFixed(1), r: 4, style: "fill:var(--a)" }, g);
    if (showLabels) {
      el("text", { x: (hx + ux * 20 + 28).toFixed(1), y: Math.max(20, hy + uy * 16 + 4).toFixed(1), "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, g).textContent = "手柄";
      el("text", { x: (nx - 26).toFixed(1), y: (ny - 12).toFixed(1), "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "针尖脚";
      el("text", { x: (px + 28).toFixed(1), y: (py - 12).toFixed(1), "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "笔芯脚";
    }
  }
    var factories = {
      compare: function (root) {


    var CASES = [
      { name: "第 1 组（AB < CD）", ab: 120, cd: 165, slant: -18, illusion: false },
      { name: "第 2 组（AB = CD）", ab: 150, cd: 150, slant: -15, illusion: false },
      { name: "第 3 组（AB > CD）", ab: 175, cd: 130, slant: -14, illusion: false },
      { name: "第 4 组（箭头错觉）", ab: 150, cd: 150, slant: 0, illusion: true }
    ];
    var st = { idx: 0, step: 0 };
    var svg = el("svg", { viewBox: "0 0 360 205", class: "stage", role: "group", "aria-label": "用圆规比较两条线段的长短" }, root);
    var g = el("g", {}, svg);
    var ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read);

    var cBtns = CASES.map(function (c, i) {
      return btn(c.name, function () { st.idx = i; st.step = 0; draw(); logI("u5-cmp-case", { caseIdx: i }); }, ctr);
    });
    var sBtns = [
      btn("① 针尖定 A，张开到 B", function () { st.step = 1; draw(); logI("u5-cmp-s1"); }, ctr2),
      btn("② 两脚不动，移到 C", function () { st.step = 2; draw(); logI("u5-cmp-s2"); }, ctr2),
      btn("③ 转手柄画弧比一比", function () { st.step = 3; draw(); logI("u5-cmp-s3"); }, ctr2),
      btn("重来", function () { st.step = 0; draw(); }, ctr2)
    ];

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      cBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.idx ? "true" : "false"); });
      for (var s = 0; s < 3; s++) sBtns[s].setAttribute("aria-pressed", st.step === s + 1 ? "true" : "false");

      var cur = CASES[st.idx];
      var ax = 75, ay = 78, rad = cur.slant * Math.PI / 180;
      var bx = ax + cur.ab * Math.cos(rad), by = ay + cur.ab * Math.sin(rad);
      var cx = 75, cy = 152, dx = cx + cur.cd, dy = cy;

      if (cur.illusion) {
        // 视觉错觉箭头装饰
        el("polyline", { points: (ax + 14) + "," + (ay - 9) + " " + ax + "," + ay + " " + (ax + 14) + "," + (ay + 9), style: "fill:none;stroke:var(--muted);stroke-width:2.5" }, g);
        el("polyline", { points: (bx - 14) + "," + (by - 9) + " " + bx + "," + by + " " + (bx - 14) + "," + (by + 9), style: "fill:none;stroke:var(--muted);stroke-width:2.5" }, g);
        el("polyline", { points: (cx - 14) + "," + (cy - 9) + " " + cx + "," + cy + " " + (cx - 14) + "," + (cy + 9), style: "fill:none;stroke:var(--muted);stroke-width:2.5" }, g);
        el("polyline", { points: (dx + 14) + "," + (dy - 9) + " " + dx + "," + dy + " " + (dx + 14) + "," + (dy + 9), style: "fill:none;stroke:var(--muted);stroke-width:2.5" }, g);
      }

      // 线段 AB 与 CD
      el("line", { x1: ax, y1: ay, x2: bx.toFixed(1), y2: by.toFixed(1), style: "stroke:var(--a);stroke-width:4" }, g);
      el("circle", { cx: ax, cy: ay, r: 5, style: "fill:var(--a)" }, g);
      el("circle", { cx: bx.toFixed(1), cy: by.toFixed(1), r: 5, style: "fill:var(--a)" }, g);
      el("text", { x: ax - 18, y: ay + 6, "text-anchor": "middle", style: "fill:var(--a);font-size:18px;font-weight:700" }, g).textContent = "A";
      el("text", { x: (bx + 18).toFixed(1), y: (by + 6).toFixed(1), "text-anchor": "middle", style: "fill:var(--a);font-size:18px;font-weight:700" }, g).textContent = "B";

      // 若 AB > CD 且在第 3 步，画一点 CD 右侧延长虚线方便看落点
      if (st.step === 3 && cur.ab > cur.cd) {
        el("line", { x1: dx, y1: dy, x2: cx + cur.ab + 25, y2: dy, style: "stroke:var(--line);stroke-width:2.5;stroke-dasharray:4 4" }, g);
      }
      el("line", { x1: cx, y1: cy, x2: dx, y2: dy, style: "stroke:var(--b);stroke-width:4" }, g);
      el("circle", { cx: cx, cy: cy, r: 5, style: "fill:var(--b)" }, g);
      el("circle", { cx: dx, cy: dy, r: 5, style: "fill:var(--b)" }, g);
      el("text", { x: cx - 18, y: cy + 6, "text-anchor": "middle", style: "fill:var(--b);font-size:18px;font-weight:700" }, g).textContent = "C";
      el("text", { x: dx, y: dy + 24, "text-anchor": "middle", style: "fill:var(--b);font-size:18px;font-weight:700" }, g).textContent = "D";

      if (st.step === 0) {
        drawCompass(g, 265, 115, 305, 115, true);
        readout(read, "先猜一猜线段 AB 和 CD 哪条长？再点“<b>① 针尖定 A，张开到 B</b>”用圆规量一量。", "点第一步按钮，用圆规量出线段AB的长。");
      } else if (st.step === 1) {
        drawCompass(g, ax, ay, bx, by, true);
        readout(read, "第 1 步：把有针尖的脚固定在线段 AB 的<b>端点 A</b> 上，另一只脚张开对准<b>端点 B</b>，量出 AB 的长。", "先把有针尖的脚固定在端点A上，另一只脚张开对准端点B。");
      } else if (st.step === 2) {
        var p2x = cx + cur.ab * Math.cos(-0.28), p2y = cy + cur.ab * Math.sin(-0.28);
        drawCompass(g, cx, cy, p2x, p2y, false);
        el("text", { x: cx, y: cy - 16, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "A 与 C 重合";
        readout(read, "第 2 步：捏住手柄，<b>保持两脚距离不变</b>，把有针尖的脚固定在线段 CD 的<b>端点 C</b> 上（让点 A 与点 C 重合）。", "保持两脚距离不变，把针尖固定在端点C上。");
      } else {
        var landX = cx + cur.ab;
        // 画圆弧痕迹
        el("path", { d: "M" + (landX - 8).toFixed(1) + " " + (cy - 34) + " A" + cur.ab + " " + cur.ab + " 0 0 1 " + (landX - 4).toFixed(1) + " " + (cy + 26), style: "fill:none;stroke:var(--no);stroke-width:2.5;stroke-dasharray:5 3" }, g);
        el("line", { x1: cx, y1: cy - 4, x2: landX, y2: cy - 4, style: "stroke:var(--a);stroke-width:4" }, g);
        el("circle", { cx: landX, cy: cy, r: 5.5, style: "fill:var(--no)" }, g);
        el("text", { x: landX, y: cy - 14, "text-anchor": "middle", style: "fill:var(--no);font-size:17px;font-weight:700" }, g).textContent = "B";
        drawCompass(g, cx, cy, landX, cy, false);

        if (cur.ab < cur.cd) {
          readout(read, "第 3 步：转动手柄画弧，点 B 落在点 D 的<b>左侧（里面）</b>——说明线段 AB 比线段 CD 短，记作 <b>AB &lt; CD</b>！", "点B落在点D的左侧，线段AB比线段CD短，记作AB小于CD。", "ok");
        } else if (cur.ab === cur.cd) {
          readout(read, "第 3 步：转动手柄画弧，点 B 与点 D <b>正好重合</b>——说明两条线段<b>一样长</b>，记作 <b>AB = CD</b>！" + (cur.illusion ? "（眼睛被箭头骗啦！）" : ""), "点B与点D重合，线段AB等于线段CD。", "ok");
        } else {
          readout(read, "第 3 步：转动手柄画弧，点 B 落在点 D 的<b>右侧（外面）</b>——说明线段 AB 比线段 CD 长，记作 <b>AB &gt; CD</b>！", "点B落在点D的右侧，线段AB比线段CD长，记作AB大于CD。", "ok");
        }
      }

      U.emit(root, Object.assign({mode: "compare", preset: "p3a-u5-2:compare"}, st));
    }
    draw();

      },
      construct: function (root) {


    var st = { mode: "line", step: 0 };
    var svg = el("svg", { viewBox: "0 0 360 195", class: "stage", role: "group", "aria-label": "在直线上用圆规作等长线段" }, root);
    var g = el("g", {}, svg);
    var ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read);

    var m1 = btn("在直线 l 上作等长线段", function () { st.mode = "line"; st.step = 0; rebuild(); draw(); logI("u5-con-line"); }, ctr);
    var m2 = btn("小蚂蚁折线与直路比长短", function () { st.mode = "ant"; st.step = 0; rebuild(); draw(); logI("u5-con-ant"); }, ctr);

    function rebuild() {
      while (ctr2.firstChild) ctr2.removeChild(ctr2.firstChild);
      if (st.mode === "line") {
        btn("① 量取 AB（3 cm）", function () { st.step = 1; draw(); }, ctr2);
        btn("② 针尖定 A 画弧得 B 后，定 B 作 BC = AB", function () { st.step = 2; draw(); }, ctr2);
        btn("③ 再定 C 作 CD = AB", function () { st.step = 3; draw(); }, ctr2);
        btn("重来", function () { st.step = 0; draw(); }, ctr2);
      } else {
        btn("① 量折线第 1 段移到直路上", function () { st.step = 1; draw(); }, ctr2);
        btn("② 首尾相接！量第 2 段接着截", function () { st.step = 2; draw(); }, ctr2);
        btn("重来", function () { st.step = 0; draw(); }, ctr2);
      }
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      m1.setAttribute("aria-pressed", st.mode === "line" ? "true" : "false");
      m2.setAttribute("aria-pressed", st.mode === "ant" ? "true" : "false");

      if (st.mode === "line") {
        var ly = 135, xA = 45, L = 85;
        el("line", { x1: 20, y1: ly, x2: 340, y2: ly, style: "stroke:var(--fg);stroke-width:3" }, g);
        el("text", { x: 332, y: ly - 12, "text-anchor": "middle", style: "fill:var(--muted);font-size:18px;font-style:italic;font-weight:700" }, g).textContent = "l";
        // 已知线段 AB
        el("line", { x1: xA, y1: ly, x2: xA + L, y2: ly, style: "stroke:var(--a);stroke-width:5" }, g);
        el("circle", { cx: xA, cy: ly, r: 5.5, style: "fill:var(--a)" }, g);
        el("circle", { cx: xA + L, cy: ly, r: 5.5, style: "fill:var(--a)" }, g);
        el("text", { x: xA, y: ly + 25, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "A";
        el("text", { x: xA + L, y: ly + 25, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "B";
        el("text", { x: xA + L / 2, y: ly - 12, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "3 cm";

        if (st.step >= 2) {
          var xC = xA + 2 * L;
          el("line", { x1: xA + L, y1: ly, x2: xC, y2: ly, style: "stroke:var(--b);stroke-width:5" }, g);
          el("path", { d: "M" + (xC - 5) + " " + (ly - 24) + " A85 85 0 0 1 " + (xC - 5) + " " + (ly + 24), style: "fill:none;stroke:var(--no);stroke-width:2.5" }, g);
          el("circle", { cx: xC, cy: ly, r: 5.5, style: "fill:var(--b)" }, g);
          el("text", { x: xC, y: ly + 25, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "C";
          el("text", { x: xA + 1.5 * L, y: ly - 12, "text-anchor": "middle", style: "fill:var(--b);font-size:16px;font-weight:700" }, g).textContent = "BC = AB";
        }
        if (st.step >= 3) {
          var xD = xA + 3 * L;
          el("line", { x1: xA + 2 * L, y1: ly, x2: xD, y2: ly, style: "stroke:var(--c);stroke-width:5" }, g);
          el("path", { d: "M" + (xD - 5) + " " + (ly - 24) + " A85 85 0 0 1 " + (xD - 5) + " " + (ly + 24), style: "fill:none;stroke:var(--no);stroke-width:2.5" }, g);
          el("circle", { cx: xD, cy: ly, r: 5.5, style: "fill:var(--c)" }, g);
          el("text", { x: xD, y: ly + 25, "text-anchor": "middle", style: "fill:var(--fg);font-size:18px;font-weight:700" }, g).textContent = "D";
          el("text", { x: xA + 2.5 * L, y: ly - 12, "text-anchor": "middle", style: "fill:var(--c);font-size:16px;font-weight:700" }, g).textContent = "CD = AB";
        }

        if (st.step === 1) {
          drawCompass(g, xA, ly, xA + L, ly, false);
          readout(read, "第 1 步：针尖固定在 A，笔芯脚张开到 B，量出线段 AB 的长（3 厘米）。", "用圆规量出线段AB的长。");
        } else if (st.step === 2) {
          drawCompass(g, xA + L, ly, xA + 2 * L, ly, false);
          readout(read, "第 2 步：两脚距离不变，针尖固定在点 B，在直线 l 上画弧交于<b>点 C</b>，作出 <b>BC = AB = 3 厘米</b>（AC 共 6 厘米）！", "针尖固定在点B，画弧交直线于点C，作出BC等于AB。", "ok");
        } else if (st.step === 3) {
          drawCompass(g, xA + 2 * L, ly, xA + 3 * L, ly, false);
          readout(read, "第 3 步：再把针尖固定在点 C 往右画弧得<b>点 D</b>，作出 <b>CD = AB = 3 厘米</b>，三段合起来 AD = 9 厘米！", "再以C为端点作CD等于AB。", "ok");
        } else {
          readout(read, "直线 l 上已经有长 3 厘米的线段 AB。点上面按钮，用圆规顺着作出 <b>BC = AB</b>。", "点按钮用圆规在直线上作等长线段。");
        }
      } else {
        // 小蚂蚁折线（M-N-P）与直路（Q-R）
        var mx = 35, my = 65, nx = 115, ny = 28, px = 215, py = 65;
        var L1 = Math.round(Math.sqrt((nx - mx) * (nx - mx) + (ny - my) * (ny - my))); // ~88
        var L2 = Math.round(Math.sqrt((px - nx) * (px - nx) + (py - ny) * (py - ny))); // ~107
        var qx = 35, qy = 148, rx = 210, ry = 148; // QR = 175, L1+L2 = 195 > 175
        el("polyline", { points: mx + "," + my + " " + nx + "," + ny + " " + px + "," + py, style: "fill:none;stroke:var(--a);stroke-width:3.5" }, g);
        el("circle", { cx: mx, cy: my, r: 4.5, style: "fill:var(--a)" }, g);
        el("circle", { cx: nx, cy: ny, r: 4.5, style: "fill:var(--a)" }, g);
        el("circle", { cx: px, cy: py, r: 4.5, style: "fill:var(--a)" }, g);
        el("text", { x: mx, y: my + 20, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "M";
        el("text", { x: nx, y: ny - 8, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "N（①号折线）";
        el("text", { x: px, y: py + 20, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g).textContent = "P";

        el("line", { x1: qx, y1: qy, x2: 325, y2: qy, style: "stroke:var(--line);stroke-width:2.5;stroke-dasharray:4 4" }, g);
        el("line", { x1: qx, y1: qy, x2: rx, y2: qy, style: "stroke:var(--b);stroke-width:4" }, g);
        el("circle", { cx: qx, cy: qy, r: 5, style: "fill:var(--b)" }, g);
        el("circle", { cx: rx, cy: ry, r: 5, style: "fill:var(--b)" }, g);
        el("text", { x: qx, y: qy + 24, "text-anchor": "middle", style: "fill:var(--b);font-size:16px;font-weight:700" }, g).textContent = "Q";
        el("text", { x: rx, y: ry + 24, "text-anchor": "middle", style: "fill:var(--b);font-size:16px;font-weight:700" }, g).textContent = "R（②号直路终点）";

        if (st.step >= 1) {
          var n1x = qx + L1;
          el("line", { x1: qx, y1: qy - 5, x2: n1x, y2: qy - 5, style: "stroke:var(--a);stroke-width:4.5" }, g);
          el("path", { d: "M" + (n1x - 4) + " " + (qy - 24) + " A88 88 0 0 1 " + (n1x - 4) + " " + (qy + 18), style: "fill:none;stroke:var(--a);stroke-width:2" }, g);
          el("circle", { cx: n1x, cy: qy - 5, r: 4.5, style: "fill:var(--a)" }, g);
          el("text", { x: (qx + n1x) / 2, y: qy - 14, "text-anchor": "middle", style: "fill:var(--a);font-size:15px;font-weight:700" }, g).textContent = "第1段 MN";
        }
        if (st.step === 1) {
          drawCompass(g, qx, qy - 5, qx + L1, qy - 5, false);
          readout(read, "第 1 步：用圆规量取折线第 1 段 MN，移到直路起点 Q 上画弧。接下来要把针尖固定在刚画出的交点上！", "第一步，量取第一段MN移到直路起点Q上。");
        } else if (st.step >= 2) {
          var n2x = qx + L1 + L2;
          el("line", { x1: qx + L1, y1: qy - 5, x2: n2x, y2: qy - 5, style: "stroke:var(--c);stroke-width:4.5" }, g);
          el("path", { d: "M" + (n2x - 4) + " " + (qy - 24) + " A107 107 0 0 1 " + (n2x - 4) + " " + (qy + 18), style: "fill:none;stroke:var(--no);stroke-width:2.5" }, g);
          el("circle", { cx: n2x, cy: qy - 5, r: 5, style: "fill:var(--no)" }, g);
          el("text", { x: (qx + L1 + n2x) / 2, y: qy - 14, "text-anchor": "middle", style: "fill:var(--c);font-size:15px;font-weight:700" }, g).textContent = "第2段 NP";
          drawCompass(g, qx + L1, qy - 5, n2x, qy - 5, false);
          readout(read, "第 2 步：<b>首尾相接</b>截出第 2 段 NP，总终点落在了 R 的<b>右边</b>！所以 <b>① 号折线路线比 ② 号直路更长</b>。", "首尾相接截出第二段，总终点落在R的右边，所以一号折线路线更长。", "ok");
        } else {
          readout(read, "① 号是两段折线（MN + NP），② 号是一条直路 QR。怎么用圆规比谁长？点第 1 步试试。", "点按钮把折线的两段首尾相接移到直路上比长短。");
        }
      }

      U.emit(root, Object.assign({mode: "construct", preset: "p3a-u5-2:construct"}, st));
    }
    rebuild();
    draw();

      }
    };
    factories[key](root);
  }
  function source3(root, key) {
"use strict";
var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP;
function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.innerHTML = s; return e; }
function btn(label, fn, par) { var b = h("button", "", label); b.type = "button"; b.addEventListener("click", fn); par.appendChild(b); return b; }
function readout(node, html, say, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    if (say && P) {
      var speech = node.appendChild(P.sayButton(say));
      // The original dynamic handler owns this node; initSay must not bind twice.
      if (speech.nodeType === 1) speech.setAttribute("data-say-init", "1");
      speech.addEventListener("click", function (e) { P.say(say, e.currentTarget); });
    }
  }
function logI(what, d) { if (P) P.log("interact", Object.assign({ what: what }, d || {})); }
    var factories = {
      angle: function (root) {


    var st = { openIdx: 1, lenIdx: 1, cmpCase: 0, overlaid: false };
    var openDegs = [28, 52, 82], openLabels = ["较小张口", "标准张口", "较大张口"];
    var armLens = [52, 78, 104], lenLabels = ["短边", "标准边长", "长边"];

    var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "group", "aria-label": "活动角与叠合比角实验" }, root);
    var g = el("g", {}, svg);
    var ctr1 = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr1); root.appendChild(ctr2); root.appendChild(read);

    var openBtns = ["张口变小", "标准张口", "张口变大"].map(function (t, i) {
      return btn(t, function () { st.openIdx = i; draw(); logI("u5-angle-open", { idx: i }); }, ctr1);
    });
    var lenBtns = ["边画短些", "标准边长", "边画长些"].map(function (t, i) {
      return btn(t, function () { st.lenIdx = i; draw(); logI("u5-angle-len", { idx: i }); }, ctr1);
    });

    var bCase0 = btn("对比①：张口同、边长不同", function () { st.cmpCase = 0; draw(); }, ctr2);
    var bCase1 = btn("对比②：蓝角边短但张口大", function () { st.cmpCase = 1; draw(); }, ctr2);
    var bOver = btn("叠合比一比", function () { st.overlaid = !st.overlaid; draw(); logI("u5-angle-overlay", { on: st.overlaid }); }, ctr2);

    function drawOneAngle(vx, vy, deg, len, color, label, dashed) {
      var rad = deg * Math.PI / 180;
      var x1 = vx + len, y1 = vy;
      var x2 = vx + Math.cos(rad) * len, y2 = vy - Math.sin(rad) * len;
      var arcR = 22;
      var ax2 = vx + Math.cos(rad) * arcR, ay2 = vy - Math.sin(rad) * arcR;
      el("path", {
        d: "M " + (vx + arcR) + " " + vy + " A " + arcR + " " + arcR + " 0 0 0 " + ax2.toFixed(1) + " " + ay2.toFixed(1),
        style: "fill:none;stroke:" + color + ";stroke-width:2.2"
      }, g);
      var stLine = "stroke:" + color + ";stroke-width:3.8;stroke-linecap:round" + (dashed ? ";stroke-dasharray:6 3" : "");
      el("line", { x1: vx, y1: vy, x2: x1.toFixed(1), y2: y1.toFixed(1), style: stLine }, g);
      el("line", { x1: vx, y1: vy, x2: x2.toFixed(1), y2: y2.toFixed(1), style: stLine }, g);
      el("circle", { cx: vx, cy: vy, r: 4.5, style: "fill:" + color }, g);
      if (label) {
        var tx = el("text", { x: vx + 44, y: vy + 20, "text-anchor": "middle", style: "fill:" + color + ";font-size:15px;font-weight:700" }, g);
        tx.textContent = label;
      }
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      openBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.openIdx ? "true" : "false"); });
      lenBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.lenIdx ? "true" : "false"); });
      bCase0.setAttribute("aria-pressed", st.cmpCase === 0 ? "true" : "false");
      bCase1.setAttribute("aria-pressed", st.cmpCase === 1 ? "true" : "false");
      bOver.setAttribute("aria-pressed", st.overlaid ? "true" : "false");

      // 左栏活动角
      el("rect", { x: 6, y: 8, width: 156, height: 174, rx: 8, style: "fill:var(--card);stroke:var(--line)" }, g);
      var t1 = el("text", { x: 84, y: 28, "text-anchor": "middle", style: "fill:var(--fg);font-size:15px;font-weight:700" }, g);
      t1.textContent = "活动角";
      drawOneAngle(28, 146, openDegs[st.openIdx], armLens[st.lenIdx], "var(--a)", openLabels[st.openIdx], false);

      // 右栏叠合比角
      el("rect", { x: 170, y: 8, width: 184, height: 174, rx: 8, style: "fill:var(--card);stroke:var(--line)" }, g);
      var t2 = el("text", { x: 262, y: 28, "text-anchor": "middle", style: "fill:var(--fg);font-size:15px;font-weight:700" }, g);
      t2.textContent = st.overlaid ? "顶点对齐、一边重合" : "比一比：蓝角与橙角";

      var blueDeg = st.cmpCase === 0 ? 48 : 66;
      var orangeDeg = st.cmpCase === 0 ? 48 : 36;
      var blueVx = st.overlaid ? 210 : 186;
      var orangeVx = st.overlaid ? 210 : 256;

      drawOneAngle(orangeVx, 146, orangeDeg, 88, "var(--b)", st.overlaid ? "" : "橙角", false);
      drawOneAngle(blueVx, 146, blueDeg, 52, "var(--a)", st.overlaid ? "" : "蓝角", st.overlaid);

      if (st.overlaid) {
        var tRes = el("text", { x: 262, y: 170, "text-anchor": "middle", style: "fill:var(--a);font-size:15px;font-weight:700" }, g);
        tRes.textContent = st.cmpCase === 0 ? "两边重合 → 一样大！" : "蓝角张口大 → 蓝角大！";
      }

      if (st.cmpCase === 0) {
        readout(read,
          "活动角：<b>" + openLabels[st.openIdx] + " · " + lenLabels[st.lenIdx] + "</b>。对比①：蓝角边短、橙角边长，叠合后<b>两条边完全重合</b>，说明<b>角的大小与边的长短无关</b>！",
          "蓝角边短、橙角边长，叠合后两条边完全重合，说明角的大小与边的长短无关。");
      } else {
        readout(read,
          "活动角：<b>" + openLabels[st.openIdx] + " · " + lenLabels[st.lenIdx] + "</b>。对比②：蓝角虽然边短，但叠合后<b>张口比橙角大</b>，所以<b>蓝角大于橙角</b>！",
          "蓝角虽然边短，但叠合后张口比橙角大，所以蓝角大于橙角。");
      }

      U.emit(root, Object.assign({mode: "angle", preset: "p3a-u5-3:angle"}, st));
    }
    draw();

      },
      right: function (root) {


    var st = { mode: 0, caseIdx: 0, rulerOn: true, foldStep: 0, drawStep: 0 };
    var cases = [
      { name: "① 正放的角", baseDeg: 0, openDeg: 90, isRight: true, msg: "完全重合 → 是直角！" },
      { name: "② 斜放的角", baseDeg: 32, openDeg: 90, isRight: true, msg: "斜着放也完全重合 → 也是直角！" },
      { name: "③ 尖尖小角", baseDeg: 0, openDeg: 55, isRight: false, msg: "另一边在直角里面 → 比直角小" },
      { name: "④ 张开大角", baseDeg: 0, openDeg: 120, isRight: false, msg: "另一边在直角外面 → 比直角大" }
    ];

    var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "group", "aria-label": "三角尺比直角、折直角与画直角实验" }, root);
    var g = el("g", {}, svg);
    var ctr1 = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr1); root.appendChild(ctr2); root.appendChild(read);

    var modeBtns = ["比直角", "用纸折直角", "用三角尺画直角"].map(function (t, i) {
      return btn(t, function () { st.mode = i; draw(); logI("u5-right-mode", { mode: i }); }, ctr1);
    });

    function drawSetSquare(vx, vy, baseDeg, legLen) {
      var gs = el("g", { transform: "translate(" + vx + "," + vy + ") rotate(" + (-baseDeg) + ")" }, g);
      el("polygon", {
        points: "0,0 " + legLen + ",0 0," + (-legLen),
        style: "fill:var(--hl-soft);opacity:0.78;stroke:var(--c);stroke-width:2.2"
      }, gs);
      el("polyline", { points: "0,-14 14,-14 14,0", style: "fill:none;stroke:var(--b);stroke-width:2.5" }, gs);
    }

    function rebuildSub() {
      while (ctr2.firstChild) ctr2.removeChild(ctr2.firstChild);
      if (st.mode === 0) {
        cases.forEach(function (c, idx) {
          var b = btn(c.name, function () { st.caseIdx = idx; draw(); }, ctr2);
          b.setAttribute("aria-pressed", idx === st.caseIdx ? "true" : "false");
        });
        var br = btn(st.rulerOn ? "移开三角尺" : "移来三角尺比一比", function () { st.rulerOn = !st.rulerOn; draw(); }, ctr2);
        br.setAttribute("aria-pressed", st.rulerOn ? "true" : "false");
      } else if (st.mode === 1) {
        ["第1步：圆纸片", "第2步：对折一次", "第3步：再对折出直角"].forEach(function (t, idx) {
          var b = btn(t, function () { st.foldStep = idx; draw(); }, ctr2);
          b.setAttribute("aria-pressed", idx === st.foldStep ? "true" : "false");
        });
      } else {
        ["第1步：顶点与一边", "第2步：沿尺画另一边", "第3步：标符号┐"].forEach(function (t, idx) {
          var b = btn(t, function () { st.drawStep = idx; draw(); }, ctr2);
          b.setAttribute("aria-pressed", idx === st.drawStep ? "true" : "false");
        });
      }
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      modeBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.mode ? "true" : "false"); });
      rebuildSub();

      if (st.mode === 0) {
        var c = cases[st.caseIdx];
        var vx = 140, vy = 148, arm = 95;
        var r1 = c.baseDeg * Math.PI / 180, r2 = (c.baseDeg + c.openDeg) * Math.PI / 180;
        var x1 = vx + Math.cos(r1) * arm, y1 = vy - Math.sin(r1) * arm;
        var x2 = vx + Math.cos(r2) * arm, y2 = vy - Math.sin(r2) * arm;

        var tt = el("text", { x: 180, y: 24, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, g);
        tt.textContent = "检验对象：" + c.name;

        el("line", { x1: vx, y1: vy, x2: x1.toFixed(1), y2: y1.toFixed(1), style: "stroke:var(--a);stroke-width:4;stroke-linecap:round" }, g);
        el("line", { x1: vx, y1: vy, x2: x2.toFixed(1), y2: y2.toFixed(1), style: "stroke:var(--a);stroke-width:4;stroke-linecap:round" }, g);
        el("circle", { cx: vx, cy: vy, r: 5, style: "fill:var(--a)" }, g);

        if (st.rulerOn) {
          drawSetSquare(vx, vy, c.baseDeg, 82);
          var tb = el("text", { x: 180, y: 178, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g);
          tb.textContent = c.msg;
        } else {
          drawSetSquare(260, 148, 0, 74);
        }
        readout(read,
          "<b>" + c.name + "</b>：" + c.msg + "（顶点对齐、一条直角边重合，看另一条边是否重合。）",
          c.name + "，" + c.msg);
      } else if (st.mode === 1) {
        if (st.foldStep === 0) {
          el("ellipse", { cx: 180, cy: 95, rx: 86, ry: 52, style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3" }, g);
          var f0 = el("text", { x: 180, y: 100, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g);
          f0.textContent = "一张没有直边的圆纸片";
          readout(read, "第 1 步：拿出一张没有直边的圆纸片，准备<b>对折两次</b>折出直角。", "拿出一张没有直边的圆纸片，准备对折两次折出直角。");
        } else if (st.foldStep === 1) {
          el("path", { d: "M 94 126 A 86 52 0 0 1 266 126 Z", style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3" }, g);
          el("line", { x1: 94, y1: 126, x2: 266, y2: 126, style: "stroke:var(--b);stroke-width:4" }, g);
          var f1 = el("text", { x: 180, y: 156, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g);
          f1.textContent = "第一次对折：得到一条直直的折痕";
          readout(read, "第 2 步：把纸片先对折一次，压出一条<b>直直的折痕</b>。", "把纸片先对折一次，压出一条直直的折痕。");
        } else {
          el("path", { d: "M 145 138 L 235 138 A 90 68 0 0 0 145 70 Z", style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3.5" }, g);
          el("polyline", { points: "145,120 163,120 163,138", style: "fill:none;stroke:var(--b);stroke-width:3" }, g);
          el("circle", { cx: 145, cy: 138, r: 4.5, style: "fill:var(--b)" }, g);
          var f2 = el("text", { x: 180, y: 168, "text-anchor": "middle", style: "fill:var(--a);font-size:15px;font-weight:700" }, g);
          f2.textContent = "第二次沿折痕再对折 → 折出直角！";
          readout(read, "第 3 步：<b>沿着第一条折痕对齐</b>再对折一次，两条折痕相交处就折出了一个<b>直角</b>！", "沿着第一条折痕对齐再对折一次，就折出了一个直角。");
        }
      } else {
        var vx2 = 120, vy2 = 148;
        el("line", { x1: vx2, y1: vy2, x2: vx2 + 120, y2: vy2, style: "stroke:var(--a);stroke-width:4;stroke-linecap:round" }, g);
        el("circle", { cx: vx2, cy: vy2, r: 5, style: "fill:var(--b)" }, g);
        var td0 = el("text", { x: vx2, y: vy2 + 22, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g);
        td0.textContent = "顶点";
        if (st.drawStep >= 1) {
          drawSetSquare(vx2, vy2, 0, 88);
          el("line", { x1: vx2, y1: vy2, x2: vx2, y2: vy2 - 102, style: "stroke:var(--a);stroke-width:4;stroke-linecap:round" }, g);
        }
        if (st.drawStep >= 2) {
          el("polyline", { points: vx2 + "," + (vy2 - 18) + " " + (vx2 + 18) + "," + (vy2 - 18) + " " + (vx2 + 18) + "," + vy2, style: "fill:none;stroke:var(--b);stroke-width:3" }, g);
          var td2 = el("text", { x: vx2 + 78, y: vy2 - 42, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g);
          td2.textContent = "直角符号┐";
        }
        var notes = [
          "第 1 步：先画角的<b>顶点</b>，再从顶点出发画<b>第一条直直的边</b>。",
          "第 2 步：把三角尺直角顶点对齐顶点、一条直角边重合，沿着<b>另一条直角边</b>画出第二条边。",
          "第 3 步：在角里面标上<b>直角符号「┐」</b>，直角就画好啦！"
        ];
        var displayNote = notes[st.drawStep]
          .replace(/「/g, "“").replace(/」/g, "”")
          .replace(/『/g, "‘").replace(/』/g, "’");
        readout(read, displayNote, notes[st.drawStep].replace(/<[^>]+>/g, ""));
      }

      U.emit(root, Object.assign({mode: "right", preset: "p3a-u5-3:right"}, st));
    }
    draw();

      }
    };
    factories[key](root);
  }
  function source4(root, key) {
"use strict";
var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP;
function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.innerHTML = s; return e; }
function btn(label, fn, par) { var b = h("button", "", label); b.type = "button"; b.addEventListener("click", fn); par.appendChild(b); return b; }
function readout(node, html, say, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    if (say && P) {
      var speech = node.appendChild(P.sayButton(say));
      // The original dynamic handler owns this node; initSay must not bind twice.
      if (speech.nodeType === 1) speech.setAttribute("data-say-init", "1");
      speech.addEventListener("click", function (e) { P.say(say, e.currentTarget); });
    }
  }
function logI(what, d) { if (P) P.log("interact", Object.assign({ what: what }, d || {})); }
function drawSetSquare(g, vx, vy, baseDeg, legLen) {
    var gs = el("g", { transform: "translate(" + vx + "," + vy + ") rotate(" + (-baseDeg) + ")" }, g);
    el("polygon", {
      points: "0,0 " + legLen + ",0 0," + (-legLen),
      style: "fill:var(--hl-soft);opacity:0.78;stroke:var(--c);stroke-width:2.2"
    }, gs);
    el("polyline", { points: "0,-14 14,-14 14,0", style: "fill:none;stroke:var(--b);stroke-width:2.5" }, gs);
  }
    var factories = {
      classify: function (root) {


    var samples = [
      { name: "① 队旗尖角", baseDeg: 0, openDeg: 50, kind: "锐角", color: "var(--a)",
        msg: "另一边在直角里面 → 比直角小 → 锐角！" },
      { name: "② 红领巾大角", baseDeg: 0, openDeg: 124, kind: "钝角", color: "var(--b)",
        msg: "另一边在直角外面 → 比直角大 → 钝角！" },
      { name: "③ 队旗左上角", baseDeg: 0, openDeg: 90, kind: "直角", color: "var(--c)",
        msg: "另一边与直角边完全重合 → 直角！" },
      { name: "④ 接近直角的斜角A", baseDeg: 20, openDeg: 80, kind: "锐角", color: "var(--a)",
        msg: "另一边在直角里面一点点 → 比直角小 → 锐角！" },
      { name: "⑤ 接近直角的斜角B", baseDeg: 18, openDeg: 100, kind: "钝角", color: "var(--b)",
        msg: "另一边在直角外面一点点 → 比直角大 → 钝角！" }
    ];
    var st = { idx: 0, rulerOn: true };

    var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "group", "aria-label": "三角尺比角分类器" }, root);
    var g = el("g", {}, svg);
    var ctr1 = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr1); root.appendChild(ctr2); root.appendChild(read);

    var sBtns = samples.map(function (s, i) {
      return btn(s.name, function () { st.idx = i; draw(); logI("u5-classify-sample", { idx: i }); }, ctr1);
    });
    var bRuler = btn("移开三角尺", function () { st.rulerOn = !st.rulerOn; draw(); }, ctr2);

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      sBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.idx ? "true" : "false"); });
      bRuler.textContent = st.rulerOn ? "移开三角尺" : "移来三角尺比一比";
      bRuler.setAttribute("aria-pressed", st.rulerOn ? "true" : "false");

      var s = samples[st.idx];
      var vx = 148, vy = 148, arm = 96;
      var r1 = s.baseDeg * Math.PI / 180, r2 = (s.baseDeg + s.openDeg) * Math.PI / 180;
      var x1 = vx + Math.cos(r1) * arm, y1 = vy - Math.sin(r1) * arm;
      var x2 = vx + Math.cos(r2) * arm, y2 = vy - Math.sin(r2) * arm;

      var tt = el("text", { x: 180, y: 24, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, g);
      tt.textContent = "检验：" + s.name;

      el("line", { x1: vx, y1: vy, x2: x1.toFixed(1), y2: y1.toFixed(1), style: "stroke:" + s.color + ";stroke-width:4;stroke-linecap:round" }, g);
      el("line", { x1: vx, y1: vy, x2: x2.toFixed(1), y2: y2.toFixed(1), style: "stroke:" + s.color + ";stroke-width:4;stroke-linecap:round" }, g);
      el("circle", { cx: vx, cy: vy, r: 5, style: "fill:" + s.color }, g);

      if (st.rulerOn) {
        drawSetSquare(g, vx, vy, s.baseDeg, 82);
        var tb = el("text", { x: 180, y: 178, "text-anchor": "middle", style: "fill:" + s.color + ";font-size:15px;font-weight:700" }, g);
        tb.textContent = s.msg;
      } else {
        drawSetSquare(g, 262, 148, 0, 74);
      }

      readout(read, "<b>" + s.name + "</b>：" + s.msg, s.name + "，" + s.msg);

      U.emit(root, Object.assign({mode: "classify", preset: "p3a-u5-4:classify"}, st));
    }
    draw();

      },
      combine: function (root) {


    var st = { tab: 1, comboIdx: 0, checkRuler: false, rays: 4, filter: 0 };
    var combos = [
      { name: "① 直角 + 锐角 = 钝角", degA: 90, degB: 45, kind: "钝角",
        note: "用一个<b>直角</b>和一个<b>锐角</b>拼在一起，张口比直角大，<b>一定拼出钝角</b>！" },
      { name: "② 大锐角 + 等腰锐角 = 钝角", degA: 60, degB: 45, kind: "钝角",
        note: "用长三角尺上<b>较大的锐角</b>和等腰三角尺的<b>锐角</b>相拼，超出直角，拼出<b>钝角</b>！" },
      { name: "③ 小锐角 + 等腰锐角 = 锐角", degA: 30, degB: 45, kind: "锐角",
        note: "用长三角尺上<b>较小的锐角</b>和等腰三角尺的<b>锐角</b>相拼，还在直角里面，拼出<b>锐角</b>！" },
      { name: "④ 两把等腰锐角相拼 = 直角", degA: 45, degB: 45, kind: "直角",
        note: "用两把相同等腰三角尺的<b>锐角</b>拼在一起，正好与直角重合，拼出<b>直角</b>！" }
    ];

    var svg = el("svg", { viewBox: "0 0 360 195", class: "stage", role: "group", "aria-label": "三角尺拼角与有序数角实验" }, root);
    var g = el("g", {}, svg);
    var ctr1 = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr1); root.appendChild(ctr2); root.appendChild(read);

    var tabBtns = ["认识一副三角尺", "用三角尺拼角", "有序数角"].map(function (t, i) {
      return btn(t, function () { st.tab = i; draw(); logI("u5-combine-tab", { tab: i }); }, ctr1);
    });

    function rebuildSub() {
      while (ctr2.firstChild) ctr2.removeChild(ctr2.firstChild);
      if (st.tab === 1) {
        combos.forEach(function (c, idx) {
          var b = btn(c.name, function () { st.comboIdx = idx; draw(); }, ctr2);
          b.setAttribute("aria-pressed", idx === st.comboIdx ? "true" : "false");
        });
        var bc = btn(st.checkRuler ? "移开直角尺" : "移来直角尺检验", function () { st.checkRuler = !st.checkRuler; draw(); }, ctr2);
        bc.setAttribute("aria-pressed", st.checkRuler ? "true" : "false");
      } else if (st.tab === 2) {
        [3, 4].forEach(function (n) {
          var b = btn(n + "条射线", function () { st.rays = n; st.filter = 0; draw(); }, ctr2);
          b.setAttribute("aria-pressed", st.rays === n ? "true" : "false");
        });
        ["全部角", "基本小角", "双拼角", "最大角"].forEach(function (t, idx) {
          if (st.rays === 3 && idx === 3) return;
          var b = btn(t, function () { st.filter = idx; draw(); }, ctr2);
          b.setAttribute("aria-pressed", st.filter === idx ? "true" : "false");
        });
      }
    }

    function drawRightRuler(vx, vy, sDeg, span, legA, legB, stroke) {
      // 构造真实的直角三角尺（三个内角包含精确 90° 直角）：
      // 当 span === 90 时：直角顶点在 (vx, vy)，两条直角边长分别为 legA（沿 sDeg）和 legB（沿 sDeg+90°）
      // 当 span < 90 时（30°/45°/60° 锐角放在拼接点）：
      //   顶点 0 在 (vx, vy)，直角顶点 1 在 sDeg 方向距离 legA 处，顶点 2 在 sDeg+90° 垂直方向距离 legB 处，
      //   满足 tan(span) = legB / legA，使得顶点 1 的内角精确等于 90°，顶点 0 的内角精确等于 span！
      var r1 = sDeg * Math.PI / 180;
      var u1x = Math.cos(r1), u1y = -Math.sin(r1);
      var n1x = -Math.sin(r1), n1y = -Math.cos(r1); // 逆时针旋转 90° 方向
      var p1x = vx + u1x * legA, p1y = vy + u1y * legA;
      var p2x, p2y, rvx, rvy, d1x, d1y, d2x, d2y;
      if (span === 90) {
        p2x = vx + n1x * legB; p2y = vy + n1y * legB;
        rvx = vx; rvy = vy;
        d1x = u1x; d1y = u1y;
        d2x = n1x; d2y = n1y;
      } else {
        p2x = p1x + n1x * legB; p2y = p1y + n1y * legB;
        rvx = p1x; rvy = p1y;
        d1x = -u1x; d1y = -u1y;
        d2x = n1x; d2y = n1y;
      }
      el("polygon", {
        points: vx.toFixed(2) + "," + vy.toFixed(2) + " " + p1x.toFixed(2) + "," + p1y.toFixed(2) + " " + p2x.toFixed(2) + "," + p2y.toFixed(2),
        style: "fill:var(--hl-soft);stroke:" + stroke + ";stroke-width:2.8;stroke-linejoin:round"
      }, g);
      // 在直角顶点 (rvx, rvy) 标出清晰的小直角符号
      var sq = 11;
      var s1x = rvx + d1x * sq, s1y = rvy + d1y * sq;
      var s2x = rvx + (d1x + d2x) * sq, s2y = rvy + (d1y + d2y) * sq;
      var s3x = rvx + d2x * sq, s3y = rvy + d2y * sq;
      el("polyline", {
        points: s1x.toFixed(1) + "," + s1y.toFixed(1) + " " + s2x.toFixed(1) + "," + s2y.toFixed(1) + " " + s3x.toFixed(1) + "," + s3y.toFixed(1),
        style: "fill:none;stroke:var(--c);stroke-width:2"
      }, g);
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      tabBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.tab ? "true" : "false"); });
      rebuildSub();

      if (st.tab === 0) {
        // 两把真实比例直角三角尺：左为等腰直角三角尺（1:1:√2），右为细长直角三角尺（1:√3:2）
        el("polygon", { points: "30,150 134,150 30,46", style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3;stroke-linejoin:round" }, g);
        el("polyline", { points: "30,136 44,136 44,150", style: "fill:none;stroke:var(--b);stroke-width:2.5" }, g);
        var l1 = el("text", { x: 92, y: 170, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, g);
        el("tspan", { x: 92, dy: 0 }, l1).textContent = "等腰三角尺：";
        el("tspan", { x: 92, dy: 18 }, l1).textContent = "1直角+2锐角";

        // 细长直角三角尺：底边 146，高 146 / √3 ≈ 84.29，斜边 ≈ 168.59，三内角精确为 30°-60°-90°
        el("polygon", { points: "194,150 340,150 194,65.71", style: "fill:var(--hl-soft);stroke:var(--c);stroke-width:3;stroke-linejoin:round" }, g);
        el("polyline", { points: "194,136 208,136 208,150", style: "fill:none;stroke:var(--b);stroke-width:2.5" }, g);
        var l2 = el("text", { x: 268, y: 170, "text-anchor": "middle", style: "fill:var(--c);font-size:16px;font-weight:700" }, g);
        el("tspan", { x: 268, dy: 0 }, l2).textContent = "细长三角尺：";
        el("tspan", { x: 268, dy: 18 }, l2).textContent = "1直角+2锐角";

        readout(read, "每一把三角尺都有 <b>1 个直角</b>和 <b>2 个锐角</b>（没有钝角）。", "每一把三角尺都有一个直角和两个锐角。");
      } else if (st.tab === 1) {
        var c = combos[st.comboIdx];
        var vx = 165, vy = 152;
        var tc = el("text", { x: 180, y: 24, "text-anchor": "middle", style: "fill:var(--fg);font-size:15px;font-weight:700" }, g);
        tc.textContent = c.name;

        // 第一把尺：根据所选角构造真实直角三角形
        if (c.degA === 90) {
          // 细长三角尺的直角（1 : √3 : 2）
          drawRightRuler(vx, vy, 0, 90, 96, 96 / Math.sqrt(3), "var(--a)");
        } else if (c.degA === 60) {
          // 细长三角尺的大锐角（邻直角边 : 对直角边 = 1 : √3）
          drawRightRuler(vx, vy, 0, 60, 56, 56 * Math.sqrt(3), "var(--a)");
        } else if (c.degA === 30) {
          // 细长三角尺的小锐角（邻直角边 : 对直角边 = √3 : 1）
          drawRightRuler(vx, vy, 0, 30, 96, 96 / Math.sqrt(3), "var(--a)");
        } else {
          // 等腰直角三角尺的锐角（邻直角边 : 对直角边 = 1 : 1）
          drawRightRuler(vx, vy, 0, 45, 76, 76, "var(--a)");
        }
        // 第二把尺：等腰直角三角尺的锐角（邻直角边 : 对直角边 = 1 : 1）
        drawRightRuler(vx, vy, c.degA, 45, 72, 72, "var(--b)");

        if (st.checkRuler) {
          drawSetSquare(g, vx, vy, 0, 82);
        }
        var tr = el("text", { x: 180, y: 180, "text-anchor": "middle", style: "fill:var(--b);font-size:15px;font-weight:700" }, g);
        tr.textContent = "拼出的角是：" + c.kind;
        readout(read, c.note, c.note.replace(/<[^>]+>/g, ""));
      } else {
        var n = st.rays;
        var degs = n === 3 ? [0, 34, 72] : [0, 24, 50, 78];
        var vx3 = 86, vy3 = 158, rLen = 115;
        degs.forEach(function (d) {
          var rad = d * Math.PI / 180;
          el("line", {
            x1: vx3, y1: vy3,
            x2: (vx3 + Math.cos(rad) * rLen).toFixed(1),
            y2: (vy3 - Math.sin(rad) * rLen).toFixed(1),
            style: "stroke:var(--a);stroke-width:3.5;stroke-linecap:round"
          }, g);
        });
        el("circle", { cx: vx3, cy: vy3, r: 4.5, style: "fill:var(--b)" }, g);

        function arcSpan(i1, i2, radR, col) {
          var a1 = degs[i1] * Math.PI / 180, a2 = degs[i2] * Math.PI / 180;
          var x1 = vx3 + Math.cos(a1) * radR, y1 = vy3 - Math.sin(a1) * radR;
          var x2 = vx3 + Math.cos(a2) * radR, y2 = vy3 - Math.sin(a2) * radR;
          el("path", {
            d: "M " + x1.toFixed(1) + " " + y1.toFixed(1) + " A " + radR + " " + radR + " 0 0 0 " + x2.toFixed(1) + " " + y2.toFixed(1),
            style: "fill:none;stroke:" + col + ";stroke-width:2.8"
          }, g);
        }
        if (st.filter === 0 || st.filter === 1) {
          for (var i = 0; i < n - 1; i++) arcSpan(i, i + 1, 34 + i * 5, "var(--c)");
        }
        if (st.filter === 0 || st.filter === 2) {
          for (var j = 0; j < n - 2; j++) arcSpan(j, j + 2, 62 + j * 8, "var(--b)");
        }
        if (n === 4 && (st.filter === 0 || st.filter === 3)) {
          arcSpan(0, 3, 92, "var(--a)");
        }

        var sumTxt = n === 3 ? "2 + 1 = 3（个）角" : "3 + 2 + 1 = 6（个）角";
        var ts = el("text", { x: 268, y: 98, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, g);
        ts.textContent = sumTxt;

        readout(read,
          n === 3
            ? "3 条射线有序数角：基本小角 <b>2 个</b> + 二合一大角 <b>1 个</b> = <b>2 + 1 = 3（个）</b>角。"
            : "4 条射线有序数角：基本小角 <b>3 个</b> + 双拼角 <b>2 个</b> + 三拼大角 <b>1 个</b> = <b>3 + 2 + 1 = 6（个）</b>角！",
          sumTxt);
      }

      U.emit(root, Object.assign({mode: "combine", preset: "p3a-u5-4:combine"}, st));
    }
    draw();

      }
    };
    factories[key](root);
  }
  var SOURCE_PRESETS = {
    "p3a-u5-1:lines": [source1, "lines"],
    "p3a-u5-1:points": [source1, "points"],
    "p3a-u5-1:distance": [source1, "distance"],
    "p3a-u5-2:compare": [source2, "compare"],
    "p3a-u5-2:construct": [source2, "construct"],
    "p3a-u5-3:angle": [source3, "angle"],
    "p3a-u5-3:right": [source3, "right"],
    "p3a-u5-4:classify": [source4, "classify"],
    "p3a-u5-4:combine": [source4, "combine"]
  };
  PeiyuManip.register("angleline", function (root, cfg) {
    cfg = cfg && typeof cfg === "object" ? cfg : {};
    var source = Object.prototype.hasOwnProperty.call(SOURCE_PRESETS, cfg.preset) ? SOURCE_PRESETS[cfg.preset] : null;
    if (source) {
      root.setAttribute("data-angleline-preset", cfg.preset);
      source[0](root, source[1]);
      return;
    }
    var mode = choice(cfg.mode, ["lines", "points", "distance", "compass", "angle", "right", "classify", "combine", "count"], "lines");
    var svg = el("svg", { viewBox: "0 0 360 300", class: "stage", role: "group", "aria-label": "线与角实验：" + mode }, root);
    var g = el("g", {}, svg), handles = el("g", {}, svg);
    var controls = root.appendChild(h("div", "ctrls")), fields = root.appendChild(h("div", "al-fields"));
    var read = root.appendChild(h("p", "read")); read.setAttribute("aria-live", "polite");
    var st = {}, initial, updates = [];
    function button(label, fn) { return controls.appendChild(U.btn(label, function () { fn(); draw(); })); }
    function select(label, key, values) {
      return values.map(function (v) {
        var b = button(v[1], function () { st[key] = v[0]; if (mode === "compass") { st.step = 0; st.span = null; } });
        updates.push(function () { b.setAttribute("aria-pressed", String(st[key] === v[0])); });
        return b;
      });
    }
    function range(label, key, lo, hi, step, changed) {
      var lab = fields.appendChild(h("label", "al-field")), text = lab.appendChild(h("span"));
      var input = lab.appendChild(document.createElement("input"));
      input.type = "range"; input.min = lo; input.max = hi; input.step = step; input.setAttribute("aria-label", label); input.dataset.key = key;
      input.addEventListener("input", function () { st[key] = +input.value; if (changed) changed(); draw(); });
      updates.push(function () { input.value = st[key]; text.textContent = label + "：" + round(st[key]); });
      return lab;
    }
    function line(x1, y1, x2, y2, color, dash) {
      return el("line", { x1:x1, y1:y1, x2:x2, y2:y2, style:"stroke:var(--" + (color || "a") + ");stroke-width:3.5" + (dash ? ";stroke-dasharray:6 4" : "") }, g);
    }
    function text(x, y, value, color) { var t = el("text", { x:x, y:y, "text-anchor":"middle", style:"fill:var(--" + (color || "fg") + ")" }, g); t.textContent = value; return t; }
    function dot(x, y, label, color) {
      el("circle", { cx:x, cy:y, r:5, style:"fill:var(--" + (color || "a") + ")" }, g);
      if (label) text(x, y + 26, label, color);
    }
    function arrow(x, y, angle, color) {
      var p = pt(x,y,angle+155,11), q = pt(x,y,angle-155,11);
      el("polyline", { points:p.join(",") + " " + x + "," + y + " " + q.join(","), style:"fill:none;stroke:var(--"+(color || "a")+");stroke-width:3" }, g);
    }
    function ray(x,y,a,len,color) { var p=pt(x,y,a,len); line(x,y,p[0],p[1],color); arrow(p[0],p[1],a,color); return p; }
    function arc(x,y,a,b,r,color) {
      if (a === b) return;
      var p=pt(x,y,a,r), q=pt(x,y,b,r);
      el("path", {d:"M"+p.join(" ")+" A"+r+" "+r+" 0 0 "+(b>a?0:1)+" "+q.join(" "), style:"fill:none;stroke:var(--"+(color||"b")+");stroke-width:2.5"},g);
    }
    function triangle(x,y,base,angle,len,color) {
      // The right angle is at the shared vertex for 90, at the far foot otherwise.
      var p=pt(x,y,base,len), q=angle===90?pt(x,y,base+90,len):pt(p[0],p[1],base+90,len*Math.tan(angle*Math.PI/180));
      el("polygon", {points:x+","+y+" "+p.join(",")+" "+q.join(","),style:"fill:var(--al-fill);fill-opacity:.55;stroke:var(--"+(color||"c")+");stroke-width:2"},g);
      var v=angle===90?[x,y]:p, b=angle===90?base:base+180;
      var s=pt(v[0],v[1],b,10), t=pt(s[0],s[1],base+90,10), u=pt(v[0],v[1],base+90,10);
      el("polyline", {points:s.join(",")+" "+t.join(",")+" "+u.join(","),style:"fill:none;stroke:var(--c);stroke-width:2"},g);
    }
    function protractor(x,y,base,left) {
      var p=pt(x,y,base,125), q=pt(x,y,base+180,125);
      el("path", { d:"M"+p.join(" ")+" A125 125 0 0 0 "+q.join(" ")+" Z",style:"fill:var(--al-fill);fill-opacity:.4;stroke:var(--muted);stroke-width:1.5" },g);
      for(var a=0;a<=180;a+=10) {
        var p1=pt(x,y,base+a,125), p2=pt(x,y,base+a,a%30===0?111:117);
        line(p1[0],p1[1],p2[0],p2[1],"muted");
        if(a%30===0) {
          var inner=pt(x,y,base+a,60), outer=pt(x,y,base+a,100);
          var offset=a===0||a===180?-8:6;
          text(inner[0],inner[1]+offset,a,left?"muted":"a").setAttribute("data-scale","inner");
          text(outer[0],outer[1]+offset,180-a,left?"a":"muted").setAttribute("data-scale","outer");
        }
      }
      dot(x,y,"", "c");
    }
    function handle(label, key, lo, hi, xy, fromPointer, step) {
      var node=el("g", {tabindex:0,role:"slider","aria-label":label},handles);
      el("circle", {r:28,style:"fill:transparent;pointer-events:all"},node);
      el("circle", {r:11,style:"fill:none;stroke:var(--b);stroke-width:2"},node);
      function set(v) { st[key]=Math.max(lo(),Math.min(hi(),v)); draw(); }
      // Bounds can depend on the other endpoint; update ARIA together with geometry.
      updates.push(function () {var p=xy(); node.setAttribute("transform","translate("+p.join(",")+")");node.setAttribute("aria-valuenow",st[key]);node.setAttribute("aria-valuemin",lo());node.setAttribute("aria-valuemax",hi());});
      node.addEventListener("keydown",function(e){var v=st[key];if(e.key==="Home")v=lo();else if(e.key==="End")v=hi();else if(e.key==="ArrowLeft"||e.key==="ArrowDown")v-=step;else if(e.key==="ArrowRight"||e.key==="ArrowUp")v+=step;else return;e.preventDefault();set(v);});
      var dragging=false;
      node.addEventListener("pointerdown",function(e){dragging=true;node.setPointerCapture(e.pointerId);e.preventDefault();});
      node.addEventListener("pointermove",function(e){if(!dragging)return;var p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;var ctm=svg.getScreenCTM();if(ctm)set(fromPointer(p.matrixTransform(ctm.inverse())));});
      ["pointerup","pointercancel","lostpointercapture"].forEach(function(event){node.addEventListener(event,function(){dragging=false;});});
    }
    if(mode==="lines") {
      st={kind:choice(cfg.kind,["seg","rayAB","rayBA","line"],"seg"),ax:num(cfg.ax,100,60,180),bx:260,ruler:cfg.ruler!==false}; st.bx=num(cfg.bx,260,st.ax+40,300);
      select("图形","kind",[["seg","线段 AB"],["rayAB","射线 AB"],["rayBA","射线 BA"],["line","直线 AB"]]);
      button("尺子",function(){st.ruler=!st.ruler;});
      handle("点 A", "ax",function(){return 60;},function(){return st.bx-40;},function(){return [st.ax,100];},function(p){return Math.round(p.x/10)*10;},10);
      handle("点 B", "bx",function(){return st.ax+40;},function(){return 300;},function(){return [st.bx,100];},function(p){return Math.round(p.x/10)*10;},10);
    } else if(mode==="compass") {
      st={task:choice(cfg.task,["compare","copy","path"],"compare"),ab:num(cfg.ab,3,.5,5),cd:num(cfg.cd,4,.5,5),slant:num(cfg.slant,-15,-25,25),illusion:cfg.illusion===true,step:0,span:null};
      select("任务","task",[["compare","比较长短"],["copy","连续移取"],["path","折线接力"]]);
      function unlock(){st.step=0;st.span=null;}
      var abField=range("AB 长度（厘米）","ab",.5,5,.1,unlock), cdField=range("CD 长度（厘米）","cd",.5,5,.1,unlock), slantField=range("AB 方向","slant",-25,25,1,unlock);
      var illusionButton=button("箭头错觉",function(){st.illusion=!st.illusion;unlock();});
      updates.push(function(){abField.hidden=slantField.hidden=st.task==="path";cdField.hidden=illusionButton.hidden=st.task!=="compare";});
      button("① 量取",function(){st.step=1;st.span=st.task==="path"?3:st.ab;});
      var transfer=button("② 两脚不动移到起点",function(){if(st.span!==null&&!(st.task==="path"&&st.step===4))st.step=2;});
      var mark=button("③ 画弧／接着移取",function(){if(st.step>=2)st.step=Math.min(st.task==="compare"?3:st.task==="copy"?5:4,st.step+1);if(st.task==="path"&&st.step===4)st.span=4;});
      // After measuring the second path segment, remeasure before starting over.
      updates.push(function(){transfer.disabled=st.span===null||(st.task==="path"&&st.step===4);mark.disabled=st.step<2;});
    } else if(mode==="angle"||mode==="classify") {
      st={angle:num(cfg.angle,mode==="classify"?80:60,0,180),base:num(cfg.base,0,-30,30),arm:num(cfg.arm,100,65,115),other:num(cfg.other,60,0,180),otherArm:num(cfg.otherArm,70,65,115),tool:choice(cfg.tool,["triangle","protractor","none"],"triangle"),task:mode==="classify"?"compare":choice(cfg.task,["compare","draw"],"compare"),left:cfg.left===true,overlay:false,toolOn:true,wrongPose:false,step:3,wrongScale:false};
      range("张口（度）","angle",0,180,1);range("边画长些／短些","arm",65,115,1);var baseField=range("整体旋转（度）","base",-30,30,1);
      updates.push(function(){baseField.hidden=st.task==="draw";});
      select("工具","tool",[["triangle","透明三角尺"],["protractor","量角器"],["none","不放工具"]]);
      button("移来／移开工具",function(){st.toolOn=!st.toolOn;});button("中心错位试试",function(){st.wrongPose=!st.wrongPose;});
      if(mode==="angle") {
        select("任务","task",[["compare","叠合比角"],["draw","分步画角"]]);
        var otherField=range("比较角张口（度）","other",0,180,1), otherArmField=range("比较角边长","otherArm",65,115,1);
        var overlayButton=button("叠合／分开",function(){st.overlay=!st.overlay;});
        button("反例：橙角边短张口大",function(){st.angle=55;st.arm=115;st.other=100;st.otherArm=65;st.task="compare";});
        var leftButton=button("向左／向右起笔",function(){st.left=!st.left;});
        updates.push(function(){otherField.hidden=otherArmField.hidden=overlayButton.hidden=st.task!=="compare";leftButton.hidden=st.task!=="draw";});
        [1,2,3].forEach(function(n){button(["① 对准中心和零刻度","② 找刻度点一点","③ 连出另一边"][n-1],function(){st.task="draw";st.tool="protractor";st.step=n;st.wrongScale=false;st.wrongPose=false;st.toolOn=true;});});
        button("看反内外圈试试",function(){st.task="draw";st.tool="protractor";st.step=3;st.wrongScale=true;st.wrongPose=false;st.toolOn=true;});
      } else {
        [[50,0],[124,0],[90,0],[80,20],[100,18]].forEach(function(v){button(v[0]+"° 比一比",function(){st.angle=v[0];st.base=v[1];});});
      }
      handle("活动角的另一边", "angle",function(){return 0;},function(){return 180;},function(){return pt(180,166,st.base+st.angle,st.arm);},function(p){var a=Math.atan2(166-p.y,p.x-180)*180/Math.PI-st.base;if(a< -90)a+=360;return Math.round(a);},1);
      updates.push(function(){handles.style.display=st.task==="draw"?"none":"";});
    } else if(mode==="points") {
      st={task:choice(cfg.task,["one","two","segments","rays"],"one"),n:1,miss:false,pick:0};
      select("任务","task",[["one","过一点"],["two","过两点"],["segments","数线段"],["rays","数射线"]]);
      var oneLine=button("再画一条",function(){st.n=Math.min(12,st.n+1);}), manyLines=button("画十二条",function(){st.n=12;}), missLine=button("偏一点试试",function(){st.miss=!st.miss;});
      var picks=select("线段","pick",[[0,"全部线段"],[1,"PQ"],[2,"PR"],[3,"QR"]]);
      updates.push(function(){oneLine.hidden=manyLines.hidden=st.task!=="one";missLine.hidden=st.task!=="two";picks.forEach(function(b){b.hidden=st.task!=="segments";});});
    } else if(mode==="distance") {
      st={open1:false,open2:false};
      button("拉直弯路",function(){st.open1=!st.open1;});button("拉直折线",function(){st.open2=!st.open2;});button("全部拉直",function(){st.open1=st.open2=true;});
    } else if(mode==="right") {
      st={task:choice(cfg.task,["compare","fold","draw"],"fold"),step:0,base:num(cfg.base,0,-30,30),angle:90,toolOn:true};
      select("任务","task",[["compare","比直角"],["fold","折出直角"],["draw","画直角"]]);
      var steps=select("步骤","step",[[0,"① 开始"],[1,"② 对齐／对折"],[2,"③ 完成"]]), rightBase=range("旋转（度）","base",-30,30,1);
      var angles=select("张口","angle",[[65,"小于直角"],[90,"直角"],[115,"大于直角"]]), rulerButton=button("移来／移开尺子",function(){st.toolOn=!st.toolOn;});
      updates.push(function(){steps.forEach(function(b){b.hidden=st.task==="compare";});rightBase.hidden=rulerButton.hidden=st.task==="fold";angles.forEach(function(b){b.hidden=st.task!=="compare";});});
    } else if(mode==="combine") {
      st={task:choice(cfg.task,["combine","recognize"],"combine"),combo:Math.round(num(cfg.combo,0,0,3)),toolOn:false};
      select("任务","task",[["recognize","认识一副三角尺"],["combine","拼角"]]);
      var combos=select("拼法","combo",[[0,"90° + 45°"],[1,"60° + 45°"],[2,"30° + 45°"],[3,"45° + 45°"]]), checkRuler=button("直角尺检验",function(){st.toolOn=!st.toolOn;});
      updates.push(function(){combos.forEach(function(b){b.hidden=st.task!=="combine";});checkRuler.hidden=st.task!=="combine";});
    } else if(mode==="count") {
      st={rays:cfg.rays===3?3:4,filter:Math.round(num(cfg.filter,0,0,3))};
      select("射线","rays",[[3,"三条射线"],[4,"四条射线"]]);select("筛选","filter",[[0,"全部角"],[1,"基本小角"],[2,"双拼角"],[3,"三拼角"]]);
    }
    initial=JSON.parse(JSON.stringify(st));
    button("重来",function(){Object.assign(st,JSON.parse(JSON.stringify(initial)));});
    function draw() {
      g.replaceChildren(); var result={mode:mode};
      if(mode==="lines") {
        var left=st.kind==="line"||st.kind==="rayBA", right=st.kind==="line"||st.kind==="rayAB";
        line(left?18:st.ax,100,right?342:st.bx,100);
        if(left)arrow(18,100,180);if(right)arrow(342,100,0);
        text(st.ax,140,"A");text(st.bx,140,"B");
        var aEnd=st.kind==="seg"||st.kind==="rayAB", bEnd=st.kind==="seg"||st.kind==="rayBA";
        if(aEnd)dot(st.ax,100,"","b");if(bEnd)dot(st.bx,100,"","b");
        text(180,35,st.kind==="seg"?"两端有限":st.kind==="line"?"两端无限延伸":"一端无限延伸");
        if(st.ruler){line(60,185,300,185,"muted");for(var i=0;i<=6;i++){line(60+i*40,177,60+i*40,190,"muted");text(60+i*40,215,i);}text(180,248,"厘米（只量线段）");}
        var cm=(st.bx-st.ax)/40;
        read.textContent=st.kind==="seg"?"线段 AB 有两个端点，长 "+round(cm)+" 厘米。":st.kind==="line"?"直线 AB 没有端点。A、B 是线上两点；直线不能量长度。":"射线 "+(st.kind==="rayAB"?"AB 以 A":"BA 以 B")+" 为唯一端点，经过另一点无限延伸。射线 AB 与 BA 不同，不能量整条射线的长度。";
        Object.assign(result,{kind:st.kind,ax:st.ax,bx:st.bx,endpoints:Number(aEnd)+Number(bEnd),length:st.kind==="seg"?cm:null});
      } else if(mode==="compass") {
        var unit=st.task==="compare"?40:18, x=45, y=st.task==="copy"?70:110, targetY=st.task==="compare"?240:178, end=pt(x,y,st.slant,st.ab*unit);
        if(st.task!=="path"){line(x,y,end[0],end[1]);dot(x,y,"A");dot(end[0],end[1],"B");}
        if(st.illusion&&st.task==="compare"){arrow(x,y,180,"muted");arrow(end[0],end[1],0,"muted");arrow(x,targetY,0,"muted");arrow(x+st.cd*unit,targetY,180,"muted");}
        if(st.task==="compare") {line(x,targetY,x+st.cd*unit,targetY,"b");dot(x,targetY,"C","b");dot(x+st.cd*unit,targetY,"D","b");}
        else {line(25,178,335,178,"muted");arrow(335,178,0,"muted");dot(x,178,"起点","b");}
        var span=st.span===null?st.ab:st.span, nx=x+(st.task==="path"&&st.step===4?3*unit:st.task==="copy"&&st.step>3?(st.step-3)*span*unit:0), ny=st.step>=2?targetY:y;
        var tip=st.step>=2?pt(nx,ny,20,span*unit):st.task==="path"?[x+3*unit,y]:end;
        if(st.step>0){var mid=[(nx+tip[0])/2,Math.max(12,Math.min(ny,tip[1])-30)];line(mid[0],mid[1],nx,ny,"c");line(mid[0],mid[1],tip[0],tip[1],"c");dot(nx,ny,"","c");dot(tip[0],tip[1],"","c");}
        var marks=st.task==="compare"?(st.step>=3?1:0):st.task==="copy"?Math.max(0,st.step-2):Math.min(2,Math.max(0,st.step-2));
        var total=0;
        for(var m=0;m<marks;m++){var size=st.task==="path"?(m===0?3:4):span;var start=x+total*unit;total+=size;line(start,targetY-5,x+total*unit,targetY-5,"a");arc(start,targetY,-15,20,size*unit,"c");dot(x+total*unit,targetY,"","c");}
        if(st.task==="path"){line(x,y,x+54,y,"b");line(x+54,y,x+54,y-72,"b");text(220,70,"3 cm + 4 cm");line(x,260,x+90,260,"a");text(210,266,"直路 5 cm");}
        var relation=st.ab<st.cd?"<":st.ab>st.cd?">":"=";
        read.textContent=st.step===0?"先量取 AB，固定圆规两脚的距离；再移动针尖，转动画弧。":st.step===1?"针尖对准 A，笔脚对准 B；两脚距离已经锁定。":st.step===2?"针尖已移到起点，两脚距离保持不变。":st.task==="compare"?"落点比较：AB "+relation+" CD。倾斜或箭头装饰不改变线段长度。":st.task==="copy"?marks+" 段首尾相接，每段 "+round(span)+" 厘米，总长 "+round(total)+" 厘米。":"折线两段依次移取：已移 "+marks+" 段，总长 "+total+" 厘米；两点间直路 5 厘米更短。";
        Object.assign(result,{task:st.task,step:st.step,span:st.span,ab:st.ab,cd:st.cd,relation:relation,marks:marks,total:total,landing:marks?x+total*unit:null});
      } else if(mode==="angle"||mode==="classify") {
        var drawTask=st.task==="draw", base=drawTask?0:st.base, actual=drawTask&&st.wrongScale?180-st.angle:st.angle;
        var origin=[180,166], b=drawTask&&st.left?180:base, endAngle=drawTask&&st.left?180-actual:base+actual;
        var toolX=st.wrongPose?195:180, toolY=st.wrongPose?154:166;
        if(st.toolOn&&st.tool!=="none"&&(!drawTask||st.step<3||st.wrongScale||st.wrongPose)){
          if(st.tool==="triangle")triangle(toolX,toolY,base,90,82);
          else protractor(toolX,toolY,base,drawTask&&st.left);
        }
        ray(origin[0],origin[1],b,st.arm,"a");
        var movable=pt(180,166,endAngle,st.arm);
        if(!drawTask||(st.step>=3&&!st.wrongPose)){ray(180,166,endAngle,st.arm,"a");arc(180,166,b,endAngle,32,"a");}
        if(drawTask&&st.step>=2&&!st.wrongPose){var markPoint=pt(180,166,endAngle,125);dot(markPoint[0],markPoint[1],"","c");}
        dot(180,166,"O","a");
        if(mode==="angle"&&!drawTask){var ox=st.overlay?180:120, oy=st.overlay?166:225;ray(ox,oy,base,st.otherArm,"b");ray(ox,oy,base+st.other,st.otherArm,"b");arc(ox,oy,base,base+st.other,42,"b");}
        text(180,28,actual+"° · "+kind(actual));
        var comparison=st.angle<st.other?"<":st.angle>st.other?">":"=";
        read.textContent=st.wrongPose?"工具中心没有对准顶点，不能这样比角、量角或画角；先把中心对准顶点。":drawTask?(st.wrongScale?"错误示范：看反内外圈，想画 "+st.angle+"° 却画成 "+actual+"°。":st.step===1?"① 画一条射线，量角器中心对准顶点，零刻度对准起始边。":st.step===2?"② 从"+(st.left?"左侧":"右侧")+"零刻度起，找到 "+st.angle+"° 刻度并点一点。":"③ 移开量角器，从顶点经过标记点画另一条射线，画出 "+st.angle+"°。"):(mode==="classify"?"张口 "+st.angle+"°，是"+kind(st.angle)+"。0° 不是锐角，180° 不是钝角；斜放不改变角的大小。":"蓝角 "+st.angle+"° "+comparison+" 橙角 "+st.other+"°。叠合顶点和一边来比张口；边画长或短都不改变角的大小。");
        Object.assign(result,{angle:st.angle,actual:actual,kind:kind(actual),arm:st.arm,other:st.other,comparison:comparison,task:st.task,step:st.step,overlay:st.overlay,base:base,tip:movable,toolAligned:!st.wrongPose});
      } else if(mode==="points") {
        if(st.task==="one") {for(var n=0;n<st.n;n++){var p=pt(180,130,n*15,105),q=pt(180,130,n*15+180,105);line(p[0],p[1],q[0],q[1],n%2?"b":"a");}dot(180,130,"P");read.textContent="已画 "+st.n+" 条，换个方向还能继续：过一点可以画无数条直线。";}
        else if(st.task==="two"){line(20,160,340,80);dot(100,140,"A");dot(260,100,"B");if(st.miss){line(20,140,340,140,"no",true);}read.textContent=st.miss?"偏转后仍过 A，却漏掉 B：过两个不同的点只能画一条直线。":"过两个不同的点只能画一条直线。";}
        else {var xs=[70,180,290];line(20,60,340,60,"muted");xs.forEach(function(v,i){dot(v,60,["P","Q","R"][i]);});if(st.task==="segments"){[[0,1],[0,2],[1,2]].forEach(function(pair,i){if(!st.pick||st.pick===i+1){var yy=115+i*45;line(xs[pair[0]],yy,xs[pair[1]],yy,"a");dot(xs[pair[0]],yy);dot(xs[pair[1]],yy);}});read.textContent="以这三个点为端点的线段：PQ、PR、QR，共 3 条。PR 包含 Q，也是一条线段。";}else {xs.forEach(function(v,i){var yy=115+i*45;ray(v,yy,0,340-v,"a");ray(v,yy,180,v-20,"b");dot(v,yy,"","c");});read.textContent="从 P、Q、R 各向左、向右引出一条射线，共 6 条。PQ 与 PR 是同一条射线。";}}
        Object.assign(result,{task:st.task,n:st.n,miss:st.miss,segments:3,rays:6});
      } else if(mode==="distance") {
        var routes=[[[70,100],[109,48],[160,48-Math.sqrt(103)],[211,48],[250,100]],[[70,100],[160,100+Math.sqrt(108*108-90*90)],[250,100]]];
        var lengths=routes.map(function(r,i){var length=0;for(var j=1;j<r.length;j++){length+=Math.hypot(r[j][0]-r[j-1][0],r[j][1]-r[j-1][1]);line(r[j-1][0],r[j-1][1],r[j][0],r[j][1],i?"c":"b");}return length;});
        line(70,100,250,100);dot(70,100,"A");dot(250,100,"B");line(30,190,210,190);text(270,196,"直路 10 米");
        if(st.open1){line(30,215,30+lengths[0],215,"b");text(180,211,"弯路 13 米","b");}if(st.open2){line(30,245,30+lengths[1],245,"c");text(180,241,"折线 12 米","c");}
        read.textContent="拉直时保留原路长度，再把起点对齐。两点间所有连线中线段最短；这条线段的长度是两点间的距离。";
        Object.assign(result,{lengths:lengths,straight:180,open1:st.open1,open2:st.open2});
      } else if(mode==="right") {
        if(st.task==="fold") {if(st.step===0)el("circle",{cx:180,cy:135,r:90,style:"fill:var(--al-fill);stroke:var(--a);stroke-width:2"},g);else el("path",{d:st.step===1?"M90 135 A90 90 0 0 1 270 135 Z":"M180 135 L270 135 A90 90 0 0 0 180 45 Z",style:"fill:var(--al-fill);stroke:var(--a);stroke-width:3"},g);if(st.step===2){triangle(180,135,0,90,30);}read.textContent=["准备圆纸片。","对折一次，两边重合，折出一条直径。","再对折，让两条半径重合。两条折痕垂直，得到直角。"][st.step];}
        else {if(st.toolOn)triangle(180,170,st.base,90,85);ray(180,170,st.base,110);if(st.task==="compare"||st.step>=1)ray(180,170,st.base+(st.task==="compare"?st.angle:90),110);if(st.step===2||st.task==="compare")arc(180,170,st.base,st.base+(st.task==="compare"?st.angle:90),30,"b");dot(180,170,"O");read.textContent=st.task==="compare"?"顶点与一边对齐：这是"+kind(st.angle)+"。旋转整个角，张口不变。":"先画顶点和一边，让尺子直角顶点和一条边对齐；沿另一条直角边画线，再标直角符号。";if(st.task==="draw"&&st.step===2){var a=pt(180,170,st.base,15),b=pt(a[0],a[1],st.base+90,15),c=pt(180,170,st.base+90,15);el("polyline",{points:a.join(",")+" "+b.join(",")+" "+c.join(","),style:"fill:none;stroke:var(--b);stroke-width:2"},g);}}
        Object.assign(result,{task:st.task,step:st.step,angle:st.task==="compare"?st.angle:90});
      } else if(mode==="combine") {
        if(st.task==="recognize"){triangle(35,170,0,90,95,"a");var p=el("polygon",{points:"210,170 320,170 210,"+(170-110/Math.sqrt(3)),style:"fill:var(--al-fill);stroke:var(--b);stroke-width:2"},g);p.setAttribute("data-triangle","30-60-90");text(90,215,"45° 45° 90°");text(265,215,"30° 60° 90°");el("polyline",{points:"210,156 224,156 224,170",style:"fill:none;stroke:var(--c);stroke-width:2"},g);read.textContent="每把三角尺都有一个直角和两个锐角。等腰三角尺有两个 45°；另一把有 30° 和 60°。";}
        else {var a=[90,60,30,45][st.combo],sum=a+45;triangle(180,170,0,a,a===60?45:78,"a");triangle(180,170,a,45,64,"b");if(st.toolOn)triangle(180,170,0,90,85);arc(180,170,0,sum,38);text(180,30,a+"° + 45° = "+sum+"°");read.textContent="两角共用顶点和一边，分别在这条边两侧，张口相加得 "+sum+"°，是"+kind(sum)+"。";Object.assign(result,{angle:sum,kind:kind(sum)});}
        result.task=st.task;
      } else if(mode==="count") {
        var angles=st.rays===3?[0,34,72]:[0,24,50,78],count=0;
        angles.forEach(function(a){ray(80,205,a,140);});dot(80,205,"O");
        for(var u=0;u<angles.length-1;u++)for(var v=u+1;v<angles.length;v++){if(!st.filter||v-u===st.filter){arc(80,205,angles[u],angles[v],32+(v-u)*19+u*4,["a","b","c"][u%3]);count++;}}
        text(260,120,count+" 个角");read.textContent="每两条不同射线确定一个小于平角的角。"+(st.rays===3?"全部：2 + 1 = 3 个。":"全部：3 + 2 + 1 = 6 个。")+"当前筛选有 "+count+" 个。";
        Object.assign(result,{rays:st.rays,filter:st.filter,count:count});
      }
      updates.forEach(function(fn){fn();});
      U.emit(root,result);
    }
    draw();
  });
})();
