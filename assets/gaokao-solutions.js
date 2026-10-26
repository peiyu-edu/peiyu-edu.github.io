/* 培玉 · 可复用的高考分步解析。内容使用纯文本，本地 KaTeX 负责公式。 */
(function () {
  "use strict";

  var LETTERS = "ABCDE";
  var scriptSiteBase = document.currentScript && document.currentScript.src ? new URL("../", document.currentScript.src).href : null;
  var sectionNames = {};
  var sectionOrder = {};
  var catalogPromise = null;
  var mathResizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) { sizeInlineMath(entry.target); });
  }) : null;
  var tableResizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) { sizeTable(entry.target.classList.contains("gs-table-wrap") ? entry.target : entry.target.parentElement); });
  }) : null;
  var mathOptions = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false }
    ],
    macros: {
      "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}",
      "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}", "\\Z": "\\mathbf{Z}",
      "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}",
      "\\bs": "\\boldsymbol{#1}", "\\symbfup": "\\mathbf{#1}", "\\symbfit": "\\boldsymbol{#1}"
    },
    throwOnError: false,
    strict: "ignore"
  };

  function element(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function text(value) { return typeof value === "string" ? value.trim() : ""; }

  function math(root) {
    if (typeof window.renderMathInElement === "function") {
      window.renderMathInElement(root, mathOptions);
    }
    root.querySelectorAll(".katex").forEach(function (formula) {
      if (formula.closest(".katex-display")) return;
      var wrapper = formula.parentElement;
      if (!wrapper.classList.contains("gs-math-inline")) {
        wrapper = element("span", "gs-math-inline");
        formula.parentNode.insertBefore(wrapper, formula);
        wrapper.appendChild(formula);
        if (mathResizeObserver) mathResizeObserver.observe(wrapper);
      }
      var next = wrapper.nextSibling;
      var parent = wrapper.parentElement;
      // KaTeX auto-render places each formula inside an otherwise empty span.
      if (!next && parent && parent.tagName === "SPAN" && !parent.attributes.length && parent.childNodes.length === 1) next = parent.nextSibling;
      if (next && next.nodeType === 3) {
        var punctuation = next.nodeValue.match(/^[，。；：、！？,.!?;:）】》〉」』”’…]+/);
        if (punctuation) {
          wrapper.appendChild(element("span", "gs-math-punctuation", punctuation[0]));
          next.nodeValue = next.nodeValue.slice(punctuation[0].length);
          if (!next.nodeValue) next.remove();
        }
      }
      sizeInlineMath(wrapper);
    });
    root.querySelectorAll(".gs-table-wrap").forEach(sizeTable);
  }

  function sizeTable(wrapper) {
    if (!wrapper || !wrapper.clientWidth) return;
    wrapper.classList.toggle("gs-table-scroll", wrapper.scrollWidth > wrapper.clientWidth + 1);
  }

  function sizeInlineMath(wrapper) {
    if (!wrapper.isConnected || !wrapper.getClientRects().length || !wrapper.clientWidth) return;
    wrapper.classList.remove("gs-math-scroll");
    var formula = wrapper.querySelector(":scope > .katex");
    var punctuationWidth = Array.prototype.reduce.call(wrapper.querySelectorAll(":scope > .gs-math-punctuation"), function (sum, node) {
      return sum + node.getBoundingClientRect().width;
    }, 0);
    var wide = formula && formula.getBoundingClientRect().width + punctuationWidth > wrapper.clientWidth + 1;
    wrapper.classList.toggle("gs-math-scroll", !!wide);
    if (wide) {
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "较长公式，可左右滚动");
    } else {
      wrapper.removeAttribute("tabindex");
      wrapper.removeAttribute("role");
      wrapper.removeAttribute("aria-label");
    }
  }

  function rememberCatalog(catalog) {
    var ids = [];
    catalog.forEach(function (book) {
      (book.chapters || []).forEach(function (chapter) {
        (chapter.sections || []).forEach(function (name, index) {
          var id = book.id + "-" + chapter.no + "-" + (index + 1);
          sectionNames[id] = chapter.no + "." + (index + 1) + " " + name;
          sectionOrder[id] = ids.length;
          ids.push(id);
        });
      });
    });
    return ids;
  }

  function ensureCatalog() {
    if (!catalogPromise) {
      var url = scriptSiteBase ? new URL("data/catalog.json", scriptSiteBase).href : "data/catalog.json";
      var revision = text(document.body.getAttribute("data-gaokao-bank-revision") || document.body.getAttribute("data-bank-revision"));
      if (revision) url += "?v=" + encodeURIComponent(revision);
      catalogPromise = loadJSON(url).then(function (catalog) { rememberCatalog(catalog); });
    }
    return catalogPromise;
  }

  function placement(problem, sectionId) {
    var given = problem.placement;
    if (given && given.role === "extension") {
      return { role: "extension", later_prereq_secs: Array.isArray(given.later_prereq_secs) ? given.later_prereq_secs : [] };
    }
    var id = sectionId || problemSections(problem)[0];
    var prereqs = Array.isArray(problem.prereq_secs) ? problem.prereq_secs : [];
    var later = prereqs.filter(function (prereq) {
      return sectionOrder[id] != null && sectionOrder[prereq] != null && sectionOrder[prereq] > sectionOrder[id];
    });
    return { role: later.length ? "extension" : "core", later_prereq_secs: later };
  }

  function placementNotice(problem, sectionId) {
    var assignment = placement(problem, sectionId);
    if (assignment.role !== "extension") return null;
    var notice = element("aside", "gs-placement");
    notice.appendChild(element("strong", "", "综合拓展"));
    if (assignment.later_prereq_secs.length) {
      notice.appendChild(document.createTextNode("，需先学："));
      assignment.later_prereq_secs.forEach(function (id, index) {
        if (!/^(b[12]|e[123])-\d+-\d+$/.test(id)) return;
        if (index) notice.appendChild(document.createTextNode("、"));
        var link = element("a", "", sectionNames[id] || id);
        var path = "lessons/" + id + ".html";
        link.href = scriptSiteBase ? new URL(path, scriptSiteBase).href : path;
        notice.appendChild(link);
      });
      notice.appendChild(document.createTextNode("。"));
    } else {
      notice.appendChild(document.createTextNode("，需先学相关后续课时，再尝试本题。"));
    }
    return notice;
  }

  function paragraphs(parent, value) {
    text(value).split(/\n\s*\n/).filter(Boolean).forEach(function (part) {
      parent.appendChild(element("p", "gs-prose", part));
    });
  }

  function questionText(parent, value) {
    var lines = String(value || "").split(/\r?\n/);
    var plain = [];
    function flush() {
      if (plain.length) parent.appendChild(element("span", "gs-stem-text", plain.join("\n")));
      plain = [];
    }
    for (var index = 0; index < lines.length;) {
      var cells = lines[index].split("｜");
      var rows = [];
      var cursor = index;
      if (cells.length > 1) {
        while (cursor < lines.length && lines[cursor].split("｜").length === cells.length) {
          rows.push(lines[cursor].split("｜"));
          cursor += 1;
        }
      }
      if (rows.length < 2) {
        plain.push(lines[index]);
        index += 1;
        continue;
      }
      flush();
      var wrapper = element("div", "gs-table-wrap");
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "题目数据表，可左右滚动");
      var table = element("table", "gs-data-table");
      var head = element("thead");
      var body = element("tbody");
      rows.forEach(function (row, rowIndex) {
        var tr = element("tr");
        row.forEach(function (cell, cellIndex) {
          var header = rowIndex === 0 || cellIndex === 0;
          var td = element(header ? "th" : "td", "", cell.trim());
          if (header) td.setAttribute("scope", rowIndex === 0 ? "col" : "row");
          tr.appendChild(td);
        });
        (rowIndex === 0 ? head : body).appendChild(tr);
      });
      table.appendChild(head);
      table.appendChild(body);
      wrapper.appendChild(table);
      if (tableResizeObserver) { tableResizeObserver.observe(table); tableResizeObserver.observe(wrapper); }
      parent.appendChild(wrapper);
      index = cursor;
    }
    flush();
  }

  function section(title, cls) {
    var block = element("section", "gs-block " + (cls || ""));
    block.appendChild(element("h3", "gs-heading", title));
    return block;
  }

  function explanation(problem) {
    return problem && problem.explanation && typeof problem.explanation === "object" ? problem.explanation : {};
  }

  function renderHints(problem) {
    var hints = explanation(problem).hints;
    if (!Array.isArray(hints) || !hints.some(text)) return null;
    var root = element("div", "gs-hints");
    hints.filter(text).forEach(function (hint, index) {
      var detail = element("details", "gs-hint");
      detail.appendChild(element("summary", "", index === 0 ? "卡住了？看一点提示" : "再看一点提示"));
      var content = element("div", "gs-hint-content");
      paragraphs(content, hint);
      detail.appendChild(content);
      detail.addEventListener("toggle", function () { if (detail.open) math(content); });
      root.appendChild(detail);
    });
    return root;
  }

  function render(problem) {
    problem = problem || {};
    var data = explanation(problem);
    var root = element("div", "gs-solution");
    root.setAttribute("data-gaokao-solution", "");
    if (text(problem.answer)) {
      var displayAnswer = /\\\[|\$\$|\\begin\{(?:aligned|gathered|array|cases)\}/.test(problem.answer);
      var answer = section("答案", "gs-answer" + (displayAnswer ? " gs-answer-display" : ""));
      paragraphs(answer, problem.answer);
      root.appendChild(answer);
    }
    if (text(data.idea)) {
      var idea = section("先想清楚", "gs-idea");
      paragraphs(idea, data.idea);
      root.appendChild(idea);
    }
    root.appendChild(renderFigures(problem, "solution"));
    var steps = Array.isArray(data.steps) ? data.steps.filter(function (step) {
      return step && typeof step === "object" && text(step.body);
    }) : [];
    if (steps.length) {
      var process = section("一步一步解", "gs-process");
      var list = element("ol", "gs-steps");
      steps.forEach(function (step, index) {
        var item = element("li", "gs-step");
        var content = element("div", "gs-step-content");
        content.appendChild(element("h4", "gs-step-title", text(step.title) || "第 " + (index + 1) + " 步"));
        paragraphs(content, step.body);
        item.appendChild(content);
        list.appendChild(item);
      });
      process.appendChild(list);
      root.appendChild(process);
    } else if (text(problem.solution)) {
      var legacy = section("详细解析", "gs-process");
      paragraphs(legacy, problem.solution);
      root.appendChild(legacy);
    }
    if (text(data.check)) {
      var check = section("回头检验", "gs-check");
      paragraphs(check, data.check);
      root.appendChild(check);
    }
    var pitfalls = Array.isArray(data.pitfalls) ? data.pitfalls.filter(text) : [];
    if (pitfalls.length) {
      var traps = section("这一步容易错", "gs-pitfalls");
      var trapList = element("ul", "gs-traps");
      pitfalls.forEach(function (pitfall) { trapList.appendChild(element("li", "gs-prose", pitfall)); });
      traps.appendChild(trapList);
      root.appendChild(traps);
    }
    if (text(data.takeaway)) {
      var takeaway = section("下次遇到这类题", "gs-takeaway");
      paragraphs(takeaway, data.takeaway);
      root.appendChild(takeaway);
    }
    return root;
  }

  function enhance(card, problem) {
    if (!card || card.getAttribute("data-gaokao-enhanced") === "true") return card;
    var solution = card.querySelector(".sol");
    if (!solution) return card;
    card.setAttribute("data-gaokao-enhanced", "true");
    card.classList.add("gs-problem");
    var questionStem = card.querySelector(".stem");
    if (questionStem && typeof problem.stem === "string" && problem.stem.indexOf("｜") !== -1) {
      var ordinal = questionStem.firstElementChild;
      var number = ordinal && ordinal.tagName === "B" ? ordinal.cloneNode(true) : null;
      questionStem.replaceChildren();
      if (number) { questionStem.appendChild(number); questionStem.appendChild(document.createTextNode(" ")); }
      questionText(questionStem, problem.stem);
    }
    if (text(problem.part) || text(problem.origin_id)) {
      var sourceTag = card.querySelector(".small .tag");
      if (sourceTag) sourceTag.textContent = paperLabel(problem);
    }
    var sectionId = document.body.getAttribute("data-sec") || "";
    function showPlacement() {
      var prior = card.querySelector(".gs-placement");
      if (prior) prior.remove();
      var notice = placementNotice(problem, sectionId);
      if (notice) card.insertBefore(notice, card.querySelector(".stem") || card.firstChild);
    }
    showPlacement();
    if (!Object.keys(sectionOrder).length) ensureCatalog().then(showPlacement).catch(function () { /* Retain explicit placement labels if the catalog is temporarily unavailable. */ });
    var footer = solution.querySelector(".retry-ctrl");
    Array.prototype.slice.call(solution.childNodes).forEach(function (child) {
      if (child !== footer) solution.removeChild(child);
    });
    solution.insertBefore(render(problem), footer || null);
    var hints = renderHints(problem);
    if (hints) card.insertBefore(hints, solution);
    math(card);
    return card;
  }

  function verified(problem) {
    return problem && problem.status === "verified" &&
      problem.verification && problem.verification.result === "pass" &&
      problem.independent_review && problem.independent_review.result === "pass" &&
      text(problem.verification.reviewer) && text(problem.independent_review.reviewer) &&
      text(problem.verification.reviewer) !== text(problem.independent_review.reviewer);
  }

  function problemSections(problem) {
    if (Array.isArray(problem.secs)) return problem.secs;
    if (Array.isArray(problem.section_ids)) return problem.section_ids;
    return problem.alignment && typeof problem.alignment === "object" ? Object.keys(problem.alignment) : [];
  }

  function safeFigure(path) {
    return typeof path === "string" && /^assets\/gaokao\/[a-zA-Z0-9_./-]+\.(svg|png|webp|jpg|jpeg)$/.test(path) && path.indexOf("..") === -1;
  }

  function renderFigures(problem, phase) {
    var fragment = document.createDocumentFragment();
    if (phase !== "problem" && phase !== "solution") return fragment;
    problem = problem || {};
    var data = explanation(problem);
    var figures = [];
    var solutionSources = new Set();

    function add(value, fallback, inSolution) {
      var object = value && typeof value === "object" && !Array.isArray(value) ? value : null;
      var src = object ? object.src : value;
      if (!safeFigure(src)) return;
      // Even a malformed explanation entry must never expose its image early.
      if (inSolution) solutionSources.add(src);
      var role = object && Object.prototype.hasOwnProperty.call(object, "role") ? object.role : fallback.role;
      if (role !== "problem" && role !== "solution") return;
      if (inSolution && role !== "solution") return;
      if (role === "solution") solutionSources.add(src);
      figures.push({
        src: src,
        role: role,
        alt: text(object && object.alt) || text(fallback.alt) || (role === "problem" ? "本题的自绘示意图，请结合题干读取条件" : "解题过程的自绘示意图"),
        caption: text(object && object.caption) || text(fallback.caption)
      });
    }

    add(problem.figure, { role: problem.figure_role, alt: problem.figure_alt, caption: problem.figure_caption }, false);
    if (Array.isArray(problem.figures)) problem.figures.forEach(function (entry) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) add(entry, {}, false);
    });
    add(data.figure, {
      role: typeof data.figure === "string" ? (data.figure_role || "solution") : data.figure_role,
      alt: data.figure_alt,
      caption: data.figure_caption
    }, true);
    if (Array.isArray(data.figures)) data.figures.forEach(function (entry) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) add(entry, {}, true);
    });

    var seen = new Set();
    figures.forEach(function (spec) {
      if (spec.role !== phase || seen.has(spec.src) || (phase === "problem" && solutionSources.has(spec.src))) return;
      seen.add(spec.src);
      fragment.appendChild(figureElement(spec));
    });
    return fragment;
  }

  function figureElement(spec) {
    var figure = element("figure", "gs-figure gs-figure-" + spec.role);
    figure.setAttribute("data-gaokao-figure-role", spec.role);
    figure.setAttribute("data-gaokao-figure-src", spec.src);
    var image = element("img");
    image.src = scriptSiteBase ? new URL(spec.src, scriptSiteBase).href : spec.src;
    image.alt = spec.alt;
    image.loading = "lazy";
    figure.appendChild(image);
    if (spec.caption) figure.appendChild(element("figcaption", "small", spec.caption));
    return figure;
  }

  function paperLabel(problem, omitPart) {
    var number = problem.no != null ? "第" + problem.no + "题" : "";
    if (!omitPart && text(problem.part)) number += " " + problem.part.trim();
    return [problem.year, problem.paper, number].filter(Boolean).join(" ");
  }

  function originKey(problem) {
    return text(problem.origin_id) || text(problem.id) || paperLabel(problem, true);
  }

  function originCount(problems) {
    return new Set(problems.map(originKey)).size;
  }

  function originGroups(problems) {
    var groups = new Map();
    problems.forEach(function (problem) {
      var key = originKey(problem);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(problem);
    });
    return groups;
  }

  function groupLabel(problems) {
    if (problems.length === 1) return paperLabel(problems[0]);
    var parts = Array.from(new Set(problems.map(function (problem) { return text(problem.part); }).filter(Boolean)));
    return paperLabel(problems[0], true) + (parts.length ? " " + parts.join("、") : "（" + problems.length + "项练习）");
  }

  function choiceAnswer(problem) {
    return typeof problem.answer === "string" ? problem.answer.toUpperCase().replace(/[^A-E]/g, "").split("").sort().join("") : "";
  }

  function makePreviewCard(problem, index, sectionId, sectionNames) {
    var card = element("article", "card prob gs-problem gs-preview-problem");
    card.id = "question-" + index;
    card.setAttribute("data-question-id", problem.id || String(index));
    var meta = element("div", "gs-question-meta");
    meta.appendChild(element("span", "tag", paperLabel(problem)));
    if (problem.level) meta.appendChild(element("span", "tag", problem.level));
    card.appendChild(meta);
    card.appendChild(element("h2", "gs-question-title", "练习 " + (index + 1)));
    var notice = placementNotice(problem, sectionId);
    if (notice) card.appendChild(notice);
    var stem = element("div", "stem gs-stem");
    questionText(stem, problem.stem);
    card.appendChild(stem);
    card.appendChild(renderFigures(problem, "problem"));
    var sectionIds = problemSections(problem);
    if (sectionIds.length) {
      var links = element("div", "gs-related small");
      links.appendChild(element("span", "", "对应课时："));
      sectionIds.forEach(function (id, offset) {
        if (!/^(b[12]|e[123])-\d+-\d+$/.test(id)) return;
        if (offset) links.appendChild(document.createTextNode("、"));
        var link = element("a", "", sectionNames[id] || id);
        link.href = "lessons/" + id + ".html#step5";
        links.appendChild(link);
      });
      card.appendChild(links);
    }
    var choices = Array.isArray(problem.choices) ? problem.choices : [];
    var multi = /多选/.test(problem.type || "");
    var picked = {};
    var optionButtons = [];
    var feedback = element("p", "gs-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    var solution = element("div", "sol");
    solution.hidden = true;
    solution.appendChild(render(problem));
    var controls = element("div", "gs-controls");
    var reveal = element("button", "btn", choices.length ? "提交答案" : "做完了，看解析");
    reveal.type = "button";
    var retry = element("button", "btn ghost", "重新作答");
    retry.type = "button";
    retry.hidden = true;

    function showSolution() {
      solution.hidden = false;
      retry.hidden = false;
      reveal.hidden = true;
      optionButtons.forEach(function (button) { button.disabled = true; });
      math(solution);
    }

    if (choices.length) {
      var options = element("div", "opts gs-options");
      options.setAttribute("role", "group");
      options.setAttribute("aria-label", multi ? "选择所有正确选项" : "选择一个选项");
      choices.forEach(function (choice, offset) {
        var letter = LETTERS[offset];
        var option = element("button", "opt gs-option");
        option.type = "button";
        option.setAttribute("aria-pressed", "false");
        option.appendChild(element("b", "gs-option-letter", letter));
        option.appendChild(element("span", "", choice));
        option.addEventListener("click", function () {
          if (!multi) {
            picked = {};
            optionButtons.forEach(function (button) { button.classList.remove("sel"); button.setAttribute("aria-pressed", "false"); });
          }
          picked[letter] = !picked[letter];
          option.classList.toggle("sel", picked[letter]);
          option.setAttribute("aria-pressed", String(picked[letter]));
          feedback.textContent = multi ? "已选 " + Object.keys(picked).filter(function (key) { return picked[key]; }).sort().join("、") : "已选 " + letter;
        });
        optionButtons.push(option);
        options.appendChild(option);
      });
      card.appendChild(options);
    } else {
      card.appendChild(element("p", "small gs-work-note", "先在纸上写出答案和过程，再核对下面的解析。"));
    }
    var hints = renderHints(problem);
    if (hints) card.appendChild(hints);
    reveal.addEventListener("click", function () {
      if (choices.length) {
        var selected = Object.keys(picked).filter(function (key) { return picked[key]; }).sort().join("");
        if (!selected) { feedback.textContent = "请先选择答案。"; optionButtons[0].focus(); return; }
        var answer = choiceAnswer(problem);
        feedback.textContent = selected === answer ? "这次答对了。再看一遍为什么这样做。" : "这次选了 " + selected + "。看看思路，找到哪一步需要调整。";
        feedback.className = "gs-feedback " + (selected === answer ? "ok" : "no");
        optionButtons.forEach(function (button, offset) {
          if (answer.indexOf(LETTERS[offset]) !== -1) button.classList.add("right");
          else if (picked[LETTERS[offset]]) button.classList.add("wrong");
        });
      } else {
        feedback.textContent = "对照答案和步骤，自查计算与条件。";
      }
      showSolution();
    });
    retry.addEventListener("click", function () {
      picked = {};
      solution.hidden = true;
      reveal.hidden = false;
      retry.hidden = true;
      feedback.textContent = "";
      feedback.className = "gs-feedback";
      optionButtons.forEach(function (button) {
        button.disabled = false;
        button.classList.remove("sel", "right", "wrong");
        button.setAttribute("aria-pressed", "false");
      });
      card.querySelectorAll(".gs-hint").forEach(function (detail) { detail.open = false; });
      if (optionButtons.length) optionButtons[0].focus(); else reveal.focus();
    });
    controls.appendChild(reveal);
    controls.appendChild(retry);
    card.appendChild(controls);
    card.appendChild(feedback);
    card.appendChild(solution);
    math(card);
    return card;
  }

  function loadJSON(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error("读取失败（" + response.status + "）");
      return response.json();
    });
  }

  function startPreview() {
    var host = document.querySelector("[data-gaokao-preview]");
    if (!host) return;
    var dataRevision = text(document.body.getAttribute("data-gaokao-bank-revision") || document.body.getAttribute("data-bank-revision"));
    function dataURL(path) { return path + (dataRevision ? "?v=" + encodeURIComponent(dataRevision) : ""); }
    var sectionSelect = document.getElementById("gs-section");
    var questionSelect = document.getElementById("gs-question");
    var status = document.getElementById("gs-status");
    var list = document.getElementById("gs-questions");
    var scope = document.getElementById("gs-scope");
    var params = new URLSearchParams(window.location.search);
    var rows = [];
    var verifiedRows = [];

    function updateQuestions() {
      var sectionId = sectionSelect.value;
      var currentQuestion = questionSelect.value;
      rows = verifiedRows.filter(function (problem) { return !sectionId || problemSections(problem).indexOf(sectionId) !== -1; });
      questionSelect.replaceChildren(element("option", "", "全部题目"));
      questionSelect.firstChild.value = "";
      var groups = originGroups(rows);
      groups.forEach(function (problems, id) {
        var option = element("option", "", groupLabel(problems));
        option.value = id;
        questionSelect.appendChild(option);
      });
      questionSelect.value = groups.has(currentQuestion) ? currentQuestion : "";
      draw();
    }

    function draw() {
      list.replaceChildren();
      var visible = rows.filter(function (problem) { return !questionSelect.value || originKey(problem) === questionSelect.value; });
      if (visible.length && sectionSelect.value) {
        var core = visible.filter(function (problem) { return placement(problem, sectionSelect.value).role === "core"; }).length;
        var extension = visible.filter(function (problem) { return placement(problem, sectionSelect.value).role === "extension"; }).length;
        status.textContent = "当前显示 " + originCount(visible) + " 道真题、" + visible.length + " 项练习；本节练习 " + core + " 项，综合拓展 " + extension + " 项。";
      } else {
        status.textContent = visible.length ? "当前显示 " + originCount(visible) + " 道真题、" + visible.length + " 项练习；综合拓展题已注明先修课时。" : "这个课时暂时没有题目，请选择其他课时练习。";
      }
      visible.forEach(function (problem, index) { list.appendChild(makePreviewCard(problem, index, sectionSelect.value, sectionNames)); });
      math(list);
      var nextParams = new URLSearchParams();
      if (sectionSelect.value) nextParams.set("section", sectionSelect.value);
      if (questionSelect.value) nextParams.set("question", questionSelect.value);
      var query = nextParams.toString();
      window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : ""));
    }

    Promise.all([loadJSON(dataURL("data/catalog.json")), loadJSON(dataURL("data/gaokao/public.json"))]).then(function (results) {
      var catalog = results[0];
      var allProblems = Array.isArray(results[1]) ? results[1] : [];
      verifiedRows = allProblems.filter(verified);
      var sections = rememberCatalog(catalog);
      var sectionCounts = {};
      sections.forEach(function (id) {
        var matched = verifiedRows.filter(function (problem) { return problemSections(problem).indexOf(id) !== -1; });
        var core = originCount(matched.filter(function (problem) { return placement(problem, id).role === "core"; }));
        var extension = originCount(matched.filter(function (problem) { return placement(problem, id).role === "extension"; }));
        sectionCounts[id] = { core: core, extension: extension };
        var option = element("option", "", sectionNames[id] + "（本节 " + core + "，拓展 " + extension + "）");
        option.value = id;
        sectionSelect.appendChild(option);
      });
      scope.textContent = "共 " + originCount(verifiedRows) + " 道高考真题，可按 " + sections.length + " 个课时选题，综合拓展单列。";
      if (params.get("section") && sectionNames[params.get("section")]) sectionSelect.value = params.get("section");
      if (params.get("question")) {
        var selectedProblem = verifiedRows.find(function (problem) { return problem.id === params.get("question") || originKey(problem) === params.get("question"); });
        if (selectedProblem) {
          var initialOption = element("option", "", paperLabel(selectedProblem));
          initialOption.value = originKey(selectedProblem);
          questionSelect.appendChild(initialOption);
          questionSelect.value = originKey(selectedProblem);
        }
      }
      updateQuestions();
      sectionSelect.addEventListener("change", updateQuestions);
      questionSelect.addEventListener("change", draw);
    }).catch(function () {
      scope.textContent = "题目暂未载入。";
      status.textContent = "请重试，或返回课程首页选择课时。";
      var retry = element("button", "btn ghost", "重试");
      retry.type = "button";
      retry.addEventListener("click", function () { window.location.reload(); });
      list.appendChild(retry);
    });
  }

  window.PeiyuGaokaoSolutions = { render: render, enhance: enhance, renderHints: renderHints, renderFigures: renderFigures, math: math };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startPreview);
  else startPreview();
})();
