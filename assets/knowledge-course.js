/* 课内知识卡：复用高中知识库详情，保持课程步骤、旧卡与旧学情独立。 */
(function () {
  'use strict';
  var slot = document.querySelector('[data-knowledge-course]');
  var api = window.PeiyuKnowledge;
  if (!slot || !api) return;
  var junior = api.stage === "junior";
  var section = document.body.getAttribute('data-sec');
  if (!section) return;
  var data, activeButton;
  var fullUrl = new URL('../knowledge.html', location.href);
  fullUrl.searchParams.set('from', section);
  fullUrl.searchParams.set('section', section);

  function el(tag, text, className) {
    var element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function statusName(id) {
    return { passed: '本次自测通过', review: '建议再练', viewed: '已查看', untouched: '未自测' }[api.getStatus(id)] || '未自测';
  }
  function updateStatuses() {
    slot.querySelectorAll('[data-knowledge-status]').forEach(function (label) {
      label.textContent = statusName(label.getAttribute('data-knowledge-status'));
    });
  }
  function focusDetail(detail) {
    var heading = detail.querySelector('[data-kc-content] h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    detail.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  function openPoint(id, focus) {
    if (!data.points.some(function (p) { return p.id === id; }) || !api.availableInSection(id, section)) return;
    var detail = slot.querySelector('[data-knowledge-course-detail]');
    detail.hidden = false;
    var content = detail.querySelector('[data-kc-content]');
    api.renderPoint(content, id, {
      onNavigate: function (next) { openPoint(next, true); },
      contextSection: section
    });
    slot.querySelectorAll('[data-knowledge-open]').forEach(function (button) {
      var selected = button.getAttribute('data-knowledge-open') === id;
      button.setAttribute('aria-expanded', String(selected));
      button.classList.toggle('kc-selected', selected);
    });
    var link = detail.querySelector('[data-knowledge-full]');
    link.href = api.pointHref(id, section);
    updateStatuses();
    if (focus) focusDetail(detail);
  }
  function render() {
    slot.replaceChildren();
    slot.className = 'kc-panel';
    var head = el('div', '', 'kc-heading');
    var title = el('h2', '本节知识速查'); title.id = 'kc-title';
    slot.setAttribute('aria-labelledby', title.id);
    head.appendChild(title);
    var directory = el('a', junior ? '打开初中知识库' : '打开高中知识库', 'kc-all'); directory.href = fullUrl.href;
    head.appendChild(directory); slot.appendChild(head);
    slot.appendChild(el('p', '需要时打开一张卡，查条件、做自测，再接着学。', 'kc-hint'));
    var coreList = el('div', '', 'kc-points');
    var extended = el('details', '', 'kc-extensions');
    var summary = el('summary', '选学与拓展（可选）'); extended.appendChild(summary);
    var extraList = el('div', '', 'kc-points'); extended.appendChild(extraList);
    var points = data.points.filter(function (p) { return junior ? api.availableInSection(p.id, section) : p.first_section === section; });
    points.forEach(function (point) {
      var button = el('button', '', 'kc-point'); button.type = 'button';
      button.setAttribute('data-knowledge-open', point.id);
      button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'kc-detail');
      button.appendChild(el('span', point.title + (junior && point.course_scope === 'optional' ? ' · 选学' : '')));
      var state = el('small', statusName(point.id)); state.setAttribute('data-knowledge-status', point.id);
      button.appendChild(state);
      button.addEventListener('click', function () { activeButton = button; openPoint(point.id, true); });
      (/^(required|selective_required)$/.test(point.course_scope) ? coreList : extraList).appendChild(button);
    });
    slot.appendChild(coreList);
    if (extraList.children.length) slot.appendChild(extended);
    var detail = el('div', '', 'kc-detail'); detail.hidden = true; detail.id = 'kc-detail';
    detail.setAttribute('data-knowledge-course-detail', '');
    var actions = el('div', '', 'kc-actions');
    var close = el('button', '收起知识卡，继续本节', 'kc-close'); close.type = 'button';
    close.setAttribute('data-knowledge-close', '');
    close.addEventListener('click', function () {
      detail.hidden = true;
      slot.querySelectorAll('[data-knowledge-open]').forEach(function (button) {
        button.setAttribute('aria-expanded', 'false'); button.classList.remove('kc-selected');
      });
      if (activeButton) activeButton.focus(); else directory.focus();
    });
    var full = el('a', '在知识库中查看', 'kc-all'); full.setAttribute('data-knowledge-full', '');
    actions.append(close, full); detail.appendChild(actions);
    var content = el('div'); content.setAttribute('data-kc-content', ''); detail.appendChild(content);
    slot.appendChild(detail);
    var initial = new URLSearchParams(location.search).get('knowledge');
    if (initial && data.points.some(function (p) { return p.id === initial; }) && api.availableInSection(initial, section)) {
      var step = document.querySelectorAll('nav.steps button')[1];
      if (step) step.click();
      var initialButton = slot.querySelector('[data-knowledge-open="' + initial + '"]');
      if (junior && initialButton && extended.contains(initialButton)) extended.open = true;
      openPoint(initial, false);
      // 原课程会异步加载 HCI 并重组正文；待布局稳定后再定位明确指定的知识卡。
      var reveal = function () {
        requestAnimationFrame(function () {
          var current = detail.querySelector('[data-knowledge-id]');
          if (!detail.hidden && current && current.getAttribute('data-knowledge-id') === initial) focusDetail(detail);
        });
      };
      if (document.readyState === 'complete') reveal();
      else window.addEventListener('load', reveal, { once: true });
    }
  }
  function load() {
    api.load().then(function (value) {
      data = value;
      if (data.unavailable || !data.points.length || !data.sections.some(function (s) { return s.id === section; })) { slot.hidden = true; return; }
      slot.hidden = false;
      render();
    }).catch(function () {
      slot.replaceChildren(); slot.className = 'kc-panel';
      slot.appendChild(el('p', '知识卡暂时没能加载，课程内容仍可继续学习。'));
      var retry = el('button', '重新加载知识卡', 'btn'); retry.type = 'button';
      retry.setAttribute('data-knowledge-retry', ''); retry.addEventListener('click', load);
      var link = el('a', junior ? '打开初中知识库' : '打开高中知识库', 'kc-all'); link.href = fullUrl.href;
      slot.append(retry, link);
    });
  }
  window.addEventListener('peiyu-knowledge-change', updateStatuses);
  load();
})();
