/* 培玉 · 高中数学 — 全景知识图谱的「下一步」行动块（wiki.html 第 2 个标签页）
   独立文件，不改图谱本身：监听 #kgInspector 重绘，在检查器下方挂一块：
   1. 「先补哪节」路径：沿硬先修链（SEC_META.prereqs）向上找本地做题记录里的薄弱节，
      按「地基在前」的顺序排成一条路径，最后回到当前节；没有记录时给直接先修作为预习建议。
   2. 「测一测本节题干信号」：跳到训练器，只出这一节的题干信号（wiki-trainer.js 的 startSec）；
      本节没有信号时退而练本章。
   3. 手机宽度（≤ 700px）：默认折叠地铁图，泳道矩阵和筛选条移到检查器上方；可展开地铁图。
   依赖：window.PEIYU_SEC_META、PEIYU_COMPUTE_MASTERY（wiki.js）、PEIYU_CUES / PEIYU_CUE_TRAINER（wiki-cues.js、wiki-trainer.js）。 */
(function () {
  "use strict";

  var SEC_META = window.PEIYU_SEC_META || {};
  var CARDS = window.PEIYU_WIKI_CARDS || [];
  var MOBILE = "(max-width: 700px)";
  if (!Object.keys(SEC_META).length) return;

  /* ---------- 样式 ---------- */
  (function injectStyle() {
    if (document.getElementById("peiyu-map-actions-css")) return;
    var st = document.createElement("style");
    st.id = "peiyu-map-actions-css";
    st.textContent = [
      ".kga{border-top:1.5px dashed var(--line);margin-top:12px;padding-top:12px}",
      ".kga-hd{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin-bottom:8px}",
      ".kga-hd b{font-size:15.5px}",
      ".kga-hd .small{color:var(--muted)}",
      ".kga-path{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;margin:4px 0 10px}",
      ".kga-step{display:inline-flex;flex-direction:column;gap:2px;border:1.5px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--bg);min-width:0}",
      ".kga-step.weak{border-color:var(--no);background:var(--no-soft)}",
      ".kga-step.cur{border-color:var(--b);background:var(--hl-soft)}",
      ".kga-step.todo{border-style:dashed}",
      ".kga-step .kga-lbl{font-size:12px;font-weight:700;color:var(--muted)}",
      ".kga-step.weak .kga-lbl{color:var(--no)}",
      ".kga-step.cur .kga-lbl{color:var(--b)}",
      ".kga-step .kga-nm{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14.5px;font-weight:600}",
      ".kga-step .kga-nm a{color:var(--c);text-decoration:none;font-size:13px;font-weight:600}",
      ".kga-step .kga-nm a:hover{text-decoration:underline}",
      ".kga-step .kga-nm button{font:inherit;font-size:12.5px;border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:6px;padding:1px 7px;cursor:pointer}",
      ".kga-arr{color:var(--a);font-weight:700;font-size:18px}",
      ".kga-why{font-size:13.5px;color:var(--muted);margin:0 0 8px;line-height:1.6}",
      ".kga-btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}",
      ".kga-btns .btn{min-height:38px;font-size:14px}",
      ".kga-btns .small{color:var(--muted)}",
      ".kga-mobile-toggle{display:none}",
      "@media " + MOBILE + "{",
      "  .kg-svg-wrap{display:none}",
      "  .kg-svg-wrap.kga-open{display:block}",
      "  .kga-mobile-toggle{display:inline-flex;align-items:center;gap:6px;min-height:38px;margin:6px 0}",
      "}"
    ].join("\n");
    document.head.appendChild(st);
  })();

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function mastery() { try { return window.PEIYU_COMPUTE_MASTERY ? window.PEIYU_COMPUTE_MASTERY() : {}; } catch (e) { return {}; } }
  function status(mst, sid) { return (mst[sid] && mst[sid].status) || "untouched"; }
  function weakLabel(item) {
    if (item && Number.isFinite(item.questionWrong)) return item.questionWrong > 0 ? "真题错 " + item.questionWrong + " 题" : "自评或练习需复习";
    return "作答或自评需复习";
  }
  function cueCount(sid) { return window.PEIYU_CUE_TRAINER && window.PEIYU_CUE_TRAINER.cueCount ? window.PEIYU_CUE_TRAINER.cueCount(sid) : 0; }
  function chCueCount(ch) { return (window.PEIYU_CUES || []).filter(function (c) { return c.ch === ch; }).length; }
  function secCh(sid) { var c = CARDS.filter(function (x) { return x.sec === sid; })[0]; return c ? c.ch : (SEC_META[sid] && SEC_META[sid].ch); }

  /* 当前选中节：从检查器里「去本节动手拖图」链接读，不碰图谱的私有变量 */
  function selectedSec(inspEl) {
    var a = inspEl.querySelector('a[href*="lessons/"]');
    var m = a && a.getAttribute("href").match(/lessons\/([a-z0-9-]+)\.html/);
    if (m && SEC_META[m[1]]) return m[1];
    var pill = document.querySelector("#kgLanes .kg-node-pill.sel[data-map-pick]");
    return pill ? pill.getAttribute("data-map-pick") : null;
  }

  /* 祖先及其深度（离当前节几步） */
  function ancestors(sid) {
    var depth = {};
    (function up(s, d) {
      (SEC_META[s] && SEC_META[s].prereqs || []).forEach(function (p) {
        if (!SEC_META[p]) return;
        if (depth[p] === undefined || depth[p] < d) depth[p] = d;
        if (d < 12) up(p, d + 1);
      });
    })(sid, 1);
    return depth;
  }

  /* 「先补哪节」：薄弱祖先按深度从深到浅排（地基在前），最后是当前节 */
  function buildPath(sid, mst) {
    var depth = ancestors(sid);
    var weak = Object.keys(depth).filter(function (p) { return status(mst, p) === "weak"; });
    weak.sort(function (a, b) { return depth[b] - depth[a] || (SEC_META[a].name < SEC_META[b].name ? -1 : 1); });
    // 只留「根」：它自己的祖先里没有薄弱节（先补最底下的那块）
    var roots = weak.filter(function (p) {
      var up = ancestors(p);
      return !Object.keys(up).some(function (q) { return status(mst, q) === "weak"; });
    });
    var rest = weak.filter(function (p) { return roots.indexOf(p) < 0; });
    return { roots: roots, rest: rest, all: roots.concat(rest) };
  }

  function stepHtml(sid, cls, lbl) {
    var m = SEC_META[sid];
    return (
      '<span class="kga-step ' + cls + '">' +
        '<span class="kga-lbl">' + lbl + "</span>" +
        '<span class="kga-nm">' + esc(m.name) +
          ' <a href="lessons/' + sid + '.html#step4">练一练</a>' +
          (cls !== "cur" ? ' <button type="button" data-map-pick="' + sid + '">在图上看</button>' : "") +
        "</span>" +
      "</span>"
    );
  }

  function renderActions(inspEl) {
    var old = inspEl.querySelector(".kga");
    if (old) old.remove();
    var sid = selectedSec(inspEl);
    if (!sid) return;
    var mst = mastery();
    var cur = status(mst, sid);
    var path = buildPath(sid, mst);
    var meta = SEC_META[sid];
    var directPre = (meta.prereqs || []).filter(function (p) { return SEC_META[p]; });
    var html = '<div class="kga">';

    // 1. 路径
    html += '<div class="kga-hd"><b>🧭 先补哪节</b>';
    if (path.all.length) {
      html += '<span class="small">按你的作答与自评反馈，先修链上有 ' + path.all.length + " 节薄弱，地基在前：</span></div>";
      html += '<div class="kga-path">';
      path.all.forEach(function (p, i) {
        html += stepHtml(p, "weak", (i === 0 ? "先补" : "再补") + "（" + weakLabel(mst[p]) + "）") + '<span class="kga-arr">→</span>';
      });
      html += stepHtml(sid, "cur", cur === "weak" ? "最后回到本节（" + weakLabel(mst[sid]) + "）" : "最后回到本节");
      html += "</div>";
      html += '<p class="kga-why">薄弱先修不补，本节的错会反复出现。每节点「练一练」做 4–6 道，答对后图谱会自动点亮。</p>';
    } else if (cur === "weak") {
      html += '<span class="small">先修链上没有薄弱节，问题就在本节自己：</span></div>';
      html += '<div class="kga-path">' + stepHtml(sid, "cur", "本节（" + weakLabel(mst[sid]) + "）") + "</div>";
      html += '<p class="kga-why">先看本节的方法卡和红线，再回「练一练」把做错的那道重做一遍。</p>';
    } else if (cur === "mastered") {
      var nextUnl = (meta.unlocks || []).filter(function (u) { return SEC_META[u] && status(mst, u) !== "mastered"; }).slice(0, 2);
      html += '<span class="small">本节已点亮。' + (nextUnl.length ? "顺着解锁往前走：" : "") + "</span></div>";
      if (nextUnl.length) {
        html += '<div class="kga-path">' + stepHtml(sid, "cur", "已点亮");
        nextUnl.forEach(function (u) { html += '<span class="kga-arr">→</span>' + stepHtml(u, "todo", status(mst, u) === "weak" ? "待攻克" : "下一步"); });
        html += "</div>";
      }
    } else {
      html += '<span class="small">还没有本节的做题记录。' + (directPre.length ? "开始前先确认这几节的硬先修：" : "") + "</span></div>";
      if (directPre.length) {
        html += '<div class="kga-path">';
        directPre.forEach(function (p) {
          var st = status(mst, p);
          html += stepHtml(p, st === "weak" ? "weak" : (st === "mastered" ? "cur" : "todo"), st === "weak" ? "薄弱，先补" : (st === "mastered" ? "已点亮" : "先修，没做过")) + '<span class="kga-arr">→</span>';
        });
        html += stepHtml(sid, "cur", "本节") + "</div>";
      }
      html += '<p class="kga-why">做一遍本节「练一练」，图谱就会按你的对错点亮或标红，这里会给出要补的路径。</p>';
    }

    // 2. 测一测
    var n = cueCount(sid), ch = secCh(sid), nCh = ch ? chCueCount(ch) : 0;
    html += '<div class="kga-btns">';
    if (n) {
      html += '<button type="button" class="btn" data-kga-test="' + sid + '">🧠 测一测本节题干信号（' + n + " 条）</button>";
      html += '<span class="small">只给题干，你先想第一步，再揭晓</span>';
    } else if (ch && nCh) {
      html += '<button type="button" class="btn ghost" data-kga-test-ch="' + ch + '">🧠 本节暂无题干信号，练本章的 ' + nCh + " 条</button>";
    }
    html += '<a class="btn ghost" href="lessons/' + sid + '.html#step4" style="min-height:38px;font-size:14px">📝 做本节练一练</a>';
    html += "</div></div>";

    var box = document.createElement("div");
    box.innerHTML = html;
    inspEl.appendChild(box.firstChild);
  }

  /* ---------- 手机：默认泳道矩阵，地铁图可展开 ---------- */
  var moved = false;
  function layoutMobile() {
    var sec = document.getElementById("tab-map");
    var wrap = sec && sec.querySelector(".kg-svg-wrap");
    var insp = document.getElementById("kgInspector");
    var filt = document.getElementById("kgFilterBar");
    var lanes = document.getElementById("kgLanes");
    if (!sec || !wrap || !insp || !lanes) return;
    var isMobile = window.matchMedia(MOBILE).matches;
    if (isMobile && !moved) {
      // 泳道矩阵 + 筛选条移到检查器上方；地铁图折叠，留一个展开按钮
      if (filt) sec.insertBefore(filt, insp);
      sec.insertBefore(lanes, insp);
      if (!sec.querySelector(".kga-mobile-toggle")) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "btn ghost kga-mobile-toggle";
        b.textContent = "🗺️ 展开地铁图（可左右拖动）";
        b.addEventListener("click", function () {
          var open = wrap.classList.toggle("kga-open");
          b.textContent = open ? "收起地铁图" : "🗺️ 展开地铁图（可左右拖动）";
          if (open) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        sec.insertBefore(b, wrap);
      }
      moved = true;
    } else if (!isMobile && moved) {
      // 回到桌面：恢复原顺序（地铁图 → 检查器 → 筛选 → 泳道）
      sec.insertBefore(insp, lanes);
      if (filt) sec.insertBefore(filt, lanes);
      var tb = sec.querySelector(".kga-mobile-toggle"); if (tb) tb.remove();
      wrap.classList.remove("kga-open");
      moved = false;
    }
  }

  /* ---------- 挂载 ---------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target.closest("[data-kga-test]");
    if (t && window.PEIYU_CUE_TRAINER && window.PEIYU_CUE_TRAINER.startSec) {
      window.PEIYU_CUE_TRAINER.startSec(t.getAttribute("data-kga-test"));
      return;
    }
    var tc = ev.target.closest("[data-kga-test-ch]");
    if (tc) {
      location.hash = "tab=tree&ch=" + tc.getAttribute("data-kga-test-ch");
      var tabBtn = document.querySelector('#mainTabs [data-tab="tree"]');
      var chBtn = document.querySelector('[data-ct-ch="' + tc.getAttribute("data-kga-test-ch") + '"]');
      if (chBtn) chBtn.click();
      if (tabBtn) tabBtn.click();
      var mount = document.getElementById("cueTrainer");
      if (mount) setTimeout(function () { mount.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    }
  });

  function boot() {
    var insp = document.getElementById("kgInspector");
    if (!insp) return;
    var pending = false;
    function schedule() {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; renderActions(insp); }, 0);
    }
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        // 自己追加 / 移除 .kga 也会触发，只对图谱自己的重绘（出现非 .kga 节点变动）响应
        var isKga = function (n) { return n.classList && n.classList.contains("kga"); };
        var foreign = muts.some(function (m) {
          return ![].every.call(m.addedNodes, isKga) || ![].every.call(m.removedNodes, isKga);
        });
        if (foreign) schedule();
      }).observe(insp, { childList: true });
    }
    if (insp.children.length) renderActions(insp);
    layoutMobile();
    window.addEventListener("resize", layoutMobile);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.PEIYU_MAP_ACTIONS = { render: function () { var i = document.getElementById("kgInspector"); if (i) renderActions(i); }, buildPath: buildPath };
})();
