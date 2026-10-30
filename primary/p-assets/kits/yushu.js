/* 培玉 · 小学数学 — 公共教具：有余数的分一分（yushu）。加载：<script defer src="../p-assets/kits/yushu.js"></script>（放在 manip.js 后面）。
   登记一个 kind：yushu。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格）都能用；有「重来」。
   每 k 个一份地往外分（搭、装、圈都行），一份一份点，到剩下的不够一份就停下：剩下的那几个就是余数。
   读数写圈了几份、用了多少、还剩多少，最后写出「总数 ÷ k = 商 …… 余数」，并说明余数比 k 小、不够再分一份。
   （整除的分一分用 fenyifen；这个教具专管除不尽，也能分整除的，对比「正好分完」和「还剩几个」。）
     <div class="manip" data-manip="yushu" data-cfg='{"total":11,"k":5,"thing":"根","verb":"搭","unit":"个五边形"}'></div>
   cfg：
     total, k   总数 1–40、每份几个 1–12（k 比 total 大时一份也分不出，商是 0，余数是 total）。
     thing      一个东西的量词，默认「个」（根、块、元……）。
     verb       动词，默认「分」（搭、装、圈……）。读数里写「搭了 2 个五边形」，按钮写「搭一个五边形」。
     unit       一份叫什么（连量词），默认「份」（个五边形、袋、串……）。
     chain      true：写连减式 28 − 9 − 9 − 9 = 1。
     check      "mul"：算完写检验 9 × 3 + 1 = 28；"add"：写加法检验 9 + 9 + 9 = 27，27 + 1 = 28。默认不写。
     div        false：不出除法式、不提「余数」（一年级还没学除法）：读数写「能装满 3 袋，还剩 1 个」；默认 true。
     edit       true：出调数按钮（总数、每份几个各 −／＋）。
   典型配置：
     {"total":11,"k":5,"thing":"根","verb":"搭","unit":"个五边形"}        还剩 1 根
     {"total":10,"k":5,"thing":"根","verb":"搭","unit":"个五边形"}        正好搭完
     {"total":28,"k":9,"verb":"装","unit":"袋","chain":true,"check":"add","div":false}  一年级：能装满几袋，不提除法和余数
   纯函数 PeiyuManip.yushuInfo(total, k) 返回 {q, r, used, chain, mul, add}，页面和测试都可以直接用。
   每次变化在根元素上抛 manip:change（detail：total、k、parts、rest、done）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;

  function yushuInfo(total, k) {
    var q = Math.floor(total / k), r = total - q * k, subs = [], adds = [], i;
    for (i = 0; i < q; i++) { subs.push(k); adds.push(k); }
    return {
      q: q, r: r, used: q * k,
      chain: q ? total + " − " + subs.join(" − ") + " = " + r : total + " 比 " + k + " 小，一份也分不出，还是 " + total,
      mul: k + " × " + q + " + " + r + " = " + total,
      add: q ? adds.join(" + ") + " = " + q * k + "，" + q * k + " + " + r + " = " + total : "0 + " + r + " = " + total
    };
  }
  window.PeiyuManip.yushuInfo = yushuInfo;

  function yushu(root, cfg) {
    var el = U.el, P = window.PeiyuP;
    function clamp(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    var thing = cfg.thing || "个", verb = cfg.verb || "分", unit = cfg.unit || "份";
    var showDiv = cfg.div !== false;
    var st = { total: clamp(cfg.total, 1, 40, 11), k: clamp(cfg.k, 1, 12, 5), n: 0 };
    var W = 360;
    var svg = el("svg", { class: "stage", role: "group" });
    root.appendChild(svg);
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    var read2 = document.createElement("p"); read2.className = "read";
    function hb(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap"; b.addEventListener("click", fn); return b; }
    var bMain = hb("", function () { step(); }), bReset = hb("重来", function () { st.n = 0; draw(); notify(); });
    ctr.appendChild(bMain); ctr.appendChild(bReset);
    var steppers = {};
    if (cfg.edit) {
      [["total", "总数", 1, 40], ["k", "每份", 1, 12]].forEach(function (d) {
        var key = d[0], label = d[1], box = document.createElement("span"); box.className = "count";
        var minus = hb("−", function () { setNum(key, st[key] - 1); }), plus = hb("＋", function () { setNum(key, st[key] + 1); });
        var val = document.createElement("span"); box.appendChild(document.createTextNode(label + " ")); box.appendChild(minus); box.appendChild(val); box.appendChild(plus);
        minus.setAttribute("aria-label", label + "减 1"); plus.setAttribute("aria-label", label + "加 1");
        steppers[key] = { val: val, minus: minus, plus: plus, min: d[2], max: d[3] }; ctr2.appendChild(box);
      });
    }
    root.appendChild(ctr); if (cfg.edit) root.appendChild(ctr2); root.appendChild(read); root.appendChild(read2);
    function setNum(key, v) { st[key] = clamp(v, steppers[key].min, steppers[key].max, st[key]); st.n = 0; draw(); notify(); }
    function info() { return yushuInfo(st.total, st.k); }
    function rest() { return st.total - st.n * st.k; }
    function canStep() { return rest() >= st.k; }
    function step() { if (!canStep()) return; st.n++; draw(); notify(); if (P) P.log("interact", { what: "yushu-step", total: st.total, k: st.k, n: st.n }); }
    function notify() { try { root.dispatchEvent(new CustomEvent("manip:change", { detail: { total: st.total, k: st.k, parts: st.n, rest: rest(), done: !canStep() }, bubbles: true })); } catch (e) { /* ignore */ } }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var r = rest(), I = info(), over = !canStep();
      var y = 8;
      // 还没分的一堆（剩下不够一份时，整堆换成虚线框，标「剩下」）
      var cols = Math.min(r, 12), rows = r ? Math.ceil(r / cols) : 0, x0 = (W - (cols - 1) * 26) / 2;
      if (r) {
        if (over) el("rect", { x: x0 - 16, y: y - 2, width: (cols - 1) * 26 + 32, height: rows * 26 + 8, rx: 12, style: "fill:none;stroke:var(--no);stroke-width:2.5;stroke-dasharray:6 4" }, svg);
        for (var i = 0; i < r; i++) el("circle", { cx: x0 + (i % cols) * 26, cy: y + 14 + Math.floor(i / cols) * 26, r: 10, style: "fill:" + (over ? "var(--no)" : "var(--b)") }, svg);
        y += rows * 26 + 14;
        if (over) { el("text", { x: 180, y: y + 14, "text-anchor": "middle", style: "fill:var(--no);font-size:18px;font-weight:700" }, svg).textContent = "剩下 " + r + " " + thing + "，不够 " + st.k + " " + thing; y += 26; }
        y += 6;
      }
      if (st.n) {
        el("line", { x1: 12, y1: y, x2: 348, y2: y, style: "stroke:var(--line);stroke-width:2;stroke-dasharray:6 5" }, svg);
        y += 12;
        // 已经分好的几份：每份一个框，一行放不下就换行
        var bc = st.k <= 3 ? st.k : Math.ceil(Math.sqrt(st.k)), br = Math.ceil(st.k / bc), bw = Math.max(54, bc * 22 + 14), bh = br * 22 + 14, gap = 10;
        var perRow = Math.max(1, Math.floor((W - 16 + gap) / (bw + gap)));
        for (var g = 0; g < st.n; g++) {
          var rr = Math.floor(g / perRow), inRow = Math.min(perRow, st.n - rr * perRow), c = g - rr * perRow;
          var bx = (W - (inRow * bw + (inRow - 1) * gap)) / 2 + c * (bw + gap), by = y + rr * (bh + 14);
          el("rect", { x: bx, y: by, width: bw, height: bh, rx: 14, style: "fill:none;stroke:var(" + (g % 2 ? "--c" : "--a") + ");stroke-width:2.5" }, svg);
          for (var j = 0; j < st.k; j++) el("circle", { cx: bx + (bw - (bc - 1) * 22) / 2 + (j % bc) * 22, cy: by + 18 + Math.floor(j / bc) * 22, r: 9, style: "fill:var(" + (g % 2 ? "--c" : "--a") + ")" }, svg);
        }
        y += Math.ceil(st.n / perRow) * (bh + 14);
      }
      svg.setAttribute("viewBox", "0 0 360 " + Math.max(y + 6, 60));
      svg.setAttribute("aria-label", (showDiv ? "有余数的分一分：" : "分一分：") + st.total + " " + thing + "，每 " + st.k + " " + thing + "一份" + (over ? "，分成 " + st.n + " 份，还剩 " + r + " " + thing : ""));
      bMain.textContent = verb + "一" + unit; bMain.disabled = over;
      var line;
      if (!st.n) line = st.total + " " + thing + "，每 " + st.k + " " + thing + "一份。点「" + bMain.textContent + "」，" + verb + "到不够一份为止。";
      else if (!over) line = verb + "了 " + st.n + " " + unit + "，用了 " + st.n * st.k + " " + thing + "，还有 " + r + " " + thing + "，够 " + st.k + " " + thing + "，还能再" + verb + "。";
      else if (r === 0) line = verb + "了 " + st.n + " " + unit + "，用了 " + st.n * st.k + " " + thing + "，正好" + verb + "完" + (showDiv ? "，没有余数。" : "，一个也没剩。");
      else line = showDiv
        ? verb + "了 " + st.n + " " + unit + "，用了 " + st.n * st.k + " " + thing + "，还剩 " + r + " " + thing + "，比 " + st.k + " " + thing + "少，不够再" + verb + "一" + unit + "。这个剩下的 " + r + " 就是余数。"
        : "能" + verb + "满 " + st.n + " " + unit + "，还剩 " + r + " " + thing + "，不够再" + verb + "一" + unit + "。";
      if (over && !st.n) line = st.total + " " + thing + "比 " + st.k + " " + thing + "少，一" + unit + "也" + verb + "不出来" + (showDiv ? "：商是 0，余数是 " + st.total + "。" : "，还剩 " + st.total + " " + thing + "。");
      read.textContent = line; read.className = "read" + (over && st.n ? (r ? "" : " ok") : "");
      var html = "";
      if (over) {
        if (cfg.chain) html += "<span>" + I.chain + "</span><br>";
        if (showDiv) html += '<span style="font-size:24px;font-weight:700">' + st.total + " ÷ " + st.k + " = " + I.q + (I.r ? " …… " + I.r : "") + "</span>";
        else html += '<span style="font-size:22px;font-weight:700">' + I.q + " " + unit + (I.r ? "，还剩 " + I.r + " " + thing : "，没有剩") + "</span>";
        if (cfg.check === "mul" || cfg.check === "add") html += "<br><span>检验：" + (cfg.check === "mul" ? I.mul : I.add) + "</span>";
      }
      read2.innerHTML = html;
      Object.keys(steppers).forEach(function (key) { var sp = steppers[key]; sp.val.textContent = " " + st[key] + " "; sp.minus.disabled = st[key] <= sp.min; sp.plus.disabled = st[key] >= sp.max; });
    }
    draw();
  }

  window.PeiyuManip.register("yushu", yushu);
})();
