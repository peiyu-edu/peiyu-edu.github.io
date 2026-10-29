/* 总览页的本机学习记录标记：只说明「有记录」，不代表掌握（PY-319、PY-324）。深浅色由 learning-shell 负责。 */
(function () {
  'use strict';
  var store = window.PeiyuLearningState, progress = document.getElementById('route-progress');
  if (!store || !progress) return;
  function render(snapshot) {
    var seen = Object.create(null);
    Object.keys(snapshot.sections || {}).forEach(function (id) { seen[id] = true; });
    (snapshot.events || []).forEach(function (event) { if (event && event.sectionId) seen[event.sectionId] = true; });
    var rows = document.querySelectorAll('[data-section][data-ready="true"]'), count = 0;
    rows.forEach(function (row) {
      var visited = !!seen[row.getAttribute('data-section')];
      row.querySelector('.visited').hidden = !visited;
      if (visited) count++;
    });
    progress.textContent = '已有学习记录 ' + count + ' / ' + rows.length + ' · 记录保存在这台设备上，有记录不代表已经掌握。';
  }
  render(store.snapshot());
  store.subscribe(render);
})();
