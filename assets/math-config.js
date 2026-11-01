/* PY-401 shared math configuration. Generated copies: tools/sync_math_config.py. */
var PY_MATH = (function () {
  var macros = {
  "\\i": "\\mathrm{i}", "\\e": "\\mathrm{e}",
  "\\R": "\\mathbf{R}", "\\N": "\\mathbf{N}", "\\Z": "\\mathbf{Z}", "\\Q": "\\mathbf{Q}", "\\C": "\\mathbf{C}",
  "\\bs": "\\boldsymbol{#1}", "\\symbfup": "\\mathbf{#1}", "\\symbfit": "\\boldsymbol{#1}",
  "\\overarc": "\\overgroup{#1}", "\\arc": "\\overgroup{#1}", "\\parallelogram": "\\square",
  "\\upi": "\\pi", "\\uppi": "\\pi", "\\mathbbm": "\\mathbb{#1}",
  "\\Box": "\\square", "\\normalfont": "", "\\upshape": "", "\\degree": "^\\circ", "\\celsius": "^\\circ\\mathrm{C}",
  "\\parallel": "\\mathrel{\\htmlClass{py-par}{\\char\"2225}}",
  "\\nparallel": "\\mathrel{\\htmlClass{py-par}{\\char\"2226}}",
};
  macros["∥"] = macros["\\parallel"];
  macros["∦"] = macros["\\nparallel"];
  function trust(context) {
    return context.command === "\\htmlClass" && context.class === "py-par";
  }
  return { macros: macros, trust: trust };
})();
if (typeof module !== "undefined" && module.exports) module.exports = PY_MATH;
/* Display-only glyph styling, including labels inserted after initial math render.
 * Never touches attributes, input values, stored answers or KaTeX's MathML. */
(function () {
  if (typeof document === "undefined" || !document.createTreeWalker || !document.addEventListener || window.pyParallelDisplayReady) return;
  window.pyParallelDisplayReady = true;
  var doc = document;
  function styleParallel(root) {
    if (!root) return;
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [], node;
    while ((node = walker.nextNode())) {
      if (/[∥∦]/.test(node.data) && node.parentElement &&
          !node.parentElement.closest('script,style,textarea,input,pre,code,math,.katex,.py-par,[contenteditable]')) nodes.push(node);
    }
    nodes.forEach(function (text) {
      var fragment = doc.createDocumentFragment(), styled = false;
      text.data.split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$]*?\$)/g).forEach(function (segment, index) {
        if (index % 2) { fragment.appendChild(doc.createTextNode(segment)); return; }
        segment.split(/([∥∦])/).forEach(function (part) {
        if (!/[∥∦]/.test(part)) { fragment.appendChild(doc.createTextNode(part)); return; }
        var svg = text.parentElement.namespaceURI === 'http://www.w3.org/2000/svg';
        var span = svg ? doc.createElementNS('http://www.w3.org/2000/svg', 'tspan') : doc.createElement('span');
        styled = true; span.setAttribute('class', 'py-par'); span.textContent = part; fragment.appendChild(span);
      });
      });
      if (styled) text.replaceWith(fragment);
    });
  }
  function start() {
    styleParallel(doc.body);
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      queueMicrotask(function () { pending = false; styleParallel(doc.body); });
    });
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("pagehide", function () { observer.disconnect(); });
    window.addEventListener("pageshow", function () {
      observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})();

/* PY-450: resolve beside the shared entrypoint, including junior asset mounts. */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.currentScript || !document.currentScript.src || !document.createElement || !document.head) return;
  var body = document.body;
  if (/\/primary\//.test(window.location.pathname) || (body && body.dataset && (body.dataset.stage === 'primary' || body.dataset.wikiStage === 'primary' || /^p[1-6][ab]-/.test(body.dataset.sec || '')))) return;
  if (/\/lab3d\//.test(window.location.pathname) || window.pyRadicalRequested) return;
  window.pyRadicalRequested = true;
  var script = document.createElement('script');
  script.src = new URL('radical.js?v=py450-2', document.currentScript.src).href;
  script.async = true;
  document.head.appendChild(script);
})();
