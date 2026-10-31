/* Page-local activities: no persistence, mastery events, eval or Unicode NFKC. */
(function () {
  'use strict';
  const EPS = 1e-8;
  function clean(source) {
    if (typeof source !== 'string' || source.length > 180) throw Error('输入过长，请把式子化简后核对。');
    const mapped = source.replace(/[０-９]/g, c => String(c.charCodeAt(0) - 0xff10))
      .replace(/[＋－＊／＝（）．]/g, c => '+-*/=().'['＋－＊／＝（）．'.indexOf(c)])
      .replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/');
    // Whitespace may separate syntax tokens, never fragments of one number.
    // Check after declared character mapping and before removing token spacing.
    if (/[0-9.]\s+[0-9.]/.test(mapped)) throw Error('暂不支持数字内部空白：请把每个数写完整；此次暂未核对，请改写后重试。');
    return mapped.replace(/\s/g, '');
  }
  function number(source) {
    const s = clean(source);
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s)) {
      throw Error('请用普通整数、小数或分数；上标、指数及其它符号暂不支持，未作数学对错判断。');
    }
    const parts = s.split('/').map(Number);
    const n = parts.length === 1 ? parts[0] : parts[0] / parts[1];
    if (!Number.isFinite(n) || Math.abs(n) > 1e6) throw Error('数值须有限、绝对值不超过一百万，分母不能为零。');
    return n;
  }
  // Recursive descent produces [x coefficient, y coefficient, constant].
  // Only scalar products/divisors are supported. No strings are executed.
  function expression(source) {
    const s = clean(source);
    if (!s || /[^0-9.xy+*/()\-]/.test(s)) throw Error('暂不支持这个写法：请用 x、y、普通数字、括号与 + - * / 改写；未作数学对错判断。');
    let i = 0;
    function checked(p) {
      if (p.some(n => !Number.isFinite(n) || Math.abs(n) > 1e9)) throw Error('中间数过大或无定义，请先化简。');
      return p;
    }
    function scale(p, k) { return checked(p.map(v => v * k)); }
    function add(p, q, k) { return checked(p.map((v, j) => v + k * q[j])); }
    function scalar(p) { return p[0] === 0 && p[1] === 0; }
    // Read the sign before recursing, so nested unary signs remain correct.
    function unary() {
      if (s[i] === '+' || s[i] === '-') { const sign = s[i++]; return scale(unary(), sign === '-' ? -1 : 1); }
      return primary();
    }
    function primary() {
      if (s[i] === '(') { i++; const p = sum(); if (s[i++] !== ')') throw Error('括号没有配对。'); return p; }
      if (s[i] === 'x' || s[i] === 'y') return s[i++] === 'x' ? [1, 0, 0] : [0, 1, 0];
      const m = s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if (!m) throw Error('缺少数或未知数，请检查符号。');
      i += m[0].length; return [0, 0, number(m[0])];
    }
    function product() {
      let p = unary();
      while (i < s.length) {
        let op = s[i];
        if (op === '*' || op === '/') i++;
        else if (op === '(' || op === 'x' || op === 'y') op = '*';
        else break;
        const q = unary();
        if (op === '/') {
          if (!scalar(q) || q[2] === 0) throw Error('仅支持除以非零常数；其它形式请先化简，未判错。');
          p = scale(p, 1 / q[2]);
        } else {
          if (!scalar(p) && !scalar(q)) throw Error('未知数相乘的写法暂不支持，请先改写成一次式，未判错。');
          p = scalar(q) ? scale(p, q[2]) : scale(q, p[2]);
        }
      }
      return p;
    }
    function sum() {
      let p = product();
      while (s[i] === '+' || s[i] === '-') { const op = s[i++]; p = add(p, product(), op === '+' ? 1 : -1); }
      return p;
    }
    const out = sum();
    if (i !== s.length) throw Error('式子未能完整读取，请检查括号或运算符。');
    return out;
  }
  function equation(source) {
    const sides = clean(source).split('=');
    if (sides.length !== 2) throw Error('每条方程需要且只需要一个等号。');
    const l = expression(sides[0]), r = expression(sides[1]);
    const row = l.map((v, i) => v - r[i]);
    const norm = Math.max(Math.abs(row[0]), Math.abs(row[1]));
    if (norm === 0) throw Error('这条式子没有未知数，不能作为这里的独立关系。');
    return row.map(v => v / norm);
  }
  function close(a, b, tolerance = EPS) { return Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b)); }
  function solve(rows) {
    const [[a,b,c], [d,e,f]] = rows, det = a * e - b * d;
    if (Math.abs(det) < 1e-10) throw Error('两条关系不能独立确定两个量：请检查是否重复、矛盾或过于接近。');
    return [(-c * e + b * f) / det, (-a * f + c * d) / det];
  }
  function matches(rows, expected) { const got = solve(rows); return got.every((v, i) => close(v, expected[i])); }
  function drink(variable) {
    if (!['big', 'small'].includes(variable)) throw Error('请先说明 x、y 各代表哪种单价。');
    const rows = variable === 'big' ? [[30,20,-520],[25,40,-620]] : [[20,30,-520],[40,25,-620]];
    return solve(rows);
  }
  function land(direction, cut) {
    if (!['vertical', 'horizontal'].includes(direction)) throw Error('请选择本活动支持的分界方式。');
    const span = direction === 'vertical' ? 30 : 20;
    if (!(cut > 0 && cut < span)) throw Error('分界须在内部：两种作物都要有地，不能退化为零面积或越出边界。');
    const a = cut * (direction === 'vertical' ? 20 : 30), b = 600 - a;
    const p = 2 * a, q = 3 * b, residual = p - 2 * q;
    return {direction, cut, a, b, p, q, residual, ok: Math.abs(residual) <= .05, exact: Math.abs(residual) <= 1e-7};
  }
  function fmt(n) { return String(Number(n.toFixed(6))); }
  // Node truth tests use exactly the runtime functions without a DOM.
  if (typeof module !== 'undefined' && module.exports) module.exports = {number, expression, equation, solve, matches, drink, land};
  if (typeof document === 'undefined') return;
  const model = document.getElementById('j103-model-form');
  if (!model) return;
  const get = (form, name) => form.elements.namedItem(name).value;
  const field = (form, name) => form.elements.namedItem(name);
  const out = document.getElementById('j103-model-out');
  let estimate = null;
  function invalidate() { out.textContent = '过程已修改，请重新核对；文字说明仍需自己检查。'; }
  model.addEventListener('input', invalidate);
  model.addEventListener('change', invalidate);
  document.getElementById('j103-record-estimate').addEventListener('click', () => {
    try {
      const big = number(get(model, 'estimateBig')), small = number(get(model, 'estimateSmall'));
      if (!(big > 0 && small > 0)) throw Error('单价估计请取正数。');
      if (!get(model, 'estimateReason').trim()) throw Error('请留下你的估计依据，再开始计算。');
      estimate = {big, small};
      document.getElementById('j103-estimates').disabled = true;
      document.getElementById('j103-work').disabled = false;
      document.getElementById('j103-check-work').disabled = false;
      document.getElementById('j103-estimate-out').textContent = `已记下：大杯 ${fmt(big)}、小杯 ${fmt(small)} 元/杯。精算后再比较；要改估计请重置。`;
      field(model, 'analysis').focus();
    } catch (e) { document.getElementById('j103-estimate-out').textContent = e.message; }
  });
  model.addEventListener('submit', event => {
    event.preventDefault();
    try {
      if (!estimate) throw Error('请先记下估计。');
      if (!get(model, 'analysis').trim() || !get(model, 'method').trim()) throw Error('请补充分析和消元说明；网页保留它们供自查，不自动判断文字含义。');
      const variable = get(model, 'variable'), expected = drink(variable);
      if (get(model, 'unit') !== 'price') throw Error('这里设的是单价：请区分单价、杯数和总收入的单位。');
      const rows = ['equation1','equation2'].map(n => equation(get(model, n)));
      if (!matches(rows, expected)) throw Error('这组方程与两天的固定单价条件不同解；请按设元逐项检查数量和金额关系。');
      const eliminated = equation(get(model, 'eliminated'));
      if (!((Math.abs(eliminated[0]) < EPS) !== (Math.abs(eliminated[1]) < EPS))) throw Error('消元后应恰好保留一个未知数，请写出那条一元一次方程。');
      if (!close(eliminated[0] * expected[0] + eliminated[1] * expected[1] + eliminated[2], 0)) throw Error('消元方程不成立，请检查倍乘、代入和符号。');
      const sx = number(get(model,'solutionX')), sy = number(get(model,'solutionY'));
      if (!close(sx, expected[0]) || !close(sy, expected[1])) throw Error('解与方程组不相符，请继续求解；变量交换时数值也要对应。');
      const [big,small] = variable === 'big' ? [sx,sy] : [sy,sx];
      const payments = [30*big,20*small,25*big,40*small];
      const names = ['day1Big','day1Small','day2Big','day2Small'];
      if (names.some((n,i) => !close(number(get(model,n)), payments[i], 1e-6))) throw Error('原题金额检验尚未对齐：每一笔都是杯数 × 对应单价，请逐笔计算。');
      if (!close(payments[0]+payments[1],520,1e-6) || !close(payments[2]+payments[3],620,1e-6)) throw Error('代回原题的两天收入没有同时满足，不能作答。');
      if (get(model,'feasibility') !== 'positive') throw Error('杯数要整数，不代表单价也必须整数；还须检查两种单价为正。');
      if (!close(number(get(model,'answerBig')),big) || !close(number(get(model,'answerSmall')),small)) throw Error('最后作答与设元或所求量不一致，请把大杯、小杯各自对应好。');
      out.textContent = `数值与关系核对通过。答：大杯 ${fmt(big)} 元/杯，小杯 ${fmt(small)} 元/杯。\n原题检验：30×${fmt(big)} + 20×${fmt(small)} = ${fmt(payments[0]+payments[1])} 元；25×${fmt(big)} + 40×${fmt(small)} = ${fmt(payments[2]+payments[3])} 元。单价为正，允许小数。\n与先前估计比较（精算−估计）：大杯 ${fmt(big-estimate.big)} 元/杯，小杯 ${fmt(small-estimate.small)} 元/杯。估计代入两天收入分别为 ${fmt(30*estimate.big+20*estimate.small)}、${fmt(25*estimate.big+40*estimate.small)} 元；经验估计仍须用两天数据检验。\n请自己核对文字分析是否用了两天不同的信息、消元说明能否推出所写的一元方程。网页只验证方程同解、消元结果、数值与原条件，不能认定文字推理完整或你此前没有看过示范。`;
    } catch (e) { out.textContent = e.message; }
  });
  model.addEventListener('reset', () => {
    estimate = null;
    document.getElementById('j103-estimates').disabled = false;
    document.getElementById('j103-work').disabled = true;
    document.getElementById('j103-check-work').disabled = true;
    document.getElementById('j103-estimate-out').textContent = '先填写估计；估计不要求正确。';
    out.textContent = '估计记录后再填写过程。文字分析和消元说明供你对照，不作自动语义评分。';
  });
  const form = document.getElementById('j103-land-form'), feedback = document.getElementById('j103-land-out');
  const preview = document.getElementById('j103-land-preview'), list = document.getElementById('j103-land-schemes');
  const compare = document.getElementById('j103-land-compare');
  let schemes = [];
  function draw() {
    try {
      const direction = get(form,'direction'), span = direction === 'vertical' ? 30 : 20, cut = number(get(form,'cut'));
      if (cut < 0 || cut > span) throw Error(`分界距离应在 0 到 ${span} m 之间。`);
      const ratio = cut/span;
      const a = document.getElementById('j103-land-a'), b = document.getElementById('j103-land-b');
      const attrs = direction === 'vertical' ? [[30,40,300*ratio,200],[30+300*ratio,40,300*(1-ratio),200]] : [[30,40,300,200*ratio],[30,40+200*ratio,300,200*(1-ratio)]];
      [a,b].forEach((node,i) => ['x','y','width','height'].forEach((key,j) => node.setAttribute(key, attrs[i][j])));
      field(form,'cutSlider').value = 100*ratio;
      preview.textContent = `${direction === 'vertical' ? '左侧' : '上侧'}为甲，距离 ${fmt(cut)} m，余下为乙。${cut === 0 || cut === span ? '此图退化，有一种作物没有面积，不能满足本题。' : '这是你的尝试，尚未核对产量比。'}`;
      document.getElementById('j103-land-fig').removeAttribute('hidden');
    } catch(e) { preview.textContent = e.message; document.getElementById('j103-land-fig').setAttribute('hidden',''); }
  }
  form.addEventListener('input', event => {
    if (event.target.name === 'cutSlider') {
      const span = get(form,'direction') === 'vertical' ? 30 : 20;
      field(form,'cut').value = fmt(Number(get(form,'cutSlider')) * span / 100);
    }
    draw(); feedback.textContent = '输入已修改，请核对当前方案；下方已保留方案仍供比较。';
  });
  field(form,'direction').addEventListener('change', () => {
    const span = get(form,'direction') === 'vertical' ? 30 : 20;
    field(form,'cut').value = fmt(Number(get(form,'cutSlider')) * span / 100); draw();
    feedback.textContent = '方向已改变，请核对当前方案。';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const expected = solve([[1,1,-600],[2,-6,0]]);
      if (!matches(['areaEquation','yieldEquation'].map(n=>equation(get(form,n))),expected)) throw Error('请检查两条关系：总面积来自长 × 宽，产量来自面积 × 单位面积产量；产量比不能直接当面积比。');
      const s = land(get(form,'direction'), number(get(form,'cut')));
      const detail = `甲面积 ${fmt(s.a)} m²、乙面积 ${fmt(s.b)} m²，总计 ${fmt(s.a+s.b)} m²；甲产 ${fmt(s.p)} kg、乙产 ${fmt(s.q)} kg。甲产量−2倍乙产量 = ${fmt(s.residual)} kg。`;
      if (!s.ok) { feedback.textContent = detail + '\n尚不满足所需产量比，请继续调整分界。'; return; }
      feedback.textContent = detail + (s.exact ? '\n此方案满足 2∶1。' : '\n此方案在 0.05 kg 的核对误差内近似满足 2∶1；可继续精确调整。');
      if (schemes.some(old => old.direction === s.direction)) { feedback.textContent += '\n这一分界方式已有方案，请换另一个方向试试。'; return; }
      schemes.push(s);
      const li = document.createElement('li');
      li.textContent = `${s.direction === 'vertical' ? '从左侧沿长边' : '从上侧沿宽边'}量 ${fmt(s.cut)} m，甲 ${fmt(s.a)} m²，乙 ${fmt(s.b)} m²${s.exact ? '' : '（近似）'}。`;
      const picture = document.createElementNS('http://www.w3.org/2000/svg','svg');
      picture.setAttribute('viewBox','0 0 360 240');
      picture.setAttribute('class','j103-land-fig');
      picture.setAttribute('role','img');
      picture.setAttribute('aria-label',s.direction === 'vertical' ? '已保留的左右分地方案，甲在左' : '已保留的上下分地方案，甲在上');
      const ratio = s.a/600;
      const boxes = s.direction === 'vertical' ? [[30,20,300*ratio,200],[30+300*ratio,20,300*(1-ratio),200]] : [[30,20,300,200*ratio],[30,20+200*ratio,300,200*(1-ratio)]];
      boxes.forEach((box,i) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute('class', i === 0 ? 'land-a' : 'land-b');
        ['x','y','width','height'].forEach((key,j) => rect.setAttribute(key,box[j]));
        picture.appendChild(rect);
      });
      li.appendChild(picture);
      list.appendChild(li);
      if (schemes.length === 2) {
        compare.hidden = false;
        compare.textContent = '两种划法的分界方向和长度不同，甲、乙各自面积却相同（或在核对误差内接近）。总面积与产量比先确定了各自面积，并没有唯一确定形状。这里两种方案已说明划法不唯一；不代表列尽所有划法。纸笔拓展：画一条折线分界，数格或分割计算两部分面积，再检查总面积与产量比。';
      }
    } catch(e) { feedback.textContent = e.message; }
  });
  form.addEventListener('reset', () => {
    schemes = []; list.replaceChildren(); compare.hidden = true; compare.textContent = '';
    feedback.textContent = '先写方程并操作分界，再核对；初始图只是一种尝试。';
    // Reset default values before drawing; native reset applies after this event.
    setTimeout(draw, 0);
  });
  draw();
})();
