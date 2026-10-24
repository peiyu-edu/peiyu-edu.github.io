# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-5-3.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-1"' in html
assert 'data-id="try-2"' in html
assert 'data-id="try-3"' in html
assert 'data-id="chk1"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：5.1 导数的意义（导数是切线斜率，<a href="e2-5-1.html">回看 5.1</a>）；5.2 求导公式（<a href="e2-5-2.html">回看 5.2</a>）；必修一里函数单调性的定义。</p>

  <div class="card">
    <p><b>单调区间</b>：函数在这一段上一直增（或一直减），这一段就是它的单调递增（递减）区间。</p>
    <p>例：\(f(x)=x^2\) 在 \((-\infty,0)\) 上递减，在 \((0,+\infty)\) 上递增。</p>
  </div>

  <div class="card">
    <p><b>驻点</b>：使导数 \(f'(x)=0\) 的点，切线在此处于水平状态。</p>
    <p>例：\(f(x)=x^2-4x\)，\(f'(x)=2x-4\)，令其为 \(0\) 得驻点 \(x=2\)。</p>
  </div>

  <div class="card">
    <p><b>极值点与极值</b>：在 \(x_0\) 附近，\(f(x_0)\) 比周围的值都大（都小），\(x_0\) 叫极大（极小）<b>值点</b>（横坐标），\(f(x_0)\) 叫极大（极小）<b>值</b>（纵坐标）。</p>
    <p>例：\(f(x)=(x-1)^2+3\) 的极小值点是 \(x=1\)，极小值是 \(f(1)=3\)。</p>
  </div>

  <div class="card">
    <p><b>最值</b>：整个给定闭区间上绝对最大（最小）的函数值。极值看局部山头，最值看全域绝顶。</p>
    <p>例：\(f(x)=x^2\) 在 \([-1,2]\) 上，极小值 \(f(0)=0\) 也是最小值；而最大值是端点值 \(f(2)=4\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>导数应用核心直觉：符号定升降、变号定极值、端点争最值
      </div>
      <div style="display:flex;gap:6px" id="m-app-tabs">
        <button class="btn btn-sm" onclick="setMAppTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 导数符号与升降</button>
        <button class="btn btn-sm" onclick="setMAppTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 极值变号机制</button>
        <button class="btn btn-sm" onclick="setMAppTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ 闭区间最值竞争</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-app-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-app-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">驻点辨析</span>
        <b style="color:#0369a1;font-size:14px">驻点 vs 极值点（必要非充分）</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>驻点 \(f'(x)=0\)</b>：切线水平，仅是可导函数极值的<b>候选点</b>。</li>
        <li><b>极值点必要充要</b>：导数不仅要等于 0，且两侧导数符号必须<b>发生跳变</b>（正变负为极大，负变正为极小）。</li>
        <li><b>经典反例</b>：\(y=x^3\) 在 \(x=0\) 处 \(f'(0)=0\)，但两侧导数均为正，非极值点！</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">层级对比</span>
        <b style="color:#15803d;font-size:14px">极值（局部） vs 最值（全域）</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>极值属局部</b>：只与邻近局部点比；极大值<b>未必大于</b>极小值（如 \(x+\frac1x\) 极大值 \(-2 &lt;\) 极小值 \(2\)）。</li>
        <li><b>最值属全局</b>：在整个给定闭区间上比较，必须包含<b>所有内部极值与两侧端点值</b>。</li>
        <li><b>端点参与度</b>：端点只能竞选最值，绝不能充当极值点。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 单调性、极值与最值主公式</h3>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">
      单调判定：\(\color{#0284c7}{f'(x) &gt; 0 \implies \text{单调递增}}；\quad \color{#dc2626}{f'(x) &lt; 0 \implies \text{单调递减}}\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      极值变号：\(f'(x_0)=0\) 且两侧 \(\begin{cases} \color{#0284c7}{+} \to \color{#dc2626}{-} \implies x_0 \text{ 为极大值点} \\ \color{#dc2626}{-} \to \color{#0284c7}{+} \implies x_0 \text{ 为极小值点}\end{cases}\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      闭区间最值：\(\max_{[a,b]} f(x) = \max\{f(a),\, f(b),\, f(x_{\text{极大}})\}\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>求 \(f(x)=x-2\ln x\) 的单调区间。</p>
    <p>定义域：\(\ln x\) 要求 \(x&gt;0\)，即 \((0,+\infty)\)。</p>
    <p>求导：\(f'(x)=1-\dfrac{2}{x}=\dfrac{x-2}{x}\)。</p>
    <p>判号：在 \((0,+\infty)\) 上分母 \(x&gt;0\)，符号由 \(x-2\) 决定。当 \(0&lt;x&lt;2\) 时 \(f'(x)&lt;0\)；当 \(x&gt;2\) 时 \(f'(x)&gt;0\)。</p>
    <p>结论：单调递减区间为 \((0,2)\)，单调递增区间为 \((2,+\infty)\)。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：函数 \(f(x)=x-\mathrm{e}^x\) 的单调递增区间是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\((-\infty,0)\)</button>
      <button class="opt" data-v="B"><b>B</b>\((0,+\infty)\)</button>
      <button class="opt" data-v="C"><b>C</b>\((-\infty,1)\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\mathbf{R}\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(f'(x)=1-\mathrm{e}^x\)。\(f'(x)&gt;0\iff \mathrm{e}^x&lt;1\iff x&lt;0\)。选 B 是递减区间；选 C 是把 \(\mathrm{e}^x&lt;1\) 误当成 \(x&lt;1\)。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 极值最值与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：求三次函数在闭区间上的极值与最值（如 \(f(x)=x^3-12x\) 在 \([-3,5]\)）</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          题目给出连续函数及其闭区间 \([a,b]\)，要求求解极值与全区间最大最小值。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>求导解驻点</b>：令 \(f'(x)=3x^2-12=0 \implies x=\pm2\)，筛选落入区间的驻点；<br>
          2. <b>做表格看变号</b>：驻点两侧导数符号左正右负得极大值 \(f(-2)=16\)，左负右正得极小值 \(f(2)=-16\)；<br>
          3. <b>端点全比对</b>：计算端点值 \(f(-3)=9, f(5)=65\)；比对 \(\{9, 16, -16, 65\}\) 得最大值 \(65\)，最小值 \(-16\)。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          闭区间最值万不可漏算区间端点（本题最大值在端点 \(x=5\) 处高达 65，远超局部极大值 16）！
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（求极值）</p>
    <p>求 \(f(x)=2x^3-3x^2-12x+5\) 的极值。</p>
    <p>求导并因式分解：\(f'(x)=6x^2-6x-12=6(x+1)(x-2)\)。令 \(f'(x)=0\) 得驻点 \(x=-1\) 和 \(x=2\)。</p>
    <p>做变号判定表：</p>
    <ul>
      <li>\(x&lt;-1\) 时 \(f'(x)&gt;0\)；\(x=-1\) 处 \(f'=0\)；\(-1&lt;x&lt;2\) 时 \(f'(x)&lt;0\)（左正右负 \(\implies\) 极大值点）。极大值 \(f(-1)=12\)。</li>
      <li>\(-1&lt;x&lt;2\) 时 \(f'(x)&lt;0\)；\(x=2\) 处 \(f'=0\)；\(x&gt;2\) 时 \(f'(x)&gt;0\)（左负右正 \(\implies\) 极小值点）。极小值 \(f(2)=-15\)。</li>
    </ul>
  </div>
  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：函数 \(f(x)=x^3-3x\) 的极小值点是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(x=1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(x=-1\)</button>
      <button class="opt" data-v="C"><b>C</b>\(-2\)</button>
      <button class="opt" data-v="D"><b>D</b>\(2\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(f'(x)=3(x-1)(x+1)\)，驻点 \(\pm1\)。\(x=1\) 左边 \(f'&lt;0\)、右边 \(f'&gt;0\)，是极小值点。问的是「点」（横坐标），选 C 是把极小值 \(f(1)=-2\) 当成了点；选 B 是极大值点。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 闭区间上的最值</h3>
  <p>在闭区间 \([a,b]\) 上，连续函数必有最大值和最小值。最值只可能在两处出现：<b>内部的极值点</b>，或者<b>区间的端点</b>。</p>

  <div class="card">
    <p class="small">例 3（求最值）</p>
    <p>求 \(f(x)=x^3-12x\) 在 \([-3,5]\) 上的最大值和最小值。</p>
    <p>\(f'(x)=3x^2-12=3(x+2)(x-2)\)，驻点 \(\pm2\) 均在区间内：\(f(-2)=16, f(2)=-16\)。</p>
    <p>端点：\(f(-3)=-27+36=9\)，\(f(5)=125-60=65\)。</p>
    <p>全盘比对 \(\{9, 16, -16, 65\}\)：最大值 \(65\)（在端点 \(x=5\) 取到），最小值 \(-16\)（在极小值点 \(x=2\) 取到）。</p>
  </div>
  <div class="card predict" data-id="try-3" data-answer="B">
    <p>自己试试：\(f(x)=x^3-12x\) 在区间 \([-3,5]\) 上的最值是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>最大值 \(16\)，最小值 \(-16\)</button>
      <button class="opt" data-v="B"><b>B</b>最大值 \(65\)，最小值 \(-16\)</button>
      <button class="opt" data-v="C"><b>C</b>最大值 \(65\)，最小值 \(9\)</button>
      <button class="opt" data-v="D"><b>D</b>最大值 \(16\)，最小值 \(9\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。驻点值 \(16, -16\) 与端点值 \(9, 65\) 汇总比对：最大为 \(65\)，最小为 \(-16\)。选 A 漏算了端点！</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：驻点直接当极值点</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：求出 \(f'(x)=0\) 立即断言必为极值点</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：导数两侧必须严格变号！\(y=x^3\) 在 \(x=0\) 导数为 0 但两侧皆正，非极值点。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：闭区间最值遗漏端点</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：求闭区间最值只算极值点，不顾区间端点</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：端点极常产生全区最高峰（如本课例 3 中端点 65 远超极大值 16）！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：单调区间用并集 ∪ 连接</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：写出 \((-\infty,0)\cup(0,+\infty)\) 单调递减</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：在并集跨断点处不满足单调定义！必须用「和」或逗号分别书写各区间。
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：拐点驻点单调上升 vs 反比例并集跨断点违例</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-app-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：\(y=x^3\) 在原点导数为 0 但全程单调递增；右图：\(y=1/x\) 在 \(x=-1\) 与 \(x=1\) 处值从 \(-1\) 升到 \(1\)，并集不递减。
    </div>
  </div>

  <div class="card predict" data-id="chk1" data-answer="C">
    <p><b>自己试试</b>：下列关于极值与最值的说法中，<b>正确</b>的是：</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>函数的极大值必定大于其极小值</button>
      <button class="opt" data-v="B"><b>B</b>可导函数的极值点一定满足导数等于 0，且导数等于 0 的点一定是极值点</button>
      <button class="opt" data-v="C"><b>C</b>极大值是局部范围内的最大值，它可能小于函数在另一处的极小值</button>
      <button class="opt" data-v="D"><b>D</b>闭区间的端点也可以是函数的极值点</button>
    </div>
    <div class="reveal">
      <p><b>C</b>。极值只和邻域比，\(x+\dfrac1x\) 就是反例（极大值 \(-2 &lt;\) 极小值 \(2\)）。B 选项后半句错（如 \(x^3\) 在 0 处）；D 选项端点不可充当极值点。</p>
    </div>
  </div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>用单调性证明不等式</b>：例如证明 \(\mathrm{e}^x\ge x+1\)。构造辅助函数 \(g(x)=\mathrm{e}^x-x-1\)，通过求导判定在 \(x=0\) 处取得最小值 \(0\)，从而获证恒大于等于 0。</p>
    <p><b>最优化实际问题建模</b>：先根据物理几何背景设立自变量定义域，再通过导数寻找驻点求解最值。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 导数应用 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 导数符号与升降
    var ox = 40, oy = 110;
    svg.appendChild(el("line", {x1: 20, y1: oy, x2: 500, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    // Cubic curve with peak and trough
    var d = "M 50 170 Q 150 20 250 110 T 450 50";
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#0284c7", "stroke-width": 2.5}));

    // Tangent 1 (rising): x=90, y=105
    svg.appendChild(el("line", {x1: 60, y1: 145, x2: 120, y2: 65, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 90, cy: 105, r: 3, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 80, y: 55, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "f'(x)>0 单调递增"));

    // Peak: x=175, y=55
    svg.appendChild(el("line", {x1: 145, y1: 55, x2: 205, y2: 55, stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 175, cy: 55, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 175, y: 42, "text-anchor": "middle", fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "f'=0 极大值"));

    // Tangent 2 (falling): x=245, y=105
    svg.appendChild(el("line", {x1: 220, y1: 75, x2: 270, y2: 135, stroke: "#dc2626", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 245, cy: 105, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 235, y: 155, fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "f'(x)<0 单调递减"));

    // Trough: x=315, y=155
    svg.appendChild(el("line", {x1: 285, y1: 155, x2: 345, y2: 155, stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 315, cy: 155, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 315, y: 175, "text-anchor": "middle", fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "f'=0 极小值"));

    // Tangent 3 (rising again)
    svg.appendChild(el("text", {x: 400, y: 105, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "f'(x)>0 递增"));
  }

  function drawTab1(svg) {
    // Tab 1: 极值变号机制
    var cy = 100;
    // Axis line
    svg.appendChild(el("line", {x1: 40, y1: cy, x2: 480, y2: cy, stroke: "#cbd5e1", "stroke-width": 2}));
    // Point x1 (Peak: + to -)
    svg.appendChild(el("circle", {cx: 170, cy: cy, r: 5, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 170, y: cy + 22, "text-anchor": "middle", fill: "#0f172a", "font-size": 12, "font-weight": "bold"}, "x₁"));
    svg.appendChild(el("text", {x: 105, y: cy - 15, "text-anchor": "middle", fill: "#16a34a", "font-size": 16, "font-weight": "bold"}, "+"));
    svg.appendChild(el("text", {x: 105, y: cy + 20, "text-anchor": "middle", fill: "#16a34a", "font-size": 11}, "增 ↗"));
    svg.appendChild(el("text", {x: 235, y: cy - 15, "text-anchor": "middle", fill: "#dc2626", "font-size": 16, "font-weight": "bold"}, "—"));
    svg.appendChild(el("text", {x: 235, y: cy + 20, "text-anchor": "middle", fill: "#dc2626", "font-size": 11}, "减 ↘"));
    svg.appendChild(el("rect", {x: 125, y: cy - 65, width: 90, height: 28, rx: 6, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 170, y: cy - 47, "text-anchor": "middle", fill: "#0369a1", "font-size": 11, "font-weight": "bold"}, "极大值 (+转-)"));

    // Point x2 (Trough: - to +)
    svg.appendChild(el("circle", {cx: 310, cy: cy, r: 5, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 310, y: cy + 22, "text-anchor": "middle", fill: "#0f172a", "font-size": 12, "font-weight": "bold"}, "x₂"));
    svg.appendChild(el("text", {x: 385, y: cy - 15, "text-anchor": "middle", fill: "#16a34a", "font-size": 16, "font-weight": "bold"}, "+"));
    svg.appendChild(el("text", {x: 385, y: cy + 20, "text-anchor": "middle", fill: "#16a34a", "font-size": 11}, "增 ↗"));
    svg.appendChild(el("rect", {x: 265, y: cy - 65, width: 90, height: 28, rx: 6, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 310, y: cy - 47, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "极小值 (-转+)"));

    // Bottom note
    svg.appendChild(el("text", {x: 270, y: 175, "text-anchor": "middle", fill: "#475569", "font-size": 12, "font-weight": "bold"}, "核心准则：导数必须在分界点两侧改变正负号，方构成极值！"));
  }

  function drawTab2(svg) {
    // Tab 2: 闭区间最值竞争
    var ox = 40, oy = 110;
    // Interval [a, b] background
    svg.appendChild(el("rect", {x: 80, y: 25, width: 380, height: 160, fill: "#f8fafc", stroke: "#cbd5e1", "stroke-width": 1}));
    // Curve
    var d = "M 80 130 Q 150 40 230 110 T 360 145 L 460 35";
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#0284c7", "stroke-width": 2.5}));

    // Point a (left boundary)
    svg.appendChild(el("circle", {cx: 80, cy: 130, r: 4, fill: "#64748b"}));
    svg.appendChild(el("text", {x: 80, y: 150, "text-anchor": "middle", fill: "#64748b", "font-size": 11}, "端点 f(a)"));

    // Local max x1
    svg.appendChild(el("circle", {cx: 170, cy: 68, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 170, y: 55, "text-anchor": "middle", fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "极大值 16"));

    // Local min x2
    svg.appendChild(el("circle", {cx: 340, cy: 145, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 340, y: 165, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "极小值(最小值 -16)"));

    // Point b (right boundary - global max)
    svg.appendChild(el("circle", {cx: 460, cy: 35, r: 5, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 440, y: 28, fill: "#dc2626", "font-size": 12, "font-weight": "bold"}, "★ 端点最大值 65！"));

    svg.appendChild(el("text", {x: 270, y: 205, "text-anchor": "middle", fill: "#0f172a", "font-size": 11, "font-weight": "bold"}, "候选库：比较所有极值点与两端点 -> 端点 65 击败极大值 16 斩获全局最大"));
  }

  function renderFig() {
    var svg = document.getElementById("m-app-fig");
    var desc = document.getElementById("m-app-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 导数符号与函数升降</b>：切线斜率正负直接锁定函数走势，f'(x) > 0 曲线爬升，f'(x) < 0 曲线跌落，f'=0 水平驻点。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 极值变号机制</b>：驻点仅是候选。只有当导数从正变负（左增右减）才形成极大值，从负变正（左减右增）才形成极小值。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 闭区间最值决胜</b>：最值在「内部极值」与「边界端点」中比试得出，端点往往超越内部极大值斩获全局最大。";
    }
  }

  window.setMAppTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-app-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-app-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: y = x^3 inflection
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：驻点必为极值点 (y=x³)"));
    svg.appendChild(el("path", {d: "M 45 125 Q 120 120 135 80 T 225 35", fill: "none", stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("line", {x1: 95, y1: 80, x2: 175, y2: 80, stroke: "#dc2626", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 135, cy: 80, r: 4, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 135, y: 70, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "f'(0)=0 但两侧皆正"));
    svg.appendChild(el("text", {x: 135, y: 135, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "全域单调递增，无极值！"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: y = 1/x split
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：递减区间用 ∪ 强行并集"));
    svg.appendChild(el("path", {d: "M 290 85 Q 350 88 355 135", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("path", {d: "M 455 35 Q 460 82 520 85", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 340, cy: 95, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 340, y: 110, "text-anchor": "middle", fill: "#dc2626", "font-size": 9}, "f(-1)=-1"));
    svg.appendChild(el("circle", {cx: 470, cy: 75, r: 3, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 470, y: 65, "text-anchor": "middle", fill: "#16a34a", "font-size": 9}, "f(1)=1"));
    svg.appendChild(el("text", {x: 405, y: 135, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "-1 < 1 但 f(-1) < f(1)！不能写 ∪"));
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
