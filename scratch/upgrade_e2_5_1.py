# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-5-1.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-1"' in html
assert 'data-id="try-2"' in html
assert 'data-id="chk1"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：函数和函数值（<a href="b1-3-1.html">回看 3.1</a>）；直线的斜率（<a href="e1-2-1.html">回看选必一 2.1</a>）和点斜式方程（<a href="e1-2-2.html">回看选必一 2.2</a>）。</p>

  <div class="card">
    <p><b>增量 \(\Delta x\)、\(\Delta y\)</b>：自变量从 \(x_0\) 变到 \(x_0+\Delta x\)，变了多少就是 \(\Delta x\)（\(\Delta x\ne0\)，可正可负）；函数值变了多少叫 \(\Delta y = f(x_0+\Delta x)-f(x_0)\)。</p>
    <p>例：\(f(x)=x^2\)，从 \(2\) 变到 \(2.5\)：\(\Delta x=0.5, \Delta y=6.25-4=2.25\)；变到 \(1.5\)：\(\Delta x=-0.5, \Delta y=-1.75\)。</p>
  </div>

  <div class="card">
    <p><b>割线与斜率</b>：曲线上两点连成的直线叫<b>割线</b>，其斜率就是两点间的平均变化率 \(\dfrac{\Delta y}{\Delta x}\)。</p>
    <p>例：抛物线 \(y=x^2\) 上 \((1,1)\) 与 \((3,9)\) 的割线斜率是 \(\dfrac{9-1}{3-1}=4\)。</p>
  </div>

  <div class="card">
    <p><b>趋近于（\(\to\)）</b>：「\(\Delta x\to0\)」指 \(\Delta x\) 无限接近 \(0\) 但<b>始终不等于 \(0\)</b>，观察分式逼近的确定极限值。</p>
    <p>例：式子 \(4+\Delta x\)，当 \(\Delta x\to0\) 时，无论从正侧还是负侧逼近，值均贴近 \(4\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>导数核心直觉：割线逼近切线、局部以直代曲与切点辨析
      </div>
      <div style="display:flex;gap:6px" id="m-der-tabs">
        <button class="btn btn-sm" onclick="setMDerTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 割线逼近切线</button>
        <button class="btn btn-sm" onclick="setMDerTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 局部以直代曲</button>
        <button class="btn btn-sm" onclick="setMDerTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ 在点处 vs 过点</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-der-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-der-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">极限跨越</span>
        <b style="color:#0369a1;font-size:14px">平均变化率 vs 瞬时导数</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>平均变化率</b>：两点割线斜率 \(\dfrac{\Delta y}{\Delta x}\)，反映宏观区间的平均快慢。</li>
        <li><b>瞬时变化率（导数）</b>：割线极限 \(f'(x_0)=\lim_{\Delta x\to0}\dfrac{\Delta y}{\Delta x}\)，是单点的切线斜率。</li>
        <li><b>运算核心</b>：必须先约去分母中的 \(\Delta x\)，绝不能直接代入 \(\Delta x=0\) 算 \(\frac00\)。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">切点辨析</span>
        <b style="color:#15803d;font-size:14px">「在点处」 vs 「过某点」</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>在点 \(P\) 处</b>：\(P(x_0, y_0)\) 是曲线本身的切点，斜率就是 \(f'(x_0)\)，一条确定。</li>
        <li><b>过点 \(P\)</b>：点 \(P\) 通常不在曲线上！必须先设切点 \((t, f(t))\)，代入方程反解 \(t\)。</li>
        <li><b>解的个数</b>：过曲线上某点的切线可能有多条（不仅是在该点处的切线，还可能相切于他处）。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 平均变化率、导数与几何意义主公式</h3>
  <p>导数是平均变化率在区间无限收缩时的极限，几何上严格对应切线的斜率：</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">
      割线斜率（平均变化率）：\(\color{#0284c7}{\dfrac{\Delta y}{\Delta x}} = \dfrac{f(x_0+\Delta x)-f(x_0)}{\Delta x}\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      切线斜率（导数定义）：\(\color{#16a34a}{f'(x_0)} = \lim_{\Delta x\to0}\dfrac{\Delta y}{\Delta x} = \color{#16a34a}{k_{\text{切}}}\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      切线方程（点斜式）：\(y - \color{#0284c7}{f(x_0)} = \color{#16a34a}{f'(x_0)}(x - \color{#0284c7}{x_0})\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>小球下落，\(t\) 秒内落下 \(s(t)=5t^2\)（米）。求 \([1,1+\Delta t]\) 上的平均速度，再看 \(t=1\) 这一刻的瞬时速度。</p>
    <p>\(\Delta s=5(1+\Delta t)^2-5\times1^2 = 10\Delta t+5(\Delta t)^2\)。</p>
    <p>平均速度 \(\dfrac{\Delta s}{\Delta t}=10+5\Delta t\)（米/秒）。</p>
    <p>当 \(\Delta t\to0\) 时，\(10+5\Delta t\to10\)，所以 \(t=1\) 时的瞬时速度为 \(10\) 米/秒。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：\(f(x)=x^2+1\) 在区间 \([1,3]\) 上的平均变化率是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(4\)</button>
      <button class="opt" data-v="B"><b>B</b>\(8\)</button>
      <button class="opt" data-v="C"><b>C</b>\(5\)</button>
      <button class="opt" data-v="D"><b>D</b>\(2\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(f(1)=2\)，\(f(3)=10\)，\(\dfrac{\Delta y}{\Delta x}=\dfrac{10-2}{3-1}=4\)。选 B 是只算了 \(\Delta y=8\)；选 C 是没减 \(f(1)\)；\(2\) 是 \(\Delta x\)。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 导数几何意义与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：求曲线的切线方程（辨清「在点处」与「过点」）</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          审视题目字眼：是「在点 \(P\) 处」还是「过点 \(P\)」；验证点 \(P\) 坐标是否在函数曲线上。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>定切点</b>：若「在点处」，切点即为 \(P(x_0, y_0)\)；若「过点」，必须设切点为 \((t, f(t))\)；<br>
          2. <b>求导数斜率</b>：计算导数得到切线斜率 \(k = f'(t)\)；<br>
          3. <b>点斜式反解</b>：代入 \(y - f(t) = f'(t)(x - t)\)，代入点 \(P\) 坐标解出 \(t\) 并写出所有切线。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          若点 \(P\) 不在曲线上，切勿直接以 \(f'(x_P)\) 当作切线斜率！过曲线外一点往往有两条甚至多条切线。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（按定义求导）</p>
    <p>按定义求 \(f(x)=x^2\) 在 \(x=2\) 处的导数。</p>
    <p>① \(\Delta y=(2+\Delta x)^2-2^2 = 4\Delta x+(\Delta x)^2\)。</p>
    <p>② \(\dfrac{\Delta y}{\Delta x}=4+\Delta x\)。约去分母中的 \(\Delta x\)。</p>
    <p>③ 当 \(\Delta x\to0\) 时，\(4+\Delta x\to4\)。故 \(f'(2)=4\)。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：用定义求 \(f(x)=x^2-3x\) 在 \(x=1\) 处的导数 \(f'(1)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(-1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(2\)</button>
      <button class="opt" data-v="C"><b>C</b>\(-2\)</button>
      <button class="opt" data-v="D"><b>D</b>不存在</button>
    </div>
    <div class="reveal">
      <p><b>A</b>。\(\Delta y=(1+\Delta x)^2-3(1+\Delta x)-(1-3)=-\Delta x+(\Delta x)^2\)，\(\dfrac{\Delta y}{\Delta x}=-1+\Delta x\to-1\)。</p>
      <p>选 B 是漏了 \(-3\Delta x\)；选 C 是把函数值 \(f(1)=-2\) 当导数；选 D 是直接代 \(\Delta x=0\) 看到 \(\frac00\)。</p>
    </div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 几何意义：切线的斜率与方程</h3>
  <p>在图上，割线 \(PQ\) 的极限位置是曲线在 \(P\) 处的<b>切线</b>。切线斜率 \(k=f'(x_0)\)，方程为 \(y-f(x_0)=f'(x_0)(x-x_0)\)。在切点附近一小段，曲线几乎和切线重合，这就是「以直代曲」。</p>

  <div class="card">
    <p class="small">例 3（求切线方程）</p>
    <p>求曲线 \(y=x^2\) 在点 \(P(2,4)\) 处的切线方程。</p>
    <p>\(P\) 在曲线上，是切点，切线斜率 \(k=f'(2)=4\)。点斜式：\(y-4=4(x-2)\)，即 \(y=4x-4\)。</p>
  </div>
  <div class="card predict" data-id="chk1" data-answer="C">
    <p>自己试试：曲线 \(y=f(x)\) 在点 \(P(1,2)\) 处的切线平行于直线 \(y=3x-1\)，则 \(f'(1)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(2\)</button>
      <button class="opt" data-v="C"><b>C</b>\(3\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-1\)</button>
    </div>
    <div class="reveal">
      <p><b>C</b>。平行直线斜率相等，切线斜率 \(k=3\)，故 \(f'(1)=3\)。选 B 是把纵坐标当导数；选 A 拿了横坐标；\(-1\) 是截距。</p>
    </div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：混淆「在点处」与「过点」</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：求过原点与 \(y=x^2+1\) 的切线，直接令 \(k=f'(0)=0\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：原点不在曲线上！必须设切点 \((t, t^2+1)\)，解得 \(t=\pm1\)，切线有 \(y=\pm2x\) 两条！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：代入 0 误判零除无意义</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：直接把 \(\Delta x=0\) 代入分母看到 \(\frac00\) 判不可导</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：\(\Delta x \ne 0\)！必须先代数约分化简出 \(4+\Delta x\)，再令其趋于 \(0\) 获得导数 \(4\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：切线等同于唯一公共点</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：认为切线绝不可穿过曲线，或只有一个交点必是切线</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：切线是割线极限位置！\(y=x^3\) 在原点切线为 \(y=0\)（穿过曲线）；竖直线 \(x=1\) 与抛物线相交一次但非切线。
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：过曲线外一点双切线 vs 拐点切线穿透</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-der-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：过原点向 \(y=x^2+1\) 引切线，对称产生两条切线 \(y=\pm2x\)；右图：\(y=x^3\) 在原点的切线 \(y=0\) 直接穿越拐点。
    </div>
  </div>

  <div class="key">平均变化率是割线斜率，瞬时变化率是它在 \(\Delta x\to0\) 时趋于的数，也就是导数，几何上是切线斜率。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>不可导的典型反例</b>：\(f(x)=|x|\) 在 \(x=0\) 处的左右变化率分别为 \(1\) 和 \(-1\)，左右极限不相等，故不可导（几何上为尖点）。</p>
    <p><b>以直代曲的现代意义</b>：在微小邻域内将复杂非线性曲线近似为直线切线，是微积分进行数值计算、物理建模和优化算法的根本基石。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 导数概念 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 割线逼近切线极限动态
    var ox = 60, oy = 180;
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    // Curve y = 0.005 x^2
    var d = "M " + ox + " " + oy;
    for (var x = 0; x <= 380; x += 10) {
      var y = oy - 0.001 * x * x;
      d += " L " + (ox + x) + " " + y;
    }
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#0284c7", "stroke-width": 2}));
    // Fixed point P(100, f(100))
    var px = ox + 100, py = oy - 0.001 * 100 * 100; // oy - 10
    svg.appendChild(el("circle", {cx: px, cy: py, r: 5, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: px - 18, y: py - 8, fill: "#0284c7", "font-size": 12, "font-weight": "bold"}, "P(x₀)"));

    // Tangent line at P (k = 0.2)
    svg.appendChild(el("line", {x1: px - 80, y1: py + 16, x2: px + 200, y2: py - 40, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: px + 170, y: py - 46, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "极限切线 (k = f'(x₀))"));

    // Secant Q1
    var q1x = ox + 260, q1y = oy - 0.001 * 260 * 260; // oy - 67.6
    svg.appendChild(el("circle", {cx: q1x, cy: q1y, r: 4, fill: "#94a3b8"}));
    svg.appendChild(el("line", {x1: px - 40, y1: py + (py-q1y)/(px-q1x)*40, x2: q1x + 40, y2: q1y - (py-q1y)/(px-q1x)*40, stroke: "#94a3b8", "stroke-width": 1.5, "stroke-dasharray": "3,3"}));
    svg.appendChild(el("text", {x: q1x + 8, y: q1y, fill: "#94a3b8", "font-size": 10}, "割线 Q₁ (Δx大)"));

    // Secant Q2
    var q2x = ox + 170, q2y = oy - 0.001 * 170 * 170;
    svg.appendChild(el("circle", {cx: q2x, cy: q2y, r: 4, fill: "#3b82f6"}));
    svg.appendChild(el("line", {x1: px - 40, y1: py + (py-q2y)/(px-q2x)*40, x2: q2x + 60, y2: q2y - (py-q2y)/(px-q2x)*60, stroke: "#3b82f6", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("text", {x: q2x + 8, y: q2y - 6, fill: "#3b82f6", "font-size": 10}, "割线 Q₂ (Δx小)"));

    // Motion arrow Q -> P
    svg.appendChild(el("path", {d: "M " + (q1x - 10) + " " + (q1y + 8) + " Q " + (q2x + 15) + " " + (q2y + 6) + " " + (px + 15) + " " + (py + 4), fill: "none", stroke: "#dc2626", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 230, y: 145, fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "Q 沿曲线滑向 P (Δx -> 0)"));
  }

  function drawTab1(svg) {
    // Tab 1: 局部以直代曲放大镜
    var cx = 270, cy = 110, r = 85;
    // Outer big circle lens
    svg.appendChild(el("circle", {cx: cx, cy: cy, r: r, fill: "#f8fafc", stroke: "#0284c7", "stroke-width": 3}));
    svg.appendChild(el("circle", {cx: cx, cy: cy, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: cx + 8, y: cy - 6, fill: "#0284c7", "font-size": 12, "font-weight": "bold"}, "切点 P"));

    // Curve inside lens
    svg.appendChild(el("path", {d: "M " + (cx - 70) + " " + (cy + 45) + " Q " + cx + " " + cy + " " + (cx + 70) + " " + (cy - 48), fill: "none", stroke: "#0284c7", "stroke-width": 3}));
    // Tangent line inside lens
    svg.appendChild(el("line", {x1: cx - 75, y1: cy + 50, x2: cx + 75, y2: cy - 50, stroke: "#16a34a", "stroke-width": 2, "stroke-dasharray": "4,3"}));

    // Labels
    svg.appendChild(el("text", {x: 80, y: 80, fill: "#0284c7", "font-size": 12, "font-weight": "bold"}, "蓝线：原非线性曲线 y=f(x)"));
    svg.appendChild(el("text", {x: 80, y: 140, fill: "#16a34a", "font-size": 12, "font-weight": "bold"}, "绿虚线：切线 y-y₀=k(x-x₀)"));
    svg.appendChild(el("rect", {x: 375, y: 85, width: 140, height: 48, rx: 6, fill: "#ecfdf5", stroke: "#10b981", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 445, y: 105, "text-anchor": "middle", fill: "#065f46", "font-size": 11, "font-weight": "bold"}, "极小微元局部"));
    svg.appendChild(el("text", {x: 445, y: 122, "text-anchor": "middle", fill: "#065f46", "font-size": 11, "font-weight": "bold"}, "曲线几乎就是直线！"));
  }

  function drawTab2(svg) {
    // Tab 2: 在点处 vs 过点
    // Left: 在点处
    svg.appendChild(el("text", {x: 135, y: 25, "text-anchor": "middle", fill: "#0369a1", "font-size": 13, "font-weight": "bold"}, "「在点 P 处的切线」"));
    svg.appendChild(el("path", {d: "M 40 160 Q 135 150 230 40", fill: "none", stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 140, cy: 110, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 152, y: 114, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "P 在曲线上 (切点)"));
    svg.appendChild(el("line", {x1: 65, y1: 170, x2: 215, y2: 50, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 135, y: 195, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "唯一切线：k = f'(x_P)"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 205, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: 过点 P
    svg.appendChild(el("text", {x: 405, y: 25, "text-anchor": "middle", fill: "#b91c1c", "font-size": 13, "font-weight": "bold"}, "「过点 P 的切线」"));
    svg.appendChild(el("path", {d: "M 320 80 Q 405 180 490 80", fill: "none", stroke: "#0284c7", "stroke-width": 2}));
    var extX = 405, extY = 195;
    svg.appendChild(el("circle", {cx: extX, cy: extY, r: 4, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: extX, y: extY + 16, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "P 在曲线外"));

    // Tangents from external P to curve
    svg.appendChild(el("circle", {cx: 350, cy: 115, r: 3, fill: "#16a34a"}));
    svg.appendChild(el("circle", {cx: 460, cy: 115, r: 3, fill: "#16a34a"}));
    svg.appendChild(el("line", {x1: extX, y1: extY, x2: 335, y2: 95, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: extX, y1: extY, x2: 475, y2: 95, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 405, y: 135, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "两条切线 (切点待解)"));
  }

  function renderFig() {
    var svg = document.getElementById("m-der-fig");
    var desc = document.getElementById("m-der-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 割线旋转逼近切线</b>：割线 PQ 斜率表示平均变化率，当 Q 沿曲线逼近 P（Δx -> 0）时，割线绕 P 旋转的最终极限姿态即为切线。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 局部以直代曲原理</b>：在切点 P 的极小微观邻域内，弯曲的非线性曲线与平直切线几乎完全重叠，这也是微积分线性化的核心思想。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 切线语义精准辨析</b>：「在点处」切线仅有 1 条，斜率直取导数；「过某点」该点可位于曲线外部，可能引出多条切线。";
    }
  }

  window.setMDerTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-der-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-der-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: external point tangents
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：过原点向 y=x²+1 切线误取 k=0"));
    svg.appendChild(el("path", {d: "M 45 40 Q 135 120 225 40", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 135, cy: 135, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 135, y: 147, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "原点 (0,0) 不在曲线上"));
    svg.appendChild(el("line", {x1: 135, y1: 135, x2: 75, y2: 45, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: 135, y1: 135, x2: 195, y2: 45, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 135, y: 80, "text-anchor": "middle", fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "正解：y = ±2x (两条切线)"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: inflection tangent crosses curve
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：认为切线不能穿过曲线"));
    svg.appendChild(el("path", {d: "M 320 120 Q 380 120 405 80 T 490 40", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    // Tangent at inflection
    svg.appendChild(el("line", {x1: 330, y1: 80, x2: 480, y2: 80, stroke: "#dc2626", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 405, cy: 80, r: 4, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 405, y: 70, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "y=x³ 原点切线 y=0 直接穿透曲线"));
    svg.appendChild(el("text", {x: 405, y: 135, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "切线是由极限定义的，穿透完全合法"));
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
