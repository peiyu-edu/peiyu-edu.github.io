/* 培玉 · 一试站：主题切换、作答判分、解析逐层展开、本地记录。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1";
  var THEME = "peiyu.olympic.theme";

  // ---------- 本地记录 ----------
  var unsaved = null, unsavedBase = null, lastStored = null;
  function saveNotice(message) {
    if (!document.body || typeof document.getElementById !== "function") return;
    var node = document.getElementById("record-save-message");
    if (!node && message) {
      node = document.createElement("p");
      node.id = "record-save-message";
      node.className = "hint-text";
      node.setAttribute("role", "status");
      var container = document.querySelector("main") || document.body;
      container.insertBefore(node, container.firstChild);
    }
    if (node) { node.textContent = message; node.hidden = !message; }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      lastStored = raw;
      if (unsaved !== null && raw === unsavedBase) return JSON.parse(unsaved);
      if (unsaved !== null) {
        // Another tab's saved data takes precedence over this tab's stale fallback.
        unsaved = null; unsavedBase = null;
        saveNotice("其他页面已更新或清空记录。本页未保存的作答没有覆盖它，请重新记录本次结果。");
      }
      var d = JSON.parse(raw);
      if (d && d.problems) return d;
    } catch (e) { if (unsaved !== null) return JSON.parse(unsaved); }
    return { problems: {}, log: [] };
  }
  function save(d) {
    var serialized = JSON.stringify(d);
    try {
      localStorage.setItem(STORE, serialized);
      lastStored = serialized; unsaved = null; unsavedBase = null;
      saveNotice("");
      return true;
    } catch (e) {
      if (unsaved === null) unsavedBase = lastStored;
      unsaved = serialized;
      saveNotice("当前浏览器无法保存学习记录。本次结果暂留在此页面，可以继续作答；离开或刷新后可能丢失。");
      return false;
    }
  }
  if (typeof window.addEventListener === "function") window.addEventListener("storage", function (event) {
    if (event.key !== STORE && event.key !== null) return;
    var hadUnsaved = unsaved !== null;
    unsaved = null; unsavedBase = null; lastStored = null;
    if (hadUnsaved) saveNotice("其他页面已更新或清空记录。本页未保存的作答没有覆盖它，请重新记录本次结果。");
  });
  // 每题的证据：
  //   first      首次作答结果 ok / no / unsure（填空对不上、等自评）
  //   helped     首次作答前是否看过提示、解析或答案
  //   status     最近一次的结果（作答或自评）：ok / part / no
  //   self       最近一次自评
  //   feedback   学生对这道题的反馈（题目有误、看不懂等）
  function record(id, kind, result, extra) {
    var d = load();
    var p = d.problems[id] || { attempts: 0 };
    var hadFirst = !!p.first, training;
    if (window.PeiyuGraph && typeof window.PeiyuGraph.context === "function") {
      var context = window.PeiyuGraph.context(id);
      if (!context && window.PeiyuTraining && typeof window.PeiyuTraining.context === "function") context = window.PeiyuTraining.context(id);
      // The graph owns context validation; keep immutable JSON snapshots in evidence.
      if (context && typeof context === "object" && !Array.isArray(context)) training = JSON.parse(JSON.stringify(context));
    }
    if (!training && window.PeiyuTraining && typeof window.PeiyuTraining.context === "function") {
      var goalContext = window.PeiyuTraining.context(id);
      if (goalContext && typeof goalContext === "object" && !Array.isArray(goalContext)) training = JSON.parse(JSON.stringify(goalContext));
    }
    var now = new Date().toISOString();
    var pendingAge = Date.parse(now) - Date.parse(p.reviewAttemptAt);
    if (kind === "self" && p.reviewAwaitingSelf && pendingAge >= 0 && pendingAge < 86400000) {
      // 核对提交后的解析不改变当次作答背景；旧待自评记录缺背景时保持未知。
      var submittedTraining = p.reviewAttemptTraining;
      training = submittedTraining && typeof submittedTraining === "object" && !Array.isArray(submittedTraining)
        ? JSON.parse(JSON.stringify(submittedTraining)) : undefined;
    }
    if ((kind.indexOf("view-") === 0 || kind === "reveal-link" || kind === "compare") && !p.first) p.helped = true;
    // 相关学习背景保留在首次证据中，不把它当成本次新开的提示重置复习阶梯。
    if ((kind.indexOf("view-") === 0 && kind !== "view-training-background") || kind === "reveal-link" || kind === "compare") { p.reviewHelped = true; p.reviewHelpedAt = now; }
    var goalHelped = !!(training && training.source === "goal-training" && training.foundationViewed);
    if ((kind === "attempt" || kind === "self") && goalHelped && !p.first) p.helped = true;
    if (kind === "attempt") {
      p.reviewAttemptHelped = goalHelped || (!!p.reviewHelped && (!p.reviewDueAt || Date.parse(p.reviewHelpedAt) >= Date.parse(p.reviewDueAt)));
      p.reviewAwaitingSelf = !result || result === "unsure";
      p.reviewAttemptAt = now;
      p.reviewAttemptTraining = training || null;
      p.reviewHelped = false;
      p.attempts += 1;
      if (!p.first) { p.first = result || "unsure"; p.firstAt = now; p.firstAttempt = p.attempts; p.helped = !!p.helped; }
    }
    if (kind === "self") {
      if (!p.reviewAwaitingSelf || Date.parse(now) - Date.parse(p.reviewAttemptAt) >= 86400000) {
        p.reviewAttemptHelped = goalHelped || (!!p.reviewHelped && (!p.reviewDueAt || Date.parse(p.reviewHelpedAt) >= Date.parse(p.reviewDueAt)));
      }
      p.reviewAwaitingSelf = false;
      p.self = result;
      if (p.first === "unsure" && (p.firstAttempt === p.attempts || (p.firstAttempt === undefined && p.attempts === 1))) p.first = result;
      if (!p.first) { p.first = result === "ok" ? "ok" : (result === "part" ? "part" : "no"); p.firstAt = now; p.helped = !!p.helped; }
    }
    if (kind === "self") p.reviewHelped = false;
    if (kind === "view-solution") p.solutionViewed = true;
    if (window.PeiyuLearning && (kind === "attempt" || kind === "self")) {
      p = window.PeiyuLearning.review(p, result, Date.parse(now), p.reviewAttemptHelped);
    }
    if (kind === "feedback") { p.feedback = (p.feedback || []).concat([{ tag: result, note: extra || "", at: now }]); }
    else if (result) p.status = result;
    if (kind === "attempt" || kind === "self") {
      if (training) p.latestTraining = training;
      else delete p.latestTraining;
      if (!hadFirst && p.first && training) p.firstTraining = training;
    }
    p.at = now;
    d.problems[id] = p;
    d.log.push({ id: id, kind: kind, result: result || null, note: extra || undefined, training: training, at: now });
    if (d.log.length > 5000) d.log = d.log.slice(-5000);
    var saved = save(d);
    document.dispatchEvent(new CustomEvent("peiyu-record", { detail: { id: id, kind: kind, result: result || null, saved: saved, training: training } }));
    return { saved: saved };
  }

  // ---------- 主题 ----------
  try { var t = localStorage.getItem(THEME); if (t === "dark" || t === "light") document.documentElement.dataset.theme = t; } catch (e) { /* 忽略 */ }
  function initTheme() {
    var b = document.querySelector("[data-theme-toggle]");
    if (!b) return;
    b.classList.add("theme-switch");
    b.setAttribute("role", "switch");
    b.setAttribute("aria-label", "深色模式");
    b.innerHTML = '<span class="theme-icon theme-sun" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"/></svg></span><span class="theme-icon theme-moon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z"/></svg></span>';
    function sync() {
      var dark = getComputedStyle(document.documentElement).colorScheme === "dark";
      b.setAttribute("aria-checked", String(dark));
      b.title = dark ? "当前深色，切换为浅色" : "当前浅色，切换为深色";
    }
    b.addEventListener("click", function () {
      var dark = getComputedStyle(document.documentElement).colorScheme === "dark";
      var next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME, next); } catch (e) { /* 忽略 */ }
      sync();
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("storage", function (e) {
      if (e.key !== THEME && e.key !== null) return;
      if (e.newValue === "dark" || e.newValue === "light") document.documentElement.dataset.theme = e.newValue;
      else document.documentElement.removeAttribute("data-theme");
      sync();
    });
    sync();
  }

  // ---------- 答案规范化 ----------
  function unwrap(s, cmd, fn) {
    // 把 \cmd{x}{y} 这类结构按 fn 改写；fn 收到参数数组
    var re = new RegExp("\\\\" + cmd + "\\s*");
    var guard = 0;
    while (re.test(s) && guard++ < 50) {
      var m = re.exec(s);
      var i = m.index + m[0].length;
      var args = [];
      var n = fn.length;
      for (var k = 0; k < n; k++) {
        if (s[i] === "{") {
          var depth = 0, j = i;
          for (; j < s.length; j++) {
            if (s[j] === "{") depth++;
            else if (s[j] === "}" && --depth === 0) break;
          }
          args.push(s.slice(i + 1, j));
          i = j + 1;
        } else {
          args.push(s[i] || "");
          i += 1;
        }
      }
      s = s.slice(0, m.index) + fn.apply(null, args) + s.slice(i);
    }
    return s;
  }

  function splitTop(s, sep) {
    var out = [], cur = "", d = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "(" || c === "[" || c === "{") d++;
      else if (c === ")" || c === "]" || c === "}") d = Math.max(0, d - 1);
      if (c === sep && d === 0) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }

  function closeVal(u, v) { return Math.abs(u - v) <= 1e-9 * Math.max(1, Math.abs(v)); }

  function normSeg(s, keepLabel) {
    s = s.replace(/^\((.*)\)$/, function (m, inner) { return balanced(inner) && splitTop(inner, ",").length === 1 ? inner : m; });
    if (s.indexOf("=") >= 0 && !/[<>]=/.test(s)) {
      var eqs = splitTop(s, "=");
      if (eqs.length >= 3) {
        try {
          var vLast = evaluate(eqs[eqs.length - 1]);
          var startIdx = (!keepLabel && /^[a-zA-Z](?:_[a-zA-Z0-9]+)?$/.test(eqs[0])) ? 1 : 0;
          var allEq = true;
          for (var k = startIdx; k < eqs.length - 1; k++) {
            if (!closeVal(evaluate(eqs[k]), vLast)) { allEq = false; break; }
          }
          if (allEq) s = eqs[eqs.length - 1];
        } catch (e) { /* keep full chain when non-numeric or unequal */ }
      } else if (eqs.length === 2) {
        var lhs = eqs[0], rhs = eqs[1];
        if (!keepLabel && /^[a-zA-Z](?:_[a-zA-Z0-9]+)?$/.test(lhs)) {
          try { evaluate(rhs); s = rhs; } catch (e) { /* keep lhs=rhs for variable/locus equations */ }
        } else {
          try { if (closeVal(evaluate(lhs), evaluate(rhs))) s = rhs; } catch (e) { /* keep lhs=rhs for relational equations */ }
        }
      }
    }
    return s.replace(/^\((.*)\)$/, function (m, inner) { return balanced(inner) && splitTop(inner, ",").length === 1 ? inner : m; });
  }

  function norm(s) {
    s = String(s || "");
    var isPairTuple = /^\s*[（(][^()（）]+[，,][^()（）]+[)）]\s*$/.test(s);
    s = s.replace(/[（]/g, "(").replace(/[）]/g, ")").replace(/[［]/g, "[").replace(/[］]/g, "]")
      .replace(/[，]/g, ",").replace(/[−–—]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/")
      .replace(/π/g, "\\pi").replace(/√/g, "\\sqrt").replace(/∞/g, "\\infty").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/∪/g, "\\cup");
    s = s.replace(/\\(?:quad|qquad)+/g, ",");
    s = s.replace(/\\(left|right|displaystyle|,|;|!)/g, "").replace(/\\(mathrm|text|textup|mathbf)\s*/g, "");
    s = s.replace(/\\[dt]frac/g, "\\frac");
    s = s.replace(/\\sqrt\s*(\d+)/g, "\\sqrt{$1}");
    s = unwrap(s, "frac", function (a, b) { return "(" + a + ")/(" + b + ")"; });
    s = s.replace(/\\sqrt\s*\[([^\]]+)\]/g, "\\root{$1}");
    s = unwrap(s, "root", function (n, x) { return "(" + x + ")^(1/(" + n + "))"; });
    s = unwrap(s, "sqrt", function (x) { return "sqrt(" + x + ")"; });
    s = s.replace(/sqrt(?!\()([0-9]+|[a-z])/g, "sqrt($1)");
    s = s.replace(/\\pi/g, "pi").replace(/\\infty/g, "inf").replace(/\\(cdot|times)/g, "*")
      .replace(/\\(leqslant|leq|le)\b/g, "<=").replace(/\\(geqslant|geq|ge)\b/g, ">=").replace(/\\cup/g, "U");
    s = s.replace(/[{}]/g, function (c) { return c === "{" ? "(" : ")"; }).replace(/\s+/g, "").replace(/[。.]$/, "");
    s = s.replace(/\((或|和|及|与)\)|或|和|及|、|；|;/g, ",");
    s = s.replace(/^\((.*)\)$/, function (m, inner) { return balanced(inner) && splitTop(inner, ",").length === 1 ? inner : m; });
    if (isPairTuple) return s;
    var branches = splitTop(s, ",").filter(Boolean);
    if (branches.length > 1) {
      var labels = branches.map(function (b) {
        var m = /^([a-zA-Z](?:_[a-zA-Z0-9]+)?)=/.exec(b.replace(/^\((.*)\)$/, "$1"));
        return m ? m[1] : null;
      }).filter(Boolean);
      var hasDistinctLabels = new Set(labels).size > 1;
      return branches.map(function (b) { return normSeg(b, hasDistinctLabels); }).join(",");
    }
    return normSeg(s, false);
  }
  function balanced(s) { var d = 0; for (var i = 0; i < s.length; i++) { if (s[i] === "(") d++; else if (s[i] === ")" && --d < 0) return false; } return d === 0; }

  // 小型算式求值：+ - * / ^、sqrt、pi、e，支持 2sqrt(2) 这类省略乘号
  function evaluate(s, env) {
    var i = 0;
    env = env || {};
    function peek() { return s[i]; }
    function num() {
      var m = /^(\d+(\.\d+)?|\.\d+)/.exec(s.slice(i));
      if (m) { i += m[0].length; return parseFloat(m[0]); }
      if (s.startsWith("sqrt", i)) { i += 4; return Math.sqrt(atom()); }
      if (s.startsWith("pi", i)) { i += 2; return Math.PI; }
      if (s[i] === "e" && s[i + 1] !== "x") { i += 1; return Math.E; }
      if (s[i] && Object.prototype.hasOwnProperty.call(env, s[i])) { return env[s[i++]]; }
      throw new Error("x");
    }
    function atom() {
      if (peek() === "(") { i++; var v = expr(); if (peek() !== ")") throw new Error("x"); i++; return v; }
      return num();
    }
    function power() { var b = atom(); if (peek() === "^") { i++; return Math.pow(b, signed()); } return b; }
    function signed() { if (peek() === "-") { i++; return -signed(); } if (peek() === "+") { i++; return signed(); } return power(); }
    function term() {
      var v = signed();
      for (;;) {
        var c = peek();
        if (c === "*") { i++; v *= signed(); }
        else if (c === "/") { i++; v /= signed(); }
        else if (c === "(" || (c && (/[0-9sp.e]/.test(c) || Object.prototype.hasOwnProperty.call(env, c)))) { v *= signed(); }
        else return v;
      }
    }
    function expr() {
      var v = term();
      for (;;) {
        if (peek() === "+") { i++; v += term(); }
        else if (peek() === "-") { i++; v -= term(); }
        else return v;
      }
    }
    var v = expr();
    if (i !== s.length || !isFinite(v)) throw new Error("x");
    return v;
  }
  function canonEq(s) {
    // Compare expression trees: deleting fraction parentheses can join factors
    // or turn (a^b)^c into a^(b^c). No algebraic identities are assumed here.
    function expressionTree(text) {
      var i = 0;
      function atom() {
        if (text[i] === "(") {
          i++; var inner = expr();
          if (text[i++] !== ")") throw new Error("group");
          return inner;
        }
        if (text.startsWith("sqrt(", i)) { i += 4; return ["sqrt", atom()]; }
        var m = /^(\d+(?:\.\d+)?|\.\d+|pi|[a-zA-Z](?:_[a-zA-Z0-9]+)?)/.exec(text.slice(i));
        if (!m) throw new Error("atom");
        i += m[0].length;
        if (/^\d|^\./.test(m[0])) {
          var number = Number(m[0]);
          if (!isFinite(number)) throw new Error("non-finite");
          return ["number", number];
        }
        return ["symbol", m[0]];
      }
      function power() {
        var base = atom();
        if (text[i] === "^") { i++; return ["^", base, signed()]; }
        return base;
      }
      function signed() {
        if (text[i] === "+") { i++; return signed(); }
        if (text[i] === "-") { i++; return ["neg", signed()]; }
        return power();
      }
      function term() {
        var value = signed();
        for (;;) {
          var c = text[i];
          if (c === "*" || c === "/") { i++; value = [c, value, signed()]; }
          else if (c && /[\d.a-zA-Z(]/.test(c)) value = ["*", value, signed()];
          else return value;
        }
      }
      function expr() {
        var value = term();
        while (text[i] === "+" || text[i] === "-") {
          var op = text[i++]; value = [op, value, term()];
        }
        return value;
      }
      var tree = expr();
      if (i !== text.length) throw new Error("trailing token");
      return tree;
    }
    try { return JSON.stringify(splitTop(s, "=").map(expressionTree)); }
    catch (e) { return null; }
  }
  function same(a, b) {
    var x = norm(a), y = norm(b);
    if (!x) return false;
    if (x === y) return true;
    var cx = canonEq(x), cy = canonEq(y);
    if (cx !== null && cx === cy) return true;
    var isTuple = /^\([^,]+,[^,]+\)$/.test(x) || /^\([^,]+,[^,]+\)$/.test(y);
    if (isTuple) return false;
    var xs = splitTop(x, ",").filter(Boolean), ys = splitTop(y, ",").filter(Boolean);
    if (xs.length > 1 || ys.length > 1) {
      if (xs.length !== ys.length) return false;
      var rem = ys.slice();
      return xs.every(function (u) {
        var idx = rem.findIndex(function (v) {
          var mu = /^([a-zA-Z](?:_[a-zA-Z0-9]+)?)=(.+)$/.exec(u);
          var mv = /^([a-zA-Z](?:_[a-zA-Z0-9]+)?)=(.+)$/.exec(v);
          if (mu && mv) return mu[1] === mv[1] && same(mu[2], mv[2]);
          if (mu || mv) return false;
          return same(u, v);
        });
        if (idx < 0) return false;
        rem.splice(idx, 1);
        return true;
      });
    }
    // 非同形的含字母表达式交给自评；有限正数代入不能证明恒等或覆盖定义域。
    try { return closeVal(evaluate(x), evaluate(y)); } catch (e) { return false; }
  }

  // ---------- 题目页 ----------
  function initProblem() {
    var dataEl = document.getElementById("pdata");
    if (!dataEl) return;
    var P = JSON.parse(dataEl.textContent);
    var box = document.querySelector(".answer");
    var verdict = box.querySelector(".fb");
    var reveal = box.querySelector("[data-reveal-answer]");
    var answerHtml = box.querySelector(".std-answer");

    function say(cls, html) { verdict.className = "verdict fb " + cls; verdict.innerHTML = html; verdict.hidden = false; }
    function showAnswer() { if (answerHtml) answerHtml.hidden = false; if (reveal) reveal.hidden = true; }
    function selfMark(note) {
      if (P.rubric) { rubricMark(); return; }
      var row = document.createElement("div");
      row.className = "next";
      [["我其实做对了", "ok"], ["做对了一部分", "part"], ["没做出来", "no"]].forEach(function (b) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "pill"; btn.textContent = b[0];
        btn.addEventListener("click", function () {
          record(P.id, "self", b[1]);
          row.querySelectorAll("button").forEach(function (x) { x.disabled = true; x.setAttribute("aria-pressed", String(x === btn)); });
        });
        row.appendChild(btn);
      });
      if (note) { var p = document.createElement("p"); p.className = "hint-text"; p.textContent = note; verdict.appendChild(p); }
      verdict.appendChild(row);
    }

    function rubricMark() {
      var card = document.createElement("div"), selected = {}, previous = load().problems[P.id] || {};
      var old = previous.rubric;
      if (old && old.revision === P.rubric_revision && Array.isArray(old.selected)) old.selected.forEach(function (id) { selected[id] = true; });
      var title = document.createElement("p"); title.textContent = "自拟练习评分，共 " + P.rubric.total + " 分，不是官方评分。只勾选自己完整写出的步骤。"; card.appendChild(title);
      var boxes = [];
      P.rubric.steps.forEach(function (step) {
        var label = document.createElement("label"), input = document.createElement("input"), text = document.createElement("div"), points = document.createElement("span");
        label.className = "rubric-step"; input.type = "checkbox"; input.checked = !!selected[step.id]; input.dataset.stepId = step.id;
        text.className = "rubric-description"; text.innerHTML = step.html;
        points.className = "chip"; points.textContent = step.points + " 分";
        label.append(input, text, points); card.appendChild(label); boxes.push({ input: input, step: step });
      });
      var score = document.createElement("p"), button = document.createElement("button"), saved = document.createElement("p");
      button.type = "button"; button.className = "btn"; button.textContent = "保存本次自评"; saved.className = "hint-text"; saved.setAttribute("role", "status");
      button.setAttribute("data-save-rubric", "");
      function value() { return boxes.reduce(function (sum, x) { return sum + (x.input.checked ? x.step.points : 0); }, 0); }
      function draft() {
        score.textContent = "已勾选 " + value() + " / " + P.rubric.total + " 分";
        var d = load(), p = d.problems[P.id] || { attempts: 0 };
        p.rubric = { revision: P.rubric_revision, selected: boxes.filter(function (x) { return x.input.checked; }).map(function (x) { return x.step.id; }), score: value(), total: P.rubric.total };
        d.problems[P.id] = p; save(d); saved.textContent = "勾选已保存在本机；核对完后保存本次自评。";
      }
      boxes.forEach(function (x) { x.input.addEventListener("change", draft); });
      button.addEventListener("click", function () {
        draft(); var n = value(); record(P.id, "self", n === P.rubric.total ? "ok" : n > 0 ? "part" : "no");
        saved.textContent = "已记录本次自评：" + n + " / " + P.rubric.total + " 分。";
      });
      score.textContent = "已勾选 " + value() + " / " + P.rubric.total + " 分";
      card.append(score, button, saved); verdict.appendChild(card);
    }

    if (P.type === "choice") {
      var multi = P.choice.length > 1;
      var chosen = {};
      box.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () {
          var L = b.dataset.letter;
          if (!multi) chosen = {};
          chosen[L] = !chosen[L];
          box.querySelectorAll(".opt").forEach(function (x) { x.setAttribute("aria-pressed", String(!!chosen[x.dataset.letter])); x.classList.remove("right", "wrong"); });
        });
      });
      box.querySelector("[data-submit]").addEventListener("click", function () {
        var pick = Object.keys(chosen).filter(function (k) { return chosen[k]; }).sort().join("");
        if (!pick) { say("info", "先选一个选项。"); return; }
        var ok = pick === P.choice;
        record(P.id, "attempt", ok ? "ok" : "no");
        box.querySelectorAll(".opt").forEach(function (x) {
          if (chosen[x.dataset.letter]) x.classList.add(P.choice.indexOf(x.dataset.letter) >= 0 ? "right" : "wrong");
        });
        if (ok) { say("ok", "答对了。"); showAnswer(); }
        else say("no", "不对，再想想；也可以先看提示。");
      });
    } else if (P.type === "blank") {
      var input = box.querySelector("input.ans");
      var submit = box.querySelector("[data-submit]");
      function check() {
        var v = input.value.trim();
        if (!v) { say("info", "先写下你的答案。"); return; }
        var ok = P.answers.length === 1 && same(v, P.answers[0]);
        if (ok) { record(P.id, "attempt", "ok"); say("ok", "答对了。"); showAnswer(); return; }
        record(P.id, "attempt", null);
        showAnswer();
        say("info", "和标准答案对不上。看一眼上面的标准答案：");
        selfMark("写法不同（比如没化简、区间写法不同）也算对，自己判断一下。");
        submit.disabled = true;
      }
      submit.addEventListener("click", check);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
    } else {
      var proofSubmit = box.querySelector("[data-submit]");
      if ((load().problems[P.id] || {}).reviewAwaitingSelf) proofSubmit.textContent = "继续上次自评";
      proofSubmit.addEventListener("click", function (e) {
        e.target.disabled = true;
        var continuing = !!(load().problems[P.id] || {}).reviewAwaitingSelf;
        if (!continuing) record(P.id, "attempt", null);  // 待自评的提交在刷新后继续同一次记录。
        openAll();
        say("info", continuing ? "继续核对上次已提交的解答，保存自评后再开始新一轮。" : "对照下面的完整解答，给自己评一下：");
        selfMark();
      });
    }
    if (reveal) reveal.addEventListener("click", function () { record(P.id, "view-answer"); showAnswer(); });

    // 解析逐层展开
    var layers = Array.prototype.slice.call(document.querySelectorAll(".ladder .layer"));
    var nextBtn = document.querySelector("[data-next-layer]");
    var allBtn = document.querySelector("[data-all-layers]");
    var shown = 0;
    function label() {
      if (shown >= layers.length) { nextBtn.hidden = true; allBtn.hidden = true; return; }
      nextBtn.textContent = layers[shown].dataset.label;
    }
    function step() {
      if (shown >= layers.length) return;
      layers[shown].hidden = false;
      record(P.id, "view-" + layers[shown].dataset.kind);
      shown++;
      label();
    }
    function openAll() { while (shown < layers.length) step(); }
    if (nextBtn) { nextBtn.addEventListener("click", step); allBtn.addEventListener("click", openAll); label(); }
  }

  // ---------- 题目反馈 ----------
  function initFeedback() {
    var box = document.querySelector(".feedback");
    var dataEl = document.getElementById("pdata");
    if (!box || !dataEl) return;
    var id = JSON.parse(dataEl.textContent).id;
    var form = box.querySelector("form");
    box.querySelector("[data-open-feedback]").addEventListener("click", function () { form.hidden = !form.hidden; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tag = (form.querySelector("input[name=tag]:checked") || {}).value;
      var note = form.querySelector("textarea").value.trim();
      if (!tag && !note) return;
      record(id, "feedback", tag || "其他", note);
      form.reset();
      form.hidden = true;
      box.querySelector(".fb-done").hidden = false;
    });
  }

  // ---------- 题目联系 ----------
  function initLinks() {
    var data = document.getElementById("pdata");
    var P = data ? JSON.parse(data.textContent) : null;
    var card = document.querySelector(".connections");
    function unlock() { if (card) card.hidden = false; }
    var saved = load();
    if (P && ((saved.problems[P.id] || {}).first || (saved.problems[P.id] || {}).solutionViewed ||
      (saved.log || []).some(function (e) { return e.id === P.id && e.kind === "view-solution"; }))) unlock();
    document.addEventListener("peiyu-record", function (e) {
      if (!P || e.detail.id !== P.id) return;
      var kind = e.detail.kind;
      if (kind === "attempt" || kind === "self" || kind === "view-solution") unlock();
    });
    document.querySelectorAll("[data-view-link]").forEach(function (d) {
      d.addEventListener("toggle", function () { if (d.open && P) record(P.id, "view-link", null, d.dataset.viewLink); });
    });
    document.querySelectorAll("[data-reveal-link]").forEach(function (b) {
      b.addEventListener("click", function () {
        var reason = b.closest("article,section").querySelector(".link-reason");
        if (!reason || !reason.hidden) return;
        reason.hidden = false;
        b.setAttribute("aria-expanded", "true");
        var pair = b.dataset.pair;
        if (P) record(P.id, "reveal-link", null, pair);
        else {
          var cmp = document.getElementById("comparison");
          if (cmp) [cmp.dataset.a, cmp.dataset.b].forEach(function (id) { record(id, "reveal-link", null, pair); });
        }
      });
      b.setAttribute("aria-expanded", "false");
    });
    var comparison = document.getElementById("comparison");
    if (comparison) [comparison.dataset.a, comparison.dataset.b].forEach(function (id) {
      record(id, "compare", null, comparison.dataset.pair);
    });
  }

  // ---------- 我的学习 ----------
  function initRecord() {
    var root = document.getElementById("record");
    if (!root) return;
    var NAME = "peiyu.olympic.name";
    var nameInput = document.getElementById("student-name");
    try { nameInput.value = localStorage.getItem(NAME) || ""; } catch (e) { /* 忽略 */ }
    nameInput.addEventListener("change", function () { try { localStorage.setItem(NAME, nameInput.value.trim()); } catch (e) { /* 忽略 */ } });

    // 题目索引用脚本标签加载（assets/problems.js），双击本地文件打开时 fetch 会被浏览器拦下
    var ready = window.PEIYU_PROBLEMS ? Promise.resolve(window.PEIYU_PROBLEMS)
      : fetch("assets/problems.json").then(function (r) { return r.json(); });
    ready.then(function (meta) {
      var d = load();
      var ids = Object.keys(d.problems).filter(function (id) { return meta[id]; });
      function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
      function link(id) { return '<a href="p/' + id + '.html">' + esc(meta[id].label) + "</a>"; }
      var tried = ids.filter(function (id) { return d.problems[id].first; });
      var indep = tried.filter(function (id) { var p = d.problems[id]; return p.first === "ok" && !p.helped; });
      var helped = tried.filter(function (id) { var p = d.problems[id]; return p.first === "ok" && p.helped; });
      var later = tried.filter(function (id) { var p = d.problems[id]; return p.first !== "ok" && p.status === "ok"; });
      var todo = tried.filter(function (id) { var p = d.problems[id]; return p.status !== "ok"; });
      var viewed = ids.filter(function (id) { return !d.problems[id].first; });

      document.getElementById("stat").innerHTML =
        '<div class="stat"><b>' + tried.length + "</b><span>做过</span></div>" +
        '<div class="stat ok"><b>' + indep.length + "</b><span>首次独立做对</span></div>" +
        '<div class="stat"><b>' + helped.length + "</b><span>看过提示后做对</span></div>" +
        '<div class="stat"><b>' + later.length + "</b><span>重做后做对</span></div>" +
        '<div class="stat no"><b>' + todo.length + "</b><span>待重做</span></div>";

      // 按专题
      var by = {};
      tried.forEach(function (id) {
        var fr = meta[id].fr; by[fr] = by[fr] || { name: meta[id].topic, n: 0, indep: 0, todo: 0 };
        by[fr].n++; if (indep.indexOf(id) >= 0) by[fr].indep++; if (todo.indexOf(id) >= 0) by[fr].todo++;
      });
      var rows = Object.keys(by).sort().map(function (fr) {
        var r = by[fr];
        return '<tr><td><a href="t/' + fr + '.html">' + esc(r.name) + "</a></td><td>" + r.n + "</td><td>" + r.indep + "</td><td>" + r.todo + "</td></tr>";
      }).join("");
      document.getElementById("by-topic").innerHTML = rows
        ? "<table><thead><tr><th>专题</th><th>做过</th><th>首次独立做对</th><th>待重做</th></tr></thead><tbody>" + rows + "</tbody></table>"
        : '<p class="muted">还没有做题记录。从<a href="index.html">专题地图</a>挑一个专题开始吧。</p>';

      var wrong = todo.sort(function (a, b) { return (d.problems[b].at || "").localeCompare(d.problems[a].at || ""); });
      document.getElementById("wrong").innerHTML = wrong.length
        ? '<ul class="plist">' + wrong.map(function (id) {
            var p = d.problems[id];
            var tag = { no: "没做出", part: "部分做对", unsure: "待自评" }[p.status || p.first] || "待重做";
            return '<li><a href="p/' + id + '.html"><span class="dot ' + (p.status || "no") + '"></span><span class="name">' + esc(meta[id].label) +
              '<br><small>' + esc(meta[id].topic) + " · F" + meta[id].lv + "</small></span><span class=\"meta\">" + tag + "</span></a></li>";
          }).join("") + "</ul>"
        : '<p class="muted">没有待重做的题。</p>';

      var fbs = [];
      ids.forEach(function (id) { (d.problems[id].feedback || []).forEach(function (f) { fbs.push([id, f]); }); });
      document.getElementById("fb-list").innerHTML = fbs.length
        ? "<ul>" + fbs.map(function (x) { return "<li>" + link(x[0]) + "：" + esc(x[1].tag) + (x[1].note ? "——" + esc(x[1].note) : "") + "</li>"; }).join("") + "</ul>"
        : '<p class="muted">还没有提交过反馈。</p>';
      document.getElementById("viewed-n").textContent = viewed.length;

      function summary() {
        var name = nameInput.value.trim() || "（未填姓名）";
        var lines = ["培玉一试 · 学习记录", "学生：" + name, "导出时间：" + new Date().toLocaleString("zh-CN"), "",
          "做过 " + tried.length + " 题；首次独立做对 " + indep.length + "；看过提示后做对 " + helped.length + "；重做后做对 " + later.length + "；待重做 " + todo.length + "。", ""];
        Object.keys(by).sort().forEach(function (fr) { var r = by[fr]; lines.push(r.name + "：做过 " + r.n + "，首次独立做对 " + r.indep + "，待重做 " + r.todo); });
        var graded = ids.filter(function (id) { var r = d.problems[id].rubric; return r && typeof r.score === "number" && typeof r.total === "number"; });
        if (graded.length) { lines.push("", "解答题步骤自评（自拟练习分，非官方）："); graded.forEach(function (id) { var r = d.problems[id].rubric; lines.push("  " + meta[id].label + "：" + r.score + "/" + r.total); }); }
        if (wrong.length) { lines.push("", "待重做："); wrong.forEach(function (id) { lines.push("  " + meta[id].label + "（" + meta[id].topic + "，F" + meta[id].lv + "）"); }); }
        if (fbs.length) { lines.push("", "题目反馈："); fbs.forEach(function (x) { lines.push("  " + meta[x[0]].label + "：" + x[1].tag + (x[1].note ? "——" + x[1].note : "")); }); }
        return lines.join("\n");
      }
      var msg = document.getElementById("export-msg");
      document.getElementById("copy-summary").addEventListener("click", function () {
        var text = summary();
        var done = function () { msg.textContent = "已复制，可以直接粘贴给老师。"; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
        else fallback(text);
      });
      function fallback(text) {
        var ta = document.getElementById("summary-text");
        ta.value = text; ta.hidden = false; ta.select();
        msg.textContent = "浏览器不允许自动复制，请手动复制下面的文字。";
      }
      document.getElementById("download-json").addEventListener("click", function () {
        var studentId;
        try {
          studentId = localStorage.getItem("peiyu.olympic.student-id");
          if (!studentId) { studentId = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2); localStorage.setItem("peiyu.olympic.student-id", studentId); }
        } catch (e) { /* 导出仍可按姓名归并 */ }
        var blob = new Blob([JSON.stringify({ schemaVersion: 1, studentId: studentId, name: nameInput.value.trim(), exportedAt: new Date().toISOString(), data: load() }, null, 1)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "peiyu-olympic-record.json";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      document.getElementById("clear-all").addEventListener("click", function () {
        if (!window.confirm("确定清空这台设备上的全部做题记录和模考草稿吗？清空后无法恢复。")) return;
        try {
          localStorage.removeItem(STORE); localStorage.removeItem(NAME); localStorage.removeItem("peiyu.olympic.student-id");
          Object.keys(localStorage).filter(function (key) { return key.indexOf("peiyu.olympic.exam.v1.") === 0; }).forEach(function (key) { localStorage.removeItem(key); });
        } catch (e) { /* 忽略 */ }
        location.reload();
      });
    });
  }

  // ---------- 专题页 ----------
  function initTopic() {
    var items = document.querySelectorAll(".plist li");
    if (!items.length) return;
    var d = load();
    items.forEach(function (li) {
      var s = (d.problems[li.dataset.id] || {}).status;
      var dot = li.querySelector(".dot");
      if (s && dot) { dot.classList.add(s); dot.title = { ok: "做对", no: "没做出", part: "部分" }[s]; }
    });
    var filters = { type: "", lv: "", method: "" };
    document.querySelectorAll(".filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        var key = b.dataset.key, val = b.dataset.val;
        filters[key] = filters[key] === val ? "" : val;
        document.querySelectorAll('.filters button[data-key="' + key + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(filters[key] === x.dataset.val)); });
        document.querySelectorAll(".lvgroup li").forEach(function (li) {
          li.hidden = !!((filters.type && li.dataset.type !== filters.type) || (filters.lv && li.dataset.lv !== filters.lv) ||
            (filters.method && (li.dataset.methods || "").split(" ").indexOf(filters.method) < 0));
        });
        document.querySelectorAll(".lvgroup").forEach(function (g) {
          g.hidden = !g.querySelector("li:not([hidden])");
        });
      });
    });
  }

  window.PeiyuOlympic = { norm: norm, same: same, record: record, load: load, save: save };
  document.addEventListener("DOMContentLoaded", function () { initTheme(); initProblem(); initFeedback(); initTopic(); initRecord(); initLinks(); });
})();


/* Local KaTeX layout only: no mathematical text, storage, or learning events. */
(function () {
  'use strict';
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (typeof MutationObserver === 'undefined' || typeof window.requestAnimationFrame !== 'function') return;
  var queued = false;
  function refresh() {
    queued = false;
    var nodes = Array.from(document.querySelectorAll('.katex')).filter(function (node) {
      return !node.closest('.katex-display');
    });
    // One measurement phase, then one cleanup phase. The 1 px tolerance excludes
    // KaTeX ink/fractional pixel rounding from creating scrollbars on short math.
    nodes.forEach(function (node) { node.classList.add('inline-math-scroll'); });
    var fitting = nodes.filter(function (node) {
      return node.clientWidth === 0 || node.scrollWidth <= node.clientWidth + 1;
    });
    fitting.forEach(function (node) { node.classList.remove('inline-math-scroll'); });
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(refresh);
  }
  function init() {
    new MutationObserver(schedule).observe(document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['hidden', 'open']
    });
    window.addEventListener('resize', schedule);
    if (document.fonts) {
      document.fonts.ready.then(schedule);
      document.fonts.addEventListener('loadingdone', schedule);
    }
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
