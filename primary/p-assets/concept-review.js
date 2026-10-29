/* 小学“我的学习”：概念卡题目按知识点、按课时两种复习入口（PY-223）。排期来自学习账本，不推断掌握度。 */
(function () {
  "use strict";
  const body = document.body;
  if (!body || body.dataset.learningPage !== "record" || body.dataset.stage !== "primary") return;
  const P = window.PeiyuConceptPractice, S = window.PeiyuLearningState;
  const host = document.getElementById("learning-app");
  if (!P || !S || !host) return;
  const section = document.createElement("section");
  section.className = "lr-section ps-concept-review";
  section.id = "ps-concept-review";
  section.setAttribute("aria-labelledby", "ps-cr-title");
  let concepts = null, lessons = [], view = "point";
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const day = time => new Date(time).toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
  function itemHTML(item) {
    const last = item.lastCorrect === true ? "上次答对" : item.lastCorrect === false ? "上次答错" : "";
    return '<li><a href="' + esc(item.href) + '">' + esc(item.label) + '</a> · ' + (last ? last + ' · ' : '')
      + (item.due ? '现在可以复习' : '计划 ' + esc(day(item.dueAt)) + ' 复习') + '</li>';
  }
  function pointHTML(point) {
    return '<li><h4>' + esc(point.title) + '</h4><p class="lp-note">' + esc(point.unit.book + ' · ' + point.unit.title) + '</p><ul>'
      + point.items.map(itemHTML).join("")
      + (point.freshReview ? '<li><a href="' + esc(point.freshReview.href) + '">还有一道' + esc(point.freshReview.label) + '没做</a></li>' : '') + '</ul></li>';
  }
  function lessonHTML(lesson) {
    return '<li><h4><a href="lessons/' + esc(lesson.id) + '.html">' + esc(lesson.title) + '</a></h4><p class="lp-note">'
      + (lesson.due ? '现在可以复习 ' + lesson.due + ' 题' : '计划 ' + esc(day(lesson.nextDue)) + ' 复习') + '</p><ul>'
      + lesson.points.map(p => '<li><a href="' + esc(p.items[0].href) + '">' + esc(p.title) + '</a>' + (p.due ? ' · 到期 ' + p.due + ' 题' : '') + '</li>').join("") + '</ul></li>';
  }
  function render() {
    if (!concepts) return;
    const plan = P.plan(S.snapshot(), concepts, lessons, Date.now());
    const tabs = [["point", "按知识点"], ["lesson", "按课时"]].map(([key, name]) =>
      '<button type="button" class="lp-button secondary" data-ps-view="' + key + '" aria-pressed="' + (view === key) + '">' + name + '</button>').join("");
    section.innerHTML = '<h2 id="ps-cr-title">概念卡复习</h2>'
      + '<p class="lp-note">按每道题的作答排期：第一次自己作答答对，7 天后再看；答错、看过答案后再做或复习后再做，1 天后再看。这是复习提醒，不表示已经学会。</p>'
      + (plan.points.length
        ? '<p>现在可以复习 ' + plan.due + ' 题。</p><div class="lp-actions" role="group" aria-label="复习入口">' + tabs + '</div>'
          + (view === "point" ? '<ul class="lr-review-list">' + plan.points.map(pointHTML).join("") + '</ul>' : '<ul class="lr-review-list">' + plan.lessons.map(lessonHTML).join("") + '</ul>')
        : '<p>还没有概念卡的作答记录。到<a href="knowledge.html">知识库</a>做一道自测题，这里会按知识点和课时列出复习。</p>');
  }
  // learning-record.js redraws #learning-app as a whole; keep this section right under its introduction.
  function place() {
    if (host.contains(section)) return;
    const intro = host.querySelector(".lp-page > .lp-intro");
    if (intro) intro.after(section); else host.prepend(section);
  }
  section.addEventListener("click", e => {
    const button = e.target.closest("[data-ps-view]");
    if (!button) return;
    view = button.dataset.psView; render();
    const again = section.querySelector('[data-ps-view="' + view + '"]');
    if (again) again.focus();
  });
  new MutationObserver(place).observe(host, { childList: true });
  S.subscribe(render);
  window.addEventListener("storage", e => { if (e.key === S.key || e.key === null) render(); });
  const json = path => fetch(path, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(path); return r.json(); });
  Promise.all([json("data/knowledge/primary-concepts.json"), json("data/learning-index.json").catch(() => ({ lessons: [] }))]).then(([c, index]) => {
    concepts = c; lessons = (index.lessons || []).concat(index.units || []); render(); place();
  }).catch(() => {
    section.innerHTML = '<h2 id="ps-cr-title">概念卡复习</h2><p role="status">概念卡暂时打不开，请刷新重试。已有记录不受影响。</p>'; place();
  });
})();
