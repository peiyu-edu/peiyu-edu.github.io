# upgrade_e3_6_2.py
import re
import os

filepath = 'highSchool/site/lessons/e3-6-2.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'chk1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：6.1 分类加法与分步乘法（<a href="e3-6-1.html">回看 6.1</a>），排列与组合是分步乘法在「选取与排序」问题上的系统化公式。</p>

  <div class="card">
    <p><b>排列（有序安排）</b>：从 \(n\) 个不同元素中取出 \(m\) 个（\(m \le n\)），<b>按照一定的顺序排成一列</b>。元素相同但次序不同，就是两种不同的排列。</p>
    <p>例：选班长和副班长，甲当班长乙当副班长，与乙当班长甲当副班长是两码事，这是排列。</p>
  </div>

  <div class="card">
    <p><b>组合（无序挑选）</b>：从 \(n\) 个不同元素中取出 \(m\) 个（\(m \le n\)），<b>不管先后顺序，合成一组</b>。只要取出的元素完全相同，不管谁先谁后都是同一种组合。</p>
    <p>例：选 2 名代表去开会，选出甲和乙，不管先叫谁的名字，代表团成员完全一样，这是组合。</p>
  </div>

  <div class="card">
    <p><b>交换检验法</b>：判定排列与组合的黄金法则。取出元素后，<b>将其中任意两个元素交换次序</b>，问自己：「事情的结果发生改变了吗？」</p>
    <p>• 改变了 \(\Longrightarrow\) <b>排列</b>（如站队、车票、排座位、选职位）；<br>
    • 没有改变 \(\Longrightarrow\) <b>组合</b>（如握手、组队、选代表、连线段）。</p>
  </div>

  <div class="card">
    <p><b>阶乘 \(n!\)</b>：正整数 \(1\) 到 \(n\) 的连乘积，规定 \(0! = 1\)。全排列数即为 \(A_n^n = n!\)。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-perm">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">排列组合直觉微图解：交换检验、捆绑插空模型与组合对称递推</span>
      <div class="micro-tabs" id="m-perm-tabs">
        <button class="micro-tab active" data-tab="1">① 交换检验：排列 vs 组合</button>
        <button class="micro-tab" data-tab="2">② 相邻捆绑与不相邻插空</button>
        <button class="micro-tab" data-tab="3">③ 组合数两大性质几何直觉</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-perm-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-perm-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">排列数 \(A_n^m\)（有序）</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">次序敏感</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>公式</b>：\(A_n^m = n(n-1)\cdots(n-m+1) = \dfrac{n!}{(n-m)!}\)</p>
      <p class="small" style="margin:0 0 4px 0;"><b>本质</b>：从 \(n\) 个元素里挑出 \(m\) 个排进 \(m\) 个带编号的槽位。</p>
      <p class="small" style="margin:0;"><b>检验</b>：交换槽位元素，方案改变（\((A, B) \ne (B, A)\)）。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">组合数 \(C_n^m\)（无序）</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">消重折叠</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>公式</b>：\(C_n^m = \dfrac{A_n^m}{m!} = \dfrac{n!}{m!(n-m)!}\)</p>
      <p class="small" style="margin:0 0 4px 0;"><b>本质</b>：不管内部顺序，把内部全排列的 \(m!\) 种重复方案折叠为 1 种。</p>
      <p class="small" style="margin:0;"><b>检验</b>：交换两元素，集合未变（\(\{A, B\} = \{B, A\}\)）。</p>
    </div>
  </div>

  <h3>2. 排列组合核心公式与性质</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">核心公式与消重联系：</p>
    <p style="margin:0 0 6px 0;">排列数：\(A_n^m = \color{#1976d2}{n(n-1)\cdots(n-m+1)} = \color{#1976d2}{\dfrac{n!}{(n-m)!}}\)</p>
    <p style="margin:0 0 8px 0;">组合数：\(C_n^m = \color{#2e7d32}{\dfrac{A_n^m}{m!}} = \color{#2e7d32}{\dfrac{n!}{m!(n-m)!}}\quad (\color{#2e7d32}{\text{除以 } m! \text{ 消除内部乱序}})\)</p>
    <p style="margin:0 0 6px 0;"><b>两大组合性质</b>：</p>
    <p style="margin:0 0 4px 0;">① 对称性：\(C_n^m = C_n^{n-m}\quad (\text{选 } m \text{ 个留下等价于选 } n-m \text{ 个淘汰})\)</p>
    <p style="margin:0;">② 递推性：\(C_{n+1}^m = C_n^m + C_n^{m-1}\quad (\text{含特异元素分类：不含它 } C_n^m + \text{含它 } C_n^{m-1})\)</p>
  </div>

  <div class="card predict" data-id="chk1" data-answer="B">
    <p><b>自检</b>：判断下列两个情境属于排列还是组合？<br>
    情境 1：10 个人见面，每两个人之间握一次手，共握手多少次？<br>
    情境 2：一条铁路线路上有 10 个车站，铁路局需要准备多少种不同的硬座火车票（区分起点与终点）？</p>
    <div class="opts cols">
      <button class="opt" data-v="A">情境 1 是排列；情境 2 是组合</button>
      <button class="opt" data-v="B">情境 1 是组合；情境 2 是排列</button>
      <button class="opt" data-v="C">两个情境全都是排列</button>
      <button class="opt" data-v="D">两个情境全都是组合</button>
    </div>
    <div class="reveal">
      <p><b>B</b>。情境 1 中，甲与乙握手就是乙与甲握手，交换后没变，是组合（共 \(C_{10}^2 = 45\) 次）；情境 2 中，「甲站到乙站」和「乙站到甲站」是两种票，交换后变了，是排列（共 \(A_{10}^2 = 90\) 种）。常见错：看到「两个两个」就都当组合，忘了做交换检验。</p>
    </div>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：用 5 种不同颜色给一面旗上从左到右的 3 条竖条涂色，每条一种颜色，颜色互不相同。有几种涂法？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(125\)</button>
      <button class="opt" data-v="B"><b>B</b>\(60\)</button>
      <button class="opt" data-v="C"><b>C</b>\(10\)</button>
      <button class="opt" data-v="D"><b>D</b>\(15\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。左、中、右三条位置不同，换颜色就是另一面旗，是排列：\(A_5^3=5\times4\times3=60\)。选 A 是 \(5^3\)，允许了颜色重复，题目说互不相同；选 C 是 \(C_5^3\)，只选了颜色没排位置；选 D 是把 \(5\times3\) 当成了排列数。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="C">
    <p>自己试试：\(C_{20}^{18}\) 等于？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(380\)</button>
      <button class="opt" data-v="B"><b>B</b>\(20\)</button>
      <button class="opt" data-v="C"><b>C</b>\(190\)</button>
      <button class="opt" data-v="D"><b>D</b>\(360\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。\(C_{20}^{18}=C_{20}^{2}=\dfrac{20\times19}{2\times1}=190\)。选 A 是只算了 \(20\times19\)，忘了除以 \(2!\)（那是 \(A_{20}^2\)）；选 B 是把 \(C_{20}^{18}\) 当成了 \(C_{20}^{1}\)。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：甲、乙、丙、丁、戊 5 人排成一排照相，要求<b>甲、乙两人必须相邻</b>，且<b>丙、丁两人不能相邻</b>。一共有多少种不同的排法？</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">题目包含双重限制：相邻（捆绑法）+ 不相邻（插空法）。破题次序铁律：<b>先绑后插！先把相邻元素捆绑成一个大元，与其余无限制元素一起排好，再用产生的空位去插入不相邻元素</b>。</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步分步套用模型</b>：
        <div class="small" style="margin-top:4px;">
          • <b>第 1 步（捆绑并内排）</b>：将甲、乙捆成一个大元素 \(M = (甲乙)\)，甲乙内部有 \(A_2^2 = 2\) 种排法；<br>
          • <b>第 2 步（排基准元素）</b>：当前基准元素有大元 \(M\) 和无限制者戊，共 2 个元素排成一列，有 \(A_2^2 = 2\) 种排法；<br>
          • <b>第 3 步（产生空位插空）</b>：2 个基准元素排好后，两侧加中间共产生 \(2 + 1 = 3\) 个空位（即 \(\_ \text{元}_1 \_ \text{元}_2 \_\)）。将丙、丁两人插入这 3 个空位中，排法有 \(A_3^2 = 3 \times 2 = 6\) 种。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步工序连乘与防坑核查</b>：
        <span class="small">由分步乘法原理，总排法数为各步相乘：<br>
        $$N = A_2^2(\text{甲乙内部}) \times A_2^2(\text{基准排列}) \times A_3^2(\text{丙丁插空}) = 2 \times 2 \times 6 = 24\text{ 种}$$
        防坑：切勿先排丙丁插空，因为甲乙是捆绑大元，只占 1 个空位；若先插空容易将甲乙拆散掉入不同槽位。</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：甲、乙、丙、丁、戊 5 人排成一排，甲既不站排头也不站排尾。有几种排法？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(72\)</button>
      <button class="opt" data-v="B"><b>B</b>\(96\)</button>
      <button class="opt" data-v="C"><b>C</b>\(48\)</button>
      <button class="opt" data-v="D"><b>D</b>\(120\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。甲是特殊元素，先排：中间 3 个位置任选一个，3 种；其余 4 人排剩下 4 个位置，\(4!=24\)。共 \(3\times24=72\)。也可以从反面算：\(120-2\times24=72\)。选 B 是只去掉了「甲站排头」的 24 种，忘了排尾；选 D 是没管限制。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：均匀无序分组未消除「组的次序」重复计数</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：将 6 本不同书平均分成 3 堆，每堆 2 本，写成 \(C_6^2 C_4^2 C_2^2 = 15 \times 6 \times 1 = 90\) 种。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：3 堆书没有顺序、没有标签（如第一堆、第二堆），步步选出时人为赋予了堆的次序。必须<b>除以 \(3! = 6\) 消除堆的全排列</b>：\(\dfrac{C_6^2 C_4^2 C_2^2}{3!} = \dfrac{90}{6} = 15\) 种！只有分配给甲、乙、丙 3 个人（有主人）时才不除以 \(3!\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：捆绑法漏乘「内部全排列」</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：3 名男生 2 名女生排队，女生必须相邻，将女生捆绑成 1 个大元，直接算 \(A_4^4 = 24\) 种。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：捆绑法必须<b>先外排再内排</b>（或先内排再外排）！2 名女生在捆绑包内部自身有 \(A_2^2 = 2\) 种次序（左女1右女2 vs 左女2右女1），正确答案是 \(A_4^4 \times A_2^2 = 24 \times 2 = 48\) 种。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：插空法空位数数错（\(k\) 个元素产生几个空位？）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：先排好 3 个男生，认为只有中间 2 个空位，算成 \(A_2^2\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：\(k\) 个元素排成一条直线，产生的空位包含<b>两头端点和所有间隔</b>，共有 \(k+1\) 个空位！3 个男生排好后产生 \(3+1=4\) 个空位，插 2 名女生应为 \(A_4^2 = 12\) 种。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：6 本书平均分成 3 堆的均匀分组消重（除以 3!）直觉示意</div>
    <svg class="micro-fig" id="m-perm-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      无名额分组：同一种分法在抽取过程中会有 \(3! = 6\) 种产生次序，必须除以 \(3!\) 消去人为虚增的次序。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-6-2
script_code = r'''
  // === e3-6-2 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-perm-fig");
    var desc = document.getElementById("m-perm-desc");
    var trapFig = document.getElementById("m-perm-trap-fig");
    var tabs = document.querySelectorAll("#m-perm-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 交换检验法 排列 (有序) vs 组合 (无序)
      // Left: 排列 (选甲当班长，乙当副班长)
      fig.appendChild(el("rect", {x: 30, y: 35, width: 260, height: 135, rx: 8, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 160, y: 58, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#1976d2"}, "排列（有序安排，位置敏感）"));

      // Slot 1 & 2
      fig.appendChild(el("rect", {x: 50, y: 75, width: 95, height: 35, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 97, y: 97, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "班长：甲"));

      fig.appendChild(el("rect", {x: 175, y: 75, width: 95, height: 35, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 222, y: 97, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "副班长：乙"));

      fig.appendChild(el("text", {x: 160, y: 135, "text-anchor": "middle", "font-size": "11", fill: "#ef4444"}, "⇄ 交换后：班长乙、副班长甲（不同方案！）"));
      fig.appendChild(el("text", {x: 160, y: 155, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "A₄² = 4 × 3 = 12 种"));

      // Right: 组合 (选甲、乙为代表)
      fig.appendChild(el("rect", {x: 330, y: 35, width: 260, height: 135, rx: 8, fill: "var(--card)", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 460, y: 58, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2e7d32"}, "组合（无序挑选，装入同一袋）"));

      fig.appendChild(el("rect", {x: 370, y: 75, width: 180, height: 35, rx: 18, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 460, y: 97, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "{ 代表甲, 代表乙 }"));

      fig.appendChild(el("text", {x: 460, y: 135, "text-anchor": "middle", "font-size": "11", fill: "#10b981"}, "⇄ 交换后：{ 乙, 甲 }（同一组代表，不变！）"));
      fig.appendChild(el("text", {x: 460, y: 155, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "C₄² = A₄² / 2! = 12 / 2 = 6 种"));

      fig.appendChild(el("text", {x: 310, y: 200, "text-anchor": "middle", "font-size": "12.5", "font-weight": "700", fill: "var(--fg)"}, "判定铁律：取出两元素交换位置，方案改变是排列，方案不变是组合"));
      desc.innerHTML = "<b>① 交换检验法直觉</b>：从 4 人中挑 2 人。左边是有序职位（班长、副班长），交换甲乙次序结果发生实质改变，是排列 \(A_4^2 = 12\)；右边是无序代表团，交换两人名字集合完全相同，内部排列次序被消重折叠，是组合 \(C_4^2 = A_4^2 / 2! = 6\)。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 捆绑法 (相邻) 与插空法 (不相邻)
      fig.appendChild(el("text", {x: 310, y: 25, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "相邻问题用「捆绑法」，不相邻问题用「插空法」"));

      // Bundled element: [甲乙]
      fig.appendChild(el("rect", {x: 60, y: 55, width: 140, height: 50, rx: 8, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2", "stroke-dasharray": "4 2"}));
      fig.appendChild(el("text", {x: 130, y: 80, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "捆绑大元 M = (甲, 乙)"));
      fig.appendChild(el("text", {x: 130, y: 96, "text-anchor": "middle", "font-size": "10", fill: "#1976d2"}, "内部全排列 A₂² = 2 种"));

      // Element 戊
      fig.appendChild(el("rect", {x: 230, y: 55, width: 70, height: 50, rx: 8, fill: "#f3f4f6", stroke: "#6b7280", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 265, y: 85, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "基准戊"));

      // Slots for insertion
      var slotX = [30, 210, 320];
      slotX.forEach(function(x, idx) {
        fig.appendChild(el("rect", {x: x, y: 130, width: 32, height: 26, rx: 4, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: x + 16, y: 147, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#d97706"}, "空" + (idx+1)));
        fig.appendChild(el("line", {x1: x + 16, y1: 125, x2: x + 16, y2: 110, stroke: "#f59e0b", "stroke-width": "1.2", "marker-end": "url(#arrow)"}));
      });

      fig.appendChild(el("text", {x: 460, y: 80, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#10b981"}, "第 1 步：甲乙捆绑 A₂² = 2"));
      fig.appendChild(el("text", {x: 460, y: 105, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "第 2 步：排基准大元 A₂² = 2"));
      fig.appendChild(el("text", {x: 460, y: 130, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#f59e0b"}, "第 3 步：丙丁插 3 空 A₃² = 6"));
      fig.appendChild(el("text", {x: 460, y: 160, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#ef4444"}, "连乘总数：2 × 2 × 6 = 24 种"));

      fig.appendChild(el("text", {x: 310, y: 200, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "先捆绑大元内排，再排基准元素，最后在产生的 (k+1) 个空位中插入不相邻元素"));
      desc.innerHTML = "<b>② 捆绑与插空经典模型</b>：甲乙必须相邻 $\\to$ 捆成大元，内部自排 $A_2^2=2$ 种；与元素戊排好共 $A_2^2=2$ 种；产生的 3 个空位插入丙丁（不相邻）有 $A_3^2=6$ 种。分步连乘得 $2 \\times 2 \\times 6 = 24$ 种。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 组合数两大性质几何直觉
      // Left: 对称性 C_n^m = C_n^{n-m}
      fig.appendChild(el("rect", {x: 30, y: 40, width: 260, height: 130, rx: 8, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 160, y: 65, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#1976d2"}, "性质 1：对称性 Cₙᵐ = Cₙⁿ⁻ᵐ"));
      fig.appendChild(el("text", {x: 160, y: 92, "text-anchor": "middle", "font-size": "11", fill: "var(--fg)"}, "从 10 个人中选 2 个人去扫地"));
      fig.appendChild(el("text", {x: 160, y: 112, "text-anchor": "middle", "font-size": "11", fill: "var(--fg)"}, "等价于选出 8 个人留在教室"));
      fig.appendChild(el("text", {x: 160, y: 145, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "C₁₀⁸ = C₁₀² = 45（大幅化简运算！）"));

      // Right: 递推性 C_{n+1}^m = C_n^m + C_n^{m-1}
      fig.appendChild(el("rect", {x: 330, y: 40, width: 260, height: 130, rx: 8, fill: "var(--card)", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 460, y: 65, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2e7d32"}, "性质 2：加法递推（杨辉三角）"));
      fig.appendChild(el("text", {x: 460, y: 92, "text-anchor": "middle", "font-size": "11", fill: "var(--fg)"}, "从 (n+1) 人选 m 人（盯住特异元素 A）："));
      fig.appendChild(el("text", {x: 460, y: 112, "text-anchor": "middle", "font-size": "11", fill: "var(--fg)"}, "① 不含 A：Cₙᵐ 种；② 必含 A：Cₙᵐ⁻¹ 种"));
      fig.appendChild(el("text", {x: 460, y: 145, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "Cₙ₊₁ᵐ = Cₙᵐ + Cₙᵐ⁻¹（两肩相加得脚下）"));

      fig.appendChild(el("text", {x: 310, y: 195, "text-anchor": "middle", "font-size": "12.5", "font-weight": "700", fill: "var(--fg)"}, "对称性用于大角标快速降维，递推性是杨辉三角与二项式定理的底层骨架"));
      desc.innerHTML = "<b>③ 组合数两大性质直觉</b>：对称性源于「选出的与留下的方案一一对应」，求 $C_{20}^{18}$ 转换为 $C_{20}^2 = 190$ 瞬杀；递推公式按「是否包含某个特异元素」分类穷尽，是下一节杨辉三角的灵魂基石。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      // 6 本书均分 3 堆 (书1,2; 书3,4; 书5,6)
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "直接乘积：C₆² C₄² C₂² = 90（多算 6 倍！）"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "消除堆序：90 ÷ 3! = 15 种（正确答案）"));

      // Left: 3 piles with artificial orders 1st, 2nd, 3rd
      var piles = ["堆1: {A,B}", "堆2: {C,D}", "堆3: {E,F}"];
      piles.forEach(function(p, i) {
        var x = 40 + i * 75;
        trapFig.appendChild(el("rect", {x: x, y: 40, width: 68, height: 26, rx: 4, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1"}));
        trapFig.appendChild(el("text", {x: x + 34, y: 57, "text-anchor": "middle", "font-size": "9.5", fill: "#ef4444"}, p));
      });
      trapFig.appendChild(el("text", {x: 140, y: 88, "text-anchor": "middle", "font-size": "10.5", fill: "#ef4444"}, "先后挑出人为产生了 3! = 6 种伪顺序"));
      trapFig.appendChild(el("text", {x: 140, y: 120, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "实际上 3 堆没有名字，完全无序！"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Folded identical piles
      trapFig.appendChild(el("rect", {x: 310, y: 40, width: 180, height: 45, rx: 8, fill: "#e8f5e9", stroke: "#10b981", "stroke-width": "1.5"}));
      trapFig.appendChild(el("text", {x: 400, y: 60, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "合并消除次序：÷ 3!"));
      trapFig.appendChild(el("text", {x: 400, y: 76, "text-anchor": "middle", "font-size": "10", fill: "#2e7d32"}, "{A,B}, {C,D}, {E,F} 平等摆放"));
      trapFig.appendChild(el("text", {x: 400, y: 120, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "N = 90 ÷ 6 = 15 种"));
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

print('Upgrade e3-6-2 completed! File size:', len(html.encode('utf-8')), 'bytes')
