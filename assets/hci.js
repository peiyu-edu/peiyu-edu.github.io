/* 培玉 · 高中数学 — 交互层（PY-53，规则见 GOAL-hci.md）。
   只做渐进增强：本文件加载失败，页面照旧能用。不改记录格式 peiyu.hs.log；自己的状态放 peiyu.hs.hci.*。
   课时页由 lesson.js 加载；index / wiki / record / textbook-map / anatomy 各用一行 <script defer> 引用。 */
(function () {
  "use strict";
  if (window.PeiyuHCI) return;
  var me = document.currentScript && document.currentScript.src;
  var ROOT = me ? me.replace(/assets\/hci\.js.*$/, "") : "";
  var PATH = location.pathname;
  var PAGE = /\/lessons\//.test(PATH) ? "lesson"
    : /wiki\.html/.test(PATH) ? "wiki"
    : /record\.html/.test(PATH) ? "record"
    : /anatomy\.html/.test(PATH) ? "lab"
    : /textbook-map\.html/.test(PATH) ? "map"
    : "home";

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem("peiyu.hs.hci." + k);
      if (v === null) localStorage.removeItem("peiyu.hs.hci." + k);
      else localStorage.setItem("peiyu.hs.hci." + k, v);
    } catch (e) { return null; }
  }
  function json(k, v) {
    if (v === undefined) { try { return JSON.parse(store(k) || "null"); } catch (e) { return null; } }
    store(k, JSON.stringify(v));
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function scrollToY(y) { window.scrollTo({ top: Math.max(0, y), behavior: reduced ? "auto" : "smooth" }); }

  /* ---------- H-1 全局导航：各页同一组入口，标出当前页 ---------- */
  var NAV = [
    { id: "home", href: "index.html", full: "全部课程", short: "课程" },
    { id: "wiki", href: "wiki.html", full: "⚡ 知识 Wiki", short: "Wiki" },
    { id: "lab", href: "anatomy.html", full: "🔬 3D 实验台", short: "实验台" },
    { id: "record", href: "record.html", full: "我的记录", short: "记录" }
  ];
  function setupNav() {
    var top = document.querySelector("header.top");
    if (!top || top.querySelector(".hci-nav")) return;
    var nav = el("nav", "hci-nav"); nav.setAttribute("aria-label", "站内导航");
    NAV.forEach(function (n) {
      var a = el("a", "wk-topbtn hci-link"); // 带 wk-topbtn：wiki.js 看到就不再插自己的按钮
      a.href = ROOT + n.href;
      a.innerHTML = '<span class="hci-full"></span><span class="hci-short"></span>';
      a.firstChild.textContent = n.full; a.lastChild.textContent = n.short;
      a.setAttribute("aria-label", n.full.replace(/^\S+\s/, ""));
      if (n.id === PAGE) a.setAttribute("aria-current", "page");
      else if (n.id === "home" && (PAGE === "lesson" || PAGE === "map")) a.setAttribute("aria-current", "true"); // 课时页、全册路线属于「课程」
      nav.appendChild(a);
    });
    function tidy() {
      [].forEach.call(top.querySelectorAll("a.home, a.rec, a.wk-topbtn:not(.hci-link)"), function (x) { x.remove(); });
    }
    tidy();
    top.appendChild(nav);
    top.classList.add("hci-top");
    new MutationObserver(tidy).observe(top, { childList: true });
  }

  /* ---------- H-1 无障碍骨架：main、跳到正文 ---------- */
  function setupLandmarks() {
    var top = document.querySelector("header.top");
    var main = document.querySelector("main, [role=main]");
    if (!main && top && top.parentNode) {
      main = el("main"); main.id = "main";
      var n = top.nextSibling;
      while (n) {
        var next = n.nextSibling;
        if (!(n.nodeType === 1 && (n.tagName === "FOOTER" || n.tagName === "SCRIPT"))) main.appendChild(n);
        n = next;
      }
      top.parentNode.insertBefore(main, top.nextSibling);
    }
    if (!main) return;
    if (!main.id) main.id = "main";
    main.setAttribute("tabindex", "-1");
    if (!document.querySelector("a.skip")) {
      var skip = el("a", "skip", "跳到正文"); skip.href = "#" + main.id;
      skip.onclick = function (e) { e.preventDefault(); main.focus(); scrollToY(main.getBoundingClientRect().top + scrollY - 8); };
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }

  /* ---------- H-2 课内步骤：网址、回访、键盘、单行标签 ---------- */
  var SEC = document.body.getAttribute("data-sec") || "";
  var SHORT = { "从例子进入": "例子", "讲清楚": "讲解", "概念课": "讲解", "动手": "动手", "练一练": "练习", "高考真题": "真题" };
  var lesson = null; // { bar, tabs, steps }

  function stepIndex() { return lesson ? lesson.tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }) : -1; }
  function barH() { return lesson && getComputedStyle(lesson.bar).position === "sticky" ? lesson.bar.getBoundingClientRect().height : 0; }
  function goStep(i, opts) {
    if (!lesson || i < 0 || i >= lesson.tabs.length) return;
    if (i !== stepIndex()) lesson.tabs[i].click();
    if (opts && opts.focus) lesson.tabs[i].focus();
    if (opts && opts.scroll) {
      // 只在已经划过步骤条时才往回滚：滚到这一步开头，且不被吸顶的标签盖住
      var y = lesson.steps[i].getBoundingClientRect().top + scrollY - barH() - 8;
      if (scrollY > y) scrollToY(y);
    }
  }

  // 标签：编号 + 全名 + 手机短名 + ✓。别的脚本（如改名为「概念课」）重写了标签文字时重新装饰
  function decorate(t, i, title) {
    if (t.querySelector(".hci-ck")) return;
    var shown = t.textContent.replace(/^\s*\d+\s*/, "").trim() || title;
    t.setAttribute("aria-label", "第 " + (i + 1) + " 步：" + shown);
    t.innerHTML = '<span class="hci-n"></span> <span class="hci-t"></span><span class="hci-s"></span><span class="hci-ck" aria-hidden="true"></span>';
    t.querySelector(".hci-n").textContent = i + 1;
    t.querySelector(".hci-t").textContent = shown;
    t.querySelector(".hci-s").textContent = SHORT[title] || SHORT[shown] || shown.slice(0, 2);
  }

  function setupSteps() {
    var bar = document.querySelector("nav.steps");
    if (!bar) return;
    var tabs = [].slice.call(bar.querySelectorAll("[role=tab]"));
    var steps = [].slice.call(document.querySelectorAll("section.step"));
    if (!tabs.length || tabs.length !== steps.length) return;
    lesson = { bar: bar, tabs: tabs, steps: steps };
    bar.setAttribute("aria-label", "本节五步");
    tabs.forEach(function (t, i) {
      var title = steps[i].getAttribute("data-title") || "";
      t.id = t.id || "hci-tab-" + (i + 1);
      steps[i].id = steps[i].id || "step" + (i + 1);
      steps[i].setAttribute("role", "tabpanel");
      steps[i].setAttribute("aria-labelledby", t.id);
      t.setAttribute("aria-controls", steps[i].id);
      decorate(t, i, title);
      t.addEventListener("click", function () { setTimeout(function () { goStep(i, { scroll: true }); }, 0); });
    });
    bar.classList.add("hci-steps");
    new MutationObserver(function () {
      var changed = false;
      tabs.forEach(function (t, i) { if (!t.querySelector(".hci-ck")) { decorate(t, i, steps[i].getAttribute("data-title") || ""); changed = true; } });
      if (changed) paintProgress();
    }).observe(bar, { childList: true, subtree: true, characterData: true });

    // 键盘：左右键、Home、End；只有当前标签在 Tab 顺序里
    function roving() { var c = stepIndex(); tabs.forEach(function (t, j) { t.tabIndex = j === c ? 0 : -1; }); }
    bar.addEventListener("keydown", function (e) {
      var c = stepIndex(), n;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (c + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (c - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      else return;
      e.preventDefault();
      goStep(n, { focus: true });
    });

    // 每次换步：网址 #stepN、记住这一节学到第几步、标记看过
    function onStep() {
      var c = stepIndex(); if (c < 0) return;
      roving();
      var h = "#step" + (c + 1);
      if (location.hash !== h) { try { history.replaceState(null, "", h); } catch (e) { /* file:// 等 */ } }
      if (SEC) {
        store("step." + SEC, String(c + 1));
        var seen = json("seen." + SEC) || [];
        if (seen.indexOf(c + 1) < 0) { seen.push(c + 1); json("seen." + SEC, seen); }
        var h1 = document.querySelector("h1");
        json("last", { sec: SEC, step: c + 1, of: tabs.length, title: h1 ? h1.textContent.trim() : SEC, t: Date.now() });
      }
      paintProgress();
    }
    document.addEventListener("step", onStep);
    window.addEventListener("hashchange", function () {
      var m = location.hash.match(/^#step(\d+)$/);
      if (m) goStep(parseInt(m[1], 10) - 1, { scroll: true });
    });

    // 回访：网址里没指定步骤，就回到上次那一步，并给「从第 1 步开始」
    var saved = parseInt(store("step." + SEC) || "0", 10);
    if (!/^#step\d+$/.test(location.hash) && saved > 1 && saved <= tabs.length) {
      goStep(saved - 1);
      var note = el("p", "hci-resume");
      note.setAttribute("role", "status");
      note.appendChild(document.createTextNode("已回到你上次学到的第 " + saved + " 步。"));
      var b = el("button", "hci-linkbtn", "从第 1 步开始"); b.type = "button";
      b.onclick = function () { goStep(0, { focus: true }); note.remove(); };
      var x = el("button", "hci-linkbtn", "知道了"); x.type = "button";
      x.onclick = function () { note.remove(); };
      note.appendChild(b); note.appendChild(x);
      bar.parentNode.insertBefore(note, bar.nextSibling);
    }
    onStep();
  }

  /* ---------- H-3 做题：作答保存与恢复、进度、读屏 ---------- */
  var boxesAll = [];
  function predictKey(box) { return (box.getAttribute("data-id") || "") + "#" + boxesAll.indexOf(box); }
  function answers() { return (SEC && json("ans." + SEC)) || {}; }

  function markDone(box, v) {
    // 只还原样子，不再触发 lesson.js 的点击（那会往老师看的记录里重复记一次）
    var ans = box.getAttribute("data-answer");
    box.classList.add("done");
    [].forEach.call(box.querySelectorAll(".opt"), function (p) {
      var pv = p.getAttribute("data-v");
      if (pv === ans) p.classList.add("right");
      else if (pv === v) p.classList.add("wrong");
      p.setAttribute("aria-disabled", "true");
    });
    var rv = box.querySelector(".reveal"); if (rv) rv.hidden = false;
  }

  function setupPredicts() {
    boxesAll = [].slice.call(document.querySelectorAll(".predict"));
    var saved = answers();
    boxesAll.forEach(function (box) {
      var k = predictKey(box);
      var rv = box.querySelector(".reveal");
      if (rv) { rv.setAttribute("aria-live", "polite"); rv.setAttribute("tabindex", "-1"); }
      if (saved[k] && !box.classList.contains("done")) markDone(box, saved[k]);
      else if (!saved[k] && box.classList.contains("done")) {
        // 本脚本加载前就点了：从样子反推选了哪个
        var w = box.querySelector(".opt.wrong") || box.querySelector(".opt.right");
        if (w) { saved[k] = w.getAttribute("data-v"); json("ans." + SEC, saved); }
      }
      box.addEventListener("click", function (e) {
        var o = e.target.closest && e.target.closest(".opt");
        if (!o || !box.contains(o) || box.classList.contains("done")) return; // 捕获阶段：lesson.js 还没处理
        setTimeout(function () {
          if (!box.classList.contains("done")) return;
          var a = answers(); a[k] = o.getAttribute("data-v"); json("ans." + SEC, a);
          if (rv && !rv.hidden) {
            rv.focus({ preventScroll: true });
            rv.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
          }
          paintProgress();
        }, 0);
      }, true);
    });
  }

  function paintProgress() {
    if (!lesson) return;
    var saved = answers(), seen = json("seen." + SEC) || [], all = 0, doneAll = 0;
    lesson.steps.forEach(function (s, i) {
      var boxes = [].slice.call(s.querySelectorAll(".predict"));
      var done = boxes.filter(function (b) { return b.classList.contains("done") || saved[predictKey(b)]; }).length;
      all += boxes.length; doneAll += done;
      var complete = boxes.length ? done === boxes.length : seen.indexOf(i + 1) >= 0;
      var t = lesson.tabs[i];
      t.classList.toggle("hci-done", complete);
      var ck = t.querySelector(".hci-ck"); if (ck) ck.textContent = complete ? "✓" : "";
      var base = t.getAttribute("aria-label").replace(/（.*）$/, "");
      t.setAttribute("aria-label", base + (boxes.length ? "（已做 " + done + "/" + boxes.length + "）" : complete ? "（看过）" : ""));
      var p = s.querySelector(":scope > .hci-progress");
      if (boxes.length) {
        if (!p) { p = el("p", "hci-progress small"); p.setAttribute("data-hci-progress", ""); s.insertBefore(p, s.firstChild); }
        p.textContent = "这一步 " + done + "/" + boxes.length + " 题已做";
      }
    });
    var head = document.querySelector(".hci-sec-progress");
    if (all && !head) {
      head = el("div", "hci-sec-progress small");
      // 文字和「重做本节」包在一起，换行时不会拆开
      head.innerHTML = '<span class="hci-prog-r"><span class="hci-prog-t"></span><button type="button" class="hci-linkbtn">重做本节</button></span>';
      head.querySelector("button").onclick = function () {
        if (!window.confirm("清空这一节的作答，从头再做？（「我的记录」里的历史不受影响）")) return;
        store("ans." + SEC, null); store("seen." + SEC, null); store("step." + SEC, null);
        try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignore */ }
        location.reload();
      };
      lesson.bar.parentNode.insertBefore(head, lesson.bar);
    }
    // 概念课视频按钮和「本节共 x 题」放一行，省一行高度
    var cta = document.querySelector("a.hci-video-cta");
    if (head && cta && cta.parentNode !== head) { head.insertBefore(cta, head.firstChild); head.classList.add("hci-has-cta"); }
    if (head) {
      head.querySelector(".hci-prog-t").textContent = doneAll ? "本节已做 " + doneAll + "/" + all + " 题" : "本节共 " + all + " 题";
      head.querySelector("button").hidden = doneAll === 0;
    }
  }

  /* ---------- H-4 首屏减负：知识脉络 + 本节路线收进一个「本节导读」 ---------- */
  function setupGuide() {
    var lead = document.querySelector("p.lead") || document.querySelector("h1");
    if (!lead || !lead.parentNode) return;
    var host = lead.parentNode;
    var box = el("details", "hci-guide");
    var sum = el("summary");
    sum.innerHTML = '<span class="hci-guide-t">本节导读</span><span class="hci-guide-s small">先修、学完能解锁什么、本节路线</span>';
    box.appendChild(sum);
    var body = el("div", "hci-guide-b"); box.appendChild(body);
    var pref = store("guide.open");
    box.open = pref ? pref === "1" : window.innerWidth >= 1000;
    // 只记用户自己点的（代码设 open 也会触发 toggle 事件）
    sum.addEventListener("click", function () { setTimeout(function () { store("guide.open", box.open ? "1" : "0"); }, 0); });
    host.insertBefore(box, lead.nextSibling);

    function collect() {
      [].forEach.call(host.querySelectorAll(":scope > .wk-chain, :scope > aside.student-route, :scope > [data-student-route], :scope > .concept-map"), function (n) {
        if (n.matches(".concept-map")) {
          // 视频入口不藏：拿出来放在导读下面
          var vb = n.querySelector("a.btn[href*='video']");
          if (vb) { vb.classList.add("hci-video-cta"); vb.style.margin = ""; host.insertBefore(vb, box.nextSibling); }
        }
        if (n.matches(".wk-chain")) body.insertBefore(n, body.firstChild); else body.appendChild(n);
        // 摘要里写上先修，收起时也看得到
        if (n.matches(".wk-chain")) {
          var span = [].filter.call(n.querySelectorAll("span"), function (s) { return /硬先修|前置/.test(s.textContent); })[0];
          var a = span && span.querySelector("a");
          if (a) box.querySelector(".hci-guide-s").textContent = "先修：" + a.textContent + (span.querySelectorAll("a").length > 1 ? " 等" : "") + " · 本节路线";
        }
      });
      box.hidden = !body.children.length;
    }
    collect();
    var mo = new MutationObserver(collect);
    mo.observe(host, { childList: true });
    setTimeout(function () { mo.disconnect(); }, 10000);
  }

  /* ---------- H-5 首页：每节学到哪、每章学了几节 ---------- */
  function sectionProgress() {
    // 新数据（hci 记的看过哪些步）+ 旧记录 peiyu.hs.log 里的 step 事件，老用户也能看到进度
    var by = {}, log = [];
    try { log = JSON.parse(localStorage.getItem("peiyu.hs.log") || "[]"); } catch (e) { /* ignore */ }
    log.forEach(function (e) {
      if (!e || !e.sec) return;
      var p = by[e.sec] || (by[e.sec] = { max: 0, seen: {} });
      if (e.kind === "step" && e.step) { p.seen[e.step] = 1; p.max = Math.max(p.max, e.step); }
      if (e.kind === "open") p.max = Math.max(p.max, 1);
    });
    try {
      Object.keys(localStorage).forEach(function (k) {
        var m = k.match(/^peiyu\.hs\.hci\.seen\.(.+)$/); if (!m) return;
        var p = by[m[1]] || (by[m[1]] = { max: 0, seen: {} });
        (json("seen." + m[1]) || []).forEach(function (n) { p.seen[n] = 1; p.max = Math.max(p.max, n); });
      });
    } catch (e) { /* ignore */ }
    return by;
  }
  function setupHome() {
    var by = sectionProgress();
    [].forEach.call(document.querySelectorAll("details.chap"), function (chap) {
      var links = [].slice.call(chap.querySelectorAll('.secs li > a[href^="lessons/"]:not([class])'));
      var learned = 0;
      links.forEach(function (a) {
        var sec = (a.getAttribute("href").match(/lessons\/([^.]+)\.html/) || [])[1];
        var p = sec && by[sec];
        if (!p || !p.max) return;
        var full = [1, 2, 3, 4].every(function (n) { return p.seen[n]; }); // 第 5 步真题选做
        if (full) learned++;
        var tag = a.parentNode.querySelector(".done") || a.parentNode.appendChild(el("span", "done"));
        tag.classList.add("hci-sec-tag");
        tag.classList.toggle("hci-full", full);
        tag.textContent = full ? "✓ 学完" : "学到第 " + p.max + " 步";
      });
      var sum = chap.querySelector("summary");
      if (sum && learned && !sum.querySelector(".hci-chap-n")) sum.appendChild(el("span", "hci-chap-n", "已学 " + learned + "/" + links.length));
    });
  }

  /* ---------- H-6 我的记录：名字必填提示、手机卡片表、发送内容折叠、清空连进度一起 ---------- */
  function setupRecord() {
    var nm = document.getElementById("name"), copy = document.getElementById("copy"), msg = document.getElementById("msg");
    var out = document.getElementById("out"), clear = document.getElementById("clear");
    if (msg) { msg.setAttribute("role", "status"); msg.setAttribute("aria-live", "polite"); }
    if (nm) {
      nm.placeholder = "老师认得出的名字";
      nm.autocomplete = "name";
      nm.classList.add("hci-name");
    }
    // 没写名字就复制：老师收到不知道是谁的。先提示、聚焦名字框
    if (copy && nm) copy.addEventListener("click", function (e) {
      if (nm.value.trim()) return;
      e.stopImmediatePropagation(); e.preventDefault();
      var t = "先写上名字，老师才知道是谁的记录。";
      if (msg) msg.textContent = t;
      // 焦点跳到名字框，原因也要写在名字框旁边（复制按钮在下面，跳上来就看不到了）
      var hint = document.getElementById("hci-name-hint");
      if (!hint) { hint = el("p", "hci-name-hint small"); hint.id = "hci-name-hint"; hint.setAttribute("role", "alert"); nm.closest(".card, label").appendChild(hint); nm.setAttribute("aria-describedby", hint.id); }
      hint.textContent = t; hint.hidden = false;
      nm.classList.add("hci-need"); nm.focus();
    }, true);
    if (nm) nm.addEventListener("input", function () {
      nm.classList.remove("hci-need");
      var hint = document.getElementById("hci-name-hint"); if (hint && nm.value.trim()) hint.hidden = true;
    });
    // 发给老师的原始数据对学生没用，收起来
    if (out && !out.closest("details")) {
      var d = el("details", "hci-raw"); d.appendChild(el("summary", null, "看看要发出去的内容"));
      out.parentNode.insertBefore(d, out); d.appendChild(out);
    }
    // 表格在手机上变卡片：每格带上列名
    var table = document.querySelector("table.rec");
    if (table) {
      table.classList.add("hci-cards");
      var heads = [].map.call(table.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
      [].forEach.call(table.querySelectorAll("tbody tr"), function (tr) {
        [].forEach.call(tr.children, function (td, i) { if (heads[i] && !td.hasAttribute("colspan")) td.setAttribute("data-label", heads[i]); });
      });
    }
    // 清空：做题记录和本站的学习进度一起清，免得首页还显示「学到第 N 步」
    if (clear) {
      clear.textContent = "清空这台设备上的全部记录";
      clear.onclick = function () {
        if (!window.confirm("确定清空？做题记录和学习进度都会删掉，找不回来。\n要交给老师的话，先点「复制记录」。")) return;
        try {
          localStorage.removeItem("peiyu.hs.log");
          localStorage.removeItem("peiyu.hs.cards");
          Object.keys(localStorage).forEach(function (k) { if (k.indexOf("peiyu.hs.hci.") === 0) localStorage.removeItem(k); });
        } catch (e) { /* ignore */ }
        location.reload();
      };
      var p = clear.parentNode; if (p) p.classList.add("hci-danger-zone");
    }
  }

  /* Wiki 四个大标签：手机上用短名，一行放下 */
  var WIKI_SHORT = { cards: "卡片", map: "图谱", tree: "怎么想", labs: "易错" };
  function setupWikiTabs() {
    // wiki.html 自己只恢复 #tab=map，其余标签在页面初始化完后由这里恢复
    var m = location.hash.match(/^#tab=(cards|tree|labs)\b/);
    if (m) {
      var go = function () { setTimeout(function () { var b = document.querySelector('#mainTabs [data-tab="' + m[1] + '"]'); if (b && b.getAttribute("aria-selected") !== "true") b.click(); }, 0); };
      if (document.readyState === "complete") go(); else window.addEventListener("load", go);
    }
    [].forEach.call(document.querySelectorAll("#mainTabs [data-tab]"), function (b) {
      var short = WIKI_SHORT[b.getAttribute("data-tab")];
      if (!short || b.querySelector(".hci-s")) return;
      var full = b.textContent.trim();
      b.setAttribute("aria-label", full.replace(/^\d+\s*/, ""));
      b.innerHTML = '<span class="hci-t"></span><span class="hci-s"></span>';
      b.firstChild.textContent = full; b.lastChild.textContent = short;
      // 切标签写进网址（wiki.js 认 #tab=xxx），刷新、分享不丢；别的 hash（如 #map=节）不覆盖
      b.addEventListener("click", function () {
        if (location.hash && !/^#tab=/.test(location.hash)) return;
        try { history.replaceState(null, "", "#tab=" + b.getAttribute("data-tab")); } catch (e) { /* ignore */ }
      });
    });
  }

  function init() {
    if (!document.querySelector("link[href*='hci.css']")) {
      var l = el("link"); l.rel = "stylesheet"; l.href = ROOT + "assets/hci.css"; document.head.appendChild(l);
    }
    setupNav();
    if (!document.querySelector('script[data-peiyu-theme]')) {
      var themeStyle = el("link"); themeStyle.rel = "stylesheet"; themeStyle.href = ROOT + "assets/theme-switch.css"; document.head.appendChild(themeStyle);
      var themeScript = el("script"); themeScript.src = ROOT + "assets/theme-switch.js"; themeScript.setAttribute("data-peiyu-theme", ""); document.head.appendChild(themeScript);
    }
    setupLandmarks();
    if (PAGE === "lesson") { setupGuide(); setupPredicts(); setupSteps(); }
    if (PAGE === "home") setupHome();
    if (PAGE === "record") setupRecord();
    if (PAGE === "wiki") setupWikiTabs();
    document.documentElement.classList.add("hci");
  }

  window.PeiyuHCI = { page: PAGE, root: ROOT, store: store, json: json };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
