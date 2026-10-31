/* polygon-cut-lab: load after manip.js; example cfg: {"mode":"triangle","kind":"obtuse"}.
   mode: parallelogram (default), triangle, trapezoid, parallel-perp.
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
    scope + ' :focus-visible {outline:3px solid var(--a);outline-offset:2px}';
  document.head.appendChild(style);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function fmt(v) { return Number(v.toFixed(2)).toString(); }

  M.register("polygon-cut-lab", function (root, cfg) {
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
    toggle("重来", function () { st = Object.assign({}, init); reported = false; });
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
        read.textContent = (mode === "triangle" ? "两个全等三角形" : "两个全等梯形") + "旋转拼合，不改变面积。" +
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
