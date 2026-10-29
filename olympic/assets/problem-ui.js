/* 培玉 · 一试站：题目页工作台交互（PY-179）。
   只做展示层：答案预览、符号键、提示阶梯步骤条、答完反馈卡、快捷键、手机作答抽屉。
   判分、记录、复习规则仍在 app.js / learning.js；这里只读本机记录、只监听 peiyu-record 事件。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1";
  var script = document.currentScript;
  var base = script ? script.src.replace(/assets\/problem-ui\.js.*$/, "") : "../";
  var started = Date.now();

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function readRecord(id) {
    try { return ((JSON.parse(localStorage.getItem(STORE) || "{}").problems) || {})[id] || null; } catch (e) { return null; }
  }
  function reduceMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  // ---------- 答案 → TeX（只用于预览，不参与判分） ----------
  function group(s, i) {
    // 从 s[i] 起取一个原子：括号组、数字、字母、\cmd{..}
    var c = s[i];
    if (c === "(" || c === "{" || c === "[") {
      var close = { "(": ")", "{": "}", "[": "]" }[c], d = 0;
      for (var j = i; j < s.length; j++) {
        if (s[j] === c) d++;
        else if (s[j] === close && --d === 0) return { text: s.slice(i, j + 1), end: j + 1 };
      }
      return null;
    }
    var m = /^(\\[a-zA-Z]+(\{[^{}]*\})*|\d+(\.\d+)?|[a-zA-Z])/.exec(s.slice(i));
    return m ? { text: m[0], end: i + m[0].length } : null;
  }
  function strip(t) { return /^\(.*\)$/.test(t) ? t.slice(1, -1) : t; }
  function toTex(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    s = s.replace(/（/g, "(").replace(/）/g, ")").replace(/，/g, ",").replace(/[−–—]/g, "-")
      .replace(/∞/g, "\\infty ").replace(/π/g, "\\pi ")
      // 只换裸写的 inf / pi，已经是 \\pi、\\infty 的 TeX 命令不再加反斜杠
      .replace(/(^|[^\\a-zA-Z])inf(inity)?(?![a-zA-Z])/g, "$1\\infty ").replace(/(^|[^\\a-zA-Z])pi(?![a-zA-Z])/g, "$1\\pi ")
      .replace(/<=|≤/g, "\\le ").replace(/>=|≥/g, "\\ge ").replace(/∪|\bU\b/g, "\\cup ")
      .replace(/\*|×|·/g, "\\cdot ");
    // A command delimiter is unnecessary before an exponent or fraction slash.
    s = s.replace(/\\pi\s+(?=[^a-zA-Z\s])/g, "\\pi");
    // √x / sqrt(x) / sqrt3 → \sqrt{..}
    var guard = 0, k, ROOT = "\u0001";
    s = s.replace(/\\sqrt|sqrt|√/g, ROOT);
    while ((k = s.indexOf(ROOT)) >= 0 && guard++ < 30) {
      var g = group(s, k + 1);
      if (!g) { s = s.slice(0, k) + "\\sqrt{}" + s.slice(k + 1); continue; }
      s = s.slice(0, k) + "\\sqrt{" + strip(g.text) + "}" + s.slice(g.end);
    }
    // ^(x) → ^{x}
    s = s.replace(/\^\(([^()]*)\)/g, "^{$1}");
    // a/b → \frac{a}{b}（a、b 各取一个原子）
    guard = 0;
    while ((k = s.indexOf("/")) > 0 && guard++ < 30) {
      var j = k - 1, depth = 0;
      if (s[j] === ")" || s[j] === "}") {
        var open = s[j] === ")" ? "(" : "{", close = s[j];
        for (; j >= 0; j--) { if (s[j] === close) depth++; else if (s[j] === open && --depth === 0) break; }
        while (j > 0 && s[j - 1] === "}") { // \frac{a}{b} 这类多参数命令：继续往前吞参数
          depth = 0;
          for (j = j - 1; j >= 0; j--) { if (s[j] === "}") depth++; else if (s[j] === "{" && --depth === 0) break; }
        }
        while (j > 0 && /[\d.a-zA-Z\\]/.test(s[j - 1])) j--; // 带上 \sqrt 这类命令名和前面的系数，避免 2√2/3 看成带分数
      } else {
        while (j > 0 && /[\d.a-zA-Z\\]/.test(s[j - 1])) j--;
      }
      // x^2/4、e^x/2：分子带着底数和 ^，不能只取指数
      while (j > 0 && s[j - 1] === "^") {
        j--;
        if (j > 0 && (s[j - 1] === ")" || s[j - 1] === "]")) {
          var ob = s[j - 1] === ")" ? "(" : "[", cb = s[j - 1], dd = 0;
          for (j = j - 1; j >= 0; j--) { if (s[j] === cb) dd++; else if (s[j] === ob && --dd === 0) break; }
          j = Math.max(j, 0);
        } else {
          while (j > 0 && /[\d.a-zA-Z\\]/.test(s[j - 1])) j--;
        }
      }
      var num = s.slice(Math.max(j, 0), k), den = group(s, k + 1);
      while (den && s[den.end] === "^") { // 1/x^2：分母也带着指数
        var ex = group(s, den.end + 1);
        if (!ex) break;
        den = { text: den.text + "^" + ex.text, end: ex.end };
      }
      if (!num || !den) { s = s.slice(0, k) + "\u0002" + s.slice(k + 1); continue; }
      s = s.slice(0, Math.max(j, 0)) + "\\frac{" + strip(num) + "}{" + strip(den.text) + "}" + s.slice(den.end);
    }
    return s.replace(/\u0002/g, "/");
  }

  var katexLoading = null;
  function withKatex(fn) {
    if (window.katex) return fn(window.katex);
    if (!katexLoading) {
      katexLoading = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = base + "assets/katex/katex.min.js";
        s.onload = function () { resolve(window.katex); };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    katexLoading.then(fn, function () { /* 离线包缺 KaTeX 时只显示原文 */ });
  }

  // ---------- S1 作答区：预览 + 符号键 + 弱化「直接看答案」 ----------
  function initAnswer(P, box) {
    var input = box.querySelector("input.ans");
    if (input) {
      var preview = el("p", "ans-preview");
      preview.setAttribute("aria-live", "polite");
      preview.hidden = true;
      var label = el("span", "ans-preview-label", "系统理解为");
      var out = el("span", "ans-preview-math");
      preview.append(label, out);
      var keys = el("div", "sym-keys");
      keys.setAttribute("aria-label", "插入符号");
      [["√", "√("], ["π", "π"], ["a/b", "/"], ["xⁿ", "^"], ["∞", "∞"], ["≤", "≤"], ["≥", "≥"], ["∪", "∪"], ["[", "["], ["(", "("], [")", ")"], [",", ","]].forEach(function (k) {
        var b = el("button", "sym", k[0]);
        b.type = "button";
        b.setAttribute("aria-label", "插入 " + k[0]);
        b.addEventListener("mousedown", function (e) { e.preventDefault(); }); // 不让输入框失焦
        b.addEventListener("click", function () {
          var a = input.selectionStart == null ? input.value.length : input.selectionStart;
          var z = input.selectionEnd == null ? a : input.selectionEnd;
          input.value = input.value.slice(0, a) + k[1] + input.value.slice(z);
          var pos = a + k[1].length;
          input.focus();
          try { input.setSelectionRange(pos, pos); } catch (e) { /* 部分输入法不支持 */ }
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        keys.appendChild(b);
      });
      var row = input.closest(".row");
      row.after(preview);
      preview.after(keys);
      var render = function () {
        var tex = toTex(input.value);
        preview.hidden = !tex;
        if (!tex) return;
        out.textContent = input.value;
        withKatex(function (katex) {
          try { katex.render(tex, out, { throwOnError: false, displayMode: false }); } catch (e) { out.textContent = input.value; }
        });
      };
      input.addEventListener("input", render);
    }
    var reveal = box.querySelector("[data-reveal-answer]");
    if (reveal) {
      reveal.classList.remove("btn", "ghost");
      reveal.classList.add("text-btn");
      var nudge = el("span", "reveal-nudge", "先试一会儿？");
      reveal.before(nudge);
      setTimeout(function () { nudge.hidden = true; }, Math.max(0, 30000 - (Date.now() - started)));
      if (readRecord(P.id) && readRecord(P.id).first) nudge.hidden = true;
      // app.js 显示答案后会藏起这个按钮，提示语跟着藏
      new MutationObserver(function () { if (reveal.hidden) nudge.hidden = true; }).observe(reveal, { attributes: true, attributeFilter: ["hidden"] });
      document.addEventListener("peiyu-record", function (e) { if (e.detail.id === P.id && e.detail.kind === "attempt") nudge.hidden = true; });
    }
  }

  // ---------- S2 提示阶梯步骤条 ----------
  function initLadder(P) {
    var ladder = document.querySelector(".ladder");
    if (!ladder) return null;
    var layers = Array.prototype.slice.call(ladder.querySelectorAll(".layer"));
    var nextBtn = ladder.querySelector("[data-next-layer]");
    if (!layers.length || !nextBtn) return null;
    var bar = el("ol", "hint-steps");
    bar.setAttribute("aria-label", "解析分几级打开");
    var items = layers.map(function (ly, i) {
      var h = ly.querySelector("h3");
      var li = el("li", "hint-step");
      var b = el("button", null, (i + 1) + " " + (h ? h.textContent : ""));
      b.type = "button";
      b.title = b.textContent;
      b.addEventListener("click", function () {
        if (!ly.hidden) { ly.scrollIntoView({ block: "nearest", behavior: reduceMotion() ? "auto" : "smooth" }); return; }
        if (opened() === i) nextBtn.click();
      });
      li.appendChild(b);
      bar.appendChild(li);
      return { li: li, b: b, ly: ly };
    });
    var note = el("p", "hint-cost hint-text");
    function opened() { return layers.filter(function (ly) { return !ly.hidden; }).length; }
    function sync() {
      var n = opened();
      items.forEach(function (it, i) {
        it.li.classList.toggle("open", !it.ly.hidden);
        it.li.classList.toggle("next", i === n);
        it.b.disabled = it.ly.hidden && i !== n;
        it.b.setAttribute("aria-current", i === n ? "step" : "false");
      });
      var r = readRecord(P.id);
      if (r && r.first) note.textContent = n ? "已打开 " + n + " / " + layers.length + " 级。" : "";
      else note.textContent = n ? "已打开 " + n + " 级。现在作答，这题会记为「看过提示后做对」。" : "一次打开一级。还没作答前每打开一级，这题都会记为「看过提示」。";
    }
    var h2 = ladder.querySelector("h2");
    (h2 || ladder.firstChild).after(bar);
    bar.after(note);
    var mo = new MutationObserver(sync);
    layers.forEach(function (ly) { mo.observe(ly, { attributes: true, attributeFilter: ["hidden"] }); });
    document.addEventListener("peiyu-record", function (e) { if (e.detail.id === P.id) sync(); });
    sync();
    return { opened: opened, total: layers.length, next: function () { nextBtn.click(); },
      all: function () { var a = ladder.querySelector("[data-all-layers]"); if (a && !a.hidden) a.click(); } };
  }

  // ---------- S3 答完反馈卡 ----------
  function fmtDuration(ms) {
    var s = Math.max(1, Math.round(ms / 1000)), m = Math.floor(s / 60);
    return m ? m + " 分 " + (s % 60) + " 秒" : s + " 秒";
  }
  function fmtDue(iso) {
    var t = Date.parse(iso);
    if (!isFinite(t)) return "";
    var days = Math.round((t - Date.now()) / 86400000);
    return days <= 0 ? "今天" : days === 1 ? "明天" : days + " 天后";
  }
  function initResult(P, box, ladder) {
    var card = el("section", "result-card");
    card.hidden = true;
    card.setAttribute("aria-live", "polite");
    box.after(card);
    var words = { ok: "答对了", part: "做对了一部分", no: "这次没做出来" };
    var hintsAtAttempt = null; // 只数作答前打开的级数；解答题提交后会自动展开全部解析
    function show(result) {
      var r = readRecord(P.id) || {};
      var final = result || r.status;
      if (!final) return; // 填空对不上时等自评再出卡
      card.className = "result-card " + final;
      card.innerHTML = "";
      var head = el("p", "result-head");
      head.appendChild(el("strong", null, (final === "ok" ? "✓ " : "") + (words[final] || "已记录")));
      var bits = ["用时 " + fmtDuration(Date.now() - started)];
      var seen = hintsAtAttempt == null ? 0 : hintsAtAttempt; // 没收到本页的 attempt（如刷新后继续自评）就不报，免得把自动展开的解析算进去
      if (seen) bits.push("作答前看过 " + seen + " 级解析");
      if (r.reviewDueAt) bits.push("下次复习：" + fmtDue(r.reviewDueAt));
      head.appendChild(el("span", "result-meta", bits.join(" · ")));
      card.appendChild(head);
      var acts = el("div", "result-actions");
      var next = document.querySelector(".pager a[href$='.html']:last-child");
      var blind = document.documentElement.classList.contains("practice-blind");
      if (next && /下一题/.test(next.textContent) && !blind) {
        var a = el("a", "btn", "下一题 →"); a.href = next.getAttribute("href"); acts.appendChild(a);
      }
      if (ladder && ladder.opened() < ladder.total) {
        var s = el("button", "btn ghost", "看完整解析"); s.type = "button";
        s.addEventListener("click", function () { ladder.all(); var l = document.querySelector(".ladder"); if (l) l.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" }); });
        acts.appendChild(s);
      }
      var topic = document.querySelector(".pager a[href*='/t/']");
      if (topic && !blind) { var t = el("a", "pill", "回到专题"); t.href = topic.getAttribute("href"); acts.appendChild(t); }
      if (acts.children.length) card.appendChild(acts);
      card.hidden = false;
      // 结果卡已经说了「答对了」，作答区里那行同样的字不再重复
      var fb = box.querySelector(".verdict.fb.ok");
      if (fb && !fb.querySelector("button, input")) fb.hidden = true;
      if (!reduceMotion()) { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
    }
    document.addEventListener("peiyu-record", function (e) {
      if (e.detail.id !== P.id) return;
      if (e.detail.kind === "attempt" && hintsAtAttempt == null) hintsAtAttempt = ladder ? ladder.opened() : 0;
      // 选择题答错还能再选，不出结果卡；只有答对或自评后才算这一轮结束。
      if (e.detail.kind === "attempt" && e.detail.result === "ok") setTimeout(function () { show(e.detail.result); }, 0);
      if (e.detail.kind === "self") setTimeout(function () { show(e.detail.result); }, 0);
      if (e.detail.kind === "attempt" && e.detail.result === "no" && !reduceMotion()) {
        box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      }
    });
  }

  // ---------- S3 快捷键 ----------
  var KEYS_OFF = "peiyu.olympic.keys-off";
  function keysOff() { try { return localStorage.getItem(KEYS_OFF) === "1"; } catch (e) { return false; } }
  function initKeys(ladder) {
    var help = el("div", "kbd-help");
    help.hidden = true;
    help.setAttribute("role", "dialog");
    help.setAttribute("aria-label", "快捷键");
    help.tabIndex = -1;
    help.innerHTML = "<p><strong>快捷键</strong></p><ul>" +
      "<li><kbd>J</kbd> 下一题　<kbd>K</kbd> 上一题</li><li><kbd>H</kbd> 打开下一级解析</li>" +
      "<li><kbd>/</kbd> 跳到作答框　<kbd>Enter</kbd> 提交</li><li><kbd>F</kbd> 专注模式</li><li><kbd>?</kbd> 显示或关闭本说明</li></ul>" +
      '<label class="kbd-off"><input type="checkbox"> 关闭单键快捷键（只存在这台设备）</label>';
    document.body.appendChild(help);
    var off = help.querySelector("input");
    off.checked = keysOff();
    off.addEventListener("change", function () {
      try { if (off.checked) localStorage.setItem(KEYS_OFF, "1"); else localStorage.removeItem(KEYS_OFF); } catch (e) { /* 存不了就只在本页生效 */ }
      keysDisabled = off.checked;
    });
    var keysDisabled = off.checked;
    var tip = el("button", "kbd-tip", "快捷键 ?");
    tip.type = "button";
    function toggleHelp(show) {
      help.hidden = show == null ? !help.hidden : !show;
      if (!help.hidden) help.focus(); else tip.focus();
    }
    tip.addEventListener("click", function () { toggleHelp(); });
    var pager = document.querySelector(".pager");
    if (pager) pager.after(tip);
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        if (e.key === "Escape" && !help.contains(t)) t.blur();
        else if (e.key === "Escape") toggleHelp(false);
        return;
      }
      var k = e.key;
      if (k === "Escape") { if (!help.hidden) toggleHelp(false); document.documentElement.classList.remove("focus-mode"); return; }
      if (keysDisabled) return;
      var blind = document.documentElement.classList.contains("practice-blind");
      var go = function (re) {
        if (blind) return;
        var a = Array.prototype.find.call(document.querySelectorAll(".pager a"), function (x) { return re.test(x.textContent); });
        if (a) location.href = a.href;
      };
      if (k === "j" || k === "J") go(/下一题/);
      else if (k === "k" || k === "K") go(/上一题/);
      else if ((k === "h" || k === "H") && ladder) ladder.next();
      else if (k === "f" || k === "F") document.documentElement.classList.toggle("focus-mode");
      else if (k === "?") toggleHelp();
      else if (k === "/") { var i = document.querySelector(".answer input.ans"); if (i) { e.preventDefault(); i.focus(); } }
    });
  }

  // ---------- S6 手机作答抽屉 ----------
  function initDrawer(box) {
    if (!window.matchMedia) return;
    var mq = window.matchMedia("(max-width: 640px)");
    var handle = el("button", "drawer-handle");
    handle.type = "button";
    handle.innerHTML = '<span class="grab" aria-hidden="true"></span><span class="drawer-label">收起作答</span>';
    box.prepend(handle);
    function setOpen(open) {
      box.classList.toggle("collapsed", !open);
      handle.setAttribute("aria-expanded", String(open));
      handle.querySelector(".drawer-label").textContent = open ? "收起作答" : "展开作答";
    }
    handle.addEventListener("click", function () { setOpen(box.classList.contains("collapsed")); });
    function apply() {
      box.classList.toggle("drawer", mq.matches);
      handle.hidden = !mq.matches;
      if (!mq.matches) box.classList.remove("collapsed");
      else setOpen(true);
    }
    if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply);
    apply();
    document.addEventListener("peiyu-record", function (e) { if (mq.matches && (e.detail.kind === "attempt" || e.detail.kind === "self")) setOpen(true); });
  }

  function init() {
    var dataEl = document.getElementById("pdata");
    var box = document.querySelector(".answer");
    if (!dataEl || !box) return;
    var P = JSON.parse(dataEl.textContent);
    document.documentElement.classList.add("workbench");
    initAnswer(P, box);
    var ladder = initLadder(P);
    initResult(P, box, ladder);
    initKeys(ladder);
    if (P.type !== "proof") initDrawer(box);
  }
  window.PeiyuProblemUI = { toTex: toTex };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
}());
