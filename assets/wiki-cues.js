/* 培玉 · 高中数学 — 「看到题目怎么想」题干信号库（由 wiki.html 原决策树 64 行整理成数据，后续补入的条目接着编号）。
   每条：id、ch（与卡片库章节编号一致，1–18）、sec（教材小节 id）、cue（题干信号，学生先看这个想）、
   act（该怎么想 / 第一步做什么）、card（对应方法卡 id，见 wiki.js CARDS）、label（卡片按钮文字）。
   由 assets/wiki-trainer.js 渲染成「先想再揭晓」训练器和查表模式。改内容改这里，不要再写回 wiki.html。 */
window.PEIYU_CUE_CHAPTERS = {
  "1": "集合与常用逻辑用语（第 1 章）",
  "2": "基本不等式与二次不等式（第 2 章）",
  "3": "函数的概念与性质（第 3 章）",
  "4": "指数、对数函数与零点（第 4 章）",
  "5": "三角函数与恒等变换（第 5 章）",
  "6": "平面向量及其应用（第 6 章）",
  "7": "复数（第 7 章）",
  "8": "立体几何初步（第 8 章）",
  "9": "统计（第 9 章）",
  "10": "概率（第 10 章）",
  "11": "空间向量与立体几何（选择性必修第一册 第 1 章）",
  "12": "直线和圆的方程（选必一 第 2 章）",
  "13": "圆锥曲线的方程（选择性必修第一册 第 3 章）",
  "14": "数列（选必二 第 4 章）",
  "15": "一元函数的导数及其应用（选择性必修第二册 第 5 章）",
  "16": "计数原理（选必三 第 6 章）",
  "17": "随机变量及其分布（选必三 第 7 章）",
  "18": "成对数据的统计分析（选必三 第 8 章）"
};
window.PEIYU_CUES = [
  {
    "id": "c01-set-empty-trap",
    "ch": 1,
    "sec": "b1-1-2",
    "cue": "题干出现 <b>\\(A\\subseteq B\\)</b> 或 <b>\\(A\\cap B=\\varnothing\\)</b>，且集合含参数 \\(a\\)",
    "act": "先分 <b>\\(A=\\varnothing\\)</b> 和 <b>\\(A\\ne\\varnothing\\)</b> 两类讨论，画数轴后再单独检验端点能否取等",
    "card": "set-empty-trap",
    "label": "含参子集先查空集与子集计数"
  },
  {
    "id": "c02-logic-subset",
    "ch": 1,
    "sec": "b1-1-4",
    "cue": "问「\\(p\\) 是 \\(q\\) 的什么条件」或「已知必要/充分条件求参数范围」",
    "act": "化为解集包含关系：<b>小范围 \\(\\Rightarrow\\) 大范围</b>（谁小谁充分，谁大谁必要）",
    "card": "logic-subset",
    "label": "充分必要条件判断法"
  },
  {
    "id": "c03-logic-negation",
    "ch": 1,
    "sec": "b1-1-5",
    "cue": "对含 \\(\\forall x\\in M\\) 或 \\(\\exists x\\in M\\) 的命题写「否定」",
    "act": "<b>论域 \\(M\\) 不变</b>，改量词（\\(\\forall\\leftrightarrow\\exists\\)）+ 否定结论（\\(\\le\\leftrightarrow &gt;\\)）",
    "card": "logic-negation",
    "label": "量词命题的否定"
  },
  {
    "id": "c65-set-def-distinct",
    "ch": 1,
    "sec": "b1-1-1",
    "cue": "已知集合 \\(A=\\{1,\\ a,\\ a^2-a\\}\\) 且 \\(2\\in A\\)，求实数 \\(a\\)；若再要求 \\(A\\) 恰有三个元素呢",
    "act": "把 \\(2\\) 分别对号到每个元素解出 \\(a\\)，再<b>代回检验互异性</b>：只问「\\(2\\in A\\)」时重复的 \\(a\\) 仍要留下，只有题目要求元素个数或互不相同时才舍去",
    "card": "set-def-distinct",
    "label": "互异性检验与看代表元"
  },
  {
    "id": "c66-set-def-distinct",
    "ch": 1,
    "sec": "b1-1-1",
    "cue": "设 \\(A=\\{x\\mid y=x^2+1\\}\\)，\\(B=\\{y\\mid y=x^2+1\\}\\)，\\(C=\\{(x,y)\\mid y=x^2+1\\}\\)，求 \\(A\\cap B\\) 与 \\(A\\cap C\\)",
    "act": "<b>先看竖线前的代表元</b>：\\(A\\) 是定义域数集 \\(\\mathbf R\\)，\\(B\\) 是值域数集 \\([1,+\\infty)\\)，\\(C\\) 是点集；数集与点集交集为 \\(\\varnothing\\)，\\(A\\cap B=[1,+\\infty)\\)",
    "card": "set-def-distinct",
    "label": "描述法看代表元"
  },
  {
    "id": "c67-set-ops-demorgan",
    "ch": 1,
    "sec": "b1-1-3",
    "cue": "全集 \\(U=\\mathbf R\\)，\\(A=\\{x\\mid 1\\le x&lt;3\\}\\)，\\(B=\\{x\\mid x&gt;2\\}\\)，求 \\(\\complement_U(A\\cup B)\\) 与 \\((\\complement_U A)\\cap B\\)",
    "act": "<b>画数轴</b>：先求 \\(A\\cup B=[1,+\\infty)\\) 再取补，开闭端点互换得 \\((-\\infty,1)\\)；或用摩根律 \\(\\complement_U(A\\cup B)=\\complement_U A\\cap\\complement_U B\\) 分别取补再交",
    "card": "set-ops-demorgan",
    "label": "交并补数轴运算与摩根律"
  },
  {
    "id": "c68-set-ops-demorgan",
    "ch": 1,
    "sec": "b1-1-3",
    "cue": "某班 \\(45\\) 人，参加数学小组 \\(28\\) 人、物理小组 \\(20\\) 人，两个都参加的 \\(10\\) 人，问两个都没参加的有几人",
    "act": "<b>容斥</b> \\(n(A\\cup B)=n(A)+n(B)-n(A\\cap B)=38\\)，再用全集减：\\(45-38=7\\)；或画两个相交圆把全集分四块逐块填数",
    "card": "set-ops-demorgan",
    "label": "Venn 图容斥计数"
  },
  {
    "id": "c04-amgm-const-one",
    "ch": 2,
    "sec": "b1-2-2",
    "cue": "已知整式和 \\(a+2b=1\\)（定值），求分式和 \\(\\dfrac1a+\\dfrac1b\\) 的最小值",
    "act": "把所求式<b>乘以「\\(1\\)」</b>（即乘 \\(a+2b\\)），展开消去分子分母再套一次均值",
    "card": "amgm-const-one",
    "label": "常数代换（乘1法）"
  },
  {
    "id": "c05-amgm-shift",
    "ch": 2,
    "sec": "b1-2-2",
    "cue": "求 \\(x+\\dfrac{4}{x-1}\\)（\\(x&gt;1\\)）或分母含一次式的最值",
    "act": "先<b>配凑分母整体</b>：\\((x-1)+\\dfrac{4}{x-1}+1\\)，使两项积为常数",
    "card": "amgm-shift",
    "label": "配凑分母法"
  },
  {
    "id": "c06-amgm-hook",
    "ch": 2,
    "sec": "b1-2-2",
    "cue": "基本不等式算出的等号点 \\(x=\\sqrt{k}\\) 不在题目给的区间 \\([m,+\\infty)\\) 内",
    "act": "均值下界取不到！改用<b>对勾函数 \\(f(x)=x+\\dfrac{k}{x}\\) 的单调性</b>取区间端点值",
    "card": "amgm-hook",
    "label": "对勾函数与等号失效"
  },
  {
    "id": "c07-quad-param",
    "ch": 2,
    "sec": "b1-2-3",
    "cue": "解含参不等式 \\(ax^2+bx+c&gt;0\\) 或恒成立问题",
    "act": "按 <b>① \\(a=0\\) 一次式 \\(\\to\\) ② 开口方向 \\(a\\) 正负 \\(\\to\\) ③ 判别式 \\(\\Delta\\) 与两根大小</b>依次讨论",
    "card": "quad-param",
    "label": "含参二次不等式三步曲"
  },
  {
    "id": "c69-ineq-props-diff",
    "ch": 2,
    "sec": "b1-2-1",
    "cue": "已知 \\(1&lt;a+b&lt;3\\)，\\(-1&lt;a-b&lt;1\\)，求 \\(3a+b\\) 的取值范围",
    "act": "<b>整体待定系数</b>：设 \\(3a+b=m(a+b)+n(a-b)\\)，解得 \\(m=2,\\ n=1\\)，再按「同向可加」合成 \\(1&lt;3a+b&lt;7\\)；绝不先分别解出 \\(a,b\\) 的范围再相加",
    "card": "ineq-props-diff",
    "label": "整体代换防范围扩大"
  },
  {
    "id": "c70-ineq-props-diff",
    "ch": 2,
    "sec": "b1-2-1",
    "cue": "已知 \\(x&lt;y&lt;0\\)，比较 \\(\\dfrac1x\\) 与 \\(\\dfrac1y\\)、\\(x^2\\) 与 \\(y^2\\) 的大小",
    "act": "<b>作差定号</b>：\\(\\dfrac1x-\\dfrac1y=\\dfrac{y-x}{xy}\\)，分子 \\(&gt;0\\)、分母 \\(&gt;0\\)，故 \\(\\dfrac1x&gt;\\dfrac1y\\)；\\(x^2-y^2=(x-y)(x+y)\\) 两因式皆负，故 \\(x^2&gt;y^2\\)",
    "card": "ineq-props-diff",
    "label": "作差法比大小"
  },
  {
    "id": "c71-amgm-core",
    "ch": 2,
    "sec": "b1-2-2",
    "cue": "已知 \\(x&gt;0,\\ y&gt;0\\) 且 \\(x+2y=4\\)，求 \\(xy\\) 的最大值，并说明何时取到",
    "act": "<b>和定积最大</b>：把 \\(x\\) 与 \\(2y\\) 看成两个正数，\\(x\\cdot 2y\\le\\left(\\dfrac{x+2y}{2}\\right)^2=4\\)，故 \\(xy\\le 2\\)；取等当且仅当 \\(x=2y=2\\)。写出「一正二定三相等」三查",
    "card": "amgm-core",
    "label": "基本不等式链与三相等"
  },
  {
    "id": "c72-quad-always-true",
    "ch": 2,
    "sec": "b1-2-3",
    "cue": "已知对任意 \\(x\\in\\mathbf R\\)，不等式 \\((m-1)x^2+(m-1)x+1&gt;0\\) 恒成立，求 \\(m\\) 的取值范围",
    "act": "<b>先查二次项系数为 \\(0\\)</b>：\\(m=1\\) 时 \\(1&gt;0\\) 成立；再 \\(m\\ne1\\) 时令开口向上且 \\(\\Delta&lt;0\\)，两类取并集",
    "card": "quad-always-true",
    "label": "全体实数上恒成立"
  },
  {
    "id": "c73-quad-always-true",
    "ch": 2,
    "sec": "b1-2-3",
    "cue": "已知当 \\(x\\in[1,3]\\) 时 \\(x^2-ax+2&gt;0\\) 恒成立，求 \\(a\\) 的取值范围",
    "act": "有界区间上<b>不能套 \\(\\Delta\\)</b>：分离参数 \\(a&lt;x+\\dfrac2x\\) 对 \\(x\\in[1,3]\\) 恒成立，转化为右边的最小值（\\(x=\\sqrt2\\) 时取 \\(2\\sqrt2\\)），故 \\(a&lt;2\\sqrt2\\)",
    "card": "quad-always-true",
    "label": "闭区间上恒成立"
  },
  {
    "id": "c08-fn-abstract-ineq",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "抽象函数不给解析式，要求解 \\(f(2x-1) &lt; f(x+2)\\)",
    "act": "先列<b>定义域</b>限制，再利用单调性脱去 \\(f\\)（若偶函数先变成 \\(f(|2x-1|)\\)）",
    "card": "fn-abstract-ineq",
    "label": "奇偶+单调解抽象不等式"
  },
  {
    "id": "c09-fn-odd-plus-c",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "已知 \\(f(x)\\) 为奇函数（或奇函数 \\(+\\) 常数 \\(c\\)），给出 \\(f(a)\\) 求 \\(f(-a)\\)",
    "act": "提炼奇部 \\(g(x)\\)：利用 <b>\\(f(x)+f(-x)=2c\\)</b> 整体代换，无需硬解参数",
    "card": "fn-odd-plus-c",
    "label": "奇函数加常数模型"
  },
  {
    "id": "c74-fn-dom-same",
    "ch": 3,
    "sec": "b1-3-1",
    "cue": "已知函数 \\(f(x+1)\\) 的定义域为 \\([-2,3]\\)，求 \\(f(2x-1)\\) 的定义域",
    "act": "<b>定义域永远指 \\(x\\) 的范围，同一个 \\(f\\) 括号整体范围相同</b>：由 \\(x\\in[-2,3]\\) 得 \\(x+1\\in[-1,4]\\)，再令 \\(-1\\le 2x-1\\le 4\\) 解出 \\(x\\in\\left[0,\\dfrac52\\right]\\)",
    "card": "fn-dom-same",
    "label": "抽象函数定义域"
  },
  {
    "id": "c75-fn-dom-same",
    "ch": 3,
    "sec": "b1-3-1",
    "cue": "判断 \\(f(x)=\\dfrac{x^2-1}{x-1}\\) 与 \\(g(x)=x+1\\)、\\(f(x)=\\sqrt{x^2}\\) 与 \\(g(x)=x\\) 是否为同一函数",
    "act": "<b>先比定义域再比对应关系</b>：前者 \\(f\\) 要求 \\(x\\ne1\\)，定义域不同；后者 \\(\\sqrt{x^2}=|x|\\ne x\\)，对应关系不同。两组都不是同一函数",
    "card": "fn-dom-same",
    "label": "同一函数判定"
  },
  {
    "id": "c76-fn-mono-def",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "已知 \\(f(x)=\\begin{cases}(a-2)x-1,& x\\le 1\\\\ \\log_a x,& x&gt;1\\end{cases}\\) 在 \\(\\mathbf R\\) 上单调递增，求 \\(a\\) 的取值范围",
    "act": "<b>三条件缺一不可</b>：左段递增 \\(a-2&gt;0\\)；右段递增 \\(a&gt;1\\)；分界点处左段值 \\(\\le\\) 右段值，即 \\((a-2)\\cdot1-1\\le\\log_a 1=0\\)。三者取交集得 \\(2&lt;a\\le3\\)",
    "card": "fn-mono-def",
    "label": "分段函数全域单调三条件"
  },
  {
    "id": "c77-fn-mono-def",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "写出函数 \\(y=\\dfrac{1}{x-1}\\) 的单调递减区间",
    "act": "两段分开写 \\((-\\infty,1)\\) 和 \\((1,+\\infty)\\)，<b>中间不能用 \\(\\cup\\)</b>：并起来后 \\(f(0)=-1&lt;f(2)=1\\)，与「递减」矛盾",
    "card": "fn-mono-def",
    "label": "单调区间书写红线"
  },
  {
    "id": "c78-fn-parity-core",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "已知 \\(f(x)=\\dfrac{a\\cdot 2^x-1}{2^x+1}\\) 是定义在 \\(\\mathbf R\\) 上的奇函数，求实数 \\(a\\)",
    "act": "定义域含 \\(0\\)，<b>直接令 \\(f(0)=0\\)</b> 得 \\(a=1\\)，再代回用 \\(f(-x)=-f(x)\\) 验证；一般情形用 \\(f(-x)+f(x)=0\\) 恒成立比较系数",
    "card": "fn-parity-core",
    "label": "奇函数求参先用 f(0)=0"
  },
  {
    "id": "c79-fn-parity-core",
    "ch": 3,
    "sec": "b1-3-2",
    "cue": "已知 \\(f(x)\\) 是 \\(\\mathbf R\\) 上的偶函数，当 \\(x\\ge0\\) 时 \\(f(x)=x^2-2x\\)，求 \\(x&lt;0\\) 时 \\(f(x)\\) 的解析式",
    "act": "设 \\(x&lt;0\\)，则 \\(-x&gt;0\\)，<b>先算 \\(f(-x)=x^2+2x\\)</b>，再由偶函数 \\(f(x)=f(-x)\\) 得 \\(f(x)=x^2+2x\\)；若是奇函数则 \\(f(x)=-f(-x)\\)",
    "card": "fn-parity-core",
    "label": "由奇偶性求另一半解析式"
  },
  {
    "id": "c80-fn-power-five",
    "ch": 3,
    "sec": "b1-3-3",
    "cue": "已知幂函数 \\(f(x)=(m^2-m-1)x^{m^2-2m-3}\\) 在 \\((0,+\\infty)\\) 上单调递减，求 \\(m\\) 的值",
    "act": "<b>系数必须等于 \\(1\\)</b>：解 \\(m^2-m-1=1\\) 得 \\(m=2\\) 或 \\(m=-1\\)；再用「递减要求指数 \\(&lt;0\\)」筛选：\\(m=2\\) 时指数为 \\(-3\\) 符合，\\(m=-1\\) 时指数为 \\(0\\) 舍去",
    "card": "fn-power-five",
    "label": "幂函数定义系数为 1"
  },
  {
    "id": "c81-fn-power-five",
    "ch": 3,
    "sec": "b1-3-3",
    "cue": "比较 \\(a=1.2^{\\frac12}\\)、\\(b=1.3^{\\frac12}\\)、\\(c=1.2^{\\frac13}\\) 的大小",
    "act": "同指数不同底，看<b>幂函数 \\(y=x^{\\frac12}\\) 在 \\((0,+\\infty)\\) 递增</b>得 \\(a&lt;b\\)；同底不同指数，看指数函数 \\(y=1.2^x\\) 递增得 \\(c&lt;a\\)。两类工具各管一半，故 \\(c&lt;a&lt;b\\)",
    "card": "fn-power-five",
    "label": "幂函数图象比大小"
  },
  {
    "id": "c82-fn-model-app",
    "ch": 3,
    "sec": "b1-3-4",
    "cue": "用长 \\(20\\,\\text{m}\\) 的篱笆靠一面长 \\(8\\,\\text{m}\\) 的墙围一块矩形菜地（墙作一边，不用篱笆），求菜地面积的最大值",
    "act": "设垂直于墙的边为 \\(x\\)，面积 \\(S=x(20-2x)\\)；<b>先列实际定义域</b> \\(0&lt;20-2x\\le 8\\) 得 \\(6\\le x&lt;10\\)。顶点 \\(x=5\\) 不在区间内，由单调性在端点 \\(x=6\\) 取最大值 \\(48\\,\\text{m}^2\\)",
    "card": "fn-model-app",
    "label": "应用建模先列实际定义域"
  },
  {
    "id": "c10-explog-compare",
    "ch": 4,
    "sec": "b1-4-4",
    "cue": "高考单选：比较 \\(a=0.3^{0.2},\\ b=2^{0.3},\\ c=\\log_3 0.2\\) 三个数的大小",
    "act": "先同底用单调性；不同底找<b>中间量 \\(0\\) 和 \\(1\\)</b> 分区，同区再找媒介值或换底",
    "card": "explog-compare",
    "label": "指对幂比大小三板斧"
  },
  {
    "id": "c11-log-change-base",
    "ch": 4,
    "sec": "b1-4-3",
    "cue": "对数式含不同底数相乘或求值（如 \\(\\log_2 3 \\cdot \\log_3 4\\)）",
    "act": "统一用<b>换底公式 \\(\\log_a b = \\dfrac{\\ln b}{\\ln a}\\)</b> 化为同底后约分消元",
    "card": "log-change-base",
    "label": "换底公式与推论"
  },
  {
    "id": "c12-zero-theorem",
    "ch": 4,
    "sec": "b1-4-5",
    "cue": "判断方程 \\(f(x)=g(x)\\) 实根个数或零点所在区间 \\((k,k+1)\\)",
    "act": "小区间定位用<b>零点存在定理 \\(f(a)f(b) &lt; 0\\)</b>；个数问题转化为两函数图象交点数",
    "card": "zero-theorem",
    "label": "零点存在定理与数形结合"
  },
  {
    "id": "c83-exp-root-power",
    "ch": 4,
    "sec": "b1-4-1",
    "cue": "已知 \\(x+x^{-1}=3\\)，求 \\(x^{\\frac12}+x^{-\\frac12}\\) 与 \\(x^2+x^{-2}\\) 的值",
    "act": "<b>平方搭桥</b>：\\(\\left(x^{\\frac12}+x^{-\\frac12}\\right)^2=x+x^{-1}+2=5\\)，因 \\(x&gt;0\\) 开方只取正根 \\(\\sqrt5\\)；\\(x^2+x^{-2}=(x+x^{-1})^2-2=7\\)",
    "card": "exp-root-power",
    "label": "对称幂平方互化"
  },
  {
    "id": "c84-exp-root-power",
    "ch": 4,
    "sec": "b1-4-1",
    "cue": "化简 \\(\\sqrt{(a-1)^2}+\\sqrt[3]{(1-a)^3}\\)（\\(a&lt;1\\)）",
    "act": "<b>偶次根式开出来带绝对值</b>：\\(\\sqrt{(a-1)^2}=|a-1|=1-a\\)；奇次根式直接开：\\(\\sqrt[3]{(1-a)^3}=1-a\\)。相加得 \\(2-2a\\)",
    "card": "exp-root-power",
    "label": "偶次根式运算红线"
  },
  {
    "id": "c85-exp-fn-prop",
    "ch": 4,
    "sec": "b1-4-2",
    "cue": "函数 \\(y=a^{x-2}+3\\)（\\(a&gt;0,\\ a\\ne1\\)）的图象恒过定点 \\(P\\)，求 \\(P\\) 的坐标",
    "act": "<b>令指数整体为 \\(0\\)</b>：\\(x-2=0\\) 得 \\(x=2\\)，此时 \\(a^0=1\\)，\\(y=4\\)，定点 \\((2,4)\\)，与 \\(a\\) 无关",
    "card": "exp-fn-prop",
    "label": "指数函数恒过定点"
  },
  {
    "id": "c86-exp-fn-prop",
    "ch": 4,
    "sec": "b1-4-2",
    "cue": "求函数 \\(y=\\left(\\dfrac12\\right)^{x^2-2x}\\) 的单调递增区间和值域",
    "act": "<b>同增异减</b>：外层底数 \\(\\dfrac12&lt;1\\) 递减，内层 \\(u=x^2-2x\\) 在 \\((-\\infty,1]\\) 递减，故复合函数在 \\((-\\infty,1]\\) 递增；值域由 \\(u\\ge-1\\) 得 \\(0&lt;y\\le 2\\)，别丢下界 \\(0\\)",
    "card": "exp-fn-prop",
    "label": "复合指数函数同增异减"
  },
  {
    "id": "c13-trig-know1get2",
    "ch": 5,
    "sec": "b1-5-2",
    "cue": "已知 \\(\\sin\\alpha+\\cos\\alpha\\)、\\(\\sin\\alpha-\\cos\\alpha\\)、\\(\\sin\\alpha\\cos\\alpha\\) 中的一个，求其余两个",
    "act": "利用平方桥梁 <b>\\((\\sin\\alpha\\pm\\cos\\alpha)^2 = 1 \\pm 2\\sin\\alpha\\cos\\alpha\\)</b>，再由象限判正负",
    "card": "trig-know1get2",
    "label": "同角三角「知一求二」"
  },
  {
    "id": "c14-trig-know1get2",
    "ch": 5,
    "sec": "b1-5-2",
    "cue": "已知 \\(\\tan\\alpha = m\\)，求关于 \\(\\sin\\alpha,\\cos\\alpha\\) 的齐次分式或二次齐次式的值",
    "act": "二次式先除以 \\(\\cos^2\\alpha+\\sin^2\\alpha=1\\)，分子分母同除以 \\(\\cos\\alpha\\)（或 \\(\\cos^2\\alpha\\)）化为 \\(\\tan\\alpha\\)",
    "card": "trig-know1get2",
    "label": "同角三角与弦切互化"
  },
  {
    "id": "c15-trig-aux-angle",
    "ch": 5,
    "sec": "b1-5-5",
    "cue": "求 \\(f(x) = a\\sin x + b\\cos x\\) 的最值、周期、单调区间或对称轴",
    "act": "提取 \\(\\sqrt{a^2+b^2}\\) 合一变形为 <b>\\(\\sqrt{a^2+b^2}\\sin(x+\\varphi)\\)</b>，再整体代换相位",
    "card": "trig-aux-angle",
    "label": "辅助角公式（合一变形）"
  },
  {
    "id": "c87-trig-rad-sector",
    "ch": 5,
    "sec": "b1-5-1",
    "cue": "一扇形的周长为 \\(20\\,\\text{cm}\\)，求其面积的最大值及此时圆心角的弧度数",
    "act": "设半径 \\(r\\)、弧长 \\(l\\)，则 \\(2r+l=20\\)，\\(S=\\dfrac12 lr\\)；<b>用基本不等式</b> \\(2r\\cdot l\\le\\left(\\dfrac{2r+l}{2}\\right)^2=100\\)，得 \\(S\\le 25\\)，取等时 \\(l=2r=10\\)，圆心角 \\(\\alpha=\\dfrac lr=2\\) 弧度",
    "card": "trig-rad-sector",
    "label": "扇形公式与周长定值最值"
  },
  {
    "id": "c88-trig-rad-sector",
    "ch": 5,
    "sec": "b1-5-1",
    "cue": "已知 \\(\\alpha\\) 是第二象限角，判断 \\(\\dfrac{\\alpha}{2}\\) 所在的象限",
    "act": "由 \\(\\dfrac\\pi2+2k\\pi&lt;\\alpha&lt;\\pi+2k\\pi\\) <b>整体除以 \\(2\\)</b> 得 \\(\\dfrac\\pi4+k\\pi&lt;\\dfrac\\alpha2&lt;\\dfrac\\pi2+k\\pi\\)，再分 \\(k\\) 为偶数、奇数讨论：第一或第三象限",
    "card": "trig-rad-sector",
    "label": "半角所在象限"
  },
  {
    "id": "c89-trig-unit-induce",
    "ch": 5,
    "sec": "b1-5-3",
    "cue": "已知 \\(\\sin\\left(\\alpha+\\dfrac{\\pi}{6}\\right)=\\dfrac13\\)，求 \\(\\cos\\left(\\alpha-\\dfrac{\\pi}{3}\\right)\\) 的值",
    "act": "<b>先算两个角的差</b>：\\(\\left(\\alpha+\\dfrac\\pi6\\right)-\\left(\\alpha-\\dfrac\\pi3\\right)=\\dfrac\\pi2\\)，互余直接用诱导公式：\\(\\cos\\left(\\alpha-\\dfrac\\pi3\\right)=\\cos\\left[\\left(\\alpha+\\dfrac\\pi6\\right)-\\dfrac\\pi2\\right]=\\sin\\left(\\alpha+\\dfrac\\pi6\\right)=\\dfrac13\\)",
    "card": "trig-unit-induce",
    "label": "凑角互余互补"
  },
  {
    "id": "c90-trig-unit-induce",
    "ch": 5,
    "sec": "b1-5-3",
    "cue": "化简 \\(\\dfrac{\\sin(\\pi-\\alpha)\\cos\\left(\\dfrac{3\\pi}{2}+\\alpha\\right)}{\\cos(\\pi+\\alpha)\\tan(-\\alpha)}\\)",
    "act": "逐项用<b>「奇变偶不变，符号看象限」</b>（把 \\(\\alpha\\) 当锐角定号）：\\(\\sin(\\pi-\\alpha)=\\sin\\alpha\\)，\\(\\cos\\left(\\dfrac{3\\pi}2+\\alpha\\right)=\\sin\\alpha\\)，\\(\\cos(\\pi+\\alpha)=-\\cos\\alpha\\)，\\(\\tan(-\\alpha)=-\\tan\\alpha\\)，约分得 \\(\\sin\\alpha\\)",
    "card": "trig-unit-induce",
    "label": "诱导公式口诀化简"
  },
  {
    "id": "c91-trig-graph-prop",
    "ch": 5,
    "sec": "b1-5-4",
    "cue": "求函数 \\(y=\\tan\\left(2x-\\dfrac{\\pi}{4}\\right)\\) 的定义域、最小正周期与对称中心",
    "act": "把 \\(2x-\\dfrac\\pi4\\) <b>整体代入 \\(\\tan x\\) 的结论</b>：\\(2x-\\dfrac\\pi4\\ne\\dfrac\\pi2+k\\pi\\) 得定义域；周期 \\(T=\\dfrac{\\pi}{|\\omega|}=\\dfrac\\pi2\\)；对称中心令 \\(2x-\\dfrac\\pi4=\\dfrac{k\\pi}{2}\\)（是 \\(\\dfrac{k\\pi}2\\) 不是 \\(k\\pi\\)），且正切没有对称轴",
    "card": "trig-graph-prop",
    "label": "正切函数性质整体代换"
  },
  {
    "id": "c92-trig-graph-prop",
    "ch": 5,
    "sec": "b1-5-4",
    "cue": "求 \\(y=2\\sin\\left(2x+\\dfrac{\\pi}{3}\\right)\\) 在 \\(\\left[0,\\dfrac{\\pi}{2}\\right]\\) 上的最大值与最小值",
    "act": "<b>先求整体相位的范围</b>：\\(2x+\\dfrac\\pi3\\in\\left[\\dfrac\\pi3,\\dfrac{4\\pi}3\\right]\\)，在 \\(\\sin\\) 图象上看这一段的最高最低：相位 \\(\\dfrac\\pi2\\) 时最大 \\(2\\)，相位 \\(\\dfrac{4\\pi}3\\) 时最小 \\(-\\sqrt3\\)",
    "card": "trig-graph-prop",
    "label": "区间上三角最值看相位"
  },
  {
    "id": "c93-trig-shift-scale",
    "ch": 5,
    "sec": "b1-5-6",
    "cue": "要得到 \\(y=\\sin\\left(2x-\\dfrac{\\pi}{3}\\right)\\) 的图象，只需把 \\(y=\\sin 2x\\) 的图象怎样平移",
    "act": "<b>平移量只看 \\(x\\) 自己</b>：\\(\\sin\\left(2x-\\dfrac\\pi3\\right)=\\sin\\left[2\\left(x-\\dfrac\\pi6\\right)\\right]\\)，向右平移 \\(\\dfrac\\pi6\\) 个单位，不是 \\(\\dfrac\\pi3\\)",
    "card": "trig-shift-scale",
    "label": "平移量除以 ω"
  },
  {
    "id": "c94-trig-shift-scale",
    "ch": 5,
    "sec": "b1-5-6",
    "cue": "\\(f(x)=A\\sin(\\omega x+\\varphi)\\)（\\(A&gt;0,\\ \\omega&gt;0,\\ |\\varphi|&lt;\\dfrac\\pi2\\)）的部分图象：最大值为 \\(2\\)，相邻最高点与最低点的横坐标相差 \\(\\dfrac{\\pi}{2}\\)，且图象过点 \\(\\left(\\dfrac{\\pi}{6},2\\right)\\)，求 \\(f(x)\\)",
    "act": "<b>按 \\(A\\to\\omega\\to\\varphi\\) 的顺序</b>：\\(A=2\\)；相邻最高与最低差半个周期，\\(\\dfrac T2=\\dfrac\\pi2\\Rightarrow T=\\pi,\\ \\omega=2\\)；代最高点 \\(2\\cdot\\dfrac\\pi6+\\varphi=\\dfrac\\pi2+2k\\pi\\) 得 \\(\\varphi=\\dfrac\\pi6\\)。代最值点比代零点稳",
    "card": "trig-shift-scale",
    "label": "由图象定解析式"
  },
  {
    "id": "c95-trig-periodic-model",
    "ch": 5,
    "sec": "b1-5-7",
    "cue": "摩天轮半径 \\(40\\,\\text{m}\\)，中心离地 \\(50\\,\\text{m}\\)，匀速转一圈用 \\(12\\,\\text{min}\\)，游客从最低点出发，求 \\(t\\) 分钟后离地高度 \\(h(t)\\)",
    "act": "设 \\(h=A\\sin(\\omega t+\\varphi)+B\\)：<b>先定平衡位置与振幅</b> \\(B=50,\\ A=40\\)，\\(\\omega=\\dfrac{2\\pi}{12}=\\dfrac\\pi6\\)；再代起点 \\(t=0,\\ h=10\\)（最低点）定 \\(\\varphi=-\\dfrac\\pi2\\)，即 \\(h=50-40\\cos\\dfrac{\\pi t}{6}\\)",
    "card": "trig-periodic-model",
    "label": "周期现象建模四步"
  },
  {
    "id": "c16-vec-coord-ops",
    "ch": 6,
    "sec": "b2-6-3",
    "cue": "两向量给出坐标 \\(\\boldsymbol{a}=(x_1,y_1), \\boldsymbol{b}=(x_2,y_2)\\)，求平行（共线）或垂直条件",
    "act": "垂直列 <b>\\(x_1x_2+y_1y_2=0\\)</b>；共线列交叉之差 <b>\\(x_1y_2-x_2y_1=0\\)</b>（切勿坐标相除防分母为 0）",
    "card": "vec-coord-ops",
    "label": "向量直角坐标运算与共线垂直"
  },
  {
    "id": "c17-vec-base-theorem",
    "ch": 6,
    "sec": "b2-6-3",
    "cue": "几何图形中求向量线性组合或点在线段上（\\(A,B,P\\) 三点共线）",
    "act": "设基底分解，若 \\(\\vec{OP}=x\\vec{OA}+y\\vec{OB}\\)，则三点共线充要条件为 <b>\\(x+y=1\\)</b>",
    "card": "vec-base-theorem",
    "label": "平面向量基本定理与三点共线"
  },
  {
    "id": "c18-vec-dot-product",
    "ch": 6,
    "sec": "b2-6-2",
    "cue": "求向量模长、夹角或投影向量",
    "act": "求模平方利用 <b>\\(|\\boldsymbol{a}|^2=\\boldsymbol{a}^2\\)</b>，求夹角套 \\(\\cos\\theta=\\dfrac{\\boldsymbol{a}\\cdot\\boldsymbol{b}}{|\\boldsymbol{a}||\\boldsymbol{b}|}\\)；投影向量为 \\((\\boldsymbol{a}\\cdot\\boldsymbol{e})\\boldsymbol{e}\\)",
    "card": "vec-dot-product",
    "label": "数量积、投影向量与垂直"
  },
  {
    "id": "c19-vec-sine-cosine-law",
    "ch": 6,
    "sec": "b2-6-4",
    "cue": "解三角形中出现两边及一对角（SSA 条件，已知 \\(a,b,A\\)）",
    "act": "正弦定理求 \\(\\sin B\\)，若 \\(A\\) 锐角且 \\(b\\sin A &lt; a &lt; b\\) 必有<b>两解</b>（大边对大角，一锐一钝），切忌漏掉钝角解",
    "card": "vec-sine-cosine-law",
    "label": "正弦余弦定理与边角互化"
  },
  {
    "id": "c96-vec-concept-equiv",
    "ch": 6,
    "sec": "b2-6-1",
    "cue": "判断：①若 \\(|\\boldsymbol a|=|\\boldsymbol b|\\)，则 \\(\\boldsymbol a=\\boldsymbol b\\)；②若 \\(\\boldsymbol a\\parallel\\boldsymbol b\\)，\\(\\boldsymbol b\\parallel\\boldsymbol c\\)，则 \\(\\boldsymbol a\\parallel\\boldsymbol c\\)；③平行四边形 \\(ABCD\\) 中 \\(\\overrightarrow{AB}=\\overrightarrow{DC}\\)",
    "act": "逐条用<b>「大小 + 方向」双要素</b>核对：①缺方向，错；②\\(\\boldsymbol b=\\boldsymbol 0\\) 时传递失效，错；③模相等且方向相同，对。零向量与「向量不能比大小」是这类判断题的常设陷阱",
    "card": "vec-concept-equiv",
    "label": "向量概念双要素与零向量"
  },
  {
    "id": "c97-vec-add-sub-tri",
    "ch": 6,
    "sec": "b2-6-2",
    "cue": "化简 \\(\\overrightarrow{AB}-\\overrightarrow{AC}+\\overrightarrow{BD}-\\overrightarrow{CD}\\)，并说明结果是什么",
    "act": "<b>减法化为「共起点，指向被减」</b>：\\(\\overrightarrow{AB}-\\overrightarrow{AC}=\\overrightarrow{CB}\\)，\\(\\overrightarrow{BD}-\\overrightarrow{CD}=\\overrightarrow{BD}+\\overrightarrow{DC}=\\overrightarrow{BC}\\)，相加 \\(\\overrightarrow{CB}+\\overrightarrow{BC}=\\boldsymbol 0\\)（零向量，不是数 \\(0\\)）",
    "card": "vec-add-sub-tri",
    "label": "向量加减法则化简"
  },
  {
    "id": "c98-vec-add-sub-tri",
    "ch": 6,
    "sec": "b2-6-2",
    "cue": "平行四边形 \\(ABCD\\) 中，\\(\\overrightarrow{AB}=\\boldsymbol a\\)，\\(\\overrightarrow{AD}=\\boldsymbol b\\)，用 \\(\\boldsymbol a,\\boldsymbol b\\) 表示 \\(\\overrightarrow{AC}\\) 与 \\(\\overrightarrow{BD}\\)",
    "act": "<b>共起点用平行四边形法则，差向量指向被减</b>：\\(\\overrightarrow{AC}=\\boldsymbol a+\\boldsymbol b\\)（对角线），\\(\\overrightarrow{BD}=\\overrightarrow{AD}-\\overrightarrow{AB}=\\boldsymbol b-\\boldsymbol a\\)",
    "card": "vec-add-sub-tri",
    "label": "平行四边形法则表示对角线"
  },
  {
    "id": "c20-complex-def-pure",
    "ch": 7,
    "sec": "b2-7-1",
    "cue": "题干说明复数 \\(z=a+bi\\) 为「实数」或「纯虚数」求参数",
    "act": "实数列 \\(b=0\\)；纯虚数必须同时列 <b>\\(a=0\\) 且 \\(b\\ne 0\\)</b>（注意：0 是实数不是纯虚数！）",
    "card": "complex-def-pure",
    "label": "代数形式与纯虚数条件"
  },
  {
    "id": "c21-complex-ops-conj",
    "ch": 7,
    "sec": "b2-7-2",
    "cue": "复数计算中分母含有虚数（如 \\(\\dfrac{a+bi}{c+di}\\)）或求共轭与模",
    "act": "分母实数化：分子分母同乘分母共轭 \\((c-di)\\)，分母化为 \\(c^2+d^2\\)；\\(i\\) 的高次幂按 4 周期化简",
    "card": "complex-ops-conj",
    "label": "复数四则运算与分母实数化"
  },
  {
    "id": "c22-complex-trig-form",
    "ch": 7,
    "sec": "b2-7-3",
    "cue": "求解复平面距离最值或乘法旋转伸缩（选学）",
    "act": "\\(|z_1-z_2|\\) 转化为两点距离；复数乘法几何意义为模长相乘、辐角相加（逆时针旋转）",
    "card": "complex-trig-form",
    "label": "复数三角表示与几何旋转"
  },
  {
    "id": "c99-complex-plane-mod",
    "ch": 7,
    "sec": "b2-7-1",
    "cue": "复数 \\(z=(m^2-1)+(m+1)\\mathrm i\\) 在复平面内对应的点位于第二象限，求实数 \\(m\\) 的取值范围",
    "act": "<b>按点 \\((a,b)\\) 的坐标列象限条件</b>：实部 \\(m^2-1&lt;0\\) 且虚部 \\(m+1&gt;0\\)，解得 \\(-1&lt;m&lt;1\\)",
    "card": "complex-plane-mod",
    "label": "复数对应点的象限"
  },
  {
    "id": "c100-complex-plane-mod",
    "ch": 7,
    "sec": "b2-7-1",
    "cue": "已知 \\(z=3-4\\mathrm i\\)，求 \\(|z|\\)，并说明 \\(|z-(1+\\mathrm i)|\\) 的几何意义",
    "act": "\\(|z|=\\sqrt{3^2+(-4)^2}=5\\)；<b>\\(|z_1-z_2|\\) 是两点间距离</b>：点 \\((3,-4)\\) 到点 \\((1,1)\\) 的距离 \\(\\sqrt{29}\\)",
    "card": "complex-plane-mod",
    "label": "复数的模与距离意义"
  },
  {
    "id": "c23-geo-oblique-drawing",
    "ch": 8,
    "sec": "b2-8-2",
    "cue": "已知原平面多边形求斜二测直观图面积，或已知直观图面积逆求原图真实面积",
    "act": "正向 \\(S'=\\dfrac{\\sqrt{2}}{4}S\\)；<b>逆向求原面积必用 \\(S=2\\sqrt{2}S'\\)</b>（原图更大，切勿除以 \\(2\\sqrt{2}\\)）",
    "card": "geo-oblique-drawing",
    "label": "斜二测画法与面积公式"
  },
  {
    "id": "c24-geo-surface-volume",
    "ch": 8,
    "sec": "b2-8-3",
    "cue": "求圆锥、圆台的表面积与侧面积，或求组合体表面积",
    "act": "侧面积公式用母线 \\(l=\\sqrt{r^2+h^2}\\) 代入 \\(\\pi rl\\)（切勿误用高 \\(h\\)）；<b>组合体必须扣除封闭在内部的接合面</b>",
    "card": "geo-surface-volume",
    "label": "表面积与体积公式全景"
  },
  {
    "id": "c25-geo-basic-facts-skew",
    "ch": 8,
    "sec": "b2-8-4",
    "cue": "立体几何中判断两直线位置关系或求异面直线所成的角",
    "act": "平移一条线与另一条线相交，转化为同一三角形内求角；<b>异面夹角范围 \\((0,90^\\circ]\\)</b>，若算得钝角必须取其补角",
    "card": "geo-basic-facts-skew",
    "label": "基本事实与异面直线所成角"
  },
  {
    "id": "c26-geo-parallel-circuits",
    "ch": 8,
    "sec": "b2-8-5",
    "cue": "证明直线与平面平行（\\(a\\parallel\\alpha\\)）或两平面平行（\\(\\alpha\\parallel\\beta\\)）",
    "act": "线面平行必书写 <b>\\(a\\not\\subset\\alpha\\)</b>、\\(b\\subset\\alpha\\)、\\(a\\parallel b\\)；面面平行必须在一个面内找<b>两条相交直线</b>分别平行于另一平面",
    "card": "geo-parallel-circuits",
    "label": "空间平行判定与转化回路"
  },
  {
    "id": "c27-geo-perp-dihedral",
    "ch": 8,
    "sec": "b2-8-6",
    "cue": "证明线面垂直，或求直线与平面所成角、二面角平面角",
    "act": "线面垂直须垂直面内<b>两条相交直线</b>；线面角为斜线与正射影夹角（\\([0,90^\\circ]\\)）；二面角须在棱上同一点作<b>两条垂直于棱的射线</b>（范围 \\([0,180^\\circ]\\)）",
    "card": "geo-perp-dihedral",
    "label": "线面面面垂直与二面角"
  },
  {
    "id": "c101-geo-polyhedron-rot",
    "ch": 8,
    "sec": "b2-8-1",
    "cue": "判断：①有两个面互相平行、其余各面都是平行四边形的几何体是棱柱；②用一个平面截棱锥，底面与截面之间的部分是棱台；③直角三角形绕它的一条边旋转一周得到圆锥",
    "act": "回到<b>定义的每一个限定词</b>：①还需相邻侧面的公共边互相平行，错（两个斜棱柱拼接即反例）；②截面必须平行于底面，错；③必须绕直角边旋转，绕斜边得到两个圆锥的组合体，错",
    "card": "geo-polyhedron-rot",
    "label": "多面体与旋转体定义识别"
  },
  {
    "id": "c44-stat-sampling",
    "ch": 9,
    "sec": "b2-9-1",
    "cue": "不同层间特征差异明显（如不同年级、走读住校）抽样",
    "act": "用<b>比例分层抽样</b>：每层抽取数 \\(n_i = n\\times \\dfrac{N_i}{N}\\)",
    "card": "stat-sampling",
    "label": "分层抽样模型"
  },
  {
    "id": "c45-stat-percentile-var",
    "ch": 9,
    "sec": "b2-9-2",
    "cue": "求直方图频率、第 \\(p\\) 百分位数或样本方差",
    "act": "直方图<b>面积代表频率</b>；百分位数算 \\(i=n\\cdot p\\%\\)（整数取两项平均，非整数上取整）；方差除以 \\(n\\)",
    "card": "stat-percentile-var",
    "label": "百分位数与方差公式"
  },
  {
    "id": "c46-stat-merge-var",
    "ch": 9,
    "sec": "b2-9-3",
    "cue": "两组或多组数据合并求总均值与总方差",
    "act": "合并方差由<b>层内平均方差</b>与<b>层间均值波动</b>叠加而成，绝不可直接平均两组方差",
    "card": "stat-merge-var",
    "label": "两层方差分解公式"
  },
  {
    "id": "c47-prob-classical-events",
    "ch": 10,
    "sec": "b2-10-1",
    "cue": "掷骰子/摸球等有限个等可能结果求概率",
    "act": "<b>古典概型</b> \\(P(A)=\\dfrac{|A|}{|\\Omega|}\\)；对立事件转化 \\(P(A)=1-P(\\overline{A})\\)",
    "card": "prob-classical-events",
    "label": "古典概型与互斥对立"
  },
  {
    "id": "c48-prob-independence",
    "ch": 10,
    "sec": "b2-10-2",
    "cue": "多系统同时工作、独立射击或求「至少一个发生」",
    "act": "独立充要条件 <b>\\(P(AB)=P(A)P(B)\\)</b>；至少一个发生套路：\\(1-P(\\overline{A})P(\\overline{B})\\)（互斥正概率事件必不独立）",
    "card": "prob-independence",
    "label": "事件独立性与乘法公式"
  },
  {
    "id": "c102-prob-freq-sim",
    "ch": 10,
    "sec": "b2-10-3",
    "cue": "某种子的发芽率约为 \\(80\\%\\)，用随机模拟估计「\\(4\\) 粒种子中至少 \\(3\\) 粒发芽」的概率，说明随机数的设计方法",
    "act": "<b>让随机数字的比例等于理论概率</b>：用 \\(0\\sim9\\) 的随机数，规定 \\(1\\sim8\\) 表示发芽、\\(9,0\\) 表示不发芽；每 \\(4\\) 个数字一组产生 \\(N\\) 组，统计含 \\(3\\) 个或 \\(4\\) 个「发芽数字」的组数 \\(n\\)，用频率 \\(\\dfrac nN\\) 估计",
    "card": "prob-freq-sim",
    "label": "随机模拟设计"
  },
  {
    "id": "c103-prob-freq-sim",
    "ch": 10,
    "sec": "b2-10-3",
    "cue": "抛一枚均匀硬币连续出现 \\(5\\) 次正面，有人说「第 \\(6\\) 次更可能是反面」，判断对错并说明理由",
    "act": "<b>每次试验相互独立</b>，第 \\(6\\) 次正面的概率仍是 \\(0.5\\)；频率在大量重复中趋于稳定是宏观规律，不会「补偿」前面的结果",
    "card": "prob-freq-sim",
    "label": "破除赌徒谬误"
  },
  {
    "id": "c28-vec3-base-theorem",
    "ch": 11,
    "sec": "e1-1-2",
    "cue": "利用基底表示空间向量，或证明空间四点共面（\\(P,A,B,C\\) 共面）",
    "act": "选不共面三向量为基底；四点共面充要条件：<b>\\(\\vec{OP}=x\\vec{OA}+y\\vec{OB}+z\\vec{OC}\\) 且 \\(x+y+z=1\\)</b>",
    "card": "vec3-base-theorem",
    "label": "空间基底与四点共面"
  },
  {
    "id": "c29-vec3-coord-ops",
    "ch": 11,
    "sec": "e1-1-3",
    "cue": "建立空间直角坐标系，求平面法向量 \\(\\boldsymbol{n}=(x,y,z)\\)",
    "act": "找平面内两不共线向量 \\(\\boldsymbol{v}_1,\\boldsymbol{v}_2\\)，列方程组 \\(\\boldsymbol{n}\\cdot\\boldsymbol{v}_1=0,\\ \\boldsymbol{n}\\cdot\\boldsymbol{v}_2=0\\)，令某一非零未知数为 1 求得非零解",
    "card": "vec3-coord-ops",
    "label": "坐标运算与垂直判定"
  },
  {
    "id": "c30-vec3-distance-angles",
    "ch": 11,
    "sec": "e1-1-4",
    "cue": "求点 \\(P\\) 到平面 \\(\\alpha\\) 的距离",
    "act": "面内任取一点 \\(A\\)，套用点面距公式 <b>\\(d = \\dfrac{|\\vec{AP}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{n}|}\\)</b>（分子绝对值切勿漏掉）",
    "card": "vec3-distance-angles",
    "label": "三大夹角与点面距公式"
  },
  {
    "id": "c31-vec3-distance-angles",
    "ch": 11,
    "sec": "e1-1-4",
    "cue": "求直线与平面所成的角 \\(\\theta\\in[0,90^\\circ]\\)",
    "act": "方向向量 \\(\\boldsymbol{u}\\) 与法向量 \\(\\boldsymbol{n}\\)，利用互余关系必用 <b>\\(\\sin\\theta = \\dfrac{|\\boldsymbol{u}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{u}||\\boldsymbol{n}|}\\)</b>（注意是正弦！）",
    "card": "vec3-distance-angles",
    "label": "三大夹角与点面距公式"
  },
  {
    "id": "c32-vec3-distance-angles",
    "ch": 11,
    "sec": "e1-1-4",
    "cue": "求二面角的大小 \\(\\theta\\in[0,180^\\circ]\\)",
    "act": "求两平面法向量 \\(\\boldsymbol{n}_1,\\boldsymbol{n}_2\\)，<b>先观察图形二面角是钝角还是锐角</b>：钝角取 \\(\\cos\\theta&lt;0\\)，锐角取 \\(\\cos\\theta&gt;0\\)（切勿机械只取绝对值）",
    "card": "vec3-distance-angles",
    "label": "三大夹角与点面距公式"
  },
  {
    "id": "c104-vec3-ops-coplanar",
    "ch": 11,
    "sec": "e1-1-1",
    "cue": "已知空间向量 \\(\\boldsymbol a=(1,0,2)\\)，\\(\\boldsymbol b=(0,1,-1)\\)，\\(\\boldsymbol p=(2,-3,7)\\)，判断 \\(\\boldsymbol p\\) 与 \\(\\boldsymbol a,\\boldsymbol b\\) 是否共面",
    "act": "用<b>共面向量定理</b>：设 \\(\\boldsymbol p=x\\boldsymbol a+y\\boldsymbol b\\)，由前两个坐标得 \\(x=2,\\ y=-3\\)，代第三个坐标检验 \\(2\\cdot2+(-3)\\cdot(-1)=7\\) 成立，故共面",
    "card": "vec3-ops-coplanar",
    "label": "共面向量定理判共面"
  },
  {
    "id": "c105-vec3-ops-coplanar",
    "ch": 11,
    "sec": "e1-1-1",
    "cue": "棱长为 \\(1\\) 的正方体 \\(ABCD\\text{-}A_1B_1C_1D_1\\) 中，求 \\(\\overrightarrow{AB_1}\\cdot\\overrightarrow{AC}\\)，以及 \\(\\overrightarrow{AB_1}\\) 在 \\(\\overrightarrow{AC}\\) 方向上的投影向量",
    "act": "<b>拆成两两垂直的基向量</b>：\\(\\overrightarrow{AB_1}=\\overrightarrow{AB}+\\overrightarrow{AA_1}\\)，\\(\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}\\)，交叉项全为 \\(0\\)，数量积 \\(=|\\overrightarrow{AB}|^2=1\\)；投影向量 \\(=\\dfrac{\\boldsymbol a\\cdot\\boldsymbol b}{|\\boldsymbol b|^2}\\,\\boldsymbol b=\\dfrac12\\overrightarrow{AC}\\)",
    "card": "vec3-ops-coplanar",
    "label": "基向量拆分求数量积与投影"
  },
  {
    "id": "c49-geom-line-five-forms",
    "ch": 12,
    "sec": "e1-2-2",
    "cue": "判断两条直线平行与垂直或求参数值",
    "act": "一般式充要条件：<b>平行 \\(A_1B_2-A_2B_1=0\\) 且 \\(A_1C_2-A_2C_1\ne 0\\)</b>；<b>垂直 \\(A_1A_2+B_1B_2=0\\)</b>（防漏斜率不存在特例）",
    "card": "geom-line-five-forms",
    "label": "直线方程与平行垂直充要条件"
  },
  {
    "id": "c50-geom-line-dist-intersect",
    "ch": 12,
    "sec": "e1-2-3",
    "cue": "求点到直线的垂直距离或两平行线间的夹层距离",
    "act": "点线距 <b>\\(d = \\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}\\)</b>；两平行线先配齐系数再套 \\(d = \\dfrac{|C_1-C_2|}{\\sqrt{A^2+B^2}}\\)",
    "card": "geom-line-dist-intersect",
    "label": "点线距与平行线距离"
  },
  {
    "id": "c51-geom-circle-pos-rel",
    "ch": 12,
    "sec": "e1-2-5",
    "cue": "求直线被圆截得的弦长或判断直线与圆相切/相交",
    "act": "<b>首选几何法垂径定理</b>：弦心距 \\(d\\)、半弦长与半径构成直角三角形，弦长 \\(|AB|=2\\sqrt{r^2-d^2}\\)；相切切线长 \\(L=\\sqrt{d^2-r^2}\\)",
    "card": "geom-circle-pos-rel",
    "label": "几何法弦长与位置关系"
  },
  {
    "id": "c52-geom-circle-line-rel",
    "ch": 12,
    "sec": "e1-2-4",
    "cue": "求圆的方程或由一般方程求圆心半径",
    "act": "几何特征选<b>标准方程</b> \\((x-a)^2+(y-b)^2=r^2\\)；三点坐标选<b>一般方程</b>（核查 \\(D^2+E^2-4F&gt;0\\)）",
    "card": "geom-circle-line-rel",
    "label": "圆的标准与一般方程"
  },
  {
    "id": "c106-geom-line-slope-eq",
    "ch": 12,
    "sec": "e1-2-1",
    "cue": "直线 \\(l\\) 过点 \\(A(1,2)\\)、\\(B(3,m)\\)，且倾斜角为钝角，求 \\(m\\) 的取值范围；若 \\(l\\) 的倾斜角为 \\(90^\\circ\\)，点 \\(B\\) 的坐标应满足什么",
    "act": "钝角即<b>斜率 \\(k&lt;0\\)</b>：\\(\\dfrac{m-2}{3-1}&lt;0\\) 得 \\(m&lt;2\\)；倾斜角 \\(90^\\circ\\) 时斜率不存在，须 \\(x_B=x_A=1\\)，此时不能套斜率公式",
    "card": "geom-line-slope-eq",
    "label": "倾斜角与斜率符号"
  },
  {
    "id": "c107-geom-line-slope-eq",
    "ch": 12,
    "sec": "e1-2-1",
    "cue": "已知直线的斜率 \\(k\\in[-1,\\sqrt3]\\)，求其倾斜角 \\(\\alpha\\) 的取值范围",
    "act": "<b>分 \\(k\\ge0\\) 与 \\(k&lt;0\\) 两段看 \\(\\tan\\alpha\\)</b>：\\(0\\le k\\le\\sqrt3\\Rightarrow\\alpha\\in\\left[0,\\dfrac\\pi3\\right]\\)；\\(-1\\le k&lt;0\\Rightarrow\\alpha\\in\\left[\\dfrac{3\\pi}4,\\pi\\right)\\)。两段取并集，不能写成一个连续区间",
    "card": "geom-line-slope-eq",
    "label": "由斜率范围求倾斜角范围"
  },
  {
    "id": "c33-conic-ellipse",
    "ch": 13,
    "sec": "e1-3-1",
    "cue": "题干给出到两定点距离之和等于常数，求轨迹方程或离心率",
    "act": "先检验 <b>\\(2a &gt; 2c\\)</b>，若满足则为椭圆；方程中<b>分母大者对应焦点所在轴</b>，几何量关系为 \\(a^2=b^2+c^2\\)（\\(a\\) 最大）",
    "card": "conic-ellipse",
    "label": "椭圆定义与几何量关系"
  },
  {
    "id": "c34-conic-hyperbola",
    "ch": 13,
    "sec": "e1-3-2",
    "cue": "题干给出双曲线方程求渐近线，或已知渐近线求双曲线方程",
    "act": "将方程右侧的 1 换为 0 即可得渐近线 <b>\\(y = \\pm\\dfrac{b}{a}x\\)</b>；双曲线焦点所在轴<b>只由正项决定</b>（非分母大小）",
    "card": "conic-hyperbola",
    "label": "双曲线与渐近线方程"
  },
  {
    "id": "c35-conic-parabola",
    "ch": 13,
    "sec": "e1-3-3",
    "cue": "抛物线上动点 \\(P\\) 到焦点的距离求最值，或已知焦点准线求方程",
    "act": "一次项系数除以 4 为焦点坐标；求最值第一直觉必用焦半径转准线：<b>\\(|PF| = d = x_0 + \\dfrac{p}{2}\\)</b>",
    "card": "conic-parabola",
    "label": "抛物线焦半径与焦点准线转化"
  },
  {
    "id": "c53-seq-an-sn-relation",
    "ch": 14,
    "sec": "e2-4-1",
    "cue": "已知前 \\(n\\) 项和 \\(S_n\\) 求通项公式 \\(a_n\\)",
    "act": "必须分步：\\(n=1\\) 时 \\(a_1=S_1\\)；\\(n\\ge 2\\) 时 \\(a_n = S_n - S_{n-1}\\)；<b>务必检验 \\(n=1\\) 是否吻合</b>",
    "card": "seq-an-sn-relation",
    "label": "S_n求a_n与n=1检验"
  },
  {
    "id": "c54-seq-arith-geom",
    "ch": 14,
    "sec": "e2-4-2",
    "cue": "等比数列求前 \\(n\\) 项和 \\(S_n\\)",
    "act": "<b>首要步骤：讨论公比 \\(q=1\\) 与 \\(q\\ne 1\\)</b>；\\(q\\ne 1\\) 时套 \\(S_n = \\dfrac{a_1(1-q^n)}{1-q}\\)",
    "card": "seq-arith-geom",
    "label": "等差等比性质全景"
  },
  {
    "id": "c55-seq-sum-methods",
    "ch": 14,
    "sec": "e2-4-3",
    "cue": "求「等差 \\(\\times\\) 等比」数列或分式相乘结构数列的和",
    "act": "等差乘等比用<b>错位相减法</b>（同乘公比错位相减）；分母乘积分式用<b>裂项相消法</b>",
    "card": "seq-sum-methods",
    "label": "错位相减与裂项相消"
  },
  {
    "id": "c56-seq-math-induction",
    "ch": 14,
    "sec": "e2-4-4",
    "cue": "证明与正整数 \\(n\\) 有关的恒等式或递推命题",
    "act": "<b>数学归纳法两步曲</b>：① 验证 \\(n=n_0\\) 成立；② <b>必须显式使用 \\(n=k\\) 假设</b>推导 \\(n=k+1\\) 成立",
    "card": "seq-math-induction",
    "label": "数学归纳法两步规范"
  },
  {
    "id": "c36-calc-derivative-def",
    "ch": 15,
    "sec": "e2-5-1",
    "cue": "求曲线 \\(y=f(x)\\) 在某点处的切线，或过某点向曲线引切线",
    "act": "区分「在点处（已知切点）」与「过点（先设切点 \\((x_0,f(x_0))\\)）」；切线方程用点斜式 <b>\\(y-f(x_0)=f'(x_0)(x-x_0)\\)</b>",
    "card": "calc-derivative-def",
    "label": "导数概念与切线几何意义"
  },
  {
    "id": "c37-calc-rules-composite",
    "ch": 15,
    "sec": "e2-5-2",
    "cue": "对分式函数或复合函数求导数",
    "act": "除法求导分子用 <b>\\(u'v - uv'\\)</b>（负号！分母平方）；复合函数按链式法则 <b>\\(f'(g(x))\\cdot g'(x)\\)</b>（切勿漏乘内层导数）",
    "card": "calc-rules-composite",
    "label": "导数公式与链式法则"
  },
  {
    "id": "c38-calc-monot-extrema",
    "ch": 15,
    "sec": "e2-5-3",
    "cue": "求函数单调区间、极值或在闭区间 \\([a,b]\\) 上的最值",
    "act": "令 \\(f'(x)=0\\) 解极值点；<b>极值点左右必须变号才成立</b>；闭区间最值必须把所有极值与<b>端点值 \\(f(a),f(b)\\) 一同比较</b>",
    "card": "calc-monot-extrema",
    "label": "单调性极值与闭区间最值"
  },
  {
    "id": "c39-count-principles",
    "ch": 16,
    "sec": "e3-6-1",
    "cue": "做完一件事，各方案相互独立直接做完（或，独立直达）",
    "act": "<b>分类加法计数原理</b>：各分类互斥，总数直接相加 \\(N = m_1 + m_2 + \\dots\\)",
    "card": "count-principles",
    "label": "分类加法计数原理"
  },
  {
    "id": "c40-count-principles",
    "ch": 16,
    "sec": "e3-6-1",
    "cue": "做完一件事必须分步连续完成，缺一不可（且，步步为营）",
    "act": "<b>分步乘法计数原理</b>：各步骤依次推进，总数连乘 \\(N = n_1 \\times n_2 \\times \\dots\\)",
    "card": "count-principles",
    "label": "分步乘法计数原理"
  },
  {
    "id": "c41-count-perm-comb",
    "ch": 16,
    "sec": "e3-6-2",
    "cue": "选出元素并讲求顺序（排队、不同职务、数字排列）",
    "act": "套用<b>排列数</b> \\(A_n^m = \\dfrac{n!}{(n-m)!}\\)（注意相邻用<b>捆绑法</b>且莫漏乘内部排列）",
    "card": "count-perm-comb",
    "label": "排列与捆绑法"
  },
  {
    "id": "c42-count-perm-comb",
    "ch": 16,
    "sec": "e3-6-2",
    "cue": "选出元素只组合不讲顺序（结伴、握手、同岗、指定元素不相邻）",
    "act": "套用<b>组合数</b> \\(C_n^m = \\dfrac{n!}{m!(n-m)!}\\)；不相邻问题用<b>插空法</b>（先排其余再插空）",
    "card": "count-perm-comb",
    "label": "组合与插空法"
  },
  {
    "id": "c43-count-binomial",
    "ch": 16,
    "sec": "e3-6-3",
    "cue": "二项式 \\((a+b)^n\\) 展开式求第 \\(k\\) 项或指定项系数、全系数和",
    "act": "通项公式 <b>\\(T_{r+1} = C_n^r a^{n-r} b^r\\)</b>（第 \\(k\\) 项代 \\(r=k-1\\)）；全系数和令 \\(x=1\\)，二项式系数和恒为 \\(2^n\\)",
    "card": "count-binomial",
    "label": "二项式展开与赋值法"
  },
  {
    "id": "c57-rv-cond-bayes",
    "ch": 17,
    "sec": "e3-7-1",
    "cue": "已知条件概率、多原因综合结果或由结果推断原因",
    "act": "前向推导套<b>全概率公式</b> \\(P(B)=\\sum P(A_i)P(B\\mid A_i)\\)；逆向归因套<b>贝叶斯公式</b>",
    "card": "rv-cond-bayes",
    "label": "全概率与贝叶斯公式"
  },
  {
    "id": "c58-rv-distrib-table",
    "ch": 17,
    "sec": "e3-7-2",
    "cue": "写离散型随机变量分布列或求参数",
    "act": "牢记两大基本性质：<b>非负性 \\(p_i\\ge 0\\)</b> 与<b>归一性 \\(\\sum p_i=1\\)</b>；相同变换取值合并相加",
    "card": "rv-distrib-table",
    "label": "分布列表格与归一性自检"
  },
  {
    "id": "c59-rv-binomial-hypergeom",
    "ch": 17,
    "sec": "e3-7-4",
    "cue": "有放回与不放回抽样中次品件数或成功次数分布",
    "act": "有放回服从<b>二项分布</b> \\(B(n,p)\\)（期望 \\(np\\)）；不放回服从<b>超几何分布</b>（期望 \\(n\\frac{M}{N}\\)）",
    "card": "rv-binomial-hypergeom",
    "label": "二项分布与超几何分布"
  },
  {
    "id": "c60-rv-expect-variance",
    "ch": 17,
    "sec": "e3-7-3",
    "cue": "求离散型随机变量线性变换后的均值与方差",
    "act": "期望线性 <b>\\(E(aX+b) = aE(X)+b\\)</b>；方差二次方 <b>\\(D(aX+b) = a^2 D(X)\\)</b>（常数 \\(b\\) 在方差中消除）",
    "card": "rv-expect-variance",
    "label": "期望方差线性变换"
  },
  {
    "id": "c61-rv-normal-distribution",
    "ch": 17,
    "sec": "e3-7-5",
    "cue": "正态分布 \\(X\\sim N(\\mu,\\sigma^2)\\) 求对称区间概率",
    "act": "利用<b>对称轴 \\(x=\\mu\\)</b> 翻转求区间面积；识别标准差 \\(\\sigma\\)（非方差）套 <b>\\(3\\sigma\\) 原则</b>（68.27%, 95.45%, 99.73%）",
    "card": "rv-normal-distribution",
    "label": "正态分布对称性与3σ原则"
  },
  {
    "id": "c62-bivar-corr-r",
    "ch": 18,
    "sec": "e3-8-1",
    "cue": "分析两个变量之间的散点图线性相关方向与强弱",
    "act": "计算<b>样本相关系数 \\(r\\)</b>：\\(r&gt;0\\) 正相关，\\(r&lt;0\\) 负相关；\\(|r|\\) 越近 1 相关性越强（相关不等于因果）",
    "card": "bivar-corr-r",
    "label": "相关系数 r 公式"
  },
  {
    "id": "c63-bivar-regression-fit",
    "ch": 18,
    "sec": "e3-8-2",
    "cue": "求经验回归直线方程参数或利用方程预测",
    "act": "最小二乘法求斜率 \\(\\hat{b}\\) 与截距 \\(\\hat{a}\\)；<b>经验回归直线必定经过样本中心点 \\((\\bar{x}, \\bar{y})\\)</b>",
    "card": "bivar-regression-fit",
    "label": "回归直线方程与样本中心"
  },
  {
    "id": "c64-bivar-chi-square",
    "ch": 18,
    "sec": "e3-8-3",
    "cue": "2×2 列联表分析两分类变量之间是否有关联",
    "act": "计算<b>卡方检验统计量 \\(\\chi^2\\)</b>，与临界值（3.841, 6.635）对比判定是否推翻独立零假设",
    "card": "bivar-chi-square",
    "label": "2x2 列联表与卡方检验"
  }
];
