/* 本地复习计划与教师汇总；纯计算部分也供边界检查使用。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else { root.PeiyuLearning = api; document.addEventListener("DOMContentLoaded", api.init); }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  var DAY = 86400000, INTERVALS = [1, 3, 7, 14];
  function object(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function timestamp(x) { var n = Date.parse(x); return Number.isFinite(n) ? n : null; }

  function review(state, result, now, helped) {
    var p = Object.assign({}, state), last = timestamp(p.reviewedAt);
    if (["ok", "part", "no"].indexOf(result) < 0) return p;
    var step = Number.isInteger(p.reviewStep) ? Math.max(0, Math.min(3, p.reviewStep)) : 0;
    if (result !== "ok" || helped) step = 0;
    else if (last !== null) {
      var due = timestamp(p.reviewDueAt);
      if (now < Math.max(last + DAY, due === null ? last + INTERVALS[step] * DAY : due)) return p;
      step = Math.min(3, step + 1);
    } // 提前做对不改变到期日，也不能跳过3/7/14天的间隔。
    p.reviewStep = step;
    p.reviewedAt = new Date(now).toISOString();
    p.reviewDueAt = new Date(now + INTERVALS[step] * DAY).toISOString();
    return p;
  }

  function recommendation(meta, data) {
    var ps = data.problems || {};
    var ids = Object.keys(ps).filter(function (id) { return meta[id] && ps[id].first && timestamp(ps[id].firstAt) !== null; });
    var order = Object.create(null);
    (Array.isArray(data.log) ? data.log : []).forEach(function (event, i) {
      if (event && ps[event.id] && (event.kind === "attempt" || event.kind === "self") && event.at === ps[event.id].firstAt && order[event.id] === undefined) order[event.id] = i;
    });
    ids.sort(function (a, b) { return timestamp(ps[b].firstAt) - timestamp(ps[a].firstAt) || (order[b] ?? -1) - (order[a] ?? -1) || a.localeCompare(b); });
    if (ids.length < 2) return null;
    var boundary = timestamp(ps[ids[1]].firstAt), tied = ids.filter(function (id) { return timestamp(ps[id].firstAt) === boundary; });
    if (tied.length > 1 && tied.some(function (id) { return order[id] === undefined; })) return null;
    var a = ids[0], b = ids[1], lv = meta[a].lv;
    if (!Number.isInteger(lv) || lv >= 5 || lv !== meta[b].lv || [a, b].some(function (id) { return ps[id].first !== "ok" || ps[id].helped; })) return null;
    return lv + 1;
  }

  function plan(meta, data, now, limit) {
    var ps = data.problems || {}, studied = new Set(), due = [], fresh = [];
    Object.keys(ps).forEach(function (id) { if (meta[id] && ps[id].first) studied.add(meta[id].fr); });
    var upgrade = recommendation(meta, data);
    Object.keys(meta).sort().forEach(function (id) {
      var p = ps[id], m = meta[id];
      if (!studied.has(m.fr)) return;
      if (!p || !p.first) { fresh.push(id); return; }
      var at = timestamp(p.reviewDueAt);
      if (at === null) {
        var old = timestamp(p.at || p.firstAt);
        at = old === null ? now : old + DAY;
      }
      if (at <= now) due.push({ id: id, at: at });
    });
    due.sort(function (a, b) { return a.at - b.at || a.id.localeCompare(b.id); });
    fresh.sort(function (a, b) { return Number(meta[b].lv === upgrade) - Number(meta[a].lv === upgrade) || meta[a].lv - meta[b].lv || a.localeCompare(b); });
    var buckets = new Map(), ordered = due.map(function (x) { return { id: x.id, due: true }; }).concat(fresh.map(function (id) { return { id: id, due: false }; }));
    ordered.forEach(function (x) { var fr = meta[x.id].fr; if (!buckets.has(fr)) buckets.set(fr, []); buckets.get(fr).push(x); });
    var selected = [], frs = Array.from(buckets.keys());
    while (selected.length < (limit || 8) && frs.some(function (fr) { return buckets.get(fr).length; })) {
      frs.forEach(function (fr) { if (selected.length < (limit || 8) && buckets.get(fr).length) selected.push(buckets.get(fr).shift()); });
    }
    return { items: selected, due: due.length, studied: studied.size, upgrade: upgrade };
  }

  function validateExport(doc, meta) {
    if (!object(doc) || !object(doc.data) || !object(doc.data.problems)) throw new Error("不是本站导出的完整记录。");
    if (typeof doc.name !== "string" || doc.name.length > 80) throw new Error("姓名字段无效。");
    if (typeof doc.exportedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(doc.exportedAt) || timestamp(doc.exportedAt) === null) throw new Error("导出时间无效。");
    if (doc.studentId !== undefined && (typeof doc.studentId !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(doc.studentId))) throw new Error("设备记录编号无效。");
    var keys = Object.keys(doc.data.problems), clean = Object.create(null), ignored = 0;
    if (keys.length > 10000) throw new Error("单份记录题数过多。");
    keys.forEach(function (id) {
      if (!/^P\d{6}$/.test(id) || !Object.prototype.hasOwnProperty.call(meta, id)) { ignored++; return; }
      var p = doc.data.problems[id];
      if (!object(p) || (p.first != null && ["ok", "no", "part", "unsure"].indexOf(p.first) < 0) ||
          (p.status != null && ["ok", "no", "part", "unsure"].indexOf(p.status) < 0) ||
          (p.helped !== undefined && typeof p.helped !== "boolean") ||
          (p.attempts !== undefined && (!Number.isInteger(p.attempts) || p.attempts < 0 || p.attempts > 100000))) throw new Error(id + " 的作答字段无效。");
      var feedback = p.feedback || [];
      if (!Array.isArray(feedback) || feedback.length > 1000) throw new Error(id + " 的反馈字段无效。");
      feedback = feedback.map(function (f) {
        if (!object(f) || typeof f.tag !== "string" || f.tag.length > 100 || (f.note != null && (typeof f.note !== "string" || f.note.length > 2000))) throw new Error(id + " 的反馈内容无效。");
        return { tag: f.tag, note: f.note || "" };
      });
      clean[id] = { first: p.first || null, status: p.status || p.first || null, helped: !!p.helped, feedback: feedback };
    });
    var name = doc.name.trim(), key = doc.studentId ? "id:" + doc.studentId : "name:" + name;
    // 旧版匿名导出以内容辨别；同内容重复文件不会增加人数。
    if (!doc.studentId && !name) key = "anonymous:" + JSON.stringify(clean);
    return { key: key, name: name || "未填姓名", at: timestamp(doc.exportedAt), problems: clean, ignored: ignored };
  }

  function aggregate(records, meta) {
    var latest = new Map();
    records.forEach(function (r) { var old = latest.get(r.key); if (!old || r.at >= old.at) latest.set(r.key, r); });
    var students = [], topics = Object.create(null), wrong = Object.create(null), firstWrong = Object.create(null), totals = Object.create(null), feedback = [];
    latest.forEach(function (r) {
      var student = { name: r.name, tried: 0, independent: 0, pending: 0 };
      Object.keys(r.problems).forEach(function (id) {
        var p = r.problems[id], m = meta[id];
        if (!m) return;
        if (p.first) {
          var good = p.first === "ok" && !p.helped, pending = p.status !== "ok";
          student.tried++; student.independent += Number(good); student.pending += Number(pending);
          var t = topics[m.fr] || (topics[m.fr] = { name: m.topic, tried: 0, independent: 0 });
          t.tried++; t.independent += Number(good);
          if (pending) wrong[id] = (wrong[id] || 0) + 1;
          totals[id] = (totals[id] || 0) + 1;
          if (p.first === "no" || p.first === "part") firstWrong[id] = (firstWrong[id] || 0) + 1;
        }
        p.feedback.forEach(function (f) { feedback.push({ name: r.name, id: id, tag: f.tag, note: f.note }); });
      });
      students.push(student);
    });
    students.sort(function (a, b) { return a.name.localeCompare(b.name, "zh-CN"); });
    return { students: students, topics: topics, wrong: wrong, firstWrong: firstWrong, totals: totals, feedback: feedback, duplicates: records.length - latest.size };
  }

  function table(headers, rows) {
    return '<div class="tbl"><table><thead><tr>' + headers.map(function (s) { return "<th>" + esc(s) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (row) { return "<tr>" + row.map(function (s) { return "<td>" + esc(s) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function rate(n, total) { return total ? (100 * n / total).toFixed(1) + "%" : "—"; }
  function initTeacher(meta) {
    var input = document.getElementById("teacher-files");
    if (!input) return;
    var records = [], msg = document.getElementById("teacher-message"), output = document.getElementById("teacher-output");
    function render() {
      var a = aggregate(records, meta);
      var s = "<h2>学生 · " + a.students.length + " 人</h2>" + table(["学生", "做过", "首次独立做对", "独立做对率", "待重做"], a.students.map(function (x) { return [x.name, x.tried, x.independent, rate(x.independent, x.tried), x.pending]; }));
      s += "<h2>各专题</h2>" + table(["专题", "作答人次", "首次独立做对", "独立做对率"], Object.keys(a.topics).sort().map(function (fr) { var t = a.topics[fr]; return [t.name, t.tried, t.independent, rate(t.independent, t.tried)]; }));
      s += "<h2>全班待重做最多的题</h2><p class=\"hint-text\">按每题当前尚未做对的学生人数计数，同一学生只计一次。</p><ul>" + Object.keys(a.wrong).sort(function (x, y) { return a.wrong[y] - a.wrong[x] || x.localeCompare(y); }).slice(0, 30).map(function (id) { return '<li><a href="p/' + id + '.html">' + esc(meta[id].label) + "</a>：" + a.wrong[id] + " 人</li>"; }).join("") + "</ul>";
      s += "<h2>首次作答常错题</h2><p class=\"hint-text\">首次未做出或部分做对的人数，后来重做正确仍保留。待自评不计为错题。</p><ul>" + Object.keys(a.firstWrong).sort(function (x, y) { return a.firstWrong[y] - a.firstWrong[x] || x.localeCompare(y); }).slice(0, 30).map(function (id) { return '<li><a href="p/' + id + '.html">' + esc(meta[id].label) + "</a>：" + a.firstWrong[id] + "/" + a.totals[id] + " 人（" + rate(a.firstWrong[id], a.totals[id]) + "）</li>"; }).join("") + "</ul>";
      s += "<h2>学生反馈</h2><ul>" + a.feedback.map(function (f) { return "<li>" + esc(f.name) + " · " + esc(meta[f.id].label) + "：" + esc(f.tag) + " — " + esc(f.note) + "</li>"; }).join("") + "</ul>";
      output.innerHTML = s;
      return a;
    }
    input.addEventListener("change", async function () {
      var files = Array.from(input.files || []), errors = [], ignored = 0;
      if (files.length > 100) { msg.textContent = "一次最多选择100份记录。"; return; }
      for (var file of files) {
        try {
          if (file.size > 2 * 1024 * 1024) throw new Error("文件超过2MB。");
          var r = validateExport(JSON.parse(await file.text()), meta);
          records.push(r); ignored += r.ignored;
        } catch (e) { errors.push(file.name + "：" + e.message); }
      }
      var a = render();
      msg.textContent = "当前 " + a.students.length + " 名学生；重复或旧快照 " + a.duplicates + " 份。忽略当前题库外记录 " + ignored + " 条。" + (errors.length ? " 未导入：" + errors.join("；") : "");
      input.value = "";
    });
    document.getElementById("teacher-clear").addEventListener("click", function () { records = []; output.replaceChildren(); msg.textContent = "已清空本页汇总，学生原始记录未改变。"; });
  }

  function initToday(meta) {
    var node = document.getElementById("today-plan"), api = window.PeiyuOlympic;
    if (!node || !api) return;
    var result = plan(meta, api.load(), Date.now(), 8);
    document.getElementById("today-message").textContent = result.studied ? "到期复习 " + result.due + " 题；从已学专题中交错安排，先自己判断该用什么方法。" : "先从专题地图学习并完成几道题，这里就会安排复习和交错练习。";
    if (result.upgrade) document.getElementById("today-upgrade").textContent = "最近同难度连续两题首次独立做对，可以试试 F" + result.upgrade + "。";
    node.innerHTML = '<ul class="plist">' + result.items.map(function (x, i) { return '<li><a href="p/' + x.id + '.html?practice=1"><span class="name">练习 ' + (i + 1) + '</span><span class="meta">' + (x.due ? "到期复习" : "交错练习") + "</span></a></li>"; }).join("") + "</ul>";
  }

  function initBlind() {
    if (!new URLSearchParams(location.search).has("practice") || !document.getElementById("pdata")) return;
    document.documentElement.classList.add("practice-blind");
    var p = document.createElement("p"); p.className = "hint-text"; p.textContent = "交错练习：先自己判断用什么方法，作答后再显示专题与方法。";
    document.querySelector("h1").after(p);
    document.addEventListener("peiyu-record", function (e) { if (["attempt", "self", "view-solution"].indexOf(e.detail.kind) >= 0) document.documentElement.classList.remove("practice-blind"); });
  }
  function init() {
    initBlind();
    var meta = window.PEIYU_PROBLEMS;
    if (meta) { initTeacher(meta); initToday(meta); }
  }
  return { review: review, plan: plan, recommendation: recommendation, validateExport: validateExport, aggregate: aggregate, esc: esc, init: init };
});
