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
