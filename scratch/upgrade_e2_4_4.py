# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-4-4.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-1"' in html
assert 'data-id="try-2"' in html
assert 'data-id="try-3"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：数列的通项和递推公式（<a href="e2-4-1.html">回看 4.1</a>）、等差数列求和（<a href="e2-4-2.html">回看 4.2</a>）、等比数列求和（<a href="e2-4-3.html">回看 4.3</a>）。</p>

  <div class="card">
    <p><b>关于 \(n\) 的命题 \(P(n)\)</b>：语句中带有正整数 \(n\)，每代入一个具体 \(n\)，就得到一个真假确定的断言。</p>
    <p>例：\(P(n)\) 为「\(1+3+\cdots+(2n-1)=n^2\)」。\(P(3)\) 是「\(1+3+5=3^2\)」，真；\(P(4)\) 亦真。</p>
  </div>

  <div class="card">
    <p><b>归纳假设</b>：证明「若 \(P(k)\) 成立，则 \(P(k+1)\) 成立」时，假定作为推理前提的 \(P(k)\)。</p>
    <p>例：证明 \(P(k+1)\) 时，把已假设成立的「\(1+3+\cdots+(2k-1)=k^2\)」作为已知脚手架使用。</p>
  </div>

  <div class="card">
    <p><b>起点 \(n_0\)</b>：命题成立的最小正整数起点。常见为 \(n_0=1\)，但也有由 \(n_0=4\) 或 \(5\) 起始的情形。</p>
    <p>例：「\(2^n&gt;n^2\)」在 \(n=4\) 时 \(16&gt;16\) 不成立，而在 \(n=5\) 时 \(32&gt;25\) 成立，起点为 \(n_0=5\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>数学归纳法核心直觉：骨牌倒推、假设拆接与起点判定
      </div>
      <div style="display:flex;gap:6px" id="m-mi-tabs">
        <button class="btn btn-sm" onclick="setMMiTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 骨牌连锁机制</button>
        <button class="btn btn-sm" onclick="setMMiTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 假设拆解拼接</button>
        <button class="btn btn-sm" onclick="setMMiTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ 起点 n0 判定</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-mi-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-mi-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">双柱基石</span>
        <b style="color:#0369a1;font-size:14px">奠基步 vs 传递步（缺一不可）</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>仅有传递无奠基</b>：纯理论推演但无现实基底，如「\(n^2+n+1\) 是偶数」传递成立但全盘为伪。</li>
        <li><b>仅有奠基无传递</b>：验算前 100 项成立也不代表无限（欧拉质数多项式 \(n=40\) 破灭）。</li>
        <li><b>双柱合璧</b>：奠基确定起点真值，传递延续真值无穷延展。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">假设规范</span>
        <b style="color:#15803d;font-size:14px">归纳假设的合法使用</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>合法使用</b>：假设某一特定整数 \(k\) 时成立，推导 \(k+1\) 时必须实质调用该假设。</li>
        <li><b>非法禁忌</b>：绝不可直接假设「对所有 \(n\) 都成立」；亦不可在证明中对假设弃之不用。</li>
        <li><b>核心枢纽</b>：归纳步的本质是证明条件命题「\(P(k) \implies P(k+1)\)」。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 两步证明法则与色彩语义主公式</h3>
  <p>要证明对所有整数 \(n\ge n_0\)，命题 \(P(n)\) 恒成立，需严格完成以下两步：</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px;color:#0369a1;font-weight:700">
      ① \(\color{#0284c7}{\text{奠基（基础步）}}\)：验证 \(P(n_0)\) 成立（推倒第一张骨牌）
    </div>
    <div style="margin-top:6px;font-size:15px;color:#15803d;font-weight:700">
      ② \(\color{#16a34a}{\text{传递（归纳步）}}\)：假设 \(P(k)\ (k\ge n_0)\) 成立，证明 \(P(k+1)\) 亦成立
    </div>
    <div style="margin-top:6px;font-size:14px;color:#475569">
      代数拼接核心：\(\underbrace{\text{LHS}(k)}_{\color{#16a34a}{\text{归纳假设替换}}} + \text{新增项}(k+1) \equiv \text{RHS}(k+1)\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>证明：对任意正整数 \(n\)，\(1+3+5+\cdots+(2n-1)=n^2\)。</p>
    <p>(1) 奠基：\(n=1\) 时，左边 \(=1\)，右边 \(=1^2=1\)，等式成立。</p>
    <p>(2) 传递：设 \(k\ge1\)，假设 \(n=k\) 时成立，即 \(1+3+\cdots+(2k-1)=k^2\)（归纳假设）。</p>
    <p>当 \(n=k+1\) 时：左边 \(=[1+3+\cdots+(2k-1)]+(2k+1)=k^2+(2k+1)=(k+1)^2\)，</p>
    <p>其中首项代换<b>实质使用了归纳假设</b>。结果等于 \(n=k+1\) 时的右边，故 \(n=k+1\) 时成立。</p>
    <p>由 (1)(2) 综合可知，等式对任意正整数 \(n\) 均成立。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：用归纳法证明 \(1+2+3+\cdots+n=\dfrac{n(n+1)}{2}\)。从 \(n=k\) 到 \(n=k+1\)，左边多了哪一项？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(k\)</button>
      <button class="opt" data-v="B"><b>B</b>\(k+1\)</button>
      <button class="opt" data-v="C"><b>C</b>\(k+2\)</button>
      <button class="opt" data-v="D"><b>D</b>\(2k+1\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(n=k\) 时末项是 \(k\)，\(n=k+1\) 时末项是 \(k+1\)，多出的正是第 \(k+1\) 项。选 D 是死套了例 1（例 1 通项是 \(2n-1\)）。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 归纳步书写与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：数列通项猜想的完整归纳证明</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          题目给出一个关于所有自然数 \(n \ge n_0\) 的恒等式或通项猜想，要求严格证明。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>奠基</b>：代入起点 \(n=n_0\) 计算左式与右式，写出「两端相等奠基成立」；<br>
          2. <b>假设</b>：清晰写出「假设 \(n=k\) 时命题成立，即 \(P(k)\)」；<br>
          3. <b>传递</b>：从 \(n=k+1\) 时的左边出发，分离出 \(P(k)\) 对应部分，<b>注明使用归纳假设</b>替换并代数化简至右边目标式。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          归纳步必须实质性用到归纳假设，切不可跳过假设直接写结论；结尾必须规范总结。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（递推数列猜想与证明）</p>
    <p>数列 \(\{a_n\}\) 满足 \(a_1=1, a_{n+1}=2a_n+1\)。前 4 项为 \(1, 3, 7, 15\)，猜想 \(a_n=2^n-1\)。</p>
    <p>(1) 奠基：\(n=1\) 时，\(a_1=1=2^1-1\)，成立。</p>
    <p>(2) 传递：设 \(k\ge1\)，假设 \(a_k=2^k-1\)（归纳假设）。</p>
    <p>则 \(a_{k+1}=2a_k+1=2(2^k-1)+1=2^{k+1}-1\)，其中等号替换<b>实质运用了归纳假设</b>。这正是 \(n=k+1\) 时的形式。</p>
    <p>由 (1)(2) 知猜想对所有正整数 \(n\) 均成立。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\(a_1=1\)，\(a_{n+1}=\dfrac{a_n}{1+a_n}\)。先算前三项：\(1, \dfrac12, \dfrac13\)，猜想 \(a_n=\dfrac1n\)。在归纳步中，代入归纳假设后的表达式是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac{\frac1k}{1+\frac1k}\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac{\frac1k}{1-\frac1k}\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac{1}{k+1}\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac{k}{k+1}\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。递推关系是 \(a_{k+1}=\dfrac{a_k}{1+a_k}\)，把归纳假设 \(a_k=\dfrac1k\) 代入分子分母，得到 \(\dfrac{\frac1k}{1+\frac1k}\)。化简后正是 \(\dfrac1{k+1}\)。选 C 是直接把目标写了出来，没有展示代入步骤。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 起点不一定是 1</h3>
  <p>命题若从 \(n_0\) 开始，奠基就验证 \(P(n_0)\)，传递则在 \(k\ge n_0\) 的前提下证明。</p>
  <div class="card">
    <p class="small">例 3</p>
    <p>证明：对任意整数 \(n\ge5\)，\(2^n&gt;n^2\)。</p>
    <p>(1) 奠基：\(n=5\) 时，\(2^5=32 &gt; 25=5^2\)，成立。</p>
    <p>(2) 传递：设 \(k\ge5\)，假设 \(2^k&gt;k^2\)。则 \(2^{k+1}=2\cdot2^k&gt;2k^2\)（运用归纳假设）。</p>
    <p>只需说明 \(2k^2\ge(k+1)^2 \iff k^2-2k-1=(k-1)^2-2\ge4^2-2=14&gt;0\)（因 \(k\ge5\)）。</p>
    <p>因此 \(2^{k+1}&gt;(k+1)^2\)，命题在 \(n=k+1\) 时成立。综合 (1)(2)，命题对任意 \(n\ge5\) 均成立。</p>
  </div>
  <div class="card predict" data-id="try-3" data-answer="C">
    <p>自己试试：不等式 \(n!&gt;2^n\) 从哪个正整数起开始成立，且之后一直成立？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(4\)</button>
      <button class="opt" data-v="D"><b>D</b>\(5\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。\(1!=1&lt;2, 2!=2&lt;4, 3!=6&lt;8, 4!=24&gt;16\)。当 \(k\ge4\) 时传递步成立：\((k+1)!=(k+1)k!&gt;(k+1)2^k&gt;2\cdot2^k=2^{k+1}\)。选 B 是把 \(3!\) 与 \(2^3\) 算反了。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：无奠基推导（空中楼阁）</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：只证 \(P(k) \implies P(k+1)\) 便宣称命题成立</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：「\(n^2+n+1\) 是偶数」传递处处成立，但无第一块骨牌，命题全伪！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：归纳步未用归纳假设</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：由 \(n=k+1\) 证明时完全脱开 \(P(k)\) 另行独立推导</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：归纳步必须以 \(P(k)\) 为前提！脱离假设不是真正的归纳法。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：验证有限项便称类推</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：验证前几十项成立就写「由此类推命题成立」</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：不完全归纳不可信！欧拉多项式 \(n=1\dots39\) 均质数，\(n=40\) 立即破灭！
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：无基底悬空骨牌 vs 欧拉多项式有限检验破灭</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-mi-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：无人推倒第一张骨牌（奠基缺失），再完美的连锁也是死局；右图：验证至第 39 项皆真，第 40 项断裂崩盘。
    </div>
  </div>

  <div class="key">多米诺骨牌只是帮助理解。真正的证明靠的是对<b>任意</b> \(k\) 都成立的那一步严格代数传递。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>为什么两步就足够</b>：反证法。若有反例，必存在最小的反例 \(m\)。因 \(m\ne n_0\)，则前一项 \(m-1\) 必定成立；但传递性保证 \(P(m-1)\implies P(m)\) 成立，矛盾。</p>
    <p><b>强归纳法</b>：有时递推依赖前面多项（如斐波那契数列），可假设对所有 \(n\le k\) 均成立，再证 \(k+1\)。</p>
    <p><b>公理背景</b>：数学归纳法与自然数良序性、皮亚诺公理完全等价，是自然数系的基本公理。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 数学归纳法 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 多米诺骨牌直觉
    var dominos = [
      {idx: "1", x: 70, tilt: 25, label: "奠基 n₀"},
      {idx: "2", x: 135, tilt: 25, label: "推倒"},
      {idx: "3", x: 200, tilt: 20, label: "推倒"},
      {idx: "…", x: 265, tilt: 0, label: "…"},
      {idx: "k", x: 335, tilt: 15, label: "若 P(k)"},
      {idx: "k+1", x: 405, tilt: 0, label: "则 P(k+1)"}
    ];
    // Ground line
    svg.appendChild(el("line", {x1: 30, y1: 170, x2: 500, y2: 170, stroke: "#cbd5e1", "stroke-width": 2}));
    // Hand pushing first tile
    svg.appendChild(el("path", {d: "M 35 110 L 60 110", stroke: "#0284c7", "stroke-width": 3}));
    svg.appendChild(el("polygon", {points: "60,110 52,106 52,114", fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 45, y: 100, "text-anchor": "middle", fill: "#0284c7", "font-size": 10, "font-weight": "bold"}, "外力奠基"));

    dominos.forEach(function(d){
      var g = el("g", {transform: "translate(" + d.x + ", 170) rotate(" + d.tilt + ")"});
      g.appendChild(el("rect", {x: -10, y: -70, width: 20, height: 70, rx: 3, fill: d.idx === "1" ? "#0284c7" : (d.idx === "k+1" ? "#16a34a" : "#94a3b8")}));
      g.appendChild(el("text", {x: 0, y: -35, "text-anchor": "middle", fill: "#fff", "font-size": 11, "font-weight": "bold"}, d.idx));
      svg.appendChild(g);
      svg.appendChild(el("text", {x: d.x, y: 188, "text-anchor": "middle", fill: "#475569", "font-size": 10}, d.label));
    });

    // Action banner
    svg.appendChild(el("rect", {x: 310, y: 45, width: 180, height: 35, rx: 6, fill: "#f0fdf4", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 400, y: 67, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "传递机制：k 倒必砸倒 k+1"));
  }

  function drawTab1(svg) {
    // Tab 1: 假设拆解拼接
    var y1 = 45, y2 = 100, y3 = 160;
    // P(k+1) LHS
    svg.appendChild(el("text", {x: 35, y: y1 + 18, fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "P(k+1) 左边:"));
    // Sub-box P(k) LHS
    svg.appendChild(el("rect", {x: 120, y: y1, width: 220, height: 30, rx: 4, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 230, y: y1 + 19, "text-anchor": "middle", fill: "#0369a1", "font-size": 11, "font-weight": "bold"}, "1 + 3 + … + (2k-1) [P(k)左式]"));
    svg.appendChild(el("text", {x: 350, y: y1 + 19, fill: "#94a3b8", "font-size": 12}, "+"));
    svg.appendChild(el("rect", {x: 365, y: y1, width: 100, height: 30, rx: 4, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 415, y: y1 + 19, "text-anchor": "middle", fill: "#b45309", "font-size": 11, "font-weight": "bold"}, "(2k+1) 新增项"));

    // Substitution arrow
    svg.appendChild(el("line", {x1: 230, y1: y1 + 32, x2: 230, y2: y2 - 2, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("polygon", {points: "230," + (y2-2) + " 226," + (y2-8) + " 234," + (y2-8), fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 175, y: (y1+y2)/2 + 7, fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "用归纳假设替换!"));

    // Substituted expression
    svg.appendChild(el("text", {x: 35, y: y2 + 18, fill: "#15803d", "font-size": 12, "font-weight": "bold"}, "代入整理:"));
    svg.appendChild(el("rect", {x: 120, y: y2, width: 80, height: 30, rx: 4, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 160, y: y2 + 19, "text-anchor": "middle", fill: "#15803d", "font-size": 13, "font-weight": "bold"}, "k²"));
    svg.appendChild(el("text", {x: 210, y: y2 + 19, fill: "#94a3b8", "font-size": 12}, "+"));
    svg.appendChild(el("rect", {x: 225, y: y2, width: 90, height: 30, rx: 4, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 270, y: y2 + 19, "text-anchor": "middle", fill: "#b45309", "font-size": 11, "font-weight": "bold"}, "(2k+1)"));

    // Final merge
    svg.appendChild(el("text", {x: 325, y: y2 + 19, fill: "#16a34a", "font-size": 14, "font-weight": "bold"}, "="));
    svg.appendChild(el("rect", {x: 345, y: y2, width: 120, height: 30, rx: 4, fill: "#eff6ff", stroke: "#3b82f6", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 405, y: y2 + 19, "text-anchor": "middle", fill: "#1d4ed8", "font-size": 13, "font-weight": "bold"}, "(k+1)² (目标右式)"));

    svg.appendChild(el("text", {x: 270, y: y3 + 20, "text-anchor": "middle", fill: "#334155", "font-size": 12, "font-weight": "bold"}, "核心枢纽：把 k+1 拆出 k 的块，靠归纳假设搭桥！"));
  }

  function drawTab2(svg) {
    // Tab 2: 起点 n0 判定 (2^n > n^2)
    var items = [
      {n: 1, v1: "2", v2: "1", ok: true, isolated: true},
      {n: 2, v1: "4", v2: "4", ok: false},
      {n: 3, v1: "8", v2: "9", ok: false},
      {n: 4, v1: "16", v2: "16", ok: false},
      {n: 5, v1: "32", v2: "25", ok: true, base: true},
      {n: 6, v1: "64", v2: "36", ok: true}
    ];
    var cy = 90;
    items.forEach(function(item, i){
      var x = 65 + i * 75;
      svg.appendChild(el("rect", {x: x - 32, y: cy - 35, width: 64, height: 70, rx: 6, fill: item.base ? "#dcfce7" : (item.ok ? "#f0fdf4" : "#fef2f2"), stroke: item.base ? "#16a34a" : (item.ok ? "#86efac" : "#fca5a5"), "stroke-width": item.base ? 2.5 : 1}));
      svg.appendChild(el("text", {x: x, y: cy - 18, "text-anchor": "middle", fill: "#475569", "font-size": 11, "font-weight": "bold"}, "n = " + item.n));
      svg.appendChild(el("text", {x: x, y: cy - 2, "text-anchor": "middle", fill: "#64748b", "font-size": 10}, item.v1 + " vs " + item.v2));
      svg.appendChild(el("text", {x: x, y: cy + 20, "text-anchor": "middle", fill: item.ok ? "#16a34a" : "#dc2626", "font-size": 14, "font-weight": "bold"}, item.ok ? "✓" : "✗"));
      if (item.base) {
        svg.appendChild(el("text", {x: x, y: cy + 48, "text-anchor": "middle", fill: "#15803d", "font-size": 10, "font-weight": "bold"}, "★ 起点 n₀=5"));
      } else if (item.isolated) {
        svg.appendChild(el("text", {x: x, y: cy + 48, "text-anchor": "middle", fill: "#94a3b8", "font-size": 9}, "孤立巧合"));
      }
    });

    // Bottom note
    svg.appendChild(el("rect", {x: 70, y: 165, width: 400, height: 30, rx: 6, fill: "#eff6ff", stroke: "#93c5fd", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 184, "text-anchor": "middle", fill: "#1e40af", "font-size": 11, "font-weight": "bold"}, "起点 n₀ 必须是「传递步从此成立且以后恒成立」的起点"));
  }

  function renderFig() {
    var svg = document.getElementById("m-mi-fig");
    var desc = document.getElementById("m-mi-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 骨牌连锁机制</b>：奠基步推倒第一张骨牌，传递步保证任意第 k 张倒下必然砸翻第 k+1 张，连锁反应蔓延至全体自然数。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 归纳步拆解拼接</b>：将 n=k+1 的待证式拆解出前 k 项的主体，用归纳假设搭桥替换，再做代数整理对接目标。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 起点判定与连续性</b>：命题成立起点不必然是 1；必须找到传递步成立、且从该项起后序全真的初始整数 n₀。";
    }
  }

  window.setMMiTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-mi-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-mi-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: missing base
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：无奠基推导（全盘皆伪）"));
    svg.appendChild(el("line", {x1: 30, y1: 105, x2: 240, y2: 105, stroke: "#cbd5e1", "stroke-width": 2}));
    // Upright dominos
    for (var i = 0; i < 4; i++) {
      var x = 60 + i * 45;
      svg.appendChild(el("rect", {x: x - 8, y: 45, width: 16, height: 60, rx: 2, fill: "#fca5a5", stroke: "#ef4444", "stroke-width": 1.5}));
    }
    svg.appendChild(el("text", {x: 135, y: 125, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "无人推倒第一块，处处传递也是死局"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: Euler formula n=40 breaks
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：有限验证不等于类推证明"));
    svg.appendChild(el("rect", {x: 290, y: 45, width: 105, height: 40, rx: 4, fill: "#f0fdf4", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 342, y: 62, "text-anchor": "middle", fill: "#15803d", "font-size": 10}, "n = 1 ~ 39"));
    svg.appendChild(el("text", {x: 342, y: 76, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "全为质数 ✓"));

    svg.appendChild(el("rect", {x: 415, y: 45, width: 105, height: 40, rx: 4, fill: "#fef2f2", stroke: "#dc2626", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 467, y: 62, "text-anchor": "middle", fill: "#991b1b", "font-size": 10}, "n = 40 时"));
    svg.appendChild(el("text", {x: 467, y: 76, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "41×41 合数 ✗"));

    svg.appendChild(el("text", {x: 405, y: 125, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "不完全归纳不可信，必须代数严谨传递"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ renderFig(); drawTrapFig(); });
  } else {
    renderFig();
    drawTrapFig();
  }
})();
'''

# Find the LAST </script> tag
last_script_idx = html_new.rfind("</script>")
assert last_script_idx != -1, "No </script> tag found"
html_final = html_new[:last_script_idx] + js_code + "\n" + html_new[last_script_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html_final)

print("Upgrade done! New size:", len(html_final.encode("utf-8")), "bytes")
