# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-4-1.html"

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
  <p class="small">要用到：函数的概念，「定义域里每个 \(x\) 对应唯一一个值」（<a href="b1-3-1.html">回看 3.1 函数的概念及其表示</a>）。</p>

  <div class="card">
    <p><b>数列、项</b>：按确定的顺序排成的一列数叫<b>数列</b>，其中每个数叫这个数列的<b>项</b>。</p>
    <p>例：\(1,\,4,\,9,\,16,\,25\) 是一个数列，第 1 项是 \(1\)，第 3 项是 \(9\)。</p>
  </div>

  <div class="card">
    <p><b>下标和 \(a_n\)</b>：第 \(n\) 项记作 \(a_n\)。下标 \(n\) 是<b>位置</b>，\(a_n\) 是这个位置上的<b>值</b>，两件事别混。</p>
    <p>例：数列 \(5,\,3,\,1,\,-1\) 里，\(a_2=3\)：下标是 \(2\)，值是 \(3\)；\(a_4=-1\)，下标 \(4\) 是正整数，值 \(-1\) 可以是负数。</p>
  </div>

  <div class="card">
    <p><b>有穷数列、无穷数列</b>：项数有限的叫有穷数列，有无限多项的叫无穷数列。</p>
    <p>例：一周 7 天每天的最高气温是有穷数列；正奇数 \(1,\,3,\,5,\,7,\,\dots\) 排下去是无穷数列。</p>
  </div>

  <div class="card">
    <p><b>前 \(n\) 项和 \(S_n\)</b>：从第 1 项加到第 \(n\) 项，\(S_n=a_1+a_2+\dots+a_n\)。</p>
    <p>例：数列 \(2,\,4,\,6,\,8\)：\(S_1=2\)，\(S_2=2+4=6\)，\(S_3=2+4+6=12\)，\(S_4=20\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>数列核心直觉：离散函数、递推链条与和差分解
      </div>
      <div style="display:flex;gap:6px" id="m-seq-tabs">
        <button class="btn btn-sm" onclick="setMSeqTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 离散点集</button>
        <button class="btn btn-sm" onclick="setMSeqTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 递推链条</button>
        <button class="btn btn-sm" onclick="setMSeqTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ Sn与an差分</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-seq-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-seq-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">本质对比</span>
        <b style="color:#0369a1;font-size:14px">数列 vs 集合</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>有序性</b>：数列看次序，\((1, 2, 3) \ne (3, 2, 1)\)；集合元素无序，\(\{1, 2, 3\} = \{3, 2, 1\}\)。</li>
        <li><b>可重复性</b>：数列项可重复（如常数列 \(2, 2, 2\dots\)）；集合元素互异，绝无重复。</li>
        <li><b>函数本质</b>：数列是以 \(\mathbf{N}^*\) 为定义域的<b>特殊离散函数</b>，图象是一串孤立的点。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">表述对比</span>
        <b style="color:#15803d;font-size:14px">通项公式 vs 递推公式</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>通项公式 \(a_n=f(n)\)</b>：一步到位，给定下标位置 \(n\) 即可直接计算该项的值。</li>
        <li><b>递推公式 \(a_{n+1}=g(a_n)\)</b>：步步累进，必须配齐初始项（如 \(a_1\)）方能确定数列。</li>
        <li><b>关联转化</b>：递推关系常通过累加、累乘或构造法转化为显式通项公式。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 数列是一种特殊的函数：通项公式</h3>
  <p>每个位置 \(n\) 对应唯一一个值 \(a_n\)，这正是函数：自变量是位置 \(n\)，定义域是正整数集 \(\mathbf N^*\)（无穷数列）或 \(\{1,2,\dots,m\}\)（有穷数列）。如果 \(a_n\) 和 \(n\) 的关系能写成一个式子 \(a_n=f(n)\)，这个式子叫数列的<b>通项公式</b>。</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">离散函数对应：\(a_n = f(n)\quad (n \in \mathbf{N}^*)\)</div>
    <div style="margin-top:6px;font-size:15px">
      递推标准型：\(\color{#0284c7}{a_1 = c},\quad \color{#16a34a}{a_{n+1} = g(a_n)}\)（初始基底 + 步进规则）
    </div>
    <div style="margin-top:6px;font-size:15px">
      和差核心公式：\(a_n = \begin{cases} \color{#0284c7}{S_1}, & n = 1 \\ \color{#16a34a}{S_n - S_{n-1}}, & n \ge 2 \end{cases}\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>数列的通项公式是 \(a_n=n^2-3n\)。（1）写出前 4 项；（2）\(18\) 是不是这个数列的项？\(5\) 呢？</p>
    <p>（1）依次代 \(n=1,2,3,4\)：\(a_1=-2\)，\(a_2=-2\)，\(a_3=0\)，\(a_4=4\)。前两项相等，数列项完全允许重复。</p>
    <p>（2）设 \(n^2-3n=18\)，得 \((n-6)(n+3)=0\)，\(n=6\) 或 \(n=-3\)。下标必为正整数，舍去 \(-3\)，故 \(18\) 是第 \(6\) 项。<br>
    设 \(n^2-3n=5\)，得 \(n=\dfrac{3\pm\sqrt{29}}{2} \notin \mathbf N^*\)，故 \(5\) 不是这个数列的项。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：数列 \(a_n=3n+1\) 中，\(25\) 是第几项？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>第 \(8\) 项</button>
      <button class="opt" data-v="B"><b>B</b>第 \(76\) 项</button>
      <button class="opt" data-v="C"><b>C</b>第 \(9\) 项</button>
      <button class="opt" data-v="D"><b>D</b>不是它的项</button>
    </div>
    <div class="reveal"><p><b>A</b>。解 \(3n+1=25\) 得 \(n=8\)，是正整数。选 B 的同学把 \(25\) 当成下标代进去，算出的 \(76\) 是 \(a_{25}\)：「第几项」问的是下标，要解方程，不是代入。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 递推公式与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：由前 n 项和 \(S_n\) 求解数列通项公式</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          题目给出前 \(n\) 项和 \(S_n=f(n)\) 的表达式，要求数列通项公式 \(a_n\)。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>基底求首项</b>：代入 \(n=1\)，单独求出 \(a_1 = S_1\)；<br>
          2. <b>差分求通项</b>：当 \(n \ge 2\) 时，运用 \(a_n = S_n - S_{n-1}\) 展开化简；<br>
          3. <b>回验合并</b>：检验 \(n \ge 2\) 算出的化简式在 \(n=1\) 处的值是否恰好等于 \(a_1\)。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          若吻合方可合写；若不吻合（如 \(S_n=n^2+1\)），必须写成分段形式，严禁直接照抄化简式！
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（递推规律与猜想）</p>
    <p>\(a_1=1\)，\(a_{n+1}=2a_n+1\)。写出前 5 项并猜想通项公式。</p>
    <p>\(a_2=2\times1+1=3\)，\(a_3=2\times3+1=7\)，\(a_4=2\times7+1=15\)，\(a_5=2\times15+1=31\)。前 5 项：\(1,\,3,\,7,\,15,\,31\)。</p>
    <p>观察各项加 1 为 \(2,4,8,16,32\)，猜想 \(a_n=2^n-1\)。要说明对所有 \(n\) 均成立，需通过配凑法或数学归纳法证明。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\(a_1=2\)，\(a_{n+1}=a_n+3\)，\(a_4\) 是多少？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(11\)</button>
      <button class="opt" data-v="B"><b>B</b>\(14\)</button>
      <button class="opt" data-v="C"><b>C</b>\(9\)</button>
      <button class="opt" data-v="D"><b>D</b>\(12\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(a_2=5\)，\(a_3=8\)，\(a_4=11\)：从 \(a_1\) 到 \(a_4\) 只推 \(3\) 步。选 B 的同学多推了一步，那是 \(a_5\)；选 D 的同学算成了 \(4\times3\)。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 由前 \(n\) 项和求通项</h3>
  <p>\(S_n\) 比 \(S_{n-1}\) 正好多加了一个 \(a_n\)，所以 \(n\ge2\) 时 \(a_n=S_n-S_{n-1}\)。\(n=1\) 时 \(S_0\) 没有定义，只能单独使用 \(a_1=S_1\)。</p>
  <div class="card">
    <p class="small">例 3（由和求通项标准写法）</p>
    <p>数列的前 \(n\) 项和 \(S_n=n^2+2n\)，求通项公式。</p>
    <p>\(n=1\) 时：\(a_1=S_1=1+2=3\)。</p>
    <p>\(n\ge2\) 时：\(a_n=S_n-S_{n-1}=(n^2+2n)-[(n-1)^2+2(n-1)]=2n+1\)。</p>
    <p>检验：将 \(n=1\) 代入 \(2n+1\) 得 \(3\)，恰与 \(a_1\) 相等，故可合写为 \(a_n=2n+1\)。<b>这一步检验必不可少</b>。</p>
  </div>
  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：\(S_n=n^2\)，\(a_3\) 是多少？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(5\)</button>
      <button class="opt" data-v="B"><b>B</b>\(9\)</button>
      <button class="opt" data-v="C"><b>C</b>\(3\)</button>
      <button class="opt" data-v="D"><b>D</b>\(4\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(a_3=S_3-S_2=9-4=5\)。选 B 的同学把 \(S_3\)（前三项的和）当成了 \(a_3\)（第三项本身）。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：Sn求通项遗漏n=1检验</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(S_n=n^2+1\) 直接得出 \(a_n = 2n-1\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：\(a_1=S_1=2\)；而 \(n\ge2\) 时化简式为 \(2(1)-1=1\ne2\)，必须写成分段函数！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：数列最值误求连续顶点</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(a_n=-n^2+5n\) 误认为在 \(n=2.5\) 取最大值 \(6.25\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：下标必须是正整数！比较离顶点最近的 \(a_2=6\) 与 \(a_3=6\)，最大值为 \(6\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：项的值与位置下标混淆</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：问 \(a_n=3n+1\) 中 25 是第几项，代入 \(n=25\) 算 76</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：「第几项」问的是位置 \(n\)，应令 \(3n+1=25\) 解方程得第 \(8\) 项。
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：离散取整限制 vs Sn 分段首项孤立</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-seq-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：\(a_n=-n^2+5n\) 顶点 \(n=2.5\) 无定义，最大项在整数点 \(n=2,3\)；右图：\(S_n=n^2+1\) 的首项 \(a_1=2\) 孤立脱离直线 \(2n-1\)。
    </div>
  </div>

  <div class="key">数列是定义在正整数上的函数：看顺序、取整数下标、点是分开的；由 \(S_n\) 求 \(a_n\) 先单独算 \(a_1\)；递推要有初始条件；猜出的通项要验证或证明。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>数列的增减</b>：若从第 2 项起每一项都比前一项大（\(a_{n+1}&gt;a_n\)），叫<b>递增数列</b>；每一项都比前一项小，叫<b>递减数列</b>；各项相等叫常数列；大小交替叫摆动数列（如 \(a_n=(-1)^n\)）。</p>
    <p><b>用差判断增减</b>：\(a_n=\dfrac{n}{n+1}\)，\(a_{n+1}-a_n=\dfrac{n+1}{n+2}-\dfrac{n}{n+1}=\dfrac{1}{(n+1)(n+2)}&gt;0\)，故为递增数列。</p>
    <p><b>找最大项的判定</b>：第 \(k\) 项最大，需满足 \(a_k\ge a_{k-1}\) 且 \(a_k\ge a_{k+1}\)，解出整数 \(k\)。</p>
    <p><b>把猜想变成严格结论</b>：例 2 里，由 \(a_{n+1}=2a_n+1\) 两边加 1 得 \(a_{n+1}+1=2(a_n+1)\)，从而化归为等比数列证明（严谨证明参看 4.4 数学归纳法）。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 数列概念 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 离散点集 vs 连续曲线 (a_n = 2n - 1)
    var ox = 60, oy = 180;
    // Axes
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 470, y: oy - 6, fill: "#94a3b8", "font-size": 12}, "n"));
    svg.appendChild(el("text", {x: ox + 8, y: 30, fill: "#94a3b8", "font-size": 12}, "a_n"));
    svg.appendChild(el("text", {x: ox - 14, y: oy + 16, fill: "#94a3b8", "font-size": 12}, "O"));

    // Continuous phantom curve y = 2x - 1 (dashed)
    svg.appendChild(el("line", {x1: ox, y1: oy + 15, x2: ox + 380, y2: oy - 150, stroke: "#cbd5e1", "stroke-width": 1.5, "stroke-dasharray": "4,4"}));
    svg.appendChild(el("text", {x: ox + 320, y: oy - 135, fill: "#94a3b8", "font-size": 11}, "连续曲线 y = 2x - 1 (不存在)"));

    // Discrete points n = 1, 2, 3, 4, 5
    var pts = [
      {n: 1, v: 1, y: oy - 25},
      {n: 2, v: 3, y: oy - 55},
      {n: 3, v: 5, y: oy - 85},
      {n: 4, v: 7, y: oy - 115},
      {n: 5, v: 9, y: oy - 145}
    ];
    pts.forEach(function(p){
      var x = ox + p.n * 65;
      // Vertical dropped dashed line
      svg.appendChild(el("line", {x1: x, y1: oy, x2: x, y2: p.y, stroke: "#93c5fd", "stroke-width": 1, "stroke-dasharray": "2,2"}));
      // Axis label
      svg.appendChild(el("text", {x: x, y: oy + 16, "text-anchor": "middle", fill: "#475569", "font-size": 11, "font-weight": "bold"}, "n=" + p.n));
      // Discrete point
      svg.appendChild(el("circle", {cx: x, cy: p.y, r: 5, fill: "#0284c7"}));
      // Value badge
      svg.appendChild(el("text", {x: x, y: p.y - 10, "text-anchor": "middle", fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "a" + p.n + "=" + p.v));
    });
  }

  function drawTab1(svg) {
    // Tab 1: 递推链条 a_1=1 -> x2+1 -> a_2=3 -> ...
    var nodes = [
      {idx: 1, val: 1, x: 80},
      {idx: 2, val: 3, x: 175},
      {idx: 3, val: 7, x: 270},
      {idx: 4, val: 15, x: 365},
      {idx: 5, val: 31, x: 460}
    ];
    var cy = 100;
    // Connecting arrows with operation labels
    for (var i = 0; i < nodes.length - 1; i++) {
      var n1 = nodes[i], n2 = nodes[i+1];
      svg.appendChild(el("line", {x1: n1.x + 30, y1: cy, x2: n2.x - 30, y2: cy, stroke: "#10b981", "stroke-width": 2}));
      // Arrowhead
      svg.appendChild(el("polygon", {points: (n2.x - 30) + "," + cy + " " + (n2.x - 38) + "," + (cy - 4) + " " + (n2.x - 38) + "," + (cy + 4), fill: "#10b981"}));
      // Formula label
      svg.appendChild(el("text", {x: (n1.x + n2.x)/2, y: cy - 10, "text-anchor": "middle", fill: "#059669", "font-size": 11, "font-weight": "bold"}, "×2 + 1"));
    }
    // Nodes
    nodes.forEach(function(n){
      svg.appendChild(el("rect", {x: n.x - 28, y: cy - 26, width: 56, height: 52, rx: 8, fill: n.idx === 1 ? "#eff6ff" : "#f0fdf4", stroke: n.idx === 1 ? "#0284c7" : "#16a34a", "stroke-width": 2}));
      svg.appendChild(el("text", {x: n.x, y: cy - 6, "text-anchor": "middle", fill: "#64748b", "font-size": 10}, "第 " + n.idx + " 项"));
      svg.appendChild(el("text", {x: n.x, y: cy + 14, "text-anchor": "middle", fill: n.idx === 1 ? "#0284c7" : "#16a34a", "font-size": 14, "font-weight": "bold"}, "a" + n.idx + "=" + n.val));
    });
    // Bottom badge
    svg.appendChild(el("rect", {x: 100, y: 155, width: 340, height: 32, rx: 6, fill: "#f8fafc", stroke: "#e2e8f0", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 175, "text-anchor": "middle", fill: "#334155", "font-size": 12, "font-weight": "bold"}, "递推双要素：初始项 a₁ 是起点，关系式 a_{n+1}=g(a_n) 是步规"));
  }

  function drawTab2(svg) {
    // Tab 2: S_n 与 a_n 差分关系
    var y1 = 60, y2 = 120;
    // S_n bar
    svg.appendChild(el("text", {x: 50, y: y1 + 18, fill: "#0284c7", "font-size": 13, "font-weight": "bold"}, "S_n:"));
    var terms = [
      {t: "a₁", w: 55, fill: "#e0f2fe", col: "#0369a1"},
      {t: "a₂", w: 55, fill: "#e0f2fe", col: "#0369a1"},
      {t: "a₃", w: 55, fill: "#e0f2fe", col: "#0369a1"},
      {t: "…", w: 45, fill: "#f1f5f9", col: "#64748b"},
      {t: "a_{n-1}", w: 75, fill: "#e0f2fe", col: "#0369a1"},
      {t: "a_n", w: 85, fill: "#dcfce7", col: "#15803d", stroke: "#16a34a"}
    ];
    var curX = 90;
    terms.forEach(function(item){
      svg.appendChild(el("rect", {x: curX, y: y1, width: item.w, height: 32, rx: 4, fill: item.fill, stroke: item.stroke || "#bae6fd", "stroke-width": item.stroke ? 2 : 1}));
      svg.appendChild(el("text", {x: curX + item.w/2, y: y1 + 20, "text-anchor": "middle", fill: item.col, "font-size": 12, "font-weight": "bold"}, item.t));
      curX += item.w + 6;
    });

    // S_{n-1} bar
    svg.appendChild(el("text", {x: 35, y: y2 + 18, fill: "#64748b", "font-size": 13, "font-weight": "bold"}, "S_{n-1}:"));
    var curX2 = 90;
    for (var i = 0; i < terms.length - 1; i++) {
      var item2 = terms[i];
      svg.appendChild(el("rect", {x: curX2, y: y2, width: item2.w, height: 32, rx: 4, fill: "#f1f5f9", stroke: "#cbd5e1", "stroke-width": 1}));
      svg.appendChild(el("text", {x: curX2 + item2.w/2, y: y2 + 20, "text-anchor": "middle", fill: "#64748b", "font-size": 12}, item2.t));
      curX2 += item2.w + 6;
    }

    // Bracket & subtraction arrow pointing to a_n
    var diffX = curX2 + 42;
    svg.appendChild(el("line", {x1: diffX, y1: y1 + 38, x2: diffX, y2: y2 + 16, stroke: "#16a34a", "stroke-width": 2, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("text", {x: diffX, y: 175, "text-anchor": "middle", fill: "#15803d", "font-size": 13, "font-weight": "bold"}, "作差差出最后一项：a_n = S_n - S_{n-1} (n ≥ 2)"));
  }

  function renderFig() {
    var svg = document.getElementById("m-seq-fig");
    var desc = document.getElementById("m-seq-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 离散点集 vs 连续函数</b>：数列本质是以正整数集为定义域的特殊函数，坐标图象是彼此孤立的散点，绝不能连成连续曲线。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 递推链条的双要素</b>：首项 a₁ 确定起点基底，递推式给出前项推后项的通行规则，两者缺一不可。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 和与项的差分分离</b>：S_n 比 S_{n-1} 多且仅多出第 n 项本身，因此 n ≥ 2 时 a_n = S_n - S_{n-1}，首项 a₁ = S₁ 必须单独算。";
    }
  }

  window.setMSeqTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-seq-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-seq-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: discrete maximum points
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区：求顶点 n=2.5 得 6.25 (无定义)"));
    svg.appendChild(el("line", {x1: 25, y1: 120, x2: 245, y2: 120, stroke: "#cbd5e1", "stroke-width": 1})); // x-axis
    // Parabola curve dashed
    svg.appendChild(el("path", {d: "M 35 110 Q 135 25 235 110", fill: "none", stroke: "#cbd5e1", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    // Vertex
    svg.appendChild(el("circle", {cx: 135, cy: 38, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 135, y: 32, "text-anchor": "middle", fill: "#dc2626", "font-size": 10}, "顶点(2.5, 6.25) ❌ 无此项"));
    // Real points n=2, n=3
    svg.appendChild(el("circle", {cx: 105, cy: 45, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 105, y: 62, "text-anchor": "middle", fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "a₂=6 ✅"));
    svg.appendChild(el("circle", {cx: 165, cy: 45, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 165, y: 62, "text-anchor": "middle", fill: "#16a34a", "font-size": 10, "font-weight": "bold"}, "a₃=6 ✅"));
    svg.appendChild(el("text", {x: 135, y: 140, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "下标只能是正整数，最大项为 6"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: a_1=2 isolated from line 2n-1
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区：S_n=n²+1 算出的 a_n=2n-1 强行合写"));
    svg.appendChild(el("line", {x1: 295, y1: 120, x2: 515, y2: 120, stroke: "#cbd5e1", "stroke-width": 1}));
    // Line 2n - 1
    svg.appendChild(el("line", {x1: 330, y1: 105, x2: 490, y2: 40, stroke: "#94a3b8", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    // Point at n=1 for line would be 1
    svg.appendChild(el("circle", {cx: 330, cy: 105, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 350, y: 110, fill: "#dc2626", "font-size": 10}, "代入n=1得 1 ❌"));
    // Real a_1 = 2
    svg.appendChild(el("circle", {cx: 330, cy: 80, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 345, y: 80, fill: "#0284c7", "font-size": 10, "font-weight": "bold"}, "真实 a₁=S₁=2 ✅ (脱节孤立)"));
    svg.appendChild(el("text", {x: 405, y: 140, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "首项与公式脱节，必须写成分段式"));
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
