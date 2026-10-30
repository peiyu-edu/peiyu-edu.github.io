/* 培玉 · 小学数学 — 公共教具：乘法竖式。登记三个 kind：shushi、vsfig、kuai。
   页面写法（放在 manip.js 后面加载）：
     <div class="manip" data-manip="shushi" data-cfg='{"a":18,"b":3}'></div>
     <script defer src="../p-assets/kits/shushi.js"></script>
   所有数由代码算；鼠标、触屏、键盘都能用；有「重来」；颜色只用 CSS 变量；变化时抛 manip:change。

   ── shushi 乘法竖式 ────────────────────────────────────────────────
   乘数是一位数或两位数（去掉末尾的 0 以后最多两位）。示范模式点「上一步 / 下一步」一步一步出来；
   练习模式孩子用数字键盘一格一格地填，填错的格给迷思提示（漏加进位、乘了进位、进位整个写进积、没乘照抄、
   乘法当加法、0 乘几、末尾 0 没落；两位数乘数还有：用错乘数那一位、第一次的进位带进第二次、加的时候漏进位 / 只加一个数、
   积末尾添 0 的个数数错）。点竖式里的数，读出它在哪一位、表示几个十 / 几个百。
   两套说法和画法：乘数是一位数时用三上的（「用 3 乘十位上的 5，积的十位写几？」），
   乘数是两位数时用四上的（第一次乘 / 第二次乘，两行乘得的数再加起来，两次的进位各管各的，用完的进位划掉变淡）。
   cfg（都可省）：
     a, b         两个乘数（b 比 a 位数多时自动交换，位数多的放上面）。
     qs           练习题组 [[a, b, {tz:true}], …]，有两题以上出「换一题」；有 qs 时忽略 a、b、tz。
     mode         "demo"（默认，示范）| "practice"（练习）。
     id           学习记录里的题号（记成 id-第几题）。
     layout       "simple"（默认，简便写法）| "full"（完整写法：每一位乘得的积单写一行，旁边注明谁乘谁，再加起来；只用于一位数乘数）。
     toggle       true：出「看完整的竖式 / 看简便的写法」切换按钮。
     carry        进位单独成一步：示范时写下这一位的积之后进位小数字才出现；练习时每一位都问「要进几」（不满十点「不进位」）。
                  默认：一位数乘数 true，两位数乘数 false（四上：进位随积一起出现，不单独问）。两位数乘数设 true 时，两次乘的进位也逐位问。
     order        "any"：练习时不限从哪一位填起（点格子、点上面的数或用 ← → 选格；只宜用于不进位的题）。
     tz           true：末尾有 0 的乘法，0 前面的数对齐，0 伸到右边，乘完再处理末尾的 0。
     zeros        末尾 0 的处理：「drop」一格一格把 0 落下来（三上，默认于一位数乘数）| 「count」只问「积的末尾添几个 0」（四上，默认于两位数乘数；
                  乘数本身末尾也有 0 时总是 count）。
     tzToggle     true：出「一位数写在个位下面 / 一位数写在 0 前面那一位下面」切换按钮。
     est          true：算完给估算检验（一位数乘数：a 在哪两个整十 / 整百数之间；两位数乘数：只用于两位数乘两位数，b 在哪两个整十数之间）。
     swap         true：出「交换乘数再算」（两个乘数位数相同时可按）。
     labels       false：不显示上方的「千 百 十 个」。
     ver          3 | 4：强制用三上 / 四上的说法和画法（默认按乘数位数自动选）。
   典型配置：
     {"a":18,"b":3}                                         示范，一次进位
     {"a":31,"b":3,"layout":"full","toggle":true}           完整写法 ↔ 简便写法
     {"qs":[[44,2],[322,3]],"mode":"practice","order":"any","carry":false,"id":"p1"}   不进位练习，不限顺序
     {"a":230,"b":4,"tz":true,"tzToggle":true}              末尾有 0，切换对齐
     {"a":47,"b":26,"est":true,"swap":true}                 两位数乘两位数，估算 + 交换
     {"a":360,"b":50,"tz":true,"mode":"practice","id":"t"}  积的末尾添几个 0
   原来用在：p3a-u4-1…7（三上 多位数乘一位数）、p4a-u3-1…7（四上 两位数乘两位数）。

   ── vsfig 静态竖式图（题目、对错对比卡用）──────────────────────────
   只画图，不能点。外框去掉，看起来就是一张图（放在 .pair 卡里时宽度跟 .pair svg 的规则走）。
   cfg：a, b；rows [[数字串, 从个位往左挪几格], …] 乘得的几行；sum 积（可省）；
        bad [行号…] 这些行标红（行号从 0 数：乘得的第一行是 0，积是 rows.length）；faint [行号…] 那一行个位的数画淡；
        maxWidth 图最宽多少 px（默认 300，放在 .pair 里是 160）。
   例：{"a":23,"b":12,"rows":[["46",0],["23",1]],"sum":"276"}；{"a":38,"b":26,"rows":[["228",0],["80",1]],"sum":"1028","bad":[1,2]}
   原来用在：p4a-u3-2、p4a-u3-3（原写法 <svg data-vs='…'>）。

   ── kuai 小方块（百板 / 十条 / 单块）────────────────────────────────
   一行是一组，几组就是乘几。「圈百板 / 圈十条 / 圈单块」，读数里写出横式的一行（10 × 3 = 30，3 个十）；都圈了自动「合起来」。
   满十换一：10 个单块换 1 条十、10 条十换 1 块百板，换来的放在最下面一行、换颜色，换走的变淡。
   cfg：h, t, u 每组几块百板、几条十、几个单块（默认 0）；g 几组（默认 2）；
        edit ["h","t","u","g"] 哪些数能用 − / + 调；max {h,t,u,g} 上限（默认 3, 4, 9, 5）；
        noCarry true 调数时不让乘出满十；merge true 可以「满十换一」；
        smallU true 单块按十条的十分之一画（小一些，四上）；默认画大一点的单块（三上）。
   例：{"t":3,"g":3,"edit":["t","g"],"max":{"t":4,"g":4},"merge":true}；{"t":1,"u":7,"g":4,"merge":true,"edit":["u","g"],"max":{"g":6},"smallU":true}
   原来用在：p3a-u4-1、p3a-u4-2、p3a-u4-3、p4a-u3-1。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U8 = window.PeiyuManip.util, h = U8.h, btn = U8.btn, activate = U8.activate, emit = U8.emit, logI = U8.log;
  var P = function () { return window.PeiyuP; };
  var PLACE = ["个位", "十位", "百位", "千位", "万位", "十万位"], UNIT = ["一", "十", "百", "千", "万", "十万"], SHORT = ["个", "十", "百", "千", "万", "十万"];
  function el(tag, attrs, parent, text) { var e = U8.el(tag, attrs, parent); if (text != null) e.textContent = text; return e; }
  function spoken(s) {
    return String(s).replace(/<[^>]+>/g, "").replace(/×/g, "乘").replace(/÷/g, "除以").replace(/=/g, "等于").replace(/\+/g, "加")
      .replace(/</g, "小于").replace(/>/g, "大于").replace(/……/g, "，");
  }
  /* 读数：朗读的话从读数文字自动转（× 读「乘」、= 读「等于」……） */
  function readout(node, html, cls) {
    node.className = "read" + (cls ? " " + cls : "");
    node.innerHTML = html;
    var s = spoken(node.textContent), p = P();
    if (document.body.classList.contains("low") && p && s.trim()) { var b = p.sayButton(s); b.addEventListener("click", function () { p.say(s, b); }); node.appendChild(b); }
  }
  /* PY-216：每次提交都要用文字说对 / 不对（旧页内副本用 VP 拼的），前缀由 PeiyuP 统一拼 */
  function verdict(ok, t) { var p = P(); return p ? (ok ? p.okText(t) : p.noText(t)) : t; }
  function digs(n) { return String(n).split("").reverse().map(Number); }
  function pow(j) { return Math.pow(10, j); }
  function stepper(label, get, set, unit) {
    var w = h("span", "count"), b = h("b", "", "");
    var minus = btn("−", function () { set(get() - 1); }, "少一个：" + label), plus = btn("+", function () { set(get() + 1); }, "多一个：" + label);
    w.appendChild(h("span", "", label)); w.appendChild(minus); w.appendChild(b); w.appendChild(plus);
    if (unit) w.appendChild(h("span", "", unit));
    w.sync = function (canDown, canUp) { b.textContent = get(); minus.disabled = !canDown; plus.disabled = !canUp; };
    return w;
  }
  var styled = false;
  function injectStyle() {
    if (styled) return; styled = true;
    var s = document.createElement("style");
    s.textContent = '.manip[data-manip="vsfig"]{background:none;border:0;padding:0;margin:0;border-radius:0}';
    document.head.appendChild(s);
  }
  function emitAns(root, cfg, value, correct, first, suffix) {
    var kind = (root && root.getAttribute("data-manip")) || "shushi";
    var all = document.querySelectorAll('.manip[data-manip="' + kind + '"]');
    var idx = [].indexOf.call(all, root);
    var qid = ((cfg && cfg.id) || (root && root.getAttribute("data-id")) || (root && root.id) || (kind + (idx > 0 ? "-" + (idx + 1) : ""))) + (suffix != null ? "-" + suffix : "");
    root.setAttribute("data-lab-id", qid);
    var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(first) };
    try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
    var p = P();
    if (p) p.log("lab", Object.assign({ _emitted: true }, detail));
  }

  /* ===================== shushi 乘法竖式 ===================== */
  function shushi(root, cfg) {
    var practice = cfg.mode === "practice", anyOrder = cfg.order === "any";
    var qs = (cfg.qs || [[cfg.a, cfg.b, { tz: !!cfg.tz }]]).map(function (q) { return q.slice(); }), qi = 0, st;
    var CW = 44;
    var svg = el("svg", { class: "stage", role: "group", "aria-label": "乘法竖式", tabindex: "0" });
    var read = h("p", "read"); read.setAttribute("aria-live", "polite");
    var padWrap = h("div", "q"), pad = h("div", "pad"), ctr = h("div", "ctrls");
    padWrap.style.cssText = "display:flex;justify-content:center;margin:8px 0";
    root.appendChild(svg); root.appendChild(read);
    if (practice) { padWrap.appendChild(pad); root.appendChild(padWrap); }
    root.appendChild(ctr);
    "1234567890".split("").forEach(function (d) { pad.appendChild(btn(d, function () { input(+d); })); });
    var noCarry = btn("不进位", function () { input("none"); });
    noCarry.className = "go"; pad.appendChild(noCarry);
    var skip0 = btn("这一格空着", function () { input("skip"); });
    skip0.className = "go"; pad.appendChild(skip0);

    function tzOf(n) { var z = 0; while (n >= 10 && n % 10 === 0) { n /= 10; z++; } return z; }
    function digAt(n, i) { var s = String(n); return i < s.length ? +s.charAt(s.length - 1 - i) : null; }
    function cellsOf(row, col, v) { return digs(v).map(function (d, i) { return { row: row, col: col + i, v: d }; }); }
    /* 算出每一步。mul 步：j 是 0 前面那个数的第几位，pa 是它在原数里的数位，ac 是它在竖式里的列，col 是积写在哪一列。 */
    function plan(a, b, layout, tz) {
      var steps = [], rows = [], j, k, c, v, last, co, rid;
      if (layout === "full" && String(b).length === 1) {
        var A0 = digs(a);
        for (j = 0; j < A0.length; j++) {
          rid = "r" + j; rows.push(rid);
          var pv = A0[j] * pow(j) * b;
          steps.push({ t: "row", j: j, pa: j, ac: j, k: 0, d: A0[j], bd: b, m: A0[j] * b, pv: pv, cells: cellsOf(rid, 0, pv) });
        }
        steps.push({ t: "sum", cells: cellsOf("s", 0, a * b) });
        return { A: A0, B: [b], P: a * b, Pc: a * b, ca: a, cb: b, za: 0, zb: 0, z: 0, steps: steps, rows: rows, two: false, full: true };
      }
      var za = tz ? tzOf(a) : 0, zb = tz ? tzOf(b) : 0, S = za + zb, ca = a / pow(za), cb = b / pow(zb);
      var A = digs(ca), B = digs(cb);
      var pl = { A: A, B: B, P: a * b, Pc: ca * cb, ca: ca, cb: cb, za: za, zb: zb, z: S, steps: steps, rows: rows, two: B.length > 1, full: false };
      for (k = 0; k < B.length; k++) {
        c = 0; rid = pl.two ? "r" + k : "s";
        if (pl.two) rows.push(rid);
        if (k) steps.push({ t: "ph", k: 1, cells: [{ row: rid, col: S, v: 0 }] });
        for (j = 0; j < A.length; j++) {
          v = A[j] * B[k] + c; last = j === A.length - 1; co = last ? 0 : Math.floor(v / 10);
          steps.push({ t: "mul", j: j, k: k, pa: za + j, ac: S + j, col: S + j + k, d: A[j], bd: B[k], m: A[j] * B[k], cin: c, v: v, last: last, co: co,
            cells: cellsOf(rid, S + j + k, last ? v : v % 10) });
          c = co;
        }
      }
      if (pl.two) {
        var R0 = ca * B[0], R1 = ca * B[1], top = Math.max(String(R0).length, String(R1).length + 1);
        pl.R = [R0, R1]; c = 0;
        for (var i = 0; i < top; i++) {
          var x = digAt(R0, i), y = i ? digAt(R1, i - 1) : null;
          v = (x || 0) + (y || 0) + c; last = i === top - 1; co = last ? 0 : Math.floor(v / 10);
          steps.push({ t: "add", col: S + i, x: x, y: y, cin: c, v: v, last: last, co: co, cells: cellsOf("s", S + i, last ? v : v % 10) });
          c = co;
        }
      }
      if (S) { var zc = []; for (j = 0; j < S; j++) zc.push({ row: "s", col: j, v: 0 }); steps.push({ t: "drop", n: S, cells: zc }); }
      return pl;
    }
    function key(c) { return c.row + ":" + c.col; }
    function setup(keep) {
      var q = qs[qi], o = q[2] || {};
      if (String(q[1]).length > String(q[0]).length) { var t = q[0]; q[0] = q[1]; q[1] = t; }   /* 位数多的放上面 */
      var v4 = cfg.ver ? +cfg.ver === 4 : String(q[1]).length > 1;
      var layout = keep && st ? st.layout : (cfg.layout || "simple");
      var tz = keep && st ? st.tz : !!(o.tz || cfg.tz);
      st = { a: q[0], b: q[1], v4: v4, layout: layout, tz: tz, pos: 0, fill: {}, faint: {}, wrong: null, hint: "", done: false, errs: 0, hl: -1, msg: "",
        ask: cfg.carry === undefined ? !v4 : !!cfg.carry };
      var pl = st.pl = plan(st.a, st.b, layout, tz);
      st.count = pl.zb > 0 || (cfg.zeros ? cfg.zeros === "count" : v4);
      svg.style.maxWidth = (v4 ? 460 : 420) + "px";
      st.subs = []; st.slots = [];
      pl.steps.forEach(function (s, si) {
        st.subs.push({ s: si, part: "w" });
        if (st.ask && s.t === "mul" && s.co > 0) st.subs.push({ s: si, part: "c" });
        if (s.t === "drop" && st.count) st.slots.push({ s: si, kind: "zn", row: "s", col: 0, v: s.n, key: "zn" });
        else s.cells.forEach(function (c, ci) {
          st.slots.push({ s: si, kind: s.t === "drop" ? "z" : s.t === "ph" ? "z0" : s.t === "mul" ? "p" : s.t === "row" ? "r" : "s", ci: ci, row: c.row, col: c.col, v: c.v, key: key(c) });
        });
        if (practice && st.ask && s.t === "mul" && !s.last)
          st.slots.push({ s: si, kind: "c", k: s.k, row: "b", col: s.ac + 1, v: s.co, key: (s.k ? "b" + s.k : "b") + ":" + (s.ac + 1) });
      });
      st.active = 0;
      draw();
    }
    /* ---------- 判对与迷思提示 ---------- */
    function diag(sl, v) {
      var pl = st.pl, s = pl.steps[sl.s], b = s.bd, v4 = st.v4;
      if (sl.kind === "zn") {
        var own = tzOf(pl.Pc);
        if (v === "skip") return "积的末尾要添几个 0？填个数。";
        if (v === pl.za || v === pl.zb) return "两个乘数末尾的 0 都要数：" + st.a + " 末尾有 " + pl.za + " 个，" + st.b + " 末尾有 " + pl.zb + " 个。";
        if (own && v === s.n + own) return pl.Pc + " 末尾自己带的 " + own + " 个 0 已经写好了，不算在添的里面。";
        return "数一数两个乘数末尾一共有几个 0，就添几个。";
      }
      if (sl.kind === "z0") {
        var nx = pl.steps[sl.s + 1], B1 = pl.B[1];
        return (v === nx.v % 10 && v !== 0 ? "这个 " + v + " 要写在十位上。" : "") + "第二次用十位上的 " + B1 + " 去乘，" + B1 + " 表示 " + B1 + " 个十，乘出来的是几十，末位要和十位对齐。个位这一格写 0，或者空着。";
      }
      if (sl.kind === "z") return "末尾的 0 先放在一边，乘完要把它落下来：这一格写 0。";
      if (v === "skip") return "这一格要写数，不能空着。";
      if (sl.kind === "s" && s.t === "sum") return "把横线上面几行同一位上的数加起来，从个位加起。";
      if (sl.kind === "s") {
        var parts = [s.x, s.y].filter(function (q) { return q !== null; });
        if (sl.ci === 1) return "最高位加得 " + s.v + "，直接写下来。";
        if (s.cin && v === (s.v - s.cin) % 10) return "别忘了加上后一位进上来的 1：" + parts.join(" + ") + " + 1 = " + s.v + "。";
        if (s.v >= 10 && v === Math.floor(s.v / 10)) return "加得 " + s.v + "，这一位只写 " + s.v % 10 + "，向前一位进 1。";
        if (parts.length > 1 && (v === s.x || v === s.y)) return "这一列上下两个数都要加：" + parts.join(" + ") + (s.cin ? " + 1" : "") + "。";
        return "把这一列的数加起来：" + parts.join(" + ") + (s.cin ? " + 进上来的 1" : "") + "，写几？";
      }
      if (sl.kind === "r") {
        var Ur = UNIT[s.pa];
        if (sl.col < s.pa) return "这一行是 " + s.d + " 个" + Ur + "乘 " + b + "，得几个" + Ur + "，写成数后面要有 " + s.pa + " 个 0。";
        return "这一行算的是 " + s.d * pow(s.pa) + " × " + b + "：" + s.d + " 个" + Ur + "乘 " + b + " 是几个" + Ur + "？";
      }
      var C = s.col, Uc = UNIT[C];
      if (sl.kind === "c") {
        if (v === "none" || v === 0) return s.v + " 个" + Uc + "里有 " + Math.floor(s.v / 10) + " 个" + UNIT[C + 1] + "，要向" + PLACE[C + 1] + "进 " + Math.floor(s.v / 10) + "。";
        if (sl.v === 0) return s.v + " 不满十，不用进位，点「不进位」。";
        if (v === s.v % 10) return s.v % 10 + " 已经写在积里了。进的是 " + s.v + " 个" + Uc + "里有几个" + UNIT[C + 1] + "。";
        if (v === s.cin) return "那是上一位进上来的小 " + s.cin + "，已经加过了。现在看 " + s.v + " 里有几个十。";
        return s.v + " 个" + Uc + "里有几个" + UNIT[C + 1] + "，就向前一位进几。";
      }
      if (v === "none") return "这一格要写积，不是进位。";
      if (sl.ci === 1) return "前面没有数位了，" + s.v + " 前面那一位直接" + (v4 ? "写下来。" : "写进积里。");
      var m = s.m, cin = s.cin;
      if (pl.two) {
        var other = pl.B[1 - s.k];
        if (other !== b && v === (s.d * other + cin) % 10 && v !== s.v % 10) return "这一次用" + (s.k ? "十位" : "个位") + "上的 " + b + " 去乘，不是 " + other + "。";
        if (s.k === 1) {
          var old = pl.steps.filter(function (x) { return x.t === "mul" && x.k === 0 && x.co > 0; }).map(function (x) { return x.co; });
          for (var oi = 0; oi < old.length; oi++)
            if (v === (m + cin + old[oi]) % 10 && v !== s.v % 10)
              return "那个小 " + old[oi] + " 是第一次乘时进的，已经用完划掉了。" + (cin ? "只加这一次进上来的小 " + cin + "。" : "这一位没有进上来的数：" + s.d + " × " + b + " = " + m + "。");
        }
      }
      if (cin && v === m % 10) return "先乘：" + s.d + " × " + b + " = " + m + "；再加上进上来的小 " + cin + "。";
      if (cin && (v === (s.d * cin) % 10 || v === ((s.d + cin) * b) % 10 || v === (m * cin) % 10))
        return "进上来的小 " + cin + " 只加，不乘：先算 " + s.d + " × " + b + "，再加 " + cin + "。";
      if (s.d === 0 && v === (b + cin) % 10) return "0 × " + b + " = 0，不是 " + b + "。" + (cin ? "0 再加上进上来的 " + cin + "。" : "这一格写 0 占位。");
      if (s.d === 0 && v === 0 && cin) return "0 × " + b + " = 0，还要加上进上来的小 " + cin + "。";
      if (s.v >= 10 && v === Math.floor(s.v / 10)) {
        if (v4) return "乘得 " + s.v + "：这一格只写 " + s.v % 10 + "，" + (s.last ? "前面的 " + Math.floor(s.v / 10) + " 写在它前面一格。" : Math.floor(s.v / 10) + " 进到前一位。");
        return "乘得 " + s.v + " 个" + Uc + "：" + PLACE[C] + "只写 " + s.v % 10 + "，" + (s.last ? "前面的 " + Math.floor(s.v / 10) + " 写在它前面一格。" : Math.floor(s.v / 10) + " 要进到" + PLACE[C + 1] + "。");
      }
      if (v === s.d && s.d !== s.v % 10) return (v4 ? "上面的 " : PLACE[s.pa] + "上的 ") + s.d + " 也要乘 " + b + "，不能照抄下来。";
      if (v === (s.d + b + cin) % 10 && s.d !== 0) return "这一位要用乘法：" + s.d + " × " + b + "，不是 " + s.d + " + " + b + "。";
      return cin ? "先算 " + s.d + " × " + b + "，再加上进上来的 " + cin + "。" : "想一想口诀：" + s.d + " × " + b + " 是多少？";
    }
    function input(v) {
      if (!practice || st.done) return;
      var sl = st.slots[st.active]; if (!sl) return;
      var ok = sl.kind === "c" ? (v === "none" ? 0 : v) === sl.v : sl.kind === "z0" ? (v === 0 || v === "skip") : v === sl.v;
      var p = P();
      if (ok) {
        st.fill[sl.key] = sl.v;
        if (sl.kind === "z0" && v === "skip") st.faint[sl.key] = 1;
        st.wrong = null; st.hint = sl.kind === "z0" ? verdict(true, v === "skip" ? "对了，个位的 0 省略了，第二次乘得的数从十位写起。" : "写上 0 也对，平时一般省略不写。") : "";
        var nx = -1;
        for (var i = 0; i < st.slots.length; i++) if (!isDone(st.slots[i])) { nx = i; if (!anyOrder || i > st.active) break; }
        if (nx < 0) finish(); else st.active = nx;
      } else {
        st.errs++;
        st.wrong = { key: sl.key, v: v }; st.hint = diag(sl, v);
        var qidErr = (cfg.id || root.getAttribute("data-id") || root.id || ("shushi-" + st.a + "x" + st.b)) + "-" + qi;
        if (p) p.log("fill", { id: qidErr, value: String(v), slot: sl.key, correct: false, _emitted: true });
        try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: { id: qidErr, value: String(v), slot: sl.key, correct: false }, bubbles: true })); } catch (e) { /* ignore */ }
      }
      draw();
      if (ok && st.hint && !st.done) { readout(read, st.hint + "<br>" + prompt(st.slots[st.active])); st.hint = ""; }
    }
    function isDone(sl) { return sl.key in st.fill; }
    function finish() {
      st.done = true;
      var p = P();
      var qidOk = (cfg.id || root.getAttribute("data-id") || root.id || ("shushi-" + st.a + "x" + st.b)) + "-" + qi;
      if (p) p.log("fill", { id: qidOk, value: String(st.pl.P), correct: true, first: st.errs === 0, _emitted: true });
      try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: { id: qidOk, value: String(st.pl.P), correct: true, first: st.errs === 0 }, bubbles: true })); } catch (e) { /* ignore */ }
    }
    function estText() {
      var a = st.a, b = st.b, pl = st.pl, lo;
      if (!cfg.est) return "";
      if (String(b).length === 1) {
        var u = a < 100 ? 10 : a < 1000 ? 100 : 1000, hi;
        if (a % u === 0) return "";
        lo = Math.floor(a / u) * u; hi = lo + u;
        return "<br>估一估：" + a + " 在 " + lo + " 和 " + hi + " 之间，" + lo + " × " + b + " = " + lo * b + "，" + hi + " × " + b + " = " + hi * b +
          "。" + pl.P + " 在 " + lo * b + " 和 " + hi * b + " 之间，合理。";
      }
      if (pl.z || !pl.two || a >= 100 || b % 10 === 0) return "";
      lo = Math.floor(b / 10) * 10;
      return "<br>估一估：" + b + " 在 " + lo + " 和 " + (lo + 10) + " 之间，" + a + " × " + lo + " = " + a * lo + "，" + a + " × " + (lo + 10) + " = " + a * (lo + 10) +
        "。" + pl.P + " 在它们中间，合理。";
    }
    function subText(sb) {
      var pl = st.pl, s = pl.steps[sb.s], b = s.bd, v4 = st.v4;
      if (s.t === "drop") {
        if (st.count) {
          var p = [];
          if (pl.za) p.push(st.a + " 末尾有 " + pl.za + " 个 0");
          if (pl.zb) p.push(st.b + " 末尾有 " + pl.zb + " 个 0");
          return "0 前面的数乘完了：" + pl.ca + " × " + pl.cb + " = " + pl.Pc + "。" + p.join("，") + (p.length > 1 ? "，一共 " + pl.z + " 个" : "") + "。在 " + pl.Pc + " 的末尾添上 " + pl.z + " 个 0，积是 " + pl.P + "。";
        }
        var z = pl.z, f = st.a / pow(z), g = pl.P / pow(z);
        return "末尾的 0 落下来：" + st.a + " 是 " + f + " 个" + UNIT[z] + "，" + f + " × " + st.b + " = " + g + "，是 " + g + " 个" + UNIT[z] + "，就是 " + pl.P + "。";
      }
      if (s.t === "ph") {
        var B1 = pl.B[1];
        return "第二次乘：用十位上的 " + B1 + " 去乘。" + B1 + " 表示 " + B1 + " 个十，算的是 " + pl.ca + " × " + B1 * 10 + "，乘出来的是几十，个位上是 0。这个 0 可以省略不写，从十位写起。" +
          (pl.steps.some(function (x) { return x.t === "mul" && x.k === 0 && x.co; }) ? "第一次乘的进位用完了，划掉。" : "");
      }
      if (s.t === "add") {
        var parts = [s.x, s.y].filter(function (q) { return q !== null; });
        if (s.cin) parts.push("进上来的 1");
        var t = "加起来，" + PLACE[s.col] + "：" + (parts.length > 1 ? parts.join(" + ") + " = " + s.v : "只有 " + s.v) + "，";
        t += s.last ? "写 " + s.v + "。" + (pl.z ? "" : "积是 " + pl.P + "。") : "写 " + s.v % 10 + (s.co ? "，向前一位进 1。" : "。");
        return t;
      }
      if (s.t === "sum") return "合起来：" + pl.steps.filter(function (x) { return x.t === "row"; }).map(function (x) { return x.pv; }).join(" + ") + " = " + pl.P + "。";
      if (s.t === "row") return s.d * pow(s.pa) + " × " + b + "：" + s.d + " 个" + UNIT[s.pa] + "乘 " + b + "，得 " + s.m + " 个" + UNIT[s.pa] + "，就是 " + s.pv + "。";
      var C = s.col;
      if (sb.part === "c") return s.v + " 个" + UNIT[C] + "里有 " + s.co + " 个" + UNIT[C + 1] + "，向" + PLACE[C + 1] + "进 " + s.co + "：在" + PLACE[C + 1] + "上方写小 " + s.co + "。";
      if (v4) {
        var t2 = (pl.two ? (s.k ? "第二次乘，用十位" : "第一次乘，用个位") + "上的 " : "用 ") + b + " 乘 " + s.d + "：" + s.d + " × " + b + " = " + s.m;
        if (s.cin) t2 += "，再加进上来的 " + s.cin + "，是 " + s.v;
        if (s.last) return t2 + "。前面没有数了，写 " + s.v + "。" + (pl.two && !s.k ? "第一次乘得的数是 " + pl.R[0] + "。" : !pl.two && !pl.z ? "积是 " + pl.P + "。" : "");
        return t2 + "，写 " + s.v % 10 + (s.co && !st.ask ? "，进 " + s.co + "（小 " + s.co + " 写在旁边）" : "") + "。";
      }
      var t3 = "用 " + b + " 乘" + PLACE[s.pa] + "上的 " + s.d + "：" + s.d + " × " + b + " = " + s.m;
      if (s.cin) t3 += "，再加上进上来的 " + s.cin + "，" + s.m + " + " + s.cin + " = " + s.v;
      t3 += "，得 " + s.v + " 个" + UNIT[C] + "，";
      if (s.last && s.v >= 10) return t3 + "前面没有数位了，直接写 " + s.v + "。";
      return t3 + PLACE[C] + "写 " + s.v % 10 + "。";
    }
    function prompt(sl) {
      var pl = st.pl, s = pl.steps[sl.s];
      if (sl.kind === "zn") return "0 前面的数乘完了。积的末尾要添几个 0？";
      if (sl.kind === "z0") return "第二次乘：用十位上的 " + pl.B[1] + " 去乘 " + pl.ca + "。个位这一格写什么？要空着就点「这一格空着」。";
      if (sl.kind === "z") return "前面乘完了。末尾的 0 落下来了吗？";
      if (sl.kind === "s") return s.t === "sum" ? "把上面几行加起来，从个位写起。" : "把两次乘得的数加起来，从个位加起：这一格写几？";
      if (sl.kind === "r") return "这一行写 " + s.d * pow(s.pa) + " × " + s.bd + " 的积，从右往左一格一格写。";
      if (sl.kind === "c") return PLACE[s.col] + "乘得 " + s.v + " 个" + UNIT[s.col] + "，要向" + PLACE[s.col + 1] + "进几？不满十就点「不进位」。";
      if (sl.ci === 1) return "前面没有数位了，还有一位直接" + (st.v4 ? "写下来。" : "写进积。");
      if (st.v4) return (pl.two ? (s.k ? "第二次乘：用十位" : "第一次乘：用个位") + "上的 " : "用 ") + s.bd + " 乘 " + s.d + "，这一格写几？";
      return "用 " + s.bd + " 乘" + PLACE[s.pa] + "上的 " + s.d + "，积的" + PLACE[sl.col] + "写几？";
    }
    /* ---------- 画图 ---------- */
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var pl = st.pl, A = pl.A, B = pl.B, S = pl.z, two = pl.two, full = pl.full, v4 = st.v4, labels = cfg.labels !== false, i;
      var ncols = Math.max(String(pl.P).length, S + A.length, S + B.length, two ? S + 1 + String(pl.R[1]).length : 0) + 1;
      var rowsAll = ["a", "b", "L1"].concat(pl.rows, pl.rows.length > 1 ? ["L2"] : [], ["s"]);
      var y = !labels ? 6 : v4 ? 34 : 30, Y = {};
      rowsAll.forEach(function (r) {   /* 两位数乘数：第二行上面多留一条写进位小数字 */
        var ex = r === "b" && two ? 22 : 0;
        if (r.charAt(0) === "L") { Y[r] = y + 5; y += r === "L2" && two ? 18 : 10; } else { Y[r] = y + 37 + ex; y += 50 + ex; }
      });
      var H = y + 6, side = {}, W, ox;
      if (two) { side.r0 = "…… " + pl.ca + " × " + B[0]; side.r1 = "…… " + pl.ca + " × " + B[1] * 10; }
      if (full) { W = 360; ox = 200; }
      else {
        var sideW = two ? side.r1.length * 10.5 + 14 : 0, W0 = ncols * CW + 16 + sideW;
        W = Math.max(360, Math.ceil(W0)); ox = Math.round((W - W0) / 2) + 8 + (ncols - 1) * CW + CW / 2;
      }
      var X = function (c) { return ox - c * CW; };
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      /* 现在显示到哪一步 */
      var shown = {}, faint = {}, rc = [{}, {}], ac = {}, cur = null, curPart = "", doneSt = {};
      if (practice) {
        st.slots.forEach(function (sl) {
          if (!isDone(sl)) return;
          if (sl.kind === "c") { if (sl.v > 0) rc[sl.k][sl.col] = sl.v; }
          else if (sl.kind === "zn") pl.steps[sl.s].cells.forEach(function (c) { shown[key(c)] = 0; });
          else shown[sl.key] = sl.v;
        });
        for (var fk in st.faint) faint[fk] = 1;
        if (!st.done && st.slots[st.active]) cur = pl.steps[st.slots[st.active].s];
      } else {
        for (i = 0; i < st.pos; i++) {
          var sb = st.subs[i], s0 = pl.steps[sb.s];
          if (sb.part === "c") rc[s0.k][s0.ac + 1] = s0.co;
          else s0.cells.forEach(function (c) { shown[key(c)] = c.v; if (s0.t === "ph") faint[key(c)] = 1; });
        }
        if (st.pos > 0) { cur = pl.steps[st.subs[st.pos - 1].s]; curPart = st.subs[st.pos - 1].part; }
      }
      pl.steps.forEach(function (s, si) {
        if (!s.cells.every(function (c) { return key(c) in shown; })) return;
        doneSt[si] = 1;
        if (!st.ask && s.co && s.t === "mul") rc[s.k][s.ac + 1] = s.co;   /* 进位不单独成一步：随积一起出现 */
        if (s.co && s.t === "add") ac[s.col + 1] = s.co;
      });
      var round2 = two && ("r1:" + S) in shown;
      /* 数位标签、竖虚线、末尾 0 的分界线 */
      for (var c = 0; c < ncols - 1; c++) {
        if (labels) el("text", { x: X(c), y: v4 ? 22 : 20, "text-anchor": "middle", style: "fill:var(--muted);font-size:16px" }, svg, SHORT[c]);
        if (c < ncols - 2) el("line", { x1: X(c) - CW / 2, x2: X(c) - CW / 2, y1: !labels ? 4 : v4 ? 28 : 26, y2: H - 4, style: "stroke:var(--line);stroke-width:1.5;stroke-dasharray:3 4" }, svg);
      }
      if (S) el("line", { x1: X(S) + CW / 2, x2: X(S) + CW / 2, y1: Y.a - 34, y2: H - 4, style: "stroke:var(--c);stroke-width:2.5;stroke-dasharray:6 5" }, svg);
      /* 当前这一步的底色 */
      function hlBox(col, yy, hh) { el("rect", { x: X(col) - CW / 2 + 3, y: yy, width: CW - 6, height: hh, rx: 8, style: "fill:var(--hl-soft)" }, svg); }
      if (v4) {
        if (cur && cur.t === "mul") { hlBox(cur.ac, Y.a - 34, 44); if (two) hlBox(S + cur.k, Y.b - 34, 44); }
        else if (cur && cur.t === "ph") hlBox(S + 1, Y.b - 34, 44);
        else if (cur && cur.t === "add") hlBox(cur.col, Y.r0 - 36, Y.s - Y.r0 + 46);
        else if (st.hl >= 0) hlBox(st.hl, Y.a - 34, 44);
      } else {
        var hlC = cur && (cur.t === "mul" || cur.t === "row") ? cur.ac : st.hl;
        if (hlC >= 0 && hlC < S + A.length) hlBox(hlC, Y.a - 34, 44);
        if (cur && cur.t === "mul" && cur.cin && curPart !== "c" && (cur.ac in rc[cur.k]))
          el("circle", { cx: X(cur.ac), cy: Y.b - 20, r: 15, style: "fill:none;stroke:var(--hl);stroke-width:3" }, svg);
      }
      /* 两个乘数（末尾的 0 伸到右边） */
      function num(n, z, yy, isA) {
        if (!v4) for (var zp = 0; zp < z; zp++) {   /* 三上：末尾的 0 和别的数一样能点，按数位从个位画起 */
          var zc0 = S - z + zp;
          var t0 = el("text", { x: X(zc0), y: yy, "text-anchor": "middle", tabindex: isA ? "0" : "-1", role: isA ? "button" : "img", "aria-label": "0，在" + PLACE[zp],
            style: "font-size:34px;font-weight:700;" + (isA ? "cursor:pointer;" : "") + "fill:var(--fg)" }, svg, 0);
          if (isA) (function (c0, p0) { activate(t0, function () { pickA(c0, p0, 0, -1); }); })(zc0, zp);
        }
        digs(n / pow(z)).forEach(function (d, j) {
          var used = isA && pl.steps.some(function (s, si) { return doneSt[si] && (s.t === "mul" || s.t === "row") && s.j === j; });
          var on = !isA && two && cur && (cur.t === "ph" ? j === 1 : cur.t === "mul" && cur.k === j);
          var t = el("text", { x: X(S + j), y: yy, "text-anchor": "middle", tabindex: isA ? "0" : "-1", role: isA ? "button" : "img", "aria-label": d + "，在" + PLACE[z + j],
            style: "font-size:34px;font-weight:700;" + (isA ? "cursor:pointer;" : "") + "fill:" + (used ? "var(--a)" : on ? (j ? "var(--c)" : "var(--b)") : "var(--fg)") }, svg, d);
          if (isA) activate(t, function () { pickA(S + j, z + j, d, j); });
        });
        if (v4) for (var q = 0; q < z; q++) el("text", { x: X(S - 1 - q), y: yy, "text-anchor": "middle", style: "font-size:34px;font-weight:700;fill:var(--c)" }, svg, 0);
      }
      num(st.a, pl.za, Y.a, true);
      el("text", { x: X(ncols - 1), y: Y.b, "text-anchor": "middle", style: "font-size:30px;fill:var(--fg)" }, svg, "×");
      num(st.b, pl.zb, Y.b, false);
      /* 箭头：从乘数的那一位指向正在乘的那一位 */
      function arrow() {
        if (!cur || !(cur.t === "mul" || cur.t === "row") || curPart === "c") return;
        var bc = S + cur.k, x1 = X(bc), y1 = Y.b - 30, x2 = X(cur.ac) + 6, y2 = Y.a + 8;
        // Same-column arrows approach from the left, clear of the digit's ink.
        if (cur.ac === bc) { x1 -= 20; y1 = Y.b - 16; x2 -= 22; y2 = Y.a + 2; }
        var ang = Math.atan2(y2 - y1, x2 - x1), ah = 9, col = two && !cur.k ? "var(--b)" : "var(--c)";
        el("line", { x1: x1, y1: y1, x2: x2, y2: y2, style: "stroke:" + col + ";stroke-width:2.5" }, svg);
        el("path", { d: "M" + x2 + " " + y2 + " L" + (x2 - ah * Math.cos(ang - 0.5)).toFixed(1) + " " + (y2 - ah * Math.sin(ang - 0.5)).toFixed(1) + " L" + (x2 - ah * Math.cos(ang + 0.5)).toFixed(1) + " " + (y2 - ah * Math.sin(ang + 0.5)).toFixed(1) + " Z", style: "fill:" + col }, svg);
      }
      if (v4) arrow();
      /* 进位小数字（两位数乘数：第一次的在右、第二次的在左，第一次的用完划掉） */
      function cpos(k, col) { return { x: X(col) + (two ? (k ? -12 : 12) : 0), y: two ? Y.b - 38 : Y.b - 13 }; }
      [0, 1].forEach(function (k) {
        for (var c3 in rc[k]) {
          var p0 = cpos(k, +c3), old = k === 0 && round2;
          el("text", { x: p0.x, y: p0.y, "text-anchor": "middle", style: "font-size:" + (two ? 19 : 20) + "px;font-weight:700;fill:" + (k ? "var(--c)" : "var(--b)") + ";opacity:" + (old ? 0.45 : 1) }, svg, rc[k][c3]);
          if (old) el("line", { x1: p0.x - 7, y1: p0.y - 3, x2: p0.x + 7, y2: p0.y - 12, style: "stroke:var(--no);stroke-width:2" }, svg);
        }
      });
      for (var c4 in ac) el("text", { x: X(+c4) + 14, y: Y.L2 + 16, "text-anchor": "middle", style: "font-size:16px;font-weight:700;fill:var(--hl)" }, svg, ac[c4]);
      /* 横线 */
      ["L1", "L2"].forEach(function (L) { if (Y[L]) el("line", { x1: X(ncols - 1) - CW / 2 + 4, x2: X(0) + CW / 2 - 2, y1: Y[L], y2: Y[L], style: "stroke:var(--fg);stroke-width:2.5" }, svg); });
      /* 乘得的数、积 */
      pl.rows.concat(["s"]).forEach(function (r) {
        var rcol = r === "r1" && two ? "var(--c)" : r === "r0" && two ? "var(--b)" : "var(--fg)", any = false;
        for (var c2 = 0; c2 < ncols - 1; c2++) {
          var kk = r + ":" + c2;
          if (!(kk in shown)) continue;
          any = true;
          var isF = kk in faint, fill;
          if (v4) fill = isF ? "var(--muted)" : r === "s" && c2 < S ? "var(--c)" : rcol;
          else fill = st.hl >= 0 && ((full && r === "r" + st.hl) || (!full && r === "s" && c2 === st.hl)) ? "var(--b)" : isF ? "var(--muted)" : rcol;
          var t2 = el("text", { x: X(c2), y: Y[r], "text-anchor": "middle", tabindex: "0", role: "button", "aria-label": isF ? "省略的 0" : shown[kk] + "，在" + PLACE[c2],
            style: "font-size:34px;font-weight:700;cursor:pointer;fill:" + fill + (isF ? ";opacity:0.45" : "") }, svg, shown[kk]);
          if (isF) el("circle", { cx: X(c2), cy: Y[r] - 12, r: 19, style: "fill:none;stroke:var(--no);stroke-width:2;stroke-dasharray:4 4" }, svg);
          (function (r0, c0, d0) { activate(t2, function () { explain(r0, c0, d0); }); })(r, c2, shown[kk]);
        }
        if (side[r] && any) el("text", { x: X(0) + CW / 2 + 8, y: Y[r] - 8, style: "font-size:20px;fill:" + rcol }, svg, side[r]);
        if (full && r !== "s" && (r + ":0") in shown) {
          var s3 = pl.steps[+r.slice(1)];
          el("text", { x: X(0) + CW / 2 + 8, y: Y[r] - 6, style: "font-size:18px;fill:var(--muted)" }, svg, "…… " + s3.d * pow(s3.pa) + " × " + s3.bd);
        }
      });
      /* 练习：当前格（不限顺序时还没填的格都画虚框）、填错的数 */
      var asl = practice && !st.done ? st.slots[st.active] : null;
      if (asl) {
        st.slots.forEach(function (sl, si) {
          if (isDone(sl) || (!anyOrder && si !== st.active)) return;
          var on = si === st.active, bx, wp;
          if (sl.kind === "c") {
            var cp = cpos(sl.k, sl.col);
            bx = two ? { x: cp.x - 13, y: cp.y - 21, w: 26, h: 26 } : { x: X(sl.col) - 14, y: Y.b - 33, w: 28, h: 28 };
            wp = { x: cp.x, y: cp.y, f: two ? 19 : 20 };
          } else if (sl.kind === "zn") {
            bx = { x: X(S - 1) - CW / 2 + 3, y: Y.s - 34, w: S * CW - 6, h: 44 };
            wp = { x: bx.x + bx.w / 2, y: Y.s - 26, f: 22 };
          } else {
            bx = { x: X(sl.col) - CW / 2 + 3, y: Y[sl.row] - 34, w: CW - 6, h: 44 };
            wp = { x: X(sl.col), y: Y[sl.row], f: 34 };
          }
          var r3 = el("rect", { x: bx.x, y: bx.y, width: bx.w, height: bx.h, rx: 6, tabindex: anyOrder ? "0" : "-1", role: "button", "aria-label": on ? "现在填这一格" : "填这一格",
            style: "cursor:pointer;fill:" + (on ? "var(--hl-soft)" : "transparent") + ";stroke:" + (on ? "var(--c)" : "var(--dim)") + ";stroke-width:2.5" + (on ? "" : ";stroke-dasharray:4 4") }, svg);
          if (anyOrder) activate(r3, function () { st.active = si; st.wrong = null; st.hint = ""; draw(); });
          if (sl.kind === "zn") el("text", { x: bx.x + bx.w / 2, y: Y.s - 4, "text-anchor": "middle", style: "pointer-events:none;font-size:17px;fill:var(--c)" }, svg, "添几个 0？");
          if (on && st.wrong && st.wrong.key === sl.key && typeof st.wrong.v === "number")
            el("text", { x: wp.x, y: wp.y, "text-anchor": "middle", style: "pointer-events:none;font-weight:700;fill:var(--no);font-size:" + wp.f + "px" }, svg, st.wrong.v);
        });
      }
      if (!v4) arrow();
      /* 读数、按钮 */
      var head = qs.length > 1 ? "第 " + (qi + 1) + " 题：" + st.a + " × " + st.b + "。" : "", last = st.pos === st.subs.length;
      if (practice) {
        noCarry.hidden = !asl || asl.kind !== "c";
        skip0.hidden = !asl || asl.kind !== "z0";
        padWrap.hidden = st.done;
        if (st.done) readout(read, verdict(true, "对了！" + st.a + " × " + st.b + " = " + pl.P + "。" + (v4 ? (two ? "两次乘得的数都对齐了，再加起来。" : "每一位都乘到了。")
          : "你一位一位地乘，" + (pl.steps.some(function (s) { return s.co || (s.last && s.v > 9); }) ? "还看了进位。" : "每一位都乘到了。")) + estText()), "ok");
        else if (st.hint) readout(read, verdict(false, st.hint), "no");
        else readout(read, head + prompt(asl));
      } else if (st.msg) { readout(read, st.msg); st.msg = ""; }
      else if (st.pos === 0) readout(read, head + (v4 ? (S ? "0 前面的数对齐，0 伸到右边。" : "") : (st.tz && S ? "一位数写在 " + st.a + " 的第一个不是 0 的数下面。" : "")) + "点「下一步」，一位一位地乘。");
      else {
        readout(read, subText(st.subs[st.pos - 1]) + (last ? (v4 || pl.steps[pl.steps.length - 1].t === "sum" ? "" : "积是 " + pl.P + "。") + estText() : ""), last ? "ok" : "");
        if (last && !st.demoReported) { st.demoReported = true; emitAns(root, cfg, String(pl.P), true, true, qi); }
      }
      buttons();
      emit(root, { a: st.a, b: st.b, layout: st.layout, tz: st.tz, pos: st.pos, done: practice ? st.done : last });
    }
    /* 点上面的数：示范时读出它是几个几；练习「不限顺序」时跳到这一位的格 */
    function pickA(col, place, d, j) {
      if (practice) {
        if (!anyOrder || st.done || j < 0) return;
        for (var i = 0; i < st.slots.length; i++) { var s = st.pl.steps[st.slots[i].s]; if (!isDone(st.slots[i]) && s.j === j && (s.t === "mul" || s.t === "row")) { st.active = i; st.wrong = null; st.hint = ""; draw(); return; } }
        return;
      }
      st.hl = col; st.msg = PLACE[place] + "上的 " + d + " 是 " + d + " 个" + UNIT[place] + "，就是 " + d * pow(place) + "。"; draw();
    }
    function explain(r, c, d) {
      if (practice && !st.done) return;
      var pl = st.pl;
      if (r !== "s" && pl.full) {
        var s = pl.steps[+r.slice(1)]; st.hl = s.pa;
        st.msg = "这一行是 " + s.d * pow(s.pa) + " × " + s.bd + " 的积 " + s.pv + "。在简便的写法里，它就是写在" + PLACE[s.pa] + "上的 " + s.m + "。";
      } else if (r !== "s") {
        st.hl = -1;
        st.msg = r === "r1" ? "这一行是第二次乘得的数：" + pl.ca + " × " + pl.B[1] * 10 + " = " + pl.R[1] * 10 + "，个位的 0 省略不写，所以从十位写起。"
          : "这一行是第一次乘得的数：" + pl.ca + " × " + pl.B[0] + " = " + pl.R[0] + "。";
      } else { st.hl = c; st.msg = "这个 " + d + " 在" + PLACE[c] + "，表示 " + d + " 个" + UNIT[c] + "，就是 " + d * pow(c) + "。"; }
      logI("shushi-explain", { row: r, col: c });
      if (practice) { readout(read, st.msg); st.msg = ""; } else draw();
    }
    var bPrev, bNext, bLay, bTz, bSwap;
    if (!practice) {
      bPrev = ctr.appendChild(btn("上一步", function () { if (st.pos > 0) { st.pos--; st.hl = -1; draw(); } }));
      bNext = ctr.appendChild(btn("下一步", function () { if (st.pos < st.subs.length) { st.pos++; st.hl = -1; draw(); logI("shushi-step", { a: st.a, b: st.b, pos: st.pos }); } }));
    }
    if (cfg.toggle) bLay = ctr.appendChild(btn("", function () {
      var keepHl = st.hl;
      st.layout = st.layout === "full" ? "simple" : "full"; setup(true);
      if (!practice) { st.pos = st.subs.length; st.hl = keepHl; st.msg = st.layout === "full" ? "完整的竖式：每一位乘得的积单写一行，再加起来。点一行看看。" : "简便的写法：乘得几个十，就把几写在十位上，一行写完。点积里的数看看。"; draw(); }
      logI("shushi-layout", { layout: st.layout });
    }));
    if (cfg.tzToggle) bTz = ctr.appendChild(btn("", function () { st.tz = !st.tz; setup(true); logI("shushi-tz", { tz: st.tz }); }));
    if (cfg.swap) bSwap = ctr.appendChild(btn("交换乘数再算", function () {
      if (String(st.a).length !== String(st.b).length) return;
      var q = qs[qi]; qs[qi] = [q[1], q[0], q[2]]; setup(true);
      if (!practice) { st.msg = "交换了两个乘数：" + st.a + " × " + st.b + "。点「下一步」再算一遍，看积是不是一样。"; draw(); }
      logI("shushi-swap", { a: st.a, b: st.b });
    }));
    if (qs.length > 1) ctr.appendChild(btn("换一题", function () { qi = (qi + 1) % qs.length; setup(false); }));
    ctr.appendChild(btn("重来", function () { setup(true); logI("reset"); }));
    function buttons() {
      if (bPrev) { bPrev.disabled = st.pos === 0; bNext.disabled = st.pos === st.subs.length; }
      if (bLay) bLay.textContent = st.layout === "full" ? "看简便的写法" : "看完整的竖式";
      if (bTz) bTz.textContent = st.tz ? "一位数写在个位下面" : "一位数写在 0 前面那一位下面";
      if (bSwap) bSwap.disabled = String(st.a).length !== String(st.b).length;
    }
    root.addEventListener("keydown", function (e) {
      if (practice) {
        if (/^[0-9]$/.test(e.key)) { input(+e.key); e.preventDefault(); }
        else if (anyOrder && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !st.done) {
          var open = st.slots.map(function (sl, i) { return isDone(sl) ? -1 : i; }).filter(function (i) { return i >= 0; });
          var at = open.indexOf(st.active), n = open.length;
          st.active = open[(at + (e.key === "ArrowLeft" ? 1 : n - 1)) % n]; st.wrong = null; st.hint = ""; draw(); e.preventDefault();
        }
      } else if (e.target === svg && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        (e.key === "ArrowRight" ? bNext : bPrev).click(); e.preventDefault();
      }
    });
    setup(false);
  }

  /* ===================== vsfig 静态竖式图 ===================== */
  function vsfig(root, o) {
    injectStyle();
    var svg = el("svg", { class: "qfig" }, root);
    if (o.maxWidth) svg.style.maxWidth = o.maxWidth + "px";
    if (o.a == null || o.b == null) return;
    var rows = [[String(o.a), 0], [String(o.b), 0, "×"]].concat((o.rows || []).map(function (r) { return [String(r[0]), +r[1] || 0]; }));
    if (o.sum != null) rows.push([String(o.sum), 0, "s"]);
    var bad = o.bad || [], CW = 28, nc = 0;
    rows.forEach(function (r) { nc = Math.max(nc, r[0].length + r[1]); });
    nc += 1;
    var W = nc * CW + 16, y = 8, ox = W - 8 - CW / 2;
    function X(c) { return ox - c * CW; }
    var ys = [];
    rows.forEach(function (r, i) {
      if (i === 2 || r[2] === "s") { ys.push(["L", y + 4]); y += 8; }
      ys.push([i, y + 28]); y += 34;
    });
    svg.setAttribute("viewBox", "0 0 " + W + " " + (y + 6));
    svg.setAttribute("role", "img");
    var label = String(o.a) + " 乘 " + String(o.b) + " 的竖式";
    ys.forEach(function (q) {
      if (q[0] === "L") { el("line", { x1: 6, x2: W - 6, y1: q[1], y2: q[1], style: "stroke:var(--fg);stroke-width:2" }, svg); return; }
      var r = rows[q[0]], ri = q[0] - 2, isBad = bad.indexOf(ri) >= 0;
      if (r[2] === "×") el("text", { x: X(nc - 1), y: q[1], "text-anchor": "middle", style: "font-size:24px;fill:var(--fg)" }, svg, "×");
      r[0].split("").reverse().forEach(function (d, j) {
        var fa = o.faint && o.faint.indexOf(ri) >= 0 && j === 0;
        el("text", { x: X(j + r[1]), y: q[1], "text-anchor": "middle", style: "font-size:26px;font-weight:700;fill:" + (isBad ? "var(--no)" : "var(--fg)") + (fa ? ";opacity:.4" : "") }, svg, d);
      });
      if (q[0] >= 2) label += "，" + (r[2] === "s" ? "得 " : "") + r[0];
    });
    svg.setAttribute("aria-label", label);
    var vsReported = false;
    svg.addEventListener("click", function () {
      if (!vsReported) { vsReported = true; emitAns(root, o, o.a + "×" + o.b, true, true); }
    });
  }

  /* ===================== kuai 小方块 ===================== */
  function kuai(root, cfg) {
    var S = 6, init = { h: cfg.h || 0, t: cfg.t || 0, u: cfg.u || 0, g: cfg.g || 2 }, st;
    var US = cfg.smallU ? S : 9, UP = US + 2;   /* 单块边长、间距 */
    var mx = Object.assign({ h: 3, t: 4, u: 9, g: 5 }, cfg.max || {}), mn = { h: 0, t: 0, u: 0, g: 2 };
    var edit = cfg.edit || [];
    var svg = el("svg", { class: "stage", role: "img", "aria-label": "小方块" });
    var read = h("p", "read"), ctr = h("div", "ctrls"), ctr2 = h("div", "ctrls");
    read.setAttribute("aria-live", "polite");
    root.appendChild(svg); root.appendChild(read); root.appendChild(ctr); root.appendChild(ctr2);
    function reset(keep) { st = Object.assign({}, keep || init, { cH: false, cT: false, cU: false, mU: 0, mT: 0, reported: false }); }
    function okCfg(o) {
      if (o.h * 100 + o.t * 10 + o.u < 10) return false;
      if (cfg.noCarry && (o.h * o.g > 9 || o.t * o.g > 9 || o.u * o.g > 9)) return false;
      return true;
    }
    var NAMES = { h: ["每组百板", "块"], t: ["每组十条", "条"], u: ["每组单块", "个"], g: ["几组", "组"] }, steppers = {};
    edit.forEach(function (f) {
      steppers[f] = ctr2.appendChild(stepper(NAMES[f][0], function () { return st[f]; }, function (v) { change(f, v); }, NAMES[f][1]));
    });
    function canTo(f, v) { if (v < mn[f] || v > mx[f]) return false; var o = Object.assign({}, st); o[f] = v; return okCfg(o); }
    function change(f, v) { if (!canTo(f, v)) return; var o = { h: st.h, t: st.t, u: st.u, g: st.g }; o[f] = v; reset(o); draw(); logI("kuai-" + f, { v: v }); }
    var bH = ctr.appendChild(btn("圈百板", function () { st.cH = !st.cH; draw(); logI("kuai-ring", { k: "h" }); }));
    var bT = ctr.appendChild(btn("圈十条", function () { st.cT = !st.cT; draw(); logI("kuai-ring", { k: "t" }); }));
    var bU = ctr.appendChild(btn("圈单块", function () { st.cU = !st.cU; draw(); logI("kuai-ring", { k: "u" }); }));
    var bMU = ctr.appendChild(btn("10 个一换 1 条十", function () { st.mU++; draw(); logI("kuai-merge", { k: "u" }); }));
    var bMT = ctr.appendChild(btn("10 条十换 1 块百板", function () { st.mT++; draw(); logI("kuai-merge", { k: "t" }); }));
    ctr2.appendChild(btn("重来", function () { reset(); draw(); logI("reset"); }));
    function plate(x, y, col, dim, g) {
      el("rect", { x: x, y: y, width: 10 * S, height: 10 * S, style: "fill:" + col + ";stroke:var(--fg);stroke-width:1.5;opacity:" + (dim ? 0.25 : 1) }, g);
      var d = "";
      for (var i = 1; i < 10; i++) d += "M" + (x + i * S) + " " + y + "v" + 10 * S + "M" + x + " " + (y + i * S) + "h" + 10 * S;
      el("path", { d: d, style: "stroke:var(--card);stroke-width:.8;opacity:" + (dim ? 0.25 : 0.7) }, g);
    }
    function rod(x, y, col, dim, g) {
      el("rect", { x: x, y: y, width: S + 1, height: 10 * S, style: "fill:" + col + ";stroke:var(--fg);stroke-width:1.2;opacity:" + (dim ? 0.25 : 1) }, g);
      var d = ""; for (var i = 1; i < 10; i++) d += "M" + x + " " + (y + i * S) + "h" + (S + 1);
      el("path", { d: d, style: "stroke:var(--card);stroke-width:.8;opacity:" + (dim ? 0.25 : 0.7) }, g);
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var H = st.h * st.g, T = st.t * st.g, U = st.u * st.g, a = st.h * 100 + st.t * 10 + st.u, total = a * st.g;
      var onesLeft = U - 10 * st.mU, rodsAll = T + st.mU, rodsLeft = rodsAll - 10 * st.mT, platesAll = H + st.mT;
      var RH = st.h || st.t ? 10 * S + 16 : 26, top = 12;
      var wP = st.h * 66 - 6, wT = st.t * 11 - 4, wU = Math.min(st.u, 5) * UP - 2;
      var wAll = (st.h ? st.h * 66 + 12 : 0) + (st.t ? st.t * 11 + 14 : 0) + (st.u ? wU : -14);
      var xP = Math.max(16, Math.round((360 - wAll) / 2)), xT = xP + (st.h ? st.h * 66 + 12 : 0), xU = xT + (st.t ? st.t * 11 + 14 : 0);
      var base = top + st.g * RH, kinds = [];
      if (st.h) kinds.push(["h", xP, wP, "var(--c)", st.cH, H + " 个百"]);
      if (st.t) kinds.push(["t", xT, wT, "var(--a)", st.cT, T + " 个十"]);
      if (st.u) kinds.push(["u", xU, wU, "var(--b)", st.cU, U + " 个一"]);
      var nLab = kinds.filter(function (k) { return k[4]; }).length;
      var newRow = st.mU || st.mT, yNew = base + 10 + nLab * 22 + 8;
      var HH = newRow ? yNew + 10 * S + 14 : base + 10 + nLab * 22 + 6;
      svg.setAttribute("viewBox", "0 0 360 " + Math.max(HH, 60));
      var ui = 0, ti = 0;
      for (var gi = 0; gi < st.g; gi++) {
        var y = top + gi * RH + 4, g = el("g", {}, svg), i;
        for (i = 0; i < st.h; i++) plate(xP + i * 66, y, "var(--c)", false, g);
        for (i = 0; i < st.t; i++) { rod(xT + i * 11, y, "var(--a)", ti < 10 * st.mT, g); ti++; }
        for (i = 0; i < st.u; i++) {
          el("rect", { x: xU + (i % 5) * UP, y: y + (st.h || st.t ? 10 * S - US : 4) - Math.floor(i / 5) * UP, width: US, height: US,
            style: "fill:var(--b);stroke:var(--fg);stroke-width:1;opacity:" + (ui < 10 * st.mU ? 0.25 : 1) }, g);
          ui++;
        }
      }
      var li = 0;
      kinds.forEach(function (k) {
        if (!k[4]) return;
        el("rect", { x: k[1] - 6, y: top - 2, width: k[2] + 12, height: st.g * RH, rx: 10, style: "fill:none;stroke:" + k[3] + ";stroke-width:2.5;stroke-dasharray:7 5" }, svg);
        el("text", { x: Math.max(8, k[1] - 6), y: base + 24 + li * 22, style: "font-size:17px;font-weight:700;fill:" + k[3] }, svg, "圈出 " + k[5]);
        li++;
      });
      if (newRow) {
        el("text", { x: 14, y: yNew + 36, style: "font-size:16px;fill:var(--muted)" }, svg, "换来的");
        var x = 70;
        for (var p = 0; p < st.mT; p++) { plate(x, yNew, "var(--hl)", false, svg); x += 66; }
        for (var r = 0; r < st.mU; r++) { rod(x, yNew, "var(--hl)", ti + r < 10 * st.mT, svg); x += 11; }
      }
      /* 读数：横式一行一行写出来 */
      var lines = [];
      if (st.cH && st.h) lines.push(st.h + " 个百乘 " + st.g + " 是 " + H + " 个百：" + st.h * 100 + " × " + st.g + " = " + H * 100);
      if (st.cT && st.t) lines.push(st.t + " 个十乘 " + st.g + " 是 " + T + " 个十：" + st.t * 10 + " × " + st.g + " = " + T * 10);
      if (st.cU && st.u) lines.push(st.u + " 个一乘 " + st.g + " 是 " + U + " 个一：" + st.u + " × " + st.g + " = " + U);
      if (st.mU) lines.push(10 * st.mU + " 个一换成 " + st.mU + " 个十");
      if (st.mT) lines.push(10 * st.mT + " 个十换成 " + st.mT + " 个百");
      var all = kinds.every(function (k) { return k[4]; }), parts = [];
      if (st.h) parts.push(H * 100); if (st.t) parts.push(T * 10); if (st.u) parts.push(U);
      if (all && parts.length > 1) lines.push("合起来：" + parts.join(" + ") + " = " + total);
      if (all && (st.mU || st.mT)) lines.push("现在有 " + [platesAll ? platesAll + " 个百" : "", rodsLeft ? rodsLeft + " 个十" : "", onesLeft ? onesLeft + " 个一" : ""].filter(String).join("、") + "，就是 " + total);
      if (all && (parts.length > 1 || st.mU || st.mT)) lines.push("<b>" + a + " × " + st.g + " = " + total + "</b>");
      if (!lines.length) lines.push("每组 " + a + "，摆了 " + st.g + " 组，就是 " + a + " × " + st.g + "。" + (kinds.length > 1 ? "一部分一部分地圈一圈。" : "圈一圈，数一数有几个" + UNIT[kinds[0][0] === "h" ? 2 : kinds[0][0] === "t" ? 1 : 0] + "。"));
      readout(read, lines.join("<br>"), all ? "ok" : "");
      if (all && kinds.length > 0 && !st.reported) { st.reported = true; emitAns(root, cfg, a + "×" + st.g + "=" + total, true, true); }
      read.style.flexDirection = "column";
      bH.hidden = !st.h; bT.hidden = !st.t; bU.hidden = !st.u;
      [[bH, st.cH], [bT, st.cT], [bU, st.cU]].forEach(function (x) { x[0].setAttribute("aria-pressed", x[1] ? "true" : "false"); });
      bMU.hidden = !(cfg.merge && st.cU && onesLeft >= 10);
      bMT.hidden = !(cfg.merge && st.cT && rodsLeft >= 10);
      edit.forEach(function (f) { steppers[f].sync(canTo(f, st[f] - 1), canTo(f, st[f] + 1)); });
      svg.setAttribute("aria-label", "小方块：" + st.g + " 组，每组 " + a + (lines.length ? "。" + spoken(lines.join("，")) : ""));
      emit(root, { a: a, g: st.g, total: total, rings: [st.cH, st.cT, st.cU], merges: [st.mU, st.mT] });
    }
    reset(); draw();
  }

  window.PeiyuManip.register("shushi", shushi);
  window.PeiyuManip.register("vsfig", vsfig);
  window.PeiyuManip.register("kuai", kuai);
})();
