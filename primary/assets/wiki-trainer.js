/* 培玉 · 高中数学 — 「看到题目怎么想」先想再揭晓训练器（wiki.html 第 3 个标签页）
   数据来自 assets/wiki-cues.js（window.PEIYU_CUES）。
   两种模式：
   - 先想再揭晓（默认）：只给题干信号，学生在心里说出第一步，再点「揭晓」，再自评「想对了 / 没想到」。
     结果写进 localStorage peiyu.hs.log（{kind:"cue", sec, id, ch, card, correct}），格式与 lesson.js 相同，
     「我的记录」页能导出，薄弱卡诊断与图谱掌握度会把它算进去。上次「没想到」的条目下一轮优先出。
   - 查表模式：原决策树平铺（题干 → 做法 + 查看卡片），做题卡壳时直接查。
   范围：跨章混合（每轮 12 条）或某一章（该章全部）。 */
(function () {
  "use strict";

  var CUES = window.PEIYU_CUES || [];
  var CH_NAMES = window.PEIYU_CUE_CHAPTERS || {};
  var SEC_META = window.PEIYU_SEC_META || {};
  var CARDS = window.PEIYU_WIKI_CARDS || [];
  var BY_ID = {};
  CARDS.forEach(function (c) { BY_ID[c.id] = c; });

  var MIXED_ROUND = 12;
  var LOG_KEY = "peiyu.hs.log", NAME_KEY = "peiyu.hs.name", UI_KEY = "peiyu.hs.cue.ui";

  /* ---------- 存储（与 lesson.js 同格式） ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function readLog() { try { return JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { return []; } }
  function log(sec, kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }
  function readUI() { try { return JSON.parse(store(UI_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function saveUI() { store(UI_KEY, JSON.stringify({ mode: mode, ch: curCh })); }

  /* 每条信号最近一次自评：{ id: true|false } */
  function latestResults() {
    var out = {};
    readLog().forEach(function (ev) {
      if (ev.kind === "cue" && ev.id && typeof ev.correct === "boolean") out[ev.id] = ev.correct;
    });
    return out;
  }

  /* ---------- KaTeX ---------- */
  var MACROS = {
    "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}", "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}",
    "\\Z": "\\mathbf{Z}", "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}"
  };
  function math(el) {
    var tries = 0;
    (function run() {
      if (window.renderMathInElement) {
        window.renderMathInElement(el, {
          delimiters: [
            { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
          ],
          macros: MACROS, throwOnError: false, strict: "ignore"
        });
      } else if (tries++ < 30) {
        setTimeout(run, 100);
      }
    })();
  }

  /* ---------- 样式 ---------- */
  function injectStyle() {
    if (document.getElementById("peiyu-cue-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-cue-css";
    st.textContent = [
      ".ct-top{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:6px 0 4px}",
      ".ct-mode{display:inline-flex;border:1px solid var(--line);border-radius:999px;background:var(--card);padding:3px;gap:2px}",
      ".ct-mode button{border:0;background:transparent;color:var(--muted);font:inherit;font-size:14px;font-weight:600;padding:6px 14px;min-height:36px;border-radius:999px;cursor:pointer}",
      ".ct-mode button.on{background:var(--a);color:#fff}",
      ".ct-mode button:focus-visible{outline:3px solid var(--hl)}",
      ".ct-prog{font-size:14px;color:var(--muted);display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin:6px 0 10px}",
      ".ct-prog b{color:var(--fg)}",
      ".ct-due{color:var(--no);font-weight:600}",
      ".ct-card{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px 18px 14px;margin:8px 0 14px;box-shadow:0 2px 10px rgba(26,40,34,.05)}",
      ".ct-tag{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);border:1px dashed var(--line);border-radius:6px;padding:2px 8px;margin-bottom:10px}",
      ".ct-cue{font-size:17.5px;line-height:1.8;margin:0 0 8px}",
      ".ct-ask{font-size:14.5px;color:var(--muted);margin:0 0 14px}",
      ".ct-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0}",
      ".ct-row .btn{min-height:40px}",
      ".ct-kbd{font-size:14px;color:var(--muted);margin-left:auto}",
      "@media (hover:none){.ct-kbd{display:none}}",
      ".ct-act{margin:12px 0 10px;font-size:15.5px;line-height:1.8}",
      ".ct-src{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px;margin:6px 0 4px}",
      ".ct-src a{color:var(--c);text-decoration:none;font-weight:600}",
      ".ct-src a:hover{text-decoration:underline}",
      ".ct-grade{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px dashed var(--line);margin-top:12px;padding-top:12px;font-size:15px}",
      ".ct-grade .btn.yes{background:var(--a);border-color:var(--a);color:#fff}",
      ".ct-grade .btn.no{background:transparent;border:1.5px solid var(--no);color:var(--no)}",
      ".ct-fb{font-size:14.5px;margin:0}",
      ".ct-fb.ok{color:var(--a)}",
      ".ct-fb.miss{color:var(--no)}",
      ".ct-sum{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px;margin:8px 0 14px}",
      ".ct-sum h3{margin:0 0 8px;font-size:18px}",
      ".ct-sum ul{margin:8px 0 12px;padding-left:20px;font-size:15px;line-height:1.8}",
      ".ct-sum ul button{margin-left:6px}",
      ".ct-empty{font-size:15px;color:var(--muted);padding:12px 0}",
      ".tree-row .ct-src-sec{font-size:14px;color:var(--muted);margin-left:6px}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ---------- 状态 ---------- */
  var mount = document.getElementById("cueTrainer");
  if (!mount || !CUES.length) return;
  injectStyle();

  var ui = readUI();
  var mode = ui.mode === "list" ? "list" : "train";
  var curCh = (ui.ch && (ui.ch === "all" || CH_NAMES[ui.ch])) ? String(ui.ch) : "all";
  var curSec = null;   // 按小节出题（图谱「测一测本节题干信号」或 #tab=tree&sec=<id>）；不持久化
  var queue = [], idx = 0, revealed = false, graded = false, roundRight = 0, roundWrong = 0, missed = [], dueInRound = 0;
  var chapters = Object.keys(CH_NAMES).map(Number).sort(function (a, b) { return a - b; });

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pool() {
    if (curSec) return CUES.filter(function (c) { return c.sec === curSec; });
    return curCh === "all" ? CUES.slice() : CUES.filter(function (c) { return String(c.ch) === curCh; });
  }

  /* 组卷：上次没想到的 → 没练过的 → 想对过的，每组内打乱 */
  function buildQueue(onlyIds) {
    var last = latestResults();
    var src = pool();
    if (onlyIds) src = src.filter(function (c) { return onlyIds.indexOf(c.id) >= 0; });
    var wrong = [], fresh = [], right = [];
    src.forEach(function (c) {
      if (last[c.id] === false) wrong.push(c);
      else if (last[c.id] === true) right.push(c);
      else fresh.push(c);
    });
    var q = shuffle(wrong).concat(shuffle(fresh), shuffle(right));
    if (curCh === "all" && !curSec && !onlyIds) q = q.slice(0, MIXED_ROUND);
    queue = q; idx = 0; revealed = false; graded = false; roundRight = 0; roundWrong = 0; missed = [];
    dueInRound = queue.filter(function (c) { return last[c.id] === false; }).length;
  }

  /* ---------- 渲染 ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function mathHtml(s) {
    var html = String(s);
    // Protect TeX before the browser parses comparison signs as HTML tags.
    return window.PEIYU_WIKI_HTML ? window.PEIYU_WIKI_HTML(html) : esc(html);
  }
  function secName(sid) { return SEC_META[sid] ? SEC_META[sid].name : sid; }
  function chLabel(ch) { return (CH_NAMES[ch] || ("第 " + ch + " 章")).replace(/（.*$/, ""); }

  function renderTop() {
    var pills = [];
    if (curSec) {
      pills.push('<button type="button" class="w-pill on" data-ct-sec-clear aria-label="退出本节模式">📍 本节：' + esc(secName(curSec)) + "（" + pool().length + " 条）✕</button>");
    }
    pills.push('<button type="button" class="w-pill' + (!curSec && curCh === "all" ? " on" : "") + '" data-ct-ch="all">跨章混合</button>');
    chapters.forEach(function (ch) {
      pills.push('<button type="button" class="w-pill' + (!curSec && curCh === String(ch) ? " on" : "") + '" data-ct-ch="' + ch + '">' + esc(chLabel(ch)) + "</button>");
    });
    return (
      '<div class="ct-top">' +
        '<div class="ct-mode" role="group" aria-label="模式">' +
          '<button type="button" data-ct-mode="train"' + (mode === "train" ? ' class="on"' : "") + '>🧠 先想再揭晓</button>' +
          '<button type="button" data-ct-mode="list"' + (mode === "list" ? ' class="on"' : "") + '>📋 查表模式</button>' +
        "</div>" +
      "</div>" +
      '<div class="w-bar" role="group" aria-label="选择范围">' + pills.join("") + "</div>"
    );
  }

  function renderTrainer() {
    var total = queue.length;
    if (!total) return '<p class="ct-empty">' + (curSec ? "这一节还没有题干信号，先练本章的吧。" : "这一章还没有题干信号。") + "</p>";
    if (idx >= total) return renderSummary();
    var c = queue[idx];
    var html =
      '<div class="ct-prog">' +
        "<span>第 <b>" + (idx + 1) + "</b> / " + total + " 条</span>" +
        "<span>想对 <b>" + roundRight + "</b> · 没想到 <b>" + roundWrong + "</b></span>" +
        (dueInRound ? '<span class="ct-due">本轮含上次没想到的 ' + dueInRound + " 条，已排在前面</span>" : "") +
      "</div>" +
      '<div class="ct-card" id="ctCard">' +
        '<span class="ct-tag">🎯 题干信号' + (curCh !== "all" ? " · " + esc(chLabel(c.ch)) : "") + "</span>" +
        '<p class="ct-cue">' + mathHtml(c.cue) + "</p>";
    if (!revealed) {
      html +=
        '<p class="ct-ask">先别往下看。在心里说出：<b>第一步做什么、用哪条工具</b>。想好了再揭晓。</p>' +
        '<div class="ct-row">' +
          '<button type="button" class="btn" data-ct="reveal">我想好了，揭晓</button>' +
          '<button type="button" class="btn ghost" data-ct="skip">跳过这条</button>' +
          '<span class="ct-kbd">回车 = 揭晓</span>' +
        "</div>";
    } else {
      var card = BY_ID[c.card];
      html +=
        '<div class="key ct-act"><b>该怎么想：</b>' + mathHtml(c.act) + "</div>" +
        '<div class="ct-src">' +
          "<span>出自 " + esc(secName(c.sec)) + "</span>" +
          (card ? '<button type="button" class="w-rel" data-goto="' + c.card + '">🔗 ' + esc(c.label) + "</button>" : "") +
          '<a href="lessons/' + c.sec + '.html#step4">📝 去本节练一练</a>' +
        "</div>";
      if (!graded) {
        html +=
          '<div class="ct-grade" role="group" aria-label="自评">' +
            "<span>你刚才想的和这个一样吗？</span>" +
            '<button type="button" class="btn yes" data-ct="yes">👍 想对了</button>' +
            '<button type="button" class="btn no" data-ct="no">👎 没想到</button>' +
            '<span class="ct-kbd">1 = 想对了 · 2 = 没想到</span>' +
          "</div>";
      } else {
        var last = queue[idx]._lastGrade;
        html +=
          '<div class="ct-grade">' +
            '<p class="ct-fb ' + (last ? "ok" : "miss") + '" aria-live="polite">' +
              (last ? "✓ 记下了：这条你会。" : "✓ 记下了：这条下一轮会先出。想看为什么，点上面的卡片。") +
            "</p>" +
            '<button type="button" class="btn" data-ct="next">' + (idx + 1 < total ? "下一条 →" : "看本轮小结") + "</button>" +
            '<span class="ct-kbd">回车 = 下一条</span>' +
          "</div>";
      }
    }
    html += "</div>";
    return html;
  }

  function renderSummary() {
    var total = roundRight + roundWrong;
    var html = '<div class="ct-sum" aria-live="polite"><h3>本轮小结：' + total + " 条，想对 " + roundRight + "，没想到 " + roundWrong + "</h3>";
    if (!total) {
      html += '<p class="small">这一轮全跳过了。再来一轮试试，想不出来也点揭晓，看一眼就是收获。</p>';
    } else if (!roundWrong) {
      html += '<p class="small">全对。换一章，或者切到跨章混合，难度会上来。</p>';
    } else {
      html += '<p class="small">没想到的这几条，建议点卡片看一遍「什么时候用」，再回来重练：</p><ul>';
      missed.forEach(function (c) {
        html += "<li>" + mathHtml(c.cue) + ' <button type="button" class="w-rel" data-goto="' + c.card + '">🔗 ' + esc(c.label) + "</button></li>";
      });
      html += "</ul>";
    }
    html += '<div class="ct-row">' +
      (roundWrong ? '<button type="button" class="btn" data-ct="retry-missed">只重练没想到的 ' + roundWrong + " 条</button>" : "") +
      '<button type="button" class="btn' + (roundWrong ? " ghost" : "") + '" data-ct="again">再来一轮</button>' +
      "</div></div>";
    return html;
  }

  function renderList() {
    var src = pool();
    if (!src.length) return '<p class="ct-empty">这一章还没有题干信号。</p>';
    var byCh = {};
    src.forEach(function (c) { (byCh[c.ch] = byCh[c.ch] || []).push(c); });
    var html = '<p class="small">卡壳时直接查：左边是题干里的信号，右边是第一步怎么做。点胶囊跳到对应方法卡。</p>';
    Object.keys(byCh).map(Number).sort(function (a, b) { return a - b; }).forEach(function (ch) {
      html += '<div class="tree-group"><h3>' + esc(CH_NAMES[ch] || ("第 " + ch + " 章")) + "</h3>";
      byCh[ch].forEach(function (c) {
        html +=
          '<div class="tree-row">' +
            "<div>" + mathHtml(c.cue) + "</div>" +
            '<span class="tree-arr">⟶</span>' +
            "<div>" + mathHtml(c.act) + ' <button type="button" class="w-rel" data-goto="' + c.card + '">查看：' + esc(c.label) + "</button>" +
              '<span class="ct-src-sec">' + esc(secName(c.sec)) + "</span></div>" +
          "</div>";
      });
      html += "</div>";
    });
    return html;
  }

  function render(focusSel) {
    mount.innerHTML = renderTop() + '<div id="ctBody">' + (mode === "train" ? renderTrainer() : renderList()) + "</div>";
    math(mount);
    if (focusSel) {
      var f = mount.querySelector(focusSel);
      if (f) f.focus({ preventScroll: true });
    }
  }

  /* ---------- 交互 ---------- */
  function grade(ok) {
    var c = queue[idx];
    c._lastGrade = ok;
    graded = true;
    if (ok) roundRight++; else { roundWrong++; missed.push(c); }
    log(c.sec, "cue", { id: c.id, ch: c.ch, card: c.card, correct: ok });
  }
  function next() { idx++; revealed = false; graded = false; }

  mount.addEventListener("click", function (ev) {
    var modeBtn = ev.target.closest("[data-ct-mode]");
    if (modeBtn) {
      mode = modeBtn.getAttribute("data-ct-mode");
      saveUI();
      if (mode === "train") buildQueue();
      render();
      return;
    }
    if (ev.target.closest("[data-ct-sec-clear]")) {
      curSec = null;
      if (mode === "train") buildQueue();
      render();
      return;
    }
    var chBtn = ev.target.closest("[data-ct-ch]");
    if (chBtn) {
      curSec = null;
      curCh = chBtn.getAttribute("data-ct-ch");
      saveUI();
      if (mode === "train") buildQueue();
      render();
      return;
    }
    var act = ev.target.closest("[data-ct]");
    if (!act) return;
    var what = act.getAttribute("data-ct");
    if (what === "reveal") { revealed = true; render('[data-ct="yes"]'); }
    else if (what === "skip") { next(); render('[data-ct="reveal"]'); }
    else if (what === "yes") { grade(true); render('[data-ct="next"]'); }
    else if (what === "no") { grade(false); render('[data-ct="next"]'); }
    else if (what === "next") { next(); render('[data-ct="reveal"]'); }
    else if (what === "again") { buildQueue(); render('[data-ct="reveal"]'); }
    else if (what === "retry-missed") { buildQueue(missed.map(function (c) { return c.id; })); render('[data-ct="reveal"]'); }
    if (what && what !== "reveal") {
      var card = document.getElementById("ctCard") || mount.querySelector(".ct-sum");
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* 键盘：只在训练器所在标签页可见、且焦点不在输入框时生效 */
  document.addEventListener("keydown", function (ev) {
    if (mode !== "train") return;
    var sec = mount.closest("section");
    if (!sec || !sec.classList.contains("on")) return;
    var tag = (ev.target && ev.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var sel = null;
    if (ev.key === "Enter") sel = revealed ? (graded ? '[data-ct="next"]' : null) : '[data-ct="reveal"]';
    else if (ev.key === "1" && revealed && !graded) sel = '[data-ct="yes"]';
    else if (ev.key === "2" && revealed && !graded) sel = '[data-ct="no"]';
    if (!sel) {
      if (ev.key === "Enter" && idx >= queue.length) sel = '[data-ct="again"]';
      if (!sel) return;
    }
    var btn = mount.querySelector(sel);
    if (btn && !(ev.key === "Enter" && ev.target === btn)) { ev.preventDefault(); btn.click(); }
  });

  /* ---------- 启动 ---------- */
  function boot() {
    var h = location.hash || "";
    var m = h.match(/(?:^|[#&])ch=(\d+)/);
    var ms = h.match(/(?:^|[#&])sec=([a-z0-9-]+)/);
    if (/tab=tree/.test(h)) {
      if (m && CH_NAMES[m[1]]) { curCh = m[1]; saveUI(); }
      if (ms && SEC_META[ms[1]]) { curSec = ms[1]; mode = "train"; }
      var tabBtn = document.querySelector('#mainTabs [data-tab="tree"]');
      if (tabBtn) setTimeout(function () { tabBtn.click(); }, 0);
    }
    if (mode === "train") buildQueue();
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PEIYU_CUE_TRAINER = {
    rebuild: function () { buildQueue(); render(); },
    cueCount: function (sid) { return CUES.filter(function (c) { return c.sec === sid; }).length; },
    /* 图谱「测一测本节题干信号」：只出这一节，切到训练器标签页 */
    startSec: function (sid) {
      if (!SEC_META[sid]) return;
      curSec = sid; mode = "train"; saveUI();
      buildQueue(); render('[data-ct="reveal"]');
      var tabBtn = document.querySelector('#mainTabs [data-tab="tree"]');
      if (tabBtn) tabBtn.click();
      setTimeout(function () { mount.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    }
  };
})();
