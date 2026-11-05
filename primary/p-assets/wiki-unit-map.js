/* Primary unit layout; answer evidence is read by the shared T1 Wiki reader. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else { root.PeiyuPrimaryMap = api; api.boot(root); }
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";
  var GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
  var STATES = { untouched: "○ 暂无作答", mastered: "● 作答较稳", weak: "● 有错题待回看" };

  function model(data) {
    if (!data || data.stage !== "primary" || !Array.isArray(data.chapters) || !data.sections) {
      throw new Error("Invalid primary Wiki data");
    }
    var units = data.chapters.map(function (chapter) {
      var id = chapter.no, hub = data.sections[id];
      if (!/^p[1-6][ab]-u\d+$/.test(id) || !hub) throw new Error("Invalid primary unit: " + id);
      return { id: id, name: chapter.title, book: chapter.book,
        grade: Number(id[1]), term: id[2], prereqs: hub.prereqs.slice(), start: hub.start };
    });
    var byId = {}, sections = {};
    units.forEach(function (unit) { byId[unit.id] = unit; });
    // Lessons and unit quizzes are evidence lookup entries, never map nodes or lesson-level edges.
    Object.keys(data.sections).forEach(function (sid) {
      var source = data.sections[sid], unit = byId[source.ch];
      if (unit) sections[sid] = { name: source.name, ch: unit.id, strand: "units", stage: unit.grade - 1,
        prereqs: sid === unit.id ? unit.prereqs.slice() : [] };
    });
    units.forEach(function (unit) {
      unit.prereqs.forEach(function (id) { if (!byId[id]) throw new Error("Unknown prerequisite: " + id); });
      sections[unit.id + "-test"] = { name: unit.name, ch: unit.id, prereqs: [] };
    });
    return { units: units, byId: byId, graph: { strands: { units: { name: "小学单元" } }, sections: sections } };
  }

  function aggregate(map, evidence) {
    var result = {};
    map.units.forEach(function (unit) { result[unit.id] = { total: 0, right: 0, wrong: 0, status: "untouched" }; });
    Object.keys(evidence).forEach(function (sid) {
      var entry = map.graph.sections[sid], target = entry && result[entry.ch];
      if (!target) return;
      ["total", "right", "wrong"].forEach(function (key) { target[key] += evidence[sid][key]; });
    });
    Object.keys(result).forEach(function (id) {
      var s = result[id];
      if (s.total) s.status = s.wrong === 0 || (s.right / s.total >= 0.8 && s.wrong <= 1) ? "mastered" : "weak";
    });
    return result;
  }

  function boot(win) {
    var doc = win.document, content = doc.getElementById("um-content");
    if (!content) return;
    function el(tag, className, text) {
      var node = doc.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }
    function route() {
      var params = new win.URLSearchParams(win.location.hash.slice(1)), showMap = params.get("tab") === "map";
      doc.getElementById("unit-map").hidden = !showMap;
      doc.getElementById("ws-root").hidden = showMap;
      ["map", "cards"].forEach(function (tab) {
        var link = doc.getElementById("um-" + tab + "-link");
        if ((tab === "map") === showMap) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
      var grade = doc.getElementById("um-grade-" + params.get("grade"));
      if (showMap && grade) grade.scrollIntoView({ block: "start" });
    }
    route();
    win.addEventListener("hashchange", route);
    var ownScript = doc.currentScript;
    var wikiUrl = new win.URL("../assets/wiki.js", ownScript.src).href;
    win.PEIYU_PRIMARY_MAP_READY = win.fetch("data/wiki.json").then(function (response) {
      if (!response.ok) throw new Error("Primary map load failed: " + response.status);
      return response.json();
    }).then(function (data) {
      var map = model(data);
      win.PEIYU_WIKI_GRAPH_DATA = map.graph;
      // Keep the primary shell: T1's reader otherwise mounts a high-school 3D entry.
      var top = doc.querySelector("header.top");
      if (top && !top.querySelector(".wk-topbtn")) {
        var marker = el("span", "wk-topbtn");
        marker.hidden = true;
        top.appendChild(marker);
      }
      return new Promise(function (resolve, reject) {
        var script = doc.createElement("script");
        script.src = wikiUrl;
        script.onload = function () { resolve(map); };
        script.onerror = function () { reject(new Error("Wiki reader unavailable")); };
        doc.head.appendChild(script);
      });
    }).then(function (map) {
      return win.PEIYU_WIKI_GRAPH_READY.then(function () {
        var fragment = doc.createDocumentFragment(), states = {};
        var gradeNav = doc.querySelector(".um-grades");
        GRADES.forEach(function (gradeName, index) {
          var jump = el("a", "", gradeName);
          jump.href = "#tab=map&grade=" + (index + 1);
          gradeNav.appendChild(jump);
          var grade = el("section", "um-grade");
          grade.id = "um-grade-" + (index + 1);
          grade.appendChild(el("h3", "", gradeName));
          var books = el("div", "um-books");
          ["a", "b"].forEach(function (term) {
            var book = el("section", "um-book");
            book.appendChild(el("h4", "", term === "a" ? "上册" : "下册"));
            var list = el("ol", "um-units");
            map.units.filter(function (unit) { return unit.grade === index + 1 && unit.term === term; })
              .forEach(function (unit) {
                var node = el("li", "um-unit st-untouched");
                node.dataset.unit = unit.id;
                var heading = el("h5"), link = el("a", "um-unit-link", unit.name);
                link.href = "lessons/" + unit.id + ".html";
                heading.appendChild(link);
                node.appendChild(heading);
                var state = el("p", "um-state", STATES.untouched);
                node.appendChild(state);
                states[unit.id] = { node: node, label: state };
                var names = unit.prereqs.map(function (id) { return map.byId[id].book + "·" + map.byId[id].name; });
                node.appendChild(el("p", "um-help", names.length ?
                  "卡在这里时，先回到" + names.join("、") + "补一补。" :
                  unit.start + "。"));
                if (names.length) {
                  var prereqs = el("div", "um-prereqs");
                  unit.prereqs.forEach(function (id, i) {
                    var pre = el("a", "", "先学：" + names[i]);
                    pre.href = "lessons/" + id + ".html";
                    prereqs.appendChild(pre);
                  });
                  node.appendChild(prereqs);
                }
                list.appendChild(node);
              });
            book.appendChild(list);
            books.appendChild(book);
          });
          grade.appendChild(books);
          fragment.appendChild(grade);
        });
        content.replaceChildren(fragment);
        content.setAttribute("aria-busy", "false");
        function refresh() {
          var summary = aggregate(map, win.PEIYU_COMPUTE_MASTERY());
          map.units.forEach(function (unit) {
            var state = summary[unit.id].status, target = states[unit.id];
            target.node.className = "um-unit st-" + state;
            target.label.textContent = STATES[state];
          });
        }
        refresh();
        if (win.PeiyuLearningState) win.PeiyuLearningState.subscribe(refresh);
        win.addEventListener("pageshow", refresh);
        route();
        return map;
      });
    });
    win.PEIYU_PRIMARY_MAP_READY.catch(function () {
      content.replaceChildren(el("p", "", "单元地图暂时没有加载成功，请刷新重试；方法卡入口仍可使用。"));
      content.setAttribute("aria-busy", "false");
    });
  }
  return { model: model, aggregate: aggregate, boot: boot };
});
