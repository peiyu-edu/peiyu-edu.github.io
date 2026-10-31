/* Statistical bars, kind "barchart". Load after primary.js and manip.js.
 * Origins: p4a-u6-1 (single bars, extrema, +/-), p4a-u6-2 (2/5/10 units
 * per cell, half cells, scale reset), p4a-u6-3 (two series, separate views,
 * grouped comparison). Reuse contexts: p2a-u1 classification, p3b-u5 tables.
 * These source lessons are unchanged; this module does not grade answers.
 *
 * cfg.mode: "single" (default), "scaled", "grouped".
 * categories: 1-12 nonempty strings, default [阅读,航模,合唱,绘画].
 * data: single/scaled integer values, one per category; default [8,6,10,5].
 * series: grouped only, exactly [{name, data}, {name, data}], required.
 * name: single series name, default 数量. unit: default 人. title: chart label.
 * max: largest editable value, integer 1-10000 (default 10, or 30 in scaled,
 *   or 20 in grouped); step: integer increment dividing max (default 1).
 * unitsPerCell: positive integer (default 1, or 5 in scaled, 2 in grouped).
 * scales: optional positive-integer scale choices (scaled default [2,5,10],
 *   otherwise [unitsPerCell]); each scale must give <=50 cells up to max.
 *   Switching scale preserves all data. Axis top = ceil(max/scale)*scale;
 *   max remains the editable limit even when it lies between grid lines.
 * Optional source-lesson presentation (all defaults above stay unchanged):
 * editable:false disables every data editor, including pointer/keyboard.
 * editors: series-by-category matrix of {editable,min,max,step,sub,add};
 *   sub/add are optional {id,label}. Fixed values need not share a range.
 * axisMaxByScale:{"2":28,"5":30,"10":30} overrides axis tops; each must
 *   cover every reachable value and contain <=50 complete grid cells.
 * highlight:"max" or "half-cell" colors every matching bar AND its label.
 * layout:{width,height,left,right,top,bottom,axisTop,categoryY,centers,
 *   barWidth,barGap,labelOffset,tickOffset,tickY,tickEvery,gridEvery,axisLabel,
 *   axisLabelX,axisLabelY,fontSize,valueFontSize,titleFontSize}; tickEvery may
 *   be a scale-keyed object. Authored layouts keep their minimum pixel width.
 * layout.legendPositions optionally positions SVG legend swatches/text using
 *   {x,y,width,height,textX,textY}, one record per series. colors: CSS variables.
 * ids:{svg,grid,title,summary,bars,labels,series,legend,difference}; nested
 *   bars/labels are series-by-category matrices; IDs remain caller-owned.
 * controls:{scales,views,reset}; scale/view entries are {id,label}.
 * viewOrder is a permutation of both/first/second/difference; scaleOrder may
 *   reorder all available scales without changing the initial scale.
 * compactControls:true puts only original editable +/- controls inline;
 * showHeading/showLegend/showScaleControls:false omit optional UI.
 * instruction overrides the keyboard hint (empty string omits it).
 * summaryTemplate and titlesByView/summariesByView are plain text.
 * Templates accept {scale},{max},{min},{maxNames},{minNames},{unit},
 *   {value0_1} (series 0, category 1), and {cells0_1} (whole/half cells).
 * svgTitle:true places the configurable title at the top of the SVG.
 * differenceBox:{x,y,width,height} keeps an authored readonly comparison box.
 * readoutSay is an optional text template, using native PeiyuP.sayButton/say;
 *   absent by default (the original grade-four source lessons have no say).
 * Values must be in [0,max] and multiples of step; invalid cfg throws before
 * mounting. All cfg strings are text, never HTML. cfg arrays are not mutated.
 *
 * Drag any bar vertically (mouse/pen/touch), use +/- buttons, or focus a bar:
 * Up/Right +step, Down/Left -step, Home 0, End max. Grouped views: both,
 * first, second, difference (highlight every largest absolute gap).
 * Reset restores data, scale and both-series view. Labels show actual values;
 * the readout also shows value/unitsPerCell, including partial cells. A
 * repeating decimal is written as an exact division, not a rounded equality.
 * manip:change detail: {mode,view,categories,series:[{name,data}],unit,max,
 *   unitsPerCell,axisMax,totals,differences} (first minus second, or []).
 * Emits on initial render and changes/reset; never emits manip:answer or
 * writes learning records. Large category labels/charts scroll inside the kit.
 * Example: data-cfg='{"mode":"scaled","categories":["科普","故事"],
 *   "data":[20,15],"max":30,"step":5,"unit":"本"}'
 */
(function () {
  "use strict";
  var U = window.PeiyuManip.util;
  function text(tag, cls, value, parent) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value != null) node.textContent = value;
    if (parent) parent.appendChild(node);
    return node;
  }
  function button(label, action, parent) {
    var b = text("button", "btn", label, parent);
    b.type = "button"; b.addEventListener("click", action); return b;
  }
  function integer(value, min, max, name) {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error("barchart: invalid " + name);
    return value;
  }
  function label(value, name) {
    if (typeof value !== "string" || !value.trim() || value.length > 80) throw new Error("barchart: invalid " + name);
    return value;
  }
  function cellsText(value, scale) {
    var a = value, b = scale;
    while (b) { var r = a % b; a = b; b = r; }
    var denominator = scale / a;
    while (denominator % 2 === 0) denominator /= 2;
    while (denominator % 5 === 0) denominator /= 5;
    return denominator === 1 ? String(value / scale) : "（" + value + " ÷ " + scale + "）";
  }
  function optionObject(value, name) {
    if (value === undefined) return {};
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("barchart: invalid " + name);
    return value;
  }
  function flag(value, fallback, name) {
    if (value === undefined) return fallback;
    if (typeof value !== "boolean") throw new Error("barchart: invalid " + name);
    return value;
  }
  function finite(value, fallback, min, max, name) {
    value = value === undefined ? fallback : value;
    if (!Number.isFinite(value) || value < min || value > max) throw new Error("barchart: invalid " + name);
    return value;
  }
  function barchart(root, cfg) {
    var mode = cfg.mode || "single";
    if (["single", "scaled", "grouped"].indexOf(mode) < 0) throw new Error("barchart: invalid mode");
    var categories = cfg.categories === undefined ? ["阅读", "航模", "合唱", "绘画"] : cfg.categories;
    if (!Array.isArray(categories) || categories.length < 1 || categories.length > 12) throw new Error("barchart: invalid categories");
    categories = categories.map(function (v) { return label(v, "category"); });
    var unit = label(cfg.unit === undefined ? "人" : cfg.unit, "unit");
    var title = label(cfg.title === undefined ? "条形统计图" : cfg.title, "title");
    var max = integer(cfg.max === undefined ? (mode === "scaled" ? 30 : mode === "grouped" ? 20 : 10) : cfg.max, 1, 10000, "max");
    var step = integer(cfg.step === undefined ? 1 : cfg.step, 1, max, "step");
    if (max % step && cfg.editors === undefined) throw new Error("barchart: step must divide max");
    var scale = integer(cfg.unitsPerCell === undefined ? (mode === "scaled" ? 5 : mode === "grouped" ? 2 : 1) : cfg.unitsPerCell, 1, 10000, "unitsPerCell");
    var scales = cfg.scales === undefined ? (mode === "scaled" ? [2, 5, 10] : [scale]) : cfg.scales;
    if (!Array.isArray(scales) || !scales.length || scales.length > 10) throw new Error("barchart: invalid scales");
    scales = [scale].concat(scales).filter(function (v, i, all) {
      integer(v, 1, 10000, "scale");
      return all.indexOf(v) === i;
    });
    if (cfg.scaleOrder !== undefined) {
      if (!Array.isArray(cfg.scaleOrder) || cfg.scaleOrder.length !== scales.length || new Set(cfg.scaleOrder).size !== scales.length || cfg.scaleOrder.some(function (v) { return scales.indexOf(v) < 0; })) throw new Error("barchart: invalid scaleOrder");
      scales = cfg.scaleOrder.slice();
    }
    var input = mode === "grouped" ? cfg.series : [{ name: cfg.name === undefined ? "数量" : cfg.name, data: cfg.data === undefined ? [8, 6, 10, 5] : cfg.data }];
    if (!Array.isArray(input) || input.length !== (mode === "grouped" ? 2 : 1)) throw new Error("barchart: invalid series");
    var series = input.map(function (s) {
      if (!s || !Array.isArray(s.data) || s.data.length !== categories.length) throw new Error("barchart: data length must match categories");
      return { name: label(s.name, "series name"), data: s.data.map(function (v) {
        integer(v, 0, max, "data");
        if (v % step && cfg.editors === undefined) throw new Error("barchart: data must be multiples of step");
        return v;
      }) };
    });
    var allEditable = flag(cfg.editable, true, "editable"), editorCfg = cfg.editors;
    if (editorCfg !== undefined && (!Array.isArray(editorCfg) || editorCfg.length !== series.length)) throw new Error("barchart: invalid editors");
    var controls = optionObject(cfg.controls, "controls"), ids = optionObject(cfg.ids, "ids");
    var usedIds = Object.create(null);
    function control(value, fallback) {
      var item = optionObject(value, "control"), result = { label: item.label === undefined ? fallback : label(item.label, "control label") };
      if (item.id !== undefined) result.id = domId(item.id);
      return result;
    }
    function domId(value) {
      if (typeof value !== "string" || !/^[A-Za-z][\w:.-]*$/.test(value) || usedIds[value]) throw new Error("barchart: invalid/duplicate DOM id");
      usedIds[value] = true; return value;
    }
    function idList(value, length, name) {
      if (value === undefined) return [];
      if (!Array.isArray(value) || value.length !== length) throw new Error("barchart: invalid " + name);
      return value.map(function (id) { return id === null ? null : domId(id); });
    }
    function idMatrix(value, name) {
      if (value === undefined) return [];
      if (!Array.isArray(value) || value.length !== series.length) throw new Error("barchart: invalid " + name);
      return value.map(function (row) { return idList(row, categories.length, name); });
    }
    var domIds = {};
    ["svg", "grid", "title", "summary", "difference"].forEach(function (key) { if (ids[key] !== undefined) domIds[key] = domId(ids[key]); });
    domIds.bars = idMatrix(ids.bars, "bar IDs"); domIds.labels = idMatrix(ids.labels, "label IDs");
    domIds.series = idList(ids.series, series.length, "series IDs"); domIds.legend = idList(ids.legend, series.length, "legend IDs");
    var editors = series.map(function (s, j) {
      if (editorCfg !== undefined && (!Array.isArray(editorCfg[j]) || editorCfg[j].length !== categories.length)) throw new Error("barchart: invalid editor row");
      return s.data.map(function (v, i) {
        var item = optionObject(editorCfg && editorCfg[j][i], "editor");
        var low = integer(item.min === undefined ? 0 : item.min, 0, max, "editor min");
        var high = integer(item.max === undefined ? max : item.max, low, max, "editor max");
        var increment = integer(item.step === undefined ? step : item.step, 1, max, "editor step");
        if ((high - low) % increment || v < low || v > high || (v - low) % increment) throw new Error("barchart: editor range/data misaligned");
        return { editable: allEditable && flag(item.editable, true, "editor editable"), min: low, max: high, step: increment,
          sub: control(item.sub, "−"), add: control(item.add, "+") };
      });
    });
    var axisTops = optionObject(cfg.axisMaxByScale, "axisMaxByScale");
    Object.keys(axisTops).forEach(function (key) { if (scales.indexOf(Number(key)) < 0) throw new Error("barchart: unknown axis scale"); });
    var reachable = Math.max.apply(null, [].concat.apply([], editors.map(function (row, j) { return row.map(function (e, i) { return e.editable ? e.max : series[j].data[i]; }); })));
    var tops = {};
    scales.forEach(function (s) {
      var high = axisTops[s] === undefined ? Math.ceil(max / s) * s : integer(axisTops[s], s, 500000, "axis top");
      if (high < reachable || high % s || high / s > 50) throw new Error("barchart: invalid axis coverage/cells");
      tops[s] = high;
    });
    var highlight = cfg.highlight;
    if (highlight !== undefined && ["max", "half-cell"].indexOf(highlight) < 0) throw new Error("barchart: invalid highlight");
    var compact = flag(cfg.compactControls, false, "compactControls"), svgTitle = flag(cfg.svgTitle, false, "svgTitle");
    var showHeading = flag(cfg.showHeading, true, "showHeading"), showLegend = flag(cfg.showLegend, true, "showLegend");
    var showScales = flag(cfg.showScaleControls, true, "showScaleControls");
    var order = cfg.viewOrder === undefined ? ["both", "first", "second", "difference"] : cfg.viewOrder;
    if (!Array.isArray(order) || order.length !== 4 || new Set(order).size !== 4 || order.some(function (v) { return ["both", "first", "second", "difference"].indexOf(v) < 0; })) throw new Error("barchart: invalid viewOrder");
    var scaleControls = optionObject(controls.scales, "scale controls"), viewControls = optionObject(controls.views, "view controls");
    var scaleOptions = scales.map(function (v) { return control(scaleControls[v], "每格 " + v + " " + unit); });
    var viewOptions = {};
    order.forEach(function (v) { viewOptions[v] = control(viewControls[v], { both: "并排比较", first: "只看" + series[0].name, second: "只看" + series[series.length - 1].name, difference: "比较差距" }[v]); });
    var resetOption = control(controls.reset, "重来");
    var disableAtBounds = flag(cfg.disableAtBounds, true, "disableAtBounds");
    var instruction = cfg.instruction === undefined ? "拖动直条改变数量；也可用下方加减按钮，或聚焦直条后按方向键。Home 归零，End 调到上限。" : cfg.instruction;
    if (cfg.instruction === undefined && editors.some(function (row) { return row.some(function (e) { return !e.editable || e.min !== 0; }); })) {
      instruction = editors.some(function (row) { return row.some(function (e) { return e.editable; }); }) ? "只有可调的直条能用拖动、加减按钮或方向键改变数量。Home 调到下限，End 调到上限。" : "数据保持不变；可以切换显示方式观察和比较。";
    }
    if (typeof instruction !== "string" || instruction.length > 1000) throw new Error("barchart: invalid instruction");
    var titles = optionObject(cfg.titlesByView, "titlesByView"), summaries = optionObject(cfg.summariesByView, "summariesByView");
    var allowedTokens = ["scale", "max", "min", "maxNames", "minNames", "unit"];
    series.forEach(function (s, j) { s.data.forEach(function (_, i) { allowedTokens.push("value" + j + "_" + i, "cells" + j + "_" + i); }); });
    function template(value) {
      if (value === undefined) return value;
      if (typeof value !== "string" || value.length > 2000 || /[{}]/.test(value.replace(/\{([^{}]+)\}/g, function (_, key) { return allowedTokens.indexOf(key) < 0 ? "{" : ""; }))) throw new Error("barchart: invalid text template");
      return value;
    }
    Object.keys(titles).forEach(function (key) { template(titles[key]); });
    Object.keys(summaries).forEach(function (key) { template(summaries[key]); });
    var summaryTemplate = template(cfg.summaryTemplate), readoutSay = template(cfg.readoutSay);
    var layout = optionObject(cfg.layout, "layout"), custom = cfg.layout !== undefined;
    var left = finite(layout.left, Math.max(48, String(Math.max.apply(null, scales.map(function (s) { return tops[s]; }))).length * 11 + 12), 0, 10000, "left");
    var barWidth = finite(layout.barWidth, Math.max(22, String(max).length * 10 + 2), 1, 1000, "barWidth");
    var barGap = finite(layout.barGap, 3, 0, 1000, "barGap");
    var lane = Math.max(70, barWidth * series.length + 18, Math.max.apply(null, categories.map(function (s) { return Array.from(s).length * 18 + 8; })));
    var width = finite(layout.width, left + lane * categories.length + 12, 50, 20000, "width");
    var svgHeight = finite(layout.height, 310, 50, 20000, "height");
    var top = finite(layout.top, 42, 0, svgHeight, "top"), bottom = finite(layout.bottom, 262, top + 1, svgHeight, "bottom"), height = bottom - top;
    var right = finite(layout.right, width - 8, left + 1, width, "right");
    var axisTop = finite(layout.axisTop, top, 0, top, "axisTop");
    var categoryY = finite(layout.categoryY, 294, bottom, svgHeight, "categoryY");
    var labelOffset = finite(layout.labelOffset, 7, 0, top, "labelOffset");
    var fontSize = finite(layout.fontSize, 18, 12, 60, "fontSize");
    var valueFontSize = finite(layout.valueFontSize, fontSize, 12, 60, "valueFontSize");
    var titleFontSize = finite(layout.titleFontSize, fontSize, 12, 60, "titleFontSize");
    var tickOffset = finite(layout.tickOffset, 6, 0, left, "tickOffset"), tickY = finite(layout.tickY, 6, 0, 30, "tickY");
    var centers = layout.centers === undefined ? categories.map(function (_, i) { return left + lane * (i + 0.5); }) : layout.centers;
    if (!Array.isArray(centers) || centers.length !== categories.length) throw new Error("barchart: invalid centers");
    centers = centers.map(function (x) { return finite(x, undefined, left + barWidth * series.length / 2, right - barWidth * series.length / 2, "center"); });
    var tickEvery = typeof layout.tickEvery === "number" ? layout.tickEvery : optionObject(layout.tickEvery, "tickEvery");
    scales.forEach(function (s) { var v = typeof tickEvery === "number" ? tickEvery : tickEvery[s]; if (v !== undefined) integer(v, 1, 50, "tick stride"); });
    var gridEvery = integer(layout.gridEvery === undefined ? 1 : layout.gridEvery, 1, 50, "grid stride");
    var axisLabel = layout.axisLabel === undefined ? "" : label(layout.axisLabel, "axis label");
    var axisLabelX = finite(layout.axisLabelX, 6, 0, width, "axis label x"), axisLabelY = finite(layout.axisLabelY, 28, 0, svgHeight, "axis label y");
    var legendPositions = layout.legendPositions;
    if (legendPositions !== undefined) {
      if (!Array.isArray(legendPositions) || legendPositions.length !== series.length) throw new Error("barchart: invalid legend positions");
      legendPositions = legendPositions.map(function (entry) {
        entry = optionObject(entry, "legend position");
        var position = {};
        ["x", "y", "textX", "textY", "width", "height"].forEach(function (key) { position[key] = finite(entry[key], undefined, 0, /y|height/i.test(key) ? svgHeight : width, "legend " + key); });
        if (position.x + position.width > width || position.y + position.height > svgHeight) throw new Error("barchart: legend outside SVG");
        return position;
      });
    }
    var colors = cfg.colors === undefined ? ["var(--bc-first)", "var(--bc-second)"].slice(0, series.length) : cfg.colors;
    if (!Array.isArray(colors) || colors.length !== series.length || colors.some(function (v) { return typeof v !== "string" || !/^var\(--[\w-]+\)$/.test(v); })) throw new Error("barchart: invalid colors");
    colors = colors.slice();
    var differenceBox = cfg.differenceBox;
    if (differenceBox !== undefined) {
      differenceBox = optionObject(differenceBox, "differenceBox");
      if (mode !== "grouped" || editors.some(function (row) { return row.some(function (e) { return e.editable; }); })) throw new Error("barchart: fixed difference box requires readonly grouped data");
      differenceBox = { x: finite(differenceBox.x, undefined, 0, width, "difference x"), y: finite(differenceBox.y, undefined, 0, svgHeight, "difference y"), width: finite(differenceBox.width, undefined, 1, width, "difference width"), height: finite(differenceBox.height, undefined, 1, svgHeight, "difference height") };
      if (differenceBox.x + differenceBox.width > width || differenceBox.y + differenceBox.height > svgHeight) throw new Error("barchart: difference box outside SVG");
    }
    var initial = series.map(function (s) { return s.data.slice(); }), initialScale = scale, view = "both";
    if (!document.getElementById("peiyu-barchart-style")) {
      var style = text("style", "", null, document.head); style.id = "peiyu-barchart-style";
      style.textContent = ".bc-kit{--bc-first:var(--a);--bc-second:var(--b);min-width:0;overflow-wrap:anywhere}.bc-kit .bc-scroll{overflow-x:auto;max-width:100%}.bc-kit svg.stage{max-width:none}.bc-kit svg text{font-size:var(--bc-font,18px);fill:var(--fg)}.bc-kit .bc-bar{cursor:ns-resize;touch-action:none}.bc-kit .bc-bar:focus-visible{outline:none;stroke:var(--fg);stroke-width:3}.bc-kit .bc-legend{display:flex;flex-wrap:wrap;justify-content:center;gap:16px}.bc-kit .bc-legend>span{min-width:0;max-width:100%}.bc-kit .bc-swatch{display:inline-block;width:16px;height:16px;margin-right:6px;vertical-align:middle;border:1px solid var(--fg)}.bc-kit .bc-values{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;margin-top:12px}.bc-kit .bc-entry{border:1px solid var(--line);border-radius:8px;padding:8px;min-width:0;overflow-wrap:anywhere}.bc-kit .bc-entry p{margin:0;font-size:16px}.bc-kit .bc-entry .ctrls{margin:4px 0}.bc-kit .bc-scale{font-size:16px;text-align:center}.bc-kit .bc-summary{overflow-wrap:anywhere}.bc-kit [hidden]{display:none!important}";
    }
    root.classList.add("bc-kit");
    root.style.setProperty("--bc-font", fontSize + "px");
    function identify(node, value) { if (value) node.id = value; return node; }
    function configuredButton(option, action, parent) { return identify(button(option.label, action, parent), option.id); }
    var heading = showHeading && !svgTitle ? identify(text("p", "bc-scale", title, root), domIds.title) : null;
    var legend = showLegend && !legendPositions ? text("div", "bc-legend", null, root) : null, legendItems = [];
    series.forEach(function (s, j) {
      if (!legend) return;
      var item = text("span", "", null, legend);
      identify(item, domIds.legend[j]);
      var swatch = text("span", "bc-swatch", null, item);
      swatch.style.background = colors[j];
      text("span", "", s.name, item); legendItems.push(item);
    });
    var viewport = text("div", "bc-scroll", null, root);
    var svg = identify(U.el("svg", { viewBox: "0 0 " + width + " " + svgHeight, class: "stage", role: custom ? "img" : "group", "aria-label": title }, viewport), domIds.svg);
    svg.style.minWidth = (width * (custom ? 1 : 0.82)) + "px";
    if (custom) svg.style.maxWidth = Math.max(width, 560) + "px";
    if (svgTitle) {
      heading = identify(U.el("text", { x: width / 2, y: 20, "text-anchor": "middle" }, svg), domIds.title);
      heading.style.fontSize = titleFontSize + "px";
    }
    if (showLegend && legendPositions) legendPositions.forEach(function (position, j) {
      var group = identify(U.el("g", {}, svg), domIds.legend[j]);
      U.el("rect", { x: position.x, y: position.y, width: position.width, height: position.height, rx: 2, fill: colors[j] }, group);
      U.el("text", { x: position.textX, y: position.textY }, group).textContent = series[j].name;
      legendItems.push(group);
    });
    if (axisLabel) U.el("text", { x: axisLabelX, y: axisLabelY }, svg).textContent = axisLabel;
    var grid = identify(U.el("g", { "aria-hidden": "true" }, svg), domIds.grid), bars = [], scaleBtns = [], viewBtns = [];
    var seriesGroups = domIds.series.length ? series.map(function (_, j) { return identify(U.el("g", {}, svg), domIds.series[j]); }) : [];
    categories.forEach(function (category, i) {
      var cx = centers[i];
      U.el("text", { x: cx, y: categoryY, "text-anchor": "middle" }, svg).textContent = category;
      series.forEach(function (s, j) {
        var editor = editors[j][i];
        var x = cx + (j - (series.length - 1) / 2) * (barWidth + barGap) - barWidth / 2;
        var group = U.el("g", {}, seriesGroups[j] || svg);
        var gap = custom && (mode !== "grouped" || differenceBox) ? null : U.el("rect", { x: cx - lane / 2 + 3, width: lane - 6, fill: "none", stroke: "var(--fg)", "stroke-dasharray": "5 4", "stroke-width": 2, "pointer-events": "none", visibility: "hidden" }, group);
        var bar = identify(U.el("rect", { x: x, width: barWidth, fill: colors[j], "pointer-events": "none", class: "bc-column" }, group), domIds.bars[j] && domIds.bars[j][i]);
        var valueLabel = identify(U.el("text", { x: x + barWidth / 2, "text-anchor": "middle", "pointer-events": "none" }, group), domIds.labels[j] && domIds.labels[j][i]);
        valueLabel.style.fontSize = valueFontSize + "px";
        var hit = editor.editable ? U.el("rect", { x: x - 1, y: top - 18, width: barWidth + 2, height: height + 36, fill: "transparent", class: "bc-bar", role: "slider", tabindex: "0", "aria-orientation": "vertical", "aria-label": category + "，" + s.name, "aria-valuemin": editor.min, "aria-valuemax": editor.max }, group) : null;
        var pointer = null;
        function fromPointer(ev) {
          var matrix = svg.getScreenCTM();
          if (!matrix) return;
          var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
          setValue(j, i, (bottom - p.matrixTransform(matrix.inverse()).y) / height * axisMax());
        }
        if (hit) hit.addEventListener("pointerdown", function (ev) {
          if (pointer !== null || (ev.pointerType === "mouse" && ev.button !== 0)) return;
          pointer = ev.pointerId; hit.setPointerCapture(pointer); hit.focus(); fromPointer(ev); ev.preventDefault();
        });
        if (hit) hit.addEventListener("pointermove", function (ev) { if (ev.pointerId === pointer) fromPointer(ev); });
        function release(ev) { if (ev.pointerId === pointer) pointer = null; }
        if (hit) { hit.addEventListener("pointerup", release); hit.addEventListener("pointercancel", release); hit.addEventListener("lostpointercapture", release); }
        if (hit) hit.addEventListener("keydown", function (ev) {
          var v = s.data[i];
          if (ev.key === "Home") v = editor.min;
          else if (ev.key === "End") v = editor.max;
          else if (ev.key === "ArrowUp" || ev.key === "ArrowRight") v += editor.step;
          else if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") v -= editor.step;
          else return;
          ev.preventDefault(); setValue(j, i, v);
        });
        bars.push({ j: j, i: i, group: group, bar: bar, hit: hit, label: valueLabel, gap: gap });
      });
    });
    var fixedDifference = differenceBox ? identify(U.el("rect", { x: differenceBox.x, y: differenceBox.y, width: differenceBox.width, height: differenceBox.height, rx: 4, fill: "none", stroke: "var(--c)", "stroke-width": 2.5, "stroke-dasharray": "4 3", "pointer-events": "none" }, svg), domIds.difference) : null;
    var scaleCtr = text("div", "ctrls", null, root);
    scales.forEach(function (v, i) {
      if (!showScales) return;
      var b = configuredButton(scaleOptions[i], function () { scale = v; draw(); }, scaleCtr);
      scaleBtns.push({ b: b, value: v });
    });
    var viewCtr = text("div", "ctrls", null, root);
    if (mode === "grouped") order.forEach(function (v) {
      var b = configuredButton(viewOptions[v], function () { view = v; draw(); }, viewCtr);
      viewBtns.push({ b: b, value: v });
    });
    function reset() { series.forEach(function (s, j) { s.data = initial[j].slice(); }); scale = initialScale; view = "both"; draw(); }
    if (!compact) configuredButton(resetOption, reset, viewCtr);
    if (instruction) text("p", "hint", instruction, root);
    var values = compact ? scaleCtr : text("div", "bc-values", null, root), entries = [];
    series.forEach(function (s, j) { categories.forEach(function (category, i) {
      var editor = editors[j][i];
      if (!editor.editable) return;
      var entry = compact ? values : text("div", "bc-entry", null, values);
      if (!compact) text("p", "", category + " · " + s.name, entry);
      var value = compact ? null : text("p", "bc-number", "", entry), ctr = compact ? entry : text("div", "ctrls", null, entry);
      var sub = configuredButton(editor.sub, function () { setValue(j, i, s.data[i] - editor.step); }, ctr);
      var add = configuredButton(editor.add, function () { setValue(j, i, s.data[i] + editor.step); }, ctr);
      sub.setAttribute("aria-label", category + "，" + s.name + "减少 " + editor.step + unit);
      add.setAttribute("aria-label", category + "，" + s.name + "增加 " + editor.step + unit);
      entries.push({ j: j, i: i, node: entry, value: value, sub: sub, add: add });
    }); });
    if (compact) configuredButton(resetOption, reset, mode === "grouped" ? viewCtr : scaleCtr);
    var summary = identify(text("p", "read bc-summary", "", root), domIds.summary); summary.setAttribute("aria-live", "polite");
    function axisMax() { return tops[scale]; }
    function visible(j) { return !(view === "first" && j === 1 || view === "second" && j === 0); }
    function setValue(j, i, v) {
      var editor = editors[j][i];
      if (!editor.editable) return;
      v = Math.max(editor.min, Math.min(editor.max, editor.min + Math.round((v - editor.min) / editor.step) * editor.step));
      if (v !== series[j].data[i]) { series[j].data[i] = v; draw(); }
    }
    function draw() {
      grid.replaceChildren();
      var cells = axisMax() / scale, configuredStride = typeof tickEvery === "number" ? tickEvery : tickEvery[scale];
      var stride = configuredStride === undefined ? Math.max(1, Math.ceil(cells / 8)) : configuredStride;
      for (var k = 0; k <= cells; k++) {
        var y = bottom - k / cells * height;
        if (k === 0 || k === cells || k % gridEvery === 0) U.el("line", { x1: left, x2: right, y1: y, y2: y, stroke: k ? "var(--line)" : "var(--fg)", "stroke-width": k ? 1 : 2 }, grid);
        if (k === cells || k % stride === 0 && (k === 0 || cells - k >= stride)) U.el("text", { x: left - tickOffset, y: y + tickY, "text-anchor": "end" }, grid).textContent = k * scale;
      }
      U.el("line", { x1: left, x2: left, y1: axisTop, y2: bottom, stroke: "var(--fg)", "stroke-width": 2 }, grid);
      var diffs = mode === "grouped" ? categories.map(function (_, i) { return series[0].data[i] - series[1].data[i]; }) : [];
      var largestGap = diffs.length ? Math.max.apply(null, diffs.map(Math.abs)) : 0;
      bars.forEach(function (b) {
        var value = series[b.j].data[b.i], h = value / axisMax() * height, y = bottom - h;
        b.group.style.display = visible(b.j) ? "" : "none";
        b.bar.setAttribute("y", y); b.bar.setAttribute("height", h);
        b.label.setAttribute("y", y - labelOffset); b.label.textContent = value;
        if (highlight) {
          var selected = highlight === "max" ? value === Math.max.apply(null, series[b.j].data) : value % scale * 2 === scale;
          b.bar.style.fill = selected ? "var(--b)" : "var(--a)";
          b.label.style.fill = selected ? "var(--b)" : "var(--a)";
        } else if (cfg.colors !== undefined) { b.bar.style.fill = colors[b.j]; b.label.style.fill = colors[b.j]; }
        if (b.hit) {
          b.hit.setAttribute("aria-valuenow", value);
          b.hit.setAttribute("aria-valuetext", value + unit + "，" + cellsText(value, scale) + "格");
        }
        if (b.gap) {
          b.gap.setAttribute("y", bottom - Math.max(series[0].data[b.i], series[series.length - 1].data[b.i]) / axisMax() * height - 16);
          b.gap.setAttribute("height", Math.max(20, Math.abs(diffs[b.i] || 0) / axisMax() * height + 30));
          b.gap.setAttribute("visibility", !fixedDifference && view === "difference" && b.j === 0 && Math.abs(diffs[b.i]) === largestGap ? "visible" : "hidden");
        }
      });
      seriesGroups.forEach(function (group, j) { group.style.display = visible(j) ? "" : "none"; });
      if (fixedDifference) fixedDifference.style.display = view === "difference" ? "block" : "none";
      entries.forEach(function (e) {
        var v = series[e.j].data[e.i], editor = editors[e.j][e.i];
        if (!compact) e.node.hidden = !visible(e.j);
        else { e.sub.hidden = !visible(e.j); e.add.hidden = !visible(e.j); }
        if (e.value) e.value.textContent = v + " " + unit + " = " + cellsText(v, scale) + " 格";
        e.sub.disabled = disableAtBounds && v === editor.min; e.add.disabled = disableAtBounds && v === editor.max;
      });
      legendItems.forEach(function (e, j) { e.hidden = !visible(j); e.style.display = visible(j) ? "" : "none"; });
      scaleBtns.forEach(function (e) { e.b.setAttribute("aria-pressed", String(e.value === scale)); });
      viewBtns.forEach(function (e) { e.b.setAttribute("aria-pressed", String(e.value === view)); });
      var high = Math.max.apply(null, series[0].data), low = Math.min.apply(null, series[0].data);
      var context = { scale: scale, max: high, min: low, maxNames: categories.filter(function (_, i) { return series[0].data[i] === high; }).join("、"), minNames: categories.filter(function (_, i) { return series[0].data[i] === low; }).join("、"), unit: unit };
      series.forEach(function (s, j) { s.data.forEach(function (v, i) {
        context["value" + j + "_" + i] = v;
        context["cells" + j + "_" + i] = v % scale * 2 === scale ? Math.floor(v / scale) + " 格半（含半格=" + scale / 2 + "）" : cellsText(v, scale) + (v % scale ? " 格" : " 整格");
      }); });
      function format(value) { return value.replace(/\{([^{}]+)\}/g, function (_, key) { return String(context[key]); }); }
      if (heading) heading.textContent = titles[view] !== undefined ? format(titles[view]) : title + " · 每格 " + scale + unit + " · 可调范围 0–" + max + unit;
      var descriptions = [];
      var totals = series.map(function (s) { return s.data.reduce(function (a, b) { return a + b; }, 0); });
      series.forEach(function (s, j) {
        if (!visible(j)) return;
        var hi = Math.max.apply(null, s.data), lo = Math.min.apply(null, s.data);
        function names(v) { return categories.filter(function (_, i) { return s.data[i] === v; }).join("、"); }
        descriptions.push(s.name + "合计 " + totals[j] + unit + "；最多：" + names(hi) + "（" + hi + unit + "），最少：" + names(lo) + "（" + lo + unit + "）");
      });
      if (mode === "grouped" && view !== "first" && view !== "second") {
        diffs.forEach(function (d, i) { descriptions.push(categories[i] + "：" + (d === 0 ? "两组一样多" : (d > 0 ? series[0].name : series[1].name) + "比" + (d > 0 ? series[1].name : series[0].name) + "多 " + Math.abs(d) + unit)); });
        if (view === "difference") descriptions.push("最大差距：" + categories.filter(function (_, i) { return Math.abs(diffs[i]) === largestGap; }).join("、") + "（相差 " + largestGap + unit + "）");
      }
      var customSummary = summaries[view] === undefined ? summaryTemplate : summaries[view];
      summary.textContent = customSummary === undefined ? descriptions.join("。") + "。" : format(customSummary);
      if (readoutSay !== undefined && window.PeiyuP && window.PeiyuP.sayButton && window.PeiyuP.say) {
        var spoken = format(readoutSay), say = window.PeiyuP.sayButton(spoken);
        if (say.nodeType === 1) {
          say.setAttribute("data-say-init", "1");
          say.addEventListener("click", function () { window.PeiyuP.say(spoken, say); });
        }
        summary.appendChild(say);
      }
      U.emit(root, { mode: mode, view: view, categories: categories.slice(), series: series.map(function (s) { return { name: s.name, data: s.data.slice() }; }), unit: unit, max: max, unitsPerCell: scale, axisMax: axisMax(), totals: totals, differences: diffs });
    }
    draw();
  }
  window.PeiyuManip.register("barchart", barchart);
})();
