(function () {
  'use strict';
  const root = document.getElementById('self-example');
  if (document.body.dataset.sec !== 'j1-1' || !root) return;
  const field = name => root.querySelector('#self-' + name);
  const output = field('example-output');
  const clear = () => { output.textContent = ''; delete output.dataset.state; };
  root.addEventListener('input', clear);
  root.addEventListener('change', clear);
  root.addEventListener('reset', clear);

  // Closed syntax; never remove inner whitespace or normalize Unicode digits.
  function rational(raw, signed) {
    const text = raw.trim();
    if (text.length > 80) return null;
    const match = /^([+−-]?)([0-9]{1,24})(?:\.([0-9]{1,24})|\/([0-9]{1,24}))?$/.exec(text);
    if (!match || (!signed && match[1])) return null;
    let n = BigInt(match[2] + (match[3] || ''));
    const d = match[4] ? BigInt(match[4]) : 10n ** BigInt((match[3] || '').length);
    if (d === 0n) return null;
    if (match[1] === '-' || match[1] === '−') n = -n;
    return { n, d, text };
  }
  function show(state, message) {
    output.dataset.state = state;
    output.textContent = message;
  }
  root.addEventListener('submit', event => {
    event.preventDefault();
    clear();
    const names = ['scene', 'base', 'unit', 'dir-a', 'dir-b'];
    if (names.some(name => !field(name).value.trim()) || !field('positive').value) {
      show('retry', '请写全自己的情境、共同基准、单位、两个方向，并选择正方向。文字填全不表示相反关系已经成立。');
      return;
    }
    if (field('dir-a').value.trim() === field('dir-b').value.trim()) {
      show('retry', '两个方向的文字相同。请重新描述相反的两种方向，并核实它们是否针对同一种量。');
      return;
    }
    const sizes = ['a', 'b'].map(k => rational(field('size-' + k).value, false));
    const answers = ['a', 'b'].map(k => rational(field('signed-' + k).value, true));
    if ([...sizes, ...answers].some(x => x === null)) {
      show('retry', '请按数值语法填写两个大小和你写的两个带符号数。大小不带正负号，分母必须为正整数；不要把空格、单位、指数或算式写进数值。');
      return;
    }
    const signs = field('positive').value === 'a' ? [1n, -1n] : [-1n, 1n];
    if (sizes.some((x, i) => answers[i].n * x.d !== signs[i] * x.n * answers[i].d)) {
      show('retry', '数值或符号与当前规定不一致。逐个核对大小，再按你选的正方向决定符号；0 不分正负。修改后可以重试。');
      return;
    }
    if (['same-base', 'same-unit', 'opposite'].some(name => !field(name).checked)) {
      show('retry', '数值和符号与规定一致。请逐项自核共同基准、同一种量与单位、相反方向；不能确认时先修改情境，不必勉强勾选。');
      return;
    }
    const unit = field('unit').value.trim();
    const representation = sizes.map((x, i) => {
      const value = x.n === 0n ? '0' : (signs[i] > 0n ? '+' : '−') + x.text;
      return '量 ' + (i === 0 ? 'A' : 'B') + '（' + field('dir-' + (i === 0 ? 'a' : 'b')).value.trim() + '）：' + value + ' ' + unit;
    }).join('\n');
    const zero = sizes.some(x => x.n === 0n);
    show(zero ? 'zero' : 'numeric',
      '数值与符号核对一致；自由情境的相反关系尚未由程序判定。\n' +
      '我的情境：' + field('scene').value.trim() + '\n共同基准：' + field('base').value.trim() + '\n' +
      '规定方向 ' + field('positive').value.toUpperCase() + ' 为正。\n' + representation + '\n' +
      (zero ? '其中有 0：它在基准处，既非正数也非负数。这组数不是一正一负；要举两个实际相反方向的非零量，请修改大小及对应表示。\n' : '') +
      '请把情境与这两行表示读给同伴：共同基准是什么？是否同一种量、同一单位？两个方向为什么意义相反？有疑问就改写后再核对。');
  });
}());
