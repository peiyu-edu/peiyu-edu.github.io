# upgrade_e3_6_1.py
import re
import os

filepath = 'highSchool/site/lessons/e3-6-1.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'chk1', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：1.1 集合与元素（<a href="b1-1-1.html">回看 1.1</a>）；1.3 交集与并集（<a href="b1-1-3.html">回看 1.3</a>），分类的「不重不漏」就是各子集无交集且并集为全集。</p>

  <div class="card">
    <p><b>完成一件事</b>：计数的第一步是界定终点状态，即「做到什么程度算彻底完成」。</p>
    <p>例：「从北京到上海」，坐 3 趟高铁中的任意一趟均已到达（事情办完）；而「组装一台电脑」，买好 CPU 只是完成了第一步，必须主板、内存全部装好才算办完。</p>
  </div>

  <div class="card">
    <p><b>分类加法（互斥并联）</b>：完成一件事有 \(k\) 类互不相交的方案，第 \(1\) 类有 \(m_1\) 种方法，……第 \(k\) 类有 \(m_k\) 种方法。<b>任选一类中的任意一种方法都能独立办完这件事</b>，总方法数为：</p>
    <p>$$N = m_1 + m_2 + \cdots + m_k$$</p>
  </div>

  <div class="card">
    <p><b>分步乘法（工序串联）</b>：完成一件事必须依次经过 \(k\) 个步骤，第 \(1\) 步有 \(m_1\) 种方法，……第 \(k\) 步有 \(m_k\) 种方法。<b>缺少任何一步都不能算完成，各步按工序组装</b>，总方法数为：</p>
    <p>$$N = m_1 \times m_2 \times \cdots \times m_k$$</p>
  </div>

  <div class="card">
    <p><b>不重不漏</b>：分类计数的铁律。不重（任意两类交集为空，不重复计数）；不漏（各类并集等于全集，无遗漏方案）。若出现交集，必须用容斥原理 \(|A \cup B| = |A| + |B| - |A \cap B|\) 纠正。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-count">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">计数原理直觉微图解：加法并联、乘法树状展开与分类分步综合</span>
      <div class="micro-tabs" id="m-count-tabs">
        <button class="micro-tab active" data-tab="1">① 分类加法（互斥直达）</button>
        <button class="micro-tab" data-tab="2">② 分步乘法（连续工序）</button>
        <button class="micro-tab" data-tab="3">③ 综合应用（先分类后分步）</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-count-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-count-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">分类加法原理（互斥独立）</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">独立直达</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>核心特征</b>：类与类互斥无交集，任选一法即大功告成。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>灵魂发问</b>：「只选这一个办法，事情办完没有？」——<b>办完了！</b></p>
      <p class="small" style="margin:0;"><b>算式形态</b>：\(N = m_1 + m_2 + \cdots + m_k\)</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">分步乘法原理（关联协同）</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">缺一不可</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>核心特征</b>：步与步工序递进，缺任何一步均未完成。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>灵魂发问</b>：「只选这一个办法，事情办完没有？」——<b>才办了一步！</b></p>
      <p class="small" style="margin:0;"><b>算式形态</b>：\(N = m_1 \times m_2 \times \cdots \times m_k\)</p>
    </div>
  </div>

  <h3>2. 计数原理色彩语义主公式</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">两大法则主公式：</p>
    <p style="margin:0 0 6px 0;">分类加法：\(N = \color{#1976d2}{m_1} + \color{#1976d2}{m_2} + \cdots + \color{#1976d2}{m_k}\quad (\text{各类方案}\color{#1976d2}{\text{互斥独立，直达终点}})\)</p>
    <p style="margin:0 0 8px 0;">分步乘法：\(N = \color{#2e7d32}{m_1} \times \color{#2e7d32}{m_2} \times \cdots \times \color{#2e7d32}{m_k}\quad (\text{各步工序}\color{#2e7d32}{\text{协同组装，缺一不可}})\)</p>
    <p class="small" style="margin:0; color:var(--muted);"><b>决策口诀</b>：完成标准先界定；独立办完走分类相加，缺一不可走分步连乘；步数受制先分类再分步。</p>
  </div>

  <div class="card predict" data-id="chk1" data-answer="C">
    <p>自检：书架上放有 \(4\) 本不同的数学书、\(3\) 本不同的物理书、\(2\) 本不同的化学书。① 若从中任取一本，有几种取法？② 若三科各取一本，有几种取法？</p>
    <div class="opts cols">
      <button class="opt" data-v="A">\(24\) 种；\(9\) 种</button>
      <button class="opt" data-v="B">\(9\) 种；\(9\) 种</button>
      <button class="opt" data-v="C">\(9\) 种；\(24\) 种</button>
      <button class="opt" data-v="D">\(12\) 种；\(24\) 种</button>
    </div>
    <div class="reveal">
      <p><b>C</b>。① 只取一本：取数学书、物理书或化学书都能单独办完，属于<b>分类加法</b>：\(4+3+2=9\) 种；② 三科各取一本：取完数学书还没办完，要三科都取，属于<b>分步乘法</b>：\(4\times3\times2=24\) 种。</p>
    </div>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：从 \(1\) 到 \(30\) 中选一个数，要求它是 \(2\) 的倍数或 \(5\) 的倍数，有几种选法？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(21\)</button>
      <button class="opt" data-v="B"><b>B</b>\(18\)</button>
      <button class="opt" data-v="C"><b>C</b>\(15\)</button>
      <button class="opt" data-v="D"><b>D</b>\(90\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。分成不重的两类：偶数 \(15\) 个；是 \(5\) 的倍数的奇数 \(5,15,25\)，\(3\) 个。共 \(15+3=18\)。选 A 是直接 \(15+6\)：\(10,20,30\) 两类都算了一次，重了；选 D 是把「选一个数」当成了两步相乘。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <div class="card predict" data-id="try-2" data-answer="C">
    <p>自己试试：\(3\) 名同学各报名参加 \(4\) 个兴趣小组中的一个（可以报同一个组），一共有几种报名结果？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(12\)</button>
      <button class="opt" data-v="B"><b>B</b>\(81\)</button>
      <button class="opt" data-v="C"><b>C</b>\(64\)</button>
      <button class="opt" data-v="D"><b>D</b>\(24\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。三个人都报完才算办完，一人一步：每人都有 \(4\) 个组可选，\(4\times4\times4=64\)。选 B 是把「组」当成了步骤，算成 \(3^4\)：可每个组并不是非选一个人不可；选 D 是以为不能报同一个组；选 A 是把乘法做成了 \(3\times4\)。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：用数字 \(0, 1, 2, 3, 4, 5\) 可以组成多少个<b>没有重复数字的三位偶数</b>？</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">三位数要求首位 \(\ne 0\)；偶数要求末位必须是 \(0, 2, 4\)。注意：若末位是 \(0\)，首位可选数不受 \(0\) 的限制（有 \(5\) 种）；若末位是 \(2\) 或 \(4\)，首位既不能为 \(0\) 也不能为末位（仅剩 \(4\) 种）。<b>后续步数受前一步动态制约，单一分步走不通，必须按末位是否为 \(0\) 分类！</b></span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步分类分步求解</b>：
        <div class="small" style="margin-top:4px;">
          • <b>第 1 类（末位为 \(0\)）</b>：末位 \(1\) 种 \(\to\) 首位从 \(1\sim 5\) 任选 \(5\) 种 \(\to\) 十位从余下 \(4\) 个数字任选 \(4\) 种：<br>
          $$N_1 = 1 \times 5 \times 4 = 20\text{ 个}$$
          • <b>第 2 类（末位为 \(2\) 或 \(4\)）</b>：末位 \(2\) 种 \(\to\) 首位不能为 \(0\) 且不能与末位相同，剩 \(4\) 种 \(\to\) 十位从余下 \(4\) 个数字任选 \(4\) 种：<br>
          $$N_2 = 2 \times 4 \times 4 = 32\text{ 个}$$
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步分类汇总与防坑核查</b>：
        <span class="small">两类互斥且穷尽，由分类加法原理得总数：\(N = N_1 + N_2 = 20 + 32 = 52\) 个。切忌粗暴连乘「末位 3 种 × 首位 4 种 × 十位 4 种 = 48」（漏算了末位是 0 时首位多出的 1 种自由度）。</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="B">
    <p>自己试试：用 \(0,1,2,3\) 能组成多少个没有重复数字的三位偶数？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(12\)</button>
      <button class="opt" data-v="B"><b>B</b>\(10\)</button>
      <button class="opt" data-v="C"><b>C</b>\(8\)</button>
      <button class="opt" data-v="D"><b>D</b>\(18\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。个位是 \(0\)：百位 \(3\) 种、十位 \(2\) 种，\(6\) 个；个位是 \(2\)：百位只能是 \(1\) 或 \(3\)，\(2\) 种，十位 \(2\) 种，\(4\) 个。共 \(6+4=10\)。选 A 是不分类、直接按个位 \(2\) 种 × 百位 \(3\) 种 × 十位 \(2\) 种，把 \(0\) 打头的 \(2\) 个（\(012\)、\(032\)）也数进去了。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：凭文字表面的「和/或」字机械套用加减乘除</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：「从 3 男 4 女中选 1 男和 1 女」见“和”字就做加法算 \(3+4=7\) 种。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：判定本质标准——选 1 男未完成任务，必须再选 1 女，属于分步乘法：\(3 \times 4 = 12\) 种！只有「选 1 名男生或 1 名女生（只选 1 人）」才是分类加法 \(3+4=7\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：步与步存在动态依赖时强行连乘</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：组成无重复数字偶数时，直接写 \(3(\text{末位}) \times 4(\text{首位}) \times 4(\text{十位}) = 48\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：若第 1 步的不同选择导致后续可选种类数发生改变，则不能直接连乘！必须在产生分歧的地方<b>先分类</b>（个位是 0 vs 个位非 0），各类内分步相乘，最后两类相加得 \(20+32=52\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：主体与客体倒挂，指数底数颠倒（\(m^n\) 还是 \(n^m\)？）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：3 名同学报 4 个兴趣小组，写成 \(3^4 = 81\) 种。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>谁动谁做底，谁能重复谁做底！</b>事情是「安排这 3 名同学」，每个人必须做出选择且只能选 1 个组，故有 3 个步骤：甲选有 4 种，乙选有 4 种，丙选有 4 种，应为 \(4 \times 4 \times 4 = 4^3 = 64\) 种！若算成 \(3^4\)，意味着每个小组去挑同学，可能导致某个同学被选多次或没人被选。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：主体（同学）做工序 vs 客体（小组）倒挂的分配错乱</div>
    <svg class="micro-fig" id="m-count-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      正确视角：同学是主动决策者（3步），每步面临 4 个小组可选 \(\Rightarrow 4 \times 4 \times 4 = 64\)。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Now prepare the script for micro-box and trap fig
script_code = r'''
  // === e3-6-1 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-count-fig");
    var desc = document.getElementById("m-count-desc");
    var trapFig = document.getElementById("m-count-trap-fig");
    var tabs = document.querySelectorAll("#m-count-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 分类加法 (互斥并联)
      // 起点 A (x=60, y=110), 终点 B (x=560, y=110)
      // 3 条大类：高铁 (3班), 飞机 (2班), 轮船 (2班)
      var pStart = el("circle", {cx: 60, cy: 110, r: 8, fill: "#2563eb"});
      fig.appendChild(pStart);
      fig.appendChild(el("text", {x: 60, y: 135, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "起点北京"));

      var pEnd = el("circle", {cx: 560, cy: 110, r: 8, fill: "#10b981"});
      fig.appendChild(pEnd);
      fig.appendChild(el("text", {x: 560, y: 135, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "目的地上海"));

      var routes = [
        {name: "第1类：高铁 (3班)", yArr: [40, 60, 80], col: "#1976d2"},
        {name: "第2类：飞机 (2班)", yArr: [100, 120], col: "#0288d1"},
        {name: "第3类：大巴 (2班)", yArr: [140, 160], col: "#f59e0b"}
      ];

      routes.forEach(function(r) {
        r.yArr.forEach(function(yMid, idx) {
          var d = "M 60 110 Q 310 " + yMid + " 560 110";
          fig.appendChild(el("path", {d: d, fill: "none", stroke: r.col, "stroke-width": "2", "stroke-opacity": "0.75"}));
          // Mid point label
          fig.appendChild(el("circle", {cx: 310, cy: (110 + yMid)/2 + (yMid - 110)*0.3, r: 4, fill: r.col}));
        });
        // Class badge label on left
        var midY = r.yArr[Math.floor(r.yArr.length/2)];
        fig.appendChild(el("text", {x: 200, y: midY - 6, "font-size": "11", "font-weight": "700", fill: r.col}, r.name));
      });

      fig.appendChild(el("text", {x: 310, y: 205, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "每一类中的任意一班均能独立直达目的地，总方法数 N = 3 + 2 + 2 = 7 种"));
      desc.innerHTML = "<b>① 分类加法（互斥方案并联）</b>：共有 3 个独立大类（高铁 3 班、飞机 2 班、大巴 2 班）。任选一趟班次即可把「从北京到上海」这件事彻底办完。大类间两两互斥无交集，方案数直接相加：<b>N = 3 + 2 + 2 = 7 种</b>。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 分步乘法 (连续工序/树状分叉)
      // 步骤 1 (底座 2 种) -> 步骤 2 (立柱 3 种) -> 步骤 3 (探头 2 种)
      fig.appendChild(el("text", {x: 100, y: 24, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "工序 1：选底座 (2种)"));
      fig.appendChild(el("text", {x: 310, y: 24, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "工序 2：选立柱 (3种)"));
      fig.appendChild(el("text", {x: 520, y: 24, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#d97706"}, "工序 3：选探头 (2种)"));

      var s1Y = [70, 150];
      var s1Names = ["圆底座", "方底座"];

      s1Y.forEach(function(y1, idx1) {
        fig.appendChild(el("rect", {x: 60, y: y1 - 14, width: 80, height: 28, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: 100, y: y1 + 5, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, s1Names[idx1]));

        [-24, 0, 24].forEach(function(off2, idx2) {
          var y2 = y1 + off2;
          fig.appendChild(el("line", {x1: 140, y1: y1, x2: 270, y2: y2, stroke: "#2e7d32", "stroke-width": "1.2"}));
          fig.appendChild(el("rect", {x: 270, y: y2 - 10, width: 70, height: 20, rx: 4, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1"}));
          fig.appendChild(el("text", {x: 305, y: y2 + 4, "text-anchor": "middle", "font-size": "10", fill: "#2e7d32"}, "立柱" + (idx2+1)));

          [-6, 6].forEach(function(off3, idx3) {
            var y3 = y2 + off3;
            fig.appendChild(el("line", {x1: 340, y1: y2, x2: 480, y2: y3, stroke: "#d97706", "stroke-width": "1", "stroke-dasharray": "2 2"}));
            fig.appendChild(el("circle", {cx: 480, cy: y3, r: 3.5, fill: "#d97706"}));
          });
        });
      });

      fig.appendChild(el("text", {x: 310, y: 205, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "连续组装，缺一不可：末梢总装配样数 N = 2 × 3 × 2 = 12 种"));
      desc.innerHTML = "<b>② 分步乘法（工序串联树状分叉）</b>：只选底座事情还没办完，必须底座、立柱、探头依次装配。第 1 步 2 种选择，每种后面都分叉出第 2 步的 3 种选择，再分叉出第 3 步的 2 种选择。末梢方案总数为乘积：<b>N = 2 × 3 × 2 = 12 种</b>。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 两法结合（先分类后分步，由 0,1,2,3 组成无重复 3 位偶数）
      fig.appendChild(el("text", {x: 310, y: 25, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "无重复 3 位偶数：个位是 0（首位不受限） vs 个位是 2（首位不能为 0）"));

      // Class 1 box: 个位为 0
      fig.appendChild(el("rect", {x: 30, y: 45, width: 260, height: 120, rx: 8, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 45, y: 68, "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "第 1 类：个位是 0 (1 种)"));
      fig.appendChild(el("text", {x: 45, y: 92, "font-size": "11", fill: "var(--fg)"}, "• 百位从 {1,2,3} 选：3 种"));
      fig.appendChild(el("text", {x: 45, y: 112, "font-size": "11", fill: "var(--fg)"}, "• 十位从余下 2 数选：2 种"));
      fig.appendChild(el("text", {x: 45, y: 142, "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "分步乘积：1 × 3 × 2 = 6 个"));

      // Class 2 box: 个位为 2
      fig.appendChild(el("rect", {x: 330, y: 45, width: 260, height: 120, rx: 8, fill: "var(--card)", stroke: "#10b981", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 345, y: 68, "font-size": "12", "font-weight": "700", fill: "#10b981"}, "第 2 类：个位是 2 (1 种)"));
      fig.appendChild(el("text", {x: 345, y: 92, "font-size": "11", fill: "var(--fg)"}, "• 百位不能为 0，只能选 1 或 3：2 种"));
      fig.appendChild(el("text", {x: 345, y: 112, "font-size": "11", fill: "var(--fg)"}, "• 十位从包含 0 的余下 2 数选：2 种"));
      fig.appendChild(el("text", {x: 345, y: 142, "font-size": "12", "font-weight": "700", fill: "#10b981"}, "分步乘积：1 × 2 × 2 = 4 个"));

      fig.appendChild(el("text", {x: 310, y: 195, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#ef4444"}, "两类互斥相加：总数 N = 6 + 4 = 10 个"));
      desc.innerHTML = "<b>③ 综合决策（先分类再分步）</b>：个位选 0 还是选 2，导致百位可选数字个数不同（选 0 时百位有 3 种，选 2 时百位仅 2 种）。不能直接连乘！必须先按个位分类，各类内分步相乘，最后两类相加得 <b>6 + 4 = 10 种</b>。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      // 3 个学生 (A, B, C) 分配到 4 个小组 (G1, G2, G3, G4)
      // 正确模型：每个学生从 4 个组中选 1 个 -> 4 × 4 × 4 = 64
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "正确：同学主动选组 (3 步)"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "错误：组挑同学导致错乱 (4 步)"));

      // Correct side
      var stuNames = ["同学A", "同学B", "同学C"];
      stuNames.forEach(function(name, i) {
        var y = 45 + i * 28;
        trapFig.appendChild(el("circle", {cx: 60, cy: y, r: 8, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1.5"}));
        trapFig.appendChild(el("text", {x: 60, y: y + 4, "text-anchor": "middle", "font-size": "9", "font-weight": "700", fill: "#1976d2"}, "S" + (i+1)));
        // Arrow to group slots
        trapFig.appendChild(el("line", {x1: 72, y1: y, x2: 170, y2: y, stroke: "#10b981", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
        trapFig.appendChild(el("text", {x: 210, y: y + 4, "text-anchor": "middle", "font-size": "10", fill: "var(--fg)"}, "从 4 组中任选 1 组"));
      });
      trapFig.appendChild(el("text", {x: 140, y: 130, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "4 × 4 × 4 = 64 种"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Wrong side
      var grpNames = ["组1", "组2", "组3", "组4"];
      grpNames.forEach(function(g, i) {
        var y = 35 + i * 22;
        trapFig.appendChild(el("rect", {x: 320, y: y - 8, width: 34, height: 16, rx: 3, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1"}));
        trapFig.appendChild(el("text", {x: 337, y: y + 4, "text-anchor": "middle", "font-size": "9", fill: "#ef4444"}, g));
        trapFig.appendChild(el("line", {x1: 360, y1: y, x2: 430, y2: 70, stroke: "#ef4444", "stroke-width": "1"}));
      });
      trapFig.appendChild(el("text", {x: 450, y: 74, "font-size": "10", fill: "#ef4444"}, "组挑人可能无人或多选"));
      trapFig.appendChild(el("text", {x: 400, y: 130, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "算成 3^4 = 81 种（错误主体）"));
    }

    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        tabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var idx = tab.getAttribute("data-tab");
        if (idx === "1") drawTab1();
        else if (idx === "2") drawTab2();
        else if (idx === "3") drawTab3();
      });
    });

    drawTab1();
    drawTrap();
  })();
'''

# Insert script before the last </script>
last_script_close = html.rfind('</script>')
assert last_script_close != -1, 'No </script> found'
html = html[:last_script_close] + script_code + '\n' + html[last_script_close:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)

print('Upgrade e3-6-1 completed! File size:', len(html.encode('utf-8')), 'bytes')
