/* 本页证明工坊：只核对封闭结构选择，不解析或自动认证自由证明。 */
(function () {
  'use strict';
  function init() {
    const root = document.getElementById('cline-workshop');
    if (!root || document.body.dataset.sec !== 'j30-1' || root.dataset.sec !== 'j30-1' || root.dataset.mounted === 'yes') return;
    root.dataset.mounted = 'yes';
    const tasks = {
      position: {
        question: '一般论证的起点',
        choices: ['用圆心到直线的距离与线上任意点到圆心的距离建立关系', '拖完所有滑块档位便证明任意圆成立', '先把直线看作切线，再用切线性质'],
        answer: '1',
        reasonQuestion: '怎样处理公共点的个数？',
        reasons: ['找到一个圆上点就足够了', '区分三个距离范围，并证明公共点存在性及个数上限', '图上没有显示的交点可以忽略'],
        reasonAnswer: '2',
        hint: '从线上任意点 P 出发。除比较距离，还要证明可能的交点能作出来，并且没有更多交点。',
        proof: [
          '设圆半径 r>0。若 O 不在 l 上，作 OH⊥l 于 H，d=OH；若 O 在 l 上，取 H=O，d=0。对 l 上任意点 P，当 O≠H 且 P≠H 时，由勾股定理 OP²=d²+HP²；P=H 时此式也成立。若 O=H，则 OP=HP，同样有此式，而不是对退化三角形用勾股。',
          'd<r：r²−d²>0。在 l 上从 H 向两个相反方向各取长度为 √(r²−d²) 的线段，端点记为 U、V。代入距离关系，OU²=OV²=r²，故 U、V 在圆上且不同。反过来任何公共点 P 都满足 HP²=r²−d²，因此只能是 U、V，共两个。d=0 时 U、V 是过圆心直径的两个端点，也恰有两个。',
          'd=r：OH=r，所以 H 在圆上，也在 l 上。对任何 P≠H，HP>0，于是 OP²=r²+HP²>r²，即 OP>r，不在圆上。因此仅有公共点 H。这里 r>0 保证 O≠H。',
          'd>r：对 l 上任意点 P，OP²=d²+HP²≥d²>r²，故 OP>r，无公共点。',
          'd 是非负距离，r 是正数，大小比较只有以上三种且互斥。由各情况下公共点数分别为 2、1、0，也可从公共点数反向确定 d 与 r 的关系。这才得到一般位置判定，而不是从有限图例推出定理。',
          '切线判定定理也由此得到：若 A 在圆上，l 经过 A 且 OA⊥l，那么圆心到 l 的距离 d=OA=r。由 d=r 时的唯一性论证，l 只与圆交于 A，故 l 是切线。这里 A 在圆上和 OA⊥l 两个条件都不能省略。'
        ],
        criteria: ['是否对任意线上点建立关系，说明 d=0 的特殊处理？', '是否由正的 √(r²−d²) 构造两个不同交点，并证只有这两个？', 'd=r 是否证明 H 是圆上点且唯一？d>r 是否排除全部点？', '反向判断是否由三种情况穷尽且互斥得到？']
      },
      known: {
        question: '先看公共点，再选辅助线',
        choices: ['没有公共点条件，任取线上点为切点', 'A 已在圆及 l 上，连接 OA，利用角度证明垂直', '题设中出现半径，直接用切线性质'],
        answer: '2',
        reasonQuestion: '得到直角的可用依据',
        reasons: ['OA=AP 的等腰三角形性质与内角和', '待证直线是切线，所以一定垂直', '图看起来是直角'],
        reasonAnswer: '1',
        hint: 'A 是公共点，但不是题设给出的切点。先由 OA=AP 求底角，再求 A 处的角。',
        proof: [
          'A 在圆上且在直线 l 上，OA=r>0。连接 OA。在 △OAP 中，OA=AP，所以 ∠AOP=∠OPA=45°。由三角形内角和，∠OAP=180°−45°−45°=90°，从而 OA⊥l（A、P 是 l 上不同的点）。',
          '因为 A 是圆上的点，l 经过半径 OA 的外端 A，且 l⊥OA，所以由切线判定定理，l 是圆的切线，A 是切点。也可说 d=OA=r，由已证位置关系判定相切。证明垂直之前没有使用切线性质。'
        ],
        criteria: ['是否先确认 A 同时在圆上和直线上，而非先叫它切点？', '是否用等腰三角形和内角和得到 90°，没有循环推理？', '结尾是否同时列出“过半径外端”和“垂直”两个条件？']
      },
      unknown: {
        question: '先看公共点，再选辅助线',
        choices: ['PB 上随取一点 H，把 OH 当作半径', '把 PB 的未知切点命名为 H，先用切线性质', '未给 PB 的公共点，作 OH⊥PB，垂足为 H'],
        answer: '3',
        reasonQuestion: '可用来比较长度的依据',
        reasons: ['两条线都经过 P，故距离相等', 'O 在角平分线上，到两边的垂直距离相等', 'PB 是待证切线，因此 OH=OA'],
        reasonAnswer: '2',
        hint: 'H 要由作垂线确定，不能由“切点”确定。角平分线性质比较的是两条垂线段，不是任意斜线段。',
        proof: [
          '题设未给 PB 与圆的公共点。过 O 作 OH⊥PB，垂足为 H，故圆心到直线 PB 的距离 d=OH。O 在 ∠APB 的角平分线上，OA⊥PA，OH⊥PB，由角平分线性质得 OH=OA。',
          '又 OA=r>0，所以 d=OH=OA=r。由已证的直线与圆位置关系，PB 与圆相切。此时才由 OH=r 知 H 在圆上，且 H 在 PB 上，故 H 是唯一公共点，即切点。非退化锐角及 O 在其内保证所作垂足在相应边的射线上。'
        ],
        criteria: ['是否先作圆心到 PB 的垂线，而不是凭空标切点？', '等长依据是否包含角平分线及两条垂线？', '是否在证得 d=r 后才确认 H 在圆上并称为切点？']
      },
      counter: {
        question: '先看公共点，再选辅助线',
        choices: ['PA 相切即可推出 PB 相切，无需辅助线', '未给 PB 的公共点，作 OH⊥PB 于 H 比较距离', '任取圆上一点 Q，断言 Q 也在 PB 上'],
        answer: '2',
        reasonQuestion: '题设实际支持的关系',
        reasons: ['d=OH=OA/2=r/2<r，应用一般位置判定', 'd=OA=r，因为 O 必在角平分线上', 'OA⊥PA 便有 OA⊥PB'],
        reasonAnswer: '1',
        hint: '本题没有角平分线条件。比较的是圆心到 PB 的垂直距离与正半径，不能把上一题的等距结论搬过来。',
        proof: [
          '过 O 作 OH⊥PB 于 H。由距离的定义及题设，d=OH=OA/2=r/2。因 r>0，0<r/2<r，所以 d<r，由任务 1 已证的一般位置关系可知 PB 与圆相交，恰有两个公共点，不是切线。',
          'OA=r 且 OA⊥PA 确实能证明 PA 是切线（A 是 PA 上的圆上点），但不能推出 PB 也相切。这里没有 O 在角平分线上的条件，也未给 PB 上的圆上点；不能偷用待证垂直或把 H 直接叫作切点。'
        ],
        criteria: ['是否把垂足 H 与公共点区分？本题 H 在圆内，不是切点。', '是否用 r>0 得到严格不等式，而非只说“不等”？', '是否给出两个公共点的一般依据，并指出角平分线条件缺失？']
      },
      contradiction: {
        question: '反证法的正确起点',
        choices: ['假设 OA 不垂直 l，再作圆心到 l 的垂线', 'l 是切线，先令 OA⊥l，再证 OA⊥l', '任取斜线段代替圆心到 l 的距离'],
        answer: '1',
        reasonQuestion: '最终应该出现的矛盾',
        reasons: ['图中的长度与测量值不一样', '两个半径不能相等', 'd<r 推出两个公共点，与已知唯一公共点矛盾'],
        reasonAnswer: '3',
        hint: '已知只有一个公共点，A 在圆上且在 l 上，故 OA=r。假设不垂直后，先证 d<r；使用的是已经独立证明的位置关系。',
        proof: [
          '已知 A 在圆上且在 l 上，OA=r>0。假设 OA 不垂直 l。若 O 就在 l 上，则 d=0<r，由任务 1 的一般位置关系知有两个公共点，立即与已知只有一个公共点矛盾。',
          '若 O 不在 l 上，过 O 作 OH⊥l 于 H。由假设 OA 不垂直 l，可知 H≠A，否则 OA 就是所作垂线。于是在非退化 Rt△OHA 中，OA 是斜边，OH 是直角边，OH<OA=r，即 d<r。也可由勾股定理 OA²=OH²+HA² 且 HA>0 得到。',
          '由任务 1 已独立证明的 d<r 时直线与圆有两个公共点，得到 l 是割线。这与题设“l 与圆只有一个公共点 A”矛盾。因此假设不成立，OA⊥l。推理中没有提前使用切线性质，也没有用切线性质来证明任务 1。'
        ],
        criteria: ['是否说明 OA=r 的依据是 A 在圆上，而非“看图”？', 'H≠A 是否来自不垂直的假设？是否单独处理 O 在 l 上？', '是否先由斜边大于直角边得到 d<r，再引用独立的位置定理？', '矛盾对象是否明确是“两个公共点”与“唯一公共点”，而非直接重复待证垂直？']
      }
    };
    function element(tag, text) {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      return node;
    }
    function choice(box, id, title, options) {
      const field = element('fieldset');
      field.id = id;
      field.style.cssText = 'min-width:0;border:1px solid var(--line);border-radius:8px;margin:8px 0 14px;padding:10px';
      field.append(element('legend', title));
      options.forEach((text, index) => {
        const label = element('label');
        label.style.cssText = 'display:flex;align-items:flex-start;gap:8px;margin:8px 0;overflow-wrap:anywhere';
        const input = element('input');
        input.type = 'radio';
        input.name = id;
        input.value = String(index + 1);
        input.style.cssText = 'flex-shrink:0;margin-top:6px';
        label.append(input, element('span', text));
        field.append(label);
      });
      box.append(field);
      return field;
    }
    function selected(field) {
      const input = field.querySelector('input:checked');
      return input ? input.value : '';
    }
    root.querySelectorAll('[data-proof]').forEach(box => {
      const name = box.dataset.proof;
      const task = tasks[name];
      if (!task) return;
      const prefix = 'cline-' + name;
      const strategy = choice(box, prefix + '-strategy', task.question, task.choices);
      const reason = choice(box, prefix + '-reason', task.reasonQuestion, task.reasons);
      const label = element('label', '我的论证（也可在此注明纸笔论证的核对要点）：');
      label.htmlFor = prefix + '-proof';
      const draft = element('textarea');
      draft.id = prefix + '-proof';
      draft.rows = 5;
      draft.style.cssText = 'display:block;box-sizing:border-box;width:100%;max-width:100%;color:var(--fg);background:var(--card);font:inherit;margin:6px 0 12px';
      const check = element('button', '核对结构与自查');
      check.type = 'button';
      check.className = 'btn';
      const reset = element('button', '清空本题重试');
      reset.type = 'button';
      reset.className = 'btn';
      const buttons = element('div');
      buttons.className = 'range-box';
      buttons.append(check, reset);
      const feedback = element('p');
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.dataset.feedback = name;
      const reference = element('details');
      reference.className = 'more';
      reference.hidden = true;
      reference.dataset.reference = name;
      reference.append(element('summary', '逐句核对参考论证与准则（不自动判真）'));
      task.proof.forEach(text => reference.append(element('p', text)));
      const list = element('ul');
      task.criteria.forEach(text => list.append(element('li', text)));
      reference.append(list, element('p', '请逐条检查自己的依据；有缺口就修改后重试。结构选项相符不代表文字论证成立。'));
      function invalidate() {
        feedback.textContent = '';
        reference.hidden = true;
        reference.open = false;
      }
      [strategy, reason, draft].forEach(input => {
        input.addEventListener('input', invalidate);
        input.addEventListener('change', invalidate);
      });
      check.addEventListener('click', () => {
        invalidate();
        if (!['1', '2', '3'].includes(selected(strategy)) || !['1', '2', '3'].includes(selected(reason))) {
          feedback.textContent = '请先完成两项结构选择，再核对论证。';
          return;
        }
        if (!draft.value.trim()) {
          feedback.textContent = '请先写下自己的论证，或注明纸笔论证的核对要点。';
          return;
        }
        const matches = Number(selected(strategy) === task.answer) + Number(selected(reason) === task.reasonAnswer);
        feedback.textContent = '结构选择 ' + matches + '/2 项相符。' + (matches < 2 ? task.hint : '请继续逐句自核。') + '文字论证未被自动判定；请展开参考链核对每条依据。';
        reference.hidden = false;
      });
      reset.addEventListener('click', () => {
        [strategy, reason].forEach(field => field.querySelectorAll('input').forEach(input => { input.checked = false; }));
        draft.value = '';
        invalidate();
        strategy.querySelector('input').focus();
      });
      box.append(label, draft, buttons, feedback, reference);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
