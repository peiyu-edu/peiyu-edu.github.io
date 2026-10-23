/* 培玉 · 高中数学互动站 — 页面公共脚本：步骤切换、先猜、真题练习、做题记录、KaTeX。
   每节页面只需：<body data-sec="b1-1-3">，步骤写成 <section class="step" data-title="…">，
   先猜写成 <div class="predict" data-answer="B" data-id="p1">…</div>（见 lessons/_template.html），
   真题区写 <div id="practice"></div>，题目从 ../data/sections/<sec>.json 读。 */
(function () {
  "use strict";

  /* ---------- 记录 ---------- */
  var LOG_KEY = "peiyu.hs.log", NAME_KEY = "peiyu.hs.name";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function readLog() { try { return JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { return []; } }
  var sec = document.body.getAttribute("data-sec") || "";
  function log(kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    // 以后接服务器：页面里设 window.PEIYU_LOG_URL 即可，失败不影响做题
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- KaTeX ---------- */
  var MACROS = {
    "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}", "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}", "\\Z": "\\mathbf{Z}",
    "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}", "\\bs": "\\boldsymbol{#1}", "\\symbfup": "\\mathbf{#1}", "\\symbfit": "\\boldsymbol{#1}"
  };
  function math(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
        ],
        macros: MACROS, throwOnError: false, strict: "ignore"
      });
    }
  }

  /* ---------- 步骤 ---------- */
  function setupSteps() {
    var steps = [].slice.call(document.querySelectorAll(".step"));
    if (!steps.length) return;
    var bar = document.createElement("nav"); bar.className = "steps"; bar.setAttribute("role", "tablist");
    steps.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.textContent = (i + 1) + " " + (s.getAttribute("data-title") || "");
      b.onclick = function () { show(i); };
      bar.appendChild(b);
      if (i < steps.length - 1) {
        var nx = document.createElement("div"); nx.className = "next";
        var nb = document.createElement("button"); nb.type = "button"; nb.className = "btn";
        nb.textContent = "下一步：" + (steps[i + 1].getAttribute("data-title") || "");
        nb.onclick = function () { show(i + 1); window.scrollTo({ top: bar.offsetTop - 8, behavior: "smooth" }); };
        nx.appendChild(nb); s.appendChild(nx);
      }
    });
    steps[0].parentNode.insertBefore(bar, steps[0]);
    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
      [].forEach.call(bar.children, function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      log("step", { step: i + 1 });
      document.dispatchEvent(new CustomEvent("step", { detail: i + 1 }));
    }
    var h = parseInt((location.hash.match(/step(\d+)/) || [])[1] || "1", 10);
    show(Math.min(Math.max(h, 1), steps.length) - 1);
  }

  /* ---------- 先猜（不判分，只记录，然后揭晓） ---------- */
  function setupPredict() {
    [].forEach.call(document.querySelectorAll(".predict"), function (box) {
      var ans = box.getAttribute("data-answer"), id = box.getAttribute("data-id") || "";
      var reveal = box.querySelector(".reveal"); if (reveal) reveal.hidden = true;
      var opts = [].slice.call(box.querySelectorAll(".opt"));
      opts.forEach(function (o) {
        o.type = "button";
        o.onclick = function () {
          if (box.classList.contains("done")) return;
          box.classList.add("done");
          var v = o.getAttribute("data-v");
          opts.forEach(function (p) {
            var pv = p.getAttribute("data-v");
            if (pv === ans) p.classList.add("right");
            else if (p === o) p.classList.add("wrong");
            p.setAttribute("aria-disabled", "true");
          });
          if (reveal) reveal.hidden = false;
          log("predict", { id: id, choice: v, correct: v === ans });
        };
      });
    });
  }

  /* ---------- 真题练习 ---------- */
  var LETTERS = "ABCDE";
  function norm(s) {
    return String(s || "").replace(/\\[()\[\]]/g, "").replace(/\\(dfrac|tfrac)/g, "\\frac")
      .replace(/\\left|\\right|\\,|\\;|\\!|\s|\$|\{|\}/g, "").replace(/\\/g, "")
      .replace(/，/g, ",").replace(/．|。/g, "").toLowerCase();
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function renderProblem(p, idx) {
    var card = el("div", "card prob");
    card.appendChild(el("div", "small", '<span class="tag">' + esc(p.year + " " + p.paper + " 第" + p.no + "题") + "</span>" +
      (p.level ? '<span class="tag">' + esc(p.level) + "</span>" : "") + (p.note ? esc(p.note) : "")));
    card.appendChild(el("div", "stem", "<b>" + (idx + 1) + ".</b> " + esc(p.stem)));
    var fb = el("div", "fb"), sol = el("div", "sol");
    sol.hidden = true;
    sol.innerHTML = (p.answer ? "<p><b>答案：</b>" + esc(p.answer) + "</p>" : "") +
      (p.solution ? '<p class="stem"><b>解析：</b>' + esc(p.solution) + "</p>" : "");
    var done = false;
    function finish(correct, choice) {
      if (done) return; done = true;
      fb.className = "fb " + (correct ? "ok" : "no");
      fb.textContent = correct ? "对了。" : "不对，看看解析。";
      sol.hidden = false; math(sol);
      log("answer", { id: p.id, choice: choice, correct: correct });
    }
    var multi = /多选/.test(p.type);
    if (p.choices && p.choices.length) {
      var box = el("div", "opts" + (p.choices.every(function (c) { return c.length < 40; }) ? " cols" : ""));
      var picked = {};
      p.choices.forEach(function (c, i) {
        var o = el("button", "opt", "<b>" + LETTERS[i] + "</b>" + esc(c)); o.type = "button";
        o.onclick = function () {
          if (done) return;
          if (multi) { picked[LETTERS[i]] = !picked[LETTERS[i]]; o.classList.toggle("sel"); return; }
          var right = norm(p.answer).toUpperCase() === LETTERS[i];
          o.classList.add(right ? "right" : "wrong");
          if (!right) markRight(box, p.answer);
          finish(right, LETTERS[i]);
        };
        box.appendChild(o);
      });
      card.appendChild(box);
      if (multi) {
        var sub = el("button", "btn", "提交"); sub.type = "button";
        sub.onclick = function () {
          var mine = Object.keys(picked).filter(function (k) { return picked[k]; }).sort().join("");
          var want = norm(p.answer).toUpperCase().replace(/[^A-E]/g, "").split("").sort().join("");
          markRight(box, want);
          finish(mine === want, mine); sub.disabled = true;
        };
        card.appendChild(sub);
      }
    } else if (/填空/.test(p.type) && p.answer) {
      var row = el("div", "ctrl");
      var inp = el("input"); inp.type = "text"; inp.placeholder = "填答案，如 3 或 \\frac{1}{2}"; inp.setAttribute("aria-label", "答案");
      var chk = el("button", "btn", "对答案"); chk.type = "button";
      row.appendChild(inp); row.appendChild(chk); card.appendChild(row);
      chk.onclick = function () {
        if (done) return;
        if (norm(inp.value) && norm(inp.value) === norm(p.answer)) { finish(true, inp.value); return; }
        // 写法不同也可能是对的：给出答案，让学生自己判
        sol.hidden = false; math(sol);
        selfReport(card, function (ok) { finish(ok, inp.value + (ok ? "（自判对）" : "")); });
        chk.disabled = true;
      };
    } else {
      var see = el("button", "btn ghost", "做完了，看解析"); see.type = "button";
      card.appendChild(see);
      see.onclick = function () {
        sol.hidden = false; math(sol); see.disabled = true;
        selfReport(card, function (ok) { finish(ok, ok ? "自判对" : "自判错"); });
      };
    }
    card.appendChild(fb); card.appendChild(sol);
    return card;
  }
  function markRight(box, ans) {
    [].forEach.call(box.children, function (o, i) { if (String(ans).toUpperCase().indexOf(LETTERS[i]) >= 0) o.classList.add("right"); });
  }
  function selfReport(card, cb) {
    var r = el("div", "selfrep", '<span class="small">和答案对一下：</span>');
    [["我做对了", true], ["我做错了 / 没做出", false]].forEach(function (x) {
      var b = el("button", "btn ghost", x[0]); b.type = "button";
      b.onclick = function () { cb(x[1]); r.remove(); };
      r.appendChild(b);
    });
    card.appendChild(r);
  }

  function setupPractice() {
    var host = document.getElementById("practice");
    if (!host || !sec) return;
    host.innerHTML = '<p class="small">题目加载中…</p>';
    fetch("../data/sections/" + sec + ".json").then(function (r) { return r.json(); }).then(function (probs) {
      host.innerHTML = "";
      if (!probs.length) { host.innerHTML = '<p class="small">这一节的真题还在整理。</p>'; return; }
      // <div id="practice" data-fold-later>：note 写了「要用到 <节号>」、且那一节在本节之后的题，收进最后一个折叠块。
      // 只比「章.节」：b1-2-3 是 2.3，note 里的 4.2 在后面要折叠，1.4 在前面不折叠。
      var fold = host.hasAttribute("data-fold-later");
      var me = (sec.match(/-(\d+)-(\d+)$/) || []).slice(1).map(Number);
      function isLater(note) {
        var m = /要用到([^；;。]*)/.exec(note || "");
        if (!m || me.length < 2) return false;
        var refs = m[1].match(/\d+\.\d+/g) || [];
        return refs.some(function (r) {
          var x = r.split(".").map(Number);
          return x[0] > me[0] || (x[0] === me[0] && x[1] > me[1]);
        });
      }
      var later = fold ? probs.filter(function (p) { return isLater(p.note); }) : [];
      var now = probs.filter(function (p) { return later.indexOf(p) < 0; });
      now.forEach(function (p, i) { host.appendChild(renderProblem(p, i)); });
      if (later.length) {
        var box = el("details", "more");
        box.appendChild(el("summary", "", "要用到后面章节的题（" + later.length + " 道）：学到那里再回来做"));
        later.forEach(function (p, i) { box.appendChild(renderProblem(p, now.length + i)); });
        host.appendChild(box);
      }
      math(host);
    }).catch(function () { host.innerHTML = '<p class="small">题目没加载出来，刷新一下试试。</p>'; });
  }

  /* ---------- 图上文字不随 SVG 缩得太小 ----------
     SVG 在手机上整体缩小，文字也跟着缩。这里按缩放比把 <text> 放大到屏幕上至少 MIN_PX，
     页面重画（新插入的 text）也会处理。页面不用做什么。 */
  var MIN_PX = 12, fitQueued = false;
  function fitFigText() {
    fitQueued = false;
    [].forEach.call(document.querySelectorAll(".step svg[viewBox]"), function (svg) {
      var vb = svg.viewBox.baseVal, w = svg.getBoundingClientRect().width;
      if (!vb || !vb.width || !w) return;
      var k = w / vb.width;
      [].forEach.call(svg.querySelectorAll("text"), function (t) {
        var fs0 = parseFloat(t.getAttribute("data-fs0"));
        if (!fs0) {
          fs0 = parseFloat(getComputedStyle(t).fontSize) || 15;
          t.setAttribute("data-fs0", fs0);
        }
        var want = Math.max(fs0, MIN_PX / k);
        t.style.fontSize = want > fs0 + 0.01 ? want.toFixed(1) + "px" : "";
      });
    });
  }
  // 太宽的段落（多半是长行内公式）只在自己里面横向滚动，不撑宽整页。只处理真的超宽的那几块。
  function fitWide() {
    // 两列选项里有放不下的长公式：这道题改成一列
    [].forEach.call(document.querySelectorAll(".step.on .opts.cols"), function (box) {
      var tight = [].some.call(box.children, function (o) { return o.scrollWidth > o.clientWidth + 1; });
      if (tight) box.classList.remove("cols");
    });
    [].forEach.call(document.querySelectorAll(".step.on p, .step.on li, .step.on .key, .step.on .warn, .step.on td, .step.on .opt"), function (el) {
      if (el.closest("svg")) return;
      if (el.scrollWidth > el.clientWidth + 1) el.classList.add("wide-x");
    });
  }
  function queueFit() {
    if (!fitQueued) { fitQueued = true; requestAnimationFrame(function () { fitFigText(); fitWide(); }); }
  }
  function setupFigText() {
    window.addEventListener("resize", queueFit);
    document.addEventListener("click", queueFit);  // 切步骤后图才有宽度
    if (window.MutationObserver) {
      [].forEach.call(document.querySelectorAll(".step svg[viewBox]"), function (svg) {
        new MutationObserver(function (ms) {
          if (ms.some(function (m) { return m.addedNodes.length; })) queueFit();
        }).observe(svg, { childList: true, subtree: true });
      });
    }
    queueFit();
  }

  /* ---------- 公共接口给页面里的互动图用 ---------- */
  window.Peiyu = { log: log, math: math, readLog: readLog, store: store, LOG_KEY: LOG_KEY, NAME_KEY: NAME_KEY };

  document.addEventListener("DOMContentLoaded", function () {
    setupSteps(); setupPredict(); setupPractice(); setupFigText();
    math(document.body);
    log("open", {});
    var ws = document.createElement("script");
    ws.src = "../assets/wiki.js";
    document.head.appendChild(ws);
  });
})();
