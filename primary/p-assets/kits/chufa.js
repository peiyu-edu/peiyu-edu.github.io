/* 培玉 · 小学数学 — 公共教具：除法竖式（chufa）。加载：<script defer src="../p-assets/kits/chufa.js"></script>（放在 manip.js 后面）。
   登记一个 kind：chufa。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格）都能用；有「重来」。
   一位数除两位数 / 三位数的除法竖式（含有余数、商中间有 0 的）：一步一步写出来——
   商（先看被除数的前几位够不够除，商写在哪一位上）→ 乘（商乘除数，积写在被除数下面）→ 减（被除数减积，得余数）→
   落（把下一位落下来，和余数合成新的数，再除）。余数要比除数小。读数写每一步怎么算；
   余下的几个十（百）要换成 10 倍的下一位单位，和落下来的数合起来。
     <div class="manip" data-manip="chufa" data-cfg='{"a":72,"b":3}'></div>
   cfg：
     a, b     被除数 a（1–999）、除数 b（1–9）。
     names    true：算完后多一步「认一认」：在竖式上标出被除数、除数、商、积、余数（二下「有余数的除法」用）。
     edit     true：出调数按钮（被除数、除数各 −／＋）。
   典型配置：
     {"a":14,"b":4,"names":true}            有余数：商 3 余 2，认名字
     {"a":72,"b":3}                         两位数除以一位数，余下的 1 个十换成 10 个一
     {"a":530,"b":5}                        商中间有 0
     {"a":84,"b":4,"edit":true}             可调数
   纯函数 PeiyuManip.chufaSteps(a, b) 返回 {chunks, steps, quotient, remainder}，页面和测试都可以直接用。
   每次变化在根元素上抛 manip:change（detail：a、b、done）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  var PLACE = ["个位", "十位", "百位"];
  var UNIT = ["一", "十", "百"]; // 「几个一 / 几个十 / 几个百」

  // 竖式的每一「块」：被除数里取够除的几位 cur，商 q 写在第 e 位上，积 p，余数 r；下一块把下一位落下来。
  function chufaSteps(a, b) {
    var ds = String(a).split("").map(Number), n = ds.length, chunks = [], steps = [], e = 0, cur = ds[0];
    while (cur < b && e < n - 1) { e++; cur = cur * 10 + ds[e]; }
    var rem = 0, k;
    for (k = e; k < n; k++) {
      if (k > e) cur = rem * 10 + ds[k];
      var q = Math.floor(cur / b), p = q * b, r = cur - p, pos = n - 1 - k;
      chunks.push({ e: k, cur: cur, q: q, p: p, r: r, first: k === e, digit: ds[k], prevRem: rem, pos: pos });
      rem = r;
    }
    chunks.forEach(function (c, j) {
      var pn = PLACE[c.pos], head;
      if (c.first) head = c.e === 0 ? (a < b ? a + " 比 " + b + " 小，不够除：" : "先看 " + c.cur + "（" + b + " 能除几次）：") : "第一位 " + ds[0] + " 比 " + b + " 小，不够除，看前两位 " + c.cur + "：";
      else head = (c.prevRem ? "上一步余下的 " + c.prevRem + " 个" + UNIT[c.pos + 1] + "，换成 " + c.prevRem * 10 + " 个" + UNIT[c.pos] + "，和落下来的 " + c.digit + " 合起来是 " + c.cur + "：" : "上一步没有余下的，把 " + c.digit + " 落下来，是 " + c.cur + "：");
      steps.push({ kind: "q", chunk: j, text: head + c.cur + " ÷ " + b + " 商 " + c.q + "，商 " + c.q + " 写在" + pn + "上。" });
      steps.push({ kind: "p", chunk: j, text: c.q + " × " + b + " = " + c.p + "，积 " + c.p + " 写在 " + c.cur + " 的下面。" });
      var more = j < chunks.length - 1;
      steps.push({ kind: "r", chunk: j, text: c.cur + " − " + c.p + " = " + c.r + "，余数 " + c.r + (c.r < b ? "，比除数 " + b + " 小。" : "。") + (more ? "接着把下一位 " + ds[c.e + 1] + " 落下来。" : "") });
    });
    var quotient = Math.floor(a / b), remainder = a - quotient * b;
    return { chunks: chunks, steps: steps, quotient: quotient, remainder: remainder, n: n };
  }
  window.PeiyuManip.chufaSteps = chufaSteps;

  function chufa(root, cfg) {
    var el = U.el, P = window.PeiyuP;
    function clamp(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    var st = { a: clamp(cfg.a, 1, 999, 72), b: clamp(cfg.b, 1, 9, 3), k: 0 };
    var plan = null, names = cfg.names === true;
    var svg = el("svg", { class: "stage", role: "group" });
    root.appendChild(svg);
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    function hb(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap"; b.addEventListener("click", fn); return b; }
    var bPrev = hb("上一步", function () { go(st.k - 1); }), bNext = hb("下一步", function () { go(st.k + 1); }), bAll = hb("一下算完", function () { go(total()); }), bReset = hb("重来", function () { go(0); });
    ctr.appendChild(bPrev); ctr.appendChild(bNext); ctr.appendChild(bAll); ctr.appendChild(bReset);
    var steppers = {};
    if (cfg.edit) {
      [["a", "被除数", 1, 999], ["b", "除数", 1, 9]].forEach(function (d) {
        var key = d[0], label = d[1], box = document.createElement("span"); box.className = "count";
        var minus = hb("−", function () { setNum(key, st[key] - 1); }), plus = hb("＋", function () { setNum(key, st[key] + 1); });
        var val = document.createElement("span"); box.appendChild(document.createTextNode(label + " ")); box.appendChild(minus); box.appendChild(val); box.appendChild(plus);
        minus.setAttribute("aria-label", label + "减 1"); plus.setAttribute("aria-label", label + "加 1");
        steppers[key] = { val: val, minus: minus, plus: plus, min: d[2], max: d[3] }; ctr2.appendChild(box);
      });
    }
    root.appendChild(ctr); if (cfg.edit) root.appendChild(ctr2); root.appendChild(read);
    function total() { return plan.steps.length + (names ? 1 : 0); }
    function setNum(key, v) { st[key] = clamp(v, steppers[key].min, steppers[key].max, st[key]); st.k = 0; replan(); draw(); notify(); }
    function replan() { plan = chufaSteps(st.a, st.b); }
    function go(k) { st.k = Math.max(0, Math.min(total(), k)); draw(); notify(); if (P) P.log("interact", { what: "chufa-step", a: st.a, b: st.b, k: st.k }); }
    function notify() { try { root.dispatchEvent(new CustomEvent("manip:change", { detail: { a: st.a, b: st.b, done: st.k }, bubbles: true })); } catch (e) { /* ignore */ } }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var n = plan.n, colW = 44, left = 84, cx = function (i) { return left + 36 + i * colW; }, rows = plan.chunks.length;
      var H = 150 + rows * 74 + 30;
      svg.setAttribute("viewBox", "0 0 360 " + H);
      var t = function (x, y, s, color, size) { el("text", { x: x, y: y, "text-anchor": "middle", style: "fill:" + color + ";font-size:" + (size || 26) + "px;font-weight:700" }, svg).textContent = s; };
      // 竖式的框：除数 ）被除数
      el("path", { d: "M" + (left + 12) + " 70 L" + (cx(n - 1) + 24) + " 70 M" + (left + 12) + " 70 Q" + (left + 12) + " 96 " + (left) + " 104", style: "fill:none;stroke:var(--fg);stroke-width:2.5" }, svg);
      t(left - 12, 100, String(st.b), "var(--c)");
      String(st.a).split("").forEach(function (d, i) { t(cx(i), 100, d, "var(--fg)"); });
      var shown = Math.min(st.k, plan.steps.length), cur = shown > 0 ? plan.steps[shown - 1] : null;
      if (cur) el("rect", { x: 4, y: cur.kind === "q" ? 20 : 112 + cur.chunk * 74 + (cur.kind === "r" ? 40 : 0), width: 352, height: cur.kind === "q" ? 52 : 40, rx: 8, style: "fill:var(--hl-soft);opacity:.55" }, svg);
      plan.chunks.forEach(function (c, j) {
        var base = 112 + j * 74, st0 = j * 3;
        if (shown > st0) t(cx(c.e), 54, String(c.q), "var(--a)");
        if (shown > st0 + 1) {
          String(c.p).split("").reverse().forEach(function (d, i) { t(cx(c.e - i), base + 28, d, "var(--c)"); });
          el("line", { x1: cx(c.e - String(c.cur).length + 1) - 16, y1: base + 38, x2: cx(c.e) + 16, y2: base + 38, style: "stroke:var(--fg);stroke-width:2" }, svg);
        }
        if (shown > st0 + 2) {
          var rr = c.r === 0 && j < rows - 1 ? "" : String(c.r);
          if (rr) rr.split("").reverse().forEach(function (d, i) { t(cx(c.e - i), base + 68, d, "var(--b)"); });
          if (j < rows - 1) t(cx(c.e + 1), base + 68, String(plan.chunks[j + 1].digit), "var(--b)");
        }
      });
      var done = st.k >= plan.steps.length;
      if (names && st.k > plan.steps.length) {
        var last = plan.chunks[rows - 1], y0 = 112 + (rows - 1) * 74;
        t(cx(n) + 12, 100, "被除数", "var(--fg)", 16); t(left - 12, 130, "除数", "var(--c)", 16);
        t(cx(last.e) + 62, 54, "商", "var(--a)", 16); t(cx(last.e) + 62, y0 + 28, "积", "var(--c)", 16); t(cx(last.e) + 62, y0 + 68, "余数", "var(--b)", 16);
        t(180, H - 10, st.a + " ÷ " + st.b + " = " + plan.quotient + (plan.remainder ? " …… " + plan.remainder : ""), "var(--fg)", 20);
      }
      if (done && !(names && st.k > plan.steps.length) && !names) t(180, H - 10, st.a + " ÷ " + st.b + " = " + plan.quotient + (plan.remainder ? " …… " + plan.remainder : ""), "var(--fg)", 20);
      if (st.k === 0) read.textContent = "要算 " + st.a + " ÷ " + st.b + "。点「下一步」：商、乘、减，一位一位来。";
      else if (st.k > plan.steps.length) read.textContent = "认一认：" + st.a + " 是被除数，" + st.b + " 是除数，商是 " + plan.quotient + "，" + (plan.remainder ? "积 " + (plan.chunks[rows - 1].p) + "，余数是 " + plan.remainder + "（余数比除数小）。" : "最后一个积 " + plan.chunks[rows - 1].p + "，正好除尽，没有余数。");
      else if (done) read.textContent = cur.text + " 所以 " + st.a + " ÷ " + st.b + " = " + plan.quotient + (plan.remainder ? " ……" + plan.remainder : "") + "。";
      else read.textContent = cur.text;
      bPrev.disabled = st.k <= 0; bNext.disabled = st.k >= total(); bAll.disabled = st.k >= total();
      Object.keys(steppers).forEach(function (key) { var sp = steppers[key]; sp.val.textContent = " " + st[key] + " "; sp.minus.disabled = st[key] <= sp.min; sp.plus.disabled = st[key] >= sp.max; });
      svg.setAttribute("aria-label", "除法竖式：" + st.a + " 除以 " + st.b + (done ? " 商 " + plan.quotient + (plan.remainder ? " 余 " + plan.remainder : "") : ""));
    }
    replan(); draw();
  }

  window.PeiyuManip.register("chufa", chufa);
})();
