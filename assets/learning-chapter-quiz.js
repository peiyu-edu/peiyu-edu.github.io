/* 初中章末测验（PY-270 / PY-258 E6）。整套提交后：先逐题记作答，再逐题记看过反馈，最后显示解析。
   成绩只按首次独立作答计；重做由账本自动记为 retry，单独显示。只读写本机账本，不发任何请求。 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) {
    root.PeiyuQuizGrading = { automatic: api.automatic };
    var start = function () {
      var host = root.document.getElementById("chapter-quiz"), data = root.document.getElementById("chapter-quiz-data");
      if (!host || !data) return;
      var quiz;
      try { quiz = JSON.parse(data.textContent); } catch (_) { host.textContent = "测验数据读取失败，请刷新页面。"; return; }
      api.mount(root.document, host, root.PeiyuLearningState || null, quiz, root);
    };
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var SOURCE = "chapter-quiz";

  // Exact rational arithmetic, never eval. Unsupported language/geometry answers stay self-checks.
  function numericText(raw) {
    if (typeof raw !== "string" || raw.length > 300) return "";
    var text = raw.normalize("NFKC").replace(/\s+/g, "").replace(/[−–]/g, "-").replace(/×/g, "*").replace(/[÷⁄]/g, "/");
    var units = "平方千米|平方分米|平方厘米|平方毫米|立方分米|立方厘米|立方毫米|平方米|立方米|千米|分米|厘米|毫米|千克|毫升|分钟|小时|秒钟|公顷|厘米²|厘米³|cm2|cm3|m2|m3|km|cm|dm|mm|kg|mL|°|个|只|张|本|辆|支|元|角|分|米|克|吨|升|时|秒|天|人|袋|盒|根|块|棵|朵|条|把|套|杯|瓶|圈|度|m|g|L";
    text = text.replace(new RegExp("(?:\\((?:" + units + ")\\)|(?:" + units + "))$"), "");
    return text;
  }
  function numericValue(raw) {
    var text = numericText(raw);
    if (!text || text.length > 160 || /[^0-9.+*/()=%-]/.test(text)) return null;
    function gcd(a, b) { a = a < 0n ? -a : a; while (b) { var c = a % b; a = b; b = c; } return a; }
    function fraction(n, d) { if (!d) throw Error("zero denominator"); if (d < 0n) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
    function equal(a, b) { return a[0] === b[0] && a[1] === b[1]; }
    function parse(expression) {
      var pos = 0;
      function atom() {
        var value;
        if (expression[pos] === "+" || expression[pos] === "-") {
          var sign = expression[pos++] === "-" ? -1n : 1n; value = atom(); return [sign * value[0], value[1]];
        }
        if (expression[pos] === "(") { pos++; value = sum(); if (expression[pos++] !== ")") throw Error("parenthesis"); }
        else {
          var match = /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)/.exec(expression.slice(pos));
          if (!match || match[0].replace(".", "").length > 18) throw Error("number");
          pos += match[0].length;
          var parts = match[0].split("."), decimals = parts[1] || "";
          value = fraction(BigInt((parts[0] || "0") + decimals), 10n ** BigInt(decimals.length));
        }
        if (expression[pos] === "%") { pos++; value = fraction(value[0], value[1] * 100n); }
        return value;
      }
      function product() {
        var a = atom();
        while (expression[pos] === "*" || expression[pos] === "/") {
          var op = expression[pos++], b = atom();
          a = op === "*" ? fraction(a[0] * b[0], a[1] * b[1]) : fraction(a[0] * b[1], a[1] * b[0]);
        }
        return a;
      }
      function sum() {
        var a = product();
        while (expression[pos] === "+" || expression[pos] === "-") {
          var op = expression[pos++], b = product();
          a = fraction(a[0] * b[1] + (op === "+" ? 1n : -1n) * b[0] * a[1], a[1] * b[1]);
        }
        return a;
      }
      var value = sum(); if (pos !== expression.length) throw Error("trailing input"); return value;
    }
    try {
      var sides = text.split("="), result = parse(sides[0]);
      if (!sides.every(function (side) { return equal(parse(side), result); })) return null;
      return result[0].toString() + "/" + result[1].toString();
    } catch (_) { return null; }
  }
  // A value is insufficient when the task asks for a construction or a particular representation.
  function gradingMode(item) {
    var prompt = item.prompt || "";
    if (/(?:添.*括号|(?:列|写|检验|验算).*算式)/.test(prompt)) return "self";
    if (numericValue(item.answer) === null) return "self";
    if (/(?:原来.*分数|原分数)/.test(prompt)) return "original-fraction";
    if (/最简/.test(prompt)) return "simplest-fraction";
    if (/保留.*位小数/.test(prompt)) return /^[+-]?\d+\.\d+$/.test(numericText(item.answer)) ? "decimal-places" : "self";
    if (/(?:用|化成|写成).*小数/.test(prompt)) return "decimal";
    if (/(?:用|化成|写成).*分数/.test(prompt)) return "fraction";
    return "value";
  }
  function automatic(item) { return item.type !== "fill" || gradingMode(item) !== "self"; }
  function grade(item, response) {
    if (item.type !== "fill") return response === item.correct;
    var mode = gradingMode(item), text = numericText(response), expectedText = numericText(item.answer);
    if (mode === "self") return false;
    // Equations supplied in a value-only blank cannot be unrelated tautologies such as 5=5.
    if (text.indexOf("=") >= 0 && text !== expectedText) return false;
    if (mode === "original-fraction" || mode === "simplest-fraction" || mode === "fraction") {
      var parts = /^([+-]?\d+)\/([1-9]\d*)$/.exec(text);
      if (!parts) return false;
      if (mode !== "fraction") {
        var expectedParts = /^([+-]?\d+)\/([1-9]\d*)$/.exec(expectedText);
        if (!expectedParts || BigInt(parts[1]) !== BigInt(expectedParts[1]) || BigInt(parts[2]) !== BigInt(expectedParts[2])) return false;
      }
    }
    if (mode === "decimal" || mode === "decimal-places") {
      if (!/^[+-]?\d+\.\d+$/.test(text)) return false;
      if (mode === "decimal-places" && text.split(".")[1].length !== expectedText.split(".")[1].length) return false;
    }
    return numericValue(response) === numericValue(item.answer);
  }

  function identity(quiz, item, store) {
    var version = store && store.resolveVersion ? store.resolveVersion(event(quiz, item, {})) : item.contentVersion;
    return JSON.stringify(["exam", quiz.sectionId, item.id, version]);
  }
  function event(quiz, item, extra) {
    return Object.assign({ source: SOURCE, questionType: "exam", sectionId: quiz.sectionId,
      questionId: item.id, contentVersion: item.contentVersion, contentVersions: item.contentVersions }, item.pointIds ? { pointIds: item.pointIds } : {}, extra);
  }

  // choices: { itemId: optionId }。所有作答写完后才写反馈，所以每题本次作答不会因为本次反馈变成 retry。
  function submissionSpec(quiz) {
    return { questionType: "exam", sectionId: quiz.sectionId, questionId: "$submission", contentVersion: quiz.contentVersion, contentVersions: quiz.contentVersions };
  }
  function isCorrect(item, choices, selfChecks) {
    return automatic(item) ? grade(item, choices[item.id]) : !!(selfChecks && selfChecks[item.id]);
  }
  function complete(quiz, choices, selfChecks) {
    return quiz.items.every(function (item) {
      return typeof choices[item.id] === "string" && choices[item.id].trim() &&
        (item.type === "fill" ? automatic(item) || typeof (selfChecks || {})[item.id] === "boolean" : item.options.some(function (o) { return o.id === choices[item.id]; }));
    });
  }
  function submit(store, quiz, choices, at, selfChecks) {
    var t = typeof at === "number" ? at : Date.now();
    if (quiz.stage === "primary" && !complete(quiz, choices, selfChecks)) throw new Error("Complete every answer and self-check before submitting");
    var answered = quiz.items.filter(function (item) { return typeof choices[item.id] === "string"; });
    answered.forEach(function (item) {
      store.record(event(quiz, item, { kind: "answer", time: t, choice: choices[item.id], correct: isCorrect(item, choices, selfChecks), selfCheck: !automatic(item) }));
    });
    answered.forEach(function (item) { store.record(event(quiz, item, { kind: "feedback", time: t + 1 })); });
    if (quiz.stage === "primary") {
      var current = summary(null, quiz, choices, selfChecks);
      store.record(Object.assign(submissionSpec(quiz), { kind: "quiz-submit", source: SOURCE, time: t + 2,
        score: { correct: current.session.correct, total: current.total, selfCorrect: current.selfCorrect, selfTotal: current.selfTotal } }));
    }
    return summary(store, quiz, choices, selfChecks);
  }

  // 错题本入口：带章参数，初中错题本打开时按该章筛选（PY-336）。
  function wrongbookHref(quiz) {
    return "../learning.html" + (quiz && quiz.unitId ? "?unit=" + encodeURIComponent(quiz.unitId) : quiz && quiz.chapterId ? "?chapter=" + encodeURIComponent(quiz.chapterId) : "") + "#learning-wrongbook";
  }
  // 账本是否真的写进了本机：写入抛异常或退到 memoryOnly 都算没保存（PY-339）。
  function isSaved(store) {
    try { var snap = store && store.snapshot(); return !!snap && !(snap.storage && snap.storage.memoryOnly); } catch (_) { return false; }
  }

  // 首次成绩：每题第一次作答都是 independent 才算有效；任何一题首次不是独立完成，就不报首次成绩。
  function summary(store, quiz, choices, selfChecks) {
    if (quiz.stage === "primary") {
      var questions = quiz.items.filter(automatic);
      var fills = quiz.items.filter(function (i) { return !automatic(i); });
      var submission = store && store.question(submissionSpec(quiz)).firstSubmission;
      var wrong = choices ? quiz.items.filter(function (i) { return !isCorrect(i, choices, selfChecks); }) : [];
      return { total: questions.length, attempted: submission ? quiz.items.length : 0,
        first: submission ? submission.score.correct : null, firstSelf: submission ? submission.score.selfCorrect : null,
        selfTotal: fills.length, selfCorrect: fills.filter(function (i) { return selfChecks && selfChecks[i.id] === true; }).length,
        session: { correct: choices ? questions.filter(function (i) { return isCorrect(i, choices); }).length : 0, wrong: wrong },
        retryCorrect: 0, redo: !!submission };
    }
    var firsts = [], session = { correct: 0, wrong: [] }, retryCorrect = 0, attempted = 0;
    quiz.items.forEach(function (item) {
      var answers = store ? store.answers(identity(quiz, item, store)) || [] : [];
      if (answers.length) attempted++;
      firsts.push(answers[0] || null);
      if (answers.length > 1 && answers[answers.length - 1].correct === true && answers[0].correct === false) retryCorrect++;
      if (choices && typeof choices[item.id] === "string") {
        if (choices[item.id] === item.correct) session.correct++; else session.wrong.push(item);
      }
    });
    var complete = firsts.every(function (a) { return a && a.attemptKind === "independent" && typeof a.correct === "boolean"; });
    return { total: quiz.items.length, attempted: attempted,
      first: complete ? firsts.filter(function (a) { return a.correct; }).length : null,
      session: session, retryCorrect: retryCorrect,
      redo: firsts.some(function (a) { return !!a; }) };
  }

  function el(doc, tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function math(root, node) {
    if (root && typeof root.renderMathInElement === "function") {
      try {
        root.renderMathInElement(node, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }], throwOnError: false });
      } catch (_) { /* 公式渲染失败时保留原文 */ }
    }
  }

  function primaryFractions(doc, host) {
    var walker = doc.createTreeWalker(host, 4), texts = [], node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest(".cq-text,.cq-opt-text,.cq-answer,.cq-feedback,.cq-reasoning") && !node.parentElement.closest("textarea,input,script,style,.cq-fr") && /\d\/\d/.test(node.nodeValue)) texts.push(node);
    }
    texts.forEach(function (text) {
      var value = text.nodeValue, pattern = /(?<![\d.])(-?\d+)\/(\d+)(?![\d.])/g, match, start = 0, fragment = doc.createDocumentFragment();
      while ((match = pattern.exec(value))) {
        fragment.appendChild(doc.createTextNode(value.slice(start, match.index)));
        var fraction = el(doc, "span", "cq-fr"); fraction.setAttribute("role", "math");
        fraction.setAttribute("aria-label", match[2] + "分之" + match[1]);
        fraction.appendChild(el(doc, "span", "cq-numerator", match[1]));
        fraction.appendChild(el(doc, "span", "cq-denominator", match[2]));
        fragment.appendChild(fraction); start = pattern.lastIndex;
      }
      fragment.appendChild(doc.createTextNode(value.slice(start))); text.parentNode.replaceChild(fragment, text);
    });
  }

  function mount(doc, host, store, quiz, root) {
    var choices = {}, selfChecks = {}, revealed = {}, submitted = false;
    var target = null, single = null, wholeDraft = null, lastResult = null, lastSaved = false;
    var status = el(doc, "p", "cq-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");

    function focusTarget() {
      var box = target && host.querySelector("#q-" + target.number);
      if (box) { box.focus(); if (box.scrollIntoView) box.scrollIntoView({ block: "center" }); }
    }
    function restoreWhole() {
      if (!wholeDraft) return;
      choices = wholeDraft.choices; selfChecks = wholeDraft.selfChecks; revealed = wholeDraft.revealed;
      submitted = wholeDraft.submitted; lastResult = wholeDraft.result; lastSaved = wholeDraft.saved;
      single = null; wholeDraft = null;
    }
    function readTarget() {
      var match = root && root.location && /^#q-([1-9][0-9]*)$/.exec(root.location.hash);
      target = quiz.stage === "primary" || !match ? null : quiz.items.find(function (item) { return String(item.number) === match[1]; }) || null;
    }
    function enterSingle() {
      wholeDraft = { choices: choices, selfChecks: selfChecks, revealed: revealed, submitted: submitted, result: lastResult, saved: lastSaved };
      single = target; choices = {}; selfChecks = {}; revealed = {}; submitted = false; lastResult = null;
      status.textContent = ""; render(); focusTarget();
    }

    function render() {
      host.textContent = "";
      var items = single ? [single] : quiz.items;
      var before = summary(store, quiz, null);
      if (!store) host.appendChild(el(doc, "p", "cq-warn", "这台设备不能保存学习记录，本次作答不会计入错题本。"));
      if (single) {
        host.appendChild(el(doc, "p", "cq-note", "只练第 " + single.number + " 题。本题结果单独显示，不是整套成绩。"));
        var back = el(doc, "button", "cq-target-back", "返回整套作答"); back.type = "button";
        back.addEventListener("click", function () { restoreWhole(); status.textContent = ""; render(); focusTarget(); });
        host.appendChild(back);
      }
      if (!single && before.redo && !submitted) {
        host.appendChild(el(doc, "p", "cq-note", quiz.stage !== "primary" && before.attempted < before.total ?
          "已有 " + before.attempted + " 题的作答记录。继续整套作答，已有记录的题按账本规则记作重练。" : before.first === null ? "你做过这套测验。这次是重做，成绩单独显示。" :
          "你做过这套测验，首次成绩 " + before.first + "/" + before.total + "。这次是重做，不改首次成绩。"));
      }
      var form = el(doc, "form", "cq-form"); form.noValidate = true;
      items.forEach(function (item) {
        var box = el(doc, "fieldset", "cq-item"); box.id = "q-" + item.number;
        if (item === target) { box.classList.add("cq-target"); box.setAttribute("tabindex", "-1"); }
        var legend = el(doc, "legend", "cq-prompt");
        legend.appendChild(el(doc, "span", "cq-no", item.number + "."));
        legend.appendChild(el(doc, "span", "cq-tier", item.tierLabel));
        legend.appendChild(el(doc, "span", "cq-text", item.prompt));
        if (item.type === "fill") legend.appendChild(el(doc, "span", "cq-mode", automatic(item) ? "（自动判分）" : "（看答案后自评）"));
        box.appendChild(legend);
        if (item === target && !single) {
          box.appendChild(el(doc, "p", "cq-target-note", "已定位第 " + item.number + " 题。可以只练这题，也可以继续整套作答。"));
          var practice = el(doc, "button", "cq-target-start", "只练这题"); practice.type = "button";
          practice.addEventListener("click", enterSingle); box.appendChild(practice);
        }
        if (quiz.stage === "primary" && item.figure) {
          // Authored SVGs are validated by primary_unit_tests.load_figures at build time.
          var picture = doc.createElement("template");
          picture.innerHTML = item.figure;
          box.appendChild(picture.content.cloneNode(true));
        }
        if (item.type === "fill") {
          var input = el(doc, "textarea", "cq-fill");
          input.setAttribute("aria-label", "第 " + item.number + " 题的答案");
          input.maxLength = 300; input.value = choices[item.id] || ""; input.disabled = !!revealed[item.id] || submitted;
          input.addEventListener("input", function () { choices[item.id] = input.value; updateCount(); });
          box.appendChild(input);
          if (!automatic(item) && !revealed[item.id] && !submitted) {
            var reveal = el(doc, "button", "cq-reveal", "查看答案与解析"); reveal.type = "button";
            reveal.addEventListener("click", function () {
              if (!(choices[item.id] || "").trim()) { status.textContent = "先写下第 " + item.number + " 题的答案，再看答案。"; input.focus(); return; }
              if (store) { try { store.record(event(quiz, item, { kind: "feedback", selfCheck: true })); } catch (_) { /* Final report checks persistence. */ } }
              revealed[item.id] = true; render();
              host.querySelector("#q-" + item.number + " .cq-self-option").focus();
            });
            box.appendChild(reveal);
          }
        }
        item.options.forEach(function (opt) {
          var label = el(doc, "label", "cq-opt"), input = el(doc, "input");
          input.type = "radio"; input.name = item.id; input.value = opt.id; input.disabled = submitted;
          input.checked = choices[item.id] === opt.id;
          input.addEventListener("change", function () { choices[item.id] = opt.id; updateCount(); });
          label.appendChild(input);
          label.appendChild(el(doc, "span", "cq-key", opt.id.toUpperCase() + "."));
          label.appendChild(el(doc, "span", "cq-opt-text", opt.text));
          if (submitted && choices[item.id] === opt.id) label.classList.add(opt.id === item.correct ? "is-right" : "is-wrong");
          if (submitted && opt.id === item.correct) label.classList.add("is-answer");
          box.appendChild(label);
        });
        if (submitted || !automatic(item) && revealed[item.id]) {
          var chosen = item.options.find(function (o) { return o.id === choices[item.id]; });
          var result = el(doc, "div", "cq-result");
          if (item.type === "fill" && automatic(item)) {
            result.appendChild(el(doc, "p", "cq-verdict", grade(item, choices[item.id]) ? "答对了。" : "这题答错了。"));
          } else if (item.type === "fill") {
            result.appendChild(el(doc, "p", "cq-verdict", "对照答案和解析，自己评一评。"));
          } else if (!chosen) result.appendChild(el(doc, "p", "cq-verdict", "这题没有作答。"));
          else if (chosen.id === item.correct) result.appendChild(el(doc, "p", "cq-verdict is-right", "答对了。"));
          else {
            result.appendChild(el(doc, "p", "cq-verdict is-wrong", "这题答错了。"));
            result.appendChild(el(doc, "p", "cq-feedback", chosen.feedback));
          }
          result.appendChild(el(doc, "p", "cq-answer", "答案：" + item.answer));
          var steps = el(doc, "ol", "cq-reasoning");
          item.reasoning.forEach(function (line) { steps.appendChild(el(doc, "li", null, line)); });
          result.appendChild(steps);
          box.appendChild(result);
          if (!automatic(item)) {
            var checks = el(doc, "div", "cq-self-check");
            [true, false].forEach(function (value) {
              var label = el(doc, "label", "cq-opt"), radio = el(doc, "input", "cq-self-option");
              radio.type = "radio"; radio.name = item.id + "-self"; radio.value = String(value);
              radio.checked = selfChecks[item.id] === value; radio.disabled = submitted;
              radio.addEventListener("change", function () { selfChecks[item.id] = value; updateCount(); });
              label.appendChild(radio); label.appendChild(doc.createTextNode(value ? "对" : "不对")); checks.appendChild(label);
            });
            box.appendChild(checks);
          }
        }
        form.appendChild(box);
      });
      var actions = el(doc, "div", "cq-actions"), count = el(doc, "p", "cq-count");
      function updateCount() {
        var n = items.filter(function (item) { return !automatic(item) ? typeof selfChecks[item.id] === "boolean" : (choices[item.id] || "").trim(); }).length;
        count.textContent = submitted ? "" : "已作答 " + n + "/" + items.length + " 题";
      }
      if (!submitted) {
        var button = el(doc, "button", "cq-submit", single ? "提交本题" : "提交整套");
        button.type = "submit";
        actions.appendChild(count); actions.appendChild(button);
      } else {
        var again = el(doc, "button", "cq-again", "重做一遍");
        again.type = "button";
        again.addEventListener("click", function () { choices = {}; selfChecks = {}; revealed = {}; submitted = false; lastResult = null; status.textContent = ""; render(); host.scrollIntoView(); });
        actions.appendChild(again);
      }
      form.appendChild(actions);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var missing = items.filter(function (item) { return !automatic(item) ? typeof selfChecks[item.id] !== "boolean" : !(choices[item.id] || "").trim(); });
        if (missing.length) { status.textContent = single ? "请先作答第 " + single.number + " 题，再提交本题。" : "还有 " + missing.length + " 题没有作答（第 " + missing.map(function (i) { return i.number; }).join("、") + " 题）。需要自评的题看答案并自评后，整套提交。"; return; }
        var after, saved = false;
        if (single) {
          after = { correct: isCorrect(single, choices, selfChecks) };
          // Keep the ledger's exposure rules: prior feedback is retry; an answer alone is repeat.
          try {
            if (store) {
              var time = Date.now();
              store.record(event(quiz, single, { kind: "answer", time: time, choice: choices[single.id], correct: after.correct, selfCheck: !automatic(single) }));
              store.record(event(quiz, single, { kind: "feedback", time: time + 1 }));
              saved = isSaved(store);
            }
          } catch (_) { saved = false; }
        } else {
          try { after = store ? submit(store, quiz, choices, Date.now(), selfChecks) : summary(null, quiz, choices, selfChecks); saved = isSaved(store); } catch (_) { after = summary(null, quiz, choices, selfChecks); }
        }
        lastResult = after; lastSaved = saved;
        submitted = true;
        render();
      });
      host.appendChild(form);
      host.appendChild(status);
      updateCount();
      if (quiz.stage === "primary") primaryFractions(doc, host);
      else math(root, host);
      if (submitted && lastResult) {
        if (single) {
          var result = el(doc, "p", "cq-target-result", "第 " + single.number + " 题" + (lastResult.correct ? "答对了。" : "答错了。") +
            (lastSaved ? "本题记录已保存。" : "本题记录没能保存，刷新后可能丢失。") + "这不是整套成绩。");
          result.setAttribute("role", "status"); result.setAttribute("tabindex", "-1"); host.insertBefore(result, host.firstChild); result.focus();
          status.textContent = "已提交本题，可在题目下查看解析。";
        } else report(lastResult, lastSaved);
      }
    }

    function report(result, saved) {
      var box = el(doc, "section", "cq-report"); box.setAttribute("aria-label", "本次结果");
      box.appendChild(el(doc, "h2", null, "本次结果"));
      box.appendChild(el(doc, "p", "cq-score", (quiz.stage === "primary" ? "本次自动判分答对 " : "本次答对 ") + result.session.correct + "/" + result.total + " 题"));
      if (result.first !== null) box.appendChild(el(doc, "p", "cq-first", "首次成绩 " + result.first + "/" + result.total));
      if (quiz.stage === "primary") {
        if (result.selfTotal) box.appendChild(el(doc, "p", "cq-self-score", "自评 " + result.selfCorrect + "/" + result.selfTotal));
        if (result.selfTotal && result.firstSelf !== null) box.appendChild(el(doc, "p", "cq-first-self", "首次自评 " + result.firstSelf + "/" + result.selfTotal));
        if (!saved) box.appendChild(el(doc, "p", "cq-warn", "本次记录没能保存，刷新后可能丢失。"));
      }
      if (result.retryCorrect) box.appendChild(el(doc, "p", "cq-retry", "重做后改对 " + result.retryCorrect + " 题"));
      if (result.session.wrong.length) {
        var p = el(doc, "p", "cq-wrong");
        p.appendChild(doc.createTextNode((quiz.stage === "primary" ? "本次答错或自评不对的 " : "本次答错的 ") + result.session.wrong.length + " 题" + (saved ? "已加入错题本。" : "没能保存，换个浏览器或清理空间后再试。")));
        if (saved) {
          var link = el(doc, "a", null, "去错题本看看 →");
          link.href = wrongbookHref(quiz);
          p.appendChild(doc.createTextNode(" ")); p.appendChild(link);
        }
        box.appendChild(p);
      }
      host.insertBefore(box, host.firstChild);
      status.textContent = "已提交。每道题下面都有答案和解析。";
      box.setAttribute("tabindex", "-1");
      if (box.focus) box.focus();
    }

    readTarget(); render(); focusTarget();
    if (quiz.stage !== "primary" && root && root.addEventListener) root.addEventListener("hashchange", function () {
      restoreWhole(); readTarget(); status.textContent = ""; render(); focusTarget();
    });
  }

  return { numericValue: numericValue, automatic: automatic, grade: grade, identity: identity, wrongbookHref: wrongbookHref, isSaved: isSaved, submit: submit, summary: summary, mount: mount };
});
