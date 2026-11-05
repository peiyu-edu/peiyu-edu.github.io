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
/* 培玉 · 高中数学 — 「看到题目怎么想」先想再揭晓训练器（wiki.html 第 3 个标签页）
   数据来自 assets/wiki-cues.js（window.PEIYU_CUES）。
   两种模式：
   - 先想再揭晓（默认）：只给题干信号，学生在心里说出第一步，再点「揭晓」，再自评「想对了 / 没想到」。
     结果写进 localStorage peiyu.hs.log（{kind:"cue", sec, id, ch, card, correct}），格式与 lesson.js 相同，
     「我的记录」页能导出，不作为图谱作答证据。上次「没想到」的条目下一轮优先出。
   - 查表模式：原决策树平铺（题干 → 做法 + 查看卡片），做题卡壳时直接查。
   范围：跨章混合（每轮 12 条）或某一章（该章全部）。 */
(function () {
  "use strict";

  var CUES = window.PEIYU_CUES || [];
  var CH_NAMES = window.PEIYU_CUE_CHAPTERS || {};
  var SEC_META = window.PEIYU_SEC_META || {};
  // HCI tab restoration may replace the hash while graph data is loading.
  var bootHash = location.hash || "";
  var CARDS = window.PEIYU_WIKI_CARDS || [];
  var BY_ID = {};
  CARDS.forEach(function (c) { BY_ID[c.id] = c; });

  var MIXED_ROUND = 12;
  var LOG_KEY = "peiyu.hs.log", NAME_KEY = "peiyu.hs.name", UI_KEY = "peiyu.hs.cue.ui";

  /* ---------- 存储（与 lesson.js 同格式） ---------- */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function readLog() { try { return JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { return []; } }
  function log(sec, kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }
  function readUI() { try { return JSON.parse(store(UI_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function saveUI() { store(UI_KEY, JSON.stringify({ mode: mode, ch: curCh })); }

  /* 每条信号最近一次自评：{ id: true|false } */
  function latestResults() {
    var out = {};
    readLog().forEach(function (ev) {
      if (ev.kind === "cue" && ev.id && typeof ev.correct === "boolean") out[ev.id] = ev.correct;
    });
    return out;
  }

  /* ---------- KaTeX ---------- */
  var MACROS = PY_MATH.macros;
  function math(el) {
    var tries = 0;
    (function run() {
      if (window.renderMathInElement) {
        PY_MATH.render(el);
      } else if (tries++ < 30) {
        setTimeout(run, 100);
      }
    })();
  }

  /* ---------- 样式 ---------- */
  function injectStyle() {
    if (document.getElementById("peiyu-cue-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-cue-css";
    st.textContent = [
      ".ct-top{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin:6px 0 4px}",
      ".ct-mode{display:inline-flex;border:1px solid var(--line);border-radius:999px;background:var(--card);padding:3px;gap:2px}",
      ".ct-mode button{border:0;background:transparent;color:var(--muted);font:inherit;font-size:14px;font-weight:600;padding:6px 14px;min-height:36px;border-radius:999px;cursor:pointer}",
      ".ct-mode button.on{background:var(--a);color:#fff}",
      ".ct-mode button:focus-visible{outline:3px solid var(--hl)}",
      ".ct-prog{font-size:14px;color:var(--muted);display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin:6px 0 10px}",
      ".ct-prog b{color:var(--fg)}",
      ".ct-due{color:var(--no);font-weight:600}",
      ".ct-card{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px 18px 14px;margin:8px 0 14px;box-shadow:0 2px 10px rgba(26,40,34,.05)}",
      ".ct-tag{display:inline-block;font-size:14px;font-weight:600;color:var(--muted);border:1px dashed var(--line);border-radius:6px;padding:2px 8px;margin-bottom:10px}",
      ".ct-cue{font-size:17.5px;line-height:1.8;margin:0 0 8px}",
      ".ct-ask{font-size:14.5px;color:var(--muted);margin:0 0 14px}",
      ".ct-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 0}",
      ".ct-row .btn{min-height:40px}",
      ".ct-kbd{font-size:14px;color:var(--muted);margin-left:auto}",
      "@media (hover:none){.ct-kbd{display:none}}",
      ".ct-act{margin:12px 0 10px;font-size:15.5px;line-height:1.8}",
      ".ct-src{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px;margin:6px 0 4px}",
      ".ct-src a{color:var(--c);text-decoration:none;font-weight:600}",
      ".ct-src a:hover{text-decoration:underline}",
      ".ct-grade{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px dashed var(--line);margin-top:12px;padding-top:12px;font-size:15px}",
      ".ct-grade .btn.yes{background:var(--a);border-color:var(--a);color:#fff}",
      ".ct-grade .btn.no{background:transparent;border:1.5px solid var(--no);color:var(--no)}",
      ".ct-fb{font-size:14.5px;margin:0}",
      ".ct-fb.ok{color:var(--a)}",
      ".ct-fb.miss{color:var(--no)}",
      ".ct-sum{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px;margin:8px 0 14px}",
      ".ct-sum h3{margin:0 0 8px;font-size:18px}",
      ".ct-sum ul{margin:8px 0 12px;padding-left:20px;font-size:15px;line-height:1.8}",
      ".ct-sum ul button{margin-left:6px}",
      ".ct-empty{font-size:15px;color:var(--muted);padding:12px 0}",
      ".tree-row .ct-src-sec{font-size:14px;color:var(--muted);margin-left:6px}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ---------- 状态 ---------- */
  var mount = document.getElementById("cueTrainer");
  if (!mount || !CUES.length) return;
  injectStyle();

  var ui = readUI();
  var mode = ui.mode === "list" ? "list" : "train";
  var curCh = (ui.ch && (ui.ch === "all" || CH_NAMES[ui.ch])) ? String(ui.ch) : "all";
  var curSec = null;   // 按小节出题（图谱「测一测本节题干信号」或 #tab=tree&sec=<id>）；不持久化
  var queue = [], idx = 0, revealed = false, graded = false, roundRight = 0, roundWrong = 0, missed = [], dueInRound = 0;
  var chapters = Object.keys(CH_NAMES).map(Number).sort(function (a, b) { return a - b; });

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pool() {
    if (curSec) return CUES.filter(function (c) { return c.sec === curSec; });
    return curCh === "all" ? CUES.slice() : CUES.filter(function (c) { return String(c.ch) === curCh; });
  }

  /* 组卷：上次没想到的 → 没练过的 → 想对过的，每组内打乱 */
  function buildQueue(onlyIds) {
    var last = latestResults();
    var src = pool();
    if (onlyIds) src = src.filter(function (c) { return onlyIds.indexOf(c.id) >= 0; });
    var wrong = [], fresh = [], right = [];
    src.forEach(function (c) {
      if (last[c.id] === false) wrong.push(c);
      else if (last[c.id] === true) right.push(c);
      else fresh.push(c);
    });
    var q = shuffle(wrong).concat(shuffle(fresh), shuffle(right));
    if (curCh === "all" && !curSec && !onlyIds) q = q.slice(0, MIXED_ROUND);
    queue = q; idx = 0; revealed = false; graded = false; roundRight = 0; roundWrong = 0; missed = [];
    dueInRound = queue.filter(function (c) { return last[c.id] === false; }).length;
  }

  /* ---------- 渲染 ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function mathHtml(s) {
    var html = String(s);
    // Protect TeX before the browser parses comparison signs as HTML tags.
    return window.PEIYU_WIKI_HTML ? window.PEIYU_WIKI_HTML(html) : esc(html);
  }
  function secName(sid) { return SEC_META[sid] ? SEC_META[sid].name : sid; }
  function chLabel(ch) { return (CH_NAMES[ch] || ("第 " + ch + " 章")).replace(/（.*$/, ""); }

  function renderTop() {
    var pills = [];
    if (curSec) {
      pills.push('<button type="button" class="w-pill on" data-ct-sec-clear aria-label="退出本节模式">📍 本节：' + esc(secName(curSec)) + "（" + pool().length + " 条）✕</button>");
    }
    pills.push('<button type="button" class="w-pill' + (!curSec && curCh === "all" ? " on" : "") + '" data-ct-ch="all">跨章混合</button>');
    chapters.forEach(function (ch) {
      pills.push('<button type="button" class="w-pill' + (!curSec && curCh === String(ch) ? " on" : "") + '" data-ct-ch="' + ch + '">' + esc(chLabel(ch)) + "</button>");
    });
    return (
      '<div class="ct-top">' +
        '<div class="ct-mode" role="group" aria-label="模式">' +
          '<button type="button" data-ct-mode="train"' + (mode === "train" ? ' class="on"' : "") + '>🧠 先想再揭晓</button>' +
          '<button type="button" data-ct-mode="list"' + (mode === "list" ? ' class="on"' : "") + '>📋 查表模式</button>' +
        "</div>" +
      "</div>" +
      '<div class="w-bar" role="group" aria-label="选择范围">' + pills.join("") + "</div>"
    );
  }

  function renderTrainer() {
    var total = queue.length;
    if (!total) return '<p class="ct-empty">' + (curSec ? "这一节还没有题干信号，先练本章的吧。" : "这一章还没有题干信号。") + "</p>";
    if (idx >= total) return renderSummary();
    var c = queue[idx];
    var html =
      '<div class="ct-prog">' +
        "<span>第 <b>" + (idx + 1) + "</b> / " + total + " 条</span>" +
        "<span>想对 <b>" + roundRight + "</b> · 没想到 <b>" + roundWrong + "</b></span>" +
        (dueInRound ? '<span class="ct-due">本轮含上次没想到的 ' + dueInRound + " 条，已排在前面</span>" : "") +
      "</div>" +
      '<div class="ct-card" id="ctCard">' +
        '<span class="ct-tag">🎯 题干信号' + (curCh !== "all" ? " · " + esc(chLabel(c.ch)) : "") + "</span>" +
        '<p class="ct-cue">' + mathHtml(c.cue) + "</p>";
    if (!revealed) {
      html +=
        '<p class="ct-ask">先别往下看。在心里说出：<b>第一步做什么、用哪条工具</b>。想好了再揭晓。</p>' +
        '<div class="ct-row">' +
          '<button type="button" class="btn" data-ct="reveal">我想好了，揭晓</button>' +
          '<button type="button" class="btn ghost" data-ct="skip">跳过这条</button>' +
          '<span class="ct-kbd">回车 = 揭晓</span>' +
        "</div>";
    } else {
      var card = BY_ID[c.card];
      html +=
        '<div class="key ct-act"><b>该怎么想：</b>' + mathHtml(c.act) + "</div>" +
        '<div class="ct-src">' +
          "<span>出自 " + esc(secName(c.sec)) + "</span>" +
          (card ? '<button type="button" class="w-rel" data-goto="' + c.card + '">🔗 ' + esc(c.label) + "</button>" : "") +
          '<a href="lessons/' + c.sec + '.html#step4">📝 去本节练一练</a>' +
        "</div>";
      if (!graded) {
        html +=
          '<div class="ct-grade" role="group" aria-label="自评">' +
            "<span>你刚才想的和这个一样吗？</span>" +
            '<button type="button" class="btn yes" data-ct="yes">👍 想对了</button>' +
            '<button type="button" class="btn no" data-ct="no">👎 没想到</button>' +
            '<span class="ct-kbd">1 = 想对了 · 2 = 没想到</span>' +
          "</div>";
      } else {
        var last = queue[idx]._lastGrade;
        html +=
          '<div class="ct-grade">' +
            '<p class="ct-fb ' + (last ? "ok" : "miss") + '" aria-live="polite">' +
              (last ? "✓ 记下了：这条你会。" : "✓ 记下了：这条下一轮会先出。想看为什么，点上面的卡片。") +
            "</p>" +
            '<button type="button" class="btn" data-ct="next">' + (idx + 1 < total ? "下一条 →" : "看本轮小结") + "</button>" +
            '<span class="ct-kbd">回车 = 下一条</span>' +
          "</div>";
      }
    }
    html += "</div>";
    return html;
  }

  function renderSummary() {
    var total = roundRight + roundWrong;
    var html = '<div class="ct-sum" aria-live="polite"><h3>本轮小结：' + total + " 条，想对 " + roundRight + "，没想到 " + roundWrong + "</h3>";
    if (!total) {
      html += '<p class="small">这一轮全跳过了。再来一轮试试，想不出来也点揭晓，看一眼就是收获。</p>';
    } else if (!roundWrong) {
      html += '<p class="small">全对。换一章，或者切到跨章混合，难度会上来。</p>';
    } else {
      html += '<p class="small">没想到的这几条，建议点卡片看一遍“什么时候用”，再回来重练：</p><ul>';
      missed.forEach(function (c) {
        html += "<li>" + mathHtml(c.cue) + ' <button type="button" class="w-rel" data-goto="' + c.card + '">🔗 ' + esc(c.label) + "</button></li>";
      });
      html += "</ul>";
    }
    html += '<div class="ct-row">' +
      (roundWrong ? '<button type="button" class="btn" data-ct="retry-missed">只重练没想到的 ' + roundWrong + " 条</button>" : "") +
      '<button type="button" class="btn' + (roundWrong ? " ghost" : "") + '" data-ct="again">再来一轮</button>' +
      "</div></div>";
    return html;
  }

  function renderList() {
    var src = pool();
    if (!src.length) return '<p class="ct-empty">这一章还没有题干信号。</p>';
    var byCh = {};
    src.forEach(function (c) { (byCh[c.ch] = byCh[c.ch] || []).push(c); });
    var html = '<p class="small">卡壳时直接查：左边是题干里的信号，右边是第一步怎么做。点胶囊跳到对应方法卡。</p>';
    Object.keys(byCh).map(Number).sort(function (a, b) { return a - b; }).forEach(function (ch) {
      html += '<div class="tree-group"><h3>' + esc(CH_NAMES[ch] || ("第 " + ch + " 章")) + "</h3>";
      byCh[ch].forEach(function (c) {
        html +=
          '<div class="tree-row">' +
            "<div>" + mathHtml(c.cue) + "</div>" +
            '<span class="tree-arr">⟶</span>' +
            "<div>" + mathHtml(c.act) + ' <button type="button" class="w-rel" data-goto="' + c.card + '">查看：' + esc(c.label) + "</button>" +
              '<span class="ct-src-sec">' + esc(secName(c.sec)) + "</span></div>" +
          "</div>";
      });
      html += "</div>";
    });
    return html;
  }

  function render(focusSel) {
    mount.innerHTML = renderTop() + '<div id="ctBody">' + (mode === "train" ? renderTrainer() : renderList()) + "</div>";
    math(mount);
    if (focusSel) {
      var f = mount.querySelector(focusSel);
      if (f) f.focus({ preventScroll: true });
    }
  }

  /* ---------- 交互 ---------- */
  function grade(ok) {
    var c = queue[idx];
    c._lastGrade = ok;
    graded = true;
    if (ok) roundRight++; else { roundWrong++; missed.push(c); }
    log(c.sec, "cue", { id: c.id, ch: c.ch, card: c.card, correct: ok });
  }
  function next() { idx++; revealed = false; graded = false; }

  mount.addEventListener("click", function (ev) {
    var modeBtn = ev.target.closest("[data-ct-mode]");
    if (modeBtn) {
      mode = modeBtn.getAttribute("data-ct-mode");
      saveUI();
      if (mode === "train") buildQueue();
      render();
      return;
    }
    if (ev.target.closest("[data-ct-sec-clear]")) {
      curSec = null;
      if (mode === "train") buildQueue();
      render();
      return;
    }
    var chBtn = ev.target.closest("[data-ct-ch]");
    if (chBtn) {
      curSec = null;
      curCh = chBtn.getAttribute("data-ct-ch");
      saveUI();
      if (mode === "train") buildQueue();
      render();
      return;
    }
    var act = ev.target.closest("[data-ct]");
    if (!act) return;
    var what = act.getAttribute("data-ct");
    if (what === "reveal") { revealed = true; render('[data-ct="yes"]'); }
    else if (what === "skip") { next(); render('[data-ct="reveal"]'); }
    else if (what === "yes") { grade(true); render('[data-ct="next"]'); }
    else if (what === "no") { grade(false); render('[data-ct="next"]'); }
    else if (what === "next") { next(); render('[data-ct="reveal"]'); }
    else if (what === "again") { buildQueue(); render('[data-ct="reveal"]'); }
    else if (what === "retry-missed") { buildQueue(missed.map(function (c) { return c.id; })); render('[data-ct="reveal"]'); }
    if (what && what !== "reveal") {
      var card = document.getElementById("ctCard") || mount.querySelector(".ct-sum");
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /* 键盘：只在训练器所在标签页可见、且焦点不在输入框时生效 */
  document.addEventListener("keydown", function (ev) {
    if (mode !== "train") return;
    var sec = mount.closest("section");
    if (!sec || !sec.classList.contains("on")) return;
    var tag = (ev.target && ev.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var sel = null;
    if (ev.key === "Enter") sel = revealed ? (graded ? '[data-ct="next"]' : null) : '[data-ct="reveal"]';
    else if (ev.key === "1" && revealed && !graded) sel = '[data-ct="yes"]';
    else if (ev.key === "2" && revealed && !graded) sel = '[data-ct="no"]';
    if (!sel) {
      if (ev.key === "Enter" && idx >= queue.length) sel = '[data-ct="again"]';
      if (!sel) return;
    }
    var btn = mount.querySelector(sel);
    if (btn && !(ev.key === "Enter" && ev.target === btn)) { ev.preventDefault(); btn.click(); }
  });

  /* ---------- 启动 ---------- */
  function boot() {
    var h = bootHash;
    var m = h.match(/(?:^|[#&])ch=(\d+)/);
    var ms = h.match(/(?:^|[#&])sec=([a-z0-9-]+)/);
    if (/tab=tree/.test(h)) {
      if (m && CH_NAMES[m[1]]) { curCh = m[1]; saveUI(); }
      if (ms && SEC_META[ms[1]]) { curSec = ms[1]; mode = "train"; }
      var tabBtn = document.querySelector('#mainTabs [data-tab="tree"]');
      if (tabBtn) setTimeout(function () { tabBtn.click(); }, 0);
    }
    if (mode === "train") buildQueue();
    render();
  }
  function ready() {
    Promise.resolve(window.PEIYU_WIKI_GRAPH_READY).then(boot).catch(function () {
      mount.textContent = "知识图谱加载失败，请刷新重试。";
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();

  window.PEIYU_CUE_TRAINER = {
    rebuild: function () { buildQueue(); render(); },
    cueCount: function (sid) { return CUES.filter(function (c) { return c.sec === sid; }).length; },
    /* 图谱「测一测本节题干信号」：只出这一节，切到训练器标签页 */
    startSec: function (sid) {
      if (!SEC_META[sid]) return;
      curSec = sid; mode = "train"; saveUI();
      buildQueue(); render('[data-ct="reveal"]');
      var tabBtn = document.querySelector('#mainTabs [data-tab="tree"]');
      if (tabBtn) tabBtn.click();
      setTimeout(function () { mount.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    }
  };
})();
