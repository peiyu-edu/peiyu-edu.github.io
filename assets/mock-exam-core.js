/* Pure scoring and deadline logic shared by both stages. No DOM or answer fetches. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PeiyuMockExamCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function normal(value) {
    return String(value == null ? '' : value).trim().replace(/\\[()[\]]|\$/g, '')
      .replace(/\\(?:left|right|,|;|!|quad|qquad)|\s/g, '')
      .replace(/\\(?:dfrac|tfrac)/g, '\\frac').replace(/[，、；;]/g, ',')
      .replace(/−/g, '-').replace(/×|\\times|\\cdot/g, '*').replace(/÷/g, '/')
      .replace(/。$/, '');
  }
  // A small expression parser, not eval: only numeric fractions/radicals/powers.
  // Symbolic fill answers are compared conservatively as normalized text.
  function numeric(value) {
    function latex(text) {
      var i = 0;
      function group() {
        if (text[i++] !== '{') throw Error('group');
        var start = i, depth = 1;
        while (i < text.length && depth) { if (text[i] === '{') depth++; if (text[i] === '}') depth--; i++; }
        if (depth) throw Error('group');
        return latex(text.slice(start, i - 1));
      }
      var out = '';
      while (i < text.length) {
        if (text.slice(i, i + 5) === '\\frac') { i += 5; var a = group(), b = group(); out += '((' + a + ')/(' + b + '))'; }
        else if (text.slice(i, i + 5) === '\\sqrt' && text[i + 5] === '{') { i += 5; out += 'sqrt(' + group() + ')'; }
        else if (text[i] === '{') out += '(' + group() + ')';
        else out += text[i++];
      }
      return out;
    }
    var text;
    try { text = latex(normal(value)); } catch (_) { return null; }
    text = text.replace(/\\sqrt(\d)/g, 'sqrt($1)').replace(/\\pi|π/g, 'pi');
    if (!text || /[^0-9.eE+*/^()\-sqrtpi]/.test(text)) return null;
    var tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|sqrt|pi|[+*/^()\-]/g) || [];
    if (tokens.join('') !== text || tokens.length > 150) return null;
    var i = 0;
    function bounded(n) { if (!Number.isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER) throw Error('range'); return n; }
    function atom() {
      var token = tokens[i++], result;
      if (token === '(') { result = sum(); if (tokens[i++] !== ')') throw Error('bracket'); return result; }
      if (token === 'sqrt') { if (tokens[i++] !== '(') throw Error('sqrt'); result = sum(); if (tokens[i++] !== ')') throw Error('sqrt'); return Math.sqrt(result); }
      if (token === 'pi') return Math.PI;
      if (!token || !/^[\d.]/.test(token)) throw Error('number');
      return bounded(Number(token));
    }
    function power() { var n = atom(); return tokens[i] === '^' ? (i++, bounded(Math.pow(n, unary()))) : n; }
    function unary() { if (tokens[i] === '+') { i++; return unary(); } if (tokens[i] === '-') { i++; return -unary(); } return power(); }
    function product() {
      var n = unary();
      while (i < tokens.length && tokens[i] !== ')' && tokens[i] !== '+' && tokens[i] !== '-') {
        var token = tokens[i];
        if (token === '*' || token === '/') { i++; var b = unary(); n = bounded(token === '*' ? n * b : n / b); }
        else n = bounded(n * unary());
      }
      return n;
    }
    function sum() { var n = product(); while (tokens[i] === '+' || tokens[i] === '-') { var op = tokens[i++], b = product(); n = bounded(op === '+' ? n + b : n - b); } return n; }
    try {
      var result = sum();
      return i === tokens.length && Number.isFinite(result) && Math.abs(result) <= Number.MAX_SAFE_INTEGER ? result : null;
    } catch (_) { return null; }
  }
  function equivalent(choice, answer) {
    var a = normal(choice), b = normal(answer);
    if (!a || !b) return false;
    if (a === b) return true;
    var x = numeric(a), y = numeric(b);
    // Cap absolute tolerance so large counts cannot swallow an incorrect unit.
    return x !== null && y !== null && Math.abs(x - y) <= Number.EPSILON * 16 * Math.min(1e6, Math.max(Math.abs(x), Math.abs(y)));
  }
  function letters(value) {
    var s = String(value || '').trim().toUpperCase().replace(/[\s,，、]/g, '');
    return /^[A-E]+$/.test(s) ? Array.from(new Set(s.split(''))).sort().join('') : '';
  }
  function score(question, answer, choice, rule) {
    var max = question.maxScore;
    if (question.type === '解答' || answer.openAnswer) return null;
    if (question.type === '单选') return /^[A-E]$/.test(String(choice)) && choice === letters(answer.answer) ? max : 0;
    if (question.type === '多选') {
      var picked = letters(choice), right = letters(answer.answer);
      if (!picked || !right || picked.split('').some(function (c) { return right.indexOf(c) < 0; })) return 0;
      if (picked === right) return max;
      // From 2024: each correct selected option earns 2, any wrong option earns 0.
      return rule === 'new-per-option' ? Math.min(max, picked.length * 2) : Math.min(max, 2);
    }
    return equivalent(choice, answer.answer) ? max : 0;
  }
  function remaining(session, now) { return Math.max(0, session.deadline - now); }
  function account(session, now) {
    var until = Math.min(now, session.deadline), delta = Math.max(0, until - session.lastTick);
    session.times[session.current] = (session.times[session.current] || 0) + delta;
    session.lastTick = Math.max(session.lastTick, until);
  }
  function submit(session, now) {
    if (session.submittedAt) return;
    account(session, now);
    session.submittedAt = Math.min(now, session.deadline);
  }
  function grade(session, paper, answers) {
    if (!session.submittedAt) throw Error('Submit before grading');
    return paper.questions.map(function (q) { return score(q, answers[q.id], session.choices[q.id], paper.partialRule); });
  }
  return { normal: normal, numeric: numeric, equivalent: equivalent, score: score, remaining: remaining, account: account, submit: submit, grade: grade };
});
