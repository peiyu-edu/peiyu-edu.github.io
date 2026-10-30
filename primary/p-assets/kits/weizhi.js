/* 培玉 · 小学数学 — 公共教具：位值口算（weizhi）。加载：<script defer src="../p-assets/kits/weizhi.js"></script>（放在 manip.js 后面）。
   登记一个 kind：weizhi。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格）都能用；有「重来」。
   把两位数的口算按「位值」一步一步拆开：几个十、几个一分开算，再合起来。上面画出数的小棒（一条 = 1 个十，一块 = 1 个一），
   下面一行一行出算式，读数里写每一步为什么这样算。同一道题可以放两种口算方法，点「方法一 / 方法二」对比。
     <div class="manip" data-manip="weizhi" data-cfg='{"a":23,"b":34,"methods":["split+"]}'></div>
   cfg：
     a, b      两个数。加减：a 0–99、b 0–99（减法 a ≥ b）；除法：a 0–999、b 1–9。
     methods   方法列表（默认按 op 取第一种），一个以上出「方法一 / 方法二」切换：
                 "split+"   拆成整十和几：整十加整十、几加几（个位相加不满十），再合起来   23 + 34
                 "ones+"    b 是一位数：先把个位相加（满十），再加整十                      35 + 8，方法一
                 "ten+"     b 是一位数：先凑成整十，再加剩下的                               35 + 8，方法二
                 "split-"   整十减整十、几减几（个位够减），再合起来                         58 − 23
                 "break-"   b 是一位数、个位不够减：把整十拆出 10，用「10 加个位」去减        34 − 7，方法一
                 "ten-"     b 是一位数、个位不够减（个位不是 0）：把 a 拆成「整十和 10」，先算 10 − b   34 − 7，方法二（与课文一致）
                 "tens-"    b 是一位数、个位不够减：先减个位那几，凑成整十，再减剩下的         另一种想法，课页暂未用
                 "div"      除法：被除数拆成整十（或几十、几）分别除，再合起来                  150 ÷ 3、84 ÷ 4
     op        可省：由 methods 里第一种方法决定（"+"、"−"、"÷"）。
     edit      true：出调数按钮（a、b 各 −／＋）；调到这种方法不适用时，读数说明为什么，并给出可用的方法。
   典型配置：
     {"a":23,"b":34,"methods":["split+"]}
     {"a":35,"b":8,"methods":["ones+","ten+"]}
     {"a":58,"b":23,"methods":["split-"]}
     {"a":34,"b":7,"methods":["break-","ten-"]}
     {"a":150,"b":3,"methods":["div"]}      {"a":84,"b":4,"methods":["div"]}
   纯函数 PeiyuManip.weizhiSteps(method, a, b) 返回 {ok, steps, result, op} 或 {ok:false, why}，页面和测试都可以直接用。
   每次变化在根元素上抛 manip:change（detail：method、a、b、done）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  var NAMES = { "split+": "拆成整十和几", "ones+": "先算个位", "ten+": "先凑整十", "split-": "拆成整十和几", "break-": "拆出 10 来减", "ten-": "先拆出 10 再减", "tens-": "先减到整十", "div": "按位值分开除" };
  var OPS = { "split+": "+", "ones+": "+", "ten+": "+", "split-": "−", "break-": "−", "ten-": "−", "tens-": "−", "div": "÷" };

  function parts(n) { return { t: n - (n % 10), o: n % 10 }; }
  // 一步：eq 是算式（读数里要成立的等式），why 是这一步为什么这样做
  function weizhiSteps(method, a, b) {
    var A = parts(a), B = parts(b), steps = [], r;
    function no(why) { return { ok: false, why: why }; }
    function st(eq, why) { steps.push({ eq: eq, why: why }); }
    switch (method) {
      case "split+":
        if (A.t === 0 && B.t === 0) return no("两个都是一位数，直接相加就行，不用拆。");
        var fit = A.t === 0 ? B.o + a : A.o + b, hintM = fit < 10 ? "不进位：个位相加，再和整十合起来。" : "换「先算个位」或「先凑整十」。";
        if (A.t === 0) return no("有一个数是一位数，不用拆成整十和几；把一位数放在后面算 " + b + " + " + a + "，" + hintM);
        if (B.t === 0) return no("有一个数是一位数，不用拆成整十和几；" + hintM);
        if (A.o === 0 || B.o === 0) return no("有一个数的个位是 0（是整十数），整十数加几直接合起来就行，不用拆。");
        if (A.o + B.o >= 10) return no("个位 " + A.o + " + " + B.o + " 满十了，不能直接合起来；换「先算个位」或「先凑整十」。");
        r = a + b;
        st(a + " = " + A.t + " + " + A.o + (b >= 10 ? "，" + b + " = " + B.t + " + " + B.o : ""), "先把数拆成几个十和几个一。");
        st(A.t + " + " + B.t + " = " + (A.t + B.t), "整十加整十：" + A.t / 10 + " 个十加 " + B.t / 10 + " 个十是 " + (A.t + B.t) / 10 + " 个十。");
        st(A.o + " + " + B.o + " = " + (A.o + B.o), "个位加个位。");
        st((A.t + B.t) + " + " + (A.o + B.o) + " = " + r, "再把两部分合起来。");
        break;
      case "ones+":
        if (b >= 10) return no("这种方法 b 要是一位数。");
        if (A.t === 0) return no("两个都是一位数，直接相加就行，不用先算个位。");
        if (A.o + b < 10) return no("个位 " + A.o + " + " + b + " 不满十，直接把个位相加就行，不用这种方法。");
        r = a + b;
        st(A.o + " + " + b + " = " + (A.o + b), "先算个位：" + a + " 的个位 " + A.o + " 加 " + b + "。");
        st(A.t + " + " + (A.o + b) + " = " + r, "再用整十 " + A.t + " 加上刚才的得数。");
        break;
      case "ten+":
        if (b >= 10) return no("这种方法 b 要是一位数。");
        if (A.o + b < 10) return no("个位 " + A.o + " + " + b + " 不满十，不用凑整十。");
        if (A.o + b === 10) return no("个位 " + A.o + " + " + b + " 正好凑成整十，没有「剩下的」可加；用「先算个位」更直接。");
        r = a + b;
        st(b + " = " + (10 - A.o) + " + " + (b - (10 - A.o)), "把 " + b + " 拆成 " + (10 - A.o) + " 和 " + (b - (10 - A.o)) + "：先拿 " + (10 - A.o) + " 把 " + a + " 凑成整十。");
        st(a + " + " + (10 - A.o) + " = " + (A.t + 10), "凑成整十。");
        st((A.t + 10) + " + " + (b - (10 - A.o)) + " = " + r, "再加上剩下的 " + (b - (10 - A.o)) + "。");
        break;
      case "split-":
        if (a < b) return no("被减数要不小于减数。");
        if (A.t === 0 || B.t === 0) return no("有一个数是一位数，不用拆成整十和几；换「拆出 10 来减」或「先减到整十」。");
        if (B.o === 0) return no("减数是整十数，整十减整十直接算就行，不用拆。");
        if (A.t === B.t) return no("两个数的十位一样，整十减整十得 0，直接把个位相减就行。");
        if (A.o < B.o) return no("个位 " + A.o + " 不够减 " + B.o + "；换「拆出 10 来减」或「先减到整十」。");
        r = a - b;
        st(a + " = " + A.t + " + " + A.o + (b >= 10 ? "，" + b + " = " + B.t + " + " + B.o : ""), "先把数拆成几个十和几个一。");
        st(A.t + " − " + B.t + " = " + (A.t - B.t), "整十减整十：" + A.t / 10 + " 个十减 " + B.t / 10 + " 个十，剩 " + (A.t - B.t) / 10 + " 个十。");
        st(A.o + " − " + B.o + " = " + (A.o - B.o), "个位减个位。");
        st((A.t - B.t) + " + " + (A.o - B.o) + " = " + r, "再把剩下的两部分合起来。");
        break;
      case "break-":
        if (b >= 10) return no("这种方法 b 要是一位数。");
        if (a < b) return no("被减数要不小于减数。");
        if (A.o >= b) return no("个位 " + A.o + " 够减 " + b + "，不用拆出 10。");
        if (A.t < 20) return no("十位只有 1 个十，拆出 10 以后没有剩下的整十了；换「先减到整十」。");
        r = a - b;
        st(a + " = " + (A.t - 10) + " + " + (10 + A.o), "个位 " + A.o + " 不够减 " + b + "：把 " + a + " 拆成 " + (A.t - 10) + " 和 " + (10 + A.o) + "（拆出一个 10）。");
        st((10 + A.o) + " − " + b + " = " + (10 + A.o - b), "用「10 加个位」去减。");
        st((A.t - 10) + " + " + (10 + A.o - b) + " = " + r, "再和剩下的整十合起来。");
        break;
      case "ten-":
        if (b >= 10) return no("这种方法 b 要是一位数。");
        if (a < b) return no("被减数要不小于减数。");
        if (A.o >= b) return no("个位 " + A.o + " 够减 " + b + "，不用拆出 10。");
        if (A.o === 0) return no("个位是 0 时，拆出的 10 就是整十里的一个十，用「拆出 10 来减」就行。");
        r = a - b;
        st(a + " = " + (a - 10) + " + 10", "个位 " + A.o + " 不够减 " + b + "：把 " + a + " 拆成 " + (a - 10) + " 和 10。");
        st("10 − " + b + " = " + (10 - b), "先从 10 里减 " + b + "。");
        st((a - 10) + " + " + (10 - b) + " = " + r, "再把剩下的 " + (a - 10) + " 加上 " + (10 - b) + "。");
        break;
      case "tens-":
        if (b >= 10) return no("这种方法 b 要是一位数。");
        if (a < b) return no("被减数要不小于减数。");
        if (A.o >= b) return no("个位 " + A.o + " 够减 " + b + "，不用先减到整十。");
        r = a - b;
        st(a + " − " + A.o + " = " + A.t, "先把 " + a + " 个位上的 " + A.o + " 减掉，凑成整十 " + A.t + "。");
        st(b + " − " + A.o + " = " + (b - A.o), "还要再减 " + b + " − " + A.o + " = " + (b - A.o) + "。");
        st(A.t + " − " + (b - A.o) + " = " + r, "从整十里再减去它。");
        break;
      case "div":
        if (b < 1 || b > 9) return no("除数要是 1 到 9。");
        r = Math.floor(a / b);
        if (r * b !== a) return no(a + " 不能被 " + b + " 整除，这一步只做除得尽的口算。");
        if (a % 10 === 0 && a >= 20 && (a / 10) % b === 0 && a / 10 >= b) {
          st(a + " = " + a / 10 + " 个十", a + " 看成 " + a / 10 + " 个十。");
          st(a / 10 + " ÷ " + b + " = " + a / 10 / b, a / 10 + " 个十平均分成 " + b + " 份，每份 " + a / 10 / b + " 个十。");
          st(a / 10 / b + " 个十 = " + r, a / 10 / b + " 个十就是 " + r + "。");
        } else {
          var P = parts(a);
          if (P.t === 0 || P.o === 0 || P.t % b !== 0 || P.o % b !== 0) return no(a + " 不能拆成「整十 + 几」再分别除以 " + b + "。");
          st(a + " = " + P.t + " + " + P.o, "把 " + a + " 拆成整十和几，两部分都能被 " + b + " 整除。");
          st(P.t + " ÷ " + b + " = " + P.t / b, "先除整十部分。");
          st(P.o + " ÷ " + b + " = " + P.o / b, "再除个位部分。");
          st(P.t / b + " + " + P.o / b + " = " + r, "把两个商加起来。");
        }
        break;
      default:
        return no("没有这种方法：" + method);
    }
    return { ok: true, steps: steps, result: r, op: OPS[method] };
  }
  window.PeiyuManip.weizhiSteps = weizhiSteps;

  function weizhi(root, cfg) {
    var el = U.el, P = window.PeiyuP;
    var methods = (cfg.methods && cfg.methods.length) ? cfg.methods : ["split+"];
    var op = OPS[methods[0]] || "+";
    function clamp(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    var maxA = op === "÷" ? 999 : 99, maxB = op === "÷" ? 9 : 99, minB = op === "÷" ? 1 : 0;
    var st = { a: clamp(cfg.a, 0, maxA, 23), b: clamp(cfg.b, minB, maxB, op === "÷" ? 3 : 34), m: 0, k: 0 };
    var plan = null;
    var svg = el("svg", { class: "stage", role: "group" });
    root.appendChild(svg);
    var tabs = document.createElement("div"); tabs.className = "ctrls";
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    function hb(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap"; b.addEventListener("click", fn); return b; }
    var tabBtns = [];
    if (methods.length > 1) {
      methods.forEach(function (m, i) {
        var b = hb("方法" + ["一", "二", "三", "四"][i] + "：" + (NAMES[m] || m), function () { st.m = i; st.k = 0; replan(); draw(); notify(); });
        b.setAttribute("aria-pressed", "false"); tabBtns.push(b); tabs.appendChild(b);
      });
      root.appendChild(tabs);
    }
    var bPrev = hb("上一步", function () { go(st.k - 1); }), bNext = hb("下一步", function () { go(st.k + 1); }), bAll = hb("一下算完", function () { go(plan.ok ? plan.steps.length : 0); }), bReset = hb("重来", function () { go(0); });
    ctr.appendChild(bPrev); ctr.appendChild(bNext); ctr.appendChild(bAll); ctr.appendChild(bReset);
    var steppers = {};
    if (cfg.edit) {
      [["a", "a"], ["b", "b"]].forEach(function (pair) {
        var key = pair[0], box = document.createElement("span"); box.className = "count";
        var label = key === "a" ? (op === "÷" ? "被除数" : op === "−" ? "被减数" : "第一个数") : (op === "÷" ? "除数" : op === "−" ? "减数" : "第二个数");
        var minus = hb("−", function () { setNum(key, st[key] - 1); }), plus = hb("＋", function () { setNum(key, st[key] + 1); });
        var val = document.createElement("span"); box.appendChild(document.createTextNode(label + " ")); box.appendChild(minus); box.appendChild(val); box.appendChild(plus);
        minus.setAttribute("aria-label", label + "减 1"); plus.setAttribute("aria-label", label + "加 1");
        steppers[key] = { val: val, minus: minus, plus: plus, max: key === "a" ? maxA : maxB, min: key === "a" ? 0 : minB }; ctr2.appendChild(box);
      });
    }
    root.appendChild(ctr); if (cfg.edit) root.appendChild(ctr2); root.appendChild(read);

    function setNum(key, v) { v = clamp(v, steppers[key].min, steppers[key].max, st[key]); st[key] = v; st.k = 0; replan(); draw(); notify(); }
    function replan() { plan = weizhiSteps(methods[st.m], st.a, st.b); }
    function go(k) {
      if (!plan.ok) return;
      st.k = Math.max(0, Math.min(plan.steps.length, k)); draw(); notify();
      if (P) P.log("interact", { what: "weizhi-step", method: methods[st.m], a: st.a, b: st.b, k: st.k });
    }
    function notify() { try { root.dispatchEvent(new CustomEvent("manip:change", { detail: { method: methods[st.m], a: st.a, b: st.b, done: st.k }, bubbles: true })); } catch (e) { /* ignore */ } }

    // 画一个数：几条十（竖条）、几个一（小方块）；一行最多放 10 条，放不下就换行
    function picture(n, x0, y0, color, label) {
      var p = parts(n), bars = p.t / 10, rows = Math.max(1, Math.ceil(bars / 10)), w = 18, h = 38;
      for (var i = 0; i < bars; i++) el("rect", { x: x0 + (i % 10) * w, y: y0 + Math.floor(i / 10) * (h + 6), width: w - 4, height: h, rx: 3, style: "fill:" + color + ";opacity:.85" }, svg);
      var ox = x0 + Math.min(bars, 10) * w + (bars ? 6 : 0);
      for (var j = 0; j < p.o; j++) el("rect", { x: ox + (j % 5) * 14, y: y0 + h - 12 - Math.floor(j / 5) * 14 + (rows - 1) * 0, width: 11, height: 11, rx: 2, style: "fill:" + color + ";opacity:.55" }, svg);
      el("text", { x: x0, y: y0 + rows * (h + 6) + 20, style: "fill:var(--fg);font-size:18px;font-weight:700" }, svg).textContent = label;
      return rows * (h + 6) + 28;
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var y = 8;
      if (plan.ok) {
        var op2 = plan.op, h1 = picture(st.a, 14, y, "var(--a)", st.a + "（" + parts(st.a).t / 10 + " 个十 " + parts(st.a).o + " 个一）");
        y += h1;
        if (op2 !== "÷") y += picture(st.b, 14, y, "var(--c)", st.b + "（" + parts(st.b).t / 10 + " 个十 " + parts(st.b).o + " 个一）");
        y += 6;
        el("line", { x1: 12, y1: y, x2: 348, y2: y, style: "stroke:var(--line);stroke-width:2;stroke-dasharray:6 5" }, svg);
        y += 4;
        for (var i = 0; i < st.k; i++) {
          y += 32;
          var last = i === st.k - 1;
          el("text", { x: 14, y: y, style: "fill:" + (last ? "var(--a)" : "var(--fg)") + ";font-size:20px;font-weight:700" }, svg).textContent = ["①", "②", "③", "④"][i] + " " + plan.steps[i].eq;
        }
        y += 14;
      } else y = 40;
      var H = Math.max(y, 80);
      svg.setAttribute("viewBox", "0 0 360 " + H);
      svg.setAttribute("aria-label", "位值口算：" + st.a + " " + OPS[methods[st.m]] + " " + st.b + (plan.ok && st.k >= plan.steps.length ? " 等于 " + plan.result : ""));
      var done = plan.ok && st.k >= plan.steps.length;
      if (!plan.ok) read.textContent = plan.why;
      else if (st.k === 0) read.textContent = "要算 " + st.a + " " + plan.op + " " + st.b + "。点「下一步」，按位值一步一步算。";
      else if (done) read.textContent = plan.steps[plan.steps.length - 1].why + " 所以 " + st.a + " " + plan.op + " " + st.b + " = " + plan.result + "。";
      else read.textContent = plan.steps[st.k - 1].why;
      bPrev.disabled = !plan.ok || st.k <= 0; bNext.disabled = !plan.ok || done; bAll.disabled = !plan.ok || done; bReset.disabled = !plan.ok;
      tabBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === st.m)); b.classList.toggle("on", i === st.m); });
      Object.keys(steppers).forEach(function (key) {
        var sp = steppers[key]; sp.val.textContent = " " + st[key] + " ";
        sp.minus.disabled = st[key] <= sp.min; sp.plus.disabled = st[key] >= sp.max;
      });
    }
    replan(); draw();
  }

  window.PeiyuManip.register("weizhi", weizhi);
})();
