/* circle-unroll-sector: load after manip.js. Example: {"mode":"sector-cut","n":32,"r":4}.
   mode: unroll (default), sector-cut, ring-diff, square-circle.
   d: diameter 1..5 (default 3); r: radius 2..5 (default 3; ring: 0..R, default 2);
   R: outer radius 2..5 (default 5); n: 8/16/32/64 (default 16);
   progress: 0..100 (default 0). Invalid/non-finite values are clamped/defaulted.
   Finite sectors remain genuine circular sectors under rigid motion, not triangles.
   Their scalloped boundary approaches a straight line; side r is not finite altitude.
   Drag stage or use Left/Right/Enter; controls work with pointer, touch and keyboard.
   Narrow containers have a separate native touch-pan strip below the draggable SVG.
   manip:change includes measurements; answer emits once when a mode's goal is reached.
   Seed: PY-141-1, dsp-rog7, 361a57c8927061b19e84f9b6a27cbaef54007be0.
   Product completion: dsp-rog10 (rog/codex). */
(function () {
  "use strict";
  var M = window.PeiyuManip, U = M.util, el = U.el, h = U.h;
  var scope = '.manip[data-manip="circle-unroll-sector"]', css = h("style");
  css.textContent = scope + ' {min-width:0;font-size:17px} ' +
    scope + ' .fig-scroll {max-width:100%;overflow-x:auto} ' +
    scope + ' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;touch-action:none} ' +
    scope + ' svg text {font-size:18px;fill:var(--fg)} ' +
    scope + ' .circle-pan {width:420px;min-height:44px;margin:0 auto;display:flex;align-items:center;justify-content:center;touch-action:pan-x;color:var(--fg);border-top:1px dashed var(--c)} ' +
    scope + ' .circle-pan[hidden] {display:none} ' +
    scope + ' .circle-fields {display:flex;flex-wrap:wrap;gap:10px;justify-content:center} ' +
    scope + ' label {display:grid;flex:1 1 180px;max-width:280px;min-width:0} ' +
    scope + ' input {width:100%;min-width:44px;min-height:44px;touch-action:none;accent-color:var(--a)} ' +
    scope + ' :focus-visible {outline:3px solid var(--a);outline-offset:2px}';
  document.head.appendChild(css);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function fmt(v) { return String(Number(v.toFixed(2))); }
  M.register("circle-unroll-sector", function (root, cfg) {
    var mode = ["unroll", "sector-cut", "ring-diff", "square-circle"].indexOf(cfg.mode) < 0 ? "unroll" : cfg.mode;
    var outer = num(cfg.R, 5, 2, 5);
    var st = { d: num(cfg.d, 3, 1, 5), r: num(cfg.r, mode === "ring-diff" ? 2 : 3, mode === "ring-diff" ? 0 : 2, mode === "ring-diff" ? outer : 5),
      R: outer, n: [8, 16, 32, 64].indexOf(Number(cfg.n)) < 0 ? 16 : Number(cfg.n), p: num(cfg.progress, 0, 0, 100) };
    var init = Object.assign({}, st), fields = [], nButtons = [], reported = false;
    var wrap = h("div", "fig-scroll"); wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "图示（窄屏可左右滑动）"); wrap.tabIndex = 0;
    var svg = el("svg", { class: "stage", viewBox: "0 0 460 230", tabindex: "0", role: "slider", "aria-label": "拖动图示或用左右方向键调整，回车到终点" }, wrap);
    var pan = h("div", "circle-pan"); pan.textContent = "左右滑动此处，查看全图"; wrap.appendChild(pan);
    function panHint() { pan.hidden = wrap.scrollWidth <= wrap.clientWidth + 1; }
    window.addEventListener("resize", panHint);
    var g = el("g", {}, svg), controls = h("div", "ctrls"), fs = h("div", "circle-fields"), read = h("p", "read"), hint = h("p", "hint");
    read.setAttribute("aria-live", "polite"); hint.textContent = "拖动图示或滑块；Tab 后可用左右方向键，图示按回车可到终点。读数中的圆面积用 π ≈ 3.14 估算。";
    root.append(wrap, controls, fs, read, hint);
    function field(key, title, lo, hi, step, unit) {
      var label = h("label"), caption = h("span"), input = h("input");
      input.type = "range"; input.min = lo; input.max = hi; input.step = step; input.tabIndex = 0; input.dataset.key = key; input.setAttribute("aria-label", title);
      label.append(caption, input); fs.appendChild(label);
      function update(v) { st[key] = num(v, st[key], lo, key === "r" && mode === "ring-diff" ? st.R : hi); st.r = Math.min(st.r, mode === "ring-diff" ? st.R : 5); draw(true); }
      input.addEventListener("input", function () { update(input.value); });
      input.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); update(st[key] + (e.key === "ArrowRight" ? 1 : -1) * step); } });
      fields.push({ key: key, input: input, caption: caption, title: title, unit: unit });
    }
    if (mode === "unroll") field("d", "直径 d", 1, 5, 0.1, " cm");
    else if (mode === "ring-diff") { field("R", "外半径 R", 2, 5, 0.1, " cm"); field("r", "内半径 r", 0, 5, 0.1, " cm"); }
    else field("r", "半径 r", 2, 5, 0.1, " cm");
    if (mode === "unroll" || mode === "sector-cut") field("p", mode === "unroll" ? "滚动进度" : "展开插合", 0, 100, 1, "%");
    if (mode === "sector-cut") [8, 16, 32, 64].forEach(function (n) {
      var b = U.btn(n + " 份", function () { st.n = n; draw(true); }); controls.appendChild(b); nButtons.push({ b: b, n: n });
    });
    controls.appendChild(U.btn("重来", function () { st = Object.assign({}, init); reported = false; draw(true, true); }));
    function line(x1, y1, x2, y2, color, dashed) { el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || "var(--fg)", "stroke-width": 2, "stroke-dasharray": dashed ? "5 4" : "none" }, g); }
    function text(x, y, value) { el("text", { x: x, y: y, "text-anchor": "middle" }, g).textContent = value; }
    function circle(x, y, r, color, opacity) { return el("circle", { cx: x, cy: y, r: r, fill: color, "fill-opacity": opacity == null ? 0.25 : opacity, stroke: "var(--fg)", "stroke-width": 2 }, g); }
    function draw(changed, resetting) {
      g.replaceChildren(); var p = st.p / 100, measures = {}, goal = false;
      if (mode === "unroll") {
        var rad = st.d * 10, len = Math.PI * st.d * 20, start = 55, ground = 145, cx = start + len * p, cy = ground - rad;
        line(25, ground, 435, ground, "var(--fg)");
        line(start, ground, cx, ground, "var(--a)"); g.lastChild.dataset.role = "distance";
        circle(cx, cy, rad, "var(--a)").dataset.role = "wheel";
        var theta = p * 2 * Math.PI, markX = cx - rad * Math.sin(theta), markY = cy + rad * Math.cos(theta);
        line(cx, cy, markX, markY, "var(--c)"); circle(markX, markY, 4, "var(--c)", 1).dataset.role = "mark";
        line(cx - rad, cy, cx + rad, cy, "var(--b)", true);
        line(start, 175, start + len, 175);
        for (var i = 0; i <= 3; i++) { line(start + i * st.d * 20, 169, start + i * st.d * 20, 181); g.lastChild.dataset.role = "diameter-tick-" + i; }
        var three = start + 3 * st.d * 20, approx = start + 3.14 * st.d * 20;
        line(approx, 166, approx, 181, "var(--c)"); g.lastChild.dataset.role = "approx-tick";
        line(three, 181, three - 14, 188); line(approx, 181, approx + 25, 205, "var(--c)");
        text(start, 199, "0"); text(three - 22, 199, "3d"); text(approx + 25, 224, "3.14d");
        text(230, 24, "直径 " + fmt(st.d) + " cm · 滚动 " + fmt(st.p) + "%");
        measures = { diameter: st.d, circumference: Math.PI * st.d, unrolled: Math.PI * st.d * p, threeD: 3 * st.d, approx: 3.14 * st.d };
        read.textContent = "已展开 " + fmt(measures.unrolled) + " cm。3d = " + fmt(measures.threeD) + " cm，3.14d = " + fmt(measures.approx) + " cm；一圈周长 C = πd ≈ " + fmt(measures.approx) + " cm，比 3 个直径还长一点。3.14 是近似值。";
        goal = p === 1;
      } else if (mode === "sector-cut") {
        var r = st.r * 14, alpha = Math.PI / st.n, tip = r * Math.sin(alpha), altitude = r * Math.cos(alpha), chord = 2 * tip;
        var width = st.n / 2 * chord, left = (460 - width - tip) / 2, top = 65;
        var path = "M0 0 L" + (-tip) + " " + altitude + " A" + r + " " + r + " 0 0 0 " + tip + " " + altitude + " Z";
        for (var j = 0; j < st.n; j++) {
          var row = j % 2, col = Math.floor(j / 2), tx = left + (col + (row ? 1 : 0.5)) * chord, ty = top + (row ? altitude : 0);
          var original = -180 + (j + 0.5) * 360 / st.n, target = row ? 180 : 0;
          // Choose the equivalent target rotation closest to the original: rigid motion throughout.
          while (target - original > 180) target -= 360;
          while (target - original < -180) target += 360;
          el("path", { "data-role": "sector", d: path, transform: "translate(" + (230 + (tx - 230) * p) + " " + (110 + (ty - 110) * p) + ") rotate(" + (original + (target - original) * p) + ")",
            fill: row ? "var(--b)" : "var(--a)", "fill-opacity": 0.35, stroke: "var(--fg)", "stroke-width": 1 }, g);
        }
        if (p === 1) {
          line(left, top + altitude + 10, left + width, top + altitude + 10, "var(--c)");
          g.lastChild.dataset.role = "chord-base";
          line(left - 12, top, left - 12, top + altitude, "var(--c)", true);
          g.lastChild.dataset.role = "chord-height";
          line(left + width + tip + 12, top + altitude - r, left + width + tip + 12, top + r, "var(--b)");
          g.lastChild.dataset.role = "total-height";
        }
        text(230, 24, st.n + " 等份 · 半径 " + fmt(st.r) + " cm");
        if (p === 1) {
          text(230, 190, "长 ≈ πr · 两侧边共 2r"); text(230, 220, "极限长方形：宽 = r");
        } else text(230, 220, "移动中：每块仍是扇形");
        measures = { radius: st.r, n: st.n, area: 3.14 * st.r * st.r, chordBase: st.n * st.r * Math.sin(alpha),
          halfCircumference: Math.PI * st.r, altitude: st.r * Math.cos(alpha), totalHeight: st.r * (2 - Math.cos(alpha)), side: st.r, addedPerimeter: 2 * st.r, perimeter: 2 * Math.PI * st.r + 2 * st.r };
        read.textContent = "越切越细时底边越逼近直线；有限份仍有弧边，只是近似长方形。长 ≈ πr ≈ " + fmt(3.14 * st.r) + " cm，宽逼近 r = " + fmt(st.r) + " cm。" +
          "插合完成时（100%）：蓝线为一排弦底总长 " + fmt(measures.chordBase) + " cm，蓝虚线为扇形内三角形的弦高 " + fmt(measures.altitude) +
          " cm；橙线为整幅插合图从弧顶到弧底的实际总高度 " + fmt(measures.totalHeight) + " cm。它们都不等于有限份的斜侧边 r；两种高度从两侧逼近极限宽 r。" +
          "切拼不改变面积，面积 ≈ " + fmt(measures.area) + " cm²。插合完成后的外边界含原来全部圆弧，另多两条半径 2r = " + fmt(2 * st.r) +
          " cm，外周长 = 2πr + 2r ≈ " + fmt(measures.perimeter) + " cm；移动中可能重叠，不能用外轮廓量面积或周长。";
        goal = p === 1;
      } else if (mode === "ring-diff") {
        circle(120, 112, st.R * 14, "var(--a)"); circle(120, 112, st.r * 14, "var(--card)", 1);
        line(120, 112, 120 + st.R * 14, 112, "var(--b)");
        circle(340, 112, (st.R - st.r) * 14, "var(--c)");
        text(120, 24, "圆环：先平方再相减"); text(340, 24, "错解算出的小圆");
        text(120, 211, "R = " + fmt(st.R) + "，r = " + fmt(st.r)); text(340, 211, "半径 R − r");
        measures = { correct: 3.14 * (st.R * st.R - st.r * st.r), wrong: 3.14 * (st.R - st.r) * (st.R - st.r) };
        measures.difference = measures.correct - measures.wrong;
        read.textContent = "正解：3.14 × (" + fmt(st.R) + "² − " + fmt(st.r) + "²) = " + fmt(measures.correct) + " cm²；常见错解：3.14 × (" + fmt(st.R) + " − " + fmt(st.r) + ")² = " + fmt(measures.wrong) +
          " cm²；相差 " + fmt(measures.difference) + " cm²。先减半径再平方算的是另一个小圆。" + (st.r === 0 || st.r === st.R ? "边界情形两数巧合相同，不能据此把错解当通法。" : "");
        goal = st.r > 0 && st.r < st.R;
      } else {
        var rr = st.r * 14;
        el("rect", { x: 120 - rr, y: 112 - rr, width: 2 * rr, height: 2 * rr, fill: "var(--b)", "fill-opacity": 0.15, stroke: "var(--fg)", "stroke-width": 2 }, g);
        circle(120, 112, rr, "var(--a)"); circle(340, 112, rr, "var(--a)");
        el("polygon", { points: [[340, 112 - rr], [340 + rr, 112], [340, 112 + rr], [340 - rr, 112]].map(function (v) { return v.join(","); }).join(" "), fill: "var(--c)", "fill-opacity": 0.35, stroke: "var(--fg)", "stroke-width": 2 }, g);
        line(340 - rr, 112, 340 + rr, 112, "var(--b)", true);
        text(120, 24, "外方内圆"); text(340, 24, "外圆内方"); text(120, 211, "方 : 圆 = 4 : π"); text(340, 211, "方 : 圆 = 2 : π");
        measures = { radius: st.r, outerSquare: 4 * st.r * st.r, innerSquare: 2 * st.r * st.r, circle: 3.14 * st.r * st.r };
        read.textContent = "r = " + fmt(st.r) + " cm，圆面积 ≈ " + fmt(measures.circle) + " cm²。外方内圆：方边长 2r，方面积 4r² = " + fmt(measures.outerSquare) +
          " cm²，方 : 圆 = 4 : π。外圆内方：方对角线 2r，方面积 2r² = " + fmt(measures.innerSquare) + " cm²，方 : 圆 = 2 : π。半径变化，面积比不变。";
        goal = true;
      }
      fields.forEach(function (f) { f.input.value = st[f.key]; if (f.key === "r" && mode === "ring-diff") f.input.max = st.R; f.caption.textContent = f.title + "：" + fmt(st[f.key]) + f.unit; });
      nButtons.forEach(function (b) { b.b.setAttribute("aria-pressed", String(b.n === st.n)); });
      var primary = mode === "unroll" || mode === "sector-cut" ? "p" : "r";
      svg.setAttribute("aria-valuemin", primary === "p" || mode === "ring-diff" ? 0 : 2);
      svg.setAttribute("aria-valuemax", primary === "p" ? 100 : mode === "ring-diff" ? st.R : 5);
      svg.setAttribute("aria-valuenow", st[primary]); svg.setAttribute("aria-valuetext", read.textContent);
      root.dataset.state = JSON.stringify(st); root.dataset.measurements = JSON.stringify(measures);
      panHint();
      if (changed) {
        U.emit(root, { mode: mode, state: Object.assign({}, st), measurements: measures });
        if (goal && !reported && !resetting) { reported = true; M.answer(root, cfg, mode + ":observed", true, true); }
      }
    }
    var isProgress = mode === "unroll" || mode === "sector-cut";
    function set(v) { var key = isProgress ? "p" : "r"; st[key] = num(v, st[key], isProgress || mode === "ring-diff" ? 0 : 2, isProgress ? 100 : mode === "ring-diff" ? st.R : 5); draw(true); }
    svg.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "Enter"].indexOf(e.key) < 0) return;
      e.preventDefault(); set(e.key === "Enter" ? (isProgress ? 100 : mode === "ring-diff" ? st.R / 2 : 5) : st[isProgress ? "p" : "r"] + (e.key === "ArrowRight" ? 1 : -1) * (isProgress ? 5 : 0.1));
    });
    var dragging = false;
    function move(e) { var b = svg.getBoundingClientRect(), t = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)), lo = isProgress || mode === "ring-diff" ? 0 : 2, hi = isProgress ? 100 : mode === "ring-diff" ? st.R : 5; set(lo + t * (hi - lo)); }
    svg.addEventListener("pointerdown", function (e) { dragging = true; svg.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    svg.addEventListener("pointermove", function (e) { if (dragging) move(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) { svg.addEventListener(name, function () { dragging = false; }); });
    draw(false);
  });
})();
