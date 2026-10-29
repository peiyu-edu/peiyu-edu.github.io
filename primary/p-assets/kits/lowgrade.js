/* 培玉 · 小学数学 — 教具文件：一年级（低段）常用教具（一上第二单元「0～10 的认识和加减法」）。
   加载：<script defer src="../p-assets/kits/lowgrade.js"></script>（放在 manip.js 后面）。
   登记 9 个 kind：tapcount、alignrows、lineup、splitlog、brace、eqbuild、beadruler、crossframe、twostep。
   （另：分与合 partwhole、凑十 maketen 是 manip.js 里的公共组件，不在这里。）
   配置只来自 data-cfg。数由代码算；鼠标、触屏（点）、键盘（Tab + 回车 / 空格）都能用；都有「重来」（splitlog 叫「擦掉记录」）。
   读数、按钮文字是给一年级孩子看的；朗读按钮读汉字数。颜色只用 CSS 变量，跟随深浅色。

   ── tapcount  点着数 ──────────────────────────────────────────
   散放的几条小鱼。点一条，它变灰并标上序号（1、2、3……），点过的不能再数（提示「这条数过了」）；
   数完用一个大圈圈起来，写「一共几条」。「排一排」把它们排成一行（再点「散开」）。
     <div class="manip" data-manip="tapcount" data-cfg='{"unit":"条"}'></div>
   cfg（都可省）：
     pts   散放位置 [[x,y],…]（画布 360×240，2–10 个），默认一上 u2-1 的 7 条
     n     不给 pts 时，按 n（2–10）自动摆位置
     unit  量词，默认「条」；name 东西叫什么，默认「小鱼」（画的总是小鱼）
   原来用在：lessons/p1a-u2-1（数小鱼）。抛 manip:change（detail：k 数到几、n 一共几）。

   ── alignrows  一一对应比多少 ─────────────────────────────────
   两排方块，少的那排故意摆得松（看着长）；点「一个对一个」两排对齐并连线，多出来的用红虚线框标「多出来」。
   「换一组」换下一对数。读数「上面多。7 比 6 大，大 1，6 比 7 小。」/「同样多」。
     <div class="manip" data-manip="alignrows" data-cfg='{"pairs":[[6,7],[9,8],[7,7],[5,8]]}'></div>
   cfg：pairs 一组组 [上面几个, 下面几个]（每个 0–9），默认 [[6,7],[9,8],[7,7],[5,8]]。
   原来用在：lessons/p1a-u2-2。抛 manip:change（detail：a、b、on）。

   ── lineup  一排数几只 / 第几只 ──────────────────────────────
   一排小鸭。先选「从左边数」「从右边数」（起点有箭头和「从这里数」），
   「点第几只」时点一只标出它是第几只；「圈几只」时从起点圈到点的那只，读出圈住几只。
     <div class="manip" data-manip="lineup" data-cfg='{"n":9}'></div>
   cfg：n 几只小鸭（2–10，默认 9）。
   原来用在：lessons/p1a-u2-2。抛 manip:change（detail：side L|R、mode one|loop、k）。

   ── splitlog  分法记录表（配合公共组件 partwhole）─────────────────
   放在一个 partwhole 分合器后面，听它的 manip:change 记下分法。两种样子：
     mode "pairs"（默认）：分合图记录表。空位成对排（1 和 5 / 5 和 1），两部分一样多只占一格；
                           拖到一种分法，点「记下来」填进对应空位；重复的提示「已经有了，换一种分法」。
     mode "cells"：n − 1 个格子（10 就是 9 格），分合器每换到一种分法自动写上「几和几」（「和」带拼音），
                   数出找到了几种；「擦掉记录」清空。分合器盖着（hide 没翻开）时不记。
     <div class="manip" id="pw6" data-manip="partwhole" data-cfg='{"n":6,"a":1}'></div>
     <div class="manip" data-manip="splitlog" data-cfg='{"of":"pw6"}'></div>
     <div class="manip" data-manip="splitlog" data-cfg='{"of":"pw10","mode":"cells"}'></div>
   cfg：
     of    分合器容器的 id；省掉时找前面最近的一个 partwhole 兄弟元素
     n     一共几（2–10）；省掉时读分合器的 data-cfg
     mode  "pairs"（默认）| "cells"
   原来用在：pairs — lessons/p1a-u2-3、p1a-u2-4（页内 splitLog）；cells — lessons/p1a-u2-11（页内 splitRecord）。
   抛 manip:change（detail：n、found 已找到几种、total 一共几种）。

   ── brace  大括号看图 ────────────────────────────────────────
   mode "parts"（默认，求一共）：左右两部分小鸭，下面大括号括住全部，括号下写「？只」；extra 只小鸟在括号外面。
       点一边的小鸭，那边上方出数；点大括号，括号里的亮、外面的变淡；点「？只」读出「这里问：一共有几只？」。
   mode "leave"（求还剩）：一共 t 只，走了 g 只（变淡、朝右走开），剩下的在左边被草丛盖住，问号挂在剩下的那部分上，
       下面大括号写「t 只」；「掀开看看」/「盖起来」。
   static true：只画图、不能点（题目小图用），parts 下面写 under，leave 时剩下的不盖住。
     <div class="manip" data-manip="brace" data-cfg='{"L":5,"R":2,"extra":1}'></div>
     <div class="manip" data-manip="brace" data-cfg='{"mode":"leave","t":7,"g":4}'></div>
     <div class="manip" data-manip="brace" data-cfg='{"L":4,"R":3,"extra":1,"static":true}'></div>
   cfg：
     parts：L 左边几只（默认 5）、R 右边几只（默认 2），L + R ≤ 8；extra 括号外几只小鸟（0–3，默认 0）；
            under 括号下写什么（默认「？只」）
     leave：t 一共几只（2–7，默认 7）、g 走了几只（1 到 t − 1，默认 4）
     unit 量词（默认「只」）；static 见上
   原来用在：parts — lessons/p1a-u2-6（页内 braceFig）；leave — lessons/p1a-u2-7（页内 leaveFig，草丛那一幅）。
   抛 manip:change（parts：detail.part 点了哪儿；leave：detail.open）。

   ── eqbuild  排算式 ──────────────────────────────────────────
   「□ ○ □ = □（只）」或连加连减三格「□ ○ □ ○ □」。两种填法：
     数字卡 chips：点数字卡按顺序放进方框，点方框把数退回去；○ 可以固定（ops），也可以让孩子点着换 + / −（opsAnswer）。
     数字键（不给 chips 时）：0–9 键填方框，+ − 键填圆圈，⌫ 删，点格子可以改。
   判对（「好了」）两种规则：
     kind "add" / "sub"（看图列式，两个数 + 得数，错因分类提示）：
       add：a、b 两部分，extra 括号外的个数。换个顺序写也判对，提示「照图从左往右写」；用了减号、算错、把外面的也算进去，各有提示。
       sub：total 一共、gone 走了几个，seen 看得见的是走了的（剩下的藏起来）。用加号、倒过来减、第一个数写剩下的、问号位置错，各有提示。
     不给 kind（按事情先后，多用于连加、连减、加减混合）：answer 三个（或两个）数按事情先后，ops 固定的符号或 opsAnswer 要孩子选的符号。
       anyOrder：连加换了顺序也判对，读 tipOrder（「也对，得数一样！照事情先后写更清楚……」）；
       不对时依次：用了不相干的数 hintOther → 符号不对 hintOp → 第一个数不是「原来」hintFirst → 顺序不对 hintOrder；ok 是答对时的话。
       result true 时多一个「= □」，得数不对读 hintResult。
     <div class="manip" data-manip="eqbuild" data-cfg='{"kind":"add","a":5,"b":2,"extra":1}'></div>
     <div class="manip" data-manip="eqbuild" data-cfg='{"kind":"sub","total":7,"gone":4,"seen":true}'></div>
     <div class="manip" data-manip="eqbuild" data-cfg='{"id":"e1","chips":[2,4,3],"answer":[3,4,2],"ops":["+","+"],"anyOrder":true,"ok":"…","tipOrder":"…"}'></div>
     <div class="manip" data-manip="eqbuild" data-cfg='{"id":"e1","chips":[2,5,8],"answer":[8,5,2],"opsAnswer":["−","+"],"ok":"…","hintFirst":"…","hintOrder":"…","hintOp":"…"}'></div>
   cfg 其他键：id（学习记录里的题号，默认容器 id）；unit 得数后面的「（只）」（默认「只」，只在有得数格时显示）；
     result 有没有「= □」（kind 时默认有，不给 kind 默认没有）。符号写 "+"、"−"（"-" 也认）。
   学习记录：kind 判法记 log("eq", {id, v, correct})；按事情先后的判法记 log("fill", {id, value, correct, first})，和填空题一样。
   反馈：数字键用读数行（带朗读）；数字卡用一行提示文字（对了绿色，不对红色，没填完橙色）。
   原来用在：数字键 + kind — lessons/p1a-u2-6、p1a-u2-7（页内 eqBuilder）；数字卡 + 先后 — lessons/p1a-u2-13、p1a-u2-14（页内 eqBuild）。
   抛 manip:change（detail：value、correct）。

   ── beadruler  单杆计数器 + 0～10 尺子 ──────────────────────────
   一根杆，最多 10 颗（不进到第二根杆）；下面 0～10 的尺子，10 后面还画两格不写数（后面还有数，以后学）。两边同步。
   「添 1 颗」「拿走 1 颗」，也可以直接点尺子上的数。读数「有 6 颗。尺子上，6 的后面是 7。」
     <div class="manip" data-manip="beadruler" data-cfg='{"n":6}'></div>
   cfg：n 开始几颗（0–10，默认 0；「重来」回到它）。
   原来用在：lessons/p1a-u2-10（页内 beadRuler）。抛 manip:change（detail.n）。

   ── crossframe  十格阵点一个划一个 ─────────────────────────────
   十格阵里 10 个点，点一个划掉一个（再点一下放回来），读出「划掉 3 个，还剩 7 个：10 − 3 = 7」。
   「全划掉」演示 10 − 10 = 0，「重来」回到一个也不划（10 − 0 = 10）。
     <div class="manip" data-manip="crossframe"></div>
   cfg：无。
   原来用在：lessons/p1a-u2-12（页内 crossFrame）。抛 manip:change（detail：crossed、left）。

   ── twostep  连加、连减、加减混合分步动画 ───────────────────────
   一行圆片：原来的、第一次来的、第二次来的三种颜色（跑来的从右边滑进来）；走了的打斜线（第二次走的再加红虚线框）。
   下面是算式，第一步做完在前两个数下面连线，出现「第一步得数」框。两个按钮按顺序点，第二步要等第一步。
     <div class="manip" data-manip="twostep" data-cfg='{"start":3,"steps":[["+",4],["+",2]],"labels":["先跑来 4 只","又跑来 2 只"]}'></div>
   cfg：
     start   原来几个（0–10，默认 3）
     steps   两步 [["+",4],["-",2]]（每步的数 0–10；每一步结果夹在 0～10）
     labels  两个按钮上的字（默认「先来 4 只」「又走 2 只」这样）
     noun    量词，默认「只」
     ask1    第一步得数先不显示，框里写「?」，读数问「现在有几只？数一数。」
   典型配置：连加 {"start":3,"steps":[["+",4],["+",2]]}；连减 {"start":9,"steps":[["-",3],["-",2]]}；
            加减混合 {"start":6,"steps":[["-",4],["+",3]],"labels":["先飞走 4 只","又飞来 3 只"],"ask1":true}
   原来用在：lessons/p1a-u2-13、p1a-u2-14（页内 twoStep）。抛 manip:change（detail.step）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var M = window.PeiyuManip, U = M.util;
  var el = U.el, h = U.h, btn = U.btn, activate = U.activate, emit = U.emit, readout = U.readout, cn = U.cn, logI = U.log;
  function P() { return window.PeiyuP; }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function int(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
  function cq(n) { return n === 2 ? "两" : cn(n); }
  function sayOf(t) { return t.replace(/\d+/g, function (d) { return cn(d); }).replace(/\+/g, "加").replace(/−/g, "减").replace(/=/g, "等于").replace(/？/g, "问号"); }
  function normOp(o) { return o === "-" || o === "−" ? "−" : o === "+" ? "+" : ""; }
  function panel(root) {
    var ctr = h("div", "ctrls"), read = h("p", "read");
    read.setAttribute("aria-live", "polite");
    root.appendChild(ctr); root.appendChild(read);
    return { ctr: ctr, read: read };
  }
  function emitAns(root, cfg, value, correct, first) {
    var kind = (root && root.getAttribute("data-manip")) || "lowgrade";
    var all = document.querySelectorAll('.manip[data-manip="' + kind + '"]');
    var idx = [].indexOf.call(all, root);
    var qid = (cfg && cfg.id) || (root && root.id) || (kind + (idx > 0 ? "-" + (idx + 1) : ""));
    root.setAttribute("data-lab-id", qid);
    var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(first) };
    try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
    if (P()) P().log("lab", Object.assign({ _emitted: true }, detail));
  }

  /* ---------- 样式（只注入一次） ---------- */
  (function css() {
    if (document.getElementById("lowgrade-css")) return;
    var K = function (k) { return '.manip[data-manip="' + k + '"] '; };
    var s = document.createElement("style"); s.id = "lowgrade-css";
    s.textContent = [
      K("tapcount") + "svg .mv, " + K("alignrows") + "svg .mv { transition: transform .5s ease; }",
      K("twostep") + "g.arrive { animation: lg-arrive .6s ease-out; transform-box: fill-box; }",
      "@keyframes lg-arrive { from { transform: translateX(36px); opacity: 0; } to { transform: none; opacity: 1; } }",
      K("twostep") + "line.strike { animation: lg-strike .45s ease-out; }",
      "@keyframes lg-strike { from { stroke-dasharray: 40; stroke-dashoffset: 40; } to { stroke-dasharray: 40; stroke-dashoffset: 0; } }",
      K("eqbuild") + ".eqrow { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; font-size: 28px; font-weight: 700; margin: 6px 0; }",
      K("eqbuild") + ".eqrow.kp { margin-bottom: 10px; }",
      K("eqbuild") + ".eqrow.kp .slot { min-width: 48px; height: 52px; font: inherit; border: 2px dashed var(--muted); border-radius: 8px; background: var(--card); color: var(--fg); padding: 0 6px; cursor: pointer; }",
      K("eqbuild") + ".eqrow.kp .slot.op { border-radius: 50%; min-width: 52px; }",
      K("eqbuild") + ".eqrow.kp .slot.on { border: 3px solid var(--hl); }",
      K("eqbuild") + ".eqrow.ch .slot { width: 56px; height: 56px; border: 2px dashed var(--muted); border-radius: 10px; background: var(--bg); color: var(--fg); font: inherit; cursor: pointer; padding: 0; }",
      K("eqbuild") + ".eqrow.ch .slot.on { border-color: var(--c); box-shadow: 0 0 0 3px var(--hl-soft); }",
      K("eqbuild") + ".eqrow .unit { font-size: 22px; }",
      K("eqbuild") + ".eqrow .opsel { width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--c); background: var(--card); color: var(--fg); font: inherit; font-size: 26px; cursor: pointer; padding: 0; }",
      K("eqbuild") + ".eqrow .opfix { min-width: 22px; text-align: center; }",
      K("eqbuild") + ".eqrow button:focus-visible, " + K("eqbuild") + ".chips button:focus-visible { outline: 3px solid var(--hl); outline-offset: 2px; }",
      K("eqbuild") + ".chips { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 12px 0 4px; }",
      K("eqbuild") + ".chips .chip { min-width: 56px; height: 56px; border: 2px solid var(--b); border-radius: 12px; background: var(--card); color: var(--b); font: inherit; font-size: 28px; font-weight: 700; cursor: pointer; }",
      K("eqbuild") + ".chips .chip:disabled { opacity: .3; cursor: default; }",
      K("eqbuild") + ".fb { text-align: center; font-size: 17px; min-height: 1.5em; margin: 6px 0 0; }",
      K("eqbuild") + ".fb.ok { color: var(--a); font-weight: 700; }",
      K("eqbuild") + ".fb.no { color: var(--no); }",
      K("eqbuild") + ".fb.tip { color: var(--c); }",
      '.manip[data-manip="eqbuild"].done .eqrow.ch .slot { border-style: solid; border-color: var(--a); background: var(--ok-soft); cursor: default; }',
      K("splitlog") + ".slog { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 8px 0; }",
      K("splitlog") + ".slog .pr { border: 1.5px solid var(--line); border-radius: var(--radius); padding: 4px 6px 2px; text-align: center; }",
      K("splitlog") + ".slog .pr small { display: block; color: var(--muted); font-size: 15px; }",
      K("splitlog") + ".slog svg { width: 96px; height: auto; }",
      K("splitlog") + ".rec { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 6px; margin: 8px 0; }",
      K("splitlog") + ".rec .cell { min-height: 56px; border: 2px dashed var(--line); border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 2px; font-size: 22px; font-weight: 700; }",
      K("splitlog") + ".rec .cell.got { border-style: solid; border-color: var(--a); background: var(--ok-soft); }",
      K("splitlog") + ".rec .cell.now { box-shadow: 0 0 0 3px var(--hl); }",
      K("splitlog") + ".rec .cell ruby { font-size: 17px; font-weight: 400; color: var(--muted); }"
    ].join("\n");
    document.head.appendChild(s);
  })();

  /* ===================== tapcount 点着数 ===================== */
  var FISH = [[52, 70], [140, 52], [238, 64], [306, 128], [92, 160], [196, 140], [262, 188]];
  function tapcount(root, cfg) {
    var pts;
    if (Array.isArray(cfg.pts) && cfg.pts.length >= 2) {
      pts = cfg.pts.slice(0, 10).map(function (p) { return [int(p && p[0], 30, 320, 180), int(p && p[1], 40, 200, 120)]; });
    } else if (cfg.n != null) {
      var nn = int(cfg.n, 2, 10, 7);
      pts = [];
      var cols = Math.ceil(nn / 2);
      for (var q = 0; q < nn; q++) {   // 两行错开摆，看着散，不重叠
        var row = q % 2, col = Math.floor(q / 2);
        pts.push([Math.round(45 + col * (250 / Math.max(1, cols - 1)) + (row ? 25 : 0)), row ? 165 : 64 + (col % 2) * 22]);
      }
    } else pts = FISH;
    var N = pts.length, unit = cfg.unit || "条", name = cfg.name || "小鱼";
    var st = { k: 0, row: false, mark: [] }, firstTry = true, reported = false;
    var svg = el("svg", { viewBox: "0 0 360 240", class: "stage", role: "group", "aria-label": "数" + name }, root);
    var gLoop = el("g", {}, svg), gItems = el("g", {}, svg);
    var ui = panel(root), read = ui.read;
    var bRow = btn("排一排", function () { st.row = !st.row; place(); logI("row", { row: st.row }); });
    ui.ctr.appendChild(bRow);
    ui.ctr.appendChild(btn("重来", function () { st.k = 0; st.row = false; st.mark = []; reported = false; place(); logI("reset"); }));
    function pos(i) { return st.row ? [36 + i * (288 / (N - 1)), 130] : pts[i]; }
    var fresh = "一" + unit + name + "，点一下数它";
    var items = pts.map(function (p, i) {
      var g = el("g", { class: "part mv", tabindex: "0", role: "button", "aria-label": fresh }, gItems);
      el("circle", { cx: 6, cy: 0, r: 26, style: "fill:transparent" }, g);
      var body = el("ellipse", { cx: 0, cy: 0, rx: 18, ry: 11 }, g);
      var tail = el("polygon", { points: "15,0 30,-11 30,11" }, g);
      el("circle", { cx: -9, cy: -3, r: 2.5, style: "fill:var(--card)" }, g);
      var tick = el("text", { x: 0, y: -18, "text-anchor": "middle", style: "fill:var(--a);font-size:18px;font-weight:700" }, g);
      activate(g, function () { tap(i); });
      return { g: g, body: body, tail: tail, tick: tick };
    });
    function tap(i) {
      if (st.mark[i]) {
        var t = "这" + unit + "数过了，找一" + unit + "没数过的。"; readout(read, t, t, "no");
        emitAns(root, cfg, "dup-" + (i + 1), false, firstTry); firstTry = false;
        return;
      }
      st.k++; st.mark[i] = st.k; logI("count", { k: st.k }); draw();
      if (st.k === N && !reported) { reported = true; emitAns(root, cfg, String(N), true, firstTry); }
    }
    function place() {
      items.forEach(function (it, i) { var p = pos(i); it.g.style.transform = "translate(" + p[0] + "px," + p[1] + "px)"; });
      draw();
    }
    function draw() {
      items.forEach(function (it, i) {
        var done = !!st.mark[i], f = "fill:" + (done ? "var(--line)" : "var(--b)");
        it.body.setAttribute("style", f); it.tail.setAttribute("style", f);
        it.tick.textContent = done ? String(st.mark[i]) : "";
        it.g.setAttribute("aria-label", done ? "数过了，第 " + st.mark[i] + " " + unit : fresh);
      });
      bRow.textContent = st.row ? "散开" : "排一排";
      clear(gLoop);
      if (st.k === N) {
        var xs = [], ys = [];
        for (var i = 0; i < N; i++) { var p = pos(i); xs.push(p[0]); ys.push(p[1]); }
        var x0 = Math.min.apply(null, xs) - 28, x1 = Math.max.apply(null, xs) + 34;
        var y0 = Math.min.apply(null, ys) - 40, y1 = Math.max.apply(null, ys) + 22;
        el("rect", { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 24, style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3;stroke-dasharray:8 5" }, gLoop);
        el("rect", { x: 140, y: y1 - 4, width: 80, height: 28, rx: 14, style: "fill:var(--a)" }, gLoop);
        el("text", { x: 180, y: y1 + 16, "text-anchor": "middle", style: "fill:#fff;font-size:18px;font-weight:700" }, gLoop).textContent = N + " " + unit;
        readout(read, "数到 " + N + "，一共有 " + N + " " + unit + "。", "数到" + cn(N) + "，一共有" + cn(N) + unit + "。", "ok");
      } else if (st.k === 0) {
        readout(read, "点一" + unit + name + "，开始数。");
      } else {
        readout(read, "数到 " + st.k + " 了。还有没数的吗？");
      }
      emit(root, { k: st.k, n: N, row: st.row });
    }
    place();
  }

  /* ===================== alignrows 一一对应比多少 ===================== */
  function alignrows(root, cfg) {
    var pairs = Array.isArray(cfg.pairs) && cfg.pairs.length ? cfg.pairs : [[6, 7], [9, 8], [7, 7], [5, 8]];
    pairs = pairs.map(function (p) { return [int(p && p[0], 0, 9, 5), int(p && p[1], 0, 9, 5)]; });
    var st = { i: 0, on: false, reported: false };
    var svg = el("svg", { viewBox: "0 0 360 200", class: "stage", role: "img", "aria-label": "两排方块比多少" }, root);
    var gL = el("g", {}, svg), gS = el("g", {}, svg), gX = el("g", {}, svg);
    var ui = panel(root);
    var bOn = btn("一个对一个", function () { st.on = !st.on; draw(); logI("align", { on: st.on }); });
    ui.ctr.appendChild(bOn);
    if (pairs.length > 1) ui.ctr.appendChild(btn("换一组", function () { st.i = (st.i + 1) % pairs.length; st.on = false; st.reported = false; build(); }));
    ui.ctr.appendChild(btn("重来", function () { st.i = 0; st.on = false; st.reported = false; build(); logI("reset"); }));
    var sq = [];
    function rowX(row, j) {
      var a = pairs[st.i][0], b = pairs[st.i][1], n = row ? b : a, other = row ? a : b;
      if (st.on) return 24 + j * 36;
      var gap = n < other ? 38 : 28;
      return 180 - ((n - 1) * gap + 28) / 2 + j * gap;
    }
    function build() {
      clear(gS); sq = [];
      [0, 1].forEach(function (row) {
        var n = pairs[st.i][row];
        for (var j = 0; j < n; j++) {
          var r = el("rect", { class: "mv", x: 0, y: 0, width: 28, height: 28, rx: 4, style: "fill:" + (row ? "var(--b)" : "var(--a)") }, gS);
          sq.push({ r: r, row: row, j: j });
        }
      });
      draw();
    }
    function draw() {
      clear(gL); clear(gX);
      var a = pairs[st.i][0], b = pairs[st.i][1];
      sq.forEach(function (s) { s.r.style.transform = "translate(" + rowX(s.row, s.j) + "px," + (s.row ? 130 : 40) + "px)"; });
      bOn.setAttribute("aria-pressed", st.on ? "true" : "false");
      emit(root, { a: a, b: b, on: st.on });
      if (!st.on) { readout(ui.read, "上面 " + a + " 个，下面 " + b + " 个。哪一排多？点「一个对一个」看看。"); return; }
      if (!st.reported) { st.reported = true; emitAns(root, cfg, a + ":" + b, true, true); }
      for (var j = 0; j < Math.min(a, b); j++) {
        var x = 24 + j * 36 + 14;
        el("line", { x1: x, y1: 70, x2: x, y2: 128, style: "stroke:var(--muted);stroke-width:2" }, gL);
      }
      if (a === b) { readout(ui.read, "一个对一个，正好对完。" + a + " = " + b + "，同样多。", cn(a) + "等于" + cn(b) + "，同样多。", "ok"); return; }
      var big = Math.max(a, b), small = Math.min(a, b), top = a > b;
      var x0 = 24 + small * 36 - 4, w = (big - small) * 36, y = top ? 36 : 126;
      el("rect", { x: x0, y: y, width: w, height: 36, rx: 6, style: "fill:none;stroke:var(--no);stroke-width:3;stroke-dasharray:6 4" }, gX);
      el("text", { x: Math.min(x0 + w / 2, 320), y: top ? 96 : 186, "text-anchor": "middle", style: "fill:var(--no);font-size:17px;font-weight:700" }, gX).textContent = "多出来";
      var one = big - small === 1 ? "，大 1" : "";
      readout(ui.read, (top ? "上面" : "下面") + "多。" + big + " 比 " + small + " 大" + one + "，" + small + " 比 " + big + " 小。",
        cn(big) + "比" + cn(small) + "大，" + cn(small) + "比" + cn(big) + "小。", "ok");
    }
    build();
  }

  /* ===================== lineup 一排数几只 / 第几只 ===================== */
  function lineup(root, cfg) {
    var n = int(cfg.n, 2, 10, 9);
    var st = { side: "L", mode: "one", pick: -1, reported: false };
    var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "group", "aria-label": "一排小鸭" }, root);
    var gA = el("g", {}, svg), gD = el("g", {}, svg);
    var ui = panel(root);
    var bL = btn("从左边数", function () { st.side = "L"; st.pick = -1; st.reported = false; draw(); });
    var bR = btn("从右边数", function () { st.side = "R"; st.pick = -1; st.reported = false; draw(); });
    var bOne = btn("点第几只", function () { st.mode = "one"; st.pick = -1; st.reported = false; draw(); });
    var bLoop = btn("圈几只", function () { st.mode = "loop"; st.pick = -1; st.reported = false; draw(); });
    [bL, bR, bOne, bLoop].forEach(function (b) { ui.ctr.appendChild(b); });
    ui.ctr.appendChild(btn("重来", function () { st.side = "L"; st.mode = "one"; st.pick = -1; st.reported = false; draw(); logI("reset"); }));
    var gap = 300 / (n - 1);
    function dx(i) { return 30 + i * gap; }
    function rank(i) { return st.side === "L" ? i + 1 : n - i; }
    function draw() {
      clear(gA); clear(gD);
      bL.setAttribute("aria-pressed", st.side === "L" ? "true" : "false");
      bR.setAttribute("aria-pressed", st.side === "R" ? "true" : "false");
      bOne.setAttribute("aria-pressed", st.mode === "one" ? "true" : "false");
      bLoop.setAttribute("aria-pressed", st.mode === "loop" ? "true" : "false");
      var sx = st.side === "L" ? dx(0) : dx(n - 1);
      el("text", { x: st.side === "L" ? 8 : 352, y: 30, "text-anchor": st.side === "L" ? "start" : "end", style: "fill:var(--a);font-size:17px;font-weight:700" }, gA).textContent = "从这里数";
      el("path", { d: "M" + sx + " 40 L" + sx + " 70 M" + (sx - 7) + " 62 L" + sx + " 72 L" + (sx + 7) + " 62", style: "fill:none;stroke:var(--a);stroke-width:3" }, gA);
      if (st.pick >= 0 && st.mode === "loop") {
        var lo = st.side === "L" ? 0 : st.pick, hi = st.side === "L" ? st.pick : n - 1;
        el("rect", { x: dx(lo) - 18, y: 92, width: dx(hi) - dx(lo) + 36, height: 64, rx: 22, style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:3" }, gA);
      }
      for (var i = 0; i < n; i++) {
        var x = dx(i), picked = st.pick === i;
        var g = el("g", { class: "part", tabindex: "0", role: "button", "aria-label": "小鸭" }, gD);
        el("rect", { x: x - gap / 2, y: 92, width: gap, height: 64, style: "fill:transparent" }, g);
        el("ellipse", { cx: x, cy: 136, rx: 14, ry: 10, style: "fill:var(--hl);stroke:var(--fg);stroke-width:1.5" }, g);
        el("circle", { cx: x - 6, cy: 120, r: 7, style: "fill:var(--hl);stroke:var(--fg);stroke-width:1.5" }, g);
        el("polygon", { points: (x - 13) + ",119 " + (x - 19) + ",122 " + (x - 13) + ",124", style: "fill:var(--no)" }, g);
        if (picked && st.mode === "one") el("circle", { cx: x, cy: 130, r: 22, style: "fill:none;stroke:var(--no);stroke-width:3" }, g);
        (function (idx) { activate(g, function () { st.pick = idx; draw(); logI("rank", { side: st.side, mode: st.mode, k: rank(idx) }); }); })(i);
      }
      emit(root, { side: st.side, mode: st.mode, k: st.pick < 0 ? 0 : rank(st.pick) });
      if (st.pick < 0) { readout(ui.read, st.mode === "one" ? "点一只小鸭。" : "点一只小鸭，从箭头圈到它。"); return; }
      var k = rank(st.pick), side = st.side === "L" ? "左" : "右";
      if (!st.reported) { st.reported = true; emitAns(root, cfg, st.side + ":" + st.mode + ":" + k, true, true); }
      if (st.mode === "one") {
        var lx = Math.max(30, Math.min(330, dx(st.pick)));
        el("text", { x: lx, y: 182, "text-anchor": "middle", style: "fill:var(--no);font-size:18px;font-weight:700" }, gA).textContent = "第 " + k + " 只";
        readout(ui.read, "从" + side + "边数，它是第 " + k + " 只。", "从" + side + "边数，它是第" + cn(k) + "只。", "ok");
      } else {
        readout(ui.read, "从" + side + "边数，圈住了 " + k + " 只。", "从" + side + "边数，圈住了" + cn(k) + "只。", "ok");
      }
    }
    draw();
  }

  /* ===================== splitlog 分法记录表 ===================== */
  /* 分合图小图（不是等式）：一共、左、右；blank 空着哪一格（top|left|right|none|both）。 */
  function tree(s, n, l, r, blank) {
    clear(s);
    var yT = 28, yP = 92;
    el("line", { x1: 100, y1: yT + 20, x2: 55, y2: yP - 20, style: "stroke:var(--fg);stroke-width:2.5" }, s);
    el("line", { x1: 100, y1: yT + 20, x2: 145, y2: yP - 20, style: "stroke:var(--fg);stroke-width:2.5" }, s);
    [[100, yT, n, "top", "var(--fg)"], [55, yP, l, "left", "var(--a)"], [145, yP, r, "right", "var(--b)"]].forEach(function (c) {
      var empty = blank === c[3] || (blank === "both" && c[3] !== "top");
      el("rect", { x: c[0] - 22, y: c[1] - 20, width: 44, height: 40, rx: 8, style: "fill:var(--card);stroke:" + (empty ? "var(--muted)" : c[4]) + ";stroke-width:" + (empty ? 2 : 3) + (empty ? ";stroke-dasharray:5 4" : "") }, s);
      if (!empty) el("text", { x: c[0], y: c[1] + 9, "text-anchor": "middle", style: "fill:" + c[4] + ";font-size:26px;font-weight:700" }, s).textContent = String(c[2]);
    });
  }
  function findPW(root, cfg) {
    var src = cfg.of ? document.getElementById(cfg.of) : null;
    if (src) return src;
    var p = root.previousElementSibling;
    while (p && p.getAttribute("data-manip") !== "partwhole") p = p.previousElementSibling;
    return p;
  }
  function splitlog(root, cfg) {
    var src = findPW(root, cfg), pcfg = {};
    if (src) { try { pcfg = JSON.parse(src.getAttribute("data-cfg") || "{}"); } catch (e) { /* ignore */ } }
    var n = int(cfg.n != null ? cfg.n : pcfg.n, 2, 10, 7);
    var a0 = int(pcfg.a, 1, n - 1, 1);
    var bar = src && src.querySelector("[role=slider]");
    if (bar && bar.getAttribute("aria-valuenow") != null) a0 = int(bar.getAttribute("aria-valuenow"), 0, n, a0);
    if (cfg.mode === "cells") cells(root, src, n, a0, cfg); else pairs(root, src, n, a0, cfg);
  }
  /* pairs：点「记下来」填进成对排好的空位。 */
  function pairs(root, src, n, a0, cfg) {
    var cur = a0, got = {}, slots = [], firstTry = true, reported = false;
    if (src) src.addEventListener("manip:change", function (e) { var d = e.detail; if (d && d.n === n && d.a >= 1 && d.a <= n - 1) cur = d.a; });
    var box = h("div", "slog"); root.appendChild(box);
    for (var k = 1; k <= Math.floor(n / 2); k++) {
      var pr = h("div", "pr"); box.appendChild(pr);
      pr.appendChild(h("small", "", "第 " + k + " 对"));
      [k, n - k].forEach(function (a, j) {
        if (j === 1 && n - k === k) return;
        var s = el("svg", { viewBox: "28 4 144 112", role: "img", "aria-label": "还没找到" }, pr);
        slots.push({ a: a, s: s });
      });
    }
    var ui = panel(root), read = ui.read;
    ui.ctr.appendChild(btn("记下来", function () {
      if (cur < 1 || cur > n - 1) return;
      var b = n - cur;
      if (got[cur]) {
        readout(read, cur + " 和 " + b + " 已经有了，换一种分法。", cn(cur) + "和" + cn(b) + "已经有了，换一种分法。", "no");
        emitAns(root, cfg, "dup-" + cur, false, firstTry); firstTry = false;
        return;
      }
      got[cur] = true; logI("record", { n: n, a: cur }); draw();
      var left = slots.length - Object.keys(got).length;
      var msg = cur === b ? "倒过来还是 " + cur + " 和 " + b + "，只写一个。" : "倒过来，" + b + " 和 " + cur + " 也是一个。";
      var say = cur === b ? "倒过来还是" + cn(cur) + "和" + cn(b) + "，只写一个。" : "倒过来，" + cn(b) + "和" + cn(cur) + "也是一个。";
      if (!left) {
        msg = "都找到了！" + n + " 一共写出 " + slots.length + " 个分合图。"; say = "都找到了！" + cn(n) + "一共写出" + cn(slots.length) + "个分合图。";
        if (!reported) { reported = true; emitAns(root, cfg, "all-" + slots.length, true, firstTry); }
      }
      readout(read, msg, say, "ok");
    }));
    ui.ctr.appendChild(btn("重来", function () { got = {}; reported = false; draw(); readout(read, "记录清空了。"); logI("reset"); }));
    function draw() {
      slots.forEach(function (sl) {
        if (got[sl.a]) { tree(sl.s, n, sl.a, n - sl.a, "none"); sl.s.setAttribute("aria-label", n + " 分成 " + sl.a + " 和 " + (n - sl.a)); }
        else { tree(sl.s, n, "", "", "both"); sl.s.setAttribute("aria-label", "还没找到"); }
      });
      emit(root, { n: n, found: Object.keys(got).length, total: slots.length });
    }
    draw();
    readout(read, "空格还有 " + slots.length + " 个，按顺序找。", "空格还有" + cn(slots.length) + "个，按顺序找。");
  }
  /* cells：分合器每换一种分法，自动写进第 a 格。 */
  function cells(root, src, n, a0, cfg) {
    var seen = {}, list = [], reported = false;
    var grid = h("div", "rec");
    for (var a = 1; a < n; a++) {
      var c = h("span", "cell"); c.setAttribute("aria-label", "第 " + a + " 格，还没找到");
      list.push(grid.appendChild(c));
    }
    var read = h("p", "read"); read.setAttribute("aria-live", "polite");
    var ctr = h("div", "ctrls");
    ctr.appendChild(btn("擦掉记录", function () {
      seen = {}; reported = false;
      list.forEach(function (c, i) { c.innerHTML = ""; c.className = "cell"; c.setAttribute("aria-label", "第 " + (i + 1) + " 格，还没找到"); });
      show(); logI("reset");
    }));
    root.appendChild(grid); root.appendChild(read); root.appendChild(ctr);
    function show() {
      var k = Object.keys(seen).length, txt, say;
      if (k < n - 1) { txt = "找到 " + k + " 种，还有 " + (n - 1 - k) + " 种。"; say = "找到" + cn(k) + "种，还有" + cn(n - 1 - k) + "种"; }
      else { txt = "全找到了！" + n + " 有 " + (n - 1) + " 种分法。"; say = "全找到了！" + cn(n) + "有" + cn(n - 1) + "种分法"; }
      readout(read, txt, say, k === n - 1 ? "ok" : "");
      emit(root, { n: n, found: k, total: n - 1 });
      if (k === n - 1 && !reported) { reported = true; emitAns(root, cfg, "all-" + (n - 1), true, true); }
    }
    function got(d) {
      if (!d || !d.open || !(d.a >= 1) || !(d.b >= 1) || d.a > n - 1) return;
      var c = list[d.a - 1];
      if (!seen[d.a]) { seen[d.a] = 1; logI("record", { n: n, a: d.a }); }
      c.innerHTML = d.a + "<ruby>和<rt>hé</rt></ruby>" + d.b;
      c.className = "cell got";
      c.setAttribute("aria-label", d.a + " 和 " + d.b);
      list.forEach(function (x) { x.classList.remove("now"); }); c.classList.add("now");
      show();
    }
    if (src) {
      src.addEventListener("manip:change", function (e) { if (e.detail && e.detail.n === n) got(e.detail); });
      // 分合器先画好了：开头那一种分法从分隔条上读（盖着时不记）
      var bar = src.querySelector("[role=slider]");
      if (bar) {
        var hid = false;
        try { hid = !!JSON.parse(src.getAttribute("data-cfg") || "{}").hide; } catch (e) { /* ignore */ }
        if (!hid) got({ open: true, a: a0, b: n - a0 });
      }
    }
    show();
  }

  /* ===================== brace 大括号看图 ===================== */
  function duck(g, x, y) {
    el("ellipse", { cx: x, cy: y, rx: 13, ry: 9, style: "fill:var(--hl);stroke:var(--fg);stroke-width:1.5" }, g);
    el("circle", { cx: x - 6, cy: y - 14, r: 6.5, style: "fill:var(--hl);stroke:var(--fg);stroke-width:1.5" }, g);
    el("polygon", { points: (x - 12) + "," + (y - 15) + " " + (x - 18) + "," + (y - 12) + " " + (x - 12) + "," + (y - 10), style: "fill:var(--no)" }, g);
  }
  function bird(g, x, y) {
    el("ellipse", { cx: x, cy: y, rx: 11, ry: 8, style: "fill:var(--b)" }, g);
    el("polygon", { points: (x - 4) + "," + (y - 2) + " " + (x + 8) + "," + (y - 16) + " " + (x + 8) + "," + (y - 2), style: "fill:var(--b)" }, g);
    el("polygon", { points: (x - 11) + "," + (y - 2) + " " + (x - 18) + "," + y + " " + (x - 11) + "," + (y + 2), style: "fill:var(--no)" }, g);
  }
  /* 横放的大括号（down=true 开口朝上、尖朝下） */
  function bracePath(g, x1, x2, y, down, color) {
    var m = (x1 + x2) / 2, hh = down ? 10 : -10;
    el("path", { d: "M" + x1 + " " + y + " Q" + x1 + " " + (y + hh) + " " + (x1 + 10) + " " + (y + hh) + " L" + (m - 10) + " " + (y + hh) + " Q" + m + " " + (y + hh) + " " + m + " " + (y + 2 * hh) +
      " Q" + m + " " + (y + hh) + " " + (m + 10) + " " + (y + hh) + " L" + (x2 - 10) + " " + (y + hh) + " Q" + x2 + " " + (y + hh) + " " + x2 + " " + y, style: "fill:none;stroke:" + (color || "var(--fg)") + ";stroke-width:2.5" }, g);
  }
  /* parts：左右两部分 + 大括号；interactive 时三处可点。 */
  function braceFig(svg, o, interactive, read, root, cfg) {
    var st = { showL: false, showR: false, focus: false, reported: false }, U1 = o.unit;
    var gap = 34, n = o.L + o.R, x0 = 165 - ((n - 1) * gap + 24) / 2;
    function xi(i) { return x0 + i * gap + (i >= o.L ? 24 : 0); }
    function part(label) { return el("g", { class: interactive ? "part" : "", tabindex: interactive ? "0" : "-1", role: interactive ? "button" : "presentation", "aria-label": label }, svg); }
    function maybeReport() {
      if (((st.showL && st.showR) || st.focus) && !st.reported && root) {
        st.reported = true;
        emitAns(root, cfg || {}, o.L + "+" + o.R + "=" + (o.L + o.R), true, true);
      }
    }
    function draw() {
      clear(svg);
      var gL = part("左边的小鸭"), gR = part("右边的小鸭");
      for (var i = 0; i < n; i++) duck(i < o.L ? gL : gR, xi(i), 70);
      el("rect", { x: xi(0) - 20, y: 40, width: xi(o.L - 1) - xi(0) + 36, height: 44, style: "fill:transparent" }, gL);
      el("rect", { x: xi(o.L) - 20, y: 40, width: xi(n - 1) - xi(o.L) + 36, height: 44, style: "fill:transparent" }, gR);
      if (o.extra) { var gb = el("g", { style: "opacity:" + (st.focus ? 0.25 : 1) }, svg); for (var e = 0; e < o.extra; e++) bird(gb, 305 - e * 34, 30); }
      var gBr = part("大括号");
      el("rect", { x: xi(0) - 22, y: 86, width: xi(n - 1) - xi(0) + 44, height: 30, style: "fill:transparent" }, gBr);
      bracePath(gBr, xi(0) - 18, xi(n - 1) + 14, 92, true, st.focus ? "var(--a)" : "var(--fg)");
      var mid = (xi(0) + xi(n - 1)) / 2 - 2;
      var gQ = part("问号");
      el("rect", { x: mid - 34, y: 118, width: 68, height: 30, rx: 8, style: "fill:" + (interactive ? "var(--hl-soft)" : "transparent") }, gQ);
      el("text", { x: mid, y: 141, "text-anchor": "middle", style: "fill:var(--fg);font-size:20px;font-weight:700" }, gQ).textContent = o.under;
      if (st.showL) el("text", { x: (xi(0) + xi(o.L - 1)) / 2, y: 30, "text-anchor": "middle", style: "fill:var(--a);font-size:20px;font-weight:700" }, svg).textContent = o.L + " " + U1;
      if (st.showR) el("text", { x: (xi(o.L) + xi(n - 1)) / 2, y: 30, "text-anchor": "middle", style: "fill:var(--a);font-size:20px;font-weight:700" }, svg).textContent = o.R + " " + U1;
      if (!interactive) return;
      activate(gL, function () { st.showL = true; draw(); readout(read, "左边有 " + o.L + " " + U1 + "。", "左边有" + cq(o.L) + U1 + "。"); logI("brace", { part: "L" }); emit(root, { part: "L" }); maybeReport(); });
      activate(gR, function () { st.showR = true; draw(); readout(read, "右边有 " + o.R + " " + U1 + "。", "右边有" + cq(o.R) + U1 + "。"); logI("brace", { part: "R" }); emit(root, { part: "R" }); maybeReport(); });
      activate(gBr, function () {
        st.focus = !st.focus; draw();
        readout(read, st.focus ? "大括号把两边的小鸭合起来。外面的小鸟不算。" : "再点一下大括号，看它括住了谁。", st.focus ? "大括号把两边的小鸭合起来。外面的小鸟不算。" : null);
        logI("brace", { part: "brace" }); emit(root, { part: "brace", focus: st.focus }); maybeReport();
      });
      activate(gQ, function () {
        var t = "这里问：一共有几" + U1 + "？";
        readout(read, t, t); if (P()) P().say(t); logI("brace", { part: "q" }); emit(root, { part: "q" }); maybeReport();
      });
    }
    draw();
    return { reset: function () { st.showL = st.showR = st.focus = st.reported = false; draw(); } };
  }
  /* leave：一共 t 只，走了 g 只，剩下的（可盖住）上挂问号。 */
  function leaveFig(svg, o, cover, open) {
    clear(svg);
    var t = o.t, g = o.g, l = t - g, gap = 34, x0 = 165 - ((t - 1) * gap + 30) / 2, U1 = o.unit;
    function xi(i) { return x0 + i * gap + (i >= l ? 30 : 0); }
    var gGone = el("g", { style: "opacity:0.45" }, svg);
    for (var i = 0; i < t; i++) duck(i < l ? svg : gGone, xi(i), 85);
    el("path", { d: "M" + (xi(t - 1) + 20) + " 80 l16 0 m-6 -6 l6 6 l-6 6", style: "fill:none;stroke:var(--muted);stroke-width:2.5" }, svg);
    el("text", { x: (xi(l) + xi(t - 1)) / 2, y: 52, "text-anchor": "middle", style: "fill:var(--muted);font-size:17px" }, svg).textContent = "走了 " + g + " " + U1;
    if (cover && !open) {
      var gb = el("g", {}, svg), cx = (xi(0) + xi(l - 1)) / 2 - 4, w = xi(l - 1) - xi(0) + 50;
      el("ellipse", { cx: cx, cy: 80, rx: w / 2, ry: 30, style: "fill:var(--a)" }, gb);
      el("circle", { cx: cx - w / 4, cy: 62, r: 18, style: "fill:var(--a)" }, gb);
      el("circle", { cx: cx + w / 4, cy: 60, r: 20, style: "fill:var(--a)" }, gb);
    }
    bracePath(svg, xi(0) - 18, xi(l - 1) + 14, 56, false, "var(--b)");
    el("text", { x: (xi(0) + xi(l - 1)) / 2 - 2, y: 30, "text-anchor": "middle", style: "fill:var(--b);font-size:20px;font-weight:700" }, svg).textContent = "？" + U1;
    bracePath(svg, xi(0) - 18, xi(t - 1) + 14, 104, true);
    el("text", { x: (xi(0) + xi(t - 1)) / 2 - 2, y: 150, "text-anchor": "middle", style: "fill:var(--fg);font-size:20px;font-weight:700" }, svg).textContent = t + " " + U1;
  }
  function brace(root, cfg) {
    var unit = cfg.unit || "只", stat = !!cfg.static;
    if (cfg.mode === "leave") {
      var t = int(cfg.t, 2, 7, 7), g = int(cfg.g, 1, t - 1, Math.min(4, t - 1)), l = t - g, o = { t: t, g: g, unit: unit };
      var svgL = el("svg", { viewBox: "0 0 330 160", class: "stage", role: "img" }, root);
      if (stat) {
        svgL.setAttribute("aria-label", "一共 " + t + " " + unit + "小鸭，大括号下面写着 " + t + " " + unit + "；走了 " + g + " " + unit + "；问号在剩下的那部分上");
        leaveFig(svgL, o, false, true); return;
      }
      svgL.setAttribute("aria-label", "一共 " + t + " " + unit + "小鸭，走了 " + g + " " + unit + "，剩下的藏在草丛后面");
      var hs = { open: false, reported: false }, ui = panel(root);
      var bPeek = btn("掀开看看", function () { hs.open = !hs.open; drawHide(); logI("peek", { open: hs.open }); });
      ui.ctr.appendChild(bPeek);
      ui.ctr.appendChild(btn("重来", function () { hs.open = false; hs.reported = false; drawHide(); logI("reset"); }));
      var drawHide = function () {
        leaveFig(svgL, o, true, hs.open);
        bPeek.textContent = hs.open ? "盖起来" : "掀开看看";
        if (hs.open) {
          readout(ui.read, "草丛后面有 " + l + " " + unit + "。和你算的一样吗？", "草丛后面有" + cq(l) + unit + "。和你算的一样吗？", "ok");
          if (!hs.reported) { hs.reported = true; emitAns(root, cfg, t + "-" + g + "=" + l, true, true); }
        }
        else readout(ui.read, "看得见的 " + g + " " + unit + "是走了的。剩下的藏在草丛后面。先算一算，再掀开看看。", "看得见的" + cq(g) + unit + "是走了的。剩下的藏在草丛后面。先算一算，再掀开看看。");
        emit(root, { t: t, g: g, open: hs.open });
      };
      drawHide();
      return;
    }
    var L = int(cfg.L, 1, 7, 5), R = int(cfg.R, 1, 7, 2);
    if (L + R > 8) R = 8 - L;
    var extra = int(cfg.extra, 0, 3, 0);
    var op = { L: L, R: R, extra: extra, under: cfg.under != null ? String(cfg.under) : "？" + unit, unit: unit };
    var aria = "左边 " + L + " " + unit + "小鸭，右边 " + R + " " + unit + "小鸭" + (extra ? "，外面 " + extra + " 只小鸟" : "");
    var svg = el("svg", { viewBox: "0 0 330 150", class: "stage", role: stat ? "img" : "group", "aria-label": (stat ? "" : "大括号看图：") + aria }, root);
    if (stat) { braceFig(svg, op, false); return; }
    var pu = panel(root);
    var fig = braceFig(svg, op, true, pu.read, root, cfg);
    var hint = "点小鸭、点大括号、点问号，看看会怎样。";
    pu.ctr.appendChild(btn("重来", function () { fig.reset(); readout(pu.read, hint); logI("reset"); }));
    readout(pu.read, hint);
  }

  /* ===================== eqbuild 排算式 ===================== */
  function eqbuild(root, cfg) {
    var kind = cfg.kind === "add" || cfg.kind === "sub" ? cfg.kind : "";
    var ans = !kind && Array.isArray(cfg.answer) && cfg.answer.length >= 2 ? cfg.answer.slice(0, 3).map(function (x) { return int(x, 0, 99, 0); }) : null;
    if (!kind && !ans) kind = "add";   // 什么都没给：当成 3 + 2 的看图列式
    var A = {
      a: int(cfg.a, 0, 9, 3), b: int(cfg.b, 0, 9, 2), extra: int(cfg.extra, 0, 9, 0),
      total: int(cfg.total, 1, 9, 6), seen: !!cfg.seen
    };
    A.gone = int(cfg.gone, 0, A.total, Math.min(2, A.total));
    var terms = kind ? 2 : ans.length;
    var hasRes = kind ? true : !!cfg.result;
    var unit = cfg.unit || "只";
    var chips = Array.isArray(cfg.chips) && cfg.chips.length ? cfg.chips.map(function (x) { return int(x, 0, 99, 0); }) : null;
    var opsGiven = Array.isArray(cfg.ops) && cfg.ops.length === terms - 1 ? cfg.ops.map(normOp) : null;
    var fixedOps = !kind && opsGiven && !cfg.opsAnswer ? opsGiven : null;
    var opsAns = kind ? null : (Array.isArray(cfg.opsAnswer) ? cfg.opsAnswer.map(normOp) : opsGiven || []);
    var id = cfg.id || root.id || "";
    var P0 = P;

    // 格子：数 n、符号 o、得数 r
    var S = [];
    for (var i = 0; i < terms; i++) { S.push({ t: "n" }); if (i < terms - 1) S.push({ t: "o", k: i }); }
    if (hasRes) S.push({ t: "r" });
    var val = S.map(function (s) { return s.t === "o" && fixedOps ? fixedOps[s.k] : ""; });
    var chipAt = S.map(function () { return -1; });
    var editable = S.map(function (s) { return !(s.t === "o" && fixedOps); });
    var numIdx = [], opIdx = [];
    S.forEach(function (s, j) { if (s.t === "o") { if (editable[j]) opIdx.push(j); } else numIdx.push(j); });
    var st = { cur: numIdx[0], done: false, tries: 0 };

    var row = h("div", "eqrow " + (chips ? "ch" : "kp")); root.appendChild(row);
    var nodes = S.map(function (s, j) {
      if (s.t === "r") row.appendChild(h("span", "", "="));
      if (s.t === "o" && !editable[j]) return row.appendChild(h("span", "opfix", val[j]));
      var b;
      if (s.t === "o") {
        if (chips) {
          b = btn("○", function () { if (st.done) return; val[j] = val[j] === "+" ? "−" : "+"; draw(); }, "第 " + (s.k + 1) + " 个符号，点一下换加号或减号");
          b.className = "opsel";
        } else {
          b = btn("", function () { if (!st.done) { st.cur = j; draw(); } }, "圆圈，填加号或减号");
          b.className = "slot op";
        }
      } else {
        var nth = numIdx.indexOf(j) + 1;
        if (chips) b = btn("", function () { if (st.done) return; if (chipAt[j] >= 0) { chipAt[j] = -1; val[j] = ""; draw(); } }, s.t === "r" ? "得数的格子" : "第 " + nth + " 个数的格子");
        else b = btn("", function () { if (!st.done) { st.cur = j; draw(); } }, "方框，填数");
        b.className = "slot";
      }
      return row.appendChild(b);
    });
    if (hasRes && unit && cfg.showUnit !== false) row.appendChild(h("span", "unit", "（" + unit + "）"));

    var chipBtns = [], fb = null, ui = null;
    if (chips) {
      var chipRow = h("div", "chips"); root.appendChild(chipRow);
      chips.forEach(function (n, c) {
        var b = btn(String(n), function () {
          if (st.done) return;
          for (var q = 0; q < numIdx.length; q++) { var j = numIdx[q]; if (!val[j]) { val[j] = String(n); chipAt[j] = c; draw(); return; } }
        }, "数字卡 " + n);
        b.className = "chip";
        chipBtns.push(chipRow.appendChild(b));
      });
      var ctr = h("div", "ctrls"); root.appendChild(ctr);
      var go = ctr.appendChild(btn("好了", check, "检查算式"));
      ctr.appendChild(btn("重来", function () {
        val = S.map(function (s) { return s.t === "o" && fixedOps ? fixedOps[s.k] : ""; });
        chipAt = S.map(function () { return -1; });
        st.done = false; fb.textContent = ""; fb.className = "fb"; root.classList.remove("done"); draw();
      }));
      fb = h("p", "fb"); fb.setAttribute("aria-live", "polite"); root.appendChild(fb);
    } else {
      ui = panel(root);
      "0123456789".split("").forEach(function (d) { ui.ctr.appendChild(btn(d, function () { key(d); })); });
      if (opIdx.length) {
        ui.ctr.appendChild(btn("+", function () { key("+"); }));
        ui.ctr.appendChild(btn("−", function () { key("−"); }));
      }
      ui.ctr.appendChild(btn("⌫", function () { key("del"); }, "删掉"));
      ui.ctr.appendChild(btn("好了", check));
      ui.ctr.appendChild(btn("重来", function () {
        val = S.map(function (s) { return s.t === "o" && fixedOps ? fixedOps[s.k] : ""; });
        st.cur = numIdx[0]; st.done = false; draw(); readout(ui.read, "从第一个方框填起。"); logI("reset");
      }));
    }
    function next() { for (var j = 0; j < S.length; j++) if (editable[j] && !val[j]) return j; return st.cur; }
    function key(k) {
      if (st.done) return;
      if (k === "del") {
        if (!val[st.cur]) { var p = st.cur - 1; while (p >= 0 && !editable[p]) p--; if (p >= 0) st.cur = p; }
        val[st.cur] = ""; draw(); return;
      }
      if (k === "+" || k === "−") {
        var tgt = S[st.cur].t === "o" ? st.cur : -1;
        if (tgt < 0) opIdx.some(function (j) { if (!val[j]) { tgt = j; return true; } return false; });
        if (tgt < 0) tgt = opIdx[0];
        val[tgt] = k; st.cur = next(); draw(); return;
      }
      if (S[st.cur].t === "o") { readout(ui.read, "圆圈里填加号或减号。", "圆圈里填加号或减号。", "no"); return; }
      val[st.cur] = k; st.cur = next(); draw();
    }
    function draw() {
      var firstEmpty = -1;
      for (var q = 0; q < numIdx.length; q++) if (!val[numIdx[q]]) { firstEmpty = numIdx[q]; break; }
      nodes.forEach(function (b, j) {
        if (!editable[j]) return;
        if (S[j].t === "o" && chips) { b.textContent = val[j] || "○"; return; }
        b.textContent = val[j];
        b.classList.toggle("on", chips ? j === firstEmpty && !st.done : j === st.cur && !st.done);
      });
      if (chips) {
        chipBtns.forEach(function (c, ci) { c.disabled = st.done || chipAt.indexOf(ci) >= 0; });
        go.disabled = st.done;
      }
    }
    function tell(ok, msg, cls, verdict) {
      /* PY-216：判题结果前加 ✓/✗；朗读文字不变（音频按文字取） */
      var shown = verdict && P0() && P0().verdictPrefix ? P0().verdictPrefix(!!ok, msg) + msg : msg;
      if (chips) { fb.className = "fb " + cls; fb.textContent = shown; }
      else readout(ui.read, shown, sayOf(msg), cls === "tip" ? "no" : cls);
    }
    /* 看图列式（两个数 + 得数）的判法，提示来自约束卡的常见迷思 */
    function judgeKind(x, op, y, z) {
      if (kind === "add") {
        var a = A.a, b = A.b, n = a + b;
        if (op === "−") return [0, "大括号把两部分合起来，问号问的是一共。合起来，用加号。"];
        var same = x === a && y === b, swap = x === b && y === a;
        if ((same || swap) && z === n) return [1, swap && a !== b ? "也对！换个位置，得数一样。照图从左往右写，就是 " + a + " + " + b + " = " + n + "。一共有 " + n + " " + unit + "。" : "对了！一共有 " + n + " " + unit + "。"];
        if (same || swap) return [0, a + " 只和 " + b + " 只合起来是几只？再数一数。"];
        if (A.extra && (x + y === n + A.extra || z === n + A.extra)) return [0, "大括号外面的不算。只数大括号里的两部分。"];
        return [0, "先数一数：一部分有几只？另一部分有几只？"];
      }
      var t = A.total, g = A.gone, l = t - g;
      if (op === "+") return [0, "问号问的是剩下的那部分，一共已经知道了，是 " + t + " 只。加起来会比一共还多，不对。从一共里去掉一些，用减号。"];
      if (x === g && y === t) return [0, "减法第一个数写一共的 " + t + " 只。" + g + " 只里拿不出 " + t + " 只。"];
      if (x === l && x !== t) return [0, "第一个数要写一共有几只：" + t + " 只，不是剩下的。"];
      if (x === t && y === l && z === g) return [0, A.seen ? "看得见的 " + g + " 只是走了的。剩下的藏起来了，问号在那儿。要从 " + t + " 只里去掉走了的 " + g + " 只。" : "问号在剩下的那部分上。要从 " + t + " 只里去掉走了的 " + g + " 只。"];
      if (x === t && y === g && z === l) return [1, "对了！" + t + " − " + g + " = " + l + "，还剩 " + l + " " + unit + "。"];
      if (x === t && y === g) return [0, t + " 只去掉 " + g + " 只，还剩几只？倒着数时 " + t + " 不算。"];
      return [0, "先看图：一共有几只？走了几只？问号在哪儿？"];
    }
    function same(a, b) { return a.slice().sort().join() === b.slice().sort().join(); }
    function calc(xs, os) { var v = xs[0]; for (var q = 1; q < xs.length; q++) v = os[q - 1] === "+" ? v + xs[q] : v - xs[q]; return v; }
    function check() {
      if (st.done) return;
      var xs = [], os = [], z = null;
      S.forEach(function (s, j) { if (s.t === "n") xs.push(val[j] === "" ? null : +val[j]); else if (s.t === "o") os.push(val[j]); else z = val[j] === "" ? null : +val[j]; });
      if (chips) {
        var cnt = numIdx.length;
        if (xs.indexOf(null) >= 0 || (hasRes && z === null)) return tell(0, (cnt === 3 ? "三" : cnt === 2 ? "两" : cn(cnt)) + "个格子都要放一个数。", "tip");
        if (os.indexOf("") >= 0) return tell(0, "圆圈里还要点出 + 或 −。", "tip");
      } else if (val.some(function (v, j) { return editable[j] && !v; })) return tell(0, "还有空格没填。", "no");
      st.tries++;
      var ok, msg;
      var text = xs.map(function (x, q) { return x + (q < os.length ? os[q] : ""); }).join("") + (hasRes ? "=" + z : "");
      var qid = id || root.getAttribute("data-id") || ("eqbuild-" + (kind || "eq"));
      if (kind) {
        var r = judgeKind(xs[0], os[0], xs[1], z); ok = !!r[0]; msg = r[1];
        if (P0()) P0().log("eq", { id: qid, v: val.join(" "), correct: ok, _emitted: true });
      } else {
        var opsOk = os.join() === opsAns.join();
        var exact = opsOk && xs.join() === ans.join();
        ok = exact || (!!cfg.anyOrder && opsOk && same(xs, ans));
        if (ok && hasRes && z !== calc(ans, opsAns)) { ok = false; msg = cfg.hintResult || "得数再算一算。"; }
        else if (ok) msg = exact ? (cfg.ok || "对了！照事情先后写的。") : (cfg.tipOrder || "也对，得数一样！照事情先后写更清楚。");
        else if (!same(xs, ans)) msg = cfg.hintOther || "有一个数和这件事没关系。再看一看图。";
        else if (!opsOk) msg = cfg.hintOp || "来了用加，走了用减。再看一看每一步。";
        else if (xs[0] !== ans[0]) msg = cfg.hintFirst || "原来有几个，要写在最前面。";
        else msg = cfg.hintOrder || "照事情先后写。";
        if (P0()) P0().log("fill", { id: qid, value: text, correct: ok, first: st.tries === 1, _emitted: true });
      }
      try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: { id: qid, value: kind ? val.join(" ") : text, correct: ok, first: st.tries === 1 }, bubbles: true })); } catch (e) { /* ignore */ }
      if (ok) { st.done = true; if (chips) root.classList.add("done"); }
      draw();
      tell(ok, msg, ok ? "ok" : "no", true);
      emit(root, { value: text, correct: ok });
    }
    draw();
    if (!chips) readout(ui.read, "从第一个方框填起。");
  }

  /* ===================== beadruler 单杆计数器 + 尺子 ===================== */
  function beadruler(root, cfg) {
    var init = int(cfg.n, 0, 10, 0), st = { n: init, moves: 0, reported: false };
    var svg = el("svg", { viewBox: "0 0 360 300", class: "stage", role: "group", "aria-label": "一根杆的计数器和一把尺子" }, root);
    var ui = panel(root), read = ui.read;
    var bAdd = ui.ctr.appendChild(btn("添 1 颗", function () { set(st.n + 1); }));
    var bSub = ui.ctr.appendChild(btn("拿走 1 颗", function () { set(st.n - 1); }));
    ui.ctr.appendChild(btn("重来", function () { st.moves = 0; st.reported = false; set(init, true); }));
    function set(v, isReset) {
      v = Math.max(0, Math.min(10, v));
      if (v === st.n && !isReset) return;
      st.n = v;
      if (!isReset) st.moves++;
      draw();
      logI("beads", { n: v });
      if (!isReset && (st.n === 10 || st.moves >= 1) && !st.reported) {
        st.reported = true;
        emitAns(root, cfg, String(st.n), true, true);
      }
    }
    var X = function (i) { return 30 + i * 27; };
    function draw() {
      clear(svg);
      el("rect", { x: 110, y: 176, width: 140, height: 16, rx: 4, style: "fill:var(--b)" }, svg);
      el("line", { x1: 180, y1: 18, x2: 180, y2: 176, style: "stroke:var(--fg);stroke-width:4" }, svg);
      for (var i = 0; i < st.n; i++)
        el("ellipse", { cx: 180, cy: 166 - i * 14.5, rx: 30, ry: 7, style: "fill:" + (i === 9 ? "var(--b)" : "var(--a)") + ";stroke:var(--card);stroke-width:1.5" }, svg);
      el("line", { x1: X(0) - 10, y1: 236, x2: X(10) + 50, y2: 236, style: "stroke:var(--fg);stroke-width:2.5" }, svg);
      for (i = 0; i <= 12; i++) {
        var x = X(i), on = i === st.n;
        el("line", { x1: x, y1: 228, x2: x, y2: 244, style: "stroke:" + (i > 10 ? "var(--muted)" : "var(--fg)") + ";stroke-width:2" + (i > 10 ? ";stroke-dasharray:3 3" : "") }, svg);
        if (i > 10) continue;
        var g = el("g", { class: "part", tabindex: "0", role: "button", "aria-label": "尺子上的 " + i + "，点一下拨成 " + i + " 颗" }, svg);
        el("rect", { x: x - 13, y: 246, width: 26, height: 44, style: "fill:transparent" }, g);
        if (on) el("circle", { cx: x, cy: 266, r: 15, style: "fill:var(--a)" }, g);
        el("text", { x: x, y: 272, "text-anchor": "middle", style: "fill:" + (on ? "#fff" : "var(--fg)") + ";font-size:" + (i === 10 ? 16 : 18) + "px;font-weight:700" }, g).textContent = String(i);
        (function (v, node) { activate(node, function () { set(v); }); })(i, g);
      }
      el("text", { x: X(11) + 14, y: 222, "text-anchor": "middle", style: "fill:var(--muted);font-size:18px" }, svg).textContent = "…";
      el("path", { d: "M" + X(st.n) + " 224 l-7 -12 h14 z", style: "fill:var(--a)" }, svg);
      bAdd.disabled = st.n >= 10; bSub.disabled = st.n <= 0;
      var txt, say;
      if (st.n === 0) { txt = "一颗也没有，是 0。"; say = "一颗也没有，是零"; }
      else if (st.n < 10) { txt = "有 " + st.n + " 颗。尺子上，" + st.n + " 的后面是 " + (st.n + 1) + "。"; say = "有" + cq(st.n) + "颗。尺子上，" + cn(st.n) + "的后面是" + cn(st.n + 1); }
      else { txt = "10 颗！9 颗再添 1 颗，是 10 颗。"; say = "十颗！九颗再添一颗，是十颗"; }
      readout(read, txt, say, st.n === 10 ? "ok" : "");
      emit(root, { n: st.n });
    }
    draw();
  }

  /* ===================== crossframe 十格阵点一个划一个 ===================== */
  function crossframe(root, cfg) {
    var st = { x: [], reported: false };
    var svg = el("svg", { viewBox: "0 0 360 150", class: "stage", role: "group", "aria-label": "十格阵，点一个点把它划掉" }, root);
    var ui = panel(root), read = ui.read;
    ui.ctr.appendChild(btn("全划掉", function () { st.x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; draw(-1); log(); }));
    ui.ctr.appendChild(btn("重来", function () { st.x = []; st.reported = false; draw(-1); log(); }));
    function log() { logI("cross", { n: st.x.length }); }
    function draw(focusI) {
      clear(svg);
      el("rect", { x: 55, y: 20, width: 250, height: 100, rx: 6, style: "fill:none;stroke:var(--fg);stroke-width:2.5" }, svg);
      for (var i = 0; i < 10; i++) {
        var cx = 80 + (i % 5) * 50, cy = 45 + Math.floor(i / 5) * 50, gone = st.x.indexOf(i) >= 0;
        el("rect", { x: cx - 25, y: cy - 25, width: 50, height: 50, style: "fill:var(--card);stroke:var(--line);stroke-width:2" }, svg);
        var g = el("g", { class: "part", tabindex: "0", role: "button", "aria-pressed": gone ? "true" : "false", "aria-label": gone ? "划掉了，点一下放回来" : "点一下划掉" }, svg);
        el("circle", { cx: cx, cy: cy, r: 17, style: "fill:var(--a)" + (gone ? ";opacity:.3" : "") }, g);
        if (gone) el("line", { x1: cx - 17, y1: cy + 17, x2: cx + 17, y2: cy - 17, style: "stroke:var(--no);stroke-width:4;stroke-linecap:round" }, g);
        (function (k, node) {
          activate(node, function () { var j = st.x.indexOf(k); if (j >= 0) st.x.splice(j, 1); else st.x.push(k); draw(k); log(); });
        })(i, g);
        if (i === focusI) g.focus();
      }
      var n = st.x.length, r = 10 - n, txt, say;
      if (n === 0) { txt = "一个也不划：10 − 0 = 10"; say = "一个也不划：十减零等于十"; }
      else if (n === 10) { txt = "全划掉了：10 − 10 = 0"; say = "全划掉了：十减十等于零"; }
      else { txt = "划掉 " + n + " 个，还剩 " + r + " 个：10 − " + n + " = " + r; say = "划掉" + cq(n) + "个，还剩" + cq(r) + "个：十减" + cn(n) + "等于" + cn(r); }
      readout(read, txt, say, "ok");
      if (n > 0 && !st.reported) { st.reported = true; emitAns(root, cfg || {}, "10-" + n + "=" + r, true, true); }
      emit(root, { crossed: n, left: r });
    }
    draw(-1);
  }

  /* ===================== twostep 连加连减、加减混合分步动画 ===================== */
  function twostep(root, cfg) {
    var start = int(cfg.start, 0, 10, 3), noun = cfg.noun || "只";
    var steps = (Array.isArray(cfg.steps) && cfg.steps.length >= 2 ? cfg.steps.slice(0, 2) : [["+", 4], ["+", 2]]).map(function (s) {
      return [normOp(s && s[0]) === "−" ? "-" : "+", int(s && s[1], 0, 10, 1)];
    });
    var labels = Array.isArray(cfg.labels) && cfg.labels.length >= 2 ? cfg.labels : steps.map(function (s, k) {
      return (k ? "又" : "先") + (s[0] === "+" ? "来 " : "走 ") + s[1] + " " + noun;
    });
    function ap(v, s) { var r = s[0] === "+" ? v + s[1] : v - s[1]; return Math.max(0, Math.min(10, r)); }
    var v1 = ap(start, steps[0]), v2 = ap(v1, steps[1]);
    var items = [];
    for (var i = 0; i < start; i++) items.push({ g: 0 });
    steps.forEach(function (s, k) { if (s[0] === "+") for (var j = 0; j < s[1]; j++) items.push({ g: k + 1 }); });
    var N = Math.min(items.length, 10);
    items = items.slice(0, N);
    var st = { s: 0, reported: false };
    var svg = el("svg", { viewBox: "0 0 360 210", class: "stage", role: "img" }, root);
    var ui = panel(root), read = ui.read;
    var b1 = btn(labels[0], function () { if (st.s === 0) { st.s = 1; draw(true); log(); } });
    var b2 = btn(labels[1], function () { if (st.s === 1) { st.s = 2; draw(true); log(); } });
    ui.ctr.appendChild(b1); ui.ctr.appendChild(b2);
    ui.ctr.appendChild(btn("重来", function () { st.s = 0; st.reported = false; draw(false); log(); }));
    function log() { logI("twostep", { step: st.s }); }
    var COLS = ["var(--a)", "var(--b)", "var(--c)"];
    var sp = 32, x0 = 180 - (N - 1) * sp / 2;
    function opWord(o) { return o === "+" ? "加" : "减"; }
    function draw(animate) {
      clear(svg);
      var shown = [], removed = [];
      items.forEach(function (it, j) { shown[j] = it.g === 0 || (it.g <= st.s); removed[j] = 0; });
      for (var k = 1; k <= st.s; k++) {
        var s = steps[k - 1];
        if (s[0] === "-") {
          var left = s[1];
          for (var j = N - 1; j >= 0 && left > 0; j--) if (shown[j] && items[j].g < k && !removed[j]) { removed[j] = k; left--; }  // 只从这一步之前就在的里面走
        }
      }
      var newest = st.s;
      items.forEach(function (it, j) {
        if (!shown[j]) return;
        var cx = x0 + j * sp, g = el("g", {}, svg);
        if (animate && it.g === newest && it.g > 0) g.setAttribute("class", "arrive");
        el("circle", { cx: cx, cy: 50, r: 13, style: "fill:" + COLS[it.g] + (removed[j] ? ";opacity:.3" : "") }, g);
        if (removed[j]) {
          var ln = el("line", { x1: cx - 13, y1: 64, x2: cx + 13, y2: 36, style: "stroke:var(--no);stroke-width:3" }, g);
          if (animate && removed[j] === newest) ln.setAttribute("class", "strike");
        }
      });
      // 第二次走的：红虚线框
      if (st.s >= 2 && steps[1][0] === "-") {
        var idx = []; removed.forEach(function (r, j) { if (r === 2) idx.push(j); });
        if (idx.length) {
          var xa = x0 + idx[0] * sp - 17, xb = x0 + idx[idx.length - 1] * sp + 17;
          el("rect", { x: xa, y: 30, width: xb - xa, height: 40, rx: 18, style: "fill:none;stroke:var(--no);stroke-width:2.5;stroke-dasharray:6 4" }, svg);
        }
      }
      // 各部分之间画虚线隔开
      items.forEach(function (it, j) {
        if (shown[j] && j > 0 && items[j - 1].g !== it.g) { var gx = x0 + (j - 0.5) * sp; el("line", { x1: gx, y1: 26, x2: gx, y2: 74, style: "stroke:var(--muted);stroke-width:2;stroke-dasharray:4 4" }, svg); }
      });
      // 算式
      var tok = [String(start), steps[0][0] === "+" ? "+" : "−", String(steps[0][1]), steps[1][0] === "+" ? "+" : "−", String(steps[1][1]), "=", st.s === 2 ? String(v2) : "?"];
      var tx = [60, 100, 140, 180, 220, 260, 300];
      tok.forEach(function (t, k) {
        var col = "var(--fg)";
        if (k <= 2 && st.s >= 1) col = "var(--a)";
        if ((k === 3 || k === 4) && st.s >= 2) col = "var(--a)";
        if (k === 6 && st.s === 2) col = "var(--a)";
        if (k === 6 && st.s < 2) col = "var(--muted)";
        el("text", { x: tx[k], y: 132, "text-anchor": "middle", style: "fill:" + col + ";font-size:30px;font-weight:700" }, svg).textContent = t;
      });
      if (st.s >= 1) {
        el("path", { d: "M60 142 L60 152 L140 152 L140 142 M100 152 L100 166", style: "fill:none;stroke:var(--a);stroke-width:2.5" }, svg);
        var showV = !(cfg.ask1 && st.s === 1);
        el("rect", { x: 78, y: 166, width: 44, height: 36, rx: 10, style: "fill:var(--card);stroke:var(--a);stroke-width:2.5" + (showV ? "" : ";stroke-dasharray:5 4") }, svg);
        el("text", { x: 100, y: 192, "text-anchor": "middle", style: "fill:var(--a);font-size:24px;font-weight:700" }, svg).textContent = showV ? String(v1) : "?";
      }
      b1.disabled = st.s !== 0; b2.disabled = st.s !== 1;
      var txt, say;
      if (st.s === 0) { txt = "原来有 " + start + " " + noun + "。"; say = "原来有" + cq(start) + noun; }
      else if (st.s === 1) {
        if (cfg.ask1) { txt = labels[0] + "。现在有几" + noun + "？数一数。"; say = labels[0].replace(/\s*(\d+)\s*/g, function (m, d) { return cq(+d); }) + "，现在有几" + noun + "？"; }
        else { txt = start + " " + opWord(steps[0][0]) + " " + steps[0][1] + " 得 " + v1 + "。"; say = cn(start) + opWord(steps[0][0]) + cn(steps[0][1]) + "得" + cn(v1); }
      } else { txt = start + " " + opWord(steps[0][0]) + " " + steps[0][1] + " 得 " + v1 + "，" + v1 + " " + opWord(steps[1][0]) + " " + steps[1][1] + " 得 " + v2 + "。"; say = cn(start) + opWord(steps[0][0]) + cn(steps[0][1]) + "得" + cn(v1) + "，" + cn(v1) + opWord(steps[1][0]) + cn(steps[1][1]) + "得" + cn(v2); }
      readout(read, txt, say, st.s === 2 ? "ok" : "");
      if (st.s === 2 && !st.reported) { st.reported = true; emitAns(root, cfg, String(v2), true, true); }
      svg.setAttribute("aria-label", txt);
      emit(root, { step: st.s, v1: v1, v2: v2 });
    }
    draw(false);
  }

  M.register("tapcount", tapcount);
  M.register("alignrows", alignrows);
  M.register("lineup", lineup);
  M.register("splitlog", splitlog);
  M.register("brace", brace);
  M.register("eqbuild", eqbuild);
  M.register("beadruler", beadruler);
  M.register("crossframe", crossframe);
  M.register("twostep", twostep);
})();
