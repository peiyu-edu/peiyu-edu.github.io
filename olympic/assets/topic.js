/* 专题起点：从本专题已开放的 F2 题中随机选一道。 */
(function () {
  "use strict";
  document.querySelectorAll("[data-topic-random]").forEach(function (link) {
    function choose() {
      var ids = link.dataset.topicRandom.split(" ");
      link.href = "../p/" + ids[Math.floor(Math.random() * ids.length)] + ".html";
    }
    choose();
    link.addEventListener("click", choose);
    link.addEventListener("auxclick", choose);
  });
})();
