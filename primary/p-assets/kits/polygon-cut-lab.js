/* polygon-cut-lab: load after manip.js; example cfg: {"mode":"triangle","kind":"obtuse"}.
   mode: parallelogram (default), triangle, trapezoid, parallel-perp,
   large-grid, composite, irregular-grid, lattice (new modes documented in kits/README.md).
   congruentText: "完全一样" replaces "全等" in triangle/trapezoid; default: "全等".
   readout: "predict" hides results until an operation or Reveal; default: immediate.
   a: base 4..8 (trapezoid: upper base 2..6), b: lower base 4..8, h: 2..5 cm;
   skew: 0..3 cm; progress: 0..100 (% or half-turn); kind: acute/right/obtuse;
   cut: vertex/middle; angle: 15..165 degrees (parallel-perp). Invalid numbers use defaults.
   Original prototype: dsp-rog7, seed 361a57c8927061b19e84f9b6a27cbaef54007be0 (PY-141-1).
   Product completion: dsp-rog8 / rog/codex (d141-polygon-cut-lab).
   All pieces move rigidly. Middle cut offset is a/2 from the upper left vertex,
   matching the reviewed PY-140 model; skew + offset must be <= a.
   The wooden frame locks both side lengths; it is a different experiment from cutting.
   Stage: drag horizontally or use Left/Right/Enter. Native labelled sliders also work.
   manip:change carries mode, state and measurements; answer fires once per goal/reset. */
(function () {
  "use strict";
  var M = window.PeiyuManip, U = M.util, el = U.el, h = U.h;
  var scope = '.manip[data-manip="polygon-cut-lab"]';
  var style = h("style");
  style.textContent = scope + ' {min-width:0;font-size:17px} ' +
    scope + ' .fig-scroll {max-width:100%;overflow-x:auto} ' +
    scope + ' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;touch-action:none} ' +
    scope + ' svg text {font-size:18px;fill:var(--fg)} ' +
    scope + ' .geo-fields {display:flex;flex-wrap:wrap;gap:10px;justify-content:center} ' +
    scope + ' label {display:grid;flex:1 1 180px;max-width:280px;min-width:0} ' +
    scope + ' label[hidden] {display:none} ' +
    scope + ' input {width:100%;min-width:44px;min-height:44px;touch-action:none;accent-color:var(--a)} ' +
    scope + ' select {font:inherit;min-height:44px;max-width:100%;color:var(--fg);background:var(--bg)} ' +
    scope + ' :focus-visible {outline:3px solid var(--a);outline-offset:2px}';
  document.head.appendChild(style);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function fmt(v) { return Number(v.toFixed(2)).toString(); }

  function areaOf(pts) {
    return Math.abs(pts.reduce(function (s, p, i) {
      var q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1];
    }, 0)) / 2;
  }
  function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
  function onEdge(p, a, b) {
    return Math.abs(cross(a, b, p)) < 1e-8 && p[0] >= Math.min(a[0], b[0]) - 1e-8 &&
      p[0] <= Math.max(a[0], b[0]) + 1e-8 && p[1] >= Math.min(a[1], b[1]) - 1e-8 && p[1] <= Math.max(a[1], b[1]) + 1e-8;
  }
  function simple(pts) {
    if (areaOf(pts) < 1e-8) return false;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], c = pts[(i + 2) % pts.length];
      if (pts.some(function (p, j) { return j !== i && p[0] === a[0] && p[1] === a[1]; })) return false;
      if (Math.abs(cross(a, b, c)) < 1e-8 && (onEdge(c, a, b) || onEdge(a, b, c))) return false;
      for (var j = i + 2; j < pts.length; j++) {
        if (i === 0 && j === pts.length - 1) continue;
        var d = pts[j], e = pts[(j + 1) % pts.length];
        if (onEdge(d, a, b) || onEdge(e, a, b) || onEdge(a, d, e) || onEdge(b, d, e) ||
          cross(a, b, d) * cross(a, b, e) < 0 && cross(d, e, a) * cross(d, e, b) < 0) return false;
      }
    }
    return true;
  }
  function inside(p, pts) {
    var yes = false;
    pts.forEach(function (a, i) {
      var b = pts[(i + 1) % pts.length];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) yes = !yes;
    });
    return yes;
  }
  // Half-plane clipping also preserves signed area for concave outlines.
  function clip(pts, axis, value, keepLow) {
    var out = [];
    pts.forEach(function (a, i) {
      var b = pts[(i + 1) % pts.length], da = (a[axis] - value) * (keepLow ? 1 : -1), db = (b[axis] - value) * (keepLow ? 1 : -1);
      if (da <= 0) out.push(a);
      if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
        var t = da / (da - db); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    });
    return out;
  }
  function exploration(root, cfg) {
    var mode = cfg.mode, fields = [], buttons = [], reported = false, revealed = cfg.readout !== "predict";
    var st = {
      cols: Math.round(num(cfg.cols, 10, 1, 20)), rows: Math.round(num(cfg.rows, 10, 1, 20)),
      cellSide: num(cfg.cellSide, 10, 1, 1000), count: Math.round(num(cfg.count, 0, 0, 400)),
      width: num(cfg.width, 8, 4, 10), height: num(cfg.height, 5, 3, 6),
      notchWidth: num(cfg.notchWidth, 3, 1, 3), notchHeight: num(cfg.notchHeight, 2, 1, 2),
      roof: num(cfg.roof, 2, 1, 3), cut: num(cfg.cut, 50, 10, 90), progress: num(cfg.progress, 0, 0, 100),
      shape: cfg.shape === "house" ? "house" : "l", method: ["vertical", "horizontal", "complement"].indexOf(cfg.method) < 0 ? "vertical" : cfg.method,
      contour: Math.round(num(cfg.contour, 35, 0, 100)), gridSize: Math.round(num(cfg.gridSize, 1, 0.5, 2) * 2) / 2,
      selected: 0, points: [[1, 1], [8, 1], [7, 5], [2, 4]]
    };
    ["width", "height", "notchWidth", "notchHeight", "roof"].forEach(function (key) { st[key] = Math.round(st[key] * 10) / 10; });
    ["cellSide", "cut", "progress"].forEach(function (key) { st[key] = Math.round(st[key]); });
    if (Array.isArray(cfg.points) && cfg.points.length >= 3 && cfg.points.length <= 12 && cfg.points.every(function (p) {
      return Array.isArray(p) && p.length === 2 && p.every(function (v, i) { return Number.isInteger(v) && v >= 0 && v <= (i ? 6 : 10); });
    }) && simple(cfg.points)) st.points = cfg.points.map(function (p) { return p.slice(); });
    var init = JSON.stringify(st), cellArea = num(cfg.cellArea, 1, 0.01, 10000);
    var wrap = h("div", "fig-scroll"), controls = h("div", "ctrls"), fs = h("div", "geo-fields"), read = h("p", "read"), hint = h("p", "hint");
    wrap.tabIndex = 0; wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "图示（窄屏可左右滑动）");
    var svg = el("svg", {class: "stage", viewBox: "0 0 460 260", tabindex: "0", role: mode === "lattice" ? "group" : "slider",
      "aria-label": mode === "lattice" ? "格点多边形，选择顶点后用方向键移动" : "拖动图示或用左右键调节，回车到终点"}, wrap);
    var g = el("g", {}, svg), selector, reveal;
    read.setAttribute("aria-live", "polite");
    hint.textContent = mode === "lattice" ? "选顶点，用滑块、四个方向键或拖动圆点移动。重合、交叉或面积为零的移动会被挡住。" :
      "先估一估，再调节滑块或拖动图示；也可 Tab 选中滑块后用方向键。";
    root.append(wrap, controls, fs, read, hint);
    function button(title, fn, active) {
      var b = U.btn(title, function () { fn(); draw(true); }); controls.append(b);
      if (active) buttons.push({node: b, active: active}); return b;
    }
    function field(key, title, lo, hi, step, unit) {
      var label = h("label"), caption = h("span"), input = h("input");
      input.type = "range"; input.min = lo; input.max = hi; input.step = step; input.dataset.key = key; input.setAttribute("aria-label", title);
      input.addEventListener("input", function () {
        var v = num(input.value, lo, lo, Number(input.max));
        if (key === "x" || key === "y") moveVertex(key === "x" ? 0 : 1, v);
        else { st[key] = v; draw(true); }
      });
      label.append(caption, input); fs.append(label); fields.push({key: key, title: title, caption: caption, input: input, unit: unit || ""});
    }
    if (mode === "large-grid") {
      field("cols", "每行格数", 1, 20, 1); field("rows", "行数", 1, 20, 1);
      field("cellSide", "每格边长", 1, 1000, 1, " m"); field("count", "已数格数", 0, st.cols * st.rows, 1);
      button("再数一格", function () { st.count = Math.min(st.cols * st.rows, st.count + 1); });
      button("再数一行", function () { st.count = Math.min(st.cols * st.rows, st.count + st.cols); });
    } else if (mode === "composite") {
      field("width", "总宽", 4, 10, 0.1, " cm"); field("height", "主体高", 3, 6, 0.1, " cm");
      field("notchWidth", "缺口宽", 1, 3, 0.1, " cm"); field("notchHeight", "缺口高", 1, 2, 0.1, " cm");
      field("roof", "屋顶高", 1, 3, 0.1, " cm"); field("cut", "分割位置", 10, 90, 1, "%"); field("progress", "添补进度", 0, 100, 1, "%");
      [["l", "L 形"], ["house", "房屋形"]].forEach(function (v) { button(v[1], function () { st.shape = v[0]; }, function () { return st.shape === v[0]; }); });
      [["vertical", "竖着分"], ["horizontal", "横着分"], ["complement", "添补再减"]].forEach(function (v) {
        button(v[1], function () { st.method = v[0]; }, function () { return st.method === v[0]; });
      });
    } else if (mode === "irregular-grid") {
      field("contour", "轮廓形变", 0, 100, 1, "%"); field("gridSize", "格网边长", 0.5, 2, 0.5, " 单位");
    } else {
      var label = h("label"), caption = h("span"); caption.textContent = "选择顶点"; selector = h("select"); selector.setAttribute("aria-label", "选择顶点");
      st.points.forEach(function (_, i) { var opt = h("option"); opt.value = i; opt.textContent = "顶点 " + (i + 1); selector.append(opt); });
      selector.addEventListener("change", function () { st.selected = Number(selector.value); draw(false); }); label.append(caption, selector); fs.append(label);
      field("x", "顶点横坐标", 0, 10, 1); field("y", "顶点纵坐标", 0, 6, 1);
    }
    if (cfg.readout === "predict") reveal = button("揭示", function () { revealed = true; });
    var reset = U.btn("重来", function () { st = JSON.parse(init); reported = false; revealed = cfg.readout !== "predict"; draw(true, true); }); controls.append(reset);
    function polygon(pts, color, attrs) {
      if (areaOf(pts) < 1e-8) return;
      return el("polygon", Object.assign({points: pts.map(function (p) { return p.join(","); }).join(" "), fill: color,
        "fill-opacity": 0.3, stroke: "var(--fg)", "stroke-width": 2}, attrs || {}), g);
    }
    function line(x1, y1, x2, y2, dash) { el("line", {x1: x1, y1: y1, x2: x2, y2: y2, stroke: "var(--fg)", "stroke-width": 1, "stroke-dasharray": dash ? "5 4" : "none"}, g); }
    function text(x, y, value) { el("text", {x: x, y: y, "text-anchor": "middle"}, g).textContent = value; }
    function grid(cols, rows, size, ox, oy) {
      for (var x = 0; x <= cols; x++) line(ox + x * size, oy, ox + x * size, oy + rows * size);
      for (var y = 0; y <= rows; y++) line(ox, oy + y * size, ox + cols * size, oy + y * size);
    }
    function draw(changed, resetting) {
      if (changed && !resetting) revealed = true;
      g.replaceChildren(); var ms = {}, result = "", goal = false;
      if (mode === "large-grid") {
        var total = st.cols * st.rows, size = Math.min(340 / st.cols, 180 / st.rows), ox = (460 - size * st.cols) / 2;
        st.count = Math.min(st.count, total);
        for (var k = 0; k < st.count; k++) el("rect", {x: ox + k % st.cols * size, y: 40 + Math.floor(k / st.cols) * size,
          width: size, height: size, fill: "var(--a)", "fill-opacity": 0.4, "data-counted": "1"}, g);
        grid(st.cols, st.rows, size, ox, 40);
        var one = st.cellSide * st.cellSide, squareMeters = total * one;
        ms = {totalCells: total, counted: st.count, cellArea: one, countedArea: st.count * one, area: squareMeters, hectares: squareMeters / 10000, squareKilometers: squareMeters / 1000000};
        text(230, 25, st.rows + " 行，每行 " + st.cols + " 格"); text(230, 247, "每格边长 " + fmt(st.cellSide) + " m");
        result = "已数 " + st.count + " 格：" + fmt(ms.countedArea) + " m²。每格 " + fmt(st.cellSide) + " × " + fmt(st.cellSide) + " = " + fmt(one) +
          " m²；共 " + st.cols + " × " + st.rows + " = " + total + " 格，总面积 " + fmt(squareMeters) + " m² = " + precise(ms.hectares) + " 公顷 = " + precise(ms.squareKilometers) + " 平方千米。";
        goal = st.count === total;
      } else if (mode === "composite") {
        var w = st.width, ht = st.height, top = st.shape === "house" ? ht + st.roof : ht;
        var pts = st.shape === "house" ? [[0, 0], [w, 0], [w, ht], [w / 2, top], [0, ht]] :
          [[0, 0], [w, 0], [w, ht - st.notchHeight], [w - st.notchWidth, ht - st.notchHeight], [w - st.notchWidth, ht], [0, ht]];
        var sc = Math.min(34, 330 / w, 170 / top), left = (460 - w * sc) / 2;
        function screen(p) { return [left + p[0] * sc, 220 - p[1] * sc]; }
        var axis = st.method === "horizontal" ? 1 : 0, cut = (axis ? top : w) * st.cut / 100;
        var landmark = st.shape === "house" ? axis ? ht : w / 2 : axis ? ht - st.notchHeight : w - st.notchWidth;
        var snapped = Math.abs(cut - landmark) <= (axis ? top : w) * 0.02;
        if (snapped) cut = landmark;
        var parts = [clip(pts, axis, cut, true), clip(pts, axis, cut, false)], areas = parts.map(areaOf);
        var missing = st.shape === "house" ? [ [[0, ht], [w / 2, top], [0, top]], [[w / 2, top], [w, ht], [w, top]] ] :
          [[[w - st.notchWidth, ht - st.notchHeight], [w, ht - st.notchHeight], [w, ht], [w - st.notchWidth, ht]]];
        if (st.method === "complement") {
          polygon(pts.map(screen), "var(--a)", {"data-piece": "original"});
          missing.forEach(function (p) { polygon(p.map(screen), "var(--c)", {"data-piece": "added", "fill-opacity": st.progress / 100 * 0.4, "stroke-dasharray": "5 4"}); });
        } else {
          parts.forEach(function (p, i) { polygon(p.map(screen), i ? "var(--c)" : "var(--a)", {"data-piece": String(i)}); });
          if (axis) line(left, 220 - cut * sc, left + w * sc, 220 - cut * sc, true);
          else line(left + cut * sc, 220, left + cut * sc, 220 - top * sc, true);
        }
        ms = {points: pts, scale: sc, area: areaOf(pts), parts: areas, cutPosition: cut, snapped: snapped,
          wholeArea: w * top, addedArea: missing.reduce(function (s, p) { return s + areaOf(p); }, 0)};
        text(230, 25, st.shape === "house" ? "房屋形：主体与屋顶" : "L 形：不重叠，不遗漏"); text(230, 247, "总宽 " + fmt(w) + " cm，总高 " + fmt(top) + " cm");
        var addedFormula = st.shape === "house" ? "两角各是三角形，合计 " + fmt(w) + " × " + fmt(st.roof) + " ÷ 2" : fmt(st.notchWidth) + " × " + fmt(st.notchHeight);
        var splitFormula = st.shape === "house" ? axis ? fmt(w) + " × " + fmt(ht) + " + " + fmt(w) + " × " + fmt(st.roof) + " ÷ 2" :
          "2 × (" + fmt(w / 2) + " × " + fmt(ht) + " + " + fmt(w / 2) + " × " + fmt(st.roof) + " ÷ 2)" :
          axis ? fmt(w) + " × " + fmt(ht - st.notchHeight) + " + " + fmt(w - st.notchWidth) + " × " + fmt(st.notchHeight) :
            fmt(w - st.notchWidth) + " × " + fmt(ht) + " + " + fmt(st.notchWidth) + " × " + fmt(ht - st.notchHeight);
        result = st.method === "complement" ? "补成长方形：" + fmt(w) + " × " + fmt(top) + " = " + precise(ms.wholeArea) + " cm²；添补部分：" + addedFormula +
          " = " + precise(ms.addedArea) + " cm²。原面积 " + precise(ms.wholeArea) + " − " + precise(ms.addedArea) + " = " + precise(ms.area) + " cm²。虚线部分是添上的，进度只改变涂色。" :
          "分割线离" + (axis ? "底边" : "左边") + " " + precise(cut) + " cm。" + (snapped ? "已吸附到图形接缝：" + splitFormula + " = " + precise(ms.area) + " cm²。" :
            "两侧面积约 " + fmt(areas[0]) + " 与 " + fmt(areas[1]) + " cm²；两块合计 " + precise(ms.area) + " cm²。") + "移动分割线，总面积不变。";
        goal = true;
      } else if (mode === "irregular-grid") {
        var outline = [], phase = st.contour / 100 * Math.PI, step = st.gridSize;
        for (var i = 0; i < 96; i++) {
          var angle = i * Math.PI / 48, radius = 1 + 0.16 * Math.sin(3 * angle + phase) + 0.08 * Math.cos(5 * angle - phase);
          outline.push([5 + 3.2 * radius * Math.cos(angle), 3 + 2.1 * radius * Math.sin(angle)]);
        }
        var full = 0, partial = 0, cells = [], gs = 30, gx = 80, gy = 40;
        for (var row = 0; row < Math.ceil(6 / step); row++) for (var col = 0; col < Math.ceil(10 / step); col++) {
          var x0 = col * step, y0 = row * step;
          var piece = clip(clip(clip(clip(outline, 0, x0, false), 0, x0 + step, true), 1, y0, false), 1, y0 + step, true), ar = areaOf(piece);
          var kind = ar < 1e-8 ? "empty" : Math.abs(ar - step * step) < 1e-8 ? "full" : "partial";
          if (kind === "full") full++; if (kind === "partial") partial++;
          cells.push({x: x0, y: y0, kind: kind});
          if (revealed && kind !== "empty") el("rect", {x: gx + x0 * gs, y: gy + y0 * gs, width: step * gs, height: step * gs,
            fill: kind === "full" ? "var(--a)" : "var(--c)", "fill-opacity": kind === "full" ? 0.45 : 0.2, "data-cell": kind}, g);
        }
        grid(Math.ceil(10 / step), Math.ceil(6 / step), step * gs, gx, gy);
        polygon(outline.map(function (p) { return [gx + p[0] * gs, gy + p[1] * gs]; }), "none", {"data-outline": "1", "stroke-width": 3});
        var unit = cellArea * step * step;
        ms = {points: outline, fullCells: full, partialCells: partial, cells: cells, cellArea: unit,
          lower: full * unit, upper: (full + partial) * unit, estimate: (full + partial / 2) * unit, polygonArea: areaOf(outline) * cellArea};
        text(230, 25, "同一轮廓，试试粗细不同的格网"); text(230, 247, "当前每格 " + precise(unit) + " cm²");
        result = "整格 " + full + " 个，不满格 " + partial + " 个（浅色）。面积在 " + precise(ms.lower) + " 与 " + precise(ms.upper) +
          " cm² 之间；不满格暂按半格估计：(" + full + " + " + partial + " ÷ 2) × " + precise(unit) + " ≈ " + precise(ms.estimate) + " cm²。半格是估计，不能当作精确面积。";
        goal = true;
      } else {
        var nodes = [], boundary = 0, interior = 0;
        grid(10, 6, 30, 80, 40);
        polygon(st.points.map(function (p) { return [80 + p[0] * 30, 220 - p[1] * 30]; }), "var(--a)", {"data-outline": "1"});
        for (var yy = 0; yy <= 6; yy++) for (var xx = 0; xx <= 10; xx++) {
          var pt = [xx, yy], edge = st.points.some(function (a, i) { return onEdge(pt, a, st.points[(i + 1) % st.points.length]); });
          var kind = edge ? "boundary" : inside(pt, st.points) ? "interior" : "outside";
          if (edge) boundary++; else if (kind === "interior") interior++;
          nodes.push({point: pt, kind: kind});
          el("circle", {cx: 80 + xx * 30, cy: 220 - yy * 30, r: revealed && kind !== "outside" ? 4 : 2,
            fill: revealed && kind === "interior" ? "var(--a)" : revealed && edge ? "var(--c)" : "var(--fg)", "data-point": kind}, g);
        }
        st.points.forEach(function (p, i) {
          el("circle", {cx: 80 + p[0] * 30, cy: 220 - p[1] * 30, r: 12, fill: "var(--bg)", stroke: i === st.selected ? "var(--a)" : "var(--fg)",
            "stroke-width": 3, "data-vertex": i}, g);
          var label = el("text", {x: 80 + p[0] * 30, y: 226 - p[1] * 30, "text-anchor": "middle", "pointer-events": "none"}, g); label.textContent = i + 1;
          el("circle", {cx: 80 + p[0] * 30, cy: 220 - p[1] * 30, r: 25, fill: "transparent", "data-vertex-hit": i}, g);
        });
        ms = {area: areaOf(st.points), boundary: boundary, interior: interior, nodes: nodes};
        text(230, 25, "单位格点：选顶点，再移动"); text(230, 252, "每小格面积 1 平方单位");
        result = "内部点 N = " + interior + "，边上点 L = " + boundary + "（含顶点）；面积 S = " + fmt(ms.area) +
          "。比较 N + L ÷ 2 − 1 = " + fmt(interior + boundary / 2 - 1) + "。只用于顶点在格点上、边不交叉且没有洞的多边形；操作实例不是一般证明。";
        goal = true;
      }
      read.textContent = revealed ? result : "先数一数、猜一猜，再操作或点“揭示”核对。";
      if (reveal) reveal.hidden = revealed;
      fields.forEach(function (f) {
        if (f.key === "count") f.input.max = st.cols * st.rows;
        var value = f.key === "x" || f.key === "y" ? st.points[st.selected][f.key === "x" ? 0 : 1] : st[f.key];
        f.input.value = value; f.caption.textContent = f.title + "：" + fmt(value) + f.unit;
        f.input.parentElement.hidden = mode === "composite" && (f.key === "roof" && st.shape !== "house" ||
          (f.key === "notchWidth" || f.key === "notchHeight") && st.shape === "house" || f.key === "progress" && st.method !== "complement" || f.key === "cut" && st.method === "complement");
      });
      buttons.forEach(function (b) { b.node.setAttribute("aria-pressed", String(b.active())); });
      if (selector) selector.value = st.selected;
      if (mode !== "lattice") {
        svg.setAttribute("aria-valuemin", "0"); svg.setAttribute("aria-valuemax", mode === "large-grid" ? st.cols * st.rows : "100");
        svg.setAttribute("aria-valuenow", mode === "large-grid" ? st.count : mode === "irregular-grid" ? st.contour : st.method === "complement" ? st.progress : st.cut);
        svg.setAttribute("aria-valuetext", read.textContent);
      }
      root.dataset.state = JSON.stringify(st); root.dataset.measurements = JSON.stringify(ms); root.dataset.revealed = String(revealed);
      if (changed) {
        U.emit(root, {mode: mode, state: JSON.parse(JSON.stringify(st)), measurements: ms});
        if (goal && !reported && !resetting) { reported = true; M.answer(root, cfg, mode + ":observed", true, true); }
      }
    }
    function precise(v) { return Number(v.toFixed(8)).toString(); }
    function moveVertex(axis, value) {
      if (st.points[st.selected][axis] === value) { draw(false); return; }
      var pts = st.points.map(function (p) { return p.slice(); }); pts[st.selected][axis] = value;
      if (simple(pts)) { st.points = pts; draw(true); }
      else { draw(false); read.textContent = "这次移动会让边交叉、重合或面积为零，请换一个格点。"; }
    }
    function stageSet(value) {
      if (mode === "large-grid") st.count = Math.round(num(value, 0, 0, st.cols * st.rows));
      else if (mode === "irregular-grid") st.contour = Math.round(num(value, 0, 0, 100));
      else if (st.method === "complement") st.progress = Math.round(num(value, 0, 0, 100));
      else st.cut = Math.round(num(value, 50, 10, 90));
      draw(true);
    }
    svg.addEventListener("keydown", function (e) {
      if (mode === "lattice" && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) >= 0) {
        e.preventDefault(); var axis = e.key === "ArrowLeft" || e.key === "ArrowRight" ? 0 : 1;
        moveVertex(axis, num(st.points[st.selected][axis] + (e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : -1), 0, 0, axis ? 6 : 10));
      } else if (mode !== "lattice" && ["ArrowLeft", "ArrowRight", "Enter"].indexOf(e.key) >= 0) {
        e.preventDefault(); var current = mode === "large-grid" ? st.count : mode === "irregular-grid" ? st.contour : st.method === "complement" ? st.progress : st.cut;
        stageSet(e.key === "Enter" ? mode === "large-grid" ? st.cols * st.rows : 100 : current + (e.key === "ArrowRight" ? 1 : -1));
      }
    });
    var dragging = false;
    function move(e) {
      var box = svg.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * 460, y = (e.clientY - box.top) / box.height * 260;
      if (mode === "lattice") {
        var pts = st.points.map(function (p) { return p.slice(); }); pts[st.selected] = [Math.round(num((x - 80) / 30, 0, 0, 10)), Math.round(num((220 - y) / 30, 0, 0, 6))];
        if (simple(pts)) {
          var changed = pts[st.selected].some(function (v, i) { return v !== st.points[st.selected][i]; }); st.points = pts; draw(changed);
        }
      } else stageSet(mode === "large-grid" ? x / 460 * st.cols * st.rows : x / 460 * 100);
    }
    svg.addEventListener("pointerdown", function (e) {
      if (mode === "lattice") {
        var vertex = e.target.closest("[data-vertex], [data-vertex-hit]"); if (!vertex) return;
        st.selected = Number(vertex.hasAttribute("data-vertex") ? vertex.dataset.vertex : vertex.dataset.vertexHit);
      }
      dragging = true; svg.setPointerCapture(e.pointerId); svg.focus(); move(e); e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) { if (dragging) move(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) { svg.addEventListener(name, function () { dragging = false; }); });
    draw(false);
  }

  M.register("polygon-cut-lab", function (root, cfg) {
    if (["large-grid", "composite", "irregular-grid", "lattice"].indexOf(cfg.mode) >= 0) {
      exploration(root, cfg); return;
    }
    var mode = ["parallelogram", "triangle", "trapezoid", "parallel-perp"].indexOf(cfg.mode) < 0 ? "parallelogram" : cfg.mode;
    var st = { a: num(cfg.a, mode === "trapezoid" ? 3 : 6, mode === "trapezoid" ? 2 : 4, mode === "trapezoid" ? 6 : 8),
      b: num(cfg.b, 7, 4, 8), h: num(cfg.h, 3, 2, 5), skew: num(cfg.skew, 2, 0, 3), p: num(cfg.progress, 0, 0, 100),
      kind: ["acute", "right", "obtuse"].indexOf(cfg.kind) < 0 ? "acute" : cfg.kind, cut: cfg.cut === "middle" ? "middle" : "vertex",
      frame: false, tilt: 0, side: 0, angle: num(cfg.angle, 60, 15, 165), parallel: false, extend: false, distance: false,
      point: num(cfg.point, 130, 70, 360) };
    ["a", "b", "h", "skew"].forEach(function (key) { st[key] = Math.round(st[key] * 10) / 10; });
    st.angle = Math.round(st.angle); st.point = Math.round(st.point);
    var progressScale = mode === "parallelogram" ? 1 : 1.8;
    st.p = Math.round(st.p * progressScale) / progressScale;
    var init = Object.assign({}, st), reported = false, fields = [], toggles = [];
    var revealed = cfg.readout !== "predict", reveal;
    var wrap = h("div", "fig-scroll");
    wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "图示（窄屏可左右滑动）"); wrap.tabIndex = 0;
    var svg = el("svg", { class: "stage", viewBox: "0 0 460 230", tabindex: "0", role: "slider", "aria-label": "拖动图示，左右方向键调整，回车完成", "aria-valuemin": "0", "aria-valuemax": "100" }, wrap);
    var g = el("g", {}, svg), controls = h("div", "ctrls"), fs = h("div", "geo-fields"), read = h("p", "read"), hint = h("p", "hint");
    read.setAttribute("aria-live", "polite");
    hint.textContent = "拖动图示或滑块；Tab 选中后用左右方向键，图示按回车可到终点。";
    root.append(wrap, controls, fs, read, hint);
    function field(key, title, lo, hi, step, unit) {
      var label = h("label"), caption = h("span"), input = h("input");
      var factor = key === "p" && mode !== "parallelogram" ? 1.8 : 1;
      input.type = "range"; input.min = lo * factor; input.max = hi * factor; input.step = step; input.tabIndex = 0;
      input.dataset.scale = factor;
      input.setAttribute("aria-label", title); input.dataset.key = key;
      label.append(caption, input); fs.appendChild(label);
      function update(v) { st[key] = num(v, st[key], lo, hi); if (key === "angle" && Math.abs(st.angle - 90) <= 2) st.angle = 90; draw(true); }
      input.addEventListener("input", function () { update(Number(input.value) / factor); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          var delta = key === "angle" && st.angle === 90 ? 3 : step / factor;
          update(st[key] + (e.key === "ArrowRight" ? 1 : -1) * delta);
        }
      });
      fields.push({ key: key, input: input, caption: caption, title: title, unit: factor === 1.8 ? "°" : unit || "", factor: factor });
    }
    function toggle(title, fn, active) {
      var b = U.btn(title, function () { fn(); draw(true, title === "重来"); }); controls.appendChild(b);
      if (active) toggles.push({ b: b, active: active }); return b;
    }
    if (mode === "parallel-perp") {
      field("angle", "两直线交角", 15, 165, 1, "°");
      field("point", "线外点 P 的水平位置", 70, 360, 1, "");
      toggle("相交 / 平行", function () { st.parallel = !st.parallel; }, function () { return st.parallel; });
      toggle("延长直线检验", function () { st.extend = !st.extend; }, function () { return st.extend; });
      toggle("比较点到直线的距离", function () { st.distance = !st.distance; }, function () { return st.distance; });
    } else {
      field("a", mode === "trapezoid" ? "上底 a" : "底 a", mode === "trapezoid" ? 2 : 4, mode === "trapezoid" ? 6 : 8, 0.1, " cm");
      if (mode === "trapezoid") field("b", "下底 b", 4, 8, 0.1, " cm");
      field("h", "高 h", 2, 5, 0.1, " cm");
      if (mode === "parallelogram") {
        field("skew", "倾斜偏移", 0, 3, 0.1, " cm"); field("tilt", "木框偏离直角", 0, 65, 1, "°");
        toggle("顶点剪三角形", function () { st.cut = "vertex"; st.p = 0; }, function () { return st.cut === "vertex"; });
        toggle("底边中间剪", function () { st.cut = "middle"; st.p = 0; }, function () { return st.cut === "middle"; });
        toggle("拉动木框", function () {
          st.frame = !st.frame;
          if (st.frame) { st.side = Math.hypot(st.h, st.skew); st.tilt = Math.round(Math.atan2(st.skew, st.h) * 180 / Math.PI); }
        }, function () { return st.frame; });
      }
      if (mode === "triangle") [ ["acute", "锐角"], ["right", "直角"], ["obtuse", "钝角"] ].forEach(function (k) {
        toggle(k[1] + "三角形", function () { st.kind = k[0]; st.p = 0; }, function () { return st.kind === k[0]; });
      });
      field("p", mode === "parallelogram" ? "平移拼合" : "旋转拼合", 0, 100, 1, "%");
    }
    if (cfg.readout === "predict" && mode !== "parallel-perp") reveal = toggle("揭示", function () { revealed = true; });
    toggle("重来", function () { st = Object.assign({}, init); reported = false; revealed = cfg.readout !== "predict"; });
    function line(x1, y1, x2, y2, color, dash) {
      return el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || "var(--fg)", "stroke-width": 2, "stroke-dasharray": dash ? "5 4" : "none" }, g);
    }
    function text(x, y, value, anchor) { el("text", { x: x, y: y, "text-anchor": anchor || "middle" }, g).textContent = value; }
    function poly(points, color, transform) {
      points = points.filter(function (v, i) { var prev = points[(i + points.length - 1) % points.length]; return Math.hypot(v[0] - prev[0], v[1] - prev[1]) > 1e-8; });
      if (points.length < 3) return;
      return el("polygon", { points: points.map(function (p) { return p.join(","); }).join(" "), fill: color, "fill-opacity": 0.3, stroke: "var(--fg)", "stroke-width": 2, transform: transform || "" }, g);
    }
    function right(x, y) { el("path", { d: "M" + x + " " + (y - 9) + " h9 v9", fill: "none", stroke: "var(--fg)", "stroke-width": 2 }, g); }
    function draw(changed, resetting) {
      if (changed && !resetting) revealed = true;
      g.replaceChildren();
      var maxSkew = st.cut === "middle" ? Math.min(3, Math.floor((st.a / 2 + 1e-9) * 10) / 10) : 3;
      if (mode === "parallelogram" && !st.frame) st.skew = Math.min(st.skew, maxSkew);
      var p = st.p / 100, a = st.a, ht = st.h, s = st.skew, measures = {}, goal = false;
      if (mode === "parallelogram") {
        if (st.frame) { ht = st.side * Math.cos(st.tilt * Math.PI / 180); s = st.side * Math.sin(st.tilt * Math.PI / 180); p = 0; }
        var scale = Math.min(25, 310 / (a + s)), x = 60, y = 170, w = a * scale, sh = s * scale, hh = ht * scale;
        var cut = sh + (st.cut === "middle" ? w / 2 : 0);
        if (st.frame) poly([[x, y], [x + w, y], [x + w + sh, y - hh], [x + sh, y - hh]], "var(--a)");
        else {
          poly([[x + cut, y], [x + w, y], [x + w + sh, y - hh], [x + cut, y - hh]], "var(--a)");
          poly([[x, y], [x + cut, y], [x + cut, y - hh], [x + sh, y - hh]], "var(--c)", "translate(" + w * p + " 0)");
          line(x + cut, y, x + cut, y - hh, "var(--c)", true);
        }
        var baseX = !st.frame && p === 1 ? x + cut : x;
        var heightX = !st.frame && p === 1 ? x + cut : x + sh;
        line(heightX, y, heightX, y - hh, "var(--b)", true); right(heightX, y);
        var baseLine = line(baseX, y + 10, baseX + w, y + 10);
        baseLine.dataset.dimension = "base";
        text(baseX + w / 2, 211, "底 a = " + fmt(a) + " cm");
        text(270, 24, "高 h = " + fmt(ht) + " cm");
        measures = { base: a, height: ht, side: Math.hypot(ht, s), area: a * ht, perimeter: 2 * (a + Math.hypot(ht, s)),
          cutOffset: st.cut === "middle" ? a / 2 : 0, cutX: cut / scale, scale: scale };
        read.textContent = "底 " + fmt(a) + " cm，高 " + fmt(ht) + " cm，斜边 " + fmt(measures.side) + " cm；S = ah = " + fmt(measures.area) + " cm²。" +
          (st.frame ? "四根木条长度不变，周长一直是 " + fmt(measures.perimeter) + " cm；面积随高改变（直角时 " + fmt(a * st.side) + " cm²）。" :
            "剪下的部分只平移，不拉伸，面积不变。" + (st.cut === "middle" ?
              "底边中间剪：从左上顶点沿上底量 a/2，再沿高剪。倾斜最多为 " + fmt(maxSkew) + " cm，保证剪线在两底内。" +
              (s === 0 ? "零倾斜时两块都是长方形。" : s === a / 2 ? "边界处右块变为直角三角形，左块是直角梯形。" : "两块都是直角梯形。") :
              s === 0 ? "零倾斜时原图已是长方形，无需剪下三角形。" : "沿左上顶点的高剪开。") +
              (p === 1 ? "已拼成长方形，两块内部不重叠，长是 a，宽是 h。" : "移动途中可能叠放；把进度拉到 100% 看无重叠拼合。"));
        goal = st.frame ? st.tilt >= 30 : p === 1;
      } else if (mode === "triangle" || mode === "trapezoid") {
        // Keep the apex angle acute even for a long base and a low altitude.
        var q = st.kind === "obtuse" ? -a * 0.35 : st.kind === "right" ? 0 : Math.min(a * 0.45, ht * ht / (2 * a));
        var pts = mode === "triangle" ? [[0, 0], [a, 0], [q, ht]] : [[0, 0], [st.b, 0], [(st.b + a) / 2, ht], [(st.b - a) / 2, ht]];
        var pivot = [(pts[1][0] + pts[2][0]) / 2, ht / 2];
        // Fit the entire rotation orbit, including the wide, low obtuse case.
        var orbit = Math.max.apply(null, pts.map(function (v) { return Math.hypot(v[0] - pivot[0], v[1] - pivot[1]); }));
        var sc = Math.min(24, 72 / orbit), ox = 230 - pivot[0] * sc, oy = 112 + pivot[1] * sc;
        var screen = pts.map(function (v) { return [ox + v[0] * sc, oy - v[1] * sc]; });
        var mid = [(screen[1][0] + screen[2][0]) / 2, (screen[1][1] + screen[2][1]) / 2];
        poly(screen, "var(--a)"); poly(screen, "var(--c)", "rotate(" + (-180 * p) + " " + mid.join(" ") + ")");
        var foot = mode === "triangle" ? q : (st.b - a) / 2;
        line(ox + foot * sc, oy - ht * sc, ox + foot * sc, oy, "var(--b)", true); right(ox + foot * sc, oy);
        if (foot < 0) line(ox + foot * sc, oy, ox, oy, "var(--b)", true);
        var base = mode === "triangle" ? a : a + st.b;
        measures = { base: base, height: ht, area: base * ht / 2, combinedArea: base * ht, degrees: 180 * p };
        text(230, 24, "旋转 " + fmt(180 * p) + "° · 高 " + fmt(ht) + " cm");
        text(230, 202, mode === "triangle" ? "原底 a = " + fmt(a) + " cm" : "上底 " + fmt(a) + " + 下底 " + fmt(st.b) + " cm");
        var same = cfg.congruentText === "完全一样" ? "完全一样的" : "全等";
        read.textContent = "两个" + same + (mode === "triangle" ? "三角形" : "梯形") + "旋转拼合，不改变面积。" +
          (p === 1 ? "已拼成平行四边形：底 " + fmt(base) + " cm，高 " + fmt(ht) + " cm，面积 " + fmt(base * ht) + " cm²。" : "转到 180° 后，拼成的平行四边形底为 " + (mode === "triangle" ? "a" : "a+b") + "。") +
          "原来的一块只占一半：S = " + (mode === "triangle" ? "ah" : "(a+b)h") + " ÷ 2 = " + fmt(measures.area) + " cm²。" +
          (mode === "triangle" && st.kind === "obtuse" ? "钝角三角形的高在底边延长线上，同样能拼合。" : "");
        goal = p === 1;
      } else {
        if (st.distance) {
          var px = st.point, ends = [40, 390, 420];
          line(35, 160, 420, 160);
          ends.concat([px]).forEach(function (end, i) { var segment = line(px, 50, end, 160, i === 3 ? "var(--a)" : "var(--c)", i !== 3); segment.dataset.segment = i === 3 ? "perpendicular" : "oblique"; });
          el("circle", { cx: px, cy: 50, r: 5, fill: "var(--fg)" }, g); right(px, 160);
          text(px, 32, "P"); text(px, 186, "垂足"); text(px - 8, 105, "5.5 cm", "end"); text(230, 211, "同一点到同一直线：垂线段最短");
          measures = { perpendicular: 5.5, oblique: ends.map(function (v) { return Math.hypot(v - px, 110) / 20; }) };
          read.textContent = "垂线段长 5.5 cm；三条斜线段分别长 " + measures.oblique.map(fmt).join("、") + " cm。同一点到同一直线，垂线段最短。";
          goal = true;
        } else {
          var rad = st.angle * Math.PI / 180, cx = 240, cy = 145;
          line(35, cy, st.extend ? 420 : 170, cy, "var(--a)");
          if (st.parallel) line(st.extend ? 35 : 245, 75, st.extend ? 420 : 375, 75, "var(--b)");
          else {
            var t0 = st.extend ? -65 : 45, t1 = 110;
            line(cx + t0 * Math.cos(rad), cy - t0 * Math.sin(rad), cx + t1 * Math.cos(rad), cy - t1 * Math.sin(rad), "var(--b)");
            if (st.extend && st.angle === 90) { right(cx, cy); text(cx + 40, 172, "垂足"); }
          }
          text(230, 24, st.parallel ? "同一平面内，两条平行直线" : "交角 " + fmt(st.angle) + "°");
          text(230, 211, st.extend ? (st.parallel ? "延长也不相交" : st.angle === 90 ? "垂直：相交成直角" : "延长后相交") : "线段没碰到，直线就平行吗？");
          measures = { angle: st.angle, parallel: st.parallel, perpendicular: !st.parallel && st.angle === 90 };
          read.textContent = st.parallel ? "同一平面内不相交的两条直线互相平行。延长后仍不相交。" : "显示的短线段没有碰到，不代表直线平行。延长后交角为 " + fmt(st.angle) + "°。" + (st.angle === 90 ? "两直线互相垂直，已标出直角与垂足。" : "把交角调到 90° 看直角符号（靠近时吸附）。");
          goal = st.extend && !st.parallel && st.angle === 90;
        }
      }
      if (!revealed && mode !== "parallel-perp") read.textContent = "先猜一猜面积怎样求，再拖动图示、调节滑块或点“揭示”核对。";
      if (reveal) reveal.hidden = revealed;
      fields.forEach(function (f) {
        if (f.key === "skew") f.input.max = maxSkew;
        f.input.value = st[f.key] * f.factor; f.caption.textContent = f.title + "：" + fmt(st[f.key] * f.factor) + f.unit;
        f.input.disabled = st.frame && ["a", "h", "skew", "p"].indexOf(f.key) >= 0 || f.key === "angle" && (st.parallel || st.distance);
        f.input.parentElement.hidden = f.key === "tilt" && !st.frame || f.key === "point" && !st.distance;
      });
      toggles.forEach(function (t) { t.b.setAttribute("aria-pressed", String(t.active())); });
      svg.setAttribute("aria-valuemin", mode === "parallel-perp" ? st.distance ? "70" : "15" : "0");
      svg.setAttribute("aria-valuemax", mode === "parallel-perp" ? st.distance ? "360" : "165" : st.frame ? "65" : "100");
      svg.setAttribute("aria-valuenow", mode === "parallel-perp" ? st.distance ? st.point : st.angle : st.frame ? st.tilt : st.p);
      svg.setAttribute("aria-valuetext", read.textContent);
      root.dataset.state = JSON.stringify(st); root.dataset.measurements = JSON.stringify(measures);
      if (changed) {
        U.emit(root, { mode: mode, state: Object.assign({}, st), measurements: measures });
        if (goal && !reported && !resetting) { reported = true; M.answer(root, cfg, mode + ":observed", true, true); }
      }
    }
    function stageSet(v) {
      if (mode === "parallel-perp" && st.distance) st.point = Math.round(num(v, 130, 70, 360));
      else if (mode === "parallel-perp") st.angle = Math.round(num(v, 90, 15, 165));
      else if (st.frame) st.tilt = Math.round(num(v, 0, 0, 65));
      else st.p = Math.round(num(v, 0, 0, 100) * progressScale) / progressScale;
      if (mode === "parallel-perp" && Math.abs(st.angle - 90) <= 2) st.angle = 90;
      draw(true);
    }
    svg.addEventListener("keydown", function (e) {
      var current = mode === "parallel-perp" ? st.distance ? st.point : st.angle : st.frame ? st.tilt : st.p;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault(); stageSet(e.key === "Enter" ? (mode === "parallel-perp" ? st.distance ? 360 : 90 : st.frame ? 65 : 100) : current + (e.key === "ArrowRight" ? 5 : -5));
      }
    });
    var dragging = false;
    function move(e) { var box = svg.getBoundingClientRect(), t = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width)); stageSet(mode === "parallel-perp" ? st.distance ? 70 + 290 * t : 15 + 150 * t : t * (st.frame ? 65 : 100)); }
    svg.addEventListener("pointerdown", function (e) { dragging = true; svg.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    svg.addEventListener("pointermove", function (e) { if (dragging) move(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) { svg.addEventListener(name, function () { dragging = false; }); });
    draw(false);
  });
})();
