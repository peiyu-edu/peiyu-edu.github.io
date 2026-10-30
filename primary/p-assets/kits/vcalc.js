/* 培玉 · 小学数学 — 公共教具：加减竖式（vcalc）。加载：<script defer src="../p-assets/kits/vcalc.js"></script>（放在 manip.js 后面）。
   登记一个 kind：vcalc。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格）都能用；有「重来」。
   把一道两位数 / 三位数的加法或减法竖式一位一位算出来：数位对齐（个位对个位），从个位算起；
   加法满十写 0（或别的数）向前一位进 1；减法不够减从前一位退 1 当 10，前一位是 0 就继续往前退；
   最高位算出来是 0 不写。每一步高亮正在算的那一位，读数里写这一位怎么算。
     <div class="manip" data-manip="vcalc" data-cfg='{"op":"+","a":43,"b":27}'></div>
   cfg：
     op      "+"（默认）| "-"
     a, b    两个数，0–999；减法要求 a ≥ b（edit 里调的时候自动保持）。
     edit    true：出「被加数 / 被减数 −＋」「加数 / 减数 −＋」两个调数按钮；默认 false，题固定。
     steps   true（默认）：点「下一步」一位一位出来；false：一开始就算完。
   典型配置：
     {"op":"+","a":43,"b":27}              个位满 10：个位写 0，进 1
     {"op":"+","a":54,"b":8}               一位数对准个位
     {"op":"-","a":50,"b":24}              个位 0 不够减：从十位退 1 当 10
     {"op":"-","a":65,"b":61}              十位相减得 0，省略不写
     {"op":"-","a":100,"b":24,"edit":true} 连续退位；可调两个数
   纯函数 PeiyuManip.vcalcSteps(op, a, b) 返回 {steps, result}，页面和测试都可以直接用。
   每次变化在根元素上抛 manip:change（detail：op、a、b、done 已算到第几位）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  var PLACES = ["个位", "十位", "百位", "千位"];

  function digits(n) {
    var out = [], v = n;
    do { out.push(v % 10); v = Math.floor(v / 10); } while (v > 0);
    return out; // 个位在前
  }

  // 一位一位算：每步 {col, da, db, carryIn, x, carryOut, digit, write, text}。write=false：这一位不写（最高位的 0）。
  function vcalcSteps(op, a, b) {
    var da = digits(a), db = digits(b), steps = [], carry = 0, i, n;
    if (op === "-") {
      n = da.length;
      for (i = 0; i < n; i++) {
        var top = da[i], bot = db[i] === undefined ? 0 : db[i], lent = carry, x = top - lent, borrow = 0, text, name = PLACES[i];
        if (x < bot) { borrow = 1; x += 10; }
        var r = x - bot;
        if (lent && top === 0) text = name + "：0 要退给后一位 1，不够，向" + PLACES[i + 1] + "退 1 当 10：10 − 1 = 9，9 − " + bot + " = " + r + "，" + name + "写 " + r + "。";
        else if (lent && borrow) text = name + "：" + top + " 退给后一位 1，剩 " + (top - 1) + "，" + (top - 1) + " − " + bot + " 不够减，向" + PLACES[i + 1] + "退 1 当 10：" + x + " − " + bot + " = " + r + "，" + name + "写 " + r + "。";
        else if (lent) text = name + "：" + top + " 退给后一位 1，剩 " + (top - 1) + "，" + (top - 1) + " − " + bot + " = " + r + "，" + name + "写 " + r + "。";
        else if (borrow) text = name + "：" + top + " − " + bot + " 不够减，向" + PLACES[i + 1] + "退 1 当 10，10 + " + top + " = " + x + "，" + x + " − " + bot + " = " + r + "，" + name + "写 " + r + "。";
        else if (db[i] === undefined) text = name + "：下面没有数，" + top + " 照写，" + name + "写 " + r + "。";
        else text = name + "：" + top + " − " + bot + " = " + r + "，" + name + "写 " + r + "。";
        steps.push({ col: i, top: top, bot: db[i] === undefined ? null : db[i], carryIn: lent, x: x, carryOut: borrow, digit: r, write: true, text: text });
        carry = borrow;
      }
      // 最高位往下连续算出 0 的，不写（个位的 0 要写）。
      var hi = 0;
      for (i = 0; i < n; i++) if (steps[i].digit !== 0) hi = i;
      for (i = hi + 1; i < n; i++) {
        steps[i].write = false;
        // 算式照原样保留（这一位自己也退过位时，算式里有「退 1 当 10」），只把末尾的「写 0」改成「最高位的 0 不写」。
        steps[i].text = steps[i].text.replace(/，[^，。：]*位写 0。$/, "。这一位是最高位上的 0，不写。");
      }
    } else {
      n = Math.max(da.length, db.length);
      for (i = 0; i < n; i++) {
        var t = da[i] === undefined ? 0 : da[i], u = db[i] === undefined ? 0 : db[i], s = t + u + carry, nm = PLACES[i];
        var calc = (da[i] !== undefined && db[i] !== undefined) ? t + " + " + u : String(t + u);
        if (carry) calc += " + " + carry + "（进位）";
        var res = s % 10, co = s >= 10 ? 1 : 0, tx;
        if (da[i] === undefined || db[i] === undefined) tx = nm + "：只有一个数 " + (t + u) + (carry ? "，加上进位 " + carry + " = " + s : "") +
          (co ? "，满 10，" + nm + "写 " + res + "，向" + PLACES[i + 1] + "进 1。" : "，" + nm + "写 " + res + "。");
        else tx = nm + "：" + calc + " = " + s + "，" + (co ? "满 10，" + nm + "写 " + res + "，向" + PLACES[i + 1] + "进 1。" : nm + "写 " + res + "。");
        steps.push({ col: i, top: t, bot: u, carryIn: carry, x: s, carryOut: co, digit: res, write: true, text: tx });
        carry = co;
      }
      if (carry) steps.push({ col: n, top: 0, bot: 0, carryIn: carry, x: carry, carryOut: 0, digit: carry, write: true, final: true,
        text: PLACES[n] + "：把进来的 " + carry + " 写在" + PLACES[n] + "。" });
    }
    var value = op === "-" ? a - b : a + b;
    return { steps: steps, result: value };
  }
  window.PeiyuManip.vcalcSteps = vcalcSteps;

  function vcalc(root, cfg) {
    var el = U.el, P = window.PeiyuP;
    var op = cfg.op === "-" ? "-" : "+";
    function clamp(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    var st = { a: clamp(cfg.a, 0, 999, 43), b: clamp(cfg.b, 0, 999, 27), k: 0 };
    if (op === "-" && st.b > st.a) st.b = st.a;
    var stepMode = cfg.steps !== false;
    var plan = null;
    var svg = el("svg", { class: "stage", role: "group", "aria-label": "加减竖式" });
    root.appendChild(svg);
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    function hb(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap"; b.addEventListener("click", fn); return b; }
    var bPrev = hb("上一步", function () { go(st.k - 1); }), bNext = hb("下一步", function () { go(st.k + 1); }), bReset = hb("重来", function () { go(0); });
    var bAll = hb("一下算完", function () { go(plan.steps.length); });
    ctr.appendChild(bPrev); ctr.appendChild(bNext); ctr.appendChild(bAll); ctr.appendChild(bReset);
    var steppers = {};
    if (cfg.edit) {
      [["a", op === "-" ? "被减数" : "被加数"], ["b", op === "-" ? "减数" : "加数"]].forEach(function (pair) {
        var key = pair[0], label = pair[1], box = document.createElement("span"); box.className = "count";
        var minus = hb("−", function () { setNum(key, st[key] - 1); }), plus = hb("＋", function () { setNum(key, st[key] + 1); });
        var val = document.createElement("span"); val.setAttribute("aria-live", "off"); box.appendChild(document.createTextNode(label + " ")); box.appendChild(minus); box.appendChild(val); box.appendChild(plus);
        minus.setAttribute("aria-label", label + "减 1"); plus.setAttribute("aria-label", label + "加 1");
        steppers[key] = { val: val, minus: minus, plus: plus }; ctr2.appendChild(box);
      });
    }
    root.appendChild(ctr); if (cfg.edit) root.appendChild(ctr2); root.appendChild(read);

    function setNum(key, v) {
      v = clamp(v, 0, 999, st[key]);
      if (op === "-") { if (key === "a" && v < st.b) v = st.b; if (key === "b" && v > st.a) v = st.a; }
      st[key] = v; st.k = stepMode ? 0 : -1; replan(); draw();
    }
    function replan() { plan = vcalcSteps(op, st.a, st.b); if (st.k === -1) st.k = plan.steps.length; }
    function go(k) {
      k = Math.max(0, Math.min(plan.steps.length, k)); st.k = k; draw();
      if (P) P.log("interact", { what: "vcalc-step", op: op, a: st.a, b: st.b, k: k });
      try { root.dispatchEvent(new CustomEvent("manip:change", { detail: { op: op, a: st.a, b: st.b, done: k }, bubbles: true })); } catch (e) { /* ignore */ }
    }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var steps = plan.steps, cols = Math.max(steps.length, digits(st.a).length, digits(st.b).length, 2), colW = 52, right = 300, H = 214;
      var cx = function (c) { return right - c * colW - colW / 2; };
      svg.setAttribute("viewBox", "0 0 360 " + H);
      var cur = st.k > 0 ? steps[st.k - 1] : null;
      var da = digits(st.a), db = digits(st.b);
      // 正在算的那一位的底色
      if (cur) el("rect", { x: cx(cur.col) - colW / 2 + 2, y: 30, width: colW - 4, height: 170, rx: 8, style: "fill:var(--hl-soft);stroke:var(--a);stroke-width:2" }, svg);
      for (var c = 0; c < cols; c++) el("text", { x: cx(c), y: 20, "text-anchor": "middle", style: "fill:var(--muted);font-size:17px" }, svg).textContent = PLACES[c] || "";
      // 进位 / 退位的小数字（写在前一位的上面）
      for (var s = 0; s < st.k; s++) {
        var step = steps[s];
        if (step.carryOut && steps[s + 1]) {
          if (op === "+") el("text", { x: cx(s + 1) + 14, y: 52, "text-anchor": "middle", style: "fill:var(--b);font-size:17px;font-weight:700" }, svg).textContent = "1";
        }
      }
      // 被加数 / 被减数
      for (var i = 0; i < da.length; i++) {
        var lenderDone = op === "-" && i >= 1 && steps[i - 1] && steps[i - 1].carryOut && st.k >= i;
        var t = el("text", { x: cx(i), y: 92, "text-anchor": "middle", style: "fill:var(--fg);font-size:28px;font-weight:700" + (lenderDone ? ";opacity:.4" : "") }, svg);
        t.textContent = String(da[i]);
        if (lenderDone) {
          el("line", { x1: cx(i) - 11, y1: 100, x2: cx(i) + 11, y2: 78, style: "stroke:var(--no);stroke-width:2.5" }, svg);
          var rest = da[i] - 1 + (steps[i] && steps[i].top === 0 && steps[i].carryIn ? 10 : 0);
          el("text", { x: cx(i), y: 62, "text-anchor": "middle", style: "fill:var(--b);font-size:17px;font-weight:700" }, svg).textContent = String(Math.max(0, steps[i].carryIn && steps[i].top === 0 ? 9 : rest));
        }
        if (op === "-" && steps[i] && st.k > i && steps[i].carryOut) el("text", { x: cx(i) - 17, y: 80, "text-anchor": "middle", style: "fill:var(--b);font-size:18px;font-weight:700" }, svg).textContent = "1";
      }
      // 第二个数
      el("text", { x: right - cols * colW - 8, y: 134, "text-anchor": "middle", style: "fill:var(--fg);font-size:28px;font-weight:700" }, svg).textContent = op === "-" ? "−" : "+";
      for (var j = 0; j < db.length; j++) el("text", { x: cx(j), y: 134, "text-anchor": "middle", style: "fill:var(--c);font-size:28px;font-weight:700" }, svg).textContent = String(db[j]);
      el("line", { x1: right - cols * colW, y1: 146, x2: right, y2: 146, style: "stroke:var(--fg);stroke-width:2.5" }, svg);
      // 已经算出来的结果
      for (var k = 0; k < st.k; k++) if (steps[k].write) el("text", { x: cx(steps[k].col), y: 186, "text-anchor": "middle", style: "fill:var(--a);font-size:28px;font-weight:700" }, svg).textContent = String(steps[k].digit);
      // 读数
      var done = st.k >= steps.length;
      if (st.k === 0) read.textContent = (op === "-" ? "要算 " + st.a + " − " + st.b : "要算 " + st.a + " + " + st.b) + "。数位对齐，从个位算起，点「下一步」。";
      else if (done) read.textContent = steps[steps.length - 1].text + " 所以 " + st.a + " " + (op === "-" ? "−" : "+") + " " + st.b + " = " + plan.result + "。";
      else read.textContent = cur.text;
      bPrev.disabled = st.k <= 0; bNext.disabled = done; bAll.disabled = done;
      if (cfg.edit) {
        Object.keys(steppers).forEach(function (key) {
          var sp = steppers[key]; sp.val.textContent = " " + st[key] + " ";
          sp.minus.disabled = st[key] <= (op === "-" && key === "a" ? st.b : 0);
          sp.plus.disabled = st[key] >= (op === "-" && key === "b" ? st.a : 999);
        });
      }
      svg.setAttribute("aria-label", "加减竖式：" + st.a + (op === "-" ? " 减 " : " 加 ") + st.b + (done ? " 等于 " + plan.result : ""));
    }

    st.k = stepMode ? 0 : -1;
    replan(); draw();
  }

  window.PeiyuManip.register("vcalc", vcalc);
})();
