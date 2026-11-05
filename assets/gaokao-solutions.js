/* BEGIN SHARED MATH CONFIG */
/* PY-401 shared math configuration. Generated copies: tools/sync_math_config.py. */
var PY_MATH = (function () {
  var macros = {
  "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}",
  "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}", "\\Z": "\\mathbf{Z}", "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}",
  "\\bs": "\\boldsymbol{#1}", "\\symbfup": "\\mathbf{#1}", "\\symbfit": "\\boldsymbol{#1}",
  "\\overarc": "\\overgroup{#1}", "\\arc": "\\overgroup{#1}", "\\parallelogram": "\\square",
  "\\upi": "\\pi", "\\uppi": "\\pi", "\\mathbbm": "\\mathbb{#1}",
  "\\Box": "\\square", "\\normalfont": "", "\\upshape": "", "\\degree": "^\\circ", "\\celsius": "^\\circ\\mathrm{C}",
  "\\parallel": "\\mathrel{\\htmlClass{py-par}{\\char\"2225}}",
  "\\nparallel": "\\mathrel{\\htmlClass{py-par}{\\char\"2226}}",
};
  macros["∥"] = macros["\\parallel"];
  macros["∦"] = macros["\\nparallel"];
  function trust(context) {
    return context.command === "\\htmlClass" && context.class === "py-par";
  }
  var options = {
    delimiters: [
      { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
    ],
    macros: macros, trust: trust, throwOnError: false, strict: "ignore"
  };

  // Question text and options show \frac at full size; a fraction written inside a script stays small.
  function boostFrac(tex) {
    var out = "", groups = [], scripts = 0, pending = false, i = 0;
    while (i < tex.length) {
      var c = tex[i];
      if (c === "\\") {
        var token = (/^\\(?:[a-zA-Z]+|[\s\S])/.exec(tex.slice(i)) || [c])[0], name = token.slice(1), rest;
        i += token.length;
        rest = tex.slice(i, i + 13);
        if (rest === "{smallmatrix}") scripts += name === "begin" ? 1 : name === "end" ? -1 : 0;
        if (/^(?:overset|underset|stackrel|substack)$/.test(name)) { pending = true; out += token; continue; }
        out += !pending && !scripts && (name === "frac" || name === "tfrac") ? "\\dfrac" : token;
        pending = false;
      } else if (c === "^" || c === "_") { pending = true; out += c; i++; }
      else if (c === "{") { groups.push(pending); if (pending) scripts++; pending = false; out += c; i++; }
      else if (c === "}") { if (groups.pop()) scripts--; out += c; i++; }
      else { if (!/\s/.test(c)) pending = false; out += c; i++; }
    }
    return out;
  }
  var boosted = Object.assign({}, options, { preProcess: boostFrac });
  var QUESTION = ".stem, .eb-stem, .opt, .me-option, .predict > p, .k-quiz-prompt, .k-option, .lp-prompt, .lp-option, .cq-text, .cq-opt-text, .zr-stem";

  // A display formula wider than its card breaks at its top-level operators; what still
  // cannot fit scrolls inside its own box with a visible hint.
  var BANK_BLOCK = ".eb-stem, .eb-solution";
  // Two columns are only safe while every option fits: a hidden "+" or "−" changes the question.
  function optionOverflows(option) {
    var text = option.querySelector(".eb-opt-text") || option, style = getComputedStyle(text);
    var limit = text.getBoundingClientRect().right - (parseFloat(style.paddingRight) || 0) * (text === option ? 1 : 0);
    return [].some.call(option.querySelectorAll(".katex .base"), function (part) {
      return part.getBoundingClientRect().right > limit + 1;
    });
  }
  function fitOne(box) {
    if (!box.isConnected || !box.clientWidth) return;
    if (box.classList.contains("eb-table-wrap")) { scrollHint(box, "题目数据表，可左右滑动"); return; }
    if (box.classList.contains("opts")) { if ([].some.call(box.children, optionOverflows)) box.classList.remove("cols"); return; }
    if (box.matches(BANK_BLOCK)) {
      // Bank formulas wrap at their operators; one that cannot (a long list, an array) scrolls alone.
      [].forEach.call(box.querySelectorAll(".gs-math-inline"), function (formula) {
        var inner = formula.querySelector(".katex");
        if (inner && inner.getBoundingClientRect().width > box.clientWidth + 1) formula.classList.add("py-math-wide");
        if (formula.classList.contains("py-math-wide")) scrollHint(formula, "较长公式，可左右滑动");
      });
      scrollHint(box, "内容较宽，可左右滑动");
      return;
    }
    if (box.scrollWidth > box.clientWidth + 1 && !box.classList.contains("py-math-broken") && window.katex) {
      var source = box.querySelector('annotation[encoding="application/x-tex"]');
      if (source) {
        window.katex.render(boostFrac(source.textContent), box, Object.assign({}, options, { displayMode: false }));
        box.classList.add("py-math-broken");
      }
    }
    box.classList.toggle("py-math-scroll", scrollHint(box, "较长公式，可左右滑动"));
  }
  // Every sideways scroller inside a question says so: a thin scrollbar is invisible on phones.
  function scrollHint(box, label) {
    var wide = box.scrollWidth > box.clientWidth + 1, hint = box.nextElementSibling;
    if (hint && !hint.classList.contains("py-math-hint")) hint = null;
    if (wide) {
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", label);
      if (!hint) {
        hint = document.createElement("span");
        hint.className = "py-math-hint";
        hint.textContent = "左右滑动看完整内容";
        box.parentNode.insertBefore(hint, box.nextSibling);
      }
    } else if (hint) {
      hint.remove();
      box.removeAttribute("tabindex"); box.removeAttribute("role"); box.removeAttribute("aria-label");
    }
    return wide;
  }
  var displayObserver = typeof ResizeObserver === "function" ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) { fitOne(entry.target); });
  }) : null;
  function fitDisplay(root) {
    if (!root.querySelectorAll) return;
    var fits = ".prob .katex-display, .eb-card .katex-display, .predict .katex-display, .eb-table-wrap, .opts.cols, " + BANK_BLOCK;
    (root.matches && root.matches(fits) ? [root] : []).concat([].slice.call(root.querySelectorAll(fits))).forEach(function (box) {
      if (displayObserver && !box.pyFitWatched) { box.pyFitWatched = true; displayObserver.observe(box); }
      fitOne(box);
    });
  }
  function render(root) {
    if (typeof window === "undefined" || typeof window.renderMathInElement !== "function") return;
    if (root.querySelectorAll) {
      var own = root.matches && root.matches(QUESTION) ? [root] : [];
      own.concat([].slice.call(root.querySelectorAll(QUESTION))).forEach(function (node) {
        if (!node.closest || !node.closest(".sol, .reveal")) window.renderMathInElement(node, boosted);
      });
    }
    window.renderMathInElement(root, options);
    fitDisplay(root);
  }

  /* Shared exam-question text helpers: every card builds its title, stem and choices through these. */
  function mainPaper(raw, year) {
    var name = raw.replace(/^(?:\d{4}年?)?\s*/, "").replace(/\d{4}年/, ""), tags = [];
    name = name.replace(/^高考数学[（(](.+?)[）)]/, "$1");
    name = name.replace(/[（(]([^（）()]*)[）)]/g, function (_, inner) { tags.push(inner); return ""; }).trim();
    name = name.replace(/数学试[卷题]$/, "").replace(/数学$/, "");
    var dot = name.indexOf("·");
    if (dot >= 0) { tags.push(name.slice(dot + 1)); name = name.slice(0, dot); }
    // Course pages name a junior paper by place only; the bank adds 中考.
    name = name.replace(/初中(?:毕业生)?(?:学业|升学).*$/, "中考");
    if (name && !/[卷考题]/.test(name)) name += "中考";
    var joined = tags.join("，"), season = /春/.test(name + joined) ? "春" : "";
    if (/^上海/.test(name) && !/中考/.test(name)) name = season ? "上海春考" : "上海卷";
    var n = Number(year), num = /^新课标([ⅠⅡⅢ])卷$/.exec(name);
    // Same paper, different names across sources: 2015–2020 全国 papers, 2021 onward 新高考 papers.
    if (num && n >= 2021) name = "新高考" + num[1] + "卷";
    else if (num && n >= 2015) name = "全国" + num[1] + "卷";
    var keep = [];
    if (/文/.test(joined)) keep.push("文");
    if (/理/.test(joined)) keep.push("理");
    if (/附加/.test(joined)) keep.push("附加题");
    var track = /[A-C]\s*卷/.exec(joined);
    if (track) keep.push(track[0].replace(/\s/g, ""));
    if (/回忆/.test(joined)) keep.push("回忆版");
    return name + (keep.length ? "（" + keep.join("，") + "）" : "");
  }
  function paperName(item) {
    var raw = String(item.paper || ""), year = item.year || (/^\d{4}|\d{4}(?=年)/.exec(raw) || [""])[0];
    var parts = [], name = mainPaper(raw, year);
    if (year) parts.push(String(year));
    if (name) parts.push(name);
    return parts.join(" ");
  }
  function paperTitle(item) {
    var no = item.no != null ? item.no : item.number, parts = [paperName(item)];
    if (no != null && no !== "") parts.push("第" + no + "题");
    if (item.part) parts.push(String(item.part).trim());
    return parts.filter(Boolean).join(" ");
  }
  // Same question, different typesetting: this key ignores notation, spacing, punctuation and blanks.
  function stemKey(stem, choices) {
    function flat(value) {
      return String(value == null ? "" : value).replace(/\\[()\[\]]|\$/g, "").replace(/\\(?:dfrac|tfrac)/g, "\\frac")
        .replace(/\\(le|ge)(?:q|qslant)?(?![a-zA-Z])/g, "\\$1").replace(/\\mathbf|\\mathbb|\\mathrm|\\text|\\rm/g, "")
        .replace(/\\left|\\right|\\,|\;|\\!|\\quad/g, "").replace(/\\/g, "")
        .replace(/[\s{}　.,;:()、“”"'?．，。；：（）？_＿]/g, "").toLowerCase();
    }
    return flat(stem) + "|" + (choices || []).map(function (value, i) {
      return flat(choiceText(value, "ABCDE"[i]));
    }).join("|");
  }
  // Sources also differ by a word or a typo: identical choices plus a near-identical stem is one question.
  function sameQuestion(a, b) {
    if (a === b) return true;
    var cut = a.indexOf("|"), other = b.indexOf("|");
    if (a.slice(cut) !== b.slice(other) || a.length === cut + 1) return false;
    function pairs(text) {
      var out = {};
      for (var i = 0; i + 1 < text.length; i++) out[text.slice(i, i + 2)] = (out[text.slice(i, i + 2)] || 0) + 1;
      return out;
    }
    var left = pairs(a.slice(0, cut)), right = pairs(b.slice(0, other)), shared = 0;
    Object.keys(left).forEach(function (key) { shared += Math.min(left[key], right[key] || 0); });
    return 2 * shared >= 0.9 * (Math.max(cut - 1, 0) + Math.max(other - 1, 0));
  }
  // Letter-only figure options repeat the option label: keep the label alone.
  function choiceText(value, letter) {
    var text = String(value == null ? "" : value), bare = text.replace(/\\[()]|\$|\s/g, "");
    var m = /^图?([A-E])?图?$/.exec(bare);
    return m && (!m[1] || m[1] === letter) ? "" : text;
  }
  // Blank lines become paragraphs; a break right after a comma or an open quote is not a real line.
  function stemParas(value) {
    var lines = String(value == null ? "" : value).split(/\r?\n/), paras = [], current = [], gap = false, depth = 0;
    var NEW_LINE = /^\s*(?:[（(]\s*(?:\d|[ⅠⅡⅢⅣⅰⅱⅲⅳIV一二三四])|[①-⑩]|[A-E][.．、]|\d+[.．、]|\\\[|\$\$|\\begin|\\\(\s*\\begin|[|｜])/;
    function open() { return current.join("\n"); }
    function unfinished(text) {
      return /[，、,]\s*$/.test(text) || (text.split("“").length > text.split("”").length);
    }
    lines.forEach(function (line) {
      if (!line.trim()) { gap = true; return; }
      if (current.length && depth <= 0) {
        if (unfinished(open()) && !NEW_LINE.test(line)) {
          current[current.length - 1] = current[current.length - 1].replace(/\s+$/, "") + line.replace(/^\s+/, "");
          gap = false;
        } else if (gap) { paras.push(open()); current = []; current.push(line); gap = false; }
        else current.push(line);
      } else { current.push(line); gap = false; }
      depth = (open().match(/\\\[/g) || []).length - (open().match(/\\\]/g) || []).length +
        ((open().match(/\$\$/g) || []).length % 2) + (open().match(/\\begin\{/g) || []).length - (open().match(/\\end\{/g) || []).length;
    });
    if (current.length) paras.push(open());
    return paras;
  }
  return { macros: macros, trust: trust, options: options, boostFrac: boostFrac, render: render, fitDisplay: fitDisplay, scrollHint: scrollHint,
    paperName: paperName, paperTitle: paperTitle, stemKey: stemKey, sameQuestion: sameQuestion, choiceText: choiceText, stemParas: stemParas };
})();
if (typeof module !== "undefined" && module.exports) module.exports = PY_MATH;
/* Display-only glyph styling, including labels inserted after initial math render.
 * Never touches attributes, input values, stored answers or KaTeX's MathML. */
(function () {
  if (typeof document === "undefined" || !document.createTreeWalker || !document.addEventListener || window.pyParallelDisplayReady) return;
  window.pyParallelDisplayReady = true;
  var doc = document;
  function styleParallel(root) {
    if (!root) return;
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [], node;
    while ((node = walker.nextNode())) {
      if (/[∥∦]/.test(node.data) && node.parentElement &&
          !node.parentElement.closest('script,style,textarea,input,pre,code,math,.katex,.py-par,[contenteditable]')) nodes.push(node);
    }
    nodes.forEach(function (text) {
      var fragment = doc.createDocumentFragment(), styled = false;
      text.data.split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$]*?\$)/g).forEach(function (segment, index) {
        if (index % 2) { fragment.appendChild(doc.createTextNode(segment)); return; }
        segment.split(/([∥∦])/).forEach(function (part) {
        if (!/[∥∦]/.test(part)) { fragment.appendChild(doc.createTextNode(part)); return; }
        var svg = text.parentElement.namespaceURI === 'http://www.w3.org/2000/svg';
        var span = svg ? doc.createElementNS('http://www.w3.org/2000/svg', 'tspan') : doc.createElement('span');
        styled = true; span.setAttribute('class', 'py-par'); span.textContent = part; fragment.appendChild(span);
      });
      });
      if (styled) text.replaceWith(fragment);
    });
  }
  function start() {
    styleParallel(doc.body);
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      queueMicrotask(function () { pending = false; styleParallel(doc.body); });
    });
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("pagehide", function () { observer.disconnect(); });
    window.addEventListener("pageshow", function () {
      observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* PY-450: resolve beside the shared entrypoint, including junior asset mounts. */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.currentScript || !document.currentScript.src || !document.createElement || !document.head) return;
  var body = document.body;
  if (/\/primary\//.test(window.location.pathname) || (body && body.dataset && (body.dataset.stage === 'primary' || body.dataset.wikiStage === 'primary' || /^p[1-6][ab]-/.test(body.dataset.sec || '')))) return;
  if (/\/lab3d\//.test(window.location.pathname) || window.pyRadicalRequested) return;
  window.pyRadicalRequested = true;
  var script = document.createElement('script');
  script.src = new URL('radical.js?v=py450-2', document.currentScript.src).href;
  script.async = true;
  document.head.appendChild(script);
})();
/* END SHARED MATH CONFIG */
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
  function element(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = String(text);
    return node;
  }

  function text(value) { return typeof value === "string" ? value.trim() : ""; }

  function math(root) {
    PY_MATH.render(root);
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
    PY_MATH.scrollHint(wrapper, "较长公式，可左右滚动");
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
    PY_MATH.stemParas(value).forEach(function (para) { questionPara(parent, para); });
  }
  function questionPara(parent, value) {
    var lines = value.split("\n");
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
    if (text(problem.id)) card.setAttribute("data-question-id", problem.id);
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

  // Junior builds write reviewed exam figures to a content-addressed name and
  // reference them from lessons/ (junior_figures.materialize). Nothing else may
  // use a leading "../": not other directories, other types or other names.
  var EXAM_FIGURE = /^\.\.\/(assets\/exam-figures\/[0-9a-f]{64}\.svg)$/;

  function safeFigure(path) {
    if (typeof path !== "string") return false;
    return EXAM_FIGURE.test(path) || (/^assets\/gaokao\/[a-zA-Z0-9_./-]+\.(svg|png|webp|jpg|jpeg)$/.test(path) && path.indexOf("..") === -1);
  }

  function figureUrl(src) {
    if (!scriptSiteBase) return src; // Relative to the page, which is the form build output uses.
    // scriptSiteBase is already the stage root, one level above lessons/.
    var exam = EXAM_FIGURE.exec(src);
    return new URL(exam ? exam[1] : src, scriptSiteBase).href;
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
    image.src = figureUrl(spec.src);
    image.alt = spec.alt;
    image.loading = "lazy";
    figure.appendChild(image);
    if (spec.caption) figure.appendChild(element("figcaption", "small", spec.caption));
    return figure;
  }

  function paperLabel(problem, omitPart) {
    return PY_MATH.paperTitle(omitPart ? Object.assign({}, problem, { part: "" }) : problem);
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
    var reveal = element("button", "btn", choices.length ? "提交并查看解析" : "查看答案与解析");
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
