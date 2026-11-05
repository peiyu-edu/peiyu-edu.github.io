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
/* 培玉 · 高中数学 — Wiki 与教材主线（73 节）有机融合引擎
   自动为四个触点赋能：
   1. 全站顶栏注入「⚡ 知识速查 Wiki」入口 + 全局卡片弹窗；
   2. 主页 (index.html)：顶部「章节 + 方法卡」即时搜索框 + 每章底部自动挂载「本章核心方法与红线胶囊」；
   3. 课程页 (lessons/*.html)：
      - 标题下自动生成「🕸️ 前置 → 当前 → 本节方法卡 → 后置」知识脉络条；
      - 「讲清楚」末尾与「高考真题」顶部自动挂载「🧰 本节解题方法与红线胶囊条」（点击原地展开，不跳页）；
      - 「高考真题」每道题自动匹配对应的方法卡，提供「💡 锦囊：点击原地看套路」按钮；
   4. 记录页 (record.html)：根据本地错题记录自动诊断并点亮「🎯 待攻克的薄弱知识与方法卡」。 */
(function () {
  "use strict";

  var isLesson = /\/lessons\//.test(location.pathname);
  var ROOT = isLesson ? "../" : "";

  /* ==================== 已搭载等距 3D 数学实验台的 30 节核心课程（5 册 15 章 100% 全章覆盖 + 立几/空向 100% 全节覆盖） ==================== */
  var ISO_SECS = {
    "b1-1-3": "Venn摩根光栅台",
    "b1-2-2": "赵爽平面拼图",
    "b1-3-2": "奇偶旋转折叠台",
    "b1-4-4": "指对y=x反射镜",
    "b1-5-4": "单位圆相位仪",
    "b1-5-6": "三角双轨变速台",
    "b2-6-2": "向量测功台",
    "b2-6-4": "正余弦外接圆台",
    "b2-7-2": "复平面旋转台",
    "b2-8-1": "旋转体车削台",
    "b2-8-2": "斜二测半倍夹具",
    "b2-8-3": "祖暅截面台",
    "b2-8-4": "异面平移造角台",
    "b2-8-5": "线面平行激光台",
    "b2-8-6": "二面角铰链台",
    "b2-9-2": "箱线图分拣台",
    "b2-10-1": "分流抽样机",
    "e1-1-1": "空间平行四边形台",
    "e1-1-2": "三维龙门基底",
    "e1-1-3": "八卦限对称卡尺",
    "e1-1-4": "法向激光测距",
    "e1-2-5": "双圆公切线滑轨",
    "e1-3-1": "双焦椭圆仪",
    "e1-3-2": "双曲线渐近台",
    "e1-3-3": "抛物线光学台",
    "e2-4-2": "等差倒序阶梯台",
    "e2-5-1": "割线千分表台",
    "e3-6-3": "帕斯卡金字塔",
    "e3-7-5": "高尔顿落球仪",
    "e3-8-1": "残差弹簧平衡杆"
  };

  /* ==================== 必修一全覆盖（24 节，28 张高密度原子卡片） ==================== */
    var CARDS = [
    {
      id: "set-def-distinct", ch: 1, sec: "b1-1-1", secName: "1.1 集合的概念",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "集合互异性检验与描述法“看代表元”",
      keywords: ["互异性", "代表元", "点集", "数集", "列举法", "描述法"],
      trig: "含参列举法集合求参数（如 \\(2\\in\\{1,a,a^2-a\\}\\)），或判断两个描述法集合的交集。",
      key: "1. <b>含参列举式必须检验互异性</b>：求出参数后，代回逐项比较；只要有元素重复，这个参数值就一律舍去。列举法写出的集合，元素必须互不相同，否则这个集合本身就写不出来，所以检验互异性是解题的一部分。<br>2. <b>描述法先看竖线前的代表元</b>：\\(\\{x\\mid y=f(x)\\}\\) 是定义域数集，\\(\\{y\\mid y=f(x)\\}\\) 是值域数集，\\(\\{(x,y)\\mid y=f(x)\\}\\) 是<b>坐标点集</b>。",
      warn: "即使只问某数是否属于集合，重复的参数值也要舍去，不能先合并重复元素再保留参数。数集与点集的元素类型不同，交集为 \\(\\varnothing\\)。",
      more: "例：\\(2\\in\\{1,a,a^2-a\\}\\)。由 \\(a=2\\) 或 \\(a^2-a=2\\)，解得 \\(a=2\\) 或 \\(a=-1\\)。代入检验：\\(a=2\\) 时列举式为 \\(\\{1,2,2\\}\\)，违背互异性，舍去；\\(a=-1\\) 时为 \\(\\{1,-1,2\\}\\)，元素互不相同，故 \\(a=-1\\)。",
      rel: ["set-empty-trap", "set-ops-demorgan"]
    },
    {
      id: "set-empty-trap", lab: "set-empty-trap", ch: 1, sec: "b1-1-2", secName: "1.2 集合间的基本关系",
      kind: "pitfall", kindLabel: "🔴 易错红线",
      title: "含参子集分类讨论先查空集与子集计数",
      keywords: ["空集", "子集", "真子集", "包含", "端点", "参数"],
      trig: "题干出现 \\(A\\subseteq B\\)、\\(A\\cap B=A\\) 或 \\(A\\cup B=B\\)，且子集 \\(A\\) 含参数。",
      key: "1. <b>等价转化</b>：\\(A\\cap B=A \\iff A\\subseteq B\\)；\\(A\\cup B=B \\iff A\\subseteq B\\)；\\(A\\cup B=A \\iff B\\subseteq A\\)。<br>2. <b>分类讨论两步走</b>：<br>① <b>先查 \\(A=\\varnothing\\)</b>：一次方程系数为 0 无解，或二次方程判别式 \\(\\Delta < 0\\)，或连续区间左端点大于右端点；<br>② <b>再令 \\(A\\ne\\varnothing\\)</b>：画数轴列不等式，<b>两端点能否取等号单独代入验证</b>。<br>3. <b>子集计数</b>：含 \\(n\\) 个元素的有限集有 \\(2^n\\) 个子集、\\(2^n-1\\) 个真子集、\\(2^n-2\\) 个非空真子集（\\(n\\ge 1\\)）。",
      warn: "严格区分 \\(\\varnothing\\)（空集，不含任何元素）、\\(0\\)（实数，不是集合）、\\(\\{0\\}\\)（含一个元素 0 的单元素集）与 \\(\\{\\varnothing\\}\\)（含一个元素 \\(\\varnothing\\) 的单元素集）。漏掉 \\(A=\\varnothing\\) 是高一含参集合题头号失分原因！",
      more: "口诀：“子集含参先查空，数轴标根验端点”。当子集 \\(A\\) 的元素由方程或不等式给出时，无论是否含参，第一反应都要问：“这个集合有没有可能根本没有元素？”。",
      rel: ["set-def-distinct", "logic-subset"]
    },
    {
      id: "set-ops-demorgan", ch: 1, sec: "b1-1-3", secName: "1.3 集合的基本运算",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "交并补数轴运算与 Venn 图摩根定律",
      keywords: ["交集", "并集", "补集", "全集", "摩根", "Venn"],
      trig: "求区间交并补、\\(\\complement_U(A\\cup B)\\) 或利用 Venn 图计数。",
      key: "• <b>并之补 = 补之交</b>：\\(\\complement_U(A\\cup B) = \\complement_U A\\cap \\complement_U B\\)<br>• <b>交之补 = 补之并</b>：\\(\\complement_U(A\\cap B) = \\complement_U A\\cup \\complement_U B\\)<br>• <b>元素个数容斥</b>：\\(n(A\\cup B) = n(A) + n(B) - n(A\\cap B)\\)（也记作 \\(\\operatorname{card}(A\\cup B) = \\operatorname{card}(A)+\\operatorname{card}(B)-\\operatorname{card}(A\\cap B)\\)）<br>• <b>数轴运算法则</b>：交集 \\(A\\cap B\\) 取重叠公共段；并集 \\(A\\cup B\\) 取全部覆盖区域。",
      warn: "求区间补集时，<b>原集合开端点变闭端点，闭端点变开端点</b>（如 \\([1,3)\\) 在 \\(\\mathbf R\\) 中的补集是 \\((-\\infty,1)\\cup[3,+\\infty)\\)）。全集 \\(U\\) 必须看清是 \\(\\mathbf R\\) 还是整数集 \\(\\mathbf Z\\)。",
      more: "在抽象集合与计数题中，画两个相交圆把全集 \\(U\\) 分成 4 块区域逐块标数或涂色，比纯代数变形直观且不漏。属于 \\(A\\) 但不属于 \\(B\\) 的部分即 \\(A\\cap\\complement_U B\\)。",
      rel: ["set-def-distinct", "logic-subset"]
    },
    {
      id: "logic-subset", ch: 1, sec: "b1-1-4", secName: "1.4 充分条件与必要条件",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "充分必要条件的集合判断法：“小范围推大范围”",
      keywords: ["充分", "必要", "充要", "小范围", "大范围", "充分不必要"],
      trig: "判断充分/必要/充要条件，或已知充分不必要、必要不充分条件反求参数范围。",
      key: "在同一研究范围内，设条件 \\(p,q\\) 对应的解集分别为 \\(P,Q\\)：<br>1. <b>核心法则（小范围推大范围）</b>：若 \\(P\\subseteq Q\\)，则 \\(p\\Rightarrow q\\)（\\(p\\) 是 \\(q\\) 的充分条件，\\(q\\) 是 \\(p\\) 的必要条件）；<br>2. <b>四种关系对应</b>：<br>• 若 \\(P\\subsetneqq Q\\)（\\(P\\) 是 \\(Q\\) 的真子集），则 \\(p\\) 是 \\(q\\) 的<b>充分不必要条件</b>；<br>• 若 \\(Q\\subsetneqq P\\)（即 \\(P\\supsetneqq Q\\)），则 \\(p\\) 是 \\(q\\) 的<b>必要不充分条件</b>；<br>• 若 \\(P=Q\\)，则 \\(p\\) 与 \\(q\\) <b>互为充要条件</b>（\\(p\\iff q\\)）；<br>• 若 \\(P\\not\\subseteq Q\\) 且 \\(Q\\not\\subseteq P\\)，则 \\(p\\) 是 \\(q\\) 的<b>既不充分也不必要条件</b>。",
      warn: "1. 审题句式陷阱：“\\(p\\) 是 \\(q\\) 的充分条件”代表 \\(p\\Rightarrow q\\)；而“\\(p\\) 的充分条件是 \\(q\\)”主语是充分条件 \\(q\\)，代表 \\(q\\Rightarrow p\\)！<br>2. 空集也是子集：若 \\(p\\) 的解集为空集 \\(P=\\varnothing\\)，由 \\(\\varnothing\\subseteq Q\\) 可知 \\(P\\subseteq Q\\) 恒成立；当 \\(Q\\ne\\varnothing\\) 时仍然有 \\(P\\subsetneqq Q\\)，此时 \\(p\\) 仍是 \\(q\\) 的充分不必要条件。",
      more: "证充分性不能代替证必要性；要否定“\\(p\\Rightarrow q\\)”只需举出一个满足条件 \\(p\\) 但不满足条件 \\(q\\) 的反例即可。",
      rel: ["set-empty-trap", "logic-negation"]
    },
    {
      id: "logic-negation", ch: 1, sec: "b1-1-5", secName: "1.5 全称量词与存在量词",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "量词命题的否定三步曲与恒成立转化",
      keywords: ["全称", "存在", "量词", "否定", "任意", "恒成立"],
      trig: "写出含 \\(\\forall\\) 或 \\(\\exists\\) 命题的否定，或将全称/存在命题转化为最值。",
      key: "1. <b>命题的否定</b>：论域 \\(x\\in M\\) 不变，改量词（\\(\\forall\\leftrightarrow\\exists\\)），否结论：<br>• \\(\\neg(\\forall x\\in M,\\ p(x))\\iff\\exists x\\in M,\\neg p(x)\\)<br>• \\(\\neg(\\exists x\\in M,\\ p(x))\\iff\\forall x\\in M,\\neg p(x)\\)<br>2. <b>最值转化有前提</b>：仅在 \\(D\\ne\\varnothing\\) 且相应最值存在时，才有<br>• \\(\\forall x\\in D,\\ a\\ge f(x)\\iff a\\ge f_{\\max}\\)；<br>• \\(\\exists x\\in D,\\ a\\ge f(x)\\iff a\\ge f_{\\min}\\)。无最值时须根据实际值域、端点可取性另判。",
      warn: "否定“所有都”应改成“存在不”；\\(>\\) 的否定为 \\(\\le\\)。例如 \\(D=(0,1),f(x)=x\\) 没有最大、最小值，不能把端点 \\(0\\) 当作最小值；\\(\\exists x\\in(0,1),a\\ge x\\) 等价于 \\(a>0\\)，不是 \\(a\\ge0\\)。",
      rel: ["logic-subset", "zero-theorem"]
    },
    {
      id: "ineq-props-diff", ch: 2, sec: "b1-2-1", secName: "2.1 等式性质与不等式性质",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "作差法比大小与“待定系数整体代换”防范围扩大",
      keywords: ["作差", "不等式性质", "倒数", "整体代换", "范围"],
      trig: "代数式比大小；或已知 \\(a+b,\\ a-b\\) 的范围求 \\(pa+qb\\) 的范围。",
      key: "<b>作差比大小</b>：算 \\(A-B\\)，用因式分解、配方或通分等方法变形，再判定差是正、零还是负，分别得到 \\(A>B\\)、\\(A=B\\)、\\(A<B\\)。<br>1. <b>同向可加不可减，同正可乘不可除</b>：减法化为加相反数 \\(a+(-b)\\)。<br>2. <b>倒数比较先查顺序与符号</b>：已知 \\(a>b\\) 且 \\(ab\\ne0\\) 时，\\(\\dfrac1a<\\dfrac1b\\iff ab>0\\)。一般比较可由 \\(\\dfrac1a-\\dfrac1b=\\dfrac{b-a}{ab}\\) 判号。<br>3. <b>整体代换</b>：已知 \\(u=a+b,\\ v=a-b\\) 的范围求 \\(3a+b\\)，<b>必设 \\(3a+b = m(a+b)+n(a-b)\\)</b> 解出 \\(m=2,n=1\\) 一步合成。",
      warn: "切忌先单独求出 \\(a\\)、\\(b\\) 的范围，再直接组合成 \\(pa+qb\\) 的范围——\\(a,b\\) 相互制约，各自取到端点的条件可能不能同时满足，所得范围可能被放大！",
      rel: ["amgm-core", "quad-param"]
    },
    {
      id: "amgm-const-one", ch: 2, sec: "b1-2-2", secName: "2.2 基本不等式",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "常数代换法（乘“1”法）求分式与整式最值",
      keywords: ["乘“1”", "乘1", "常数代换", "1/a", "1/b", "分式"],
      trig: "已知整式和 \\(ma+nb=c\\)（定值），求分式和 \\(\\dfrac{p}{a}+\\dfrac{q}{b}\\) 的最小值（或反之）。",
      key: "<b>先查条件，再构造1</b>：已知 \\(ma+nb=c\\) 时，只有 \\(c\\ne0\\) 才能写 \\((ma+nb)/c=1\\)。分母 \\(a,b\\) 须非零；使用基本不等式时，参与比较的两项还须为正。<br><b>例</b>：若 \\(a>0,b>0,a+2b=1\\)，则 \\[\\begin{aligned}\\frac1a+\\frac1b&=\\left(\\frac1a+\\frac1b\\right)(a+2b)\\\\&=3+\\frac{2b}{a}+\\frac ab\\\\&\\ge3+2\\sqrt2.\\end{aligned}\\]取等要求 \\(a=\\sqrt2\\,b\\)，联立题设得 \\(a=\\sqrt2-1,\\ b=(2-\\sqrt2)/2\\)，确实可取。一般系数或范围变化时，须重新检查正性、定值与取等可行性。",
      warn: "不能只见整式和固定就断言最小值存在。只给 \\(a+2b=1\\) 且允许负数时，取 \\(a<0\\) 且越来越接近 \\(0\\)，令 \\(b=(1-a)/2\\)，则 \\(1/a\\) 越来越小而 \\(1/b\\) 接近 \\(2\\)，所求值可无限减小。分母为 \\(a+1\\) 时可以换元，但仍须按已知等式构造1，不能自行假定 \\((a+1)+b\\) 为定值。",
      rel: ["amgm-core", "amgm-shift"]
    },
    {
      id: "amgm-core", ch: 2, sec: "b1-2-2", secName: "2.2 基本不等式",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "基本不等式链与“一正二定三相等”铁律",
      keywords: ["基本不等式", "均值", "和一定", "积一定", "a²+b²", "正数"],
      trig: "两正数的和、积、平方和互化与最值求解。",
      key: "对 \\(a>0,b>0\\)（当且仅当 \\(a=b\\) 时取等）：<br>$$\\begin{gathered}\\frac{2}{\\dfrac{1}{a}+\\dfrac{1}{b}} \\le \\sqrt{ab} \\le \\frac{a+b}{2}\\\\\\frac{a+b}{2} \\le \\sqrt{\\frac{a^2+b^2}{2}}\\end{gathered}$$<br>• <b>积定和最小</b>：\\(ab=P \\Rightarrow a+b\\ge 2\\sqrt{P}\\)；<b>和定积最大</b>：\\(a+b=S \\Rightarrow ab\\le\\dfrac{S^2}{4}\\)。<br>• 对<b>任意实数 \\(a,b\\in\\mathbf R\\)</b> 恒成立：\\(a^2+b^2\\ge 2ab\\)，\\(ab\\le\\left(\\dfrac{a+b}{2}\\right)^2\\)。",
      warn: "不等式本身只需核对适用的正数条件；积或和不固定时也能使用，但若右侧还随变量变化，就不能直接把它当作最小值。<b>利用它求最值时</b>，要得到固定的界，并检查等号能否在题目允许的范围内成立。连续使用多次时，各处等号须能同时成立，才能得到最值。",
      rel: ["amgm-const-one", "amgm-shift", "amgm-hook"]
    },
    {
      id: "amgm-hook", lab: "amgm-hook", ch: 2, sec: "b1-2-2", secName: "2.2 基本不等式",
      kind: "pitfall", kindLabel: "🔴 易错红线",
      title: "对勾函数 f(x)=x+k/x 性质与“等号取不到”急救",
      keywords: ["等号", "取不到", "对勾", "下界", "单调性"],
      trig: "基本不等式算出的等号点 \\(x=\\sqrt{k}\\) 不在题目允许的区间 \\([m,n]\\) 内。",
      key: "对勾函数 \\(f(x)=x+\\dfrac{k}{x}\\)（\\(k>0\\)）在 \\((0,\\sqrt{k}]\\) <b>递减</b>，在 \\([\\sqrt{k},+\\infty)\\) <b>递增</b>。<br>• 若题目限定 \\(x\\ge m > \\sqrt{k}\\)，等号取不到，函数在该区间单调递增，<b>最小值在左端点 \\(x=m\\) 处取得，为 \\(m+\\dfrac{k}{m}\\)</b>！",
      warn: "得到 \\(f(x)\\ge 2\\sqrt{k}\\) 只代表 \\(2\\sqrt{k}\\) 是一个下界，必须检验 \\(x=\\sqrt{k}\\) 是否在定义域内才能断言它是最小值。",
      rel: ["amgm-core", "fn-mono-def"]
    },
    {
      id: "amgm-shift", ch: 2, sec: "b1-2-2", secName: "2.2 基本不等式",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "配凑分母法与换元分离常数法",
      keywords: ["配凑", "分离常数", "分母", "化简"],
      trig: "求 \\(x+\\dfrac{k}{x-a}\\)（\\(k>0,\\ x>a\\)）的最小值，或先将二次除以一次的分式作除法、换元，再按系数与定义域求最值。",
      key: "核心：<b>分母是什么，就把整式配凑成什么</b>：<br>• 当 \\(x>1\\) 时，\\(x+\\dfrac{4}{x-1}=(x-1)+\\dfrac{4}{x-1}+1\\ge5\\)，在 \\(x=3\\) 取等。<br>• 令分母 \\(t=x-a>0\\)，将 \\(x=t+a\\) 代回分子，展开后逐项除以 \\(t\\)。若化为 \\(pt+\\dfrac{q}{t}+m\\)，须先核 \\(p>0,q>0\\)，才能用两正项得下界 \\(2\\sqrt{pq}+m\\)；还须检查取等点 \\(t=\\sqrt{q/p}\\) 是否允许。",
      warn: "对 \\(x+\\dfrac{k}{x-a}\\)，当 \\(k>0,x&lt;a\\) 时，令 \\(t=a-x>0\\)，原式为 \\(a-(t+k/t)\\le a-2\\sqrt{k}\\)，这是<b>上界</b>，在 \\(x=a-\\sqrt{k}\\) 允许时取到最大值。\\(k\\le0\\) 或一般分式换元后系数不满足正性时，不能照套此法，须另查单调性与定义域。",
      rel: ["amgm-core", "amgm-hook"]
    },
    {
      id: "quad-always-true", lab: "quad-always-true", ch: 2, sec: "b1-2-3", secName: "2.3 二次函数与一元二次方程、不等式",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "二次不等式在全实数域 vs 在闭区间上恒成立",
      keywords: ["恒成立", "分离参数", "闭区间", "零点"],
      trig: "已知二次不等式对任意 \\(x\\in\\mathbf R\\) 或对 \\(x\\in[m,n]\\) 恒成立求参数。",
      key: "• <b>在 \\(\\mathbf R\\) 上恒有 \\(ax^2+bx+c>0\\)</b>：若题目指明是二次不等式（\\(a\\ne0\\)），条件为 \\(a>0\\) 且 \\(\\Delta=b^2-4ac<0\\)。若未限定二次且 \\(a\\) 含参，还须讨论 \\(a=0\\)：此时只有 \\(b=0,c>0\\) 才恒成立。<br>• <b>在闭区间 \\(x\\in[m,n]\\) 上恒成立</b>：不能直接套 \\(\\Delta<0\\)。可分离参数（如化为 \\(a>g(x)\\)，在最大值可取时转为 \\(a>g_{\\max}\\)），或按对称轴与区间位置求原式最小值，再要求它大于 \\(0\\)。",
      warn: "先查二次项系数是否可能为 \\(0\\)。若全实数域上的条件改为 \\(ax^2+bx+c\\ge0\\)，二次情形应为 \\(a>0,\\Delta\\le0\\)；常数情形应为 \\(a=b=0,c\\ge0\\)，别漏等号。",
      rel: ["quad-param", "fn-mono-def"]
    },
    {
      id: "quad-param", ch: 2, sec: "b1-2-3", secName: "2.3 二次函数与一元二次方程、不等式",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "含参一元二次不等式分类讨论“三步曲”",
      keywords: ["二次不等式", "含参", "判别式", "两根", "因式分解"],
      trig: "解含参数 \\(a\\) 的二次不等式（如 \\(ax^2-(a+2)x+2 < 0\\)）。",
      key: "先审题：若明确是“一元二次不等式”，则已有 \\(a\\ne0\\)；否则须先查 \\(a=0\\)。按三步顺序讨论：<br>1. <b>一查最高次系数 \\(a\\)</b>：未排除 \\(a=0\\) 时先讨论（退化为一次或常数不等式），再分 \\(a>0\\)（开口向上）、\\(a < 0\\)（开口向下）；<br>2. <b>二看因式分解与 \\(\\Delta\\)</b>：能十字相乘的直接求根，不能分解的按 \\(\\Delta>0,\\ =0,\\ <0\\) 讨论；<br>3. <b>三比两根 \\(x_1,x_2\\) 大小</b>：确定谁在左谁在右（含 \\(x_1=x_2\\) 重根）。",
      warn: "已知 \\(ax^2+bx+c>0\\) 解集在两根之间，必然隐含<b>开口向下 \\(a < 0\\)</b>，列根与系数的关系后，须联立 \\(a<0\\) 求参数范围，避免增解。",
      rel: ["quad-always-true", "ineq-props-diff"]
    },
    {
      id: "fn-dom-same", lab: "fn-dom-same", ch: 3, sec: "b1-3-1", secName: "3.1 函数的概念及其表示",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "同一函数判定、具体定义域与抽象复合定义域",
      keywords: ["定义域", "同一函数", "复合", "分段函数"],
      trig: "求具体或抽象函数 \\(f(g(x))\\) 的定义域，或判断两个函数是否相同。",
      key: "1. <b>自然定义域的限制</b>：分母 \\(\\ne0\\)、偶次根式被开方数 \\(\\ge0\\)、零次幂底数 \\(\\ne0\\)；对数真数 \\(>0\\)，底数 \\(>0\\) 且 \\(\\ne1\\)。<br>2. <b>同一函数</b>：<b>定义域相同</b> 且 <b>化简后对应关系一致</b>。<br>3. <b>抽象复合定义域</b>：定义域始终指自变量 \\(x\\) 的范围。已知 \\(f\\) 的定义域，就要求 \\(g(x)\\) 有意义且其值在该范围内。反求时不能一律把 \\(g(x)\\) 的值域当成 \\(f\\) 的完整定义域：如内层是 \\(x^2\\)，只能探明非负输入的情况；若内层是 \\(x+1\\)，已知 \\(f(x+1)\\) 的完整定义域为 \\([-2,3]\\)，则 \\(f\\) 的定义域为 \\([-1,4]\\)。",
      warn: "化简或约分前必须先求定义域！如 \\(f(x)=\\dfrac{x^2-1}{x-1}\\) 须保留 \\(x\\ne 1\\)，与 \\(g(x)=x+1\\) 不是同一函数。",
      rel: ["fn-mono-def", "fn-parity-core"]
    },
    {
      id: "fn-abstract-ineq", ch: 3, sec: "b1-3-2", secName: "3.2 函数的基本性质",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "奇偶性与单调性结合：脱去外层“f”解抽象不等式",
      keywords: ["抽象不等式","脱去外层","奇偶性与单调性结合"],
      trig: "已知 \\(f(x)\\) 的奇偶性和单调性，求解 \\(f(2x-1) < f(x+2)\\) 或 \\(f(x-1)+f(2x) < 0\\)。",
      key: "<b>分类标准步骤</b>：<br>• <b>奇函数</b>：由奇性将 \\(f(u)+f(v)<0\\) 化为 \\(f(u)<f(-v)\\)。若 \\(f\\) 在整个定义域上严格单调，直接按增减方向脱去 \\(f\\)；若仅在某段单调，先把 \\(u,-v\\) 变到同一单调区间内，做不到时须分情况讨论。<br>• <b>偶函数</b>：在对称定义域内有 \\(f(u)=f(|u|)\\)、\\(f(v)=f(|v|)\\)。若 \\(f\\) 在包含 \\(|u|,|v|\\) 的非负定义域区间上<b>严格递增</b>，则 \\(f(u)<f(v)\\iff |u|<|v|\\)；若在该区间上<b>严格递减</b>，则 \\(f(u)<f(v)\\iff |u|>|v|\\)。<br>• <b>必须同步联立定义域</b>：先要求 \\(u,v\\) 在定义域内，再核查变换后的自变量属于所用的同一单调区间；不可把“单调”一律当成递增。",
      warn: "绝不能只脱 \\(f\\) 而漏掉定义域！高考试题几乎总在定义域端点处设置多解或扣分陷阱。",
      more: "构造函数延伸：若题干给出“在区间 \\(I\\) 内，对任意 \\(x_1>x_2\\) 都有 \\(x_1f(x_1)>x_2f(x_2)\\)”，可构造 \\(F(x)=x\\cdot f(x)\\)，这就说明 \\(F\\) 在 \\(I\\) 上严格递增；还可按定义检验它的奇偶性。",
      rel: ["fn-mono-def", "fn-parity-core"]
    },
    {
      id: "fn-mono-def", lab: "fn-mono-def", ch: 3, sec: "b1-3-2", secName: "3.2 函数的基本性质",
      kind: "pitfall", kindLabel: "🔴 易错红线",
      title: "单调区间书写红线与分段函数全域单调条件",
      keywords: ["单调", "分段函数", "递增", "递减", "并集"],
      trig: "写分式函数单调区间，或已知分段函数在 \\(\\mathbf R\\) 上单调求参数范围。",
      key: "1. <b>单调区间分别列出</b>：如 \\(1/x\\) 的递减区间为 \\((-\\infty,0)\\) 和 \\((0,+\\infty)\\)，不要用并集符号连成一个“递减区间”。若要声称全定义域单调，还须比较不同区间的两点。<br>2. <b>分段函数全域递增</b>：各段内部递增之外，还须保证左段任意一点的函数值都小于右段任意一点的函数值。<br>例：\\(f(x)=x\\)（\\(x<0\\)），\\(f(x)=x+c\\)（\\(x\\ge0\\)）。左段的值都小于 \\(0\\)，右段从 \\(c\\) 起递增，所以全域递增要求 \\(c\\ge0\\)；\\(c=0\\) 也成立，因为左段取不到 \\(0\\)。",
      warn: "只查每段内部递增不够，还要查分界处是否“左低右高”。分界点不属于某段时，不能把代入该段解析式得到的数当作实际函数值；能否取到端点会影响衔接条件。",
      rel: ["fn-dom-same", "fn-abstract-ineq", "calc-monot-extrema"]
    },
    {
      id: "fn-odd-plus-c", ch: 3, sec: "b1-3-2", secName: "3.2 函数的基本性质",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "“奇函数 + 常数”对称中心与整体代换求值",
      keywords: ["奇函数+常数", "对称中心", "f(x)+f(-x)", "整体代换"],
      trig: "解析式形如 \\(f(x)=g(x)+c\\)（其中 \\(g(x)\\) 是奇函数），已知 \\(f(a)=m\\) 求 \\(f(-a)\\)，或求对称区间上的最值之和。",
      key: "1. <b>核心恒等式</b>：若 \\(f(x) = g(x) + c\\) 且 \\(g(-x)=-g(x)\\)，则 <b>\\(f(x)+f(-x)=2c\\)</b>（图象关于点 \\((0,c)\\) 中心对称）。<br>2. <b>对称求值</b>：\\(f(-a) = 2c - f(a)\\)，无需解出具体未知参数。<br>3. <b>对称区间最值定理</b>：若 \\(f(x)\\) 在关于原点对称的区间 \\([-m,m]\\) 上的最大值为 \\(M\\)、最小值为 \\(N\\)，则必有 <b>\\(M+N=2c\\)</b>！",
      warn: "奇函数向上平移 \\(c\\) 个单位后不再是奇函数（除非 \\(c=0\\)），而是关于点 \\((0,c)\\) 中心对称。",
      more: "例：设 \\(f(x)=ax^5+bx^3+cx+7\\)，若 \\(f(-3)=-5\\)，求 \\(f(3)\\)。<br>解：前半部分 \\(g(x)=ax^5+bx^3+cx\\) 为奇函数，故 \\(f(3)+f(-3)=2\\times 7=14 \\Rightarrow f(3)=19\\)。",
      rel: ["fn-parity-core"]
    },
    {
      id: "fn-parity-core", lab: "fn-parity-core", ch: 3, sec: "b1-3-2", secName: "3.2 函数的基本性质",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "奇偶性判别铁律与三大高频奇函数模型",
      keywords: ["奇函数", "偶函数", "奇偶性", "对称", "f(0)=0"],
      trig: "判断函数奇偶性、利用奇偶性求参或求解析式。",
      key: "1. <b>第一步必查定义域关于原点对称</b>（不对称直接非奇非偶）。<br>2. <b>奇函数若在 \\(x=0\\) 有定义，必有 \\(f(0)=0\\)</b>（求出参数后须代回检验）。<br>3. <b>三个常用奇函数模型，先查条件</b>：\\(\\dfrac{a^x-1}{a^x+1}\\) 要求 \\(a>0\\)，定义域为 \\(\\mathbf R\\)（\\(a=1\\) 是零函数）；\\(\\ln(\\sqrt{x^2+1}\\pm x)\\) 定义域为 \\(\\mathbf R\\)（两个真数均为正，乘积为 \\(1\\)；把 \\(x\\) 换为 \\(-x\\) 后真数互为倒数，故对数值互为相反数）；\\(\\ln\\dfrac{1+x}{1-x}\\) 定义域为 \\((-1,1)\\)。均在各自定义域上验证奇性。",
      warn: "已知 \\(x>0\\) 解析式求 \\(x < 0\\) 解析式时：设 \\(x < 0\\)，则 \\(-x > 0\\)，先算 \\(f(-x)\\) 再用 \\(f(x)=-f(-x)\\)（奇）或 \\(f(x)=f(-x)\\)（偶）转化。",
      rel: ["fn-odd-plus-c", "fn-abstract-ineq"]
    },
    {
      id: "fn-power-five", ch: 3, sec: "b1-3-3", secName: "3.3 幂函数",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "幂函数概念与第一象限“指大图高”图象规律",
      keywords: ["幂函数", "x^a", "第一象限", "定点"],
      trig: "由幂函数定义求参数，或比较不同幂函数图象与函数值。",
      key: "1. <b>定义</b>：\\(y=x^\\alpha\\) 的系数为1。本阶段重点为 \\(\\alpha=1,2,3,\\tfrac12,-1\\) 的五个函数；一般指数的系统分类属于后续或延伸。<br>2. <b>正半轴比较</b>：五个模型均过 \\((1,1)\\)；前四个在 \\((0,+\\infty)\\) 递增，\\(1/x\\) 在此递减。\\(x>1\\) 时指数越大函数值越大，\\(0<x<1\\) 时顺序相反。整个定义域上的性质仍须分函数、分区间研究。",
      warn: "\\(y=x^{-1}=\\dfrac1x\\) 在 \\((-\\infty,0)\\) 和 \\((0,+\\infty)\\) 上分别递减，但跨过 \\(0\\) 不能说在整个定义域上递减！",
      rel: ["exp-fn-prop", "explog-compare"]
    },
    {
      id: "fn-model-app", lab: "fn-model-app", ch: 3, sec: "b1-3-4", secName: "3.4 函数的应用（一）",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "实际应用建模：定义域实际约束与顶点/端点最值",
      keywords: ["应用", "分段", "建模", "最值"],
      trig: "围栏面积、阶梯计费、利润最大化等实际函数建模题。",
      key: "1. <b>先列实际定义域</b>：核边长正值、墙长、计费方式及整数可行性；定义域由实际条件决定，不能只看解析式；找到最优点后，也不能把定义域缩成只含最优点的一小段。<br>2. <b>二次模型先查任务与开口</b>：\\(f(x)=Ax^2+Bx+C\\)，\\(A\\ne0\\)。在有限闭区间 \\([L,U]\\) 上，开口向下求最大值、或开口向上求最小值时，才先查顶点横坐标 \\(-B/(2A)\\) 是否在区间内；可取时用顶点，不在时比较端点。<b>开口向上求最大、向下求最小，都比较两端值</b>，不能笼统说“顶点在内取顶点”。<br>3. <b>区间与可行性不能省</b>：开区间的端点不可取，可能只有上、下界而没有最值；若自变量能无限增大或减小，还要看函数值是否也能无限增大或减小，从而判断所求最值是否存在。整数输入应比较顶点附近的允许整数及边界；\\(A=0\\) 则另按一次或常函数处理。",
      warn: "分段计费先说明按实际时长连续计费，还是按档取整；界点归哪段、是否连续都由题意决定。核对分界处的真实费用，避免重复计费或漏掉基础档，不能默认所有分段函数都连续。",
      rel: ["quad-always-true", "amgm-hook"]
    },
    {
      id: "exp-root-power", ch: 4, sec: "b1-4-1", secName: "4.1 指数",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "偶次根式运算红线与平方互化对称求值",
      keywords: ["根式", "分数指数", "偶次", "平方"],
      trig: "根式与分数指数幂化简，或已知 \\(x+x^{-1}=m\\) 求 \\(x^{1/2}+x^{-1/2}\\)、\\(x^2+x^{-2}\\)。",
      key: "1. <b>根式铁律</b>：\\(n\\) 为奇数时 \\(\\sqrt[n]{a^n}=a\\)；<b>\\(n\\) 为偶数时 \\(\\sqrt[n]{a^n}=|a|\\)</b>。<br>2. <b>分数指数转化</b>：\\(a^{\\frac{m}{n}}=\\sqrt[n]{a^m}\\)，\\(a^{-\\frac{m}{n}}=\\dfrac{1}{\\sqrt[n]{a^m}}\\)（\\(a>0\\)）。<br>3. <b>对称幂升次桥</b>：\\(\\left(x^{1/2}\\pm x^{-1/2}\\right)^2 = x + x^{-1} \\pm 2\\)；\\((x+x^{-1})^2 = x^2+x^{-2}+2\\)。",
      warn: "注意隐含正负：因为 \\(x>0\\)，所以 \\(x^{1/2}+x^{-1/2} \\ge 2\\) 恒为正数，开方时只取正根。但 \\(x^{1/2}-x^{-1/2}\\) 在 \\(x>1\\) 时为正，\\(0<x<1\\) 时为负，\\(x=1\\) 时为 \\(0\\)；由平方求它的值时须先判符号。",
      rel: ["exp-fn-prop", "log-change-base"]
    },
    {
      id: "exp-fn-prop", lab: "exp-fn-prop", ch: 4, sec: "b1-4-2", secName: "4.2 指数函数",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "指数函数图象性质、定点与底数分类讨论",
      keywords: ["指数函数", "定点", "底数", "复合单调"],
      trig: "求指数型函数定点、值域或解含参指数不等式 \\(a^{f(x)} > a^{g(x)}\\)。",
      key: "1. <b>先查定义</b>：\\(y=a^x\\) 中 \\(a>0,a\\ne1\\)，定义域 \\(\\mathbb R\\)，值域 \\((0,+\\infty)\\)。\\(a>1\\) 递增，\\(0&lt;a&lt;1\\) 递减。<br>2. <b>同底与复合</b>：在两边指数都有意义的共同定义域内，递增时比较同向，递减时反向；对 \\(a^{u(x)}\\)，当 \\(a>1\\) 时与 \\(u(x)\\) 增减相同，当 \\(0<a<1\\) 时与它增减相反。<br>3. <b>求定点抓住零次幂等于1</b>：对 \\(y=a^{u(x)}+c\\)，若 \\(u(x)\\) 和 \\(c\\) 都不含底数参数 \\(a\\)，令 \\(u(x_0)=0\\) 即可得公共点 \\((x_0,1+c)\\)。指数外也含参数时另查，不能照搬。<br>4. <b>同指数比较正底数</b>：固定实数 \\(r\\)，若 \\(0&lt;b_1&lt;b_2\\)，则 \\(r>0\\) 时 \\(b_1^r&lt;b_2^r\\)，\\(r=0\\) 时同为 \\(1\\)，\\(r&lt;0\\) 时大小反转。",
      warn: "求 \\(a^{u(x)}\\) 的完整值域，先求 \\(u(x)\\) 的实际值域，再按指数函数增减性求结果，并核对端点能否取到。仅知 \\(u\\le2\\)，不能断定 \\(2^u\\) 的值域就是 \\((0,4]\\)；若 \\(u\\) 始终等于 \\(1\\)，值域只有 \\(\\{2\\}\\)。指数函数值始终大于 \\(0\\)。\\(a=1\\) 时是常函数，按本节定义不算指数函数。",
      rel: ["explog-compare", "log-change-base"]
    },
    {
      id: "log-change-base", ch: 4, sec: "b1-4-3", secName: "4.3 对数",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "对数运算法则、换底公式与连等式指对互化",
      keywords: ["对数", "换底公式", "真数", "指对互化"],
      trig: "不同底对数相乘化简，或已知 \\(2^a=5^b=10\\) 求 \\(\\dfrac1a+\\dfrac1b\\)。",
      key: "设 \\(a>0,a\\ne1,M,N>0,k\\in\\mathbb R\\)：<br>• \\(\\log_a(MN)=\\log_a M+\\log_a N\\)，\\(\\log_a(M/N)=\\log_a M-\\log_a N\\)，\\(\\log_a(M^k)=k\\log_a M\\)。<br>• 换底（把不同底数化为同底）：\\(\\log_a N=\\dfrac{\\log_c N}{\\log_c a}\\)，另要求 \\(c>0,c\\ne1\\)。<br>• 倒数关系 \\(\\log_a b=1/\\log_b a\\) 还要求 \\(b>0,b\\ne1\\)。<br>• \\(\\log_{a^m}(b^n)=\\dfrac nm\\log_a b\\) 要求 \\(b>0,m\\ne0,m,n\\in\\mathbb R\\)。<br>• \\(a^{\\log_a N}=N\\)（\\(N>0\\)），\\(\\log_a(a^t)=t\\)（\\(t\\in\\mathbb R\\)）。<br>• <b>连等式先指对互化</b>：如 \\(2^p=5^q=10\\)，则 \\(p=\\log_2 10,q=\\log_5 10\\)，所以 \\(\\dfrac1p+\\dfrac1q=\\log_{10}2+\\log_{10}5=1\\)。",
      warn: "拆开 \\(\\log_a(x^2)\\) 必须保留 \\(x\\ne0\\)，一般写作 \\(2\\log_a|x|\\)；只有 \\(x>0\\) 才能写 \\(2\\log_a x\\)。原式每个真数都要正；不存在把 \\(\\log_a(M+N)\\) 拆为两个对数和的通用公式。",
      rel: ["exp-fn-prop", "explog-compare"]
    },
    {
      id: "explog-compare", ch: 4, sec: "b1-4-4", secName: "4.4 对数函数",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "指、对、幂三数“比大小”实战三板斧",
      keywords: ["比大小", "对数函数", "反函数", "中间量", "4.2", "4.4"],
      trig: "高考高频题：比较含指数、对数、幂的三个数 \\(a,b,c\\) 的大小。",
      key: "1. <b>第一斧（跟 0 和 1 比，分阵营）</b>：先分出负数、\\((0,1)\\) 和 \\(>1\\)。<br>2. <b>第二斧（化同底或化同指）</b>：同底用指对函数单调性，同指数用幂函数单调性。<br>3. <b>第三斧（找中间桥梁值）</b>：根据底数、指数或真数，选容易算出或估计的共同基准值（如 \\(\\tfrac12,\\sqrt2,2\\)），把两数分别与它比较，基准值不必固定。",
      warn: "同底指数或对数比较时，先看底数：\\(a>1\\) 保持大小方向，\\(0<a<1\\) 则反向，如 \\(0.5^2<0.5^1\\)。同指数比较正底数时，也要看指数正负；如 \\(2^{-1}>3^{-1}\\)。",
      rel: ["exp-fn-prop", "log-change-base", "fn-power-five"]
    },
    {
      id: "zero-theorem", lab: "zero-theorem", ch: 4, sec: "b1-4-5", secName: "4.5 函数的应用（二）",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "零点存在定理、二分法与“图象交点转零点”",
      keywords: ["零点", "二分法", "交点", "实根个数"],
      trig: "定位零点所在区间 \\((k,k+1)\\)，或判断超越方程 \\(\\ln x + 2x - 6 = 0\\) 解的个数。",
      key: "1. <b>零点存在定理</b>：\\(h\\) 在 \\([a,b]\\) 连续且 \\(h(a)h(b)<0\\)，则在 \\((a,b)\\) 至少有一个零点；若另知严格单调，可进一步断言唯一。<br>2. <b>方程先构造差函数</b>：判断 \\(f(x)=g(x)\\) 的根，可设 \\(h=f-g\\)。使用定理须检查这个 \\(h\\) 的连续性和两端符号，不能只检查原来某一个函数。图象交点帮助分析，根数还须相应依据。<br>3. <b>二分法</b>：在上述连续且端点异号的区间内，取中点 \\(c=(a+b)/2\\)。若 \\(h(c)=0\\) 就找到零点；否则保留端点异号的那一半区间，重复操作，直到区间长度小于给定精度 \\(\\varepsilon\\)，再取区间内一点作近似值。",
      warn: "连续和端点异号缺一不可；端点同号也可能有零点，如 \\(h(x)=x^2\\) 在 \\([-1,1]\\) 内有零点 \\(0\\)。二分法用区间长度控制横坐标误差，不能只凭函数值接近 \\(0\\) 就停止。",
      rel: ["calc-monot-extrema", "explog-compare"]
    },
    {
      id: "trig-rad-sector", ch: 5, sec: "b1-5-1", secName: "5.1 任意角和弧度制",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "终边相同角、半角象限与弧度扇形公式",
      keywords: ["弧度", "扇形", "弧长", "终边", "象限"],
      trig: "判断 \\(\\dfrac{\\alpha}{2}\\) 所在象限，或计算扇形弧长、面积与周长最值。",
      key: "1. <b>终边相同角</b>：\\(\\{\\beta\\mid \\beta=\\alpha+2k\\pi,\\ k\\in\\mathbf Z\\}\\)（求 \\(\\dfrac{\\alpha}{2}\\) 象限时，把 \\(2k\\pi\\) 除以 \\(2\\) 得 \\(k\\pi\\)，分 \\(k\\) 为奇偶讨论。例如 \\(\\alpha\\) 是第一象限角，则 \\(\\alpha/2\\) 的终边在第一或第三象限；多转一圈再减半，半角终边就相差半圈）。<br>2. <b>扇形三公式</b>（\\(\\alpha\\) 必须化为<b>弧度制</b>）：<br>$$l = |\\alpha|r,\\qquad S = \\frac12 lr = \\frac12 |\\alpha|r^2$$",
      warn: "扇形周长是 \\(C=2r+l\\)，别漏两条半径。弧长、面积公式中的角必须先化为弧度，不能直接代入 \\(60\\) 表示 \\(60^\\circ\\)。若 \\(C\\) 固定，由 \\(S=\\tfrac12lr\\) 与 \\(2r+l\\ge2\\sqrt{2rl}\\)，可得 \\(l=2r\\) 时面积最大（圆心角为 \\(2\\text{ rad}\\)）。",
      rel: ["trig-know1get2", "trig-unit-induce"]
    },
    {
      id: "trig-know1get2", ch: 5, sec: "b1-5-2", secName: "5.2 三角函数的概念",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "单位圆定义、同角“知一求二”与齐次式弦化切",
      keywords: ["同角三角函数","同角关系","知一求二","齐次式"],
      trig: "已知 \\(\\sin\\alpha\\pm\\cos\\alpha\\) 与 \\(\\sin\\alpha\\cos\\alpha\\) 之一求其余，或已知 \\(\\tan\\alpha\\) 求齐次式。",
      key: "1. <b>单位圆定义</b>：角 \\(\\alpha\\) 终边与单位圆交于 \\(P(x,y)\\)，则 \\(\\cos\\alpha=x,\\sin\\alpha=y\\)；\\(x\\ne0\\) 时 \\(\\tan\\alpha=y/x\\)。<br>2. <b>知一求二平方桥</b>：\\((\\sin\\alpha\\pm\\cos\\alpha)^2 = 1 \\pm 2\\sin\\alpha\\cos\\alpha\\)（开方时按角的具体范围判断正负）。<br>3. <b>齐次式弦化切</b>（已知 \\(\\tan\\alpha=m\\)）：<br>• 分式 \\(\\dfrac{a\\sin\\alpha+b\\cos\\alpha}{c\\sin\\alpha+d\\cos\\alpha}\\) 上下同除 \\(\\cos\\alpha\\)；<br>• 二次整式 \\(a\\sin^2\\alpha+b\\sin\\alpha\\cos\\alpha+c\\cos^2\\alpha\\) <b>先补除以 \\(\\sin^2\\alpha+\\cos^2\\alpha=1\\)</b>，再上下同除 \\(\\cos^2\\alpha\\)！",
      warn: "由平方求值，开方不能直接取正号。即使同在第一象限，\\(\\sin\\alpha-\\cos\\alpha\\) 在 \\(0<\\alpha<\\pi/4\\) 时为负，在 \\(\\pi/4<\\alpha<\\pi/2\\) 时为正，不能只看象限。除以 \\(\\cos\\alpha\\) 前须确认它非零，原分式的分母也须非零。",
      rel: ["trig-rad-sector", "trig-aux-angle"]
    },
    {
      id: "trig-unit-induce", ch: 5, sec: "b1-5-3", secName: "5.3 诱导公式",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "诱导公式“奇变偶不变，符号看象限”与凑角互余",
      keywords: ["诱导公式", "奇变偶不变", "互余", "互补"],
      trig: "化简含 \\(\\dfrac{k\\pi}{2}\\pm\\alpha\\) 的三角式，或已知 \\(\\sin(\\alpha+\\dfrac{\\pi}{6})\\) 求 \\(\\cos(\\alpha-\\dfrac{\\pi}{3})\\)。",
      key: "1. <b>奇变偶不变，符号看象限</b>：看 \\(\\dfrac{\\pi}{2}\\) 的倍数 \\(k\\) 奇偶定函数名；把 \\(\\alpha\\) 视作锐角看原函数在对应象限的正负定符号。<br>2. <b>凑角互余互补</b>：先算未知角与已知角的<b>和或差</b>——若两角和为 \\(\\dfrac{\\pi}{2}\\)，正余弦互换；和为 \\(\\pi\\)，正弦不变、余弦变号。若两角差为 \\(\\dfrac{\\pi}{2}\\) 或 \\(\\pi\\)，先把一个角写成另一个角加减该特殊角，再用口诀定函数名与符号；不能把差为 \\(\\dfrac{\\pi}{2}\\) 也叫互余。",
      warn: "无论题中 \\(\\alpha\\) 实际是第几象限角，用口诀定符号时<b>一律把 \\(\\alpha\\) 当成第一象限锐角</b>！",
      rel: ["trig-know1get2", "trig-aux-angle", "trig-graph-prop"]
    },
    {
      id: "trig-graph-prop", ch: 5, sec: "b1-5-4", secName: "5.4 三角函数的图象与性质",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "正弦、余弦、正切函数的周期、对称与单调区间",
      keywords: ["周期", "对称轴", "对称中心", "正切", "渐近线"],
      trig: "求三角函数最小正周期、定义域、对称轴/对称中心或在给定区间上的最值。",
      key: "以下 \\(k\\in\\mathbf Z\\)。<br>• \\(y=\\sin x\\)：周期 \\(2\\pi\\)，对称轴 \\(x=\\dfrac{\\pi}{2}+k\\pi\\)（取最值 \\(\\pm 1\\) 处），对称中心 \\((k\\pi,0)\\)（零点处）。<br>递增区间 \\(\\left[-\\frac{\\pi}{2}+2k\\pi,\\frac{\\pi}{2}+2k\\pi\\right]\\)；<br>递减区间 \\(\\left[\\frac{\\pi}{2}+2k\\pi,\\frac{3\\pi}{2}+2k\\pi\\right]\\)。<br>• \\(y=\\cos x\\)：周期 \\(2\\pi\\)，对称轴 \\(x=k\\pi\\)，对称中心 \\(\\left(\\dfrac{\\pi}{2}+k\\pi,0\\right)\\)。<br>递增区间 \\([-\\pi+2k\\pi,2k\\pi]\\)；<br>递减区间 \\([2k\\pi,\\pi+2k\\pi]\\)。<br>• \\(y=\\tan x\\)：周期 \\(\\pi\\)，定义域 \\(x\\ne\\dfrac{\\pi}{2}+k\\pi\\)，在每个开区间 \\(\\left(-\\dfrac{\\pi}{2}+k\\pi,\\dfrac{\\pi}{2}+k\\pi\\right)\\) 上单调递增，对称中心 \\(\\left(\\dfrac{k\\pi}{2},0\\right)\\)（注意是 \\(\\dfrac{k\\pi}{2}\\)！）。",
      warn: "正切函数<b>没有对称轴</b>，且其对称中心横坐标是 \\(\\dfrac{k\\pi}{2}\\)（不仅包含零点 \\(k\\pi\\)，还包含渐近线与 \\(x\\) 轴交点 \\(\\dfrac{\\pi}{2}+k\\pi\\)）！",
      rel: ["trig-shift-scale", "trig-periodic-model"]
    },
    {
      id: "trig-aux-angle", ch: 5, sec: "b1-5-5", secName: "5.5 三角恒等变换",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "二倍角降幂升幂与“辅助角公式（合一变形）”",
      keywords: ["二倍角", "降幂", "辅助角", "恒等变换", "两角和"],
      trig: "化简 \\(a\\sin\\omega x+b\\cos\\omega x\\) 或含 \\(\\sin^2 x,\\cos^2 x,\\sin x\\cos x\\) 的三角函数。",
      key: "常用两步化简：<br>1. <b>二倍角降幂</b>：\\(\\sin^2 x=\\dfrac{1-\\cos 2x}{2}\\)，\\(\\cos^2 x=\\dfrac{1+\\cos 2x}{2}\\)，\\(\\sin x\\cos x=\\dfrac12\\sin 2x\\)；<br>2. <b>辅助角合一</b>：先查 \\(a^2+b^2>0\\)；若 \\(a=b=0\\)，原式恒为 \\(0\\)，无需定义辅助角。非零情形才有\\(a\\sin\\omega x+b\\cos\\omega x = \\sqrt{a^2+b^2}\\sin(\\omega x+\\varphi)\\)（其中 \\(\\cos\\varphi=\\dfrac{a}{\\sqrt{a^2+b^2}},\\ \\sin\\varphi=\\dfrac{b}{\\sqrt{a^2+b^2}}\\)）。定角时由 \\(\\cos\\varphi,\\sin\\varphi\\) 的正负确定象限，再找对应的角；如 \\(-\\sin x+\\sqrt3\\cos x=2\\sin(x+2\\pi/3)\\)。",
      warn: "辅助角的正、余弦系数别配反，负号也要带入。合一后可用 \\(\\sin(\\omega x+\\varphi)=\\sin\\omega x\\cos\\varphi+\\cos\\omega x\\sin\\varphi\\) 展开检查。若用 \\(\\tan\\varphi=b/a\\) 辅助定角，须先确认 \\(a\\ne0\\)，还要结合象限，不能只凭正切值定角。",
      rel: ["trig-know1get2", "trig-shift-scale"]
    },
    {
      id: "trig-shift-scale", lab: "trig-shift-scale", ch: 5, sec: "b1-5-6", secName: "5.6 函数 y=Asin(ωx+φ)",
      kind: "pitfall", kindLabel: "🔴 易错红线",
      title: "正弦型函数 y=Asin(ωx+φ) 伸缩平移铁律与由图求式",
      keywords: ["图象平移","横坐标伸缩","由图求式","五点法"],
      trig: "函数图象左右平移与横坐标伸缩，或由部分图象求 \\(A,\\omega,\\varphi\\)。",
      key: "先在 \\(A>0,\\omega>0\\) 下研究；若 \\(A=0\\) 或 \\(\\omega=0\\)，原式是常值，没有最小正周期。<br>1. <b>平移先提出系数</b>：由 \\(A\\sin\\omega x\\) 到 \\(A\\sin(\\omega x+\\varphi)\\)，先写成 \\(A\\sin[\\omega(x+\\varphi/\\omega)]\\)：\\(\\varphi>0\\) 时向左移 \\(\\varphi/\\omega\\)，\\(\\varphi<0\\) 时向右移 \\(|\\varphi|/\\omega\\)。因周期性，再向左或向右移整数个 \\(T=2\\pi/\\omega\\) 也得到同一图象。<br>2. <b>读图逐项判断</b>：本式无竖直偏移，振幅 \\(A=(y_{\\max}-y_{\\min})/2\\)；相邻最高点到最低点、相邻零点相距 \\(T/2\\)，相邻最高点相距 \\(T\\)。由 \\(\\omega=2\\pi/T\\) 定频率，再按已知点是波峰、波谷或哪类零点确定相位，保留 \\(k\\in\\mathbb Z\\)，用题设范围筛选并代其它条件验证。",
      warn: "① <b>先化同名</b>：异名函数可用诱导公式转为同名后比较，或核对对应特征点；平移要保留周期等价。<br>② <b>负参数先规范化</b>：非零时振幅为 \\(|A|\\)，最小正周期为 \\(2\\pi/|\\omega|\\)；常值函数不套此式。<br>③ <b>零点分清上穿、下穿</b>：在 \\(A>0,\\omega>0\\) 下，上穿对应相位 \\(2k\\pi\\)，下穿对应 \\((2k+1)\\pi\\)（\\(k\\in\\mathbb Z\\)）。<br>④ <b>有竖直平移先定中线</b>：若另有常数项 \\(B\\)，先求 \\(B=(y_{\\max}+y_{\\min})/2\\)，再定振幅。",
      rel: ["trig-graph-prop", "trig-aux-angle", "trig-periodic-model"]
    },
    {
      id: "trig-periodic-model", ch: 5, sec: "b1-5-7", secName: "5.7 三角函数的应用",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "周期现象物理建模：平衡位置、振幅与初相提取",
      keywords: ["摩天轮", "潮汐", "周期", "振幅"],
      trig: "摩天轮高度、潮汐水深、交流电等周期变化应用题。",
      key: "设模型为 \\(y = A\\sin(\\omega t + \\varphi) + B\\)（\\(A>0,\\omega>0\\)）：<br>• <b>平衡位置</b> \\(B = \\dfrac{y_{\\max}+y_{\\min}}{2}\\)；<b>振幅</b> \\(A = \\dfrac{y_{\\max}-y_{\\min}}{2}\\)；<br>• <b>角频率</b> \\(\\omega = \\dfrac{2\\pi}{T}\\)；再代入初始时刻 \\(t=0\\) 或最高点时刻定 \\(\\varphi\\)。",
      warn: "看清摩天轮起点在最低点、最高点还是水平位置，旋转方向是逆时针还是顺时针。",
      rel: ["trig-shift-scale", "trig-graph-prop"]
    },
    {
      id: "vec-concept-equiv", ch: 6, sec: "b2-6-1", secName: "6.1 平面向量的概念",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "向量大小方向双要素、自由向量与零向量",
      keywords: ["向量", "模长", "有向线段", "零向量", "相等向量", "共线向量"],
      trig: "判断向量基本概念、相等向量、相反向量或共线平行向量。",
      key: "1. <b>自由向量</b>：有向线段是表示方式，平移不改变向量。<br>2. <b>相等</b>：两个非零向量相等，当且仅当模相等且方向相同；零向量与零向量相等，与非零向量不相等。<br>3. <b>零向量</b>：模为0，方向任意，规定与任意向量平行；其相反向量仍为零向量。<br>4. <b>比较</b>：向量不能比较大小，只能比较模。",
      warn: "非零共线向量方向相同或相反，表示它们的有向线段不必原来就在同一直线上；零向量按约定与任意向量共线。若 \\(\\boldsymbol a\\parallel\\boldsymbol b\\)、\\(\\boldsymbol b\\parallel\\boldsymbol c\\)，当中间向量 \\(\\boldsymbol b\\ne\\boldsymbol0\\) 时，可以推出 \\(\\boldsymbol a\\parallel\\boldsymbol c\\)；若 \\(\\boldsymbol b=\\boldsymbol0\\)，则 \\(\\boldsymbol a,\\boldsymbol c\\) 不一定平行。",
      rel: ["vec-add-sub-tri", "vec3-ops-coplanar"]
    },
    {
      id: "vec-add-sub-tri", ch: 6, sec: "b2-6-2", secName: "6.2 平面向量的运算",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "向量加减法两大法则与首尾相接回路",
      keywords: ["向量加法", "向量减法", "三角形法则", "平行四边形法则", "回路"],
      trig: "几何图形中的向量线性化简、求和向量与差向量。",
      key: "• <b>加法三角形法则</b>：首尾相接，起点指向终点（\\(\\vec{AB}+\\vec{BC}=\\vec{AC}\\)）。<br>• <b>加法平行四边形法则</b>：共起点，以两向量为邻边作平行四边形，从公共起点指向对顶点的对角线向量为和向量。<br>• <b>减法法则</b>：共起点，<b>指向被减向量</b>（\\(\\vec{OA}-\\vec{OB}=\\vec{BA}\\)）。<br>• <b>封闭回路求和为零向量</b>：\\(\\vec{AB}+\\vec{BC}+\\vec{CA}=\\boldsymbol{0}\\)。",
      warn: "封闭回路向量相加结果是零向量 \\(\\boldsymbol{0}\\)，不是数字 0！",
      rel: ["vec-concept-equiv", "vec-dot-product"]
    },
    {
      id: "vec-dot-product", ch: 6, sec: "b2-6-2", secName: "6.2 平面向量的运算",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "数量积 \\(\\boldsymbol{a}\\cdot\\boldsymbol{b}\\) 标量性、投影向量与垂直判定",
      keywords: ["数量积", "点乘", "投影向量", "垂直", "夹角"],
      trig: "计算数量积、求向量夹角或利用垂直条件求参数。",
      key: "设非零向量夹角 \\(\\theta\\in[0,\\pi]\\)：<br>• <b>定义式</b>：\\(\\boldsymbol{a}\\cdot\\boldsymbol{b} = |\\boldsymbol{a}||\\boldsymbol{b}|\\cos\\theta\\)（结果是<b>实数（标量）</b>，不是向量！）。<br>• <b>垂直判定</b>：\\(\\boldsymbol{a}\\perp\\boldsymbol{b} \\iff \\boldsymbol{a}\\cdot\\boldsymbol{b} = 0\\)（非零向量）。<br>• <b>模长与数量积</b>：\\(|\\boldsymbol{a}|^2 = \\boldsymbol{a}^2 = \\boldsymbol{a}\\cdot\\boldsymbol{a}\\)，\\(|\\boldsymbol{a}\\pm\\boldsymbol{b}|^2 = \\boldsymbol{a}^2 \\pm 2\\boldsymbol{a}\\cdot\\boldsymbol{b} + \\boldsymbol{b}^2\\)。<br>• <b>投影向量</b>：向单位向量 \\(\\boldsymbol{e}\\) 的投影向量为 \\((\\boldsymbol{a}\\cdot\\boldsymbol{e})\\boldsymbol{e}\\)；投影长度为 \\(|\\boldsymbol{a}\\cdot\\boldsymbol{e}|\\)（非负）。",
      warn: "数量积<b>不满足结合律</b>：\\((\\boldsymbol{a}\\cdot\\boldsymbol{b})\\boldsymbol{c}\\) 与 \\(\\boldsymbol{a}(\\boldsymbol{b}\\cdot\\boldsymbol{c})\\) <b>不恒相等</b>（特殊向量仍可相等）；且由 \\(\\boldsymbol{a}\\cdot\\boldsymbol{b}=\\boldsymbol{a}\\cdot\\boldsymbol{c}\\) <b>不能约去 \\(\\boldsymbol{a}\\)</b>！",
      rel: ["vec-coord-ops", "vec-sine-cosine-law", "vec3-distance-angles"]
    },
    {
      id: "vec-base-theorem", ch: 6, sec: "b2-6-3", secName: "6.3 平面向量基本定理及坐标表示",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "平面向量基本定理与三点共线定理",
      keywords: ["基底", "基本定理", "三点共线", "分解"],
      trig: "选基底线性表示未知向量、求系数或利用三点共线求参数。",
      key: "1. <b>基本定理</b>：平面内任意两个<b>不共线</b>向量 \\(\\boldsymbol{e}_1,\\boldsymbol{e}_2\\) 叫做基底，平面内任一向量 \\(\\boldsymbol{a}\\) 存在<b>唯一实数对</b> \\((\\lambda_1,\\lambda_2)\\) 使 \\(\\boldsymbol{a} = \\lambda_1\\boldsymbol{e}_1 + \\lambda_2\\boldsymbol{e}_2\\)。<br>2. <b>三点共线定理</b>：先要求点 \\(O,A,B\\) 不共线，即 \\(\\vec{OA},\\vec{OB}\\) 为一组基底。若 \\(\\vec{OP} = x\\vec{OA} + y\\vec{OB}\\)，则 <b>\\(A,B,P\\) 三点共线 \\(\\iff x+y=1\\)</b>！",
      warn: "零向量不能作基底；共线的两个非零向量不能作基底。",
      rel: ["vec-coord-ops", "vec3-base-theorem"]
    },
    {
      id: "vec-coord-ops", ch: 6, sec: "b2-6-3", secName: "6.3 平面向量基本定理及坐标表示",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "向量直角坐标运算：共线与垂直判定公式",
      keywords: ["坐标", "x1y2-x2y1", "模长", "垂直", "共线"],
      trig: "向量坐标线性运算、数量积计算，或根据共线/垂直求坐标参数。",
      key: "设 \\(\\boldsymbol{a}=(x_1,y_1),\\ \\boldsymbol{b}=(x_2,y_2)\\)：<br>• <b>加减与数乘</b>：\\(\\boldsymbol{a}\\pm\\boldsymbol{b}=(x_1\\pm x_2, y_1\\pm y_2)\\)，\\(\\lambda\\boldsymbol{a}=(\\lambda x_1, \\lambda y_1)\\)。<br>• <b>两点向量</b>：\\(A(x_1,y_1), B(x_2,y_2) \\Rightarrow \\vec{AB}=(x_2-x_1, y_2-y_1)\\)（终点减起点）。<br>• <b>数量积与模长</b>：\\(\\boldsymbol{a}\\cdot\\boldsymbol{b}=x_1x_2+y_1y_2\\)，\\(|\\boldsymbol{a}|=\\sqrt{x_1^2+y_1^2}\\)。<br>• <b>两非零向量的垂直充要条件</b>（\\(\\boldsymbol a\\ne\\boldsymbol0,\\boldsymbol b\\ne\\boldsymbol0\\)）：\\(\\boldsymbol{a}\\perp\\boldsymbol{b} \\iff x_1x_2+y_1y_2=0\\)。<br>• <b>共线充要条件</b>：\\(\\boldsymbol{a}\\parallel\\boldsymbol{b} \\iff <b>x_1y_2 - x_2y_1 = 0</b>\\)（交叉相乘之差为 0）。",
      warn: "共线公式切勿写成坐标相除（分母可能为 \\(0\\)），使用 \\(x_1y_2-x_2y_1=0\\)。这个共线判据允许零向量；垂直判据与夹角则先排除零向量，不能只凭数量积为 \\(0\\) 就声称零向量有垂直方向。",
      rel: ["vec-dot-product", "vec-base-theorem", "vec3-coord-ops"]
    },
    {
      id: "vec-sine-cosine-law", ch: 6, sec: "b2-6-4", secName: "6.4 平面向量的应用",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "正弦定理、余弦定理与解三角形“边角互化”",
      keywords: ["正弦定理","余弦定理","解三角形","SSA"],
      trig: "已知三角形部分边角求其余边角、外接圆半径或判断三角形解的个数。",
      key: "在 \\(\\Delta ABC\\) 中（\\(R\\) 为外接圆半径）：<br>• <b>正弦定理</b>：$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$$（边化角：\\(a=2R\\sin A\\)；角化边：\\(\\sin A = \\dfrac{a}{2R}\\)）。<br>• <b>余弦定理</b>：$$\\begin{gathered}c^2 = a^2 + b^2 - 2ab\\cos C,\\\\\\cos C = \\frac{a^2+b^2-c^2}{2ab}\\end{gathered}$$<br>• <b>面积公式</b>：\\(S = \\dfrac12 ab\\sin C = \\dfrac12 bc\\sin A = \\dfrac12 ac\\sin B = \\dfrac{abc}{4R}\\)。",
      warn: "SSA 陷阱：已知两边 \\(a,b\\) 及对角 \\(A\\) 时，若 \\(A\\) 为锐角且 \\(b\\sin A&lt;a&lt;b\\)，三角形有<b>两解</b>：所求角 \\(B\\) 的两个值一锐一钝，绝不能只取计算出来的锐角！但当 \\(B\\) 为锐角时，\\(C=180^\\circ-A-B\\) 仍可能为钝角，所以两个解不一定一锐一钝。",
      rel: ["vec-dot-product", "trig-aux-angle"]
    },
    {
      id: "complex-def-pure", ch: 7, sec: "b2-7-1", secName: "7.1 复数的概念",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "复数代数形式 \\(a+bi\\)、实部虚部与纯虚数条件",
      keywords: ["复数", "虚数", "纯虚数", "实部", "虚部", "i²=-1"],
      trig: "判断复数分类、利用实数或纯虚数条件求参数。",
      key: "设 \\(z = a + bi\\)（\\(a,b\\in\\R\\)），其中 \\(i^2=-1\\)：<br>• <b>实部为 \\(a\\)，虚部为实数 \\(b\\)</b>（注意虚部是 \\(b\\)，不是 \\(bi\\)！）。<br>• <b>分类标准</b>：\\(b=0 \\iff z\\text{ 是实数}\\)；\\(b\\ne 0 \\iff z\\text{ 是虚数}\\)；<b>\\(a=0\\) 且 \\(b\\ne 0 \\iff z\\text{ 是纯虚数}\\)</b>。<br>• <b>复数相等</b>（\\(a,b,c,d\\in\\R\\)）：\\(a+bi=c+di \\iff a=c\\text{ 且 }b=d\\)（实部等实部，虚部等虚部）。",
      warn: "数字 0 是实数，不是纯虚数！求纯虚数参数时，列出 \\(a=0\\) 后必须同时检验 \\(b\\ne 0\\)！另外，虚数不能比较大小。",
      rel: ["complex-plane-mod", "complex-ops-conj"]
    },
    {
      id: "complex-plane-mod", ch: 7, sec: "b2-7-1", secName: "7.1 复数的概念",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "复平面几何意义与复数的模 \\(|z|\\)",
      keywords: ["复平面", "实轴", "虚轴", "模长", "向量"],
      trig: "求复数模长、求复数在复平面内对应象限或对应几何向量。",
      key: "1. <b>一一对应</b>：复数 \\(z=a+bi \\longleftrightarrow\\) 复平面上的点 \\(Z(a,b) \\longleftrightarrow\\) 平面向量 \\(\\vec{OZ}\\)。<br>• 横轴为实轴，纵轴为虚轴（<b>虚轴包含原点</b>，它是直线 \\(x=0\\)；原点 \\((0,0)\\) 代表实数 \\(0\\)，虚轴上除原点外的点才表示纯虚数）。<br>2. <b>复数的模</b>：向量 \\(\\vec{OZ}\\) 的长度：$$|z| = \\sqrt{a^2+b^2}$$（模是一个<b>非负实数</b>，可以比较大小）。",
      warn: "\\(|z_1 - z_2|\\) 的几何意义是复平面上两点 \\(Z_1, Z_2\\) 之间的距离！",
      rel: ["complex-def-pure", "complex-trig-form"]
    },
    {
      id: "complex-ops-conj", ch: 7, sec: "b2-7-2", secName: "7.2 复数的四则运算",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "复数四则运算、共轭复数与 \\(i\\) 的周期性",
      keywords: ["共轭", "分母实数化", "i周期", "四则运算"],
      trig: "复数化简为 \\(A+Bi\\) 标准型、乘除法运算与共轭求模。",
      key: "以下 \\(a,b,c,d\\in\\mathbb R\\)。<br>1. <b>乘法按多项式乘</b>：\\((a+bi)(c+di) = (ac-bd) + (ad+bc)i\\)（代入 \\(i^2=-1\\)）。<br>2. <b>共轭复数</b>：\\(z=a+bi\\) 的共轭为 \\(\\overline{z}=a-bi\\)，有 <b>\\(z\\overline{z} = a^2+b^2 = |z|^2\\)</b>（实数）。<br>3. <b>除法分母实数化（先要求 \\(z_2\\ne0\\)）</b>：分子分母同乘分母的共轭复数 \\(\\overline{z}_2\\)：<br>$$\\frac{z_1}{z_2} = \\frac{z_1\\overline{z}_2}{z_2\\overline{z}_2} = \\frac{z_1\\overline{z}_2}{|z_2|^2}$$<br>4. <b>\\(i\\) 的 4 周期性</b>：\\(i^1=i,\\ i^2=-1,\\ i^3=-i,\\ i^4=1\\)；\\(i^{4k+n}=i^n\\)（\\(k,n\\in\\mathbb Z\\)）；且 \\(i+i^2+i^3+i^4=0\\)。",
      warn: "先保留虚数单位再计算：\\((\\sqrt2\\,i)(\\sqrt3\\,i)=\\sqrt6\\,i^2=-\\sqrt6\\)，不是 \\(\\sqrt6\\)。实数根式乘法 \\(\\sqrt a\\sqrt b=\\sqrt{ab}\\) 要求 \\(a,b\\ge0\\)，本节不另引入负数根号的取值约定。",
      rel: ["complex-def-pure", "complex-plane-mod"]
    },
    {
      id: "complex-trig-form", ch: 7, sec: "b2-7-3", secName: "7.3 复数的三角表示（选学）",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "复数的三角表示式与乘除法几何旋转（选学）",
      keywords: ["三角形式", "辐角", "旋转", "选学", "极坐标"],
      trig: "复数代数式与三角式互化，或利用模长辐角求高次幂与旋转几何。",
      key: "设非零复数 \\(z=a+bi\\)，\\(a,b\\in\\mathbb R\\)。模 \\(r=\\sqrt{a^2+b^2}>0\\)，辐角满足 \\(\\cos\\theta=a/r\\)、\\(\\sin\\theta=b/r\\)，相差 \\(2k\\pi\\)（\\(k\\in\\mathbb Z\\)）表示同一方向。<br>• <b>标准三角形式</b>：$$z=r(\\cos\\theta+i\\sin\\theta)$$<br>• <b>乘除法</b>（以下两数都非零）：<b>模长相乘（除），辐角相加（减）</b>。$$\\begin{aligned}z_1z_2=r_1r_2\\big[&\\cos(\\theta_1+\\theta_2)\\\\&+i\\sin(\\theta_1+\\theta_2)\\big]\\end{aligned}$$$$\\begin{aligned}\\frac{z_1}{z_2}=\\frac{r_1}{r_2}\\big[&\\cos(\\theta_1-\\theta_2)\\\\&+i\\sin(\\theta_1-\\theta_2)\\big]\\end{aligned}$$<br>• <b>乘方</b>：反复使用乘法公式可得 \\(z^n=r^n(\\cos n\\theta+i\\sin n\\theta)\\)（\\(n\\in\\mathbb N^*\\)，选学拓展）。<br>• <b>几何意义</b>：乘以非零复数 \\(r(\\cos\\theta+i\\sin\\theta)\\)，向量旋转角 \\(\\theta\\)（正角逆时针、负角顺时针），长度变为原来的 \\(r\\) 倍；\\(0<r<1\\) 时缩短，\\(r>1\\) 时伸长。乘 \\(i\\) 则模不变、逆时针转 \\(90^\\circ\\)。",
      warn: "选学内容。本课把非零复数的辐角主值取在 \\([0,2\\pi)\\)，一般辐角可相差 \\(2k\\pi\\)。读模与角前，先化成<b>模为正、角相同、cos 在前、中间加号</b>的标准式。例如 \\(\\cos\\theta-i\\sin\\theta=\\cos(-\\theta)+i\\sin(-\\theta)\\)；若模前系数为负，可把角加 \\(\\pi\\) 后改为正模。零的模为 \\(0\\)，没有辐角；除数必须非零。",
      rel: ["complex-plane-mod", "trig-know1get2"]
    },
    {
      id: "geo-polyhedron-rot", ch: 8, sec: "b2-8-1", secName: "8.1 基本立体图形",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "多面体与旋转体的严格结构定义及特征识别",
      keywords: ["棱柱", "棱锥", "棱台", "圆柱", "圆锥", "圆台", "球", "多面体", "旋转体", "空间几何体", "四面体"],
      trig: "判断空间几何体类型、识别棱柱底面侧棱性质或几何体截面性质。",
      key: "1. <b>棱柱</b>：有两个面互相平行（底面），其余各面都是平行四边形，且每相邻两个四边形的公共边互相平行。<br>2. <b>棱锥与棱台</b>：有一个面是多边形，其余各面是有公共顶点的三角形为棱锥；棱台是用<b>平行于底面的平面截棱锥</b>所得底面与截面之间的部分。<br>3. <b>旋转体</b>：矩形绕边旋转得圆柱、直角三角形绕直角边旋转得圆锥、直角梯形绕垂直于底的腰旋转得圆台、半圆面绕直径所在直线旋转得球（半圆弧旋转只得到球面）。",
      warn: "不是“有两个平行面”就叫棱柱（侧棱必须互相平行！）；棱台的上下底必须相似且侧棱延长线必交于一点，不能把任意截切多面体叫棱台！",
      rel: ["geo-oblique-drawing", "geo-surface-volume"]
    },
    {
      id: "geo-oblique-drawing", ch: 8, sec: "b2-8-2", secName: "8.2 立体图形的直观图",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "斜二测画法规则与原图/直观图面积换算公式",
      keywords: ["斜二测", "直观图", "45度", "折半", "面积比", "S'=√2/4 S"],
      trig: "已知原图形求直观图面积，或已知直观图面积逆求原图真实面积。",
      key: "1. <b>斜二测画法三规则</b>：<br>• \\(x\\) 轴（水平）方向：平行性不变，<b>长度保持不变</b>；<br>• \\(y\\) 轴（纵向）方向：画成与 \\(x'\\) 轴夹角 \\(45^\\circ\\)（或 \\(135^\\circ\\)），<b>长度折半（变为原来的 \\(\\dfrac12\\)）</b>；<br>• \\(z\\) 轴（竖直）方向：平行性不变，<b>长度保持不变</b>。<br>2. <b>水平面内图形的面积换算核心公式</b>（原图在水平 \\(xOy\\) 平面内，按上述规则作图）：<br>$$\\begin{gathered}S_{\\text{直观图}} = \\frac{\\sqrt{2}}{4} S_{\\text{原图}},\\\\S_{\\text{原图}} = 2\\sqrt{2} S_{\\text{直观图}}\\end{gathered}$$",
      warn: "直观图上互相垂直的两条线，原图中不一定垂直！不平行于坐标轴的斜边、对角线，长度不能直接照搬或折半，应先按规则定端点，再连线。逆求原图面积时切勿记反乘成 \\(\\frac{\\sqrt{2}}{4}\\)，上述水平面内的原图面积比直观图面积大，必须乘以 \\(2\\sqrt{2}\\)！面积公式只适用于水平面内的图形，不能直接套用到竖直面或任意倾斜面。",
      rel: ["geo-polyhedron-rot"]
    },
    {
      id: "geo-surface-volume", ch: 8, sec: "b2-8-3", secName: "8.3 简单几何体的表面积与体积",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "柱、锥、台、球的表面积与体积公式全景",
      keywords: ["体积", "表面积", "母线", "祖暅原理", "球", "组合体"],
      trig: "计算空间几何体侧面积、表面积、体积，或计算组合体与内切外接球体积。",
      key: "设高为 \\(h\\)。<b>母线先分图形</b>：直圆锥底面半径为 \\(r\\) 时，\\(l=\\sqrt{r^2+h^2}\\)；直圆台上下底半径为 \\(R,r\\) 时，\\(l=\\sqrt{(R-r)^2+h^2}\\)。<br>• <b>柱体</b>：\\(V = Sh\\)；圆柱侧面积 \\(S_{\\text{侧}} = 2\\pi rh\\)。<br>• <b>锥体</b>：\\(V = \\dfrac13 Sh\\)（等底等高圆柱体积的三分之一！）；圆锥侧面积 <b>\\(S_{\\text{侧}} = \\pi rl\\)</b>（注意用母线 \\(l\\)，不是高 \\(h\\)！）。<br>• <b>台体</b>：\\(V = \\dfrac13 h(S_1 + \\sqrt{S_1 S_2} + S_2)\\)；圆台侧面积 \\(S_{\\text{侧}} = \\pi(R+r)l\\)。<br>• <b>球体</b>：表面积 \\(S = 4\\pi R^2\\)，体积 <b>\\(V = \\dfrac43 \\pi R^3\\)</b>。<br>• <b>祖暅原理（拓展，可跳过）</b>：两立体等高，且每个等高位置的截面积都相等，则体积相等。",
      warn: "组合体的表面积陷阱：两几何体沿面积为 \\(S_{\\text{接}}\\) 的面接合，该面两侧都封在内部。若先把两者原表面积相加，<b>须减去 \\(2S_{\\text{接}}\\)</b>；也可只把外露面的面积相加。",
      rel: ["geo-polyhedron-rot"]
    },
    {
      id: "geo-basic-facts-skew", ch: 8, sec: "b2-8-4", secName: "8.4 空间点、直线、平面之间的位置关系",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "空间基本事实、位置关系判定与异面直线所成角",
      keywords: ["基本事实", "公理", "异面直线", "等角定理", "平移求角"],
      trig: "判断空间点线面共面共线、判断异面直线或求异面直线所成的角。",
      key: "1. <b>确定平面条件</b>：不共线三点；直线与线外一点；两条相交直线；两条平行直线。<br>2. <b>空间两直线位置关系</b>：相交、平行（在同一平面内）；<b>异面（不同在任何一个平面内，无公共点）</b>。<br>3. <b>等角定理</b>：空间两个角两边分别对应平行，则这两个角<b>相等或互补</b>（不能漏掉互补！）。<br>4. <b>异面直线所成角</b>：过空间任一点 \\(O\\) 分别引两异面直线的平行线，所成<b>锐角或直角</b>为异面直线夹角，范围 <b>\\(\\theta \\in (0, \\dfrac{\\pi}{2}]\\)</b>。",
      warn: "无公共点的两条直线不一定是平行线，还有可能异面！平移求异面直线夹角时，若算出钝角必须取其补角（夹角不能超过 \\(90^\\circ\\)）！",
      rel: ["geo-parallel-circuits", "geo-perp-dihedral"]
    },
    {
      id: "geo-parallel-circuits", ch: 8, sec: "b2-8-5", secName: "8.5 空间直线、平面的平行",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "空间线面平行与面面平行判定定理及转化回路",
      keywords: ["线面平行","面面平行","线线平行","平行判定定理","平行性质定理"],
      trig: "证明空间直线与平面平行、证明两个平面平行，或利用平行寻找交线。",
      key: "1. <b>线面平行判定</b>（线线\\(\\to\\)线面）：若 <b>\\(a\\not\\subset\\alpha\\)</b>，\\(b\\subset\\alpha\\)，且 <b>\\(a\\parallel b\\)</b>，则 <b>\\(a\\parallel\\alpha\\)</b>（面外线平行面内线）。<br>2. <b>线面平行性质</b>（线面\\(\\to\\)线线）：若 \\(a\\parallel\\alpha\\)，\\(a\\subset\\beta\\)，\\(\\alpha\\cap\\beta=b\\)，则 <b>\\(a\\parallel b\\)</b>（交线必平行）。<br>3. <b>面面平行判定</b>（线面\\(\\to\\)面面）：一个平面内的<b>两条相交直线</b>分别平行于另一个平面，则两平面平行（\\(a\\subset\\alpha, b\\subset\\alpha, a\\cap b=P, a\\parallel\\beta, b\\parallel\\beta \\Rightarrow \\alpha\\parallel\\beta\\)）。<br>4. <b>面面平行性质</b>（面面\\(\\to\\)线线）：\\(\\alpha\\parallel\\beta\\)，\\(\\gamma\\cap\\alpha=a\\)，\\(\\gamma\\cap\\beta=b \\Rightarrow a\\parallel b\\)。",
      warn: "线面平行判定书写证明时，漏写 \\(a\\not\\subset\\alpha\\) 必扣分！面面平行判定漏写“相交”条件必扣分（两条平行线平行另一平面无法锁定平面方向）！",
      rel: ["geo-basic-facts-skew", "geo-perp-dihedral"]
    },
    {
      id: "geo-perp-dihedral", ch: 8, sec: "b2-8-6", secName: "8.6 空间直线、平面的垂直",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "线面垂直、面面垂直判定性质与二面角平面角",
      keywords: ["线面垂直", "面面垂直", "线面角", "二面角", "射影"],
      trig: "证明线面垂直、证明两平面垂直，或求直线与平面所成角、二面角大小。",
      key: "1. <b>线面垂直判定</b>：一直线垂直于平面内的<b>两条相交直线</b>，则该直线垂直于此平面（\\(a\\subset\\alpha, b\\subset\\alpha, a\\cap b=P, l\\perp a, l\\perp b \\Rightarrow l\\perp\\alpha\\)）。<br>2. <b>线面垂直性质</b>：垂直平面则垂直平面内<b>任意直线</b>（\\(l\\perp\\alpha, a\\subset\\alpha \\Rightarrow l\\perp a\\)）。<br>3. <b>线面角</b>：斜线与它在平面内的<b>正射影</b>所成的锐角；直线平行于平面或在平面内时角为 \\(0\\)，垂直时为 \\(\\pi/2\\)。线面角的整体范围是 <b>\\([0,\\pi/2]\\)</b>。<br>4. <b>二面角平面角</b>：在棱上任取一点 \\(O\\)，在两个半平面内分别作垂直于棱的射线 \\(OA, OB\\)，\\(\\angle AOB\\) 称为二面角的平面角，范围 <b>\\([0, \\pi]\\)</b>（可为钝角！）。<br>5. <b>面面垂直判定与性质</b>：面过垂线则面面垂直；两面垂直时，在面内垂直于交线的直线必垂直于另一平面。",
      warn: "二面角的平面角范围是 \\([0, 180^\\circ]\\)（可以钝角），而线面角和异面直线角范围绝不超过 \\(90^\\circ\\)！二面角平面角的两射线必须<b>同时垂直于棱</b>，不能在面上任意连线找角！",
      rel: ["geo-parallel-circuits", "vec3-distance-angles"]
    },
    {
      id: "stat-sampling", ch: 9, sec: "b2-9-1", secName: "9.1 随机抽样",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "简单随机抽样与比例分层抽样核心模型",
      keywords: ["抽样", "简单随机抽样", "分层抽样", "样本量", "抽签法", "随机数法", "代表性"],
      trig: "判断调查方式（普查还是抽样）、计算各层抽取人数，或辨别抽样方法是否科学。",
      key: "1. <b>全面调查 vs 抽样调查</b>：破坏性检验或总体极大时常用抽样。<br>2. <b>简单随机抽样</b>：不放回时，所有含 \\(n\\) 个不同个体的样本都等可能；每个个体入样率 \\(n/N\\) 是其结果，单凭入样率相等还不够。放回时，每次独立地从总体的 \\(N\\) 个个体中等概率抽取，允许重复。<br>3. <b>比例分层抽样</b>：按各层容量比例分配 \\(n_i=nN_i/N\\)；需要作整数分配时，按抽样设计调整并保持总样本量为 \\(n\\)。",
      warn: "反例：4人中只在 \\(\\{1,2\\}\\)、\\(\\{3,4\\}\\) 两组间等概率选一组，每人的入样率虽都为 \\(1/2\\)，却不是所有6种二人样本都等可能，因此不是简单随机抽样。自愿投票、街头偶遇可能有系统性抽样偏误，扩大样本量不能自动消除偏误。",
      rel: ["stat-percentile-var", "stat-merge-var"]
    },
    {
      id: "stat-percentile-var", ch: 9, sec: "b2-9-2", secName: "9.2 用样本估计总体",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "直方图面积频率原理、第 p 百分位数与方差公式",
      keywords: ["直方图", "组距", "频率", "百分位数", "中位数", "方差", "标准差"],
      trig: "由直方图求频率/频数、按教材规则计算百分位数、或计算样本方差与标准差。",
      key: "1. <b>直方图铁律</b>：矩形的高为 \\(\\dfrac{\\text{频率}}{\\text{组距}}\\)，<b>矩形面积代表频率</b>，所有矩形面积和恒为 1。<br>2. <b>第 \\(p\\) 百分位数（人教算法）</b>：本卡算法要求数据非空且 \\(0<p<100\\)。数据升序排列，算 \\(i = n \\times p\\%\\)。若 \\(i\\) 非整数，取大于 \\(i\\) 的最小整数所对应的那一项（如 \\(i=3.2\\) 时取第 \\(4\\) 项）；若 \\(i\\) 为整数，取第 \\(i\\) 与 \\(i+1\\) 项的平均值。<br>3. <b>方差公式（除以 \\(n\\)）</b>：\\(s^2 = \\dfrac{1}{n}\\sum (x_i-\\bar{x})^2\\)，标准差 \\(s = \\sqrt{s^2}\\)。",
      warn: "直方图组距不同时不能只凭高度比较频率；教材方差分母为 \\(n\\)，切勿随意改成 \\(n-1\\)。百分位数若取 \\(p=0\\) 或 \\(100\\)，端点须另按定义约定处理，不能直接套“第 \\(i\\) 与第 \\(i+1\\) 项平均”的内部算法。",
      rel: ["stat-sampling", "stat-merge-var", "rv-expect-variance"]
    },
    {
      id: "stat-merge-var", ch: 9, sec: "b2-9-3", secName: "9.3 统计案例",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "两层合并均值与方差分解公式（层内+层间）",
      keywords: ["合并均值", "合并方差", "层间方差", "加权平均", "统计决策"],
      trig: "求两组或多组数据合并后的总均值与总方差，或进行统计结论决策评价。",
      key: "1. <b>合并均值</b>：\\(\\bar{x} = w_1\\bar{x}_1 + w_2\\bar{x}_2\\)（两层样本量为 \\(n_1,n_2>0\\)，权重 \\(w_1=\\frac{n_1}{n_1+n_2}\\)，\\(w_2=\\frac{n_2}{n_1+n_2}\\)）。<br>2. <b>合并方差分解</b>：<br>\\[\\begin{aligned}s^2 ={}&w_1[s_1^2 + (\\bar{x}_1-\\bar{x})^2]\\\\&+w_2[s_2^2 + (\\bar{x}_2-\\bar{x})^2]\\end{aligned}\\]<br>由两部分组成：各层内部的平均波动 \\(w_1 s_1^2 + w_2 s_2^2\\)，加上各层均值偏离总均值产生的<b>层间波动</b>！",
      warn: "一般不能把两组方差直接作算术平均：须按人数加权，并计入均值差产生的层间波动。若两组人数相等且均值相同，合并方差恰等于 \\((s_1^2+s_2^2)/2\\)，这是可以直接平均的特例。",
      rel: ["stat-percentile-var", "stat-sampling"]
    },
    {
      id: "prob-classical-events", ch: 10, sec: "b2-10-1", secName: "10.1 随机事件与概率",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "有限等可能古典概型与互斥对立事件判定",
      keywords: ["样本点", "样本空间", "古典概型", "互斥事件", "对立事件", "等可能"],
      trig: "计算掷骰子/摸球古典概率，判断两个事件是互斥、对立还是包含关系。",
      key: "1. <b>古典概型两特征</b>：有限个样本点、每个样本点出现机会均等。公式：\\(P(A) = \\dfrac{|A|}{|\\Omega|}\\)。<br>2. <b>加法公式</b>：\\(P(A\\cup B) = P(A) + P(B) - P(A\\cap B)\\)。<br>3. <b>互斥 vs 对立</b>：<br>• <b>互斥</b>：\\(A\\cap B = \\varnothing\\)（不可能同时发生），此时 \\(P(A\\cup B) = P(A)+P(B)\\)；<br>• <b>对立</b>：\\(A\\cap B = \\varnothing\\) 且 \\(A\\cup B = \\Omega\\)（必居其一），\\(P(A) + P(\\overline{A}) = 1\\)。",
      warn: "对立必定互斥，但互斥不一定对立！合并结果后须重新检查等可能性。例如独立抛两枚均匀硬币，“一正一反”包含“正反”和“反正”两种结果，不能与“两正”“两反”各分得三分之一的概率。",
      rel: ["prob-independence", "count-perm-comb", "rv-cond-bayes"]
    },
    {
      id: "prob-independence", ch: 10, sec: "b2-10-2", secName: "10.2 事件的相互独立性",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "事件相互独立充要条件与乘法公式（互斥绝非独立）",
      keywords: ["相互独立", "独立事件", "乘法公式", "互斥与独立", "至少一个发生"],
      trig: "判断两个事件是否独立、求两系统同时正常概率、或求“至少一个发生”概率。",
      key: "1. <b>独立充要条件</b>：\\(P(AB) = P(A)P(B)\\)。<br>2. <b>衍生独立性</b>：若 \\(A\\) 与 \\(B\\) 独立，则 \\(A\\) 与 \\(\\overline{B}\\)、\\(\\overline{A}\\) 与 \\(B\\)、\\(\\overline{A}\\) 与 \\(\\overline{B}\\) 均相互独立。<br>3. <b>“至少一个发生”套路</b>：若 \\(A,B\\) 独立，则 \\(P(A\\cup B) = 1 - P(\\overline{A})P(\\overline{B})\\)。",
      warn: "判断独立用概率乘积，不能把独立当成互斥。若 \\(P(A)>0, P(B)>0\\) 且两事件互斥，则 \\(P(AB)=0\\ne P(A)P(B)\\)，<b>两正概率事件互斥必不独立</b>！",
      rel: ["prob-classical-events", "rv-cond-bayes", "rv-binomial-hypergeom"]
    },
    {
      id: "prob-freq-sim", ch: 10, sec: "b2-10-3", secName: "10.3 频率与概率",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "频率稳定性、随机模拟映射与破除赌徒谬误",
      keywords: ["频率", "概率", "稳定性", "随机模拟", "赌徒谬误", "放回抽样"],
      trig: "用大量重复试验的频率估计未知概率、设计随机数模拟方案、或分析概率认知误区。",
      key: "1. <b>频率 vs 概率</b>：频率是试验产生的一组随机数据，随试验变化；概率是事件内在的客观确定值。<br>2. <b>随机模拟设计</b>：设定随机数字（如 0～9），让对应事件发生的数字所占比例严格等于理论概率。<br>3. <b>破除赌徒谬误</b>：抛掷公平硬币（正反面等可能），且每次试验相互独立；即使连出 5 次正面，第 6 次正面的概率依然是 0.5，前面试验绝不“欠”后面！",
      warn: "大量重复试验时，频率在概率附近波动并趋于稳定，但不保证每增加一次试验就更接近概率；随机模拟必须保持每次试验条件严格一致。",
      rel: ["prob-classical-events"]
    },
    {
      id: "vec3-ops-coplanar", ch: 11, sec: "e1-1-1", secName: "1.1 空间向量及其运算",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "空间向量线性运算、共面向量定理与投影向量",
      keywords: ["空间向量", "共面向量", "数量积", "空间夹角", "投影向量"],
      trig: "判断空间向量共面、空间多边形首尾相接化简或计算空间数量积。",
      key: "1. <b>自由平移性</b>：空间任意两向量必定共面；空间任意多边形首尾相接封闭折线和向量为零向量（\\(\\vec{AB}+\\vec{BC}+\\vec{CD}+\\vec{DA}=\\boldsymbol{0}\\)）。<br>2. <b>共面向量定理</b>：向量 \\(\\boldsymbol{p}\\) 与两个不共线向量 \\(\\boldsymbol{a},\\boldsymbol{b}\\) 共面的充要条件是存在唯一有序实数对 \\((x,y)\\) 使 <b>\\(\\boldsymbol{p} = x\\boldsymbol{a} + y\\boldsymbol{b}\\)</b>。<br>3. <b>空间数量积</b>：\\(\\boldsymbol{a}\\cdot\\boldsymbol{b} = |\\boldsymbol{a}||\\boldsymbol{b}|\\cos\\langle\\boldsymbol{a},\\boldsymbol{b}\\rangle\\)（夹角范围 \\([0,\\pi]\\)）。向量 \\(\\boldsymbol{a}\\) 在单位向量 \\(\\boldsymbol{e}\\) 上的投影向量为 \\((\\boldsymbol{a}\\cdot\\boldsymbol{e})\\boldsymbol{e}\\)。",
      warn: "数量积绝不满足结合律；两非零向量数量积为 0 是互相垂直的充要条件，但两向量夹角范围是 \\([0, 180^\\circ]\\)（可钝角）。",
      rel: ["vec3-base-theorem", "vec-add-sub-tri"]
    },
    {
      id: "vec3-base-theorem", ch: 11, sec: "e1-1-2", secName: "1.2 空间向量基本定理",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "空间向量基本定理与四点共面充要条件",
      keywords: ["空间基底", "不共面", "四点共面", "基底展开", "x+y+z=1"],
      trig: "选择基底线性表示未知空间向量、证明四点共面或求参数值。",
      key: "1. <b>空间基底</b>：三个<b>不共面</b>的向量 \\(\\{\\boldsymbol{e}_1,\\boldsymbol{e}_2,\\boldsymbol{e}_3\\}\\) 叫做空间的一个基底，任一向量 \\(\\boldsymbol{p}\\) 存在唯一的有序实数组 \\((x,y,z)\\) 使 \\(\\boldsymbol{p} = x\\boldsymbol{e}_1 + y\\boldsymbol{e}_2 + z\\boldsymbol{e}_3\\)。<br>2. <b>四点共面定理</b>：当点 \\(A,B,C\\) 不共线时，对空间任意参考点 \\(O\\)，\\(P, A, B, C\\) 四点共面的充要条件是存在实数 \\(x,y,z\\) 使：<br>$$\\begin{gathered}\\vec{OP} = x\\vec{OA} + y\\vec{OB} + z\\vec{OC}\\\\\\text{且}\\quad \\mathbf{x + y + z = 1}\\end{gathered}$$",
      warn: "仅“两两不共线”不能作为基底！三个向量若同在一个平面内，两两不共线但共面，绝不能构成空间基底；斜基底数量积展开必须保留 \\(\\boldsymbol{e}_i\\cdot\\boldsymbol{e}_j\\) 交叉项！",
      rel: ["vec3-ops-coplanar", "vec3-coord-ops", "vec-base-theorem"]
    },
    {
      id: "vec3-coord-ops", ch: 11, sec: "e1-1-3", secName: "1.3 空间向量及其运算的坐标表示",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "空间直角坐标系运算、两点距离与垂直平行充要条件",
      keywords: ["空间坐标", "距离公式", "空间垂直", "右手系", "模长"],
      trig: "建立空间直角坐标系求向量坐标、模长、距离及平行垂直判定。",
      key: "设 \\(\\boldsymbol{a}=(x_1,y_1,z_1), \\boldsymbol{b}=(x_2,y_2,z_2)\\)：<br>• <b>模长与距离</b>：\\(|\\boldsymbol{a}| = \\sqrt{x_1^2+y_1^2+z_1^2}\\)，若点 \\(A(x_1,y_1,z_1),B(x_2,y_2,z_2)\\)，则 \\(d(A,B) = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}\\)。<br>• <b>数量积坐标式</b>：\\(\\boldsymbol{a}\\cdot\\boldsymbol{b} = x_1x_2 + y_1y_2 + z_1z_2\\)。<br>• <b>两非零向量的垂直判据</b>（\\(\\boldsymbol a\\ne\\boldsymbol0,\\boldsymbol b\\ne\\boldsymbol0\\)）：\\(\\boldsymbol{a}\\perp\\boldsymbol{b} \\iff x_1x_2 + y_1y_2 + z_1z_2 = 0\\)。<br>• <b>两非零向量的平行判据</b>（\\(\\boldsymbol a\\ne\\boldsymbol0,\\boldsymbol b\\ne\\boldsymbol0\\)）：\\(\\boldsymbol{a}\\parallel\\boldsymbol{b} \\iff \\exists\\lambda,\\ \\boldsymbol{b} = \\lambda\\boldsymbol{a}\\)，即同时满足 \\(x_2=\\lambda x_1,\\ y_2=\\lambda y_1,\\ z_2=\\lambda z_1\\)。",
      warn: "坐标轴须两两垂直，且使用相同的单位长度，不能把任意斜棱当坐标轴。判断平行、垂直或求夹角前，先查两个向量是否非零；有零向量时另按定义或约定处理。分量含 \\(0\\) 时不要写分数相除；判断两个非零向量平行，用 \\(\\boldsymbol b=\\lambda\\boldsymbol a\\) 列三个分量方程。",
      rel: ["vec3-base-theorem", "vec3-distance-angles", "vec-coord-ops"]
    },
    {
      id: "vec3-distance-angles", ch: 11, sec: "e1-1-4", secName: "1.4 空间向量的应用",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "空间向量法三大夹角与点面距离公式全景",
      keywords: ["法向量", "点面距离", "异面角", "线面角", "二面角", "sinθ"],
      trig: "用向量法求点到平面距离、异面直线所成角、线面角与二面角大小。",
      key: "设直线方向向量为 \\(\\boldsymbol{u},\\boldsymbol{v}\\)，平面法向量为 \\(\\boldsymbol{n},\\boldsymbol{n}_1,\\boldsymbol{n}_2\\)（以上向量均非零）：<br>• <b>点 \\(P\\) 到平面 \\(\\alpha\\) 距离</b>：$$d = \\frac{|\\vec{AP}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{n}|}\\quad (A\\in\\alpha)$$<br>• <b>异面直线所成角</b>：$$\\begin{gathered}\\cos\\theta = \\frac{|\\boldsymbol{u}\\cdot\\boldsymbol{v}|}{|\\boldsymbol{u}||\\boldsymbol{v}|}\\in[0,1),\\\\\\theta\\in(0, 90^\\circ]\\end{gathered}$$<br>• <b>直线与平面所成角</b>：$$\\begin{gathered}\\sin\\theta = \\frac{|\\boldsymbol{u}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{u}||\\boldsymbol{n}|}\\in[0,1],\\\\\\theta\\in[0, 90^\\circ]\\end{gathered}$$（注意是 <b>\\(\\sin\\theta\\)</b>，因为法向量垂直于平面，线面角与方向向量、法向量所成的不大于 \\(90^\\circ\\) 的角互余，后者的余弦值就是 \\(\\sin\\theta\\)）。<br>• <b>二面角</b>：$$\\cos\\theta = \\pm\\frac{\\boldsymbol{n}_1\\cdot\\boldsymbol{n}_2}{|\\boldsymbol{n}_1||\\boldsymbol{n}_2|},\\quad \\theta\\in[0, 180^\\circ]$$",
      warn: "二面角绝不能机械取绝对值算成锐角！必须结合几何图形观察二面角是钝角（\\(\\cos\\theta&lt;0\\)）还是锐角（\\(\\cos\\theta&gt;0\\)）后确定正负号！",
      rel: ["vec3-coord-ops", "geo-perp-dihedral", "vec-dot-product"]
    },
    {
      id: "geom-line-slope-eq", lab: "geom-line-slope-eq", ch: 12, sec: "e1-2-1", secName: "2.1 直线的倾斜角与斜率",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "直线的倾斜角、斜率定义与过两点斜率公式",
      keywords: ["倾斜角", "斜率", "两点斜率公式", "垂直x轴", "钝角锐角"],
      trig: "求直线的倾斜角、利用过两点坐标求斜率，或由斜率范围求倾斜角范围。",
      key: "1. <b>倾斜角 \\(\\alpha\\) 范围</b>：\\(0^\\circ \\le \\alpha < 180^\\circ\\)（或 \\([0, \\pi)\\)）。<br>• \\(\\alpha=0^\\circ \\iff k=0\\)（水平线）；<br>• \\(0^\\circ < \\alpha < 90^\\circ \\iff k > 0\\)；\\(\\alpha=90^\\circ \\iff\\) 斜率不存在（垂直线）；<br>• \\(90^\\circ < \\alpha < 180^\\circ \\iff k < 0\\)。<br>2. <b>过两点斜率公式</b>：对 \\(P_1(x_1,y_1), P_2(x_2,y_2)\\)（\\(x_1 \\ne x_2\\)）：<br>$$k = \\tan\\alpha = \\frac{y_2 - y_1}{x_2 - x_1}$$",
      warn: "当 \\(x_1 = x_2\\) 时直线垂直于 \\(x\\) 轴，倾斜角 \\(\\alpha = 90^\\circ\\)，<b>斜率不存在</b>，绝不能套用斜率公式分母为 0！此外当 \\(k\\) 增大时，倾斜角 \\(\\alpha\\) 在 \\([0^\\circ, 90^\\circ)\\) 和 \\((90^\\circ, 180^\\circ)\\) 上分别单调递增，但全定义域上<b>不具有单调性</b>。",
      rel: ["geom-line-five-forms", "geom-line-dist-intersect"]
    },
    {
      id: "geom-line-five-forms", ch: 12, sec: "e1-2-2", secName: "2.2 直线的方程",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "直线方程五种形式与两直线平行垂直充要条件",
      keywords: ["直线方程", "点斜式", "斜截式", "两点式", "截距式", "一般式", "平行垂直充要条件"],
      trig: "由已知点、斜率或截距求直线方程，或判断两直线平行与垂直求参数。",
      key: "1. <b>点斜式与斜截式</b>：\\(y-y_0=k(x-x_0)\\) 与 \\(y=kx+b\\)（斜率 \\(k\\) 必须存在；垂直线为 \\(x=x_0\\)）。<br>2. <b>两点式</b>：\\(\\dfrac{y-y_1}{y_2-y_1}=\\dfrac{x-x_1}{x_2-x_1}\\)，须 \\(x_1\\ne x_2,y_1\\ne y_2\\)；水平、竖直线分别写 \\(y=y_1,x=x_1\\)。<br>3. <b>截距式</b>：\\(x/a+y/b=1\\)，须两轴截距 \\(a,b\\ne0\\)，过原点不能用此式。<br>4. <b>一般式及位置关系</b>：设 \\(l_i:A_ix+B_iy+C_i=0\\)，且各有 \\(A_i^2+B_i^2>0\\)。<br>• <b>平行且不重合</b>当且仅当 \\(A_1B_2-A_2B_1=0\\)，并且<b>两直线不重合</b>。代入一条直线上的点，若不满足另一方程，就可排除重合。也可检查 \\(A_1C_2-A_2C_1\\ne0\\) 或 \\(B_1C_2-B_2C_1\\ne0\\) 至少一项成立；两项都为 \\(0\\) 则重合，水平线也适用。<br>• <b>垂直</b>当且仅当 \\(A_1A_2+B_1B_2=0\\)，包括一条水平、另一条竖直的情形。",
      warn: "已知 \\(l_1 \\parallel l_2\\) 求参数时，求出的值<b>必须代回原方程检验是否重合</b>！若用斜率 \\(k_1k_2=-1\\) 判垂直，容易漏掉一条斜率为 0、另一条斜率不存在的特例，优先使用一般式 \\(A_1A_2+B_1B_2=0\\)。",
      rel: ["geom-line-slope-eq", "geom-line-dist-intersect", "geom-circle-pos-rel"]
    },
    {
      id: "geom-line-dist-intersect", ch: 12, sec: "e1-2-3", secName: "2.3 直线的交点坐标与距离公式",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "点线距、两平行线夹层距与直线系方程",
      keywords: ["点到直线距离", "两平行线距离", "交点坐标", "直线系", "垂直距离"],
      trig: "求点到直线的垂直距离、求两条平行线间的公垂线段长，或求解过交点的直线系。",
      key: "1. <b>点到直线距离公式</b>：点 \\(P(x_0,y_0)\\) 到直线 \\(Ax+By+C=0\\) 的距离：<br>$$d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}$$2. <b>两平行线间距离公式</b>：\\(l_1: Ax+By+C_1=0\\) 与 \\(l_2: Ax+By+C_2=0\\)（<b>必须先将 \\(x,y\\) 系数配成完全一致</b>）：<br>$$d = \\frac{|C_1 - C_2|}{\\sqrt{A^2 + B^2}}$$3. <b>交点与直线系</b>：联立方程组求交点；过 \\(l_1, l_2\\) 交点的直线系为 \\(A_1x+B_1y+C_1 + \\lambda(A_2x+B_2y+C_2)=0\\)（不含 \\(l_2\\)）。",
      warn: "使用平行线间距离公式前，<b>必须确保两直线方程的 \\(x\\) 和 \\(y\\) 项系数完全相同</b>！若一条是 \\(x+2y-1=0\\)，另一条是 \\(2x+4y+3=0\\)，必须把第一条化为 \\(2x+4y-2=0\\) 才能算分子 \\(|(-2)-3|\\)。",
      rel: ["geom-line-five-forms", "geom-circle-line-rel", "geom-circle-pos-rel"]
    },
    {
      id: "geom-circle-line-rel", ch: 12, sec: "e1-2-4", secName: "2.4 圆的方程",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "圆的标准方程、一般方程与待定系数法",
      keywords: ["圆的标准方程", "圆的一般方程", "待定系数法", "圆心", "半径"],
      trig: "求圆的方程、由一般方程求圆心半径，或根据几何性质设方程待定系数。",
      key: "1. <b>标准方程</b>：\\((x-a)^2 + (y-b)^2 = r^2\\)（圆心 \\((a,b)\\)，半径 \\(r>0\\)）。<br>2. <b>一般方程</b>：\\(x^2 + y^2 + Dx + Ey + F = 0\\)<br>• 充要条件：\\(D^2 + E^2 - 4F > 0\\)；<br>• 圆心坐标为 \\(\\left(-\\dfrac{D}{2}, -\\dfrac{E}{2}\\right)\\)，半径 \\(r = \\dfrac{1}{2}\\sqrt{D^2 + E^2 - 4F}\\)。<br>3. <b>方程选择策略</b>：已知圆心、半径或切线几何特征设<b>标准方程</b>；已知圆经过三个非共线点设<b>一般方程</b>套三元一次方程组求解。",
      warn: "使用一般方程的圆心、半径公式前，须先把 \\(x^2,y^2\\) 的相同非零系数化为 \\(1\\)。给出方程 \\(x^2+y^2+Dx+Ey+F=0\\) 时，必须先核查 \\(D^2+E^2-4F > 0\\)；若 \\(=0\\) 表示一个单点，若 \\(<0\\) 不表示任何图形。",
      rel: ["geom-line-dist-intersect", "geom-circle-pos-rel", "conic-ellipse"]
    },
    {
      id: "geom-circle-pos-rel", ch: 12, sec: "e1-2-5", secName: "2.5 直线与圆、圆与圆的位置关系",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "几何法判直线与圆位置、切线长与公共弦方程",
      keywords: ["直线与圆", "圆与圆", "切线长", "公共弦", "相交相切相离", "几何法"],
      trig: "判断直线与圆相交/相切/相离，求过圆外一点的切线方程与切线长，或求相交弦长。",
      key: "1. <b>几何法优先原则</b>：计算圆心到直线距离 \\(d\\) 与半径 \\(r\\) 比较：<br>• \\(d < r \\iff\\) 相交；\\(d = r \\iff\\) 相切；\\(d > r \\iff\\) 相离。<br>• 相交弦长垂径定理勾股：\\(L = 2\\sqrt{r^2 - d^2}\\)（比联立韦达定理快数倍且不易算错）。<br>2. <b>两圆公共弦方程</b>：两圆相交时，先把各方程化为 \\(x^2,y^2\\) 系数均为 \\(1\\) 的一般式，再两式相减，所得一次方程就是公共弦所在直线方程。<br>3. <b>圆外一点切线长</b>：\\(L_{\\text{切}} = \\sqrt{d^2 - r^2}\\)（\\(d\\) 为圆外点到圆心的距离）。<br>4. <b>过圆外点的切线方程</b>：设点为 \\(P(x_0,y_0)\\)，先检查竖直线 \\(x=x_0\\) 是否相切；有斜率的切线设为 \\(y-y_0=k(x-x_0)\\)，令圆心到该直线的距离等于半径 \\(r\\)，解出 \\(k\\)。",
      warn: "求过圆外点 \\(P\\) 的切线方程时，切线<b>必定有 2 条</b>！若设点斜式只解出一个斜率 \\(k\\)，说明另一条切线垂直于 \\(x\\) 轴（斜率不存在），方程为 \\(x=x_P\\)，必须补上！",
      rel: ["geom-circle-line-rel", "geom-line-dist-intersect", "geom-line-five-forms"]
    },
    {
      id: "conic-ellipse", lab: "conic-ellipse", ch: 13, sec: "e1-3-1", secName: "3.1 椭圆",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "椭圆严格几何定义、标准方程与几何量关系",
      keywords: ["椭圆","2a>2c","长轴","短轴","椭圆离心率","a²=b²+c²"],
      trig: "求椭圆标准方程、判断焦点所在轴或求离心率。",
      key: "1. <b>严格定义</b>：到两焦点距离和 \\(|PF_1|+|PF_2|=2a\\)，必须满足 <b>\\(2a &gt; |F_1F_2|=2c &gt; 0\\)</b>（若 \\(2a=2c\\) 退化为线段 \\(F_1F_2\\)；若 \\(2a&lt;2c\\) 无轨迹）。<br>2. <b>标准方程看分母大小</b>：<br>• 焦点在 \\(x\\) 轴：\\(\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}=1\\)（\\(a&gt;b&gt;0\\)）；焦点在 \\(y\\) 轴：\\(\\dfrac{y^2}{a^2}+\\dfrac{x^2}{b^2}=1\\)。谁的分母大焦点就在哪个轴！<br>3. <b>几何量铁律</b>：<b>\\(a^2 = b^2 + c^2\\)</b>（\\(a\\) 最大！焦距为 \\(2c\\) 不是 \\(c\\)，长轴长为 \\(2a\\) 不是 \\(a\\)）。<br>4. <b>离心率</b>：\\(e = \\dfrac{c}{a}\\in(0,1)\\)（\\(e\\) 越大越扁，越小越圆）。",
      warn: "焦距是 \\(2c\\) 不是 \\(c\\)；长轴是 \\(2a\\) 不是 \\(a\\)；椭圆中 \\(a\\) 最大（\\(a^2=b^2+c^2\\)），切勿与勾股定理或双曲线混淆！",
      rel: ["conic-hyperbola", "conic-parabola", "geom-circle-line-rel"]
    },
    {
      id: "conic-hyperbola", ch: 13, sec: "e1-3-2", secName: "3.2 双曲线",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "双曲线定义、渐近线方程与实轴判定（正项定焦点）",
      keywords: ["双曲线", "渐近线", "实轴", "虚轴", "c²=a²+b²", "等轴双曲线"],
      trig: "求双曲线标准方程、渐近线方程、离心率或双分支轨迹判定。",
      key: "1. <b>严格定义</b>：到两焦点距离差的<b>绝对值</b> \\(||PF_1|-|PF_2|| = 2a\\)（\\(0&lt;2a&lt;2c\\)）。若无绝对值只表示一支！若 \\(2a=2c\\) 为两条向外射线；若 \\(2a&gt;2c\\) 无轨迹。<br>2. <b>标准方程正项定焦点</b>：<br>• 焦点在 \\(x\\) 轴：\\(\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1\\)（\\(a&gt;0,b&gt;0\\)）；焦点在 \\(y\\) 轴：\\(\\dfrac{y^2}{a^2}-\\dfrac{x^2}{b^2}=1\\)。<b>正项对应实轴</b>，切勿按分母大小判断（\\(a\\) 可以小于 \\(b\\)）！<br>3. <b>几何量关系</b>：<b>\\(c^2 = a^2 + b^2\\)</b>（\\(c\\) 最大！\\(e=\\dfrac{c}{a}&gt;1\\)）。<br>4. <b>渐近线方程</b>：将对应标准方程右边改为 \\(0\\)，再解出 \\(y\\)：<br>• 焦点在 \\(x\\) 轴：\\(y=\\pm\\dfrac{b}{a}x\\)；<br>• 焦点在 \\(y\\) 轴：\\(y=\\pm\\dfrac{a}{b}x\\)。等轴双曲线 \\(a=b \\iff e=\\sqrt{2}\\)，渐近线互相垂直（\\(y=\\pm x\\)）。",
      warn: "双曲线焦点位置永远由“正项”决定，绝不能看分母大小！无绝对值的差等于常数只代表双曲线的一支！渐近线与双曲线无限逼近但绝不相交！",
      rel: ["conic-ellipse", "conic-parabola"]
    },
    {
      id: "conic-parabola", ch: 13, sec: "e1-3-3", secName: "3.3 抛物线",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "抛物线四种标准方程、焦半径公式与焦点准线转化法",
      keywords: ["抛物线","焦点","准线","抛物线焦半径","x0+p/2","转化法"],
      trig: "求抛物线焦点准线、求抛物线上点到焦点距离最值或焦半径计算。",
      key: "1. <b>严格定义</b>：到定点 \\(F\\) 与定直线 \\(l\\) 距离相等的点的轨迹（\\(F\\notin l\\)）。<br>2. <b>四种标准形式与除以 4 法则</b>：<br>• \\(y^2=2px\\ (p&gt;0)\\)：向右开，焦点 \\((\\dfrac{p}{2},0)\\)，准线 \\(x=-\\dfrac{p}{2}\\)；<br>• \\(y^2=-2px\\)：向左开，焦点 \\((-\\dfrac{p}{2},0)\\)，准线 \\(x=\\dfrac{p}{2}\\)；<br>• \\(x^2=2py\\)：向上开，焦点 \\((0,\\dfrac{p}{2})\\)，准线 \\(y=-\\dfrac{p}{2}\\)；<br>• \\(x^2=-2py\\)：向下开，焦点 \\((0,-\\dfrac{p}{2})\\)，准线 \\(y=\\dfrac{p}{2}\\)。<br>• <b>口诀</b>：一次项定开口方向，<b>一次项的带符号系数除以 \\(4\\) 得焦点相应的非零坐标；系数的绝对值除以 \\(2\\) 才是正参数 \\(p\\)</b>！<br>3. <b>焦半径转准线神器</b>：对 \\(y^2=2px\\)，曲线上点 \\(P(x_0,y_0)\\) 的焦半径 <b>\\(|PF| = d = x_0 + \\dfrac{p}{2}\\)</b>。",
      warn: "一次项系数除以 4 才是焦点坐标，切勿直接把 \\(2p\\) 当成焦点坐标！到定点的距离求最值，第一直觉必转化为“到准线的垂直距离”！",
      rel: ["conic-ellipse", "conic-hyperbola"]
    },
    {
      id: "seq-an-sn-relation", ch: 14, sec: "e2-4-1", secName: "4.1 数列的概念与表示",
      kind: "pitfall", kindLabel: "🔴 易错红线",
      title: "已知 S_n 求 a_n 分段与 n=1 检验红线",
      keywords: ["S_n求a_n", "分段函数", "n=1检验", "递推公式"],
      trig: "题目给出数列前 \\(n\\) 项和 \\(S_n\\) 的表达式，求解通项公式 \\(a_n\\)。",
      key: "由 \\(S_n\\) 求 \\(a_n\\) 必须严格走两步：<br>• 当 \\(n=1\\) 时，\\(a_1 = S_1\\)；<br>• 当 \\(n\\ge 2\\) 时，\\(a_n = S_n - S_{n-1}\\)。<br><b>合并检验</b>：将 \\(n=1\\) 代入 \\(n\\ge 2\\) 的式子，若算得结果恰好等于 \\(S_1\\)，则合并为一个统一通项；若不相等，必须写成分段形式！",
      warn: "先单独算 \\(a_1=S_1\\)，再检验差分通项在 \\(n=1\\) 是否与它一致，不能只看 \\(S_n\\) 是否带常数项。例：\\(S_n=2^n-1\\) 得到的 \\(a_n=2^{n-1}\\) 对 \\(n=1\\) 仍成立；若改为 \\(S_n=2^n-1+c\\)，则 \\(a_1=1+c\\)，只有 \\(c=0\\) 时才能与这个差分通项合并。",
      rel: ["seq-arith-geom", "seq-sum-methods"]
    },
    {
      id: "seq-arith-geom", lab: "seq-arith-geom", ch: 14, sec: "e2-4-2", secName: "4.2-4.3 等差数列与等比数列全景",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "等差等比数列通项性质、前 n 项和与对称下标和",
      keywords: ["等差数列", "等比数列", "通项公式", "前n项和", "公差", "公比", "下标和性质"],
      trig: "求解等差、等比数列的基本量（首项、公差/公比、项数），或利用下标和性质化简计算。",
      key: "1. <b>等差数列</b>：\\(a_n = a_1 + (n-1)d\\)；前 \\(n\\) 项和 \\(S_n = \\dfrac{n(a_1+a_n)}{2} = na_1 + \\dfrac{n(n-1)}{2}d\\)；若 \\(m+n = p+q\\)，则 \\(a_m + a_n = a_p + a_q\\)。<br>2. <b>等比数列</b>：\\(a_n = a_1 q^{n-1}\\)；若 \\(m+n = p+q\\)，则 \\(a_m a_n = a_p a_q\\)；前 \\(n\\) 项和：<br>\\[S_n=\\begin{cases}\\dfrac{a_1(1-q^n)}{1-q},&q\\ne1\\\\na_1,&q=1\\end{cases}\\]（\\(q\\ne1\\) 时，也可写为 \\(S_n=\\dfrac{a_1-a_nq}{1-q}\\)。）",
      warn: "等比数列求和 \\(S_n\\) 必须<b>优先分类讨论 \\(q=1\\) 与 \\(q\\ne 1\\)</b>！遗漏 \\(q=1\\) 是数列大题头号扣分点。",
      rel: ["seq-an-sn-relation", "seq-sum-methods", "seq-math-induction"]
    },
    {
      id: "seq-sum-methods", ch: 14, sec: "e2-4-3", secName: "4.3 等比数列应用与求和套路",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "数列求和两大王牌套路：错位相减法与裂项相消法",
      keywords: ["求和套路", "错位相减", "裂项相消", "等差乘等比", "分式裂项"],
      trig: "求解“等差×等比”数列求和、或分式分母乘积形式的级数求和。",
      key: "1. <b>错位相减法</b>：针对 \\(a_n=(\\alpha n+\\beta)q^n\\)。先分 \\(q=1\\) 与 \\(q\\ne1\\)：<br>• \\(q=1\\) 时是等差型，直接得 \\(S_n=\\alpha n(n+1)/2+n\\beta\\)。<br>• \\(q\\ne1\\) 时写出 \\(S_n\\)，同乘 \\(q\\) 并错位相减；\\(S_n-qS_n\\) 的最后一项是 \\(-q a_n=-(\\alpha n+\\beta)q^{n+1}\\)，中间项用等比求和，最后才除以 \\(1-q\\)。<br>2. <b>裂项相消法</b>：如 \\(\\dfrac{1}{n(n+k)}=\\dfrac1k\\left(\\dfrac1n-\\dfrac1{n+k}\\right)\\)（\\(k\\ne0\\)，且各分母非零），展开后检查首尾剩余项。如 \\(k=2\\)，求前 \\(n\\) 项和（\\(n\\ge2\\)）时，首尾各留两项，不能只留各一项。",
      warn: "这里 \\(a_n\\) 已表示数列的完整第 \\(n\\) 项，故错位相减末项是 \\(-q a_n\\)，不是 \\(-a_nq^n\\)。例：\\(a_n=n2^n\\)，\\(n=3\\) 时末项为 \\(-2\\times24=-48\\)。使用分式前先查 \\(q=1\\)；裂项别漏系数 \\(1/k\\)。",
      rel: ["seq-arith-geom", "seq-an-sn-relation", "seq-math-induction"]
    },
    {
      id: "seq-math-induction", ch: 14, sec: "e2-4-4", secName: "4.4 数学归纳法（选学）",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "数学归纳法两步规范与归纳假设的使用",
      keywords: ["数学归纳法", "归纳奠基", "归纳递推", "归纳假设", "正整数", "选学"],
      trig: "证明与正整数 \\(n\\) 相关的等式、整除性、不等式或数列猜想。",
      key: "1. <b>第一步：归纳奠基</b>：验证当 \\(n = n_0\\)（通常取 \\(n_0=1\\) 或题目给定的起始正整数）时命题成立。<br>2. <b>第二步：归纳递推</b>：假设当 \\(n = k\\ (k\\ge n_0, k\\in\\mathbf N^*)\\) 时命题成立，<b>以此为必须使用的前提条件</b>，推导出当 \\(n = k+1\\) 时命题也成立。<br>3. <b>结论宣告</b>：由 (1) 和 (2) 可知，命题对所有大于等于 \\(n_0\\) 的正整数 \\(n\\) 均成立。",
      warn: "题目要求用数学归纳法时，须写清起点、归纳假设，并在从 \\(k\\) 到 \\(k+1\\) 的推导中说明哪一步用了归纳假设。不能只验几个数，也不能把 \\(k+1\\) 时的待证结论当成已知。和式两端或分母结构中新增的项要数清。",
      rel: ["seq-arith-geom", "seq-sum-methods", "count-binomial"]
    },
    {
      id: "calc-derivative-def", lab: "calc-derivative-def", ch: 15, sec: "e2-5-1", secName: "5.1 导数的概念及其意义",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "导数本质极限定义与曲线切线几何意义",
      keywords: ["瞬时变化率", "导数定义", "切线斜率", "割线极限", "在点处vs过点"],
      trig: "求函数在某点处的瞬时变化率、导数定义极限式或切线方程。",
      key: "1. <b>极限定义</b>：$$\\begin{aligned}f'(x_0)&=\\lim_{h\\to0}\\frac{f(x_0+h)-f(x_0)}{h}\\end{aligned}$$（瞬时变化率即平均变化率在 \\(h\\to 0\\) 时的极限）。<br>2. <b>几何意义</b>：\\(f'(x_0)\\) 就是曲线上点 \\(P(x_0, f(x_0))\\) 处<b>切线的斜率 \\(k\\)</b>。<br>3. <b>点斜式切线方程</b>：$$y - f(x_0) = f'(x_0)(x - x_0)$$",
      warn: "“在点 \\(P\\) 处的切线”与“过点 \\(P\\) 的切线”完全不同！“过点 \\(P\\)”的点不一定是切点，必须先设切点 \\((x_0, f(x_0))\\) 代入切线方程求解！",
      rel: ["calc-rules-composite", "calc-monot-extrema"]
    },
    {
      id: "calc-rules-composite", ch: 15, sec: "e2-5-2", secName: "5.2 导数的运算",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "基本初等函数导数公式与 f(ax+b) 求导",
      keywords: ["导数公式", "乘除求导", "f(ax+b)", "一次内层", "(uv)"],
      trig: "对多项式、指对函数、分式，或内层为一次式 ax+b 的函数求导。",
      key: "<b>运算前提</b>：相关函数在所讨论点须有定义且可导；商的分母 \\(v(x)\\ne0\\)，\\(\\ln x\\) 的实数定义域为 \\(x>0\\)。<br>1. <b>常用基本公式</b>：\\((x^n)' = nx^{n-1}\\)，\\((\\mathrm{e}^x)' = \\mathrm{e}^x\\)，\\((\\ln x)' = \\dfrac{1}{x}\\)，\\((\\sin x)' = \\cos x\\)，\\((\\cos x)' = -\\sin x\\)。<br>2. <b>四则运算</b>：<br>• \\((uv)' = u'v + uv'\\)<br>• \\(\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}\\)（注意分子是减号！）。<br>3. <b>简单复合，课程要求到 \\(f(ax+b)\\)</b>：$$[f(ax+b)]' = a\\, f'(ax+b)$$（外层导数再乘内层系数 \\(a\\)，负号一起乘）。一般形式 \\(f'(g(x))\\cdot g'(x)\\) 教材展示过，运用范围限于内层是一次式；像 \\(\\ln(x^2+1)\\) 不按已学方法直接套。多项式可以先展开再逐项求导。",
      warn: "除法求导分子是 \\(u'v - uv'\\)，切勿记成加号！\\(f(ax+b)\\) 切勿漏乘系数 \\(a\\)。不要把一般链式法则当成本节已学方法。",
      rel: ["calc-derivative-def", "calc-monot-extrema"]
    },
    {
      id: "calc-monot-extrema", lab: "calc-monot-extrema", ch: 15, sec: "e2-5-3", secName: "5.3 导数在研究函数中的应用",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "导数判定函数单调性、极值点充分性与闭区间最值",
      keywords: ["单调性", "极值点", "最值", "变号", "f'(x)>=0", "候选池"],
      trig: "求函数单调区间、求极值点、或求闭区间 \\([a, b]\\) 上的最大值最小值。",
      key: "1. <b>可导区间上的递增判据</b>：若区间内处处有 \\(f'(x)>0\\)，则 \\(f\\) 严格递增。若 \\(f'(x)\\ge0\\)，还须排除函数在某一整段上不变的情形；导数只在个别点为 \\(0\\)，不妨碍递增，如 \\(x^3\\)。递减时反向判号。<br>2. <b>极值的常用充分判别</b>：设 \\(x_0\\) 是区间内的点，函数在 \\(x_0\\) 及其左右一小段内可导，且 \\(f'(x_0)=0\\)。若左侧导数为正、右侧为负，得极大值；左负右正，得极小值；两侧都为正或都为负，则不是极值点。<br>3. <b>闭区间最值</b>：先确认函数在 \\([a,b]\\) 连续、在 \\((a,b)\\) 内可导；解 \\(f'(x)=0\\)，保留区间内部的解，把这些点和两端点的函数值一起比较。若区间内部有不能求导的点，须另外检查，不能只解导数为零的方程。",
      warn: "\\(f'(x_0)=0\\) 只是内部可导极值点的必要条件，不是充分条件，如 \\(x^3\\) 在0处没有极值。须核两侧的实际符号；闭区间还须连续，并保留端点和不可导候选。",
      rel: ["calc-derivative-def", "calc-rules-composite", "fn-mono-def", "zero-theorem"]
    },
    {
      id: "count-principles", ch: 16, sec: "e3-6-1", secName: "6.1 分类加法计数原理与分步乘法计数原理",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "分类加法与分步乘法两大计数原理核心模型",
      keywords: ["分类加法", "分步乘法", "计数原理", "完成一件事情", "互斥", "连续", "加法", "乘法"],
      trig: "求解涉及多途径、多阶段的方案计数问题，判断何时用加何时用乘。",
      key: "1. <b>分类加法（或）</b>：各类互不交叉且覆盖全部方案，每类中的每种方法都能单独完成整件事。总数 \\(N=m_1+\\cdots+m_k\\)。<br>2. <b>分步乘法（且）</b>：各步缺一不可。若无论前面几步怎样合法选择，第 \\(i\\) 步都恰有 \\(n_i\\) 种合法选择，则总数 \\(N=n_1\\cdots n_k\\)。后一步可选的具体对象可以依赖前一步，<b>不要求概率意义的相互独立</b>。<br>3. <b>核查分支数</b>：各步选择数须适用于前面每一种合法的选择结果；若分支数不同，应先分类，再分别相乘后相加。",
      warn: "先问一种方法能否单独完成整件事，再查分类是否不重不漏、每步后续选择数是否固定。例：从3张不同卡中不放回依次取2张，第二步能选哪张依赖第一步，但每次都剩2种，总数仍为 \\(3\\times2=6\\)，不能因“有依赖”就拒绝乘法计数。",
      rel: ["count-perm-comb", "prob-classical-events"]
    },
    {
      id: "count-perm-comb", ch: 16, sec: "e3-6-2", secName: "6.2 排列与组合",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "排列数、组合数运算性质与捆绑法插空法",
      keywords: ["排列数", "组合数", "顺序", "捆绑法", "插空法", "隔板法", "A_n^m", "C_n^m"],
      trig: "求解元素排队、分组、选拔问题，以及相邻、不相邻等受限排队计数。",
      key: "1. <b>核心辨析：是否有顺序</b>。选出并讲求顺序（排队、职务不同）为排列 \\(A_n^m = \\dfrac{n!}{(n-m)!}\\)；只选出不讲顺序（握手、结伴）为组合 \\(C_n^m = \\dfrac{n!}{m!(n-m)!} = \\dfrac{A_n^m}{m!}\\)。<br>2. <b>组合数的两个关系（探究拓展，可现场推导）</b>：对称 \\(C_n^m = C_n^{n-m}\\)（选走 \\(m\\) 个等于留下 \\(n-m\\) 个）；递推 \\(C_{n+1}^m = C_n^m + C_n^{m-1}\\)（按某一个元素选或不选分类）。前式取整数 \\(0\\le m\\le n\\)，后式取整数 \\(1\\le m\\le n\\)；忘记时可从“选走与留下”或“选与不选”推回。<br>3. <b>受限排队的两种组织方式</b>：<br>• <b>相邻</b>：把相邻元素捆成一个大元素再排，<b>再乘捆内的内部排列</b>。<br>• <b>不相邻</b>：先排其余元素，再往空位里插（首尾都有空）。",
      warn: "捆绑法千万不要漏乘捆内元素的内部排列（如 \\(m!\\)）；插空法必须先排好其余元素，明确空位数等于无限制元素个数加 1！",
      rel: ["count-principles", "count-binomial", "prob-classical-events", "rv-binomial-hypergeom"]
    },
    {
      id: "count-binomial", ch: 16, sec: "e3-6-3", secName: "6.3 二项式定理",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "二项式展开通项公式、二项式系数与赋值法",
      keywords: ["二项式定理", "通项公式", "二项式系数", "项的系数", "赋值法", "杨辉三角", "2^n"],
      trig: "求展开式中指定幂次的项、常数项、项的系数，或求所有项系数之和。",
      key: "1. <b>通项公式（求第 \\(r+1\\) 项）</b>：\\(T_{r+1}=C_n^r a^{n-r}b^r\\)（\\(r=0,1,\\dots,n\\)）。求第4项时 \\(r=3\\)！<br>2. <b>二项式系数 vs 项的系数</b>：\\(C_n^r\\) 是纯组合数，和为 \\(2^n\\)；项的系数还包含常数底数及负号。<br>3. <b>赋值法须看幂次</b>：对普通多项式 \\(f(x)=\\sum_j c_jx^j\\)，\\(f(1)\\) 为全系数和；<b>偶次幂</b>系数和为 \\([f(1)+f(-1)]/2\\)，<b>奇次幂</b>系数和为 \\([f(1)-f(-1)]/2\\)。<b>项号奇偶须另外核对它与指数的对应</b>，不能直接套用。例如 \\((1+x^2)^3\\) 全为偶次幂，但第1、3项系数和与第2、4项系数和都为 \\(4\\)。<br>• 仅当展开式是非负整数幂的普通多项式，才可令 \\(x=0\\) 取常数项；含负幂时应从通项中令指数为 \\(0\\)。",
      warn: "第 \\(k\\) 项对应 \\(r=k-1\\)，负号要随 \\((-2)^r\\) 一起代入。赋值前还要确认该值在定义域内；例如 \\((x+x^{-1})^2=x^2+2+x^{-2}\\) 的常数项为 \\(2\\)，但 \\(x=0\\) 没有意义。",
      rel: ["count-perm-comb", "seq-math-induction"]
    },
    {
      id: "rv-cond-bayes", ch: 17, sec: "e3-7-1", secName: "7.1 条件概率与全概率公式",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "条件概率、乘法公式与全概率公式",
      keywords: ["条件概率", "乘法公式", "全概率公式", "后验", "贝叶斯选学"],
      trig: "已知某前提事件已发生求另一事件概率，或已知结果后用定义求它来自哪个原因。",
      key: "1. <b>条件概率</b>：\\(P(B\\mid A) = \\dfrac{P(AB)}{P(A)}\\)，须 \\(P(A)>0\\)。<br>2. <b>乘法公式</b>：\\(P(AB) = P(A)P(B\\mid A)\\)。<br>3. <b>全概率公式</b>：若 \\(A_1,\\dots,A_n\\) 两两互斥且并为全集，各 \\(P(A_i)>0\\)，则 \\(P(B) = \\sum P(A_i)P(B\\mid A_i)\\)。<br>4. <b>由结果求原因</b>：先要求 \\(P(B)>0\\)，用定义 \\(P(A_k\\mid B)=\\dfrac{P(A_k\\cap B)}{P(B)}\\)，分子用乘法公式，分母用全概率公式。一般贝叶斯公式是选学，不作为考试要求；具体后验题用这个定义就能算，不必先背公式。",
      warn: "严格区分积事件概率 \\(P(AB)\\) 与条件概率 \\(P(B\\mid A)\\)。一般贝叶斯公式带星号，是选学；乘法公式和全概率公式不是选学。",
      rel: ["prob-classical-events", "prob-independence", "rv-distrib-table"]
    },
    {
      id: "rv-distrib-table", ch: 17, sec: "e3-7-2", secName: "7.2 离散型随机变量及其分布列",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "离散型分布列表格检验、两点分布与概率归一性",
      keywords: ["分布列", "离散型随机变量", "两点分布", "概率归一性", "非负性"],
      trig: "求离散型随机变量的所有可能取值及对应概率，写出完整概率分布列。",
      key: "1. <b>分布列两大基本性质（自检第一防线）</b>：<br>① <b>非负性</b>：对任意 \\(i\\)，有 \\(p_i \\ge 0\\)；<br>② <b>归一性</b>：所有取值概率之和恒为 1：\\(\\sum_{i=1}^n p_i = 1\\)（做完题目第一件事把各格概率相加验算！）。<br>2. <b>两点分布（0-1 分布）</b>：\\(P(X=1)=p,\\ P(X=0)=1-p\\)，期望 \\(E(X)=p\\)，方差 \\(D(X)=p(1-p)\\)。<br>3. <b>变量变换合并法则</b>：若 \\(Y=g(X)\\)，不同 \\(X\\) 算得相同 \\(Y\\) 值的事件是互斥的，对应概率必须<b>合并相加</b>。",
      warn: "先由实际可行性确定取值，不能机械补0。不放回从 \\(N\\) 件中抽 \\(n\\) 件、其中 \\(M\\) 件次品时，范围为 \\(\\max(0,n-N+M)\\le X\\le\\min(n,M)\\)；只有 \\(n\\le N-M\\) 时0才可取。例如 \\(N=5,M=3,n=3\\) 时取值为 \\(1,2,3\\)。最后核验非负性与概率和为1。",
      rel: ["rv-cond-bayes", "rv-expect-variance", "rv-binomial-hypergeom"]
    },
    {
      id: "rv-expect-variance", ch: 17, sec: "e3-7-3", secName: "7.3 离散型随机变量的数字特征",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "离散型随机变量数学期望、方差与线性变换性质",
      keywords: ["数学期望","均值","方差","标准差","线性变换"],
      trig: "求离散型随机变量的分布列、数学期望 \\(E(X)\\)、方差 \\(D(X)\\)，或利用线性性质化简。",
      key: "1. <b>数学期望（加权平均重心）</b>：\\(E(X) = \\sum x_i p_i\\)。<br>2. <b>方差（离散程度）</b>：\\(D(X) = \\sum (x_i - E(X))^2 p_i = E(X^2) - [E(X)]^2\\)，其中 \\(E(X^2)=\\sum x_i^2p_i\\)，即先将取值平方，再按概率加权求和。<br>3. <b>线性性质</b>：\\(E(aX+b) = aE(X)+b\\)；<b>方差性质</b>：\\(D(aX+b) = a^2 D(X)\\)（常数 \\(b\\) 平移不改变波动，方差系数平方）。",
      warn: "写出分布列后第一步必先验证各概率之和 \\(\\sum p_i = 1\\)！方差计算切记乘以 \\(a^2\\)，常数 \\(b\\) 在方差中完全抵消。",
      rel: ["rv-distrib-table", "rv-binomial-hypergeom", "stat-percentile-var"]
    },
    {
      id: "rv-binomial-hypergeom", ch: 17, sec: "e3-7-4", secName: "7.4-7.5 二项分布、超几何分布与正态分布",
      kind: "concept", kindLabel: "🟢 概念与定义",
      title: "二项分布与超几何分布：试验及抽样条件核查",
      keywords: ["二项分布","超几何分布","伯努利试验","放回与不放回"],
      trig: "先核查成功次数模型的独立性、成功率与抽样方式，再决定能否套二项或超几何分布。",
      key: "1. <b>二项分布</b>：\\(X\\) 计数固定 \\(n\\) 次试验中的成功次数；各次只有成功/失败两类，<b>相互独立且成功概率恒为同一个 \\(p\\)</b>，其中 \\(n\\) 为非负整数、\\(0\\le p\\le1\\)。此时 \\(X\\sim B(n,p)\\)，\\(P(X=k)=C_n^k p^k(1-p)^{n-k}\\)，\\(E(X)=np\\)，\\(D(X)=np(1-p)\\)。当 \\(n\\ge1\\) 且 \\(0&lt;p&lt;1\\) 时，\\(k=0,1,\\ldots,n\\)。<br>特殊情况直接看试验：\\(p=0\\) 时 \\(X=0\\)，\\(p=1\\) 时 \\(X=n\\)；\\(n=0\\) 时 \\(X=0\\)，方差都为 \\(0\\)。<br>从同一总体独立等概率地有放回抽样是一个常见实现，<b>“放回”本身并不保证上述条件</b>。<br>2. <b>超几何分布</b>：总体有固定的 \\(N\\) 个个体，其中 \\(M\\) 个属目标类；<b>等概率抽取一个含 \\(n\\) 个个体的样本、且不放回</b>，\\(X\\) 是样本中目标类个数。要求 \\(N\\ge1\\)、\\(0\\le M\\le N\\)、\\(0\\le n\\le N\\) 且均为整数。则 \\(X\\sim H(N,M,n)\\)，\\(P(X=k)=\\dfrac{C_M^k C_{N-M}^{n-k}}{C_N^n}\\)，其中 \\(\\max(0,n-N+M)\\le k\\le\\min(n,M)\\)，且 \\(k\\) 为整数：抽中的目标数 \\(k\\) 不能超过 \\(n,M\\)，抽中的非目标数 \\(n-k\\) 不能超过 \\(N-M\\)。\\(E(X)=nM/N\\)。<br>3. <b>近似有条件</b>：令 \\(p=M/N\\)，只有抽样比 \\(n/N\\) 足够小等条件满足、并符合所需精度时，才考虑用 \\(B(n,p)\\) 近似超几何分布；单说“总体很大”不够。",
      warn: "不能只看放回/不放回。反例①：两次独立有放回试验的成功率分别为 \\(0.2,0.8\\)，成功次数分布为 \\((0.16,0.68,0.16)\\)，不是 \\(B(2,0.5)\\) 的 \\((0.25,0.5,0.25)\\)。超几何分布要求所有同样大小的样本等可能；抽取带有偏好时，不能只因“不放回”就套公式。反例②：即使 \\(N\\) 很大，若抽全体 \\(n=N\\)，则 \\(X=M\\) 是常数，不能仅凭 \\(N\\) 大就近似成有正方差的二项分布。",
      rel: ["rv-expect-variance", "rv-normal-distribution", "prob-independence", "count-perm-comb"]
    },
    {
      id: "rv-normal-distribution", ch: 17, sec: "e3-7-5", secName: "7.5 正态分布",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "正态分布曲线对称性、参数几何意义与 3σ 原则",
      keywords: ["正态分布", "正态曲线", "3σ原则", "对称轴", "均值", "标准差"],
      trig: "利用正态分布 \\(X\\sim N(\\mu, \\sigma^2)\\) 对称性求指定区间概率或利用 3σ 检验异常值。",
      key: "<b>模型前提</b>：题设或数据分析支持采用 \\(X\\sim N(\\mu,\\sigma^2)\\)，其中 \\(\\mu\\in\\mathbf R,\\sigma>0\\)。正态是模型条件，不是样本量增加本身的结论。<br>1. <b>参数几何意义</b>：\\(\\mu\\) 决定<b>对称轴</b>位置 \\(x=\\mu\\)；\\(\\sigma\\) 决定曲线陡峭程度（\\(\\sigma\\) 越小曲线越瘦高，\\(\\sigma\\) 越大曲线越矮胖，曲线下方总面积恒为 1）。<br>2. <b>对称性求概率黄金法则</b>：\\(a\\) 关于 \\(\\mu\\) 的对称点为 \\(2\\mu-a\\)，它们到 \\(\\mu\\) 的距离相等，两侧对应区域的曲线下面积也相等。<br>• \\(P(X < \\mu) = P(X > \\mu) = 0.5\\)；<br>• \\(P(X < a) = P(X > 2\\mu - a)\\)；\\(P(a < X < \\mu) = P(\\mu < X < 2\\mu - a)\\)。<br>3. <b>\\(3\\sigma\\) 原则区间概率记忆</b>：<br>• \\(P(\\mu-\\sigma < X \\le \\mu+\\sigma) \\approx 0.6827\\)；<br>• \\(P(\\mu-2\\sigma < X \\le \\mu+2\\sigma) \\approx 0.9545\\)；<br>• \\(P(\\mu-3\\sigma < X \\le \\mu+3\\sigma) \\approx 0.9973\\)。",
      warn: "审题特别注意区分方差与标准差：若题中写 \\(X\\sim N(3, 4)\\)，则 \\(\\sigma^2 = 4\\)，标准差是 \\(\\sigma = 2\\)，绝不能误代入 4！另外正态曲线顶点纵坐标是概率密度最大值，不是概率。样本增多、组距缩小不保证原数据变成正态，对称钟形也不能单独确定高斯模型。先核模型，再使用正态特有的区间概率。",
      rel: ["rv-binomial-hypergeom", "rv-expect-variance", "stat-percentile-var"]
    },
    {
      id: "bivar-corr-r", ch: 18, sec: "e3-8-1", secName: "8.1 成对数据的统计相关性",
      kind: "formula", kindLabel: "🔵 公式与结论",
      title: "样本相关系数 r 判定线性相关方向与强弱",
      keywords: ["相关系数","散点图","相关系数r","正相关","负相关","线性相关强弱"],
      trig: "由散点图或数据计算相关系数 \\(r\\)，定性或定量分析两变量的相关性与强弱。",
      key: "1. <b>样本相关系数公式</b>：\\[r = \\dfrac{\\sum (x_i-\\bar{x})(y_i-\\bar{y})}{\\sqrt{\\sum (x_i-\\bar{x})^2}\\sqrt{\\sum (y_i-\\bar{y})^2}}\\]<br>计算时可用展开式：\\[r=\\dfrac{\\sum x_i y_i-n\\bar x\\bar y}{\\sqrt{\\sum x_i^2-n\\bar x^2}\\sqrt{\\sum y_i^2-n\\bar y^2}}.\\]<br>2. <b>数值意义</b>：分母中两个平方和都须非零，且 \\(|r|\\le 1\\)。\\(r>0\\) 为正相关，\\(r<0\\) 为负相关。<br>3. <b>怎么比强弱</b>：\\(|r|\\) 越接近 1，线性相关越强；越接近 0，线性相关越弱。比较几组数据时比 \\(|r|\\) 的大小。没有一个统一的“强相关”门槛，\\(r=0\\) 也不排除非线性关系。",
      warn: "相关关系绝不等于因果关系！若题目给出如 \\(|r|\\ge0.75\\) 的经验标准，就按该标准判断；不要把某个数值当成所有情境通用的门槛。散点图呈抛物线等非线性趋势时，不能只拿线性相关系数 \\(r\\) 说话。",
      rel: ["bivar-regression-fit", "bivar-chi-square"]
    },
    {
      id: "bivar-regression-fit", ch: 18, sec: "e3-8-2", secName: "8.2 一元线性回归模型及其应用",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "最小二乘法经验回归直线方程与定过样本中心点 (x̄, ȳ)",
      keywords: ["线性回归", "经验回归方程", "最小二乘法", "样本中心点", "残差", "预测值"],
      trig: "求经验回归直线方程 \\(\\hat{y} = \\hat{b}x + \\hat{a}\\)，求未知参数，或进行未来趋势预测。",
      key: "1. <b>经验回归方程</b>：\\(\\hat{y} = \\hat{b}x + \\hat{a}\\)。<br>2. <b>斜率与截距公式</b>：先要求 \\(n\\ge2\\) 且自变量不全相同，即 \\(\\sum(x_i-\\bar x)^2>0\\)。因变量可以为常数，不要求其方差非零。\\[\\hat{b} = \\dfrac{\\sum x_i y_i - n\\bar{x}\\bar{y}}{\\sum x_i^2 - n\\bar{x}^2},\\quad \\hat{a} = \\bar{y} - \\hat{b}\\bar{x}\\]<br>3. <b>核心性质铁律</b>：经验回归直线<b>必定经过样本中心点 \\((\\bar{x}, \\bar{y})\\)</b>！",
      warn: "题干给出回归直线求未知参数，第一反应必须将样本中心点 \\((\\bar{x}, \\bar{y})\\) 代入方程！回归计算出的 \\(\\hat{y}\\) 是统计预测估计值，不是绝对真值。",
      rel: ["bivar-corr-r", "stat-percentile-var"]
    },
    {
      id: "bivar-chi-square", ch: 18, sec: "e3-8-3", secName: "8.3 列联表与独立性检验",
      kind: "method", kindLabel: "🟡 解题方法",
      title: "2×2 列联表与 χ² 独立性检验四步法则",
      keywords: ["列联表", "独立性检验", "卡方统计量", "零假设", "临界值", "推翻独立"],
      trig: "由 2×2 列联表计算卡方统计量 \\(\\chi^2\\)，查临界值表判断两分类变量是否有关联。",
      key: "1. <b>适用条件</b>：样本中的观察相互独立，分类互斥且完备；四个行、列合计须为正。表格第一行为 \\(a,b\\)，第二行为 \\(c,d\\)。各格期望频数按“行合计×列合计÷总数”计算，如左上格为 \\((a+b)(a+c)/n\\)；本卡采用四格期望频数均不小于 \\(5\\) 的条件。实际应用还可按教师用书建议，检查四个观测频数是否均不小于 \\(5\\)。<br>2. <b>零假设 \\(H_0\\)</b>：两个分类变量相互独立。<br>3. <b>统计量</b>：\\[\\begin{gathered}R_1=a+b,\\quad R_2=c+d,\\\\C_1=a+c,\\quad C_2=b+d,\\\\\\chi^2=\\frac{n(ad-bc)^2}{R_1R_2C_1C_2},\\\\n=a+b+c+d.\\end{gathered}\\]<br>4. <b>按显著性水平判断</b>：在近似模型适用时，\\(\\alpha=0.05\\) 对应临界值 \\(3.841\\)，\\(\\alpha=0.01\\) 对应 \\(6.635\\)。统计量达到相应临界值，就按该水平拒绝 \\(H_0\\)；未达到只表示证据不足，不能证明独立。",
      warn: "\\(\\alpha\\) 描述 \\(H_0\\) 为真时检验规则的误拒风险；这里使用的是大样本近似，不能把 \\(1-\\alpha\\) 解释成这次结论正确的概率。显著关联也不能推出因果关系。小样本或期望频数过小，不能直接套本卡临界值。",
      rel: ["bivar-corr-r", "stat-sampling"]
    },
    {
      id: "calc-repeat-sign",
      ch: 15,
      sec: "e2-5-3",
      secName: "5.3 导数在研究函数中的应用",
      kind: "method",
      kindLabel: "🟡 压轴拓展",
      title: "多次求导判号（压轴拓展）",
      keywords: ["再求导", "多次求导", "辅助函数", "导函数判号"],
      trig: "导函数或差函数的符号不好直接看出，但它再求导后更简单，且有可用的基准值。",
      key: "<b>怎么想：</b>把难判号的式子暂记为一个新函数，逐层求导，再沿相反方向逐层判号。<br><b>分步做法：</b>① 先列定义域，把目标写成 \\(F(x)>0\\) 等形式；② 设 \\(G=F^{\\prime}\\)，需要时再求 \\(G^{\\prime}\\)；③ 用导数符号确定上一层函数的单调性，再与该函数的基准值（即已知的函数值，如 \\(F(0)=0\\)）比较来判号；④ 回到原目标，逐层写清区间和严格性。正式依据仍是“导数符号→单调性→函数值比较”。<br><br><b>例：2023年高考数学（新高考Ⅱ卷）第22题（1）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g2-high-2023-xgk2-22\">打开题库</a>）<br>只示范第（1）问的双侧估计，\\(0<x<1\\)。① 令 \\(U=x-\\sin x\\)，则 \\(U(0)=0\\)，\\(U^{\\prime}=1-\\cos x>0\\)，故 \\(\\sin x<x\\)。② 令 \\(V=\\sin x-x+x^2\\)，其导函数 \\(W=\\cos x-1+2x\\) 仍需判号。③ 再求导得 \\(W^{\\prime}=2-\\sin x>1\\)；由 \\(W(0)=0\\) 得 \\(W(x)>0\\)。④ 于是 \\(V\\) 递增且 \\(V(0)=0\\)，得到 \\(x-x^2<\\sin x\\)。<br><br><b>例：2026年高考数学（新高考Ⅱ卷）第19题（3）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-py492-high-2026-ii-19\">打开题库</a>）<br>由切线条件先得 \\(a=-3,b=1\\)。① 差式除以正数 \\(\\mathrm e^k\\)，记 \\(H(x)=(k+x)\\mathrm e^x+(k-x)\\mathrm e^{-x}-2k\\)，要求所有 \\(x>0\\) 时 \\(H(x)>0\\)。② 设 \\(G=H^{\\prime}\\)，有 \\(H(0)=G(0)=0\\)，且 \\(G^{\\prime}=(k+2)(\\mathrm e^x+\\mathrm e^{-x})+x(\\mathrm e^x-\\mathrm e^{-x})\\)。③ 当 \\(k\\ge-2\\)，右式在 \\(x>0\\) 为正，依次得到 \\(G>0,H>0\\)。④ 若 \\(k<-2\\)，则 \\(G^{\\prime}(0)=2(k+2)<0\\)，连续性保证零点右侧一小段内 \\(G^{\\prime}<0\\)，依次得 \\(G<0,H<0\\)，不合要求。因此最小值为 \\(-2\\)。",
      warn: "不能把“导函数递增”直接写成“原函数递增”；还要证明导函数为正。每往回一层都需要基准值或其他符号依据。内点、端点及可导条件要分清。",
      rel: ["calc-monot-extrema", "calc-endpoint-necessity"]
    },
    {
      id: "calc-endpoint-necessity",
      ch: 15,
      sec: "e2-5-3",
      secName: "5.3 导数在研究函数中的应用",
      kind: "method",
      kindLabel: "🟡 压轴拓展",
      title: "端点效应与必要性探路（压轴拓展）",
      keywords: ["端点效应", "必要性", "恒成立", "开区间", "参数范围"],
      trig: "题目要求区间内“任意 \\(x\\)”都满足，而参数的临界值可能在端点附近暴露。",
      key: "<b>怎么想：</b>先找最难满足的输入，得到参数必须满足的限制，再对所有允许输入证明它确实够用。<br><b>分步做法：</b>① 写成参数与函数比较，记录参数或分母的正负；② 查内点、端点附近和无穷远，端点不在区间内时，观察靠近端点的函数值趋势，得到参数的必要限制；③ 单独验证临界参数；④ 用单调性或不等式证明整个区间上的充分性。<br><br><b>例：2023年高考数学（新高考Ⅱ卷）第6题</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g2-high-2023-xgk2-06\">打开题库</a>）<br>① \\(f^{\\prime}(x)=a\\mathrm e^x-1/x\\)，所以递增的必要条件是 \\(a\\ge\\mathrm e^{-x}/x\\)，对所有 \\(1<x<2\\) 成立。② \\(h(x)=\\mathrm e^{-x}/x\\) 的导数为 \\(-\\mathrm e^{-x}(x+1)/x^2<0\\)，它在左端附近趋近 \\(1/\\mathrm e\\)。若 \\(a<1/\\mathrm e\\)，连续性使靠近1的一段内 \\(f^{\\prime}<0\\)，矛盾。③ 当 \\(a=1/\\mathrm e\\) 时，对每个 \\(x>1\\) 都有 \\(a>h(x)\\)，故导函数严格为正；更大的 \\(a\\) 也可行。最小值为 \\(1/\\mathrm e\\)，虽端点1不在区间内，临界参数仍可取。<br><br><b>例：2026年高考数学（新高考Ⅱ卷）第19题（2）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-py492-high-2026-ii-19\">打开题库</a>）<br>仍取 \\(f(x)=x\\mathrm e^x-3x+1\\)。① 令 \\(D(x)=f(x+m)-f(x)-m=\\mathrm e^x[(\\mathrm e^m-1)x+m\\mathrm e^m]-4m\\)。② \\(m=0\\) 时差式恒为0；\\(m<0\\) 时括号的一次项系数为负，\\(x\\) 充分大时 \\(D(x)<0\\)，均不行。③ \\(m>0\\) 时，\\(D^{\\prime}=\\mathrm e^x[(\\mathrm e^m-1)x+m\\mathrm e^m+\\mathrm e^m-1]>0\\)，且 \\(D(x)\\) 在 \\(0\\) 处连续。当 \\(x>0\\) 越来越靠近 \\(0\\) 时，\\(D(x)\\) 越来越接近 \\(D(0)=m(\\mathrm e^m-4)\\)；若此值为负，靠近 \\(0\\) 的正数处也会为负，故必须有 \\(D(0)\\ge0\\)。④ 这给出 \\(m\\ge\\ln4\\)；反过来，此时 \\(D(x)>D(0)\\ge0\\) 对所有 \\(x>0\\) 成立。故范围为 \\([\\ln4,+\\infty)\\)。",
      warn: "开区间端点不能当作可取点。必要条件不等于充分条件；端点处恰好等于零，也可能在开区间内处处严格大于零。无穷远和负参数不能漏掉。",
      rel: ["calc-monot-extrema", "calc-repeat-sign"]
    },
    {
      id: "conic-objective-extrema",
      ch: 13,
      sec: "e1-3-3",
      secName: "3.3 抛物线",
      kind: "method",
      kindLabel: "🟡 压轴拓展",
      title: "圆锥曲线目标函数求最值（压轴拓展）",
      keywords: ["目标函数", "几何最值", "圆锥曲线", "矩形周长", "轨迹"],
      trig: "点在圆锥曲线上运动，同时受距离、斜率或直角条件限制；目标是距离、周长等量的最大值、最小值或严格界。",
      key: "<b>怎么想：</b>先消掉多余动点，把几何目标变成一个带准确范围的代数式，再找等号配置。<br><b>分步做法：</b>① 用已知条件确定曲线；② 由向量、斜率或垂直条件消元，写出真实轨迹及排除点；③ 用平方配方、基本不等式或已学的单调性求界；④ 把取等值代回所有几何条件，区分可取最值和只能趋近的界。<br><br><b>例：2025年高考数学（新高考Ⅰ卷）第18题（2）（ii）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-b2-high-2025-national-i-18\">打开题库</a>）<br>① 由离心率与 \\(|AB|^2=a^2+b^2=10\\) 得椭圆 \\(x^2/9+y^2=1\\)，\\(A=(0,-1)\\)。设 \\(P=(m,n)\\)，\\(m\\ne0\\)，\\(D=m^2+(n+1)^2\\)。题设 \\(R\\) 在射线 \\(AP\\) 上且 \\(|AP|\\cdot|AR|=3\\)，故 \\(\\overrightarrow{AR}=(3/D)\\overrightarrow{AP}\\)，得到 \\(R=(3m/D,-1+3(n+1)/D)\\)。② 斜率条件给 \\((3(n+1)-D)/(3m)=3n/m\\)，即 \\(m^2+(n+4)^2=18\\)：\\(P\\) 在圆心 \\(C_0=(0,-4)\\)、半径 \\(3\\sqrt2\\) 的圆上，并保留 \\(m\\ne0\\)。③ 对椭圆上 \\(M=(u,v)\\)，有 \\(|C_0M|^2=9(1-v^2)+(v+4)^2=27-8(v-1/2)^2\\le27\\)。由三角不等式，\\(|PM|\\le3\\sqrt2+3\\sqrt3\\)。④ 取 \\(v=1/2,u=\\pm3\\sqrt3/2\\)，再取 \\(P=C_0-\\sqrt{2/3}(M-C_0)\\)，则 \\(m\\ne0\\)，各条件均满足且等号成立。这才是最大值。<br><br><b>例：2023年高考数学（新高考Ⅰ卷）第22题（2）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g3-high-2023-xingaokao1-22\">打开题库</a>）<br>① 距离定义平方后得 \\(W:y=x^2+1/4\\)。取矩形在 \\(W\\) 上的三个连续顶点，直角顶点横坐标为 \\(u\\)，另两点横坐标为 \\(v,w\\)。弦斜率为 \\(u+v\\) 与 \\(u+w\\)，乘积为 \\(-1\\)。交换两边并利用左右对称，可记为 \\(t,-1/t\\)，\\(t\\ge1\\)。② 由 \\(u+v=t,u+w=-1/t\\)，得 \\(v=t-u,w=-1/t-u\\)；两条边的横向跨度分别是 \\(|v-u|=|t-2u|\\) 与 \\(|w-u|=|2u+1/t|\\)。弦长等于横向跨度乘以 \\(\\sqrt{1+\\text{斜率}^2}\\)，所以两边长之和为 \\(L=|t-2u|\\sqrt{1+t^2}+|2u+1/t|\\sqrt{1+1/t^2}\\)。若 \\(t>1\\)，则 \\(\\sqrt{1+t^2}>\\sqrt{1+1/t^2}\\)；第一条边非零，故用较小根式替换第一项中的根式后，和式严格变小。再用 \\(|t-2u|+|2u+1/t|\\ge t+1/t\\)，得 \\(L>\\sqrt{1+1/t^2}(|t-2u|+|2u+1/t|)\\ge(t^2+1)^{3/2}/t^2\\)。③ 令 \\(s=t^2\\)，恒等式 \\(4(s+1)^3-27s^2=(s-2)^2(4s+1)\\ge0\\) 说明最后一式至少为 \\(3\\sqrt3/2\\)。④ 若 \\(t=1\\)，则 \\(L\\ge2\\sqrt2>3\\sqrt3/2\\)。故非退化矩形周长 \\(2L>3\\sqrt3\\)；不能把退化配置的界写成可取最小值。",
      warn: "斜率存在、两点相异、动点不在轴上等限制不能在消元后丢掉。求出代数下界还要核对非退化条件；变形后的轨迹可能比原轨迹大。",
      rel: ["conic-ellipse", "conic-parabola", "amgm-core"]
    },
    {
      id: "conic-area-chord-distance",
      ch: 13,
      sec: "e1-3-1",
      secName: "3.1 椭圆",
      kind: "method",
      kindLabel: "🟡 压轴拓展",
      title: "面积转弦长与点线距（压轴拓展）",
      keywords: ["面积", "弦长", "点线距", "同底", "联立韦达"],
      trig: "三角形的两顶点是直线与曲线交点，另一顶点固定；或比较共用一条底边的两个三角形面积。",
      key: "<b>怎么想：</b>先看哪部分能相消。面积比常能消去同一弦长，面积值则把底和高都写成直线参数。<br><b>分步做法：</b>① 写 \\(S=\\tfrac12|AB|\\,d(P,l)\\)；② 共底面积比先化为点到直线的距离比；③ 若需弦长，联立二次方程，用 \\(|AB|=\\sqrt{1+k^2}\\sqrt{(x_1+x_2)^2-4x_1x_2}\\)，并检查判别式为正；④ 解面积条件后验两点相异，并补查竖直线。<br><br><b>例：2023年高考数学（新高考Ⅱ卷）第5题</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g2-high-2023-xgk2-05\">打开题库</a>）<br>① 椭圆焦点为 \\(F_1=(-\\sqrt2,0),F_2=(\\sqrt2,0)\\)。两三角形共底 \\(AB\\)，所以面积比就是高的比。② 直线写成 \\(x-y+m=0\\)，得到 \\(|m-\\sqrt2|=2|m+\\sqrt2|\\)，解得 \\(m=-3\\sqrt2\\) 或 \\(-\\sqrt2/3\\)。③ 联立椭圆得 \\(4x^2+6mx+3m^2-3=0\\)，判别式 \\(48-12m^2>0\\)，即 \\(|m|<2\\)。④ 只保留 \\(m=-\\sqrt2/3\\)，两焦点到该直线的距离均非零，面积比确为2。<br><br><b>例：2024年高考数学（新高考Ⅰ卷）第16题（2）</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g4-high-2024-xgk1-16\">打开题库</a>）<br>① 已知 \\(A=(0,3),P=(3,3/2)\\)，代入得椭圆 \\(x^2/12+y^2/9=1\\)。非竖直直线写成过 \\(P=(3,3/2)\\)、方向 \\((1,k)\\)，另一交点为 \\(B=P+s(1,k)\\)。联立并除去已知根 \\(s=0\\)，得 \\(s=-6(3+2k)/(3+4k^2)\\)。② 以 \\(PB\\) 为底，\\(|PB|=|s|\\sqrt{1+k^2}\\)，\\(A\\) 到该线的距离为 \\(|3k+3/2|/\\sqrt{1+k^2}\\)，故 \\(S=\\tfrac34|s(2k+1)|\\)。③ 令 \\(S=9\\)，得到 \\(|(2k+3)(2k+1)|=2(4k^2+3)\\)。取正号得 \\(4k^2-8k+3=0\\)，即 \\(k=1/2,3/2\\)；取负号得 \\(12k^2+8k+9=0\\)，无实根。④ 两个斜率都使 \\(s\\ne0\\)；竖直线 \\(x=3\\) 的另一交点为 \\((3,-3/2)\\)，面积仅 \\(9/2\\)。故所求为 \\(x-2y=0\\) 或 \\(3x-2y-6=0\\)。",
      warn: "距离必须非负，面积式中的绝对值不能直接去掉；同底才可消弦长。斜率参数漏掉竖直线，或把切线当成有两个交点的弦，都会漏解或增解。",
      rel: ["conic-ellipse", "geom-line-dist-intersect", "geom-circle-pos-rel"]
    },
    {
      id: "solid-containment-limit",
      ch: 8,
      sec: "b2-8-3",
      secName: "8.3 简单几何体的表面积与体积",
      kind: "method",
      kindLabel: "🟡 压轴拓展",
      title: "几何体容纳极限判断（压轴拓展）",
      keywords: ["容纳", "装入", "容器", "球心距离", "投影宽度"],
      trig: "问物体能否整体放进容器，或多个球能同时放入时的最大半径。",
      key: "<b>怎么想：</b>先找任意摆法都绕不过的长度上界，再给一个确实放得下的摆法。<br><b>分步做法：</b>① 明确接触边界是否允许、壁厚是否忽略；② 球体先将容器边界向内缩一个半径，得到球心的可行区域；③ 用球心距或各坐标方向的投影宽度列必要条件；④ 构造摆放并检验全部方向和球间不重叠，才能认定上界可取。<br><br><b>例：2023年高考数学（新高考Ⅰ卷）第12题</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-g3-high-2023-xingaokao1-12\">打开题库</a>）<br>容器为单位正方体，边界接触允许。① 直径0.99的球置于中心，各方向宽度0.99，能放。② 棱长1.4的正四面体可用正方体四个交错顶点构造，再等比缩为边长 \\(1.4/\\sqrt2<1\\) 的小正方体，能放。③ 高1.8的圆柱含长1.8的轴线段，但单位正方体任意两点距至多 \\(\\sqrt3<1.8\\)，不能放。④ 对底面直径1.2、高0.01的圆柱，将轴线沿体对角线并居中。每个坐标方向的总宽度都是 \\(1.2\\sqrt{2/3}+0.01/\\sqrt3<1\\)，其中轴线与各坐标轴夹角 \\(\\theta\\) 满足 \\(\\cos\\theta=1/\\sqrt3\\)；\\(0.01/\\sqrt3\\) 是轴线的投影长，\\(1.2\\sqrt{2/3}=1.2\\sin\\theta\\) 是底面圆在该方向的投影宽度。所以整体在盒内，能放。逐项结论为 A、B、D。<br><br><b>例：2025年高考数学（新高考Ⅱ卷）第14题</b>（<a href=\"" + ROOT + "exam-bank/index.html?q=bank-b2-high-2025-national-ii-14\">打开题库</a>）<br>① 设球半径为 \\(r\\)，圆柱半径4、高9，先有 \\(0<r\\le4\\)。每个球心的水平位置在半径 \\(4-r\\) 的圆盘内，高度在 \\([r,9-r]\\)。② 两球心水平距离至多 \\(8-2r\\)，竖直距离至多 \\(9-2r\\)，故不重叠要求 \\(4r^2\\le(8-2r)^2+(9-2r)^2\\)，化为 \\(4(r-5/2)(r-29/2)\\ge0\\)。结合 \\(r\\le4\\)，得 \\(r\\le5/2\\)。③ 取 \\(r=5/2\\)，两球心取 \\((3/2,0,5/2)\\) 和 \\((-3/2,0,13/2)\\)，距离为5。两球相切，并各自贴侧壁及一个底面，确实放得下。因此最大半径为 \\(5/2\\) 厘米。",
      warn: "体积够大只是必要条件之一，不能保证放得下；轴向长度也不能替代倾斜物体的整体宽度。两个球可以相切，但球心距不能小于两半径之和。",
      rel: ["geo-surface-volume", "geo-polyhedron-rot"]
    }
  ];

  /* ==================== 源卡追溯与教学层级 ====================
     sourceCards：高中教学约束与方法指引库（内部教研资料）的源卡编号；源卡总表在 tools/source-cards.json。
     evidenceLevel：卡片主体内容的依据层级（见 EVIDENCE_LEVELS）。
     optional：整张卡是带星号的选学内容，不作考试要求；目录、SEC_META、课页标题都要标「（选学）」。
     requiredPrereqs：讲这张卡前学生必须已学的卡，只能指向同节或更早的节，非选学卡不能依赖选学卡。
     electiveParts：卡里夹带的选学/拓展片段；卡面和课页在关键词附近都要写明。
     notes：[层级, 说明]，把课标、教师用书和整理建议分开标。
     mapNote：一张卡对应多张源卡时，写明合并原因。
     这里只放编号和我们自己写的边界说明，不放教材、课标或教师用书原文。 */
  var EVIDENCE_LEVELS = {
    standard: "课标要求",
    textbook: "教材要求",
    teacher: "教师用书建议",
    elective: "选学/拓展",
    synthesis: "整理建议"
  };

  var TRACE = {
    "calc-repeat-sign": {"sourceCards": ["E2-05-C", "E2-05-D"], "evidenceLevel": "synthesis", "requiredPrereqs": ["calc-monot-extrema"], "mapNote": "压轴拓展：以单调性和函数值比较逐层判号，沿用导数单元的正式方法。", "notes": [["synthesis", "本卡为压轴拓展，系培玉整理的方法示范；真题按题号链接到已审核题库，讲解独立编写，不增加必背公式。"]]},
    "calc-endpoint-necessity": {"sourceCards": ["E2-05-C", "E2-05-D"], "evidenceLevel": "synthesis", "requiredPrereqs": ["calc-monot-extrema"], "mapNote": "压轴拓展：把恒成立的必要条件与全区间充分性分开，再查参数边界。", "notes": [["synthesis", "本卡为压轴拓展，系培玉整理的方法示范；真题按题号链接到已审核题库，讲解独立编写，不增加必背公式。"]]},
    "conic-objective-extrema": {"sourceCards": ["E1-03-A", "E1-03-C"], "evidenceLevel": "synthesis", "requiredPrereqs": ["conic-ellipse", "conic-parabola", "amgm-core"], "mapNote": "压轴拓展：椭圆和抛物线的动点目标各配一例，代数界还须检验几何可行性。", "notes": [["synthesis", "本卡为压轴拓展，系培玉整理的方法示范；真题按题号链接到已审核题库，讲解独立编写，不增加必背公式。"]]},
    "conic-area-chord-distance": {"sourceCards": ["E1-03-A", "E1-02-B", "E1-03-D"], "evidenceLevel": "synthesis", "requiredPrereqs": ["conic-ellipse", "geom-line-dist-intersect"], "mapNote": "压轴拓展：将椭圆弦与直线距离合成面积条件，不把纯长度公式当成面积。", "notes": [["synthesis", "本卡为压轴拓展，系培玉整理的方法示范；真题按题号链接到已审核题库，讲解独立编写，不增加必背公式。"]]},
    "solid-containment-limit": {"sourceCards": ["M2-08-A", "M2-08-B"], "evidenceLevel": "synthesis", "requiredPrereqs": ["geo-polyhedron-rot", "geo-surface-volume"], "mapNote": "压轴拓展：从立体形状和长度约束研究容纳，体积比较不能替代摆放验证。", "notes": [["synthesis", "本卡为压轴拓展，系培玉整理的方法示范；真题按题号链接到已审核题库，讲解独立编写，不增加必背公式。"]]},
    "set-def-distinct": { sourceCards: ["M1-01-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "set-empty-trap": { sourceCards: ["M1-01-A"], evidenceLevel: "textbook", requiredPrereqs: ["set-def-distinct"],
      notes: [["synthesis", "“含参子集先查空集”是整理的检查顺序，依据是空集是任何集合的子集。"]] },
    "set-ops-demorgan": { sourceCards: ["M1-01-A"], evidenceLevel: "textbook", requiredPrereqs: ["set-def-distinct"] },
    "logic-subset": { sourceCards: ["M1-01-B"], evidenceLevel: "textbook", requiredPrereqs: ["set-empty-trap"],
      notes: [["synthesis", "用集合包含判断条件关系是辅助方法，先统一变量和论域；箭头方向要能用命题解释，不只背口诀。"]] },
    "logic-negation": { sourceCards: ["M1-01-C"], evidenceLevel: "textbook", requiredPrereqs: [],
      notes: [["synthesis", "本节只处理含一个量词的命题。恒成立转最值要等学完 3.2 函数的最值再用。"]] },
    "ineq-props-diff": { sourceCards: ["M1-02-A"], evidenceLevel: "textbook", requiredPrereqs: [],
      notes: [["synthesis", "待定系数整体代换是整理的方法，用来避免范围被放大。"]] },
    "amgm-const-one": { sourceCards: ["M1-02-B"], evidenceLevel: "synthesis", requiredPrereqs: ["amgm-core"],
      notes: [["teacher", "基本不等式以简单最值为主，不刻意加大变形难度；乘“1”法是常见题型的整理。"]] },
    "amgm-core": { sourceCards: ["M1-02-B"], evidenceLevel: "textbook", requiredPrereqs: ["ineq-props-diff"],
      notes: [["synthesis", "教材主体是两正数的 √ab ≤ (a+b)/2 和任意实数的 a²+b² ≥ 2ab；两端的调和平均、平方平均是整理拓展。"]] },
    "amgm-hook": { sourceCards: ["M1-02-B", "M1-03-B"], evidenceLevel: "synthesis", requiredPrereqs: ["amgm-core"],
      mapNote: "等号取不到的处理来自基本不等式卡，x+k/x 的单调性要到函数单调性一节才能用定义证明，所以挂两张源卡。",
      notes: [["synthesis", "在 2.2 只用来提醒等号点不在范围内时不能断言最小值；单调性的严格证明放到 3.2。"]] },
    "amgm-shift": { sourceCards: ["M1-02-B"], evidenceLevel: "synthesis", requiredPrereqs: ["amgm-core"] },
    "quad-always-true": { sourceCards: ["M1-02-C", "M1-03-B"], evidenceLevel: "synthesis", requiredPrereqs: ["quad-param"],
      mapNote: "在 R 上恒成立只用二次函数图象；在区间上恒成立要用函数最值，所以挂两张源卡。",
      notes: [["synthesis", "区间上恒成立用到的最值方法在 3.2 学；2.3 先只做在 R 上恒成立。"]] },
    "quad-param": { sourceCards: ["M1-02-C"], evidenceLevel: "textbook", requiredPrereqs: ["ineq-props-diff"] },
    "fn-dom-same": { sourceCards: ["M1-03-A"], evidenceLevel: "textbook", requiredPrereqs: ["set-def-distinct"],
      notes: [["standard", "定义域题避免偏题怪题和繁琐技巧；抽象复合定义域只做简单情形。"]] },
    "fn-abstract-ineq": { sourceCards: ["M1-03-B", "M1-03-C"], evidenceLevel: "synthesis", requiredPrereqs: ["fn-mono-def", "fn-parity-core"],
      mapNote: "这类题同时用单调性和奇偶性，两张源卡缺一不可。",
      notes: [["standard", "函数性质题避免繁琐技巧训练；构造辅助函数只在能用已学性质说明时使用。"]] },
    "fn-mono-def": { sourceCards: ["M1-03-B"], evidenceLevel: "textbook", requiredPrereqs: ["fn-dom-same"] },
    "fn-odd-plus-c": { sourceCards: ["M1-03-C"], evidenceLevel: "synthesis", requiredPrereqs: ["fn-parity-core"] },
    "fn-parity-core": { sourceCards: ["M1-03-C"], evidenceLevel: "textbook", requiredPrereqs: ["fn-dom-same"],
      notes: [["synthesis", "含指数、对数的奇函数例子要学完第 4 章再用，是常见例子，不是必背清单。"]] },
    "fn-power-five": { sourceCards: ["M1-03-D"], evidenceLevel: "textbook", requiredPrereqs: ["fn-mono-def", "fn-parity-core"],
      notes: [["teacher", "只研究 α=1,2,3,1/2,-1 这五个幂函数，不拓展到一般幂函数的分类。"]] },
    "fn-model-app": { sourceCards: ["M1-03-D", "M1-02-C"], evidenceLevel: "textbook", requiredPrereqs: ["fn-mono-def", "quad-param"],
      mapNote: "函数应用属于 3.4；常见模型是二次函数，求最值要用二次函数与方程的联系。" },
    "exp-root-power": { sourceCards: ["M1-04-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "exp-fn-prop": { sourceCards: ["M1-04-B"], evidenceLevel: "textbook", requiredPrereqs: ["exp-root-power", "fn-mono-def"],
      notes: [["synthesis", "“同增异减”是整理的结论，用的时候要能按单调性定义说清楚。"]] },
    "log-change-base": { sourceCards: ["M1-04-C"], evidenceLevel: "textbook", requiredPrereqs: ["exp-root-power"],
      notes: [["synthesis", "log_{a^m} b^n = (n/m) log_a b 等推论由换底公式推出，现场能推即可。"]] },
    "explog-compare": { sourceCards: ["M1-04-B", "M1-04-C"], evidenceLevel: "synthesis", requiredPrereqs: ["exp-fn-prop", "log-change-base", "fn-power-five"],
      mapNote: "比大小同时用指对函数单调性和对数运算，合成一张方法卡。",
      notes: [["teacher", "只要求知道同底指数、对数函数互为反函数，不要求一般反函数的定义和求法。"]] },
    "zero-theorem": { sourceCards: ["M1-04-D", "M1-04-B"], evidenceLevel: "textbook", requiredPrereqs: ["fn-mono-def"],
      mapNote: "4.5 同时讲零点和函数增长差异，卡里的增长比较对应指对函数那张源卡。",
      notes: [["standard", "二分法要会画流程框图（判断、取中点、更新区间、判停）。"], ["teacher", "增长快慢借助图象和数表认识，不作严格证明。"]] },
    "trig-rad-sector": { sourceCards: ["M1-05-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "trig-know1get2": { sourceCards: ["M1-05-B"], evidenceLevel: "textbook", requiredPrereqs: ["trig-rad-sector"],
      notes: [["teacher", "已知 tanα 等于字母参数 m 再求其余值这类参数化题不作要求；具体数值可以做。"], ["synthesis", "齐次式弦化切是整理的方法。"]] },
    "trig-unit-induce": { sourceCards: ["M1-05-B"], evidenceLevel: "textbook", requiredPrereqs: ["trig-know1get2"],
      notes: [["synthesis", "“奇变偶不变”是整理的记法；教材用单位圆对称推导，先懂推导再用口诀。"]] },
    "trig-graph-prop": { sourceCards: ["M1-05-C"], evidenceLevel: "textbook", requiredPrereqs: ["trig-unit-induce", "fn-parity-core"] },
    "trig-aux-angle": { sourceCards: ["M1-05-D"], evidenceLevel: "textbook", requiredPrereqs: ["trig-know1get2"],
      notes: [["teacher", "积化和差、和差化积、半角公式会推导即可，不要求记忆。"], ["synthesis", "辅助角公式由两角和的正弦公式推出。"]] },
    "trig-shift-scale": { sourceCards: ["M1-05-E"], evidenceLevel: "textbook", requiredPrereqs: ["trig-graph-prop"] },
    "trig-periodic-model": { sourceCards: ["M1-05-E"], evidenceLevel: "textbook", requiredPrereqs: ["trig-shift-scale"] },
    "vec-concept-equiv": { sourceCards: ["M2-06-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "vec-add-sub-tri": { sourceCards: ["M2-06-A"], evidenceLevel: "textbook", requiredPrereqs: ["vec-concept-equiv"] },
    "vec-dot-product": { sourceCards: ["M2-06-B"], evidenceLevel: "textbook", requiredPrereqs: ["vec-add-sub-tri", "trig-know1get2"] },
    "vec-base-theorem": { sourceCards: ["M2-06-C"], evidenceLevel: "textbook", requiredPrereqs: ["vec-add-sub-tri"],
      notes: [["standard", "非正交分解只要求一般了解，不做系统的斜基底分解计算。"], ["synthesis", "三点共线的 x+y=1 由基本定理推出，是整理结论。"]] },
    "vec-coord-ops": { sourceCards: ["M2-06-C"], evidenceLevel: "textbook", requiredPrereqs: ["vec-base-theorem", "vec-dot-product"] },
    "vec-sine-cosine-law": { sourceCards: ["M2-06-D"], evidenceLevel: "textbook", requiredPrereqs: ["vec-dot-product", "trig-unit-induce"] },
    "complex-def-pure": { sourceCards: ["M2-07-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "complex-plane-mod": { sourceCards: ["M2-07-A"], evidenceLevel: "textbook", requiredPrereqs: ["complex-def-pure", "vec-coord-ops"] },
    "complex-ops-conj": { sourceCards: ["M2-07-B"], evidenceLevel: "textbook", requiredPrereqs: ["complex-def-pure"],
      notes: [["standard", "复数注重表示和几何意义，避免繁琐计算与技巧训练。"]] },
    "complex-trig-form": { sourceCards: ["M2-07-C"], evidenceLevel: "elective", optional: true,
      requiredPrereqs: ["complex-plane-mod", "complex-ops-conj", "trig-aux-angle"],
      notes: [["standard", "带星号的选学内容，不作考试要求；确认学生选学后才能当作已学。"]] },
    "geo-polyhedron-rot": { sourceCards: ["M2-08-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "geo-oblique-drawing": { sourceCards: ["M2-08-B"], evidenceLevel: "textbook", requiredPrereqs: ["geo-polyhedron-rot"],
      notes: [["synthesis", "面积比 √2/4 由斜二测规则推出，是整理结论；教材要求的是会画直观图。"]] },
    "geo-surface-volume": { sourceCards: ["M2-08-B"], evidenceLevel: "textbook", requiredPrereqs: ["geo-polyhedron-rot"],
      electiveParts: [{ part: "祖暅原理", kw: "祖暅" }],
      notes: [["teacher", "多数体积公式直接给出，会用即可；祖暅原理是拓展材料，不作基本要求。"]] },
    "geo-basic-facts-skew": { sourceCards: ["M2-08-C"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "geo-parallel-circuits": { sourceCards: ["M2-08-D"], evidenceLevel: "textbook", requiredPrereqs: ["geo-basic-facts-skew"] },
    "geo-perp-dihedral": { sourceCards: ["M2-08-E"], evidenceLevel: "textbook", requiredPrereqs: ["geo-parallel-circuits"],
      notes: [["synthesis", "这一章用综合几何推理，空间向量和法向量到选择性必修第一册才学。"]] },
    "stat-sampling": { sourceCards: ["M2-09-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "stat-percentile-var": { sourceCards: ["M2-09-B", "M2-09-C"], evidenceLevel: "textbook", requiredPrereqs: ["stat-sampling"],
      mapNote: "9.2 同时讲百分位数和方差，卡里两部分各对应一张源卡。" },
    "stat-merge-var": { sourceCards: ["M2-09-A", "M2-09-C"], evidenceLevel: "textbook", requiredPrereqs: ["stat-percentile-var"],
      mapNote: "分层样本的均值、方差计算属于抽样那张源卡，用方差做统计决策属于数字特征那张源卡。" },
    "prob-classical-events": { sourceCards: ["M2-10-A"], evidenceLevel: "textbook", requiredPrereqs: ["set-ops-demorgan"] },
    "prob-independence": { sourceCards: ["M2-10-B"], evidenceLevel: "textbook", requiredPrereqs: ["prob-classical-events"],
      notes: [["synthesis", "必修阶段用 P(AB)=P(A)P(B) 定义独立，不依赖条件概率。"]] },
    "prob-freq-sim": { sourceCards: ["M2-10-C"], evidenceLevel: "textbook", requiredPrereqs: ["prob-classical-events"] },
    "vec3-ops-coplanar": { sourceCards: ["E1-01-A"], evidenceLevel: "textbook", requiredPrereqs: ["vec-add-sub-tri", "vec-dot-product"] },
    "vec3-base-theorem": { sourceCards: ["E1-01-A"], evidenceLevel: "textbook", requiredPrereqs: ["vec3-ops-coplanar", "vec-base-theorem"],
      notes: [["synthesis", "四点共面的 x+y+z=1 由共面向量定理推出，是整理结论。"]] },
    "vec3-coord-ops": { sourceCards: ["E1-01-B"], evidenceLevel: "textbook", requiredPrereqs: ["vec3-base-theorem", "vec-coord-ops"] },
    "vec3-distance-angles": { sourceCards: ["E1-01-C", "E1-01-D"], evidenceLevel: "textbook", requiredPrereqs: ["vec3-coord-ops", "geo-perp-dihedral"],
      mapNote: "1.4 一节讲距离和夹角，卡片把两者的向量公式放在一起对照。" },
    "geom-line-slope-eq": { sourceCards: ["E1-02-A"], evidenceLevel: "textbook", requiredPrereqs: ["trig-graph-prop"] },
    "geom-line-five-forms": { sourceCards: ["E1-02-A", "E1-02-B"], evidenceLevel: "textbook", requiredPrereqs: ["geom-line-slope-eq"],
      mapNote: "直线方程的各种形式属于方程那张源卡，用一般式判平行垂直属于位置关系那张源卡。" },
    "geom-line-dist-intersect": { sourceCards: ["E1-02-B"], evidenceLevel: "textbook", requiredPrereqs: ["geom-line-five-forms"],
      notes: [["synthesis", "过交点的直线系是整理的方法，教材没有单列。"]] },
    "geom-circle-line-rel": { sourceCards: ["E1-02-C"], evidenceLevel: "textbook", requiredPrereqs: ["geom-line-dist-intersect"] },
    "geom-circle-pos-rel": { sourceCards: ["E1-02-C", "E1-02-B"], evidenceLevel: "textbook", requiredPrereqs: ["geom-circle-line-rel", "geom-line-dist-intersect"],
      mapNote: "判位置关系的几何法要用点到直线距离，所以也挂直线距离那张源卡。",
      notes: [["synthesis", "两圆方程相减得公共弦、切线长公式是整理结论。"]] },
    "conic-ellipse": { sourceCards: ["E1-03-A"], evidenceLevel: "textbook", requiredPrereqs: ["geom-circle-line-rel"] },
    "conic-hyperbola": { sourceCards: ["E1-03-B"], evidenceLevel: "textbook", requiredPrereqs: ["conic-ellipse"],
      notes: [["teacher", "双曲线是“了解”层级，不要把椭圆的深化题型照搬过来。"]] },
    "conic-parabola": { sourceCards: ["E1-03-C", "E1-03-D"], evidenceLevel: "textbook", requiredPrereqs: ["geom-line-dist-intersect"],
      mapNote: "焦点准线互相转化是坐标法里的方法选择，对应方法选择那张源卡。",
      notes: [["teacher", "抛物线是“了解”层级；控制代数运算难度，技巧繁多的定点定值题不作常规要求。"]] },
    "seq-an-sn-relation": { sourceCards: ["E2-04-A"], evidenceLevel: "textbook", requiredPrereqs: ["fn-dom-same"] },
    "seq-arith-geom": { sourceCards: ["E2-04-B", "E2-04-C"], evidenceLevel: "textbook", requiredPrereqs: ["seq-an-sn-relation"],
      mapNote: "等差、等比两张源卡放进一张卡对照，便于比较通项、求和与下标性质。" },
    "seq-sum-methods": { sourceCards: ["E2-04-B", "E2-04-C"], evidenceLevel: "synthesis", requiredPrereqs: ["seq-arith-geom"],
      mapNote: "错位相减依赖等比求和，裂项相消常见于等差数列的倒数积，两张源卡都用到。",
      notes: [["synthesis", "只做前 n 项的有限和，不涉及无穷级数。"]] },
    "seq-math-induction": { sourceCards: ["E2-04-D"], evidenceLevel: "elective", optional: true, requiredPrereqs: ["seq-arith-geom"],
      notes: [["standard", "带星号的选学内容，不作考试要求；其他卡不能把归纳法当作学生已学。"]] },
    "calc-derivative-def": { sourceCards: ["E2-05-A"], evidenceLevel: "textbook", requiredPrereqs: ["geom-line-five-forms"] },
    "calc-rules-composite": { sourceCards: ["E2-05-B"], evidenceLevel: "textbook", requiredPrereqs: ["calc-derivative-def", "exp-fn-prop", "log-change-base", "trig-graph-prop"],
      notes: [["teacher", "简单复合函数求导限于 f(ax+b)；一般链式关系教材展示过，但不作为学生运用要求。"]] },
    "calc-monot-extrema": { sourceCards: ["E2-05-C", "E2-05-D"], evidenceLevel: "textbook", requiredPrereqs: ["calc-rules-composite", "fn-mono-def"],
      mapNote: "单调性和极值最值在解题时连在一起用，合成一张卡。",
      notes: [["teacher", "多项式的单调区间、闭区间最值明确到不超过三次；不要求中值定理，洛必达、泰勒不作依据。"]] },
    "count-principles": { sourceCards: ["E3-06-A"], evidenceLevel: "textbook", requiredPrereqs: [] },
    "count-perm-comb": { sourceCards: ["E3-06-B"], evidenceLevel: "textbook", requiredPrereqs: ["count-principles"],
      electiveParts: [{ part: "组合数的对称式与递推式", kw: "递推" }],
      notes: [["teacher", "组合数两个性质在探究栏目里，属选学，会用定义现场推出即可。"], ["synthesis", "捆绑法、插空法是整理的组织方式。"]] },
    "count-binomial": { sourceCards: ["E3-06-C"], evidenceLevel: "textbook", requiredPrereqs: ["count-perm-comb"],
      notes: [["teacher", "二项式定理用计数原理说明；数学归纳法证明不要求学生掌握。"]] },
    "rv-cond-bayes": { sourceCards: ["E3-07-A"], evidenceLevel: "textbook", requiredPrereqs: ["prob-classical-events", "prob-independence"],
      electiveParts: [{ part: "一般贝叶斯公式", kw: "贝叶斯" }],
      notes: [["standard", "一般贝叶斯公式带星号，选学不考；乘法公式、全概率公式不是选学。"]] },
    "rv-distrib-table": { sourceCards: ["E3-07-B", "E3-07-C"], evidenceLevel: "textbook", requiredPrereqs: ["prob-classical-events"],
      mapNote: "两点分布的均值方差属于数字特征那张源卡，放在分布列卡里作为最简单的例子。" },
    "rv-expect-variance": { sourceCards: ["E3-07-C"], evidenceLevel: "textbook", requiredPrereqs: ["rv-distrib-table", "stat-percentile-var"] },
    "rv-binomial-hypergeom": { sourceCards: ["E3-07-D"], evidenceLevel: "textbook", requiredPrereqs: ["rv-expect-variance", "count-perm-comb", "prob-independence"],
      notes: [["teacher", "掌握二项分布及其数字特征；超几何分布了解均值即可，方差计算不作要求。"]] },
    "rv-normal-distribution": { sourceCards: ["E3-07-E"], evidenceLevel: "textbook", requiredPrereqs: ["rv-expect-variance", "stat-percentile-var"],
      notes: [["synthesis", "其他区间概率靠对称性、给定数据或计算工具，不用积分。"]] },
    "bivar-corr-r": { sourceCards: ["E3-08-A"], evidenceLevel: "textbook", requiredPrereqs: ["stat-percentile-var"] },
    "bivar-regression-fit": { sourceCards: ["E3-08-B"], evidenceLevel: "textbook", requiredPrereqs: ["bivar-corr-r"] },
    "bivar-chi-square": { sourceCards: ["E3-08-C"], evidenceLevel: "textbook", requiredPrereqs: ["prob-independence", "stat-sampling"],
      notes: [["synthesis", "α 描述零假设为真时检验规则的误拒风险，近似模型下不能理解为本次结论正确的概率。"], ["teacher", "教师用书中观测频数不小于 5 是应用建议；本卡采用期望频数条件说明大样本近似，不是独立性的定义。"]] }
  };

  CARDS.forEach(function (c) {
    var t = TRACE[c.id] || {};
    c.sourceCards = t.sourceCards || [];
    c.evidenceLevel = t.evidenceLevel || "";
    c.optional = !!t.optional;
    c.requiredPrereqs = t.requiredPrereqs || [];
    c.electiveParts = t.electiveParts || [];
    c.notes = t.notes || [];
    if (t.mapNote) c.mapNote = t.mapNote;
  });


  function traceHtml(c) {
    function text(value) {
      return String(value).replace(/[&<>"']/g, function (ch) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
      });
    }
    var scope = c.optional ? " · 选学，不作考试要求" :
      (c.electiveParts.length ? " · 含选学/拓展片段" : "");
    var notes = c.notes.map(function (n) {
      return "<li>" + text(EVIDENCE_LEVELS[n[0]]) + "：" + text(n[1]) + "</li>";
    }).join("");
    var parts = c.electiveParts.length ? "<p>选学/拓展片段：" +
      c.electiveParts.map(function (p) { return text(p.part); }).join("、") + "。</p>" : "";
    return '<details class="small wk-trace" data-source-cards="' + c.sourceCards.join(" ") +
      '" style="margin:8px 0;color:var(--muted)"><summary>学习范围：' +
      text(EVIDENCE_LEVELS[c.evidenceLevel]) + scope + "</summary>" + parts +
      (notes ? "<ul>" + notes + "</ul>" : "") +
      "<p>源卡编号：" + c.sourceCards.join("、") + "。依据层级说明本卡主体内容，不把整理方法或拓展变成必学要求。</p></details>";
  }

  /* Graphs are stage-owned data. Keep exported objects stable while loading. */
  var STRANDS = {}, SEC_META = {};
  var wikiBody = document.body;
  var WIKI_STAGE = wikiBody && (wikiBody.dataset.stage || wikiBody.dataset.wikiStage) || "high";
  function installGraph(raw) {
    if (!raw || !raw.sections || !raw.strands) throw new Error("Invalid Wiki graph data");
    Object.keys(raw.strands).forEach(function (id) { STRANDS[id] = raw.strands[id]; });
    Object.keys(raw.sections).forEach(function (sid) {
      var source = raw.sections[sid];
      if (source.release === "draft") return;
      SEC_META[sid] = Object.assign({}, source, { id: sid, prereqs: (source.prereqs || []).slice(), unlocks: [] });
    });
    Object.keys(SEC_META).forEach(function (sid) {
      var meta = SEC_META[sid];
      if (WIKI_STAGE === "high") {
        var cards = CARDS.filter(function (c) { return c.sec === sid; });
        meta.optional = cards.length > 0 && cards.every(function (c) { return c.optional; });
        meta.electiveParts = cards.reduce(function (parts, c) {
          return parts.concat(c.electiveParts.map(function (p) { return p.part; }));
        }, []);
      }
      meta.prereqs = meta.prereqs.filter(function (pid) { return !!SEC_META[pid]; });
      ["prev", "next"].forEach(function (key) { if (!SEC_META[meta[key]]) meta[key] = null; });
      meta.prereqs.forEach(function (pid) { SEC_META[pid].unlocks.push(sid); });
    });
    return { sections: SEC_META, strands: STRANDS, stage: WIKI_STAGE };
  }
  // An injected graph supports synchronous exporters; browsers use their own stage root.
  var suppliedGraph = window.PEIYU_WIKI_GRAPH_DATA;
  var graphReady;
  if (suppliedGraph) {
    installGraph(suppliedGraph);
    graphReady = Promise.resolve();
  } else if (typeof window.fetch === "function") {
    var graphUrl = wikiBody && wikiBody.dataset.wikiGraph || ROOT + "data/knowledge-graph.json";
    graphReady = window.fetch(graphUrl).then(function (response) {
      if (!response.ok) throw new Error("Wiki graph load failed: " + response.status);
      return response.json();
    }).then(installGraph);
  } else {
    graphReady = Promise.resolve();
  }
  window.PEIYU_WIKI_GRAPH_READY = graphReady;

  var BY_ID = {}, BY_SEC = {}, BY_CH = {};
  CARDS.forEach(function (c) {
    BY_ID[c.id] = c;
    (BY_SEC[c.sec] = BY_SEC[c.sec] || []).push(c);
    (BY_CH[c.ch] = BY_CH[c.ch] || []).push(c);
  });

  /* 计算本地做题学情：返回每节 { total, right, wrong, status: "mastered"|"weak"|"untouched" } */
  function computeMastery() {
    var logs = [];
    try { logs = JSON.parse(localStorage.getItem("peiyu." + ({ high: "hs", junior: "jh", primary: "ps" }[WIKI_STAGE]) + ".log") || "[]"); } catch (e) {}
    if (!Array.isArray(logs)) logs = [];
    var stats = {};
    Object.keys(SEC_META).forEach(function (sid) {
      stats[sid] = { total: 0, right: 0, wrong: 0, questionTotal: 0, questionRight: 0, questionWrong: 0, status: "untouched" };
    });
    var latest = {};
    function selfRated(ev) {
      return ev.selfCheck === true || ev.attemptKind === "self-check" || !!ev.rating ||
        /自判[对错]/.test(ev.choice || "");
    }
    function add(ev, key, isExam, timestamp) {
      if (!ev || !stats[ev.sec] || typeof ev.correct !== "boolean" || selfRated(ev)) return;
      var old = latest[key];
      if (!old || timestamp >= old.time) latest[key] = { sec: ev.sec, correct: ev.correct, exam: isExam, time: timestamp };
    }
    // Only judged answers count; page/video visits, feedback and self-ratings do not.
    logs.forEach(function (ev, index) {
      if (!ev || ["answer", "predict", "lab"].indexOf(ev.kind) < 0) return;
      var isExam = ev.kind === "answer" && ev.id !== undefined && ev.id !== null && String(ev.id) !== "";
      add(ev, JSON.stringify([ev.kind, ev.sec, String(ev.id === undefined ? index : ev.id)]), isExam, Number(ev.t) || index);
    });
    var store = window.PeiyuLearningState;
    if (store && store.stage === WIKI_STAGE) {
      var snapshot = store.load();
      // Questions retain lastAnswer even after the event log has been compacted.
      (snapshot.questions || []).forEach(function (q) {
        var ev = q.lastAnswer;
        if (!ev || ev.kind !== "answer" || ["exam", "diagnostic", "predict", "lab"].indexOf(q.questionType) < 0) return;
        var sec = ev.sectionId || q.sectionId;
        var kind = q.questionType === "exam" ? "answer" : q.questionType;
        var owner = kind === "diagnostic" ? q.pointId : sec;
        var key = JSON.stringify([kind, owner, q.questionId]);
        // A course self-check also has an unmarked compatibility-log copy.
        if (selfRated(ev)) { delete latest[key]; return; }
        add({ sec: sec, correct: ev.correct }, key, kind === "answer", ev.time || 0);
      });
    }
    Object.keys(latest).forEach(function (key) {
      var ev = latest[key], s = stats[ev.sec];
      s.total++;
      if (ev.correct) s.right++; else s.wrong++;
      if (ev.exam) {
        s.questionTotal++;
        if (ev.correct) s.questionRight++; else s.questionWrong++;
      }
    });
    Object.keys(stats).forEach(function (sid) {
      var s = stats[sid];
      if (s.total > 0) {
        s.status = (s.wrong === 0 || (s.right / s.total >= 0.8 && s.wrong <= 1)) ? "mastered" : "weak";
      }
    });
    return stats;
  }

  /* ==================== 样式与数学渲染辅助 ==================== */
  function injectStyle() {
    if (document.getElementById("peiyu-wiki-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-wiki-css";
    st.textContent = [
      ".wk-topbtn{display:inline-flex;align-items:center;min-height:36px;font-size:14px;font-weight:600;color:var(--a);text-decoration:none;padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--card);}",
      ".wk-topbtn:hover{border-color:var(--a);background:var(--ok-soft);}",
      ".wk-chain{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;color:var(--muted);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:0 0 14px;}",
      ".wk-chain a{display:inline-flex;align-items:center;min-height:28px;padding:2px 4px;color:var(--c);text-decoration:none;font-weight:600;}",
      ".wk-chain a:hover{text-decoration:underline;}",
      ".wk-box{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:12px 14px;margin:14px 0;}",
      ".wk-box-hd{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14.5px;font-weight:600;margin-bottom:8px;}",
      ".wk-pills{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}",
      ".wk-pill{display:inline-flex;align-items:center;gap:4px;min-height:34px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:999px;padding:5px 12px;font:inherit;font-size:14px;cursor:pointer;transition:all .15s;}",
      ".wk-pill:hover,.wk-pill.on{border-color:var(--a);background:var(--ok-soft);color:var(--wk-pill-active-fg,var(--a));font-weight:600;}",
      ".wk-pill.method:hover,.wk-pill.method.on{border-color:var(--c);}",
      ".wk-pill.pitfall:hover,.wk-pill.pitfall.on{border-color:var(--no);background:var(--no-soft);color:var(--no);}",
      ".wk-drawer{margin-top:10px;border-top:1px dashed var(--line);padding-top:10px;}",
      ".wk-card-inline{color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin:8px 0;font-size:15px;}",
      ".wk-card-inline h4{margin:0 0 6px;font-size:16px;display:flex;justify-content:space-between;align-items:center;gap:8px;}",
      ".wk-close{border:none;background:transparent;color:var(--muted);font-size:14px;cursor:pointer;padding:2px 6px;}",
      ".wk-close:hover{color:var(--fg);}",
      ".wk-prob-bar{margin:6px 0 4px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}",
      ".wk-chap-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 10px 8px;font-size:14px;color:var(--muted);border-top:1px dashed var(--line);margin-top:4px;}",
      ".wk-home-search{position:relative;margin:12px 0 18px;}",
      ".wk-home-search input{width:100%;font:inherit;font-size:15px;padding:10px 16px;border:1.5px solid var(--line);border-radius:999px;background:var(--card);color:var(--fg);}",
      ".wk-home-search input:focus{outline:3px solid var(--hl);border-color:var(--a);}",
      ".wk-search-drop{margin-top:8px;background:var(--card);border:1.5px solid var(--a);border-radius:var(--radius);padding:10px 12px;}",
      ".wk-sec-pills{display:inline-flex;gap:5px;align-items:center;margin-left:6px;flex-wrap:wrap;vertical-align:middle;}",
      ".wk-sec-pill{display:inline-flex;align-items:center;min-height:24px;padding:1px 8px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;border:1px solid var(--line);background:var(--bg);color:var(--muted);line-height:1.3;}",
      ".wk-sec-pill.iso{color:var(--a);border-color:var(--a);background:var(--ok-soft);}",
      ".wk-sec-pill:hover{border-color:var(--a);color:var(--a);text-decoration:none;}"
    ].join("\n");
    document.head.appendChild(st);
  }

  var MACROS = PY_MATH.macros;

  var katexLoading = false, katexCallbacks = [];
  function ensureMath(el) {
    if (!el) return;
    if (window.Peiyu && window.Peiyu.math) { window.Peiyu.math(el); return; }
    if (window.renderMathInElement) {
      PY_MATH.render(el);
      return;
    }
    katexCallbacks.push(el);
    if (katexLoading) return;
    katexLoading = true;
    var link = document.createElement("link");
    link.rel = "stylesheet"; link.href = ROOT + "assets/katex/katex.min.css";
    document.head.appendChild(link);
    var s1 = document.createElement("script");
    s1.src = ROOT + "assets/katex/katex.min.js";
    s1.onload = function () {
      var s2 = document.createElement("script");
      s2.src = ROOT + "assets/katex/auto-render.min.js";
      s2.onload = function () {
        var queue = katexCallbacks.slice();
        katexCallbacks = [];
        queue.forEach(function (node) { ensureMath(node); });
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }


  // Trusted card HTML keeps its outer formatting; TeX is encoded as a text run.
  function protectCardMathHtml(value) {
    var input = String(value == null ? "" : value), out = "", cursor = 0;
    var delimiters = [["$$", "$$"], ["\\[", "\\]"], ["\\(", "\\)"], ["$", "$"]];
    function escaped(at) { var count = 0; for (var j = at - 1; j >= 0 && input[j] === "\\"; j--) count++; return count % 2 === 1; }
    function entityText(text) {
      return text.replace(/&(amp|lt|gt|quot|apos|#39|#\d+|#x[\da-f]+);/gi, function (all, name) {
        var names = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'" }, lower = name.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(names, lower)) return names[lower];
        var code = lower[1] === "x" ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
        return code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : all;
      });
    }
    function encode(text) { return text.replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
    while (cursor < input.length) {
      var at = -1, pair = null;
      for (var d = 0; d < delimiters.length; d++) {
        var found = input.indexOf(delimiters[d][0], cursor);
        while (found >= 0 && escaped(found)) found = input.indexOf(delimiters[d][0], found + 1);
        if (found >= 0 && (at < 0 || found < at)) { at = found; pair = delimiters[d]; }
      }
      if (at < 0) { out += input.slice(cursor); break; }
      var end = input.indexOf(pair[1], at + pair[0].length);
      while (end >= 0 && escaped(end)) end = input.indexOf(pair[1], end + 1);
      if (end < 0) { out += input.slice(cursor); break; } // Remain visible: validation rejects unmatched delimiters.
      out += input.slice(cursor, at);
      var tex = input.slice(at + pair[0].length, end), previous;
      do { previous = tex; tex = tex.replace(/<(b|strong)>([\s\S]*?)<\/\1\s*>/gi, function (_, tag, body) { return "\\mathbf{" + body + "}"; }); } while (tex !== previous);
      out += pair[0] + encode(entityText(tex)) + pair[1];
      cursor = end + pair[1].length;
    }
    return out;
  }

  function renderCardHtml(c, showJumpLesson) {
    var jump = showJumpLesson
      ? '<div style="margin-top:8px;font-size:14px;display:flex;gap:12px;flex-wrap:wrap">' +
          '<a href="' + ROOT + "lessons/" + c.sec + '.html#step3" style="font-weight:600">👉 去 ' + c.secName + " 动手拖图</a>" +
          '<a href="' + ROOT + "lessons/" + c.sec + '.html#step2">📖 看完整讲解</a>' +
          '<a href="' + ROOT + "wiki.html#card-" + c.id + '">⚡ 在 Wiki 页查看</a>' +
        "</div>"
      : '<div style="margin-top:8px;font-size:14px;display:flex;gap:12px;flex-wrap:wrap">' +
          '<a href="' + ROOT + "wiki.html#card-" + c.id + '">⚡ 在 Wiki 知识库中打开</a>' +
        "</div>";
    var relPills = (c.rel || []).map(function (rid) {
      var target = BY_ID[rid];
      return target
        ? '<button type="button" class="wk-pill" data-wk-card="' + rid + '" style="font-size:14px;padding:2px 8px;margin:2px 4px 2px 0">🔗 ' + target.title + '</button>'
        : "";
    }).join("");
    var relBox = relPills ? '<div style="margin:8px 0 4px;font-size:14px;color:var(--muted)"><b>🕸️ 关联知识网络：</b>' + relPills + '</div>' : '';

    return (
      '<div class="wk-card-inline" data-card-box="' + c.id + '">' +
        "<h4><span>" + c.kindLabel + " · " + c.title + '</span><button type="button" class="wk-close" data-wk-close="1">收起 ✕</button></h4>' +
        traceHtml(c) +
        '<p class="small" style="margin:4px 0 8px"><b>🎯 什么时候用：</b>' + protectCardMathHtml(c.trig) + "</p>" +
        '<div class="key" style="margin:6px 0">' + protectCardMathHtml(c.key) + "</div>" +
        '<div class="warn" style="margin:6px 0"><b>⚠️ 易错红线：</b>' + protectCardMathHtml(c.warn) + "</div>" +
        relBox +
        jump +
      "</div>"
    );
  }

  /* ==================== 触点 0：顶栏常驻 Wiki 与 3D 实验台/讲义入口 ==================== */
  function setupTopBar() {
    var top = document.querySelector("header.top");
    if (!top || top.querySelector(".wk-topbtn")) return;
    var rec = top.querySelector("a.rec");
    if (!/anatomy\.html/.test(location.pathname)) {
      var aIso = document.createElement("a");
      aIso.className = "wk-topbtn";
      aIso.href = ROOT + "anatomy.html";
      aIso.textContent = "🔬 3D实验台与讲义";
      if (rec) top.insertBefore(aIso, rec);
      else top.appendChild(aIso);
    }
    if (!/wiki\.html/.test(location.pathname)) {
      var a = document.createElement("a");
      a.className = "wk-topbtn";
      a.href = ROOT + "wiki.html";
      a.textContent = "⚡ 知识与方法 Wiki";
      if (rec) top.insertBefore(a, rec);
      else top.appendChild(a);
    }
  }

  /* ==================== 触点 1：主页 (index.html) 秒搜框 + 3D实验台/A4讲义胶囊 + 章末方法胶囊 ==================== */
  function setupHomePage() {
    var lead = document.querySelector("p.lead");
    var firstBook = document.querySelector("h2.book");
    if (!lead || !firstBook) return;

    // 1. 顶部全局秒搜框 + 快捷入口
    var sBox = document.createElement("div");
    sBox.className = "wk-home-search";
    sBox.innerHTML =
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<input type="search" id="wkHomeQ" placeholder="🔍 搜概念、公式、解题套路（如：乘1法、奇函数、空集、诱导公式、比大小、平移）" aria-label="搜索课程与知识卡片" style="flex:1 1 240px">' +
        '<a class="btn" href="anatomy.html" style="border-radius:999px;white-space:nowrap">🔬 3D实验台与A4讲义 (30台/73份) →</a>' +
        '<a class="btn ghost" href="wiki.html#tab=map" style="border-radius:999px;white-space:nowrap">🗺️ 73节全景图谱 →</a>' +
        '<a class="btn ghost" href="wiki.html" style="border-radius:999px;white-space:nowrap">⚡ 方法 Wiki (' + CARDS.length + '卡) →</a>' +
      "</div>" +
      '<div id="wkHomeDrop" class="wk-search-drop" hidden></div>';
    firstBook.parentNode.insertBefore(sBox, firstBook);

    var qIn = document.getElementById("wkHomeQ");
    var drop = document.getElementById("wkHomeDrop");
    qIn.addEventListener("input", function () {
      var q = qIn.value.trim().toLowerCase();
      if (!q) { drop.hidden = true; drop.innerHTML = ""; return; }
      var hitCards = CARDS.filter(function (c) {
        return (c.title + " " + c.secName + " " + c.trig + " " + c.key + " " + (c.keywords || []).join(" ")).toLowerCase().indexOf(q) >= 0;
      });
      var hitSecs = Object.keys(SEC_META).filter(function (sid) {
        return SEC_META[sid].name.toLowerCase().indexOf(q) >= 0;
      });
      if (!hitCards.length && !hitSecs.length) {
        drop.hidden = false;
        drop.innerHTML = '<span class="small">未找到匹配项，试试搜“奇偶”“不等式”“诱导公式”“对数”。</span>';
        return;
      }
      var html = "";
      if (hitSecs.length) {
        html += '<div class="small" style="margin-bottom:6px"><b>📖 匹配教材小节：</b> ' +
          hitSecs.map(function (sid) {
            return '<a href="lessons/' + sid + '.html" style="margin-right:10px;font-weight:600">' + SEC_META[sid].name + "</a>";
          }).join("") + "</div>";
      }
      if (hitCards.length) {
        html += '<div class="small" style="margin-bottom:4px"><b>⚡ 匹配知识与解题方法卡（点胶囊直接展开）：</b></div>' +
          '<div class="wk-pills">' +
          hitCards.map(function (c) {
            return '<button type="button" class="wk-pill ' + c.kind + '" data-wk-card="' + c.id + '" data-jump="1">' + c.kindLabel.slice(0, 2) + " " + c.title + "</button>";
          }).join("") +
          "</div><div class=\"wk-drawer\"></div>";
      }
      drop.hidden = false;
      drop.innerHTML = html;
      ensureMath(drop);
    });

    // 2. 在各章 <details class="chap"> 底部自动挂上「⚡ 本章方法与红线卡」
    var chaps = [].slice.call(document.querySelectorAll("details.chap"));
    chaps.forEach(function (det, idx) {
      var chNo = idx + 1;
      var cards = BY_CH[chNo];
      if (!cards || !cards.length) return;
      var bar = document.createElement("div");
      bar.className = "wk-chap-bar";
      bar.innerHTML =
        "<span>⚡ 本章核心卡片：</span>" +
        cards.map(function (c) {
          return '<button type="button" class="wk-pill ' + c.kind + '" data-wk-card="' + c.id + '" data-jump="1">' + c.kindLabel.slice(0, 2) + " " + c.title + "</button>";
        }).join("") +
        '<div class="wk-drawer" style="width:100%;border-top:none;margin-top:2px;padding-top:0"></div>';
      det.appendChild(bar);
      ensureMath(bar);
    });

    // 3. 在 73 节目录每一行后挂载「🔬 3D实验台」与「📄 A4讲义」直达徽章
    var secItems = [].slice.call(document.querySelectorAll("ul.secs li"));
    secItems.forEach(function (li) {
      var dot = li.querySelector("[data-sec]");
      if (!dot || li.querySelector(".wk-sec-pills")) return;
      var sid = dot.getAttribute("data-sec");
      if (!sid) return;
      var wrap = document.createElement("span");
      wrap.className = "wk-sec-pills";
      var html = "";
      if (ISO_SECS[sid]) {
        html += '<a class="wk-sec-pill iso" href="lessons/' + sid + '.html#iso=1" title="直接打开本节等距 3D 数学实验台">🔬 ' + ISO_SECS[sid] + "</a>";
      }
      html += '<a class="wk-sec-pill sheet" href="out/sheets/' + sid + '-sheet.pdf" target="_blank" title="查看/打印本节同源 A4 矢量讲义 PDF">📄 A4讲义</a>';
      wrap.innerHTML = html;
      li.appendChild(wrap);
    });
  }

  /* ==================== 触点 2 & 3：课程页 (lessons/*.html) ==================== */
  // 自动匹配仅用至少三字的术语；宽泛动词/性质也不触发推荐。
  // textContent 含选项字母、KaTeX 与解析，ASCII 碎片会误拼成 Asin 等词；只放行已审查的术语/记号。
  var RECO_STOPWORDS = ["包含", "参数", "子集", "向量", "垂直", "最值", "单调", "单调性", "定义域", "值域", "顺序", "互斥", "连续", "加法", "乘法", "均值", "方差", "标准差", "对称轴", "变号", "非负性", "线性变换", "正整数", "绝对值"];
  var RECO_ASCII_KEYWORDS = ["Venn", "SSA", "x1y2-x2y1", "x+y+z=1", "f(x)+f(-x)", "f(ax+b)", "f'(x)>=0", "A_n^m", "C_n^m"];
  function isRecoKeyword(kw) {
    return kw.length >= 3 && RECO_STOPWORDS.indexOf(kw) < 0 &&
      (!/^[\x00-\x7f]+$/.test(kw) || RECO_ASCII_KEYWORDS.indexOf(kw) >= 0);
  }

  function matchCardsForProblem(secId, text, explicitAttr) {
    var matched = [];
    // 属性存在即是人工决定；空值或 none 都表示不挂卡。无效 ID 不回退自动匹配。
    if (explicitAttr !== null && explicitAttr !== undefined) {
      if (!explicitAttr.trim() || explicitAttr.trim() === "none") return [];
      explicitAttr.split(",").forEach(function (cid) {
        var c = BY_ID[cid.trim()];
        if (c && matched.indexOf(c) < 0) matched.push(c);
      });
      return matched;
    }
    // 自动推荐只在同册同章内产生；跨章必须由题目显式标注。
    var chapter = secId.split("-").slice(0, 2).join("-");
    var nonContrastText = text.replace(/[^。；！？\n]*混为一谈[^。；！？\n]*/g, "");
    CARDS.forEach(function (c) {
      if (c.sec.split("-").slice(0, 2).join("-") !== chapter) return;
      var hay = c.sec === secId ? text : nonContrastText;
      var hit = (c.keywords || []).some(function (kw) { return isRecoKeyword(kw) && hay.indexOf(kw) >= 0; });
      if (hit && matched.indexOf(c) < 0) matched.push(c);
    });
    // 2. 本节卡片优先排前面
    matched.sort(function (a, b) {
      return (a.sec === secId ? 0 : 1) - (b.sec === secId ? 0 : 1);
    });
    return matched.slice(0, 2);
  }


  function decorateQuestionCards(secId, cardsList) {
    cardsList.forEach(function (qCard) {
      if (qCard.getAttribute("data-wk-bound")) return;
      qCard.setAttribute("data-wk-bound", "1");
      var text = qCard.textContent || "";
      var explicitCards = qCard.getAttribute("data-cards");
      var cards = matchCardsForProblem(secId, text, explicitCards);
      if (!cards.length) return;
      if (explicitCards === null || explicitCards === undefined) {
        qCard.setAttribute("data-cards", cards.map(function (c) { return c.id; }).join(","));
      }
      var bar = document.createElement("div");
      bar.className = "wk-prob-bar";
      bar.innerHTML =
        '<span class="small">💡 关联方法/红线卡：</span>' +
        cards.map(function (c) {
          return '<button type="button" class="wk-pill ' + c.kind + '" data-wk-card="' + c.id + '">' + c.kindLabel.slice(0, 2) + " " + c.title + "</button>";
        }).join("") +
        '<div class="wk-drawer" style="width:100%;border-top:none;margin-top:2px;padding-top:0" hidden></div>';
      qCard.appendChild(bar);
      ensureMath(bar);
    });
  }

  function activateIsoBench() {
    var stepBtns = [].slice.call(document.querySelectorAll(".steps button"));
    if (stepBtns[2]) stepBtns[2].click();
    setTimeout(function () {
      var isoBtn = document.querySelector('button[data-iso-tab], button[data-tab="cavalieri"]');
      if (isoBtn && !isoBtn.classList.contains("active")) isoBtn.click();
      var fig = document.querySelector("svg.iso-fig") || (isoBtn && isoBtn.closest(".card"));
      if (fig && fig.scrollIntoView) fig.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }

  function ensureIsoBenchLoaded(cb) {
    if (window.IsoBench) { cb(); return; }
    var s = document.createElement("script");
    s.src = ROOT + "assets/iso-bench.js?v=vs-23a34e5658f2";
    s.onload = cb;
    document.head.appendChild(s);
  }

  var DYN_BENCHES = {
    "e1-3-3": {
      title: "准线滑轨三角尺、焦点定长拉线与光学平行反射台", btn: "等距 3D 光学台", vb: "0 0 560 350",
      sliders: [
        { label: "焦准距 \\(p\\)", min: 1.0, max: 4.0, step: 0.5, val: 2.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "纵坐标 \\(y_0\\)", min: -3.0, max: 3.0, step: 0.2, val: 2.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderParabolaBench(svg, desc, vals[0], vals[1], true, cb); }
    },
    "b2-7-2": {
      title: "复平面乘 \\(\\mathrm{i}\\) 逆时针旋转 \\(90^\\circ\\) 相位陀螺台", btn: "等距 3D 旋转陀螺台", vb: "0 0 560 350",
      sliders: [
        { label: "模长 \\(|z|\\)", min: 1.0, max: 3.5, step: 0.5, val: 2.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "初始角 \\(\\theta\\)", min: 0, max: 330, step: 15, val: 30, fmt: function (v) { return v + "°"; } },
        { label: "乘 \\(\\mathrm{i}^k\\)", min: 0, max: 4, step: 1, val: 1, fmt: function (v) { return "k=" + v; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderComplexRotorBench(svg, desc, vals[0], vals[1], vals[2], cb); }
    },
    "b1-5-4": {
      title: "匀速单位圆飞轮与简谐卷纸相位投影仪", btn: "等距 3D 相位投影仪", vb: "0 0 560 340",
      sliders: [
        { label: "飞轮转角 \\(\\theta\\)", min: 0, max: 360, step: 15, val: 60, fmt: function (v) { return v + "°"; } },
        { label: "函数 (0=sin, 1=cos)", min: 0, max: 1, step: 1, val: 0, fmt: function (v) { return v === 1 ? "cos" : "sin"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderTrigPhasorBench(svg, desc, vals[0], vals[1] === 1 ? "cos" : "sin", cb); }
    },
    "b2-8-2": {
      title: "斜二测画法 \\(45^\\circ\\) 投影框与 \\(y'=y/2\\) 半倍压缩夹具台", btn: "等距 3D 斜二测台", vb: "0 0 560 340",
      sliders: [
        { label: "原图边长 \\(a\\)", min: 2.0, max: 5.0, step: 0.5, val: 4.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "坐标夹角 \\(\\alpha\\)", min: 30, max: 135, step: 15, val: 45, fmt: function (v) { return v + "°"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderObliqueBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b2-8-4": {
      title: "异面直线平移造角与公垂线距离三维机架", btn: "等距 3D 异面直线台", vb: "0 0 560 340",
      sliders: [
        { label: "方向角 \\(\\varphi\\)", min: 15, max: 165, step: 15, val: 120, fmt: function (v) { return v + "°"; } },
        { label: "公垂距 \\(d\\)", min: 1.0, max: 4.5, step: 0.5, val: 3.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderSkewLinesBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b2-8-5": {
      title: "线面平行与面面平行“两条相交直线”双激光验证台", btn: "等距 3D 平行验证台", vb: "0 0 560 340",
      sliders: [
        { label: "面内两线夹角 \\(\\gamma\\)", min: 0, max: 90, step: 15, val: 60, fmt: function (v) { return v + "°"; } },
        { label: "扰动倾角 \\(\\tau\\)", min: -20, max: 20, step: 5, val: 15, fmt: function (v) { return v + "°"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderParallelBench(svg, desc, vals[0], vals[1], cb); }
    },
    "e1-1-3": {
      title: "空间直角坐标系右手八卦限与对称点/距离卡尺台", btn: "等距 3D 空间坐标台", vb: "0 0 560 340",
      sliders: [
        { label: "坐标 \\(x\\)", min: -3.0, max: 3.0, step: 0.5, val: 2.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "坐标 \\(y\\)", min: -3.0, max: 3.0, step: 0.5, val: 2.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "坐标 \\(z\\)", min: -2.5, max: 2.5, step: 0.5, val: 2.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderOctantBench(svg, desc, vals[0], vals[1], vals[2], cb); }
    },
    "b1-1-3": {
      title: "多层透明 Venn 布尔光栅叠合与摩根定律实验台", btn: "等距 3D Venn 光栅台", vb: "0 0 560 340",
      sliders: [
        { label: "圆心间距 \\(d\\)", min: 0, max: 60, step: 4, val: 20, fmt: function (v) { return String(v); } },
        { label: "运算档位 (0=交,1=并,2=并之补,3=交之补)", min: 0, max: 3, step: 1, val: 0, fmt: function (v) { return ["A∩B", "A∪B", "∁(A∪B)", "∁(A∩B)"][v] || "A∩B"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderVennBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b1-2-2": {
      title: "赵爽弦图平面拼图与均值比较（\\(H\\le G\\le A\\le Q\\)）", btn: "平面拼图与均值比较", vb: "0 0 560 340",
      sliders: [
        { label: "正数 \\(a\\)", min: 1.0, max: 5.0, step: 0.5, val: 4.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "正数 \\(b\\)", min: 1.0, max: 5.0, step: 0.5, val: 1.5, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderAmGmBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b1-3-2": {
      title: "奇函数 \\(180^\\circ\\) 中心旋转台与偶函数轴对称三维折叠镜台", btn: "等距 3D 奇偶检验台", vb: "0 0 560 340",
      sliders: [
        { label: "翻折/旋转角 \\(\\theta\\)", min: 0, max: 180, step: 15, val: 180, fmt: function (v) { return v + "°"; } },
        { label: "模式 (0=偶函数翻折, 1=奇函数旋转)", min: 0, max: 1, step: 1, val: 0, fmt: function (v) { return v === 1 ? "奇函数" : "偶函数"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderParityBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b1-4-4": {
      title: "指数与对数坐标互换镜像台", btn: "指数与对数镜像台", vb: "0 0 560 340",
      sliders: [
        { label: "底数 \\(a\\)", min: 1.4, max: 3.0, step: 0.2, val: 2.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "采样点 \\(x_0\\)", min: -1.0, max: 1.6, step: 0.2, val: 1.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderExpLogBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b1-5-6": {
      title: "“先平移后伸缩”vs“先伸缩后平移”双轨变速齿轮对比台", btn: "等距 3D 双轨相位台", vb: "0 0 560 340",
      sliders: [
        { label: "角频率 \\(\\omega\\)", min: 1.0, max: 3.0, step: 0.5, val: 2.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "初相 \\(\\varphi\\)", min: -90, max: 90, step: 15, val: 60, fmt: function (v) { return v + "°"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderAsinBench(svg, desc, vals[0], vals[1], cb); }
    },
    "b2-6-4": {
      title: "余弦定理铰链臂与正弦定理外接圆 \\(2R\\) 定径卡尺台", btn: "等距 3D 解三角形台", vb: "0 0 560 340",
      sliders: [
        { label: "边长 \\(b\\)", min: 2.0, max: 4.5, step: 0.5, val: 3.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "边长 \\(c\\)", min: 2.0, max: 4.5, step: 0.5, val: 4.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "夹角 \\(A\\)", min: 30, max: 135, step: 15, val: 60, fmt: function (v) { return v + "°"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderCosineSineBench(svg, desc, vals[0], vals[1], vals[2], cb); }
    },
    "b2-9-2": {
      title: "样本百分位数与五数箱线图游标分拣台", btn: "等距 3D 箱线图分拣台", vb: "0 0 560 340",
      sliders: [
        { label: "可调样本 \\(x_9\\)", min: 2.0, max: 8.0, step: 0.5, val: 2.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "主体离散度 \\(s\\)", min: 0.6, max: 1.5, step: 0.1, val: 1.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderBoxplotBench(svg, desc, vals[0], vals[1], cb); }
    },
    "e1-2-5": {
      title: "双圆心滑轨距 \\(|O_1O_2|\\) 与 \\(R\\pm r\\) 五档啮合及公切线实验台", btn: "等距 3D 双圆滑轨台", vb: "0 0 560 340",
      sliders: [
        { label: "圆心距 \\(d\\)", min: 0.0, max: 6.5, step: 0.5, val: 3.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "大圆半径 \\(R\\)", min: 2.0, max: 3.2, step: 0.1, val: 2.5, fmt: function (v) { return v.toFixed(1); } },
        { label: "小圆半径 \\(r\\)", min: 0.8, max: 1.8, step: 0.1, val: 1.5, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderTwoCirclesBench(svg, desc, vals[0], vals[1], vals[2], cb); }
    },
    "e2-4-2": {
      title: "高斯倒序相加以高补低三维阶梯拼合台", btn: "等距 3D 倒序阶梯台", vb: "0 0 560 340",
      sliders: [
        { label: "项数 \\(n\\)", min: 3, max: 6, step: 1, val: 5, fmt: function (v) { return String(v); } },
        { label: "公差 \\(d\\)", min: 0.5, max: 2.0, step: 0.5, val: 1.0, fmt: function (v) { return v.toFixed(1); } },
        { label: "拼合度", min: 0.0, max: 1.0, step: 0.5, val: 1.0, fmt: function (v) { return Math.round(v * 100) + "%"; } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderArithmeticBench(svg, desc, vals[0], vals[1], vals[2], cb); }
    },
    "e3-6-3": {
      title: "杨辉三角三维帕斯卡分流金字塔与系数和实验台", btn: "等距 3D 帕斯卡金字塔", vb: "0 0 560 340",
      sliders: [
        { label: "阶数 \\(n\\)", min: 2, max: 6, step: 1, val: 5, fmt: function (v) { return String(v); } },
        { label: "项指标 \\(r\\)", min: 0, max: 6, step: 1, val: 2, fmt: function (v) { return String(v); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderPascalBench(svg, desc, vals[0], Math.min(vals[0], vals[1]), cb); }
    },
    "e3-8-1": {
      title: "最小二乘回归“残差弹簧平方和”物理平衡杆实验台", btn: "等距 3D 残差平衡杆", vb: "0 0 560 340",
      sliders: [
        { label: "斜率 \\(b\\)", min: 0.0, max: 1.4, step: 0.01, val: 0.73, fmt: function (v) { return v.toFixed(2); } },
        { label: "截距偏离 \\(\\Delta a\\)", min: -1.0, max: 1.0, step: 0.2, val: 0.0, fmt: function (v) { return v.toFixed(1); } }
      ],
      render: function (svg, desc, vals, cb) { window.IsoBench.renderRegressionBench(svg, desc, vals[0], vals[1], cb); }
    }
  };

  function mountDynamicIsoBench(secId) {
    var cfg = DYN_BENCHES[secId];
    if (!cfg) return;
    var step3 = document.querySelector('section.step[data-title="动手"]');
    if (!step3 || step3.querySelector("[data-iso-tab]")) return;

    ensureIsoBenchLoaded(function () {
      if (!window.IsoBench || step3.querySelector("[data-iso-tab]")) return;
      var card = document.createElement("div");
      card.className = "card";
      card.style.marginTop = "14px";
      var svgId = "iso-dyn-svg-" + secId;
      var descId = "iso-dyn-desc-" + secId;
      var ctrlHtml = cfg.sliders.map(function (s, idx) {
        var inId = "iso-dyn-in-" + secId + "-" + idx;
        var outId = "iso-dyn-out-" + secId + "-" + idx;
        return '<label for="' + inId + '" style="margin-left:' + (idx ? "8px" : "0") + '">' + s.label + '</label>' +
          '<input type="range" id="' + inId + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + s.val + '">' +
          '<output id="' + outId + '">' + s.fmt(s.val) + '</output>';
      }).join("");

      card.innerHTML =
        '<div class="ctrl" style="justify-content:space-between"><b>🔬 ' + (secId === 'b1-2-2' ? '平面数学实验：' : '等距 3D 实验台：') + cfg.title + '</b><button class="btn active" data-iso-tab="1" type="button">' + cfg.btn + '</button></div>' +
        '<svg class="fig iso-fig" id="' + svgId + '" viewBox="' + cfg.vb + '" role="img" aria-label="' + cfg.btn + '"></svg>' +
        '<div class="ctrl">' + ctrlHtml + '<button class="btn ghost" type="button" data-iso-reset>重置本实验台</button></div>' +
        '<div class="result" id="' + descId + '" aria-live="polite"></div>';
      step3.insertBefore(card, step3.firstChild);
      ensureMath(card);

      var svgEl = document.getElementById(svgId);
      var descEl = document.getElementById(descId);
      var inputs = cfg.sliders.map(function (_, idx) { return document.getElementById("iso-dyn-in-" + secId + "-" + idx); });
      var outputs = cfg.sliders.map(function (_, idx) { return document.getElementById("iso-dyn-out-" + secId + "-" + idx); });
      var update = function () {
        if (secId === "e3-6-3") {
          var maxR = Math.round(parseFloat(inputs[0].value));
          inputs[1].max = String(maxR);
          inputs[1].value = String(Math.min(maxR, Math.round(parseFloat(inputs[1].value))));
        }
        var vals = inputs.map(function (el, idx) {
          var v = parseFloat(el.value);
          var num = Number.isFinite(v) ? v : cfg.sliders[idx].val;
          outputs[idx].textContent = cfg.sliders[idx].fmt(num);
          return num;
        });
        cfg.render(svgEl, descEl, vals, function () { ensureMath(descEl); });
      };
      inputs.forEach(function (el) { el.addEventListener("input", update); });
      card.querySelector("[data-iso-reset]").addEventListener("click", function () {
        // Restore every bound before values so a previous dependent maximum cannot clamp a default.
        inputs.forEach(function (el, idx) {
          var initial = cfg.sliders[idx];
          el.min = String(initial.min); el.max = String(initial.max); el.step = String(initial.step);
        });
        inputs.forEach(function (el, idx) { el.value = String(cfg.sliders[idx].val); });
        update();
      });
      update();
    });
  }

  /* ==================== 概念课全站模板 ==================== */
  function conceptPlain(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  // KaTeX 可能已渲染：textContent 会把 MathML、TeX 注释和 HTML 三层压成一串，这里还原成 \(...\) 源码
  function conceptSource(el) {
    if (!el) return "";
    var copy = el.cloneNode(true);
    [].forEach.call(copy.querySelectorAll(".katex"), function (k) {
      var tex = k.querySelector('annotation[encoding="application/x-tex"]');
      var display = k.closest(".katex-display");
      var box = display || k;
      var source = !tex ? k.textContent : (display ? "\\[" + tex.textContent + "\\]" : "\\(" + tex.textContent + "\\)");
      box.parentNode.replaceChild(document.createTextNode(source), box);
    });
    return conceptPlain(copy.textContent);
  }

  // 取第一句，最多 max 字：公式当成一个整体，句号和截断都不落在公式中间
  function conceptSentence(source, max) {
    var tokens = source.match(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^$]*\$|[\s\S]/g) || [];
    var out = "";
    for (var i = 0; i < tokens.length; i++) {
      if (/^[。！？]$/.test(tokens[i])) break;
      if (out.length + tokens[i].length > max) return out + "…";
      out += tokens[i];
    }
    return out;
  }

  function conceptAnchor(el, id) {
    if (!el) return null;
    if (!el.id || el.id === id) el.id = id;
    return el;
  }

  function labelConceptStep() {
    var tab = document.querySelector(".steps button:nth-child(2)");
    if (tab) tab.textContent = "2 概念课";
    [].forEach.call(document.querySelectorAll(".next .btn"), function (button) {
      if (button.textContent === "下一步：讲清楚") button.textContent = "下一步：概念课";
    });
  }

  function openConceptTarget(hash) {
    var step2 = document.querySelector(".steps button:nth-child(2)");
    var target = hash ? document.querySelector(hash) : null;
    labelConceptStep();
    if (step2) step2.click();
    if (target) window.setTimeout(function () { target.scrollIntoView({ block: "start" }); }, 0);
  }

  function wireConceptMap(map) {
    if (!map || map.getAttribute("data-concept-wired")) return;
    map.setAttribute("data-concept-wired", "1");
    [].forEach.call(map.querySelectorAll("a[href^='#step2-']"), function (link) {
      link.addEventListener("click", function () {
        openConceptTarget(link.getAttribute("href"));
      });
    });
    labelConceptStep();
    if (location.hash.indexOf("#step2-") === 0) {
      window.setTimeout(function () { openConceptTarget(location.hash); }, 50);
    }
  }

  function conceptCard(parent, label, text, target) {
    var a = document.createElement("a");
    a.className = "card";
    a.href = "#" + target.id;
    a.style.textDecoration = "none";
    a.style.color = "inherit";
    var badge = document.createElement("span");
    badge.className = "badge-pill " + (label.indexOf("边界") >= 0 ? "badge-no" : (label.indexOf("直觉") >= 0 ? "badge-b" : "badge-a"));
    badge.textContent = label;
    var desc = document.createElement("span");
    desc.className = "small";
    desc.textContent = text;
    a.appendChild(badge);
    a.appendChild(desc);
    parent.appendChild(a);
  }

  function setupConceptMap(secId, meta) {
    var talk = document.querySelector('section.step[data-title="讲清楚"]');
    var firstStep = document.querySelector("section.step");
    var lead = document.querySelector("p.lead");
    if (!talk || !firstStep || !meta) return;

    var headings = [].slice.call(talk.querySelectorAll("h3"));
    var definition = conceptAnchor(headings[0] || talk, "step2-definition");
    var intuition = conceptAnchor(talk.querySelector(".micro-box") || headings[1] || definition, "step2-intuition");
    var method = conceptAnchor(headings[2] || headings[1] || definition, "step2-method");
    var boundary = conceptAnchor(headings[headings.length - 1] || definition, "step2-boundary");
    var video = talk.querySelector('.vid[data-video="concept"]');
    var existingVideoAnchor = document.getElementById("step2-video");
    if (video && !existingVideoAnchor) video.id = "step2-video";

    var notice = talk.querySelector(".concept-entry-note");
    if (!notice && !existingVideoAnchor) {
      notice = document.createElement("div");
      notice.className = "key concept-entry-note";
      notice.id = "step2-video";
      notice.style.marginTop = "0";
      notice.innerHTML = "<b>概念课｜先把本节的对象、符号和边界讲清楚</b>：看完视频，再用下面的定义卡和微图回看。";
      talk.insertBefore(notice, video || talk.firstChild);
    }

    var map = document.getElementById("concept-map");
    if (!map) {
      map = document.createElement("section");
      map.className = "concept-map card";
      map.id = "concept-map";
      map.setAttribute("aria-labelledby", "concept-map-title");
      map.style.borderLeft = "4px solid var(--a)";
      map.style.marginBottom = "18px";

      var title = document.createElement("p");
      title.style.margin = "0 0 6px";
      var badge = document.createElement("span");
      badge.className = "badge-pill badge-a";
      badge.textContent = "本节概念地图";
      var titleText = document.createElement("b");
      titleText.id = "concept-map-title";
      titleText.textContent = "先认词 → 再认关系 → 再看做法 → 自己用";
      title.appendChild(badge);
      title.appendChild(titleText);
      map.appendChild(title);

      var core = document.createElement("p");
      core.className = "small";
      core.style.margin = "0 0 8px";
      var coreLabel = document.createElement("b");
      coreLabel.textContent = "核心概念：";
      core.appendChild(coreLabel);
      var leadText = conceptSource(lead);
      var sentence = conceptSentence(leadText, 110) || meta.name;
      core.appendChild(document.createTextNode(sentence + (/[。！？]$/.test(sentence) ? "" : "。")));
      map.appendChild(core);

      var videoLink = document.createElement("a");
      videoLink.className = "btn";
      videoLink.href = "#" + (document.getElementById("step2-video") || video || definition).id;
      videoLink.style.marginBottom = "8px";
      videoLink.textContent = "▶ 概念课视频｜先看这里";
      map.appendChild(videoLink);

      var cards = document.createElement("div");
      cards.className = "concept-grid";
      cards.style.margin = "4px 0 10px";
      conceptCard(cards, "① 定义与符号", conceptSource(definition) || "本节核心定义与术语", definition);
      conceptCard(cards, "② 直觉与关系", "微图、生活模型和关键关系", intuition);
      conceptCard(cards, "③ 方法与应用", conceptSource(method) || "示范题与解题方法", method);
      conceptCard(cards, "④ 边界与反例", conceptSource(boundary) || "易错边界与反例", boundary);
      map.appendChild(cards);

      var relation = document.createElement("p");
      relation.className = "small";
      relation.style.margin = "0";
      var prereq = (meta.prereqs || []).filter(function (id) { return SEC_META[id]; }).map(function (id) {
        return SEC_META[id].name;
      });
      var unlock = (meta.unlocks || []).filter(function (id) { return SEC_META[id]; }).slice(0, 3).map(function (id) {
        return SEC_META[id].name;
      });
      relation.innerHTML = "<b>前置：</b>" + (prereq.length ? prereq.join("、") : "无") + "　<b>解锁：</b>" + (unlock.length ? unlock.join("、") : "下一节方法与应用");
      map.appendChild(relation);

      firstStep.parentNode.insertBefore(map, firstStep);
      ensureMath(map);
    }
    wireConceptMap(map);

    function relabelVideo() {
      [].forEach.call(document.querySelectorAll('.vid[data-video="concept"] .vid-btn b'), function (b) {
        var label = "🎯 概念课视频｜先把概念讲清楚";
        if (b.textContent !== label) b.textContent = label;
      });
    }
    relabelVideo();
    if (video && window.MutationObserver && !video.getAttribute("data-concept-label-wired")) {
      video.setAttribute("data-concept-label-wired", "1");
      new MutationObserver(relabelVideo).observe(video, { childList: true, subtree: true });
    }
  }

  function setupLessonPage() {
    var secId = document.body.getAttribute("data-sec") || "";
    var meta = SEC_META[secId];
    var secCards = BY_SEC[secId] || [];
    if (!meta || !secCards.length) return;
    setupConceptMap(secId, meta);
    mountDynamicIsoBench(secId);

    // 1. 标题下方注入真实「🕸️ 硬先修 → 当前节（含枢纽/洞察标识） → 学完解锁」脉络条 + 3D实验台与A4讲义直达
    var lead = document.querySelector("p.lead");
    if (lead) {
      var chain = document.createElement("div");
      chain.className = "wk-chain";
      var prereqLinks = (meta.prereqs || []).filter(function (pid) { return SEC_META[pid]; }).map(function (pid) {
        return '<a href="' + pid + '.html">' + SEC_META[pid].name + "</a>";
      });
      var prevHtml = prereqLinks.length
        ? '<span>⬅️ 硬先修：' + prereqLinks.join(" · ") + "</span><span>→</span>"
        : (secId === "b2-8-1"
          ? "<span>无跨章硬先修 · 本节路线</span><span>→</span>"
          : (meta.prev && SEC_META[meta.prev] ? '<span>前置：<a href="' + meta.prev + '.html">' + SEC_META[meta.prev].name + "</a></span><span>→</span>" : ""));

      var unlockList = (meta.unlocks && meta.unlocks.length) ? meta.unlocks.slice(0, 3) : (meta.next ? [meta.next] : []);
      var unlockLinks = unlockList.filter(function (uid) { return SEC_META[uid]; }).map(function (uid) {
        return '<a href="' + uid + '.html">' + SEC_META[uid].name + "</a>";
      });
      var moreUnlock = (meta.unlocks && meta.unlocks.length > 3) ? " 等" + meta.unlocks.length + "节" : "";
      var nextHtml = unlockLinks.length
        ? '<span>→</span><span>解锁：' + unlockLinks.join(" · ") + moreUnlock + "</span>"
        : "";

      var hubBadge = meta.hub ? ' <span class="tag" style="background:var(--hl-soft);color:var(--b);margin:0 2px">★ 枢纽节</span>' : "";
      var hasIso = Boolean(ISO_SECS[secId] || document.querySelector('button[data-iso-tab], button[data-tab="cavalieri"]'));
      var isoLinkHtml = hasIso
        ? '<a href="#iso=1" data-wk-iso-jump="1" style="color:var(--a)">🔬 ' + (ISO_SECS[secId] || "3D实验台") + "</a>"
        : "";
      chain.innerHTML =
        "<span>🕸️ 知识脉络：</span>" +
        prevHtml +
        "<b>当前：" + meta.name + "</b>" + hubBadge +
        nextHtml +
        '<span style="margin-left:auto;display:flex;gap:10px;flex-wrap:wrap">' +
          isoLinkHtml +
          '<a href="../out/sheets/' + secId + '-sheet.pdf" target="_blank">📄 本节A4讲义PDF</a>' +
          '<a href="../wiki.html#map=' + secId + '">🗺️ 图谱定位</a>' +
          '<a href="../wiki.html#ch=' + secCards[0].ch + '">⚡ 本章方法卡 →</a>' +
        "</span>";
      if (secId === "b2-8-1") {
        chain.setAttribute("data-guide-summary", "无跨章硬先修 · 本节路线");
      }
      lead.parentNode.insertBefore(chain, lead.nextSibling);
      // HCI may arrive before or after Wiki; keep the summary on the chain as well as announcing it.
      document.dispatchEvent(new Event("peiyu:wiki-chain-ready"));
      var isoJump = chain.querySelector("[data-wk-iso-jump]");
      if (isoJump) {
        isoJump.addEventListener("click", function (ev) {
          ev.preventDefault();
          activateIsoBench();
        });
      }
      ensureMath(chain);
    }
    if (location.hash === "#iso=1") {
      setTimeout(activateIsoBench, 120);
    }

    // 2. 在「讲清楚」末尾、「练一练」顶部和「高考真题」顶部挂载「🧰 本节解题方法与易错胶囊箱」
    var targetSteps = [].slice.call(document.querySelectorAll('section.step[data-title="讲清楚"], section.step[data-title="练一练"], section.step[data-title="高考真题"]'));
    targetSteps.forEach(function (stepEl) {
      var title = stepEl.getAttribute("data-title");
      var isTop = title === "高考真题" || title === "练一练";
      var box = document.createElement("div");
      box.className = "wk-box";
      box.innerHTML =
        '<div class="wk-box-hd">' +
          "<span>🧰 " + (isTop ? "做题前速查：本节解题方法与红线卡（点击原地展开，不跳页）" : "本节核心方法与易错总结卡（点击展开）") + "</span>" +
        "</div>" +
        '<div class="wk-pills">' +
          secCards.map(function (c) {
            return '<button type="button" class="wk-pill ' + c.kind + '" data-wk-card="' + c.id + '">' + c.kindLabel + "：" + c.title + "</button>";
          }).join("") +
        "</div>" +
        '<div class="wk-drawer" hidden></div>';
      if (isTop) {
        var examEntry = stepEl.querySelector(":scope > .lf-exam-bank-entry");
        var examInline = stepEl.querySelector(":scope > [data-exam-bank-inline]");
        var examEnd = examInline || examEntry;
        stepEl.insertBefore(box, examEnd ? examEnd.nextSibling : stepEl.firstChild);
      } else {
        var nextBtn = stepEl.querySelector(".next");
        if (nextBtn) stepEl.insertBefore(box, nextBtn);
        else stepEl.appendChild(box);
      }
      ensureMath(box);
    });

    // 3. 为「动手 / 练一练」里的辨析题 (.card.predict) 和「高考真题」(.card.prob) 自动挂上关联方法卡锦囊
    var predicts = [].slice.call(document.querySelectorAll('section.step[data-title="动手"] .card.predict, section.step[data-title="练一练"] .card.predict'));
    decorateQuestionCards(secId, predicts);

    var prac = document.getElementById("practice");
    if (prac) {
      decorateQuestionCards(secId, [].slice.call(prac.querySelectorAll(".card.prob")));
      if (window.MutationObserver) {
        new MutationObserver(function () {
          decorateQuestionCards(secId, [].slice.call(prac.querySelectorAll(".card.prob")));
        }).observe(prac, { childList: true, subtree: true });
      }
    }
  }

  /* ==================== 触点 4：我的记录页 (record.html) 薄弱卡与跨章先修溯源诊断 ==================== */
  function setupRecordPage() {
    var table = document.querySelector("table.rec");
    if (!table) return;
    var logs = [];
    try { logs = JSON.parse(localStorage.getItem("peiyu.hs.log") || "[]"); } catch (e) {}
    var weakSecs = {};
    logs.forEach(function (ev) {
      if ((ev.kind === "answer" || ev.kind === "predict" || ev.kind === "cue" || ev.kind === "card" || ev.kind === "lab") && ev.correct === false && ev.sec) {
        weakSecs[ev.sec] = (weakSecs[ev.sec] || 0) + 1;
      }
    });
    var weakCards = [];
    var rootPrereqs = [];
    Object.keys(weakSecs).sort(function (a, b) { return weakSecs[b] - weakSecs[a]; }).forEach(function (sid) {
      (BY_SEC[sid] || []).forEach(function (c) {
        if (weakCards.indexOf(c) < 0) weakCards.push(c);
      });
      var m = SEC_META[sid];
      if (m && m.prereqs) {
        m.prereqs.forEach(function (pid) {
          if (SEC_META[pid] && !weakSecs[pid] && rootPrereqs.indexOf(pid) < 0) {
            rootPrereqs.push(pid);
          }
        });
      }
    });
    // 如果还没有错题记录，展示高频必考的 5 张易错/方法卡供体验
    var isDemo = false;
    if (!weakCards.length) {
      isDemo = true;
      weakCards = [BY_ID["set-empty-trap"], BY_ID["amgm-const-one"], BY_ID["amgm-hook"], BY_ID["fn-parity-core"], BY_ID["trig-shift-scale"]].filter(Boolean);
    }

    var prereqNotice = (!isDemo && rootPrereqs.length)
      ? '<p class="small" style="margin:8px 0 4px"><b>🔍 跨章先修溯源：</b>你在后置章节出现错题，图谱建议同步排查前置地基：' +
        rootPrereqs.slice(0, 4).map(function (pid) {
          return '<a href="lessons/' + pid + '.html" style="margin-right:8px;font-weight:600">' + SEC_META[pid].name + "</a>";
        }).join("") +
        '<a href="wiki.html#tab=map" style="color:var(--a);font-weight:600">打开知识图谱看完整溯源链 →</a></p>'
      : '<p class="small" style="margin:8px 0 2px"><a href="wiki.html#tab=map" style="color:var(--a);font-weight:600">🗺️ 打开 73 节全景知识图谱，查看你点亮的知识网络 →</a></p>';

    var box = document.createElement("div");
    box.className = "wk-box";
    box.innerHTML =
      '<div class="wk-box-hd">' +
        "<span>🎯 " + (isDemo ? "考前高频必查方法与易错卡（做题有错题后将自动按你的错因精准点亮）" : "根据你的错题自动定位：建议重点复习以下知识与方法卡") + "</span>" +
      "</div>" +
      '<div class="wk-pills">' +
        weakCards.map(function (c) {
          var cnt = weakSecs[c.sec] ? "（本节错 " + weakSecs[c.sec] + " 次）" : "";
          return '<button type="button" class="wk-pill ' + c.kind + '" data-wk-card="' + c.id + '" data-jump="1">' + c.kindLabel.slice(0, 2) + " " + c.title + cnt + "</button>";
        }).join("") +
      "</div>" +
      prereqNotice +
      '<div class="wk-drawer" hidden></div>';
    table.parentNode.insertBefore(box, table);
    ensureMath(box);
  }

  /* ==================== 全局胶囊点击展开/收起委托 ==================== */
  document.addEventListener("click", function (ev) {
    var closeBtn = ev.target.closest("[data-wk-close]");
    if (closeBtn) {
      var inlineBox = closeBtn.closest(".wk-card-inline");
      var drawer = closeBtn.closest(".wk-drawer");
      if (inlineBox && drawer) {
        var cid = inlineBox.getAttribute("data-card-box");
        var host = drawer.parentNode;
        var pill = host ? host.querySelector('[data-wk-card="' + cid + '"]') : null;
        if (pill) pill.classList.remove("on");
        drawer.innerHTML = "";
        drawer.hidden = true;
      }
      return;
    }

    var btn = ev.target.closest("[data-wk-card]");
    if (!btn) return;
    var cardId = btn.getAttribute("data-wk-card");
    var card = BY_ID[cardId];
    if (!card) return;
    var container = btn.closest(".wk-box, .wk-prob-bar, .wk-chap-bar, .wk-search-drop");
    if (!container) return;
    var drawer = container.querySelector(".wk-drawer");
    if (!drawer) return;

    var alreadyOpen = btn.classList.contains("on");
    [].forEach.call(container.querySelectorAll("[data-wk-card]"), function (b) { b.classList.remove("on"); });
    if (alreadyOpen) {
      drawer.innerHTML = "";
      drawer.hidden = true;
      return;
    }
    btn.classList.add("on");
    drawer.hidden = false;
    drawer.innerHTML = renderCardHtml(card, btn.hasAttribute("data-jump"));
    ensureMath(drawer);
  });

  window.PEIYU_WIKI_HTML = protectCardMathHtml;
  window.PEIYU_WIKI_TRACE_HTML = traceHtml;
  window.PEIYU_WIKI_EVIDENCE_LEVELS = EVIDENCE_LEVELS;
  window.PEIYU_WIKI_CARDS = CARDS;
  window.PEIYU_SEC_META = SEC_META;
  window.PEIYU_STRANDS = STRANDS;
  window.PEIYU_COMPUTE_MASTERY = computeMastery;

  function init() {
    injectStyle();
    setupTopBar();
    if (isLesson) setupLessonPage();
    else if (/record\.html/.test(location.pathname)) setupRecordPage();
    else if (!/wiki\.html/.test(location.pathname)) setupHomePage();
  }

  function start() {
    if (suppliedGraph) { init(); return; }
    graphReady.then(init).catch(function (error) { console.error(error); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
