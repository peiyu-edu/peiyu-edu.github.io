/* Whole-paper exam: only q/ is requested before submission; the answer gate is here. */
(function () {
  'use strict';
  var core = window.PeiyuMockExamCore, dispose = function () {};
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function button(text, fn) {
    var node = el('button', 'btn ghost', text); node.type = 'button'; node.addEventListener('click', fn); return node;
  }
  function math(node) { if (window.PeiyuGaokaoSolutions) window.PeiyuGaokaoSolutions.math(node); }
  function duration(ms) { var s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function signature(paper, questions) { return JSON.stringify(paper) + questions.map(function (q) { return q.contentVersion; }).join('|'); }

  function mount(app, paper, index, stage) {
    dispose();
    var alive = true, session, questions, posts, clock, interval, busy = false;
    var ledger = window.PeiyuLearningState, key = 'peiyu.' + (stage === 'junior' ? 'jh' : 'hs') + '.mock-draft.v1';
    var storageOK = true, saveWarning = el('p', 'eb-note');
    saveWarning.setAttribute('role', 'status');
    function save() {
      try { localStorage.setItem(key, JSON.stringify(session)); } catch (_) { storageOK = false; }
      saveWarning.textContent = storageOK ? '草稿与报告只保存在这台设备；逐题成绩沿用学习账本，可在“我的学习”导出。' : '浏览器无法保存草稿。请保持此页打开；关闭后可能丢失本次模考。';
    }
    function get(path) {
      return fetch(new URL('data/' + path, location.href).href, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw Error('load'); return r.json();
      });
    }
    function readDraft() { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } }
    function beforeLeave(event) { if (session && !session.submittedAt) { core.account(session, Date.now()); save(); event.preventDefault(); event.returnValue = ''; } }
    function pagehide() { if (session && !session.submittedAt) core.account(session, Date.now()); if (session) save(); }
    dispose = function () {
      alive = false; clearInterval(interval);
      window.removeEventListener('beforeunload', beforeLeave); window.removeEventListener('pagehide', pagehide);
      document.removeEventListener('visibilitychange', tick);
    };
    function header(text) {
      app.replaceChildren(el('h2', null, paper.paper));
      var back = el('a', 'eb-back', '返回题库列表'); back.href = 'index.html'; app.appendChild(back);
      app.appendChild(el('p', 'eb-note', paper.minutes + ' 分钟 · 满分 ' + paper.maxScore + ' 分' + (paper.estimated ? '（含估分）' : '')));
      app.appendChild(el('p', 'eb-note', paper.scoreNote));
      if (text) app.appendChild(el('p', null, text));
      app.appendChild(saveWarning);
    }
    function newSession() {
      var now = Date.now();
      session = { version: 1, paperId: paper.id, signature: signature(paper, questions),
        attemptId: 'mock-' + now.toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        startedAt: now, deadline: now + paper.minutes * 60000, submittedAt: null,
        lastTick: now, current: 0, times: [], choices: {}, scores: {}, recorded: {} };
      save(); renderExam();
    }
    function validDraft(value) {
      return value && value.version === 1 && value.paperId === paper.id && value.signature === signature(paper, questions)
        && Number.isFinite(value.startedAt) && value.deadline === value.startedAt + paper.minutes * 60000
        && value.choices && value.times && value.scores && value.recorded
        && Number.isInteger(value.current) && value.current >= 0 && value.current < questions.length;
    }
    function intro() {
      header('按原卷题序在本页作答。解答过程写在纸上，交卷后对照答案与分步解析自评。交卷前不会加载答案文件。');
      app.appendChild(el('p', 'eb-note', paper.durationNote + '。倒计时按开考时间计算，刷新或离开页面不会暂停，到时自动交卷。'));
      app.appendChild(el('p', 'eb-note', paper.partialRule === 'new-per-option' ? '多选：全对得满分；漏选每个正确选项2分；错选或不选0分。' : '多选：全对得满分；只漏选得2分；错选或不选0分。'));
      app.appendChild(el('p', 'eb-note', '填空支持标准答案及数字、分数、根式的常见写法；复杂符号请按题目格式输入。解答题和开放答案自评，成绩仅供本次练习复盘。'));
      var draft = readDraft();
      if (validDraft(draft)) {
        app.appendChild(button(draft.submittedAt ? '查看上次报告 / 继续自评' : '继续本卷模考', function () {
          session = draft;
          if (session.submittedAt) loadAnswers(); else { renderExam(); tick(); }
        }));
      } else if (draft && draft.paperId === paper.id) app.appendChild(el('p', 'eb-note', '题库版本已更新，旧草稿不再参与本次计分，请重新开考。'));
      app.appendChild(button('开始整卷模考', function () {
        if (draft && !window.confirm('重新开考会替换这台设备上的模考草稿和报告，学习账本保留。继续吗？')) return;
        newSession();
      }));
    }
    function focusQuestion(i) {
      if (!session || session.submittedAt) return;
      core.account(session, Date.now()); session.current = i; save(); tick();
    }
    function renderExam() {
      header();
      var bar = el('div', 'me-clock');
      clock = el('span', null); clock.setAttribute('role', 'timer'); clock.setAttribute('aria-label', '剩余时间');
      bar.appendChild(clock);
      bar.appendChild(button('提前交卷', function () {
        if (window.confirm('确认交卷？交卷后不能修改作答，随后进入判分与自评。')) finish();
      }));
      app.appendChild(bar);
      var nav = el('nav', 'me-question-nav'); nav.setAttribute('aria-label', '题号导航');
      questions.forEach(function (item, i) {
        var jump = el('a', null, String(item.no)); jump.href = '#mock-q-' + item.no;
        jump.addEventListener('click', function () { focusQuestion(i); }); nav.appendChild(jump);
      }); app.appendChild(nav);
      questions.forEach(function (item, i) {
        var q = paper.questions[i], card = el('article', 'card eb-card gs-problem me-question');
        card.id = 'mock-q-' + item.no;
        card.appendChild(el('h3', null, '第' + item.no + '题 · ' + item.type + ' · ' + q.maxScore + '分' + (q.estimated ? '（估分）' : '')));
        card.appendChild(el('div', 'eb-stem eb-stem-text', item.stem));
        if (item.figure) {
          var figure = el('img', 'me-figure'); figure.src = item.figure.src; figure.alt = item.figure.alt; card.appendChild(figure);
        }
        var answer = el('fieldset', 'me-answer'), legend = el('legend', null, '第' + item.no + '题作答');
        answer.appendChild(legend);
        if (item.choices && item.choices.length) {
          item.choices.forEach(function (value, j) {
            var letter = 'ABCDE'[j], label = el('label', 'me-option'), input = el('input');
            input.type = item.type === '多选' ? 'checkbox' : 'radio'; input.name = item.id; input.value = letter;
            input.checked = String(session.choices[item.id] || '').indexOf(letter) >= 0;
            input.addEventListener('change', function () {
              if (session.submittedAt || core.remaining(session, Date.now()) === 0) { finish(); return; }
              session.choices[item.id] = Array.from(answer.querySelectorAll('input:checked')).map(function (x) { return x.value; }).join(''); save();
            });
            label.appendChild(input); label.appendChild(el('span', null, letter + ' ' + (item.choiceDescriptions ? item.choiceDescriptions[j] : value))); answer.appendChild(label);
          });
        } else {
          var input = el(item.type === '解答' ? 'textarea' : 'input', 'me-text');
          input.setAttribute('aria-label', '第' + item.no + '题答案'); input.autocomplete = 'off';
          if (item.type === '解答') input.placeholder = '在纸上写出过程，可在这里记下最后结论或“已在纸上作答”';
          input.value = session.choices[item.id] || '';
          input.addEventListener('input', function () {
            if (session.submittedAt || core.remaining(session, Date.now()) === 0) { finish(); return; }
            session.choices[item.id] = input.value.slice(0, 300); save();
          }); answer.appendChild(input);
        }
        card.addEventListener('focusin', function () { focusQuestion(i); });
        card.addEventListener('pointerdown', function () { focusQuestion(i); });
        card.appendChild(answer); app.appendChild(card);
      });
      math(app); clearInterval(interval); interval = setInterval(tick, 1000);
      window.addEventListener('beforeunload', beforeLeave); window.addEventListener('pagehide', pagehide);
      document.addEventListener('visibilitychange', tick); tick();
    }
    function tick() {
      if (!alive || !session || session.submittedAt) return;
      core.account(session, Date.now()); save();
      if (clock) clock.textContent = '剩余 ' + duration(core.remaining(session, Date.now()));
      if (!core.remaining(session, Date.now())) finish();
    }
    function finish() {
      if (!session.submittedAt) { core.submit(session, Date.now()); save(); }
      clearInterval(interval);
      loadAnswers();
    }
    function record(i, selfCheck) {
      var q = paper.questions[i], item = questions[i], value = session.scores[q.id];
      if (session.recorded[q.id] || value == null || !ledger) return;
      try {
        var result = ledger.record({ kind: 'answer', source: 'mock-exam', questionType: 'exam', sectionId: 'exam-bank', questionId: q.id,
          contentVersion: item.contentVersion, contentVersions: item.contentVersions,
          time: session.submittedAt + i, choice: session.choices[q.id] || '未作答',
          correct: value === q.maxScore, selfCheck: selfCheck, feedbackSeen: selfCheck,
          mockExam: { attemptId: session.attemptId, paperId: paper.id, score: value, maxScore: q.maxScore,
            elapsedMs: session.times[i] || 0, submittedAt: session.submittedAt } });
        session.recorded[q.id] = !!result;
      } catch (_) { storageOK = false; }
    }
    function loadAnswers() {
      if (!session.submittedAt || busy) return;
      busy = true; header('已交卷，正在读取答案。');
      Promise.all(questions.map(function (q) { return get('a/' + encodeURIComponent(q.id) + '.json').then(function (post) {
        if (post.id !== q.id) throw Error('answer mismatch'); return post;
      }); })).then(function (values) {
        if (!alive) return;
        posts = {}; values.forEach(function (post) { posts[post.id] = post; });
        var grades = core.grade(session, paper, posts);
        grades.forEach(function (score, i) {
          if (score !== null) { session.scores[questions[i].id] = score; record(i, false); }
        });
        save(); renderReport();
      }).catch(function () {
        if (!alive) return;
        header('已经交卷，作答已锁定。答案暂时未能完整加载，可以重试。');
        app.appendChild(button('重试加载答案', loadAnswers));
      }).finally(function () { busy = false; });
    }
    function summary(container) {
      container.replaceChildren();
      var total = 0, pending = 0, types = {}, points = {};
      paper.questions.forEach(function (q, i) {
        var value = session.scores[q.id], missing = value == null;
        if (missing) pending++; else total += value;
        if (!types[q.type]) types[q.type] = { score: 0, max: 0 };
        types[q.type].score += value || 0; types[q.type].max += q.maxScore;
        if (!missing && value < q.maxScore) {
          var post = posts[q.id], names = (questions[i].points || []).concat(post.methodPoints || []);
          Array.from(new Set(names.length ? names : ['未标注知识点'])).forEach(function (name) { points[name] = (points[name] || 0) + q.maxScore - value; });
        }
      });
      container.appendChild(el('h3', null, pending ? '已计 ' + total + ' 分 · 还有 ' + pending + ' 题待自评' : '总分 ' + total + ' / ' + paper.maxScore + (paper.estimated ? '（含估分）' : '')));
      container.appendChild(el('p', 'eb-note', '本次用时 ' + duration(session.submittedAt - session.startedAt) + '。逐题用时从进入该题累计到切换下一题，包含在该题停留和离页的时间。'));
      Object.keys(types).forEach(function (name) { container.appendChild(el('p', null, name + '：' + types[name].score + ' / ' + types[name].max)); });
      container.appendChild(el('h4', null, '按知识点失分' + (pending ? '（已计分题）' : '')));
      container.appendChild(el('p', 'eb-note', '一道题涉及多个知识点时分别列出该题失分，各项不可相加。'));
      Object.keys(points).sort(function (a, b) { return points[b] - points[a]; }).forEach(function (name) { container.appendChild(el('p', null, name + '：失 ' + points[name] + ' 分')); });
      if (!Object.keys(points).length) container.appendChild(el('p', null, '已计分题暂无失分。'));
      var link = el('a', 'btn ghost', '打开错题本'); link.href = '../record.html#lw-wrongbook'; container.appendChild(link);
    }
    function renderReport() {
      header('已交卷。客观题已自动计分；请逐题对照答案、分步解析，自评解答题与开放答案。自评满分只表示本次自查结果。');
      var totals = el('section', 'me-summary'); app.appendChild(totals); summary(totals);
      paper.questions.forEach(function (q, i) {
        var item = questions[i], post = posts[q.id], card = el('article', 'card eb-card gs-problem me-result');
        card.appendChild(el('h3', null, '第' + q.no + '题 · ' + q.type + ' · 用时 ' + duration(session.times[i] || 0)));
        var original = el('details', 'me-original'); original.appendChild(el('summary', null, '查看本题题面'));
        original.appendChild(el('div', 'eb-stem eb-stem-text', item.stem));
        if (item.figure) { var image = el('img', 'me-figure'); image.src = item.figure.src; image.alt = item.figure.alt; original.appendChild(image); }
        (item.choices || []).forEach(function (choice, j) { original.appendChild(el('p', null, 'ABCDE'[j] + ' ' + (item.choiceDescriptions ? item.choiceDescriptions[j] : choice))); });
        card.appendChild(original);
        card.appendChild(el('p', 'me-your-answer', '你的作答：' + (session.choices[q.id] || '未作答')));
        var mark = el('p', 'me-mark'); card.appendChild(mark);
        function updateMark() { mark.textContent = session.scores[q.id] == null ? '待自评 / ' + q.maxScore : '得分 ' + session.scores[q.id] + ' / ' + q.maxScore; }
        updateMark();
        if (core.score(q, post, session.choices[q.id], paper.partialRule) === null) {
          var label = el('label', 'me-self', '对照解析自评得分：'), select = el('select');
          select.setAttribute('aria-label', '第' + q.no + '题自评得分');
          select.appendChild(new Option('请选择', ''));
          for (var value = 0; value <= q.maxScore; value++) select.appendChild(new Option(value + ' 分', String(value)));
          select.value = session.scores[q.id] == null ? '' : String(session.scores[q.id]);
          select.disabled = !!session.recorded[q.id];
          label.appendChild(select); card.appendChild(label);
          var confirm = button('确认本题自评', function () {
            if (select.value === '') return;
            session.scores[q.id] = Number(select.value); record(i, true); save();
            select.disabled = !!session.recorded[q.id]; confirm.disabled = select.disabled; updateMark(); summary(totals);
          }); confirm.disabled = select.disabled; card.appendChild(confirm);
        }
        var solutions = window.PeiyuGaokaoSolutions;
        if (solutions && solutions.render) card.appendChild(solutions.render(post));
        else { card.appendChild(el('p', null, '答案：' + post.answer)); card.appendChild(el('p', 'eb-stem-text', post.solution)); }
        var lessons = Object.keys(index.sections || {}).filter(function (sid) { return index.sections[sid].ids.indexOf(q.id) >= 0; });
        lessons.forEach(function (sid) {
          var link = el('a', 'me-lesson', '回课页第5步：' + index.sections[sid].title);
          link.href = '../lessons/' + encodeURIComponent(sid) + '.html#step5'; card.appendChild(link);
        });
        app.appendChild(card);
      });
      math(app);
    }
    app.replaceChildren(el('p', null, '正在准备整卷题目…'));
    Promise.all(paper.questions.map(function (q) { return get('q/' + encodeURIComponent(q.id) + '.json').then(function (item) {
      if (item.id !== q.id) throw Error('question mismatch'); return item;
    }); })).then(function (items) { if (!alive) return; questions = items; intro(); }).catch(function () {
      if (alive) app.replaceChildren(el('p', null, '题目未能完整加载，尚未开考。请刷新重试。'));
    });
  }
  window.PeiyuMockExam = { mount: mount, unmount: function () { dispose(); } };
})();
