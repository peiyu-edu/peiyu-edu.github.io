/* 培玉 · 小学数学 — 教具文件 kits/chengfa.js：乘法单元（三上 U4 多位数乘一位数、四上 U3 多位数乘两位数）里
   竖式、小方块以外的教具。竖式 shushi / 静态竖式 vsfig / 小方块 kuai 在 kits/shushi.js。
   页面写法：<div class="manip" data-manip="panzi" data-cfg='{"n":4,"k":2}'></div>，
   在 manip.js 后面加载 <script defer src="../p-assets/kits/chengfa.js"></script>。
   所有数由代码算；鼠标、触屏、键盘都能用；每个都有「重来」（计算器是「C」）；变化时抛 manip:change。
   读数的朗读文字由读数自动转成（× → 乘，÷ → 除以，= → 等于，< → 小于……）。

   登记的 kind：

   panzi  盘子：几个盘子、每盘几个（几个几；0 的乘法）。两个都能调到 0。
          读数写出连加和两种乘法：k + k + … = 积（n 个 k 相加）、k × n = 积，n × k = 积；
          每盘 0 个说「一个也没有」，没有盘子说「没有盘子，一共 0 个」。积为 0 时读数标绿。
          cfg: n 几个盘子（0–8，默认 4）；k 每盘几个（0–5，默认 2）。
          例：{"n":4,"k":2}（几个几）、{"n":3,"k":0}（0 的乘法）。用在 p3a-u4-5。

   kancheng  「看成」滑块（三上「用估算解决问题」）：一道「带的钱够不够」的题，拖圆钮（或方向键、点下面的数）
          把要估的乘数 x 看成相邻的整十 / 整百数（往大或往小），竖着写三行推理（只用 <、>，不写约等号），
          结论是三种之一：一定够 / 一定不够 / 说不准（说不准时提示换个方向估）。
          cfg: cases [{x 要估的乘数, m 一位数乘数, T 带的钱（元）, q 题目 HTML}]，多于一题时出「题 1 / 题 2」按钮；
               默认一题 {x:788, m:6, T:5000}。
          例：{"cases":[{"x":109,"m":9,"T":900,"q":"每个书包 109 元，买 9 个，900 元够不够？"},
                        {"x":412,"m":8,"T":3000,"q":"412 人，每张门票 8 元，3000 元够不够？"}]}。用在 p3a-u4-7。

   guji   估一估数线（四上「用估算解决问题」）：两个乘数（单价 p × 份数 n）各一个按钮，循环「不动 → 往大估 → 往小估」
          （估成整十数；本来就是整十数的跳过不能动的一项），点「估一估」把估出的数标到数线上（估大红、估小蓝），
          和「带了 m」那条线比；「精算」再标出真的数。判断规则：都往大估（或不动）且不超过 → 一定够；
          都往小估（或不动）且已经超过 → 一定不够；一个往大一个往小，或方向不对 → 判断不了。
          cfg: p 每份多少（默认 98）；n 几份（默认 24）；m 带的钱（默认 3000）；u 单位（默认「元」）。
          例：{"p":98,"n":24,"m":3000}（往大估够）、{"p":135,"n":24,"m":3000}（往小估不够）、
              {"p":120,"n":24,"m":3000}（估不出来要精算）、{"p":97,"n":21,"m":2000}。用在 p4a-u3-7。

     ▸ kancheng 和 guji 都是「只问够不够」的估算，留两个是因为学段不同：
       kancheng 只估一个乘数（三位数 × 一位数），让学生在「看成几」的若干候选里挑，结论直接写成三行不等式推理，
       适合三上第一次学「往大估一定够 / 往小估一定不够」；
       guji 两个乘数都能估、还能一大一小，结果放在数线上和带的钱、真的数对比，重点是「怎么估才能判断」和「判断不了就精算」，
       适合四上两位数乘数。三上（乘一位数）用 kancheng；四上及以后两个乘数都要估时用 guji。

   dianzi 点子图（两位数乘两位数的道理）：每行 a 个点、b 行（b 是 11–19），第 10 行下面一条虚线；
          「圈下面几行」= 第一次乘得的数（a × 个位），「圈上面 10 行」= 第二次乘得的数（a × 10），都圈了自动合起来。
          cfg: a 每行几个（默认 21；edit 时 11–24）；b 几行（默认 14；11–19）；edit 是否能调（默认 false）。
          例：{"a":23,"b":12,"edit":true}。用在 p4a-u3-2。

   koushuan 乘整十数口算的遮板：「盖住末尾的 0」→ 先算 0 前面的数相乘；「掀开，添上 0」→ 盖了几个 0 就添几个；
          积本身末尾的 0 另说「要留着」，不算添的。
          cfg: a 第一个数（两位数或几百几十，默认 14；edit 时 11–99）；b 几十（默认 30；edit 时 20–90，每次 ±10）；
               edit 是否能调（默认 false）。
          例：{"a":13,"b":30,"edit":true}、{"a":25,"b":40}（积自己末尾有 0）。用在 p4a-u3-1。

   bianhua 积的变化（一个乘数不变）：原来的积画成一块；另一个乘数乘几就摆几块（乘 100 摆 100 小块），
          除以几就把一块平均分成几份取一份。一次只改一个乘数（都从原来的算式出发）；先想积，再点「看积」。
          除不尽的「除以几」按钮变灰。
          cfg: p、q 原来的两个乘数（默认 16、3）；ops 可选的变化（"*k" / "/k"，k 用 2–5、8、10、100；
               默认 ["*2","*3","*4","*10","/2"]）；which 先改第几个乘数（1 或 2，默认 2）。
          例：{"p":16,"q":3,"ops":["*2","*3","*4","*10","*100","/2","/4","/8"]}。用在 p4a-u3-5。

   calc   简单计算器（只做加、乘）：屏幕同时显示算式和结果，读数写出每个数有几位；结果超过 digits 位显示「显示不下了」。
          每个数最多输 10 位，用 BigInt 算。键盘：数字、* 或 x、+、回车或 =、退格、Esc（先点一下计算器）。
          cfg: digits 屏幕能显示几位（默认 12）。例：{"digits":12}。用在 p4a-u3-6。

   ones   几个 1 乘几个 1 的竖式（11 × 11、111 × 111……的规律）：每次乘得的都是一排 1，一排比一排往左挪一格；
          点一列（或聚焦后用左右方向键）数这一列有几个 1，积的这一位就写几。
          cfg: n 几个 1（2–6，默认 3）；edit 是否能调（默认 false）。例：{"n":3,"edit":true}。用在 p4a-u3-6。

   原来这些是 p3a-u4-5 / p3a-u4-7 / p4a-u3-1 / -2 / -5 / -6 / -7 页内的副本（data-ss="…"），教学用语、判对规则和读数未改；
   源码出处 primary/site/kits/p3a-u4-shushi/src/{panzi,kancheng}.js。新增的只有缺省值：kancheng 没给 cases、guji 没给 p/n/m 时
   用上面写的默认题（页内版本必须给）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var NS = "http://www.w3.org/2000/svg", P = window.PeiyuP, U = window.PeiyuManip.util;
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  var h = U.h, btn = U.btn, activate = U.activate, emit = U.emit, logI = U.log;
  function spoken(s) {
    return String(s).replace(/<[^>]+>/g, "").replace(/×/g, "乘").replace(/÷/g, "除以").replace(/=/g, "等于").replace(/\+/g, "加")
      .replace(/</g, "小于").replace(/>/g, "大于").replace(/……/g, "，");
  }
  /* 读数：和页内版本一样，朗读文字由读数文字自动转成（util.readout 要另给朗读文字，这里不用它） */
  function readout(node, html, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    var s = spoken(node.textContent);
    if (P && s.trim()) { var b = P.sayButton(s); b.addEventListener("click", function () { P.say(s, b); }); node.appendChild(b); }
  }
  function stepper(label, get, set, unit) {
    var w = h("span", "count"), b = h("b", "", "");
    var minus = btn("−", function () { set(get() - 1); }, "少一个：" + label), plus = btn("+", function () { set(get() + 1); }, "多一个：" + label);
    w.appendChild(h("span", "", label)); w.appendChild(minus); w.appendChild(b); w.appendChild(plus);
    if (unit) w.appendChild(h("span", "", unit));
    w.sync = function (canDown, canUp) { b.textContent = get(); minus.disabled = !canDown; plus.disabled = !canUp; };
    return w;
  }
  function emitAns(root, cfg, value, correct, first, suffix) {
    var kind = (root && root.getAttribute("data-manip")) || "chengfa";
    var all = document.querySelectorAll('.manip[data-manip="' + kind + '"]');
    var idx = [].indexOf.call(all, root);
    var qid = ((cfg && cfg.id) || (root && root.id) || (kind + (idx > 0 ? "-" + (idx + 1) : ""))) + (suffix ? "-" + suffix : "");
    root.setAttribute("data-lab-id", qid);
    var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(first) };
    try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
    if (P) P.log("lab", Object.assign({ _emitted: true }, detail));
  }

  /* ===== 盘子：几个盘子、每盘几个，都能调到 0 =====
     cfg: n（几个盘子，0–8）, k（每盘几个，0–5）, item（东西的名字，默认「个桃」）。
     读数同时写出连加和乘法：k + k + … = 积、k × n、n × k；有 0 时说清「一个也没有」。 */
  function panzi(root, cfg) {
    var init = { n: cfg.n == null ? 4 : cfg.n, k: cfg.k == null ? 2 : cfg.k }, st = Object.assign({ moves: 0, reported: false }, init);
    var svg = el("svg", { class: "stage", role: "img", "aria-label": "盘子" });
    var read = h("p", "read"), ctr = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(svg); root.appendChild(read); root.appendChild(ctr);
    var sn = ctr.appendChild(stepper("盘子", function () { return st.n; }, function (v) { if (v >= 0 && v <= 8) { st.n = v; st.moves++; draw(); logI("panzi-n", { n: v }); } }, "个"));
    var sk = ctr.appendChild(stepper("每盘", function () { return st.k; }, function (v) { if (v >= 0 && v <= 5) { st.k = v; st.moves++; draw(); logI("panzi-k", { k: v }); } }, "个"));
    ctr.appendChild(btn("重来", function () { st = Object.assign({ moves: 0, reported: false }, init); draw(); logI("reset"); }));
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var n = st.n, k = st.k, rows = n > 4 ? 2 : 1, HH = rows * 86 + 14;
      svg.setAttribute("viewBox", "0 0 360 " + HH);
      if (!n) el("text", { x: 180, y: 54, "text-anchor": "middle", style: "font-size:20px;fill:var(--muted)" }, svg, "一个盘子也没有");
      for (var i = 0; i < n; i++) {
        var col = i % 4, row = Math.floor(i / 4), cx = 50 + col * 87, cy = 60 + row * 86;
        el("ellipse", { cx: cx, cy: cy, rx: 38, ry: 14, style: "fill:var(--card);stroke:var(--fg);stroke-width:2.5" }, svg);
        el("ellipse", { cx: cx, cy: cy - 2, rx: 26, ry: 8, style: "fill:none;stroke:var(--line);stroke-width:2" }, svg);
        for (var j = 0; j < k; j++) {
          var px = cx - (Math.min(k, 3) - 1) * 11 + (j % 3) * 22, py = cy - 20 - Math.floor(j / 3) * 20;
          el("circle", { cx: px, cy: py, r: 10, style: "fill:var(--b);stroke:var(--fg);stroke-width:1.5" }, svg);
        }
      }
      var tot = n * k, lines = [];
      if (!n) lines.push("没有盘子，一共 0 个。", k + " × 0 = 0，0 × " + k + " = 0");
      else {
        lines.push(n + " 个盘子，每盘 " + k + " 个" + (k ? "" : "（一个也没有）") + "：");
        if (n > 1) lines.push(Array(n + 1).join(k + " + ").slice(0, -3) + " = " + tot + "（" + n + " 个 " + k + " 相加）");
        lines.push(k + " × " + n + " = " + tot + "，" + n + " × " + k + " = " + tot);
      }
      lines[lines.length - 1] = "<b>" + lines[lines.length - 1] + "</b>";
      readout(read, lines.join("<br>"), tot === 0 ? "ok" : "");
      if (st.moves > 0 && !st.reported) { st.reported = true; emitAns(root, cfg, n + "×" + k + "=" + tot, true, true); }
      read.style.flexDirection = "column";
      sn.sync(n > 0, n < 8); sk.sync(k > 0, k < 5);
      svg.setAttribute("aria-label", n + " 个盘子，每盘 " + k + " 个，一共 " + tot + " 个");
      emit(root, { n: n, k: k, total: tot });
    }
    draw();
  }

  /* ===== 「看成」滑块：用估算判断够不够 =====
     cfg: cases [{x, m, T, q:"题目", who:"人数"}]：x 是要估的乘数，m 是一位数，T 是带的钱（元）。
     拖动圆钮（或方向键、点数字）把 x 看成相邻的整十、整百、整千数，竖着写出三行推理（只用 < 、>，不写约等号），
     结论是「一定够 / 一定不够 / 说不准」三种之一；说不准时提示换个方向估。 */
  function kancheng(root, cfg) {
    var cases = cfg.cases && cfg.cases.length ? cfg.cases : [{ x: 788, m: 6, T: 5000, q: "788 名同学，每人 6 元，5000 元够不够？" }], ci = 0, st = {}, firstTry = true, reported = false;
    var qp = h("p", "line"), svg = el("svg", { class: "stage", viewBox: "0 0 360 126", role: "group", "aria-label": "看成" });
    var read = h("div", "read"), ctr = h("div", "ctrls");
    read.setAttribute("aria-live", "polite"); read.style.flexDirection = "column";
    root.appendChild(qp); root.appendChild(svg); root.appendChild(read); root.appendChild(ctr);
    var caseBtns = cases.length > 1 ? cases.map(function (c, i) { return ctr.appendChild(btn("题 " + (i + 1), function () { ci = i; firstTry = true; setup(); logI("kancheng-case", { i: i }); })); }) : [];
    ctr.appendChild(btn("重来", function () { setup(); logI("reset"); }));
    function stopsOf(x) {
      var n = String(x).length, out = [];
      [Math.pow(10, n - 1), Math.pow(10, n)].forEach(function (u) {
        [Math.floor(x / u) * u, Math.ceil(x / u) * u].forEach(function (v) { if (v > 0 && v !== x && out.indexOf(v) < 0) out.push(v); });
      });
      out.push(x);
      return out.sort(function (p, q) { return p - q; });
    }
    function setup() {
      var c = cases[ci];
      st = { c: c, items: stopsOf(c.x) }; st.at = st.items.indexOf(c.x); reported = false;
      qp.innerHTML = c.q;
      if (P) { var b = P.sayButton(spoken(c.q)); b.addEventListener("click", function () { P.say(spoken(c.q), b); }); qp.appendChild(b); }
      caseBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === ci ? "true" : "false"); });
      draw();
    }
    var X0 = 40, X1 = 320;
    function xi(i) { return st.items.length < 2 ? 180 : X0 + (X1 - X0) * i / (st.items.length - 1); }
    var knob;
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var c = st.c, items = st.items;
      el("line", { x1: X0, x2: X1, y1: 40, y2: 40, style: "stroke:var(--line);stroke-width:6;stroke-linecap:round" }, svg);
      items.forEach(function (v, i) {
        var real = v === c.x, on = i === st.at;
        var g = el("g", { tabindex: real ? "-1" : "0", role: "button", "aria-label": real ? "实际是 " + v : "看成 " + v, style: "cursor:pointer" }, svg);
        el("rect", { x: xi(i) - 34, y: 62, width: 68, height: 34, rx: 8, style: "fill:" + (real ? "var(--no-soft)" : on ? "var(--ok-soft)" : "var(--card)") + ";stroke:" + (real ? "var(--no)" : on ? "var(--a)" : "var(--line)") + ";stroke-width:2" }, g);
        el("text", { x: xi(i), y: 86, "text-anchor": "middle", style: "font-size:19px;font-weight:700;fill:" + (real ? "var(--no)" : "var(--fg)") }, g, v);
        if (real) el("text", { x: xi(i), y: 116, "text-anchor": "middle", style: "font-size:15px;fill:var(--no)" }, g, "实际");
        if (!real) activate(g, function () { set(i); });
      });
      knob = el("g", { tabindex: "0", role: "slider", "aria-label": "看成几", "aria-valuetext": st.items[st.at] === c.x ? "还没看成" : "看成 " + st.items[st.at], style: "cursor:ew-resize;touch-action:none" }, svg);
      el("circle", { cx: xi(st.at), cy: 40, r: 22, style: "fill:transparent" }, knob);
      el("circle", { cx: xi(st.at), cy: 40, r: 14, style: "fill:var(--a);stroke:var(--card);stroke-width:3" }, knob);
      knob.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { set(st.at - 1, true); e.preventDefault(); }
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { set(st.at + 1, true); e.preventDefault(); }
      });
      knob.addEventListener("pointerdown", function (ev) { st.drag = true; knob.setPointerCapture(ev.pointerId); ev.preventDefault(); });
      knob.addEventListener("pointermove", function (ev) {
        if (!st.drag) return;
        var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 360;
        if (!r.width) return;
        var i = Math.round((x - X0) / (X1 - X0) * (st.items.length - 1));
        i = Math.max(0, Math.min(st.items.length - 1, i));
        if (i !== st.at) { st.at = i; drawKeep(); }
      });
      knob.addEventListener("pointerup", function () { if (st.drag) { st.drag = false; draw(); logI("kancheng", { see: st.items[st.at] }); checkKancheng(); } });
      say();
    }
    function drawKeep() { /* 拖动中只挪圆钮和读数，不重建圆钮（保住 pointer capture） */
      [].forEach.call(knob.querySelectorAll("circle"), function (cc) { cc.setAttribute("cx", xi(st.at)); });
      say();
    }
    function checkKancheng() {
      var c = st.c, s = st.items[st.at], e = s * c.m, suf = cases.length > 1 ? String(ci) : "";
      if (s === c.x) return;
      var ok = (s > c.x && e <= c.T) || (s < c.x && e >= c.T);
      if (ok) { if (!reported) { reported = true; emitAns(root, cfg, String(s), true, firstTry, suf); } }
      else { emitAns(root, cfg, String(s), false, firstTry, suf); firstTry = false; }
    }
    function set(i, focus) {
      i = Math.max(0, Math.min(st.items.length - 1, i));
      st.at = i; draw(); logI("kancheng", { see: st.items[i] }); checkKancheng();
      if (focus) knob.focus();
    }
    function say() {
      var c = st.c, s = st.items[st.at], e = s * c.m, L = [], res = "", cls = "";
      if (s === c.x) { readout(read, "把 " + c.x + " 往大或往小看成一个整" + (String(c.x).length > 2 ? "百" : "十") + "数：拖一拖圆钮，或者点上面的数。"); return; }
      if (s > c.x) {
        L.push(c.x + " &lt; " + s + "（往大估）", s + " × " + c.m + " = " + e);
        if (e <= c.T) { L.push(e + (e < c.T ? " &lt; " : " = ") + c.T + "，所以 " + c.x + " × " + c.m + " &lt; " + c.T); res = "一定够"; cls = "ok"; }
        else { L.push(e + " &gt; " + c.T); res = "说不准：往大估超过了，实际可能够，也可能不够。换个方向估。"; cls = ""; }
      } else {
        L.push(c.x + " &gt; " + s + "（往小估）", s + " × " + c.m + " = " + e);
        if (e >= c.T) { L.push(e + (e > c.T ? " &gt; " : " = ") + c.T + "，所以 " + c.x + " × " + c.m + " &gt; " + c.T); res = "一定不够"; cls = "ok"; }
        else { L.push(e + " &lt; " + c.T); res = "说不准：往小估还没到 " + c.T + "，实际比它多，可能够，也可能不够。换个方向估。"; cls = ""; }
      }
      readout(read, L.join("<br>") + "<br><b>" + res + "</b>", cls);
      emit(root, { x: c.x, see: s, result: res.slice(0, 4) });
    }
    if (cases.length) setup();
  }

  /* ===== 点子图（两位数乘两位数的道理） =====
     每行 a 个点，b 行（b 是 11–19），第 10 行下面一条虚线，分成「10 行」和「几行」。
     cfg: a, b；edit true 能调。「圈下面几行」= 第一次乘得的数，「圈上面 10 行」= 第二次乘得的数，都圈了自动合起来。 */
  function dianzi(root, cfg) {
    var st, init = { a: cfg.a || 21, b: cfg.b || 14 };
    var svg = el("svg", { class: "stage", role: "img", "aria-label": "点子图" });
    var read = h("p", "read"), ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(svg); root.appendChild(read); root.appendChild(ctr); root.appendChild(ctr2);
    function reset(k) { st = Object.assign({}, k || init, { lo: false, up: false, reported: false }); }
    var bLo = ctr.appendChild(btn("", function () { st.lo = !st.lo; draw(); logI("dz-lo"); }));
    var bUp = ctr.appendChild(btn("圈上面 10 行", function () { st.up = !st.up; draw(); logI("dz-up"); }));
    ctr2.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    var sa, sb;
    if (cfg.edit) {
      sa = ctr2.appendChild(stepper("每行", function () { return st.a; }, function (v) { if (v >= 11 && v <= 24) { reset({ a: v, b: st.b }); draw(); } }, "个"));
      sb = ctr2.appendChild(stepper("行数", function () { return st.b; }, function (v) { if (v >= 11 && v <= 19) { reset({ a: st.a, b: v }); draw(); } }, "行"));
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var a = st.a, b = st.b, n = b - 10, sp = Math.min(13, Math.floor(270 / a)), x0 = 14, y0 = 14, gap = 14;
      var ry = function (r) { return y0 + r * sp + (r >= 10 ? gap : 0); };
      var H = ry(b - 1) + sp + 28; // 页内版本是 ry(b - 1) + 26：每行超过 20 个时点变小，底下那行字会被「圈下面几行」的框压住
      svg.setAttribute("viewBox", "0 0 360 " + H);
      for (var r = 0; r < b; r++) for (var c = 0; c < a; c++)
        el("circle", { cx: x0 + c * sp + sp / 2, cy: ry(r) + sp / 2, r: Math.max(3, sp / 2 - 2), style: "fill:" + (r < 10 ? (st.up ? "var(--c)" : "var(--fg)") : (st.lo ? "var(--b)" : "var(--fg)")) }, svg);
      var yl = ry(10) - gap / 2;
      el("line", { x1: x0 - 6, x2: x0 + a * sp + 6, y1: yl, y2: yl, style: "stroke:var(--no);stroke-width:2;stroke-dasharray:7 5" }, svg);
      var xr = x0 + a * sp + 12;
      if (st.up) {
        el("rect", { x: x0 - 5, y: y0 - 5, width: a * sp + 10, height: 10 * sp + 8, rx: 8, style: "fill:none;stroke:var(--c);stroke-width:2.5" }, svg);
        el("text", { x: xr, y: y0 + 5 * sp + 6, style: "font-size:17px;font-weight:700;fill:var(--c)" }, svg, "10 行");
      }
      if (st.lo) {
        el("rect", { x: x0 - 5, y: ry(10) - 4, width: a * sp + 10, height: n * sp + 8, rx: 8, style: "fill:none;stroke:var(--b);stroke-width:2.5" }, svg);
        el("text", { x: xr, y: ry(10) + n * sp / 2 + 6, style: "font-size:17px;font-weight:700;fill:var(--b)" }, svg, n + " 行");
      }
      el("text", { x: x0, y: H - 8, style: "font-size:16px;fill:var(--muted)" }, svg, "每行 " + a + " 个，一共 " + b + " 行");
      var lines = [];
      if (st.lo) lines.push('<span style="color:var(--b)">下面 ' + n + " 行：" + a + " × " + n + " = " + a * n + "</span>");
      if (st.up) lines.push('<span style="color:var(--c)">上面 10 行：' + a + " × 10 = " + a * 10 + "</span>");
      if (st.lo && st.up) lines.push("<b>合起来：" + a * n + " + " + a * 10 + " = " + a * b + "，就是 " + a + " × " + b + " = " + a * b + "</b>");
      if (!lines.length) lines.push(a + " × " + b + "：每行 " + a + " 个，有 " + b + " 行。" + b + " 行分成 10 行和 " + n + " 行，分开圈一圈。");
      readout(read, lines.join("<br>"), st.lo && st.up ? "ok" : "");
      if (st.lo && st.up && !st.reported) { st.reported = true; emitAns(root, cfg, a + "×" + b + "=" + (a * b), true, true); }
      bLo.textContent = "圈下面 " + n + " 行";
      bLo.setAttribute("aria-pressed", st.lo ? "true" : "false"); bUp.setAttribute("aria-pressed", st.up ? "true" : "false");
      if (sa) { sa.sync(st.a > 11, st.a < 24); sb.sync(st.b > 11, st.b < 19); }
      svg.setAttribute("aria-label", "点子图：每行 " + a + " 个点，" + b + " 行，分成上面 10 行和下面 " + n + " 行");
      emit(root, { a: a, b: b, lo: st.lo, up: st.up });
    }
    reset(); draw();
  }

  /* ===== 乘整十数口算的遮板 =====
     cfg: a（两位数或几百几十）, b（几十）；edit true 能调两个数。
     「盖住末尾的 0」→ 先算 0 前面的数相乘；「掀开，添上 0」→ 盖了几个 0 就添几个。积本身末尾的 0 用另一种颜色标出，不算添的。 */
  function koushuan(root, cfg) {
    var st, init = { a: cfg.a || 14, b: cfg.b || 30 };
    var box = h("div", ""), read = h("p", "read"), ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls");
    box.style.cssText = "text-align:center;font-size:32px;font-weight:700;line-height:1.7;font-variant-numeric:tabular-nums";
    read.setAttribute("aria-live", "polite");
    root.appendChild(box); root.appendChild(read); root.appendChild(ctr); root.appendChild(ctr2);
    function tz(n) { var z = 0; while (n >= 10 && n % 10 === 0) { n /= 10; z++; } return z; }
    function reset(k) { st = Object.assign({}, k || init, { s: 0, reported: false }); }
    var bCover = ctr.appendChild(btn("盖住末尾的 0", function () { st.s = 1; draw(); logI("ks-cover"); }));
    var bOpen = ctr.appendChild(btn("掀开，添上 0", function () { st.s = 2; draw(); logI("ks-open"); }));
    ctr.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    var sa, sb;
    if (cfg.edit) {
      sa = ctr2.appendChild(stepper("第一个数", function () { return st.a; }, function (v) { if (v >= 11 && v <= 99) { reset({ a: v, b: st.b }); draw(); } }));
      sb = ctr2.appendChild(stepper("几十", function () { return st.b; }, function (v) { v = st.b + (v > st.b ? 10 : -10); if (v >= 20 && v <= 90) { reset({ a: st.a, b: v }); draw(); } }));
    }
    function part(n, cover) {
      var z = tz(n), core = String(n / Math.pow(10, z)), zs = "";
      for (var i = 0; i < z; i++) zs += "0";
      if (!z) return core;
      return core + '<span style="display:inline-block;border-radius:8px;padding:0 2px;' + (cover ? "background:var(--c);color:var(--c)" : "color:var(--c)") + '">' + zs + "</span>";
    }
    function draw() {
      var a = st.a, b = st.b, za = tz(a), zb = tz(b), S = za + zb, ca = a / Math.pow(10, za), cb = b / Math.pow(10, zb), pc = ca * cb, own = tz(pc), P = a * b;
      var lines = ['<div>' + part(a, st.s === 1) + " × " + part(b, st.s === 1) + " = " + (st.s === 2 ? String(pc) + '<span style="color:var(--c)">' + new Array(S + 1).join("0") + "</span>" : "?") + "</div>"];
      if (st.s >= 1) lines.push('<div style="font-size:26px;color:var(--b)">先算 ' + ca + " × " + cb + " = " + pc + "</div>");
      box.innerHTML = lines.join("");
      var t;
      if (st.s === 0) t = "末尾有 0 的乘法：先把末尾的 0 盖住。";
      else if (st.s === 1) t = "盖住了 " + S + " 个 0，先算 " + ca + " × " + cb + " = " + pc + (own ? "。" + pc + " 末尾自己就有 " + own + " 个 0，要留着。" : "。") + "再掀开。";
      else t = "盖了几个 0，就添几个：" + pc + " 后面添 " + S + " 个 0，" + a + " × " + b + " = " + P + "。" + (own ? "积的末尾一共有 " + (own + S) + " 个 0。" : "");
      readout(read, t, st.s === 2 ? "ok" : "");
      if (st.s === 2 && !st.reported) { st.reported = true; emitAns(root, cfg, a + "×" + b + "=" + P, true, true); }
      bCover.hidden = st.s !== 0; bOpen.hidden = st.s !== 1;
      if (sa) { sa.sync(st.a > 11, st.a < 99); sb.sync(st.b > 20, st.b < 90); }
      emit(root, { a: a, b: b, s: st.s });
    }
    reset(); draw();
  }

  /* ===== 积的变化（一个乘数不变） =====
     原来的积画成一块；另一个乘数乘几，就摆几块；除以几，就把一块平均分成几份取一份。
     cfg: p, q（原来的两个乘数）；ops ["*2","*4","*10","/2"]（只用 2–5、8、10、100）；which 1|2 先改哪一个乘数。
     一次只改一个乘数（从原来的算式出发）；先想积，再点「看积」。 */
  function bianhua(root, cfg) {
    var p0 = cfg.p || 16, q0 = cfg.q || 3, P0 = p0 * q0, ops = cfg.ops || ["*2", "*3", "*4", "*10", "/2"], st;
    var svg = el("svg", { class: "stage", role: "img", "aria-label": "积的变化" });
    var read = h("p", "read"), c1 = h("div", "ctrls"), c2 = h("div", "ctrls"), c3 = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(svg); root.appendChild(read); root.appendChild(c1); root.appendChild(c2); root.appendChild(c3);
    function reset() { st = { w: cfg.which || 2, op: null, show: false, reported: false }; }
    var bW1 = c1.appendChild(btn("改第一个乘数", function () { st.w = 1; st.op = null; st.show = false; st.reported = false; draw(); }));
    var bW2 = c1.appendChild(btn("改第二个乘数", function () { st.w = 2; st.op = null; st.show = false; st.reported = false; draw(); }));
    var opBtns = ops.map(function (o) {
      var k = +o.slice(1), mul = o.charAt(0) === "*";
      var b = c2.appendChild(btn((mul ? "乘 " : "除以 ") + k, function () { st.op = o; st.show = false; st.reported = false; draw(); logI("bh-op", { op: o, w: st.w }); }));
      b.op = o; return b;
    });
    var bShow = c3.appendChild(btn("看积", function () { st.show = true; draw(); logI("bh-show", { op: st.op }); }));
    c3.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    function ok(o) { var k = +o.slice(1); return o.charAt(0) === "*" || (st.w === 1 ? p0 : q0) % k === 0; }
    function tile(x, y, w, hh, label, col, fs) {
      el("rect", { x: x, y: y, width: w, height: hh, rx: 4, style: "fill:" + col + ";stroke:var(--fg);stroke-width:1.5" }, svg);
      if (label) el("text", { x: x + w / 2, y: y + hh / 2 + fs * 0.35, "text-anchor": "middle", style: "font-size:" + fs + "px;font-weight:700;fill:var(--fg)" }, svg, label);
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var o = st.op, k = o ? +o.slice(1) : 1, mul = !o || o.charAt(0) === "*";
      var p = st.w === 1 ? (mul ? p0 * k : p0 / k) : p0, q = st.w === 2 ? (mul ? q0 * k : q0 / k) : q0, Pn = p * q;
      el("text", { x: 12, y: 26, style: "font-size:20px;fill:var(--fg)" }, svg, "原来：" + p0 + " × " + q0 + " = " + P0);
      tile(12, 38, 72, 44, String(P0), "var(--hl-soft)", 18);
      var y = 112, H = 130;
      if (o) {
        el("text", { x: 12, y: y, style: "font-size:20px;fill:var(--fg)" }, svg, "现在：" + p + " × " + q + " = " + (st.show ? Pn : "？"));
        var top = y + 12;
        if (mul && k <= 10) {
          var per = k <= 5 ? k : 5, w = 62, gh = 40;
          for (var i = 0; i < k; i++) tile(12 + (i % per) * (w + 6), top + Math.floor(i / per) * (gh + 6), w, gh, String(P0), "var(--hl-soft)", 16);
          H = top + Math.ceil(k / per) * (gh + 6) + 8;
        } else if (mul) {
          for (var j = 0; j < 100; j++) tile(12 + (j % 20) * 16, top + Math.floor(j / 20) * 16, 13, 13, "", "var(--hl-soft)", 0);
          el("text", { x: 12, y: top + 5 * 16 + 20, style: "font-size:17px;fill:var(--muted)" }, svg, "100 块，每块都是 " + P0);
          H = top + 5 * 16 + 30;
        } else {
          var W = 300, part = W / k;
          for (var t = 0; t < k; t++) tile(12 + t * part, top, part, 44, "", t === 0 ? "var(--hl-soft)" : "var(--card)", 0);
          el("rect", { x: 12, y: top, width: W, height: 44, rx: 4, style: "fill:none;stroke:var(--fg);stroke-width:2.5" }, svg);
          el("text", { x: 12, y: top + 70, style: "font-size:17px;fill:var(--muted)" }, svg, "原来那一块平均分成 " + k + " 份，取 1 份");
          H = top + 84;
        }
      }
      svg.setAttribute("viewBox", "0 0 360 " + H);
      var who = st.w === 1 ? "第一个乘数" : "第二个乘数", from = st.w === 1 ? p0 : q0, to = st.w === 1 ? p : q, t2;
      if (!o) t2 = "先选改哪个乘数，再选乘几或除以几。另一个乘数不变。";
      else if (!st.show) t2 = "现在是 " + p + " × " + q + "。" + who + " " + from + (mul ? " 乘 " : " 除以 ") + k + " 变成 " + to + "，积是多少？先想一想，再点「看积」。";
      else t2 = who + " " + from + (mul ? " 乘 " : " 除以 ") + k + "，积也" + (mul ? "乘 " : "除以 ") + k + "：" + P0 + (mul ? " × " : " ÷ ") + k + " = " + Pn + "。";
      readout(read, t2, st.show ? "ok" : "");
      if (o && st.show && !st.reported) { st.reported = true; emitAns(root, cfg, p + "×" + q + "=" + Pn, true, true); }
      bW1.setAttribute("aria-pressed", st.w === 1 ? "true" : "false"); bW2.setAttribute("aria-pressed", st.w === 2 ? "true" : "false");
      opBtns.forEach(function (b) { b.disabled = !ok(b.op); b.setAttribute("aria-pressed", st.op === b.op ? "true" : "false"); });
      bShow.hidden = !o || st.show;
      svg.setAttribute("aria-label", "原来 " + p0 + " 乘 " + q0 + (o ? "，现在 " + p + " 乘 " + q : ""));
      emit(root, { p: p, q: q, op: o, show: st.show });
    }
    reset(); draw();
  }

  /* ===== 简单计算器（只做加、乘） =====
     屏幕上同时显示按下的算式和结果，还写出每个数有几位（看清自己按了几个 1）；结果超过 12 位就「显示不下了」。
     cfg: digits（显示几位，默认 12）。键盘：数字、* 或 x、+、回车或 =、退格、Esc。 */
  function calc(root, cfg) {
    var MAXD = cfg.digits || 12, st;
    var scr = h("div", ""), read = h("p", "read"), grid = h("div", "");
    scr.style.cssText = "background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:8px 14px;text-align:right;font-variant-numeric:tabular-nums;max-width:360px;margin:0 auto;overflow-wrap:anywhere";
    grid.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:10px auto 0";
    grid.className = "ctrls"; read.setAttribute("aria-live", "polite");
    scr.setAttribute("aria-live", "polite"); scr.setAttribute("tabindex", "0"); scr.setAttribute("role", "group"); scr.setAttribute("aria-label", "计算器屏幕");
    root.appendChild(scr); root.appendChild(grid); root.appendChild(read);
    var attempts = 0;
    function reset() { st = { a: "", op: "", b: "", res: null, reported: false }; }
    ["7", "8", "9", "×", "4", "5", "6", "+", "1", "2", "3", "=", "0", "⌫", "C"].forEach(function (k) {
      var b = grid.appendChild(btn(k, function () { press(k); }, k === "⌫" ? "删掉一位" : k === "C" ? "清除" : k === "=" ? "等于" : k === "×" ? "乘" : k === "+" ? "加" : null));
      b.style.fontSize = "22px";
      if (k === "C") b.style.gridColumn = "span 2";
    });
    function press(k) {
      if (/^[0-9]$/.test(k)) {
        if (st.res !== null) reset();
        var f = st.op ? "b" : "a";
        if (st[f].length >= 10 || (st[f] === "0")) {
          if (st[f] === "0" && k !== "0") { st[f] = k; st.reported = false; }
          return draw();
        }
        st[f] += k;
        st.reported = false;
      } else if (k === "×" || k === "+") {
        if (st.res !== null) { if (st.res.length > 10) return draw(); st.a = st.res; st.b = ""; st.res = null; st.reported = false; }
        if (st.a && !st.b) { if (st.op !== k) st.reported = false; st.op = k; }
      } else if (k === "=") {
        if (st.a && st.op && st.b) {
          st.res = String(st.op === "×" ? BigInt(st.a) * BigInt(st.b) : BigInt(st.a) + BigInt(st.b));
          logI("calc", { e: st.a + st.op + st.b });
          if (!st.reported) {
            st.reported = true;
            attempts += 1;
            emitAns(root, cfg, st.a + st.op + st.b + "=" + st.res, true, attempts === 1);
          }
        }
      } else if (k === "⌫") {
        if (st.res !== null) st.res = null;
        else if (st.b) { st.b = st.b.slice(0, -1); st.reported = false; }
        else if (st.op) { st.op = ""; st.reported = false; }
        else if (st.a) { st.a = st.a.slice(0, -1); st.reported = false; }
      } else if (k === "C") reset();
      draw();
    }
    function draw() {
      var e = (st.a || "0") + (st.op ? " " + st.op + " " + st.b : ""), r = "", t = "";
      if (st.res !== null) {
        var rs = String(st.res);
        r = rs.length > MAXD ? '<span style="font-size:20px;color:var(--no)">显示不下了</span>' : rs;
        t = rs.length > MAXD ? "结果有 " + rs.length + " 位，这个计算器只能显示 " + MAXD + " 位。位数多了，要靠规律。" : "结果有 " + rs.length + " 位。";
      }
      scr.innerHTML = '<div style="font-size:24px;min-height:1.4em;color:var(--muted)">' + e + (st.res !== null ? " =" : "") + '</div><div style="font-size:32px;font-weight:700;min-height:1.3em">' + r + "</div>";
      var n = [];
      if (st.a) n.push("第一个数 " + st.a.length + " 位");
      if (st.b) n.push("第二个数 " + st.b.length + " 位");
      readout(read, (n.length ? n.join("，") + "。" : "按数字，再按 × 或 +，再按数字和 =。") + t);
      emit(root, { a: st.a, op: st.op, b: st.b, res: st.res });
    }
    root.addEventListener("keydown", function (e) {
      var m = { "*": "×", x: "×", X: "×", "+": "+", Enter: "=", "=": "=", Backspace: "⌫", Escape: "C" };
      if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
      else if (m[e.key] && !(e.key === "Enter" && e.target.tagName === "BUTTON")) { press(m[e.key]); e.preventDefault(); }
    });
    reset(); draw();
  }
  /* ===== 几个 1 乘几个 1 的竖式 =====
     每一次乘得的数都是一排 1，一排比一排往左挪一格；点一列（或用方向键）数这一列有几个 1。
     cfg: n（几个 1，2–6），edit true 能调。 */
  function ones(root, cfg) {
    var st, init = cfg.n || 3;
    var svg = el("svg", { class: "stage", role: "group", "aria-label": "竖式", tabindex: "0" });
    var read = h("p", "read"), ctr = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(svg); root.appendChild(read); root.appendChild(ctr);
    function reset(n) { st = { n: n || init, col: -1, reported: false }; }
    var sn = cfg.edit ? ctr.appendChild(stepper("几个 1", function () { return st.n; }, function (v) { if (v >= 2 && v <= 6) { reset(v); draw(); logI("ones-n", { n: v }); } })) : null;
    ctr.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    function count(n, c) { var k = 0; for (var r = 0; r < n; r++) if (c >= r && c < r + n) k++; return k; }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var n = st.n, nc = 2 * n - 1, CW = 26, W = 360, ox = W / 2 + (nc - 1) * CW / 2, X = function (c) { return ox - c * CW; };
      var y = 32, ones = new Array(n + 1).join("1");
      function row(str, shift, yy, col) { str.split("").reverse().forEach(function (d, j) { el("text", { x: X(j + shift), y: yy, "text-anchor": "middle", style: "font-size:24px;font-weight:700;fill:" + col }, svg, d); }); }
      if (st.col >= 0) el("rect", { x: X(st.col) - CW / 2 + 1, y: 4, width: CW - 2, height: 1, rx: 6, style: "fill:var(--hl-soft)" }, svg).id = "hlr";
      row(ones, 0, y, "var(--fg)"); y += 30;
      el("text", { x: X(Math.max(n, 2)) - 4, y: y, "text-anchor": "middle", style: "font-size:22px;fill:var(--fg)" }, svg, "×");
      row(ones, 0, y, "var(--fg)"); y += 12;
      el("line", { x1: X(nc - 1) - CW / 2, x2: X(0) + CW / 2, y1: y, y2: y, style: "stroke:var(--fg);stroke-width:2" }, svg); y += 30;
      var yTop = y - 24;
      for (var r = 0; r < n; r++) { row(ones, r, y, r % 2 ? "var(--c)" : "var(--b)"); y += 28; }
      y -= 16;
      el("line", { x1: X(nc - 1) - CW / 2, x2: X(0) + CW / 2, y1: y, y2: y, style: "stroke:var(--fg);stroke-width:2" }, svg); y += 30;
      var prod = ""; for (var c = nc - 1; c >= 0; c--) prod += count(n, c);
      row(prod, 0, y, "var(--a)");
      var H = y + 12;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      var hr = svg.querySelector("#hlr");
      if (hr) { hr.setAttribute("y", yTop); hr.setAttribute("height", H - yTop - 2); hr.removeAttribute("id"); }
      for (var c2 = 0; c2 < nc; c2++) (function (cc) {
        var hit = el("rect", { x: X(cc) - CW / 2, y: yTop, width: CW, height: H - yTop, style: "fill:transparent;cursor:pointer" }, svg);
        hit.addEventListener("click", function () { st.col = cc; draw(); logI("ones-col", { c: cc }); });
      })(c2);
      var t = ones + " × " + ones + "：一共 " + n + " 排 1，一排比一排往左挪一格。";
      if (st.col >= 0) {
        var k = count(n, st.col);
        t = "这一列有 " + k + " 个 1，加起来是 " + k + "，积的这一位就写 " + k + "。";
        if (!st.reported) { st.reported = true; emitAns(root, cfg, ones + "×" + ones + "=" + prod, true, true); }
      }
      else t += "点一列，数一数有几个 1。";
      readout(read, t);
      if (sn) sn.sync(st.n > 2, st.n < 6);
      svg.setAttribute("aria-label", ones + " 乘 " + ones + " 的竖式，积是 " + prod + "。用左右方向键一列一列地数。");
      emit(root, { n: n, col: st.col });
    }
    svg.addEventListener("keydown", function (e) {
      var nc = 2 * st.n - 1;
      if (e.key === "ArrowLeft") { st.col = Math.min(nc - 1, st.col + 1); draw(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { st.col = Math.max(0, st.col < 0 ? 0 : st.col - 1); draw(); e.preventDefault(); }
    });
    reset(); draw();
  }

  /* ===== 估一估够不够（往大估 / 往小估） =====
     每个乘数下面一个按钮：不动 → 往大估 → 往小估（估成整十数）；数线上标出带的钱、估出的数，「精算」后标出真的数。
     都往大估（或不动）：估出的数不超过带的钱 → 一定够；都往小估（或不动）：估出的数已经超过 → 一定不够；其余判断不了。
     cfg: p（每份多少）, n（几份）, m（带的钱）, u（单位，默认「元」）。 */
  function guji(root, cfg) {
    var p = cfg.p || 98, n = cfg.n || 24, m = cfg.m || 3000, u = cfg.u || "元", exact = p * n, st, firstTry = true, reported = false;
    var svg = el("svg", { class: "stage", role: "img", "aria-label": "数线" });
    var read = h("p", "read"), c1 = h("div", "ctrls"), c2 = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(c1); root.appendChild(svg); root.appendChild(read); root.appendChild(c2);
    var NAME = ["不动", "往大估", "往小估"];
    function up(x) { return x % 10 ? Math.ceil(x / 10) * 10 : x; }
    function dn(x) { return Math.floor(x / 10) * 10; }
    function est(x, s) { return s === 1 ? up(x) : s === 2 ? dn(x) : x; }
    function reset() { st = { sp: 0, sn: 0, marks: [], exact: false }; reported = false; }
    var bp = c1.appendChild(btn("", function () { st.sp = (st.sp + 1) % 3; if (st.sp === 1 && up(p) === p) st.sp = 2; if (st.sp === 2 && dn(p) === p) st.sp = 0; draw(); }));
    var bn = c1.appendChild(btn("", function () { st.sn = (st.sn + 1) % 3; if (st.sn === 1 && up(n) === n) st.sn = 2; if (st.sn === 2 && dn(n) === n) st.sn = 0; draw(); }));
    var bGo = c1.appendChild(btn("估一估", function () { go(); }));
    c2.appendChild(btn("精算", function () { st.exact = true; draw(); logI("guji-exact"); }));
    c2.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    function verdict(sp, sn) {
      var v = est(p, sp) * est(n, sn), anyUp = sp === 1 || sn === 1, anyDn = sp === 2 || sn === 2;
      if (!anyUp && !anyDn) return { v: v, t: "两个数都没估，这就是精算。", c: v <= m ? "够" : "不够" };
      if (anyUp && anyDn) return { v: v, t: "一个往大估、一个往小估，估出的数比真的大还是小说不准，判断不了。", c: "" };
      if (anyUp) return v <= m ? { v: v, t: "往大估了还不超过 " + m + " " + u + "，真的只会更少，<b>一定够</b>。", c: "够" }
        : { v: v, t: "往大估超过了 " + m + " " + u + "，可真的比 " + v + " 少，可能够，也可能不够：<b>判断不了</b>，换个估法或者精算。", c: "" };
      return v > m ? { v: v, t: "往小估已经超过了 " + m + " " + u + "，真的只会更多，<b>一定不够</b>。", c: "不够" }
        : { v: v, t: "往小估没超过 " + m + " " + u + "，可真的比 " + v + " 多，<b>判断不了</b>，换个估法或者精算。", c: "" };
    }
    function go() {
      if (!st.sp && !st.sn) { st.exact = true; draw(); return; }
      var r = verdict(st.sp, st.sn);
      st.marks = st.marks.filter(function (k) { return k.v !== r.v; });
      st.marks.push({ v: r.v, up: (st.sp === 1 || st.sn === 1) && !(st.sp === 2 || st.sn === 2), dn: (st.sp === 2 || st.sn === 2) && !(st.sp === 1 || st.sn === 1), e: est(p, st.sp) + " × " + est(n, st.sn) });
      st.last = r; draw(); logI("guji", { sp: st.sp, sn: st.sn });
      if (r.c) { if (!reported) { reported = true; emitAns(root, cfg, r.c + ":" + r.v, true, firstTry); } }
      else { emitAns(root, cfg, "unsure:" + r.v, false, firstTry); firstTry = false; }
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var lo = Math.min(dn(p) * dn(n), m, exact), hi = Math.max(up(p) * up(n), m, exact), pad = (hi - lo) * 0.12 + 1;
      var a0 = lo - pad, a1 = hi + pad, L = 24, R = 336, X = function (v) { return L + (v - a0) / (a1 - a0) * (R - L); };
      svg.setAttribute("viewBox", "0 0 360 150");
      el("line", { x1: L, x2: R, y1: 80, y2: 80, style: "stroke:var(--fg);stroke-width:2.5" }, svg);
      el("line", { x1: X(m), x2: X(m), y1: 40, y2: 120, style: "stroke:var(--c);stroke-width:3" }, svg);
      el("text", { x: Math.min(Math.max(X(m), 70), 290), y: 32, "text-anchor": "middle", style: "font-size:17px;font-weight:700;fill:var(--c)" }, svg, "带了 " + m);
      st.marks.forEach(function (k, i) {
        var col = k.up ? "var(--no)" : k.dn ? "var(--b)" : "var(--muted)", x = X(k.v), below = i % 2 === 0;
        el("circle", { cx: x, cy: 80, r: 7, style: "fill:" + col }, svg);
        el("text", { x: Math.min(Math.max(x, 50), 310), y: below ? 108 : 64, "text-anchor": "middle", style: "font-size:16px;fill:" + col }, svg, (k.up ? "估大 " : k.dn ? "估小 " : "") + k.v);
      });
      if (st.exact) {
        var xe = X(exact);
        el("path", { d: "M" + xe + " 70 l7 10 l-7 10 l-7 -10 Z", style: "fill:var(--a)" }, svg);
        el("text", { x: Math.min(Math.max(xe, 50), 310), y: 140, "text-anchor": "middle", style: "font-size:16px;font-weight:700;fill:var(--a)" }, svg, "真的 " + exact);
      }
      bp.textContent = p + "：" + NAME[st.sp]; bn.textContent = n + "：" + NAME[st.sn];
      bGo.textContent = !st.sp && !st.sn ? "直接算" : "估一估";
      var t = "选一选每个数怎么估，再点「估一估」。";
      if (st.last && st.marks.length) t = st.marks[st.marks.length - 1].e + " = " + st.last.v + "（" + u + "）。" + st.last.t;
      if (st.exact) t = (st.last ? t + "<br>" : "") + "精算：" + p + " × " + n + " = " + exact + "（" + u + "），" + (exact < m ? m + " > " + exact + "，够。" : exact === m ? "正好是 " + m + "，够。" : exact + " > " + m + "，不够。");
      readout(read, t, "");
      svg.setAttribute("aria-label", "数线：带了 " + m + (st.marks.length ? "，估出 " + st.marks.map(function (k) { return k.v; }).join("、") : "") + (st.exact ? "，真的是 " + exact : ""));
      emit(root, { sp: st.sp, sn: st.sn, marks: st.marks.length, exact: st.exact });
    }
    reset(); draw();
  }

  function reg(name, fn) {
    window.PeiyuManip.register(name, function (root, cfg) { P = window.PeiyuP; return fn(root, cfg || {}); });
  }
  reg("panzi", panzi);
  reg("kancheng", kancheng);
  reg("guji", guji);
  reg("dianzi", dianzi);
  reg("koushuan", koushuan);
  reg("bianhua", bianhua);
  reg("calc", calc);
  reg("ones", ones);
})();
