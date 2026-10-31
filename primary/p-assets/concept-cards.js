/* Primary concept cards. With the learning store loaded, answers go to the primary ledger (PY-223). */
(function () {
  "use strict";
  const app = document.getElementById("learning-app");
  const integrated = document.body.dataset.learningPage === "knowledge" && !document.body.classList.contains("concept-page");
  const cn = "零一二三四五六七八九";
  let data;
  const P = window.PeiyuConceptPractice;
  const store = () => window.PeiyuLearningState || null;
  // Per page: chosen question and last feedback per card; no-store answers only unlock the variant here.
  const selected = {}, feedback = {}, session = new Set(), reviewed = new Set();
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  function spoken(text) {
    return text.replace(/\d+/g, n => {
      if (n.length > 1 && n[0] === "0") return Array.from(n, digit => cn[Number(digit)]).join("");
      const x = Number(n);
      if (x < 10) return cn[x];
      if (x < 100) return (x >= 20 ? cn[Math.floor(x / 10)] : "") + "十" + (x % 10 ? cn[x % 10] : "");
      return n;
    }).replace(/＋/g, "加").replace(/＝/g, "等于");
  }
  function sayButton(text) {
    return '<button class="cc-say" type="button" data-cc-say="' + esc(spoken(text)) + '" aria-label="朗读：' + esc(text) + '">听一听</button>';
  }
  function words(text, low) {
    const readings = low && data.readings[text];
    if (!readings) return esc(text);
    return Array.from(text).map((ch, i) => /[一-鿿]/.test(ch) ? '<ruby>' + esc(ch) + '<rt>' + esc(readings[i]) + '</rt></ruby>' : esc(ch)).join("");
  }
  function line(text, low, tag = "p") {
    return '<' + tag + '>' + words(text, low) + sayButton(text) + '</' + tag + '>';
  }
  function svg(content, caption, height = 150) {
    return '<svg viewBox="0 0 320 ' + height + '" role="img" aria-label="' + esc(caption) + '">' + content + '</svg>';
  }
  const path = (d, color = "var(--fg)") => '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="3"/>';
  const label = (x, y, text) => '<text x="' + x + '" y="' + y + '" text-anchor="middle">' + esc(text) + '</text>';
  const dot = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="5" fill="currentColor"/>';
  function blocks(heights, index) {
    const cols = heights[0].length;
    const front = Array.from({ length: cols }, (_, x) => Math.max(...heights.map(row => row[x])));
    const left = heights.map(row => Math.max(...row)).reverse();
    const occupied = heights.flat().filter(x => x > 0).length;
    // Coordinates share the table's convention: x to the right, y towards the back.
    const point = (x, y, z) => [125 + x * 33 - y * 26, 160 - x * 13 - y * 16 - z * 31];
    const face = (points, fill) => '<polygon points="' + points.map(p => p.join(",")).join(" ") + '" fill="' + fill + '" stroke="var(--fg)" stroke-width="1.5"/>';
    let drawing = "";
    for (let y = heights.length - 1; y >= 0; y--) {
      for (let x = cols - 1; x >= 0; x--) {
        for (let z = 0; z < heights[y][x]; z++) {
          drawing += face([point(x,y,z), point(x+1,y,z), point(x+1,y,z+1), point(x,y,z+1)], "var(--card)");
          drawing += face([point(x,y,z), point(x,y+1,z), point(x,y+1,z+1), point(x,y,z+1)], "var(--ok-soft)");
          drawing += face([point(x,y,z+1), point(x+1,y,z+1), point(x+1,y+1,z+1), point(x,y+1,z+1)], "var(--hl-soft)");
        }
      }
    }
    let table = '<table aria-label="摆法' + (index + 1) + '各位置层数，前排在下，后排在上"><tbody>';
    [...heights].reverse().forEach((row, r) => {
      table += '<tr><th scope="row">' + (r === 0 ? "后排" : "前排") + '</th>' + row.map(n => '<td' + (n === 0 ? ' data-empty="true"' : '') + '>' + n + '</td>').join("") + '</tr>';
    });
    table += '</tbody></table>';
    return '<div class="cc-block"><b>摆法' + (index + 1) + '</b>' + svg(drawing + label(155, 192, "前面"), "小正方体摆法" + (index + 1), 210)
      + '<div class="cc-height">' + table + '</div><p class="cc-projections">层数表从左到右读，0表示空格。<br>前面各列：' + front.join("、") + '层；<br>左面从左到右：' + left.join("、") + '层；<br>上面占' + occupied + '格，共用' + heights.flat().reduce((a,b) => a+b, 0) + '块。</p></div>';
  }
  function diagram(info) {
    const v = info.values;
    let out = "";
    if (info.kind === "blocks") return v.map(blocks).join("");
    if (info.kind === "place") {
      const n = v[0];
      out = path("M50 20H270V140H50ZM160 20V140M50 65H270") + label(105,52,"十位") + label(215,52,"个位") + label(105,112,Math.floor(n/10)) + label(215,112,n%10);
    } else if (info.kind === "bundles" || info.kind === "addition") {
      for (let i = 0; i < 10; i++) out += path('M' + (35+i*9) + ' 25V105', 'var(--a)');
      out += path("M25 68H126", "var(--fg)") + label(76,140,"1捆＝10根");
      if (info.kind === "addition") {
        for (let i=0; i<v[0]%10+v[1]; i++) out += path('M'+(157+i*17)+' 25V105', i<v[0]%10 ? 'var(--fg)' : 'var(--c)');
        out += label(222,140,(v[0]%10)+"根＋"+v[1]+"根");
      }
    } else if (info.kind === "strip" || info.kind === "queue") {
      const nums = info.kind === "strip" ? v : Array.from({length:v[1]-v[0]+1}, (_,i) => v[0]+i);
      nums.forEach((n,i) => {
        const x = 35+i*250/(nums.length-1);
        out += '<circle cx="'+x+'" cy="60" r="19" fill="var(--card)" stroke="currentColor" stroke-width="2"/>' + label(x,67,n);
        if(info.kind === "queue" && (i===0 || i===nums.length-1)) out += path('M'+(x-17)+' 42l34 36m0-36l-34 36','var(--no)');
      });
      out += label(160,125,info.kind === "queue" ? "只数中间未划掉的圆" : "往后一个一个数");
    } else if (info.kind === "lines") {
      out = path("M65 40H255M65 90H280l-12-7m12 7l-12 7M40 140H280l-12-7m12 7l-12 7M40 140l12-7m-12 7l12 7") + dot(65,40)+dot(255,40)+dot(65,90);
      out += label(160,24,"线段") + label(160,74,"射线") + label(160,124,"直线");
    } else if (info.kind === "paths") {
      out = path("M35 115H285", "var(--a)") + path("M35 115Q60 5 160 60T285 115", "var(--c)") + dot(35,115)+dot(285,115)+label(35,145,"甲")+label(285,145,"乙");
    } else if (info.kind === "compare") {
      out = path("M65 40h"+(v[0]*1.7)+"M65 105h"+(v[1]*1.7)) + dot(65,40)+dot(65+v[0]*1.7,40)+dot(65,105)+dot(65+v[1]*1.7,105);
      out += path("M65 80h"+(v[0]*1.7),"var(--c)") + label(35,47,"甲") + label(35,112,"乙");
    } else if (info.kind === "angles") {
      v.slice(0,2).forEach((angle,i) => {
        const ox=60+i*150, oy=115, len=v[2+i];
        const rotate = angle === 90 && i === 1 ? -28 : 0;
        const a=rotate*Math.PI/180, b=(rotate+angle)*Math.PI/180;
        out += path('M'+(ox+len*Math.cos(a))+' '+(oy-len*Math.sin(a))+'L'+ox+' '+oy+'L'+(ox+len*Math.cos(b))+' '+(oy-len*Math.sin(b)), 'var(--a)') + dot(ox,oy);
      });
    }
    return svg(out,info.caption,160);
  }
  function snapshot() { const s = store(); return s ? s.snapshot() : null; }
  function current(card, open) {
    const entry = P.find(card, selected[card.id]);
    return entry && open[entry.role] ? entry : P.questions(card)[0];
  }
  function dueText(time) { return new Date(time).toLocaleDateString("zh-CN", { month: "long", day: "numeric" }); }
  function remindText(due) {
    if (!(due > 0)) return '之后会提醒你';
    const now = Date.now();
    if (due <= now) return '今天的复习里就有';
    const day = t => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const days = Math.round((day(due) - day(now)) / 86400000);
    return days <= 0 ? '今天晚些时候会提醒你' : days === 1 ? '明天会提醒你' : days + ' 天后会提醒你';
  }
  function recordNote(card, entry, snap) {
    if (!snap) return '';
    const q = snap.questions.find(x => x.questionType === "diagnostic" && x.pointId === card.id && x.questionId === entry.question.id && (x.contentVersion === entry.question.contentVersion || (entry.question.contentVersions || []).includes(x.contentVersion)));
    if (!q || !q.firstAnswer) return '<p class="cc-record">' + (q && q.feedbackSeen ? '已看过答案，之后再做记为订正。' : '第一次自己作答会记入“我的学习”，并安排复习。') + '</p>';
    // A wrong answer goes to 再练一练; the ledger keeps an earlier schedule (e.g. +7 days after a first correct answer), so say what is actually scheduled.
    if (q.lastAnswer && q.lastAnswer.correct === false) return '<p class="cc-record">已放进『再练一练』，' + remindText(q.reviewDueAt) + '。</p>';
    const first = q.firstAnswer.attemptKind === "independent" ? '第一次自己作答' + (q.firstAnswer.correct ? '答对了' : '答错了') : '已作答';
    return '<p class="cc-record">已记入“我的学习”：' + first + (q.reviewDueAt ? '，' + dueText(q.reviewDueAt) + '再来复习' : '') + '。</p>';
  }
  function tabsHTML(card, open, d) {
    return P.questions(card).map(x => '<button type="button" data-cc-question="' + esc(x.question.id) + '" aria-pressed="' + (x.question.id === d.id) + '"' + (open[x.role] ? '' : ' disabled') + '>' + P.LABELS[x.role] + '</button>').join("");
  }
  function lockText(open, snap) {
    return !open.parallel ? '先做自测题，再换变式题。' : !open.review ? (snap ? '第一次作答一天以后，复习题才会出现。' : '复习题要在能保存记录的页面上隔天再做。') : '';
  }
  function quizHTML(card, low, snap) {
    const open = P.available(snap, card, Date.now(), session), entry = current(card, open), d = entry.question;
    const locked = lockText(open, snap);
    const fb = feedback[card.id];
    const fbHTML = fb && fb.questionId === d.id ? line(fb.message, low) : '';
    return '<section class="cc-quiz" aria-label="自测"><h3>自己试一题</h3><div class="cc-qtabs" role="group" aria-label="选题">' + tabsHTML(card, open, d) + '</div>'
      + '<p class="cc-lock"' + (locked ? '' : ' hidden') + '>' + locked + '</p>' + line(d.prompt,low)
      + '<div class="cc-options">'+d.options.map(o=>'<div><button type="button" data-choice="'+o.id+'" aria-pressed="'+(!!fb && fb.questionId === d.id && fb.choice === o.id)+'">'+words(o.text,low)+'</button>'+sayButton(o.text)+'</div>').join("")+'</div>'
      + '<div class="cc-feedback" role="status" aria-live="polite">' + fbHTML + '</div>' + recordNote(card, entry, snap)
      + '<details class="cc-answer"><summary>看答案和理由</summary>'+line(d.answer,low)+'</details></section>';
  }
  function cardHTML(card, low, snap) {
    return '<article class="cc-card'+(low?' cc-low':'')+'" id="'+esc(card.id)+'" data-card="'+esc(card.id)+'">'
      + line(card.title,low,"h2") + '<div class="cc-body"><div class="cc-concept">' + line(card.concept,low)
      + '<h3>先看条件</h3>' + card.conditions.map(x=>line(x,low)).join("") + '</div>'
      + '<figure class="cc-figure">'+diagram(card.intuition)+'<figcaption>'+words(card.intuition.caption,low)+sayButton(card.intuition.caption)+'</figcaption></figure></div>'
      + '<div class="cc-myth"><h3>容易这样想</h3>' + line(card.misconception.error,low) + '<strong>换个想法</strong>'+line(card.misconception.correction,low)+'</div>'
      + quizHTML(card, low, snap)
      + '<nav class="cc-links" aria-label="相关课时">'+card.lessonIds.map(id=>'<a href="lessons/'+esc(id)+'.html">回第'+esc(id.split("-").pop())+'课动手试</a>').join("")+'</nav></article>';
  }
  function draw() {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    let source = data.units.find(u=>u.lessonIds.includes(section));
    const hasCards = u => data.cards.some(c=>c.unitId===u.id);
    let snap = snapshot();
    const requested = source || data.units.find(u=>u.id===params.get("unit")) ||
      data.units.find(u=>data.cards.some(c=>c.unitId===u.id && c.id===new URLSearchParams(location.hash.slice(1)).get("card")));
    const requestedGrade = requested ? requested.grade : Number(params.get("grade"));
    const candidates = data.units.filter(hasCards);
    // Use the existing local evidence, including a compacted resume/last answer. Never create a new preference store.
    const evidence = snap ? [snap.resume, ...(snap.events || []), ...(snap.questions || []).map(q=>q.lastAnswer)].filter(Boolean).sort((a,b)=>b.time-a.time) : [];
    const recent = evidence.map(e=>candidates.find(u=>e.sectionId===u.id || e.sectionId===u.id+'-test' || u.lessonIds.includes(e.sectionId) || data.cards.some(c=>c.unitId===u.id && c.id===e.pointId))).find(Boolean);
    const inGrade = candidates.find(u=>u.grade===requestedGrade);
    const unit = requested && hasCards(requested) ? requested : requestedGrade ? inGrade || candidates[0] : recent || candidates[0];
    if (!unit) { app.innerHTML='<h1>概念与易错卡</h1><p>概念卡建设中，可以先回课程动手学。</p><a href="courses.html">打开课程目录</a>'; return; }
    const fallback = (requested && requested.id!==unit.id) || (requestedGrade && requestedGrade!==unit.grade);
    const grade = unit.grade;
    const visibleUnits = data.units.filter(u=>u.grade===grade);
    if (source && (source.id!==unit.id || !data.cards.some(c=>c.unitId===unit.id && c.lessonIds.includes(section)))) source = null;
    const low = grade <= 2;
    const cards = data.cards.filter(c=>c.unitId===unit.id && (!source || c.lessonIds.includes(section)));
    const from = params.get("from");
    const hash = new URLSearchParams(location.hash.slice(1)), targetCard = cards.find(c => c.id === hash.get("card"));
    if (targetCard && P.find(targetCard, hash.get("q"))) selected[targetCard.id] = hash.get("q");
    // A review visit is recorded once per question and page load, under the question's current version.
    const entry = targetCard && hash.get("review") === "1" && store() && P.find(targetCard, hash.get("q"));
    if (entry && !reviewed.has(entry.question.id)) { reviewed.add(entry.question.id); P.review(store(), targetCard, entry.question); }
    snap = snapshot();
    const validFrom = data.units.some(u=>u.lessonIds.includes(from));
    app.innerHTML = '<h1>概念与易错卡</h1><p class="cc-intro">先看图，把容易混的地方说清，再试一题。低年级可由家长陪读，也可点“听一听”。</p>'
      + '<p class="cc-status">' + (store() ? '每张卡有自测题、变式题和复习题。作答记在这台设备的“我的学习”里，按每道题安排复习，不上传；第一次自己作答和看过答案后再做分开记。' : '自测只在本页练习，离开后不保存，也不计入“我的学习”。') + '</p>'
      + (fallback?'<p class="cc-status">所选单元或年级的概念卡建设中，先打开已有内容的单元。</p>':'')
      + '<div class="cc-filter"><nav class="cc-grades" aria-label="选择年级">'+[1,2,3,4,5,6].map(g=>candidates.some(u=>u.grade===g)?'<a href="?grade='+g+'"'+(g===grade?' aria-current="page"':'')+'>'+cn[g]+'年级</a>':'<span aria-disabled="true">'+cn[g]+'年级 · 建设中</span>').join("")+'</nav>'
      + '<label for="cc-unit">选择单元</label><select id="cc-unit">'+visibleUnits.map(u=>'<option value="'+esc(u.id)+'"'+(u.id===unit.id?' selected':'')+(hasCards(u)?'':' disabled')+'>'+esc(u.book+' · '+u.title)+(hasCards(u)?'':' · 建设中')+'</option>').join("")+'</select></div>'
      + (validFrom?'<a class="cc-jump" href="lessons/'+esc(from)+'.html">回到刚才的课时</a>':'')
      + '<h2>'+esc(unit.book+' · '+unit.title)+'</h2><p role="status">'+(source?'与第'+esc(section.split("-").pop())+'课相关，':'')+cards.length+'张卡。</p>'
      + (source?'<a class="cc-jump" href="?grade='+grade+'&unit='+unit.id+'">看本单元全部卡</a>':'')
      + (low?'<p>给家长：可以先读一小句，让孩子指着图说；不用一次读完一张卡。</p>':'')
      + (cards.length?cards.map(c=>cardHTML(c,low,snap)).join(""):'<p>这个单元的概念卡还在整理，可以先回课程动手学。</p>')
      + (cards.length ? '<a class="cc-jump" href="lessons/'+esc(unit.id)+'.html">回本单元首页</a>' : '<a class="cc-jump" href="courses.html?grade=g'+grade+'&book='+esc(unit.id.split('-')[0])+'">查看本册课程</a>');
    app.querySelector("#cc-unit").addEventListener("change",e=>navigate('?grade='+grade+'&unit='+e.target.value));
    app.querySelectorAll('.cc-grades a, .cc-jump[href^="?"]').forEach(a=>a.addEventListener("click",e=>{
      if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      e.preventDefault();navigate(a.getAttribute("href"));
    }));
    const target = targetCard && document.getElementById(targetCard.id);
    if(target && target.hasAttribute("data-card")) { target.tabIndex=-1; target.focus(); target.scrollIntoView(); }
  }
  function navigate(url,push=true) {
    if(push)history.pushState(null,"",url);else history.replaceState(null,"",url);
    if(window.speechSynthesis)speechSynthesis.cancel();
    draw();
  }
  app.addEventListener("click",e=>{
    const say = e.target.closest("[data-cc-say]");
    if(say) {
      if(!window.speechSynthesis) { say.textContent="此设备暂不支持朗读"; return; }
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(say.dataset.ccSay);
      utterance.lang="zh-CN"; utterance.rate=0.85; speechSynthesis.speak(utterance); return;
    }
    const target = e.target.closest("[data-choice],[data-cc-question],.cc-answer summary");
    if(!target)return;
    const article = target.closest("[data-card]");
    if (!article) return;
    const card = data.cards.find(c=>c.id===article.dataset.card);
    const snap = snapshot(), entry = current(card, P.available(snap, card, Date.now(), session)), q = entry.question;
    if (target.matches("summary")) {
      // Opening the answer counts as feedback before any later answer to this question. Only the
      // tabs and notes are refreshed, so the answer stays open and focus stays on the summary.
      if (target.parentElement.open) return;
      session.add(q.id);
      if (store()) P.reveal(store(), card, q);
      const after = snapshot(), open = P.available(after, card, Date.now(), session), locked = lockText(open, after);
      article.querySelector(".cc-qtabs").innerHTML = tabsHTML(card, open, q);
      const lock = article.querySelector(".cc-lock");
      lock.textContent = locked; lock.hidden = !locked;
      const note = article.querySelector(".cc-record");
      if (note) note.outerHTML = recordNote(card, entry, after);
      return;
    }
    if (target.hasAttribute("data-cc-question")) {
      selected[card.id] = target.dataset.ccQuestion; delete feedback[card.id];
    } else {
      const option = q.options.find(o=>o.id===target.dataset.choice);
      if (store()) P.answer(store(), card, q, option.id);
      session.add(q.id);
      feedback[card.id] = { questionId: q.id, choice: option.id, message: (option.id===q.correct?"你检查对了。":"再看图试一试。")+option.feedback };
    }
    const quiz = article.querySelector(".cc-quiz");
    quiz.outerHTML = quizHTML(card, /^p[12]/.test(card.unitId), snapshot());
    const focus = article.querySelector(target.hasAttribute("data-cc-question") ? '[data-cc-question="' + target.dataset.ccQuestion + '"]' : '[data-choice="' + target.dataset.choice + '"]');
    if (focus) focus.focus();
  });
  if (integrated) {
    // The shared library owns navigation; retain this component's figures, speech and quiz handlers.
    window.PeiyuPrimaryConcepts = {
      ready: fetch("data/knowledge/primary-concepts.json").then(r => {
        if (!r.ok) throw new Error("概念卡暂时没有打开");
        return r.json();
      }).then(value => { data = value; return data; }),
      renderUnit(target, unitId, section) {
        const cards = data.cards.filter(c => c.unitId === unitId && (!section || c.lessonIds.includes(section)));
        const hash = new URLSearchParams(location.hash.slice(1));
        const card = cards.find(c => c.id === hash.get("card"));
        const entry = card && P.find(card, hash.get("q"));
        if (entry) selected[card.id] = entry.question.id;
        if (entry && hash.get("review") === "1" && store() && !reviewed.has(entry.question.id)) {
          reviewed.add(entry.question.id); P.review(store(), card, entry.question);
        }
        target.innerHTML = cards.map(c => cardHTML(c, /^p[12]/.test(c.unitId), snapshot())).join("");
      }
    };
    return;
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem("peiyu.hs.theme",theme);}catch(e){ /* Theme remains usable in memory. */ }
  }
  try { const theme=localStorage.getItem("peiyu.hs.theme");if(theme==='light'||theme==='dark')document.documentElement.dataset.theme=theme; }catch(e){ /* Use the system theme. */ }
  document.getElementById("cc-theme").addEventListener("click",()=>setTheme((document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'?'light':'dark'));
  window.addEventListener("popstate",draw);
  window.addEventListener("hashchange",()=>{if(data)draw();});
  // Deferred learning scripts placed after this file have all run before DOMContentLoaded.
  const start = () => fetch("data/knowledge/primary-concepts.json").then(r=>{if(!r.ok)throw new Error("卡片文件暂时打不开");return r.json();}).then(value=>{data=value;draw();}).catch(()=>{
    app.innerHTML='<h1>概念与易错卡</h1><p role="alert">卡片暂时打不开，请刷新重试。</p><a href="index.html">回课程目录</a>';
  });
  if (document.readyState === "complete") start(); else document.addEventListener("DOMContentLoaded", start);
})();
