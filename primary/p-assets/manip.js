/* 培玉 · 小学数学 — 教具组件（方案 §5）。写法：
     <div class="manip" data-manip="fracshape" data-cfg='{"shape":"circle","n":4}'></div>
   组件：
     fracshape  分数图形：圆 / 长方形 / 正方形 / 三角形 / 纸条，平均分成 2–10 份，点一份涂色，读出几分之一。
                cfg: shape, shapes[]（可切换的形状）, n, nMin, nMax, maxPaint（默认 1）, variant（正方形切法：strips|rows|grid|diag）, editN（能否改份数）
     cakecut    切蛋糕：拖刀切成两块，「叠一叠」比大小，演示不平均分不是 1/2。cfg: cut（0.2–0.8）
     maketen    凑十：skin "frame"（十格阵）或 "sticks"（小棒）。cfg: a, b。只能往里放、满十就捆，不拆（拆捆是一下退位减法）。
     partwhole  分与合：一排点子 + 可拖的分隔条 + 分合图。cfg: n, a, dir（down 分 / up 合）, hide（盖住 left / right 一部分）, zero。
   更多教具在 p-assets/kits/*.js（竖式、分一分、方格纸、圆……），按需加载，见 p-assets/kits/README.md。
   所有数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格，刀用方向键）都能用；每个组件有「重来」。
   组件变化时在根元素上抛 manip:change 事件（detail 是当前状态）。 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var P = function () { return window.PeiyuP; };

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, onClick, aria) {
    var b = h("button", "", label); b.type = "button";
    if (aria) b.setAttribute("aria-label", aria);
    b.addEventListener("click", onClick); return b;
  }
  function activate(node, fn) {
    node.addEventListener("click", fn);
    node.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
  }
  function emit(root, detail) { try { root.dispatchEvent(new CustomEvent("manip:change", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ } }
  function manipId(root, cfg, suffix) {
    var kind = (root && root.getAttribute("data-manip")) || "manip";
    var all = document.querySelectorAll('.manip[data-manip="' + kind + '"]');
    var idx = [].indexOf.call(all, root);
    var base = (cfg && cfg.id) || (root && root.id) || (kind + (idx > 0 ? "-" + (idx + 1) : ""));
    return suffix ? base + "-" + suffix : String(base);
  }
  function emitAnswer(root, cfg, value, correct, first, suffix) {
    if (!root || typeof correct !== "boolean") return;
    var qid = manipId(root, cfg, suffix);
    root.setAttribute("data-lab-id", qid);
    var payload = { id: qid, value: value !== undefined ? String(value) : "", correct: Boolean(correct) };
    if (typeof first === "boolean") payload.first = first;
    try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: payload, bubbles: true })); } catch (e) { /* ignore */ }
    if (P()) P().log("lab", Object.assign({ _emitted: true }, payload));
  }
  function readout(node, html, say, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    if (say && P()) node.appendChild(P().sayButton(say)).addEventListener("click", function (e) { P().say(say, e.currentTarget); });
  }
  function frac(n, d) { return P() ? P().fracHTML(n, d) : n + "/" + d; }
  function fw(n, d) { return P() ? P().fracWord(n, d) : n + "/" + d; }
  function cn(n) { return P() ? P().cn(n) : String(n); }
  function logI(what, data) { if (P()) P().log("interact", Object.assign({ what: what }, data || {})); }

  /* ===================== 分数图形 ===================== */
  var SHAPE_NAME = { circle: "圆", rect: "长方形", square: "正方形", tri: "三角形", strip: "纸条" };
  var VAR_NAME = { strips: "竖着切", rows: "横着切", grid: "田字切", diag: "对角切" };
  function polyPath(pts) { return "M" + pts.map(function (p) { return p[0].toFixed(2) + " " + p[1].toFixed(2); }).join(" L") + " Z"; }
  function partsOf(shape, n, variant) {
    var out = [], i;
    if (shape === "circle") {
      var cx = 180, cy = 125, r = 105;
      for (i = 0; i < n; i++) {
        var a0 = -Math.PI / 2 + 2 * Math.PI * i / n, a1 = -Math.PI / 2 + 2 * Math.PI * (i + 1) / n;
        var p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
        out.push("M" + cx + " " + cy + " L" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " Z");
      }
      return out;
    }
    if (shape === "tri") {
      var L = [70, 215], R = [290, 215], A = [180, 215 - 220 * Math.sqrt(3) / 2];
      for (i = 0; i < n; i++) out.push(polyPath([A, [L[0] + 220 * i / n, 215], [L[0] + 220 * (i + 1) / n, 215]]));
      return out;
    }
    var x0, y0, w, hh;
    if (shape === "rect") { x0 = 50; y0 = 50; w = 260; hh = 150; }
    else if (shape === "strip") { x0 = 20; y0 = 100; w = 320; hh = 50; }
    else { x0 = 85; y0 = 30; w = 190; hh = 190; }
    if (shape === "square" && variant === "diag" && (n === 2 || n === 4)) {
      var c = [x0 + w / 2, y0 + hh / 2], TL = [x0, y0], TR = [x0 + w, y0], BR = [x0 + w, y0 + hh], BL = [x0, y0 + hh];
      return n === 2 ? [polyPath([TL, TR, BL]), polyPath([TR, BR, BL])]
        : [polyPath([TL, TR, c]), polyPath([TR, BR, c]), polyPath([BR, BL, c]), polyPath([BL, TL, c])];
    }
    if (shape === "square" && variant === "grid" && (n === 4 || n === 9)) {
      var k = Math.round(Math.sqrt(n));
      for (var r0 = 0; r0 < k; r0++) for (var c0 = 0; c0 < k; c0++)
        out.push(polyPath([[x0 + w * c0 / k, y0 + hh * r0 / k], [x0 + w * (c0 + 1) / k, y0 + hh * r0 / k], [x0 + w * (c0 + 1) / k, y0 + hh * (r0 + 1) / k], [x0 + w * c0 / k, y0 + hh * (r0 + 1) / k]]));
      return out;
    }
    var rows = shape === "square" && variant === "rows";
    for (i = 0; i < n; i++) {
      if (rows) out.push(polyPath([[x0, y0 + hh * i / n], [x0 + w, y0 + hh * i / n], [x0 + w, y0 + hh * (i + 1) / n], [x0, y0 + hh * (i + 1) / n]]));
      else out.push(polyPath([[x0 + w * i / n, y0], [x0 + w * (i + 1) / n, y0], [x0 + w * (i + 1) / n, y0 + hh], [x0 + w * i / n, y0 + hh]]));
    }
    return out;
  }
  function variantsFor(shape, n) {
    if (shape !== "square") return [];
    var v = ["strips", "rows"];
    if (n === 4 || n === 9) v.push("grid");
    if (n === 2 || n === 4) v.push("diag");
    return v;
  }

  function fracshape(root, cfg) {
    var shapes = cfg.shapes || [cfg.shape || "circle"];
    var st = { shape: cfg.shape || shapes[0], n: cfg.n || 2, variant: cfg.variant || "strips", painted: [] };
    var nMin = cfg.nMin || 2, nMax = cfg.nMax || 10, maxPaint = cfg.maxPaint || 1, init = JSON.parse(JSON.stringify(st)), reported = false;
    var svg = el("svg", { viewBox: "0 0 360 240", class: "stage", role: "group", "aria-label": "分数图形" });
    var g = el("g", {}, svg);
    root.appendChild(svg);
    var ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read);
    var shapeBtns = {};
    if (shapes.length > 1) shapes.forEach(function (s) {
      shapeBtns[s] = ctr.appendChild(btn(SHAPE_NAME[s], function () { st.shape = s; st.painted = []; reported = false; fixVariant(); draw(); logI("shape", { shape: s }); }));
    });
    var minus, plus, cnt;
    if (cfg.editN !== false) {
      var cwrap = h("span", "count");
      minus = btn("−", function () { if (st.n > nMin) { st.n--; st.painted = []; reported = false; fixVariant(); draw(); logI("n", { n: st.n }); } }, "少分一份");
      plus = btn("+", function () { if (st.n < nMax) { st.n++; st.painted = []; reported = false; fixVariant(); draw(); logI("n", { n: st.n }); } }, "多分一份");
      cnt = h("b", "", "");
      cwrap.appendChild(h("span", "", "平均分成")); cwrap.appendChild(minus); cwrap.appendChild(cnt); cwrap.appendChild(plus); cwrap.appendChild(h("span", "", "份"));
      ctr.appendChild(cwrap);
    }
    var varBtns = {};
    ["strips", "rows", "grid", "diag"].forEach(function (v) {
      varBtns[v] = ctr2.appendChild(btn(VAR_NAME[v], function () { st.variant = v; st.painted = []; reported = false; draw(); logI("variant", { variant: v }); }));
    });
    ctr2.appendChild(btn("重来", function () { st = JSON.parse(JSON.stringify(init)); reported = false; draw(); logI("reset"); }));
    function fixVariant() { var vs = variantsFor(st.shape, st.n); if (vs.indexOf(st.variant) < 0) st.variant = vs[0] || "strips"; }
    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      var parts = partsOf(st.shape, st.n, st.variant);
      parts.forEach(function (d, i) {
        var on = st.painted.indexOf(i) >= 0;
        var p = el("path", { d: d, class: "part", tabindex: "0", role: "button", "aria-pressed": on ? "true" : "false",
          "aria-label": "第 " + (i + 1) + " 份" + (on ? "，已涂色" : ""),
          style: "fill:" + (on ? "var(--a)" : "var(--card)") + ";stroke:var(--fg);stroke-width:2.5;stroke-linejoin:round" }, g);
        activate(p, function () { toggle(i); });
      });
      Object.keys(shapeBtns).forEach(function (s) { shapeBtns[s].setAttribute("aria-pressed", s === st.shape ? "true" : "false"); });
      if (cnt) { cnt.textContent = st.n; minus.disabled = st.n <= nMin; plus.disabled = st.n >= nMax; }
      var vs = variantsFor(st.shape, st.n);
      Object.keys(varBtns).forEach(function (v) { varBtns[v].hidden = vs.length < 2 || vs.indexOf(v) < 0; varBtns[v].setAttribute("aria-pressed", v === st.variant ? "true" : "false"); });
      var m = st.painted.length;
      if (!m) readout(read, "点一份，涂上颜色。");
      else if (m === 1) readout(read, "平均分成 " + st.n + " 份，涂了 1 份，是它的 " + frac(1, st.n), "平均分成" + cn(st.n) + "份，涂了一份，是它的" + fw(1, st.n), "ok");
      else readout(read, "涂了 " + m + " 份，是 " + m + " 个 " + frac(1, st.n) + "，就是 " + frac(m, st.n), "涂了" + cn(m) + "份，就是" + fw(m, st.n), "ok");
      emit(root, { shape: st.shape, n: st.n, variant: st.variant, painted: m });
    }
    function toggle(i) {
      var k = st.painted.indexOf(i);
      if (k >= 0) st.painted.splice(k, 1);
      else { if (st.painted.length >= maxPaint) st.painted.shift(); st.painted.push(i); }
      draw();
      var p = g.querySelectorAll(".part")[i]; if (p) p.focus();
      logI("paint", { n: st.n, painted: st.painted.length });
      if (!reported && st.painted.length >= (cfg.target || 1)) {
        reported = true;
        emitAnswer(root, cfg, st.painted.length + "/" + st.n, true, true);
      }
    }
    fixVariant(); draw();
  }

  /* ===================== 切蛋糕、叠一叠 ===================== */
  function cakecut(root, cfg) {
    var X0 = 40, W = 280, Y0 = 70, H = 100;
    var st = { cut: cfg.cut || 0.35, cmp: false }, init = st.cut, firstTry = true, reported = false;
    var svg = el("svg", { viewBox: "0 0 360 230", class: "stage", role: "group", "aria-label": "切蛋糕" });
    root.appendChild(svg);
    var gL = el("g", {}, svg), gR = el("g", { style: "transition:transform .6s ease" }, svg);
    var diff = el("rect", { y: Y0 - 8, height: H + 16, rx: 6, style: "fill:none;stroke:var(--no);stroke-width:4;stroke-dasharray:8 5;opacity:0;transition:opacity .3s .5s;pointer-events:none" }, svg);
    var diffT = el("text", { y: Y0 + H + 34, "text-anchor": "middle", style: "fill:var(--no);font-size:18px;font-weight:700;opacity:0;transition:opacity .3s .5s" }, svg);
    diffT.textContent = "多出一截";
    var knife = el("g", { tabindex: "0", role: "slider", "aria-label": "刀切在哪里", "aria-valuemin": "20", "aria-valuemax": "80", style: "cursor:ew-resize" }, svg);
    var kline = el("line", { y1: Y0 - 30, y2: Y0 + H + 14, style: "stroke:var(--no);stroke-width:3;stroke-dasharray:7 5" }, knife);
    var khandle = el("circle", { cy: Y0 - 34, r: 15, style: "fill:var(--no);stroke:var(--card);stroke-width:3" }, knife);
    var kt = el("text", { y: Y0 - 29, "text-anchor": "middle", style: "fill:var(--card);font-size:16px;font-weight:700;pointer-events:none" }, knife);
    kt.textContent = "刀";
    var ctr = h("div", "ctrls"), read = h("p", "read"), hint = h("p", "hint", "拖动红色的刀，或者按左右方向键，换个地方切。");
    read.setAttribute("aria-live", "polite");
    var bCmp = btn("叠一叠", function () {
      st.cmp = !st.cmp; draw(); logI("stack", { cut: st.cut, equal: equal() });
      if (st.cmp) {
        if (equal()) {
          if (!reported) { reported = true; emitAnswer(root, cfg, "1/2", true, firstTry); }
        } else {
          emitAnswer(root, cfg, st.cut.toFixed(2), false, firstTry);
          firstTry = false;
        }
      }
    });
    ctr.appendChild(btn("随手切", function () { st.cut = [0.3, 0.35, 0.4, 0.6, 0.65, 0.7][Math.floor(Math.random() * 6)]; st.cmp = false; draw(); logI("cut", { cut: st.cut }); }));
    ctr.appendChild(btn("平均切", function () { st.cut = 0.5; st.cmp = false; draw(); logI("cut", { cut: 0.5 }); }));
    ctr.appendChild(bCmp);
    ctr.appendChild(btn("重来", function () { st.cut = init; st.cmp = false; reported = false; draw(); logI("reset"); }));
    root.appendChild(ctr); root.appendChild(read); root.appendChild(hint);
    function equal() { return Math.abs(st.cut - 0.5) < 1e-9; }
    function piece(g, x, w, color, bold) {
      while (g.firstChild) g.removeChild(g.firstChild);
      var sw = bold ? 4.5 : 2.5;
      el("rect", { x: x, y: Y0, width: w, height: H, rx: 4, style: "fill:" + color + ";stroke:var(--fg);stroke-width:" + sw }, g);
      el("rect", { x: x, y: Y0, width: w, height: 22, style: "fill:var(--card);stroke:var(--fg);stroke-width:" + sw }, g);
      for (var dx = 14; dx < w - 6; dx += 26) el("circle", { cx: x + dx, cy: Y0 + 11, r: 4, style: "fill:var(--no)" }, g);
    }
    function draw() {
      var xc = X0 + W * st.cut, wL = xc - X0, wR = X0 + W - xc;
      piece(gL, X0, wL, "var(--hl-soft)");
      piece(gR, xc, wR, st.cmp ? "var(--c)" : "var(--hl-soft)", st.cmp);
      gR.style.opacity = st.cmp ? 0.55 : 1;
      gR.style.transform = st.cmp ? "translate(" + (X0 - xc) + "px," + 0 + "px)" : "translate(0px,0px)";
      kline.setAttribute("x1", xc); kline.setAttribute("x2", xc);
      khandle.setAttribute("cx", xc); kt.setAttribute("x", xc);
      knife.style.display = st.cmp ? "none" : "";
      knife.setAttribute("aria-valuenow", Math.round(st.cut * 100));
      knife.setAttribute("aria-valuetext", equal() ? "正好在中间" : (st.cut < 0.5 ? "偏左" : "偏右"));
      var lo = Math.min(wL, wR), hi = Math.max(wL, wR);
      diff.setAttribute("x", X0 + lo); diff.setAttribute("width", Math.max(hi - lo, 0.1));
      diff.style.opacity = st.cmp && !equal() ? 1 : 0;
      diffT.setAttribute("x", X0 + (lo + hi) / 2);
      diffT.style.opacity = st.cmp && !equal() ? 1 : 0;
      bCmp.setAttribute("aria-pressed", st.cmp ? "true" : "false");
      bCmp.textContent = st.cmp ? "放回去" : "叠一叠";
      if (!st.cmp) readout(read, "切成了两块。两块一样大吗？点「叠一叠」看看。");
      else if (equal()) readout(read, "正好盖住，两块一样大！每块是这块蛋糕的 " + frac(1, 2), "正好盖住，两块一样大。每块是这块蛋糕的二分之一", "ok");
      else readout(read, "右边那块挪过来叠上，红框里多出一截：两块不一样大，不能说每块是 " + frac(1, 2), "叠上去，多出一截，两块不一样大，不能说每块是二分之一", "no");
      emit(root, { cut: st.cut, cmp: st.cmp, equal: equal() });
    }
    function setCut(c) { c = Math.round(c * 20) / 20; st.cut = Math.min(0.8, Math.max(0.2, c)); st.cmp = false; draw(); }
    knife.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setCut(st.cut - 0.05); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { setCut(st.cut + 0.05); e.preventDefault(); }
    });
    var drag = false;
    function toCut(ev) { var r = svg.getBoundingClientRect(); return ((ev.clientX - r.left) / r.width * 360 - X0) / W; }
    knife.addEventListener("pointerdown", function (ev) { drag = true; knife.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    knife.addEventListener("pointermove", function (ev) { if (drag) setCut(toCut(ev)); });
    knife.addEventListener("pointerup", function () { if (drag) { drag = false; logI("cut", { cut: st.cut }); } });
    knife.style.touchAction = "none";
    draw();
  }

  /* ===================== 凑十：十格阵 / 小棒 ===================== */
  function maketen(root, cfg) {
    var a = cfg.a || 9, b = cfg.b || 5, skin = cfg.skin || "frame";
    var st = { moved: 0 }, reported = false;
    var svg = el("svg", { viewBox: "0 0 360 250", class: "stage", role: "group", "aria-label": skin === "frame" ? "十格阵" : "小棒" });
    root.appendChild(svg);
    var gFix = el("g", {}, svg), gMov = el("g", {}, svg), gLab = el("g", {}, svg);
    var ctr = h("div", "ctrls"), read = h("p", "read"), read2 = h("p", "read");
    read.setAttribute("aria-live", "polite");
    var bOne = btn(skin === "frame" ? "放一个进去" : "拿一根过去", function () { move(); });
    ctr.appendChild(bOne);
    ctr.appendChild(btn("重来", function () { st.moved = 0; reported = false; draw(); logI("reset"); }));
    root.appendChild(ctr); root.appendChild(read); root.appendChild(read2);
    function inside() { return a + st.moved; }
    function outside() { return b - st.moved; }
    function full() { return inside() >= 10; }
    function cellPos(i) { return [80 + (i % 5) * 50, 55 + Math.floor(i / 5) * 50]; }
    function trayPos(j, total) { var w = 36, x0 = 180 - (total - 1) * w / 2; return [x0 + j * w, 200]; }
    function stickL(i) { return 46 + i * 12; }
    function stickR(j) { return 228 + j * 12; }
    function move() {
      if (outside() <= 0) return;
      if (full()) { readout(read2, "框满了，剩下的留在外面。", null, "no"); return; }
      st.moved++; draw(); logI("move", { inside: inside(), outside: outside() });
      if (full() && !reported) {
        reported = true;
        emitAnswer(root, cfg, a + "+" + b + "=" + (a + b), true, true);
      }
      var n = gMov.querySelector("[tabindex='0']"); if (n) n.focus();
    }
    function draw() {
      [gFix, gMov, gLab].forEach(function (g) { while (g.firstChild) g.removeChild(g.firstChild); });
      if (skin === "frame") {
        el("rect", { x: 55, y: 30, width: 250, height: 100, rx: 6, style: "fill:none;stroke:" + (full() ? "var(--a)" : "var(--fg)") + ";stroke-width:" + (full() ? 6 : 2.5) }, gFix);
        for (var i = 0; i < 10; i++) { var p = cellPos(i); el("rect", { x: p[0] - 25, y: p[1] - 25, width: 50, height: 50, style: "fill:var(--card);stroke:var(--line);stroke-width:2" }, gFix); }
        for (i = 0; i < a; i++) { p = cellPos(i); el("circle", { cx: p[0], cy: p[1], r: 17, style: "fill:var(--a)" }, gFix); }
        for (i = 0; i < st.moved; i++) { p = cellPos(a + i); el("circle", { cx: p[0], cy: p[1], r: 17, style: "fill:var(--b)" }, gFix); }
        var out = outside();
        for (var j = 0; j < out; j++) {
          var q = trayPos(j, out);
          var dot = el("circle", { cx: q[0], cy: q[1], r: 15, class: "part", tabindex: j === 0 ? "0" : "-1", role: "button", "aria-label": "外面的点，点一下放进框里", style: "fill:var(--b);stroke:var(--card);stroke-width:2" }, gMov);
          activate(dot, move);
        }
        el("text", { x: 180, y: 166, "text-anchor": "middle", style: "fill:var(--muted);font-size:17px" }, gLab).textContent = out ? "外面 " + out + " 个" : "外面没有了";
        if (full()) {
          var badge = el("g", {}, gLab);
          el("rect", { x: 311, y: 62, width: 44, height: 36, rx: 18, style: "fill:var(--a)" }, badge);
          el("text", { x: 333, y: 87, "text-anchor": "middle", style: "fill:#fff;font-size:20px;font-weight:700" }, badge).textContent = "10";
        }
      } else {
        var inN = inside();
        var bundled = inN >= 10;
        for (i = 0; i < Math.min(inN, 10); i++) {
          var x = bundled ? 70 + i * 8 : stickL(i);
          el("line", { x1: x, y1: 40, x2: x, y2: 150, style: "stroke:" + (i < a ? "var(--a)" : "var(--b)") + ";stroke-width:6;stroke-linecap:round" }, gFix);
        }
        if (bundled) {
          el("rect", { x: 62, y: 88, width: 88, height: 14, rx: 7, style: "fill:var(--no)" }, gFix);
          el("text", { x: 106, y: 178, "text-anchor": "middle", style: "fill:var(--a);font-size:18px;font-weight:700" }, gLab).textContent = "1 捆 = 10 根";
        } else {
          el("text", { x: 106, y: 178, "text-anchor": "middle", style: "fill:var(--muted);font-size:17px" }, gLab).textContent = inN + " 根";
        }
        out = outside();
        for (j = 0; j < out; j++) {
          var sx = stickR(j);
          var hit = el("g", { class: "part", tabindex: j === 0 ? "0" : "-1", role: "button", "aria-label": "右边的小棒，点一下拿到左边" }, gMov);
          el("rect", { x: sx - 6, y: 34, width: 12, height: 122, style: "fill:transparent" }, hit);
          el("line", { x1: sx, y1: 40, x2: sx, y2: 150, style: "stroke:var(--b);stroke-width:6;stroke-linecap:round" }, hit);
          activate(hit, move);
        }
        el("line", { x1: 200, y1: 30, x2: 200, y2: 160, style: "stroke:var(--line);stroke-width:2;stroke-dasharray:5 5" }, gLab);
        el("text", { x: 276, y: 178, "text-anchor": "middle", style: "fill:var(--muted);font-size:17px" }, gLab).textContent = out ? out + " 根" : "没有了";
      }
      bOne.disabled = full() || outside() <= 0;
      var unit = skin === "frame" ? "个" : "根";
      if (!full()) {
        readout(read, (skin === "frame" ? "框里" : "左边") + "有 " + inside() + " " + unit + "，还差 " + (10 - inside()) + " " + unit + "满十。");
        read2.innerHTML = ""; read2.className = "read";
      } else {
        var r = outside(), sum = 10 + r;
        readout(read, (skin === "frame" ? "框满了，是 10 个！外面还剩 " : "捆好了 1 捆！右边还剩 ") + r + " " + unit + "。", null, "ok");
        if (r) readout(read2, a + " 加 " + (10 - a) + " 得 10，10 加 " + r + " 得 " + sum + "。",
          cn(a) + "加" + cn(10 - a) + "得十，十加" + cn(r) + "得" + cn(sum), "ok");
        else readout(read2, a + " 加 " + (10 - a) + " 得 10。", cn(a) + "加" + cn(10 - a) + "得十", "ok");
      }
      emit(root, { inside: inside(), outside: outside(), full: full() });
    }
    draw();
  }

  /* ===================== 分与合（分合器） ===================== */
  /* cfg: n（一共几个，2–10）, a（左边几个，默认 1）, dir "down"（上面一共、下面两份：分）| "up"（上面两份、下面一共：合）,
          hide "" | "left" | "right"（盖住一部分，点「翻开」才看到）, zero false（是否允许一边是 0，课本分与合不含 0）。
     拖分隔条、方向键或「下一种分法」按顺序换分法；读数「7 可以分成 3 和 4」。 */
  function partwhole(root, cfg) {
    var n = Math.max(2, Math.min(10, cfg.n || 7)), lo = cfg.zero ? 0 : 1, hi = n - lo;
    var dir = cfg.dir || "down", hide = cfg.hide || "";
    var st = { a: Math.max(lo, Math.min(hi, cfg.a || lo)), open: !hide }, init = st.a, reported = false;
    var svg = el("svg", { viewBox: "0 0 360 250", class: "stage", role: "group", "aria-label": "分与合" });
    root.appendChild(svg);
    var gDots = el("g", {}, svg), gTree = el("g", {}, svg);
    var bar = el("g", { tabindex: "0", role: "slider", "aria-label": "分隔条，左右移动换一种分法", "aria-valuemin": String(lo), "aria-valuemax": String(hi), style: "cursor:ew-resize;touch-action:none" }, svg);
    var barHit = el("rect", { y: 10, width: 30, height: 70, style: "fill:transparent" }, bar);
    var barLine = el("rect", { y: 14, width: 6, height: 62, rx: 3, style: "fill:var(--no)" }, bar);
    var ctr = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    ctr.appendChild(btn("下一种分法", function () {
      st.a = st.a >= hi ? lo : st.a + 1; st.open = !hide; draw(); logI("split", { n: n, a: st.a });
      if (!hide && !reported) { reported = true; emitAnswer(root, cfg, st.a + "+" + (n - st.a) + "=" + n, true, true); }
    }));
    var bOpen = null;
    if (hide) bOpen = ctr.appendChild(btn("翻开看看", function () {
      st.open = !st.open; draw(); logI("peek", { open: st.open });
      if (st.open && !reported) { reported = true; emitAnswer(root, cfg, st.a + "+" + (n - st.a) + "=" + n, true, true); }
    }));
    ctr.appendChild(btn("重来", function () { st.a = init; st.open = !hide; reported = false; draw(); logI("reset"); }));
    root.appendChild(ctr); root.appendChild(read);
    var step = Math.min(32, 300 / n), x0 = 180 - step * n / 2;
    function gapX(k) { return x0 + step * k; }
    function box(g, x, y, val, color, covered) {
      el("rect", { x: x - 24, y: y - 22, width: 48, height: 44, rx: 8, style: "fill:" + (covered ? "var(--line)" : "var(--card)") + ";stroke:" + color + ";stroke-width:3" }, g);
      el("text", { x: x, y: y + 9, "text-anchor": "middle", style: "fill:" + (covered ? "var(--muted)" : color) + ";font-size:26px;font-weight:700" }, g).textContent = covered ? "?" : String(val);
    }
    function draw() {
      [gDots, gTree].forEach(function (g) { while (g.firstChild) g.removeChild(g.firstChild); });
      var b = n - st.a;
      for (var i = 0; i < n; i++) {
        var left = i < st.a, cov = !st.open && ((hide === "left" && left) || (hide === "right" && !left));
        var cx = gapX(i) + step / 2 + (left ? -6 : 6);
        el("circle", { cx: cx, cy: 45, r: Math.min(12, step / 2 - 2), style: "fill:" + (cov ? "var(--line)" : (left ? "var(--a)" : "var(--b)")) }, gDots);
      }
      if (!st.open && hide) {
        var cx0 = hide === "left" ? gapX(0) : gapX(st.a) + 6, w = (hide === "left" ? st.a : b) * step;
        el("rect", { x: cx0 - 4, y: 22, width: w + 2, height: 46, rx: 8, style: "fill:var(--card);stroke:var(--muted);stroke-width:2;stroke-dasharray:6 4" }, gDots);
        el("text", { x: cx0 + w / 2 - 2, y: 54, "text-anchor": "middle", style: "fill:var(--muted);font-size:20px;font-weight:700" }, gDots).textContent = "?";
      }
      var bx = gapX(st.a);
      barHit.setAttribute("x", bx - 15); barLine.setAttribute("x", bx - 3);
      bar.setAttribute("aria-valuenow", String(st.a));
      bar.setAttribute("aria-valuetext", n + " 分成 " + st.a + " 和 " + b);
      var top = dir === "down", yT = top ? 120 : 220, yP = top ? 220 : 120;
      var coverL = !st.open && hide === "left", coverR = !st.open && hide === "right";
      el("line", { x1: 180, y1: yT + (top ? 22 : -22), x2: 120, y2: yP + (top ? -22 : 22), style: "stroke:var(--fg);stroke-width:2.5" }, gTree);
      el("line", { x1: 180, y1: yT + (top ? 22 : -22), x2: 240, y2: yP + (top ? -22 : 22), style: "stroke:var(--fg);stroke-width:2.5" }, gTree);
      box(gTree, 180, yT, n, "var(--fg)", false);
      box(gTree, 120, yP, st.a, "var(--a)", coverL);
      box(gTree, 240, yP, b, "var(--b)", coverR);
      if (bOpen) bOpen.textContent = st.open ? "盖起来" : "翻开看看";
      if (!st.open) readout(read, "盖住的是几个？想一想，再翻开看看。");
      else readout(read, n + " 可以分成 " + st.a + " 和 " + b + "。", cn(n) + "可以分成" + cn(st.a) + "和" + cn(b), "ok");
      emit(root, { n: n, a: st.a, b: b, open: st.open });
    }
    function setA(v) {
      v = Math.max(lo, Math.min(hi, v));
      if (v !== st.a) {
        st.a = v; draw();
        if (!hide && !reported) { reported = true; emitAnswer(root, cfg, st.a + "+" + (n - st.a) + "=" + n, true, true); }
      }
    }
    bar.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { setA(st.a - 1); e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { setA(st.a + 1); e.preventDefault(); }
    });
    var drag = false;
    bar.addEventListener("pointerdown", function (ev) { drag = true; bar.setPointerCapture(ev.pointerId); ev.preventDefault(); });
    bar.addEventListener("pointermove", function (ev) {
      if (!drag) return;
      var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 360;
      setA(Math.round((x - x0) / step));
    });
    bar.addEventListener("pointerup", function () { if (drag) { drag = false; logI("split", { n: n, a: st.a }); } });
    draw();
  }

  var KINDS = { fracshape: fracshape, cakecut: cakecut, maketen: maketen, partwhole: partwhole };
  var mounted = false;
  function mount() {
    mounted = true;
    [].forEach.call(document.querySelectorAll(".manip[data-manip]"), function (root) {
      if (root.getAttribute("data-mounted")) return;
      var f = KINDS[root.getAttribute("data-manip")];
      if (!f) return; // 教具文件还没加载：等它 register 时再挂
      var cfg = {};
      try {
        cfg = JSON.parse(root.getAttribute("data-cfg") || "{}");
      } catch (e) {
        root.setAttribute("data-mount-error", "bad-cfg: " + (e && e.message ? e.message : String(e)));
        root.insertAdjacentHTML("beforeend", '<p class="hint">这个教具没能打开，请刷新再试。</p>');
        if (window.console) console.error(e);
        return;
      }
      try {
        f(root, cfg);
        root.removeAttribute("data-mount-error");
        root.setAttribute("data-mounted", "1");
      } catch (e) {
        root.removeAttribute("data-mounted");
        root.setAttribute("data-mount-error", e && e.message ? e.message : String(e));
        root.insertAdjacentHTML("beforeend", '<p class="hint">这个教具没能打开，请刷新再试。</p>');
        if (window.console) console.error(e);
      }
    });
  }
  /* 教具文件（p-assets/kits/*.js）用它登记自己：PeiyuManip.register("shushi", function (root, cfg) {…})。
     页面里 <div class="manip" data-manip="shushi" data-cfg='{…}'>，并按需加载
     <script defer src="../p-assets/kits/<文件>.js"></script>（放在 manip.js 后面）。 */
  function register(name, fn) {
    KINDS[name] = fn;
    if (mounted || document.readyState !== "loading") mount();
  }
  /* 给教具文件用的公用小函数，免得每套各写一份 */
  var util = { NS: NS, el: el, h: h, btn: btn, activate: activate, emit: emit, emitAnswer: emitAnswer, manipId: manipId, readout: readout, frac: frac, fw: fw, cn: cn, log: logI };
  window.PeiyuManip = { mount: mount, register: register, answer: emitAnswer, util: util, partsOf: partsOf, kinds: function () { return Object.keys(KINDS); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
