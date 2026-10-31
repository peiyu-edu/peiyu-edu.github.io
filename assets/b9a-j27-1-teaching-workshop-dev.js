(() => {
  'use strict';
  const root = document.getElementById('inverse-table-workshop');
  if (document.body.dataset.sec !== 'j27-1' || !root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = id => root.querySelector('#it-' + id);
  const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
  const ratio = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  function number(raw, product = false) {
    const s = raw.trim(), digits = product ? 12 : 3, places = product ? 4 : 2, den = product ? 6 : 2;
    const int = '(?:0|[1-9][0-9]{0,' + (digits - 1) + '})';
    const match = s.match(new RegExp('^(-?)(' + int + ')(?:\\.([0-9]{1,' + places + '})|/([1-9][0-9]{0,' + (den - 1) + '}))?$'));
    if (!match) return null;
    const d = match[4] ? BigInt(match[4]) : 10n ** BigInt((match[3] || '').length);
    const n = BigInt(match[2] + (match[3] || '')) * (match[1] ? -1n : 1n);
    return ratio(n, d);
  }
  const key = r => r[0] + '/' + r[1];
  const format = r => r[1] === 1n ? String(r[0]) : r[0] + '/' + r[1];
  const examples = {
    a: [['-3', '-4'], ['-2', '-6'], ['1', '12'], ['4', '3']],
    b: [['-4', '3'], ['-2', '6'], ['1', '-12'], ['3', '-4']],
    c: [['1', '12'], ['2', '6'], ['3', '4'], ['4', '2']],
    d: [['-2', '0'], ['-1', '0'], ['1', '0'], ['3', '0']]
  };
  let rows = [];
  function invalidate() { $('feedback').textContent = ''; delete $('feedback').dataset.state; }
  function render() {
    $('rows').replaceChildren();
    rows.forEach((row, i) => {
      const tr = document.createElement('tr');
      ['x', 'y', 'p'].forEach((field, j) => {
        const td = document.createElement('td'), input = document.createElement('input');
        input.type = 'text'; input.value = row[j]; input.autocomplete = 'off';
        input.setAttribute('aria-label', '第' + (i + 1) + '行' + ({x: 'x', y: 'y', p: '我算的积'}[field]));
        input.style.cssText = 'width:100%;min-width:0;box-sizing:border-box';
        input.addEventListener('input', () => { row[j] = input.value; invalidate(); });
        td.append(input); tr.append(td);
      });
      const td = document.createElement('td'), button = document.createElement('button');
      button.type = 'button'; button.textContent = '删'; button.setAttribute('aria-label', '删除第' + (i + 1) + '行');
      button.addEventListener('click', () => { rows.splice(i, 1); render(); invalidate(); });
      td.append(button); tr.append(td); $('rows').append(tr);
    });
    $('add').disabled = rows.length >= 10;
  }
  function message(s, state = 'retry') { $('feedback').textContent = s; $('feedback').dataset.state = state; }
  $('case').addEventListener('change', () => {
    rows = (examples[$('case').value] || []).map(pair => [...pair, '']);
    $('guess').value = ''; $('why').value = ''; render(); invalidate();
  });
  $('add').addEventListener('click', () => { if (rows.length < 10) rows.push(['', '', '']); render(); invalidate(); });
  $('guess').addEventListener('change', invalidate); $('why').addEventListener('input', invalidate);
  $('reset').addEventListener('click', () => { rows = []; $('case').value = ''; $('guess').value = ''; $('why').value = ''; render(); invalidate(); });
  $('check').addEventListener('click', () => {
    if (rows.length < 2) return message('比较活动请填至少两行、两个不同的 x；这不是函数定义对点数的要求。');
    const products = [], inputs = new Set();
    for (let i = 0; i < rows.length; i++) {
      const [x, y, p] = [number(rows[i][0]), number(rows[i][1]), number(rows[i][2], true)];
      if (!x || !y || !p) return message('第' + (i + 1) + '行请按声明的语法完整填写 x、y 和你算的积。');
      if (x[0] === 0n) return message('第' + (i + 1) + '行 x 为 0，不在反比例函数的允许范围内；请修正整张表，不能跳过这一行。');
      const actual = ratio(x[0] * y[0], x[1] * y[1]);
      if (key(actual) !== key(p)) return message('第' + (i + 1) + '行的乘积还需重算；先核对符号、分子和分母。');
      products.push(actual); inputs.add(key(x));
    }
    if (inputs.size < 2) return message('本比较活动需要至少两个不同的 x；等值的小数和分数算同一个数。');
    if (!$('guess').value || !$('why').value.trim()) return message('算完后请选择判断，并写下自己的检查依据。');
    const constant = products.every(p => key(p) === key(products[0]));
    const fits = constant && products[0][0] !== 0n;
    const correct = ($('guess').value === 'yes') === fits;
    const evidence = !constant ? '逐行比较后，积不全相同。' : products[0][0] === 0n ? '积确实恒为 0，但反比例函数要求非零常数。' : '全部行的积同为非零常数 ' + format(products[0]) + '。';
    message((correct ? '数值与选择核对相符。' : '请修改判断。') + evidence + '这里只核对当前有限表；不能据此证明全部非零实数或原生活模型。文字依据仍由你对照条件自核。', correct ? 'checked' : 'retry');
  });
  render();
})();
