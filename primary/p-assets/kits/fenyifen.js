/* 培玉 · 小学数学 — 教具文件：分一分、口诀卡（二上第三单元「表内除法（一）」，第五单元「表内除法（二）」可用）。
   加载：<script defer src="../p-assets/kits/fenyifen.js"></script>（放在 manip.js 后面）。
   登记两个 kind：fenyifen、koujue。配置只来自 data-cfg。数由代码算；鼠标、触屏（点）、键盘（Tab + 回车 / 空格）都能用；都有「重来」。

   ── fenyifen  分一分 ────────────────────────────────────────────
   一堆圆点，「每几个圈一份」（求能分几份）或「一轮一轮平均分到几个盘里」（求每份几个）。
   可同步写连减式，分完写除法算式，并在算式下标出被除数、除数、商。
   分不完的设置（总数不是份数 / 每份数的倍数）：主按钮变灰，读数提示「分不完。换一个数试试。」
     <div class="manip" data-manip="fenyifen" data-cfg='{"total":18,"mode":"group","k":3,"ks":[2,3,6],"chain":true,"eq":true}'></div>
   cfg（都可省）：
     total     总数，1–36，默认 12
     mode      "group" 每几个圈一份（默认）| "deal" 一轮一轮分到盘里
     modes     ["group","deal"] 两种分法都给，出切换按钮（第一项之外的初始分法用 mode 指定）
     modeNames {group:"…", deal:"…"} 切换按钮上的字（默认「每几个一份」「分到盘里」）
     k         每份几个，默认 2；ks [2,3,…] 给几个可选的按钮（「每 3 个」）
     n         盘子数（份数），1–6，默认 2；ns [2,3,…] 可选按钮（「3 盘」），超过 6 按 6
     per       盘子模式每轮每盘放几个，默认 1；pers [1,2] 出「每次放 2 个」切换。最后一轮不够时每盘放得少一些
     hide      盘子模式先不告诉总数（袋子盖住，分完才显示「一共是…」），hideName 袋子里是什么（如「花生」，默认「东西」）
     chain     同步写连减算式（18 − 3 − 3 = 12）；hide 未分完时不写
     eq        分完写除法算式（18 ÷ 3 = 6，带朗读按钮）
     names     与 eq 同用：算式下标「被除数 / 除数 / 商」
     thing     量词，默认「个」（如「块」「元」）
     plate     盘子模式里一份叫什么，默认「盘」（如「份」）
   典型配置：
     {"total":21,"mode":"group","k":3}                                    每 3 个圈一份
     {"total":24,"mode":"deal","n":3,"ns":[2,3,4,6]}                      平均分到几盘，可换盘数
     {"total":20,"mode":"deal","n":4,"hide":true,"hideName":"花生","pers":[1,2]}   袋子里的花生，一次放 1 个或 2 个
     {"total":18,"mode":"deal","n":3,"chain":true,"eq":true,"names":true} 连减 + 除法算式 + 名称
     {"total":30,"mode":"deal","modes":["deal","group"],"modeNames":{"deal":"第 1 题：分成 5 份","group":"第 2 题：每 6 元一本"},"n":5,"k":6,"thing":"元","plate":"份","eq":true}
   原来用在：lessons/p2a-u3-1 … p2a-u3-7（页内写法 data-fen）。
   每次变化在根元素上抛 manip:change（detail：mode、total、size、parts、each、done）。

   ── koujue  口诀卡（用口诀求商）──────────────────────────────────
   显示「a ÷ d = ？」。pick 时先让孩子选「想几的口诀」，再在那一组口诀里点一句：
   得数等于被除数且含除数，亮出商；得数对但没有除数（选错了组），提示「除数是几，就想几的口诀」；
   得数不对，提示往下想 / 往上想。
     <div class="manip" data-manip="koujue" data-cfg='{"a":10,"d":5,"pick":true}'></div>
   cfg：
     a     被除数（默认等于 d）
     d     除数，1–max（默认 1）；商也要在 1–max，否则读数提示「这道题用 1～max 的口诀求不出商。」
     pick  true：先出 1–max 个「想 N 的口诀」按钮，孩子自己选；默认 false，直接列出 d 的那组口诀
     max   口诀到几，6（默认，二上第三单元只到「六六三十六」）或 7–9（第五单元，到「九九八十一」）
   典型配置：{"a":20,"d":4}、{"a":10,"d":5,"pick":true}、{"a":56,"d":7,"pick":true,"max":9}
   原来用在：lessons/p2a-u3-5、p2a-u3-6（页内写法 data-kj）。
   每次变化在根元素上抛 manip:change（detail：a、d、row、found）。 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  function emitAns(root, cfg, value, correct, first, suffix) {
    var kind = (root && root.getAttribute("data-manip")) || "fenyifen";
    var all = document.querySelectorAll('.manip[data-manip="' + kind + '"]');
    var idx = [].indexOf.call(all, root);
    var qid = ((cfg && cfg.id) || (root && root.id) || (kind + (idx > 0 ? "-" + (idx + 1) : ""))) + (suffix ? "-" + suffix : "");
    root.setAttribute("data-lab-id", qid);
    var detail = { id: qid, value: String(value), correct: Boolean(correct), first: Boolean(first) };
    try { root.dispatchEvent(new CustomEvent("manip:answer", { detail: detail, bubbles: true })); } catch (e) { /* ignore */ }
    if (window.PeiyuP) window.PeiyuP.log("lab", Object.assign({ _emitted: true }, detail));
  }

  function fenyifen(root, cfg) {
    var W = 360;
    var P = window.PeiyuP;
    var cn = U.cn, el = U.el;
    function hb(label, fn) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = label; b.style.whiteSpace = "nowrap";
      b.addEventListener("click", fn); return b;
    }
    function clampInt(v, lo, hi, d) { v = Math.round(+v); return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; }
    var total = clampInt(cfg.total, 1, 36, 12);
    var modes = (cfg.modes && cfg.modes.length) ? cfg.modes : [cfg.mode || "group"];
    var thing = cfg.thing || "个", plate = cfg.plate || "盘";
    var st = { mode: cfg.mode || modes[0], k: clampInt(cfg.k || 2, 1, 36, 2), n: clampInt(cfg.n || 2, 1, 6, 2), per: clampInt(cfg.per || 1, 1, 6, 1), parts: 0, rounds: [] };
    var firstTry = true, reported = false;
  
    var svg = el("svg", { class: "stage", role: "group" });
    root.appendChild(svg);
    var ctr = document.createElement("div"); ctr.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    var read2 = document.createElement("p"); read2.className = "read";
    var modeBtns = [], sizeBtns = [], perBtns = [];
    if (modes.length > 1) {
      modes.forEach(function (m) {
        var b = hb((cfg.modeNames && cfg.modeNames[m]) || (m === "group" ? "每几个一份" : "分到" + plate + "里"), function () { st.mode = m; reset(); });
        b.setAttribute("data-m", m); modeBtns.push(b); ctr.appendChild(b);
      });
    }
    var sizeRow = document.createElement("span"); sizeRow.className = "count"; ctr.appendChild(sizeRow);
    var bMain = hb("", step), bReset = hb("重来", function () { reset(); log("reset"); });
    ctr2.appendChild(bMain); ctr2.appendChild(bReset);
    root.appendChild(ctr); root.appendChild(ctr2); root.appendChild(read); root.appendChild(read2);
  
    function log(what, extra) { if (P) P.log("interact", Object.assign({ what: "fen-" + what, mode: st.mode, total: total, size: size() }, extra || {})); }
    function size() { return st.mode === "group" ? st.k : st.n; }
    function canSplit() { return size() >= 1 && total % size() === 0; }
    function each() { return st.rounds.reduce(function (s, x) { return s + x; }, 0); }
    function moved() { return st.mode === "group" ? st.parts * st.k : each() * st.n; }
    function rem() { return total - moved(); }
    function done() { return canSplit() && rem() === 0; }
    function reset() { st.parts = 0; st.rounds = []; reported = false; buildChoices(); draw(); }
    function step() {
      if (!canSplit() || rem() <= 0) return;
      if (st.mode === "group") st.parts++;
      else st.rounds.push(Math.min(st.per, rem() / st.n));
      draw(); log("step", { parts: st.mode === "group" ? st.parts : st.n, each: st.mode === "group" ? st.k : each() });
      if (done() && !reported) {
        reported = true;
        var d0 = st.mode === "group" ? st.k : st.n, q0 = st.mode === "group" ? st.parts : each();
        emitAns(root, cfg, total + "÷" + d0 + "=" + q0, true, firstTry);
      }
    }
    function buildChoices() {
      sizeRow.innerHTML = ""; sizeBtns = []; perBtns = [];
      var list = st.mode === "group" ? cfg.ks : cfg.ns;
      (list || []).forEach(function (v) {
        v = clampInt(v, 1, 36, 2);
        var b = hb(st.mode === "group" ? "每 " + v + " " + thing : v + " " + plate, function () {
          if (st.mode === "group") st.k = v; else st.n = Math.min(6, v);
          reset(); log("size");
          if (!canSplit()) {
            emitAns(root, cfg, total + "÷" + size(), false, firstTry);
            firstTry = false;
          }
        });
        b.setAttribute("data-v", v); sizeBtns.push(b); sizeRow.appendChild(b);
      });
      if (st.mode === "deal" && cfg.pers) {
        cfg.pers.forEach(function (v) {
          v = clampInt(v, 1, 6, 1);
          var b = hb("每次放 " + v + " " + thing, function () { st.per = v; reset(); log("per"); });
          b.setAttribute("data-v", v); perBtns.push(b); sizeRow.appendChild(b);
        });
      }
    }
    function boxCols(q) { return q <= 3 ? Math.max(1, q) : Math.ceil(Math.sqrt(q)); }
    // 一行一行排盒子，每行居中；返回每个盒子的 x、y、宽、高和总高度
    function flow(count, w, h, y0) {
      var gap = 10, perRow = Math.max(1, Math.floor((W - 16 + gap) / (w + gap))), out = [], rows = Math.ceil(count / perRow);
      for (var i = 0; i < count; i++) {
        var r = Math.floor(i / perRow), inRow = Math.min(perRow, count - r * perRow), c = i - r * perRow;
        var x0 = (W - (inRow * w + (inRow - 1) * gap)) / 2;
        out.push({ x: x0 + c * (w + gap), y: y0 + r * (h + 34) });
      }
      return { boxes: out, height: rows * (h + 34) };
    }
    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      modeBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-m") === st.mode ? "true" : "false"); });
      sizeBtns.forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-v") === size() ? "true" : "false"); });
      perBtns.forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-v") === st.per ? "true" : "false"); });
      var group = st.mode === "group", hide = !group && cfg.hide && !done();
      var r = rem();
      // —— 还没分的一堆 ——
      var pile = el("g", { class: "part", tabindex: "0", role: "button", "aria-label": group ? "没分的" + thing + "，点一下圈一份" : "没分的" + thing + "，点一下分一轮" }, svg);
      var pileH;
      if (hide) {
        el("rect", { x: 110, y: 12, width: 140, height: 72, rx: 20, style: "fill:var(--hl-soft);stroke:var(--b);stroke-width:2.5" }, pile);
        el("text", { x: 180, y: 60, "text-anchor": "middle", style: "fill:var(--b);font-size:30px;font-weight:700" }, pile).textContent = r > 0 ? "？" : "空了";
        pileH = 96;
      } else {
        var cols = Math.min(total, 12), rows = Math.ceil(total / cols), x0 = (W - (cols - 1) * 26) / 2;
        el("rect", { x: x0 - 16, y: 6, width: (cols - 1) * 26 + 32, height: rows * 26 + 6, rx: 12, style: "fill:transparent" }, pile);
        for (var i = 0; i < total; i++) {
          var cx = x0 + (i % cols) * 26, cy = 22 + Math.floor(i / cols) * 26;
          if (i < r) el("circle", { cx: cx, cy: cy, r: 10, style: "fill:var(--b)" }, pile);
          else el("circle", { cx: cx, cy: cy, r: 9, style: "fill:none;stroke:var(--dim);stroke-width:1.5;stroke-dasharray:3 3" }, pile);
        }
        pileH = rows * 26 + 24;
      }
      pile.addEventListener("click", step);
      pile.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); step(); } });
      el("line", { x1: 20, y1: pileH + 4, x2: W - 20, y2: pileH + 4, style: "stroke:var(--line);stroke-width:2;stroke-dasharray:6 5" }, svg);
      // —— 分好的几份 ——
      var q = group ? st.k : Math.ceil(total / st.n), count = group ? Math.ceil(total / st.k) : st.n;
      // 盒宽不能小于下面标签「N 量词」的宽度（19px 粗体：数字约 10.5、汉字 19），否则多字量词在相邻盒子之间会重叠（PY-353）。
      var labelW = String(q).length * 10.5 + 5 + Array.from(thing).length * 19;
      var bc = boxCols(q), br = Math.ceil(q / bc), bw = Math.max(52, bc * 22 + 14, Math.ceil(labelW) + 8), bh = br * 22 + 14;
      var lay = flow(count, bw, bh, pileH + 18);
      var shown = group ? st.parts : st.n, e1 = each();
      for (var b = 0; b < shown; b++) {
        var bx = lay.boxes[b].x, by = lay.boxes[b].y;
        var stroke = group ? (b % 2 ? "var(--c)" : "var(--a)") : "var(--c)";
        el("rect", { x: bx, y: by, width: bw, height: bh, rx: group ? 14 : bh / 2.6, style: "fill:" + (group ? "none" : "var(--bg)") + ";stroke:" + stroke + ";stroke-width:2.5" }, svg);
        var inBox = group ? st.k : e1, ix0 = bx + (bw - (bc - 1) * 22) / 2;
        for (var j = 0; j < inBox; j++) {
          var latest = group ? b === st.parts - 1 : j >= e1 - (st.rounds[st.rounds.length - 1] || 0);
          el("circle", { cx: ix0 + (j % bc) * 22, cy: by + 18 + Math.floor(j / bc) * 22, r: 9, style: "fill:" + (latest ? "var(--a)" : "var(--b)") }, svg);
        }
        el("text", { x: bx + bw / 2, y: by + bh + 22, "text-anchor": "middle", style: "fill:var(--fg);font-size:19px;font-weight:700" }, svg).textContent = inBox + " " + thing;
      }
      var H = Math.ceil(pileH + 18 + lay.height + 4);
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("aria-label", group ? "分一分：每几个一份地圈" : "分一分：分到" + plate + "里");
      // —— 按钮与读数 ——
      bMain.textContent = group ? "圈一份" : "分一轮";
      bMain.disabled = !canSplit() || r <= 0;
      var T = total, k = st.k, n = st.n, parts = group ? st.parts : n, per = group ? k : e1;
      read2.innerHTML = ""; read2.className = "read";
      if (!canSplit()) {
        read.className = "read no";
        read.textContent = group ? T + " " + thing + "，每 " + k + " " + thing + "一份，分不完。换一个数试试。"
          : T + " " + thing + "平均分到 " + n + " 个" + plate + "里，分不完。换一个数试试。";
        emitC(); return;
      }
      if (!moved()) {
        read.className = "read";
        read.textContent = group ? T + " " + thing + "，每 " + k + " " + thing + "圈一份。点「圈一份」。"
          : (cfg.hide ? "袋子里的" + (cfg.hideName || "东西") : T + " " + thing) + "，平均分到 " + n + " 个" + plate + "里。点「分一轮」。";
        emitC(); return;
      }
      var line, sayT;
      if (done()) {
        line = (group ? T + " " + thing + "，每 " + k + " " + thing + "一份。" : (cfg.hide ? "一共是 " : "") + T + " " + thing + "，平均分成 " + n + " 份。")
          + "分成了 " + parts + " 份，每份 " + per + " " + thing + "，正好分完。";
        sayT = (group ? cn(T) + thing + "，每" + cn(k) + thing + "一份。" : cn(T) + thing + "，平均分成" + cn(n) + "份。")
          + "分成了" + cn(parts) + "份，每份" + cn(per) + thing + "，正好分完。";
        setRead(read, line, sayT, "ok");
      } else {
        var last = st.rounds[st.rounds.length - 1] || 0;
        line = group ? "圈了 " + parts + " 份，每份 " + k + " " + thing + "。还有 " + r + " " + thing + "没分。"
          : "分了 " + st.rounds.length + " 轮，这一轮分掉 " + last * n + " " + thing + "。每" + plate + "现在 " + e1 + " " + thing + "。";
        setRead(read, line, null, "");
      }
      // 连减与除法算式
      var html = "";
      if (cfg.chain && !hide) {
        var subs = group ? Array.apply(null, Array(st.parts)).map(function () { return k; }) : st.rounds.map(function (x) { return x * n; });
        html += "<span>" + T + " − " + subs.join(" − ") + " = " + r + "</span>";
      }
      if (cfg.eq && done()) {
        var d = group ? k : n, qq = group ? parts : per;
        if (cfg.names) {
          html += '<span class="eqn" style="display:inline-grid;grid-template-columns:repeat(5,auto);gap:0 8px;text-align:center;font-size:26px;font-weight:700">'
            + '<span style="color:var(--a)">' + T + "</span><span>÷</span><span style=\"color:var(--c)\">" + d + "</span><span>=</span><span style=\"color:var(--b)\">" + qq + "</span>"
            + '<span style="font-size:15px;color:var(--a)">被除数</span><span></span><span style="font-size:15px;color:var(--c)">除数</span><span></span><span style="font-size:15px;color:var(--b)">商</span></span>';
        } else {
          html += '<span style="font-size:26px;font-weight:700">' + T + " ÷ " + d + " = " + qq + "</span>";
        }
        read2.innerHTML = html;
        if (P) read2.appendChild(P.sayButton(cn(T) + "除以" + cn(d) + "等于" + cn(qq))).addEventListener("click", function (ev) { P.say(ev.currentTarget.getAttribute("data-say"), ev.currentTarget); });
      } else {
        read2.innerHTML = html;
      }
      emitC();
    }
    function setRead(node, text, sayText, cls) {
      node.className = "read" + (cls ? " " + cls : "");
      node.textContent = text;
      if (sayText && P) node.appendChild(P.sayButton(sayText)).addEventListener("click", function (ev) { P.say(sayText, ev.currentTarget); });
    }
    function emitC() {
      var g = st.mode === "group";
      try { root.dispatchEvent(new CustomEvent("manip:change", { bubbles: true, detail: { mode: st.mode, total: total, size: size(), parts: g ? st.parts : st.n, each: g ? st.k : each(), done: done() } })); } catch (e) { /* ignore */ }
    }
    buildChoices();
    draw();
  }

  function koujue(root, cfg) {
    var P = window.PeiyuP;
    var CN = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var cn = U.cn;
    var MAX = Math.max(6, Math.min(9, Math.round(+cfg.max) || 6)); // 口诀到几：默认 6（二上第三单元），第五单元用 9
    function verse(i, j) { // i ≤ j
      var p = i * j, t = Math.floor(p / 10), u = p % 10, prod;
      if (p < 10) prod = "得" + CN[p];
      else if (p === 10) prod = "一十";
      else if (p < 20) prod = "十" + CN[u];
      else prod = CN[t] + "十" + (u ? CN[u] : "");
      return CN[i] + CN[j] + prod;
    }
    var d = Math.max(1, Math.min(MAX, Math.round(+cfg.d) || 1));
    var a = Math.round(+cfg.a) || d;
    var ans = a % d === 0 && a / d >= 1 && a / d <= MAX ? a / d : null;
    var st = { row: cfg.pick ? 0 : d, found: false }, firstTry = true, reported = false;
    var top = document.createElement("div"); top.className = "ctrls";
    var list = document.createElement("div"); list.className = "ctrls"; list.style.flexDirection = "column"; list.style.alignItems = "center";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
    var foot = document.createElement("div"); foot.className = "ctrls";
    var task = document.createElement("p"); task.className = "read";
    task.innerHTML = '<span style="font-size:26px;font-weight:700">' + a + " ÷ " + d + " = <span class=\"kj-q\">？</span></span>";
    root.appendChild(task); root.appendChild(top); root.appendChild(list); root.appendChild(read); root.appendChild(foot);
    var rowBtns = [];
    if (cfg.pick) {
      for (var r = 1; r <= MAX; r++) (function (r) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = "想 " + r + " 的口诀";
        b.addEventListener("click", function () { st.row = r; draw(); log("row", { row: r }); });
        rowBtns.push(b); top.appendChild(b);
      })(r);
    }
    var bReset = document.createElement("button"); bReset.type = "button"; bReset.textContent = "重来";
    bReset.addEventListener("click", function () { st = { row: cfg.pick ? 0 : d, found: false }; reported = false; draw(); log("reset"); });
    foot.appendChild(bReset);
    root.addEventListener("manip:change", function (ev) {
      var det = ev.detail || {};
      if (det.found && !reported) {
        reported = true;
        emitAns(root, cfg, verse(Math.min(d, det.found), Math.max(d, det.found)), true, firstTry);
      }
    });
    function log(what, extra) { if (P) P.log("interact", Object.assign({ what: "kj-" + what, a: a, d: d }, extra || {})); }
    function say(node, text, sayText, cls) {
      node.className = "read" + (cls ? " " + cls : ""); node.textContent = text;
      if (sayText && P) node.appendChild(P.sayButton(sayText)).addEventListener("click", function (e) { P.say(sayText, e.currentTarget); });
    }
    function pickLine(i) {
      var row = st.row, p = i * row, v = verse(Math.min(i, row), Math.max(i, row));
      var ok = p === a && (row === d || i === d);
      log("line", { row: row, other: i, ok: ok });
      if (ok) {
        st.found = row === d ? i : row;
        draw();
        return;
      }
      if (st.found) return;
      emitAns(root, cfg, v, false, firstTry);
      firstTry = false;
      if (p === a) { say(read, (P && P.verdictPrefix ? P.verdictPrefix(false, "") : "") + v + "，得数是 " + a + "，可是这句里没有除数 " + d + "。除数是几，就想几的口诀。", null, "no"); return; }
      say(read, (P && P.verdictPrefix ? P.verdictPrefix(false, "") : "") + v + "，得数是 " + p + "，不是 " + a + "。" + (p < a ? "往下想一想。" : "往上想一想。"), null, "no");
    }
    function draw() {
      rowBtns.forEach(function (b, k) { b.setAttribute("aria-pressed", k + 1 === st.row ? "true" : "false"); });
      list.innerHTML = "";
      if (!st.row) {
        root.querySelector(".kj-q").textContent = "？"; // 「重来」回到选口诀时，问号也要回来
        say(read, a + " ÷ " + d + "，想几的口诀？", cn(a) + "除以" + cn(d) + "，想几的口诀？", "");
        emitC();
        return;
      }
      var hitLine = st.found && (st.row === d || st.row === st.found) ? (a / st.row) : 0;
      for (var i = 1; i <= MAX; i++) (function (i) {
        var row = st.row, lo = Math.min(i, row), hi = Math.max(i, row);
        var b = document.createElement("button"); b.type = "button";
        b.style.minWidth = "240px"; b.style.fontSize = "19px";
        b.innerHTML = "<b>" + verse(lo, hi) + "</b>　<span style=\"color:var(--muted)\">" + i + " × " + row + " = " + i * row + "</span>";
        b.setAttribute("aria-label", verse(lo, hi));
        if (hitLine === i) b.setAttribute("aria-pressed", "true");
        if (hitLine) b.disabled = hitLine !== i;
        b.addEventListener("click", function () { pickLine(i); });
        list.appendChild(b);
      })(i);
      if (st.found) {
        var fv = verse(Math.min(d, st.found), Math.max(d, st.found));
        root.querySelector(".kj-q").textContent = st.found;
        say(read, (P && P.verdictPrefix ? P.verdictPrefix(true, fv) : "") + fv + "，商是 " + st.found + "。", fv + "，商是" + cn(st.found) + "。", "ok");
      } else {
        root.querySelector(".kj-q").textContent = "？";
        say(read, ans ? "想：" + d + " 和几相乘得 " + a + "？点那一句口诀。" : "这道题用 1～" + MAX + " 的口诀求不出商。", ans ? "想：" + cn(d) + "和几相乘得" + cn(a) + "？" : null, ans ? "" : "no");
      }
      emitC();
    }
    function emitC() { U.emit(root, { a: a, d: d, row: st.row, found: st.found || 0 }); }
    draw();
  }

  window.PeiyuManip.register("fenyifen", fenyifen);
  window.PeiyuManip.register("koujue", koujue);
})();
