/* 圆与圆规（六上第四单元「圆」）。本文件登记一个 kind：circle。
   页面写法：
     <div class="manip" data-manip="circle" data-cfg='{"mode":"compass","r":3}'></div>
     <script defer src="../p-assets/kits/circle.js"></script>   （放在 primary.js、manip.js 后面）
   cfg.mode 选模式（缺省 compass），其余键按模式：
     compass 圆规画圆：拖针尖定圆心 O，拖笔芯脚改两脚距离（半径，1–5 cm，步长 0.5）；「转一圈画圆」；
             「转到一半改距离」画出接不上的线；可「留下这个圆」（最多 4 个）比位置和大小。
             r 两脚距离初值（cm，默认 3）；keep 是否有「留下这个圆」（默认 false）；broken 是否有「转到一半改距离」（默认 true）。
             例：{"mode":"compass","r":3}；{"mode":"compass","r":2,"keep":true,"broken":false}　原页 p6a-u4-1
     parts   半径和直径：画半径、画直径，读出 d = 2r；沿直径对折、折出对称轴。
             r 圆的半径（cm，默认 4，只影响读数）；seg 是否多一条可拖两端的红线段，判断是不是半径 / 直径（默认 false）。
             例：{"mode":"parts","r":4,"seg":true}　原页 p6a-u4-1
     sector  扇形与圆心角：拖 B 改圆心角（10°–350°，步长 5°，吸附 90°、180°、270°）；「把角的顶点挪到圆上」；「只涂三角形 AOB」。
             angle 圆心角初值（度，默认 120）。例：{"mode":"sector","angle":120}　原页 p6a-u4-2
     roll    滚一圈量周长：圆贴着尺子滚一圈，读出周长约多少、周长 ÷ 直径 ≈ 3.14；可换直径（1–4 cm）、换尺子精度（1 / 0.1 / 0.01 cm）、
             「拿直径去量」，结果记进表（最多 6 行）。d 直径初值（cm，默认 3）。例：{"mode":"roll","d":3}　原页 p6a-u4-3
     grid    数方格估面积：1/4 圆放在方格上，代码数满格、不满格（1 cm / 5 mm / 2 mm 方格），按一格 / 半格估整个圆的面积。
             r 半径（cm，默认 6）。例：{"mode":"grid","r":6}　原页 p6a-u4-4
     cut     切拼成近似长方形：平均分成 8 / 16 / 32 份，「拼一拼」，标出长 ≈ πr、宽 ≈ r；「描一描边」看多出的两条半径。
             r 半径（cm，默认 4，读数里取 3.14 算）。例：{"mode":"cut","r":4}　原页 p6a-u4-4
     ring    圆环：改外圆（2–6 cm）、内圆半径，拖内圆离开中心，读出外圆、内圆、圆环面积；「看看错的算法」对照 3.14 × (R − r)²。
             R 外圆半径（默认 5）；r 内圆半径（默认 3）。例：{"mode":"ring","R":5,"r":3}　原页 p6a-u4-5
     move    半圆平移 / 旋转补缺口，面积不变。kind "shift"（默认）：长方形上凸下凹一个半圆，w 宽（默认 4）、h 长（默认 5），面积 w × h；
             kind "turn"：大半圆挖掉一个小半圆、又拼上一个，绕 O 转半圈补上，R 大半圆半径（默认 4）。
             例：{"mode":"move","kind":"shift","w":4,"h":5}；{"mode":"move","kind":"turn","R":4}　原页 p6a-u4-5
     square  外方内圆、外圆内方：选半径 1、2、3 或 a，表里的面积用 π 表示；里面的正方形可「切成两个三角形」、可「叠起来转一转」。
             无其他键。例：{"mode":"square"}　原页 p6a-u4-6
     design  用圆设计图案：按步骤用圆规、直尺画图，画弧前先点出它的圆心（点错有红虚线对照）；可「退一步」。
             pattern "s"（默认，圆里画一条 S 形曲线）| "flower"（六瓣花）。例：{"mode":"design","pattern":"s"}；{"mode":"design","pattern":"flower"}　原页 p6a-u4-7
   数由代码算（π 取 3.14，只有 square 用 π 表示）；鼠标、触屏（pointer 事件）、键盘（Tab + 方向键 / 回车）都能用；每个模式都有「重来」。
   读数、朗读、日志（PeiyuP.log("interact", {what:"circle-…"})）与 p6a-u4-1…7 页内已验收的 circleKit 一致。 */
(function () {
  "use strict";
  function circleKit(root, cfg) {
    cfg = cfg || {};
    var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP, tok = 0;
    var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.getElementById("ck-css")) {
      var K = '.manip[data-manip="circle"] ', cs = document.createElement("style"); cs.id = "ck-css";
      cs.textContent = K + ".ck-h{cursor:grab;outline:none}" + K + ".ck-h:focus-visible>circle:first-child{stroke:var(--hl);stroke-width:5}" +
        K + ".ck-wrap{overflow-x:auto;max-width:100%}" + K + ".ck-tab{border-collapse:collapse;margin:8px auto;font-size:16px}" +
        K + ".ck-tab td," + K + ".ck-tab th{border:1px solid var(--line);padding:4px 8px;text-align:center}" + K + ".ck-tab th{background:var(--hl-soft)}";
      document.head.appendChild(cs);
    }
    function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
    function h(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
    function btn(label, fn, parent) { var b = h("button", "", label); b.type = "button"; b.addEventListener("click", fn); (parent || ctr).appendChild(b); return b; }
    function pressed(b, on) { b.setAttribute("aria-pressed", on ? "true" : "false"); }
    function txt(p, x, y, s, st, anc) { var t = el("text", { x: x, y: y, "text-anchor": anc || "middle", style: "font-size:17px;font-weight:700;fill:var(--fg);pointer-events:none;" + (st || "") }, p); t.textContent = s; return t; }
    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
    function fmt(x, k) { k = k == null ? 2 : k; var m = Math.pow(10, k), s = (Math.round(x * m + 1e-7) / m).toFixed(k); return s.indexOf(".") < 0 ? s : s.replace(/0+$/, "").replace(/\.$/, ""); }
    function out(node, html, s, cls) {
      node.className = "read" + (cls ? " " + cls : ""); node.innerHTML = html;
      if (s && P) node.appendChild(P.sayButton(s)).addEventListener("click", function (e) { P.say(s, e.currentTarget); });
    }
    function fr(n, d) { return P ? P.fracHTML(n, d) : n + "/" + d; }
    function piFr(d) { return '<span class="fr" role="img" aria-label="' + (d === 4 ? "四" : "二") + '分之π"><span>π</span><span class="bar"></span><span>' + d + "</span></span>"; }
    function stage(w, ht, label) { var s = el("svg", { viewBox: "0 0 " + w + " " + ht, class: "stage", role: "group", "aria-label": label }, root); s.style.touchAction = "none"; return s; }
    function svgPt(s, ev) { var r = s.getBoundingClientRect(), vb = s.viewBox.baseVal, w = r.width || 1, ht = r.height || 1; return [(ev.clientX - r.left) / w * vb.width, (ev.clientY - r.top) / ht * vb.height]; }
    function drag(node, s, move, end) {
      var on = false; node.style.touchAction = "none";
      node.addEventListener("pointerdown", function (e) { on = true; try { node.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } e.preventDefault(); });
      node.addEventListener("pointermove", function (e) { if (on) move(svgPt(s, e)); });
      function up() { if (on) { on = false; if (end) end(); } }
      node.addEventListener("pointerup", up); node.addEventListener("pointercancel", up);
    }
    function arrows(node, label, fn) {
      node.setAttribute("tabindex", "0"); node.setAttribute("aria-label", label);
      node.addEventListener("keydown", function (e) {
        var m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (m) { fn(m[0], m[1]); e.preventDefault(); }
      });
    }
    function tap(node, label, fn) {
      node.setAttribute("tabindex", "0"); node.setAttribute("role", "button"); node.setAttribute("aria-label", label); node.style.cursor = "pointer";
      node.addEventListener("click", fn);
      node.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
    }
    function handle(p, fill, stroke, label) { var g = el("g", { class: "ck-h" }, p); el("circle", { r: 14, style: "fill:" + fill + ";stroke:" + stroke + ";stroke-width:2.5" }, g); el("circle", { r: 4, style: "fill:" + stroke }, g); if (label) g.setAttribute("aria-label", label); return g; }
    function at(node, x, y) { node.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")"); }
    function anim(ms, f, done) {
      var my = ++tok, t0 = null; if (RM) ms = 1;
      function step(t) { if (my !== tok) return; if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / ms); f(k); if (k < 1) requestAnimationFrame(step); else if (done) done(); }
      requestAnimationFrame(step);
    }
    function stop() { tok++; }
    function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
    function log(w, d) { if (P) P.log("interact", Object.assign({ what: "circle-" + w }, d || {})); }
    var mode = cfg.mode || "compass", firstTry = true, reported = false;
    function emitAns(value, correct) {
      var all = document.querySelectorAll('.manip[data-manip="circle"]');
      var idx = [].indexOf.call(all, root);
      var qid = (cfg && cfg.id) || root.id || ("circle-" + mode + (idx > 0 ? "-" + (idx + 1) : ""));
      root.setAttribute("data-lab-id", qid);
      var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(firstTry) };
      try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
      if (P) P.log("lab", Object.assign({ _emitted: true }, detail));
    }
    function rad(a) { return a * Math.PI / 180; }
    function arcD(cx, cy, r, a0, a1) {
      var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 3)), s = "";
      for (var i = 0; i <= n; i++) { var a = rad(a0 + (a1 - a0) * i / n); s += (i ? " L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1); }
      return s;
    }
    function circD(cx, cy, r) { return "M" + (cx - r) + " " + cy + " a" + r + " " + r + " 0 1 0 " + 2 * r + " 0 a" + r + " " + r + " 0 1 0 " + (-2 * r) + " 0 Z"; }
    var ctr = h("div", "ctrls"), rd = h("p", "read"), rd2 = h("p", "read"), hint = h("p", "hint");
    rd.setAttribute("aria-live", "polite");
    function mount(two) { root.appendChild(ctr); root.appendChild(rd); if (two) root.appendChild(rd2); if (hint.textContent) root.appendChild(hint); }
    var MODES = { compass: compass, parts: parts, sector: sector, roll: roll, grid: grid, cut: cut, ring: ring, move: move, square: square, design: design };
    (MODES[cfg.mode || "compass"] || function () { root.appendChild(h("p", "hint", "没有这个模式：" + String(cfg.mode).replace(/[<>&"]/g, ""))); })();

    /* ---------- 画圆 ---------- */
    function compass() {
      var S = 20, W = 360, H = 270, r0 = cfg.r || 3, st = { x: 180, y: 140, r: r0, a: 0, drawn: false, busy: false, kept: [] };
      var s = stage(W, H, "用圆规画圆"), gg = el("g", {}, s), gKeep = el("g", {}, s), gC = el("g", {}, s), i;
      for (i = 0; i <= W; i += S) el("line", { x1: i, y1: 0, x2: i, y2: H, style: "stroke:var(--line);stroke-width:1" }, gg);
      for (i = 0; i <= H; i += S) el("line", { x1: 0, y1: i, x2: W, y2: i, style: "stroke:var(--line);stroke-width:1" }, gg);
      var path = el("path", { style: "fill:none;stroke:var(--a);stroke-width:3.5" }, gC);
      var rLine = el("line", { style: "stroke:var(--b);stroke-width:2.5;stroke-dasharray:6 4" }, gC);
      var legs = el("path", { style: "fill:none;stroke:var(--muted);stroke-width:6;stroke-linecap:round;stroke-linejoin:round" }, gC);
      var hinge = el("circle", { r: 7, style: "fill:var(--muted)" }, gC);
      var rT = txt(gC, 0, 0, "", "fill:var(--b)"), oT = txt(gC, 0, 0, "O");
      var pin = handle(gC, "var(--card)", "var(--fg)", "针尖，就是圆心 O。方向键移动位置");
      var pen = handle(gC, "var(--hl-soft)", "var(--a)", "笔芯脚。左右方向键改两脚距离，上下方向键转动");
      arrows(pin, pin.getAttribute("aria-label"), function (dx, dy) { if (st.busy) return; st.x += dx * 10; st.y += dy * 10; moved(); });
      arrows(pen, pen.getAttribute("aria-label"), function (dx, dy) { if (st.busy) return; if (dx) st.r = Math.min(5, Math.max(1, st.r + dx * 0.5)); if (dy) st.a = (st.a + dy * 15 + 360) % 360; moved(); });
      drag(pin, s, function (p) { if (st.busy) return; st.x = Math.round(p[0] / 10) * 10; st.y = Math.round(p[1] / 10) * 10; moved(); }, function () { log("pin", { x: st.x, y: st.y }); });
      drag(pen, s, function (p) {
        if (st.busy) return;
        var dx = p[0] - st.x, dy = p[1] - st.y, d = Math.sqrt(dx * dx + dy * dy);
        st.r = Math.min(5, Math.max(1, Math.round(d / S * 2) / 2)); st.a = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; moved();
      }, function () { log("pen", { r: st.r }); });
      btn("转一圈画圆", function () { spin(false); });
      if (cfg.broken !== false) btn("转到一半改距离", function () { spin(true); });
      var bKeep = cfg.keep ? btn("留下这个圆", keep) : null;
      btn("重来", function () { stop(); st = { x: 180, y: 140, r: r0, a: 0, drawn: false, busy: false, kept: [] }; reported = false; clear(gKeep); path.setAttribute("d", ""); draw(); idle(); log("reset"); });
      hint.textContent = "拖白色的针尖换位置，拖绿色的笔芯脚改两脚距离；也可以用 Tab 选中后按方向键。";
      mount();
      function clampC() { var R = st.r * S; st.x = Math.min(W - R - 4, Math.max(R + 4, st.x)); st.y = Math.min(H - R - 4, Math.max(R + 4, st.y)); }
      function geo() {
        var R = st.r * S, a = rad(st.a), px = st.x + R * Math.cos(a), py = st.y + R * Math.sin(a);
        var hg = Math.sqrt(Math.max(0, 8100 - R * R / 4)), nx = Math.sin(a), ny = -Math.cos(a);
        return { px: px, py: py, hx: (st.x + px) / 2 + nx * hg, hy: (st.y + py) / 2 + ny * hg, nx: nx, ny: ny };
      }
      function draw() {
        clampC();
        var g = geo();
        at(pin, st.x, st.y); at(pen, g.px, g.py);
        legs.setAttribute("d", "M" + st.x + " " + st.y + " L" + g.hx.toFixed(1) + " " + g.hy.toFixed(1) + " L" + g.px.toFixed(1) + " " + g.py.toFixed(1));
        hinge.setAttribute("cx", g.hx.toFixed(1)); hinge.setAttribute("cy", g.hy.toFixed(1));
        rLine.setAttribute("x1", st.x); rLine.setAttribute("y1", st.y); rLine.setAttribute("x2", g.px.toFixed(1)); rLine.setAttribute("y2", g.py.toFixed(1));
        rT.setAttribute("x", ((st.x + g.px) / 2 - g.nx * 20).toFixed(1)); rT.setAttribute("y", ((st.y + g.py) / 2 - g.ny * 20 + 6).toFixed(1));
        rT.textContent = st.r + " cm";
        oT.setAttribute("x", st.x - 20); oT.setAttribute("y", st.y + 26);
        if (bKeep) bKeep.disabled = !st.drawn;
      }
      function idle() { out(rd, "圆规两脚张开 <b>" + st.r + " cm</b>。点「转一圈画圆」。", "圆规两脚张开" + st.r + "厘米"); }
      function moved() { st.drawn = false; path.setAttribute("d", ""); draw(); idle(); }
      function spin(broken) {
        if (st.busy) return;
        st.busy = true; st.drawn = false;
        var a0 = st.a, r1 = st.r, r2 = st.r >= 5 ? st.r - 1 : st.r + 1, d = "", jumped = false, fresh = true;
        anim(2400, function (k) {
          if (broken && k > 0.5 && !jumped) { jumped = true; fresh = true; st.r = r2; }
          st.a = (a0 + 360 * k) % 360;
          var g = geo();
          d += (fresh ? (d ? " M" : "M") : " L") + g.px.toFixed(1) + " " + g.py.toFixed(1); fresh = false;
          path.setAttribute("d", d);
          draw();
        }, function () {
          st.busy = false; st.a = a0;
          if (broken) {
            draw();
            out(rd, "转到一半，两脚距离从 " + r1 + " cm 变成了 " + st.r + " cm：线接不上，画出来的不是圆。转的时候两脚距离不能变。", "转到一半，两脚距离变了，线接不上，画出来的不是圆。转的时候两脚距离不能变。", "no");
            emitAns("r=" + st.r + "-broken", false);
            firstTry = false;
          } else {
            st.drawn = true; draw();
            out(rd, "画好了！针尖不动，两脚距离一直是 " + st.r + " cm：半径 <i>r</i> = " + st.r + " cm，直径 <i>d</i> = 2 × " + st.r + " = " + fmt(2 * st.r) + " cm。", "画好了。半径是" + st.r + "厘米，直径是2乘" + st.r + "，等于" + fmt(2 * st.r) + "厘米。", "ok");
            if (!reported) { reported = true; emitAns("r=" + st.r, true); }
          }
          log("spin", { r: st.r, broken: broken });
        });
      }
      function keep() {
        if (!st.drawn) return;
        st.kept.push({ x: st.x, y: st.y, r: st.r });
        if (st.kept.length > 4) st.kept.shift();
        clear(gKeep);
        st.kept.forEach(function (c) {
          el("circle", { cx: c.x, cy: c.y, r: c.r * S, style: "fill:none;stroke:var(--b);stroke-width:3" }, gKeep);
          el("circle", { cx: c.x, cy: c.y, r: 3.5, style: "fill:var(--b)" }, gKeep);
        });
        var sameR = st.kept.every(function (c) { return c.r === st.kept[0].r; }), sameO = st.kept.every(function (c) { return c.x === st.kept[0].x && c.y === st.kept[0].y; });
        var n = st.kept.length, msg;
        if (n < 2) msg = "留下了 1 个圆。再拖一拖针尖或笔芯脚，画第二个圆比一比。";
        else if (sameR && sameO) msg = "这 " + n + " 个圆圆心一样、半径一样，叠在一起，就是同一个圆。";
        else if (sameR) msg = "这 " + n + " 个圆半径都是 " + st.kept[0].r + " cm，一样大；圆心不同，位置就不同。";
        else if (sameO) msg = "这 " + n + " 个圆圆心相同，在同一个位置；半径不同，大小就不同。";
        else msg = "这 " + n + " 个圆圆心不同、半径也不同：位置和大小都不一样。";
        out(rd, msg + " 圆心定位置，半径定大小。", msg + "圆心定位置，半径定大小。", n < 2 ? "" : "ok");
        st.drawn = false; path.setAttribute("d", ""); draw();
        log("keep", { n: n });
      }
      draw(); idle();
    }

    /* ---------- 半径、直径、对折 ---------- */
    function parts() {
      var W = 360, H = 270, cx = 180, cy = 135, R = 100, rc = cfg.r || 4, st = { lines: [], n: 0, axes: [] };
      var s = stage(W, H, "圆的半径和直径");
      el("circle", { cx: cx, cy: cy, r: R, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:3" }, s);
      var gAx = el("g", {}, s), gL = el("g", {}, s), gF = el("g", {}, s), gSeg = el("g", {}, s);
      el("circle", { cx: cx, cy: cy, r: 4, style: "fill:var(--fg)" }, s); txt(s, cx - 14, cy + 22, "O");
      btn("画一条半径", function () { add(false); show(); log("radius"); });
      btn("画一条直径", function () { add(true); show(); log("diameter"); });
      btn("沿直径对折", fold);
      btn("重来", function () { stop(); st = { lines: [], n: 0, axes: [] }; reported = false; clear(gL); clear(gF); clear(gAx); if (cfg.seg) seg0(); show(); log("reset"); });
      function add(dia) {
        var a = (st.n * 137.5 + 205) % 360; st.n++;
        st.lines.push({ a: a, dia: dia }); if (st.lines.length > 16) st.lines.shift();
        clear(gL);
        st.lines.forEach(function (l, j) {
          var ca = Math.cos(rad(l.a)), sa = Math.sin(rad(l.a)), last = j === st.lines.length - 1;
          var x0 = l.dia ? cx - R * ca : cx, y0 = l.dia ? cy - R * sa : cy;
          el("line", { x1: x0, y1: y0, x2: cx + R * ca, y2: cy + R * sa, style: "stroke:" + (l.dia ? "var(--c)" : "var(--b)") + ";stroke-width:" + (last ? 4 : 2.5) }, gL);
          el("circle", { cx: cx + R * ca, cy: cy + R * sa, r: 4, style: "fill:var(--fg)" }, gL);
          if (last) {
            var m = l.dia ? 0.55 : 0.5, nx = -sa, ny = ca;
            txt(gL, cx + R * m * ca + nx * 18, cy + R * m * sa + ny * 18 + 6, (l.dia ? "d = " + 2 * rc : "r = " + rc) + " cm", "fill:" + (l.dia ? "var(--c)" : "var(--b)"));
          }
        });
      }
      function show() {
        var nr = st.lines.filter(function (l) { return !l.dia; }).length, nd = st.lines.length - nr;
        if (!st.lines.length) { out(rd, "点按钮，在这个圆里画半径、画直径。", "点按钮，在这个圆里画半径、画直径。"); return; }
        var m = "画了 " + nr + " 条半径" + (nr ? "，每条都是 " + rc + " cm" : "") + "；" + nd + " 条直径" + (nd ? "，每条都是 " + 2 * rc + " cm" : "") + "。";
        if (nr && nd) m += " 直径是半径的 2 倍：<i>d</i> = 2<i>r</i>。";
        if (st.n >= 6) m += " 还能一直画下去：半径、直径都有无数条。";
        out(rd, m, m.replace(/<[^>]+>/g, "").replace(/cm/g, "厘米"), nr && nd ? "ok" : "");
      }
      function fold() {
        stop(); add(true);
        var l = st.lines[st.lines.length - 1], ux = Math.cos(rad(l.a)), uy = Math.sin(rad(l.a)), pts = [], k0;
        for (k0 = 0; k0 <= 60; k0++) { var a = rad(l.a + 180 * k0 / 60); pts.push([R * Math.cos(a), R * Math.sin(a)]); }
        clear(gF);
        var half = el("path", { style: "fill:var(--c);fill-opacity:.45;stroke:var(--c);stroke-width:2" }, gF);
        out(rd, "沿这条直径对折……", "");
        anim(1400, function (k) {
          var e = ease(k), d = "";
          pts.forEach(function (p, j) {
            var dot = p[0] * ux + p[1] * uy, qx = 2 * dot * ux - p[0], qy = 2 * dot * uy - p[1];
            d += (j ? " L" : "M") + (cx + p[0] + e * (qx - p[0])).toFixed(1) + " " + (cy + p[1] + e * (qy - p[1])).toFixed(1);
          });
          half.setAttribute("d", d + " Z");
        }, function () {
          st.axes.push(l.a); if (st.axes.length > 8) st.axes.shift();
          clear(gAx);
          st.axes.forEach(function (a) { var c = Math.cos(rad(a)), si = Math.sin(rad(a)); el("line", { x1: cx - 128 * c, y1: cy - 128 * si, x2: cx + 128 * c, y2: cy + 128 * si, style: "stroke:var(--no);stroke-width:2.5;stroke-dasharray:8 6" }, gAx); });
          var m = "两边正好重合！这条直径所在的直线是圆的对称轴（红虚线）。已经折出 " + st.axes.length + " 条，再点「沿直径对折」，换一条直径还能折。";
          out(rd, m, "两边正好重合。这条直径所在的直线，是圆的对称轴。换一条直径，还能折。", "ok");
          log("fold", { axes: st.axes.length });
          if (!cfg.seg && !reported) { reported = true; emitAns("fold:" + st.axes.length, true); }
        });
      }
      if (cfg.seg) {
        var line = el("line", { style: "stroke:var(--no);stroke-width:4;stroke-linecap:round" }, gSeg), E = [];
        var hs = [handle(gSeg, "var(--card)", "var(--no)"), handle(gSeg, "var(--card)", "var(--no)")];
        function checkSeg() {
          var k0 = judge().k;
          log("seg", { kind: k0 });
          if (k0 === "r" || k0 === "d") { if (!reported) { reported = true; emitAns("seg:" + k0, true); } }
          else if (k0 === "chord" || k0 === "half") { emitAns("seg:" + k0, false); firstTry = false; }
        }
        hs.forEach(function (hd, j) {
          drag(hd, s, function (p) { put(j, p); }, checkSeg);
          arrows(hd, "红线段的第 " + (j + 1) + " 个端点，用方向键移动", function (dx, dy) { put(j, [E[j][0] + dx * 15, E[j][1] + dy * 15]); checkSeg(); });
        });
        var seg0 = function () { E = [[cx + R * Math.cos(rad(200)), cy + R * Math.sin(rad(200)), "c"], [cx + R * Math.cos(rad(320)), cy + R * Math.sin(rad(320)), "c"]]; segDraw(); };
        var snap = function (p) {
          var dx = p[0] - cx, dy = p[1] - cy, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 13) return [cx, cy, "o"];
          if (Math.abs(d - R) < 13) return [cx + dx / d * R, cy + dy / d * R, "c"];
          return [Math.min(W - 10, Math.max(10, p[0])), Math.min(H - 10, Math.max(10, p[1])), ""];
        };
        var put = function (j, p) {
          var q = snap(p), o = E[1 - j];
          if (q[2] === "c" && o[2] === "c") {
            var a1 = Math.atan2(q[1] - cy, q[0] - cx), a2 = Math.atan2(o[1] - cy, o[0] - cx), df = Math.abs(((a1 - a2) * 180 / Math.PI + 540) % 360 - 180);
            if (Math.abs(df - 180) < 9) q = [2 * cx - o[0], 2 * cy - o[1], "c"];
          }
          E[j] = q; segDraw();
        };
        var judge = function () {
          var a = E[0], b = E[1], len = Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)) / R * rc, k;
          var thru = Math.abs((b[0] - a[0]) * (a[1] - cy) - (a[0] - cx) * (b[1] - a[1])) / Math.max(1, len / rc * R) < 2;
          if ((a[2] === "o" && b[2] === "c") || (a[2] === "c" && b[2] === "o")) k = "r";
          else if (a[2] === "c" && b[2] === "c" && thru) k = "d";
          else if (a[2] === "c" && b[2] === "c") k = "chord";
          else if (a[2] === "o" || b[2] === "o") k = "half";
          else k = "none";
          return { k: k, len: len };
        };
        var segDraw = function () {
          line.setAttribute("x1", E[0][0].toFixed(1)); line.setAttribute("y1", E[0][1].toFixed(1)); line.setAttribute("x2", E[1][0].toFixed(1)); line.setAttribute("y2", E[1][1].toFixed(1));
          at(hs[0], E[0][0], E[0][1]); at(hs[1], E[1][0], E[1][1]);
          var j = judge(), L = fmt(j.len, 1) + " cm", m = {
            r: ["是半径：从圆心连到圆上，长 " + L + "。", "ok"],
            d: ["是直径：通过圆心，两端都在圆上，长 " + L + "。", "ok"],
            chord: ["两端都在圆上，可是没有通过圆心：不是直径。它长 " + L + "，比直径 " + 2 * rc + " cm 短。", "no"],
            half: ["一端在圆心，另一端不在圆上：不是半径。", "no"],
            none: ["这条线段不是半径，也不是直径。把端点拖到圆心或圆上试试。", ""]
          }[j.k];
          out(rd2, "红线段：" + m[0], "红线段：" + m[0].replace(/cm/g, "厘米"), m[1]);
        };
        seg0();
      }
      hint.textContent = cfg.seg ? "红线段的两个端点可以拖（靠近圆心或圆时会吸上去），也可以用 Tab 选中后按方向键。" : "";
      mount(!!cfg.seg); show();
    }

    /* ---------- 扇形与圆心角 ---------- */
    function sector() {
      var W = 360, H = 270, cx = 180, cy = 140, R = 100, a0 = cfg.angle || 120, st = { b: a0, vtx: false, tri: false };
      var s = stage(W, H, "扇形和圆心角");
      el("circle", { cx: cx, cy: cy, r: R, style: "fill:var(--card);stroke:var(--fg);stroke-width:2.5" }, s);
      var pSec = el("path", { style: "fill:var(--a);fill-opacity:.35" }, s), pTri = el("path", { style: "fill:var(--c);fill-opacity:.45;stroke:var(--c);stroke-width:2.5;stroke-dasharray:7 5" }, s);
      var pArc = el("path", { style: "fill:none;stroke:var(--no);stroke-width:6;stroke-linecap:round" }, s);
      var pR = el("path", { style: "fill:none;stroke:var(--fg);stroke-width:3" }, s), pAng = el("path", { style: "fill:none;stroke:var(--b);stroke-width:2.5" }, s);
      var pV = el("path", { style: "fill:none;stroke:var(--c);stroke-width:3" }, s);
      el("circle", { cx: cx, cy: cy, r: 4, style: "fill:var(--fg)" }, s);
      var tO = txt(s, cx - 6, cy + 24, "O"), tA = txt(s, cx + R + 16, cy + 6, "A"), tB = txt(s, 0, 0, "B"), tDeg = txt(s, 0, 0, "", "fill:var(--b)"), tArc = txt(s, 0, 0, "弧", "fill:var(--no)"), tC = txt(s, 0, 0, "", "fill:var(--c)");
      var hB = handle(s, "var(--hl-soft)", "var(--no)", "");
      arrows(hB, "半径 OB 的端点 B。左右方向键改圆心角", function (dx, dy) { set(st.b + (dx || -dy) * 5); });
      drag(hB, s, function (p) { var a = (Math.atan2(-(p[1] - cy), p[0] - cx) * 180 / Math.PI + 360) % 360; set(Math.round(a / 5) * 5); }, function () { log("angle", { b: st.b }); });
      var bV = btn("把角的顶点挪到圆上", function () { st.vtx = !st.vtx; st.tri = false; draw(); log("vertex", { on: st.vtx }); if (st.vtx) { emitAns("sector:vtx", false); firstTry = false; } });
      var bT = btn("只涂三角形 AOB", function () { st.tri = !st.tri; st.vtx = false; draw(); log("tri", { on: st.tri }); if (st.tri && st.b < 180) { emitAns("sector:tri", false); firstTry = false; } });
      btn("重来", function () { st = { b: a0, vtx: false, tri: false }; reported = false; draw(); log("reset"); });
      hint.textContent = "拖红色的点 B（或用 Tab 选中后按方向键），把圆心角变大变小。";
      mount();
      function P2(a, r, ox, oy) { return [(ox == null ? cx : ox) + r * Math.cos(rad(-a)), (oy == null ? cy : oy) + r * Math.sin(rad(-a))]; }
      function set(b) {
        b = Math.min(350, Math.max(10, b)); [90, 180, 270].forEach(function (t) { if (Math.abs(b - t) <= 6) b = t; }); st.b = b; draw();
        if (!st.vtx && !st.tri && (b === 90 || b === 180 || b === 270) && !reported) { reported = true; emitAns("sector:" + b + "°", true); }
      }
      function draw() {
        var b = st.b, A = [cx + R, cy], B = P2(b, R), big = b > 180 ? 1 : 0, M = P2(b / 2, R + 24), Q = P2(b / 2, 48), m28 = P2(b, 28);
        pSec.setAttribute("d", "M" + cx + " " + cy + " L" + A[0] + " " + A[1] + " A" + R + " " + R + " 0 " + big + " 0 " + B[0].toFixed(1) + " " + B[1].toFixed(1) + " Z");
        pArc.setAttribute("d", "M" + A[0] + " " + A[1] + " A" + R + " " + R + " 0 " + big + " 0 " + B[0].toFixed(1) + " " + B[1].toFixed(1));
        pR.setAttribute("d", "M" + A[0] + " " + A[1] + " L" + cx + " " + cy + " L" + B[0].toFixed(1) + " " + B[1].toFixed(1));
        pAng.setAttribute("d", "M" + (cx + 28) + " " + cy + " A28 28 0 " + big + " 0 " + m28[0].toFixed(1) + " " + m28[1].toFixed(1));
        at(hB, B[0], B[1]);
        var Bl = P2(b, R + 20); tB.setAttribute("x", Bl[0].toFixed(1)); tB.setAttribute("y", (Bl[1] + 6).toFixed(1));
        tArc.setAttribute("x", M[0].toFixed(1)); tArc.setAttribute("y", (M[1] + 6).toFixed(1));
        tDeg.setAttribute("x", Q[0].toFixed(1)); tDeg.setAttribute("y", (Q[1] + 6).toFixed(1)); tDeg.textContent = b + "°";
        hB.setAttribute("aria-valuetext", b + "度");
        pSec.style.display = st.vtx || st.tri ? "none" : "";
        pTri.style.display = st.tri && b < 180 ? "" : "none";
        pTri.setAttribute("d", "M" + cx + " " + cy + " L" + A[0] + " " + A[1] + " L" + B[0].toFixed(1) + " " + B[1].toFixed(1) + " Z");
        var C = P2(b / 2 + 180, R);
        pV.style.display = tC.style.display = st.vtx ? "" : "none";
        pV.setAttribute("d", "M" + A[0] + " " + A[1] + " L" + C[0].toFixed(1) + " " + C[1].toFixed(1) + " L" + B[0].toFixed(1) + " " + B[1].toFixed(1));
        var Cl = P2(b / 2 + 180, R + 20); tC.setAttribute("x", Cl[0].toFixed(1)); tC.setAttribute("y", (Cl[1] + 6).toFixed(1)); tC.textContent = "C";
        pressed(bV, st.vtx); pressed(bT, st.tri);
        var m, sy, cls = "";
        if (st.vtx) { m = "角 ACB 的顶点 C 在圆上，不在圆心：它不是圆心角，CA、CB 也不是半径。"; sy = m; cls = "no"; }
        else if (st.tri && b >= 180) { m = "现在 A、O、B 已经不能围成三角形了。把圆心角调到 180° 以下再看。"; sy = m; }
        else if (st.tri) { m = "涂色的是三角形 AOB：A、B 之间是一条直直的线段。扇形的这条边是弯的弧，所以三角形 AOB 不是扇形。"; sy = m; cls = "no"; }
        else if (b === 90) { m = "圆心角 ∠AOB = 90°：这个扇形是圆的 " + fr(1, 4) + "。"; sy = "圆心角九十度，这个扇形是圆的四分之一。"; cls = "ok"; }
        else if (b === 180) { m = "圆心角 ∠AOB = 180°：这个扇形是半圆。"; sy = "圆心角一百八十度，这个扇形是半圆。"; cls = "ok"; }
        else if (b === 270) { m = "圆心角 ∠AOB = 270°：这个扇形是圆的 " + fr(3, 4) + "，比半圆还大，也是扇形。"; sy = "圆心角二百七十度，这个扇形是圆的四分之三，比半圆还大，也是扇形。"; cls = "ok"; }
        else { m = "圆心角 ∠AOB = " + b + "°。" + (b > 180 ? "比半圆还大，也是扇形。" : "同一个圆里，圆心角越大，扇形越大。"); sy = "圆心角是" + b + "度。" + (b > 180 ? "比半圆还大，也是扇形。" : "同一个圆里，圆心角越大，扇形越大。"); }
        out(rd, m, sy, cls);
      }
      draw();
    }

    /* ---------- 滚一圈量周长 ---------- */
    function roll() {
      var W = 420, H = 240, S = 24, X0 = 56, Y = 140, PR = [1, 0.1, 0.01], st = { d: cfg.d || 3, th: 0, done: false, p: 0.1, busy: false, rows: [] };
      var s = stage(W, H, "把圆在尺子上滚一圈"), i;
      el("rect", { x: X0 - 8, y: Y, width: 13 * S + 16, height: 34, rx: 4, style: "fill:var(--card);stroke:var(--line);stroke-width:2" }, s);
      for (i = 0; i <= 26; i++) {
        var x = X0 + i * S / 2;
        el("line", { x1: x, y1: Y, x2: x, y2: Y + (i % 2 ? 7 : 12), style: "stroke:var(--fg);stroke-width:1.5" }, s);
        if (i % 2 === 0) txt(s, x, Y + 30, String(i / 2), "font-size:16px;font-weight:400");
      }
      var trail = el("line", { y1: Y, y2: Y, style: "stroke:var(--no);stroke-width:6;stroke-linecap:round" }, s);
      var gDia = el("g", {}, s), wheel = el("g", {}, s), tD = txt(s, 0, 0, "", "fill:var(--b)"), tA = txt(s, 0, 0, "A", "fill:var(--no)");
      var wc = el("circle", { cx: 0, cy: 0, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:3" }, wheel);
      var wd = el("line", { y1: 0, y2: 0, style: "stroke:var(--b);stroke-width:2.5" }, wheel);
      var wa = el("circle", { cx: 0, r: 6, style: "fill:var(--no)" }, wheel);
      var bMinus = btn("直径 −", function () { setD(st.d - 0.5); }), cnt = h("span", "count", ""), bPlus;
      ctr.appendChild(cnt); bPlus = btn("直径 +", function () { setD(st.d + 0.5); });
      var bGo = btn("滚一圈", go), bDia = btn("拿直径去量", dia), bP = [];
      var ctr2 = h("div", "ctrls"), ctr3 = h("div", "ctrls");
      PR.forEach(function (p) { bP.push(btn("尺子量到 " + p + " cm", function () { st.p = p; prec(); if (st.done) final(); log("prec", { p: p }); }, ctr2)); });
      btn("重来", function () { stop(); st = { d: cfg.d || 3, th: 0, done: false, p: 0.1, busy: false, rows: [] }; reported = false; clear(gDia); table(); prec(); place(); idle(); log("reset"); }, ctr3);
      var tw = h("div", "ck-wrap"), tb = h("table", "ck-tab"); tw.appendChild(tb);
      root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(ctr3); root.appendChild(rd); root.appendChild(tw);
      hint.textContent = "每滚完一圈，结果记进上面的表。换几个直径、换尺子的精度再滚。"; root.appendChild(hint);
      function rp() { return st.d / 2 * S; }
      function setD(d) { if (st.busy) return; st.d = Math.min(4, Math.max(1, d)); st.th = 0; st.done = false; clear(gDia); place(); idle(); }
      function prec() { bP.forEach(function (b, j) { pressed(b, PR[j] === st.p); }); }
      function place() {
        var r = rp(), x = X0 + st.th * r;
        wheel.setAttribute("transform", "translate(" + x.toFixed(1) + " " + (Y - r) + ") rotate(" + (st.th * 180 / Math.PI).toFixed(1) + ")");
        wc.setAttribute("r", r); wd.setAttribute("x1", -r); wd.setAttribute("x2", r); wa.setAttribute("cy", r);
        var ux = -Math.sin(st.th), uy = Math.cos(st.th), lx = x + (r + 18) * ux, ly = Y - r + (r + 18) * uy + 6;
        if (ly > Y - 4) { lx = x + r * ux - 16; ly = Y - 8; }
        tA.setAttribute("x", lx.toFixed(1)); tA.setAttribute("y", ly.toFixed(1));
        tD.setAttribute("x", x.toFixed(1)); tD.setAttribute("y", (Y - 2 * r - 10).toFixed(1)); tD.textContent = "d = " + st.d + " cm";
        trail.setAttribute("x1", X0); trail.setAttribute("x2", (x + 0.01).toFixed(1)); trail.style.display = st.th > 0 ? "" : "none";
        cnt.innerHTML = "<b>" + st.d + "</b>cm"; bMinus.disabled = st.d <= 1 || st.busy; bPlus.disabled = st.d >= 4 || st.busy; bGo.disabled = st.busy; bDia.disabled = !st.done || st.busy;
      }
      function idle() { out(rd, "红点 A 先碰着尺子的 0。点「滚一圈」，让圆贴着尺子滚，不要滑。", "红点A先碰着尺子的零。点滚一圈，让圆贴着尺子滚，不要滑。"); }
      function meas() { return Math.round(Math.PI * st.d / st.p) * st.p; }
      function measT() { return meas().toFixed(st.p === 1 ? 0 : st.p === 0.1 ? 1 : 2); }
      function q2() { return (Math.round(meas() / st.d * 100 + 1e-7) / 100).toFixed(2); }
      function go() {
        if (st.busy) return;
        st.busy = true; st.done = false; st.th = 0; clear(gDia);
        anim(3200, function (k) {
          st.th = 2 * Math.PI * k; place();
          var L = st.th * st.d / 2;
          out(rd, "滚过了 " + L.toFixed(2) + " cm，是直径的 " + (L / st.d).toFixed(2) + " 倍");
        }, function () {
          st.busy = false; st.done = true; place(); final();
          st.rows.push([st.d, st.p, measT(), q2()]); if (st.rows.length > 6) st.rows.shift(); table();
          log("roll", { d: st.d, p: st.p });
          if (!reported) { reported = true; emitAns("roll:d=" + st.d, true); }
        });
      }
      function final() {
        var c = measT();
        out(rd, "滚了一圈，A 又碰到了尺子。尺子量到 " + st.p + " cm，周长约是 " + c + " cm；周长 ÷ 直径 = " + c + " ÷ " + st.d + " ≈ " + q2() + "。", "滚了一圈。周长约是" + c + "厘米，周长除以直径，大约是" + q2() + "。", "ok");
      }
      function table() {
        var h0 = "<tr><th>直径</th><th>尺子量到</th><th>周长约</th><th>周长 ÷ 直径</th></tr>";
        tb.innerHTML = st.rows.length ? h0 + st.rows.map(function (r) { return "<tr><td>" + r[0] + " cm</td><td>" + r[1] + " cm</td><td>" + r[2] + " cm</td><td><b>" + r[3] + "</b></td></tr>"; }).join("") : "";
      }
      function dia() {
        if (!st.done) return;
        clear(gDia);
        var L = Math.PI * st.d * S, w = st.d * S, n = 0, x = X0;
        while (x + w <= X0 + L + 0.01) { el("line", { x1: x + 1, y1: Y + 52, x2: x + w - 1, y2: Y + 52, style: "stroke:" + (n % 2 ? "var(--c)" : "var(--b)") + ";stroke-width:8" }, gDia); txt(gDia, x + w / 2, Y + 76, String(n + 1), "fill:" + (n % 2 ? "var(--c)" : "var(--b)")); x += w; n++; }
        el("line", { x1: x + 1, y1: Y + 52, x2: X0 + L, y2: Y + 52, style: "stroke:var(--no);stroke-width:8" }, gDia);
        out(rd, "拿直径去量周长：量了 " + n + " 个直径，还剩一小段。周长是直径的 3 倍多一些。", "量了三个直径，还剩一小段。周长是直径的三倍多一些。", "ok");
        log("dia");
      }
      prec(); table(); place(); idle();
    }

    /* ---------- 数方格 ---------- */
    function grid() {
      var Rc = cfg.r || 6, W = 360, H = 310, X0 = 60, Y0 = 275, L = 250, U = L / Rc, G = [1, 0.5, 0.2], st = { g: 1 };
      var s = stage(W, H, "四分之一个圆放在方格纸上"), gC = el("g", {}, s);
      el("path", { d: "M" + X0 + " " + (Y0 - L) + " A" + L + " " + L + " 0 0 1 " + (X0 + L) + " " + Y0, style: "fill:none;stroke:var(--fg);stroke-width:3.5" }, s);
      el("path", { d: "M" + X0 + " " + (Y0 - L) + " L" + X0 + " " + Y0 + " L" + (X0 + L) + " " + Y0, style: "fill:none;stroke:var(--fg);stroke-width:3.5" }, s);
      txt(s, X0 + L / 2, Y0 + 22, "r = " + Rc + " cm", "fill:var(--b)"); txt(s, X0 - 10, Y0 + 6, "O", "", "end");
      var bs = G.map(function (g) { return btn(g === 1 ? "1 cm 方格" : (g * 10) + " mm 方格", function () { st.g = g; draw(); log("grid", { g: g }); if (g !== 1 && !reported) { reported = true; emitAns("grid:" + g, true); } }); });
      btn("重来", function () { st.g = 1; reported = false; draw(); });
      mount(true);
      function draw() {
        clear(gC);
        var g = st.g, n = Math.round(Rc / g), c = g * U, F = 0, Q = 0, i, j;
        for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
          var far = Math.sqrt(Math.pow((i + 1) * g, 2) + Math.pow((j + 1) * g, 2)), near = Math.sqrt(Math.pow(i * g, 2) + Math.pow(j * g, 2)), k = "";
          if (far <= Rc + 1e-9) { F++; k = "var(--a)"; } else if (near < Rc - 1e-9) { Q++; k = "var(--hl)"; }
          el("rect", { x: (X0 + i * c).toFixed(2), y: (Y0 - (j + 1) * c).toFixed(2), width: c.toFixed(2), height: c.toFixed(2), style: "fill:" + (k || "none") + ";fill-opacity:.45;stroke:var(--line);stroke-width:1" }, gC);
        }
        bs.forEach(function (b, j2) { pressed(b, G[j2] === g); });
        var a = g * g, A1 = (F + Q) * a * 4, A2 = (F + Q / 2) * a * 4, r2 = Rc * Rc, unit = g === 1 ? "1 cm²" : fmt(a, 2) + " cm²";
        out(rd, "满格（绿）" + F + " 个，不满一格（黄）" + Q + " 个，每格 " + unit + "。", "满格" + F + "个，不满一格" + Q + "个。");
        out(rd2, "不满的算一格：圆面积约 " + fmt(A1, 2) + " cm²；算半格：约 " + fmt(A2, 2) + " cm²，是半径平方（" + r2 + " cm²）的 " + fmt(A2 / r2, 2) + " 倍。", "按半格算，圆的面积大约是" + fmt(A2, 2) + "平方厘米，是半径平方的" + fmt(A2 / r2, 2) + "倍。", "ok");
      }
      hint.textContent = "数的是四分之一个圆，乘 4 就是整个圆。方格越小，估得越准。";
      draw();
    }

    /* ---------- 切拼成近似长方形 ---------- */
    function cut() {
      var W = 360, H = 250, r = 74, CX = 180, CY = 106, Yb = 236, rc = cfg.r || 4, st = { n: 8, on: false, edge: false, k: 0 };
      var s = stage(W, H, "把圆切开拼成近似长方形"), gP = el("g", {}, s), gE = el("g", {}, s), gT = el("g", {}, s), pcs = [];
      var bn = [8, 16, 32].map(function (n) { return btn(n + " 份", function () { st.n = n; build(); log("cutn", { n: n }); }); });
      var bOn = btn("拼一拼", function () { st.on = !st.on; st.edge = false; go(); log("cut", { n: st.n, on: st.on }); });
      var bE = btn("描一描边", function () { st.edge = !st.edge; edges(); say2(); });
      btn("重来", function () { stop(); st = { n: 8, on: false, edge: false, k: 0 }; reported = false; build(); });
      mount(true);
      function lay() {
        var n = st.n, th = 360 / n, c = 2 * r * Math.sin(rad(th / 2)), hh = r * Math.cos(rad(th / 2)), X0 = (W - (n / 2 * c + c / 2)) / 2;
        return { th: th, c: c, hh: hh, X0: X0 };
      }
      function build() {
        stop(); clear(gP); pcs = []; st.edge = false;
        var L = lay(), n = st.n, i;
        var d = "M0 0 L" + (r * Math.cos(rad(-L.th / 2))).toFixed(2) + " " + (r * Math.sin(rad(-L.th / 2))).toFixed(2) + " A" + r + " " + r + " 0 0 1 " + (r * Math.cos(rad(L.th / 2))).toFixed(2) + " " + (r * Math.sin(rad(L.th / 2))).toFixed(2) + " Z";
        for (i = 0; i < n; i++) {
          var top = i < n / 2, phi = (180 + (i + 0.5) * L.th) % 360, p = top ? i : n / 2 - 1 - (i - n / 2);
          var tx = top ? L.X0 + L.c / 2 + p * L.c : L.X0 + (p + 1) * L.c, ty = top ? Yb : Yb - L.hh, tr = top ? 270 : 90;
          var dr = ((tr - phi + 540) % 360) - 180;
          pcs.push({ node: el("path", { d: d, style: "fill:" + (top ? "var(--no)" : "var(--c)") + ";fill-opacity:.55;stroke:var(--fg);stroke-width:" + (n > 16 ? 0.8 : 1.3) }, gP), phi: phi, dr: dr, tx: tx, ty: ty });
        }
        bn.forEach(function (b, j) { pressed(b, [8, 16, 32][j] === n); });
        pos(st.on ? 1 : 0); edges(); say2();
      }
      function pos(k) {
        st.k = k;
        var e = ease(k);
        pcs.forEach(function (q) {
          var x = CX + e * (q.tx - CX), y = CY + e * (q.ty - CY), a = q.phi + e * q.dr;
          q.node.setAttribute("transform", "translate(" + x.toFixed(2) + " " + y.toFixed(2) + ") rotate(" + a.toFixed(2) + ")");
        });
        clear(gT);
        if (k === 1 && st.on) {
          // 标注字号按 SVG 实际缩放算：窄屏上图缩小了，字就相应加大，保证渲染出来 ≥ 14.5px
          var L = lay(), right = L.X0 + L.c / 2 + st.n / 2 * L.c, top = Yb - L.hh, sc = s.getBoundingClientRect().width / W;
          var fs = sc ? Math.max(17, Math.ceil(14.5 / sc)) : 17, f = ";font-size:" + fs + "px";
          el("path", { d: "M" + L.X0 + " " + (top - 8) + " L" + L.X0 + " " + (top - 16) + " L" + (right - L.c / 2) + " " + (top - 16) + " L" + (right - L.c / 2) + " " + (top - 8), style: "fill:none;stroke:var(--no);stroke-width:2" }, gT);
          txt(gT, (L.X0 + right - L.c / 2) / 2, top - 24, "长 ≈ 周长的一半 = πr", "fill:var(--no)" + f);
          txt(gT, L.X0 - 6, (top + Yb) / 2 - 4, "宽", "fill:var(--b)" + f, "end"); txt(gT, L.X0 - 6, (top + Yb) / 2 - 4 + fs * 1.15, "≈ r", "fill:var(--b)" + f, "end");
        }
      }
      window.addEventListener("resize", function () { if (st.on && st.k === 1) pos(1); });
      function go() {
        bOn.textContent = st.on ? "放回去" : "拼一拼"; pressed(bOn, st.on); edges();
        var k0 = st.k, k1 = st.on ? 1 : 0;
        anim(1600, function (k) { pos(k0 + (k1 - k0) * k); }, function () {
          pos(k1); say2();
          if (st.on && !reported) { reported = true; emitAns("cut:" + st.n, true); }
        });
      }
      function edges() {
        clear(gE); bE.disabled = !st.on; pressed(bE, st.edge);
        if (!st.edge || !st.on) return;
        var L = lay(), top = Yb - L.hh, right = L.X0 + L.c / 2 + st.n / 2 * L.c;
        el("line", { x1: L.X0 + L.c / 2, y1: Yb, x2: L.X0, y2: top, style: "stroke:var(--a);stroke-width:5;stroke-dasharray:8 5" }, gE);
        el("line", { x1: right - L.c / 2, y1: top, x2: right, y2: Yb, style: "stroke:var(--a);stroke-width:5;stroke-dasharray:8 5" }, gE);
      }
      function say2() {
        var n = st.n;
        if (!st.on) { out(rd, "把圆平均分成 " + n + " 份：上半圈涂红，下半圈涂蓝。点「拼一拼」。", "把圆平均分成" + n + "份，上半圈涂红，下半圈涂蓝。"); rd2.innerHTML = ""; rd2.className = "read"; return; }
        if (st.edge) { out(rd, "描一圈边：上面是红弧，下面是蓝弧，各是周长的一半；左右两边（绿虚线）是多出来的两条半径。拼好后周长变长了，面积没变。", "拼好后周长多了两条半径，变长了；面积没变。", "ok"); }
        else out(rd, n === 8 ? "拼成的图形边是波浪形的，有点像平行四边形。再多分几份试试。" : n === 16 ? "分成 16 份，更像长方形了。" : "分成 32 份，已经很接近长方形了：长 ≈ 周长的一半，宽 ≈ 半径。", n === 32 ? "分的份数越多，拼出的图形越接近长方形。长大约是周长的一半，宽大约是半径。" : "再多分几份试试。", n === 32 ? "ok" : "");
        var len = fmt(3.14 * rc);
        out(rd2, "<i>r</i> = " + rc + " cm 时：长 ≈ 3.14 × " + rc + " = " + len + " cm，宽 ≈ " + rc + " cm，面积 ≈ " + len + " × " + rc + " = " + fmt(3.14 * rc * rc) + " cm²。小块只是换了位置，面积还是这个圆的面积。");
      }
      build();
    }

    /* ---------- 圆环 ---------- */
    function ring() {
      var W = 360, H = 260, cx = 180, cy = 128, S = 19, R0 = cfg.R || 5, r0 = cfg.r || 3, st = { R: R0, r: r0, ox: 0, oy: 0, bad: false };
      var s = stage(W, H, "圆环");
      var pRing = el("path", { style: "fill:var(--a);fill-opacity:.45;stroke:var(--fg);stroke-width:2.5;fill-rule:evenodd" }, s);
      var pBad = el("circle", { style: "fill:var(--no);fill-opacity:.25;stroke:var(--no);stroke-width:2.5;stroke-dasharray:7 5" }, s);
      var lR = el("line", { style: "stroke:var(--b);stroke-width:2.5" }, s), lr = el("line", { style: "stroke:var(--c);stroke-width:2.5" }, s);
      var tR = txt(s, 0, 0, "", "fill:var(--b)"), tr = txt(s, 0, 0, "", "fill:var(--c)");
      var hd = handle(s, "var(--card)", "var(--c)", "");
      arrows(hd, "内圆的圆心，用方向键挪动内圆", function (dx, dy) { mv(st.ox + dx * 8, st.oy + dy * 8); });
      drag(hd, s, function (p) { mv(p[0] - cx, p[1] - cy); }, function () { log("ringmove"); });
      var c1 = h("span", "count"), c2 = h("span", "count");
      btn("外圆 −", function () { setR(st.R - 1, st.r); }); ctr.appendChild(c1); btn("外圆 +", function () { setR(st.R + 1, st.r); });
      var ctr2 = h("div", "ctrls");
      btn("内圆 −", function () { setR(st.R, st.r - 1); }, ctr2); ctr2.appendChild(c2); btn("内圆 +", function () { setR(st.R, st.r + 1); }, ctr2);
      var bBad = btn("看看错的算法", function () { st.bad = !st.bad; draw(); log("ringbad", { on: st.bad }); if (st.bad) { emitAns("ring:bad", false); firstTry = false; } }, ctr2);
      btn("重来", function () { st = { R: R0, r: r0, ox: 0, oy: 0, bad: false }; reported = false; draw(); }, ctr2);
      root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(rd); root.appendChild(rd2);
      hint.textContent = "拖内圆中间的蓝色点（或用 Tab 选中后按方向键），把内圆挪开中心看看。"; root.appendChild(hint);
      function setR(R, r) { st.R = Math.min(6, Math.max(2, R)); st.r = Math.min(st.R - 1, Math.max(1, r)); mv(st.ox, st.oy); if (!reported) { reported = true; emitAns("ring:" + st.R + "-" + st.r, true); } }
      function mv(x, y) { var lim = (st.R - st.r) * S - 4, d = Math.sqrt(x * x + y * y); if (d > lim) { x = x / d * lim; y = y / d * lim; } st.ox = Math.round(x); st.oy = Math.round(y); draw(); }
      function draw() {
        var R = st.R * S, r = st.r * S, ix = cx + st.ox, iy = cy + st.oy;
        pRing.setAttribute("d", circD(cx, cy, R) + " " + circD(ix, iy, r));
        lR.setAttribute("x1", cx); lR.setAttribute("y1", cy); lR.setAttribute("x2", cx + R * 0.71); lR.setAttribute("y2", cy + R * 0.71);
        lr.setAttribute("x1", ix); lr.setAttribute("y1", iy); lr.setAttribute("x2", ix - r); lr.setAttribute("y2", iy);
        tR.setAttribute("x", cx + R * 0.71 + 8); tR.setAttribute("y", cy + R * 0.71 + 22); tR.textContent = "R = " + st.R + " cm"; tR.setAttribute("text-anchor", "start");
        tr.setAttribute("x", ix - r / 2); tr.setAttribute("y", iy - 8); tr.textContent = "r = " + st.r;
        at(hd, ix, iy);
        pBad.setAttribute("cx", ix); pBad.setAttribute("cy", iy); pBad.setAttribute("r", (st.R - st.r) * S); pBad.style.display = st.bad ? "" : "none";
        c1.innerHTML = "<b>" + st.R + "</b>cm"; c2.innerHTML = "<b>" + st.r + "</b>cm"; pressed(bBad, st.bad);
        var A = 3.14 * st.R * st.R, a = 3.14 * st.r * st.r, off = st.ox || st.oy;
        out(rd, "外圆 3.14 × " + st.R + "² = " + fmt(A) + "（cm²），内圆 3.14 × " + st.r + "² = " + fmt(a) + "（cm²）；圆环 " + fmt(A) + " − " + fmt(a) + " = <b>" + fmt(A - a) + "</b>（cm²）。" + (off ? " 内圆挪开了中心，剩下的面积没变。" : ""),
          "圆环的面积是外圆面积减内圆面积，等于" + fmt(A - a) + "平方厘米。" + (off ? "内圆挪开了中心，剩下的面积没变。" : ""), "ok");
        if (st.bad) out(rd2, "错的算法 3.14 × (" + st.R + " − " + st.r + ")² = " + fmt(3.14 * (st.R - st.r) * (st.R - st.r)) + "（cm²）：只是红虚线这么一个小圆，比圆环小多了。要先平方，再相减。", "先减再平方，只算出一个小圆，比圆环小多了。要先平方，再相减。", "no");
        else out(rd2, "也可以合起来算：3.14 × (" + st.R + "² − " + st.r + "²) = 3.14 × " + (st.R * st.R - st.r * st.r) + " = " + fmt(A - a) + "（cm²）。");
      }
      draw();
    }

    /* ---------- 组合图形：平移、旋转 ---------- */
    function move() {
      var W = 360, kind = cfg.kind || "shift", H = kind === "turn" ? 240 : 270, st = { on: false, k: 0 };
      var s = stage(W, H, kind === "turn" ? "把小半圆绕圆心转半圈" : "把半圆平移下去"), base, mover, area, msg0, msg1, t;
      if (kind === "turn") {
        var Rr = cfg.R || 4, R = 136, o = [180, 150], rr = R / 2;
        base = "M" + (o[0] - R) + " " + o[1] + " A" + R + " " + R + " 0 0 1 " + (o[0] + R) + " " + o[1] + " L" + o[0] + " " + o[1] + " A" + rr + " " + rr + " 0 0 0 " + (o[0] - R) + " " + o[1] + " Z";
        mover = "M" + o[0] + " " + o[1] + " A" + rr + " " + rr + " 0 0 0 " + (o[0] + R) + " " + o[1] + " Z";
        area = fmt(3.14 * Rr * Rr / 2);
        t = function (k) { return "rotate(" + (180 * k).toFixed(1) + " " + o[0] + " " + o[1] + ")"; };
        msg0 = "大半圆左边挖掉一个小半圆，右下又拼上一个一样大的小半圆。怎样算它的面积？";
        msg1 = "把右下的小半圆绕 O 转半圈，正好补上缺口，变成一个大半圆：面积 = 3.14 × " + Rr + "² ÷ 2 = " + area + "（cm²）。";
        el("circle", { cx: o[0], cy: o[1], r: 4, style: "fill:var(--fg)" }, s);
        txt(s, o[0] + 8, o[1] - 10, "O", "", "start");
        var gLab = el("g", {}, s);
        el("line", { x1: o[0], y1: o[1], x2: o[0], y2: o[1] - R, style: "stroke:var(--b);stroke-width:2.5;stroke-dasharray:6 4" }, gLab);
        txt(gLab, o[0] + 8, o[1] - R / 2, Rr + " cm", "fill:var(--b)", "start");
      } else {
        var w = cfg.w || 4, hh = cfg.h || 5, U = 120 / w, X = 120, Yt = 75, Hp = hh * U, rh = 60;
        base = "M" + X + " " + Yt + " L" + (X + 120) + " " + Yt + " L" + (X + 120) + " " + (Yt + Hp) + " A" + rh + " " + rh + " 0 0 0 " + X + " " + (Yt + Hp) + " Z";
        mover = "M" + X + " " + Yt + " A" + rh + " " + rh + " 0 0 1 " + (X + 120) + " " + Yt + " Z";
        area = fmt(w * hh);
        t = function (k) { return "translate(0 " + (Hp * k).toFixed(1) + ")"; };
        msg0 = "这个图形上面凸出一个半圆，下面凹进一个一样大的半圆。怎样算它的面积？";
        msg1 = "把上面的半圆平移到下面，正好补上缺口，拼成一个长方形：面积 = " + w + " × " + hh + " = " + area + "（cm²）。";
        txt(s, X - 8, Yt + Hp / 2 + 6, hh + " cm", "fill:var(--b)", "end");
        txt(s, X + 60, Yt + 26, w + " cm", "fill:var(--b)");
      }
      el("path", { d: base, style: "fill:var(--a);fill-opacity:.4;stroke:var(--fg);stroke-width:2.5" }, s);
      var mv = el("path", { d: mover, style: "fill:var(--c);fill-opacity:.55;stroke:var(--fg);stroke-width:2.5" }, s);
      [].slice.call(s.children || s.childNodes).forEach(function (n) { if (n.tagName && /^(text|g|circle|line)$/i.test(n.tagName)) s.appendChild(n); });
      var b = btn(kind === "turn" ? "转半圈" : "平移下去", function () {
        st.on = !st.on; b.textContent = st.on ? "放回去" : (kind === "turn" ? "转半圈" : "平移下去"); pressed(b, st.on);
        var k0 = st.k, k1 = st.on ? 1 : 0;
        anim(1500, function (k) { st.k = k0 + (k1 - k0) * ease(k); mv.setAttribute("transform", t(st.k)); }, function () {
          st.k = k1; tell(); log("move", { on: st.on });
          if (st.on && !reported) { reported = true; emitAns("move:" + kind, true); }
        });
      });
      btn("重来", function () { stop(); st = { on: false, k: 0 }; reported = false; mv.setAttribute("transform", t(0)); b.textContent = kind === "turn" ? "转半圈" : "平移下去"; pressed(b, false); tell(); });
      mount();
      function tell() { if (st.on) out(rd, msg1 + " 移动后面积不变。", msg1.replace(/[（）]|cm²/g, "") + "移动后面积不变。", "ok"); else out(rd, msg0, msg0); }
      tell();
    }

    /* ---------- 外方内圆、外圆内方 ---------- */
    function square() {
      var W = 360, H = 205, r = 60, L = [90, 96], Rt = [270, 96], hs = r / Math.SQRT2, st = { v: 2, tri: false, turn: false, k: 0 };
      var s = stage(W, H, "外方内圆和外圆内方");
      el("rect", { x: L[0] - r, y: L[1] - r, width: 2 * r, height: 2 * r, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:2.5" }, s);
      el("circle", { cx: L[0], cy: L[1], r: r, style: "fill:var(--a);fill-opacity:.4;stroke:var(--fg);stroke-width:2.5" }, s);
      el("line", { x1: L[0] - r, y1: L[1], x2: L[0] + r, y2: L[1], style: "stroke:var(--b);stroke-width:2;stroke-dasharray:6 4" }, s);
      txt(s, L[0], L[1] + r + 26, "外方内圆");
      var big = el("rect", { x: Rt[0] - r, y: Rt[1] - r, width: 2 * r, height: 2 * r, style: "fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:6 4" }, s);
      var gCorner = el("g", {}, s);
      el("circle", { cx: Rt[0], cy: Rt[1], r: r, style: "fill:var(--a);fill-opacity:.4;stroke:var(--fg);stroke-width:2.5" }, s);
      var sq = el("path", { style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:2.5" }, s), gTri = el("g", {}, s);
      txt(s, Rt[0], Rt[1] + r + 26, "外圆内方");
      var bv = [1, 2, 3, "a"].map(function (v) { return btn("r = " + v, function () { st.v = v; tell(); log("sq", { v: v }); }); });
      var ctr2 = h("div", "ctrls");
      var bTri = btn("切成两个三角形", function () { st.tri = !st.tri; st.turn = false; st.k = 0; draw(); if (st.tri && !reported) { reported = true; emitAns("square:tri", true); } }, ctr2);
      var bTurn = btn("叠起来转一转", function () {
        st.turn = !st.turn; st.tri = false; draw();
        var k0 = st.k, k1 = st.turn ? 1 : 0;
        anim(1300, function (k) { st.k = k0 + (k1 - k0) * ease(k); drawSq(); }, function () {
          st.k = k1; draw();
          if (st.turn && !reported) { reported = true; emitAns("square:turn", true); }
        });
      }, ctr2);
      btn("重来", function () { stop(); st = { v: 2, tri: false, turn: false, k: 0 }; reported = false; draw(); }, ctr2);
      var tw = h("div", "ck-wrap"), tb = h("table", "ck-tab"); tw.appendChild(tb);
      root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(rd); root.appendChild(tw);
      function drawSq() {
        var a = rad(45 + 45 * st.k), d = "";
        for (var i = 0; i < 4; i++) { var b = a + i * Math.PI / 2; d += (i ? " L" : "M") + (Rt[0] + r * Math.cos(b)).toFixed(1) + " " + (Rt[1] + r * Math.sin(b)).toFixed(1); }
        sq.setAttribute("d", d + " Z");
      }
      function draw() {
        drawSq(); clear(gTri); clear(gCorner);
        big.style.display = st.turn ? "" : "none";
        pressed(bTri, st.tri); pressed(bTurn, st.turn);
        if (st.tri) {
          el("path", { d: "M" + (Rt[0] - hs) + " " + (Rt[1] - hs) + " L" + (Rt[0] + hs) + " " + (Rt[1] - hs) + " L" + (Rt[0] + hs) + " " + (Rt[1] + hs) + " Z", style: "fill:var(--c);fill-opacity:.45" }, gTri);
          el("line", { x1: Rt[0] - hs, y1: Rt[1] - hs, x2: Rt[0] + hs, y2: Rt[1] + hs, style: "stroke:var(--no);stroke-width:3" }, gTri);
          el("line", { x1: Rt[0], y1: Rt[1], x2: Rt[0] + hs, y2: Rt[1] - hs, style: "stroke:var(--b);stroke-width:2.5;stroke-dasharray:5 4" }, gTri);
          txt(gTri, Rt[0] - 26, Rt[1] + 20, "2r", "fill:var(--no)"); txt(gTri, Rt[0] + 30, Rt[1] - 4, "r", "fill:var(--b)");
          out(rd, "正方形的对角线就是圆的直径。沿它切成两个三角形：底是 2<i>r</i>，高是 <i>r</i>。一个三角形的面积 = 2<i>r</i> × <i>r</i> ÷ 2 = <i>r</i>²，正方形面积 = 2<i>r</i>²。", "正方形的对角线就是圆的直径。切成两个三角形，底是二r，高是r。正方形的面积是二乘r的平方。", "ok");
        } else if (st.turn && st.k === 1) {
          [[-1, -1, 0, -1, -1, 0], [1, -1, 0, -1, 1, 0], [1, 1, 0, 1, 1, 0], [-1, 1, 0, 1, -1, 0]].forEach(function (c) {
            el("path", { d: "M" + (Rt[0] + c[0] * r) + " " + (Rt[1] + c[1] * r) + " L" + (Rt[0] + c[2] * r) + " " + (Rt[1] + c[3] * r) + " L" + (Rt[0] + c[4] * r) + " " + (Rt[1] + c[5] * r) + " Z", style: "fill:var(--hl);fill-opacity:.35" }, gCorner);
          });
          out(rd, "把外方内圆的大正方形叠上来，小正方形转一转：四个角上的三角形和小正方形的四块一样大。大正方形的面积是小正方形的 2 倍。", "大正方形的面积是小正方形的两倍。", "ok");
        } else if (!st.turn) tell();
      }
      function tell() {
        bv.forEach(function (b, j) { pressed(b, [1, 2, 3, "a"][j] === st.v); });
        var v = st.v, isA = v === "a", r2 = isA ? 0 : v * v;
        var circle = isA ? "π<i>a</i>²" : (r2 === 1 ? "π" : r2 + "π"), sq4 = isA ? "4<i>a</i>²" : String(4 * r2), sq2 = isA ? "2<i>a</i>²" : String(2 * r2);
        tb.innerHTML = "<tr><th>圆的半径</th><td>" + (isA ? "<i>a</i>" : v) + " cm</td></tr><tr><th>圆的面积</th><td>" + circle + " cm²" + (isA ? "" : "（≈ " + fmt(3.14 * r2) + "）") + "</td></tr>" +
          "<tr><th>外方内圆：正方形</th><td>" + sq4 + " cm²</td></tr><tr><th>外圆内方：正方形</th><td>" + sq2 + " cm²</td></tr>";
        if (!st.tri && !st.turn) {
          out(rd, "外方内圆：正方形边长 = 直径；圆面积 " + circle + " 是正方形 " + sq4 + " 的 " + piFr(4) + "。外圆内方：圆面积是正方形 " + sq2 + " 的 " + piFr(2) + "。",
            "外方内圆，圆面积是正方形面积的四分之π。外圆内方，圆面积是正方形面积的二分之π。");
        }
      }
      draw();
    }

    /* ---------- 作图：按步骤画图案 ---------- */
    function design() {
      var W = 360, H = 300, U, steps, st = { i: 0, busy: false }, O = [180, 150];
      if (cfg.pattern === "flower") {
        U = 30; var R = 90, Pk = [];
        for (var k = 0; k < 6; k++) Pk.push([O[0] + R * Math.cos(rad(-90 + 60 * k)), O[1] + R * Math.sin(rad(-90 + 60 * k))]);
        var arcOf = function (k2) { var a = -90 + 60 * k2 + 180; return { c: Pk[k2], r: R, a0: a - 60, a1: a + 60 }; };
        steps = [
          { t: "以 O 为圆心、半径 3 cm 画一个圆。", arcs: [{ c: O, r: R, a0: 0, a1: 360 }] },
          { t: "在圆上找一个点，以它为圆心、半径还是 3 cm，在圆里画一段弧。先点出这段弧的圆心。", arcs: [arcOf(0)], cands: [[Pk[0], "圆上最高的点"], [O, "圆心 O"], [Pk[3], "圆上最低的点"]], ans: 0 },
          { t: "第二段弧的两头连着刚才那段弧的一头和圆心。它的圆心在哪？先点出来。", arcs: [arcOf(1)], cands: [[Pk[4], "左下的点"], [Pk[1], "右上的点"], [O, "圆心 O"]], ans: 1 },
          { t: "照样，以圆上的点为圆心，画完剩下的四段弧。", arcs: [arcOf(2), arcOf(3), arcOf(4), arcOf(5)] },
          { t: "涂上颜色：六片花瓣。", fill: [0, 1, 2, 3, 4, 5].map(function (k3) { var A = Pk[k3]; return { d: "M" + O[0] + " " + O[1] + " A" + R + " " + R + " 0 0 1 " + A[0].toFixed(1) + " " + A[1].toFixed(1) + " A" + R + " " + R + " 0 0 1 " + O[0] + " " + O[1] + " Z", c: k3 % 2 ? "var(--b)" : "var(--a)" }; }) }
        ];
      } else {
        U = 25; var L0 = [80, 150], R0 = [280, 150], M1 = [130, 150], M2 = [230, 150];
        steps = [
          { t: "以 O 为圆心、半径 4 cm 画一个圆。", arcs: [{ c: O, r: 100, a0: 0, a1: 360 }] },
          { t: "用直尺画一条直径，画成虚线（最后要擦掉）。", line: [L0, R0] },
          { t: "画上面这个小半圆：它从直径的左端到圆心。先点出它的圆心。", arcs: [{ c: M1, r: 50, a0: 180, a1: 360 }], cands: [[O, "圆心 O"], [M1, "左边半径的中点"], [L0, "直径的左端"]], ans: 1 },
          { t: "画下面这个小半圆：它从圆心到直径的右端。先点出它的圆心。", arcs: [{ c: M2, r: 50, a0: 0, a1: 180 }], cands: [[R0, "直径的右端"], [O, "圆心 O"], [M2, "右边半径的中点"]], ans: 2 },
          { t: "擦掉虚线，把上面一半涂上颜色。", fill: [{ d: "M80 150 A50 50 0 0 1 180 150 A50 50 0 0 0 280 150 A100 100 0 0 0 80 150 Z", c: "var(--a)" }], erase: true }
        ];
      }
      var s = stage(W, H, "用圆规和直尺画图案"), gF = el("g", {}, s), gD = el("g", {}, s), gNow = el("g", {}, s), gTool = el("g", {}, s), gCand = el("g", {}, s);
      var bNext = btn("画这一步", next), bBack = btn("退一步", function () { if (st.busy || !st.i) return; st.i--; redraw(); log("back"); });
      btn("重来", function () { stop(); st = { i: 0, busy: false }; reported = false; redraw(); log("reset"); });
      mount();
      function fmtArc(a, n) { return arcD(a.c[0], a.c[1], a.r, a.a0, a.a0 + (a.a1 - a.a0) * n); }
      function paint(g, sp) {
        if (sp.line) el("line", { x1: sp.line[0][0], y1: sp.line[0][1], x2: sp.line[1][0], y2: sp.line[1][1], "data-dash": "1", style: "stroke:var(--muted);stroke-width:2.5;stroke-dasharray:7 5" }, g);
        (sp.arcs || []).forEach(function (a) { el("path", { d: fmtArc(a, 1), style: "fill:none;stroke:var(--fg);stroke-width:3" }, g); });
        if (sp.cands) { var c = sp.arcs[0].c; el("circle", { cx: c[0], cy: c[1], r: 4, style: "fill:var(--c)" }, g); }
      }
      function redraw() {
        clear(gF); clear(gD); clear(gNow); clear(gTool); clear(gCand); st.busy = false;
        var erased = false;
        for (var i = 0; i < st.i; i++) { if (steps[i].erase) erased = true; }
        for (i = 0; i < st.i; i++) {
          var sp = steps[i];
          if (sp.fill) sp.fill.forEach(function (f) { el("path", { d: f.d, style: "fill:" + f.c + ";fill-opacity:.55;stroke:none" }, gF); });
          if (sp.line && erased) continue;
          paint(gD, sp);
        }
        el("circle", { cx: O[0], cy: O[1], r: 4, style: "fill:var(--fg)" }, gD); txt(gD, O[0] - 14, O[1] + 22, "O");
        bBack.disabled = !st.i;
        if (st.i >= steps.length) {
          bNext.disabled = true; out(rd, "画好了！每一段弧都是先找圆心、再定半径画出来的。", "画好了。每一段弧，都是先找圆心，再定半径画出来的。", "ok");
          if (!reported) { reported = true; emitAns("design:done", true); }
          return;
        }
        var cur = steps[st.i], lead = "第 " + (st.i + 1) + " 步（共 " + steps.length + " 步）：";
        out(rd, lead + cur.t, cur.t);
        bNext.disabled = !!cur.cands;
        if (cur.cands) cur.cands.forEach(function (c, j) {
          var g = el("g", {}, gCand);
          el("circle", { cx: c[0][0], cy: c[0][1], r: 15, style: "fill:var(--hl);fill-opacity:.35;stroke:var(--hl);stroke-width:2.5" }, g);
          el("circle", { cx: c[0][0], cy: c[0][1], r: 4, style: "fill:var(--fg)" }, g);
          tap(g, "候选圆心：" + c[1], function () { pick(j); });
        });
      }
      function pick(j) {
        if (st.busy) return;
        var cur = steps[st.i];
        if (j === cur.ans) { clear(gCand); draw(cur); log("center", { ok: true }); return; }
        var a = cur.arcs[0], c = cur.cands[j][0];
        clear(gNow);
        el("path", { d: arcD(c[0], c[1], a.r, a.a0, a.a1), style: "fill:none;stroke:var(--no);stroke-width:3;stroke-dasharray:7 5" }, gNow);
        out(rd, "以「" + cur.cands[j][1] + "」为圆心画，红虚线和图案对不上。看看这段弧的两头：它的圆心到两头要一样远。再点一个试试。", "以这一点为圆心画，弧对不上。弧的圆心，到弧的两头要一样远。再试一个。", "no");
        log("center", { ok: false });
        emitAns("center:" + cur.cands[j][1], false);
        firstTry = false;
      }
      function next() { if (st.busy || st.i >= steps.length) return; draw(steps[st.i]); }
      function draw(sp) {
        st.busy = true; bNext.disabled = true;
        var leg = el("path", { style: "fill:none;stroke:var(--muted);stroke-width:5;stroke-linecap:round;opacity:.8" }, gTool), pth = el("path", { style: "fill:none;stroke:var(--fg);stroke-width:3" }, gNow);
        var arcs = sp.arcs || [], n = Math.max(1, arcs.length);
        if (sp.fill || sp.line) leg.style.display = "none";
        if (sp.line) pth.setAttribute("style", "stroke:var(--muted);stroke-width:2.5;stroke-dasharray:7 5");
        anim(sp.fill ? 600 : 1400 * Math.min(n, 2), function (k) {
          if (sp.line) { var a0 = sp.line[0], a1 = sp.line[1]; pth.setAttribute("d", "M" + a0[0] + " " + a0[1] + " L" + (a0[0] + (a1[0] - a0[0]) * k).toFixed(1) + " " + a1[1]); return; }
          if (sp.fill) { gF.style.opacity = k; return; }
          var f = k * n, idx = Math.min(n - 1, Math.floor(f)), part = f - idx, d = "";
          for (var i = 0; i < idx; i++) d += fmtArc(arcs[i], 1) + " ";
          var a = arcs[idx]; d += fmtArc(a, idx === n - 1 && k === 1 ? 1 : part);
          pth.setAttribute("d", d);
          var ang = rad(a.a0 + (a.a1 - a.a0) * (k === 1 ? 1 : part)), px = a.c[0] + a.r * Math.cos(ang), py = a.c[1] + a.r * Math.sin(ang);
          leg.setAttribute("d", "M" + a.c[0] + " " + a.c[1] + " L" + px.toFixed(1) + " " + py.toFixed(1));
        }, function () {
          st.i++; gF.style.opacity = 1; redraw();
          if (sp.cands) out(rd, "对，圆心在这里，半径 " + fmt(sp.arcs[0].r / U, 1) + " cm。" + (st.i < steps.length ? "下一步：" + steps[st.i].t : ""), "对，圆心在这里。", "ok");
          log("step", { i: st.i });
        });
        if (sp.fill) { sp.fill.forEach(function (f) { el("path", { d: f.d, style: "fill:" + f.c + ";fill-opacity:.55;stroke:none" }, gF); }); gF.style.opacity = 0; }
      }
      hint.textContent = "画弧前，在图上黄色的圈里点出它的圆心（也可以用 Tab 选中后按回车）。";
      redraw();
    }
  }

  function reg() { window.PeiyuManip.register("circle", circleKit); }
  if (window.PeiyuManip) reg(); else document.addEventListener("DOMContentLoaded", reg);
})();
