/* 培玉 · 小学数学 — 公共教具：条形图情境（tiaoxing）。加载：<script defer src="../p-assets/kits/tiaoxing.js"></script>（放在 manip.js 后面）。
   登记一个 kind：tiaoxing。配置只来自 data-cfg。数由代码算；鼠标、触屏、键盘（Tab + 回车 / 空格）都能用；有「重来」。
   用长条图把「故事不一样、算式一样」的加减情境画出来，数在 1–40 之间：长条每格 1 个，虚线格是「少掉 / 要求的」部分，
   「？」在哪里就先看图想一想，点「下一步」看怎么列式，算出来以后长条上的「？」变成得数。
     <div class="manip" data-manip="tiaoxing" data-cfg='{"kind":"part","a":8,"b":7,"unit":"只"}'></div>
   cfg.kind：
     "part"     整体和部分：两个部分 a、b，整体 a + b。出两张图：① 求总数（？在整体）8 + 7 = 15；② 求一部分（？在部分）15 − 8 = 7。
     "compare"  比多比少：big、small 两个数（bigName、smallName 是两个名字，默认一班、二班）。一条长条分成「同样多」和「多的」，
                另一条画「少的」；① big 比 small 多几；② small 比 big 少几，都是 big − small。
     "delta"    求大数 / 求小数：base 是已知的那一条，d 比它多几、d2 比它少几（d2 可省，默认等于 d）。
                ① 比 base 多 d：base + d；② 比 base 少 d2：base − d2。
     "bridge"   连续两问搭桥：a 是已知的数，d 是「少 d」；第 1 问 a − d 得 s，第 2 问用刚算出的 s：a + s。nameA、nameB 默认哥哥、妹妹。
   其他：unit 量词，默认「个」；names 见上。
   纯函数 PeiyuManip.tiaoxingPlan(cfg) 返回 {scenes:[{title, steps:[{text, eq}]}]}，页面和测试都可以直接用。
   每次变化在根元素上抛 manip:change（detail：kind、scene、step）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;

  function plan(cfg) {
    var kind = cfg.kind || "part", unit = cfg.unit || "个", scenes = [];
    function seg(n, text, o) { return Object.assign({ n: n, text: text }, o || {}); }
    if (kind === "part") {
      var a = cfg.a, b = cfg.b, T = a + b;
      scenes.push({ title: "① 求总数（？在整体）", bars: [{ label: "一共", unknownTotal: true, segs: [seg(a, a + " " + unit, { color: "a" }), seg(b, b + " " + unit, { color: "c" })], total: T }],
        steps: [{ text: "知道两个部分 " + a + " 和 " + b + "，要求「一共」：把两部分合起来，用加法。", eq: a + " + " + b + " = " + T }] });
      scenes.push({ title: "② 求一部分（？在部分）", bars: [{ label: "一共 " + T, segs: [seg(a, a + " " + unit, { color: "a" }), seg(b, b + " " + unit, { color: "c", unknown: true })], total: T }],
        steps: [{ text: "知道一共 " + T + " 和一个部分 " + a + "，要求另一个部分：从总数里去掉 " + a + "，用减法。", eq: T + " − " + a + " = " + b }] });
    } else if (kind === "compare") {
      var big = cfg.big, small = cfg.small, d = big - small, bn = cfg.bigName || "一班", sn = cfg.smallName || "二班";
      var bars = [{ label: bn, segs: [seg(small, "同样多 " + small, { color: "a" }), seg(d, "多 " + d, { color: "c", unknown: true })] },
                  { label: sn, segs: [seg(small, small + " " + unit, { color: "a" }), seg(d, "少 " + d, { color: "c", dashed: true, unknown: true })] }];
      scenes.push({ title: "① " + bn + "比" + sn + "多几", bars: bars, steps: [{ text: "去掉和" + sn + "同样多的 " + small + "，" + bn + "剩下的就是多出来的：用减法。", eq: big + " − " + small + " = " + d }] });
      scenes.push({ title: "② " + sn + "比" + bn + "少几", bars: bars, steps: [{ text: "还是比较这两条：" + bn + "比" + sn + "多 " + d + "，" + sn + "就比" + bn + "少 " + d + "。同一个算式。", eq: big + " − " + small + " = " + d }] });
    } else if (kind === "delta") {
      var base = cfg.base, up = cfg.d, down = cfg.d2 === undefined ? cfg.d : cfg.d2;
      scenes.push({ title: "① 求大数（比 " + base + " 多 " + up + "）", bars: [{ label: "已知 " + base, segs: [seg(base, String(base), { color: "a" })] },
        { label: "多的", segs: [seg(base, "同样多 " + base, { color: "a" }), seg(up, "多 " + up, { color: "c" })], unknownTotal: true, total: base + up }],
        steps: [{ text: "要求的比 " + base + " 多 " + up + "：在 " + base + " 后面接上 " + up + "，用加法。", eq: base + " + " + up + " = " + (base + up) }] });
      scenes.push({ title: "② 求小数（比 " + base + " 少 " + down + "）", bars: [{ label: "已知 " + base, segs: [seg(base - down, "", { color: "a" }), seg(down, "少 " + down, { color: "c", dashed: true })] },
        { label: "少的", segs: [seg(base - down, String(base - down), { color: "a", unknown: true })], unknownTotal: true, total: base - down }],
        steps: [{ text: "要求的比 " + base + " 少 " + down + "：从 " + base + " 里剪掉 " + down + "，用减法。", eq: base + " − " + down + " = " + (base - down) }] });
    } else if (kind === "bridge") {
      var ba = cfg.a, bd = cfg.d, s = ba - bd, na = cfg.nameA || "哥哥", nb = cfg.nameB || "妹妹";
      scenes.push({ title: "连续两问", bars: [{ label: na + " " + ba, segs: [seg(ba, String(ba), { color: "a" })] },
        { label: nb, segs: [seg(s, String(s), { color: "c", unknown: true, from: 1 }), seg(bd, "少 " + bd, { color: "c", dashed: true })] },
        { label: "一共", segs: [seg(ba, String(ba), { color: "a" }), seg(s, String(s), { color: "c", unknown: true, from: 1 })], unknownTotal: true, from: 3, total: ba + s }],
        steps: [{ text: "第 1 问：" + nb + "比" + na + "少 " + bd + "，" + nb + "有几" + unit + "？ 从 " + ba + " 里去掉 " + bd + "，用减法。", eq: ba + " − " + bd + " = " + s },
                { text: "搭桥：第 1 问算出的 " + s + " 就是" + nb + "的数量，第 2 问要用它，不要再拿「少 " + bd + "」的 " + bd + " 去算。", eq: "" },
                { text: "第 2 问：两人一共几" + unit + "？ " + na + " " + ba + " 加" + nb + " " + s + "，用加法。", eq: ba + " + " + s + " = " + (ba + s) }] });
    }
    return { scenes: scenes };
  }
  window.PeiyuManip.tiaoxingPlan = plan;

  function tiaoxing(root, cfg) {
    var el = U.el, P = window.PeiyuP, info = plan(cfg), st = { scene: 0, k: 0 };
    var svg = el("svg", { class: "stage", role: "group" });
    root.appendChild(svg);
    var tabs = document.createElement("div"); tabs.className = "ctrls";
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    function hb(label, fn) { var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap"; b.addEventListener("click", fn); return b; }
    var tabBtns = [];
    if (info.scenes.length > 1) {
      info.scenes.forEach(function (sc, i) { var b = hb(sc.title, function () { st.scene = i; st.k = 0; draw(); notify(); }); b.setAttribute("aria-pressed", "false"); tabBtns.push(b); tabs.appendChild(b); });
      root.appendChild(tabs);
    }
    var bPrev = hb("上一步", function () { go(st.k - 1); }), bNext = hb("下一步", function () { go(st.k + 1); }), bReset = hb("重来", function () { go(0); });
    ctr.appendChild(bPrev); ctr.appendChild(bNext); ctr.appendChild(bReset);
    root.appendChild(ctr); root.appendChild(read);
    function scene() { return info.scenes[st.scene]; }
    function go(k) { st.k = Math.max(0, Math.min(scene().steps.length, k)); draw(); notify(); if (P) P.log("interact", { what: "tiaoxing-step", kind: cfg.kind || "part", scene: st.scene, k: st.k }); }
    function notify() { try { root.dispatchEvent(new CustomEvent("manip:change", { detail: { kind: cfg.kind || "part", scene: st.scene, step: st.k }, bubbles: true })); } catch (e) { /* ignore */ } }

    function lastEq() { for (var i = st.k - 1; i >= 0; i--) if (scene().steps[i].eq) return scene().steps[i].eq; return ""; }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var sc = scene(), bars = sc.bars, maxN = 0, y = 14;
      bars.forEach(function (b) { var t = b.segs.reduce(function (s, g) { return s + g.n; }, 0); if (t > maxN) maxN = t; });
      var unitW = Math.min(16, Math.floor(250 / Math.max(1, maxN))), left = 14, rowH = 44, labelW = 0;
      bars.forEach(function (b, bi) {
        var x = left;
        el("text", { x: left, y: y + 14, style: "fill:var(--fg);font-size:19px;font-weight:700" }, svg).textContent = (b.unknownTotal && !shown(b, 0) ? b.label + " ？" : b.label + (b.unknownTotal ? " " + b.total : ""));
        var by = y + 22;
        b.segs.forEach(function (g) {
          var hide = g.unknown && !shown(g, 1), w = g.n * unitW;
          el("rect", { x: x, y: by, width: Math.max(w, 2), height: 28, rx: 5, style: g.dashed ? "fill:none;stroke:var(--no);stroke-width:2.5;stroke-dasharray:5 4" : "fill:var(--" + g.color + ");opacity:" + (hide ? 0.3 : 0.85) }, svg);
          var txt = hide ? "？" : g.text;
          var tw = function (t) { return t.replace(/[ -~]/g, "").length * 19 + t.replace(/[^ -~]/g, "").length * 10 + 6; };
          if (txt && tw(txt) > w) txt = txt.replace(/[^0-9？]/g, "");
          if (txt && tw(txt) <= w) el("text", { x: x + w / 2, y: by + 20, "text-anchor": "middle", style: "fill:" + (hide ? "var(--fg)" : g.dashed ? "var(--no)" : "var(--on-accent, #fff)") + ";font-size:19px;font-weight:700" }, svg).textContent = txt;
          x += w;
        });
        y += rowH + 16;
        labelW = Math.max(labelW, x);
      });
      y += 4;
      for (var i = 0; i < st.k; i++) {
        if (!sc.steps[i].eq) continue;
        y += 28;
        el("text", { x: left, y: y, style: "fill:" + (i === st.k - 1 ? "var(--a)" : "var(--fg)") + ";font-size:21px;font-weight:700" }, svg).textContent = sc.steps[i].eq;
      }
      svg.setAttribute("viewBox", "0 0 360 " + Math.max(y + 14, 80));
      svg.setAttribute("aria-label", "条形图情境：" + sc.title + (lastEq() ? "，" + lastEq() : ""));
      read.textContent = st.k === 0 ? sc.title + "：先看图，「？」是要求的，想一想用加法还是减法。点「下一步」。" : sc.steps[st.k - 1].text;
      bPrev.disabled = st.k <= 0; bNext.disabled = st.k >= sc.steps.length; bReset.disabled = st.k === 0;
      tabBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === st.scene)); b.classList.toggle("on", i === st.scene); });
    }
    // g.from / b.from：第几步以后才显示数（默认：第 1 步；整体的总数在第 1 步显示）
    function shown(o, dflt) { return st.k >= (o.from !== undefined ? o.from : dflt === 0 ? 1 : dflt); }
    draw();
  }

  window.PeiyuManip.register("tiaoxing", tiaoxing);
})();
