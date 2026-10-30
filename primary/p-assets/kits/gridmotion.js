/* 培玉 · 小学数学 — 教具：方格纸上的图形运动（gridmotion.js）。
   登记 1 个 kind：gridmotion。写法（放在 manip.js 后面加载本文件）：
     <div class="manip" data-manip="gridmotion" data-cfg='{"mode":"sym","task":"fold","w":12,"h":8,"axis":{"x":6},"shape":[…]}'></div>
     <script defer src="../p-assets/kits/gridmotion.js"></script>
   原来用在 p5a-u4-1…7（五上第四单元 图形的运动），页内写法是 data-gm='{…}'，键和值原样搬进 data-cfg。
   源码：primary/site/kits/p5a-u4-gridmotion/gm.js（按 //#if 分段拼页）；这里是全量一份，六种模式都在。

   用语和判对（和已验收页面一致，不要改）：说「对应点」「绕点 O」「顺时针 / 逆时针」；旋转只画 90°（演示最多转到 180°），
   平移只沿横、竖方向；题目没说旋转方向（dir "any"）时两个方向都判对。不出现「旋转中心」「对称点」「坐标」「270°」。

   公共 cfg（所有模式，clock 除外）：
     mode     "sym" | "move" | "rot" | "puzzle" | "design" | "clock"（必填）
     w, h     方格纸几格宽、几格高（默认 12 × 8）。格子边长自动按 360 宽的画面算。
     shape    图形顶点，都在格点上，[[x,y],…]，左上角是 [0,0]，x 向右、y 向下。
     labels   顶点名，和 shape 一一对应（默认用 1、2、3…；空字符串 = 不标）。对应点自动加「′」。
     open     true = 线段 / 折线，不封口（默认 false = 封闭图形，半透明填色）。
     tone     颜色 "a" | "b" | "c" | "hl"（对应 CSS 变量 --a 等，默认 "a"）。
     prompt   开头的提示语（各模式有默认）。ok / no：判对 / 判错后的话（各模式有默认）。
     aria     方格纸的读屏名（默认「方格纸」）。

   画点作答（sym 的 task "complete"、move 的 task "draw"、rot 的 task "draw" 共用）：
     点格点（或 Tab 到方格纸，方向键移光标、回车放点）按顶点顺序放对应点 A′、B′…，放齐自动判；
     判错时红圈标出放错的点，读数给出针对性提示（照抄 / 方向反了 / 数线不数格 / 中间空 n 格 / 转了两次……），
     点已放的点可拿掉重放；有「撤一步」「重来」。判对后读出 ok。

   mode "sym" 轴对称
     axis     {"x":6} 竖着的对称轴 | {"y":4} 横着的 | {"line":[x1,y1,x2,y2]}（斜线，只用于 task "fold"）。
     axisName 轴旁的字（默认「对称轴」；false = 不写），如「虚线」「对角线」。
     task     "complete"：shape 是一半（落在对称轴上的点算已给，不用放），孩子放另一半的对应点；有「对折」检验。
              ruler true：多一个「数格子」开关，数正要放的点（放齐后数放错的点）离对称轴几格。
              "fold"（默认）：shape 是整个图形，点「对折」看这条线是不是对称轴；ok / no 是重合 / 对不上时的话。
     例：{"mode":"sym","task":"complete","w":12,"h":8,"axis":{"x":6},"shape":[[6,1],[2,4],[4,4],[4,7],[6,7]],"labels":["A","B","C","D","E"],"ruler":true}

   mode "move" 平移
     拖：shape（一块）或 pieces [{pts:[[x,y],…] | d:"SVG 路径（格为单位）", box:[x0,y0,x1,y1]（用 d 时必填）, fixed, ghost, tone}]；
              第一块不 fixed、不 ghost 的可以拖：整格走，一次只能横着或竖着；也可点 ← → ↑ ↓ 或方向键。读数自动写「先向右平移 3 格，再向下平移 2 格」。
              target [dx,dy]：到了就判对（showTarget false = 不画目标虚线框）。
              track 顶点下标：画这个点的脚印并标 A、A′；gap true：只横着走一步时，读数还说中间空了几格。
     task "draw" + by [dx,dy]（只横或只竖）：孩子画平移后的图形。arrow true：从第一个顶点画一条移动方向的虚线。
     例：{"mode":"move","w":12,"h":7,"shape":[[1,1],[3,1],[3,3],[1,3]],"labels":["A"],"track":0,"target":[7,3]}

   mode "rot" 旋转（每次 90°）
     pivot    绕的点 = shape 的第几个顶点（默认 0）。
     演示（默认）：「顺时针 90°」「逆时针 90°」，最多转到 180°；读数说「绕点 O 按顺时针方向旋转了 90°」和边的长度变没变。
              pick true：点图形的另一个顶点换绕的点。
     task "draw" + dir "cw" | "ccw" | "any"（默认 cw）：画绕点旋转 90° 后的图形；绕的点已给；any = 两个方向都判对。判对后原图转过去给孩子看。
     clock    true：一开始就在绕的点上叠一个小钟面（标出顺时针方向）；clockBtn false：不给「钟面」开关（默认有）。
     例：{"mode":"rot","task":"draw","dir":"any","w":11,"h":8,"shape":[[5,4],[8,4],[5,6]],"labels":["O","A","B"],"pivot":0}

   mode "puzzle" 拼图（只能平移、转 90°，不能翻面）
     cards    [{name:"①", tone, s:边长格数, at:[x,y]（左上角）, rot:顺时针转了几个 90°, goal:[x,y,rot]}]，每张是带 1/4 圆的正方形卡片。
              点卡片选中，横竖拖或方向键平移；点它的一个角当绕的点，再点「顺时针 90°」「逆时针 90°」。每一步自动写成一句话列在下面；有「撤一步」。
     例：{"mode":"puzzle","w":14,"h":8,"cards":[{"name":"①","tone":"a","s":3,"at":[0,1],"rot":1,"goal":[8,1,0]},…]}

   mode "design" 设计图案
     shape 基本图形，name 它叫什么（默认「这个图形」，用在设计说明里）。
     按钮：选「向右 / 向下」和格数（1–6，默认 2）「平移一次」；o:[x,y] 给了才有「绕点 O 顺时针转 90°」；
     sym false 去掉「竖线对称」（默认有：以最右边的竖线为对称轴对称出另一半）。自动写「我把小旗先……再……」。有「撤一步」「重来」。
     例：{"mode":"design","w":12,"h":8,"name":"小旗","shape":[[6,4],[6,1],[8,2],[6,3]],"o":[6,4],"sym":false}

   mode "clock" 钟面
     start 指针开始指着几（1–12，默认 12）。按钮让它一大格一大格地顺 / 逆时针走，最多半圈；读出「指针绕点 O 按顺时针方向旋转了 90°」和 n × 30°。
     例：{"mode":"clock","start":2}

   数由代码算；拖不出方格纸；鼠标、触屏（pointer）、键盘（Tab、方向键、回车 / 空格）都能用；每种模式都有「重来」；
   颜色只用 CSS 变量，跟随深浅色；减少动态效果时动画直接跳到结果。学习日志 what = "gm-<mode>-<动作>"。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;

  function gridMotion(root, cfg) {
    var NS = "http://www.w3.org/2000/svg", PP = window.PeiyuP, mode = cfg.mode;
    var W = cfg.w || 12, H = cfg.h || 8, LB = cfg.labels || [], OPEN = !!cfg.open;
    var U = Math.min(Math.floor(336 / W), Math.floor(250 / H)), OX = (360 - W * U) / 2, M = 20, VH = H * U + 2 * M;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches, busy = false;
    var DIRS = { "1,0": "向右", "-1,0": "向左", "0,1": "向下", "0,-1": "向上" };

    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
    function h(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s != null) e.innerHTML = s; return e; }
    function btn(s, f, par, aria) { var b = h("button", "", s); b.type = "button"; if (aria) b.setAttribute("aria-label", aria); b.addEventListener("click", function () { if (!busy) f(); }); (par || ctr).appendChild(b); return b; }
    function X(p) { return OX + p[0] * U; }
    function Y(p) { return M + p[1] * U; }
    function ps(pts) { return pts.map(function (p) { return X(p).toFixed(1) + "," + Y(p).toFixed(1); }).join(" "); }
    function r6(v) { return Math.round(v * 1e6) / 1e6; }
    function eq(a, b) { return !!(a && b) && Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6; }
    function inside(pts) { return pts.every(function (p) { return p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H; }); }
    function add(p, d) { return [p[0] + d[0], p[1] + d[1]]; }
    function sgn(v) { return v > 0 ? 1 : v < 0 ? -1 : 0; }
    function dirWord(d) { return DIRS[sgn(d[0]) + "," + sgn(d[1])] || ""; }
    function turn(p, o, a) { var c = Math.cos(a), s = Math.sin(a), dx = p[0] - o[0], dy = p[1] - o[1]; return [r6(o[0] + dx * c - dy * s), r6(o[1] + dx * s + dy * c)]; }
    function q90(p, o, dir) { var r = turn(p, o, dir * Math.PI / 2); return [Math.round(r[0] * 2) / 2, Math.round(r[1] * 2) / 2]; } // dir 1 = 顺时针
    function center(pts) { var x = 0, y = 0; pts.forEach(function (p) { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
    function ext(pts, ax) { var v = pts.map(function (p) { return p[ax]; }); return Math.max.apply(null, v) - Math.min.apply(null, v); }
    function tone(t) { return "var(--" + (t || "a") + ")"; }
    function fillS(t, op) { return OPEN ? "fill:none;stroke:" + tone(t) + ";stroke-width:5;stroke-linecap:round" : "fill:" + tone(t) + ";fill-opacity:" + (op == null ? 0.45 : op) + ";stroke:" + tone(t) + ";stroke-width:2.5;stroke-linejoin:round"; }
    var GHOST = "fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:6 5";
    function poly(pts, style, par) { return el(OPEN ? "polyline" : "polygon", { points: ps(pts), style: style }, par || layer); }
    function dot(p, r, style, par) { return el("circle", { cx: X(p), cy: Y(p), r: r, style: style }, par || layer); }
    function txt(x, y, s, style, par) {
      var t = el("text", { x: Math.max(12, Math.min(348, x)), y: Math.max(18, Math.min(VH + 1, y)), "text-anchor": "middle", style: "font-size:18px;font-weight:700;" + (style || "fill:var(--fg)") }, par || layer);
      t.textContent = s; return t;
    }
    function lab(p, s, c, style, direction) {
      var dx = p[0] - c[0], dy = p[1] - c[1];
      // Put labels in a grid cell instead of straddling the grid lines at a vertex.
      var sx = direction || (dx < 0 ? -1 : 1), sy = dy > 0 ? 1 : -1;
      if (X(p) + sx * 16 < 22 || X(p) + sx * 16 > 338) { sx = -sx; if (direction) sy = 1; }
      var x = X(p) + sx * 16, y = Y(p) + (sy < 0 ? -12 : 24);
      return txt(x, y, s, style);
    }
    function nm(i, pr) { return (LB[i] || String(i + 1)) + (pr ? "′" : ""); }
    function anim(ms, step, done) {
      busy = true;
      function end() { busy = false; if (done) done(); }
      if (reduce) { step(1); end(); return; }
      var t0 = null;
      requestAnimationFrame(function f(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / ms);
        step(k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        if (k < 1) requestAnimationFrame(f); else end();
      });
    }
    function log(what, d) { if (PP) PP.log("interact", Object.assign({ what: "gm-" + mode + "-" + what }, d || {})); }
    var firstTry = true, reported = false;
    function emitAns(value, correct) {
      var all = document.querySelectorAll('.manip[data-manip="gridmotion"]');
      var idx = [].indexOf.call(all, root);
      var qid = (cfg && cfg.id) || root.id || ("gridmotion-" + mode + (idx > 0 ? "-" + (idx + 1) : ""));
      root.setAttribute("data-lab-id", qid);
      var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(firstTry) };
      try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
      if (PP) PP.log("lab", Object.assign({ _emitted: true }, detail));
    }
    var read = h("div", "read"), D = null;
    function drawPin(o) { dot(o, 8, "fill:var(--no);stroke:var(--card);stroke-width:2"); }
    function msg(html, cls, verdict) {
      read.className = "read" + (cls ? " " + cls : "");
      read.innerHTML = html;
      var s = read.textContent.replace(/°/g, "度").replace(/′/g, "撇");
      /* PY-216：判题结果用文字说对错；朗读文字不变（音频按文字取） */
      if (verdict && PP && PP.verdictPrefix) read.insertBefore(document.createTextNode(PP.verdictPrefix(cls === "ok", read.textContent)), read.firstChild);
      if (PP && s) { var b = PP.sayButton(s); b.addEventListener("click", function () { PP.say(s, b); }); read.appendChild(b); }
    }

    if (mode === "clock") return clock();

    var svg = el("svg", { viewBox: "-8 -8 376 " + (VH + 16), class: "stage", role: "group", "aria-label": cfg.aria || "方格纸" });
    svg.style.touchAction = "none";
    root.appendChild(svg);
    var i, gl = el("g", { style: "stroke:var(--line);stroke-width:1" }, svg);
    for (i = 0; i <= W; i++) el("line", { x1: X([i, 0]), y1: M, x2: X([i, 0]), y2: M + H * U }, gl);
    for (i = 0; i <= H; i++) el("line", { x1: OX, y1: Y([0, i]), x2: OX + W * U, y2: Y([0, i]) }, gl);
    var layer = el("g", {}, svg);
    var ctr = h("div", "ctrls");
    root.appendChild(ctr); root.appendChild(read);
    var logBox = h("div", "hint"); root.appendChild(logBox);
    function svgPt(e) {
      var m = svg.getScreenCTM(); if (!m) return null;
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var q = pt.matrixTransform(m.inverse());
      return [(q.x - OX) / U, (q.y - M) / U];
    }
    function clampPt(p) { return [Math.max(0, Math.min(W, Math.round(p[0]))), Math.max(0, Math.min(H, Math.round(p[1])))]; }

    /* ---------- 画图作答（轴对称补全、画平移后、画旋转后共用） ---------- */
    function setupDraw(given, targets, fixed, hint) {
      D = { given: given, targets: targets, fixed: given.map(fixed), hint: hint, cur: [Math.round(W / 2), Math.round(H / 2)], focus: false, state: "", bad: [], ghost: null };
      D.kid = given.map(function (p, j) { return D.fixed[j] ? p.slice() : null; });
      svg.setAttribute("tabindex", "0");
      svg.addEventListener("pointerdown", function (e) { var p = svgPt(e); if (p) { e.preventDefault(); place(p); } });
      svg.addEventListener("focus", function () { D.focus = true; draw(); });
      svg.addEventListener("blur", function () { D.focus = false; draw(); });
      svg.addEventListener("keydown", function (e) {
        var k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (k) { D.cur = clampPt(add(D.cur, k)); draw(); e.preventDefault(); } else if (e.key === "Enter" || e.key === " ") { place(D.cur); e.preventDefault(); }
      });
      btn("撤一步", function () {
        if (D.state === "ok") return;
        for (var j = D.kid.length - 1; j >= 0; j--) if (!D.fixed[j] && D.kid[j]) { D.kid[j] = null; break; }
        D.state = ""; D.bad = []; D.ghost = null; draw(); prompt();
      });
      btn("重来", function () { D.kid = D.given.map(function (p, j) { return D.fixed[j] ? p.slice() : null; }); D.state = ""; D.bad = []; D.ghost = null; reported = false; draw(); prompt(); });
    }
    function nextEmpty() { for (var j = 0; j < D.kid.length; j++) if (!D.kid[j]) return j; return -1; }
    function prompt() { var j = nextEmpty(); if (j >= 0) msg((j === firstFree() ? (cfg.prompt || "") : "") + "点一个格点，放 " + nm(j, 1) + "。"); }
    function firstFree() { for (var j = 0; j < D.fixed.length; j++) if (!D.fixed[j]) return j; return -1; }
    function place(p) {
      if (busy || D.state === "ok") return;
      p = clampPt(p); D.cur = p; D.ghost = null;
      for (var j = 0; j < D.kid.length; j++) if (!D.fixed[j] && eq(D.kid[j], p)) { D.kid[j] = null; D.state = ""; D.bad = []; draw(); prompt(); return; }
      j = nextEmpty(); if (j < 0) return;
      D.kid[j] = p; D.state = ""; D.bad = [];
      draw();
      if (nextEmpty() < 0) judge(); else prompt();
    }
    function judge() {
      var best = { n: -1 };
      D.targets.forEach(function (T) { var n = T.filter(function (t, j) { return eq(t, D.kid[j]); }).length; if (n > best.n) best = { n: n, T: T }; });
      var ok = best.n === D.kid.length;
      log("draw", { correct: ok });
      if (ok) {
        D.state = "ok"; draw(); msg(cfg.ok || "画对了！每个对应点都放对了。", "ok", true);
        if (!reported) { reported = true; emitAns(mode + "-draw:" + best.n, true); }
        if (mode === "rot") spinCheck(best.T); return;
      }
      emitAns(mode + "-draw:" + best.n + "/" + D.kid.length, false);
      firstTry = false;
      D.state = "no"; D.bad = D.kid.map(function (k, j) { return !eq(k, best.T[j]); });
      draw(); msg(D.hint(best.T) + " 点红圈里的点可以拿掉重放。", "no", true);
    }
    function drawKid() {
      var placed = D.kid.filter(Boolean), done = nextEmpty() < 0;
      if (done) poly(placed, fillS(D.state === "ok" ? "a" : "b", 0.3));
      else D.kid.forEach(function (k, j) { var n = D.kid[j + 1]; if (k && n) el("line", { x1: X(k), y1: Y(k), x2: X(n), y2: Y(n), style: "stroke:var(--b);stroke-width:2.5;stroke-dasharray:7 5" }, layer); });
      var c = center(D.kid.filter(Boolean).concat(D.given));
      D.kid.forEach(function (k, j) {
        if (!k || D.fixed[j]) return;
        dot(k, 6, "fill:var(--b)");
        if (D.bad[j]) dot(k, 13, "fill:none;stroke:var(--no);stroke-width:3");
        lab(k, nm(j, 1), c, "fill:var(--b)");
      });
      if (D.ghost) poly(D.ghost, "fill:var(--c);fill-opacity:.25;stroke:var(--c);stroke-width:2.5;stroke-dasharray:6 4");
      if (D.focus && D.state !== "ok") dot(D.cur, 11, "fill:none;stroke:var(--hl);stroke-width:3");
    }
    function drawGiven(pts, t) {
      poly(pts, fillS(t || cfg.tone));
      var c = center(pts);
      pts.forEach(function (p, j) { if (LB[j]) { dot(p, 4, "fill:var(--fg)"); if (!(mode === "rot" && D && clockOn && j === PV)) lab(p, nm(j), c); } });
    }

    /* ---------- 轴对称 ---------- */
    var AX = cfg.axis || {}, A1, A2, IDX = AX.x != null ? 0 : AX.y != null ? 1 : -1, AV = IDX === 0 ? AX.x : AX.y;
    if (AX.x != null) { A1 = [AX.x, 0]; A2 = [AX.x, H]; } else if (AX.y != null) { A1 = [0, AX.y]; A2 = [W, AX.y]; } else if (AX.line) { A1 = AX.line.slice(0, 2); A2 = AX.line.slice(2); }
    function foot(p) { var dx = A2[0] - A1[0], dy = A2[1] - A1[1], t = ((p[0] - A1[0]) * dx + (p[1] - A1[1]) * dy) / (dx * dx + dy * dy); return [A1[0] + t * dx, A1[1] + t * dy]; }
    function mirror(p) { var f = foot(p); return [r6(2 * f[0] - p[0]), r6(2 * f[1] - p[1])]; }
    function onAxis(p) { return eq(mirror(p), p); }
    var rulerOn = false;
    function drawAxis() {
      el("line", { x1: X(A1), y1: Y(A1), x2: X(A2), y2: Y(A2), style: "stroke:var(--c);stroke-width:3;stroke-dasharray:10 6" }, layer);
      if (cfg.axisName !== false) {
        var name = cfg.axisName || "对称轴", width = Math.min(350, String(name).length * 17 + 8);
        var x = Math.max(width / 2, Math.min(360 - width / 2, X(A2) + (IDX === 1 ? -26 : 0)));
        var y = Math.max(18, Math.min(VH + 1, Y(A2) + (IDX === 1 ? 48 : 22)));
        // A narrow halo protects horizontal-axis text without masking the completed shape.
        if (IDX !== 1) el("rect", { x: x - width / 2, y: y - 19, width: width, height: 23, style: "fill:var(--card)" }, layer);
        txt(x, y, name, "fill:var(--c);font-size:17px" + (IDX === 1 ? ";paint-order:stroke;stroke:var(--card);stroke-width:3;stroke-linejoin:round" : ""));
      }
    }
    function drawRuler(p, col) {
      if (IDX < 0 || onAxis(p)) return;
      var n = Math.abs(p[IDX] - AV), s = sgn(AV - p[IDX]), o = 1 - IDX;
      for (var k = 1; k <= n; k++) {
        var a = p.slice(), b = p.slice(); a[IDX] = p[IDX] + s * (k - 1); b[IDX] = p[IDX] + s * k;
        el("line", { x1: X(a), y1: Y(a), x2: X(b), y2: Y(b), style: "stroke:" + (k % 2 ? "var(--hl)" : col) + ";stroke-width:6;stroke-linecap:butt" }, layer);
        var mdl = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        txt(X(mdl) + (o === 0 ? -14 : 0), Y(mdl) + (o === 1 ? 24 : 6), String(k), "font-size:17px;fill:" + col);
      }
      var f = foot(p), sq = 8, ux = IDX === 0 ? -s : 0, uy = IDX === 1 ? -s : 0, vx = IDX === 1 ? 1 : 0, vy = IDX === 0 ? 1 : 0;
      el("polyline", { points: [X(f) + ux * sq, Y(f) + uy * sq, X(f) + ux * sq + vx * sq, Y(f) + uy * sq + vy * sq, X(f) + vx * sq, Y(f) + vy * sq].join(" "), style: "fill:none;stroke:var(--fg);stroke-width:1.5" }, layer);
    }
    function symHint() {
      var G = D.given, K = D.kid, d0 = null, same = true, j;
      for (j = 0; j < G.length; j++) { if (D.fixed[j]) continue; var d = [K[j][0] - G[j][0], K[j][1] - G[j][1]]; if (!d0) d0 = d; else if (!eq(d, d0)) same = false; }
      if (same && d0 && (d0[0] || d0[1])) return "这是把这一半照抄（平移）过去了，朝向没变。对应点要「反过来」：原来离对称轴近的点，对应点也离得近。";
      for (j = 0; j < G.length; j++) if (D.bad[j]) break;
      var g = G[j], k = K[j], o = 1 - IDX, n = Math.abs(g[IDX] - AV), m = Math.abs(k[IDX] - AV);
      if (k[o] !== g[o]) return nm(j, 1) + " 要和 " + nm(j) + " 在同一条" + (IDX === 0 ? "横线" : "竖线") + "上，连线才和对称轴垂直。";
      if ((k[IDX] - AV) * (g[IDX] - AV) >= 0) return nm(j, 1) + " 要放在对称轴的另一边。";
      if (Math.abs(n - m) === 1) return nm(j) + " 离对称轴 " + n + " 格，" + nm(j, 1) + " 放成了 " + m + " 格。数的是一段一段的格子，不数线。";
      return nm(j) + " 离对称轴 " + n + " 格，" + nm(j, 1) + " 也要离对称轴 " + n + " 格。";
    }
    function fold() {
      if (busy) return;
      var complete = cfg.task === "complete";
      if (complete && nextEmpty() >= 0) { msg("先把对应点都放好，再对折。"); return; }
      var src = complete ? D.kid : cfg.shape, feet = src.map(foot);
      anim(900, function (t) {
        var c = Math.cos(Math.PI * t);
        D.ghost = src.map(function (p, j) { return [feet[j][0] + (p[0] - feet[j][0]) * c, feet[j][1] + (p[1] - feet[j][1]) * c]; });
        draw();
      }, function () {
        D.ghost = src.map(mirror);
        var bad = complete ? D.ghost.map(function (q, j) { return !eq(q, D.given[j]); }) : D.ghost.map(function (q) { return !src.some(function (p) { return eq(p, q); }); });
        var nb = bad.filter(Boolean).length;
        draw();
        D.ghost.forEach(function (q, j) { if (bad[j]) dot(q, 13, "fill:none;stroke:var(--no);stroke-width:3"); });
        log("fold", { match: !nb });
        if (!complete && !reported) { reported = true; emitAns("fold:" + (nb ? "no" : "ok"), true); }
        if (complete) msg(nb ? "折过去，有 " + nb + " 个点和原来的点对不上（红圈）。" : "折过去，和原来那一半完全重合。", nb ? "no" : "ok");
        else msg(nb ? (cfg.no || "折过去，有的点对不上（红圈）：这条线不是对称轴。") : (cfg.ok || "折过去，两边完全重合：这条线是对称轴。"), nb ? "no" : "ok");
      });
    }

    /* ---------- 平移 ---------- */
    var PIECES = cfg.pieces || [{ pts: cfg.shape, tone: cfg.tone }], MV = -1, off = [0, 0], steps = [], drag = null;
    PIECES.forEach(function (pc, j) {
      if (pc.pts && !pc.box) { var xs = pc.pts.map(function (p) { return p[0]; }), ys = pc.pts.map(function (p) { return p[1]; }); pc.box = [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; }
      if (!pc.fixed && !pc.ghost && MV < 0) MV = j;
    });
    function pieceDraw(pc, d, style, par) {
      var g = el("g", { transform: "translate(" + d[0] * U + "," + d[1] * U + ")" }, par || layer);
      if (pc.d) el("path", { d: pc.d, transform: "translate(" + OX + "," + M + ") scale(" + U + ")", style: style, "vector-effect": "non-scaling-stroke" }, g);
      else poly(pc.pts, style, g);
      return g;
    }
    function pathOf(st) { var p = [[0, 0]]; st.forEach(function (s) { var q = p[p.length - 1].slice(); q[s.ax] += s.n; p.push(q); }); return p; }
    function stepText(st) {
      return st.map(function (s, j) { var d = [0, 0]; d[s.ax] = s.n; return (st.length > 1 ? (j ? "再" : "先") : "") + dirWord(d) + "平移 " + Math.abs(s.n) + " 格"; }).join("，");
    }
    function clampOff(d) {
      var b = PIECES[MV].box;
      return [Math.max(-b[0], Math.min(W - b[2], d[0])), Math.max(-b[1], Math.min(H - b[3], d[1]))];
    }
    function commit(ax, n) {
      if (!n) return;
      var last = steps[steps.length - 1];
      if (last && last.ax === ax) { last.n += n; if (!last.n) steps.pop(); } else steps.push({ ax: ax, n: n });
      log("move", { off: off.join(",") });
      if (cfg.target ? eq(off, cfg.target) : (off[0] || off[1])) {
        if (!reported) { reported = true; emitAns(off.join(","), true); }
      }
    }
    function moveRead(live) {
      if (!steps.length && !live) { msg(cfg.prompt || "按住图形横着或竖着拖，也可以点箭头。"); return; }
      var st = live ? steps.concat([live]) : steps, s = stepText(st);
      var tgt = cfg.target && eq(off, cfg.target);
      var extra = "";
      if (cfg.gap && st.length === 1 && st[0].ax === 0) {
        var wdt = PIECES[MV].box[2] - PIECES[MV].box[0], gp = Math.abs(st[0].n) - wdt;
        extra = "：" + nm(cfg.track || 0) + " 走了 " + Math.abs(st[0].n) + " 格，" + (gp > 0 ? "两个图形中间空了 " + gp + " 格" : gp === 0 ? "两个图形正好挨着" : "两个图形叠在一起了一部分");
      }
      msg((tgt && !live ? (cfg.ok || "到了！") + " " : "") + s + extra + "。", tgt && !live ? "ok" : "");
    }
    function drawMove(live) {
      var pc = PIECES[MV];
      PIECES.forEach(function (q, j) { if (j !== MV) pieceDraw(q, [0, 0], q.ghost ? "fill:var(--hl-soft);stroke:var(--fg);stroke-width:2;stroke-dasharray:6 5" : fillS(q.tone || "c", 0.35)); });
      if (cfg.target && cfg.showTarget !== false) pieceDraw(pc, cfg.target, "fill:none;stroke:var(--b);stroke-width:2.5;stroke-dasharray:8 5");
      if (off[0] || off[1]) pieceDraw(pc, [0, 0], GHOST);
      if (cfg.track != null && pc.pts) {
        var tp = pc.pts[cfg.track], path = pathOf(live ? steps.concat([live]) : steps).map(function (d) { return add(tp, d); }), counts = {};
        if (path.length > 1) el("polyline", { points: ps(path), style: "fill:none;stroke:var(--c);stroke-width:3" }, layer);
        for (var j = 1; j < path.length; j++) {
          var a = path[j - 1], b = path[j], n = Math.abs(b[0] - a[0] + b[1] - a[1]), dx = sgn(b[0] - a[0]), dy = sgn(b[1] - a[1]);
          for (var k = 1; k <= n; k++) {
            var q = [a[0] + dx * k, a[1] + dy * k], tx = X(q) - dx * U / 2 + (dy ? 15 : 0), ty = Y(q) - dy * U / 2 + (dx ? -9 : 6), key = tx + "," + ty + "," + k;
            dot(q, 4, "fill:var(--c)");
            if (!counts[key]) { txt(tx, ty, String(k), "font-size:17px;fill:var(--c)"); counts[key] = true; }
          }
        }
        var firstStep = path.length > 1 ? sgn(path[1][0] - path[0][0]) : 0;
        dot(tp, 5, "fill:var(--fg)"); lab(tp, nm(cfg.track), center(pc.pts), null, path.length > 1 ? (firstStep ? -firstStep : -1) : 0);
      }
      var g = pieceDraw(pc, off, fillS(pc.tone || cfg.tone || "a", 0.55));
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button"); g.setAttribute("aria-label", "可以移动的图形，用方向键移动");
      g.style.cursor = "grab"; g.setAttribute("data-mv", "1");
      if (cfg.track != null && pc.pts && (off[0] || off[1])) {
        var cp = add(pc.pts[cfg.track], off), lastStep = path.length > 1 ? sgn(path[path.length - 1][0] - path[path.length - 2][0]) : 0;
        dot(cp, 5, "fill:var(--fg)"); lab(cp, nm(cfg.track, 1), center(pc.pts.map(function (p) { return add(p, off); })), null, lastStep || -1);
      }
      return g;
    }
    function nudge(d) {
      var n = clampOff(add(off, d));
      if (eq(n, off)) { msg("再走就出方格纸了。"); return; }
      var ax = d[0] ? 0 : 1; commit(ax, n[ax] - off[ax]); off = n; draw(); moveRead();
    }

    /* ---------- 旋转 ---------- */
    var PV = cfg.pivot || 0, cur = cfg.shape ? cfg.shape.map(function (p) { return p.slice(); }) : [], qn = 0, lastDir = 1, arcs = [], clockOn = !!cfg.clock;
    function drawClockFace(o) {
      var cx = X(o), cy = Y(o), r = 1.6 * U, g = el("g", { style: "pointer-events:none" }, layer);
      el("circle", { cx: cx, cy: cy, r: r, style: "fill:var(--hl-soft);fill-opacity:.7;stroke:var(--hl);stroke-width:2" }, g);
      for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6; el("line", { x1: cx + Math.sin(a) * r * 0.8, y1: cy - Math.cos(a) * r * 0.8, x2: cx + Math.sin(a) * r, y2: cy - Math.cos(a) * r, style: "stroke:var(--fg);stroke-width:" + (k % 3 ? 1 : 2.5) }, g); }
      var a0 = -Math.PI / 2 + 0.3, a1 = 0.1, rr = r * 0.62, ex = cx + rr * Math.cos(a1), ey = cy + rr * Math.sin(a1);
      el("path", { d: "M" + (cx + rr * Math.cos(a0)) + " " + (cy + rr * Math.sin(a0)) + " A" + rr + " " + rr + " 0 0 1 " + ex + " " + ey, style: "fill:none;stroke:var(--c);stroke-width:3" }, g);
      el("path", { d: "M" + (ex - 7) + " " + (ey - 6) + " L" + (ex + 1) + " " + (ey + 7) + " L" + (ex + 8) + " " + (ey - 5) + " Z", style: "fill:var(--c)" }, g);
    }
    function edgeInfo() {
      var o = cfg.shape[PV], out = [];
      [PV - 1, PV + 1].forEach(function (j) {
        if (OPEN && (j < 0 || j >= cfg.shape.length)) return;
        j = (j + cfg.shape.length) % cfg.shape.length;
        var g = cfg.shape[j];
        if (j === PV || out.some(function (s) { return s.j === j; }) || (g[0] !== o[0] && g[1] !== o[1])) return;
        out.push({ j: j, n: Math.abs(g[0] - o[0]) + Math.abs(g[1] - o[1]) });
      });
      return out.map(function (s) { var c = cur[s.j], n2 = Math.abs(c[0] - cur[PV][0]) + Math.abs(c[1] - cur[PV][1]); return nm(PV) + nm(s.j) + " 原来 " + s.n + " 格，现在 " + n2 + " 格"; }).join("；");
    }
    function rotRead() {
      var q = ((qn % 4) + 4) % 4;
      if (!q) { msg(cfg.prompt || "点「顺时针 90°」或「逆时针 90°」，看它绕点 " + nm(PV) + " 转。"); return; }
      var s = q === 2 ? "绕点 " + nm(PV) + " 按" + (lastDir > 0 ? "顺" : "逆") + "时针方向旋转了 180°" : "绕点 " + nm(PV) + " 按" + (q === 1 ? "顺" : "逆") + "时针方向旋转了 90°";
      var e = edgeInfo();
      msg(s + "。" + (e ? "<br>" + e + "。" : ""));
    }
    function rotate(dir) {
      if (Math.abs(qn + dir) > 2) { msg("已经转了 180°，转到对面了。点「重来」再转。"); return; }
      var o = cur[PV], end = cur.map(function (p) { return q90(p, o, dir); });
      if (!inside(end)) { msg("再转就转出方格纸了。换个方向，或者点「重来」。", "no"); return; }
      var from = cur.map(function (p) { return p.slice(); });
      arcs = from.map(function (p) { return { p: p, r: Math.sqrt(Math.pow(p[0] - o[0], 2) + Math.pow(p[1] - o[1], 2)) }; });
      anim(800, function (t) { cur = from.map(function (p) { return turn(p, o, dir * t * Math.PI / 2); }); draw(); }, function () {
        cur = end; qn += dir; lastDir = dir; arcs.forEach(function (a) { a.e = q90(a.p, o, dir); a.dir = dir; });
        draw(); rotRead(); log("turn", { dir: dir, q: qn });
        if (qn && !reported) { reported = true; emitAns((qn * 90) + "°", true); }
      });
    }
    function rotHint(T) {
      var G = D.given, K = D.kid, o = G[PV], dir = cfg.dir === "ccw" ? -1 : 1, j;
      function all(f) { return G.every(function (g, k) { return eq(K[k], f(g)); }); }
      if (cfg.dir !== "any" && all(function (g) { return q90(g, o, -dir); })) return "方向反了。" + (dir > 0 ? "顺时针是和钟面上指针转的方向一样。" : "逆时针是和钟面上指针转的方向相反。");
      if (all(function (g) { return q90(q90(g, o, 1), o, 1); })) return "这是转了两次 90°，转到对面去了。转 90° 只扫过一个直角。";
      for (j = 0; j < G.length; j++) if (D.bad[j]) break;
      var g = G[j], k = K[j], gl = Math.abs(g[0] - o[0]) + Math.abs(g[1] - o[1]), kl = Math.abs(k[0] - o[0]) + Math.abs(k[1] - o[1]);
      var line = function (p) { return p[0] === o[0] || p[1] === o[1]; };
      if (line(g) && line(k) && gl !== kl) return "边的长度转了以后不变：" + nm(PV) + nm(j) + " 是 " + gl + " 格，" + nm(PV) + nm(j, 1) + " 也要 " + gl + " 格。";
      return nm(j, 1) + " 不对。看 " + nm(PV) + nm(j) + " 这条边：它绕点 " + nm(PV) + " 转 90° 以后，横的变竖、竖的变横，长度不变。";
    }
    function spinCheck(T) {
      var o = D.given[PV], dir = eq(q90(D.given[(PV + 1) % D.given.length], o, 1), T[(PV + 1) % D.given.length]) ? 1 : -1;
      anim(900, function (t) { D.ghost = D.given.map(function (p) { return turn(p, o, dir * t * Math.PI / 2); }); draw(); }, function () { D.ghost = null; draw(); });
    }

    /* ---------- 拼图 ---------- */
    var cards = [], sel = -1, piv = -1, hist = [], plog = [];
    function corners(x, y, s, r) {
      var c = [x + s / 2, y + s / 2], b = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
      for (var k = 0; k < (((r || 0) % 4) + 4) % 4; k++) b = b.map(function (p) { return q90(p, c, 1); });
      return b;
    }
    function cornerName(pts, k) {
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }), p = pts[k];
      return (p[1] === Math.min.apply(null, ys) ? "左上右上" : "左下右下").substr(p[0] === Math.min.apply(null, xs) ? 0 : 2, 2) + "角";
    }
    function snap() { return { c: cards.map(function (c) { return c.pts.map(function (p) { return p.slice(); }); }), l: JSON.stringify(plog) }; }
    function cardDone(c) { return c.pts.every(function (p, k) { return eq(p, c.goal[k]); }); }
    function drawCard(c, pts, g, faint) {
      var s = c.s * U;
      el("polygon", { points: ps(pts), style: faint ? "fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:6 5" : "fill:var(--card);stroke:var(--fg);stroke-width:2" }, g);
      el("path", { d: "M" + X(pts[2]) + " " + Y(pts[2]) + " L" + X(pts[1]) + " " + Y(pts[1]) + " A" + s + " " + s + " 0 0 0 " + X(pts[3]) + " " + Y(pts[3]) + " Z", style: "fill:" + tone(c.tone) + ";fill-opacity:" + (faint ? 0.18 : 0.85) + ";stroke:none" }, g);
      if (!faint) { var m = center(pts); txt(X(m), Y(m) + 7, c.name, "font-size:20px;fill:var(--fg)", g); }
    }
    function drawPuzzle(live) {
      cards.forEach(function (c) { drawCard(c, c.goal, layer, true); });
      cards.forEach(function (c, j) {
        var pts = live && live.j === j ? (live.rot ? live.pts : c.pts.map(function (p) { return add(p, live.d); })) : c.pts;
        var g = el("g", { tabindex: "0", role: "button", "aria-label": c.name + "号卡片", "data-card": j, style: "cursor:grab" }, layer);
        drawCard(c, pts, g);
        if (cardDone(c) && !live) el("polygon", { points: ps(pts), style: "fill:none;stroke:var(--a);stroke-width:4" }, g);
        if (j === sel) {
          el("polygon", { points: ps(pts), style: "fill:none;stroke:var(--hl);stroke-width:4" }, g);
          if (!live) pts.forEach(function (p, k) {
            var cn = el("circle", { cx: X(p), cy: Y(p), r: 11, tabindex: "0", role: "button", "aria-label": cornerName(pts, k) + "，选它当绕的点", "data-corner": k, style: k === piv ? "fill:var(--no);stroke:var(--card);stroke-width:2;cursor:pointer" : "fill:var(--card);stroke:var(--no);stroke-width:2.5;cursor:pointer" }, layer);
            cn.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickCorner(k); } });
          });
        }
      });
      rb.forEach(function (b) { b.disabled = sel < 0 || piv < 0; });
      logBox.innerHTML = plog.map(function (l, k) { return (k + 1) + ". " + l.t; }).join("<br>");
    }
    function pickCorner(k) { piv = k; draw(); msg("绕" + cards[sel].name + "号卡片的" + cornerName(cards[sel].pts, k) + "的顶点转。点「顺时针 90°」或「逆时针 90°」。"); }
    function selCard(j) { if (sel !== j) piv = -1; sel = j; draw(); msg(cards[j].name + "号卡片：横着、竖着拖它；点它的一个角当绕的点，就能转。"); }
    function pDone() {
      var n = cards.filter(cardDone).length;
      if (n === cards.length) {
        msg(cfg.ok || "拼好了！", "ok"); log("done", { steps: plog.length });
        if (!reported) { reported = true; emitAns("puzzle:" + n, true); }
      } else msg("已经放好 " + n + " 张，还差 " + (cards.length - n) + " 张。");
    }
    function pMove(j, d) {
      var np = cards[j].pts.map(function (p) { return add(p, d); });
      if (!inside(np)) { msg("再走就出方格纸了。"); return false; }
      hist.push(snap()); cards[j].pts = np;
      var ax = d[0] ? 0 : 1, n = d[ax], last = plog[plog.length - 1];
      if (last && last.j === j && last.ax === ax) { last.n += n; if (!last.n) plog.pop(); } else plog.push({ j: j, ax: ax, n: n });
      plog.forEach(function (l) { if (l.ax != null) { var v = [0, 0]; v[l.ax] = l.n; l.t = cards[l.j].name + "号：" + dirWord(v) + "平移 " + Math.abs(l.n) + " 格"; } });
      draw(); pDone(); return true;
    }
    function pRot(dir) {
      var c = cards[sel], o = c.pts[piv], end = c.pts.map(function (p) { return q90(p, o, dir); });
      if (!inside(end)) { msg("再转就转出方格纸了。换一个角，或者先平移。", "no"); return; }
      hist.push(snap());
      var from = c.pts, j = sel, word = c.name + "号：绕" + cornerName(from, piv) + "的顶点" + (dir > 0 ? "顺" : "逆") + "时针旋转 90°";
      anim(700, function (t) { draw({ j: j, rot: true, pts: from.map(function (p) { return turn(p, o, dir * t * Math.PI / 2); }) }); }, function () {
        c.pts = end; plog.push({ j: j, t: word }); draw(); pDone(); log("turn", { card: j, dir: dir });
      });
    }
    var rb = [];

    /* ---------- 设计图案 ---------- */
    var copies = [], dsteps = [], dDir = [1, 0], dN = 2, nShow = null;
    function designText() {
      var gs = [];
      dsteps.forEach(function (s) { var l = gs[gs.length - 1]; if (l && l.k === s.k && s.k !== "s" && (s.k === "r" || eq(l.d, s.d))) l.n++; else gs.push({ k: s.k, d: s.d, n: 1 }); });
      if (!gs.length) return "";
      return "我把" + (cfg.name || "这个图形") + gs.map(function (g, j) {
        var pre = gs.length > 1 ? (j ? "再" : "先") : "";
        if (g.k === "m") return pre + (g.n > 1 ? "连续" : "") + dirWord(g.d) + "平移 " + Math.abs(g.d[0] + g.d[1]) + " 格" + (g.n > 1 ? "，平移了 " + g.n + " 次" : "");
        if (g.k === "r") return pre + "绕点 O 顺时针旋转 90°" + (g.n > 1 ? "，转了 " + g.n + " 次" : "");
        return pre + "以竖线为对称轴，对称出另一半";
      }).join("，") + "。";
    }
    function dPush(list, s) {
      if (!list.every(inside)) { msg("再做就出方格纸了。点「撤一步」或「重来」。", "no"); return; }
      var key = function (c) { return c.map(function (p) { return p.join(","); }).sort().join(" "); }, have = copies.map(key);
      if (list.some(function (c) { return have.indexOf(key(c)) >= 0; })) { msg(s.k === "r" ? "再转就回到原来那一面上了：转一整圈正好回到原处。" : "这样会和已有的图形完全叠在一起。", "no"); return; }
      copies = copies.concat(list); s.c = list.length; dsteps.push(s); draw();
      msg(designText() + "<br>现在一共 " + copies.length + " 个图形。"); log("design", { n: copies.length });
      if (copies.length >= 2 && !reported) { reported = true; emitAns("design:" + copies.length, true); }
    }

    /* ---------- 画面与控件 ---------- */
    function draw(live) {
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      if (mode === "sym") {
        drawAxis();
        if (cfg.task === "fold") { drawGiven(cfg.shape); if (D && D.ghost) poly(D.ghost, "fill:var(--c);fill-opacity:.25;stroke:var(--c);stroke-width:2.5;stroke-dasharray:6 4"); return; }
        drawGiven(D.given);
        if (rulerOn) {
          var nx = nextEmpty(), R = nx >= 0 ? [nx] : D.given.map(function (p, j) { return j; }).filter(function (j) { return D.bad[j]; });
          R.forEach(function (j) { drawRuler(D.given[j], "var(--a)"); if (D.kid[j] && !D.fixed[j]) drawRuler(D.kid[j], "var(--b)"); });
        }
        drawKid();
      }
      if (mode === "move") {
        if (cfg.task === "draw") { drawGiven(D.given); var c0 = D.given[0], c1 = add(c0, cfg.by); if (cfg.arrow) el("line", { x1: X(c0), y1: Y(c0), x2: X(c1), y2: Y(c1), style: "stroke:var(--c);stroke-width:2;stroke-dasharray:3 4" }, layer); drawKid(); return; }
        drawMove(live);
      }
      if (mode === "rot") {
        var o = (D ? D.given : cur)[PV];
        if (D) { if (D.ghost) poly(D.ghost, "fill:var(--c);fill-opacity:.25;stroke:var(--c);stroke-width:2.5;stroke-dasharray:6 4"); drawGiven(D.given); drawKid(); if (clockOn) drawClockFace(o); drawPin(o); if (clockOn && LB[PV]) lab(o, nm(PV), center(D.given), null, -1); return; }
        if (qn % 4 || busy) { poly(cfg.shape, GHOST); }
        arcs.forEach(function (a) {
          if (!a.e || a.r < 0.01) return;
          el("path", { d: "M" + X(a.p) + " " + Y(a.p) + " A" + a.r * U + " " + a.r * U + " 0 0 " + (a.dir > 0 ? 1 : 0) + " " + X(a.e) + " " + Y(a.e), style: "fill:none;stroke:var(--c);stroke-width:2;stroke-dasharray:4 4" }, layer);
        });
        if (clockOn) drawClockFace(o);
        poly(cur, fillS(cfg.tone, 0.5));
        var cc = center(cur);
        cur.forEach(function (p, j) {
          var hit = el("circle", { cx: X(p), cy: Y(p), r: cfg.pick ? 14 : 4, style: cfg.pick ? "fill:var(--card);fill-opacity:.01;stroke:" + (j === PV ? "none" : "var(--muted)") + ";stroke-width:1.5;cursor:pointer" : "fill:var(--fg)" }, layer);
          if (cfg.pick && !busy) { hit.setAttribute("tabindex", "0"); hit.setAttribute("role", "button"); hit.setAttribute("aria-label", "绕点 " + nm(j) + " 转"); hit.setAttribute("data-v", j); }
          if (j !== PV && LB[j]) lab(p, nm(j, (qn % 4) !== 0), cc);
        });
        drawPin(o); lab(o, nm(PV), cc, null, clockOn ? -1 : 0);
      }
      if (mode === "puzzle") drawPuzzle(live);
      if (mode === "design") {
        copies.forEach(function (pts, j) { poly(pts, fillS(["a", "b", "c", "hl"][j % 4], j === copies.length - 1 && copies.length > 1 ? 0.7 : 0.45)); });
        if (cfg.o) { drawPin(cfg.o); txt(X(cfg.o) - 14, Y(cfg.o) + 22, "O", "fill:var(--no)"); }
      }
    }

    if (mode === "sym") {
      if (cfg.task === "complete") {
        setupDraw(cfg.shape, [cfg.shape.map(mirror)], function (p) { return onAxis(p); }, symHint);
        btn("对折", fold);
        if (cfg.ruler) { var rbt = btn("数格子", function () { rulerOn = !rulerOn; rbt.setAttribute("aria-pressed", rulerOn); draw(); }); rbt.setAttribute("aria-pressed", "false"); }
        draw(); prompt();
      } else {
        D = { ghost: null };
        btn("对折", fold);
        btn("重来", function () { D.ghost = null; reported = false; draw(); msg(cfg.prompt || "点「对折」，沿这条线折一折。"); });
        draw(); msg(cfg.prompt || "点「对折」，沿这条线折一折。");
      }
    }
    if (mode === "move") {
      if (cfg.task === "draw") {
        setupDraw(cfg.shape, [cfg.shape.map(function (p) { return add(p, cfg.by); })], function () { return false; }, function () {
          var G = D.given, K = D.kid, by = cfg.by, d0 = null, same = true, j, ax = by[0] ? 0 : 1, n = Math.abs(by[ax]), dw = dirWord(by);
          for (j = 0; j < G.length; j++) { var d = [K[j][0] - G[j][0], K[j][1] - G[j][1]]; if (!d0) d0 = d; else if (!eq(d, d0)) same = false; }
          if (!same) { for (j = 0; j < G.length; j++) if (D.bad[j]) break; return "每个点都要" + dw + "走 " + n + " 格。" + nm(j, 1) + " 走得和别的点不一样。"; }
          if (d0[1 - ax] !== 0 || d0[ax] * by[ax] <= 0) return "方向不对：题目要" + dw + "平移。";
          var m = Math.abs(d0[ax]);
          if (m === n + ext(G, ax)) return "你是在原图后面空了 " + n + " 格才画的。平移 " + n + " 格，是图形上每个点都走 " + n + " 格，不是中间空 " + n + " 格。";
          return "数一数：每个点要走 " + n + " 格，你走了 " + m + " 格。数的是跳了几下，起点算 0。";
        });
        draw(); prompt();
      } else {
        svg.addEventListener("pointerdown", function (e) {
          if (busy || !e.target.closest("[data-mv]")) return;
          var p = svgPt(e); if (!p) return;
          e.preventDefault(); svg.setPointerCapture(e.pointerId);
          drag = { p: p, base: off.slice(), ax: -1 };
        });
        svg.addEventListener("pointermove", function (e) {
          if (!drag) return;
          var p = svgPt(e); if (!p) return;
          var d = [p[0] - drag.p[0], p[1] - drag.p[1]];
          if (drag.ax < 0 && Math.max(Math.abs(d[0]), Math.abs(d[1])) >= 0.5) drag.ax = Math.abs(d[0]) >= Math.abs(d[1]) ? 0 : 1;
          if (drag.ax < 0) return;
          var nd = drag.base.slice(); nd[drag.ax] += Math.round(d[drag.ax]); off = clampOff(nd);
          var n = off[drag.ax] - drag.base[drag.ax];
          draw(n ? { ax: drag.ax, n: n } : null); moveRead(n ? { ax: drag.ax, n: n } : null);
        });
        var up = function () { if (!drag) return; if (drag.ax >= 0) commit(drag.ax, off[drag.ax] - drag.base[drag.ax]); drag = null; draw(); moveRead(); };
        svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
        svg.addEventListener("keydown", function (e) {
          var k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
          if (k && e.target.closest("[data-mv]")) { e.preventDefault(); nudge(k); var g = svg.querySelector("[data-mv]"); if (g) g.focus(); }
        });
        btn("←", function () { nudge([-1, 0]); }, null, "向左移一格"); btn("→", function () { nudge([1, 0]); }, null, "向右移一格");
        btn("↑", function () { nudge([0, -1]); }, null, "向上移一格"); btn("↓", function () { nudge([0, 1]); }, null, "向下移一格");
        btn("重来", function () { off = [0, 0]; steps = []; reported = false; draw(); moveRead(); });
        draw(); moveRead();
      }
    }
    if (mode === "rot") {
      if (cfg.task === "draw") {
        var o = cfg.shape[PV], tg = [];
        if (cfg.dir !== "ccw") tg.push(cfg.shape.map(function (p) { return q90(p, o, 1); }));
        if (cfg.dir === "ccw" || cfg.dir === "any") tg.push(cfg.shape.map(function (p) { return q90(p, o, -1); }));
        setupDraw(cfg.shape, tg, function (p, j) { return j === PV; }, rotHint);
      } else {
        btn("顺时针 90°", function () { rotate(1); });
        btn("逆时针 90°", function () { rotate(-1); });
        svg.addEventListener("click", function (e) { var t = e.target.closest("[data-v]"); if (t && !busy && cfg.pick) { PV = +t.getAttribute("data-v"); cur = cfg.shape.map(function (p) { return p.slice(); }); qn = 0; arcs = []; draw(); rotRead(); } });
        svg.addEventListener("keydown", function (e) { var t = e.target.closest("[data-v]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); t.dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
        btn("重来", function () { cur = cfg.shape.map(function (p) { return p.slice(); }); qn = 0; arcs = []; reported = false; draw(); rotRead(); });
      }
      if (cfg.clockBtn !== false) { var cb = btn("钟面", function () { clockOn = !clockOn; cb.setAttribute("aria-pressed", clockOn); draw(); }); cb.setAttribute("aria-pressed", String(clockOn)); }
      draw(); if (D) prompt(); else rotRead();
    }
    if (mode === "puzzle") {
      var initCards = function () { cards = cfg.cards.map(function (c) { return { s: c.s, tone: c.tone, name: c.name, pts: corners(c.at[0], c.at[1], c.s, c.rot), goal: corners(c.goal[0], c.goal[1], c.s, c.goal[2]) }; }); sel = -1; piv = -1; hist = []; plog = []; };
      initCards();
      svg.addEventListener("pointerdown", function (e) {
        if (busy) return;
        var cn = e.target.closest("[data-corner]");
        if (cn) { e.preventDefault(); pickCorner(+cn.getAttribute("data-corner")); return; }
        var g = e.target.closest("[data-card]"); if (!g) return;
        var j = +g.getAttribute("data-card"), p = svgPt(e); if (!p) return;
        e.preventDefault(); if (sel !== j) selCard(j);
        svg.setPointerCapture(e.pointerId); drag = { j: j, p: p, ax: -1, d: [0, 0] };
      });
      svg.addEventListener("pointermove", function (e) {
        if (!drag) return;
        var p = svgPt(e); if (!p) return;
        var d = [p[0] - drag.p[0], p[1] - drag.p[1]];
        if (drag.ax < 0 && Math.max(Math.abs(d[0]), Math.abs(d[1])) >= 0.5) drag.ax = Math.abs(d[0]) >= Math.abs(d[1]) ? 0 : 1;
        if (drag.ax < 0) return;
        var n = Math.round(d[drag.ax]), b = cards[drag.j].pts, lo = -Math.min.apply(null, b.map(function (q) { return q[drag.ax]; })), hi = (drag.ax ? H : W) - Math.max.apply(null, b.map(function (q) { return q[drag.ax]; }));
        n = Math.max(lo, Math.min(hi, n)); drag.d = [0, 0]; drag.d[drag.ax] = n;
        draw({ j: drag.j, d: drag.d });
      });
      var pup = function () { if (!drag) return; var dd = drag.d, j = drag.j; drag = null; if (dd[0] || dd[1]) pMove(j, dd); else draw(); };
      svg.addEventListener("pointerup", pup); svg.addEventListener("pointercancel", pup);
      svg.addEventListener("keydown", function (e) {
        var g = e.target.closest("[data-card]"); if (!g) return;
        var j = +g.getAttribute("data-card"), k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (k) { e.preventDefault(); if (sel !== j) selCard(j); pMove(j, k); var f = svg.querySelector('[data-card="' + j + '"]'); if (f) f.focus(); }
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selCard(j); }
      });
      rb = [btn("顺时针 90°", function () { pRot(1); }), btn("逆时针 90°", function () { pRot(-1); })];
      btn("撤一步", function () { var s = hist.pop(); if (!s) return; cards.forEach(function (c, j) { c.pts = s.c[j]; }); plog = JSON.parse(s.l); piv = -1; draw(); pDone(); });
      btn("重来", function () { initCards(); reported = false; draw(); msg(cfg.prompt || "点一张卡片，横着、竖着拖；选一个角，再转。"); });
      draw(); msg(cfg.prompt || "点一张卡片，横着、竖着拖；选一个角，再转。");
    }
    if (mode === "design") {
      copies = [cfg.shape];
      var row = h("div", "ctrls"); ctr.parentNode.insertBefore(row, ctr);
      var bR = btn("向右", function () { dDir = [1, 0]; bR.setAttribute("aria-pressed", "true"); bD.setAttribute("aria-pressed", "false"); }, row);
      var bD = btn("向下", function () { dDir = [0, 1]; bD.setAttribute("aria-pressed", "true"); bR.setAttribute("aria-pressed", "false"); }, row);
      bR.setAttribute("aria-pressed", "true"); bD.setAttribute("aria-pressed", "false");
      var cnt = h("span", "count"); row.appendChild(cnt);
      btn("−", function () { dN = Math.max(1, dN - 1); nShow.textContent = dN + " 格"; }, cnt, "少一格");
      nShow = h("b", "", dN + " 格"); cnt.appendChild(nShow);
      btn("+", function () { dN = Math.min(6, dN + 1); nShow.textContent = dN + " 格"; }, cnt, "多一格");
      btn("平移一次", function () { var d = [dDir[0] * dN, dDir[1] * dN]; dPush([copies[copies.length - 1].map(function (p) { return add(p, d); })], { k: "m", d: d }); }, row);
      if (cfg.o) btn("绕点 O 顺时针转 90°", function () { dPush([copies[copies.length - 1].map(function (p) { return q90(p, cfg.o, 1); })], { k: "r" }); });
      if (cfg.sym !== false) btn("竖线对称", function () {
        var mx = Math.max.apply(null, copies.map(function (c) { return Math.max.apply(null, c.map(function (p) { return p[0]; })); }));
        dPush(copies.map(function (c) { return c.map(function (p) { return [2 * mx - p[0], p[1]]; }); }), { k: "s" });
      });
      btn("撤一步", function () { var s = dsteps.pop(); if (!s) return; copies = copies.slice(0, copies.length - s.c); draw(); msg(designText() || "选一种运动，一次一次做。"); });
      btn("重来", function () { copies = [cfg.shape]; dsteps = []; reported = false; draw(); msg(cfg.prompt || "选一种运动，一次一次做。"); });
      draw(); msg(cfg.prompt || "选一种运动，一次一次做。");
    }

    function clock() {
      VH = 300;
      var start = cfg.start || 12, k = 0, ang = 0, cs = el("svg", { viewBox: "0 0 360 300", class: "stage", role: "img", "aria-label": "钟面" });
      root.appendChild(cs);
      var ctr2 = h("div", "ctrls"); root.appendChild(ctr2); root.appendChild(read);
      var g = el("g", {}, cs), CX = 180, CY = 150, R = 125;
      function pos(n, r) { var a = n * Math.PI / 6; return [CX + Math.sin(a) * r, CY - Math.cos(a) * r]; }
      function drawC() {
        while (g.firstChild) g.removeChild(g.firstChild);
        el("circle", { cx: CX, cy: CY, r: R, style: "fill:var(--card);stroke:var(--fg);stroke-width:3" }, g);
        var a0 = start * Math.PI / 6, a1 = a0 + ang, rr = 62;
        if (Math.abs(ang) > 0.01) {
          var p0 = [CX + Math.sin(a0) * rr, CY - Math.cos(a0) * rr], p1 = [CX + Math.sin(a1) * rr, CY - Math.cos(a1) * rr];
          el("path", { d: "M" + CX + " " + CY + " L" + p0[0] + " " + p0[1] + " A" + rr + " " + rr + " 0 " + (Math.abs(ang) > Math.PI + 0.01 ? 1 : 0) + " " + (ang > 0 ? 1 : 0) + " " + p1[0] + " " + p1[1] + " Z", style: "fill:var(--hl-soft);stroke:var(--hl);stroke-width:2" }, g);
          el("line", { x1: CX, y1: CY, x2: pos(start, 95)[0], y2: pos(start, 95)[1], style: "stroke:var(--muted);stroke-width:4;stroke-dasharray:5 5;stroke-linecap:round" }, g);
        }
        for (var n = 1; n <= 12; n++) { var p = pos(n, R - 22), q = pos(n, R), q2 = pos(n, R - 8); el("line", { x1: q[0], y1: q[1], x2: q2[0], y2: q2[1], style: "stroke:var(--fg);stroke-width:2" }, g); txt(p[0], p[1] + 7, String(n), "font-size:20px;fill:var(--fg)", g); }
        var e = [CX + Math.sin(a1) * 95, CY - Math.cos(a1) * 95];
        el("line", { x1: CX, y1: CY, x2: e[0], y2: e[1], style: "stroke:var(--a);stroke-width:6;stroke-linecap:round" }, g);
        el("circle", { cx: CX, cy: CY, r: 7, style: "fill:var(--no)" }, g);
        txt(CX - 16, CY + 24, "O", "fill:var(--no)", g);
      }
      function cread() {
        if (!k) { msg(cfg.prompt || "指针指着「" + start + "」。点按钮，让它一大格一大格地走。"); return; }
        var end = ((start - 1 + k) % 12 + 12) % 12 + 1, n = Math.abs(k);
        msg("从「" + start + "」走到「" + end + "」，指针绕点 O 按" + (k > 0 ? "顺" : "逆") + "时针方向旋转了 " + n * 30 + "°。<br>走了 " + n + " 大格，" + n + " × 30° = " + n * 30 + "°" + (n === 6 ? "，正好半圈" : "") + "。");
      }
      function go(d) {
        if (busy) return;
        if (Math.abs(k + d) > 6) { msg("最多走半圈（6 大格）。点「重来」再试。"); return; }
        var a = ang; k += d;
        anim(400, function (t) { ang = a + d * t * Math.PI / 6; drawC(); }, function () {
          ang = k * Math.PI / 6; drawC(); cread(); log("step", { k: k });
          if ((cfg.target ? k === cfg.target : Math.abs(k) >= 1) && !reported) {
            reported = true;
            emitAns((Math.abs(k) * 30) + "°", true);
          }
        });
      }
      btn("顺时针走一大格", function () { go(1); }, ctr2);
      btn("逆时针走一大格", function () { go(-1); }, ctr2);
      btn("重来", function () { k = 0; ang = 0; reported = false; drawC(); cread(); }, ctr2);
      drawC(); cread();
    }
  }
  window.PeiyuManip.register("gridmotion", gridMotion);
})();
