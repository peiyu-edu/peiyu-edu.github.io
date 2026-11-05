/* Junior owns its layout; evidence and graph loading use the shared T1 interface. */
(function () {
  "use strict";
  var panel = document.getElementById("jm-map");
  var host = document.getElementById("jm-strands");
  var status = document.getElementById("jm-status");
  var sections, strands;
  var books = { "7a": "七上", "7b": "七下", "8a": "八上", "8b": "八下", "9a": "九上", "9b": "九下" };
  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function link(text, href) {
    var a = el("a", text); a.href = href; return a;
  }
  function sectionLinks(parent, title, ids) {
    parent.appendChild(el("p", title));
    var list = el("ul");
    ids.forEach(function (id) {
      var li = el("li");
      li.appendChild(link(sections[id].name, "#tab=map&sec=" + encodeURIComponent(id)));
      list.appendChild(li);
    });
    if (!ids.length) list.appendChild(el("li", "暂无"));
    parent.appendChild(list);
  }
  function refresh() {
    var stats = window.PEIYU_COMPUTE_MASTERY();
    Object.keys(sections).forEach(function (id) {
      var node = document.getElementById("jm-" + id), value = stats[id];
      var state = value ? value.status : "untouched";
      node.classList.remove("st-mastered", "st-weak", "st-untouched");
      node.classList.add("st-" + state);
      node.querySelector(".jm-evidence").textContent = state === "untouched" ? "○ 尚无作答" :
        (state === "mastered" ? "● 作答表现较好" : "△ 建议再练") + " · " + value.total + " 条作答";
    });
  }
  function route() {
    var params = new URLSearchParams(location.hash.slice(1));
    var map = params.get("tab") === "map";
    panel.hidden = !map;
    document.getElementById("ws-root").hidden = map;
    ["cards", "map"].forEach(function (tab) {
      var a = document.getElementById("jm-" + tab + "-tab");
      if ((tab === "map") === map) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    host.querySelectorAll(".jm-selected").forEach(function (n) { n.classList.remove("jm-selected"); });
    var node = document.getElementById("jm-" + params.get("sec"));
    if (map && node) {
      node.closest(".jm-strand").open = true;
      node.querySelector("details").open = true;
      node.classList.add("jm-selected");
      node.scrollIntoView({ block: "nearest" });
    }
  }
  route();
  window.addEventListener("hashchange", route);
  window.PEIYU_WIKI_GRAPH_READY.then(function () {
    sections = window.PEIYU_SEC_META;
    strands = window.PEIYU_STRANDS;
    Object.keys(strands).forEach(function (strandId) {
      var ids = Object.keys(sections).filter(function (id) { return sections[id].strand === strandId; });
      var group = el("details", "", "jm-strand"); group.open = true;
      group.appendChild(el("summary", strands[strandId].name + " · " + ids.length + " 节"));
      group.appendChild(el("p", strands[strandId].desc));
      var nodes = el("div", "", "jm-nodes");
      ids.forEach(function (id) {
        var sec = sections[id], node = el("article", "", "jm-node"); node.id = "jm-" + id;
        node.dataset.section = id;
        node.appendChild(el("p", books[sec.book] + " · 第 " + sec.ch + " 章" + (sec.optional ? " · 选学" : "")));
        node.appendChild(link(sec.name, "lessons/" + id + ".html"));
        node.appendChild(el("p", "", "jm-evidence"));
        var relations = el("details");
        relations.appendChild(el("summary", "先修与后续"));
        sectionLinks(relations, "先学这些课节", sec.prereqs);
        sectionLinks(relations, "学完可接着学", sec.unlocks);
        var external = sec.prerequisitesExternal || [];
        if (external.length) {
          relations.appendChild(el("p", "小学衔接 · 回看单元首页"));
          var list = el("ul");
          external.forEach(function (edge) {
            var li = el("li");
            li.appendChild(link(edge.title, edge.href));
            li.appendChild(el("span", edge.relation === "recall" ? "（唤醒旧知）" : "（直观经验，初中重新建立）"));
            list.appendChild(li);
          });
          relations.appendChild(list);
        }
        node.appendChild(relations); nodes.appendChild(node);
      });
      group.appendChild(nodes); host.appendChild(group);
    });
    status.textContent = "共 " + Object.keys(sections).length + " 节 · 四条主线，可折叠分区";
    refresh(); route();
    if (window.PeiyuLearningState) window.PeiyuLearningState.subscribe(refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("pageshow", refresh);
  }).catch(function () { status.textContent = "图谱加载失败，请刷新后重试。"; });
})();
