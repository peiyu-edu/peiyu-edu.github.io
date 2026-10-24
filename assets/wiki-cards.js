/* 培玉 · 高中数学 — 卡片库自测模式 + 「今日待复习」（wiki.html 第 1 个标签页）
   wiki.html 的 renderCards() 画完卡片后调用 window.PEIYU_CARD_MODE.decorate(listEl, matched)，这里再加工：
   - 自测模式（默认）：每张卡只露标题和「什么时候用」，关键结论 / 红线 / 母题盖住；
     点「翻开」后自评 会 / 模糊 / 不会 → 下次复习分别排在 7 / 3 / 1 天后。
   - 查阅模式：全部摊开，不打分（做题卡壳时直接查）。
   - 卡片库顶部「今日待复习」面板：到期卡数、新卡数，「开始复习」只看到期卡，复习完给提示。
   - 从训练器 / 课程页 / 搜索胶囊跳过来的那张卡自动翻开。
   存储：复习计划 localStorage peiyu.hs.cards = { cardId: { g, t, due:"YYYY-MM-DD", n } }；
   每次自评也写 peiyu.hs.log（{kind:"card", sec, id, ch, grade, correct}），记录页与图谱把「不会 / 模糊」算作该节薄弱。 */
(function () {
  "use strict";

  var CARDS = window.PEIYU_WIKI_CARDS || [];
  var BY_ID = {};
  CARDS.forEach(function (c) { BY_ID[c.id] = c; });
  if (!CARDS.length) return;

  var LOG_KEY = "peiyu.hs.log", NAME_KEY = "peiyu.hs.name", SCHED_KEY = "peiyu.hs.cards", UI_KEY = "peiyu.hs.cards.ui";
  var INTERVAL = { no: 1, fuzzy: 3, know: 7 };
  var GRADE_TXT = { no: "不会", fuzzy: "模糊", know: "会" };

  /* ---------- 存储 ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function readJSON(k, dflt) { try { return JSON.parse(store(k) || "") || dflt; } catch (e) { return dflt; } }
  function readLog() { return readJSON(LOG_KEY, []); }
  function log(sec, kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }
  var sched = readJSON(SCHED_KEY, {});
  function saveSched() { store(SCHED_KEY, JSON.stringify(sched)); }

  function ymd(d) {
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return y + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }
  function today() { return ymd(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }
  function daysUntil(due) {
    var a = new Date(today() + "T00:00:00"), b = new Date(due + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }

  /* 到期卡 / 新卡 */
  function dueIds() {
    var t = today();
    return CARDS.filter(function (c) { var s = sched[c.id]; return s && s.due <= t; })
      .sort(function (a, b) { return sched[a.id].due < sched[b.id].due ? -1 : 1; })
      .map(function (c) { return c.id; });
  }
  function newCount() { return CARDS.filter(function (c) { return !sched[c.id]; }).length; }
  function nextDue() {
    var best = null;
    CARDS.forEach(function (c) { var s = sched[c.id]; if (s && (!best || s.due < best)) best = s.due; });
    return best;
  }

  /* ---------- 状态 ---------- */
  var ui = readJSON(UI_KEY, {});
  var mode = ui.mode === "read" ? "read" : "test";
  var opened = {};          // 本次会话翻开过的卡
  var review = null;        // 复习中：{ ids:[], done:{} }
  var pendingOpen = null;   // 跳转过来要自动翻开的卡
  var listEl = null, countEl = null, tabSec = null;

  function saveUI() { store(UI_KEY, JSON.stringify({ mode: mode })); }

  /* ---------- 样式 ---------- */
  (function injectStyle() {
    if (document.getElementById("peiyu-cards-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-cards-css";
    st.textContent = [
      ".sc-panel{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:12px 16px;margin:10px 0 4px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}",
      ".sc-panel .sc-num{font-size:15px}",
      ".sc-panel .sc-num b{font-size:20px;color:var(--a)}",
      ".sc-panel .sc-num b.due{color:var(--no)}",
      ".sc-panel .sc-sub{font-size:13.5px;color:var(--muted)}",
      ".sc-panel .sc-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-left:auto}",
      ".sc-panel .btn{min-height:38px}",
      ".sc-mode{display:inline-flex;border:1px solid var(--line);border-radius:999px;background:var(--bg);padding:3px;gap:2px}",
      ".sc-mode button{border:0;background:transparent;color:var(--muted);font:inherit;font-size:13.5px;font-weight:600;padding:5px 12px;min-height:32px;border-radius:999px;cursor:pointer}",
      ".sc-mode button.on{background:var(--a);color:#fff}",
      ".sc-mode button:focus-visible{outline:3px solid var(--hl)}",
      ".sc-done{width:100%;font-size:15px;color:var(--a);font-weight:600}",
      ".sc-chip{display:inline-block;font-size:12px;font-weight:600;border-radius:6px;padding:2px 7px;border:1px solid var(--line);color:var(--muted);background:var(--bg)}",
      ".sc-chip.due{border-color:var(--no);color:var(--no);background:var(--no-soft)}",
      ".sc-chip.ok{border-color:var(--a);color:var(--a);background:var(--ok-soft)}",
      ".sc-cover{border:1.5px dashed var(--line);border-radius:10px;padding:14px 16px;margin:10px 0;background:var(--bg);display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}",
      ".sc-cover p{margin:0;flex:1 1 240px;font-size:15px;line-height:1.7}",
      ".sc-cover p b{color:var(--fg)}",
      ".sc-cover .btn{min-height:40px}",
      ".sc-hidden{display:none}",
      ".sc-grade{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px dashed var(--line);margin-top:12px;padding-top:12px;font-size:15px}",
      ".sc-grade .btn{min-height:38px;font-size:14.5px}",
      ".sc-grade .btn.know{background:var(--a);border-color:var(--a);color:#fff}",
      ".sc-grade .btn.fuzzy{background:transparent;border:1.5px solid var(--b);color:var(--b)}",
      ".sc-grade .btn.no{background:transparent;border:1.5px solid var(--no);color:var(--no)}",
      ".sc-grade .sc-note{font-size:14px;color:var(--muted)}",
      ".sc-grade .sc-note b{color:var(--fg)}",
      ".sc-tabbadge{display:inline-block;margin-left:6px;font-size:12px;font-weight:700;color:#fff;background:var(--no);border-radius:999px;padding:1px 7px;vertical-align:middle}"
    ].join("\n");
    document.head.appendChild(st);
  })();

  /* ---------- 「今日待复习」面板 ---------- */
  var panel = null;
  function renderPanel() {
    if (!panel) return;
    var due = dueIds(), fresh = newCount(), total = CARDS.length, learned = total - fresh;
    var html = "";
    if (review) {
      var doneN = Object.keys(review.done).length;
      html += '<span class="sc-num">复习中 <b class="due">' + doneN + "</b> / " + review.ids.length + " 张</span>";
      if (doneN >= review.ids.length) {
        html += '<span class="sc-done">✓ 今日复习完成。不会的明天再见，模糊的 3 天后，会的 7 天后。</span>';
      } else {
        html += '<span class="sc-sub">翻开、自评，一张一张来</span>';
      }
      html += '<span class="sc-btns"><button type="button" class="btn ghost" data-sc="stop">退出复习，看全部</button></span>';
    } else {
      html +=
        '<span class="sc-num">今日待复习 <b class="' + (due.length ? "due" : "") + '">' + due.length + "</b> 张</span>" +
        '<span class="sc-sub">已学 ' + learned + " / " + total + " 张 · 新卡 " + fresh + " 张" +
          (!due.length && learned ? (nextDue() ? " · 最近一次到期：" + fmtDue(nextDue()) : "") : "") +
        "</span>";
      html += '<span class="sc-btns">';
      if (due.length) html += '<button type="button" class="btn" data-sc="start">开始复习 ' + due.length + " 张</button>";
      else if (fresh) html += '<button type="button" class="btn" data-sc="learn">学 5 张新卡</button>';
      html +=
        '<span class="sc-mode" role="group" aria-label="卡片模式">' +
          '<button type="button" data-sc-mode="test"' + (mode === "test" ? ' class="on"' : "") + '>🧠 自测</button>' +
          '<button type="button" data-sc-mode="read"' + (mode === "read" ? ' class="on"' : "") + '>📖 查阅</button>' +
        "</span></span>";
    }
    panel.innerHTML = html;
    // 标签按钮上的小红点
    var tabBtn = document.querySelector('#mainTabs [data-tab="cards"]');
    if (tabBtn) {
      var old = tabBtn.querySelector(".sc-tabbadge");
      if (old) old.remove();
      if (due.length) {
        var bd = document.createElement("span");
        bd.className = "sc-tabbadge"; bd.textContent = "今日 " + due.length; bd.setAttribute("aria-label", "今日待复习 " + due.length + " 张");
        tabBtn.appendChild(bd);
      }
    }
  }
  function fmtDue(due) {
    var d = daysUntil(due);
    if (d <= 0) return "今天";
    if (d === 1) return "明天";
    return d + " 天后（" + due.slice(5).replace("-", "/") + "）";
  }

  /* ---------- 卡片加工 ---------- */
  function statusChip(id) {
    var s = sched[id];
    if (!s) return '<span class="sc-chip">新</span>';
    var d = daysUntil(s.due);
    if (d <= 0) return '<span class="sc-chip due">到期 · 上次' + GRADE_TXT[s.g] + "</span>";
    return '<span class="sc-chip ok">' + fmtDue(s.due) + "复习 · 上次" + GRADE_TXT[s.g] + "</span>";
  }

  function gradeBarHtml(id) {
    var s = sched[id];
    var justNow = s && s.t && (Date.now() - s.t) < 60000;
    if (justNow) {
      return '<div class="sc-grade"><span class="sc-note">✓ 记为「<b>' + GRADE_TXT[s.g] + "</b>」，下次复习：<b>" + fmtDue(s.due) + "</b>" +
        (s.g === "no" ? "。不会的卡，建议先点下面「去本节动手拖图」把图过一遍" : "") + "</span></div>";
    }
    return (
      '<div class="sc-grade" role="group" aria-label="自评">' +
        "<span>刚才盖住的内容，你记得多少？</span>" +
        '<button type="button" class="btn know" data-sc-grade="know" data-sc-id="' + id + '">✅ 会 · 7 天后</button>' +
        '<button type="button" class="btn fuzzy" data-sc-grade="fuzzy" data-sc-id="' + id + '">〰️ 模糊 · 3 天后</button>' +
        '<button type="button" class="btn no" data-sc-grade="no" data-sc-id="' + id + '">❌ 不会 · 明天</button>' +
      "</div>"
    );
  }

  function decorateCard(art, c) {
    var head = art.querySelector(".w-head");
    if (head && !head.querySelector(".sc-chip")) {
      var chip = document.createElement("span");
      chip.innerHTML = statusChip(c.id);
      head.insertBefore(chip.firstChild, head.querySelector(".w-title"));
    }
    if (mode === "read") return;
    var parts = [].slice.call(art.querySelectorAll(":scope > .key, :scope > .warn, :scope > details.more, :scope > .w-links"));
    if (!parts.length) return;
    var isOpen = !!opened[c.id];
    if (!isOpen) {
      var wrap = document.createElement("div");
      wrap.className = "sc-hidden";
      parts[0].parentNode.insertBefore(wrap, parts[0]);
      parts.forEach(function (p) { wrap.appendChild(p); });
      var cover = document.createElement("div");
      cover.className = "sc-cover";
      cover.innerHTML =
        "<p>先在心里说出：<b>这个套路的关键结论是什么？红线在哪？</b> 想好了再翻。</p>" +
        '<button type="button" class="btn" data-sc-open="' + c.id + '">翻开看答案</button>';
      wrap.parentNode.insertBefore(cover, wrap);
    } else {
      var bar = document.createElement("div");
      bar.innerHTML = gradeBarHtml(c.id);
      art.appendChild(bar.firstChild);
    }
  }

  function decorate(list, matched) {
    listEl = list;
    var arts = [].slice.call(list.querySelectorAll("article.w-card"));
    if (pendingOpen && BY_ID[pendingOpen]) { opened[pendingOpen] = true; }
    pendingOpen = null;
    var shown = 0;
    arts.forEach(function (art) {
      var id = (art.id || "").replace(/^card-/, "");
      var c = BY_ID[id];
      if (!c) return;
      if (review && review.ids.indexOf(id) < 0) { art.style.display = "none"; return; }
      shown++;
      decorateCard(art, c);
    });
    if (review && countEl) {
      countEl.textContent = "复习中：显示 " + shown + " / " + review.ids.length + " 张到期卡" + (shown < review.ids.length ? "（有筛选，清空搜索或章节可看全）" : "");
    }
    renderPanel();
  }

  function rerender() {
    if (window.PEIYU_WIKI_RENDER) window.PEIYU_WIKI_RENDER();
    else if (listEl) decorate(listEl, []);
  }

  /* ---------- 交互 ---------- */
  function grade(id, g) {
    var c = BY_ID[id]; if (!c) return;
    var prev = sched[id] || {};
    sched[id] = { g: g, t: Date.now(), due: addDays(INTERVAL[g]), n: (prev.n || 0) + 1 };
    saveSched();
    if (review) review.done[id] = g;
    log(c.sec, "card", { id: id, ch: c.ch, grade: g, correct: g === "know" });
    // 原地替换这张卡的打分条和状态标签，不重画整列
    var art = document.getElementById("card-" + id);
    if (art) {
      var old = art.querySelector(".sc-grade"); if (old) old.remove();
      var bar = document.createElement("div"); bar.innerHTML = gradeBarHtml(id); art.appendChild(bar.firstChild);
      var chip = art.querySelector(".sc-chip"); if (chip) { var tmp = document.createElement("span"); tmp.innerHTML = statusChip(id); chip.replaceWith(tmp.firstChild); }
      // 复习中：自动滚到下一张还没打分的卡
      if (review) {
        var next = null;
        [].slice.call(listEl.querySelectorAll("article.w-card")).some(function (a) {
          var aid = a.id.replace(/^card-/, "");
          if (a.style.display !== "none" && review.ids.indexOf(aid) >= 0 && !review.done[aid]) { next = a; return true; }
          return false;
        });
        if (next) setTimeout(function () { next.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350);
      }
    }
    renderPanel();
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var openBtn = t.closest("[data-sc-open]");
    if (openBtn) {
      var id = openBtn.getAttribute("data-sc-open");
      opened[id] = true;
      var art = document.getElementById("card-" + id);
      if (art) {
        var cover = art.querySelector(".sc-cover"); if (cover) cover.remove();
        var hid = art.querySelector(".sc-hidden");
        if (hid) { while (hid.firstChild) hid.parentNode.insertBefore(hid.firstChild, hid); hid.remove(); }
        var bar = document.createElement("div"); bar.innerHTML = gradeBarHtml(id); art.appendChild(bar.firstChild);
        var first = art.querySelector('[data-sc-grade]'); if (first) first.focus({ preventScroll: true });
      }
      return;
    }
    var gBtn = t.closest("[data-sc-grade]");
    if (gBtn) { grade(gBtn.getAttribute("data-sc-id"), gBtn.getAttribute("data-sc-grade")); return; }
    var mBtn = t.closest("[data-sc-mode]");
    if (mBtn) { mode = mBtn.getAttribute("data-sc-mode"); saveUI(); rerender(); return; }
    var pBtn = t.closest("[data-sc]");
    if (pBtn) {
      var what = pBtn.getAttribute("data-sc");
      if (what === "start") {
        review = { ids: dueIds(), done: {} }; mode = "test"; saveUI();
        if (window.PEIYU_WIKI_RESET) window.PEIYU_WIKI_RESET();
        rerender();
        if (listEl) setTimeout(function () { listEl.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
      } else if (what === "learn") {
        var fresh = CARDS.filter(function (c) { return !sched[c.id]; }).slice(0, 5).map(function (c) { return c.id; });
        review = { ids: fresh, done: {} }; mode = "test"; saveUI();
        if (window.PEIYU_WIKI_RESET) window.PEIYU_WIKI_RESET();
        rerender();
        if (listEl) setTimeout(function () { listEl.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
      } else if (what === "stop") {
        review = null; rerender();
      }
    }
  });

  /* 跳转过来的卡自动翻开：捕获阶段记下目标，等 renderCards 画完再翻 */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-goto]");
    if (b) pendingOpen = b.getAttribute("data-goto");
  }, true);
  (function () {
    var m = (location.hash || "").match(/card-([a-z0-9-]+)/);
    if (m) pendingOpen = m[1];
  })();

  /* ---------- 挂载 ---------- */
  function boot() {
    tabSec = document.getElementById("tab-cards");
    countEl = document.getElementById("countText");
    if (!tabSec) return;
    panel = document.createElement("div");
    panel.className = "sc-panel";
    panel.setAttribute("aria-live", "polite");
    tabSec.insertBefore(panel, tabSec.firstChild);
    renderPanel();
    var list = document.getElementById("cardList");
    if (list && list.children.length) decorate(list, []);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PEIYU_CARD_MODE = { decorate: decorate, grade: grade, dueIds: dueIds };
})();
