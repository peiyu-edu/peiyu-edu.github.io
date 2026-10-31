/* Reusable solids, extracted from p1a-u3-1 (sort/roll), p1a-u3-2
 * (stable/tower), p1a-u3-3 (join/layers); observation follows p3a-u1,
 * p5a-u1 through cubeview's public data-manip mounting interface.
 * Load primary.js, manip.js, cubeview.js, then this file, in that order.
 * Literal kind: solids. data-cfg is an object; no HTML is accepted.
 * mode: sort (default), roll, stable, tower, join, layers, views.
 * sort: eight everyday objects, automatic sorting, model toggle.
 * roll: six objects/orientations, push/roll toggle including tapered cup.
 * stable: four support arrangements, release/restore toggle. Qualitative
 *          disturbance experiment, not a universal mechanical stability test.
 * tower: same eight solids, flat/tall/uncontained ball, heights 6/9/8 units.
 * join: two/four/eight cubes or two equal-radius cylinders, join/split.
 * layers: three piles of 4/5/6 cubes, lift/replace the upper layer.
 * views: g (rectangular height grid, 1..3 rows/cols, entries 0..maxH),
 *        or objs [{n,g}, ...] (up to 6); default three asymmetric objects.
 *        Objects may differ in size; missing back rows/right columns are zero
 *        on their shared editable board. Original cell coordinates stay fixed.
 *        edit default true; maxH integer 1..4 default 3. Invalid grids fall
 *        back to the default objects. Front row is g[0], left-to-right cols.
 * Source-compatible cfg: {mode, profile:"p1a-u3", records?, content?, stage?}.
 * The six source modes retain native controls, geometry, say and interact logs.
 * records optionally overrides text fields in the fixed source inventory by
 * index (name/act/desc/msg/tag/joinedMsg/splitMsg/msgLift/msgDown). content is a
 * plain-text dictionary keyed by the exact final readout/control/SVG string.
 * Both accept strings of at most 2000 characters, without HTML. Model IDs,
 * counts and mathematical geometry cannot be replaced by text overrides.
 * stage optionally sets viewBox (four finite numbers, abs<=2000, positive size),
 * label (plain text), role (img/group). Invalid entries keep source defaults.
 * Omit profile to keep the established seven modes and views cfg unchanged.
 * All modes reset to their initial configuration; native buttons support
 * pointer/touch and Enter/Space. cubeview also supports drag and arrow keys.
 * Default modes bubble manip:change with {mode,...state}; views keeps
 * cubeview's {obj,g,count,dir,ok}. The source profile keeps its original
 * interact logs. No answer or learning-schema writes.
 */
(function () {
  "use strict";
  if (!window.PeiyuManip) return;
  var M = window.PeiyuManip, U = M.util;
  var NAMES = ["长方体", "正方体", "圆柱", "球"];
  var ITEMS = [
    ["纸巾盒", 0, "长长方方，有平平的面。"],
    ["厚画册", 0, "扁扁的画册也是长方体。"],
    ["魔方", 1, "六个面都是一样大的正方形。"],
    ["方礼盒", 1, "每条棱一样长，每个面一样大。"],
    ["直筒罐", 2, "两头圆圆平平，上下一样粗。"],
    ["硬币", 2, "虽然很矮，两头仍是一样大的圆，上下一样粗。"],
    ["皮球", 3, "圆圆鼓鼓，没有平平的面。"],
    ["玻璃珠", 3, "大小不改变形状，小玻璃珠也是球。"]
  ];
  function h(tag, cls, text, parent) {
    var n = document.createElement(tag); n.className = cls || "";
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n); return n;
  }
  function svg(parent, label, height) {
    return U.el("svg", { viewBox: "0 0 320 " + (height || 210), class: "stage", role: "img", "aria-label": label }, parent);
  }
  function rect(g, x, y, w, height, fill) {
    return U.el("rect", { x: x, y: y, width: w, height: height, fill: fill || "var(--a)", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
  }
  function cube(g, x, y, w, height, depth, fill) {
    var dx = depth * 0.38, dy = depth * 0.3;
    U.el("polygon", { points: [x,y,x+dx,y-dy,x+w+dx,y-dy,x+w,y].join(" "), fill: "var(--ok-soft)", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
    rect(g, x, y, w, height, fill);
    U.el("polygon", { points: [x+w,y,x+w+dx,y-dy,x+w+dx,y+height-dy,x+w,y+height].join(" "), fill: "var(--c)", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
  }
  function ball(g, x, y, r) {
    U.el("circle", { cx: x, cy: y, r: r, fill: "var(--b)", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
    U.el("path", { d: "M"+(x-r*.6)+" "+y+" Q"+x+" "+(y-r*.8)+" "+(x+r*.6)+" "+y, fill: "none", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
  }
  function cylinder(g, x, y, w, height) {
    rect(g, x, y, w, height, "var(--b)");
    U.el("ellipse", { cx: x+w/2, cy: y+Math.min(5,height/4), rx: w/2, ry: Math.min(5,height/4), fill: "var(--hl-soft)", stroke: "var(--fg)", "stroke-width": 1.5 }, g);
  }
  function shape(g, kind, x, y, small) {
    if (kind === 3) ball(g,x+40,y+30,small ? 15 : 27);
    else if (kind === 2) cylinder(g,x+10,y+5,60,small ? 12 : 54);
    else cube(g,x+10,y+10,kind === 1 ? 44 : 64,kind === 1 ? 44 : (small ? 15 : 30),kind === 1 ? 44 : 28);
  }
  function css() {
    if (document.getElementById("solids-css")) return;
    h("style", "", '.manip[data-manip="solids"]:not([data-solids-native]){--solid-gap:10px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-items,.manip[data-manip="solids"]:not([data-solids-native]) .so-bins{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--solid-gap);margin:12px 0}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-item{min-width:0;min-height:110px;display:flex;flex-direction:column;align-items:center;font:inherit;font-size:16px;background:var(--card);color:var(--fg);border:2px solid var(--line);border-radius:12px;padding:8px;cursor:pointer}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-item[aria-pressed="true"]{border-color:var(--a)}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-item svg{width:100px;height:78px;display:block}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-bin{border:1px solid var(--line);border-radius:10px;padding:10px;min-width:0;font-size:16px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .so-bin p{font-size:16px;margin:4px 0}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) button:focus-visible{outline:3px solid var(--hl);outline-offset:3px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .read,.manip[data-manip="solids"]:not([data-solids-native]) .hint{font-size:16px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) svg.stage{width:100%;max-width:400px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .ctrls{flex-wrap:wrap}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) .ctrls button{font-size:16px;min-height:44px}' +
      '.manip[data-manip="solids"]:not([data-solids-native]) [data-manip="cubeview"] .cv-views button{min-width:80px}' +
      '.manip[data-solids-native] svg .mv{transition:transform .45s ease,opacity .35s ease}' +
      '.manip:is([data-solids-native="stable"],[data-solids-native="tower"]){max-width:100%;overflow-x:auto}' +
      '.manip:is([data-solids-native="stable"],[data-solids-native="tower"]) svg.stage{min-width:392px}' +
      '.manip:is([data-solids-native="stable"],[data-solids-native="tower"]) svg .mv{transform-box:fill-box;transform-origin:center bottom}' , document.head).id = "solids-css";
  }
  function panel(root, mode) {
    var ctr = h("div", "ctrls", null, root), read = h("p", "read", null, root);
    read.setAttribute("aria-live", "polite");
    return {
      button: function (label, fn) { return ctr.appendChild(U.btn(label, fn)); },
      read: function (text, state) { read.textContent = text; U.emit(root, Object.assign({mode:mode}, state)); },
      choices: function (names, fn) {
        var bs = names.map(function (name,i) { return ctr.appendChild(U.btn(name, function () { fn(i); })); });
        return function (i) { bs.forEach(function (b,j) { b.setAttribute("aria-pressed",String(i===j)); }); };
      }
    };
  }
  function sort(root) {
    var grid = h("div", "so-items", null, root), bins = h("div", "so-bins", null, root);
    var ui = panel(root,"sort"), sorted = [], model = false, last = -1;
    var lists = NAMES.map(function (n) { var bin = h("div","so-bin",null,bins); h("b","",n,bin); return h("p","","还没有",bin); });
    var buttons = ITEMS.map(function (it,i) {
      var b = h("button","so-item",null,grid); b.type = "button";
      var art = U.el("svg",{viewBox:"0 0 100 78","aria-hidden":"true"},b);
      var g = U.el("g",{},art); shape(g,it[1],0,0,i===1||i===5||i===7);
      var label = h("span","",it[0],b);
      b.addEventListener("click",function () { sorted[i]=true; last=i; draw(); });
      return {b:b,label:label,g:g};
    });
    ui.button("全部入筐",function () { sorted=ITEMS.map(function () {return true;});last=-1;draw(); });
    var toggle = ui.button("变图形",function () {model=!model; sorted=ITEMS.map(function () {return true;});draw();});
    ui.button("重来",function () {sorted=[];model=false;last=-1;draw();});
    function draw() {
      buttons.forEach(function (o,i) {
        o.b.setAttribute("aria-pressed",String(!!sorted[i]));
        o.label.textContent = model ? NAMES[ITEMS[i][1]] : ITEMS[i][0];
        // Everyday markings disappear in model mode; geometry stays unchanged.
        var mark = o.g.querySelector(".so-mark"); if (mark) mark.remove();
        if (!model) rect(o.g,25,21,21,4,"var(--fg)").setAttribute("class","so-mark");
      });
      lists.forEach(function (n,k) { n.textContent=ITEMS.filter(function (it,i) {return sorted[i]&&it[1]===k;}).map(function (it) {return it[0];}).join("、")||"还没有"; });
      toggle.setAttribute("aria-pressed",String(model));
      ui.read(model ? "脱掉花衣裳，只看形状。正方体的六个面都是一样大的正方形。" : last<0 ? "点物品，按形状入筐；硬币和扁画册也要仔细看。" : ITEMS[last][0]+"："+ITEMS[last][2],{sorted:ITEMS.map(function (_,i) {return !!sorted[i];}),model:model});
    }
    draw();
  }
  function roll(root) {
    var stage=svg(root,"推一推，滚一滚"), ui=panel(root,"roll"), pick=0, moved=false;
    var names=["长方体","正方体","圆柱立放","圆柱横放","球","纸杯"];
    var messages=["平平的面着地，推后滑行，没有像球那样滚动。","正方体平面着地，轻推后滑行。","平平的圆面朝下，可以立住。","弯曲的侧面着地，沿一个方向滚动。","没有平面，能向四面八方滚动。","纸杯上粗下细，滚动会拐弯；它不是圆柱。"];
    var active=ui.choices(names,function (i) {pick=i;moved=false;draw();});
    var action=ui.button("推 / 滚一下",function () {moved=!moved;draw();});
    ui.button("重来",function () {pick=0;moved=false;draw();});
    function draw() {
      stage.replaceChildren();rect(stage,10,160,300,8,"var(--hl-soft)");
      var x=moved ? (pick===2 ? 85 : pick===5 ? 130 : 200) : 65;
      var g=U.el("g",{},stage);
      if(pick===5) U.el("path",{d:"M"+x+" 160 L"+(x-12)+" 95 L"+(x+60)+" 95 L"+(x+48)+" 160 Z",fill:"var(--b)",stroke:"var(--fg)","stroke-width":2,transform:moved?"rotate(-20 "+(x+24)+" 160)":""},g);
      else if(pick===3) {cylinder(g,x,120,64,40);U.el("ellipse",{cx:x+64,cy:140,rx:9,ry:20,fill:"var(--hl-soft)",stroke:"var(--fg)"},g);}
      else if(pick===4) ball(g,x+28,132,28);
      else if(pick===2) cylinder(g,x,102,54,58);
      else cube(g,x,pick===1?110:130,pick===1?50:70,pick===1?50:30,pick===1?50:25);
      active(pick);action.setAttribute("aria-pressed",String(moved));
      ui.read(moved?messages[pick]:"选好物体，再推或滚一下，看看接触桌面的是什么面。",{object:pick,moved:moved});
    }
    draw();
  }
  function stable(root) {
    var stage=svg(root,"积木承托与松手实验"),ui=panel(root,"stable"),pick=0,released=false;
    var names=["大面在下","小面在下","圆柱横放","球放下面"];
    var active=ui.choices(names,function (i) {pick=i;released=false;draw();});
    var action=ui.button("松手试试",function () {released=!released;draw();});
    ui.button("重来",function () {pick=0;released=false;draw();});
    function draw() {
      stage.replaceChildren();rect(stage,10,180,300,8,"var(--hl-soft)");
      if(pick===0) cylinder(stage,115,135,90,45);
      else if(pick===1) rect(stage,149,130,22,50,"var(--b)");
      else if(pick===2) {cylinder(stage,released?70:115,140,90,40);U.el("ellipse",{cx:released?160:205,cy:160,rx:10,ry:20,fill:"var(--hl-soft)",stroke:"var(--fg)"},stage);}
      else ball(stage,released?95:160,155,25);
      var top=U.el("g",{},stage), y=pick===0?101:pick===1?96:pick===2?106:96;
      rect(top,120,y,80,34);
      if(released&&pick>0) top.setAttribute("transform","translate(35 25) rotate(18 160 130)");
      active(pick);action.setAttribute("aria-pressed",String(released));action.textContent=released?"摆回原样":"松手试试";
      var msg=["平平的大面承托，摆正后更稳当。","小面支撑、上部较宽时，受到扰动更容易歪倒；小面并不表示一定倒。","横放圆柱会滚动，上面的积木失去支撑。","球没有平面，滚动后上面的积木会滑落。"];
      ui.read(released?msg[pick]:"选一种搭法，松手并轻轻碰一下，观察支撑。",{arrangement:pick,released:released,steady:released?pick===0:null});
    }
    draw();
  }
  function tower(root) {
    var stage=svg(root,"同一组八块积木搭高比较，正面高度标尺",240),ui=panel(root,"tower"),pick=0;
    var active=ui.choices(["底座平放","底座竖放","球没围住"],function (i) {pick=i;draw();});
    ui.button("重来",function () {pick=0;draw();});
    function draw() {
      stage.replaceChildren();var base=pick===0?1:4, floor=220, unit=20;
      rect(stage,10,floor,300,6,"var(--hl-soft)");
      for(var i=0;i<=10;i++) U.el("line",{x1:265,y1:floor-i*unit,x2:275,y2:floor-i*unit,stroke:"var(--muted)"},stage);
      // Front elevation in true units: no perspective offset enters the height.
      function block(id,x,z,w,height,kind,depth) {
        var group=U.el("g",{"data-piece":id,"data-x":x,"data-z":z,"data-w":w,"data-h":height,"data-depth":depth,"data-kind":kind},stage);
        if(kind==="sphere") ball(group,160+(x+w/2)*unit,floor-(z+height/2)*unit,w*unit/2);
        else if(kind==="cylinder") cylinder(group,160+x*unit,floor-(z+height)*unit,w*unit,height*unit);
        else rect(group,160+x*unit,floor-(z+height)*unit,w*unit,height*unit,id.indexOf("guard")===0?"var(--hl)":"var(--a)");
      }
      var bw=pick===0?4:1;
      block("base-left",pick===0?-4.2:-3.4,0,bw,base,"cuboid",1);
      block("base-right",pick===0?.2:2.4,0,bw,base,"cuboid",1);
      block("board",-3.5,base,7,1,"cuboid",1.5);
      block("can",-1.25,base+1,2.5,1,"cylinder",2.5);
      block("cube",-1,base+2,2,2,"cube",2);
      var roof=base+4;
      block("guard-left",pick===2?-3:-.9,pick===2?base+1:roof,pick===2?1:.4,pick===1?1:pick===2?.4:.75,"cuboid",pick===2?.75:pick===1?.75:1);
      block("guard-right",pick===2?2:-.5+1,pick===2?base+1:roof,pick===2?1:.4,pick===1?1:pick===2?.4:.75,"cuboid",pick===2?.75:pick===1?.75:1);
      block("ball",pick===2?4:-.5,pick===2?0:roof,1,1,"sphere",1);
      var height=roof+(pick===2?0:1);
      U.el("line",{x1:40,y1:floor-height*unit,x2:275,y2:floor-height*unit,stroke:"var(--fg)","stroke-dasharray":"5 4"},stage);
      active(pick);
      ui.read("高度："+height+" 格；同样 8 块。"+(pick===0?"底座平放，顶上两块小长方体围住球。":pick===1?"底座转立，球两侧仍有小长方体挡住；要摆正并有平稳支撑。":"两块小长方体移到横板上，球没围住滚落，塔顶变矮。"),{build:pick,height:height,used:8,contained:pick!==2});
    }
    draw();
  }
  function piles(root, mode) {
    var stage=svg(root,mode==="join"?"相同立体拼组":"抬起上层，观察隐藏积木"),ui=panel(root,mode),pick=0,apart=false;
    var grids=mode==="join"?[[[1,1]],[[1,1],[1,1]],[[2,2],[2,2]]]:[[[2,1],[1,0]],[[2,2],[1,0]],[[2,2],[1,1]]];
    var names=mode==="join"?["2 个正方体","4 个正方体","8 个正方体","2 个圆柱"]:["拐角 4 块","小台阶 5 块","双层 6 块"];
    var active=ui.choices(names,function (i) {pick=i;apart=false;draw();});
    var toggle=ui.button(mode==="join"?"拆开看":"抬起上层",function () {apart=!apart;draw();});
    ui.button("重来",function () {pick=0;apart=false;draw();});
    function draw() {
      stage.replaceChildren();active(pick);toggle.setAttribute("aria-pressed",String(apart));
      toggle.textContent=mode==="join"?(apart?"拼拢":"拆开看"):(apart?"放回上层":"抬起上层");
      var count=0, lower=0,upper=0;
      if(pick===3) { cylinder(stage,120,120+(apart?12:0),70,35);cylinder(stage,120,85-(apart?12:0),70,35);count=2; }
      else {
        var grid=grids[pick];
        // Back to front, then bottom to top: hidden supporting cubes remain real.
        for(var r=grid.length-1;r>=0;r--) for(var c=0;c<grid[r].length;c++) for(var z=0;z<grid[r][c];z++) {
          var gap=mode==="join"&&apart?12:0, lift=mode==="layers"&&apart&&z>0?40:0;
          var g=U.el("g",{"data-cube":[r,c,z].join(",")},stage);
          cube(g,110+c*(36+gap)+r*(13.68+gap/2),150-z*(36+gap)-r*10.8-lift,36,36,36);
          count++;if(z===0)lower++;else upper++;
        }
      }
      var msg=mode==="join" ? ["两块拼拢，一边变长，得到长方体。","四块排成一层，还是扁长方体，不能叫大正方体。","上下各四块，长宽高相等，拼成大正方体。","两个粗细相同的圆柱，圆面贴圆面，拼成更高的圆柱。"][pick] : apart?"一楼 "+lower+" 个，二楼 "+upper+" 个，合起来 "+count+" 个；上层下面也有支撑。":"先数一数，再抬起上层找被挡住的积木。";
      ui.read(mode==="join"&&apart?"拆开后仍是同样的 "+count+" 块，点「拼拢」观察整体形状。":msg,{object:pick,apart:apart,count:count,lower:lower,upper:upper});
    }
    draw();
  }
  // Opt-in source profile. Only the six interactive handlers are extracted;
  // independent question-figure renderers remain in their owning lesson pages.
  var nativeMounts = new WeakMap();
  function nativeSource(root, cfg, mode) {
    if (nativeMounts.get(root) && nativeMounts.get(root).parentNode === root) return;
    root.setAttribute("data-solids-native", mode);
    var NS = "http://www.w3.org/2000/svg", dictionary = Object.create(null), stage = null;
    if (cfg.content && typeof cfg.content === "object" && !Array.isArray(cfg.content)) {
      Object.keys(cfg.content).forEach(function (key) {
        var value = cfg.content[key];
        if (typeof value === "string" && value.length <= 2000) dictionary[key] = value;
      });
    }
    if (cfg.stage && typeof cfg.stage === "object") {
      stage = {};
      var box = typeof cfg.stage.viewBox === "string" ? cfg.stage.viewBox.trim().split(/\s+/).map(Number) : [];
      if (box.length === 4 && box.every(function (v) {return Number.isFinite(v) && Math.abs(v) <= 2000;}) && box[2] > 0 && box[3] > 0) stage.viewBox = box.join(" ");
      if (typeof cfg.stage.label === "string" && cfg.stage.label.length <= 2000) stage.label = cfg.stage.label;
      if (cfg.stage.role === "img" || cfg.stage.role === "group") stage.role = cfg.stage.role;
    }
    function P() { return window.PeiyuP; }
    function words(value) { return typeof value === "string" && Object.prototype.hasOwnProperty.call(dictionary, value) ? dictionary[value] : value; }
    var records = Array.isArray(cfg.records) ? cfg.records.map(function (record) {
      var copy = Object.create(null);
      if (record && typeof record === "object") Object.keys(record).forEach(function (key) {
        if (typeof record[key] === "string" && record[key].length <= 2000) copy[key] = record[key];
      });
      return copy;
    }) : [];
    function content(record, index) {
      ["name", "act", "desc", "msg", "tag", "joinedMsg", "splitMsg", "msgLift", "msgDown"].forEach(function (key) {
        if (typeof record[key] === "string" && records[index] && Object.prototype.hasOwnProperty.call(records[index], key)) record[key] = records[index][key];
      });
    }
    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, k === "aria-label" ? words(attrs[k]) : attrs[k]);
      if (tag === "svg" && attrs.class === "stage" && stage) {
        if (stage.viewBox) e.setAttribute("viewBox", stage.viewBox);
        if (stage.label != null) e.setAttribute("aria-label", stage.label);
        if (stage.role) e.setAttribute("role", stage.role);
      }
      if (parent) parent.appendChild(e);
      return e;
    }
    function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
    function button(label, fn) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = words(label);
      b.addEventListener("click", fn);
      return b;
    }
    function activate(node, fn) {
      node.addEventListener("click", fn);
      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
      });
    }
    function readout(node, text, say, cls) {
      node.className = "read" + (cls ? " " + cls : "");
      node.textContent = words(text);
      say = words(say);
      if (say && P()) {
        var b = P().sayButton(say);
        // register() may mount before primary.js's DOMContentLoaded initSay.
        if (b.nodeType === 1) b.setAttribute("data-say-init", "1");
        b.addEventListener("click", function () { P().say(say, b); });
        node.appendChild(b);
      }
    }
    function logI(what, data) {
      if (P()) P().log("interact", Object.assign({ what: what }, data || {}));
    }
    function panel(root) {
      var ctr = document.createElement("div"); ctr.className = "ctrls";
      var read = document.createElement("p"); read.className = "read"; read.setAttribute("aria-live", "polite");
      root.appendChild(ctr); root.appendChild(read);
      return { ctr: ctr, read: read };
    }
    function drawCuboid12(g, x, y, w, h, d, fillTop, fillFront, fillSide) {
      var dx = Math.round(d * 0.65), dy = Math.round(d * 0.45);
      el("polygon", { points: [x, y, x + dx, y - dy, x + w + dx, y - dy, x + w, y].join(" "), style: "fill:" + fillTop + ";stroke:var(--fg);stroke-width:1.6;stroke-linejoin:round" }, g);
      el("rect", { x: x, y: y, width: w, height: h, style: "fill:" + fillFront + ";stroke:var(--fg);stroke-width:1.6;stroke-linejoin:round" }, g);
      el("polygon", { points: [x + w, y, x + w + dx, y - dy, x + w + dx, y + h - dy, x + w, y + h].join(" "), style: "fill:" + fillSide + ";stroke:var(--fg);stroke-width:1.6;stroke-linejoin:round" }, g);
    }
    function drawCylinder(g, cx, cy, rx, ry, h, fillTop, fillBody) {
      var x0 = cx - rx, x1 = cx + rx, y0 = cy - h / 2, y1 = cy + h / 2;
      el("path", { d: "M" + x0 + " " + y0 + " L" + x0 + " " + y1 + " A" + rx + " " + ry + " 0 0 0 " + x1 + " " + y1 + " L" + x1 + " " + y0 + " Z", style: "fill:" + fillBody + ";stroke:var(--fg);stroke-width:1.6;stroke-linejoin:round" }, g);
      el("ellipse", { cx: cx, cy: y0, rx: rx, ry: ry, style: "fill:" + fillTop + ";stroke:var(--fg);stroke-width:1.6" }, g);
    }
    function drawHorizCyl(g, cx, cy, len, r, fillEnd, fillBody) {
      var x0 = cx - len / 2, x1 = cx + len / 2, rx = Math.max(5, Math.round(r * 0.42));
      el("path", { d: "M" + x0 + " " + (cy - r) + " L" + x1 + " " + (cy - r) + " A" + rx + " " + r + " 0 0 1 " + x1 + " " + (cy + r) + " L" + x0 + " " + (cy + r) + " Z", style: "fill:" + fillBody + ";stroke:var(--fg);stroke-width:1.6" }, g);
      el("ellipse", { cx: x0, cy: cy, rx: rx, ry: r, style: "fill:" + fillEnd + ";stroke:var(--fg);stroke-width:1.6" }, g);
    }
    function drawSphere1(g, cx, cy, r, fill) {
      el("circle", { cx: cx, cy: cy, r: r, style: "fill:" + fill + ";stroke:var(--fg);stroke-width:1.6" }, g);
      el("ellipse", { cx: cx - r * 0.28, cy: cy - r * 0.28, rx: r * 0.26, ry: r * 0.16, transform: "rotate(-25 " + (cx - r * 0.28) + " " + (cy - r * 0.28) + ")", style: "fill:var(--card);opacity:0.65" }, g);
      el("path", { d: "M" + (cx - r * 0.72) + " " + (cy + r * 0.1) + " A" + (r * 0.78) + " " + (r * 0.32) + " 0 0 0 " + (cx + r * 0.72) + " " + (cy + r * 0.1), style: "fill:none;stroke:var(--fg);stroke-width:1.2;stroke-dasharray:3 2;opacity:0.55" }, g);
    }
    function drawSphere2(g, cx, cy, r, fill) {
      el("circle", { cx: cx, cy: cy, r: r, style: "fill:" + fill + ";stroke:var(--fg);stroke-width:1.6" }, g);
      el("ellipse", { cx: cx - r * 0.28, cy: cy - r * 0.28, rx: r * 0.25, ry: r * 0.15, transform: "rotate(-25 " + (cx - r * 0.28) + " " + (cy - r * 0.28) + ")", style: "fill:var(--card);opacity:0.65" }, g);
    }
    function drawCuboid3(g, x, y, w, h, d, fillTop, fillFront, fillSide, dashed) {
      var dx = Math.round(d * 0.62), dy = Math.round(d * 0.56);
      var st = ";stroke:var(--fg);stroke-width:1.6;stroke-linejoin:round" + (dashed ? ";stroke-dasharray:4 3;fill-opacity:0.25" : "");
      el("polygon", { points: [x, y, x + dx, y - dy, x + w + dx, y - dy, x + w, y].join(" "), style: "fill:" + fillTop + st }, g);
      el("rect", { x: x, y: y, width: w, height: h, style: "fill:" + fillFront + st }, g);
      el("polygon", { points: [x + w, y, x + w + dx, y - dy, x + w + dx, y + h - dy, x + w, y + h].join(" "), style: "fill:" + fillSide + st }, g);
    }
    function drawGridCube(g, ox, oy, s, col, row, layer, theme, dashed) {
      var d = Math.round(s * 0.58);
      var dx = Math.round(d * 0.62), dy = Math.round(d * 0.56);
      var x = ox + col * s - row * dx;
      var y = oy - layer * s + row * dy;
      var topC = "var(--hl-soft)", frontC = "var(--a)", sideC = "var(--c)";
      if (theme === "warm") { topC = "var(--hl-soft)"; frontC = "var(--hl)"; sideC = "var(--b)"; }
      if (theme === "alert") { topC = "var(--no-soft)"; frontC = "var(--no)"; sideC = "var(--b)"; }
      drawCuboid(g, x, y, s, s, d, topC, frontC, sideC, dashed);
    }
    var drawCuboid = mode === "join" || mode === "layers" ? drawCuboid3 : drawCuboid12;
    var drawSphere = mode === "stable" || mode === "tower" ? drawSphere2 : drawSphere1;
    function shapeSortBox(root) {
      var items = [
        { id: "box", name: "纸巾盒", kind: 0, x0: 46, y0: 28, tx: 34, ty: 154, desc: "纸巾盒是长长方方的，有平平的面，是长方体。" },
        { id: "book", name: "厚画册", kind: 0, x0: 134, y0: 28, tx: 64, ty: 156, desc: "画册虽然扁扁的，但也是长长方方的，是长方体。" },
        { id: "rubik", name: "魔方", kind: 1, x0: 222, y0: 28, tx: 118, ty: 154, desc: "魔方正正方方的，每个面都一样大，是正方体。" },
        { id: "gift", name: "方礼盒", kind: 1, x0: 306, y0: 28, tx: 150, ty: 154, desc: "方礼盒每个面都一样大，也是正方体。" },
        { id: "can", name: "水杯", kind: 2, x0: 54, y0: 84, tx: 204, ty: 154, desc: "水杯直直的、上下一样粗，两头圆圆平平，是圆柱。" },
        { id: "coin", name: "硬币", kind: 2, x0: 140, y0: 84, tx: 236, ty: 158, desc: "硬币虽然很矮，但上下一样粗、两头圆圆平平，也是圆柱！" },
        { id: "ball", name: "皮球", kind: 3, x0: 224, y0: 84, tx: 288, ty: 154, desc: "皮球圆圆鼓鼓的，能向四面八方滚，是球。" },
        { id: "marble", name: "玻璃珠", kind: 3, x0: 306, y0: 84, tx: 320, ty: 156, desc: "小玻璃珠也是圆圆鼓鼓的，是球。" }
      ];
      var kinds = ["长方体", "正方体", "圆柱", "球"];
      items.forEach(content);
      var st = { sorted: {}, model: false, last: -1 };
      var svg = el("svg", { viewBox: "0 0 360 222", class: "stage", role: "group", "aria-label": "按形状把物品分进四个筐" }, root);
      var gBins = el("g", {}, svg), gItems = el("g", {}, svg);
      var ui = panel(root);
      var bAll = button("全部入筐", function () {
        items.forEach(function (_, i) { st.sorted[i] = true; });
        st.last = -1; draw(); logI("sort_all");
      });
      var bModel = button("变图形", function () {
        items.forEach(function (_, i) { st.sorted[i] = true; });
        st.model = !st.model; draw(); logI("toggle_model", { model: st.model });
      });
      var bReset = button("重来", function () {
        st.sorted = {}; st.model = false; st.last = -1; draw(); logI("reset");
      });
      [bAll, bModel, bReset].forEach(function (b) { ui.ctr.appendChild(b); });
      function renderItemGraphic(g, it, isModel) {
        if (it.id === "box") {
          drawCuboid(g, -20, -10, 34, 18, 12, "var(--hl-soft)", "var(--a)", "var(--c)");
          if (!isModel) el("ellipse", { cx: -3, cy: -13, rx: 8, ry: 2.5, style: "fill:var(--card)" }, g);
        } else if (it.id === "book") {
          drawCuboid(g, -22, -4, 36, 9, 14, "var(--ok-soft)", "var(--b)", "var(--hl)");
        } else if (it.id === "rubik") {
          drawCuboid(g, -13, -10, 20, 20, 12, "var(--hl)", "var(--no)", "var(--a)");
        } else if (it.id === "gift") {
          drawCuboid(g, -12, -9, 18, 18, 10, "var(--ok-soft)", "var(--c)", "var(--b)");
        } else if (it.id === "can") {
          drawCylinder(g, 0, -2, 10, 4, 20, "var(--hl-soft)", "var(--a)");
        } else if (it.id === "coin") {
          drawCylinder(g, 0, 1, 14, 6, 7, "var(--hl)", "var(--b)");
        } else if (it.id === "ball") {
          drawSphere(g, 0, -2, 13, "var(--no)");
        } else {
          drawSphere(g, 0, 0, 9, "var(--c)");
        }
      }
      function draw() {
        clear(gBins); clear(gItems);
        bModel.setAttribute("aria-pressed", st.model ? "true" : "false");
        for (var k = 0; k < 4; k++) {
          var bx = 10 + k * 87;
          el("rect", { x: bx, y: 126, width: 80, height: 88, rx: 10, style: "fill:var(--bg);stroke:var(--line);stroke-width:2" }, gBins);
          el("text", { x: bx + 40, y: 206, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, gBins).textContent = words(kinds[k]);
        }
        var count = 0;
        items.forEach(function (it, idx) {
          var done = !!st.sorted[idx];
          if (done) count++;
          var x = done ? it.tx : it.x0, y = done ? it.ty : it.y0;
          var g = el("g", { class: "part mv", tabindex: "0", role: "button", "aria-label": it.name, style: "transform:translate(" + x + "px," + y + "px)" }, gItems);
          el("rect", { x: -28, y: -22, width: 56, height: 52, style: "fill:transparent" }, g);
          renderItemGraphic(g, it, st.model);
          if (!done) {
            el("text", { x: 0, y: 26, "text-anchor": "middle", style: "fill:var(--fg);font-size:16.5px;font-weight:600" }, g).textContent = words(it.name);
          }
          activate(g, function () {
            st.sorted[idx] = true; st.last = idx; draw();
            logI("pick_item", { id: it.id, kind: kinds[it.kind] });
          });
        });
        if (st.model) {
          readout(ui.read, "脱掉花衣裳，只看形状：长方体、正方体、圆柱、球！", "脱掉花衣裳，只看形状：长方体、正方体、圆柱、球！", "ok");
        } else if (st.last >= 0) {
          var cur = items[st.last];
          readout(ui.read, cur.desc, cur.desc, "ok");
        } else if (count === items.length) {
          readout(ui.read, "8 件物品都按形状分进 4 个筐啦！点「变图形」看看。", "八件物品都按形状分进四个筐啦！", "ok");
        } else {
          readout(ui.read, "点上面的物品，按形状放进下面的 4 个筐里（已分 " + count + "/8）。");
        }
      }
      draw();
    }
    function shapeRollLab(root) {
      var shapes = [
        { name: "长方体", act: "推一推", dx: 96, rot: 0, msg: "长方体有平平的面，不能滚动，只能平平地推着走。", cls: "ok" },
        { name: "正方体", act: "推一推", dx: 96, rot: 0, msg: "正方体每个面都平平的、一样大，只能推着走。", cls: "ok" },
        { name: "圆柱·立", act: "推一推", dx: 0, rot: 0, msg: "圆柱竖着放，下面平平的、圆圆的，稳稳立在桌上！", cls: "ok" },
        { name: "圆柱·躺", act: "滚一滚", dx: 118, rot: 0, msg: "圆柱横着放，弯弯的面着地，能朝着一个方向滚动。", cls: "ok" },
        { name: "球", act: "滚一滚", dx: 126, rot: 180, msg: "球圆圆鼓鼓的，没有平平的面，能向四面八方滚动！", cls: "ok" },
        { name: "纸杯", act: "滚一滚", dx: 40, rot: -28, msg: "纸杯上面粗、下面细，滚起来会原地拐弯，它不是圆柱！", cls: "no" }
      ];
      shapes.forEach(content);
      var st = { i: 0, moved: false };
      var svg = el("svg", { viewBox: "0 0 360 175", class: "stage", role: "img", "aria-label": "立体图形推一推滚一滚实验台" }, root);
      var gDesk = el("g", {}, svg), gObj = el("g", { class: "mv" }, svg), gHint = el("g", {}, svg);
      var ui = panel(root);
      var btns = shapes.map(function (s, idx) {
        var b = button(s.name, function () { st.i = idx; st.moved = false; draw(); logI("select_shape", { shape: s.name }); });
        ui.ctr.appendChild(b);
        return b;
      });
      var bAct = button("推 / 滚一下", function () { st.moved = !st.moved; draw(); logI("roll_action", { shape: shapes[st.i].name, moved: st.moved }); });
      var bReset = button("重来", function () { st.i = 0; st.moved = false; draw(); logI("reset"); });
      ui.ctr.appendChild(bAct);
      ui.ctr.appendChild(bReset);
      el("rect", { x: 24, y: 124, width: 312, height: 14, rx: 4, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:1.8" }, gDesk);
      el("line", { x1: 52, y1: 138, x2: 52, y2: 166, style: "stroke:var(--fg);stroke-width:3" }, gDesk);
      el("line", { x1: 308, y1: 138, x2: 308, y2: 166, style: "stroke:var(--fg);stroke-width:3" }, gDesk);
      function draw() {
        clear(gObj); clear(gHint);
        var s = shapes[st.i];
        btns.forEach(function (b, idx) { b.setAttribute("aria-pressed", idx === st.i ? "true" : "false"); });
        bAct.textContent = words(st.moved ? "放回原位" : s.act);
        var baseX = 110, baseY = 98;
        if (st.i === 0) {
          drawCuboid(gObj, baseX - 28, baseY - 4, 56, 28, 20, "var(--hl-soft)", "var(--a)", "var(--c)");
        } else if (st.i === 1) {
          drawCuboid(gObj, baseX - 20, baseY - 12, 36, 36, 20, "var(--ok-soft)", "var(--b)", "var(--hl)");
        } else if (st.i === 2) {
          drawCylinder(gObj, baseX, baseY - 2, 22, 9, 44, "var(--hl-soft)", "var(--a)");
        } else if (st.i === 3) {
          drawHorizCyl(gObj, baseX, baseY + 4, 48, 18, "var(--hl-soft)", "var(--a)");
        } else if (st.i === 4) {
          drawSphere(gObj, baseX, baseY, 24, "var(--no)");
        } else {
          el("polygon", { points: (baseX - 22) + "," + (baseY - 22) + " " + (baseX + 22) + "," + (baseY - 22) + " " + (baseX + 13) + "," + (baseY + 22) + " " + (baseX - 13) + "," + (baseY + 22), style: "fill:var(--no-soft);stroke:var(--fg);stroke-width:1.8" }, gObj);
          el("ellipse", { cx: baseX, cy: baseY - 22, rx: 22, ry: 7, style: "fill:var(--card);stroke:var(--fg);stroke-width:1.8" }, gObj);
        }
        var tx = st.moved ? s.dx : 0;
        if (st.i === 5 && st.moved) {
          gObj.style.transformOrigin = baseX + "px " + (baseY + 22) + "px";
          gObj.style.transform = "translate(36px, -10px) rotate(-28deg)";
        } else {
          gObj.style.transformOrigin = "";
          gObj.style.transform = "translate(" + tx + "px, 0px)";
        }
        if (st.moved) {
          if (st.i === 5) {
            el("path", { d: "M108 54 Q132 46 148 62", style: "fill:none;stroke:var(--no);stroke-width:2.5;stroke-dasharray:4 3" }, gHint);
            el("path", { d: "M140 54 L148 62 L138 66", style: "fill:none;stroke:var(--no);stroke-width:2.5;stroke-linecap:round" }, gHint);
          } else if (s.dx > 0) {
            el("path", { d: "M108 52 L" + (108 + s.dx) + " 52 M" + (100 + s.dx) + " 46 L" + (108 + s.dx) + " 52 L" + (100 + s.dx) + " 58", style: "fill:none;stroke:var(--a);stroke-width:2.5;stroke-dasharray:5 3" }, gHint);
          }
          el("text", { x: 180, y: 34, "text-anchor": "middle", style: "fill:var(--fg);font-size:16px;font-weight:700" }, gHint).textContent = words(st.i === 2 ? "平平的圆面在下面，稳稳立住" : (st.i <= 1 ? "平平的面贴着桌面滑行" : (st.i === 5 ? "上粗下细，打转拐弯" : "弯弯的面滚起来啦")));
          readout(ui.read, s.msg, s.msg, s.cls);
        } else {
          readout(ui.read, "已选「" + s.name + "」，点「" + s.act + "」试试看！");
        }
      }
      draw();
    }
    function stablePairLab(root) {
      var cases = [
        { name: "大面在下", ok: true, msg: "平平的大面放在下面，两块积木稳稳当当！", tag: "稳稳立住" },
        { name: "小面在下", ok: false, msg: "下面积木太细小，托不住上面大积木，歪倒啦！", tag: "头重脚轻" },
        { name: "圆柱横放", ok: false, msg: "圆柱横着放会滚动，上面的积木滑下来啦！", tag: "滚走滑落" },
        { name: "球放下面", ok: false, msg: "球到处滚，放在下面根本立不住！", tag: "马上滚倒" }
      ];
      cases.forEach(content);
      var st = { i: 0, test: false };
      var svg = el("svg", { viewBox: "0 0 360 185", class: "stage", role: "img", "aria-label": "两块积木怎样搭得稳实验" }, root);
      var gDesk = el("g", {}, svg), gBot = el("g", { class: "mv" }, svg), gTop = el("g", { class: "mv" }, svg), gTag = el("g", {}, svg);
      var ui = panel(root);
      var btns = cases.map(function (c, idx) {
        var b = button(c.name, function () { st.i = idx; st.test = false; draw(); logI("pick_stable_case", { case: c.name }); });
        ui.ctr.appendChild(b);
        return b;
      });
      var bTest = button("松手试试", function () { st.test = !st.test; draw(); logI("test_stable", { case: cases[st.i].name, test: st.test }); });
      var bReset = button("重来", function () { st.i = 0; st.test = false; draw(); logI("reset"); });
      ui.ctr.appendChild(bTest);
      ui.ctr.appendChild(bReset);
      el("rect", { x: 30, y: 144, width: 300, height: 12, rx: 4, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:1.8" }, gDesk);
      function draw() {
        clear(gBot); clear(gTop); clear(gTag);
        var c = cases[st.i];
        btns.forEach(function (b, idx) { b.setAttribute("aria-pressed", idx === st.i ? "true" : "false"); });
        bTest.textContent = words(st.test ? "摆回原样" : "松手试试");
        if (st.i === 0) {
          drawCylinder(gBot, 180, 120, 38, 11, 38, "var(--hl-soft)", "var(--b)");
          drawCuboid(gTop, 146, 68, 56, 28, 20, "var(--ok-soft)", "var(--a)", "var(--c)");
          gBot.style.transform = "translate(0px,0px)";
          gTop.style.transform = "translate(0px,0px)";
        } else if (st.i === 1) {
          drawCuboid(gBot, 168, 102, 18, 42, 14, "var(--hl-soft)", "var(--b)", "var(--hl)");
          drawCuboid(gTop, 126, 66, 98, 28, 20, "var(--ok-soft)", "var(--a)", "var(--c)");
          gBot.style.transform = "translate(0px,0px)";
          gTop.style.transform = st.test ? "translate(28px, 34px) rotate(24deg)" : "translate(0px,0px)";
        } else if (st.i === 2) {
          drawHorizCyl(gBot, 180, 124, 58, 18, "var(--hl-soft)", "var(--b)");
          drawCuboid(gTop, 160, 72, 34, 34, 18, "var(--ok-soft)", "var(--a)", "var(--c)");
          gBot.style.transform = st.test ? "translate(-36px, 0px)" : "translate(0px,0px)";
          gTop.style.transform = st.test ? "translate(38px, 36px) rotate(28deg)" : "translate(0px,0px)";
        } else {
          drawSphere(gBot, 180, 122, 22, "var(--no)");
          drawCuboid(gTop, 144, 68, 64, 26, 18, "var(--ok-soft)", "var(--a)", "var(--c)");
          gBot.style.transform = st.test ? "translate(-48px, 0px)" : "translate(0px,0px)";
          gTop.style.transform = st.test ? "translate(32px, 42px) rotate(30deg)" : "translate(0px,0px)";
        }
        if (st.test) {
          el("text", { x: 180, y: 32, "text-anchor": "middle", style: "fill:" + (c.ok ? "var(--a)" : "var(--no)") + ";font-size:17px;font-weight:700" }, gTag).textContent = words(c.tag);
          readout(ui.read, c.msg, c.msg, c.ok ? "ok" : "no");
        } else {
          readout(ui.read, "已摆好「" + c.name + "」，点「松手试试」看稳不稳！");
        }
      }
      draw();
    }
    function towerBuildLab(root) {
      var modes = [
        { name: "长方体平放（6格高）", tall: false, ballMode: "cradle", used: 8, h: 6, ok: true, msg: "8 块全用上，2 块小长方体立在正方体顶上围住球很稳！如果把底座长方体竖起来、两块围球小长方体也立起来，还能更高。" },
        { name: "长方体竖放（9格高！）", tall: true, ballMode: "cradle", used: 8, h: 9, ok: true, msg: "太棒啦！8 块积木全用上，下层 2 块底座长方体竖起来，顶上 2 块小长方体也立起来围住球，高达 9 格又稳又高！" },
        { name: "球没围住（滚落·8格）", tall: true, ballMode: "drop", used: 8, h: 8, ok: false, msg: "两块小长方体没放顶上围球，球直接放在正方体平面上没有小窝围住它，咕噜噜滚下来啦！" }
      ];
      modes.forEach(content);
      var st = { i: 0 };
      var svg = el("svg", { viewBox: "0 0 360 210", class: "stage", role: "img", "aria-label": "用全部8块积木搭得又稳又高实验" }, root);
      var gGrid = el("g", {}, svg), gTower = el("g", {}, svg);
      var ui = panel(root);
      var btns = modes.map(function (m, idx) {
        var b = button(m.name, function () { st.i = idx; draw(); logI("tower_mode", { mode: m.name }); });
        ui.ctr.appendChild(b);
        return b;
      });
      ui.ctr.appendChild(button("重来", function () { st.i = 0; draw(); logI("reset"); }));
      el("rect", { x: 24, y: 184, width: 312, height: 10, rx: 3, style: "fill:var(--hl-soft);stroke:var(--fg);stroke-width:1.6" }, gGrid);
      for (var g = 1; g <= 10; g++) {
        var gy = 184 - g * 16;
        el("line", { x1: 282, y1: gy, x2: 306, y2: gy, style: "stroke:var(--line);stroke-width:1.2" }, gGrid);
        if (g % 3 === 0 || g === 10) {
          el("text", { x: 322, y: gy + 5, "text-anchor": "middle", style: "fill:var(--muted);font-size:13px;font-weight:600" }, gGrid).textContent = words(g + "格");
        }
      }
      function draw() {
        clear(gTower);
        var m = modes[st.i];
        btns.forEach(function (b, idx) { b.setAttribute("aria-pressed", idx === st.i ? "true" : "false"); });
        var topY;
        if (!m.tall) {
          drawCuboid(gTower, 84, 168, 64, 16, 14, "var(--ok-soft)", "var(--a)", "var(--c)");
          drawCuboid(gTower, 156, 168, 64, 16, 14, "var(--ok-soft)", "var(--a)", "var(--c)");
          drawCuboid(gTower, 92, 152, 120, 16, 16, "var(--hl-soft)", "var(--b)", "var(--hl)");
          drawCylinder(gTower, 152, 142, 26, 6, 20, "var(--hl-soft)", "var(--b)");
          drawCuboid(gTower, 134, 108, 36, 36, 10, "var(--ok-soft)", "var(--a)", "var(--c)");
          drawCuboid(gTower, 134, 96, 8, 12, 16, "var(--hl-soft)", "var(--hl)", "var(--b)");
          drawCuboid(gTower, 162, 96, 8, 12, 16, "var(--hl-soft)", "var(--hl)", "var(--b)");
          drawSphere(gTower, 152, 98, 10, "var(--no)");
          topY = 98 - 10;
        } else {
          drawCuboid(gTower, 112, 120, 16, 64, 14, "var(--ok-soft)", "var(--a)", "var(--c)");
          drawCuboid(gTower, 176, 120, 16, 64, 14, "var(--ok-soft)", "var(--a)", "var(--c)");
          drawCuboid(gTower, 92, 104, 120, 16, 16, "var(--hl-soft)", "var(--b)", "var(--hl)");
          drawCylinder(gTower, 152, 94, 26, 6, 20, "var(--hl-soft)", "var(--b)");
          drawCuboid(gTower, 134, 60, 36, 36, 10, "var(--ok-soft)", "var(--a)", "var(--c)");
          if (m.ballMode === "cradle") {
            drawCuboid(gTower, 134, 44, 8, 16, 12, "var(--hl-soft)", "var(--hl)", "var(--b)");
            drawCuboid(gTower, 162, 44, 8, 16, 12, "var(--hl-soft)", "var(--hl)", "var(--b)");
            drawSphere(gTower, 152, 50, 10, "var(--no)");
            topY = 50 - 10;
          } else {
            drawCuboid(gTower, 96, 96, 16, 8, 12, "var(--hl-soft)", "var(--hl)", "var(--b)");
            drawCuboid(gTower, 192, 96, 16, 8, 12, "var(--hl-soft)", "var(--hl)", "var(--b)");
            drawSphere(gTower, 236, 174, 10, "var(--no)");
            el("path", { d: "M156 50 Q208 58 232 158", style: "fill:none;stroke:var(--no);stroke-width:2.2;stroke-dasharray:4 3" }, gTower);
            topY = 60 - Math.round(10 * 0.45);
          }
        }
        var realGridH = Math.round((184 - topY) / 16);
        el("line", { x1: 60, y1: topY, x2: 294, y2: topY, style: "stroke:" + (m.ok ? "var(--a)" : "var(--no)") + ";stroke-width:2;stroke-dasharray:5 3" }, gTower);
        el("text", { x: 64, y: topY - 8, style: "fill:" + (m.ok ? "var(--a)" : "var(--no)") + ";font-size:15px;font-weight:700" }, gTower).textContent = words("高度：" + realGridH + " 格（已用 " + m.used + " 块）");
        readout(ui.read, m.msg, m.msg, m.ok ? "ok" : "no");
      }
      draw();
    }
    function cubeJoinLab(root) {
      var scenes = [
        { name: "2 个正方体", joinedMsg: "2 个正方体拼在一起，一边变长了，拼成了 1 个长方体！", splitMsg: "这是 2 个一样的小正方体，点「拼拢」看看变成什么。" },
        { name: "4 个正方体", joinedMsg: "4 个正方体摆成一层，看旁边还是扁扁的，它是长方体，还不是大正方体！", splitMsg: "4 个小正方体够不够拼成大正方体？点「拼拢」看看。" },
        { name: "8 个正方体", joinedMsg: "下层 4 个加二层 4 个，一共 8 个小正方体，每个面一样大，拼成大正方体啦！", splitMsg: "下层 4 个、上层 4 个，一共 8 个小正方体。点「拼拢」合起来！" },
        { name: "2 个圆柱", joinedMsg: "把两个平平的圆面叠在一起，拼成了 1 个更高的圆柱！", splitMsg: "2 个粗细一样的圆柱，点「拼拢」叠起来看看。" }
      ];
      scenes.forEach(content);
      var st = { i: 0, joined: true };
      var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "img", "aria-label": "相同的立体图形拼一拼实验台" }, root);
      var gMain = el("g", {}, svg);
      var ui = panel(root);
      var btns = scenes.map(function (sc, idx) {
        var b = button(sc.name, function () { st.i = idx; st.joined = true; draw(); logI("join_scene", { scene: sc.name }); });
        ui.ctr.appendChild(b);
        return b;
      });
      var bToggle = button("拆开看", function () { st.joined = !st.joined; draw(); logI("toggle_join", { joined: st.joined }); });
      var bReset = button("重来", function () { st.i = 0; st.joined = true; draw(); logI("reset"); });
      ui.ctr.appendChild(bToggle);
      ui.ctr.appendChild(bReset);
      function draw() {
        clear(gMain);
        var sc = scenes[st.i];
        btns.forEach(function (b, idx) { b.setAttribute("aria-pressed", idx === st.i ? "true" : "false"); });
        bToggle.textContent = words(st.joined ? "拆开看" : "拼拢");
        var gap = st.joined ? 0 : 18;
        if (st.i === 0) {
          drawCuboid(gMain, 134 - gap / 2, 82, 36, 36, 22, "var(--hl-soft)", "var(--a)", "var(--c)");
          drawCuboid(gMain, 170 + gap / 2, 82, 36, 36, 22, "var(--hl-soft)", "var(--a)", "var(--c)");
          el("text", { x: 180, y: 156, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, gMain).textContent = words(st.joined ? "拼成了：长方体" : "2 个一样的正方体");
        } else if (st.i === 1) {
          var ox = 148, oy = 86, s = 34;
          [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (cr) {
            var c = cr[0], r = cr[1];
            drawGridCube(gMain, ox + c * gap - r * (gap * 0.4), oy + r * (gap * 0.4), s, c, r, 0, "default");
          });
          if (st.joined) {
            el("text", { x: 180, y: 162, "text-anchor": "middle", style: "fill:var(--no);font-size:16px;font-weight:700" }, gMain).textContent = words("只有 1 层高，扁扁的 → 是长方体！");
          }
        } else if (st.i === 2) {
          var ox8 = 148, oy8 = 104, s8 = 30;
          var lift = st.joined ? 0 : 24;
          [0, 1].forEach(function (layer) {
            [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (cr) {
              drawGridCube(gMain, ox8, oy8 - layer * lift, s8, cr[0], cr[1], layer, layer ? "warm" : "default");
            });
          });
          el("text", { x: 180, y: 166, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, gMain).textContent = words(st.joined ? "4 + 4 = 8 个 → 拼成大正方体！" : "下层 4 个 + 上层 4 个 = 8 个");
        } else {
          var dy = st.joined ? 0 : 18;
          drawCylinder(gMain, 180, 114 + dy / 2, 28, 10, 34, "var(--hl-soft)", "var(--b)");
          drawCylinder(gMain, 180, 80 - dy / 2, 28, 10, 34, "var(--hl-soft)", "var(--a)");
          el("text", { x: 180, y: 162, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, gMain).textContent = words(st.joined ? "平平的圆面叠一起 → 更高的圆柱" : "2 个粗细一样的圆柱");
        }
        var msg = st.joined ? sc.joinedMsg : sc.splitMsg;
        readout(ui.read, msg, msg, st.joined ? "ok" : "");
      }
      draw();
    }
    function layerCountLab(root) {
      var piles = [
        {
          name: "拐角 4 块",
          l1: [[0, 0, true], [1, 0, false], [0, 1, false]],
          l2: [[0, 0]],
          msgLift: "看！二楼那块下面，藏着红色的第 1 块托着它！一楼 3 个加二楼 1 个，一共 4 个。",
          msgDown: "看到 3 个面，其实是几个？点「抬起上层」看看二楼下面藏着谁！"
        },
        {
          name: "小台阶 5 块",
          l1: [[0, 0, true], [1, 0, true], [0, 1, false]],
          l2: [[0, 0], [1, 0]],
          msgLift: "一楼有 3 个（后面 2 个托着二楼），二楼有 2 个，3 加 2 一共 5 个！",
          msgDown: "小台阶一共有几个小正方体？点「抬起上层」分层数一数。"
        },
        {
          name: "双层 6 块",
          l1: [[0, 0, true], [1, 0, true], [0, 1, false], [1, 1, false]],
          l2: [[0, 0], [1, 0]],
          msgLift: "一楼满满 4 个，二楼 2 个，4 加 2 一共 6 个小正方体！",
          msgDown: "一楼和二楼合起来有几个？点「抬起上层」看清楚。"
        }
      ];
      piles.forEach(content);
      var st = { i: 0, lift: false };
      var svg = el("svg", { viewBox: "0 0 360 190", class: "stage", role: "img", "aria-label": "分层抬起上层数小正方体个数" }, root);
      var gL1 = el("g", {}, svg), gL2 = el("g", { class: "mv" }, svg), gNote = el("g", {}, svg);
      var ui = panel(root);
      var btns = piles.map(function (p, idx) {
        var b = button(p.name, function () { st.i = idx; st.lift = false; draw(); logI("pick_pile", { pile: p.name }); });
        ui.ctr.appendChild(b);
        return b;
      });
      var bLift = button("抬起上层", function () { st.lift = !st.lift; draw(); logI("lift_layer", { lift: st.lift }); });
      var bReset = button("重来", function () { st.i = 0; st.lift = false; draw(); logI("reset"); });
      ui.ctr.appendChild(bLift);
      ui.ctr.appendChild(bReset);
      function draw() {
        clear(gL1); clear(gL2); clear(gNote);
        var p = piles[st.i];
        btns.forEach(function (b, idx) { b.setAttribute("aria-pressed", idx === st.i ? "true" : "false"); });
        bLift.textContent = words(st.lift ? "放回上层" : "抬起上层");
        bLift.setAttribute("aria-pressed", st.lift ? "true" : "false");
        var ox = 148, oy = 112, s = 34;
        p.l1.forEach(function (c) {
          drawGridCube(gL1, ox, oy, s, c[0], c[1], 0, c[2] ? "alert" : "default");
        });
        p.l2.forEach(function (c) {
          drawGridCube(gL2, ox, oy, s, c[0], c[1], 1, "warm");
        });
        gL2.style.transform = st.lift ? "translate(0px, -36px)" : "translate(0px, 0px)";
        var total = p.l1.length + p.l2.length;
        if (st.lift) {
          el("text", { x: 274, y: 56, "text-anchor": "middle", style: "fill:var(--b);font-size:16px;font-weight:700" }, gNote).textContent = words("二楼：" + p.l2.length + " 个");
          el("text", { x: 274, y: 126, "text-anchor": "middle", style: "fill:var(--no);font-size:16px;font-weight:700" }, gNote).textContent = words("一楼：" + p.l1.length + " 个");
          el("text", { x: 180, y: 174, "text-anchor": "middle", style: "fill:var(--a);font-size:16px;font-weight:700" }, gNote).textContent = words(p.l1.length + " + " + p.l2.length + " = " + total + " 个");
          readout(ui.read, p.msgLift, p.msgLift, "ok");
        } else {
          readout(ui.read, p.msgDown);
        }
      }
      draw();
    }
    ({sort:shapeSortBox,roll:shapeRollLab,stable:stablePairLab,tower:towerBuildLab,join:cubeJoinLab,layers:layerCountLab})[mode](root);
    nativeMounts.set(root, root.firstChild);
  }
  function views(root,cfg) {
    var maxH=Number.isInteger(cfg.maxH)?Math.max(1,Math.min(4,cfg.maxH)):3;
    function valid(g) {return Array.isArray(g)&&g.length>0&&g.length<=3&&g.every(function (row) {return Array.isArray(row)&&row.length===g[0].length&&row.length>0&&row.length<=3&&row.every(function (v) {return Number.isInteger(v)&&v>=0&&v<=maxH;});});}
    var options={dirs:["front","left","top"],show:"visit",edit:cfg.edit!==false,maxH:maxH};
    if(valid(cfg.g)) options.g=cfg.g;
    else if(Array.isArray(cfg.objs)&&cfg.objs.length>0&&cfg.objs.length<=6&&cfg.objs.every(function (o) {return o&&valid(o.g);})) options.objs=cfg.objs.map(function (o,i) {
      // cubeview accepts label markup; this wrapper only accepts plain text.
      var name=typeof o.n==="string"?o.n.slice(0,30):"物体 "+(i+1);
      name=name.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return {n:name,g:o.g};
    });
    else options.objs=[{n:"拐角",g:[[1,1],[1,0]]},{n:"小台阶",g:[[2,1],[1,0]]},{n:"双层",g:[[2,2],[1,1]]}].map(function (o) {return {n:o.n,g:o.g.map(function (r) {return r.map(function (v) {return Math.min(v,maxH);});})};});
    var base=options.g||(options.objs[0].g);
    options.rows=Math.max.apply(null,(options.objs||[{g:base}]).map(function (o) {return o.g.length;}));
    options.cols=Math.max.apply(null,(options.objs||[{g:base}]).map(function (o) {return o.g[0].length;}));
    // cubeview switches presets without resizing them to the shared edit board.
    if(options.objs) options.objs=options.objs.map(function (o) {
      var grid=[];
      for(var r=0;r<options.rows;r++) {
        var row=[];
        for(var c=0;c<options.cols;c++) row.push(o.g[r]&&c<o.g[r].length?o.g[r][c]:0);
        grid.push(row);
      }
      return {n:o.n,g:grid};
    });
    h("p","hint","先选物体，再正对前面、左面或上面观察。也可点格子改变层数，比较挡住的积木。",root);
    var child=h("div","manip",null,root);child.setAttribute("data-manip","cubeview");child.setAttribute("data-cfg",JSON.stringify(options));
    // Avoid re-entering the parent's initial mount before data-mounted is set.
    setTimeout(function () {M.mount();},0);
  }
  window.PeiyuManip.register("solids",function (root,cfg) {
    css();cfg=cfg&&typeof cfg==="object"?cfg:{};
    var mode=["sort","roll","stable","tower","join","layers","views"].indexOf(cfg.mode)>=0?cfg.mode:"sort";
    if(cfg.profile === "p1a-u3" && mode !== "views") {nativeSource(root,cfg,mode);return;}
    root.removeAttribute("data-solids-native");
    if(mode==="views") views(root,cfg);
    else if(mode==="join"||mode==="layers") piles(root,mode);
    else ({sort:sort,roll:roll,stable:stable,tower:tower})[mode](root);
  });
})();
