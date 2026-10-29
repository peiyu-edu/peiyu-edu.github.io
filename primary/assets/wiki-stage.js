/* 培玉 · 分学段方法 Wiki 引擎（PY-229）
   高中仍用自带数据的 wiki.js（字节不变）；初中、小学共用这一份引擎，各自只提供数据文件：
     <学段站根>/data/wiki.json  —— { version, stage, title, chapters, sections, cards }
   同一套加载逻辑在 Node 里由 tools/wiki_stages.cjs 复用（测试、覆盖率），浏览器里做两件事：
   1. 课时页（lessons/*.html，body[data-sec]）：标题下注入「🕸️ 知识脉络」条——前置课时 → 当前 → 后续课时，
      本节在知识库里有知识点 ID 的，逐个链到 knowledge.html#point=<id>；
   2. Wiki 页（body[data-wiki-stage]）：按章列方法卡、搜索、全部课时的前置/后续脉络表。
   只链到已上线的课时（learning-index.json 的 ready）；没上线的写成纯文字，不留悬空链接。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else {
    root.PeiyuWikiStage = api;
    api.boot(root);
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var KINDS = {
    concept: "🟢 概念",
    formula: "🔵 公式",
    method: "🟡 方法",
    pitfall: "🔴 易错"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* 学段文案（PY-246）：数据里的 labels 可覆盖；缺省值即初中原文案，初中输出不变。
     数据里的节可带 points: [{ id, title, href }]（小学概念卡，href 相对站根），排在学情索引的知识点之后。 */
  var LABELS = {
    start: "不需要前面的初中课时", end: "这条线在本学段到这里告一段落",
    pointLabel: "📌 本节知识点", chapterCards: "⚡ 本章方法卡 →",
    chapterHeading: "第 {no} 章 {title}", chapterPill: "{no} {title}", search: "搜方法卡：如 绝对值、移项、勾股、配方…"
  };

  function labels(custom) {
    var out = {};
    Object.keys(LABELS).forEach(function (k) { out[k] = (custom && custom[k]) || LABELS[k]; });
    return out;
  }

  function fill(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; });
  }

  /* 数据规整：补 id、顺序号、反向生成 unlocks（后续课时）、按节/章/编号索引卡片。 */
  function normalize(data) {
    var order = Object.keys(data.sections || {});
    var sections = {};
    order.forEach(function (sid, i) {
      var s = data.sections[sid];
      sections[sid] = {
        id: sid, name: s.name, ch: s.ch, order: i, prereqs: (s.prereqs || []).slice(),
        start: s.start || "", activity: !!s.activity, optional: !!s.optional, unlocks: [],
        points: (s.points || []).slice()
      };
    });
    order.forEach(function (sid) {
      sections[sid].prereqs.forEach(function (pid) {
        if (sections[pid] && sections[pid].unlocks.indexOf(sid) < 0) sections[pid].unlocks.push(sid);
      });
    });
    var cards = (data.cards || []).map(function (c) {
      var out = {};
      Object.keys(c).forEach(function (k) { out[k] = c[k]; });
      out.rel = (c.rel || []).slice();
      out.keywords = (c.keywords || []).slice();
      out.kindLabel = KINDS[c.kind] || "";
      return out;
    });
    var byId = {}, bySec = {}, byCh = {};
    cards.forEach(function (c) {
      byId[c.id] = c;
      (bySec[c.sec] = bySec[c.sec] || []).push(c);
      (byCh[c.ch] = byCh[c.ch] || []).push(c);
    });
    return {
      version: data.version, stage: data.stage, title: data.title || "", labels: labels(data.labels),
      chapters: (data.chapters || []).slice(), order: order, sections: sections,
      cards: cards, byId: byId, bySec: bySec, byCh: byCh
    };
  }

  /* 学情索引（learning-index.json）→ 已上线课时、每节知识点。没有索引时全部当作已上线、没有知识点。 */
  function lessonIndex(index) {
    if (!index || !Array.isArray(index.lessons)) return null;
    var ready = {}, points = {}, titles = {};
    (index.points || []).forEach(function (p) { titles[p.id] = p.title; });
    index.lessons.concat(index.units || []).forEach(function (l) {  // 小学的单元首页也是课时页（PY-246）
      if (l.ready) ready[l.id] = true;
      points[l.id] = (l.pointIds || []).filter(function (id) { return titles[id]; })
        .map(function (id) { return { id: id, title: titles[id] }; });
    });
    return { ready: ready, points: points };
  }

  /* 一节的脉络条模型（纯数据，Node 测试和浏览器共用）。 */
  function chainModel(stage, sid, idx) {
    var meta = stage.sections[sid];
    if (!meta) return null;
    function isReady(id) { return !idx || !!idx.ready[id]; }
    function ref(id) {
      var s = stage.sections[id];
      return { id: id, name: s.name, ready: isReady(id) };
    }
    var unlocks = meta.unlocks.slice(0, 3).map(ref);
    var next = stage.order[meta.order + 1];
    return {
      id: sid, name: meta.name, ch: meta.ch, start: meta.start,
      prereqs: meta.prereqs.filter(function (id) { return stage.sections[id]; }).map(ref),
      unlocks: unlocks, moreUnlocks: Math.max(0, meta.unlocks.length - unlocks.length),
      next: !unlocks.length && next ? ref(next) : null,
      points: (idx ? (idx.points[sid] || []) : []).concat(meta.points),
      labels: stage.labels,
      cards: (stage.bySec[sid] || []).map(function (c) { return c.id; }),
      chapterCards: (stage.byCh[meta.ch] || []).length
    };
  }

  /* 课时页脉络条 HTML：课时链接是同目录相对地址，rootPrefix 是站根（课时页里为 "../"）。 */
  function chainHtml(model, rootPrefix) {
    var L = model.labels || LABELS;
    function link(r) {
      return r.ready ? '<a href="' + esc(r.id) + '.html">' + esc(r.name) + "</a>"
        : '<span class="ws-pending" title="这一节还在整理">' + esc(r.name) + "（整理中）</span>";
    }
    var before = model.prereqs.length
      ? "<span>⬅️ 前置：" + model.prereqs.map(link).join(" · ") + "</span>"
      : "<span>⬅️ 起点：" + esc(model.start || L.start) + "</span>";
    var after = model.unlocks.length
      ? "<span>➡️ 后续：" + model.unlocks.map(link).join(" · ") +
        (model.moreUnlocks ? " 等 " + (model.unlocks.length + model.moreUnlocks) + " 节" : "") + "</span>"
      : model.next ? "<span>➡️ 按课本顺序接着学：" + link(model.next) + "</span>"
        : "<span>➡️ 后续：" + esc(L.end) + "</span>";
    var pts = model.points.length
      ? '<span class="ws-points">' + esc(L.pointLabel) + "：" + model.points.slice(0, 4).map(function (p) {
        return '<a href="' + rootPrefix + esc(p.href || "knowledge.html#point=" + encodeURIComponent(p.id)) + '">' + esc(p.title) + "</a>";
      }).join(" · ") + (model.points.length > 4 ? " 等 " + model.points.length + " 个" : "") + "</span>"
      : "";
    var tools = '<span class="ws-tools"><a href="' + rootPrefix + "wiki.html#map=" + encodeURIComponent(model.id) + '">🗺️ 脉络图</a>' +
      (model.chapterCards ? '<a href="' + rootPrefix + "wiki.html#ch=" + model.ch + '">' + esc(L.chapterCards) + "</a>" : "") + "</span>";
    return '<span class="ws-lbl">🕸️ 知识脉络</span>' + before + "<b>当前：" + esc(model.name) + "</b>" + after + pts + tools;
  }

  /* 数据自检：Node 测试、覆盖率脚本都调用。ctx.catalog（可选）：{ sid: name }，ctx.points（可选）：知识点 ID 集合。 */
  function validate(stage, ctx) {
    ctx = ctx || {};
    var errs = [];
    var chapters = {};
    stage.chapters.forEach(function (ch) { chapters[ch.no] = ch; });
    stage.order.forEach(function (sid) {
      var s = stage.sections[sid];
      if (!s.name) errs.push("Section " + sid + " missing name");
      if (!chapters[s.ch]) errs.push("Section " + sid + " has unknown chapter " + s.ch);
      if (ctx.catalog && ctx.catalog[sid] !== s.name) errs.push("Section " + sid + " name differs from catalog: " + s.name);
      if (!s.prereqs.length && !s.start) errs.push("Section " + sid + " has neither prereqs nor start");
      s.prereqs.forEach(function (pid) {
        if (!stage.sections[pid]) errs.push("Section " + sid + " has dangling prereq " + pid);
        else if (stage.sections[pid].order >= s.order) errs.push("Section " + sid + " depends on later section " + pid);
      });
    });
    if (ctx.catalog) Object.keys(ctx.catalog).forEach(function (sid) {
      if (!stage.sections[sid]) errs.push("Catalog section " + sid + " missing from wiki sections");
    });
    var seen = {};
    stage.cards.forEach(function (c) {
      if (seen[c.id]) errs.push("Duplicate card " + c.id);
      seen[c.id] = true;
      ["id", "sec", "kind", "title", "trig", "key", "warn"].forEach(function (f) {
        if (!c[f]) errs.push("Card " + c.id + " missing " + f);
      });
      if (!KINDS[c.kind]) errs.push("Card " + c.id + " has unknown kind " + c.kind);
      var s = stage.sections[c.sec];
      if (!s) errs.push("Card " + c.id + " has dangling section " + c.sec);
      else if (s.ch !== c.ch) errs.push("Card " + c.id + " chapter " + c.ch + " differs from its section " + c.sec);
      c.rel.forEach(function (r) {
        if (!stage.byId[r]) errs.push("Card " + c.id + " has dangling rel " + r);
        if (r === c.id) errs.push("Card " + c.id + " relates to itself");
      });
    });
    stage.chapters.forEach(function (ch) {
      if (!(stage.byCh[ch.no] || []).length) errs.push("Chapter " + ch.no + " has no method card");
    });
    return errs;
  }

  /* ==================== 浏览器 ==================== */
  var STYLE =
    ".ws-chain{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin:10px 0 14px;padding:10px 14px;" +
    "border:1px solid var(--line);border-radius:var(--radius,10px);background:var(--card);font-size:15px;line-height:1.7;overflow-wrap:anywhere}" +
    ".ws-chain a{color:var(--a);font-weight:600;text-decoration:none}.ws-chain a:hover{text-decoration:underline}" +
    ".ws-chain .ws-lbl{font-weight:700}.ws-chain .ws-pending{color:var(--muted)}" +
    ".ws-chain .ws-points{flex-basis:100%}.ws-chain .ws-tools{display:flex;flex-wrap:wrap;gap:10px;margin-left:auto}";

  function injectStyle(doc) {
    if (doc.getElementById("ws-style")) return;
    var st = doc.createElement("style");
    st.id = "ws-style";
    st.textContent = STYLE;
    doc.head.appendChild(st);
  }

  function renderMath(win, el) {
    if (win.Peiyu && win.Peiyu.math) { win.Peiyu.math(el); return; }
    if (win.renderMathInElement) {
      win.renderMathInElement(el, {
        delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
        throwOnError: false
      });
    }
  }

  function getJSON(win, url) {
    return win.fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  function load(win, rootPrefix) {
    var data = getJSON(win, rootPrefix + "data/wiki.json").then(normalize);
    var index = getJSON(win, rootPrefix + "data/learning-index.json").then(lessonIndex, function () { return null; });
    return Promise.all([data, index]);
  }

  function setupLesson(win, doc, stage, idx) {
    var sid = doc.body.getAttribute("data-sec") || "";
    var model = chainModel(stage, sid, idx);
    if (!model || doc.querySelector(".ws-chain")) return;
    var chain = doc.createElement("nav");
    chain.className = "ws-chain";
    chain.setAttribute("aria-label", "知识脉络");
    chain.setAttribute("data-ws-chain", sid);
    chain.innerHTML = chainHtml(model, "../");
    var anchor = doc.querySelector("p.lead") || doc.querySelector("h1");
    if (!anchor) return;
    anchor.parentNode.insertBefore(chain, anchor.nextSibling);
    renderMath(win, chain);
    doc.dispatchEvent(new win.Event("peiyu:wiki-chain-ready"));
  }

  function cardHtml(stage, c, idx) {
    var s = stage.sections[c.sec];
    var secReady = !idx || idx.ready[c.sec];
    var rel = c.rel.map(function (r) { return stage.byId[r]; }).filter(Boolean).map(function (r) {
      return '<a class="sec-link" href="#card=' + esc(r.id) + '">' + esc(r.title) + "</a>";
    }).join(" · ");
    return '<article class="w-card" id="card-' + esc(c.id) + '" data-ws-card="' + esc(c.id) + '">' +
      '<div class="w-head"><span class="w-badge ' + esc(c.kind) + '">' + esc(c.kindLabel) + '</span>' +
      '<h3 class="w-title">' + c.title + "</h3></div>" +
      '<p class="w-trig"><b>什么时候用：</b>' + c.trig + "</p>" +
      '<div class="w-key"><b>怎么做：</b><br>' + c.key + "</div>" +
      '<div class="w-warn"><b>⚠️ 最容易错：</b>' + c.warn + "</div>" +
      (c.more ? '<details class="more"><summary>举个例子</summary><p>' + c.more + "</p></details>" : "") +
      '<div class="w-links">' +
        (secReady ? '<a class="act" href="lessons/' + esc(c.sec) + '.html">📖 去学 ' + esc(s.name) + "</a>"
          : '<span class="ws-pending">' + esc(s.name) + "（整理中）</span>") +
        (rel ? "<span>相关：" + rel + "</span>" : "") +
      "</div></article>";
  }

  function mapRowHtml(stage, sid, idx) {
    var m = chainModel(stage, sid, idx);
    function link(r) {
      return r.ready ? '<a href="lessons/' + esc(r.id) + '.html">' + esc(r.name) + "</a>"
        : '<span class="ws-pending">' + esc(r.name) + "（整理中）</span>";
    }
    var all = stage.sections[sid].unlocks.map(function (id) {
      return { id: id, name: stage.sections[id].name, ready: !idx || !!idx.ready[id] };
    });
    return '<tr id="map-' + esc(sid) + '" data-ws-map="' + esc(sid) + '"><th scope="row">' + link({ id: sid, name: m.name, ready: !idx || !!idx.ready[sid] }) + "</th>" +
      "<td>" + (m.prereqs.length ? m.prereqs.map(link).join("<br>") : '<span class="ws-pending">' + esc(m.start) + "</span>") + "</td>" +
      "<td>" + (all.length ? all.map(link).join("<br>") : "—") + "</td></tr>";
  }

  function setupWikiPage(win, doc, stage, idx) {
    var host = doc.getElementById("ws-root");
    if (!host) return;
    var books = [];
    stage.chapters.forEach(function (ch) {
      var last = books[books.length - 1];
      if (!last || last.title !== ch.book) books.push(last = { title: ch.book, chapters: [] });
      last.chapters.push(ch);
    });
    var pills = '<button type="button" class="w-pill on" data-ws-ch="all">全部</button>' + stage.chapters.map(function (ch) {
      return '<button type="button" class="w-pill" data-ws-ch="' + ch.no + '">' + esc(fill(stage.labels.chapterPill, ch)) + "</button>";
    }).join("");
    var cards = books.map(function (b) {
      return '<h2 class="ws-book">' + esc(b.title) + "</h2>" + b.chapters.map(function (ch) {
        return '<section class="ws-chap" id="ch-' + ch.no + '" data-ws-chap="' + ch.no + '"><h3>' + esc(fill(stage.labels.chapterHeading, ch)) + "</h3>" +
          (stage.byCh[ch.no] || []).map(function (c) { return cardHtml(stage, c, idx); }).join("") + "</section>";
      }).join("");
    }).join("");
    var map = books.map(function (b) {
      return "<h3>" + esc(b.title) + '</h3><div class="ws-table"><table><thead><tr><th>课时</th><th>前置（先学）</th><th>后续（学完可学）</th></tr></thead><tbody>' +
        b.chapters.map(function (ch) {
          return stage.order.filter(function (sid) { return stage.sections[sid].ch === ch.no; })
            .map(function (sid) { return mapRowHtml(stage, sid, idx); }).join("");
        }).join("") + "</tbody></table></div>";
    }).join("");
    host.innerHTML =
      '<div class="w-search"><input type="search" id="ws-q" placeholder="' + esc(stage.labels.search) + '" aria-label="搜索方法卡"></div>' +
      '<div class="w-bar" role="toolbar" aria-label="按章筛选">' + pills + "</div>" +
      '<p class="w-stat" id="ws-stat"></p>' +
      '<div id="ws-cards">' + cards + "</div>" +
      '<section id="ws-map"><h2>🕸️ 课时脉络：每一节先学什么、学完能学什么</h2>' + map + "</section>";

    var current = "all";
    function apply() {
      var q = (doc.getElementById("ws-q").value || "").trim().toLowerCase();
      var shown = 0;
      [].forEach.call(host.querySelectorAll("[data-ws-chap]"), function (sec) {
        var chOk = current === "all" || sec.getAttribute("data-ws-chap") === current;
        var any = false;
        [].forEach.call(sec.querySelectorAll("[data-ws-card]"), function (el) {
          var c = stage.byId[el.getAttribute("data-ws-card")];
          var text = (c.title + " " + c.keywords.join(" ") + " " + c.trig + " " + stage.sections[c.sec].name).toLowerCase();
          var ok = chOk && (!q || text.indexOf(q) >= 0);
          el.hidden = !ok;
          if (ok) { any = true; shown++; }
        });
        sec.hidden = !any;
      });
      [].forEach.call(host.querySelectorAll(".ws-book"), function (h) {
        var el = h.nextElementSibling, any = false;
        while (el && el.classList.contains("ws-chap")) { if (!el.hidden) any = true; el = el.nextElementSibling; }
        h.hidden = !any;
      });
      doc.getElementById("ws-stat").textContent = "共 " + stage.cards.length + " 张方法卡，当前显示 " + shown + " 张";
      [].forEach.call(host.querySelectorAll("[data-ws-ch]"), function (b) {
        var on = b.getAttribute("data-ws-ch") === current;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    function flash(el) {
      if (!el) return;
      el.scrollIntoView({ block: "start" });
      el.classList.add("flash");
      win.setTimeout(function () { el.classList.remove("flash"); }, 1600);
    }
    function route() {
      var params = new win.URLSearchParams(win.location.hash.slice(1));
      if (params.get("ch")) { current = params.get("ch"); apply(); flash(doc.getElementById("ch-" + current)); return; }
      if (params.get("card")) { current = "all"; doc.getElementById("ws-q").value = ""; apply(); flash(doc.getElementById("card-" + params.get("card"))); return; }
      if (params.get("map")) { flash(doc.getElementById("map-" + params.get("map"))); return; }
      apply();
    }
    host.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-ws-ch]");
      if (!b) return;
      current = b.getAttribute("data-ws-ch");
      apply();
    });
    doc.getElementById("ws-q").addEventListener("input", apply);
    win.addEventListener("hashchange", route);
    /* 打印 / 存 PDF（A4）：收起的「举个例子」全部展开、筛掉的卡全部显示，打印完恢复原样（PY-229 R2）。
       beforeprint 覆盖浏览器打印；matchMedia("print") 覆盖无头导出 PDF 这类只切换打印媒体的场景。 */
    var printing = false;
    function setPrint(on) {
      if (on === printing) return;
      printing = on;
      [].forEach.call(host.querySelectorAll("details.more"), function (d) {
        if (on && !d.open) { d.setAttribute("data-ws-print-opened", ""); d.open = true; }
        else if (!on && d.hasAttribute("data-ws-print-opened")) { d.removeAttribute("data-ws-print-opened"); d.open = false; }
      });
      [].forEach.call(host.querySelectorAll("[data-ws-card], [data-ws-chap], .ws-book"), function (el) {
        if (on && el.hidden) { el.setAttribute("data-ws-print-shown", ""); el.hidden = false; }
        else if (!on && el.hasAttribute("data-ws-print-shown")) { el.removeAttribute("data-ws-print-shown"); el.hidden = true; }
      });
    }
    win.addEventListener("beforeprint", function () { setPrint(true); });
    win.addEventListener("afterprint", function () { setPrint(false); });
    if (win.matchMedia) {
      var mq = win.matchMedia("print");
      var onMedia = function (e) { setPrint(e.matches); };
      if (mq.addEventListener) mq.addEventListener("change", onMedia); else if (mq.addListener) mq.addListener(onMedia);
      if (mq.matches) setPrint(true);
    }
    route();
    renderMath(win, host);
  }

  function boot(win) {
    var doc = win.document;
    if (!doc || !win.fetch) return;
    function start() {
      var lesson = /\/lessons\//.test(win.location.pathname) && doc.body.getAttribute("data-sec");
      var wikiPage = doc.body.hasAttribute("data-wiki-stage");
      if (!lesson && !wikiPage) return;
      injectStyle(doc);
      load(win, lesson ? "../" : "").then(function (res) {
        if (lesson) setupLesson(win, doc, res[0], res[1]);
        else setupWikiPage(win, doc, res[0], res[1]);
      }).catch(function (err) {
        if (win.console) win.console.warn("wiki-stage:", err.message);
      });
    }
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
    else start();
  }

  return {
    KINDS: KINDS, normalize: normalize, lessonIndex: lessonIndex, chainModel: chainModel,
    chainHtml: chainHtml, validate: validate, boot: boot
  };
});
