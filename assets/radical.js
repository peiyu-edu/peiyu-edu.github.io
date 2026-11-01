/* Display-only bare radicals. Light DOM remains the source of truth. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else if (!root.PeiyuRadical) { root.PeiyuRadical = api; api.start(root); }
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  var SQRT = '\u221a';
  var letters = /^(?:[a-zA-Z\u03b1-\u03c9\u0394][\u00b2\u00b3\u2080-\u2089]*)+/;
  var syntax = /(?:\u53ef\u5199|\u8f93\u5165|\u652f\u6301)[^\u3002\n]*\u221a|\u221a\s*\/\s*sqrt|\u221a\s*\u952e|\u6253\s*[\u300c\u201c"']\u221a/;
  function parse(source) {
    var out = [], i = 0;
    while ((i = source.indexOf(SQRT, i)) !== -1) {
      var start = i++, end = i, body;
      if (source[i] === '(') {
        var depth = 0;
        for (; end < source.length; end++) {
          if (source[end] === '(') depth++;
          if (source[end] === ')' && --depth === 0) { end++; break; }
        }
        // Validate the group as math before handing it to TeX (never accept commands).
        if (depth || end === i + 2) continue;
        body = source.slice(i + 1, end - 1);
        if (!/^[\w\s.()+\-*/^=\u00b2\u00b3\u2080-\u2089\u00d7\u00f7\u00b7\u2212\u221a\u03b1-\u03c9\u0394]+$/.test(body)) continue;
      } else {
        var match = /^(?:\d+(?:\.\d+)?|\.\d+)/.exec(source.slice(i)) || letters.exec(source.slice(i));
        if (!match) continue;
        body = match[0]; end = i + body.length;
      }
      out.push({ start: start, end: end, body: body }); i = end;
    }
    return out;
  }
  function isSyntax(source) {
    if (!parse(source).length) return syntax.test(source);
    // A nearby mention of the calculator's root key must not suppress real math.
    return /(?:\u53ef\u5199|\u652f\u6301|\u8f93\u5165(?:\u8bed\u6cd5|\u683c\u5f0f|\u5199\u6cd5))[^\u3002\n]*\u221a/.test(source);
  }
  var greek = { '\u0394': 'Delta', '\u03c0': 'pi' };
  var names = ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','kappa','lambda','mu','nu','xi','omicron','pi','rho','varsigma','sigma','tau','upsilon','phi','chi','psi','omega'];
  names.forEach(function (name, i) { greek[String.fromCharCode(0x3b1 + i)] = name; });
  function tex(source) {
    var tokens = parse(source), last = 0, out = '';
    tokens.forEach(function (t) { out += plain(source.slice(last, t.start)) + '\\sqrt{' + tex(t.body) + '}'; last = t.end; });
    return out + plain(source.slice(last));
  }
  function plain(source) {
    return source.replace(/[\u2080-\u2089]+/g, function (digits) {
      return '_{' + Array.from(digits, function (c) { return c.charCodeAt(0) - 0x2080; }).join('') + '}';
    }).replace(/[\u00b2\u00b3\u00d7\u00f7\u00b7\u2212\u03b1-\u03c9\u0394]/g, function (c) {
      return ({ '\u00b2':'^{2}', '\u00b3':'^{3}', '\u00d7':'\\times ', '\u00f7':'\\div ', '\u00b7':'\\cdot ', '\u2212':'-' })[c] || '\\' + greek[c] + ' ';
    });
  }
  function start(win) {
    var doc = win.document;
    if (!doc || !doc.createTreeWalker) return;
    var skip = 'script,style,input,textarea,option,math,.katex,[data-no-radical],[contenteditable],.py-radical';
    var svgNS = 'http://www.w3.org/2000/svg', sources = new Map(), candidates = new Set(), observer, css, running = false;
    var attempts = new Map(), failed = new WeakMap(), resetAttempts = false;
    var stats = { batches: 0, lastMs: 0, maxMs: 0, maxMutationMs: 0, html: 0, svg: 0, fallbacks: 0 };
    function sheet() {
      var link = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).find(function (l) { return /katex.*\.css/.test(l.href); });
      if (!link || !link.sheet) return null;
      try {
        return Array.from(link.sheet.cssRules, function (r) { return r.cssText; }).join('\n').replace(/url\(([^)]+)\)/g, function (_, url) {
          return 'url("' + new URL(url.trim().replace(/^["']|["']$/g, ''), link.href).href + '")';
        });
      } catch (_) { return null; }
    }
    function content(source) {
      var fragment = doc.createDocumentFragment(), last = 0;
      parse(source).forEach(function (t) {
        fragment.appendChild(doc.createTextNode(source.slice(last, t.start)));
        var span = doc.createElement('span');
        win.katex.render('\\sqrt{' + tex(t.body) + '}', span, { throwOnError: true, strict: 'ignore', output: 'html' });
        fragment.appendChild(span); last = t.end;
      });
      fragment.appendChild(doc.createTextNode(source.slice(last)));
      return fragment;
    }
    function shadow(host, fragment, accessible) {
      var r = host.attachShadow({ mode: 'open' }), style = doc.createElement('style');
      style.textContent = css + '\n:host{font-size:max(14px,1em)}.katex{font-size:1em}@media print{.katex{color:#000!important}}';
      r.appendChild(style);
      var visual = doc.createElement('span'); visual.setAttribute('aria-hidden', 'true'); visual.appendChild(fragment); r.appendChild(visual);
      // Unassigned light DOM is not painted; the original string names the host once.
      if (accessible) { host.setAttribute('role', 'img'); host.setAttribute('aria-label', host.textContent); }
      return visual;
    }
    function eligible(node) {
      return node.parentElement && !node.parentElement.closest(skip) && node.data.includes(SQRT) && !isSyntax(node.data) && parse(node.data).length;
    }
    function html(node) {
      // Preserve delimiter math for the page's auto-render pass.
      var segments = node.data.split(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$]*?\$)/g);
      var fragment = doc.createDocumentFragment(), changed = false;
      segments.forEach(function (s, index) {
        if (index % 2 || !parse(s).length) { fragment.appendChild(doc.createTextNode(s)); return; }
        var rendered = content(s), host = doc.createElement('span'); host.className = 'py-radical';
        host.appendChild(doc.createTextNode(s)); shadow(host, rendered, true); fragment.appendChild(host); changed = true;
      });
      if (changed) { node.replaceWith(fragment); stats.html++; }
    }
    function restore(text) {
      var state = sources.get(text);
      if (state) { state.overlays.forEach(function (f) { f.remove(); }); sources.delete(text); }
      text.removeAttribute('data-radical-source');
    }
    function svg(text) {
      candidates.delete(text);
      if (!text.isConnected || text.closest('[data-no-radical]') || isSyntax(text.textContent) || !parse(text.textContent).length) { restore(text); return; }
      candidates.add(text);
      if (failed.get(text) === text.textContent) return;
      var walker = doc.createTreeWalker(text, win.NodeFilter.SHOW_TEXT), node, runs = [], offset = 0;
      var pendingSpace = null, seen = new Set();
      var preserve = /^(pre|pre-wrap|break-spaces)$/.test(win.getComputedStyle(text).whiteSpace) || text.getAttribute('xml:space') === 'preserve';
      function append(value, parent) {
        var run = runs[runs.length - 1];
        if (!run || run.parent !== parent) {
          var reset = !seen.has(parent) && parent !== text && (parent.hasAttribute('x') || parent.hasAttribute('y'));
          seen.add(parent);
          run = { value:'', parent:parent, cs:win.getComputedStyle(parent), offset:offset, reset:reset };
          runs.push(run);
        }
        run.value += value; offset += value.length;
      }
      while ((node = walker.nextNode())) {
        // Character positions include text-anchor, tspan x/y and inherited dx/dy.
        for (var i = 0; i < node.data.length; i++) {
          var ch = node.data[i];
          if (!preserve && /\s/.test(ch)) { if (!pendingSpace) pendingSpace = node.parentElement; continue; }
          if (pendingSpace && offset) append(' ', pendingSpace);
          pendingSpace = null; append(ch, node.parentElement);
        }
      }
      if (!offset || !text.getNumberOfChars || !text.getNumberOfChars()) { restore(text); return; }
      var signature = JSON.stringify([text.textContent, text.getAttribute('transform'), runs.map(function (run) {
        var a = text.getStartPositionOfChar(run.offset), b = text.getEndPositionOfChar(run.offset + run.value.length - 1);
        return [run.value, run.reset, !!run.parent.closest('math,.katex,[data-no-radical]'), a.x, a.y, b.x, b.y, ['fontSize','fontFamily','fontWeight','fontStyle','fill','textAnchor','visibility','display','opacity'].map(function (key) { return run.cs[key]; })];
      }), text.getScreenCTM() && Array.from(['a','b','c','d','e','f'], function (key) { return text.getScreenCTM()[key]; })]);
      var previous = sources.get(text);
      if (previous && previous.signature === signature && previous.overlays.every(function (fo) { return fo.isConnected && fo.parentNode === text.parentNode; })) return;
      if (!resetAttempts) {
        resetAttempts = true;
        win.setTimeout(function () { attempts.clear(); resetAttempts = false; }, 16);
      }
      var count = (attempts.get(text) || 0) + 1; attempts.set(text, count);
      restore(text);
      if (count > 8) {
        failed.set(text, text.textContent); stats.fallbacks++;
        win.console.warn('PeiyuRadical: repeated SVG layout; keeping original text', text);
        return;
      }
      var overlays = [], chunks = [], chunk;
      try {
        // A root may cross a purely structural tspan boundary ("sqrt glyph" + "3").
        runs = runs.reduce(function (merged, run) {
          var previous = merged[merged.length - 1];
          if (previous && !run.reset &&
              !previous.parent.closest('math,.katex,[data-no-radical]') && !run.parent.closest('math,.katex,[data-no-radical]') &&
              ['fontSize','fontFamily','fontWeight','fontStyle','fill','textAnchor'].every(function (key) { return previous.cs[key] === run.cs[key]; })) {
            var end = text.getEndPositionOfChar(run.offset - 1), start = text.getStartPositionOfChar(run.offset);
            if (Math.abs(end.x - start.x) < 0.25 && Math.abs(end.y - start.y) < 0.25) {
              previous.value += run.value; return merged;
            }
          }
          merged.push(run); return merged;
        }, []);
        runs.forEach(function (run) {
          var pos = text.getStartPositionOfChar(run.offset), end = text.getEndPositionOfChar(Math.min(offset, run.offset + run.value.length) - 1);
          var fo = doc.createElementNS(svgNS, 'foreignObject'), host = doc.createElement('span');
          fo.setAttribute('class', 'py-radical'); fo.setAttribute('aria-hidden', 'true');
          fo.setAttribute('data-figure-layout', 'radical');
          fo.style.cssText = 'overflow:visible;pointer-events:none';
          fo.style.visibility = run.cs.visibility; fo.style.display = run.cs.display; fo.style.opacity = run.cs.opacity;
          fo.setAttribute('width', '1'); fo.setAttribute('height', '1');
          if (text.hasAttribute('transform')) fo.setAttribute('transform', text.getAttribute('transform'));
          host.style.cssText = 'position:relative;display:inline-block;white-space:pre;line-height:1.3;font-size:' + Math.max(14, parseFloat(run.cs.fontSize) || 14) + 'px';
          host.style.fontFamily = run.cs.fontFamily; host.style.fontWeight = run.cs.fontWeight; host.style.fontStyle = run.cs.fontStyle;
          host.style.color = run.cs.fill;
          var rendered = run.parent.closest('math,.katex,[data-no-radical]') ? doc.createTextNode(run.value) : content(run.value);
          var visual = shadow(host, rendered, false), marker = doc.createElement('i');
          marker.style.cssText = 'display:inline-block;width:0;height:0'; visual.appendChild(marker);
          fo.appendChild(host); text.after(fo); overlays.push(fo);
          var bounds = host.getBoundingClientRect(), ctm = fo.getScreenCTM();
          if (!ctm || !bounds.width) throw new Error('Label not laid out');
          // Measure in local SVG units, including rotated/scaled ancestor transforms.
          var sx = Math.hypot(ctm.a, ctm.b), sy = Math.hypot(ctm.c, ctm.d);
          var width = host.offsetWidth, ascent = marker.offsetTop;
          if (!width) width = bounds.width / sx;
          var item = { fo:fo, pos:pos, delta:width - (end.x - pos.x) };
          if (!chunk || run.reset) { chunk = { items:[], delta:0, anchor:run.cs.textAnchor }; chunks.push(chunk); }
          item.shift = chunk.delta; chunk.items.push(item); chunk.delta += item.delta;
          fo.setAttribute('y', pos.y - ascent);
          fo.setAttribute('width', Math.ceil(width) + 2); fo.setAttribute('height', Math.ceil(host.offsetHeight || bounds.height / sy) + 2);
        });
        chunks.forEach(function (c) {
          var adjustment = c.anchor === 'middle' ? c.delta / 2 : c.anchor === 'end' ? c.delta : 0;
          c.items.forEach(function (item) { item.fo.setAttribute('x', item.pos.x + item.shift - adjustment); });
        });
        text.setAttribute('data-radical-source', ''); sources.set(text, { overlays: overlays, signature: signature }); stats.svg++;
      } catch (_) { overlays.forEach(function (f) { f.remove(); }); }
    }
    function scan(root, texts) {
      if (root.nodeType === 3) {
        if (!root.parentElement || root.parentElement.closest(skip)) return;
        var t = root.parentElement.closest('svg text');
        if (t && root.data.includes(SQRT)) texts.add(t);
        else if (eligible(root)) try { html(root); } catch (_) { /* Keep the original on TeX errors. */ }
        return;
      }
      if (root.nodeType !== 1 || root.closest(skip)) return;
      var owner = root.closest('svg text');
      if (owner) { texts.add(owner); return; }
      // Layout clones may replace a root label with a numbered marker.
      root.querySelectorAll('text[data-radical-source]').forEach(function (t) { texts.add(t); });
      var walker = doc.createTreeWalker(root, win.NodeFilter.SHOW_TEXT), nodes = [], n;
      while ((n = walker.nextNode())) if (n.data.includes(SQRT) && n.parentElement && !n.parentElement.closest(skip)) nodes.push(n);
      nodes.forEach(function (n) { scan(n, texts); });
    }
    function observe() { observer.observe(doc.documentElement, { subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['class','style','data-theme','x','y','dx','dy','transform','text-anchor','fill','font-size','font-weight','data-no-radical'] }); }
    function batch(records, all) {
      if (running) return;
      running = true; observer.disconnect(); var begin = win.performance.now(), texts = new Set();
      try {
        if (all) { scan(doc.body, texts); candidates.forEach(function (t) { texts.add(t); }); }
        else records.forEach(function (r) {
          var target = r.target.nodeType === 3 ? r.target.parentElement : r.target;
          if (!target || target.closest('.py-radical')) return;
          var owner = target.closest('svg text'); if (owner) texts.add(owner);
          if (r.type === 'childList') r.addedNodes.forEach(function (n) { scan(n, texts); });
          if (r.type === 'characterData') scan(r.target, texts);
          if (r.type === 'attributes') candidates.forEach(function (t) { if (target === t || target.contains(t)) texts.add(t); });
        });
        sources.forEach(function (state, t) { if (!t.isConnected) restore(t); });
        candidates.forEach(function (t) { if (!t.isConnected) candidates.delete(t); });
        texts.forEach(function (t) { try { svg(t); } catch (_) { restore(t); } });
      } finally {
        stats.batches++; stats.lastMs = win.performance.now() - begin; stats.maxMs = Math.max(stats.maxMs, stats.lastMs);
        if (!all) stats.maxMutationMs = Math.max(stats.maxMutationMs, stats.lastMs);
        running = false; observe();
      }
    }
    function boot() {
      if (!doc.body || !win.katex || observer) return;
      css = sheet(); if (!css) return;
      // Paint-only hiding keeps figure-layout's opacity/geometry decisions unchanged.
      var style = doc.createElement('style'); style.textContent = 'text[data-radical-source]{filter:opacity(0)!important}'; doc.head.appendChild(style);
      observer = new win.MutationObserver(function (records) { batch(records, false); });
      batch([], true);
      // Hidden steps and font loads need new geometry, without waiting for animation frames.
      doc.addEventListener('step', function () { batch([], true); });
      win.addEventListener('beforeprint', function () { batch([], true); });
      win.addEventListener('resize', function () { batch([], true); });
      var media = win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)');
      if (media && media.addEventListener) media.addEventListener('change', function () { batch([], true); });
      if (doc.fonts) { doc.fonts.ready.then(function () { batch([], true); }); doc.fonts.addEventListener('loadingdone', function () { batch([], true); }); }
      api.stats = stats; api.refresh = function () { batch([], true); };
    }
    doc.addEventListener('DOMContentLoaded', boot);
    doc.addEventListener('load', boot, true);
    boot();
  }
  var api = { parse: parse, tex: tex, isSyntax: isSyntax, start: start };
  return api;
});
