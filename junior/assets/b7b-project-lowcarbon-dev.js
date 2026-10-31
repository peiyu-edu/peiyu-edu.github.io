/* j7b-p1 only. No storage, network, telemetry, or shared learning-record writes. */
(function () {
  'use strict';
  if (document.body.dataset.sec !== 'j7b-p1') return;
  var root = document.getElementById('lowcarbon-project');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  var SCALE = 1000000n;
  function el(id) { return root.querySelector('#lc-' + id); }
  function val(id) { return el(id).value.trim(); }
  function number(text, signed, bound) {
    var grammar = signed ? /^-?(?:0|[1-9]\d*)(?:\.\d{1,6})?$/ : /^(?:0|[1-9]\d*)(?:\.\d{1,6})?$/;
    if (!grammar.test(text)) throw Error('请按已声明的十进制语法填写，不能拼接空白、折叠上标或使用表达式。');
    var negative = text[0] === '-';
    var parts = (negative ? text.slice(1) : text).split('.');
    if (parts[0].length > String(bound).length) throw Error('数值超出本工具范围。');
    var result = BigInt(parts[0]) * SCALE + BigInt((parts[1] || '').padEnd(6, '0'));
    if (result > BigInt(bound) * SCALE) throw Error('数值超出本工具范围。');
    return negative ? -result : result;
  }
  function cents(product) { return (product * 100n + SCALE * SCALE / 2n) / (SCALE * SCALE); }
  function money(c) { return String(c / 100n) + '.' + String(c % 100n).padStart(2, '0'); }
  function required(id) {
    if (!val(id)) throw Error('还有空白项，请完成记录；不适用或未取得的数据须如实说明。');
    return val(id);
  }
  var rows = el('rows');
  // Real work begins blank. Labels are static; all student content uses textContent.
  for (var i = 0; i < 3; i++) {
    var group = document.createElement('fieldset');
    var legend = document.createElement('legend'); legend.textContent = '项目 ' + (i + 1); group.appendChild(legend);
    [['name', '项目名称'], ['quantity', '本月活动量'], ['unit', '活动量单位'],
      ['factor', '系数（kg CO₂ / 上述活动量单位）'],
      ['origin', '系数来源标题/链接、数据年份、地区及整车/每人口径'],
      ['evidence', '本月活动量依据（本机摘录/记录方法；不含个人标识）'],
      ['estimate', '我的项目排放估算（kg CO₂，2位小数）']].forEach(function (pair) {
      var label = document.createElement('label'); label.textContent = pair[1];
      var input = document.createElement('input'); input.type = 'text'; input.id = 'lc-' + pair[0] + '-' + i;
      input.maxLength = pair[0] === 'origin' || pair[0] === 'evidence' ? 1000 : 120;
      if (['quantity', 'factor', 'estimate'].includes(pair[0])) input.inputMode = 'decimal';
      label.htmlFor = input.id; label.appendChild(input); group.appendChild(label);
    });
    rows.appendChild(group);
  }
  var ledgerOK = false, modelOK = false, report = '';
  function clearReport() {
    report = ''; el('report-text').textContent = ''; el('report-feedback').textContent = ''; el('download').disabled = true;
  }
  function clearAllFeedback() {
    ledgerOK = false; modelOK = false;
    el('ledger-feedback').textContent = ''; el('model-feedback').textContent = ''; el('chart').replaceChildren(); clearReport();
  }
  root.addEventListener('input', clearAllFeedback);
  root.addEventListener('change', clearAllFeedback);
  function action(id, fn) {
    el(id).addEventListener('click', function () {
      try { fn(); } catch (error) {
        var target = id === 'check-ledger' ? 'ledger-feedback' : id === 'check-model' ? 'model-feedback' : 'report-feedback';
        el(target).textContent = error.message;
      }
    });
  }
  action('sample', function () {
    clearAllFeedback(); el('kind').value = 'fiction'; el('month').value = '2026-01';
    el('boundary').value = '虚构练习：只计本月用电、天然气和整车出行的二氧化碳；不计生命周期，其它项目未计入。系数均为教学示意，无官方适用年份。';
    [['用电', '180', '千瓦时', '0.6'], ['天然气', '16', '立方米', '2'], ['整车出行', '60', '千米', '0.2']].forEach(function (r, index) {
      ['name', 'quantity', 'unit', 'factor'].forEach(function (k, j) { el(k + '-' + index).value = r[j]; });
      el('origin-' + index).value = '本课虚构练习教学示意；非官方数据，适用年份/地区：无；' + (index === 2 ? '整车' : '所列活动量单位');
      el('evidence-' + index).value = '虚构活动量，未做家庭调查'; el('estimate-' + index).value = '';
    });
    el('total').value = '';
    el('ledger-feedback').textContent = '已载入明确标记的虚构数据。估算答案留白，请自行计算；未认证发生家庭调查。';
  });
  action('check-ledger', function () {
    ledgerOK = false; el('chart').replaceChildren(); clearReport();
    required('kind'); required('boundary');
    if (!/^[0-9]{4}-(?:0[1-9]|1[0-2])$/.test(val('month')) || val('month').startsWith('0000')) throw Error('请记录有效月份YYYY-MM。');
    var sum = 0n, entries = [];
    for (var j = 0; j < 3; j++) {
      var name = val('name-' + j), q = val('quantity-' + j), f = val('factor-' + j);
      var active = ['name','quantity','unit','factor','origin','evidence','estimate'].some(function (key) { return val(key + '-' + j) !== ''; });
      if (!active) continue;
      ['name', 'unit', 'origin', 'evidence'].forEach(function (key) { required(key + '-' + j); });
      var product = number(q, false, 1000000) * number(f, false, 1000);
      var answer = number(val('estimate-' + j), false, 1000000000);
      if (answer * 100n !== cents(product) * SCALE) throw Error('项目 ' + (j + 1) + ' 的估算需重算：用量乘系数，按约定四舍五入到2位。');
      sum += product; entries.push({ name: name, product: product });
    }
    if (!entries.length) throw Error('至少记录一个项目；未使用的项目请整行留空。');
    var total = number(val('total'), false, 3000000000);
    if (total * 100n !== cents(sum) * SCALE) throw Error('合计需重算：用各项未舍入乘积相加，最后四舍五入。');
    ledgerOK = true;
    el('ledger-feedback').textContent = '数值核对一致：所选项目小计 ' + money(cents(sum)) + ' kg CO₂（' + (val('kind') === 'fiction' ? '虚构练习' : '用户标记为真实摘录') + '）。来源、年份和单位文字已填写；真实性、单位匹配和是否漏项仍需你与同伴核实。';
    var title = document.createElement('p'); title.textContent = val('month') + ' 所选项目二氧化碳估算小计图（kg CO₂）'; el('chart').appendChild(title);
    var max = entries.reduce(function (a, e) { return e.product > a ? e.product : a; }, 0n);
    entries.forEach(function (e) {
      var line = document.createElement('p'); line.textContent = e.name + '：' + money(cents(e.product)) + ' kg CO₂';
      var bar = document.createElement('div'); bar.className = 'lc-bar'; bar.style.width = max ? String(Number(e.product * 10000n / max) / 100) + '%' : '0%';
      line.appendChild(bar); el('chart').appendChild(line);
    });
  });
  action('check-model', function () {
    modelOK = false; clearReport();
    var a = number(val('a'), true, 1000000), b = number(val('b'), true, 1000000), c = number(val('c'), true, 1000000);
    if (!/^(?:0|[1-9]\d{0,2})$/.test(val('days')) || Number(val('days')) > 366) throw Error('D须为0～366的整数。');
    var D = Number(val('days')), op = required('relation'), actual = [];
    if (!['=', '<=', '>=', '<', '>'].includes(op)) throw Error('请选择支持的关系。');
    for (var d = 0; d <= D; d++) {
      var lhs = a * BigInt(d) + b;
      if ((op === '=' && lhs === c) || (op === '<=' && lhs <= c) || (op === '>=' && lhs >= c) || (op === '<' && lhs < c) || (op === '>' && lhs > c)) actual.push(d);
    }
    var text = required('answer'), supplied;
    if (text === '全部') supplied = Array.from({length:D + 1}, function (_, x) { return x; });
    else if (text === '无') supplied = [];
    else {
      if (!/^(?:0|[1-9]\d{0,2})(?:,(?:0|[1-9]\d{0,2}))*$/.test(text)) throw Error('天数只接受英文逗号分隔的非负整数，或“全部”“无”；不删数中空白，不支持区间/上标。');
      supplied = text.split(',').map(Number);
      if (new Set(supplied).size !== supplied.length || supplied.some(function (x) { return x > D; })) throw Error('天数不能重复或超过D。');
      supplied.sort(function(x,y) { return x-y; });
    }
    if (JSON.stringify(supplied) !== JSON.stringify(actual)) throw Error('与该数字关系的全部可行整数天数不一致。重查符号、负系数变号、端点、非负及D上限；再试一次。');
    modelOK = true;
    el('model-feedback').textContent = '所填数字关系在0～D整数域内核对一致，共 ' + actual.length + ' 种。' + (a === 0n ? 'a=0，已退化为常数比较，须重新审视一次模型的选择。' : '一般思路：先移项得到ax与c−b比较；a为负数时除以a需反向，再结合实际整数范围。') + ' 此结果只验证你输入的关系，不认证提问、现实翻译、调查或最优性。';
  });
  action('report', function () {
    clearReport();
    var fields = ['source','concepts','question','math-question','reasoning','roles','plan','interpret','peer','revision'];
    fields.forEach(required);
    if (!ledgerOK) throw Error('请先完成账本数值核对。编辑后需重新核对。');
    if (['a','b','c','relation','days','answer'].some(function (k) { return val(k); }) && !modelOK) throw Error('已填写天数核算，请先重新核对该数字关系。其它一次方程组可不填核算器，在过程文字中完整求解。');
    if (!['data','math','life'].every(function(k) { return el('rubric-' + k).checked; })) throw Error('请逐条自核；未满足时先修订，勾选只代表你的自评。');
    var lines = ['低碳项目报告（本机草稿）', '数据性质：' + el('kind').selectedOptions[0].textContent,
      '月份：' + val('month'), '核算边界：' + val('boundary'), '所选项目合计：' + val('total') + ' kg CO₂'];
    for (var r = 0; r < 3; r++) {
      if (!val('name-' + r)) continue;
      lines.push('项目：' + val('name-' + r), '活动量：' + val('quantity-' + r) + ' ' + val('unit-' + r),
        '系数：' + val('factor-' + r) + ' kg CO₂/' + val('unit-' + r), '系数来源：' + val('origin-' + r),
        '记录依据：' + val('evidence-' + r), '估算：' + val('estimate-' + r) + ' kg CO₂');
    }
    fields.forEach(function(k) { lines.push(el(k).parentElement.firstChild.textContent + '：\n' + val(k)); });
    if (modelOK) lines.push('自填数字关系：' + val('a') + 'x+(' + val('b') + ')' + val('relation') + val('c'), '0≤x≤' + val('days') + '，整数；自填可行天数：' + val('answer'));
    lines.push('自核：来源/单位、已学数学、现实限制已由填写者勾选。', '机器只核对数值与字段完整性，不认证资料真实、调查/合作已发生、开放文字正确或方案全局最优。');
    report = lines.join('\n\n'); el('report-text').textContent = report; el('download').disabled = false;
    el('report-feedback').textContent = '报告已整理。请按准则和同伴互核；文字仅作完整性提示，不自动评价内容。报告与图表均留在本机，展示前请移除个人信息。';
  });
  action('download', function () {
    if (!report) return;
    var url = URL.createObjectURL(new Blob([report], {type:'text/plain;charset=utf-8'}));
    var link = document.createElement('a'); link.href = url; link.download = '低碳项目本机报告.txt'; link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  action('reset', function () {
    root.querySelectorAll('input,textarea,select').forEach(function (node) { if (node.type === 'checkbox') node.checked = false; else node.value = ''; });
    clearAllFeedback(); el('source').focus();
  });
})();
