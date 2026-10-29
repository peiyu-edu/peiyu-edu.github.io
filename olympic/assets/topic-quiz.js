(function () {
  "use strict";
  document.querySelectorAll("[data-concept-quiz]").forEach(function (form) {
    var result = form.querySelector(".topic-quiz-result");
    var verdict = form.querySelector("[data-concept-verdict]");
    var feedback = Array.from(form.querySelectorAll("[data-concept-feedback]"));
    function clear() {
      result.hidden = true;
      result.removeAttribute("data-correct");
      verdict.textContent = "";
      feedback.forEach(function (node) { node.hidden = true; });
    }
    form.addEventListener("change", clear);
    form.addEventListener("reset", clear);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var chosen = form.querySelector('input[type="radio"]:checked');
      if (!chosen) return;
      clear();
      var node = feedback.find(function (item) { return item.dataset.conceptFeedback === chosen.value; });
      if (!node) return;
      var correct = chosen.value === form.dataset.correct;
      verdict.textContent = correct ? "判断正确。" : "再想一想。";
      result.dataset.correct = String(correct);
      node.hidden = false;
      result.hidden = false;
    });
  });
})();
