/* Student knowledge directory. Point content remains owned by knowledge-core.js. */
(function () {
  "use strict";
  if (document.body.dataset.learningPage !== "knowledge") return;
  var host = document.getElementById("learning-app");
  var source = window.PeiyuLearningData;
  var core = window.PeiyuKnowledge;
  if (!host || !source || !core) return;
  var junior = document.body.dataset.stage === "junior";
  var stageName = junior ? "初中" : "高中";

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
    if (currentDomain !== "all") target.searchParams.set("domain", currentDomain);
    if (currentSection !== "all") target.searchParams.set("section", currentSection);
    if (query) target.searchParams.set("q", query);
    if (includeExtra) target.searchParams.set("scope", "all");
    if (practiceVariant(id)) target.searchParams.set("variant", selectedVariant);
    if (id) target.hash = "point=" + encodeURIComponent(id);
    return target;
  }
  function domainURL(id) {
    var target = withContext(url("knowledge.html"));
    if (id !== "all") target.searchParams.set("domain", id);
    if (includeExtra) target.searchParams.set("scope", "all");
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
    currentDomain = domain(params.get("domain")) ? params.get("domain") : "all";
    currentSection = lesson(params.get("section")) ? params.get("section") : "all";
    query = (params.get("q") || "").slice(0, 200);
    viewConditions = params.get("focus") === "conditions";
    selected = requestedPoint();
    selectedVariant = params.get("variant") || "";
    if (!/^[a-z0-9-]{1,100}$/.test(selectedVariant) || !practiceVariant(selected)) selectedVariant = "";
    var chosen = point(selected);
    includeExtra = params.get("scope") === "all" || !!(chosen && !corePoint(chosen));
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
    if (junior) html = juniorBranches(visible);
    tree.innerHTML = html || '<p class="lt-empty">没有匹配的知识点。试试更短的关键词，或调整课时与范围。</p><button class="lt-text-button" type="button" data-clear-filters>清除筛选</button>';
    resultCount.textContent = visible.length + " 个知识点";
    tree.querySelectorAll("[data-tree-branch]").forEach(function (branch) {
      branch.addEventListener("toggle", function () {
        if (branch.open) expanded.add(branch.dataset.treeBranch);
        else expanded.delete(branch.dataset.treeBranch);
      });
    });
    var hint = document.getElementById("learning-tree-hint");
    hint.textContent = chosen && !matches(chosen) ? "当前链接的知识点在筛选范围之外，详情仍保留。" : junior ? "按册、章、节展开，选择一个知识点。" : "展开专题和分组，选择一个知识点。";
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
    if (junior) {
      detail.innerHTML = '<section class="lt-overview"><h2>按册、章、节查知识点</h2><p>必学内容默认显示，选学与拓展按需打开。</p>' + (juniorBranches(visiblePoints()) || '<p>这里暂时没有匹配的知识点。</p>') + '</section>';
      document.title = "知识库 · 培玉初中数学";
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
    host.innerHTML = '<div class="lt-page"><header class="lt-heading"><h1>知识库</h1><p>' + (junior ? '按册、章、节查找，带着条件回到题目。' : '按专题找知识点，带着条件回到题目。') + '</p></header><div class="lt-context" id="learning-tree-context" hidden></div><div class="lt-layout"><aside class="lt-sidebar" aria-label="知识点目录与筛选"><div class="lt-filters"><label for="learning-tree-search">查找知识点</label><div class="lt-search-row"><input id="learning-tree-search" type="search" placeholder="输入概念、条件或知识点名称" maxlength="200" autocomplete="off"><button id="learning-tree-clear" class="lt-text-button" type="button" hidden>清除</button></div><div class="lt-selects"><div><label for="learning-tree-domain">专题</label><select id="learning-tree-domain"><option value="all">全部专题</option>' + domains.map(function (d) { return '<option value="' + esc(d.id) + '">' + esc(d.title) + '</option>'; }).join("") + '</select></div><div><label for="learning-tree-section">课时</label><select id="learning-tree-section"><option value="all">全部课时</option>' + lessons.map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.title) + '</option>'; }).join("") + '</select></div></div><label class="lt-check"><input id="learning-tree-extra" type="checkbox">显示选学与拓展</label></div><details id="learning-tree-directory" class="lt-directory"><summary>专题目录 <span id="learning-tree-count" aria-live="polite"></span></summary><p id="learning-tree-hint" class="lt-hint"></p><nav id="learning-tree" aria-label="专题、分组与知识点"></nav></details></aside><div id="learning-tree-detail" class="lt-detail" tabindex="-1"></div></div></div>';
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
  function restore() {
    if (!data) return;
    readURL(); syncInputs(); renderContext(); renderDetail(false);
  }
  function boot() {
    host.innerHTML = '<p class="lt-loading" role="status">正在打开知识库…</p>';
    Promise.all([source.load(), core.load()]).then(function (results) {
      index = results[0].index; data = results[0].knowledge;
      variants = results[0].variants && Array.isArray(results[0].variants.items) ? results[0].variants.items.filter(function (item) {
        return item && item.status === "reviewed" && typeof item.contentVersion === "string" && item.contentVersion && Array.isArray(item.options) && item.options.some(function (option) { return option.id === item.correct; });
      }) : [];
      lessons = index.lessons;
      points = data.points.filter(function (p) { return !!meta(p.id); });
      if (junior) {
        var from = new URLSearchParams(location.search).get("from");
        if (lesson(from)) points = points.filter(function (p) { return core.availableInSection(p.id, from); });
      }
      domains = data.domains.slice().sort(function (a, b) {
        var left = priority.indexOf(a.id), right = priority.indexOf(b.id);
        return (left < 0 ? priority.length : left) - (right < 0 ? priority.length : right);
      });
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
