/* Prototype: PY-141-1, dsp-rog7, seed 361a57c8927061b19e84f9b6a27cbaef54007be0.
   Product completion: dsp-rog3 (rog/codex), d141-interval-tree-ruler.
   interval-tree-ruler: load after manip.js. Examples:
   {"mode":"tree","L":30,"d":5,"ends":"both","sides":2};
   {"mode":"urn-freq","red":6,"blue":2,"yellow":1}.
   mode: tree (default) / urn-freq. L: 10..60 m (default 30); d: 2/5/10 m (default 5).
   ends: both/none/one/closed (default both); sides: 1/2 (default 1).
   red/blue/yellow: 0..12 balls, defaults 6/2/1. Every draw replaces the ball.
   A non-integral L/d is explicitly NOT an equal-interval endpoint problem; no rounded formula.
   Two sides mean two routes of the SAME length, including the closed-route schematic.
   Stage drag/Left/Right change length or red count; Enter pairs the next interval / draws once.
   manip:change carries state/measurements. answer fires on a valid pairing / frequency goal. */
(function () {
  "use strict";
  var M = window.PeiyuManip, U = M.util, el = U.el, h = U.h;
  var scope = '.manip[data-manip="interval-tree-ruler"]', css = h("style");
  css.textContent = scope + ' {min-width:0;font-size:17px} ' +
    scope + ' .fig-scroll {max-width:100%;overflow-x:auto} ' +
    scope + ' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;touch-action:none} ' +
    scope + ' svg text {font-size:18px;fill:var(--fg)} ' +
    scope + ' .interval-fields {display:flex;flex-wrap:wrap;gap:10px;justify-content:center} ' +
    scope + ' label {display:grid;flex:1 1 180px;max-width:280px;min-width:0} ' +
    scope + ' input {width:100%;min-width:44px;min-height:44px;touch-action:none;accent-color:var(--a)} ' +
    scope + ' :focus-visible {outline:3px solid var(--a);outline-offset:2px}';
  document.head.appendChild(css);
  function num(v, d, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : d)); }
  function fmt(v) { return String(Number(v.toFixed(2))); }
  M.register("interval-tree-ruler", function (root, cfg) {
    var mode = cfg.mode === "urn-freq" ? "urn-freq" : "tree";
    var st = { L: num(cfg.L, 30, 10, 60), d: [2, 5, 10].indexOf(Number(cfg.d)) < 0 ? 5 : Number(cfg.d),
      ends: ["both", "none", "one", "closed"].indexOf(cfg.ends) < 0 ? "both" : cfg.ends,
      sides: Number(cfg.sides) === 2 ? 2 : 1, pair: 0,
      red: Math.round(num(cfg.red, 6, 0, 12)), blue: Math.round(num(cfg.blue, 2, 0, 12)), yellow: Math.round(num(cfg.yellow, 1, 0, 12)), counts: [0, 0, 0] };
    var init = JSON.parse(JSON.stringify(st)), fields = [], endButtons = [], drawButtons = [], reported = false;
    var names = ["红", "蓝", "黄"], keys = ["red", "blue", "yellow"], colors = ["var(--no)", "var(--c)", "var(--hl)"];
    var wrap = h("div", "fig-scroll"); wrap.setAttribute("role", "region"); wrap.setAttribute("aria-label", "图示（窄屏可左右滑动）"); wrap.tabIndex = 0;
    var svg = el("svg", { class: "stage", viewBox: "0 0 460 230", tabindex: "0", role: "group", "aria-label": "左右方向键调整，回车配对或摸球" }, wrap);
    var g = el("g", {}, svg), controls = h("div", "ctrls"), fs = h("div", "interval-fields"), read = h("p", "read"), hint = h("p", "hint");
    read.setAttribute("aria-live", "polite");
    hint.textContent = mode === "tree" ? "本模型把全程等分，每段都是 d。拖动图示调总长；左右方向键也可调，回车高亮下一组对应。" : "每次摸后放回并摇匀。图示左右键调红球数，回车摸 1 次；更改配比会清空旧实验。";
    root.append(wrap, controls, fs, read, hint);
    function field(key, title, lo, hi, step) {
      var label = h("label"), caption = h("span"), input = h("input"); input.type = "range"; input.min = lo; input.max = hi; input.step = step;
      input.tabIndex = 0; input.dataset.key = key; input.setAttribute("aria-label", title); label.append(caption, input); fs.appendChild(label);
      function update(v) { st[key] = num(v, st[key], lo, hi); st.pair = 0; if (mode === "urn-freq") { st.counts = [0, 0, 0]; reported = false; } draw(true); }
      input.addEventListener("input", function () { update(input.value); });
      input.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); update(st[key] + (e.key === "ArrowRight" ? 1 : -1) * step); } });
      fields.push({ key: key, input: input, caption: caption, title: title });
    }
    function button(title, fn) { var b = U.btn(title, function () { fn(); draw(true, title === "重来"); }); controls.appendChild(b); return b; }
    if (mode === "tree") {
      field("L", "总长 L（m）", 10, 60, 0.1);
      [2, 5, 10].forEach(function (d) { var b = button("间距 " + d + " m", function () { st.d = d; st.pair = 0; }); endButtons.push({ b: b, active: function () { return st.d === d; } }); });
      [["both", "两端都栽"], ["none", "两端不栽"], ["one", "只栽一端"], ["closed", "封闭圆池"]].forEach(function (e) {
        var b = button(e[1], function () { st.ends = e[0]; st.pair = 0; }); endButtons.push({ b: b, active: function () { return st.ends === e[0]; } });
      });
      var sides = button("单侧 / 两侧（×2）", function () { st.sides = st.sides === 1 ? 2 : 1; });
      endButtons.push({ b: sides, active: function () { return st.sides === 2; } });
      button("看下一组对应", function () { st.pair++; });
      button("总长调为最近整倍数", function () { st.L = Math.max(10, Math.min(60, Math.round(st.L / st.d) * st.d)); st.pair = 0; });
    } else {
      keys.forEach(function (key, i) { field(key, "盒内" + names[i] + "球数", 0, 12, 1); });
      [1, 10, 100].forEach(function (n) { drawButtons.push(button(n === 1 ? "摸 1 次" : "连摸 " + n + " 次", function () { sample(n); })); });
    }
    button("重来", function () { st = JSON.parse(JSON.stringify(init)); reported = false; });
    function sample(n) {
      var total = st.red + st.blue + st.yellow;
      if (!total) return;
      for (var i = 0; i < n; i++) {
        var pick = Math.floor(Math.random() * total), k = pick < st.red ? 0 : pick < st.red + st.blue ? 1 : 2;
        st.counts[k]++;
      }
    }
    function line(x1, y1, x2, y2, color, width, dashed) { el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || "var(--fg)", "stroke-width": width || 2, "stroke-dasharray": dashed ? "5 4" : "none" }, g); }
    function text(x, y, value) { el("text", { x: x, y: y, "text-anchor": "middle" }, g).textContent = value; }
    function tree(x, y, position, side) {
      var t = el("g", { "data-tree": "1", "data-position": position, "data-side": side }, g);
      el("line", { x1: x, x2: x, y1: y - 8, y2: y + 5, stroke: "var(--fg)", "stroke-width": 2 }, t);
      el("path", { d: "M" + (x - 4) + " " + (y - 5) + " L" + x + " " + (y - 15) + " L" + (x + 4) + " " + (y - 5) + " Z", fill: "var(--a)", stroke: "var(--fg)" }, t);
    }
    function draw(changed, resetting) {
      g.replaceChildren(); var measures = {}, goal = false;
      if (mode === "tree") {
        var raw = st.L / st.d, valid = Math.abs(raw - Math.round(raw)) < 1e-7, n = Math.round(raw), full = Math.floor(raw + 1e-7), positions = [];
        if (valid) for (var j = 0; j <= n; j++) {
          if (st.ends === "both" || (st.ends === "none" ? j > 0 && j < n : j < n)) positions.push(j);
        }
        var perSide = valid ? positions.length : null, pair = valid ? st.pair % Math.max(1, n) : 0;
        var treeIndex = st.ends === "none" ? pair + 1 : pair;
        if (st.ends === "closed" && valid) {
          var cx = 230, cy = 114, rr = 65, start = -Math.PI / 2, step = 2 * Math.PI / n;
          el("circle", { cx: cx, cy: cy, r: rr, fill: "none", stroke: "var(--fg)", "stroke-width": 2 }, g);
          for (var side = 0; side < st.sides; side++) positions.forEach(function (at) { var a = start + at * step, radius = rr + 12 + side * 20; tree(cx + radius * Math.cos(a), cy + radius * Math.sin(a), at, side); });
          var a0 = start + pair * step, a1 = a0 + step;
          var arc = n === 1 ? "M230 49 A65 65 0 1 1 230 179 A65 65 0 1 1 230 49" :
            "M" + (cx + rr * Math.cos(a0)) + " " + (cy + rr * Math.sin(a0)) + " A" + rr + " " + rr + " 0 0 1 " + (cx + rr * Math.cos(a1)) + " " + (cy + rr * Math.sin(a1));
          el("path", { d: arc, fill: "none", stroke: "var(--c)", "stroke-width": 5, "data-pair": pair }, g);
          for (var s = 0; s < st.sides; s++) {
            line(cx + (rr + 12 + s * 20) * Math.cos(a0), cy + (rr + 12 + s * 20) * Math.sin(a0), cx + rr * Math.cos(a0), cy + rr * Math.sin(a0), "var(--c)", 3);
            g.lastChild.setAttribute("data-pair-tree", pair);
            g.lastChild.setAttribute("data-side", s);
          }
          text(cx, cy, "1 棵 ↔ 1 间隔"); text(230, 222, "起点与终点是同一个位置");
        } else {
          var left = 50, right = 410, y = 147, stepX = (right - left) * st.d / st.L;
          line(left, y, right, y);
          for (var k = 0; k <= (valid ? n : full); k++) line(left + k * stepX, y - 5, left + k * stepX, y + 5);
          line(right, y - 6, right, y + 6);
          if (valid) {
            for (var row = 0; row < st.sides; row++) positions.forEach(function (at) { tree(left + at * stepX, 72 + row * 33, at, row); });
            line(left + pair * stepX, y, left + (pair + 1) * stepX, y, "var(--c)", 5);
            g.lastChild.setAttribute("data-pair", pair);
            if (positions.indexOf(treeIndex) >= 0) for (var r = 0; r < st.sides; r++) {
              line(left + treeIndex * stepX, 77 + r * 33, left + (pair + 0.5) * stepX, y - 8, "var(--c)", 3);
              g.lastChild.setAttribute("data-pair-tree", treeIndex);
              g.lastChild.setAttribute("data-side", r);
            }
            text(230, 195, positions.indexOf(treeIndex) >= 0 ? "高亮：1 棵树配 1 个间隔" : "这个间隔没有对应的树（少 1）");
            if (st.ends === "both") {
              el("circle", { cx: right, cy: 66, r: 17, fill: "none", stroke: "var(--c)", "stroke-width": 2, "stroke-dasharray": "4 3" }, g);
              text(340, 42, "终点多 1 棵");
            }
          } else {
            line(left + full * stepX, y, right, y, "var(--c)", 5, true);
            text(230, 88, "末段不足一个间距"); text(230, 195, "先把总长调到间距的整倍数");
          }
          text(left, 174, "0"); text(right, 174, fmt(st.L) + " m");
        }
        var relation = st.ends === "both" ? "+ 1" : st.ends === "none" ? "− 1" : "";
        measures = { valid: valid, intervals: valid ? n : null, fullIntervals: full, remainder: valid ? 0 : st.L - full * st.d,
          treesPerSide: perSide, totalTrees: valid ? perSide * st.sides : null };
        read.textContent = valid ? "间隔数 = L ÷ d = " + fmt(st.L) + " ÷ " + st.d + " = " + n + "。每侧棵数 = 间隔数 " + relation + " = " + perSide +
          "；" + (st.sides === 2 ? "两侧是两条同长路线，总棵数 = " + perSide + " × 2 = " + perSide * 2 + "。" : "单侧共 " + perSide + " 棵。") +
          (st.ends === "both" ? "先配好每个间隔起点的树，终点还多 1 棵。" : st.ends === "none" ? "内部的树配好后，末尾还有 1 个间隔没配树，所以少 1 棵。" : st.ends === "closed" ? "沿同一方向，每棵配它后面的间隔，终点不重复栽。圆池为示意，不按比例。" : "只栽起点一端，每棵配它后面的一个间隔。") :
          "L 不能被 d 整除：" + full + " 个完整间隔后，还剩 " + fmt(measures.remainder) + " m；此时无法同时满足两端条件和全程等间距，不能把 L ÷ d 四舍五入套棵数公式。";
        goal = valid && st.pair > 0;
      } else {
        var total = st.red + st.blue + st.yellow, trials = st.counts.reduce(function (a, b) { return a + b; }, 0);
        var maxCount = Math.max.apply(null, [1].concat(st.counts));
        var ball = 0;
        keys.forEach(function (key, i) {
          for (var b = 0; b < st[key]; b++, ball++) el("circle", {
            cx: 55 + ball * 10, cy: 43, r: 4, fill: colors[i], stroke: "var(--fg)",
            "data-ball": key
          }, g);
        });
        keys.forEach(function (key, i) {
          var y0 = 58 + i * 43, share = trials ? st.counts[i] / trials : 0;
          text(40, y0 + 20, names[i] + "球");
          el("rect", { x: 80, y: y0, width: 245, height: 26, fill: "var(--card)", stroke: "var(--fg)" }, g);
          el("rect", { x: 80, y: y0, width: 245 * st.counts[i] / maxCount, height: 26, fill: colors[i], "data-frequency": st.counts[i] }, g);
          text(389, y0 + 9, st.counts[i] + " 次"); text(389, y0 + 30, fmt(100 * share) + "%");
        });
        text(230, 26, "摸后放回并摇匀 · 已摸 " + trials + " 次"); text(230, 220, "频数按最大值缩放 · 右侧是次数和占比");
        measures = { totalBalls: total, trials: trials, counts: st.counts.slice(), shares: st.counts.map(function (v) { return trials ? v / trials : 0; }),
          probabilities: keys.map(function (key) { return total ? st[key] / total : 0; }) };
        read.textContent = total ? keys.map(function (key, i) {
          return names[i] + "球 " + st[key] + " 个：" + (st[key] === 0 ? "不可能" : st[key] === total ? "一定" : "可能（每次机会 " + fmt(100 * st[key] / total) + "%）") + "，已摸到 " + st.counts[i] + " 次";
        }).join("；") + "。球的大小、材质相同，充分摇匀，每个球被摸到的机会相同；各种颜色的机会由个数决定，不一定相同。少量摸球可能偏差很大，多摸也不保证正好按配比出现；不保证下一次的颜色。" : "盒子里没有球，不能摸；请先加入至少 1 个球。";
        drawButtons.forEach(function (b) { b.disabled = total === 0; });
        goal = trials >= 10 || (trials > 0 && keys.some(function (key) { return st[key] === total; }));
      }
      fields.forEach(function (f) { f.input.value = st[f.key]; f.caption.textContent = f.title + "：" + fmt(st[f.key]); });
      endButtons.forEach(function (b) { b.b.setAttribute("aria-pressed", String(b.active())); });
      svg.setAttribute("aria-description", read.textContent);
      root.dataset.state = JSON.stringify(st); root.dataset.measurements = JSON.stringify(measures);
      if (changed) {
        U.emit(root, { mode: mode, state: JSON.parse(JSON.stringify(st)), measurements: measures });
        if (goal && !reported && !resetting) { reported = true; M.answer(root, cfg, mode + ":observed", true, true); }
      }
    }
    function set(v) { if (mode === "tree") { st.L = num(v, st.L, 10, 60); st.pair = 0; } else { st.red = Math.round(num(v, st.red, 0, 12)); st.counts = [0, 0, 0]; reported = false; } draw(true); }
    svg.addEventListener("keydown", function (e) {
      if (["ArrowLeft", "ArrowRight", "Enter"].indexOf(e.key) < 0) return;
      e.preventDefault();
      if (e.key === "Enter") { if (mode === "tree") st.pair++; else sample(1); draw(true); }
      else set((mode === "tree" ? st.L : st.red) + (e.key === "ArrowRight" ? 1 : -1));
    });
    var dragging = false;
    function move(e) { var b = svg.getBoundingClientRect(), t = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)); set(mode === "tree" ? Math.round((10 + t * 50) * 10) / 10 : t * 12); }
    svg.addEventListener("pointerdown", function (e) { dragging = true; svg.focus(); svg.setPointerCapture(e.pointerId); move(e); e.preventDefault(); });
    svg.addEventListener("pointermove", function (e) { if (dragging) move(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) { svg.addEventListener(name, function () { dragging = false; }); });
    draw(false);
  });
})();
