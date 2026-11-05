/* 培玉 · 独立真题库（PY-490）。按学段、地区、年份、题型、知识点筛题；作答、解析、记录、错题本沿用公共机制。
   列表与题面只读作答前投影（data/index.json、data/q/<id>.json），其中没有答案、解析和方法标签；
   提交或点「查看答案」之后才读取 data/a/<id>.json。记录写入本学段的 PeiyuLearningState（题型 exam、节 exam-bank），
   错题本按同一 base 和 contentVersion 从 wrongbook-index.json 找到本题。 */
(function () {
  "use strict";
  var inline = document.querySelector("[data-exam-bank-inline]");
  var app = inline || document.getElementById("eb-app");
  if (!app) return;
  var LETTERS = "ABCDE", SECTION = "exam-bank";
  var stage = document.body.getAttribute("data-stage") === "junior" ? "junior" : "high";
  var ledger = window.PeiyuLearningState, solutions = window.PeiyuGaokaoSolutions;
  var FILTERS = [["region", "地区"], ["year", "年份"], ["type", "题型"], ["point", "知识点"]];

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function url(path) { return new URL(path, inline ? new URL("../exam-bank/", location.href) : location.href).href; }
  function getJSON(path) {
    return fetch(url(path), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(r.status + " " + path);
      return r.json();
    });
  }
  function math(node) { if (solutions && solutions.math) solutions.math(node); }
  function prose(parent, value) {
    String(value || "").split(/\n\s*\n/).filter(Boolean).forEach(function (part) { parent.appendChild(el("p", "eb-prose", part)); });
  }
  // 题面：普通行保留换行；连续两行以上、格数相同的「｜」行排成表格（与课内真题的写法一致）。
  function stemText(parent, value) {
    PY_MATH.stemParas(value).forEach(function (para) { stemPara(parent, para); });
  }
  function stemPara(parent, value) {
    var lines = value.split("\n"), plain = [];
    function flush() { if (plain.length) parent.appendChild(el("span", "eb-stem-text", plain.join("\n"))); plain = []; }
    for (var i = 0; i < lines.length;) {
      var width = lines[i].split("｜").length, rows = [], j = i;
      while (width > 1 && j < lines.length && lines[j].split("｜").length === width) { rows.push(lines[j].split("｜")); j++; }
      if (rows.length < 2) { plain.push(lines[i]); i++; continue; }
      flush();
      var wrap = el("div", "eb-table-wrap"), table = el("table", "eb-table");
      rows.forEach(function (cells) {
        var tr = el("tr");
        cells.forEach(function (cell, c) { tr.appendChild(el(c === 0 ? "th" : "td", null, cell.trim())); });
        table.appendChild(tr);
      });
      wrap.appendChild(table);
      parent.appendChild(wrap);
      i = j;
    }
    flush();
  }
  function norm(s) {
    return String(s || "").replace(/\\[()\[\]]/g, "").replace(/\\(dfrac|tfrac)/g, "\\frac")
      .replace(/\\left|\\right|\\,|\\;|\\!|\s|\$|\{|\}/g, "").replace(/\\/g, "")
      .replace(/，/g, ",").replace(/．|。/g, "").toLowerCase();
  }
  function isOriginal(item) { return item.source_type === "original"; }
  function paperName(item) { return isOriginal(item) ? "原创解答题" : PY_MATH.paperName(item); }
  function title(item) { return isOriginal(item) ? paperName(item) + " · 第" + item.no + "题" + (item.part ? " " + item.part : "") : PY_MATH.paperTitle(item); }
  function params() { return new URLSearchParams(location.search); }
  function hrefWith(changes) {
    var p = params();
    Object.keys(changes).forEach(function (k) { if (changes[k] == null || changes[k] === "") p.delete(k); else p.set(k, changes[k]); });
    var q = p.toString();
    return location.pathname + (q ? "?" + q : "");
  }
  function go(changes) {
    history.pushState(null, "", hrefWith(changes));
    route();
  }
  function base(id) { return JSON.stringify(["exam", SECTION, id]); }
  function status(item) {
    if (!ledger || !item.contentVersion) return null;
    try {
      var q = ledger.question({ questionType: "exam", sectionId: SECTION, questionId: item.id,
        contentVersion: item.contentVersion, contentVersions: item.contentVersions });
      if (!q || !q.lastAnswer) return null;
      return q.lastAnswer.correct ? "right" : "wrong";
    } catch (_) { return null; }
  }

  var index = null, versions = {};

  function selectedSection(p) {
    var sections = index.sections || {}, sec = p.get("sec");
    return sec && Object.prototype.hasOwnProperty.call(sections, sec) ? sections[sec] : null;
  }
  function matchesSection(item, p) {
    var section = selectedSection(p);
    return !section || section.ids.indexOf(item.id) >= 0;
  }
  function sectionHeading() {
    var section = selectedSection(params());
    if (!section) return;
    var heading = el("div", "eb-section");
    heading.appendChild(el("p", null, "本节：" + section.title + " · " + section.ids.length + " 题"));
    var all = el("a", null, "看全部真题");
    all.href = hrefWith({ sec: null, q: null });
    all.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault(); go({ sec: null, q: null });
    });
    heading.appendChild(all);
    app.appendChild(heading);
  }
  function matches(item, p) {
    return matchesSection(item, p) && (!p.get("region") || item.region === p.get("region")) &&
      (!p.get("year") || String(item.year) === p.get("year")) &&
      (!p.get("type") || item.type === p.get("type")) &&
      (!p.get("point") || (item.points || []).indexOf(p.get("point")) >= 0);
  }
  function facet(key, items) {
    var values = [];
    items.forEach(function (item) {
      (key === "point" ? item.points || [] : [item[key]]).forEach(function (v) {
        if (v != null && v !== "" && values.indexOf(String(v)) < 0) values.push(String(v));
      });
    });
    return key === "year" ? values.sort().reverse() : values.sort(function (a, b) { return a.localeCompare(b, "zh-CN"); });
  }

  function renderList() {
    var p = params(), items = index.items;
    app.replaceChildren();
    sectionHeading();
    if (!items.length) {
      var empty = el("section", "eb-empty");
      empty.appendChild(el("h2", null, "真题正在审核"));
      empty.appendChild(el("p", null, "每道题都要经过独立复算和发布审批才会放进真题库。现在还没有通过审批的题，先去课程里的“" + (stage === "junior" ? "中考" : "高考") + "真题”练一练吧。"));
      var back = el("a", "btn ghost", "去练习页");
      back.href = "../practice.html";
      empty.appendChild(back);
      app.appendChild(empty);
      return;
    }
    var form = el("form", "eb-filters");
    form.setAttribute("aria-label", "筛选真题");
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    FILTERS.forEach(function (f) {
      var label = el("label", "eb-filter"), select = el("select");
      label.appendChild(el("span", null, f[1]));
      select.name = f[0];
      select.appendChild(new Option("全部", ""));
      // 每个下拉只列出在其他筛选条件下还有题的值，避免选出空结果。
      var rest = items.filter(function (item) {
        var q = new URLSearchParams(p.toString()); q.delete(f[0]);
        return matches(item, q);
      });
      facet(f[0], rest).forEach(function (v) { select.appendChild(new Option(f[0] === "year" ? v + " 年" : v, v)); });
      select.value = p.get(f[0]) || "";
      if (select.value !== (p.get(f[0]) || "")) select.value = "";
      select.addEventListener("change", function () { var c = {}; c[f[0]] = select.value; go(c); });
      label.appendChild(select);
      form.appendChild(label);
    });
    var clear = el("button", "btn ghost eb-clear", "清除筛选");
    clear.type = "button";
    clear.hidden = !FILTERS.some(function (f) { return p.get(f[0]); });
    clear.addEventListener("click", function () { go({ region: null, year: null, type: null, point: null }); });
    form.appendChild(clear);
    app.appendChild(form);
    var selected = selectedSection(p);
    if (selected && selected.featuredIds) {
      var featured = el("section", "eb-featured");
      featured.appendChild(el("h2", null, "本节精选"));
      featured.appendChild(el("p", "eb-note", sourceNote(selected.featuredIds) + "从基础到挑战，先独立作答，再看解析。"));
      var picks = el("ol", "eb-list");
      selected.featuredIds.forEach(function (id) {
        var item = items.find(function (row) { return row.id === id && matches(row, p); });
        if (item) picks.appendChild(itemLink(item, true));
      });
      featured.appendChild(picks);
      if (!picks.children.length) featured.appendChild(el("p", "eb-note", "本次筛选没有精选题，可清除筛选或查看下面的全部题目。"));
      app.appendChild(featured);
    }
    var visible = items.filter(function (item) { return matches(item, p); });
    if (selected) app.appendChild(el("h2", "eb-all", "全部 " + selected.ids.length + " 道"));
    var count = el("p", "eb-count", "共 " + visible.length + " 道题" + (visible.length < items.length ? "（全部 " + items.length + " 道）" : "") + "，保留原卷题号和顺序。");
    count.setAttribute("role", "status");
    app.appendChild(count);
    var groups = [];
    visible.forEach(function (item) {
      var name = paperName(item), group = groups.find(function (g) { return g.name === name; });
      if (!group) { group = { name: name, paper: item.paper, items: [] }; groups.push(group); }
      group.items.push(item);
    });
    groups.forEach(function (group) {
      var section = el("section", "eb-paper");
      section.appendChild(el("h2", null, group.name));
      if (!isOriginal(group.items[0])) {
        var paper = (index.papers || []).find(function (p) { return p.paper === group.paper; });
        if (paper) {
          var exam = el("a", "btn ghost me-start", "整卷模考");
          exam.href = "index.html?mock=" + encodeURIComponent(paper.id);
          exam.setAttribute("aria-label", group.name + " 整卷模考");
          section.appendChild(exam);
          section.appendChild(el("p", "eb-note", "整卷 " + paper.questions.length + " 题 · " + paper.minutes + " 分钟 · " + paper.maxScore + " 分" + (paper.estimated ? "（含估分）" : "")));
        } else section.appendChild(el("p", "eb-note", "整卷模考暂未开放：只开放已审批题齐全、无拆分或重复题号，且题数与题型符合已核定全卷结构的试卷。"));
      }
      var list = el("ol", "eb-list");
      group.items.forEach(function (item) { list.appendChild(itemLink(item, false)); });
      section.appendChild(list);
      app.appendChild(section);
    });
  }

  function itemLink(item, withSource) {
    var li = el("li"), a = el("a", "eb-item");
    a.href = hrefWith({ q: item.id });
    a.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault(); go({ q: item.id });
    });
    a.appendChild(el("span", "eb-no", isOriginal(item) ? title(item) : "第" + item.no + "题" + (item.part ? " " + item.part : "")));
    var tags = el("span", "eb-tags");
    tags.appendChild(el("span", "tag", item.type));
    if (item.level) tags.appendChild(el("span", "tag", item.level));
    if (item.figure) tags.appendChild(el("span", "tag", "有图"));
    a.appendChild(tags);
    if (withSource && !isOriginal(item)) tags.appendChild(el("span", "eb-source", paperName(item)));
    if (item.points && item.points.length) a.appendChild(el("span", "eb-points", item.points.join(" · ")));
    var s = status(item);
    if (s) {
      var mark = el("span", "eb-done eb-done-" + s, s === "right" ? "做对了" : "做错了");
      a.appendChild(mark);
    }
    li.appendChild(a);
    return li;
  }

  function sourceNote(ids) {
    var rows = index.items.filter(function (item) { return ids.indexOf(item.id) >= 0; });
    var originals = rows.filter(isOriginal).length;
    return originals ? "真题 " + (rows.length - originals) + " 道、原创 " + originals + " 道。" : "";
  }

  function renderInline() {
    app.replaceChildren(el("h2", null, "本节精选"));
    var section = (index.sections || {})[inline.getAttribute("data-exam-bank-inline")];
    if (!section || !section.featuredIds) return;
    var ids = section.featuredIds.filter(function (id) {
      return section.ids.indexOf(id) >= 0 && index.items.some(function (item) { return item.id === id; });
    });
    var cards = ids.map(function (id) {
      var card = el("article", "card eb-card");
      card.setAttribute("data-question-id", id);
      card.appendChild(el("p", "eb-loading", "题目加载中…"));
      app.appendChild(card);
      return card;
    });
    var loads = ids.map(function (id) {
      return getJSON("data/q/" + encodeURIComponent(id) + ".json").catch(function () { return null; });
    });
    // 同屏不重复：课内「真题练习」已有的题不再进精选，精选内部同题（文理卷）只留第一道。
    practiceKeys().then(function (seen) {
      return Promise.all(loads).then(function (items) {
        var kept = [];
        items.forEach(function (item, i) {
          var key = item && PY_MATH.stemKey(item.stem, item.choices);
          if (!item) { cards[i].replaceChildren(el("p", "eb-missing", "题目暂时打不开，请刷新重试。")); return; }
          if (seen.some(function (other) { return PY_MATH.sameQuestion(key, other); })) { cards[i].remove(); return; }
          seen.push(key);
          kept.push(ids[i]);
          drawQuestion(cards[i], item);
        });
        var note = sourceNote(kept);
        if (note) app.insertBefore(el("p", "eb-note", note), app.children[1] || null);
        if (!app.querySelector(".eb-card")) inline.hidden = true;
      });
    });
  }
  function practiceKeys() {
    var seen = [], sec = document.body.getAttribute("data-sec");
    if (!sec || !document.getElementById("practice")) return Promise.resolve(seen);
    return fetch(new URL("../data/sections/" + sec + ".json", location.href).href, { cache: "no-store" }).then(function (r) {
      return r.ok ? r.json() : [];
    }).then(function (rows) {
      (Array.isArray(rows) ? rows : []).forEach(function (p) { seen.push(PY_MATH.stemKey(p.stem, p.choices)); });
      return seen;
    }).catch(function () { return seen; });
  }

  function record(item, kind, details) {
    if (!ledger || !item.contentVersion) return;
    try {
      ledger.record(Object.assign({ source: "exam-bank", sectionId: SECTION, questionType: "exam", questionId: item.id,
        contentVersion: item.contentVersion, contentVersions: item.contentVersions, kind: kind, time: Date.now() }, details || {}));
    } catch (_) { /* 本地记录失败不影响做题 */ }
  }

  function renderQuestion(id) {
    app.replaceChildren();
    sectionHeading();
    var nav = el("p", "eb-back"), back = el("a", null, "← 返回题目列表");
    back.href = hrefWith({ q: null });
    back.addEventListener("click", function (e) { e.preventDefault(); go({ q: null }); });
    nav.appendChild(back);
    app.appendChild(nav);
    var summary = index.items.find(function (item) { return item.id === id && matchesSection(item, params()); });
    if (!summary) {
      app.appendChild(el("p", "eb-missing", "没有找到这道题，可能还在审核中。请返回列表重新选择。"));
      document.title = "真题库 · 培玉";
      return;
    }
    var card = el("article", "card prob eb-card");
    card.setAttribute("data-question-id", id);
    app.appendChild(card);
    card.appendChild(el("p", "eb-loading", "题目加载中…"));
    getJSON("data/q/" + encodeURIComponent(id) + ".json").then(function (item) {
      versions[id] = item;
      drawQuestion(card, item);
    }).catch(function () {
      card.replaceChildren(el("p", "eb-missing", "题目暂时打不开，请刷新重试。"));
    });
    document.title = title(summary) + " · 真题库";
  }

  function drawQuestion(card, item) {
    card.replaceChildren();
    var heading = el(inline ? "h3" : "h2", "eb-title", title(item));
    card.appendChild(heading);
    var meta = el("div", "eb-meta");
    meta.appendChild(el("span", "tag", item.type));
    if (item.level) meta.appendChild(el("span", "tag", item.level));
    card.appendChild(meta);
    if (item.points && item.points.length) card.appendChild(el("p", "eb-points", "知识点：" + item.points.join("、")));
    var stem = el("div", "stem eb-stem");
    stemText(stem, item.stem);
    card.appendChild(stem);
    // 题图（含图形选项）放在选项之前；选项再给一行可读文字。
    if (item.figure) {
      var fig = el("figure", "eb-figure"), img = el("img");
      img.src = url(item.figure.src);
      img.alt = item.figure.alt || "本题的示意图";
      img.loading = "eager";
      fig.appendChild(img);
      card.appendChild(fig);
    }
    var feedback = el("p", "fb eb-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    var sol = el("div", "sol eb-solution");
    sol.hidden = true;
    var answerArea = el("div", "eb-answer");
    card.appendChild(answerArea);
    card.appendChild(feedback);
    card.appendChild(sol);
    var done = false, post = null;

    function loadPost() {
      if (post) return Promise.resolve(post);
      return getJSON("data/a/" + encodeURIComponent(item.id) + ".json").then(function (value) {
        if (!value || value.id !== item.id) throw new Error("answer mismatch");
        post = value; return post;
      });
    }
    function showSolution(value) {
      sol.replaceChildren();
      if (value.methodPoints && value.methodPoints.length) sol.appendChild(el("p", "eb-method", "这题用到的方法：" + value.methodPoints.join("、")));
      if (value.openAnswer) sol.appendChild(el("p", "eb-note", "这道题的答案不唯一，下面给出一个例子和全部可取的范围，请对照自己的答案判断。"));
      if (solutions && solutions.render) sol.appendChild(solutions.render({ answer: value.answer, solution: value.solution, explanation: value.explanation }));
      else { sol.appendChild(el("p", null, "答案：" + value.answer)); prose(sol, value.solution); }
      var again = el("button", "btn ghost eb-retry", "重新作答");
      again.type = "button";
      again.addEventListener("click", reset);
      sol.appendChild(again);
      sol.hidden = false;
      math(sol);
      record(item, "feedback");
    }
    function finish(correct, choice, selfCheck) {
      if (done) return;
      done = true;
      card.classList.add("done");
      feedback.className = "fb eb-feedback " + (correct ? "ok" : "no");
      feedback.textContent = correct ? "答对了。" : "这次没做对，看看解析，过一会儿再试一次。";
      record(item, "answer", { choice: choice, correct: correct, feedbackSeen: selfCheck === true, selfCheck: selfCheck === true });
    }
    function failed() {
      feedback.className = "fb eb-feedback no";
      feedback.textContent = "答案暂时打不开，请刷新重试。";
    }
    function selfReport(choice) {
      var box = el("div", "selfrep eb-self");
      box.appendChild(el("span", "small", "和答案对一下："));
      [["我做对了", true], ["我做错了 / 没做出", false]].forEach(function (x) {
        var b = el("button", "btn ghost", x[0]);
        b.type = "button";
        b.addEventListener("click", function () { box.remove(); finish(x[1], choice(x[1]), true); });
        box.appendChild(b);
      });
      sol.insertBefore(box, sol.firstChild);
    }
    function reset() {
      done = false;
      card.classList.remove("done");
      feedback.className = "fb eb-feedback"; feedback.textContent = "";
      sol.hidden = true; sol.replaceChildren();
      drawAnswer();
      math(answerArea);
      var first = answerArea.querySelector("button,input");
      if (first) first.focus();
    }
    function drawAnswer() {
      answerArea.replaceChildren();
      if (item.grading === "choice") {
        var multi = /多选/.test(item.type), picked = {};
        var box = el("div", "opts eb-opts" + (item.choiceDescriptions ? "" : " cols"));
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", multi ? "选项（可多选）" : "选项");
        var buttons = item.choices.map(function (c, i) {
          var b = el("button", "opt eb-opt");
          b.type = "button";
          b.setAttribute("data-v", LETTERS[i]);
          b.appendChild(el("b", null, LETTERS[i]));
          var text = PY_MATH.choiceText(item.choiceDescriptions ? item.choiceDescriptions[i] : c, LETTERS[i]);
          if (text) b.appendChild(el("span", "eb-opt-text", text));
          if (multi) b.setAttribute("aria-pressed", "false");
          b.addEventListener("click", function () {
            if (done) return;
            if (multi) { picked[LETTERS[i]] = !picked[LETTERS[i]]; b.classList.toggle("sel"); b.setAttribute("aria-pressed", String(!!picked[LETTERS[i]])); return; }
            submit(LETTERS[i]);
          });
          box.appendChild(b);
          return b;
        });
        answerArea.appendChild(box);
        var submit = function (mine) {
          buttons.forEach(function (b) { b.setAttribute("aria-disabled", "true"); });
          loadPost().then(function (value) {
            var want = String(value.answer).toUpperCase().replace(/[^A-E]/g, "").split("").sort().join("");
            buttons.forEach(function (b) {
              var v = b.getAttribute("data-v");
              if (want.indexOf(v) >= 0) b.classList.add("right");
              else if (mine.indexOf(v) >= 0) b.classList.add("wrong");
            });
            finish(mine === want, mine);
            showSolution(value);
          }).catch(function () { buttons.forEach(function (b) { b.removeAttribute("aria-disabled"); }); failed(); });
        };
        if (multi) {
          var go2 = el("button", "btn eb-submit", "提交");
          go2.type = "button";
          go2.addEventListener("click", function () {
            if (done) return;
            var mine = Object.keys(picked).filter(function (k) { return picked[k]; }).sort().join("");
            if (!mine) { feedback.textContent = "先选出你认为正确的选项。"; return; }
            go2.disabled = true;
            submit(mine);
          });
          answerArea.appendChild(go2);
        }
      } else if (item.grading === "compare") {
        var row = el("div", "ctrl eb-fill"), input = el("input"), check = el("button", "btn", "提交答案");
        input.type = "text"; input.placeholder = "填答案，如 3 或 1/2"; input.setAttribute("aria-label", "你的答案");
        check.type = "button";
        row.appendChild(input); row.appendChild(check);
        answerArea.appendChild(row);
        var submitFill = function () {
          if (done || check.disabled) return;
          if (!input.value.trim()) { feedback.textContent = "先写下你的答案。"; input.focus(); return; }
          input.disabled = true; check.disabled = true;
          loadPost().then(function (value) {
            if (norm(input.value) === norm(value.answer)) { finish(true, input.value); showSolution(value); return; }
            // 写法不同也可能是对的：给出答案，让学生自己判
            showSolution(value);
            selfReport(function (ok) { return input.value + (ok ? "（自判对）" : ""); });
          }).catch(function () { input.disabled = false; check.disabled = false; failed(); });
        };
        check.addEventListener("click", submitFill);
        input.addEventListener("keydown", function (e) { if (e.key === "Enter") submitFill(); });
      } else {
        var see = el("button", "btn ghost", item.type === "填空" ? "写好后查看答案" : "做完后查看答案与解析");
        see.type = "button";
        answerArea.appendChild(el("p", "small eb-hint", item.type === "填空" ? "先在纸上写出你的答案，再对照。" : "先在纸上完整写出解答过程，再对照解析。"));
        answerArea.appendChild(see);
        see.addEventListener("click", function () {
          if (done || see.disabled) return;
          see.disabled = true;
          loadPost().then(function (value) {
            showSolution(value);
            selfReport(function (ok) { return ok ? "自判对" : "自判错"; });
          }).catch(function () { see.disabled = false; failed(); });
        });
      }
    }
    drawAnswer();
    math(card);
  }

  function route() {
    var p = params();
    if (window.PeiyuMockExam) window.PeiyuMockExam.unmount();
    if (p.has("mock") && window.PeiyuMockExam) {
      var paper = (index.papers || []).find(function (entry) { return entry.id === p.get("mock"); });
      if (paper) { window.PeiyuMockExam.mount(app, paper, index, stage); return; }
      app.replaceChildren(el("p", "eb-missing", "这套卷尚未通过整卷完整性检查，请返回题库列表。")); return;
    }
    if (p.has("sec") && !selectedSection(p)) history.replaceState(null, "", hrefWith({ sec: null }));
    var q = params().get("q");
    if (q) renderQuestion(q); else { renderList(); document.title = (stage === "junior" ? "初中" : "高中") + "真题库 · 培玉"; }
    math(app);
  }

  window.addEventListener("popstate", function () { if (index && !inline) route(); });
  getJSON("data/index.json").then(function (data) {
    if (!data || data.version !== 1 || !Array.isArray(data.items)) throw new Error("bad index");
    index = data;
    if (inline) renderInline(); else route();
    if (!inline && ledger && ledger.subscribe) ledger.subscribe(function () { if (index && !params().get("q") && !params().has("mock")) renderList(); });
  }).catch(function () {
    app.replaceChildren(el("p", "eb-missing", "真题库暂时打不开，请刷新重试。"));
  });
})();
