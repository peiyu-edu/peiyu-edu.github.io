/* Offline exam state machine. Answers are revealed only after an immutable submission. */
(function (root) {
  "use strict";
  var PREFIX = "peiyu.olympic.exam.v1.";
  function fresh(config) { return { signature: config.signature, phase: "ready", answers: {}, marks: {}, markDrafts: {}, recorded: {}, selfRecorded: {} }; }
  function restore(config, raw) {
    if (!raw || raw.signature !== config.signature || ["ready", "running", "submitted"].indexOf(raw.phase) < 0) return fresh(config);
    if (raw.phase !== "ready" && (!Number.isFinite(raw.deadline) || !Number.isFinite(raw.startedAt) || raw.deadline <= raw.startedAt)) return fresh(config);
    var state = fresh(config);
    Object.keys(state).forEach(function (k) { if (raw[k] !== undefined) state[k] = raw[k]; });
    ["deadline", "startedAt", "lastSeen", "submittedAt", "reason", "run"].forEach(function (k) { state[k] = raw[k]; });
    ["answers", "marks", "markDrafts", "recorded", "selfRecorded"].forEach(function (k) {
      if (!state[k] || typeof state[k] !== "object" || Array.isArray(state[k])) state[k] = {};
    });
    config.questions.forEach(function (q) { state.answers[q.id] = String(state.answers[q.id] || "").slice(0, 20000); });
    return state;
  }
  function clock(state, now) { return Math.max(Number.isFinite(now) ? now : Date.now(), state.lastSeen || 0); }
  function submit(state, now, reason) {
    if (state.phase !== "running") return state;
    state.lastSeen = clock(state, now);
    state.submittedAt = Math.min(state.lastSeen, state.deadline);
    state.reason = state.lastSeen >= state.deadline ? "expired" : reason || "manual";
    state.phase = "submitted";
    return state;
  }
  function tick(state, now) {
    if (state.phase === "running") {
      state.lastSeen = clock(state, now);
      if (state.lastSeen >= state.deadline) submit(state, state.lastSeen, "expired");
    }
    return state;
  }
  function start(config, state, minutes, now) {
    if (!config.eligible || state.phase !== "ready" || !Number.isFinite(minutes) || minutes < 1 || minutes > 480) return false;
    if (config.minutes && minutes !== config.minutes) return false;
    state.phase = "running"; state.startedAt = now; state.lastSeen = now;
    state.deadline = now + minutes * 60000; state.run = String(now) + ":" + Math.random().toString(36).slice(2);
    return true;
  }
  function answer(state, id, value, now) {
    tick(state, now);
    if (state.phase !== "running") return false;
    state.answers[id] = String(value).slice(0, 20000); return true;
  }
  function grade(q, value, same) {
    value = String(value || "").trim();
    if (q.type !== "choice" && q.type !== "blank") return { result: "unsure", points: null };
    if (!value) return { result: "no", points: 0 };
    if (q.type === "choice") {
      var pick = value.toUpperCase().replace(/[^A-E]/g, "").split("").sort().join("");
      if (!q.choice) return { result: "unsure", points: null };
      return same(pick, q.choice.split("").sort().join("")) ? { result: "ok", points: 1 } : { result: "no", points: 0 };
    }
    if (q.answers.length === 1 && same(value, q.answers[0])) return { result: "ok", points: 1 };
    // Equivalent expressions and multi-blank formats cannot be reliably rejected by a small parser.
    return { result: "unsure", points: null };
  }
  function mark(state, q, value) {
    if (state.phase !== "submitted") return false;
    if (q.rubric) {
      if (!Array.isArray(value) || value.length !== q.rubric.steps.length || value.some(function (v) { return typeof v !== "boolean"; })) return false;
      state.marks[q.id] = value.slice();
    } else {
      if (["ok", "part", "no"].indexOf(value) < 0) return false;
      state.marks[q.id] = value;
    }
    return true;
  }
  function selfResult(q, value) {
    if (q.rubric && Array.isArray(value)) {
      var points = q.rubric.steps.reduce(function (n, s, i) { return n + (value[i] ? s.points : 0); }, 0);
      return { result: points === q.rubric.total ? "ok" : points ? "part" : "no", points: points, total: q.rubric.total };
    }
    return { result: value || "unsure", points: null, total: null };
  }
  function stats(config, state, same) {
    var sum = { autoPoints: 0, autoTotal: 0, pending: 0, selfPoints: 0, selfTotal: 0, selfPending: 0 };
    config.questions.forEach(function (q) {
      var g = grade(q, state.answers[q.id], same), m = state.marks[q.id];
      if (q.type === "choice" || q.type === "blank") {
        sum.autoTotal++;
        if (g.points === null) { if (m === "ok") sum.autoPoints++; else if (!m) sum.pending++; }
        else sum.autoPoints += g.points;
      } else if (q.rubric) {
        sum.selfTotal += q.rubric.total;
        if (!Array.isArray(m)) sum.selfPending++;
        else sum.selfPoints += selfResult(q, m).points;
      } else if (!m) sum.selfPending++;
    });
    return sum;
  }
  var API = { fresh: fresh, restore: restore, start: start, answer: answer, tick: tick, submit: submit, grade: grade, mark: mark, stats: stats, selfResult: selfResult };
  root.PeiyuExams = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (!root.document) return;
  root.document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("exam-data"); if (!el) return;
    var config = JSON.parse(el.textContent), key = PREFIX + config.id, saved, olympic = root.PeiyuOlympic;
    if (!olympic) return;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch (e) { /* First visit or unavailable storage. */ }
    var state = restore(config, saved), storageFailed = false, externalReload = false;
    function persist() {
      try { localStorage.setItem(key, JSON.stringify(state)); }
      catch (e) { storageFailed = true; }
    }
    var startBtn = document.getElementById("exam-start"), submitBtn = document.getElementById("exam-submit"), resetBtn = document.getElementById("exam-reset");
    var minutes = document.getElementById("exam-minutes"), status = document.getElementById("exam-status"), timer = document.getElementById("exam-timer"), summary = document.getElementById("exam-summary");
    var inputs = {}, results = {};
    function recordResults() {
      if (state.phase !== "submitted") return;
      config.questions.forEach(function (q) {
        if (!state.recorded[q.id]) {
          var g = grade(q, state.answers[q.id], olympic.same);
          olympic.record(q.id, "attempt", g.result, "限时练习：" + config.id + ":" + state.run);
          state.recorded[q.id] = true; persist();
        }
      });
    }
    function recordSelf(q) {
      var value = state.marks[q.id], token = JSON.stringify(value);
      if (value !== undefined && state.selfRecorded[q.id] !== token) {
        olympic.record(q.id, "self", selfResult(q, value).result, "限时练习自评：" + config.id);
        state.selfRecorded[q.id] = token; persist();
      }
    }
    function text(tag, message, parent) { var e = document.createElement(tag); e.textContent = message; parent.appendChild(e); return e; }
    config.questions.forEach(function (q) {
      var section = document.querySelector('[data-exam-question="' + q.id + '"]'), box = section.querySelector("[data-exam-input]");
      var label = text("label", q.type === "choice" ? "所选选项（如 A 或 AC）" : q.type === "blank" ? "你的答案" : "你的解答（也可在纸上完成，并在这里记下结论）", box);
      var input = document.createElement(q.type === "proof" ? "textarea" : "input");
      input.id = "exam-answer-" + q.id; label.htmlFor = input.id;
      if (input.tagName === "TEXTAREA") { input.rows = 5; input.style.width = "100%"; }
      else { input.type = "text"; input.className = "ans"; input.style.maxWidth = "100%"; }
      input.maxLength = 20000; input.autocomplete = "off"; input.value = state.answers[q.id] || "";
      input.addEventListener("input", function () {
        if (!answer(state, q.id, input.value, Date.now())) input.value = state.answers[q.id] || "";
        persist(); render();
      });
      box.appendChild(input); inputs[q.id] = input; results[q.id] = section.querySelector("[data-exam-result]");
    });
    function showResult(q) {
      var dest = results[q.id]; if (dest.dataset.rendered) return; dest.dataset.rendered = "1";
      var g = grade(q, state.answers[q.id], olympic.same);
      text("p", g.result === "ok" ? "自动核对：1/1 自拟练习分。" : g.result === "no" ? "自动核对：0/1 自拟练习分。" : "请对照答案或完整解答自评；自动核对不能确认。", dest);
      if (q.type === "choice" && q.choice) text("p", "参考选项：" + q.choice, dest);
      else if (q.answerHtml) { var standard = document.createElement("div"); standard.innerHTML = q.answerHtml; dest.appendChild(standard); }
      else if (q.type === "blank") text("p", "参考答案：" + q.answers.join("；"), dest);
      var needsSelf = q.type === "proof" || g.result === "unsure";
      if (!needsSelf) return;
      if (q.rubric) {
        text("p", "培玉自拟练习评分（非官方），请对照完整解答逐项核验。", dest);
        var chosen = Array.isArray(state.markDrafts[q.id]) ? state.markDrafts[q.id].slice() : Array.isArray(state.marks[q.id]) ? state.marks[q.id].slice() : q.rubric.steps.map(function () { return false; });
        var draftScore = text("p", "勾选后请保存本次自评，才会写入学习记录。", dest);
        q.rubric.steps.forEach(function (step, i) {
          var row = document.createElement("label"), cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = chosen[i];
          row.className = "rubric-step";
          var description = document.createElement("div"), points = document.createElement("span");
          description.className = "rubric-description";
          if (step.html) description.innerHTML = step.html; else description.textContent = step.text;
          points.className = "chip"; points.textContent = step.points + " 分";
          row.append(cb, description, points); dest.appendChild(row);
          cb.addEventListener("change", function () {
            chosen[i] = cb.checked; state.markDrafts[q.id] = chosen.slice(); persist();
            draftScore.textContent = "本次勾选 " + selfResult(q, chosen).points + "/" + q.rubric.total + " 分，尚未保存本次自评。";
          });
        });
        var accept = text("button", "保存本次自评", dest); accept.type = "button"; accept.className = "btn"; accept.dataset.examSaveRubric = q.id;
        accept.addEventListener("click", function () { mark(state, q, chosen); persist(); recordSelf(q); renderSummary(); draftScore.textContent = "已保存本次自评。"; });
        var zero = text("button", "已核对，以上均未得分", dest); zero.type = "button"; zero.className = "pill";
        zero.addEventListener("click", function () { chosen = q.rubric.steps.map(function () { return false; }); state.markDrafts[q.id] = chosen.slice(); dest.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = false; }); mark(state, q, chosen); persist(); recordSelf(q); renderSummary(); draftScore.textContent = "已保存本次自评。"; });
      } else {
        if (q.type === "proof") text("p", "本题暂无已复核的评分步骤，只记录做对/部分/未做出，不折算分数。", dest);
        var row = document.createElement("div"); row.className = "row"; dest.appendChild(row);
        [["做对", "ok"], ["部分做对", "part"], ["未做出", "no"]].forEach(function (pair) {
          var b = text("button", pair[0], row); b.type = "button"; b.className = "pill"; b.setAttribute("aria-pressed", String(state.marks[q.id] === pair[1]));
          b.addEventListener("click", function () { mark(state, q, pair[1]); persist(); recordSelf(q); row.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); renderSummary(); });
        });
      }
    }
    function renderSummary() {
      if (state.phase !== "submitted") { summary.textContent = ""; return; }
      var s = stats(config, state, olympic.same);
      summary.textContent = "选择/填空练习分：" + s.autoPoints + "/" + s.autoTotal + "（待核对 " + s.pending + " 题）；解答题自拟步骤分：" + s.selfPoints + "/" + s.selfTotal + "，另有 " + s.selfPending + " 题待自评。缺题未计入，以上均非官方分数。";
    }
    function render() {
      var submitted = state.phase === "submitted";
      startBtn.hidden = state.phase !== "ready"; startBtn.disabled = !config.eligible;
      submitBtn.hidden = state.phase !== "running"; resetBtn.hidden = !submitted; minutes.disabled = state.phase !== "ready";
      status.textContent = (submitted ? state.reason === "expired" ? "时间到，已自动交卷并冻结作答。" : "已交卷，作答已冻结。" : state.phase === "running" ? "正在计时，刷新或关闭不会暂停。" : config.eligible ? "准备好后开始；开始前作答框保持锁定。" : "本卷尚未达到模考条件，可浏览已整理题面。") + (storageFailed ? " 浏览器未能保存记录，请保持页面打开；刷新将无法恢复。" : "");
      var seconds = Math.max(0, Math.ceil(((state.deadline || 0) - clock(state, Date.now())) / 1000));
      timer.textContent = state.phase === "running" ? "剩余 " + Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0") : "";
      config.questions.forEach(function (q) { inputs[q.id].disabled = state.phase !== "running"; if (document.activeElement !== inputs[q.id]) inputs[q.id].value = state.answers[q.id] || ""; results[q.id].hidden = !submitted; document.querySelector('[data-exam-question="' + q.id + '"] [data-exam-backlink]').hidden = !submitted; if (submitted) showResult(q); });
      recordResults(); renderSummary();
    }
    startBtn.addEventListener("click", function () { if (start(config, state, Number(minutes.value), Date.now())) { persist(); render(); } });
    submitBtn.addEventListener("click", function () { submit(state, Date.now(), "manual"); persist(); render(); });
    resetBtn.addEventListener("click", function () {
      if (!root.confirm("开始新一份练习会替换本卷草稿；已写入「我的学习」的记录会保留。继续吗？")) return;
      state = fresh(config); persist(); root.location.reload();
    });
    function heartbeat() { var old = state.phase; tick(state, Date.now()); if (old === "running") persist(); render(); }
    heartbeat(); root.setInterval(heartbeat, 1000);
    root.addEventListener("storage", function (e) {
      if (e.key !== key && e.key !== null) return;
      var next;
      try { next = restore(config, e.key === null ? null : JSON.parse(e.newValue)); } catch (err) { return; }
      if (!e.newValue || state.run !== next.run || (state.phase === "submitted" && JSON.stringify(state.marks) !== JSON.stringify(next.marks))) {
        state = next; externalReload = true;
        root.location.reload(); return; // 换人/重开卷必须重建DOM与评分闭包，不能保留旧成绩。
      }
      state = next; var old = state.phase; tick(state, Date.now());
      if (old === "running" && state.phase === "submitted") persist(); render();
    });
    root.addEventListener("pagehide", function () { if (!externalReload) { tick(state, Date.now()); persist(); } });
  });
})(typeof window !== "undefined" ? window : globalThis);
