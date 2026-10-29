/* 培玉 · 高中数学 — 易错红线微实验（wiki.html 第 4 个标签页 + 卡片库内嵌）
   三种模板，一个通用 SVG 渲染器：
   - slider ：参数越过边界，结论失效（拖一个滑块）
   - toggle ：同一解析式 / 同一公式，不同条件（点几个状态按钮）
   - routes ：几条路线，一条是错的（点路线看哪条与目标重合）
   每个实验先出一道单选「预测」，答了才解锁开关；预测结果写 peiyu.hs.log（{kind:"lab", sec, id, card, choice, correct}）。
   实验定义在下面 LABS 里：id 与卡片 id 相同，wiki.js 里对应卡片有 lab 字段；卡片库里带 lab 的卡
   链接行多一个「🧪 拨一下反例开关」按钮，原地展开同一个实验。
   场景用数学坐标描述：view = {x:[x0,x1], y:[y0,y1], xt, yt, noY}，scene(v) 返回图元数组：
     {t:"curve", f, from, to, color, dash, w, label:{x, text}} / {t:"pt", x, y, color, r, hollow, label, dx, dy}
     {t:"hline"|"vline", y|x, color, dash, label} / {t:"region", x0, x1, color} / {t:"seg", x1,y1,x2,y2, color, w, dash}
     {t:"text", x, y, text, color, size, anchor, bold}
   颜色只用 site.css 变量名：a（松绿，正确 / 目标）、no（赤红，错误）、b（赤金，高亮）、c（黛蓝，参考）、muted。
   图中文字至少19 SVG单位；Wiki用独立可滚动图框保证CSS实际字号≥12px。 */
(function () {
  "use strict";

  var CARDS = window.PEIYU_WIKI_CARDS || [];
  var BY_ID = {};
  CARDS.forEach(function (c) { BY_ID[c.id] = c; });
  var CH_NAMES = window.PEIYU_CUE_CHAPTERS || {};
  var LOG_KEY = "peiyu.hs.log", NAME_KEY = "peiyu.hs.name";

  /* ---------- 存储（与 lesson.js 同格式） ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function log(sec, kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = [];
    try { all = JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { all = []; }
    all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- KaTeX ---------- */
  var MACROS = {
    "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}", "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}",
    "\\Z": "\\mathbf{Z}", "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}"
  };
  function math(el) {
    var tries = 0;
    (function run() {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
          ],
          macros: MACROS, throwOnError: false, strict: "ignore"
        });
      } else if (tries++ < 30) setTimeout(run, 100);
    })();
  }

  /* ---------- 样式 ---------- */
  (function injectStyle() {
    if (document.getElementById("peiyu-labs-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-labs-css";
    st.textContent = [
      ".lab{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:16px 18px;margin:14px 0}",
      ".lab-inline{margin:12px 0 2px}",
      ".lab-inline .lab{margin:0;background:var(--bg)}",
      ".lab-hd{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;margin-bottom:6px}",
      ".lab-hd h3{margin:0;font-size:17px;flex:1 1 auto}",
      ".lab-tpl{display:inline-block;font-size:14px;font-weight:600;border-radius:6px;padding:2px 8px;background:var(--no-soft);color:var(--no)}",
      ".lab-intro{font-size:14.5px;color:var(--muted);margin:4px 0 10px;line-height:1.7}",
      ".lab-ask{border:1.5px dashed var(--b);border-radius:10px;padding:12px 14px;margin:8px 0;background:var(--hl-soft)}",
      ".lab-ask-q{font-size:15.5px;font-weight:600;margin:0 0 8px;line-height:1.7}",
      ".lab-opts{display:flex;flex-wrap:wrap;gap:8px}",
      ".lab-opts button{font:inherit;font-size:14.5px;min-height:38px;padding:6px 14px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;text-align:left}",
      ".lab-opts button:hover{border-color:var(--a)}",
      ".lab-opts button.right{border-color:var(--a);background:var(--ok-soft);color:var(--a);font-weight:600}",
      ".lab-opts button.wrong{border-color:var(--no);background:var(--no-soft);color:var(--no)}",
      ".lab-opts button:disabled{cursor:default;opacity:.85}",
      ".lab-ask-fb{font-size:14.5px;margin:8px 0 0;line-height:1.7}",
      ".lab-ask-fb b{color:var(--fg)}",
      ".lab-skip{background:none;border:0;color:var(--muted);font:inherit;font-size:14px;text-decoration:underline;cursor:pointer;padding:4px 0;margin-top:4px}",
      ".lab-body{position:relative;margin-top:10px}",
      ".lab-body.locked>*{opacity:.35;pointer-events:none;user-select:none}",
      ".lab-body.locked::after{content:'先在上面选一个预测，再来拨开关';position:absolute;left:0;right:0;top:46%;text-align:center;font-size:15px;font-weight:600;color:var(--fg);opacity:1}",
      ".lab .ctrl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0 8px}",
      ".lab .ctrl label{font-size:15px;display:flex;flex:1 1 100%;align-items:center;gap:8px;min-height:36px}",
      ".lab .ctrl .lab-lbl{white-space:nowrap}",
      ".lab .ctrl input[type=range]{flex:1 1 160px;min-width:140px;accent-color:var(--a)}",
      ".lab .ctrl output{font-weight:700;min-width:2.6em}",
      ".lab .ctrl .btn{min-height:36px;font-size:14px;padding:6px 12px}",
      ".lab .ctrl .btn.on{background:var(--a);border-color:var(--a);color:#fff}",
      ".lab svg.lab-fig{display:block;width:100%;height:auto;background:var(--bg);border:1px solid var(--line);border-radius:10px}",
      ".lab-out{font-size:15px;margin:8px 0 0;line-height:1.75;min-height:2.6em}",
      ".lab-out .ok{color:var(--a);font-weight:600}",
      ".lab-out .bad{color:var(--no);font-weight:600}",
      ".lab-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px dashed var(--line);margin-top:10px;padding-top:8px;font-size:14px;color:var(--muted)}",
      ".lab-group{margin:18px 0 6px}",
      ".lab-group h3{margin:0 0 4px;font-size:16px;color:var(--muted)}"
    ].join("\n");
    document.head.appendChild(st);
  })();

  /* ---------- SVG 渲染器 ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var W = 560, H = 250, PL = 44, PR = 14, PT = 16, PB = 34;
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function color(k) {
    var map = { a: "--a", b: "--b", c: "--c", no: "--no", muted: "--muted", fg: "--fg", hl: "--hl", line: "--line" };
    return css(map[k] || "--fg") || "#333";
  }
  function f2(x) { return (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, ""); }
  var uid = 0;

  function draw(svg, view, prims) {
    var height = view.height || H;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + W + " " + height);
    var x0 = view.x[0], x1 = view.x[1], y0 = view.y[0], y1 = view.y[1];
    var left = view.noY ? 14 : PL;
    var cx = function (x) { return left + (x - x0) / (x1 - x0) * (W - left - PR); };
    var cy = function (y) { return PT + (y1 - y) / (y1 - y0) * (height - PT - PB); };
    var id = "labclip" + (++uid);
    var defs = el("defs", {}, svg);
    var cp = el("clipPath", { id: id }, defs);
    el("rect", { x: left, y: PT, width: W - left - PR, height: height - PT - PB }, cp);
    var FS = 20;
    var muted = color("muted"), lineC = color("line");

    // 坐标轴
    var axY = (y0 <= 0 && y1 >= 0) ? cy(0) : cy(y0);
    el("line", { x1: left, y1: axY, x2: W - PR, y2: axY, stroke: muted, "stroke-width": 1.5 }, svg);
    el("polygon", { points: (W - PR) + "," + axY + " " + (W - PR - 9) + "," + (axY - 4) + " " + (W - PR - 9) + "," + (axY + 4), fill: muted }, svg);
    (view.xt || []).forEach(function (t) {
      var X = cx(t);
      el("line", { x1: X, y1: axY - 4, x2: X, y2: axY + 4, stroke: muted, "stroke-width": 1.5 }, svg);
      el("text", { x: X, y: axY + 22, "text-anchor": "middle", "font-size": FS, fill: muted }, svg).textContent = String(t);
    });
    if (!view.noY) {
      var axX = (x0 <= 0 && x1 >= 0) ? cx(0) : cx(x0);
      el("line", { x1: axX, y1: height - PB, x2: axX, y2: PT, stroke: muted, "stroke-width": 1.5 }, svg);
      el("polygon", { points: axX + "," + PT + " " + (axX - 4) + "," + (PT + 9) + " " + (axX + 4) + "," + (PT + 9), fill: muted }, svg);
      (view.yt || []).forEach(function (t) {
        var Y = cy(t);
        el("line", { x1: axX - 4, y1: Y, x2: axX + 4, y2: Y, stroke: muted, "stroke-width": 1.5 }, svg);
        el("text", { x: axX - 8, y: Y + 7, "text-anchor": "end", "font-size": FS, fill: muted }, svg).textContent = String(t);
      });
    }
    var g = el("g", { "clip-path": "url(#" + id + ")" }, svg);
    var labels = el("g", {}, svg);

    function text(x, y, s, opt) {
      opt = opt || {};
      var tn = el("text", {
        x: x, y: y, "font-size": opt.size || FS, fill: color(opt.color || "fg"),
        "text-anchor": opt.anchor || "start", "font-weight": opt.bold ? 700 : 500,
        "paint-order": "stroke", stroke: css("--bg") || "#fff", "stroke-width": 4, "stroke-linejoin": "round"
      }, labels);
      tn.textContent = s;
      tn._labLabel = { x:x, y:y, text:s };
      if (opt.point) { tn.setAttribute("data-point-x", opt.point[0]); tn.setAttribute("data-point-y", opt.point[1]); }
      return tn;
    }

    prims.forEach(function (p) {
      if (!p) return;
      var col = color(p.color || "a");
      if (p.t === "region") {
        el("rect", { x: cx(p.x0), y: PT, width: Math.max(0, cx(p.x1) - cx(p.x0)), height: height - PT - PB, fill: col, opacity: p.opacity || 0.12 }, g);
        if (p.label) text((cx(p.x0) + cx(p.x1)) / 2, PT + 22, p.label, { anchor: "middle", color: p.color || "a", size: 19 });
      } else if (p.t === "curve") {
        var n = 240, d = "", on = false, span = (y1 - y0);
        for (var i = 0; i <= n; i++) {
          var x = p.from + (p.to - p.from) * i / n, y = p.f(x);
          if (!isFinite(y) || y > y1 + span || y < y0 - span) { on = false; continue; }
          d += (on ? " L" : " M") + f2(cx(x)) + " " + f2(cy(y));
          on = true;
        }
        el("path", { d: d, fill: "none", stroke: col, "stroke-width": p.w || 3, "stroke-dasharray": p.dash ? "6 5" : "none", "stroke-linecap": "round" }, g);
        if (p.label) text(cx(p.label.x) + (p.label.dx || 6), cy(p.f(p.label.x)) + (p.label.dy || -8), p.label.text, { color: p.color || "a", bold: true, point: [cx(p.label.x), cy(p.f(p.label.x))] });
      } else if (p.t === "pt") {
        el("circle", { cx: cx(p.x), cy: cy(p.y), r: p.r || 6, fill: p.hollow ? (css("--bg") || "#fff") : col, stroke: col, "stroke-width": 3 }, labels);
        if (p.label) text(cx(p.x) + (p.dx === undefined ? 10 : p.dx), cy(p.y) + (p.dy === undefined ? -10 : p.dy), p.label, { color: p.color || "a", bold: true, anchor: p.anchor, point: [cx(p.x), cy(p.y)] });
      } else if (p.t === "hline") {
        el("line", { x1: left, y1: cy(p.y), x2: W - PR, y2: cy(p.y), stroke: col, "stroke-width": p.w || 2, "stroke-dasharray": p.dash === false ? "none" : "6 5" }, g);
        if (p.label) text(W - PR - 6, cy(p.y) + (p.dy || -8), p.label, { anchor: "end", color: p.color || "a" });
      } else if (p.t === "vline") {
        el("line", { x1: cx(p.x), y1: PT, x2: cx(p.x), y2: height - PB, stroke: col, "stroke-width": p.w || 2, "stroke-dasharray": p.dash === false ? "none" : "6 5" }, g);
        if (p.label) text(cx(p.x) + 6, PT + 22, p.label, { color: p.color || "a" });
      } else if (p.t === "seg") {
        el("line", { x1: cx(p.x1), y1: cy(p.y1), x2: cx(p.x2), y2: cy(p.y2), stroke: col, "stroke-width": p.w || 3, "stroke-dasharray": p.dash ? "6 5" : "none", "stroke-linecap": "round" }, g);
        if (p.label) text((cx(p.x1) + cx(p.x2)) / 2 + (p.dx || 0), (cy(p.y1) + cy(p.y2)) / 2 + (p.dy || -10), p.label, { anchor: "middle", color: p.color || "a", bold: true, point: [(cx(p.x1) + cx(p.x2)) / 2, (cy(p.y1) + cy(p.y2)) / 2] });
      } else if (p.t === "text") {
        text(cx(p.x) + (p.dx || 0), cy(p.y) + (p.dy || 0), p.text, { color: p.color, size: p.size, anchor: p.anchor, bold: p.bold });
      }
    });
    // Hidden tabs have zero text boxes: wait for a real layout before fitting.
    function fitVisibleLabels() {
      if (!labels.isConnected || !svg.getClientRects().length) return;
      Array.prototype.forEach.call(svg.querySelectorAll('[data-label-leader]'), function (n) { n.remove(); });
      var occupied = [], axisTexts = [];
      Array.prototype.forEach.call(svg.children, function (n) {
        if (n.tagName !== 'text') return;
        if (!n._labLabel) {
          var tx = Number(n.getAttribute('x')), ty = Number(n.getAttribute('y')), isX = n.getAttribute('text-anchor') === 'middle';
          n._labLabel = { x:tx, y:ty, text:n.textContent };
          n.setAttribute('data-point-x', isX ? tx : axX); n.setAttribute('data-point-y', isX ? axY : ty - 7);
        }
        axisTexts.push(n);
      });
      Array.prototype.forEach.call(labels.querySelectorAll('circle'), function (n) { occupied.push(n.getBBox()); });
      var offsets = [];
      for (var ox = -Math.ceil(W / 24); ox <= Math.ceil(W / 24); ox++) for (var oy = -Math.ceil(height / 24); oy <= Math.ceil(height / 24); oy++) offsets.push([ox * 24, oy * 24]);
      offsets.sort(function (a, b) { return Math.abs(a[0]) + Math.abs(a[1]) - Math.abs(b[0]) - Math.abs(b[1]) || Math.abs(a[0]) - Math.abs(b[0]) || a[1] - b[1] || a[0] - b[0]; });
      function overlap(box) {
        return occupied.reduce(function (area, other) { return area + Math.max(0, Math.min(box.x + box.width + 1, other.x + other.width + 1) - Math.max(box.x - 1, other.x - 1)) * Math.max(0, Math.min(box.y + box.height + 1, other.y + other.height + 1) - Math.max(box.y - 1, other.y - 1)); }, 0);
      }
      Array.prototype.forEach.call(axisTexts.concat(Array.prototype.slice.call(labels.querySelectorAll("text"))), function (tn) {
      var base = tn._labLabel, x = base.x, y = base.y, pad = 6;
      tn.textContent = base.text; tn.setAttribute("x", x); tn.setAttribute("y", y);
      if (tn.getBBox().width > W - 2 * pad) {
        var content = tn.textContent, line = "", rows = [], measure = el("tspan", { x: x }, tn);
        tn.firstChild.remove();
        Array.from(content).forEach(function (ch) {
          measure.textContent = line + ch;
          if (line && measure.getComputedTextLength() > W - 2 * pad) { rows.push(line); line = ch; } else line += ch;
        });
        rows.push(line); tn.textContent = "";
        rows.forEach(function (row, i) { el("tspan", { x: x, dy: i ? 24 : 0 }, tn).textContent = row; });
      }
      var b = tn.getBBox(), best = null;
      offsets.some(function (o) {
        var left = Math.max(pad, Math.min(W - pad - b.width, b.x + o[0])), top = Math.max(pad, Math.min(height - pad - b.height, b.y + o[1]));
        var box = { x:left, y:top, width:b.width, height:b.height }, area = overlap(box);
        if (!best || area < best.area) best = { dx:left - b.x, dy:top - b.y, area:area, box:box };
        return area === 0;
      });
      var dx = best.dx, dy = best.dy;
      tn.setAttribute("x", x + dx); tn.setAttribute("y", y + dy);
      tn.setAttribute("data-layout-overlap", best.area.toFixed(3));
      Array.prototype.forEach.call(tn.querySelectorAll("tspan"), function (t) { t.setAttribute("x", x + dx); });
      occupied.push(tn.getBBox());
      if ((dx || dy) && tn.hasAttribute("data-point-x")) {
        var px = Number(tn.getAttribute("data-point-x")), py = Number(tn.getAttribute("data-point-y")), moved = tn.getBBox();
        var lead = el("line", { x1: px, y1: py, x2: Math.max(moved.x, Math.min(px, moved.x + moved.width)), y2: Math.max(moved.y, Math.min(py, moved.y + moved.height)), stroke: tn.getAttribute("fill"), "stroke-width": 1, "stroke-dasharray": "3 3", "data-label-leader": "true" }, tn.parentNode);
        tn.parentNode.insertBefore(lead, tn);
      }
      });
    }
    svg._labRelayout = fitVisibleLabels;
    if (!svg._labSizeObserver) {
      svg._labSizeObserver = new ResizeObserver(function () { if (svg._labRelayout) svg._labRelayout(); });
      svg._labSizeObserver.observe(svg);
    }
    fitVisibleLabels();
    requestAnimationFrame(fitVisibleLabels);
  }

  /* ---------- 实验外壳 ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function tplName(t) { return { slider: "滑块实验 · 参数越界", toggle: "切换实验 · 条件一变", routes: "路线对比 · 哪条错了" }[t] || "实验"; }

  function renderLab(def, mountEl) {
    var card = BY_ID[def.card] || {};
    var sec = card.sec || "";
    var wrap = document.createElement("div");
    wrap.className = "lab";
    wrap.id = "lab-" + def.id + "-" + (++uid);
    var ctrlHtml = "";
    if (def.tpl === "slider") {
      var c = def.ctrl;
      ctrlHtml =
        '<label><span class="lab-lbl">' + c.label + '</span> <input type="range" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.init + '" data-lab-range><output>' + (c.fmt ? c.fmt(c.init) : c.init) + "</output></label>" +
        (c.quick || []).map(function (q) { return '<button type="button" class="btn ghost" data-lab-quick="' + q.v + '">' + q.label + "</button>"; }).join("");
    } else {
      var states = def.ctrl.states;
      ctrlHtml = states.map(function (s) {
        return '<button type="button" class="btn ghost' + (s.key === def.ctrl.init ? " on" : "") + '" data-lab-state="' + s.key + '">' + s.label + "</button>";
      }).join("");
    }
    wrap.innerHTML =
      '<div class="lab-hd"><span class="lab-tpl">' + tplName(def.tpl) + "</span><h3>" + def.title + "</h3></div>" +
      '<p class="lab-intro">' + def.intro + "</p>" +
      '<div class="lab-ask"><p class="lab-ask-q">🔮 先预测：' + def.ask.q + "</p>" +
        '<div class="lab-opts">' + def.ask.opts.map(function (o, i) { return '<button type="button" data-lab-opt="' + i + '">' + "ABC".charAt(i) + ". " + o + "</button>"; }).join("") + "</div>" +
        '<p class="lab-ask-fb" hidden></p>' +
        '<button type="button" class="lab-skip" data-lab-skip>不猜了，直接拨</button>' +
      "</div>" +
      '<div class="lab-body locked">' +
        '<div class="ctrl">' + ctrlHtml + "</div>" +
        '<svg class="lab-fig" viewBox="0 0 560 250" role="img" aria-label="' + esc(def.title.replace(/<[^>]+>/g, "")) + '"></svg>' +
        '<div class="lab-out" aria-live="polite"></div>' +
      "</div>" +
      '<div class="lab-foot"><span>对应卡片：</span>' +
        (card.id ? '<button type="button" class="w-rel" data-goto="' + card.id + '">🔗 ' + esc(card.title) + "</button>" : "") +
        (sec ? '<a href="lessons/' + sec + '.html#step3" style="color:var(--c);font-weight:600;text-decoration:none">👉 去本节动手拖图</a>' : "") +
      "</div>";
    mountEl.appendChild(wrap);

    var svg = wrap.querySelector("svg.lab-fig"), out = wrap.querySelector(".lab-out"), body = wrap.querySelector(".lab-body");
    var state = def.tpl === "slider" ? Number(def.ctrl.init) : def.ctrl.init;
    body.inert = true;
    function paint() {
      draw(svg, def.view, def.scene(state));
      out.innerHTML = def.info(state);
      math(out);
    }
    wrap.addEventListener("input", function (ev) {
      var r = ev.target.closest("[data-lab-range]");
      if (!r) return;
      state = Number(r.value);
      var o = r.parentNode.querySelector("output");
      if (o) o.textContent = def.ctrl.fmt ? def.ctrl.fmt(state) : f2(state);
      paint();
    });
    wrap.addEventListener("click", function (ev) {
      var t = ev.target;
      var q = t.closest("[data-lab-quick]");
      if (q) {
        state = Number(q.getAttribute("data-lab-quick"));
        var r = wrap.querySelector("[data-lab-range]");
        if (r) { r.value = state; var o = r.parentNode.querySelector("output"); if (o) o.textContent = def.ctrl.fmt ? def.ctrl.fmt(state) : f2(state); }
        paint(); return;
      }
      var s = t.closest("[data-lab-state]");
      if (s) {
        state = s.getAttribute("data-lab-state");
        [].forEach.call(wrap.querySelectorAll("[data-lab-state]"), function (b) { b.classList.toggle("on", b === s); });
        paint(); return;
      }
      var opt = t.closest("[data-lab-opt]");
      if (opt) {
        var i = Number(opt.getAttribute("data-lab-opt")), ok = i === def.ask.ans;
        [].forEach.call(wrap.querySelectorAll("[data-lab-opt]"), function (b, j) {
          b.disabled = true;
          if (j === def.ask.ans) b.classList.add("right");
          else if (j === i) b.classList.add("wrong");
        });
        var fb = wrap.querySelector(".lab-ask-fb");
        fb.hidden = false;
        fb.innerHTML = (ok ? "<b>✓ 预测对了。</b>" : "<b>✗ 预测错了，正是这条红线。</b>") + def.ask.why + " 现在拨开关亲眼看一遍。";
        math(fb);
        var sk = wrap.querySelector("[data-lab-skip]"); if (sk) sk.remove();
        body.classList.remove("locked"); body.inert = false;
        log(sec, "lab", { id: def.id, card: def.card, choice: "ABC".charAt(i), correct: ok });
        return;
      }
      if (t.closest("[data-lab-skip]")) {
        body.classList.remove("locked"); body.inert = false;
        t.closest("[data-lab-skip]").remove();
      }
    });
    paint();
    math(wrap.querySelector(".lab-hd"));
    math(wrap.querySelector(".lab-intro"));
    math(wrap.querySelector(".lab-ask"));
    math(wrap.querySelector(".ctrl"));
    return wrap;
  }

  /* ==================== 实验定义 ==================== */
  var PI = Math.PI;
  var LABS = [
    /* ---- 第 1 章 ---- */
    {
      id: "set-empty-trap", card: "set-empty-trap", tpl: "slider",
      title: "含参子集 \\(A\\subseteq B\\)：\\(a\\) 一变小，\\(A\\) 去哪了？",
      intro: "设 \\(A=\\{x\\mid a\\le x\\le 2a-1\\}\\)，\\(B=\\{x\\mid 0\\le x\\le 3\\}\\)，要 \\(A\\subseteq B\\)。拖动 \\(a\\)，看数轴上的 \\(A\\)。",
      ask: { q: "\\(A\\subseteq B\\) 时，\\(a\\) 的取值范围是？", opts: ["\\(1\\le a\\le 2\\)", "\\(a\\le 2\\)（含 \\(a\\lt 1\\) 时 \\(A=\\varnothing\\)）", "\\(0\\le a\\le 2\\)"], ans: 1,
        why: "\\(a\\lt 1\\) 时右端点 \\(2a-1\\) 跑到左端点 \\(a\\) 左边，\\(A\\) 是空集；空集是任何集合的子集，这一段不能丢。\\(a\\ge 1\\) 时再列端点不等式得 \\(1\\le a\\le 2\\)，合起来 \\(a\\le 2\\)。" },
      ctrl: { label: "\\(a=\\)", min: -1, max: 3, step: 0.25, init: 1.5, quick: [{ label: "a=0.5（空集区）", v: 0.5 }, { label: "a=1.5", v: 1.5 }, { label: "a=2.5（越界）", v: 2.5 }] },
      view: { x: [-3.8, 5.8], y: [-1, 1], noY: true, xt: [-3, -2, -1, 0, 1, 2, 3, 4, 5] },
      scene: function (a) {
        var r = 2 * a - 1, P = [];
        P.push({ t: "seg", x1: 0, y1: 0.45, x2: 3, y2: 0.45, color: "b", w: 8, label: "B = [0, 3]", dy: -14 });
        P.push({ t: "pt", x: 0, y: 0.45, color: "b", r: 5 }, { t: "pt", x: 3, y: 0.45, color: "b", r: 5 });
        if (r < a) {
          P.push({ t: "text", x: 1, y: -0.96, text: "A = ∅（右端点 2a−1 在左端点 a 左边）", color: "a", anchor: "middle", bold: true });
          P.push({ t: "pt", x: a, y: -0.35, color: "muted", r: 4, hollow: true, label: "a", dy: 28, dx: 10 });
          P.push({ t: "pt", x: r, y: -0.35, color: "muted", r: 4, hollow: true, label: "2a−1", dy: 28, dx: -10, anchor: "end" });
        } else {
          var ok = a >= 0 && r <= 3;
          P.push({ t: "seg", x1: a, y1: -0.35, x2: r, y2: -0.35, color: ok ? "a" : "no", w: 8, label: "A = [a, 2a−1]", dy: 30 });
          P.push({ t: "pt", x: a, y: -0.35, color: ok ? "a" : "no", r: 5 }, { t: "pt", x: r, y: -0.35, color: ok ? "a" : "no", r: 5 });
        }
        return P;
      },
      info: function (a) {
        var r = 2 * a - 1;
        if (r < a) return '<span class="ok">✓ a = ' + f2(a) + '：2a−1 = ' + f2(r) + ' \\(\\lt\\) a，\\(A=\\varnothing\\subseteq B\\) 成立。</span> 这就是「先查空集」要补回来的那一段：答案里 \\(a\\lt 1\\) 全部合法。';
        if (a >= 0 && r <= 3) return '<span class="ok">✓ a = ' + f2(a) + '：\\(A=[' + f2(a) + ',' + f2(r) + ']\\) 整段落在 \\(B\\) 内。</span> 端点不等式 \\(a\\ge 0\\) 且 \\(2a-1\\le 3\\) 都满足。';
        return '<span class="bad">✗ a = ' + f2(a) + '：2a−1 = ' + f2(r) + ' \\(\\gt\\) 3，\\(A\\) 伸出 \\(B\\) 外。</span> \\(a\\ge 1\\) 这一支的上界就是 \\(2a-1\\le 3\\Rightarrow a\\le 2\\)。';
      }
    },
    /* ---- 第 2 章 ---- */
    {
      id: "amgm-hook", card: "amgm-hook", tpl: "slider",
      title: "基本不等式「等号取不到」时，最小值跑去了端点",
      intro: "\\(f(x)=x+\\dfrac4x\\)，基本不等式给的下界是 \\(4\\)，等号在 \\(x=2\\)。拖动题目允许的定义域左端点 \\(x\\ge m\\)。",
      ask: { q: "若定义域是 \\(x\\ge 3\\)，\\(f(x)=x+\\dfrac4x\\) 的最小值是？", opts: ["仍是 \\(4\\)（基本不等式的下界）", "\\(f(3)=\\dfrac{13}{3}\\)（在端点取到）", "没有最小值"], ans: 1,
        why: "等号点 \\(x=2\\) 不在 \\([3,+\\infty)\\) 内，下界 \\(4\\) 取不到；对勾函数在 \\((2,+\\infty)\\) 上递增，最小值在左端点 \\(x=3\\)。" },
      ctrl: { label: "定义域左端点 \\(m=\\)", min: 0.5, max: 4.5, step: 0.5, init: 1, quick: [{ label: "反例 m=3", v: 3 }, { label: "正例 m=1", v: 1 }] },
      view: { x: [0, 5.6], y: [0, 9.5], xt: [1, 2, 3, 4, 5], yt: [4, 8] },
      scene: function (m) {
        var f = function (x) { return x + 4 / x; }, P = [];
        P.push({ t: "region", x0: 0, x1: m, color: "muted", opacity: 0.18, label: "x < m 禁区" });
        P.push({ t: "curve", f: f, from: 0.42, to: m, color: "muted", dash: true, w: 2 });
        P.push({ t: "curve", f: f, from: m, to: 5.6, color: "a", w: 3.5 });
        P.push({ t: "hline", y: 4, color: "muted", label: "均值下界 4", dy: 24 });
        P.push({ t: "vline", x: m, color: "no", label: "x = " + f2(m) });
        if (m <= 2) P.push({ t: "pt", x: 2, y: 4, color: "a", label: "等号点 (2, 4) 取得到", dy: -12 });
        else {
          P.push({ t: "pt", x: 2, y: 4, color: "no", hollow: true, label: "(2, 4) 被挡在禁区外", anchor: "end", dx: -12, dy: 30 });
          P.push({ t: "pt", x: m, y: f(m), color: "b", label: "真正最小值 ≈ " + f2(f(m)) + "（x=" + f2(m) + "）", dy: -12 });
        }
        return P;
      },
      info: function (m) {
        if (m <= 2) return '<span class="ok">✓ 等号成立：</span>\\(x=2\\) 在 \\([' + f2(m) + ',+\\infty)\\) 内，最小值就是基本不等式给的 \\(4\\)。';
        return '<span class="bad">✗ 等号失效：</span>\\(x=2\\) 不在 \\([' + f2(m) + ',+\\infty)\\) 内，\\(4\\) 只是取不到的下界。对勾函数在 \\((2,+\\infty)\\) 递增，最小值在左端点：\\(f(' + f2(m) + ')=' + f2(m) + '+\\dfrac4{' + f2(m) + '}\\approx ' + f2(m + 4 / m) + '\\)。';
      }
    },
    {
      id: "quad-always-true", card: "quad-always-true", tpl: "slider",
      title: "区间上恒成立：直接套 \\(\\Delta\\lt 0\\) 为什么会把答案算窄？",
      intro: "\\(x^2-ax+2\\gt 0\\) 对 \\(x\\in[3,5]\\) 恒成立。拖动 \\(a\\)，比较「\\(\\Delta\\lt 0\\) 法」的判断和区间上的真相。",
      ask: { q: "这题能直接令 \\(\\Delta\\lt 0\\) 求 \\(a\\) 吗？", opts: ["能，\\(\\Delta\\lt 0\\) 得 \\(a\\lt 2\\sqrt2\\)", "不能，区间上要看最小值，答案比 \\(a\\lt 2\\sqrt2\\) 宽", "不能，答案比 \\(a\\lt 2\\sqrt2\\) 窄"], ans: 1,
        why: "\\(\\Delta\\lt 0\\) 保证的是在整个 \\(\\mathbf R\\) 上为正，题目只要求 \\([3,5]\\) 上为正：抛物线可以有根，只要根落在区间外。正确做法是分离参数 \\(a\\lt x+\\dfrac2x\\) 在 \\([3,5]\\) 上的最小值 \\(\\dfrac{11}{3}\\)。" },
      ctrl: { label: "\\(a=\\)", min: 2, max: 5, step: 0.25, init: 3, quick: [{ label: "a=3（Δ>0 却成立）", v: 3 }, { label: "a=4（真失败）", v: 4 }] },
      view: { x: [0, 6.2], y: [-5.5, 18.5], xt: [1, 2, 3, 4, 5, 6], yt: [4, 8] },
      scene: function (a) {
        var f = function (x) { return x * x - a * x + 2; }, P = [];
        P.push({ t: "region", x0: 3, x1: 5, color: "b", opacity: 0.16, label: "题目只看 [3, 5]" });
        P.push({ t: "curve", f: f, from: 0, to: 6.2, color: "a", w: 3.5 });
        var D = a * a - 8;
        if (D >= 0) {
          var r1 = (a - Math.sqrt(D)) / 2, r2 = (a + Math.sqrt(D)) / 2;
          P.push({ t: "pt", x: r1, y: 0, color: "no", label: "根≈" + f2(r1), dy: 28, dx: -16 });
          P.push({ t: "pt", x: r2, y: 0, color: "no", label: "根≈" + f2(r2), dy: 28, dx: -16 });
        }
        var mn = (a / 2 >= 3 && a / 2 <= 5) ? f(a / 2) : Math.min(f(3), f(5));
        var mx = (a / 2 >= 3 && a / 2 <= 5) ? a / 2 : (f(3) <= f(5) ? 3 : 5);
        P.push({ t: "pt", x: mx, y: mn, color: mn > 0 ? "b" : "no", label: "区间最小值 " + f2(mn), dy: mn > 0 ? -12 : 28 });
        return P;
      },
      info: function (a) {
        var D = a * a - 8, f = function (x) { return x * x - a * x + 2; };
        var mn = (a / 2 >= 3 && a / 2 <= 5) ? f(a / 2) : Math.min(f(3), f(5));
        var dOK = D < 0, real = mn > 0;
        return "「套 \\(\\Delta\\lt 0\\)」说：" + (dOK ? '<span class="ok">成立</span>' : '<span class="bad">不成立</span>') + "（\\(\\Delta=" + String(D) + "\\)）；区间上的真相：最小值 \\(" + f2(mn) + "\\)，" +
          (real ? '<span class="ok">恒成立 ✓</span>' : '<span class="bad">有 \\(x\\in[3,5]\\) 使 \\(f(x)\\le 0\\) ✗</span>') +
          (dOK !== real ? "。<b>两种判断不一致，这就是被 \\(\\Delta\\) 冤枉掉的一段</b>：正确范围 \\(a\\lt\\dfrac{11}{3}\\approx 3.67\\)。" : "。");
      }
    },
    /* ---- 第 3 章 ---- */
    {
      id: "fn-dom-same", card: "fn-dom-same", tpl: "toggle",
      title: "约分之前先看定义域：\\(\\dfrac{x^2-1}{x-1}\\) 和 \\(x+1\\) 差在哪一个点？",
      intro: "解析式化简前后看似一样，图象上却少了一个点。切换看一看。",
      ask: { q: "\\(f(x)=\\dfrac{x^2-1}{x-1}\\) 与 \\(g(x)=x+1\\) 是同一函数吗？", opts: ["是，约分后完全一样", "不是，\\(f\\) 的定义域少了 \\(x=1\\)", "是，去掉一个点不会影响是否为同一函数"], ans: 1,
        why: "同一函数要定义域相同且对应关系一致。约分前分母不能为 \\(0\\)，\\(f\\) 的定义域是 \\(x\\ne 1\\)；\\(g\\) 在 \\(x=1\\) 有定义。本例 \\(f\\) 的值域还少了 \\(2\\)，而 \\(g\\) 的值域为 \\(\\mathbf R\\)。定义域或对应关系不同，就不是同一函数。" },
      ctrl: { init: "f", states: [{ key: "f", label: "\\(f(x)=\\dfrac{x^2-1}{x-1}\\)" }, { key: "g", label: "\\(g(x)=x+1\\)" }] },
      view: { x: [-2.2, 3.2], y: [-1.5, 4.5], xt: [-2, -1, 1, 2, 3], yt: [1, 2, 3, 4] },
      scene: function (s) {
        var P = [{ t: "curve", f: function (x) { return x + 1; }, from: -2.2, to: 3.2, color: "a", w: 3.5 }];
        if (s === "f") P.push({ t: "pt", x: 1, y: 2, color: "no", hollow: true, label: "x=1 被挖掉：分母为 0", dy: -12 });
        else P.push({ t: "pt", x: 1, y: 2, color: "a", label: "(1, 2) 在图上", dy: -12 });
        return P;
      },
      info: function (s) {
        return s === "f"
          ? '<span class="bad">✗ 图上有个洞：</span>\\(x=1\\) 时分母为 \\(0\\)，\\(f(1)\\) 不存在。定义域 \\(\\{x\\mid x\\ne 1\\}\\)，必须在约分之前写下来。'
          : '<span class="ok">✓ 一条完整直线：</span>\\(g(1)=2\\) 有定义，定义域 \\(\\mathbf R\\)。和左边比，就差这一个点，所以不是同一函数。';
      }
    },
    {
      id: "fn-parity-core", card: "fn-parity-core", tpl: "toggle",
      title: "判断奇偶性，为什么「不先看定义域」一做就错？",
      intro: "解析式都是 \\(f(x)=x^2\\)，满足 \\(f(-x)=f(x)\\)。切换三种定义域，看图象关于 \\(y\\) 轴还对称吗。",
      ask: { q: "\\(f(x)=x^2\\)，\\(x\\in[-1,2.5]\\)，它是偶函数吗？", opts: ["是，解析式满足 \\(f(-x)=f(x)\\)", "不是，定义域不对称，\\(f(-2)\\) 根本没定义", "是偶函数，但只在 \\([-1,1]\\) 上"], ans: 1,
        why: "奇偶性的第一步永远是看定义域是否关于原点对称。\\(x=2\\) 在定义域内而 \\(x=-2\\) 不在，\\(f(-2)=f(2)\\) 无从谈起，直接非奇非偶。" },
      ctrl: { init: "sym", states: [{ key: "sym", label: "正例：\\(x\\in[-2,2]\\)" }, { key: "asym", label: "反例 1：\\(x\\in[-1,2.5]\\)" }, { key: "hole", label: "反例 2：\\(x\\in[-2,2]\\) 且 \\(x\\ne 1\\)" }] },
      view: { x: [-3, 3], y: [0, 7], xt: [-2, -1, 1, 2], yt: [1, 4] },
      scene: function (s) {
        var f = function (x) { return x * x; }, P = [];
        var lo = s === "asym" ? -1 : -2, hi = s === "asym" ? 2.5 : 2;
        P.push({ t: "curve", f: f, from: lo, to: hi, color: s === "sym" ? "a" : "no", w: 3.5 });
        P.push({ t: "pt", x: lo, y: f(lo), color: s === "sym" ? "a" : "no", r: 5 }, { t: "pt", x: hi, y: f(hi), color: s === "sym" ? "a" : "no", r: 5 });
        if (s === "asym") {
          P.push({ t: "curve", f: f, from: -2.5, to: -1, color: "muted", dash: true, w: 2 });
          P.push({ t: "pt", x: -2.5, y: 6.25, color: "no", hollow: true, label: "x=−2.5 没定义", dx: 10, dy: 6 });
        }
        if (s === "hole") {
          P.push({ t: "pt", x: 1, y: 1, color: "no", hollow: true, label: "(1,1) 挖掉了", dy: -12 });
          P.push({ t: "pt", x: -1, y: 1, color: "a", label: "(−1,1) 还在", dx: -120, dy: -12 });
        }
        return P;
      },
      info: function (s) {
        if (s === "sym") return '<span class="ok">✓ 偶函数：</span>定义域 \\([-2,2]\\) 关于原点对称，且 \\(f(-x)=f(x)\\)，图象关于 \\(y\\) 轴对称。';
        if (s === "asym") return '<span class="bad">✗ 非奇非偶：</span>\\(x=2.5\\) 有定义而 \\(x=-2.5\\) 没有，图象右边多出一截，谈不上对称。';
        return '<span class="bad">✗ 非奇非偶：</span>只挖掉一个点 \\((1,1)\\)，\\(f(-1)\\) 有值而 \\(f(1)\\) 不存在，\\(f(-x)=f(x)\\) 在 \\(x=1\\) 处无法成立。';
      }
    },
    {
      id: "fn-mono-def", card: "fn-mono-def", tpl: "toggle",
      title: "\\(y=\\dfrac1x\\) 的递减区间，为什么不能写成 \\((-\\infty,0)\\cup(0,+\\infty)\\)？",
      intro: "「递减」是说：区间里任取 \\(x_1\\lt x_2\\) 都有 \\(f(x_1)\\gt f(x_2)\\)。切换取点方式，检验这句话。",
      ask: { q: "\\(y=\\dfrac1x\\) 的单调递减区间能写成 \\((-\\infty,0)\\cup(0,+\\infty)\\) 吗？", opts: ["能，两段都递减", "不能，取 \\(x_1=-1\\lt x_2=2\\) 时 \\(f(x_1)\\lt f(x_2)\\)，并集上不递减", "不能，应写成 \\(\\mathbf R\\)"], ans: 1,
        why: "并集是一个集合，递减要对集合里任意两点成立。跨过 \\(0\\) 取 \\(-1\\) 和 \\(2\\)，\\(f(-1)=-1\\lt f(2)=\\dfrac12\\)，反而变大了。所以两段要分开写，用「和」或逗号。" },
      ctrl: { init: "same", states: [{ key: "same", label: "同一支内取 \\(x_1=1,\\ x_2=2\\)" }, { key: "cross", label: "跨过 0 取 \\(x_1=-1,\\ x_2=2\\)" }] },
      view: { x: [-3, 3], y: [-3, 3], xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2] },
      scene: function (s) {
        var f = function (x) { return 1 / x; }, P = [];
        P.push({ t: "curve", f: f, from: -3, to: -0.3, color: "a", w: 3.5 }, { t: "curve", f: f, from: 0.3, to: 3, color: "a", w: 3.5 });
        var x1 = s === "same" ? 1 : -1, x2 = 2;
        var ok = f(x1) > f(x2);
        P.push({ t: "seg", x1: x1, y1: f(x1), x2: x2, y2: f(x2), color: ok ? "b" : "no", dash: true, w: 2.5 });
        P.push({ t: "pt", x: x1, y: f(x1), color: ok ? "b" : "no", label: "f(" + x1 + ")=" + f2(f(x1)), dy: s === "same" ? -12 : 30, dx: s === "same" ? 10 : -30 });
        P.push({ t: "pt", x: x2, y: f(x2), color: ok ? "b" : "no", label: "f(2)=0.5", dy: -12 });
        return P;
      },
      info: function (s) {
        return s === "same"
          ? '<span class="ok">✓ \\(x_1\\lt x_2\\) 且 \\(f(x_1)=1\\gt f(x_2)=0.5\\)：</span>在 \\((0,+\\infty)\\) 这一支内确实递减。'
          : '<span class="bad">✗ \\(x_1=-1\\lt x_2=2\\)，却有 \\(f(x_1)=-1\\lt f(x_2)=0.5\\)：</span>在「并集」上 \\(x\\) 变大 \\(f\\) 也变大，递减不成立。递减区间要写成 \\((-\\infty,0)\\) 和 \\((0,+\\infty)\\)。';
      }
    },
    {
      id: "fn-model-app", card: "fn-model-app", tpl: "slider",
      title: "闭区间上的二次函数最值：对称轴出了区间，顶点就不算数",
      intro: "\\(f(x)=(x-a)^2+1\\)，只在 \\(x\\in[0,2]\\) 上取值。拖动对称轴 \\(x=a\\)。",
      ask: { q: "\\(f(x)=(x-a)^2+1\\) 在 \\([0,2]\\) 上的最小值一定是 \\(1\\) 吗？", opts: ["是，顶点就是最小值", "不一定，对称轴 \\(x=a\\) 不在 \\([0,2]\\) 内时最小值在端点", "不一定，最小值总在 \\(x=1\\)"], ans: 1,
        why: "顶点的纵坐标 \\(1\\) 只有在 \\(x=a\\) 落进 \\([0,2]\\) 时才取得到；对称轴在区间左边时函数在区间上递增，最小值在 \\(x=0\\)；在右边时递减，最小值在 \\(x=2\\)。应用题先列实际定义域，就是为了这一步。" },
      ctrl: { label: "对称轴 \\(a=\\)", min: -1, max: 3, step: 0.25, init: 1, quick: [{ label: "a=1（顶点在内）", v: 1 }, { label: "a=3（顶点在外）", v: 3 }] },
      view: { x: [-1.6, 3.6], y: [0, 11], xt: [-1, 1, 2, 3], yt: [1, 4, 8] },
      scene: function (a) {
        var f = function (x) { return (x - a) * (x - a) + 1; }, P = [];
        P.push({ t: "region", x0: 0, x1: 2, color: "b", opacity: 0.16, label: "允许区间 [0, 2]" });
        P.push({ t: "curve", f: f, from: -1.6, to: 3.6, color: "muted", dash: true, w: 2 });
        P.push({ t: "curve", f: f, from: 0, to: 2, color: "a", w: 3.5 });
        P.push({ t: "vline", x: a, color: "c", label: "对称轴 x=" + f2(a) });
        var inside = a >= 0 && a <= 2;
        P.push({ t: "pt", x: a, y: 1, color: inside ? "a" : "no", hollow: !inside, label: inside ? "顶点 (a,1) 取得到" : "顶点在区间外", dy: -12 });
        if (!inside) { var xm = a < 0 ? 0 : 2; P.push({ t: "pt", x: xm, y: f(xm), color: "b", label: "最小值在端点 x=" + xm, dy: -12, dx: a < 0 ? 10 : -170 }); }
        return P;
      },
      info: function (a) {
        if (a >= 0 && a <= 2) return '<span class="ok">✓ 对称轴在区间内：</span>最小值就是顶点 \\(f(' + f2(a) + ')=1\\)。';
        var xm = a < 0 ? 0 : 2, v = (xm - a) * (xm - a) + 1;
        return '<span class="bad">✗ 对称轴 x=' + f2(a) + ' 在区间' + (a < 0 ? "左" : "右") + '边：</span>\\(f\\) 在 \\([0,2]\\) 上单调' + (a < 0 ? "递增" : "递减") + '，最小值在端点 \\(f(' + xm + ')=' + String(v) + '\\)，不是 \\(1\\)。';
      }
    },
    /* ---- 第 4 章 ---- */
    {
      id: "exp-fn-prop", card: "exp-fn-prop", tpl: "slider",
      title: "\\(y=2^x\\)（\\(x\\le m\\)）的值域：下界 \\(0\\) 永远在",
      intro: "指数函数的值永远是正数。拖动右端点 \\(m\\)，看值域那一段（左侧金色竖条）从哪到哪。",
      ask: { q: "\\(y=2^x\\)（\\(x\\le 2\\)）的值域是？", opts: ["\\((-\\infty,4]\\)", "\\((0,4]\\)", "\\([0,4]\\)"], ans: 1,
        why: "\\(2^x\\gt 0\\) 恒成立，\\(x\\to-\\infty\\) 时值无限接近 \\(0\\) 但取不到；上端 \\(x=2\\) 取得到 \\(4\\)。所以是 \\((0,4]\\)，左端既不是 \\(-\\infty\\) 也不能闭。" },
      ctrl: { label: "右端点 \\(m=\\)", min: -2, max: 3, step: 0.5, init: 2, quick: [{ label: "m=2", v: 2 }, { label: "m=−1", v: -1 }] },
      view: { x: [-4.4, 4], y: [-1.2, 9], xt: [-3, -2, -1, 1, 2, 3], yt: [1, 4, 8] },
      scene: function (m) {
        var f = function (x) { return Math.pow(2, x); }, P = [];
        P.push({ t: "region", x0: -4.4, x1: m, color: "a", opacity: 0.1, label: "x ≤ m" });
        P.push({ t: "curve", f: f, from: -4.4, to: m, color: "a", w: 3.5 });
        P.push({ t: "curve", f: f, from: m, to: 4, color: "muted", dash: true, w: 2 });
        P.push({ t: "hline", y: 0, color: "no", label: "y = 0 取不到（下界）", dy: 24 });
        P.push({ t: "pt", x: m, y: f(m), color: "b", label: "(m, 2^m) 取得到", dy: -12 });
        P.push({ t: "seg", x1: -4.1, y1: 0, x2: -4.1, y2: f(m), color: "b", w: 9, label: "值域", dx: 40, dy: 0 });
        P.push({ t: "pt", x: -4.1, y: 0, color: "no", hollow: true, r: 5 });
        return P;
      },
      info: function (m) {
        return '值域 <span class="ok">\\((0,\\ 2^{' + f2(m) + '}]\\)</span>：上端 \\(2^{' + f2(m) + '}\\approx ' + f2(Math.pow(2, m)) + '\\) 取得到（闭），近似小数不代替精确端点；下端 \\(0\\) 只能无限接近（开）。写成 \\((-\\infty,2^{' + f2(m) + '}]\\) 就把负数都算进去了，<span class="bad">错</span>。';
      }
    },
    {
      id: "zero-theorem", card: "zero-theorem", tpl: "toggle",
      title: "零点存在定理只说「有」，不说「没有」，也离不开连续",
      intro: "定理：\\(f\\) 在 \\([a,b]\\) 上连续且 \\(f(a)f(b)\\lt 0\\Rightarrow\\) \\((a,b)\\) 内有零点。切换三种情形，看哪些结论不能反着用。",
      ask: { q: "\\(f(a)\\cdot f(b)\\gt 0\\)，能断定 \\(f(x)\\) 在 \\((a,b)\\) 内没有零点吗？", opts: ["能", "不能，\\(f(x)=x^2-1\\) 在 \\([-2,2]\\) 上 \\(f(-2)f(2)\\gt 0\\) 却有两个零点", "能，但要求 \\(f\\) 连续"], ans: 1,
        why: "定理是单向的：异号 \\(\\Rightarrow\\) 有零点。同号时内部仍可能有零点。另外，若去掉连续性，定义完整的跳跃函数也能两端异号而没有零点：左侧取 \\(-1\\)、右侧含 \\(0\\) 取 \\(1\\)。" },
      ctrl: { init: "ok", states: [{ key: "ok", label: "连续且异号：\\(x-1\\) 在 \\([0,2]\\)" }, { key: "even", label: "同号却有零点：\\(x^2-1\\) 在 \\([-2,2]\\)" }, { key: "disc", label: "异号却无零点：区间内跳跃的函数" }] },
      view: { x: [-2.6, 2.6], y: [-3.2, 3.6], xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2, 3] },
      scene: function (s) {
        var P = [];
        if (s === "ok") {
          P.push({ t: "region", x0: 0, x1: 2, color: "b", opacity: 0.14, label: "[0, 2]" });
          P.push({ t: "curve", f: function (x) { return x - 1; }, from: -2.6, to: 2.6, color: "a", w: 3.5 });
          P.push({ t: "pt", x: 0, y: -1, color: "c", label: "f(0)=−1", dy: 30, dx: -30 }, { t: "pt", x: 2, y: 1, color: "c", label: "f(2)=1", dy: -12 });
          P.push({ t: "pt", x: 1, y: 0, color: "a", label: "零点 x=1", dy: -12 });
        } else if (s === "even") {
          P.push({ t: "region", x0: -2, x1: 2, color: "b", opacity: 0.14, label: "[−2, 2]" });
          P.push({ t: "curve", f: function (x) { return x * x - 1; }, from: -2.6, to: 2.6, color: "a", w: 3.5 });
          P.push({ t: "pt", x: -2, y: 3, color: "c", label: "f(−2)=3", dx: 10, dy: 6 }, { t: "pt", x: 2, y: 3, color: "c", label: "f(2)=3", dx: -90, dy: 6 });
          P.push({ t: "pt", x: -1, y: 0, color: "no", label: "零点", dy: 28, dx: -20 }, { t: "pt", x: 1, y: 0, color: "no", label: "零点", dy: 28, dx: -20 });
        } else {
          P.push({ t: "region", x0: -1, x1: 1, color: "b", opacity: 0.14, label: "[−1, 1]" });
          P.push({ t: "curve", f: function () { return -1; }, from: -2.6, to: 0, color: "a", w: 3.5 }, { t: "curve", f: function () { return 1; }, from: 0, to: 2.6, color: "a", w: 3.5 });
          P.push({ t: "pt", x: 0, y: -1, color: "no", hollow: true }, { t: "pt", x: 0, y: 1, color: "a" });
          P.push({ t: "pt", x: -1, y: -1, color: "c", label: "h(−1)=−1", dy: 30, dx: -40 }, { t: "pt", x: 1, y: 1, color: "c", label: "h(1)=1", dy: -12 });
          P.push({ t: "text", x: 0, y: 2.6, text: "x=0 跳跃，h(x) 始终≠0", color: "no", anchor: "middle", bold: true });
        }
        return P;
      },
      info: function (s) {
        if (s === "ok") return '<span class="ok">✓ 定理正用：</span>连续 + \\(f(0)f(2)=-1\\lt 0\\Rightarrow(0,2)\\) 内有零点，确实在 \\(x=1\\)。';
        if (s === "even") return '<span class="bad">✗ 逆命题假：</span>\\(f(-2)f(2)=9\\gt 0\\)，可 \\(x=\\pm1\\) 是两个零点。这个例子两端同号却有两个零点，不能断定「没有」。';
        return '<span class="bad">✗ 丢了连续性：</span>\\(h(-1)h(1)=-1\\lt 0\\)，但本例 \\(h(x)=-1\\)（\\(x\\lt0\\)）、\\(h(x)=1\\)（\\(x\\ge0\\)），在 \\(0\\) 跳跃；它在整个区间都有定义且从不等于 \\(0\\)。用定理前须核在整个闭区间连续。';
      }
    },
    /* ---- 第 5 章 ---- */
    {
      id: "trig-shift-scale", card: "trig-shift-scale", tpl: "routes",
      title: "\\(\\sin x\\to\\sin\\left(2x+\\dfrac{\\pi}{3}\\right)\\)：先伸缩后平移时，为什么平移量是 \\(\\dfrac{\\pi}{6}\\)？",
      intro: "目标 \\(y=\\sin\\left(2x+\\dfrac\\pi3\\right)=\\sin\\left[2\\left(x+\\dfrac\\pi6\\right)\\right]\\)（绿色粗线）。点路线，看哪条能和它重合。",
      ask: { q: "把 \\(y=\\sin 2x\\) 的图象向左平移多少，得到 \\(y=\\sin\\left(2x+\\dfrac\\pi3\\right)\\)？", opts: ["\\(\\dfrac\\pi3\\)", "\\(\\dfrac\\pi6\\)", "\\(\\dfrac{2\\pi}3\\)"], ans: 1,
        why: "平移只作用在 \\(x\\) 本身：\\(\\sin 2x\\to\\sin 2(x+h)=\\sin(2x+2h)\\)，要 \\(2h=\\dfrac\\pi3\\)，所以 \\(h=\\dfrac\\pi6\\)。先平移后伸缩时才是移 \\(\\dfrac\\pi3\\)。" },
      ctrl: { init: "A", states: [{ key: "A", label: "路线 A：先左移 \\(\\dfrac\\pi3\\)，再横坐标缩半" }, { key: "B", label: "路线 B：先缩半，再左移 \\(\\dfrac\\pi6\\)" }, { key: "bad", label: "常见错法：先缩半，再左移 \\(\\dfrac\\pi3\\)" }] },
      view: { x: [-1.2, 2 * PI + 0.2], y: [-1.6, 1.6], xt: [], yt: [-1, 1] },
      scene: function (s) {
        var P = [];
        P.push({ t: "curve", f: Math.sin, from: -1.2, to: 2 * PI + 0.2, color: "muted", dash: true, w: 1.5, label: { x: 1.3, text: "sin x", dy: -6 } });
        P.push({ t: "curve", f: function (x) { return Math.sin(2 * x + PI / 3); }, from: -1.2, to: 2 * PI + 0.2, color: "a", w: 5, label: { x: 3.9, text: "目标", dy: -8 } });
        if (s === "bad") P.push({ t: "curve", f: function (x) { return Math.sin(2 * x + 2 * PI / 3); }, from: -1.2, to: 2 * PI + 0.2, color: "no", w: 3, label: { x: 2.9, text: "sin(2x+2π/3)", dy: 24 } });
        else P.push({ t: "curve", f: function (x) { return Math.sin(2 * x + PI / 3); }, from: -1.2, to: 2 * PI + 0.2, color: "b", w: 2.5, dash: true });
        P.push({ t: "vline", x: PI / 2, color: "muted", label: "π/2" }, { t: "vline", x: PI, color: "muted", label: "π" }, { t: "vline", x: 3 * PI / 2, color: "muted", label: "3π/2" });
        return P;
      },
      info: function (s) {
        if (s === "A") return '<span class="ok">✓ 重合：</span>\\(\\sin x\\xrightarrow{\\text{左移 }\\pi/3}\\sin\\left(x+\\dfrac\\pi3\\right)\\xrightarrow{\\text{缩半}}\\sin\\left(2x+\\dfrac\\pi3\\right)\\)。先平移时，移的就是 \\(\\varphi\\) 本身。';
        if (s === "B") return '<span class="ok">✓ 重合：</span>\\(\\sin x\\xrightarrow{\\text{缩半}}\\sin 2x\\xrightarrow{\\text{左移 }\\pi/6}\\sin 2\\left(x+\\dfrac\\pi6\\right)=\\sin\\left(2x+\\dfrac\\pi3\\right)\\)。先伸缩时，平移量要除以 \\(\\omega\\)。';
        return '<span class="bad">✗ 错位：</span>\\(\\sin 2x\\xrightarrow{\\text{左移 }\\pi/3}\\sin 2\\left(x+\\dfrac\\pi3\\right)=\\sin\\left(2x+\\dfrac{2\\pi}3\\right)\\)，红线比目标多移了 \\(\\dfrac\\pi6\\)。可取 \\(\\left|\\dfrac{\\varphi}{\\omega}\\right|\\) 作为一个代表距离，方向另核；本题还可多左移整数个周期 \\(\\pi\\)。';
      }
    },
    /* ---- 选必一 第 2 章 ---- */
    {
      id: "geom-line-slope-eq", card: "geom-line-slope-eq", tpl: "slider",
      title: "倾斜角从 \\(0^\\circ\\) 转到 \\(180^\\circ\\)，斜率并不是一路变大",
      intro: "\\(k=\\tan\\alpha\\)。拖动倾斜角 \\(\\alpha\\)，看直线和 \\(k\\) 的值，特别留意 \\(90^\\circ\\) 附近。",
      ask: { q: "倾斜角 \\(\\alpha\\) 从 \\(0^\\circ\\) 增大到接近 \\(180^\\circ\\)，斜率 \\(k\\) 一直在增大吗？", opts: ["是，\\(k\\) 随 \\(\\alpha\\) 单调递增", "不是，\\(\\alpha=90^\\circ\\) 时 \\(k\\) 不存在，两侧各自递增", "不是，\\(k\\) 单调递减"], ans: 1,
        why: "\\(\\tan\\alpha\\) 在 \\([0^\\circ,90^\\circ)\\) 和 \\((90^\\circ,180^\\circ)\\) 上分别递增，但 \\(90^\\circ\\) 处无定义，从 \\(89^\\circ\\) 到 \\(91^\\circ\\) 斜率从很大的正数跳到很小的负数。由 \\(k\\) 的范围求 \\(\\alpha\\) 要分两段。" },
      ctrl: { label: "倾斜角 \\(\\alpha=\\)", min: 0, max: 175, step: 5, init: 45, fmt: function (v) { return v + "°"; }, quick: [{ label: "45°", v: 45 }, { label: "90°", v: 90 }, { label: "135°", v: 135 }] },
      view: { height: PT + PB + (W - PL - PR) * (5.2 / 6.4), x: [-3.2, 3.2], y: [-2.6, 2.6], xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2] },
      scene: function (deg) {
        var a = deg * PI / 180, c = Math.cos(a), s = Math.sin(a), P = [];
        var T = Math.min(Math.abs(c) > 1e-9 ? 3.2 / Math.abs(c) : 1e9, Math.abs(s) > 1e-9 ? 2.6 / Math.abs(s) : 1e9);
        var vertical = Math.abs(deg - 90) < 1e-9;
        P.push({ t: "seg", x1: -T * c, y1: -T * s, x2: T * c, y2: T * s, color: vertical ? "no" : "a", w: 3.5 });
        P.push({ t: "seg", x1: 0, y1: 0, x2: 1.2, y2: 0, color: "c", w: 2 });
        P.push({ t: "text", x: 1.35, y: 0.35, text: "α = " + deg + "°", color: "c", bold: true });
        P.push({ t: "text", x: -3.1, y: 2.3, text: vertical ? "k 不存在" : "k = tan α ≈ " + f2(Math.tan(a)), color: vertical ? "no" : "a", bold: true });
        return P;
      },
      info: function (deg) {
        if (Math.abs(deg - 90) < 1e-9) return '<span class="bad">α = 90°：直线垂直于 x 轴，斜率不存在。</span>斜率公式 \\(\\dfrac{y_2-y_1}{x_2-x_1}\\) 分母为 \\(0\\)，不能套；由 \\(k\\) 求 \\(\\alpha\\) 的范围时这个角要单独写。';
        var k = Math.tan(deg * PI / 180);
        return 'α = ' + deg + '°，\\(k=\\tan\\alpha\\approx ' + f2(k) + '\\)（' + (deg === 0 ? '水平，\\(k=0\\)' : (deg < 90 ? '锐角，\\(k\\gt 0\\)' : '钝角，\\(k\\lt 0\\)')) + '）。' + (deg === 85 || deg === 95 ? '<b>跨过 90° 时要分别看两侧；90° 本身斜率不存在。</b>' : '');
      }
    },
    /* ---- 选必一 第 3 章 ---- */
    {
      id: "conic-ellipse", card: "conic-ellipse", tpl: "slider",
      title: "椭圆定义里的 \\(2a\\gt 2c\\)：和不够长，轨迹就不是椭圆",
      intro: "两焦点 \\(F_1(-2,0)\\)，\\(F_2(2,0)\\)，\\(|F_1F_2|=2c=4\\)。拖动定长 \\(2a\\)，看 \\(|PF_1|+|PF_2|=2a\\) 的轨迹。",
      ask: { q: "动点 \\(P\\) 满足 \\(|PF_1|+|PF_2|=4\\)，而 \\(|F_1F_2|=4\\)，\\(P\\) 的轨迹是？", opts: ["椭圆", "线段 \\(F_1F_2\\)", "不存在"], ans: 1,
        why: "三角形两边之和大于第三边，\\(|PF_1|+|PF_2|\\gt|F_1F_2|\\) 才能构成三角形；恰好相等时 \\(P\\) 只能落在线段 \\(F_1F_2\\) 上；小于时根本不存在。定义里的 \\(2a\\gt 2c\\) 不是摆设。" },
      ctrl: { label: "定长 \\(2a=\\)", min: 2.5, max: 9, step: 0.5, init: 6, quick: [{ label: "2a=6（椭圆）", v: 6 }, { label: "2a=4（线段）", v: 4 }, { label: "2a=3（不存在）", v: 3 }] },
      view: { height: PT + PB + (W - PL - PR) * (10.2 / 12.8), x: [-6.4, 6.4], y: [-5.1, 5.1], xt: [-4, -2, 2, 4], yt: [-2, 2] },
      scene: function (twoA) {
        var a = twoA / 2, c = 2, P = [];
        P.push({ t: "pt", x: -2, y: 0, color: "no", label: "F₁", dy: 30, dx: -10 }, { t: "pt", x: 2, y: 0, color: "no", label: "F₂", dy: 30, dx: -10 });
        if (a > c) {
          var b = Math.sqrt(a * a - c * c);
          var up = function (x) { return b * Math.sqrt(Math.max(0, 1 - x * x / (a * a))); };
          P.push({ t: "curve", f: up, from: -a, to: a, color: "a", w: 3.5 }, { t: "curve", f: function (x) { return -up(x); }, from: -a, to: a, color: "a", w: 3.5 });
          P.push({ t: "text", x: 0, y: b, text: "椭圆 a=" + f2(a) + ", b≈" + f2(b), color: "a", anchor: "middle", dy: -10, bold: true });
        } else if (Math.abs(a - c) < 1e-9) {
          P.push({ t: "seg", x1: -2, y1: 0, x2: 2, y2: 0, color: "b", w: 8, label: "退化成线段 F₁F₂", dy: -14 });
        } else {
          P.push({ t: "text", x: 0, y: 1.6, text: "2a < 2c：这样的点 P 不存在", color: "no", anchor: "middle", bold: true });
        }
        return P;
      },
      info: function (twoA) {
        if (twoA > 4) return '<span class="ok">✓ \\(2a=' + f2(twoA) + '\\gt 2c=4\\)：</span>是椭圆，\\(b^2=a^2-c^2=' + String(twoA * twoA / 4 - 4) + '\\)。\\(2a\\) 越接近 \\(4\\)，椭圆越扁。';
        if (Math.abs(twoA - 4) < 1e-9) return '<span class="bad">✗ \\(2a=2c\\)：</span>\\(|PF_1|+|PF_2|=|F_1F_2|\\)，\\(P\\) 只能在线段 \\(F_1F_2\\) 上，不是椭圆。';
        return '<span class="bad">✗ \\(2a=' + f2(twoA) + '\\lt 2c=4\\)：</span>两边之和小于第三边，没有这样的点。';
      }
    },
    /* ---- 选必二 第 4 章 ---- */
    {
      id: "seq-arith-geom", card: "seq-arith-geom", tpl: "toggle",
      title: "等比数列求和：\\(q=1\\) 时公式的分母是 \\(0\\)",
      intro: "\\(a_1=2\\)，求前 \\(4\\) 项和。切换公比 \\(q\\)，比较「直接相加」和「套公式 \\(S_n=\\dfrac{a_1(1-q^n)}{1-q}\\)」。",
      ask: { q: "公比 \\(q\\) 含参数，直接套分式求和公式前必须先核查什么？", opts: ["直接套 \\(\\dfrac{a_1(1-q^4)}{1-q}\\)", "先分 \\(q=1\\) 与 \\(q\\ne 1\\) 讨论", "只求通项即可省略分母为零的检查"], ans: 1,
        why: "公式的分母是 \\(1-q\\)，\\(q=1\\) 时为 \\(0\\)，公式作废，此时 \\(S_n=na_1\\)。使用这个分式前须分 \\(q=1\\) 与 \\(q\\ne1\\)。也可直接相加写成 \\(S_4=2(1+q+q^2+q^3)\\)，此多项式在 \\(q=1\\) 仍有效；这不等于能把 \\(1\\) 直接代进原分式。" },
      ctrl: { init: "2", states: [{ key: "2", label: "\\(q=2\\)" }, { key: "1", label: "\\(q=1\\)" }, { key: "-1", label: "\\(q=-1\\)" }] },
      view: { x: [0, 5], y: [-4, 18], xt: [1, 2, 3, 4], yt: [-2, 2, 8, 16] },
      scene: function (s) {
        var q = Number(s), P = [], sum = 0;
        for (var n = 1; n <= 4; n++) {
          var an = 2 * Math.pow(q, n - 1); sum += an;
          P.push({ t: "seg", x1: n, y1: 0, x2: n, y2: an, color: s === "1" ? "no" : "a", w: 14 });
          P.push({ t: "text", x: n, y: an, text: "a" + n + "=" + an, color: s === "1" ? "no" : "a", anchor: "middle", dy: an >= 0 ? -10 : 26, bold: true });
        }
        P.push({ t: "text", x: 2.5, y: 15.5, text: "直接相加 S₄ = " + sum, color: "b", anchor: "middle", bold: true });
        return P;
      },
      info: function (s) {
        var q = Number(s);
        if (q === 1) return '<span class="bad">✗ 公式作废：</span>分母 \\(1-q=0\\)。此时四项都是 \\(2\\)，\\(S_4=4a_1=8\\)。含参公比必须先写「当 \\(q=1\\) 时 \\(S_n=na_1\\)」。';
        var f = 2 * (1 - Math.pow(q, 4)) / (1 - q);
        return '<span class="ok">✓ 公式可用：</span>\\(S_4=\\dfrac{2(1-(' + q + ')^4)}{1-(' + q + ')}=' + f2(f) + '\\)，与直接相加一致。';
      }
    },
    /* ---- 选必二 第 5 章 ---- */
    {
      id: "calc-derivative-def", card: "calc-derivative-def", tpl: "routes",
      title: "「在点处的切线」和「过点的切线」：\\(y=x^3\\) 过 \\((1,1)\\) 的切线有几条？",
      intro: "曲线 \\(y=x^3\\)，点 \\(A(1,1)\\) 在曲线上。点路线，看每种理解画出几条线。",
      ask: { q: "「过点 \\(A(1,1)\\) 的曲线 \\(y=x^3\\) 的切线」有几条？", opts: ["1 条（就是在 \\(A\\) 处的切线）", "2 条（切点可以不是 \\(A\\)）", "无数条"], ans: 1,
        why: "「过点」不要求 \\(A\\) 是切点。设切点 \\((t,t^3)\\)，切线 \\(y=3t^2(x-t)+t^3\\) 过 \\((1,1)\\) 得 \\(2t^3-3t^2+1=0\\)，即 \\((t-1)^2(2t+1)=0\\)：\\(t=1\\) 或 \\(t=-\\dfrac12\\)，两条。" },
      ctrl: { init: "at", states: [{ key: "at", label: "在点 A 处的切线：\\(k=f'(1)=3\\)" }, { key: "through", label: "过点 A 的切线：设切点 \\((t,t^3)\\)" }, { key: "bad", label: "错法：把「过点」当「在点」" }] },
      view: { x: [-2.1, 2.1], y: [-3.2, 3.2], xt: [-2, -1, 1, 2], yt: [-2, -1, 1, 2] },
      scene: function (s) {
        var P = [{ t: "curve", f: function (x) { return x * x * x; }, from: -2.1, to: 2.1, color: "c", w: 3 }];
        P.push({ t: "curve", f: function (x) { return 3 * x - 2; }, from: -2.1, to: 2.1, color: "a", w: 3, label: { x: 1.45, text: "y=3x−2", dy: -8 } });
        P.push({ t: "pt", x: 1, y: 1, color: "a", label: "A(1,1)", dy: 28, dx: 8 });
        if (s === "through") {
          P.push({ t: "curve", f: function (x) { return 0.75 * x + 0.25; }, from: -2.1, to: 2.1, color: "b", w: 3, label: { x: -2.05, text: "y=¾x+¼", dy: 26 } });
          P.push({ t: "pt", x: -0.5, y: -0.125, color: "b", label: "另一切点 (−½, −⅛)", dy: -14, dx: -150 });
        }
        if (s === "bad") P.push({ t: "text", x: -2, y: 2.6, text: "漏掉了切点不是 A 的那一条", color: "no", bold: true });
        return P;
      },
      info: function (s) {
        if (s === "at") return '<span class="ok">✓ 在点 A 处：</span>切点就是 \\(A\\)，\\(k=f\'(1)=3\\)，切线 \\(y-1=3(x-1)\\)，唯一一条。';
        if (s === "through") return '<span class="ok">✓ 过点 A：</span>切点 \\((t,t^3)\\) 待定，由切线过 \\((1,1)\\) 解得 \\(t=1\\) 或 \\(t=-\\dfrac12\\)，两条：\\(y=3x-2\\) 和 \\(y=\\dfrac34x+\\dfrac14\\)。';
        return '<span class="bad">✗ 只画了一条：</span>题目说「过点」却按「在点」做，丢了切点 \\(\\left(-\\dfrac12,-\\dfrac18\\right)\\) 的那条金色线。看到「过点」先问：切点是谁？';
      }
    },
    {
      id: "calc-monot-extrema", card: "calc-monot-extrema", tpl: "toggle",
      title: "\\(f'(x_0)=0\\) 不够：\\(x^2\\) 与 \\(x^3\\) 的极值为什么不同",
      intro: "比较 \\(y=x^2\\) 和 \\(y=x^3\\) 在 \\(x=0\\) 处：导数都为 \\(0\\)（蓝色虚线是 \\(f'\\)）。切换看导数两侧的符号。",
      ask: { q: "已知 \\(f\\) 在内点 \\(x_0\\) 的邻域内可导，\\(f'(x_0)=0\\) 是其为极值点的什么条件？", opts: ["充要条件", "必要不充分：驻点不一定是极值点", "充分不必要"], ans: 1,
        why: "函数在内点邻域内可导，且该点为极值点时，导数必为 \\(0\\)（必要），但 \\(y=x^3\\) 在 \\(x=0\\) 处 \\(f'(0)=0\\) 而两侧 \\(f'\\ge 0\\) 不变号，函数一路递增，\\(0\\) 不是极值点。本实验两例在驻点两侧各有固定导数符号，可用变号这个常用充分判据比较；不能把解出驻点直接当作已求出极值点。" },
      ctrl: { init: "x2", states: [{ key: "x2", label: "\\(y=x^2\\)：\\(f'=2x\\) 两侧变号" }, { key: "x3", label: "\\(y=x^3\\)：\\(f'=3x^2\\) 两侧不变号" }] },
      view: { x: [-2.1, 2.1], y: [-3.2, 3.6], xt: [-2, -1, 1, 2], yt: [-2, 2] },
      scene: function (s) {
        var P = [];
        if (s === "x2") {
          P.push({ t: "curve", f: function (x) { return x * x; }, from: -2.1, to: 2.1, color: "a", w: 3.5, label: { x: 1.3, text: "f=x²", dy: -8 } });
          P.push({ t: "curve", f: function (x) { return 2 * x; }, from: -2.1, to: 2.1, color: "c", dash: true, w: 2.5, label: { x: 0.9, text: "f'=2x", dy: 22 } });
          P.push({ t: "text", x: -1.2, y: -1.6, text: "f' < 0", color: "no", anchor: "middle", bold: true }, { t: "text", x: 1.2, y: -1.6, text: "f' > 0", color: "a", anchor: "middle", bold: true });
          P.push({ t: "pt", x: 0, y: 0, color: "a", label: "极小值点", dy: 28, dx: 8 });
        } else {
          P.push({ t: "curve", f: function (x) { return x * x * x; }, from: -2.1, to: 2.1, color: "a", w: 3.5, label: { x: 1.2, text: "f=x³", dy: -8 } });
          P.push({ t: "curve", f: function (x) { return 3 * x * x; }, from: -2.1, to: 2.1, color: "c", dash: true, w: 2.5, label: { x: 0.8, text: "f'=3x²", dy: -8 } });
          P.push({ t: "text", x: -1.2, y: -1.6, text: "f' ≥ 0", color: "a", anchor: "middle", bold: true }, { t: "text", x: 1.2, y: -1.6, text: "f' ≥ 0", color: "a", anchor: "middle", bold: true });
          P.push({ t: "pt", x: 0, y: 0, color: "no", hollow: false, label: "f'(0)=0 但不是极值点", dy: 28, dx: 8 });
        }
        return P;
      },
      info: function (s) {
        return s === "x2"
          ? '<span class="ok">✓ 变号：</span>\\(f\'\\) 在 \\(0\\) 左负右正，函数先减后增，\\(x=0\\) 是极小值点。'
          : '<span class="bad">✗ 不变号：</span>\\(f\'(0)=0\\)，但 \\(f\'=3x^2\\) 在 \\(0\\) 两侧都 \\(\\ge 0\\)，函数一直递增，\\(x=0\\) 不是极值点。本例由两侧非负且除驻点外为正，得出严格递增，因而不是极值点。';
      }
    }
  ];

  var LAB_BY_ID = {};
  LABS.forEach(function (d) { LAB_BY_ID[d.id] = d; if (BY_ID[d.card]) BY_ID[d.card].lab = BY_ID[d.card].lab || d.id; });

  /* ---------- 标签页 4：全部实验按章渲染 ---------- */
  function renderAll() {
    var mount = document.getElementById("labList");
    if (!mount || mount.getAttribute("data-labs-done")) return;
    mount.setAttribute("data-labs-done", "1");
    var byCh = {};
    LABS.forEach(function (d) { var ch = (BY_ID[d.card] || {}).ch || 0; (byCh[ch] = byCh[ch] || []).push(d); });
    Object.keys(byCh).map(Number).sort(function (a, b) { return a - b; }).forEach(function (ch) {
      var g = document.createElement("div");
      g.className = "lab-group";
      g.innerHTML = "<h3>" + (CH_NAMES[ch] || ("第 " + ch + " 章")) + "</h3>";
      mount.appendChild(g);
      byCh[ch].forEach(function (d) { renderLab(d, g); });
    });
  }

  /* ---------- 卡片库：带 lab 的卡加「拨一下反例开关」按钮 ---------- */
  function decorateCards(listEl) {
    [].slice.call(listEl.querySelectorAll("article.w-card")).forEach(function (art) {
      var id = (art.id || "").replace(/^card-/, "");
      var c = BY_ID[id];
      if (!c || !c.lab || !LAB_BY_ID[c.lab]) return;
      var links = art.querySelector(".w-links");
      if (!links || links.querySelector("[data-lab-toggle]")) return;
      var b = document.createElement("button");
      b.type = "button"; b.className = "w-rel"; b.setAttribute("data-lab-toggle", c.lab);
      b.style.borderColor = "var(--no)"; b.style.color = "var(--no)"; b.style.fontWeight = "600";
      b.textContent = "🧪 拨一下反例开关";
      links.insertBefore(b, links.firstChild);
    });
  }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-lab-toggle]");
    if (!b) return;
    var art = b.closest("article.w-card");
    if (!art) return;
    var box = art.querySelector(".lab-inline");
    if (box) { box.remove(); b.textContent = "🧪 拨一下反例开关"; return; }
    box = document.createElement("div");
    box.className = "lab-inline";
    art.appendChild(box);
    renderLab(LAB_BY_ID[b.getAttribute("data-lab-toggle")], box);
    b.textContent = "收起实验";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  // 接在 wiki-cards.js 的 decorate 后面
  var prev = window.PEIYU_CARD_MODE;
  if (prev && prev.decorate) {
    var orig = prev.decorate;
    prev.decorate = function (listEl, matched) { orig(listEl, matched); decorateCards(listEl); };
  }

  function boot() {
    renderAll();
    var list = document.getElementById("cardList");
    if (list && list.children.length) decorateCards(list);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PEIYU_LABS = { LABS: LABS, byId: LAB_BY_ID, render: renderAll, renderLab: renderLab };
  window.PEIYU_LABS_RENDER = renderAll;
})();
