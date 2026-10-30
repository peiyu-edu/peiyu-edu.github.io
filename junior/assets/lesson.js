/* 培玉 · 高中数学互动站 — 页面公共脚本：步骤切换、先猜、真题练习、做题记录、KaTeX。
   每节页面只需：<body data-sec="b1-1-3">，步骤写成 <section class="step" data-title="…">，
   先猜写成 <div class="predict" data-answer="B" data-id="p1">…</div>（见 lessons/_template.html），
   真题区写 <div id="practice"></div>，题目从 ../data/sections/<sec>.json 读。 */
(function () {
  "use strict";

  /* ---------- 学段与记录 ---------- */
  // 学段：<body data-stage> 优先；否则节号 j<章>-<节> 是初中，其余是高中。
  // 初中记录单独存 peiyu.jh.log，高中照旧 peiyu.hs.log，两边的记录页互不混入。
  var sec = document.body.getAttribute("data-sec") || "";
  var STAGE = document.body.getAttribute("data-stage") || (/^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(sec) ? "junior" : "high");
  var EXAM_NAME = STAGE === "junior" ? "中考真题" : "高考真题";
  var LOG_KEY = STAGE === "junior" ? "peiyu.jh.log" : "peiyu.hs.log", NAME_KEY = "peiyu.hs.name";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function readLog() { try { return JSON.parse(store(LOG_KEY) || "[]"); } catch (e) { return []; } }
  function log(kind, data) {
    var ev = Object.assign({ t: Date.now(), sec: sec, kind: kind }, data || {});
    var all = readLog(); all.push(ev);
    if (all.length > 5000) all = all.slice(-5000);
    store(LOG_KEY, JSON.stringify(all));
    // 以后接服务器：页面里设 window.PEIYU_LOG_URL 即可，失败不影响做题
    if (window.PEIYU_LOG_URL && navigator.sendBeacon) {
      try { navigator.sendBeacon(window.PEIYU_LOG_URL, JSON.stringify(Object.assign({ name: store(NAME_KEY) || "" }, ev))); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- KaTeX ---------- */
  var MACROS = {
    "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}", "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}", "\\Z": "\\mathbf{Z}",
    "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}", "\\bs": "\\boldsymbol{#1}", "\\symbfup": "\\mathbf{#1}", "\\symbfit": "\\boldsymbol{#1}"
  };
  function math(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [
          { left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }
        ],
        macros: MACROS, throwOnError: false, strict: "ignore"
      });
    }
  }

  /* ---------- 步骤 ---------- */
  function setupSteps() {
    var steps = [].slice.call(document.querySelectorAll(".step"));
    if (!steps.length) return;
    var bar = document.createElement("nav"); bar.className = "steps"; bar.setAttribute("role", "tablist");
    steps.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.textContent = (i + 1) + " " + (s.getAttribute("data-title") || "");
      b.onclick = function () { show(i); };
      bar.appendChild(b);
      if (i < steps.length - 1) {
        var nx = document.createElement("div"); nx.className = "next";
        var nb = document.createElement("button"); nb.type = "button"; nb.className = "btn";
        nb.textContent = "下一步：" + (steps[i + 1].getAttribute("data-title") || "");
        nb.onclick = function () { show(i + 1); window.scrollTo({ top: bar.offsetTop - 8, behavior: "smooth" }); };
        nx.appendChild(nb); s.appendChild(nx);
      }
    });
    steps[0].parentNode.insertBefore(bar, steps[0]);
    var cur = -1;
    function show(i) {
      if (i === cur) return; cur = i;
      steps.forEach(function (s, j) { s.classList.toggle("on", j === i); });
      [].forEach.call(bar.children, function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      log("step", { step: i + 1 });
      document.dispatchEvent(new CustomEvent("step", { detail: i + 1 }));
    }
    var h = parseInt((location.hash.match(/step(\d+)/) || [])[1] || "1", 10);
    show(Math.min(Math.max(h, 1), steps.length) - 1);
  }

  /* ---------- 先猜（不判分，只记录，然后揭晓） ---------- */
  var SVG_RETRY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/></svg>';

  function setupPredict() {
    [].forEach.call(document.querySelectorAll(".predict"), function (box) {
      if (box.getAttribute("data-predict-init")) return;
      box.setAttribute("data-predict-init", "1");
      var ans = box.getAttribute("data-answer"), id = box.getAttribute("data-id") || "";
      var reveal = box.querySelector(".reveal"); if (reveal) reveal.hidden = true;
      var opts = [].slice.call(box.querySelectorAll(".opt"));

      function reset() {
        box.classList.remove("done");
        opts.forEach(function (p) {
          p.classList.remove("right", "wrong", "sel");
          p.removeAttribute("aria-disabled");
        });
        if (reveal) reveal.hidden = true;
        log("retry", { id: id });
        try { box.dispatchEvent(new CustomEvent("predict:reset", { detail: { id: id }, bubbles: true })); } catch (e) { /* ignore */ }
      }

      var topBtn = document.createElement("button");
      topBtn.type = "button";
      topBtn.className = "card-retry";
      topBtn.title = "重新作答";
      topBtn.setAttribute("aria-label", "重新作答");
      topBtn.innerHTML = SVG_RETRY + " 重新作答";
      topBtn.onclick = reset;
      box.insertBefore(topBtn, box.firstChild);

      if (reveal) {
        var foot = document.createElement("div");
        foot.className = "ctrl retry-ctrl";
        var btmBtn = document.createElement("button");
        btmBtn.type = "button";
        btmBtn.className = "btn ghost retry-btn";
        btmBtn.innerHTML = SVG_RETRY + " 重新作答";
        btmBtn.onclick = reset;
        foot.appendChild(btmBtn);
        reveal.appendChild(foot);
      }

      opts.forEach(function (o) {
        o.type = "button";
        o.onclick = function () {
          if (box.classList.contains("done")) return;
          box.classList.add("done");
          var v = o.getAttribute("data-v");
          opts.forEach(function (p) {
            var pv = p.getAttribute("data-v");
            if (pv === ans) p.classList.add("right");
            else if (p === o) p.classList.add("wrong");
            p.setAttribute("aria-disabled", "true");
          });
          if (reveal) reveal.hidden = false;
          log("predict", { id: id, choice: v, correct: v === ans });
          try { box.dispatchEvent(new CustomEvent("predict:pick", { detail: { id: id, choice: v, answer: ans, correct: v === ans }, bubbles: true })); } catch (e) { /* ignore */ }
        };
      });
    });
  }

  /* ---------- 真题练习 ---------- */
  var LETTERS = "ABCDE";
  function norm(s) {
    return String(s || "").replace(/\\[()\[\]]/g, "").replace(/\\(dfrac|tfrac)/g, "\\frac")
      .replace(/\\left|\\right|\\,|\\;|\\!|\s|\$|\{|\}/g, "").replace(/\\/g, "")
      .replace(/，/g, ",").replace(/．|。/g, "").toLowerCase();
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function formatTag(p) {
    var year = p.year;
    var paper = p.paper;
    var no = p.no != null ? p.no : p.number;

    if (!year || !paper) {
      var src = typeof p.source === "string" ? p.source : (p.source && p.source.stem ? p.source.stem : "");
      if (src) {
        if (src.indexOf("2026补充") >= 0) {
          if (!year) year = "2026";
          var mSup = src.match(/2026补充\/([^\/]+)\//);
          if (mSup && !paper) paper = mSup[1].replace("高考", "卷");
        } else {
          var mYear = src.match(/(\d{4})年/);
          if (mYear && !year) year = mYear[1];
          var mDetail = src.match(/高考数学试卷[（\(](.*?)[）\)](?:[（\(](.*?)[）\)])?/);
          if (mDetail && !paper) {
            var p1 = mDetail[1], p2 = mDetail[2];
            if (p2 && p2 !== "空白卷" && p2 !== "高清") paper = p2 + "（" + p1 + "）";
            else if (p1 && p1 !== "空白卷" && p1 !== "高清") paper = p1;
          }
        }
        if (!paper) {
          var base = src.split("/").pop() || "";
          base = base.replace(/(\d{4})|年|高考|数学|试卷|\.pdf|[（\(](空白卷|高清)[）\)]|-教师版|（高清）/g, "").trim();
          base = base.replace(/^[（\(]|[）\)]$|[-_]/g, "").trim();
          if (base) paper = base;
        }
      }
    }

    var parts = [];
    if (year) parts.push(year);
    if (paper) parts.push(paper);
    if (no != null && no !== "") parts.push("第" + no + "题");
    return parts.length ? parts.join(" ") : EXAM_NAME;
  }

  function renderProblem(p, idx) {
    var card = el("div", "card prob");
    if (p.cards && Array.isArray(p.cards) && p.cards.length) {
      card.setAttribute("data-cards", p.cards.join(","));
    }
    var topBtn = el("button", "card-retry", SVG_RETRY + " 重新作答");
    topBtn.type = "button"; topBtn.title = "重新作答"; topBtn.setAttribute("aria-label", "重新作答");
    card.appendChild(topBtn);
    card.appendChild(el("div", "small", '<span class="tag">' + esc(formatTag(p)) + "</span>" +
      (p.level ? '<span class="tag">' + esc(p.level) + "</span>" : "") + (p.note ? esc(p.note) : "")));
    card.appendChild(el("div", "stem", "<b>" + (idx + 1) + ".</b> " + esc(p.stem)));
    var fb = el("div", "fb"), sol = el("div", "sol");
    sol.hidden = true;
    sol.innerHTML = (p.answer ? "<p><b>答案：</b>" + esc(p.answer) + "</p>" : "") +
      (p.solution ? '<p class="stem"><b>解析：</b>' + esc(p.solution) + "</p>" : "");
    var foot = el("div", "ctrl retry-ctrl");
    var btmBtn = el("button", "btn ghost retry-btn", SVG_RETRY + " 重新作答");
    btmBtn.type = "button";
    foot.appendChild(btmBtn);
    sol.appendChild(foot);

    var done = false;
    function finish(correct, choice) {
      if (done) return; done = true;
      card.classList.add("done");
      fb.className = "fb " + (correct ? "ok" : "no");
      fb.textContent = correct ? "对了。" : "不对，看看解析。";
      sol.hidden = false; math(sol);
      log("answer", { id: p.id, choice: choice, correct: correct });
    }

    function resetProblem() {
      done = false;
      card.classList.remove("done");
      fb.className = "fb"; fb.textContent = "";
      sol.hidden = true;
      var rep = card.querySelector(".selfrep");
      if (rep) rep.remove();
      var opts = [].slice.call(card.querySelectorAll(".opt"));
      opts.forEach(function (o) {
        o.classList.remove("right", "wrong", "sel");
        o.removeAttribute("aria-disabled");
      });
      if (multi) {
        picked = {};
        var sub = card.querySelector("button.btn:not(.retry-btn)");
        if (sub) sub.disabled = false;
      }
      var inp = card.querySelector("input[type=text]");
      if (inp) {
        inp.value = ""; inp.disabled = false;
        var chk = card.querySelector(".ctrl button.btn:not(.retry-btn)");
        if (chk) chk.disabled = false;
      }
      var see = card.querySelector("button.btn.ghost:not(.retry-btn)");
      if (see) see.disabled = false;
      log("retry", { id: p.id });
    }
    topBtn.onclick = resetProblem;
    btmBtn.onclick = resetProblem;

    var multi = /多选/.test(p.type);
    if (p.choices && p.choices.length) {
      var box = el("div", "opts" + (p.choices.every(function (c) { return c.length < 40; }) ? " cols" : ""));
      var picked = {};
      p.choices.forEach(function (c, i) {
        var o = el("button", "opt", "<b>" + LETTERS[i] + "</b>" + esc(c)); o.type = "button";
        o.onclick = function () {
          if (done) return;
          if (multi) { picked[LETTERS[i]] = !picked[LETTERS[i]]; o.classList.toggle("sel"); return; }
          var right = norm(p.answer).toUpperCase() === LETTERS[i];
          o.classList.add(right ? "right" : "wrong");
          if (!right) markRight(box, p.answer);
          [].forEach.call(box.querySelectorAll(".opt"), function (p) { p.setAttribute("aria-disabled", "true"); });
          finish(right, LETTERS[i]);
        };
        box.appendChild(o);
      });
      card.appendChild(box);
      if (multi) {
        var sub = el("button", "btn", "提交"); sub.type = "button";
        sub.onclick = function () {
          if (done) return;
          var mine = Object.keys(picked).filter(function (k) { return picked[k]; }).sort().join("");
          var want = norm(p.answer).toUpperCase().replace(/[^A-E]/g, "").split("").sort().join("");
          markRight(box, want);
          [].forEach.call(box.querySelectorAll(".opt"), function (p) { p.setAttribute("aria-disabled", "true"); });
          finish(mine === want, mine); sub.disabled = true;
        };
        card.appendChild(sub);
      }
    } else if (/填空/.test(p.type) && p.answer) {
      var row = el("div", "ctrl");
      var inp = el("input"); inp.type = "text"; inp.placeholder = "填答案，如 3 或 1/2"; inp.setAttribute("aria-label", "答案");
      var chk = el("button", "btn", "对答案"); chk.type = "button";
      row.appendChild(inp); row.appendChild(chk); card.appendChild(row);
      chk.onclick = function () {
        if (done) return;
        inp.disabled = true;
        if (norm(inp.value) && norm(inp.value) === norm(p.answer)) { finish(true, inp.value); return; }
        // 写法不同也可能是对的：给出答案，让学生自己判
        sol.hidden = false; math(sol);
        selfReport(card, function (ok) { finish(ok, inp.value + (ok ? "（自判对）" : "")); });
        chk.disabled = true;
      };
    } else {
      var see = el("button", "btn ghost", "做完了，看解析"); see.type = "button";
      card.appendChild(see);
      see.onclick = function () {
        if (done) return;
        sol.hidden = false; math(sol); see.disabled = true;
        selfReport(card, function (ok) { finish(ok, ok ? "自判对" : "自判错"); });
      };
    }
    card.appendChild(fb); card.appendChild(sol);
    if (p.part) {
      var partLine = card.querySelector(".small");
      if (!partLine) throw new Error("真题标题节点缺失");
      var partTag = document.createElement("span");
      partTag.className = "tag";
      partTag.textContent = "小问 " + p.part;
      partLine.appendChild(partTag);
    }
    if (!window.PeiyuGaokaoSolutions || typeof window.PeiyuGaokaoSolutions.enhance !== "function" || typeof window.PeiyuGaokaoSolutions.renderFigures !== "function") {
      throw new Error("高考分步解析资源未加载");
    }
    var problemFigures = window.PeiyuGaokaoSolutions.renderFigures(p, "problem");
    if (!problemFigures || problemFigures.nodeType !== 11) throw new Error("真题图库未返回图形片段");
    if (problemFigures.childNodes.length) {
      var problemStem = card.querySelector(".stem");
      if (!problemStem) throw new Error("真题题干节点缺失");
      problemStem.parentNode.insertBefore(problemFigures, problemStem.nextSibling);
    }
    window.PeiyuGaokaoSolutions.enhance(card, p);
    return card;
  }
  function markRight(box, ans) {
    [].forEach.call(box.children, function (o, i) { if (String(ans).toUpperCase().indexOf(LETTERS[i]) >= 0) o.classList.add("right"); });
  }
  function selfReport(card, cb) {
    var r = el("div", "selfrep", '<span class="small">和答案对一下：</span>');
    [["我做对了", true], ["我做错了 / 没做出", false]].forEach(function (x) {
      var b = el("button", "btn ghost", x[0]); b.type = "button";
      b.onclick = function () { cb(x[1]); r.remove(); };
      r.appendChild(b);
    });
    card.appendChild(r);
  }

  function setupPractice() {
    var host = document.getElementById("practice");
    if (!host || !sec) return;
    host.innerHTML = '<p class="small">题目加载中…</p>';
    fetch("../data/sections/" + sec + ".json?v=" + encodeURIComponent(document.body.getAttribute("data-gaokao-bank-revision") || document.body.getAttribute("data-bank-revision") || "")).then(function (r) { return r.json(); }).then(function (probs) {
      host.innerHTML = "";
      if (!probs.length) { host.innerHTML = '<p class="small">这一节的真题还在整理。</p>'; return; }
      // <div id="practice" data-fold-later>：note 写了「要用到 <节号>」、且那一节在本节之后的题，收进最后一个折叠块。
      // 只比「章.节」：b1-2-3 是 2.3，note 里的 4.2 在后面要折叠，1.4 在前面不折叠。
      var fold = host.hasAttribute("data-fold-later");
      var BOOK_ORDER = { b1: 1, b2: 2, e1: 3, e2: 4, e3: 5 };
      function parseSecOrder(sid) {
        var m = /^(b1|b2|e1|e2|e3)-(\d+)-(\d+)$/.exec(sid || "");
        if (m) return [BOOK_ORDER[m[1]] || 0, Number(m[2]), Number(m[3])];
        // 初中 j<章>-<节>：章号七上到九下连续编号，排在高中各册之前
        m = /^j(\d+)-(\d+)$/.exec(sid || "");
        return m ? [0, Number(m[1]), Number(m[2])] : null;
      }
      var meOrd = parseSecOrder(sec);
      var me = meOrd ? meOrd.slice(1) : [];
      function isLaterProblem(p) {
        // 1. 优先支持图谱受控字段 prereq_secs: ["e2-5-3", ...]
        if (meOrd && p.prereq_secs && Array.isArray(p.prereq_secs)) {
          var byGraph = p.prereq_secs.some(function (rs) {
            var o = parseSecOrder(rs);
            if (!o) return false;
            return o[0] > meOrd[0] || (o[0] === meOrd[0] && o[1] > meOrd[1]) || (o[0] === meOrd[0] && o[1] === meOrd[1] && o[2] > meOrd[2]);
          });
          if (byGraph) return true;
        }
        // 2. 兼容 note 里的「要用到 <节号>」
        var m = /要用到([^；;。]*)/.exec((p && p.note) || "");
        if (!m || me.length < 2) return false;
        var refs = m[1].match(/\d+\.\d+/g) || [];
        return refs.some(function (r) {
          var x = r.split(".").map(Number);
          return x[0] > me[0] || (x[0] === me[0] && x[1] > me[1]);
        });
      }
      var later = fold ? probs.filter(function (p) { return isLaterProblem(p); }) : [];
      var now = probs.filter(function (p) { return later.indexOf(p) < 0; });
      now.forEach(function (p, i) { host.appendChild(renderProblem(p, i)); });
      if (later.length) {
        var box = el("details", "more");
        box.appendChild(el("summary", "", "要用到后面章节的题（" + later.length + " 道）：学到那里再回来做"));
        later.forEach(function (p, i) { box.appendChild(renderProblem(p, now.length + i)); });
        host.appendChild(box);
      }
      math(host);
    }).catch(function () { host.innerHTML = '<p class="small">题目没加载出来，刷新一下试试。</p>'; });
  }

  /* ---------- 图上文字不随 SVG 缩得太小 + 移动端拖动点自动扩大触控靶区 ----------
     SVG 在手机上整体缩小，文字也跟着缩。这里按缩放比把 <text> 放大到屏幕上至少 MIN_PX，
     同时给半径偏小的可拖动圆点/滑块自动挂上透明大触控圆（屏幕半径 ≥ 22px），页面不用改代码。 */
  var MIN_PX = 14, MIN_HIT_PX = 22, SVG_NS = "http://www.w3.org/2000/svg", fitQueued = false;
  if (typeof SVGElement !== "undefined" && SVGElement.prototype && SVGElement.prototype.addEventListener) {
    var origSvgAdd = SVGElement.prototype.addEventListener;
    SVGElement.prototype.addEventListener = function (type, fn, opts) {
      if ((type === "pointerdown" || type === "mousedown" || type === "touchstart") &&
          (this.tagName === "circle" || this.tagName === "rect")) {
        try { this.setAttribute("data-peiyu-drag", "1"); } catch (e) { /* ignore */ }
      }
      return origSvgAdd.call(this, type, fn, opts);
    };
  }
  function bindHitForward(hit, target) {
    ["pointerdown", "mousedown", "touchstart", "click"].forEach(function (evType) {
      hit.addEventListener(evType, function (ev) {
        if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        ev.preventDefault();
        var clone;
        try {
          if (typeof PointerEvent !== "undefined" && evType.indexOf("pointer") === 0) {
            clone = new PointerEvent(evType, {
              bubbles: true, cancelable: true, clientX: ev.clientX, clientY: ev.clientY,
              pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: ev.isPrimary, button: ev.button, buttons: ev.buttons
            });
          } else {
            clone = new MouseEvent(evType, {
              bubbles: true, cancelable: true, clientX: ev.clientX, clientY: ev.clientY, button: ev.button, buttons: ev.buttons
            });
          }
          target.dispatchEvent(clone);
        } catch (e) { /* ignore */ }
      });
    });
  }
  function fitTouchTargets(svg, k) {
    var minR = Math.max(MIN_HIT_PX, Math.ceil(MIN_HIT_PX / k));
    var sel = 'circle[role="slider"], circle[tabindex], circle.handle, circle[data-peiyu-drag], circle[style*="cursor"], rect[role="slider"], rect[tabindex], rect[data-peiyu-drag], rect[style*="cursor"]';
    [].forEach.call(svg.querySelectorAll(sel), function (h) {
      if (!h.parentNode || (h.classList && (h.classList.contains("hit") || h.classList.contains("peiyu-hit")))) return;
      if (h.parentNode.tagName === "g" && h.parentNode.querySelector("circle.hit, circle[r='22'], circle[r='24']")) return;
      var matrix = h.getScreenCTM && h.getScreenCTM();
      var hitScale = matrix ? Math.hypot(matrix.a, matrix.b) : k;
      var minR = Math.max(MIN_HIT_PX, Math.ceil(MIN_HIT_PX / Math.max(0.01, hitScale)));
      var hit = h._peiyuHit;
      if (h.tagName === "circle") {
        var r0 = parseFloat(h.getAttribute("r")) || 0;
        if (r0 <= 0 || r0 >= 20) return;
        if (!hit || hit.parentNode !== h.parentNode) {
          hit = document.createElementNS(SVG_NS, "circle");
          hit.setAttribute("class", "peiyu-hit");
          hit.setAttribute("fill", "transparent");
          hit.setAttribute("stroke", "none");
          bindHitForward(hit, h);
          h.parentNode.insertBefore(hit, h.nextSibling);
          h._peiyuHit = hit;
        }
        hit.setAttribute("cx", h.getAttribute("cx") || "0");
        hit.setAttribute("cy", h.getAttribute("cy") || "0");
        hit.setAttribute("r", String(minR));
        if (h.getAttribute("transform")) hit.setAttribute("transform", h.getAttribute("transform"));
        hit.style.cursor = h.style.cursor || "grab";
      } else if (h.tagName === "rect") {
        var w0 = parseFloat(h.getAttribute("width")) || 0, h0 = parseFloat(h.getAttribute("height")) || 0;
        if (w0 <= 0 || h0 <= 0 || (w0 >= 36 && h0 >= 36)) return;
        if (!hit || hit.parentNode !== h.parentNode) {
          hit = document.createElementNS(SVG_NS, "rect");
          hit.setAttribute("class", "peiyu-hit");
          hit.setAttribute("fill", "transparent");
          hit.setAttribute("stroke", "none");
          bindHitForward(hit, h);
          h.parentNode.insertBefore(hit, h.nextSibling);
          h._peiyuHit = hit;
        }
        var x0 = parseFloat(h.getAttribute("x")) || 0, y0 = parseFloat(h.getAttribute("y")) || 0;
        var nw = Math.max(w0, minR * 2), nh = Math.max(h0, minR * 2);
        hit.setAttribute("x", String(x0 - (nw - w0) / 2));
        hit.setAttribute("y", String(y0 - (nh - h0) / 2));
        hit.setAttribute("width", String(nw));
        hit.setAttribute("height", String(nh));
        if (h.getAttribute("transform")) hit.setAttribute("transform", h.getAttribute("transform"));
        hit.style.cursor = h.style.cursor || "grab";
      }
    });
  }
  function fitFigText() {
    fitQueued = false;
    [].forEach.call(document.querySelectorAll(".step svg[viewBox]"), function (svg) {
      var vb = svg.viewBox.baseVal, w = svg.getBoundingClientRect().width;
      if (!vb || !vb.width || !w) return;
      if (window.PeiyuFigureLayout) PeiyuFigureLayout.prepare(svg);
      var k = w / vb.width;
      [].forEach.call(svg.querySelectorAll("text"), function (t) {
        var fs0 = parseFloat(t.getAttribute("data-fs0"));
        if (!fs0) {
          fs0 = parseFloat(getComputedStyle(t).fontSize) || 15;
          t.setAttribute("data-fs0", fs0);
          t._peiyuOriginalFontSize = t.style.fontSize;
        }
        // Nested camera/group transforms also scale text; round upward to keep the floor.
        var matrix = t.getScreenCTM();
        var textScale = matrix ? Math.min(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d)) : k;
        var want = Math.max(fs0, MIN_PX / Math.max(0.01, textScale));
        t.style.fontSize = want > fs0 ? Math.ceil(want * 1000) / 1000 + "px" : (t._peiyuOriginalFontSize || "");
      });
      fitTouchTargets(svg, k);
      if (window.PeiyuFigureLayout) PeiyuFigureLayout.fit(svg);
    });
  }
  // 太宽的段落（多半是长行内公式）只在自己里面横向滚动，不撑宽整页。只处理真的超宽的那几块。
  function fitWide() {
    // 两列选项里有放不下的长公式：这道题改成一列
    [].forEach.call(document.querySelectorAll(".step.on .opts.cols"), function (box) {
      var tight = [].some.call(box.children, function (o) { return o.scrollWidth > o.clientWidth + 1; });
      if (tight) box.classList.remove("cols");
    });
    [].forEach.call(document.querySelectorAll(".step.on p, .step.on li, .step.on .key, .step.on .warn, .step.on td, .step.on .opt, .step.on .stem, .step.on .result, .step.on .result > div, .step.on .ctrl"), function (el) {
      if (el.closest("svg")) return;
      if (el.scrollWidth > el.clientWidth + 1) el.classList.add("wide-x");
    });
  }
  function queueFit() {
    // 用 setTimeout 而不是 requestAnimationFrame：页面在后台标签里时 rAF 不跑，量不到
    if (!fitQueued) { fitQueued = true; setTimeout(function () { fitFigText(); fitWide(); }, 30); }
  }
  function setupFigText() {
    window.addEventListener("resize", queueFit);
    document.addEventListener("click", queueFit);  // 切步骤后图才有宽度
    if (window.MutationObserver) {
      [].forEach.call(document.querySelectorAll(".step svg[viewBox]"), function (svg) {
        new MutationObserver(function (ms) {
          var realAdd = ms.some(function (m) {
            return [].some.call(m.addedNodes, function (n) {
              return n.nodeType === 1 && !n.hasAttribute("data-figure-layout") && !n.hasAttribute("data-figure-camera") && !n.hasAttribute("data-figure-camera-part") && !n.hasAttribute("data-figure-label") && (!n.classList || !n.classList.contains("peiyu-hit"));
            });
          });
          if (realAdd) queueFit();
        }).observe(svg, { childList: true, subtree: true });
      });
    }
    queueFit();
  }

  /* ---------- 公共接口给页面里的互动图用 ---------- */
  window.Peiyu = { log: log, math: math, readLog: readLog, store: store, LOG_KEY: LOG_KEY, NAME_KEY: NAME_KEY, stage: STAGE, examName: EXAM_NAME, layout: queueFit, layoutNow: function () { fitFigText(); fitWide(); } };

  document.addEventListener("DOMContentLoaded", function () {
    setupSteps(); setupPredict(); setupPractice(); setupFigText();
    math(document.body);
    log("open", {});
    var fl = document.createElement("script");
    fl.src = "../assets/figure-layout.js?v=vs-a4abfb4cced8";
    document.head.appendChild(fl);
    if (STAGE !== "junior") { // 方法 Wiki 只有高中卡片
      var ws = document.createElement("script");
      ws.src = "../assets/wiki.js?v=vs-d563426d743f";
      document.head.appendChild(ws);
    }
    var hs = document.createElement("script"); // 交互层（PY-53）
    hs.src = "../assets/hci.js?v=vs-f3cb689fbc60";
    document.head.appendChild(hs);
  });
})();
