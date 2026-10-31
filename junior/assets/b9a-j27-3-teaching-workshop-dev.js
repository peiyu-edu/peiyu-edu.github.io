/* Page-local worksheet: no persistence, grading, or learning-record writes. */
(function () {
  'use strict';
  function mount() {
    if (document.body.dataset.sec !== 'j27-3') return;
    const root = document.getElementById('j27-workshop');
    if (!root || root.dataset.workshopMounted) return;
    root.dataset.workshopMounted = 'true';
    const get = id => root.querySelector('#jw-' + id);
    const pairs = get('pairs');
    for (let row = 1; row <= 3; row++) {
      const line = document.createElement('div');
      line.className = 'jw-row';
      for (const [name, title] of [['l', 'L（m）'], ['f', 'F（N）']]) {
        const label = document.createElement('label');
        label.htmlFor = `jw-${name}${row}`;
        label.textContent = `第${row}组 ${title}`;
        const input = document.createElement('textarea');
        input.id = label.htmlFor;
        input.rows = 1;
        input.dataset.arithmetic = 'true';
        input.inputMode = 'decimal';
        input.maxLength = 16;
        input.autocomplete = 'off';
        label.append(input);
        line.append(label);
      }
      pairs.append(line);
    }
    function clear(kind) {
      get(kind + '-status').textContent = '';
      get(kind + '-rubric').hidden = true;
      get(kind + '-rubric').open = false;
    }
    for (const kind of ['model', 'experiment']) {
      const form = get(kind);
      for (const event of ['input', 'change']) {
        form.addEventListener(event, () => {
          clear(kind);
          if (kind === 'experiment') get('products').textContent = '';
          get('reset-status').textContent = '';
        });
      }
      form.addEventListener('submit', event => {
        event.preventDefault();
        const fields = [...form.querySelectorAll('textarea:not([data-arithmetic]), select')];
        const missing = fields.find(field => !field.value.trim());
        if (missing) {
          clear(kind);
          get(kind + '-status').textContent = '还有空项。可写尚缺的信息或计划；有内容后再对照准则。';
          missing.focus();
          return;
        }
        get(kind + '-status').textContent = '已展开自核准则；尚未判定正确，也未认证调查或实作。';
        get(kind + '-rubric').hidden = false;
        get(kind + '-rubric').open = true;
      });
    }
    // Closed ASCII decimal grammar. Trim outer whitespace only; never join tokens.
    // Fixed point integers (scale 10000) make all allowed products exact.
    function positive(raw) {
      const token = raw.trim();
      if (!/^(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,4})?$/.test(token)) return null;
      const [whole, fraction = ''] = token.split('.');
      const value = BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'));
      return value > 0n && value <= 10000000000n ? value : null;
    }
    function productText(value) {
      const digits = value.toString().padStart(9, '0');
      const fraction = digits.slice(-8).replace(/0+$/, '');
      return digits.slice(0, -8) + (fraction ? '.' + fraction : '');
    }
    get('calculate').addEventListener('click', () => {
      const products = [];
      for (let row = 1; row <= 3; row++) {
        const l = positive(get('l' + row).value), f = positive(get('f' + row).value);
        if (l === null || f === null) {
          get('products').textContent = `第${row}组需按所示语法填写两个范围内的正数。未计算，也未判定模型。`;
          return;
        }
        products.push(l * f);
      }
      const values = products.map(productText).join('、');
      get('products').textContent = `三组 F·L 为 ${values} N·m。` +
        (products.every(value => value === products[0]) ? '这些输入的积相同；' : '这些输入的积不同，请联系分度值与固定条件分析；') +
        '只核算输入算术，不能证明一般关系，也不能认证真实实验。';
    });
    get('reset').addEventListener('click', () => {
      for (const kind of ['model', 'experiment']) {
        get(kind).reset();
        clear(kind);
      }
      get('products').textContent = '';
      get('reset-status').textContent = '本工作单已清空，可重新调查、记录和自核。';
      get('info').focus();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
