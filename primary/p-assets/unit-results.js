/* Existing unit challenge: per-round first answers, same course ledger and stable IDs. */
(function () {
  'use strict';
  var unit = document.body.dataset.sec;
  if (!/^p[1-6][ab]-u\d+$/.test(unit || '')) return;
  var step = document.querySelector('section.step[data-title="单元闯关"]');
  if (!step) return;
  var boxes = Array.from(step.querySelectorAll('.predict[data-id],.q[data-id]'));
  if (!boxes.length) return;
  var store = window.PeiyuLearningState, data = window.PeiyuLearningData;
  var active = boxes.slice(), answers = new Map(), ids = new Map(), started = null, report = null;
  var progress = el('p', 'pur-progress', '闯关做完后，在这里看得分、用时和下一步。全对后去下一单元。');
  progress.dataset.purProgress = ''; progress.setAttribute('role', 'status'); step.appendChild(progress);
  var hint = el('p', 'pur-retry-note'); hint.hidden = true; step.appendChild(hint);
  function el(tag, cls, text) {
    var n = document.createElement(tag); n.className = cls || '';
    if (text) n.textContent = text; return n;
  }
  function button(text, fn) { var b = el('button', 'pur-button', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function now() { return Date.now(); }
  function start() { if (step.classList.contains('on') && started === null) started = now(); }
  document.addEventListener('step', start); window.addEventListener('load', start);
  // An answer always starts the clock, including keyboard-only and resumed visits.
  step.addEventListener('pointerdown', function () { if (started === null) started = now(); }, true);
  step.addEventListener('keydown', function () { if (started === null) started = now(); }, true);
  function take(box, detail) {
    if (!active.includes(box) || answers.has(box) || typeof detail.correct !== 'boolean') return;
    if (started === null) started = now();
    answers.set(box, detail.correct);
    if (detail.contentVersion) ids.set(box, detail);
    progress.textContent = '本轮已作答 ' + answers.size + '/' + active.length + ' 题；按每题本轮第一次作答计分。';
    if (answers.size === active.length) finish();
  }
  step.addEventListener('course:answer', function (e) {
    take(e.target.closest('.card[data-id]'), e.detail || {});
  });
  ['predict:pick', 'fill:submit'].forEach(function (type) {
    step.addEventListener(type, function (e) {
      // Without a ledger/crypto the result still works; never claim it was saved.
      if (!store || !window.crypto || !window.crypto.subtle) take(e.target.closest('.card[data-id]'), e.detail || {});
    });
  });
  function saved() {
    try { return !!store && !store.snapshot().storage.memoryOnly && active.every(function (b) { return ids.has(b) && store.question(ids.get(b)).hasAnswered; }); }
    catch (_) { return false; }
  }
  function prompt(box) {
    var source = box.querySelector('.kid,.q-title') || box.querySelector('p') || box.querySelector('.q-tag') || box;
    var copy = source.cloneNode(true);
    copy.querySelectorAll('rt,button,.ans,.fb,.reveal').forEach(function (n) { n.remove(); });
    var title = box.querySelector('.q-tag');
    return (title && title !== source ? title.textContent.trim() + '：' : '') + copy.textContent.replace(/\s+/g, ' ').trim();
  }
  function restoreWrongbook(wrong, notice) {
    if (!saved()) { notice.textContent = '本次记录没能保存，暂时不能加入错题本。可以先看解析、再练。'; return; }
    try {
      var key = 'peiyu.ps.wrongbook.v1', raw = JSON.parse(localStorage.getItem(key) || 'null');
      var hidden = raw && raw.version === 1 && raw.hidden && typeof raw.hidden === 'object' && !Array.isArray(raw.hidden) ? raw.hidden : {};
      wrong.forEach(function (box) { delete hidden[store.question(ids.get(box)).identity]; });
      localStorage.setItem(key, JSON.stringify({ version: 1, hidden: hidden }));
      notice.textContent = '已加入错题本。答题记录已自动保存；此前收起的这些题也已恢复。';
    } catch (_) { notice.textContent = '作答已记录，但错题本设置没能保存，请稍后再试。'; }
  }
  function retry(wrong) {
    if (report) { report.remove(); report = null; }
    active = wrong.slice(); answers = new Map(); started = now();
    boxes.forEach(function (b) {
      b.classList.toggle('pur-skip', !active.includes(b));
      if (active.includes(b)) b.dispatchEvent(new CustomEvent('primary:retry'));
    });
    hint.hidden = false; hint.textContent = '只练上轮错题，共 ' + active.length + ' 题。订正不会覆盖首次成绩。';
    progress.textContent = '本轮已作答 0/' + active.length + ' 题';
    var first = active[0]; first.tabIndex = -1; first.focus(); first.scrollIntoView({ block: 'start' });
  }
  function firstScore() {
    if (!store || ids.size !== boxes.length) return null;
    try {
      var firsts = boxes.map(function (b) { return store.question(ids.get(b)).firstAnswer; });
      if (firsts.some(function (a) { return !a || a.attemptKind !== 'independent'; })) return null;
      return Math.round(firsts.filter(function (a) { return a.correct; }).length / boxes.length * 100);
    } catch (_) { return null; }
  }
  function finish() {
    if (report) return;
    var wrong = active.filter(function (b) { return !answers.get(b); });
    var correct = active.length - wrong.length, seconds = Math.max(0, Math.floor((now() - started) / 1000));
    report = el('section', 'pur-report'); report.setAttribute('aria-label', '单元闯关结果'); report.tabIndex = -1;
    report.appendChild(el('h2', '', wrong.length ? '这一轮做完了，看看哪几题要再练' : '这一轮全对了！'));
    report.appendChild(el('p', 'pur-score', '本轮得分：' + Math.round(correct / active.length * 100) + ' 分（答对 ' + correct + '/' + active.length + ' 题）'));
    report.appendChild(el('p', 'pur-time', '用时 ' + Math.floor(seconds / 60) + ' 分 ' + seconds % 60 + ' 秒'));
    report.appendChild(el('p', '', '按每题本轮第一次作答计分。全对后去下一单元；看解析后的订正单独记。'));
    var first = firstScore();
    report.appendChild(el('p', 'pur-first', first === null ? '首次独立成绩暂不可用（首次作答前看过提示，或记录未能保存）。' : '首次成绩：' + first + ' 分（整单元 ' + boxes.length + ' 题，不被订正覆盖）'));
    var notice = el('p', 'pur-notice', saved() ? '成绩已按原题记入这台设备的“我的学习”。' : '本次记录没能保存，刷新后可能丢失。');
    notice.setAttribute('role', 'status'); report.appendChild(notice);
    if (wrong.length) {
      report.appendChild(el('h3', '', '本轮错题 · ' + wrong.length + ' 题'));
      wrong.forEach(function (box) {
        var item = el('details', 'pur-wrong-item');
        item.appendChild(el('summary', '', prompt(box) + ' · 看解析'));
        var explanation = el('div', 'pur-explanation');
        var answer = box.getAttribute('data-answer'), option = Array.from(box.querySelectorAll('.opt')).find(function (o) { return o.dataset.v === answer; });
        var answerLine = el('p', '', '答案：');
        if (!option && /^\d+\/\d+$/.test(answer) && window.PeiyuP) answerLine.insertAdjacentHTML('beforeend', window.PeiyuP.fracHTML.apply(null, answer.split('/')));
        else answerLine.appendChild(document.createTextNode(option ? option.textContent.trim() : answer));
        explanation.appendChild(answerLine);
        var reveal = box.querySelector('.reveal');
        if (reveal) {
          var copy = reveal.cloneNode(true); copy.className = ''; copy.hidden = false;
          copy.querySelectorAll('[id],button').forEach(function (n) { if (n.tagName === 'BUTTON') n.remove(); else n.removeAttribute('id'); });
          copy.removeAttribute('id'); copy.removeAttribute('style'); explanation.appendChild(copy);
        } else explanation.appendChild(el('p', '', box.dataset.ok || box.dataset.hint || '再对照题图，检查每一步。'));
        item.appendChild(explanation); report.appendChild(item);
      });
      report.appendChild(button('一键加入错题本', function () { restoreWrongbook(wrong, notice); }));
      report.appendChild(button('再练这几题', function () { retry(wrong); }));
    } else {
      var link = el('a', 'pur-next', '正在找下一单元…'); report.appendChild(link);
      if (data) data.load().then(function (content) {
        var units = content.index.units || [], at = units.findIndex(function (u) { return u.id === unit; });
        var next = at < 0 ? null : units.slice(at + 1).find(function (u) { return u.ready && /-u\d+$/.test(u.id); });
        link.textContent = next ? '去下一单元' : '已完成目前上线的单元，回课程目录';
        link.href = data.url(next ? 'lessons/' + next.id + '.html#step1' : 'courses.html');
      }).catch(function () { link.textContent = '回课程目录'; link.href = '../courses.html'; });
    }
    var all = button('查看全部题目', function () { boxes.forEach(function (b) { b.classList.remove('pur-skip'); }); hint.hidden = true; });
    report.appendChild(all);
    var book = el('a', 'pur-wrongbook', '打开错题本'); book.href = '../learning.html?unit=' + encodeURIComponent(unit) + '#learning-wrongbook'; report.appendChild(book);
    step.appendChild(report); report.focus(); report.scrollIntoView({ block: 'start' });
  }
})();
