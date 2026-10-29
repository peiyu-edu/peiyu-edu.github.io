/* Numeric answers for reviewed junior consolidation cards; explanations stay available. */
(function (root) {
  'use strict';
  var answers = {
    'consolidate-j25-1-lx-02': { values: [-1] },
    'consolidate-j26-3-fx-02': { values: [2] },
    'consolidate-zk-2025-yunnan-01': { values: [3] },
    'consolidate-zk-2023-xuzhou-05': { values: [24] },
    'consolidate-zk-2024-hainan-02': { values: [120] },
    'consolidate-zk-2023-shandong-04': { values: [1.5] },
    'consolidate-zk-2025-shanghai-05': { values: [6] },
    'consolidate-j7a-p1-gg-2': { values: [400], labels: ['五进制数字'], radixDigits: true },
    'consolidate-j7a-p2-gg-2': { values: [18.84] },
    'consolidate-j7b-p1-gg-2': { values: [40, 10], labels: ['x', 'y'] },
    'consolidate-j7b-p2-gg-3': { values: [5, 0.4], labels: ['日子数', '最小变化量'] }
  };

  function rational(text) {
    var value = String(text).normalize('NFKC').replace(/\s/g, '').replace(/−/g, '-');
    if (value.startsWith('\\(') && value.endsWith('\\)')) value = value.slice(2, -2);
    if (value.length > 200) return null;
    value = value.replace(/^([+-]?)\\(?:d?frac|tfrac)\{(\d+)\}\{(\d+)\}$/, '$1$2/$3');
    var fraction = value.match(/^([+-]?\d+)\/(\d+)$/);
    if (fraction) {
      var denominator = BigInt(fraction[2]);
      return denominator === 0n ? null : [BigInt(fraction[1]), denominator];
    }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
    var sign = value.charAt(0) === '-' ? -1n : 1n;
    var parts = value.replace(/^[+-]/, '').split('.');
    var digits = parts[1] || '';
    return [sign * BigInt((parts[0] || '0') + digits), 10n ** BigInt(digits.length)];
  }

  function number(text) {
    var value = rational(text);
    if (value === null) return null;
    var numerator = value[0], denominator = value[1];
    var a = numerator < 0n ? -numerator : numerator, b = denominator;
    while (b !== 0n) { var remainder = a % b; a = b; b = remainder; }
    numerator /= a; denominator /= a;
    // This convenience API returns a Number; decline unsafe conversions instead of silently rounding operands.
    var limit = BigInt(Number.MAX_SAFE_INTEGER);
    if (numerator > limit || numerator < -limit || denominator > limit) return null;
    return Number(numerator) / Number(denominator);
  }

  function grade(inputs, expected, radixDigits) {
    if (inputs.length !== expected.length) return 'invalid';
    if (radixDigits && inputs.some(function (input) {
      var value = String(input).normalize('NFKC').replace(/\s/g, '');
      if (value.startsWith('\\(') && value.endsWith('\\)')) value = value.slice(2, -2);
      return !/^[0-4]+$/.test(value);
    })) return 'invalid';
    var parsed = inputs.map(rational);
    if (parsed.some(function (v) { return v === null; })) return 'invalid';
    return parsed.every(function (v, i) {
      var target = rational(expected[i]);
      return target !== null && v[0] * target[1] === target[0] * v[1];
    }) ? 'correct' : 'incorrect';
  }

  function attach(card, spec) {
    var form = document.createElement('form');
    form.className = 'junior-consolidation-answer';
    var inputs = spec.values.map(function (_, i) {
      var label = document.createElement('label');
      label.textContent = spec.labels ? spec.labels[i] + '：' : '填写答案：';
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.margin = '0.4em 0.8em 0.4em 0';
      var input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'text';
      input.autocomplete = 'off';
      input.style.maxWidth = '9em';
      input.style.minHeight = '44px';
      input.style.font = 'inherit';
      input.style.background = 'var(--bg)';
      input.style.color = 'var(--fg)';
      input.style.border = '1px solid var(--line)';
      input.style.borderRadius = '8px';
      input.style.padding = '6px 10px';
      label.appendChild(input);
      form.appendChild(label);
      return input;
    });
    var button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn';
    button.textContent = '检查答案';
    form.appendChild(button);
    var message = document.createElement('p');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    form.appendChild(message);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var result = grade(inputs.map(function (input) { return input.value; }), spec.values, spec.radixDigits);
      message.textContent = result === 'correct' ? '对了！可以展开解析核对思路。' :
        result === 'incorrect' ? '还不对，再想一想。' : spec.radixDigits ? '请填写五进制数字。' : '请填写数字，例如 -1、1.5 或 3/2。';
    });
    card.insertBefore(form, card.querySelector('details'));
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { number: number, grade: grade, answers: answers, attach: attach };
  if (root.document) {
    var start = function () {
      document.querySelectorAll('[data-consolidation-id]').forEach(function (card) {
        var spec = answers[card.getAttribute('data-consolidation-id')];
        if (spec) attach(card, spec);
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
