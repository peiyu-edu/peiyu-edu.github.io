/* 初中章末测验（PY-270 / PY-258 E6）。整套提交后：先逐题记作答，再逐题记看过反馈，最后显示解析。
   成绩只按首次独立作答计；重做由账本自动记为 retry，单独显示。只读写本机账本，不发任何请求。 */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) {
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

  function identity(quiz, item) {
    return JSON.stringify(["exam", quiz.sectionId, item.id, item.contentVersion]);
  }
  function event(quiz, item, extra) {
    return Object.assign({ source: SOURCE, questionType: "exam", sectionId: quiz.sectionId,
      questionId: item.id, contentVersion: item.contentVersion }, extra);
  }

  // choices: { itemId: optionId }。所有作答写完后才写反馈，所以每题本次作答不会因为本次反馈变成 retry。
  function submit(store, quiz, choices, at) {
    var t = typeof at === "number" ? at : Date.now();
    var answered = quiz.items.filter(function (item) { return typeof choices[item.id] === "string"; });
    answered.forEach(function (item) {
      store.record(event(quiz, item, { kind: "answer", time: t, choice: choices[item.id], correct: choices[item.id] === item.correct }));
    });
    answered.forEach(function (item) { store.record(event(quiz, item, { kind: "feedback", time: t + 1 })); });
    return summary(store, quiz, choices);
  }

  // 错题本入口：带章参数，初中错题本打开时按该章筛选（PY-336）。
  function wrongbookHref(quiz) {
    return "../learning.html" + (quiz && quiz.chapterId ? "?chapter=" + encodeURIComponent(quiz.chapterId) : "") + "#learning-wrongbook";
  }
  // 账本是否真的写进了本机：写入抛异常或退到 memoryOnly 都算没保存（PY-339）。
  function isSaved(store) {
    try { var snap = store && store.snapshot(); return !!snap && !(snap.storage && snap.storage.memoryOnly); } catch (_) { return false; }
  }

  // 首次成绩：每题第一次作答都是 independent 才算有效；任何一题首次不是独立完成，就不报首次成绩。
  function summary(store, quiz, choices) {
    var firsts = [], session = { correct: 0, wrong: [] }, retryCorrect = 0, attempted = 0;
    quiz.items.forEach(function (item) {
      var answers = store ? store.answers(identity(quiz, item)) || [] : [];
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

  function mount(doc, host, store, quiz, root) {
    var choices = {}, submitted = false;
    var status = el(doc, "p", "cq-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");

    function render() {
      host.textContent = "";
      var before = summary(store, quiz, null);
      if (!store) host.appendChild(el(doc, "p", "cq-warn", "这台设备不能保存学习记录，本次作答不会计入错题本。"));
      if (before.redo && !submitted) {
        host.appendChild(el(doc, "p", "cq-note", before.first === null ? "你做过这套测验。这次是重做，成绩单独显示。" :
          "你做过这套测验，首次成绩 " + before.first + "/" + before.total + "。这次是重做，不改首次成绩。"));
      }
      var form = el(doc, "form", "cq-form"); form.noValidate = true;
      quiz.items.forEach(function (item) {
        var box = el(doc, "fieldset", "cq-item"); box.id = "q-" + item.number;
        var legend = el(doc, "legend", "cq-prompt");
        legend.appendChild(el(doc, "span", "cq-no", item.number + "."));
        legend.appendChild(el(doc, "span", "cq-tier", item.tierLabel));
        legend.appendChild(el(doc, "span", "cq-text", item.prompt));
        box.appendChild(legend);
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
        if (submitted) {
          var chosen = item.options.find(function (o) { return o.id === choices[item.id]; });
          var result = el(doc, "div", "cq-result");
          if (!chosen) result.appendChild(el(doc, "p", "cq-verdict", "这题没有作答。"));
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
        }
        form.appendChild(box);
      });
      var actions = el(doc, "div", "cq-actions"), count = el(doc, "p", "cq-count");
      function updateCount() {
        var n = quiz.items.filter(function (item) { return choices[item.id]; }).length;
        count.textContent = submitted ? "" : "已作答 " + n + "/" + quiz.items.length + " 题";
      }
      if (!submitted) {
        var button = el(doc, "button", "cq-submit", "提交整套");
        button.type = "submit";
        actions.appendChild(count); actions.appendChild(button);
      } else {
        var again = el(doc, "button", "cq-again", "重做一遍");
        again.type = "button";
        again.addEventListener("click", function () { choices = {}; submitted = false; render(); host.scrollIntoView(); });
        actions.appendChild(again);
      }
      form.appendChild(actions);
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var missing = quiz.items.filter(function (item) { return !choices[item.id]; });
        if (missing.length) { status.textContent = "还有 " + missing.length + " 题没有作答（第 " + missing.map(function (i) { return i.number; }).join("、") + " 题）。整套做完再提交。"; return; }
        var after, saved = false;
        try { after = store ? submit(store, quiz, choices, Date.now()) : summary(null, quiz, choices); saved = isSaved(store); } catch (_) { after = summary(null, quiz, choices); }
        submitted = true;
        render();
        report(after, saved);
      });
      host.appendChild(form);
      host.appendChild(status);
      updateCount();
      math(root, host);
    }

    function report(result, saved) {
      var box = el(doc, "section", "cq-report"); box.setAttribute("aria-label", "本次结果");
      box.appendChild(el(doc, "h2", null, "本次结果"));
      box.appendChild(el(doc, "p", "cq-score", "本次答对 " + result.session.correct + "/" + result.total + " 题"));
      if (result.first !== null) box.appendChild(el(doc, "p", "cq-first", "首次成绩 " + result.first + "/" + result.total));
      if (result.retryCorrect) box.appendChild(el(doc, "p", "cq-retry", "重做后改对 " + result.retryCorrect + " 题"));
      if (result.session.wrong.length) {
        var p = el(doc, "p", "cq-wrong");
        p.appendChild(doc.createTextNode("本次答错的 " + result.session.wrong.length + " 题" + (saved ? "已加入错题本。" : "没能保存，换个浏览器或清理空间后再试。")));
        if (saved) {
          var link = el(doc, "a", null, "去错题本看看 →");
          link.href = wrongbookHref(quiz);
          p.appendChild(doc.createTextNode(" ")); p.appendChild(link);
        }
        box.appendChild(p);
      }
      host.insertBefore(box, host.firstChild);
      status.textContent = "已提交。答错的题下面有提示和解析。";
      box.setAttribute("tabindex", "-1");
      if (box.focus) box.focus();
    }

    render();
  }

  return { identity: identity, wrongbookHref: wrongbookHref, isSaved: isSaved, submit: submit, summary: summary, mount: mount };
});
