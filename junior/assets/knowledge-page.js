/* 独立目录页；hash承载选择，筛选不替学生跳到其他知识点。 */
(function () {
  "use strict";
  var api = window.PeiyuKnowledge;
  var loadHost = document.getElementById("knowledge-load"), layout = document.getElementById("knowledge-layout");
  var search = document.getElementById("knowledge-search"), section = document.getElementById("knowledge-section");
  var domain = document.getElementById("knowledge-domain");
  var enrichment = document.getElementById("knowledge-enrichment"), directory = document.getElementById("knowledge-directory");
  var detail = document.getElementById("knowledge-detail"), list = document.getElementById("knowledge-list");
  var clear = document.getElementById("knowledge-clear"), theme = document.getElementById("knowledge-theme");
  var junior = api.stage === "junior", libraryTitle = junior ? "培玉初中知识库" : "培玉高中知识库";
  var chapter = null;
  var data = null, selected = null;
  if (junior) {
    document.title = libraryTitle;
    document.querySelector(".k-page-intro h1").textContent = libraryTitle;
    document.querySelector(".top .brand").textContent = "培玉 · 初中数学";
    var methodLink = document.querySelector('.top a[href="wiki.html"]');
    if (methodLink) methodLink.remove();
    search.placeholder = "如：有理数、方程、七年级下册";
    document.querySelector('label[for="knowledge-domain"]').textContent = "按册查看";
    document.querySelector('label[for="knowledge-section"]').textContent = "按节查看";
    var field = document.createElement("div");
    field.innerHTML = '<label class="k-field" for="knowledge-chapter">按章查看</label><select id="knowledge-chapter"><option value="all">全部章</option></select>';
    section.parentElement.before(field);
    chapter = document.getElementById("knowledge-chapter");
  }
  function chapterId(id) { return id.split("-")[0]; }
  function bookId(id) { return Number(chapterId(id).slice(1)) <= 6 ? "7a" : "7b"; }
  function bookTitle(id) { return id === "7a" ? "七年级上册" : "七年级下册"; }
  function chapterTitle(s) { return s.chapterTitle || "第 " + chapterId(s.id).slice(1) + " 章"; }
  function juniorSections() { return data.sections.filter(function (s) { return (domain.value === "all" || bookId(s.id) === domain.value) && (chapter.value === "all" || chapterId(s.id) === chapter.value); }); }
  function renderChapters(keepChapter) {
    var ids = [];
    chapter.innerHTML = '<option value="all">全部章</option>' + data.sections.filter(function (s) {
      if ((domain.value !== "all" && bookId(s.id) !== domain.value) || ids.indexOf(chapterId(s.id)) >= 0) return false;
      ids.push(chapterId(s.id)); return true;
    }).map(function (s) { return '<option value="' + esc(chapterId(s.id)) + '">' + esc(chapterTitle(s)) + '</option>'; }).join("");
    if (ids.indexOf(keepChapter) >= 0) chapter.value = keepChapter;
  }
  var from = null;
  document.querySelector(".k-skip").addEventListener("click", function (e) {
    e.preventDefault();
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ block: "start", behavior: "auto" });
  });
  var mobile = window.matchMedia("(max-width: 760px)");
  directory.open = !mobile.matches;
  mobile.addEventListener("change", function () { directory.open = !mobile.matches; });
  theme.addEventListener("click", function () {
    var current = document.documentElement.dataset.theme;
    var dark = current === "dark" || (!current && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "light" : "dark";
    theme.setAttribute("aria-pressed", dark ? "false" : "true");
  });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isSection(id) { return data.sections.some(function (s) { return s.id === id; }); }
  function isDomain(id) { return data.domains.some(function (d) { return d.id === id; }); }
  function isCore(p) { return p.course_scope === "required" || p.course_scope === "selective_required"; }
  function sectionDomains(id) {
    var directDomains = [];
    data.points.forEach(function (p) {
      if (p.first_section === id && directDomains.indexOf(p.domain) < 0) directDomains.push(p.domain);
    });
    if (directDomains.length) return directDomains;
    // 只补课时所属专题；同章只有一个已知专题时可归类，不据此宣称该节已有知识点。
    var chapterPrefix = id.slice(0, id.lastIndexOf("-") + 1), chapterDomains = [];
    data.points.forEach(function (p) {
      if (p.first_section.indexOf(chapterPrefix) === 0 && chapterDomains.indexOf(p.domain) < 0) chapterDomains.push(p.domain);
    });
    return chapterDomains.length === 1 ? chapterDomains : [];
  }
  function renderSections(keepSection) {
    var sections = junior ? juniorSections() : data.sections.filter(function (s) {
      return domain.value === "all" || sectionDomains(s.id).indexOf(domain.value) >= 0;
    });
    section.innerHTML = '<option value="all">全部课时</option>' + sections.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.title) + '</option>'; }).join("");
    if (sections.some(function (s) { return s.id === keepSection; })) section.value = keepSection;
  }
  function syncFiltersFromURL() {
    var query = new URLSearchParams(location.search);
    var requestedSection = query.get("section"), requestedDomain = query.get("domain");
    if (junior) {
      from = isSection(query.get("from")) ? query.get("from") : null;
      if (!isSection(requestedSection)) requestedSection = null;
      var requestedChapter = query.get("chapter");
      var chapterSection = data.sections.find(function (s) { return chapterId(s.id) === requestedChapter; });
      var requestedBook = query.get("book");
      domain.value = requestedSection ? bookId(requestedSection) : (chapterSection ? bookId(chapterSection.id) : (["7a", "7b"].indexOf(requestedBook) >= 0 ? requestedBook : "all"));
      renderChapters(requestedSection ? chapterId(requestedSection) : requestedChapter);
      renderSections(requestedSection);
      return;
    }
    from = isSection(query.get("from")) ? query.get("from") : null;
    if (!isSection(requestedSection)) requestedSection = null;
    if (!isDomain(requestedDomain)) requestedDomain = null;
    var domains = requestedSection ? sectionDomains(requestedSection) : [];
    domain.value = requestedSection ? (requestedDomain && domains.indexOf(requestedDomain) >= 0 ? requestedDomain : (domains.length === 1 ? domains[0] : "all")) : (requestedDomain || "all");
    renderSections(requestedSection);
  }
  function saveFiltersToURL() {
    var url = new URL(location.href);
    if (junior) {
      url.searchParams.delete("domain");
      if (domain.value === "all") url.searchParams.delete("book"); else url.searchParams.set("book", domain.value);
      if (chapter.value === "all") url.searchParams.delete("chapter"); else url.searchParams.set("chapter", chapter.value);
    } else if (domain.value === "all") url.searchParams.delete("domain"); else url.searchParams.set("domain", domain.value);
    if (section.value === "all") url.searchParams.delete("section"); else url.searchParams.set("section", section.value);
    if (!from) url.searchParams.delete("from");
    history.replaceState(null, "", url.href);
  }
  function visiblePoints() {
    var q = search.value.trim().toLowerCase();
    return data.points.filter(function (p) {
      if (!enrichment.checked && !isCore(p)) return false;
      if (junior) {
        if (domain.value !== "all" && bookId(p.first_section) !== domain.value) return false;
        if (chapter.value !== "all" && chapterId(p.first_section) !== chapter.value) return false;
      } else if (domain.value !== "all" && p.domain !== domain.value) return false;
      if (section.value !== "all" && p.first_section !== section.value) return false;
      var text = [p.title, p.group, p.definition].concat(p.conditions, p.misconceptions.map(function (m) { return m.error + " " + m.correction; })).join(" ").toLowerCase();
      if (junior) {
        var s = data.sections.find(function (s) { return s.id === p.first_section; });
        text += " " + bookTitle(bookId(s.id)) + " " + chapterTitle(s) + " " + s.title;
      }
      return !q || text.toLowerCase().indexOf(q) >= 0;
    });
  }
  function renderList() {
    if (!data) return;
    var points = visiblePoints(), lastGroup = null;
    var labels = { untouched: "", viewed: "已查看", passed: "自测通过", review: "建议再练" };
    var emptySection = section.value !== "all" && !data.points.some(function (p) { return p.first_section === section.value; });
    var emptyMessage = emptySection ? '<p class="k-empty">本节知识点正在整理，可以先<a href="lessons/' + esc(section.value) + '.html#step2">回到课时讲解</a>。</p>' : '<p class="k-empty">没有找到匹配项。可以换个词、切换专题或课时，或显示选学与拓展。</p>';
    list.innerHTML = junior ? renderJuniorList(points, labels, emptyMessage) : points.map(function (p) {
      var groupKey = p.domain + "/" + p.group;
      var d = data.domains.find(function (item) { return item.id === p.domain; });
      var groupTitle = domain.value === "all" && data.domains.length > 1 ? (d ? d.title + " / " : "") + p.group : p.group;
      var heading = groupKey !== lastGroup ? '<h3 class="k-list-group">' + esc(groupTitle) + '</h3>' : ""; lastGroup = groupKey;
      var status = api.getStatus(p.id);
      return heading + '<a class="k-nav-link" href="' + esc(api.pointHref(p.id, from)) + '" data-kpoint-link="' + esc(p.id) + '"' + (p.id === selected ? ' aria-current="true"' : "") + '><span class="k-nav-name">' + esc(p.title) + '</span><span class="k-nav-state ' + status + '">' + labels[status] + '</span></a>';
    }).join("") || emptyMessage;
    document.getElementById("knowledge-count").textContent = points.length + " / " + data.points.length + (emptySection ? " · 本节待整理" : "");
    document.getElementById("knowledge-list-hint").textContent = selected && !points.some(function (p) { return p.id === selected; }) ? "当前详情不在筛选结果中，仍为你保留。" : "选一个点，先看条件再试一道题。";
    clear.hidden = !search.value;
  }
  function renderJuniorList(points, labels, emptyMessage) {
    function links(items) {
      return items.map(function (p) {
        var status = api.getStatus(p.id);
        return '<a class="k-nav-link" href="' + esc(api.pointHref(p.id, from)) + '" data-kpoint-link="' + esc(p.id) + '"' + (p.id === selected ? ' aria-current="true"' : "") + '><span class="k-nav-name">' + esc(p.title) + (p.course_scope === "optional" ? ' <span class="k-scope">选学</span>' : "") + '</span><span class="k-nav-state ' + status + '">' + labels[status] + '</span></a>';
      }).join("");
    }
    var books = [];
    data.sections.forEach(function (s) {
      var items = points.filter(function (p) { return p.first_section === s.id; });
      if (!items.length) return;
      var bid = bookId(s.id), cid = chapterId(s.id);
      var b = books.find(function (b) { return b.id === bid; });
      if (!b) { b = { id: bid, chapters: [] }; books.push(b); }
      var c = b.chapters.find(function (c) { return c.id === cid; });
      if (!c) { c = { id: cid, title: chapterTitle(s), html: "" }; b.chapters.push(c); }
      var extra = items.filter(function (p) { return !isCore(p); });
      c.html += '<section class="k-junior-section"><h3 class="k-list-group">' + esc(s.title) + '</h3>' + links(items.filter(isCore)) + (extra.length ? '<details class="k-junior-optional"' + (extra.some(function (p) { return p.id === selected; }) ? ' open' : '') + '><summary>选学与拓展 · 可以先跳过</summary>' + links(extra) + '</details>' : '') + '</section>';
    });
    return books.map(function (b) { return '<details class="k-junior-book" open><summary>' + bookTitle(b.id) + '</summary>' + b.chapters.map(function (c) { return '<details class="k-junior-chapter" open><summary>' + esc(c.title) + '</summary>' + c.html + '</details>'; }).join("") + '</details>'; }).join("") || emptyMessage;
  }
  function hashPoint() {
    var m = /^#point=([^&]+)$/.exec(location.hash);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return null; }
  }
  function navigate(id) {
    if (!data.points.some(function (p) { return p.id === id; })) return;
    if (id !== selected) { location.hash = "point=" + encodeURIComponent(id); }
    else showPoint(true);
  }
  function showPoint(focus) {
    if (!data) return;
    var requested = hashPoint();
    if (!requested && !location.hash) {
      var candidates = data.points.filter(function (p) { return (section.value === "all" || p.first_section === section.value) && (domain.value === "all" || (junior ? bookId(p.first_section) === domain.value : p.domain === domain.value)) && (!junior || chapter.value === "all" || chapterId(p.first_section) === chapter.value); });
      var preferred = section.value === "all" && candidates.find(function (p) { return p.id === "pyhs.set.012" && isCore(p); });
      var initial = preferred || candidates.find(isCore) || (!junior && candidates[0]);
      requested = initial ? initial.id : null;
      if (requested) { var defaultURL = new URL(location.href); defaultURL.hash = "point=" + requested; history.replaceState(null, "", defaultURL.href); }
    }
    var point = data.points.find(function (p) { return p.id === requested; });
    selected = requested;
    if (point) {
      if (junior && !isCore(point)) enrichment.checked = true;
      api.renderPoint(detail, point.id, { onNavigate: navigate, contextSection: from });
      document.title = point.title + " · " + libraryTitle;
    } else if (junior && !location.hash && section.value !== "all" && data.points.some(function (p) { return p.first_section === section.value; })) {
      api.renderPoint(detail, null, {});
      document.title = "本节选学知识点 · " + libraryTitle;
      detail.innerHTML = '<div class="k-point"><h2>本节有选学知识点</h2><p>可以勾选「同时看选学与拓展」后从目录打开，也可以先回课时学习。</p></div>';
    } else if (!location.hash && section.value !== "all") {
      api.renderPoint(detail, null, {});
      document.title = "本节知识点正在整理 · " + libraryTitle;
      detail.innerHTML = '<div class="k-point"><h2>本节知识点正在整理</h2><p>可以先<a href="lessons/' + esc(section.value) + '.html#step2">回到课时讲解</a>，或从其他专题中查找。</p></div>';
    } else {
      api.renderPoint(detail, requested, {});
      document.title = "未找到知识点 · " + libraryTitle;
      detail.innerHTML = junior ? '<div class="k-point"><h2>请从目录选择知识点</h2><p>可以按册、章、节浏览，也可以搜索。</p></div>' : '<div class="k-point"><h2>未找到这个知识点</h2><p>可以从目录选择，或<a href="' + esc(api.pointHref("pyhs.set.012", from)) + '">先看全集与补集</a>。</p></div>';
    }
    renderList();
    if (mobile.matches) directory.open = false;
    if (focus) { detail.focus({ preventScroll: true }); detail.scrollIntoView({ block: "start", behavior: "auto" }); }
  }
  function boot() {
    loadHost.hidden = false; layout.hidden = true;
    document.getElementById("knowledge-coverage").hidden = true;
    loadHost.innerHTML = "<p>正在打开知识笔记…</p>";
    api.load().then(function (result) {
      data = result;
      if (data.unavailable || !data.points.length) {
        loadHost.textContent = "初中知识库正在整理，可以先回课程首页。";
        return;
      }
      var coverage = document.getElementById("knowledge-coverage");
      coverage.textContent = "当前收录 " + data.domains.length + " 个专题、" + data.points.length + " 个知识点。";
      coverage.hidden = false;
      domain.innerHTML = junior ? '<option value="all">全部册</option><option value="7a">七年级上册</option><option value="7b">七年级下册</option>' : '<option value="all">全部专题</option>' + data.domains.map(function (d) { return '<option value="' + esc(d.id) + '">' + esc(d.title) + '</option>'; }).join("");
      syncFiltersFromURL();
      loadHost.hidden = true; layout.hidden = false; showPoint(false);
    }).catch(function () {
      loadHost.innerHTML = '<div class="card"><p>知识库暂时没打开。请检查连接后重试。</p><button type="button" class="btn" id="knowledge-retry">重新加载</button><p><a href="index.html">也可以先回课程首页</a></p></div>';
      document.getElementById("knowledge-retry").addEventListener("click", boot);
    });
  }
  list.addEventListener("click", function (e) {
    var link = e.target.closest("[data-kpoint-link]");
    if (!link || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); navigate(link.getAttribute("data-kpoint-link"));
  });
  search.addEventListener("input", renderList);
  domain.addEventListener("change", function () { if (junior) renderChapters(chapter.value); renderSections(section.value); saveFiltersToURL(); renderList(); });
  if (chapter) chapter.addEventListener("change", function () { renderSections(section.value); saveFiltersToURL(); renderList(); });
  section.addEventListener("change", function () { saveFiltersToURL(); renderList(); });
  enrichment.addEventListener("change", renderList);
  clear.addEventListener("click", function () { search.value = ""; renderList(); search.focus(); });
  window.addEventListener("hashchange", function () { if (data) { syncFiltersFromURL(); showPoint(true); } });
  window.addEventListener("popstate", function () { if (data) { syncFiltersFromURL(); showPoint(true); } });
  window.addEventListener("peiyu-knowledge-change", renderList);
  boot();
})();
