/* 培玉 · 公共测量教具，kind: measure。加载 primary.js、manip.js 后加载本文件。
   来源（原课保持不变）：p2a-u4-1 initRulerLab / initOneCm，
   p2a-u4-2 initMeterStick / initCompare1m，p2a-u4-4 initRefBench；
   非零起点也用于 p2a-u4-3 画线段，可配置 mm/dm 复用于 p3a-u3。
   <div class="manip" data-manip="measure" data-cfg='{"mode":"ruler","length":6}'></div>

   cfg 全部是 JSON 数据，不接受 HTML、表达式或事件。mode 默认 ruler：
   onecm：max=10（1至10的整数厘米），pos=0（0至max-1的整数），showFinger=true。
     点任意相邻厘米格，前/后一格循环移动，叠加约1厘米的食指；Enter/空格选格，
     左右键循环、Home/End选首末格。重来恢复cfg；始终表示1厘米，非可变长度物品。
   ruler：length=6（含0），unit="cm"（mm/cm/dm/m），max=10，tick=1，
     broken=false，min=broken?1:0，start=broken?2:0，name="书签"，arcs=true。
     length/max/min/start 以 unit 为单位；max>min>=0，max-min 为1至20个tick，
     length为tick的非负整倍数且<=max-min，start须在[min,max-length]刻度上。
     整尺保留半格尺头，尺头不是0；断尺不显示0。拖动尺子（非调长短），
     左/右键移尺一格、Home/End 到左右极限；按钮可对0/首个刻度或最后起点。
     数大格可切换；非零起点始终用右端减左端；尺头错位不作有效读数。
     可选items=[{name,length,color,broken,min,start,alignStart,objectName}]（1至8项），
     每项未指定字段沿用顶层cfg；也接受原课len/startTick。index=0，切换恢复该项start，
     保留数格状态；重来恢复初始index/start/arcs。color只接受var(--变量名)。
     dragMax可独立限制移动起点；edgeShift默认-tick/2，edgeOnly=true时尺头反例仅按钮可达，
     拖动/方向键仍以min为下界（Home/End到移动边界）。alignStart默认min；alignAt可加独立
     对齐按钮；showEnd=false可收起末端按钮。labels可配align/alignBroken/alignAt/edge/arcs/reset。
     showObjectName/numberArcs/showAllNumerals默认false，numeralSize=20（16至24）。
     dragSurface="ruler"；设为"stage"可保留原课在整幅实验图上的拖动热区。
     feedback可配zero/nonzero/misaligned纯文本模板，
     占位符为{start}/{end}/{length}/{count}/{tick}/{unit}；alignedClass/misalignedClass可为ok/no/空。
     原p2a-u4-1完整配置见demo：max11、dragMax3、edgeShift-0.7、edgeOnly，三物品与全部原控件。
   metre：segmentCm=10（1至100且整除100），count=1（0至100/segmentCm），
     unfolded=false，zoom=false，items=[{name:"小板凳",cm:35},
     {name:"跳绳",cm:200,rope:true},{name:"讲桌",cm:80},{name:"长椅",cm:180}]。
     展开/折回一米尺、逐把铺短尺/铺满、放大第一把短尺，再与物品按同一比例比较。
     items非空、最多8个，cm在(0,100000]；绳子先盘着，拉直后才比端点。
     view省略时保留原完整模式；view="meter"为p2a-u4-2独立拼米尺，minCount=1、
     count=1、zoom=false，只有add/fill/zoom/reset四控件，满100厘米才有原native say。
     view="compare"为该课独立1米比较，items可带desc（可见说明/朗读原文）、index=0，
     每次换物品清盘绳状态；默认scale=1.35，100厘米画135单位，controls/reset与拼尺隔离。
     两视图的labels可配各自控件，比较视图coiledText可配盘绳提示，不与拼尺串读。
   yarn/drawseg/poly：p2a-u4-3原三个实验的四/四/五场景，index=0；states可传原
     MODES/SCENES/SHAPES格式纯JSON，默认保原路径/端点/坐标/彩边/编号/标题与native say。
     yarn保持横/曲/斜/竖；drawseg默认max=10，含0到4、0到6、2到7与0/2/6/9寻宝标记，
     markers可配cm/t/color；poly的pts/edges/colors可配，不允许重复计数或无效点/边。
     默认保原13按钮而不增加reset；reset=true可提供配置初始场景的“重来”。
   body：items=[{name:"大树",value:9,unit:"m",ref:"kid",refCm:120},
     {name:"书桌",value:70,unit:"cm",ref:"kid",refCm:120},
     {name:"水杯",value:16,unit:"cm",ref:"hand",refCm:12},
     {name:"房门",value:2,unit:"m",ref:"kid",refCm:120}]；index=0。
     ref为kid/hand/finger/step（默认kid），refCm为个人身体参照的估计厘米数，
     value在(0,100000]，unit为mm/cm/dm/m。切换试填cm/m，比较真实厘米比例。
     refCm在(0,100000]；身体尺度因人而异，不能当统一长度单位。
     view省略保持原默认body；view="source"保p2a-u4-4的六控件与八态辅助图，
     items接受原num/good/shortName/refTxt/cmSay/mSay字段，example=0/1/2/3对应树/桌/杯/门。
     换物品恢复各自good单位；默认无reset，可选reset=true；labels.cm/m可配试填按钮名。
   非法数值/模式/单位抛出配置错误，不静默改变数学含义。name为纯文本，最多24字。
   原四mode支持重来；所有模式支持原生按钮键盘/触屏。尺子支持Pointer Events及取消拖动。
   动态读数使用原生PeiyuP.sayButton/initSay（按学段生成），不自动播放。
   原厘米格及厘米直尺沿用原课say文字；缓存key/音色/语速与回退由primary.js管理。
   只发 manip:change（含mode及数值状态），不写学习账本、不发判题/新answer ID。
   PeiyuManip.measureConvert(value, from, to) 供换算与复用，内部统一用厘米。
*/
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var U = window.PeiyuManip.util;
  var FACTOR = { mm: 0.1, cm: 1, dm: 10, m: 100 };
  var WORD = { mm: "毫米", cm: "厘米", dm: "分米", m: "米" };
  var REF = { kid: "小朋友身高", hand: "一拃", finger: "食指宽", step: "一步" };
  function num(v, fallback, lo, hi) {
    if (v === undefined) v = fallback;
    if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) throw new Error("measure: 数值超出配置范围");
    return v;
  }
  function unit(v) {
    if (!Object.prototype.hasOwnProperty.call(FACTOR, v)) throw new Error("measure: 不支持的长度单位");
    return v;
  }
  function round(v) { return Math.round(v * 1e8) / 1e8; }
  function convert(v, from, to) {
    num(v, 0, -1e10, 1e10);
    return Number((v * FACTOR[unit(from)] / FACTOR[unit(to)]).toPrecision(12));
  }
  window.PeiyuManip.measureConvert = convert;
  function text(v, fallback) { return typeof v === "string" ? v.slice(0, 24) : fallback; }
  function node(tag, cls, value, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value !== undefined) n.textContent = value;
    if (parent) parent.appendChild(n);
    return n;
  }
  function shape(tag, attrs, parent) { return U.el(tag, attrs, parent); }
  function label(svg, x, y, value, color) {
    var n = shape("text", { x: x, y: y, "text-anchor": "middle", fill: color || "var(--measure-ink)", "font-size": 20 }, svg);
    n.textContent = value;
    return n;
  }
  function rect(svg, x, y, w, h, fill, role) {
    return shape("rect", { x: x, y: y, width: w, height: h, rx: 3, fill: fill,
      stroke: "var(--measure-ink)", "stroke-width": 1.5, "data-role": role || "" }, svg);
  }
  function line(svg, x1, y1, x2, y2, color, dashed) {
    return shape("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color || "var(--measure-ink)",
      "stroke-width": 2, "stroke-dasharray": dashed ? "4 4" : "none" }, svg);
  }
  function button(ctr, value, action, fn) {
    var b = node("button", "", value, ctr); b.type = "button";
    b.dataset.action = action; b.addEventListener("click", fn); return b;
  }
  function styles() {
    if (document.getElementById("measure-kit-style")) return;
    node("style", "", '.manip[data-manip="measure"]{--measure-ink:var(--fg);--measure-accent:var(--c);--measure-fill:var(--hl-soft);padding:10px}.manip[data-manip="measure"] svg.stage{max-width:600px}.manip[data-manip="measure"] .measure-slider{touch-action:none;cursor:ew-resize}.manip[data-manip="measure"] .measure-slider:focus-visible{outline:3px solid var(--measure-accent);outline-offset:3px}.manip[data-manip="measure"] .measure-caption{font-size:16px;text-align:center;overflow-wrap:anywhere}.manip[data-manip="measure"] .ctrls button{font-size:16px}.manip[data-manip="measure"] .read{font-size:18px;overflow-wrap:anywhere}', document.head).id = "measure-kit-style";
  }
  function shell(root, title, height) {
    styles();
    var svg = shape("svg", { class: "stage", viewBox: "0 0 360 " + height, role: "group", "aria-label": title }, root);
    var ctr = node("div", "ctrls", undefined, root);
    var read = node("p", "read", "", root); read.setAttribute("aria-live", "polite");
    var caption = node("p", "measure-caption", "", root);
    return { svg: svg, ctr: ctr, read: read, caption: caption };
  }
  function clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
  function onOff(b, yes) { b.setAttribute("aria-pressed", String(yes)); }
  function change(root, mode, data) { U.emit(root, Object.assign({ mode: mode }, data)); }
  function spoken(value) {
    var P = window.PeiyuP, parts = String(value).split(".");
    var whole = P ? P.cn(Number(parts[0])) : parts[0];
    return parts.length === 1 ? whole : whole + "点" + parts[1].split("").map(function (d) { return P ? P.cn(Number(d)) : d; }).join("");
  }
  function readout(box, value, say) {
    box.read.textContent = value;
    var P = window.PeiyuP;
    if (say && P) {
      box.read.appendChild(P.sayButton(say));
      // initSay marks the new button; later page-wide initialization cannot bind it twice.
      P.initSay(box.read);
    }
  }

  function onecm(root, cfg) {
    var max = num(cfg.max, 10, 1, 10), initial = num(cfg.pos, 0, 0, max - 1);
    if (!Number.isInteger(max) || !Number.isInteger(initial)) throw new Error("measure: 厘米格数和位置须为整数");
    var pos = initial, showFinger = cfg.showFinger !== false;
    var box = shell(root, "直尺上的1厘米", 148), svg = box.svg, step = 280 / max;
    rect(svg, 14, 66, 332, 64, "var(--measure-fill)", "onecm-ruler");
    var selected = rect(svg, 36, 66, step, 42, "var(--ok-soft)", "onecm-selected");
    var mark = line(svg, 36, 58, 36 + step, 58, "var(--measure-accent)");
    var title = label(svg, 100, 24, "1 厘米（1 cm）", "var(--measure-accent)");
    var finger = shape("g", { "data-role": "finger", "aria-hidden": "true" }, svg);
    var pad = rect(finger, 2, 30, step - 4, 34, "var(--b)"); pad.setAttribute("rx", 10);
    var nail = rect(finger, 5, 33, step - 10, 11, "var(--card)"); nail.setAttribute("rx", 5);
    var numerals = [], hits = [];
    for (var i = 0; i <= max; i++) {
      var x = 36 + i * step;
      line(svg, x, 66, x, 88);
      numerals.push(label(svg, x, 114, i));
      if (i < max) {
        for (var j = 1; j < 10; j++) line(svg, x + j * step / 10, 66, x + j * step / 10, j === 5 ? 78 : 73);
        (function (idx) {
          var hit = shape("rect", { x: x, y: 66, width: step, height: 64, fill: "transparent", class: "part", tabindex: 0,
            role: "button", "data-cell": idx, "aria-label": "刻度" + idx + "到" + (idx + 1) + "，1厘米" }, svg);
          hit.addEventListener("click", function () { select(idx); });
          hit.addEventListener("keydown", function (e) {
            var next;
            if (e.key === "Enter" || e.key === " ") next = idx;
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (pos + max - 1) % max;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (pos + 1) % max;
            if (e.key === "Home") next = 0;
            if (e.key === "End") next = max - 1;
            if (next !== undefined) { e.preventDefault(); select(next); hits[next].focus(); }
          });
          hits.push(hit);
        })(i);
      }
    }
    button(box.ctr, "← 前一格", "prev", function () { select((pos + max - 1) % max); });
    button(box.ctr, "后一格 →", "next", function () { select((pos + 1) % max); });
    var fingerButton = button(box.ctr, "食指比一比", "finger", function () { showFinger = !showFinger; draw(); });
    button(box.ctr, "重来", "reset", function () { pos = initial; showFinger = cfg.showFinger !== false; draw(); });
    box.caption.textContent = "食指宽约 1 厘米，因人而异。点任意大格或用方向键选格；屏幕图示不作真实尺寸尺。";
    function select(value) { pos = value; draw(); }
    function draw() {
      var x = 36 + pos * step;
      selected.setAttribute("x", x); selected.setAttribute("data-start", pos); selected.setAttribute("data-end", pos + 1);
      mark.setAttribute("x1", x); mark.setAttribute("x2", x + step);
      title.setAttribute("x", Math.max(90, Math.min(270, x + step / 2)));
      finger.setAttribute("transform", "translate(" + x + " 0)"); finger.setAttribute("visibility", showFinger ? "visible" : "hidden");
      onOff(fingerButton, showFinger);
      hits.forEach(function (hit, idx) { onOff(hit, idx === pos); });
      numerals.forEach(function (n, idx) { n.setAttribute("fill", idx === pos || idx === pos + 1 ? "var(--measure-accent)" : "var(--measure-ink)"); });
      readout(box, "从刻度 " + pos + " 到刻度 " + (pos + 1) + " 是 1 大格，长度是 1 厘米。",
        "从刻度" + spoken(pos) + "到刻度" + spoken(pos + 1) + "是一大格，长度是一厘米。");
      change(root, "onecm", { pos: pos, start: pos, end: pos + 1, length: 1, unit: "cm", cm: 1, showFinger: showFinger });
    }
    draw();
  }

  function ruler(root, cfg) {
    var u = unit(cfg.unit === undefined ? "cm" : cfg.unit);
    var max = num(cfg.max, 10, 0.01, 100000), tick = num(cfg.tick, 1, 0.001, max);
    function integral(v) { return Math.abs(v - Math.round(v)) < 1e-7; }
    var inputs = cfg.items === undefined ? [{}] : cfg.items;
    if (!Array.isArray(inputs) || !inputs.length || inputs.length > 8) throw new Error("measure: items须有1至8项");
    var items = inputs.map(function (input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("measure: 物品配置错误");
      var it = Object.assign({}, cfg, input), broken = it.broken === true;
      var min = num(it.min, broken ? 1 : 0, 0, max), len = num(input.len === undefined ? it.length : input.len, 6, 0, max - min);
      if (!integral((max - min) / tick) || (max - min) / tick < 1 || (max - min) / tick > 20 || !integral(len / tick) || (!broken && min !== 0) || (broken && min <= 0)) throw new Error("measure: 尺面须有1至20个大格，长度须对准刻度");
      var hi = num(it.dragMax, round(max - len), min, round(max - len));
      var start = num(input.startTick === undefined ? it.start : input.startTick, broken ? Math.min(min + tick, hi) : 0, min, hi);
      var align = num(it.alignStart, min, min, hi), at = it.alignAt === undefined ? undefined : num(it.alignAt, undefined, min, hi);
      if (![hi, start, align, at].every(function (v) { return v === undefined || integral((v - min) / tick); })) throw new Error("measure: 起点须对准刻度");
      var edge = num(it.edgeShift, -tick / 2, -tick, 0);
      if (edge >= 0) throw new Error("measure: 尺头须在0刻度左侧");
      var color = it.color === undefined ? "var(--measure-fill)" : it.color;
      if (typeof color !== "string" || !/^var\(--[a-z][a-z0-9-]*\)$/.test(color)) throw new Error("measure: 物品颜色须为主题变量");
      return { name: text(it.name, "书签"), objectName: text(it.objectName, text(it.name, "书签")), color: color,
        broken: broken, min: min, length: len, start: start, hi: hi, lo: broken ? min : edge,
        moveLo: broken || it.edgeOnly === true ? min : edge, align: align, at: at, edge: edge };
    });
    var initial = num(cfg.index, 0, 0, items.length - 1);
    if (!Number.isInteger(initial)) throw new Error("measure: 物品编号须为整数");
    var numeralSize = num(cfg.numeralSize, 20, 16, 24);
    if (cfg.dragSurface !== undefined && !["ruler", "stage"].includes(cfg.dragSurface)) throw new Error("measure: 拖动区域须为ruler/stage");
    var index = initial, current = items[index], shift = current.start, arcs = cfg.arcs !== false, drag = null;
    var labels = cfg.labels || {}, feedback = cfg.feedback || {};
    function message(key, fallback, values) {
      var template = feedback[key] === undefined ? fallback : feedback[key];
      if (typeof template !== "string" || template.length > 600) throw new Error("measure: 反馈须为纯文本模板");
      return template.replace(/\{(start|end|length|count|tick|unit)\}/g, function (_, k) { return values[k]; });
    }
    function feedbackClass(key) {
      var value = feedback[key] === undefined ? "" : feedback[key];
      if (!["", "ok", "no"].includes(value)) throw new Error("measure: 反馈样式须为ok/no/空");
      return value;
    }
    function title(key, fallback) { return text(labels[key], fallback); }
    var box = shell(root, current.broken ? "断尺测量台" : "可拖动直尺测量台", 190), svg = box.svg;
    // Keep a single scale across item switches and reserve the full movement envelope.
    var spanLeft = Math.max.apply(null, items.map(function (it) { return it.hi - it.min + tick / 2; }));
    var spanRight = Math.max.apply(null, items.map(function (it) { return max + tick / 2 - it.lo; }));
    var step = 300 / (spanLeft + spanRight + tick), left = 30 + spanLeft * step;
    var object = rect(svg, left, 43, 1, 24, current.color, "object");
    var point = shape("circle", { cx: left, cy: 55, r: 4, fill: "var(--measure-ink)" }, svg);
    var objectLabel = label(svg, left, 61, "", "var(--on-accent)"); objectLabel.setAttribute("data-role", "object-name");
    objectLabel.setAttribute("font-size", 18);
    var arcG = shape("g", { "aria-hidden": "true" }, svg);
    line(svg, left, 68, left, 105, "var(--measure-accent)", true);
    var rightGuide = line(svg, left, 68, left, 105, "var(--measure-accent)", true);
    var slider = shape("g", { class: "measure-slider", tabindex: 0, role: "slider", "aria-label": "左右移动尺子",
      "aria-orientation": "horizontal" }, svg);
    var face = shape("g", {}, slider), zeroAt;
    label(svg, 180, 178, "尺上单位：" + WORD[u]);
    if (cfg.items !== undefined) {
      var choices = node("div", "ctrls", undefined, root);
      root.insertBefore(choices, box.ctr);
      var itemButtons = items.map(function (it, i) { return button(choices, it.name, "item-" + i, function () {
        index = i; current = items[index]; shift = current.start; drag = null; draw();
      }); });
    }
    var edgeButton;
    function addEdge() { edgeButton = button(box.ctr, title("edge", "试试尺头对齐"), "edge", function () { shift = current.edge; drag = null; draw(); }); }
    if (cfg.edgeOnly === true) addEdge();
    var first = button(box.ctr, "", "align", function () { set(current.align); });
    if (items.some(function (it) { return it.at !== undefined; })) {
      var atButton = button(box.ctr, title("alignAt", "对准刻度 " + current.at), "align-at", function () { set(current.at); });
    }
    if (cfg.showEnd !== false) button(box.ctr, title("end", "对准最后起点"), "end", function () { set(current.hi); });
    if (cfg.edgeOnly !== true && items.some(function (it) { return !it.broken; })) addEdge();
    var arcButton = button(box.ctr, title("arcs", "数大格"), "arcs", function () { arcs = !arcs; draw(); });
    button(box.ctr, title("reset", "重来"), "reset", function () { index = initial; current = items[index]; shift = current.start; arcs = cfg.arcs !== false; drag = null; draw(); });
    function set(v) { shift = round(Math.min(current.hi, Math.max(current.moveLo, v))); draw(); }
    function draw() {
      var min = current.min, len = current.length, broken = current.broken, count = Math.round((max - min) / tick);
      zeroAt = left - shift * step;
      clear(face);
      var head = broken ? min - tick / 2 : Math.min(-tick / 2, current.edge);
      rect(face, head * step, 90, (max + tick / 2 - head) * step, 67, "var(--measure-fill)", "ruler");
      if (broken) shape("path", { d: "M" + (head * step) + " 90 l5 12 l-5 12 l5 12 l-5 12", fill: "none", stroke: "var(--measure-ink)", "stroke-width": 2 }, face);
      for (var k = 0; k <= count; k++) {
        var t = round(min + k * tick), x = t * step;
        line(face, x, 90, x, 110).setAttribute("data-tick", t);
        if (k < count) for (var j = 1; j < 10; j++) line(face, x + j * step * tick / 10, 90, x + j * step * tick / 10, j === 5 ? 102 : 96);
      }
      var tickLabels = shape("g", {}, face);
      face.setAttribute("transform", "translate(" + zeroAt + " 0)");
      slider.setAttribute("aria-valuemin", current.lo); slider.setAttribute("aria-valuemax", current.hi);
      slider.setAttribute("aria-valuenow", shift);
      slider.setAttribute("aria-valuetext", "物体左端对着 " + shift + " " + WORD[u]);
      object.setAttribute("width", Math.max(len * step, 0.01)); object.setAttribute("fill", current.color);
      point.setAttribute("visibility", len === 0 ? "visible" : "hidden");
      objectLabel.textContent = cfg.showObjectName === true ? current.objectName : "";
      objectLabel.setAttribute("x", left + len * step / 2);
      rightGuide.setAttribute("x1", left + len * step); rightGuide.setAttribute("x2", left + len * step);
      first.textContent = broken ? title("alignBroken", "对准首个刻度") : title("align", "对准刻度 0");
      if (edgeButton) edgeButton.disabled = broken;
      if (atButton) { atButton.disabled = current.at === undefined; atButton.textContent = title("alignAt", "对准刻度 " + current.at); }
      if (itemButtons) itemButtons.forEach(function (b, i) { onOff(b, i === index); });
      box.caption.textContent = current.name + "：拖动尺子；左右键移一格，Home/End 到两端。屏幕示意不作真实尺寸尺。";
      clear(arcG); onOff(arcButton, arcs); onOff(first, shift === current.align);
      var aligned = shift >= min && integral((shift - min) / tick), end = round(shift + len);
      var candidates = aligned ? [shift, end, min, max] : [min, max], placed = [];
      for (var n = 0; n <= count; n++) candidates.push(round(min + n * tick));
      candidates.forEach(function (value) {
        var width = String(value).length * numeralSize * 0.6, pos = zeroAt + value * step;
        // Keep exact endpoint numerals first; crowded intermediate labels can be read in the readout.
        if (pos - width / 2 < 2 || pos + width / 2 > 358 || placed.some(function (p) { return p.value === value || (cfg.showAllNumerals !== true && Math.abs(p.pos - pos) < (p.width + width) / 2 + 3); })) return;
        var numeral = label(tickLabels, value * step, 139, value);
        numeral.setAttribute("font-size", numeralSize); numeral.setAttribute("data-role", "ruler-label");
        placed.push({ pos: pos, width: width, value: value });
      });
      if (aligned && arcs) for (var i = 0; i < Math.round(len / tick); i++) {
        var ax = left + i * tick * step, w = tick * step;
        shape("path", { d: "M" + ax + " 36 Q" + (ax + w / 2) + " 10 " + (ax + w) + " 36", fill: "none", stroke: "var(--measure-accent)", "stroke-width": 2 }, arcG);
        if (cfg.numberArcs === true) label(arcG, ax + w / 2, 23, i + 1).setAttribute("data-role", "arc-number");
      }
      var say = null;
      if (aligned) {
        if (u === "cm" && tick === 1) say = shift === 0 ? "左端对准刻度零，右端对着刻度" + spoken(len) + "，长" + spoken(len) + "厘米。" : "从刻度" + spoken(shift) + "到刻度" + spoken(end) + "，一共有" + spoken(len) + "大格，长" + spoken(len) + "厘米。";
        else say = "从刻度" + spoken(shift) + "到刻度" + spoken(end) + "，相差" + spoken(len) + WORD[u] + "，长" + spoken(len) + WORD[u] + "。";
      }
      var values = { start: shift, end: end, length: len, count: round(len / tick), tick: tick, unit: WORD[u] };
      var fallback = "左端 {start}，右端 {end}。{end} − {start} = {length} {unit}（{count} 个 {tick} {unit}大格）。";
      box.read.className = "read" + (aligned ? " " + feedbackClass("alignedClass") : " " + feedbackClass("misalignedClass"));
      readout(box, aligned ? message(shift === 0 ? "zero" : "nonzero", fallback, values) : message("misaligned", "尺头边缘不是刻度 0；先把物体左端对准刻度线，再看右端。", values), say);
      object.setAttribute("data-start", shift); object.setAttribute("data-end", end);
      var payload = { start: shift, end: end, length: len, unit: u, cm: convert(len, u, "cm"), aligned: aligned, broken: broken, arcs: arcs };
      if (cfg.items !== undefined) { payload.index = index; payload.name = current.name; }
      change(root, "ruler", payload);
    }
    slider.addEventListener("keydown", function (e) {
      var value;
      if (e.key === "Home") value = current.moveLo;
      if (e.key === "End") value = current.hi;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") value = cfg.edgeOnly === true ? Math.round(shift / tick) * tick + tick : shift < current.min ? current.min : shift + tick;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") value = cfg.edgeOnly === true ? Math.round(shift / tick) * tick - tick : shift <= current.min ? current.moveLo : shift - tick;
      if (value !== undefined) { e.preventDefault(); set(value); }
    });
    var dragSurface = cfg.dragSurface === "stage" ? svg : slider;
    dragSurface.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || drag) return;
      drag = { id: e.pointerId, x: e.clientX, shift: shift };
      try { dragSurface.setPointerCapture(e.pointerId); } catch (error) { /* Synthetic events or older SVG implementations have no pointer capture. */ }
      slider.focus(); e.preventDefault();
    });
    dragSurface.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var width = svg.getBoundingClientRect().width;
      if (!width) return;
      var raw = drag.shift - (e.clientX - drag.x) * 360 / width / step;
      // The blank half-tick remains a reachable counterexample, with the same endpoints as keys.
      set(raw < current.min - tick / 4 && cfg.edgeOnly !== true ? current.moveLo : current.min + Math.round((raw - current.min) / tick) * tick);
    });
    function endDrag(e) { if (drag && e.pointerId === drag.id) drag = null; }
    dragSurface.addEventListener("pointerup", endDrag); dragSurface.addEventListener("pointercancel", endDrag);
    dragSurface.addEventListener("lostpointercapture", endDrag);
    draw();
  }

  function itemList(value, fallback, body) {
    var items = value === undefined ? fallback : value;
    if (!Array.isArray(items) || !items.length || items.length > 8) throw new Error("measure: items须有1至8项");
    return items.map(function (it) {
      if (!it || typeof it !== "object") throw new Error("measure: 物品配置错误");
      var obj = { name: text(it.name, "物品") };
      if (body) {
        obj.value = num(it.value, undefined, 0.001, 100000); obj.unit = unit(it.unit);
        obj.ref = it.ref === undefined ? "kid" : it.ref;
        if (!Object.prototype.hasOwnProperty.call(REF, obj.ref)) throw new Error("measure: 身体参照错误");
        obj.refCm = num(it.refCm, 120, 0.001, 100000);
      } else { obj.cm = num(it.cm, undefined, 0.001, 100000); obj.rope = it.rope === true; }
      return obj;
    });
  }
  function metre(root, cfg) {
    var segment = num(cfg.segmentCm, 10, 1, 100), total = 100 / segment;
    if (!Number.isInteger(total)) throw new Error("measure: 短尺须整分100厘米");
    var initial = num(cfg.count, 1, 0, total);
    if (!Number.isInteger(initial)) throw new Error("measure: 短尺把数须为整数");
    var items = itemList(cfg.items, [{ name: "小板凳", cm: 35 }, { name: "跳绳", cm: 200, rope: true }, { name: "讲桌", cm: 80 }, { name: "长椅", cm: 180 }]);
    var count = initial, unfolded = cfg.unfolded === true, zoom = cfg.zoom === true, idx = 0, straight = false;
    var box = shell(root, "一米尺展开与物品比较", 325), svg = box.svg;
    var unfold = button(box.ctr, "展开米尺", "unfold", function () { unfolded = !unfolded; draw(); });
    var add = button(box.ctr, "铺一把短尺", "add", function () { count = Math.min(total, count + 1); draw(); });
    button(box.ctr, "铺满", "fill", function () { count = total; unfolded = true; draw(); });
    var zoomButton = button(box.ctr, "放大第一把", "zoom", function () { zoom = !zoom; draw(); });
    var choices = node("div", "ctrls", undefined, root), buttons = [];
    items.forEach(function (it, i) { buttons.push(button(choices, it.name, "item-" + i, function () { idx = i; straight = false; draw(); })); });
    var ropeButton = button(choices, "拉直绳子", "straight", function () { straight = !straight; draw(); });
    button(choices, "重来", "reset", function () { count = initial; unfolded = cfg.unfolded === true; zoom = cfg.zoom === true; idx = 0; straight = false; draw(); });
    box.caption.textContent = "短尺首尾相接、不留空隙也不重叠。米尺折起来仍长 1 米；拉直物品，再对齐一端比较。";
    function draw() {
      clear(svg); var it = items[idx], cm = convert(count * segment, "cm", "cm");
      onOff(unfold, unfolded); unfold.textContent = unfolded ? "折回米尺" : "展开米尺";
      onOff(zoomButton, zoom); add.disabled = count === total;
      ropeButton.hidden = !it.rope; onOff(ropeButton, straight);
      ropeButton.textContent = straight ? "盘起绳子" : "拉直绳子";
      buttons.forEach(function (b, i) { onOff(b, i === idx); });
      label(svg, 180, 23, "1 米 = 100 厘米");
      if (unfolded) {
        rect(svg, 20, 56, 320, 43, "var(--measure-fill)", "metre");
        for (var t = 0; t <= 100; t++) {
          var x = 20 + t * 3.2; line(svg, x, 56, x, t % 10 ? 62 : 72);
          if (t % 20 === 0) label(svg, x, 93, t);
        }
        for (var i = 0; i < count; i++) rect(svg, 20 + i * segment * 3.2, 35, segment * 3.2, 14, i % 2 ? "var(--measure-accent)" : "var(--measure-fill)", "segment");
      } else {
        // Each linked panel is 32 drawing units, just as 10 cm on the unfolded ruler.
        for (var k = 0; k < 10; k++) {
          var foldWidth = Math.sqrt(32 * 32 - 6 * 6);
          var fx = k % 2 ? 20 + foldWidth : 20, fy = 37 + k * 6;
          line(svg, fx, fy, k % 2 ? 20 : 20 + foldWidth, fy + 6, "var(--measure-accent)");
        }
        label(svg, 252, 65, "折叠米尺"); label(svg, 252, 92, "10 段相连");
      }
      if (zoom) {
        var zoomTitle = "第一把：0 到 " + segment + " 厘米";
        label(svg, 180, 128, zoomTitle.length > 18 ? "第一把短尺（厘米）" : zoomTitle);
        rect(svg, 20, 141, 320, 43, "var(--measure-fill)", "zoom-ruler");
        var endWidth = String(segment).length * 12;
        for (var z = 0; z < segment; z++) {
          var zx = 20 + z * 320 / segment;
          var ztick = line(svg, zx, 141, zx, 153); ztick.setAttribute("data-value", z);
          if (z === 0 || (z % Math.max(1, Math.ceil(segment / 10)) === 0 && zx + String(z).length * 6 + 6 < 340 - endWidth)) {
            var zlabel = label(svg, zx, 178, z); if (z === 0) zlabel.setAttribute("text-anchor", "start");
          }
        }
        // A fractional endpoint is a real tick even when it is not reached by integer steps.
        var endTick = line(svg, 340, 141, 340, 153); endTick.setAttribute("data-value", segment); endTick.setAttribute("data-role", "zoom-end");
        var endLabel = label(svg, 340, 178, segment); endLabel.setAttribute("text-anchor", "end"); endLabel.setAttribute("data-role", "zoom-end-label");
      } else label(svg, 180, 143, count + " 把 × " + segment + " = " + cm + " 厘米");
      var scale = 310 / Math.max(100, it.cm);
      rect(svg, 25, 202, 100 * scale, 22, "var(--measure-fill)", "reference-metre");
      line(svg, 25, 197, 25, 289, "var(--measure-accent)", true);
      line(svg, 25 + 100 * scale, 197, 25 + 100 * scale, 289, "var(--measure-accent)", true);
      if (it.rope && !straight) shape("path", { d: "M25 262 C55 222 95 296 125 254 C155 224 195 294 215 258", fill: "none", stroke: "var(--measure-accent)", "stroke-width": 4 }, svg);
      else rect(svg, 25, 249, it.cm * scale, 22, "var(--measure-accent)", "comparison-object");
      label(svg, 180, 305, it.rope && !straight ? "盘着的绳子：先拉直" : "物品：" + it.cm + " 厘米");
      var message = count + " 把 " + segment + " 厘米短尺，共 " + cm + " 厘米 = " + convert(cm, "cm", "m") + " 米。" + (it.rope && !straight ? "绳子弯着，不能直接比端点。" : it.name + (it.cm === 100 ? "与1米一样长。" : it.cm > 100 ? "比1米长。" : "比1米短。"));
      var metreSay = count === total && segment === 10 ? "铺满十把十厘米尺，一共是一百厘米，正好是一米！一米等于一百厘米。" : "现在铺了" + spoken(count) + "把" + spoken(segment) + "厘米短尺，共" + spoken(cm) + "厘米，等于" + spoken(convert(cm, "cm", "m")) + "米。";
      readout(box, message, metreSay + (it.rope && !straight ? "绳子弯着，不能直接比端点。" : it.name + (it.cm === 100 ? "与一米一样长。" : it.cm > 100 ? "比一米长。" : "比一米短。")));
      change(root, "metre", { count: count, cm: cm, m: convert(cm, "cm", "m"), unfolded: unfolded, zoom: zoom, index: idx, straight: straight, objectCm: it.cm, comparison: it.rope && !straight ? null : Math.sign(it.cm - 100) });
    }
    draw();
  }

  function body(root, cfg) {
    var items = itemList(cfg.items, [{ name: "大树", value: 9, unit: "m", ref: "kid", refCm: 120 }, { name: "书桌", value: 70, unit: "cm", ref: "kid", refCm: 120 }, { name: "水杯", value: 16, unit: "cm", ref: "hand", refCm: 12 }, { name: "房门", value: 2, unit: "m", ref: "kid", refCm: 120 }], true);
    var initial = num(cfg.index, 0, 0, items.length - 1);
    if (!Number.isInteger(initial)) throw new Error("measure: index须为整数");
    var idx = initial, chosen = items[idx].unit;
    var box = shell(root, "身体参照物与长度单位比较", 240), svg = box.svg;
    var buttons = [];
    items.forEach(function (it, i) { buttons.push(button(box.ctr, it.name, "item-" + i, function () { idx = i; chosen = items[i].unit; draw(); })); });
    var ctr = node("div", "ctrls", undefined, root), units = {};
    ["cm", "m"].forEach(function (u) { units[u] = button(ctr, "试填" + WORD[u], "unit-" + u, function () { chosen = u; draw(); }); });
    button(ctr, "重来", "reset", function () { idx = initial; chosen = items[idx].unit; draw(); });
    box.caption.textContent = "身体尺度是估计，因人而异。两图用同一厘米比例；改变单位会改变实际大小，不是把同一长度换一种写法。";
    function draw() {
      clear(svg); var it = items[idx], cm = convert(it.value, chosen, "cm"), scale = 150 / Math.max(cm, it.refCm);
      var rh = it.refCm * scale, oh = cm * scale;
      buttons.forEach(function (b, i) { onOff(b, idx === i); });
      Object.keys(units).forEach(function (u) { onOff(units[u], chosen === u); });
      label(svg, 180, 24, "试填：" + it.value + " " + WORD[chosen]);
      line(svg, 25, 200, 335, 200);
      rect(svg, 55, 200 - rh, 60, rh, "var(--measure-fill)", "body-reference");
      if (it.ref === "kid" && rh >= 10) {
        var r = rh * 0.12, top = 200 - rh;
        shape("circle", { cx: 85, cy: top + r, r: r, fill: "var(--card)", stroke: "var(--measure-ink)", "stroke-width": 1.5 }, svg);
        shape("path", { d: "M85 " + (top + 2 * r) + " V" + (200 - rh * 0.3) + " M65 " + (200 - rh * 0.55) + " H105 M85 " + (200 - rh * 0.3) + " L70 200 M85 " + (200 - rh * 0.3) + " L100 200", fill: "none", stroke: "var(--measure-ink)", "stroke-width": 2 }, svg);
      }
      rect(svg, 240, 200 - oh, 65, oh, "var(--measure-accent)", "body-object");
      line(svg, 115, 200 - rh, 240, 200 - rh, "var(--measure-accent)", true);
      label(svg, 85, 230, REF[it.ref]); label(svg, 273, 230, "物品");
      var ratio = cm / it.refCm, expected = chosen === it.unit;
      var ratioText = ratio < 0.01 ? "不到 0.01" : "约 " + round(ratio * 100) / 100;
      var message = REF[it.ref] + "约 " + it.refCm + " 厘米；" + it.name + "若为 " + it.value + " " + WORD[chosen] + "，就是 " + cm + " 厘米，是参照的 " + ratioText + " 倍。" + (expected ? "与这个生活情境相符。" : "请结合实际物品想一想，这个大小合理吗？");
      readout(box, message, message);
      change(root, "body", { index: idx, unit: chosen, cm: cm, refCm: it.refCm, ratio: ratio, expected: expected });
    }
    draw();
  }
  var COMPARE_ITEMS = [
    {
      "name": "小板凳",
      "cm": 35,
      "desc": "小板凳高约 35 厘米，比 1 米矮得多。"
    },
    {
      "name": "跳绳",
      "cm": 200,
      "rope": true,
      "desc": "跳绳拉直后大约 2 米长，比 1 米长！"
    },
    {
      "name": "讲桌高",
      "cm": 80,
      "desc": "讲桌高约 80 厘米，比 1 米矮一点。"
    },
    {
      "name": "公园长椅",
      "cm": 180,
      "desc": "公园长椅长约 2 米，比 1 米长！"
    }
  ];
  var YARN_STATES = [
    {
      "key": "flat",
      "name": "横着拉紧",
      "ok": true,
      "d": "M 64 96 L 296 96",
      "lx": 64,
      "ly": 96,
      "rx": 296,
      "ry": 96,
      "title": "横着拉紧：直直的，可以量出长度（是线段 ✓）",
      "say": "拉紧的一根线，直直的，可以量出长度，可以看作一条线段。"
    },
    {
      "key": "loose",
      "name": "松开变弯",
      "ok": false,
      "d": "M 64 96 C 118 40, 175 148, 228 56 C 258 34, 278 130, 296 96",
      "lx": 64,
      "ly": 96,
      "rx": 296,
      "ry": 96,
      "title": "松开毛线：弯弯曲曲的（不是线段 ✗）",
      "say": "松开手后毛线弯弯曲曲的，不是直的，所以不是线段。"
    },
    {
      "key": "tilt",
      "name": "斜着拉紧",
      "ok": true,
      "d": "M 74 124 L 286 58",
      "lx": 74,
      "ly": 124,
      "rx": 286,
      "ry": 58,
      "title": "斜着拉紧：直直的，可以量出长度（也是线段 ✓）",
      "say": "把毛线斜着拉紧，它仍然是直直的、可以量出长度，所以也是线段！"
    },
    {
      "key": "vert",
      "name": "竖着拉紧",
      "ok": true,
      "d": "M 180 42 L 180 132",
      "lx": 180,
      "ly": 42,
      "rx": 180,
      "ry": 132,
      "title": "竖着拉紧：直直的，可以量出长度（也是线段 ✓）",
      "say": "把毛线竖着拉紧，直直的、可以量出长度，同样是一条线段！"
    }
  ];
  var DRAW_SCENES = [
    {
      "key": "draw4",
      "name": "从 0 画 4 厘米",
      "s": 0,
      "e": 4,
      "label": "4 厘米（刻度 0 到 4）",
      "say": "画 4 厘米线段：从刻度 0 开始，沿着尺边直直地画到刻度 4，两头可以点上小圆点表示从哪儿到哪儿。"
    },
    {
      "key": "meas6",
      "name": "量 6 厘米线段",
      "s": 0,
      "e": 6,
      "label": "6 厘米（刻度 0 到 6）",
      "say": "量线段时，左端对准刻度 0，右端对着刻度 6，这条线段长 6 厘米。"
    },
    {
      "key": "from2",
      "name": "从刻度 2 画 5 厘米",
      "s": 2,
      "e": 7,
      "label": "5 厘米（刻度 2 到 7）",
      "say": "从刻度 2 开始画 5 厘米线段，往后数 5 个 1 厘米大格，画到刻度 7（2 + 5 = 7）。"
    },
    {
      "key": "snail",
      "name": "小蜗牛寻宝",
      "snail": true,
      "say": "小蜗牛从刻度 0 出发：在 2 厘米处画红花，6 厘米处画蘑菇，9 厘米处画草莓。"
    }
  ];
  var POLY_SHAPES = [
    {
      "name": "三角形（3条）",
      "title": "三角形：由 3 条线段围成",
      "pts": [
        [
          180,
          42
        ],
        [
          114,
          132
        ],
        [
          246,
          132
        ]
      ],
      "edges": [
        [
          0,
          1,
          "①"
        ],
        [
          1,
          2,
          "②"
        ],
        [
          2,
          0,
          "③"
        ]
      ],
      "say": "三角形有 3 条直直的边，是由 3 条线段围成的。"
    },
    {
      "name": "正方形（4条）",
      "title": "正方形：由 4 条线段围成",
      "pts": [
        [
          132,
          42
        ],
        [
          228,
          42
        ],
        [
          228,
          134
        ],
        [
          132,
          134
        ]
      ],
      "edges": [
        [
          0,
          1,
          "①"
        ],
        [
          1,
          2,
          "②"
        ],
        [
          2,
          3,
          "③"
        ],
        [
          3,
          0,
          "④"
        ]
      ],
      "say": "正方形上、右、下、左一共有 4 条线段。"
    },
    {
      "name": "小房子五边形（5条）",
      "title": "小房子五边形：由 5 条线段围成",
      "pts": [
        [
          180,
          36
        ],
        [
          240,
          76
        ],
        [
          240,
          134
        ],
        [
          120,
          134
        ],
        [
          120,
          76
        ]
      ],
      "edges": [
        [
          0,
          1,
          "①"
        ],
        [
          1,
          2,
          "②"
        ],
        [
          2,
          3,
          "③"
        ],
        [
          3,
          4,
          "④"
        ],
        [
          4,
          0,
          "⑤"
        ]
      ],
      "say": "小房子五边形屋顶 2 条、左右 2 条、底下 1 条，一共由 5 条线段围成。"
    },
    {
      "name": "3个点连线段",
      "title": "3 个点两两相连：一共 3 条线段",
      "pts": [
        [
          180,
          42
        ],
        [
          112,
          132
        ],
        [
          248,
          132
        ]
      ],
      "edges": [
        [
          0,
          1,
          "①"
        ],
        [
          1,
          2,
          "②"
        ],
        [
          0,
          2,
          "③"
        ]
      ],
      "say": "不在同一条线上的 3 个点，每两个点连一条线段，一共能连出 3 条线段。"
    },
    {
      "name": "4个点连线段",
      "title": "4 个点两两相连：外圈 4 条 + 交叉 2 条 = 6 条",
      "pts": [
        [
          124,
          42
        ],
        [
          236,
          42
        ],
        [
          236,
          134
        ],
        [
          124,
          134
        ]
      ],
      "edges": [
        [
          0,
          1,
          "①"
        ],
        [
          1,
          2,
          "②"
        ],
        [
          2,
          3,
          "③"
        ],
        [
          3,
          0,
          "④"
        ],
        [
          0,
          2,
          "⑤"
        ],
        [
          1,
          3,
          "⑥"
        ]
      ],
      "say": "4 个点两两相连：先连外圈 4 条，再连中间交叉的 2 条，一共 6 条线段。"
    }
  ];

  function sourceWords(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || value.length > 600) throw new Error("measure: 源课文字须为纯文本");
    return value;
  }
  function sourceList(value, fallback) {
    var list = value === undefined ? fallback : value;
    if (!Array.isArray(list) || !list.length || list.length > 12) throw new Error("measure: 源课场景须有1至12项");
    return list;
  }
  function sourceColor(value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^var\(--[a-z][a-z0-9-]*\)$/.test(value)) throw new Error("measure: 颜色须为主题变量");
    return value;
  }
  function sourceShape(tag, attrs, parent) {
    if (attrs.style) attrs.style = attrs.style.replace(/font-size:15px/g, "font-size:16px").replace(/#fff\b/g, "var(--on-accent)");
    return shape(tag, attrs, parent);
  }
  function sourceText(svg, x, y, value, style) {
    var n = sourceShape("text", { x: x, y: y, "text-anchor": "middle", style: style || "fill:var(--fg);font-size:16px;font-weight:700" }, svg);
    n.textContent = value;
    return n;
  }
  function sourceBox(root, cfg, title, height, viewBox) {
    var box = shell(root, sourceWords(cfg.ariaLabel, title), height);
    if (viewBox) box.svg.setAttribute("viewBox", viewBox);
    box.caption.hidden = true;
    return box;
  }
  function sourceRead(box, value, say, cls) {
    box.read.className = "read" + (cls ? " " + cls : "");
    readout(box, value, say);
  }
  function sourceIndex(cfg, length) {
    var i = num(cfg.index, 0, 0, length - 1);
    if (!Number.isInteger(i)) throw new Error("measure: 场景编号须为整数");
    return i;
  }
  function sourceChoices(box, states, choose) {
    return states.map(function (s, i) { return button(box.ctr, s.name, "item-" + i, function () { choose(i); }); });
  }
  function metreStick(root, cfg) {
    var segment = num(cfg.segmentCm, 10, 1, 100), total = 100 / segment;
    if (!Number.isInteger(total)) throw new Error("measure: 短尺须整分100厘米");
    var minimum = num(cfg.minCount, 1, 0, total), initial = num(cfg.count, minimum, minimum, total);
    if (!Number.isInteger(initial) || !Number.isInteger(minimum)) throw new Error("measure: 短尺把数须为整数");
    var count = initial, zoom = cfg.zoom === true, labels = cfg.labels || {};
    var box = sourceBox(root, cfg, "米尺：1米等于100厘米", 168), svg = box.svg;
    var add = button(box.ctr, sourceWords(labels.add, "+ 铺 1 把 " + segment + " 厘米尺"), "add", function () { count = Math.min(total, count + 1); draw(); });
    button(box.ctr, sourceWords(labels.fill, "铺满 " + total + " 把"), "fill", function () { count = total; draw(); });
    var zoomButton = button(box.ctr, sourceWords(labels.zoom, "放大看 0～" + segment + " 厘米"), "zoom", function () { zoom = !zoom; draw(); });
    button(box.ctr, sourceWords(labels.reset, "重来"), "reset", function () { count = initial; zoom = cfg.zoom === true; draw(); });
    function draw() {
      clear(svg); onOff(zoomButton, zoom); add.disabled = count === total;
      var x0 = 24, width = segment * 3.12, cm = round(count * segment);
      for (var i = 0; i < count; i++) {
        sourceShape("rect", { x: x0 + i * width + 0.5, y: 18, width: Math.max(width - 1, 0.1), height: 26, rx: 4, style: "fill:" + (i % 2 ? "var(--b)" : "var(--a)") + ";opacity:.88", "data-role": "source-tile" }, svg);
        if (width >= 24 && String(segment).length <= 6) sourceText(svg, x0 + (i + 0.5) * width, 36, segment, "fill:var(--on-accent);font-size:16px;font-weight:700");
      }
      sourceShape("rect", { x: 16, y: 50, width: 328, height: 52, rx: 6, style: "fill:var(--hl-soft);stroke:var(--c);stroke-width:2.5" }, svg);
      for (var t = 0; t <= 100; t++) {
        var x = x0 + t * 3.12, major = t % 10 === 0;
        sourceShape("line", { x1: x, y1: 50, x2: x, y2: major ? 68 : t % 5 ? 57 : 61, style: "stroke:" + (major ? "var(--fg)" : "var(--muted)") + ";stroke-width:" + (major ? 2 : 0.8) }, svg);
        if (major) sourceText(svg, x, 88, t);
      }
      if (zoom) {
        sourceShape("rect", { x: 24, y: 110, width: 312, height: 48, rx: 6, style: "fill:var(--bg);stroke:var(--a);stroke-width:2" }, svg);
        var endWidth = String(segment).length * 9;
        for (var z = 0; z < segment; z++) {
          var zx = 36 + z * 288 / segment;
          sourceShape("line", { x1: zx, y1: 110, x2: zx, y2: 128, style: "stroke:var(--a);stroke-width:2" }, svg);
          if (z === 0 || (z % Math.max(1, Math.ceil(segment / 10)) === 0 && zx + 8 < 324 - endWidth)) sourceText(svg, zx, 148, z);
        }
        sourceShape("line", { x1: 324, y1: 110, x2: 324, y2: 128, style: "stroke:var(--a);stroke-width:2", "data-role": "source-zoom-end", "data-value": segment }, svg);
        var end = sourceText(svg, 324, 148, segment); end.setAttribute("text-anchor", "end");
      } else {
        sourceShape("line", { x1: x0, y1: 118, x2: x0 + cm * 3.12, y2: 118, style: "stroke:var(--a);stroke-width:3" }, svg);
        [x0, x0 + cm * 3.12].forEach(function (x) { sourceShape("line", { x1: x, y1: 112, x2: x, y2: 124, style: "stroke:var(--a);stroke-width:3" }, svg); });
        sourceText(svg, 180, 146, count === total ? total + " 个 " + segment + " 厘米 = 100 厘米 = 1 米" : count + " 个 " + segment + " 厘米 = " + cm + " 厘米", "fill:var(--a);font-size:17px;font-weight:700");
      }
      var full = count === total;
      var say = full ? "铺满" + spoken(total) + "把" + spoken(segment) + "厘米尺，一共是一百厘米，正好是一米！一米等于一百厘米。" : null;
      sourceRead(box, full ? "铺满 " + total + " 把 " + segment + " 厘米尺，一共是 100 厘米，正好是 1 米！1 米 = 100 厘米。" : "现在铺了 " + count + " 把 " + segment + " 厘米短尺，是 " + cm + " 厘米。再铺 " + (total - count) + " 把就满 1 米（100 厘米）。", say, full ? "ok" : "");
      change(root, "metre", { view: "meter", count: count, cm: cm, m: cm / 100, zoom: zoom });
    }
    draw();
  }
  function metreCompare(root, cfg) {
    var items = sourceList(cfg.items, COMPARE_ITEMS).map(function (it) {
      if (!it || typeof it !== "object") throw new Error("measure: 比较物品配置错误");
      return { name: text(it.name, "物品"), cm: num(it.cm, undefined, 0.001, 100000), rope: it.rope === true, desc: sourceWords(it.desc, text(it.name, "物品")), color: sourceColor(it.color, null) };
    });
    var initial = sourceIndex(cfg, items.length), index = initial, straight = false;
    var longest = Math.max.apply(null, [100].concat(items.map(function (it) { return it.cm; })));
    var scale = num(cfg.scale, Math.min(1.35, 270 / longest), 0.00001, 2.7);
    if (56 + longest * scale > 344) throw new Error("measure: 物品须在比较图范围内");
    var labels = cfg.labels || {}, box = sourceBox(root, cfg, "和1米比长短高矮", 178, "0 -6 360 178"), svg = box.svg;
    var choices = sourceChoices(box, items, function (i) { index = i; straight = false; draw(); });
    var rope = button(box.ctr, sourceWords(labels.straight, "拉直跳绳"), "straight", function () { straight = !straight; draw(); });
    button(box.ctr, sourceWords(labels.reset, "重来"), "reset", function () { index = initial; straight = false; draw(); });
    function draw() {
      clear(svg); var it = items[index], x0 = 56, width = 100 * scale;
      choices.forEach(function (b, i) { onOff(b, i === index); }); rope.style.display = it.rope ? "" : "none"; onOff(rope, straight);
      sourceShape("rect", { x: x0, y: 28, width: width, height: 28, rx: 5, style: "fill:var(--hl-soft);stroke:var(--c);stroke-width:2.5", "data-role": "source-reference" }, svg);
      sourceText(svg, x0 + width / 2, 48, "1 米尺（100 厘米）", "fill:var(--c);font-size:16px;font-weight:700");
      sourceShape("line", { x1: x0 + width, y1: 25, x2: x0 + width, y2: 152, style: "stroke:var(--c);stroke-width:2;stroke-dasharray:5 4" }, svg);
      sourceText(svg, x0 + width, 18, "1 米线", "fill:var(--c);font-size:16px;font-weight:700");
      var coiled = it.rope && !straight;
      if (coiled) {
        sourceShape("path", { d: "M56 110 C86 70, 116 150, 146 105 C166 75, 126 140, 161 115", style: "fill:none;stroke:var(--a);stroke-width:5;stroke-linecap:round" }, svg);
        sourceText(svg, 180, 154, sourceWords(labels.coiled, "盘着的跳绳（点「拉直跳绳」）"), "fill:var(--a);font-size:16px;font-weight:700");
        sourceRead(box, sourceWords(cfg.coiledText, "跳绳盘在一起看着短，点「拉直跳绳」看看它真正有多长！"), null, "");
      } else {
        var w = it.cm * scale, color = it.color || (it.cm > 100 ? "var(--a)" : "var(--b)");
        sourceShape("rect", { x: x0, y: 92, width: w, height: 32, rx: 6, style: "fill:" + color + ";opacity:.88", "data-role": "source-comparison" }, svg);
        sourceText(svg, x0 + Math.max(w / 2, 48), 114, it.name, "fill:var(--on-accent);font-size:16px;font-weight:700");
        sourceText(svg, x0 + w / 2, 148, it.cm > 100 ? "比 1 米长" : it.cm === 100 ? "和 1 米一样长" : "比 1 米短（矮）", "fill:" + color + ";font-size:16px;font-weight:700");
        sourceRead(box, it.desc, it.desc, "ok");
      }
      change(root, "metre", { view: "compare", index: index, cm: it.cm, straight: straight, comparison: coiled ? null : Math.sign(it.cm - 100), scale: scale });
    }
    draw();
  }
  function scenePanel(root, cfg, mode, defaults, title, height, render) {
    var states = sourceList(cfg.states, defaults), initial = sourceIndex(cfg, states.length), index = initial;
    states.forEach(function (s) {
      if (!s || typeof s !== "object") throw new Error("measure: 源课场景配置错误");
      sourceWords(s.name, "场景"); sourceWords(s.say, "");
    });
    var box = sourceBox(root, cfg, title, height);
    var choices = sourceChoices(box, states, function (i) { index = i; draw(); });
    if (cfg.reset === true) button(box.ctr, "重来", "reset", function () { index = initial; draw(); });
    function draw() {
      clear(box.svg); choices.forEach(function (b, i) { onOff(b, i === index); });
      var payload = render(box.svg, states[index]);
      sourceRead(box, states[index].say, states[index].say || null, payload.straight === false ? "warn" : "ok");
      change(root, mode, Object.assign({ index: index }, payload));
    }
    draw();
  }
  function yarn(root, cfg) {
    var states = sourceList(cfg.states, YARN_STATES);
    states.forEach(function (s) {
      if (!s || typeof s.d !== "string" || s.d.length > 1200 || !/^[MLCQHVZmlcqhvz0-9eE+.,\s-]+$/.test(s.d) || !((s.d.match(/[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi) || []).every(function (n) { return Number.isFinite(Number(n)); }))) throw new Error("measure: 毛线须为有限SVG路径");
      [s.lx, s.rx].forEach(function (v) { num(v, undefined, 0, 360); });
      [s.ly, s.ry].forEach(function (v) { num(v, undefined, 0, 164); });
      if (typeof s.ok !== "boolean") throw new Error("measure: 毛线须注明是否拉直");
      var coordinates = s.d.match(/[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi).map(Number);
      if (s.ok === /[CQcq]/.test(s.d) || (s.ok && (!/^\s*M[\d.eE+,\s-]+L[\d.eE+,\s-]+$/.test(s.d) || coordinates.length !== 4)) || coordinates[0] !== s.lx || coordinates[1] !== s.ly || coordinates[coordinates.length - 2] !== s.rx || coordinates[coordinates.length - 1] !== s.ry) throw new Error("measure: 直曲判断与路径端点须一致");
      sourceWords(s.title, "");
    });
    scenePanel(root, Object.assign({}, cfg, { states: states }), "yarn", YARN_STATES, "拉紧毛线认识线段", 164, function (svg, s) {
      var color = s.ok ? "var(--a)" : "var(--no)";
      sourceText(svg, 180, 24, s.title, "fill:" + color + ";font-size:16px;font-weight:700");
      sourceShape("path", { d: s.d, style: "fill:none;stroke:" + color + ";stroke-width:5;stroke-linecap:round", "data-role": "yarn" }, svg);
      if (s.ok) {
        [[s.lx, s.ly], [s.rx, s.ry]].forEach(function (p) { sourceShape("circle", { cx: p[0], cy: p[1], r: 6, style: "fill:var(--fg);stroke:var(--on-accent);stroke-width:2" }, svg); });
        sourceText(svg, s.lx + (s.key === "vert" ? -42 : 0), s.ly + (s.key === "vert" ? 5 : -14), "左头");
        sourceText(svg, s.rx + (s.key === "vert" ? 42 : 0), s.ry + (s.key === "vert" ? 5 : -14), "右头");
      }
      sourceText(svg, 180, 152, s.ok ? "特点：直的 · 可以量出长度" : "弯弯的线不是线段，拉紧变直才是线段", "fill:var(--muted);font-size:16px;font-weight:700");
      return { key: s.key, straight: s.ok, endpoints: [[s.lx, s.ly], [s.rx, s.ry]] };
    });
  }
  function drawseg(root, cfg) {
    var states = sourceList(cfg.states, DRAW_SCENES), max = num(cfg.max, 10, 1, 20);
    if (!Number.isInteger(max)) throw new Error("measure: 画线段尺格数须为整数");
    var markers = cfg.markers === undefined ? [{ cm: 0, t: "起点0", color: "var(--fg)" }, { cm: 2, t: "2cm红花", color: "var(--no)" }, { cm: 6, t: "6cm蘑菇", color: "var(--c)" }, { cm: 9, t: "9cm草莓", color: "var(--a)" }] : sourceList(cfg.markers, []);
    markers = markers.map(function (p) { return { cm: num(p.cm, undefined, 0, max), t: sourceWords(p.t, ""), color: sourceColor(p.color, "var(--a)") }; });
    states.forEach(function (s) { if (!s.snail) { num(s.s, undefined, 0, max); num(s.e, undefined, s.s, max); sourceWords(s.label, ""); } });
    scenePanel(root, Object.assign({}, cfg, { states: states }), "drawseg", DRAW_SCENES, "用尺子量线段和画线段", 176, function (svg, s) {
      var x0 = 32, step = 296 / max;
      sourceShape("rect", { x: 16, y: 100, width: 328, height: 56, rx: 6, style: "fill:var(--hl-soft);stroke:var(--c);stroke-width:2" }, svg);
      for (var c = 0; c <= max; c++) {
        var x = x0 + c * step;
        sourceShape("line", { x1: x, y1: 100, x2: x, y2: 118, style: "stroke:var(--fg);stroke-width:2" }, svg);
        if (c < max) sourceShape("line", { x1: x + step / 2, y1: 100, x2: x + step / 2, y2: 111, style: "stroke:var(--muted);stroke-width:1.2" }, svg);
        sourceText(svg, x, 140, c);
      }
      if (s.snail) {
        sourceShape("line", { x1: x0, y1: 68, x2: x0 + max * step, y2: 68, style: "stroke:var(--a);stroke-width:4", "data-role": "draw-segment" }, svg);
        markers.forEach(function (p) {
          var x = x0 + p.cm * step;
          sourceShape("line", { x1: x, y1: 68, x2: x, y2: 100, style: "stroke:" + p.color + ";stroke-width:1.8;stroke-dasharray:4 3" }, svg);
          sourceShape("circle", { cx: x, cy: 68, r: 6, style: "fill:" + p.color, "data-cm": p.cm }, svg);
          sourceText(svg, x + (p.cm === 0 ? 10 : 0), 42, p.t, "fill:" + p.color + ";font-size:16px;font-weight:700");
        });
      } else {
        var a = x0 + s.s * step, b = x0 + s.e * step;
        [a, b].forEach(function (x) { sourceShape("line", { x1: x, y1: 66, x2: x, y2: 100, style: "stroke:var(--a);stroke-width:2;stroke-dasharray:4 3" }, svg); });
        sourceShape("line", { x1: a, y1: 66, x2: b, y2: 66, style: "stroke:var(--a);stroke-width:5", "data-role": "draw-segment" }, svg);
        [a, b].forEach(function (x) { sourceShape("circle", { cx: x, cy: 66, r: 6, style: "fill:var(--fg);stroke:var(--on-accent);stroke-width:1.5" }, svg); });
        sourceText(svg, (a + b) / 2, 38, s.label, "fill:var(--a);font-size:16px;font-weight:700");
      }
      return { key: s.key, start: s.snail ? null : s.s, end: s.snail ? null : s.e, length: s.snail ? null : round(s.e - s.s), markers: s.snail ? markers.map(function (p) { return p.cm; }) : [] };
    });
  }
  function poly(root, cfg) {
    var states = sourceList(cfg.states, POLY_SHAPES), colors = cfg.colors === undefined ? ["var(--a)", "var(--b)", "var(--c)", "var(--no)", "var(--a)", "var(--b)"] : sourceList(cfg.colors, []);
    colors = colors.map(function (c) { return sourceColor(c, "var(--a)"); });
    states.forEach(function (s) {
      if (!Array.isArray(s.pts) || s.pts.length < 2 || s.pts.length > 10 || !Array.isArray(s.edges) || !s.edges.length || s.edges.length > 45) throw new Error("measure: 线段图须有点和边");
      s.pts.forEach(function (p) { if (!Array.isArray(p) || p.length !== 2) throw new Error("measure: 点须为坐标对"); num(p[0], undefined, 0, 360); num(p[1], undefined, 0, 166); });
      if (new Set(s.pts.map(function (p) { return p.join(":"); })).size !== s.pts.length) throw new Error("measure: 连线段的点须互不重合");
      var used = new Set();
      s.edges.forEach(function (e) {
        if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || e[0] < 0 || e[1] < 0 || e[0] >= s.pts.length || e[1] >= s.pts.length || e[0] === e[1]) throw new Error("measure: 边须连接两个不同点");
        var pair = [e[0], e[1]].sort(function (a, b) { return a - b; }).join(":");
        if (used.has(pair)) throw new Error("measure: 同一线段不能重复计数");
        used.add(pair); sourceWords(e[2], "");
      });
      sourceWords(s.title, "");
    });
    scenePanel(root, Object.assign({}, cfg, { states: states }), "poly", POLY_SHAPES, "数图形里的线段和连线段", 166, function (svg, s) {
      sourceText(svg, 180, 22, s.title, "fill:var(--a);font-size:16px;font-weight:700");
      s.edges.forEach(function (e, i) {
        var a = s.pts[e[0]], b = s.pts[e[1]], color = colors[i % colors.length];
        sourceShape("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], style: "stroke:" + color + ";stroke-width:4", "data-role": "poly-edge" }, svg);
        var x = (a[0] + b[0]) / 2, y = (a[1] + b[1]) / 2;
        if (i === 4) { x -= 20; y -= 6; } if (i === 5) { x += 20; y -= 6; }
        sourceText(svg, x, y - 4, e[2], "fill:" + color + ";font-size:16px;font-weight:700");
      });
      s.pts.forEach(function (p) { sourceShape("circle", { cx: p[0], cy: p[1], r: 6, style: "fill:var(--fg);stroke:var(--on-accent);stroke-width:1.8" }, svg); });
      return { points: s.pts.length, segments: s.edges.length };
    });
  }

  var REF_ITEMS = [
    {
      "name": "大香樟树高 9 ＿",
      "shortName": "大香樟树",
      "num": 9,
      "good": "m",
      "ref": "kid",
      "refCm": 120,
      "refTxt": "小朋友≈1米20厘米",
      "cmSay": "如果填 9 厘米：1 厘米只有食指宽，9 厘米比一拃（12 厘米）还短，在小朋友脚边只有一点点高，大树不可能这么矮！",
      "mSay": "如果填 9 米：小朋友身高约 1 米 20 厘米，9 米大约有 7～8 个小朋友叠起来那么高，大香樟树高 9 米很合理！"
    },
    {
      "name": "书桌高 70 ＿",
      "shortName": "书桌",
      "num": 70,
      "good": "cm",
      "ref": "kid",
      "refCm": 120,
      "refTxt": "小朋友≈1米20厘米",
      "cmSay": "如果填 70 厘米：1 米是 100 厘米，70 厘米比 1 米矮一些，正好到小朋友胸口下方，合理！",
      "mSay": "如果填 70 米：大香樟树才 9 米高，70 米有二十多层楼高，小朋友在旁边小得像小点，书桌不可能比大楼还高！"
    },
    {
      "name": "水杯高 16 ＿",
      "shortName": "保温水杯",
      "num": 16,
      "good": "cm",
      "ref": "hand",
      "refCm": 12,
      "refTxt": "一拃≈12厘米",
      "cmSay": "如果填 16 厘米：小朋友一拃约 12 厘米，水杯比一拃高一点点，16 厘米刚刚好！",
      "mSay": "如果填 16 米：16 米比五层楼还要高，一拃在旁边连一条细线都不到了，水杯怎么可能像大楼一样高？"
    },
    {
      "name": "卧室门高 2 ＿",
      "shortName": "卧室门",
      "num": 2,
      "good": "m",
      "ref": "kid",
      "refCm": 120,
      "refTxt": "小朋友≈1米20厘米",
      "cmSay": "如果填 2 厘米：2 厘米只有两根手指那么宽，在小朋友脚底只有薄薄一层，连小猫咪都钻不过去！",
      "mSay": "如果填 2 米：小朋友高 1 米 20 厘米，卧室门高 2 米，比小朋友高一截，大人小孩都能轻松进出！"
    }
  ];
  function bodySource(root, cfg) {
    var el = sourceShape;
    function hb(label, action, fn) { var b = node("button", "", label); b.type = "button"; b.dataset.action = action; b.addEventListener("click", fn); return b; }
    function setRead(n, value, say, cls) { sourceRead({ read: n }, value, say, cls); }

    styles();
    var ITEMS = sourceList(cfg.items, REF_ITEMS).map(function (it, i) {
      if (!it || typeof it !== "object" || !["cm", "m"].includes(it.good) || !["kid", "hand"].includes(it.ref)) throw new Error("measure: 原身体参照物配置错误");
      var example = num(it.example, i, 0, 3);
      if (!Number.isInteger(example)) throw new Error("measure: 原辅助图编号须为整数");
      return { name: sourceWords(it.name, "物品"), shortName: sourceWords(it.shortName, it.name), num: num(it.num, undefined, 0.001, 100000), good: it.good, ref: it.ref, refCm: num(it.refCm, undefined, 0.001, 100000), refTxt: sourceWords(it.refTxt, ""), cmSay: sourceWords(it.cmSay, ""), mSay: sourceWords(it.mSay, ""), example: example };
    });
    var initial = sourceIndex(cfg, ITEMS.length), initialUnit = cfg.unit === undefined ? ITEMS[initial].good : cfg.unit;
    if (!["cm", "m"].includes(initialUnit)) throw new Error("measure: 原身体参照单位须为cm/m");
    var st = { idx: initial, unit: initialUnit }, labels = cfg.labels || {};
    var svg = el("svg", { class: "stage", viewBox: "0 0 360 176", role: "group", "aria-label": "参照物比一比选长度单位" }, root);
    var ctr1 = document.createElement("div"); ctr1.className = "ctrls";
    var ctr2 = document.createElement("div"); ctr2.className = "ctrls";
    var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");

    var itemBtns = ITEMS.map(function (it, i) {
      var b = hb(it.name, "item-" + i, function () { st.idx = i; st.unit = it.good; draw(); });
      ctr1.appendChild(b); return b;
    });
    var bCm = hb(sourceWords(labels.cm, "试填「厘米」"), "unit-cm", function () { st.unit = "cm"; draw(); });
    var bM = hb(sourceWords(labels.m, "试填「米」"), "unit-m", function () { st.unit = "m"; draw(); });
    ctr2.appendChild(bCm); ctr2.appendChild(bM);
    if (cfg.reset === true) ctr2.appendChild(hb("重来", "reset", function () { st.idx = initial; st.unit = initialUnit; draw(); }));
    root.appendChild(ctr1); root.appendChild(ctr2); root.appendChild(read);

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var it = ITEMS[st.idx];
      var unitWord = st.unit === "cm" ? "厘米" : "米";
      var ok = st.unit === it.good;
      itemBtns.forEach(function (b, i) { b.setAttribute("aria-pressed", i === st.idx ? "true" : "false"); });
      bCm.setAttribute("aria-pressed", st.unit === "cm" ? "true" : "false");
      bM.setAttribute("aria-pressed", st.unit === "m" ? "true" : "false");

      // 标题与地面线
      var groundY = 154, maxH = 108;
      el("text", { x: 180, y: 20, "text-anchor": "middle", style: "fill:" + (ok ? "var(--a)" : "var(--no)") + ";font-size:16px;font-weight:700" }, svg).textContent = it.shortName + "高 " + it.num + " " + unitWord + (ok ? "（合理 ✓）" : "（不对 ✗）");
      el("line", { x1: 20, y1: groundY, x2: 340, y2: groundY, style: "stroke:var(--muted);stroke-width:2" }, svg);

      // 共同真实比例：以同屏最高者对应 maxH (108 绘图单位)，保证被测物与参照物严格按真实厘米比绘制
      var refCm = it.refCm;
      var objCm = st.unit === "cm" ? it.num : it.num * 100;
      var scale = maxH / Math.max(refCm, objCm);
      var refH = +(refCm * scale).toFixed(2);
      var objH = +(objCm * scale).toFixed(2);
      var refTopY = +(groundY - refH).toFixed(2);
      var objTopY = +(groundY - objH).toFixed(2);

      // 左侧参照物（矩形高度与人形头顶到地面高度均为 refH）
      el("rect", { "data-role": "ref", x: 56, y: refTopY, width: 56, height: refH, rx: Math.min(5, refH / 2), style: "fill:var(--hl-soft);stroke:var(--b);stroke-width:1.8" }, svg);
      if (it.ref === "kid" && refH >= 12) {
        var r = +(refH * 0.14).toFixed(2), headCy = +(refTopY + r).toFixed(2);
        var neckY = +(refTopY + 2 * r).toFixed(2), hipY = +(groundY - refH * 0.36).toFixed(2);
        var armY = +(groundY - refH * 0.56).toFixed(2), armW = +(Math.min(14, refH * 0.22)).toFixed(2), legW = +(Math.min(8, refH * 0.12)).toFixed(2);
        el("circle", { cx: 84, cy: headCy, r: r, style: "fill:var(--bg);stroke:var(--fg);stroke-width:1.6" }, svg);
        el("path", { d: "M84 " + neckY + " L84 " + hipY + " M" + (84 - armW) + " " + armY + " L" + (84 + armW) + " " + armY + " M84 " + hipY + " L" + (84 - legW) + " " + groundY + " M84 " + hipY + " L" + (84 + legW) + " " + groundY, style: "fill:none;stroke:var(--fg);stroke-width:1.8;stroke-linecap:round" }, svg);
      }
      el("text", { x: 84, y: Math.max(38, +(refTopY - 6).toFixed(1)), "text-anchor": "middle", style: "fill:var(--fg);font-size:13px;font-weight:700" }, svg).textContent = it.refTxt;

      // 中部等比例标尺/对比辅助线
      if (it.example === 0 && st.unit === "m") {
        for (var k = 1; k <= 7; k++) {
          if (k === 4) continue;
          var ky = +(groundY - k * refH).toFixed(1);
          el("line", { x1: 138, y1: ky, x2: 220, y2: ky, style: "stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3" }, svg);
        }
        el("text", { x: 176, y: 100, "text-anchor": "middle", style: "fill:var(--a);font-size:12.5px;font-weight:700" }, svg).textContent = "约7～8个小朋友高";
      } else if (it.example === 0 && st.unit === "cm") {
        el("line", { x1: 112, y1: objTopY, x2: 224, y2: objTopY, style: "stroke:var(--no);stroke-width:1.5;stroke-dasharray:3 3" }, svg);
        el("text", { x: 168, y: 140, "text-anchor": "middle", style: "fill:var(--no);font-size:13px;font-weight:700" }, svg).textContent = "不到脚面高";
      } else if (it.example === 1 && st.unit === "cm") {
        var y1m = +(groundY - 100 * scale).toFixed(1);
        el("line", { x1: 56, y1: y1m, x2: 308, y2: y1m, style: "stroke:var(--c);stroke-width:1.5;stroke-dasharray:4 3" }, svg);
        el("text", { x: 168, y: +(y1m - 5).toFixed(1), "text-anchor": "middle", style: "fill:var(--c);font-size:13px;font-weight:700" }, svg).textContent = "1米线（100厘米）";
      } else if (it.example === 1 && st.unit === "m") {
        el("text", { x: 168, y: 98, "text-anchor": "middle", style: "fill:var(--no);font-size:13px;font-weight:700" }, svg).textContent = "约23层楼高！";
      } else if (it.example === 2 && st.unit === "cm") {
        el("line", { x1: 112, y1: refTopY, x2: 224, y2: refTopY, style: "stroke:var(--a);stroke-width:1.5;stroke-dasharray:3 3" }, svg);
        el("text", { x: 168, y: +(refTopY - 5).toFixed(1), "text-anchor": "middle", style: "fill:var(--a);font-size:13px;font-weight:700" }, svg).textContent = "比一拃高一点";
      } else if (it.example === 2 && st.unit === "m") {
        el("text", { x: 168, y: 98, "text-anchor": "middle", style: "fill:var(--no);font-size:13px;font-weight:700" }, svg).textContent = "约5层楼高！";
      } else if (it.example === 3 && st.unit === "m") {
        el("line", { x1: 112, y1: refTopY, x2: 224, y2: refTopY, style: "stroke:var(--a);stroke-width:1.5;stroke-dasharray:3 3" }, svg);
        el("text", { x: 168, y: +(refTopY - 5).toFixed(1), "text-anchor": "middle", style: "fill:var(--a);font-size:13px;font-weight:700" }, svg).textContent = "比小朋友高一截";
      } else {
        el("text", { x: 168, y: 140, "text-anchor": "middle", style: "fill:var(--no);font-size:13px;font-weight:700" }, svg).textContent = "才2个手指宽";
      }

      // 右侧被测物体示意（严格按共同比例 objH 绘制）
      var col = ok ? "var(--a)" : "var(--no)";
      el("rect", { "data-role": "obj", x: 224, y: objTopY, width: 84, height: objH, rx: Math.min(6, objH / 2), style: "fill:" + col + ";opacity:.85" }, svg);
      el("text", { x: 266, y: Math.max(38, +(objTopY - 6).toFixed(1)), "text-anchor": "middle", style: "fill:" + col + ";font-size:14px;font-weight:700" }, svg).textContent = it.shortName + "：" + it.num + unitWord;

      var say = st.unit === "cm" ? it.cmSay : it.mSay;
      setRead(read, say, say, ok ? "ok" : "warn");
      change(root, "body", { view: "source", index: st.idx, unit: st.unit, cm: objCm, refCm: refCm, ratio: objCm / refCm, expected: ok, objectHeight: objH, referenceHeight: refH });
    }
    draw();
  }

  window.PeiyuManip.register("measure", function (root, cfg) {
    var mode = cfg.mode === undefined ? "ruler" : cfg.mode;
    if (mode === "onecm") onecm(root, cfg);
    else if (mode === "ruler") ruler(root, cfg);
    else if (mode === "metre") {
      if (cfg.view === "meter") metreStick(root, cfg);
      else if (cfg.view === "compare") metreCompare(root, cfg);
      else if (cfg.view === undefined) metre(root, cfg);
      else throw new Error("measure: metre view须为meter/compare或省略");
    }
    else if (mode === "body") {
      if (cfg.view === "source") bodySource(root, cfg);
      else if (cfg.view === undefined) body(root, cfg);
      else throw new Error("measure: body view须为source或省略");
    }
    else if (mode === "yarn") yarn(root, cfg);
    else if (mode === "drawseg") drawseg(root, cfg);
    else if (mode === "poly") poly(root, cfg);
    else throw new Error("measure: mode须为onecm/ruler/metre/body/yarn/drawseg/poly");
  });
})();
