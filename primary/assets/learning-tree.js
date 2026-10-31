/* Student knowledge directory. Point content remains owned by knowledge-core.js. */
(function () {
  "use strict";
  if (document.body.dataset.learningPage !== "knowledge") return;
  var host = document.getElementById("learning-app");
  var source = window.PeiyuLearningData;
  var core = window.PeiyuKnowledge;
  if (!host || !source || !core) return;
  var junior = document.body.dataset.stage === "junior";
  var primary = document.body.dataset.stage === "primary";
  var byBook = junior || primary;
  var stageName = primary ? "小学" : junior ? "初中" : "高中";
  var currentBook = "";

  var data, index, points = [], domains = [], lessons = [], variants = [], selectedVariant = "";
  var selected = null, currentDomain = "all", currentSection = "all", query = "", includeExtra = false;
  var context = {}, viewConditions = false, search, domainSelect, sectionSelect, extra, tree, directory, detail, resultCount;
  var expanded = new Set();
  var narrow = window.matchMedia("(max-width: 760px)");
  var priority = ["sets", "functions", "probability-statistics"];
  var scopeNames = { required: "必修", selective_required: "选必", optional: "选学", enrichment: "拓展" };
  var esc = function (text) { return source.escape(text); };

  function url(path) { return new URL(source.url(path), location.href); }
  function lesson(id) { return lessons.find(function (item) { return item.id === id; }); }
  function point(id) { return points.find(function (item) { return item.id === id; }); }
  function domain(id) { return domains.find(function (item) { return item.id === id; }); }
  function meta(id) { return index.points.find(function (item) { return item.id === id; }); }
  function corePoint(p) { return p.course_scope === "required" || p.course_scope === "selective_required"; }
  function lessonIds(p) { var item = meta(p.id); return item && Array.isArray(item.lessonIds) ? item.lessonIds : [p.first_section]; }
  function practiceVariant(id) {
    return point(id) && variants.find(function (item) { return item.id === selectedVariant && item.point_id === id; });
  }
  function withContext(target) {
    ["from", "step", "question"].forEach(function (key) {
      target.searchParams.delete(key);
      if (context[key]) target.searchParams.set(key, context[key]);
    });
    return target;
  }
  function pointURL(id) {
    var target = withContext(url("knowledge.html"));
    if (currentBook) target.searchParams.set("book", currentBook);
    if (currentDomain !== "all") target.searchParams.set("domain", currentDomain);
    if (currentSection !== "all") target.searchParams.set("section", currentSection);
    if (query) target.searchParams.set("q", query);
    if (includeExtra) target.searchParams.set("scope", "all");
    else if (primary) target.searchParams.set("scope", "core");
    if (practiceVariant(id)) target.searchParams.set("variant", selectedVariant);
    if (id) target.hash = "point=" + encodeURIComponent(id);
    return target;
  }
  function domainURL(id) {
    var target = withContext(url("knowledge.html"));
    if (id !== "all") target.searchParams.set("domain", id);
    if (includeExtra) target.searchParams.set("scope", "all");
    else if (primary) target.searchParams.set("scope", "core");
    return target;
  }
  function practiceURL(id, section) {
    if (junior && id) return pointURL(id);
    var target = withContext(url("practice.html"));
    if (id) target.searchParams.set("point", id);
    else if (section) target.searchParams.set("section", section);
    if (practiceVariant(id)) target.searchParams.set("variant", selectedVariant);
    return target;
  }
  function returnURL(fallback, fallbackStep) {
    var id = context.from || fallback;
    if (!lesson(id)) return url("courses.html");
    var target = url("lessons/" + id + ".html");
    var step = context.from ? context.step || "2" : String(fallbackStep || 2);
    if (context.from && context.question) target.searchParams.set("focus", context.question);
    target.hash = "step" + step;
    return target;
  }
  function requestedPoint() {
    if (location.hash.indexOf("#point=") !== 0) return null;
    return new URLSearchParams(location.hash.slice(1)).get("point");
  }
  function readURL() {
    var params = new URLSearchParams(location.search);
    var requestedBook = params.get("book") || (primary && /^[1-6]$/.test(params.get("grade") || "") ? "p" + params.get("grade") + "a" : "");
    if (primary && /^[1-6][ab]$/.test(requestedBook)) requestedBook = "p" + requestedBook;
    currentBook = primary && lessons.some(function (item) { return item.bookId === requestedBook; }) ? requestedBook : "";
    currentDomain = domain(params.get("domain")) ? params.get("domain") : "all";
    currentSection = lesson(params.get("section")) ? params.get("section") : "all";
    query = (params.get("q") || "").slice(0, 200);
    viewConditions = params.get("focus") === "conditions";
    selected = requestedPoint();
    selectedVariant = params.get("variant") || "";
    if (!/^[a-z0-9-]{1,100}$/.test(selectedVariant) || !practiceVariant(selected)) selectedVariant = "";
    var chosen = point(selected);
    includeExtra = (primary ? params.get("scope") !== "core" : params.get("scope") === "all") || !!(chosen && !corePoint(chosen));
    context = {};
    if (lesson(params.get("from"))) {
      context.from = params.get("from");
      context.step = /^[1-5]$/.test(params.get("step") || "") ? params.get("step") : "2";
      var question = params.get("question") || "";
      if (/^[a-zA-Z0-9_.:-]{1,100}$/.test(question)) context.question = question;
    }
  }
  function matches(p, options) {
    options = options || {};
    if (currentBook && !lessonIds(p).some(function (id) { return lesson(id) && lesson(id).bookId === currentBook; })) return false;
    if (!includeExtra && !corePoint(p)) return false;
    if (!options.ignoreDomain && currentDomain !== "all" && p.domain !== currentDomain) return false;
    if (currentSection !== "all" && lessonIds(p).indexOf(currentSection) < 0) return false;
    if (!query) return true;
    var text = [p.title, p.group, p.definition, p.id].concat(p.conditions || []).concat((p.misconceptions || []).map(function (item) { return item.error + " " + item.correction; })).join(" ").toLocaleLowerCase();
    return text.indexOf(query.toLocaleLowerCase().trim()) >= 0;
  }
  function visiblePoints() { return points.filter(function (p) { return matches(p); }); }
  function groups(items) {
    var result = [];
    items.forEach(function (p) {
      var found = result.find(function (group) { return group.title === p.group; });
      if (!found) { found = { title: p.group, points: [] }; result.push(found); }
      found.points.push(p);
    });
    return result;
  }
  function linkHTML(p) {
    return '<a class="lt-point-link" data-learning-point="' + esc(p.id) + '" href="' + esc(pointURL(p.id).href) + '"' + (selected === p.id ? ' aria-current="page"' : "") + '><span>' + esc(p.title) + '</span>' + (!corePoint(p) ? '<small>' + esc(scopeNames[p.course_scope] || "拓展") + '</small>' : "") + '</a>';
  }
  function syncInputs() {
    search.value = query;
    domainSelect.value = currentDomain;
    sectionSelect.value = currentSection;
    extra.checked = includeExtra;
    document.getElementById("learning-tree-clear").hidden = !query;
  }
  function renderTree() {
    var visible = visiblePoints(), chosen = point(selected);
    var html = domains.map(function (d) {
      var members = visible.filter(function (p) { return p.domain === d.id; });
      if (!members.length) return "";
      var domainKey = "domain:" + d.id;
      var open = expanded.has(domainKey) || currentDomain === d.id || !!query || !!(chosen && chosen.domain === d.id);
      return '<details class="lt-topic" data-tree-branch="' + esc(domainKey) + '"' + (open ? " open" : "") + '><summary><span>' + esc(d.title) + '</span><small>' + members.length + '</small></summary><div class="lt-groups">' + groups(members).map(function (group) {
        var groupKey = d.id + ":" + group.title;
        var groupOpen = expanded.has(groupKey) || !!query || !!(chosen && chosen.domain === d.id && chosen.group === group.title);
        return '<details class="lt-group" data-tree-branch="' + esc(groupKey) + '"' + (groupOpen ? " open" : "") + '><summary><span>' + esc(group.title) + '</span><small>' + group.points.length + '</small></summary><div class="lt-points">' + group.points.map(linkHTML).join("") + '</div></details>';
      }).join("") + '</div></details>';
    }).join("");
    if (byBook) html = juniorBranches(visible);
    tree.innerHTML = html || '<p class="lt-empty">没有匹配的知识点。试试更短的关键词，或调整课时与范围。</p><button class="lt-text-button" type="button" data-clear-filters>清除筛选</button>';
    resultCount.textContent = visible.length + " 个知识点";
    tree.querySelectorAll("[data-tree-branch]").forEach(function (branch) {
      branch.addEventListener("toggle", function () {
        if (branch.open) expanded.add(branch.dataset.treeBranch);
        else expanded.delete(branch.dataset.treeBranch);
      });
    });
    var hint = document.getElementById("learning-tree-hint");
    hint.textContent = chosen && !matches(chosen) ? "当前链接的知识点在筛选范围之外，详情仍保留。" : byBook ? "按册、章、节展开，选择一个知识点。" : "展开专题和分组，选择一个知识点。";
  }
  function juniorBranches(visible) {
    var books = [];
    lessons.forEach(function (item) { if (!books.includes(item.bookId)) books.push(item.bookId); });
    return books.map(function (bookId) {
      var bookLessons = lessons.filter(function (item) { return item.bookId === bookId; });
      var chapters = [];
      bookLessons.forEach(function (item) { if (!chapters.includes(item.chapterId)) chapters.push(item.chapterId); });
      var content = chapters.map(function (chapterId) {
        var sections = bookLessons.filter(function (item) { return item.chapterId === chapterId; });
        var rows = sections.map(function (item) {
          var members = visible.filter(function (p) { return lessonIds(p).includes(item.id); });
          if (!members.length) return "";
          var chosen = members.some(function (p) { return p.id === selected; });
          var optional = members.every(function (p) { return p.course_scope === "optional"; });
          return '<details class="lt-group" data-junior-section="' + esc(item.id) + '"' + (chosen || (!optional && (query || currentSection === item.id)) ? ' open' : '') + '><summary>' + esc(item.title) + (optional && !item.title.includes("选学") ? '（选学）' : '') + '</summary><div class="lt-points">' + members.map(linkHTML).join("") + '</div></details>';
        }).join("");
        return rows ? '<details class="lt-group" data-junior-chapter="' + esc(chapterId) + '" open><summary>' + esc(sections[0].chapterTitle) + '</summary>' + rows + '</details>' : "";
      }).join("");
      return content ? '<details class="lt-topic" data-junior-book="' + esc(bookId) + '" open><summary>' + esc(bookLessons[0].bookTitle) + '</summary><div class="lt-groups">' + content + '</div></details>' : "";
    }).join("");
  }
  function topicCard(d, members) {
    var names = groups(members).map(function (group) { return group.title; });
    return '<article class="lt-topic-card"><h3><a data-learning-domain="' + esc(d.id) + '" href="' + esc(domainURL(d.id).href) + '">' + esc(d.title) + '</a></h3><p>' + esc(names.slice(0, 4).join("、")) + (names.length > 4 ? "等" : "") + '</p><span>' + members.length + ' 个知识点</span></article>';
  }
  function renderOverview() {
    if (byBook) {
      var juniorVisible = visiblePoints();
      detail.innerHTML = '<section class="lt-overview"><h2>' + (query ? '查找知识点' : '按册、章、节查知识点') + '</h2><p>' + (query ? '找到 ' + juniorVisible.length + ' 个匹配的知识点。' : (primary ? '已收录的知识点按册列出，选学与拓展可以按需跳过。' : '必学内容默认显示，选学与拓展按需打开。')) + '</p>' + (juniorBranches(juniorVisible) || '<p>已收录的知识点中没有匹配结果。可以换个关键词，或清除筛选后查找。</p><button class="lt-text-button" type="button" data-clear-filters>清除筛选</button>') + '</section>';
      document.title = "知识库 · 培玉" + stageName + "数学";
      return;
    }
    var visible = visiblePoints(), chosenDomain = domain(currentDomain), chosenLesson = lesson(currentSection);
    var filtered = !!(chosenDomain || chosenLesson || query);
    var title = query ? "查找知识点" : chosenLesson ? chosenLesson.title + "的知识点" : chosenDomain ? chosenDomain.title : "从一个专题开始";
    var intro = filtered ? "选择知识点，先确认使用条件，再看容易混淆的地方。" : "先看它属于哪里，再把相近的概念分清。必修与选必默认显示，选学与拓展可以按需打开。";
    var html = '<section class="lt-overview" aria-labelledby="learning-overview-heading"><h2 id="learning-overview-heading">' + esc(title) + '</h2><p class="lt-overview-intro">' + esc(intro) + '</p>';
    if (!visible.length) {
      html += '<div class="lt-empty-state"><h3>这里暂时没有匹配的知识点</h3><p>可以清除关键词或课时筛选，继续按专题查找。</p><button class="lt-text-button" type="button" data-clear-filters>清除筛选</button>' + (chosenLesson ? '<a href="' + esc(returnURL(chosenLesson.id, 2).href) + '">打开课时讲解</a>' : "") + '</div>';
    } else if (filtered) {
      domains.forEach(function (d) {
        var members = visible.filter(function (p) { return p.domain === d.id; });
        if (!members.length) return;
        html += '<section class="lt-overview-domain">' + (chosenDomain && !chosenLesson && !query ? "" : '<h3>' + esc(d.title) + '</h3>') + groups(members).map(function (group) {
          return '<details class="lt-overview-group"' + (query || chosenLesson ? " open" : "") + '><summary>' + esc(group.title) + '<span>' + group.points.length + ' 个知识点</span></summary><div>' + group.points.map(linkHTML).join("") + '</div></details>';
        }).join("") + '</section>';
      });
    } else {
      var primary = domains.filter(function (d) { return priority.indexOf(d.id) >= 0; });
      var others = domains.filter(function (d) { return priority.indexOf(d.id) < 0; });
      html += '<div class="lt-primary-topics">' + primary.map(function (d) { return topicCard(d, visible.filter(function (p) { return p.domain === d.id; })); }).join("") + '</div>';
      html += '<section class="lt-more-topics"><h3>其他专题</h3><div class="lt-topic-list">' + others.map(function (d) {
        var members = visible.filter(function (p) { return p.domain === d.id; });
        return members.length ? '<a data-learning-domain="' + esc(d.id) + '" href="' + esc(domainURL(d.id).href) + '"><span>' + esc(d.title) + '</span><small>' + members.length + '</small></a>' : "";
      }).join("") + '</div></section>';
    }
    html += '</section>';
    detail.innerHTML = html;
    document.title = (filtered ? title : "知识库") + " · 培玉高中数学";
    core.renderMath(detail);
  }
  function patchDetailLinks(p) {
    detail.querySelectorAll("a[href]").forEach(function (anchor) {
      var target = new URL(anchor.href, location.href);
      if (target.origin !== location.origin) return;
      if (anchor.dataset.knavigate) target = pointURL(anchor.dataset.knavigate);
      else target = withContext(target);
      anchor.href = target.href;
    });
    var footer = detail.querySelector(".k-lesson-links");
    if (footer) {
      var returnLesson = lesson(context.from || p.first_section);
      var label = context.from ? (context.question ? "回到原题" : "回到原课时第 " + context.step + " 步") : "回课时讲解";
      footer.innerHTML = '<a class="btn ghost" href="' + esc(returnURL(p.first_section, 2).href) + '"' + (returnLesson ? ' title="' + esc(returnLesson.title) + '"' : "") + '>' + esc(label) + '</a><a class="btn" href="' + esc(practiceURL(p.id, p.first_section).href) + '">练这个知识点</a>';
    }
  }
  function renderDetail(focus) {
    var chosen = point(selected);
    if (!selected) { core.renderPoint(detail, null, {}); renderOverview(); }
    else if (!chosen) {
      core.renderPoint(detail, null, {});
      detail.innerHTML = '<section class="lt-empty-state"><h2>没有找到这个知识点</h2><p>可以从专题目录重新选择，或回到专题总览。</p><a href="' + esc(pointURL(null).href) + '" data-learning-overview>回到专题总览</a></section>';
      document.title = "未找到知识点 · 培玉" + stageName + "数学";
    } else {
      core.renderPoint(detail, chosen.id, { contextSection: context.from || currentSection, onNavigate: navigate });
      patchDetailLinks(chosen);
      var back = document.createElement("a");
      back.className = "lt-back";
      back.href = pointURL(null).href;
      back.dataset.learningOverview = "";
      back.textContent = "回到专题总览";
      detail.prepend(back);
      document.title = chosen.title + " · 培玉" + stageName + "知识库";
    }
    renderTree();
    renderContext();
    if (selected && narrow.matches) directory.open = false;
    var conditions = chosen && viewConditions && detail.querySelector(".k-conditions");
    if (conditions) {
      conditions.tabIndex = -1;
      conditions.focus({ preventScroll: true });
      conditions.scrollIntoView({ block: "start", behavior: "auto" });
    } else if (focus) { detail.focus({ preventScroll: true }); detail.scrollIntoView({ block: "start", behavior: "auto" }); }
  }
  function renderContext() {
    var node = document.getElementById("learning-tree-context"), original = lesson(context.from);
    var variant = practiceVariant(selected);
    node.hidden = !original && !variant;
    node.innerHTML = original ? '<span>来自「' + esc(original.title) + '」第 ' + esc(context.step) + ' 步</span><a href="' + esc(returnURL(original.id, 2).href) + '">' + (context.question ? "回到原题" : "回到原课时") + '</a>' : "";
    if (junior && original && !points.some(function (p) { return lessonIds(p).includes(original.id); })) node.innerHTML += '<p>本课知识点正在整理，可以查找已收录的前置知识点。</p>';
    if (variant) node.innerHTML += '<a href="' + esc(practiceURL(selected).href) + '">回到刚才的练习</a>';
  }
  function updateURL(push) {
    var target = pointURL(selected);
    if (target.href !== location.href) history[push ? "pushState" : "replaceState"](null, "", target.href);
  }
  function navigate(id) {
    if (!point(id)) return;
    if (!practiceVariant(id)) selectedVariant = "";
    selected = id;
    viewConditions = false;
    if (!corePoint(point(id))) includeExtra = true;
    syncInputs(); updateURL(true); renderDetail(true);
  }
  function filterChanged(push) {
    if (selected && (!point(selected) || !matches(point(selected)))) selected = null;
    if (!practiceVariant(selected)) selectedVariant = "";
    syncInputs(); updateURL(push); renderDetail(false);
  }
  function chooseDomain(id) {
    currentDomain = domain(id) ? id : "all";
    currentSection = "all"; query = "";
    if (selected && point(selected) && point(selected).domain !== currentDomain) selected = null;
    filterChanged(true);
    if (narrow.matches) directory.open = false;
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ block: "start", behavior: "auto" });
  }
  function clearFilters() {
    currentDomain = "all"; currentSection = "all"; query = "";
    filterChanged(true);
    search.focus();
  }
  function renderPage() {
    host.innerHTML = '<div class="lt-page"><header class="lt-heading"><h1>知识库</h1><p>' + (byBook ? '按册、章、节查找，带着条件回到题目。' : '按专题找知识点，带着条件回到题目。') + '</p></header><div class="lt-context" id="learning-tree-context" hidden></div><div class="lt-layout"><aside class="lt-sidebar" aria-label="知识点目录与筛选"><div class="lt-filters"><label for="learning-tree-search">查找知识点</label><div class="lt-search-row"><input id="learning-tree-search" type="search" placeholder="输入概念、条件或知识点名称" maxlength="200" autocomplete="off"><button id="learning-tree-clear" class="lt-text-button" type="button" hidden>清除</button></div><div class="lt-selects"><div><label for="learning-tree-domain">专题</label><select id="learning-tree-domain"><option value="all">全部专题</option>' + domains.map(function (d) { return '<option value="' + esc(d.id) + '">' + esc(d.title) + '</option>'; }).join("") + '</select></div><div><label for="learning-tree-section">课时</label><select id="learning-tree-section"><option value="all">全部课时</option>' + lessons.map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.title) + '</option>'; }).join("") + '</select></div></div><label class="lt-check"><input id="learning-tree-extra" type="checkbox">显示选学与拓展</label></div><details id="learning-tree-directory" class="lt-directory"><summary>专题目录 <span id="learning-tree-count" aria-live="polite"></span></summary><p id="learning-tree-hint" class="lt-hint"></p><nav id="learning-tree" aria-label="专题、分组与知识点"></nav></details></aside><div id="learning-tree-detail" class="lt-detail" tabindex="-1"></div></div></div>';
    search = document.getElementById("learning-tree-search");
    domainSelect = document.getElementById("learning-tree-domain");
    sectionSelect = document.getElementById("learning-tree-section");
    extra = document.getElementById("learning-tree-extra");
    directory = document.getElementById("learning-tree-directory");
    tree = document.getElementById("learning-tree");
    detail = document.getElementById("learning-tree-detail");
    resultCount = document.getElementById("learning-tree-count");
    directory.open = !narrow.matches;
    syncInputs(); renderContext(); renderDetail(false);
    search.addEventListener("input", function () { query = search.value; filterChanged(false); if (query) directory.open = true; });
    domainSelect.addEventListener("change", function () {
      currentDomain = domainSelect.value;
      if (currentSection !== "all" && !points.some(function (p) { return (currentDomain === "all" || p.domain === currentDomain) && lessonIds(p).indexOf(currentSection) >= 0; })) currentSection = "all";
      filterChanged(true);
    });
    sectionSelect.addEventListener("change", function () { currentSection = sectionSelect.value; filterChanged(true); });
    extra.addEventListener("change", function () { includeExtra = extra.checked; filterChanged(true); });
    document.getElementById("learning-tree-clear").addEventListener("click", function () { query = ""; filterChanged(false); search.focus(); });
    host.addEventListener("click", function (event) {
      var target = event.target.closest("a, button");
      if (!target || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (target.hasAttribute("data-learning-point")) { event.preventDefault(); navigate(target.dataset.learningPoint); }
      else if (target.hasAttribute("data-learning-domain")) { event.preventDefault(); chooseDomain(target.dataset.learningDomain); }
      else if (target.hasAttribute("data-learning-overview")) { event.preventDefault(); selected = null; selectedVariant = ""; updateURL(true); renderDetail(true); }
      else if (target.hasAttribute("data-clear-filters")) { event.preventDefault(); clearFilters(); }
    });
  }
  // Primary uses the PY-222 admitted books/units and the same practice identities.
  // Only the selected unit is mounted; no quiz or answer is duplicated in this directory.
  var primaryConcepts, primaryCardUnits = new Set(), lastViewedUnit = "";
  function primarySelection() {
    var params = new URLSearchParams(location.search), hash = new URLSearchParams(location.hash.slice(1));
    var chosen = point(hash.get("point"));
    var legacy = primaryConcepts.cards.find(function (c) { return c.id === hash.get("card"); });
    var requested = lesson(params.get("section")), from = lesson(params.get("from"));
    var units = index.units || [], snap = window.PeiyuLearningState.snapshot();
    var evidence = [snap.resume].concat(snap.events || [], (snap.questions || []).map(function (q) { return q.lastAnswer; }))
      .filter(Boolean).sort(function (a, b) { return b.time - a.time; });
    var recent = evidence.map(function (e) { return lesson(e.sectionId) || lesson((e.sectionId || "").replace(/-test$/, "")); }).find(Boolean);
    var book = params.get("book") || "";
    if (/^[1-6][ab]$/.test(book)) book = "p" + book;
    var unit = units.find(function (u) { return u.id === (legacy ? legacy.unitId : chosen ? chosen.first_section.replace(/-\d+$/, "") : params.get("unit")); });
    if (!unit && requested) unit = units.find(function (u) { return u.id === requested.unitId; });
    var grade = Number((params.get("grade") || "").replace(/^g/, "")) || (unit && unit.grade) || (lesson(book + "-u1") || {}).grade || (from || recent || {}).grade || 1;
    if (!book) book = unit ? unit.bookId : params.get("grade") ? "p" + grade + "a" : (from || recent || {}).bookId || "p" + grade + "a";
    if (!unit && !params.get("book") && !params.get("grade") && !params.get("unit") && (from || recent)) unit = units.find(function (u) { return u.id === (from || recent).unitId; });
    if (!unit) unit = units.find(function (u) { return u.bookId === book && primaryCardUnits.has(u.id); }) || units.find(function (u) { return u.bookId === book; });
    if (!unit) unit = units.find(function (u) { return u.grade === grade; }) || units[0];
    return { unit: unit, section: requested && requested.unitId === unit.id && !requested.isUnit ? requested.id : "", point: chosen, card: legacy };
  }
  function primaryHref(unitId, pointId) {
    var target = new URL(location.href), unit = lesson(unitId);
    ["section", "q", "variant"].forEach(function (key) { target.searchParams.delete(key); });
    target.searchParams.set("unit", unitId); target.searchParams.set("book", unit.bookId);
    target.searchParams.set("grade", String(unit.grade)); target.hash = pointId ? "point=" + encodeURIComponent(pointId) : "";
    return target.href;
  }
  function primaryPointCard(p) {
    var list = function (items) { return '<ul>' + items.map(function (v) { return '<li>' + esc(v) + '</li>'; }).join("") + '</ul>'; };
    return '<article class="cc-card pk-card" id="point-' + esc(p.id) + '" data-primary-point="' + esc(p.id) + '" data-learning-point-card="' + esc(p.id) + '">'
      + '<h2><a data-learning-point="' + esc(p.id) + '" href="' + esc(primaryHref(p.first_section.replace(/-\d+$/, ""), p.id)) + '">' + esc(p.title) + '</a></h2>'
      + (!corePoint(p) ? '<p class="k-optional" data-primary-optional>这是' + (p.course_scope === 'optional' ? '选学' : '拓展') + '内容，可以先跳过。</p>' : '')
      + '<p>' + esc(p.definition) + '</p><h3>要点</h3>' + list(p.conditions)
      + (p.prerequisites.length ? '<h3>先想起这些知识</h3><div class="k-links">' + p.prerequisites.map(function (id) {
        var before = point(id); return before ? '<a data-learning-point="' + esc(id) + '" href="' + esc(primaryHref(before.first_section.replace(/-\d+$/, ""), id)) + '">' + esc(before.title) + '</a>' : '';
      }).join("") + '</div>' : '')
      + (p.prerequisite_notes.length ? '<div class="pk-note">' + list(p.prerequisite_notes.map(function (line) { return line.replace(/pyps\.[a-z0-9]+\.u[0-9]+(?:\.[0-9]+)?\s*/g, ""); })) + '</div>' : '')
      + '<details class="cc-answer"><summary>易错提醒</summary>' + p.misconceptions.map(function (m) { return '<p><b>容易这样想：</b>' + esc(m.error) + '</p><p><b>换个想法：</b>' + esc(m.correction) + '</p>'; }).join("") + '</details>'
      + '<details class="cc-answer" data-primary-outcomes><summary>学完可以做什么</summary>' + list(p.outcomes) + '</details>'
      + '<details class="cc-answer" data-primary-boundary><summary>学习范围与可用方法</summary><h3>可以这样做</h3>' + list(p.boundary.allowed) + '<h3>这里不默认要求</h3>' + list(p.boundary.not_assumed) + '</details>'
      + '<nav class="cc-links"><a class="btn" data-primary-practice="' + esc(p.id) + '" href="' + esc(practiceURL(p.id, p.first_section).href) + '">做这个点的题</a><a href="' + esc(returnURL(p.first_section, 2).href) + '">回到课时</a></nav></article>';
  }
  function renderPrimaryPage(focus) {
    var selection = primarySelection(), unit = selection.unit, units = index.units || [];
    var params = new URLSearchParams(location.search);
    selectedVariant = params.get("variant") || "";
    if (lastViewedUnit !== unit.id) {
      window.PeiyuLearningState.record({ kind: "view", source: "knowledge", sectionId: unit.id });
      lastViewedUnit = unit.id;
    }
    context = {};
    if (lesson(params.get("from"))) {
      context.from = params.get("from"); context.step = /^[1-5]$/.test(params.get("step") || "") ? params.get("step") : "2";
      if (/^[a-zA-Z0-9_.:-]{1,100}$/.test(params.get("question") || "")) context.question = params.get("question");
    }
    var visible = points.filter(function (p) {
      return lessonIds(p).some(function (id) { var l = lesson(id); return l && l.unitId === unit.id && (!selection.section || l.id === selection.section); });
    });
    var bookUnits = units.filter(function (u) { return u.bookId === unit.bookId; });
    var books = Array.from(new Map(units.filter(function (u) { return u.grade === unit.grade; }).map(function (u) { return [u.bookId, u.bookTitle]; })));
    host.innerHTML = '<div class="lt-page pk-library"><header class="lt-heading"><h1>知识库</h1><p>选一单元，把概念和容易混的地方想清楚，再做题试一试。</p></header>'
      + '<div class="cc-filter"><nav class="cc-grades" aria-label="选择年级">' + [1,2,3,4,5,6].map(function (g) {
        var next = units.find(function (u) { return u.grade === g && u.bookId.endsWith(unit.bookId.slice(-1)) && primaryCardUnits.has(u.id); }) || units.find(function (u) { return u.grade === g && primaryCardUnits.has(u.id); }) || units.find(function (u) { return u.grade === g; });
        return '<a data-primary-unit="' + esc(next.id) + '" href="' + esc(primaryHref(next.id)) + '"' + (g === unit.grade ? ' aria-current="page"' : '') + '>' + '零一二三四五六'[g] + '年级</a>';
      }).join("") + '</nav><div class="pk-selects"><div><label for="pk-book">选择册别</label><select id="pk-book">' + books.map(function (b) { return '<option value="' + esc(b[0]) + '"' + (b[0] === unit.bookId ? ' selected' : '') + '>' + esc(b[1]) + '</option>'; }).join("") + '</select></div>'
      + '<div><label for="cc-unit">选择单元</label><select id="cc-unit">' + bookUnits.map(function (u) { return '<option value="' + esc(u.id) + '"' + (u.id === unit.id ? ' selected' : '') + '>' + esc(u.unitTitle || u.title) + '</option>'; }).join("") + '</select></div></div></div>'
      + (context.from ? '<p><a href="' + esc(returnURL(context.from, 2).href) + '">回到刚才的课时</a></p>' : '')
      + '<section aria-labelledby="pk-unit-title"><h2 id="pk-unit-title">' + esc(unit.bookTitle + ' · ' + (unit.unitTitle || unit.title)) + '</h2><p id="learning-tree-count" role="status">' + visible.length + ' 个知识点</p>'
      + (selection.section ? '<p><a data-primary-unit="' + esc(unit.id) + '" href="' + esc(primaryHref(unit.id)) + '">看本单元全部卡</a></p>' : '')
      + '<div id="learning-tree">' + visible.map(primaryPointCard).join("") + '</div><div id="pk-concepts"></div>'
      + (!visible.length && !primaryConcepts.cards.some(function (c) { return c.unitId === unit.id; }) ? '<p>本单元的知识卡还在整理，可以先回课程动手学。</p>' : '')
      + '<p><a href="' + esc(url('courses.html?book=' + unit.bookId).href) + '">查看本册课程</a></p></section></div>';
    window.PeiyuPrimaryConcepts.renderUnit(document.getElementById("pk-concepts"), unit.id, selection.section);
    host.querySelector('#cc-unit').addEventListener('change', function (e) { primaryGo(e.target.value); });
    host.querySelector('#pk-book').addEventListener('change', function (e) { primaryGo((units.find(function (u) { return u.bookId === e.target.value && primaryCardUnits.has(u.id); }) || units.find(function (u) { return u.bookId === e.target.value; })).id); });
    document.title = unit.bookTitle + ' · ' + (unit.unitTitle || unit.title) + ' · 知识库';
    core.renderMath(host);
    var target = selection.point ? document.getElementById('point-' + selection.point.id) : selection.card ? document.getElementById(selection.card.id) : focus ? document.getElementById('pk-unit-title') : null;
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); }
  }
  function primaryGo(unitId, pointId) {
    history.pushState(null, '', primaryHref(unitId, pointId)); renderPrimaryPage(true);
  }
  function restore() {
    if (!data) return;
    if (primary) { if (primaryConcepts) renderPrimaryPage(false); return; }
    readURL(); syncInputs(); renderContext(); renderDetail(false);
  }
  function boot() {
    host.innerHTML = '<p class="lt-loading" role="status">正在打开知识库…</p>';
    Promise.all([source.load(), core.load()]).then(function (results) {
      index = results[0].index; data = results[0].knowledge;
      variants = results[0].variants && Array.isArray(results[0].variants.items) ? results[0].variants.items.filter(function (item) {
        return item && item.status === "reviewed" && typeof item.contentVersion === "string" && item.contentVersion && Array.isArray(item.options) && item.options.some(function (option) { return option.id === item.correct; });
      }) : [];
      lessons = index.lessons.concat(primary ? index.units || [] : []);
      points = data.points.filter(function (p) { return !!meta(p.id); });
      if (junior) {
        var from = new URLSearchParams(location.search).get("from");
        if (lesson(from)) points = points.filter(function (p) { return core.availableInSection(p.id, from); });
      }
      domains = data.domains.slice().sort(function (a, b) {
        var left = priority.indexOf(a.id), right = priority.indexOf(b.id);
        return (left < 0 ? priority.length : left) - (right < 0 ? priority.length : right);
      });
      if (primary) {
        window.PeiyuPrimaryConcepts.ready.then(function (value) {
          primaryConcepts = value;
          primaryCardUnits = new Set(points.map(function (p) { return lesson(p.first_section).unitId; }).concat(value.cards.map(function (c) { return c.unitId; })));
          renderPrimaryPage(false);
          host.addEventListener("click", function (event) {
            var a = event.target.closest("a[data-primary-unit], a[data-learning-point]");
            if (!a || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            var p = point(a.dataset.learningPoint);
            primaryGo(p ? p.first_section.replace(/-\d+$/, "") : a.dataset.primaryUnit, p && p.id);
          });
        }).catch(function () { host.innerHTML = '<h1>知识库</h1><p role="alert">概念卡暂时没有打开，请刷新重试。</p>'; });
        return;
      }
      readURL(); renderPage();
    }).catch(function () {
      host.innerHTML = '<section class="lt-empty-state"><h1>知识库暂时没有打开</h1><p>检查连接后可以重新加载，也可以先回课程目录。</p><button class="btn" type="button" id="learning-tree-retry">重新加载</button><a href="' + esc(url("courses.html").href) + '">打开课程目录</a></section>';
      document.getElementById("learning-tree-retry").addEventListener("click", boot);
    });
  }
  window.addEventListener("popstate", restore);
  window.addEventListener("hashchange", restore);
  narrow.addEventListener("change", function () { if (directory) directory.open = !narrow.matches; });
  boot();
})();
