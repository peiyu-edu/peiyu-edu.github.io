import re
import os

with open("highSchool/site/lessons/e3-8-3.html", "r", encoding="utf-8") as f:
    orig_html = f.read()

# Let's construct new_step2
new_step2 = '''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：事件的相互独立 \\(P(AB)=P(A)P(B)\\)（<a href="b2-10-2.html">回看必修二 10.2</a>）；频率和比例；成对数据、两个变量之间的关系（<a href="e3-8-1.html">回看 8.1</a>）。</p>

  <div class="card">
    <p><b>分类变量</b>：取值是几个类别，不是能加减的数。</p>
    <p>例：「性别」取男、女；「打不打篮球」取打、不打。就算把「打」记成 \\(1\\)、「不打」记成 \\(0\\)，这两个数也只是名字。本节的两个分类变量都只取两类。</p>
  </div>

  <div class="card">
    <p><b>\\(2\\times2\\) 列联表</b>：把两个分类变量的四种组合各有多少人填进四个格子，再写上合计。</p>
    <div class="wide-x"><table class="ct">
      <tr><th></th><th>打</th><th>不打</th><th>合计</th></tr>
      <tr><th>男</th><td>\\(a=48\\)</td><td>\\(b=32\\)</td><td class="sum">\\(80\\)</td></tr>
      <tr><th>女</th><td>\\(c=10\\)</td><td>\\(d=40\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>合计</th><td class="sum">\\(58\\)</td><td class="sum">\\(72\\)</td><td class="sum">\\(n=130\\)</td></tr>
    </table></div>
    <p class="small">一般写法：第一行 \\(a,b\\)，第二行 \\(c,d\\)，\\(n=a+b+c+d\\)。</p>
  </div>

  <!-- Component 1: 伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px; margin:16px 0;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
      <span style="font-weight:700; font-size:13.5px; color:var(--fg);">伴读直觉微图解：独立性检验三维几何与决策透视</span>
      <div id="m-chi-tabs" style="display:flex; gap:6px;">
        <button type="button" class="micro-tab active" data-tab="1" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:var(--accent); color:#fff; cursor:pointer;">① 比例条形直觉</button>
        <button type="button" class="micro-tab" data-tab="2" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:transparent; color:var(--fg); cursor:pointer;">② 频数偏离期望</button>
        <button type="button" class="micro-tab" data-tab="3" style="padding:3px 8px; font-size:12px; border-radius:4px; border:1px solid var(--line); background:transparent; color:var(--fg); cursor:pointer;">③ 反证决策拒绝域</button>
      </div>
    </div>
    <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-chi-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-chi-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <!-- Component 2: 概念对比双卡 -->
  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">等高堆积条形图 (直观比比例)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">探索性描述</span>
      </div>
      <p style="font-size:12.5px; margin:0; line-height:1.55;">
        <b>原理</b>：将两组频数归一化为百分比（\\(p_1=\\frac{a}{a+b}\\)，\\(p_2=\\frac{c}{c+d}\\)），直观观察两柱分界线的高低落差。<br>
        <b>优势与局限</b>：一目了然，能直观展现两组是否存在倾向性差异；但<b>无法剔除随机抽样波动</b>的影响，小样本容易误将偶然误差当作必然规律。
      </p>
    </div>
    <div class="card" style="border-top:3px solid #10b981; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#10b981;">\\(\\chi^2\\) 独立性检验 (严谨统计推断)</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#10b981; font-size:11px; padding:2px 8px; border-radius:10px;">反证法决策</span>
      </div>
      <p style="font-size:12.5px; margin:0; line-height:1.55;">
        <b>原理</b>：假定 \\(H_0\\)（两变量独立），量化各格子实际观察频数偏离独立理论期望的总偏离量 \\(\\chi^2\\)。<br>
        <b>决策机制</b>：若 \\(\\chi^2\\ge x_\\alpha\\)，说明在独立假设下出现这种极端偏离属于<b>小概率事件</b>，从而以犯错率不超过 \\(\\alpha\\) 的把握拒绝 \\(H_0\\)，断定两者有关联。
      </p>
    </div>
  </div>

  <div class="card">
    <p><b>小概率值 \\(\\alpha\\) 和临界值 \\(x_\\alpha\\)</b>：事先定一个很小的概率 \\(\\alpha\\)，比如 \\(0.05\\)。临界值 \\(x_\\alpha\\) 的意思是：<b>如果 \\(H_0\\) 成立</b>，算出来的 \\(\\chi^2\\ge x_\\alpha\\) 的概率约为 \\(\\alpha\\)。常用的五组：</p>
    <div class="wide-x"><table class="ct">
      <tr><th>\\(\\alpha\\)</th><td>\\(0.1\\)</td><td>\\(0.05\\)</td><td>\\(0.01\\)</td><td>\\(0.005\\)</td><td>\\(0.001\\)</td></tr>
      <tr><th>\\(x_\\alpha\\)</th><td>\\(2.706\\)</td><td>\\(3.841\\)</td><td>\\(6.635\\)</td><td>\\(7.879\\)</td><td>\\(10.828\\)</td></tr>
    </table></div>
    <p>例：\\(\\alpha=0.05\\) 时 \\(x_\\alpha=3.841\\)：两个变量真的独立时，\\(\\chi^2\\) 达到 \\(3.841\\) 的情形大约 \\(20\\) 次里只有 \\(1\\) 次。\\(\\alpha\\) 越小，临界值越大，推断要求越严。</p>
  </div>

  <h3>2. 先看比例：等高堆积条形图</h3>
  <p>人数多少不能直接比，两行的总人数可能不同。把每一行都换成比例，画成一样高的条，每条按比例分成两段，这叫<b>等高堆积条形图</b>。两条的分界线高度差不多，说明两行比例差不多；差得多，说明可能有关联。</p>
  <div class="card">
    <p class="small">例 1（看一遍怎么做）</p>
    <p>问了 \\(100\\) 名同学「是否常吃早餐」和「上午是否犯困」：常吃早餐的 \\(50\\) 人中 \\(15\\) 人犯困，不常吃的 \\(50\\) 人中 \\(30\\) 人犯困。</p>
    <p>常吃早餐一行：犯困比例 \\(\\dfrac{15}{50}=30\\%\\)；不常吃一行：\\(\\dfrac{30}{50}=60\\%\\)。两条的分界线一个在 \\(30\\%\\)、一个在 \\(60\\%\\)，差得明显，所以怀疑「吃早餐」和「犯困」有关联。到底差得够不够多，下一块用 \\(\\chi^2\\) 判断。</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：甲组 \\(50\\) 人中 \\(30\\) 人选「是」，乙组 \\(30\\) 人中 \\(18\\) 人选「是」。按比例看两组？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>甲组更高</button>
      <button class="opt" data-v="B"><b>B</b>一样</button>
      <button class="opt" data-v="C"><b>C</b>乙组更高</button>
    </div>
    <div class="reveal"><p><b>B</b>。\\(\\dfrac{30}{50}=60\\%\\)，\\(\\dfrac{18}{30}=60\\%\\)，比例一样，等高条形图里两条的分界线一样高（这时 \\(\\chi^2=0\\)）。选 A 的同学比的是人数 \\(30&gt;18\\)，没看两组总人数不同。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <h3>3. 算 \\(\\chi^2\\)</h3>
  <p>\\(\\chi^2\\) 把「每个格子实际人数和独立时应有人数差多少」合成一个数。对 \\(2\\times2\\) 表，它化简为核心计算公式：</p>

  <!-- Component 3: 色彩语义主公式 -->
  <div class="key" style="margin:16px 0; padding:14px; border-left:4px solid #10b981; background:var(--card);">
    <div style="font-weight:700; color:#10b981; margin-bottom:6px; font-size:13px;">\\(\\chi^2\\) 对角交叉乘积差核心公式</div>
    <div style="text-align:center; font-size:1.15rem; margin:8px 0;">
      \\[\\chi^2 = \\dfrac{\\color{#1976d2}{n}(\\color{#ef4444}{ad}-\\color{#10b981}{bc})^2}{\\color{#8b5cf6}{(a+b)(c+d)(a+c)(b+d)}}\\]
    </div>
    <div style="font-size:12px; line-height:1.6; color:var(--fg);">
      • <b style="color:#1976d2;">样本总量 \\(n\\)</b>：\\(n = a+b+c+d\\)，成正比放大样本量对统计推断的效力；<br>
      • <b style="color:#ef4444;">主对角 \\(ad\\)</b> 与 <b style="color:#10b981;">副对角 \\(bc\\)</b>：交叉乘积差 \\(|ad-bc|\\) 衡量两行两列比例差异；若 \\(ad=bc\\) 则 \\(\\chi^2=0\\)（完全无关联）；<br>
      • <b style="color:#8b5cf6;">分母四项边际合计乘积</b>：行合计与列合计的连续乘积，作为标准化方差的归一基准。
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（算一遍，留着下块用）</p>
    <p>把例 1 的数据写成列联表：</p>
    <div class="wide-x"><table class="ct">
      <tr><th></th><th>犯困</th><th>不犯困</th><th>合计</th></tr>
      <tr><th>常吃</th><td>\\(a=15\\)</td><td>\\(b=35\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>不常吃</th><td>\\(c=30\\)</td><td>\\(d=20\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>合计</th><td class="sum">\\(45\\)</td><td class="sum">\\(55\\)</td><td class="sum">\\(n=100\\)</td></tr>
    </table></div>
    <p>代入公式：</p>
    <p>\\[ad-bc = 15\\times20 - 35\\times30 = 300 - 1050 = -750\\]</p>
    <p>\\[\\chi^2 = \\dfrac{100\\times(-750)^2}{50\\times50\\times45\\times55} = \\dfrac{100\\times562500}{6187500} = \\dfrac{56250000}{6187500} \\approx 9.091\\]</p>
  </div>

  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\\(a=20\\)，\\(b=30\\)，\\(c=30\\)，\\(d=20\\)。\\(\\chi^2=\\)？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\\(4\\)</button>
      <button class="opt" data-v="B"><b>B</b>\\(-4\\)</button>
      <button class="opt" data-v="C"><b>C</b>\\(0\\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\\(n=100\\)，四个合计都是 \\(50\\)，\\(ad-bc=400-900=-500\\)，\\((-500)^2=250000\\)。\\(\\chi^2=\\dfrac{100\\times250000}{50^4}=\\dfrac{25000000}{6250000}=4\\)。选 B 的同学忘了分子有平方，\\(\\chi^2\\) 不会是负数。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <!-- Component 4: 三步破题思维链例题 -->
  <h3>4. 检验三步，结论怎么说</h3>
  <div class="think-steps" style="background:var(--card); border:1px solid var(--line); border-radius:12px; padding:14px; margin:16px 0;">
    <div style="font-weight:700; color:var(--fg); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
      <span style="background:#e0e7ff; color:#3730a3; font-size:11px; padding:2px 8px; border-radius:4px;">解题金钥匙</span>
      高考独立性检验三步破题规范思维链
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; gap:8px; align-items:flex-start;">
        <span style="font-size:1.1rem; line-height:1;">👀</span>
        <div>
          <b style="color:#1976d2; font-size:13px;">第一步·立假设提边际 (破题信号与列联表准备)</b>
          <p style="font-size:12px; margin:2px 0 0; color:var(--muted); line-height:1.5;">
            明确零假设 \\(H_0\\)：「两变量相互独立/无关联」；审清题目要求的小概率值 \\(\\alpha\\)（如 \\(\\alpha=0.01\\)），查表锁定临界值 \\(x_\\alpha\\)（如 \\(6.635\\)）；核对列联表 \\(a,b,c,d\\) 与四个边缘合计。
          </p>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:flex-start;">
        <span style="font-size:1.1rem; line-height:1;">🔧</span>
        <div>
          <b style="color:#10b981; font-size:13px;">第二步·套公式算卡方 (高精度交叉运算防错)</b>
          <p style="font-size:12px; margin:2px 0 0; color:var(--muted); line-height:1.5;">
            套用 \\(\\chi^2=\\frac{n(ad-bc)^2}{(a+b)(c+d)(a+c)(b+d)}\\)。先算主副对角乘积差 \\(ad-bc\\)，平方并乘以 \\(n\\)；分母四项相乘，计算过程保留三位小数，防分子漏乘 \\(n\\) 或平方算错。
          </p>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:flex-start;">
        <span style="font-size:1.1rem; line-height:1;">🛡️</span>
        <div>
          <b style="color:#d97706; font-size:13px;">第三步·比阈值严谨作答 (规避绝对化严防扣分)</b>
          <p style="font-size:12px; margin:2px 0 0; color:var(--muted); line-height:1.5;">
            • 若 \\(\\chi^2\\ge x_\\alpha\\)：拒绝 \\(H_0\\)，标准作答为「<b>有 \\(100(1-\\alpha)\\%\\) 的把握认为两变量有关联</b>」或「<b>在犯错概率不超过 \\(\\alpha\\) 的前提下认为两变量有关联</b>」；<br>
            • 若 \\(\\chi^2&lt;x_\\alpha\\)：不能拒绝 \\(H_0\\)，作答为「<b>没有充分证据认为两变量有关联</b>」（严禁作答为「证明了两者完全独立」！）。
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 3（实战演练）</p>
    <p>接例 2，算得 \\(\\chi^2\\approx9.091\\)。</p>
    <p>取 \\(\\alpha=0.01\\)：\\(9.091\\ge6.635\\)，拒绝 \\(H_0\\)。在 \\(\\alpha=0.01\\) 下认为「是否常吃早餐」和「上午是否犯困」有关联，这个推断犯错的概率不超过 \\(0.01\\)（即有 \\(99\\%\\) 的把握认为两者有关联）。</p>
    <p>若事先取的是 \\(\\alpha=0.001\\)：\\(9.091&lt;10.828\\)，不能拒绝 \\(H_0\\)，结论是「没有充分证据认为两者有关联」。同一组数据，规则定得越严，越难下「有关联」的结论；所以 \\(\\alpha\\) 必须事先定好，绝不能算完后再挑合心意的临界值。</p>
  </div>

  <div class="card predict" data-id="try-3" data-answer="B">
    <p>自己试试：取 \\(\\alpha=0.05\\)，算得 \\(\\chi^2=3.2\\)。结论应该写？</p>
    <div class="opts">
      <button class="opt" data-v="A"><b>A</b>认为两个变量有关联，犯错概率不超过 \\(0.05\\)</button>
      <button class="opt" data-v="B"><b>B</b>没有充分证据认为两个变量有关联</button>
      <button class="opt" data-v="C"><b>C</b>证明了两个变量独立</button>
    </div>
    <div class="reveal"><p><b>B</b>。\\(3.2&lt;3.841\\)，没到临界值，不能拒绝 \\(H_0\\)。选 A 是比反了方向；选 C 说过头了：没拒绝只是证据不够，不是证明独立（下一块有反例）。</p></div>
  </div>
  <div class="key" style="text-align:center;">\\(\\chi^2\\ge x_\\alpha\\) 拒绝 \\(H_0\\)：有 \\(100(1-\\alpha)\\%\\) 把握认为有关联；\\(\\chi^2&lt;x_\\alpha\\) 未拒绝：没有充分证据认为有关联（非证明独立）。</div>

  <!-- Component 5: 三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 用之前，查这几件事（三大翻车现场与防坑指南）</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin:14px 0;">
    <div class="trap-card" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#991b1b; font-size:12.5px; margin-bottom:4px;">❌ 翻车现场 1：公式交叉项错配或漏乘 \\(n\\)</div>
      <p style="font-size:11.5px; color:#7f1d1d; line-height:1.5; margin:0 0 6px;">
        误把 \\(ad-bc\\) 写成同行同列相乘 \\(ab-cd\\)，或分子漏乘样本容量 \\(n\\)，导致算出的 \\(\\chi^2\\) 缩系数或结果为负。
      </p>
      <div style="font-size:11.5px; color:#166534; background:#f0fdf4; padding:5px; border-radius:4px;">
        <b>正解防坑</b>：牢记「对角线交叉相乘再相减」；分子必须含 \\(n\\) 且带平方，\\(\\chi^2\\ge 0\\) 恒为非负！
      </div>
    </div>
    <div class="trap-card" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#991b1b; font-size:12.5px; margin-bottom:4px;">❌ 翻车现场 2：结论写成绝对肯定或「证明了独立」</div>
      <p style="font-size:11.5px; color:#7f1d1d; line-height:1.5; margin:0 0 6px;">
        检验通过时写成「\\(100\\%\\) 肯定有关联」；没达到临界值时写成「证明了两者完全独立」。高考中两类表述均会被严厉扣分！
      </p>
      <div style="font-size:11.5px; color:#166534; background:#f0fdf4; padding:5px; border-radius:4px;">
        <b>正解防坑</b>：独立性检验是概率推断，永远带有犯错可能！未拒绝只是「无充分证据」，不可妄下肯定结论。
      </div>
    </div>
    <div class="trap-card" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#991b1b; font-size:12.5px; margin-bottom:4px;">❌ 翻车现场 3：小样本频数不足盲套公式 (伪显著)</div>
      <p style="font-size:11.5px; color:#7f1d1d; line-height:1.5; margin:0 0 6px;">
        当单元格频数小于 \\(5\\) 时（如仅调查 \\(4\\) 个人算出 \\(\\chi^2=4&gt;3.841\\)），大样本逼近失效，盲目套用公式会产生严重伪显著。
      </p>
      <div style="font-size:11.5px; color:#166534; background:#f0fdf4; padding:5px; border-radius:4px;">
        <b>正解防坑</b>：独立性检验要求样本量足够大且随机抽样，常规要求每个格子的实际频数与期望频数均不小于 \\(5\\)。
      </div>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:10px; padding:12px; margin:14px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：两组比例相同 (\\(\\chi^2=0\\)) vs 小样本伪显著 (\\(n=4\\))</div>
    <div style="width:100%; max-width:540px; margin:0 auto;">
      <svg class="micro-fig" id="m-chi-trap-fig" viewBox="0 0 540 140" style="width:100%; height:auto; display:block; background:var(--bg); border-radius:8px;"></svg>
      <div style="margin-top:6px; font-size:11.5px; color:var(--muted); line-height:1.5; text-align:center;">
        左图：比例完全相同，堆积图分界齐平（\\(ad=bc\\)），\\(\\chi^2=0\\) 绝对独立基准。<br>
        右图：\\(n=4\\) 小样本极端数据，看似 \\(\\chi^2=4&gt;3.841\\)，实属随机抽样假象，大样本前提崩溃！
      </div>
    </div>
  </div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>公式从哪来</b>：独立时每个格子「应有」的人数是 \\(\\dfrac{\\text{行合计}\\times\\text{列合计}}{n}\\)。把四个格子的 \\(\\dfrac{(\\text{实际}-\\text{应有})^2}{\\text{应有}}\\) 加起来，对 \\(2\\times2\\) 表化简后正好是上面的公式。例 2 里，常吃早餐且犯困应有 \\(\\dfrac{50\\times45}{100}=22.5\\) 人，实际 \\(15\\) 人。</p>
    <p><b>和反证法比</b>：反证法是「假设 \\(\\Rightarrow\\) 推出矛盾 \\(\\Rightarrow\\) 假设一定不对」。独立性检验是「假设 \\(H_0\\) \\(\\Rightarrow\\) 这么大的 \\(\\chi^2\\) 很少见 \\(\\Rightarrow\\) 不太相信 \\(H_0\\)」。很少见不是不可能，所以结论可能错，错的概率由 \\(\\alpha\\) 控制。</p>
    <p><b>临界值从哪来</b>：\\(H_0\\) 成立、\\(n\\) 较大时，\\(\\chi^2\\) 近似服从一种叫「自由度为 \\(1\\) 的 \\(\\chi^2\\) 分布」的分布，表里的数就是它右侧概率为 \\(\\alpha\\) 的位置。「动手」③ 可以亲手抽样看到这一点。</p>
  </details>
</section>'''

script_addition = '''
  // === e3-8-3 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-chi-fig");
    var desc = document.getElementById("m-chi-desc");
    var trapFig = document.getElementById("m-chi-trap-fig");
    var tabs = document.querySelectorAll("#m-chi-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "等高堆积条形图：按比例归一化，观察两柱分界台阶落差"));

      // Axes
      fig.appendChild(el("line", {x1: 80, y1: 170, x2: 520, y2: 170, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("line", {x1: 80, y1: 170, x2: 80, y2: 35, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 70, y: 174, "text-anchor": "end", "font-size": "11", fill: "var(--muted)"}, "0%"));
      fig.appendChild(el("text", {x: 70, y: 105, "text-anchor": "end", "font-size": "11", fill: "var(--muted)"}, "50%"));
      fig.appendChild(el("text", {x: 70, y: 40, "text-anchor": "end", "font-size": "11", fill: "var(--muted)"}, "100%"));

      // Bar 1: 常吃 (30% 困)
      fig.appendChild(el("rect", {x: 160, y: 40, width: 90, height: 130, fill: "#e2e8f0", rx: "4"}));
      fig.appendChild(el("rect", {x: 160, y: 131, width: 90, height: 39, fill: "#f87171", rx: "4"}));
      fig.appendChild(el("text", {x: 205, y: 190, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "常吃早餐 (50人)"));
      fig.appendChild(el("text", {x: 205, y: 154, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#fff"}, "30% 困"));
      fig.appendChild(el("text", {x: 205, y: 90, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "70% 不困"));

      // Bar 2: 不常吃 (60% 困)
      fig.appendChild(el("rect", {x: 350, y: 40, width: 90, height: 130, fill: "#e2e8f0", rx: "4"}));
      fig.appendChild(el("rect", {x: 350, y: 92, width: 90, height: 78, fill: "#ef4444", rx: "4"}));
      fig.appendChild(el("text", {x: 395, y: 190, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "不常吃早餐 (50人)"));
      fig.appendChild(el("text", {x: 395, y: 135, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#fff"}, "60% 困"));
      fig.appendChild(el("text", {x: 395, y: 68, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "40% 不困"));

      // Step indicator
      fig.appendChild(el("line", {x1: 250, y1: 131, x2: 350, y2: 131, stroke: "#f87171", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("line", {x1: 350, y1: 92, x2: 450, y2: 92, stroke: "#ef4444", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("path", {d: "M 455,92 L 465,92 L 465,131 L 455,131", fill: "none", stroke: "#ef4444", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 472, y: 115, "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "落差 Δ = 30%"));

      desc.innerHTML = "<b>① 比例条形直觉</b>：将各组人数按 100% 归一化。「不常吃」犯困比例高达 60%，「常吃」仅 30%，两者分界线出现 30% 显著台阶落差，直观提示两变量存在关联倾向。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "频数偏离理论期望：实际观察值与独立期望值的偏离量"));

      var cells = [
        {x: 100, y: 40, title: "常吃 且 犯困 (a)", obs: "实际: 15", exp: "期望: 22.5 (Δ = -7.5)", bg: "#fef2f2", bdr: "#fca5a5", tc: "#991b1b"},
        {x: 320, y: 40, title: "常吃 且 不困 (b)", obs: "实际: 35", exp: "期望: 27.5 (Δ = +7.5)", bg: "#f0fdf4", bdr: "#86efac", tc: "#166534"},
        {x: 100, y: 110, title: "不常吃 且 犯困 (c)", obs: "实际: 30", exp: "期望: 22.5 (Δ = +7.5)", bg: "#f0fdf4", bdr: "#86efac", tc: "#166534"},
        {x: 320, y: 110, title: "不常吃 且 不困 (d)", obs: "实际: 20", exp: "期望: 27.5 (Δ = -7.5)", bg: "#fef2f2", bdr: "#fca5a5", tc: "#991b1b"}
      ];

      cells.forEach(function(c) {
        fig.appendChild(el("rect", {x: c.x, y: c.y, width: 200, height: 60, rx: "6", fill: c.bg, stroke: c.bdr, "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: c.x + 12, y: c.y + 20, "font-size": "11.5", "font-weight": "700", fill: c.tc}, c.title));
        fig.appendChild(el("text", {x: c.x + 12, y: c.y + 40, "font-size": "11", fill: "var(--fg)"}, c.obs + " | " + c.exp));
      });

      // Diagonal indicators
      fig.appendChild(el("line", {x1: 200, y1: 70, x2: 420, y2: 140, stroke: "#ef4444", "stroke-width": "2", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("line", {x1: 420, y1: 70, x2: 200, y2: 140, stroke: "#1976d2", "stroke-width": "2", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("circle", {cx: 310, y: 105, r: 16, fill: "var(--fg)"}));
      fig.appendChild(el("text", {x: 310, y: 109, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "var(--card)"}, "|Δ|=750"));

      desc.innerHTML = "<b>② 频数偏离期望</b>：若独立，理论期望为 (行和×列和)/n。四个格子观察值均偏离期望达 7.5 人。交叉乘积差 |ad-bc| = |300-1050| = 750，平方后强力放大总偏离！";
    }

    function drawTab3() {
      fig.innerHTML = "";
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "反证决策拒绝域：小概率事件发生，推翻独立零假设"));

      // Axis
      fig.appendChild(el("line", {x1: 60, y1: 170, x2: 560, y2: 170, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 60, y: 188, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "0"));
      fig.appendChild(el("text", {x: 200, y: 188, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "3.841(5%)"));
      fig.appendChild(el("text", {x: 300, y: 188, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "6.635(1%)"));
      fig.appendChild(el("text", {x: 430, y: 188, "text-anchor": "middle", "font-size": "11", fill: "#ef4444"}, "10.828(0.1%)"));

      // Curve
      fig.appendChild(el("path", {d: "M 65,40 Q 100,130 160,155 T 320,167 T 540,170", fill: "none", stroke: "#1976d2", "stroke-width": "2.5"}));

      // Shaded Rejection Tail for alpha=0.01 (>= 6.635)
      fig.appendChild(el("path", {d: "M 300,166 L 300,170 L 550,170 L 540,170 Z", fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"}));
      fig.appendChild(el("line", {x1: 300, y1: 100, x2: 300, y2: 170, stroke: "#ef4444", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: 320, y: 120, "font-size": "11", "font-weight": "700", fill: "#b91c1c"}, "拒绝域 (α=0.01)"));

      // Sample chi2 = 9.091
      fig.appendChild(el("line", {x1: 380, y1: 50, x2: 380, y2: 170, stroke: "#dc2626", "stroke-width": "2"}));
      fig.appendChild(el("circle", {cx: 380, y: 168, r: "5", fill: "#dc2626"}));
      fig.appendChild(el("rect", {x: 335, y: 35, width: 90, height: 24, rx: "4", fill: "#dc2626"}));
      fig.appendChild(el("text", {x: 380, y: 51, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#fff"}, "χ² ≈ 9.091"));
      fig.appendChild(el("text", {x: 380, y: 80, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#dc2626"}, "深陷拒绝域！"));

      desc.innerHTML = "<b>③ 反证决策拒绝域</b>：若 H₀ 为真，χ² ≥ 6.635 的概率不足 1%（小概率事件）。实算 χ² = 9.091 &gt; 6.635 强势落入拒绝域，反证法确立结论：<b>有 99% 的把握认为两者有关联</b>！";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "基准：比例完全相等 (ad=bc)"));
      trapFig.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "陷阱：n=4 样本极小伪显著"));

      // Left: 比例一致，χ²=0
      trapFig.appendChild(el("rect", {x: 60, y: 35, width: 50, height: 75, fill: "#e2e8f0", rx: "3"}));
      trapFig.appendChild(el("rect", {x: 60, y: 65, width: 50, height: 45, fill: "#1976d2", rx: "3"}));
      trapFig.appendChild(el("text", {x: 85, y: 92, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#fff"}, "60%"));

      trapFig.appendChild(el("rect", {x: 160, y: 35, width: 50, height: 75, fill: "#e2e8f0", rx: "3"}));
      trapFig.appendChild(el("rect", {x: 160, y: 65, width: 50, height: 45, fill: "#1976d2", rx: "3"}));
      trapFig.appendChild(el("text", {x: 185, y: 92, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#fff"}, "60%"));

      trapFig.appendChild(el("line", {x1: 110, y1: 65, x2: 160, y2: 65, stroke: "#10b981", "stroke-width": "2", "stroke-dasharray": "2"}));
      trapFig.appendChild(el("text", {x: 135, y: 126, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#10b981"}, "分界齐平 ➜ χ² = 0 (独立)"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: n=4 小样本伪显著
      trapFig.appendChild(el("rect", {x: 335, y: 35, width: 50, height: 75, fill: "#e2e8f0", rx: "3"}));
      trapFig.appendChild(el("rect", {x: 335, y: 35, width: 50, height: 75, fill: "#ef4444", rx: "3"}));
      trapFig.appendChild(el("text", {x: 360, y: 76, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#fff"}, "100%"));

      trapFig.appendChild(el("rect", {x: 430, y: 35, width: 50, height: 75, fill: "#e2e8f0", rx: "3"}));
      trapFig.appendChild(el("text", {x: 455, y: 76, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "var(--muted)"}, "0%"));

      trapFig.appendChild(el("text", {x: 405, y: 126, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#ef4444"}, "频数仅2人 ➜ 算得χ²=4不可信！"));
    }

    tabs.forEach(function(btn) {
      btn.addEventListener("click", function() {
        tabs.forEach(function(b) {
          b.classList.remove("active");
          b.style.background = "transparent";
          b.style.color = "var(--fg)";
        });
        btn.classList.add("active");
        btn.style.background = "var(--accent)";
        btn.style.color = "#fff";

        var tab = btn.getAttribute("data-tab");
        if (tab === "1") drawTab1();
        else if (tab === "2") drawTab2();
        else if (tab === "3") drawTab3();
      });
    });

    drawTab1();
    drawTrap();
  })();
'''

# 1. Replace Step 2
step2_pat = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pat.search(orig_html), "Step 2 not found"
html_mod = step2_pat.sub(lambda m: new_step2, orig_html)

# 2. Inject script right before the closing })();
idx = html_mod.rfind('})();')
assert idx != -1, "Closing })(); not found"
html_mod = html_mod[:idx] + script_addition + '\n' + html_mod[idx:]

total_sz = len(html_mod.encode('utf-8'))
print(f"Total size: {total_sz} bytes ({total_sz/1024:.2f} KB)")
if total_sz <= 61440:
    print("SUCCESS! File size <= 60 KB!")
    with open("highSchool/site/lessons/e3-8-3.html", "w", encoding="utf-8") as f:
        f.write(html_mod)
    print("Written to e3-8-3.html")
else:
    print("EXCEEDED LIMIT!")
