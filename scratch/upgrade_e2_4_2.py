# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-4-2.html"

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
  <p class="small">要用到：4.1 的数列、项、通项公式、前 \(n\) 项和 \(S_n\)（<a href="e2-4-1.html">回看 4.1</a>）；一次函数 \(y=kx+b\) 和二次函数的顶点（<a href="b1-3-1.html">函数 3.1</a>、<a href="b1-2-3.html">二次函数 2.3</a>）。</p>

  <div class="card">
    <p><b>相邻两项的差</b>：后一项减前一项，\(a_{n+1}-a_n\)。</p>
    <p>例：\(3,7,11,15\) 的相邻差是 \(4,4,4\)，都一样；\(1,2,4,7\) 的相邻差是 \(1,2,3\)，不一样。</p>
  </div>

  <div class="card">
    <p><b>公差 \(d\)</b>：相邻差<b>每一处都等于</b>同一个常数时，这个常数叫公差，记作 \(d\)。它可以是正数、负数，也可以是 \(0\)。</p>
    <p>例：\(3,7,11,15,\dots\) 的 \(d=4\)；\(10,7,4,1,\dots\) 的 \(d=-3\)；\(5,5,5,\dots\) 的 \(d=0\)。</p>
  </div>

  <div class="card">
    <p><b>前 \(n\) 项和 \(S_n\)</b>：从第 \(1\) 项加到第 \(n\) 项，\(S_n=a_1+a_2+\dots+a_n\)。</p>
    <p>例：数列 \(2,5,8,11,\dots\)，\(S_1=2\)，\(S_3=2+5+8=15\)。</p>
  </div>

  <div class="card">
    <p><b>一次函数的斜率与公差</b>：\(y=kx+b\) 里，\(x\) 每加 \(1\)，\(y\) 就加 \(k\)。等差数列的公差 \(d\) 正好对应直线的斜率。</p>
    <p>例：\(a_n=3n-2\)，点 \((n, a_n)\) 全部落在斜率为 \(3\) 的直线上，但自变量只取正整数。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>等差核心特征：斜率离散线、倒序配对与二次求和
      </div>
      <div style="display:flex;gap:6px" id="m-ap-tabs">
        <button class="btn btn-sm" onclick="setMApTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 通项与斜率</button>
        <button class="btn btn-sm" onclick="setMApTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 倒序相加</button>
        <button class="btn btn-sm" onclick="setMApTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ Sn二次函数最值</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-ap-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-ap-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">中项性质</span>
        <b style="color:#0369a1;font-size:14px">等差中项与对称求和</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>等差中项</b>：\(a, A, b\) 成等差 \(\iff 2A=a+b \iff A=\dfrac{a+b}{2}\)。</li>
        <li><b>下标和性质</b>：若 \(m+n=p+q\)，则 \(a_m+a_n=a_p+a_q\)。</li>
        <li><b>奇数项求和</b>：\(S_{2k-1}=(2k-1)a_k\)（首末和换为中间项的 2 倍）。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">公式选用</span>
        <b style="color:#15803d;font-size:14px">两套求和公式与最值判定</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>已知首末项</b>：用 \(S_n=\dfrac{n(a_1+a_n)}{2}\)，梯形平均算法最快捷。</li>
        <li><b>已知首项与公差</b>：用 \(S_n=na_1+\dfrac{n(n-1)}{2}d\)，化简后无常数项。</li>
        <li><b>求 \(S_n\) 最值</b>：当 \(a_1&gt;0, d&lt;0\) 时，令 \(a_n\ge0\) 找正项分界点即为最大和。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 定义与色彩语义主公式</h3>
  <p>一个数列，<b>从第 \(2\) 项起</b>，每一项减它的前一项都等于<b>同一个常数</b> \(d\)，就叫<b>等差数列</b>：</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">定义式：\(a_{n+1}-a_n = \color{#0284c7}{d}\quad (\forall n \in \mathbf{N}^*)\)</div>
    <div style="margin-top:6px;font-size:15px">
      通项公式：\(a_n = a_1 + (n-1)\color{#0284c7}{d} = \color{#0284c7}{d}n + (a_1 - \color{#0284c7}{d})\)（斜率为 \(d\) 的离散直线）
    </div>
    <div style="margin-top:6px;font-size:15px">
      前 \(n\) 项和：\(S_n = \dfrac{n(a_1+a_n)}{2} = na_1 + \dfrac{n(n-1)}{2}\color{#0284c7}{d} = \color{#16a34a}{\dfrac{d}{2}}n^2 + \color{#d97706}{\left(a_1-\dfrac{d}{2}\right)}n\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>等差数列中 \(a_3=7\)，\(a_7=19\)，求通项公式和 \(a_{20}\)。</p>
    <p>从第 \(3\) 项到第 \(7\) 项走 \(4\) 步：\(a_7-a_3=4d\)，即 \(12=4d \implies d=3\)。</p>
    <p>再往回走 \(2\) 步：\(a_1=a_3-2d=7-6=1\)。</p>
    <p>所以 \(a_n=1+3(n-1)=3n-2\)，\(a_{20}=3\times20-2=58\)。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：等差数列 \(a_1=2\)，\(d=3\)，\(a_{20}\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(59\)</button>
      <button class="opt" data-v="B"><b>B</b>\(62\)</button>
      <button class="opt" data-v="C"><b>C</b>\(60\)</button>
      <button class="opt" data-v="D"><b>D</b>\(23\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(a_{20}=2+(20-1)\times3=2+57=59\)。选 B 的同学用了 \(20\times3\)：从第 \(1\) 项到第 \(20\) 项只走 \(19\) 步。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 等差中项与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：首正负公差数列的前 n 项和最大值求解</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          已知等差数列 \(a_1 &gt; 0, d &lt; 0\)（数列从正数递减走向负数），要求前 \(n\) 项和 \(S_n\) 的最大值及对应项数。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>找正项分界</b>：解不等式 \(a_n = a_1 + (n-1)d \ge 0\)，求出非负项的最大下标整数 \(k\)；<br>
          2. <b>确定最值项</b>：此时前 \(k\) 项均为正或零，加到第 \(k\) 项和达到最大；<br>
          3. <b>代入求和公式</b>：代入 \(S_k = ka_1 + \frac{k(k-1)}{2}d\) 计算极值（若 \(a_{k+1}=0\)，则 \(S_k=S_{k+1}\) 均为最大）。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          切忌盲目套用二次函数实数对称轴 \(-\frac{B}{2A}\) 得出非整数结论；下标必须为整数。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（等差中项与性质运用）</p>
    <p>(1) \(3\) 与 \(11\) 的等差中项：\(A=\dfrac{3+11}{2}=7\)。检验：\(3,7,11\) 相邻差均为 \(4\)。</p>
    <p>(2) 等差数列中 \(a_2+a_8=10\)，求 \(a_5\)。由 \(2+8=5+5\) 得 \(a_2+a_8=2a_5\)，故 \(a_5=5\)。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\(-4\) 与 \(10\) 的等差中项是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(3\)</button>
      <button class="opt" data-v="B"><b>B</b>\(7\)</button>
      <button class="opt" data-v="C"><b>C</b>\(6\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-7\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\dfrac{-4+10}{2}=3\)，检验 \(-4,3,10\) 的相邻差都是 \(7\)。选 B 的同学算的是 \(\dfrac{10-(-4)}{2}\)，那是公差，不是中项。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 前 \(n\) 项和：倒序相加推导</h3>
  <p>将数列正着写一遍、倒着写一遍，上下对齐相加，每一列之和恒为 \(a_1+a_n\)，共 \(n\) 列，即 \(2S_n=n(a_1+a_n)\)。</p>
  <div class="card">
    <p class="small">例 3</p>
    <p>等差数列 \(a_1=2\)，\(d=3\)，求 \(S_{10}\)。</p>
    <p>用公式二：\(S_{10}=10\times2+\dfrac{10\times9}{2}\times3=20+135=155\)。</p>
    <p>用公式一验算：\(a_{10}=2+9\times3=29\)，\(S_{10}=\dfrac{10\times(2+29)}{2}=155\)。结果完全一致。</p>
  </div>
  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：\(1+3+5+\dots+19\) 等于？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(100\)</button>
      <button class="opt" data-v="B"><b>B</b>\(200\)</button>
      <button class="opt" data-v="C"><b>C</b>\(190\)</button>
      <button class="opt" data-v="D"><b>D</b>\(81\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。先数项数：\(19=1+(n-1)\times2 \implies n=10\)。\(S_{10}=\dfrac{10\times(1+19)}{2}=100\)。选 B 是忘了除以 \(2\)；选 C 是把项数当成了 \(19\)。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：步数算错（n 误代为 n-1）</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：求第 20 项直接算 \(a_{20} = a_1 + 20d\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：从第 1 项走到第 20 项共跨越 \(20-1=19\) 步公差，应算 \(a_1 + 19d\)！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：求和最值盲信实数对称轴</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(S_n=-\frac{3}{2}n^2+\frac{23}{2}n\) 误认最大值在 \(n=3.83\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：项数只能是正整数！比较两边整数 \(S_3=21, S_4=22\)，最大值在 \(n=4\) 取得。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：断言求和必为二次函数</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：认为所有等差数列的 \(S_n\) 都是关于 \(n\) 的二次式</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：当公差 \(d=0\) 时，数列为常数列 \(c\)，\(S_n=cn\) 为正比例函数而非二次函数。
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：步数跨度 n-1 vs Sn 整数比较峰值</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-ap-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：从 \(a_1\) 到 \(a_n\) 只有 \(n-1\) 个间隔（植树原理）；右图：实数顶点 \(n=3.83\) 不存在，必须在整数 \(n=4\) 处截取最大值 \(22\)。
    </div>
  </div>

  <div class="key">实数顶点只是「找最值的地方大概在哪」：真正的答案要在它两边的正整数（以及范围端点）里比较出来。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>通项是 \(pn+q\) 的形式</b>：一定是等差数列，公差为 \(p\)；若 \(p=0\) 则为常数列。</p>
    <p><b>前 \(n\) 项和是 \(An^2+Bn\) 的形式（无常数项）</b>：数列必为等差数列，公差 \(d=2A\)。若含有非零常数项（如 \(S_n=n^2+1\)），则第一项脱节，并非整体等差数列。</p>
    <p><b>对称轴恰为半整数</b>：若实数对称轴恰为 \(n=4.5\)，则 \(S_4=S_5\) 达到最大值（此时恰有 \(a_5=0\)）。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 等差数列 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 通项 a_n = 2 + (n-1)*3 -> 直线斜率 d=3
    var ox = 60, oy = 180;
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 470, y: oy - 6, fill: "#94a3b8", "font-size": 12}, "n"));
    svg.appendChild(el("text", {x: ox + 8, y: 30, fill: "#94a3b8", "font-size": 12}, "a_n"));
    // Dashed line y = 3x - 1
    svg.appendChild(el("line", {x1: ox, y1: oy - 15, x2: ox + 380, y2: oy - 165, stroke: "#93c5fd", "stroke-width": 1.5, "stroke-dasharray": "4,4"}));
    var pts = [
      {n: 1, v: 2, y: oy - 30},
      {n: 2, v: 5, y: oy - 60},
      {n: 3, v: 8, y: oy - 90},
      {n: 4, v: 11, y: oy - 120},
      {n: 5, v: 14, y: oy - 150}
    ];
    pts.forEach(function(p, i){
      var x = ox + p.n * 65;
      svg.appendChild(el("line", {x1: x, y1: oy, x2: x, y2: p.y, stroke: "#cbd5e1", "stroke-width": 1, "stroke-dasharray": "2,2"}));
      svg.appendChild(el("circle", {cx: x, cy: p.y, r: 5, fill: "#0284c7"}));
      svg.appendChild(el("text", {x: x, y: oy + 16, "text-anchor": "middle", fill: "#475569", "font-size": 11, "font-weight": "bold"}, "n=" + p.n));
      svg.appendChild(el("text", {x: x - 8, y: p.y - 10, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "a" + p.n + "=" + p.v));
      // Step delta triangle between n=2 and n=3
      if (i === 1) {
        var nextX = ox + 3 * 65, nextY = oy - 90;
        svg.appendChild(el("path", {d: "M " + x + " " + p.y + " L " + nextX + " " + p.y + " L " + nextX + " " + nextY, fill: "none", stroke: "#16a34a", "stroke-width": 1.5}));
        svg.appendChild(el("text", {x: (x + nextX)/2, y: p.y + 14, "text-anchor": "middle", fill: "#16a34a", "font-size": 10}, "Δn=1"));
        svg.appendChild(el("text", {x: nextX + 6, y: (p.y + nextY)/2 + 4, fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "+d=3"));
      }
    });
  }

  function drawTab1(svg) {
    // Tab 1: 倒序相加配对
    var cy1 = 65, cy2 = 125;
    var pairs = [
      {a: "a₁=1", b: "a_n=19", sum: "20", x: 75},
      {a: "a₂=3", b: "a_{n-1}=17", sum: "20", x: 175},
      {a: "a₃=5", b: "a_{n-2}=15", sum: "20", x: 275},
      {a: "…", b: "…", sum: "…", x: 365},
      {a: "a_n=19", b: "a₁=1", sum: "20", x: 455}
    ];
    svg.appendChild(el("text", {x: 25, y: cy1 + 5, fill: "#0284c7", "font-size": 12, "font-weight": "bold"}, "S_n:"));
    svg.appendChild(el("text", {x: 25, y: cy2 + 5, fill: "#64748b", "font-size": 12, "font-weight": "bold"}, "倒S_n:"));
    pairs.forEach(function(p){
      // Box top
      svg.appendChild(el("rect", {x: p.x - 35, y: cy1 - 18, width: 70, height: 32, rx: 6, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 1.5}));
      svg.appendChild(el("text", {x: p.x, y: cy1 + 3, "text-anchor": "middle", fill: "#0369a1", "font-size": 11, "font-weight": "bold"}, p.a));
      // Box bottom
      svg.appendChild(el("rect", {x: p.x - 35, y: cy2 - 18, width: 70, height: 32, rx: 6, fill: "#f1f5f9", stroke: "#94a3b8", "stroke-width": 1.5}));
      svg.appendChild(el("text", {x: p.x, y: cy2 + 3, "text-anchor": "middle", fill: "#475569", "font-size": 11, "font-weight": "bold"}, p.b));
      // Plus line
      svg.appendChild(el("line", {x1: p.x, y1: cy1 + 16, x2: p.x, y2: cy2 - 18, stroke: "#16a34a", "stroke-width": 1.5, "stroke-dasharray": "2,2"}));
      // Column sum
      svg.appendChild(el("text", {x: p.x, y: 175, "text-anchor": "middle", fill: "#16a34a", "font-size": 12, "font-weight": "bold"}, "=" + p.sum));
    });
    // Banner
    svg.appendChild(el("rect", {x: 100, y: 188, width: 340, height: 26, rx: 4, fill: "#dcfce7", stroke: "#86efac", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 205, "text-anchor": "middle", fill: "#166534", "font-size": 11, "font-weight": "bold"}, "共 n 组首末等和 -> 2S_n = n(a₁ + a_n) -> S_n = n(a₁+a_n)/2"));
  }

  function drawTab2(svg) {
    // Tab 2: S_n 二次函数拟合与最值分界 (a_1=10, d=-3)
    var ox = 60, oy = 180;
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    // Parabola curve S_n = -1.5 n^2 + 11.5 n
    var d = "M " + ox + " " + oy;
    for (var n = 0; n <= 7; n += 0.2) {
      var s = -1.5 * n * n + 11.5 * n;
      var px = ox + n * 55;
      var py = oy - s * 6.5;
      d += " L " + px + " " + py;
    }
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#cbd5e1", "stroke-width": 1.5, "stroke-dasharray": "4,4"}));
    // S_n discrete points
    var spts = [
      {n: 1, s: 10},
      {n: 2, s: 17},
      {n: 3, s: 21},
      {n: 4, s: 22, max: true},
      {n: 5, s: 20},
      {n: 6, s: 15}
    ];
    spts.forEach(function(p){
      var x = ox + p.n * 55, y = oy - p.s * 6.5;
      svg.appendChild(el("line", {x1: x, y1: oy, x2: x, y2: y, stroke: p.max ? "#16a34a" : "#93c5fd", "stroke-width": p.max ? 2 : 1, "stroke-dasharray": p.max ? "none" : "2,2"}));
      svg.appendChild(el("circle", {cx: x, cy: y, r: p.max ? 6 : 4, fill: p.max ? "#16a34a" : "#0284c7"}));
      svg.appendChild(el("text", {x: x, y: y - 10, "text-anchor": "middle", fill: p.max ? "#16a34a" : "#0284c7", "font-size": 11, "font-weight": "bold"}, "S" + p.n + "=" + p.s));
      svg.appendChild(el("text", {x: x, y: oy + 16, "text-anchor": "middle", fill: "#475569", "font-size": 10}, "n=" + p.n));
    });
    // Peak badge
    svg.appendChild(el("rect", {x: 290, y: 35, width: 200, height: 42, rx: 6, fill: "#ecfdf5", stroke: "#10b981", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 390, y: 53, "text-anchor": "middle", fill: "#065f46", "font-size": 11, "font-weight": "bold"}, "最大和 S₄=22 (a₄=1 > 0)"));
    svg.appendChild(el("text", {x: 390, y: 69, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "a₅=-2 < 0 导致总和开始减少"));
  }

  function renderFig() {
    var svg = document.getElementById("m-ap-fig");
    var desc = document.getElementById("m-ap-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 通项与离散斜率</b>：等差数列通项 a_n = dn + (a₁-d) 散落于斜率为 d 的直线上，自变量每增加 1，函数值严格增加公差 d。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 倒序相加对称配对</b>：将数列正倒对齐相加，每一列首末项之和均等于 a₁ + a_n，n 列相加即得 2S_n = n(a₁ + a_n)。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ S_n 二次求和最值</b>：公差为负时各项递减，只要 a_n > 0 累加和就在增长；当 a_5 = -2 变负时总和下降，故最大和必在分界正项 S_4 处取得。";
    }
  }

  window.setMApTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-ap-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-ap-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: step count 19 vs 20
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：跨度步数 n-1 算成 n"));
    svg.appendChild(el("line", {x1: 30, y1: 85, x2: 240, y2: 85, stroke: "#cbd5e1", "stroke-width": 2}));
    var pts = [
      {x: 45, t: "a₁"},
      {x: 95, t: "a₂"},
      {x: 145, t: "a₃"},
      {x: 225, t: "a₂₀"}
    ];
    pts.forEach(function(p, i){
      svg.appendChild(el("circle", {cx: p.x, cy: 85, r: 4, fill: "#0284c7"}));
      svg.appendChild(el("text", {x: p.x, y: 105, "text-anchor": "middle", fill: "#475569", "font-size": 10}, p.t));
    });
    svg.appendChild(el("text", {x: 185, y: 80, fill: "#94a3b8", "font-size": 12}, "…"));
    // Span bracket
    svg.appendChild(el("line", {x1: 45, y1: 65, x2: 225, y2: 65, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 135, y: 55, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "共跨越 19 步公差 (+19d)"));
    svg.appendChild(el("text", {x: 135, y: 140, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "a₂₀ = a₁ + 19d (并非 20d)"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: S_n vertex vs discrete
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：S_n 实数顶点取不到"));
    svg.appendChild(el("line", {x1: 295, y1: 120, x2: 515, y2: 120, stroke: "#cbd5e1", "stroke-width": 1}));
    // Parabola
    svg.appendChild(el("path", {d: "M 320 115 Q 405 20 490 115", fill: "none", stroke: "#cbd5e1", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("circle", {cx: 405, cy: 35, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 405, y: 30, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "顶点 n=3.83 (无此项)"));
    // Real n=3 and n=4
    svg.appendChild(el("circle", {cx: 375, cy: 45, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 375, y: 65, "text-anchor": "middle", fill: "#0284c7", "font-size": 10}, "S₃=21"));
    svg.appendChild(el("circle", {cx: 435, cy: 40, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 435, y: 60, "text-anchor": "middle", fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "S₄=22 (峰值)"));
    svg.appendChild(el("text", {x: 405, y: 140, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "比较邻近整数，截取离散峰值 S₄=22"));
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
