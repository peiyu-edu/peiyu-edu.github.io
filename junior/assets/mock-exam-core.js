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
  // A small expression parser, not eval: numeric fractions/radicals/powers/logs.
  // Unsupported or ambiguous notation must go through self-assessment.
  function numeric(value) {
    if (String(value).length > 600 || /[\d.]\s+[\d.]/.test(String(value))) return null;
    function latex(text) {
      var i = 0;
      function endArgument() {
        // Without a written boundary the rest may belong inside the function.
        if (i < text.length && text[i] !== ')' && text[i] !== '}') throw Error('ambiguous function');
      }
      function group() {
        if (text[i++] !== '{') throw Error('group');
        var start = i, depth = 1;
        while (i < text.length && depth) { if (text[i] === '{') depth++; if (text[i] === '}') depth--; i++; }
        if (depth) throw Error('group');
        return latex(text.slice(start, i - 1));
      }
      // TeX arguments may be braced or a single token (e.g. \frac12).
      function argument() {
        if (text[i] === '{') return group();
        if (text[i] === '\\') return command();
        if (!/[0-9]/.test(text[i] || '')) throw Error('argument');
        return text[i++];
      }
      // Unicode radicals take a whole number or a grouped expression, unlike TeX tokens.
      function unicodeRoot() {
        var cube = text[i++] === '∛', radicand;
        if (text[i] === '(') {
          var start = ++i, depth = 1;
          while (i < text.length && depth) { if (text[i] === '(') depth++; if (text[i] === ')') depth--; i++; }
          if (depth) throw Error('root');
          radicand = latex(text.slice(start, i - 1));
        } else if (text[i] === '{') radicand = group();
        else {
          var number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(text.slice(i));
          if (!number) throw Error('root');
          radicand = number[0]; i += radicand.length;
          endArgument();
        }
        return (cube ? 'root(3,' : 'sqrt(') + radicand + ')';
      }
      function command() {
        if (text.slice(i, i + 5) === '\\frac') {
          i += 5; var a = argument(), b = argument();
          return '((' + a + ')/(' + b + '))';
        }
        if (text.slice(i, i + 5) === '\\sqrt') {
          i += 5;
          var degree = '2';
          if (text[i] === '[') {
            var end = text.indexOf(']', ++i);
            if (end < 0) throw Error('root');
            degree = latex(text.slice(i, end)); i = end + 1;
          }
          var grouped = text[i] === '{', radicand = argument();
          if (!grouped) endArgument();
          return 'root(' + degree + ',' + radicand + ')';
        }
        var name = /^\\(pi|ln)(?![a-zA-Z])/.exec(text.slice(i));
        if (!name) throw Error('command');
        i += name[0].length;
        if (name[1] !== 'ln' || text[i] === '(') return name[1];
        var parameter = argument();
        // TeX braces on ln do not print parentheses or delimit its visible scope.
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(parameter)) throw Error('ln argument');
        endArgument();
        return 'ln(' + parameter + ')';
      }
      var out = '';
      while (i < text.length) {
        if (text[i] === '\\') out += command();
        else if (text[i] === '√' || text[i] === '∛') out += unicodeRoot();
        else if (text[i] === '{') out += '(' + group() + ')';
        else out += text[i++];
      }
      return out;
    }
    var text;
    try {
      text = normal(value);
      if (/(^|[^\\a-zA-Z])ln\{/.test(text)) return null;
      text = latex(text);
    } catch (_) { return null; }
    text = text.replace(/π/g, 'pi');
    if (!text) return null;
    var tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|sqrt|root|ln|pi|e|[,+*/^()\-]/g) || [];
    if (tokens.join('') !== text || tokens.length > 150) return null;
    var i = 0;
    function bounded(n) { if (!Number.isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER) throw Error('range'); return n; }
    function atom() {
      var token = tokens[i++], result;
      if (token === '(') { result = sum(); if (tokens[i++] !== ')') throw Error('bracket'); return result; }
      if (token === 'sqrt') { if (tokens[i++] !== '(') throw Error('sqrt'); result = sum(); if (tokens[i++] !== ')') throw Error('sqrt'); return bounded(Math.sqrt(result)); }
      if (token === 'root') {
        if (tokens[i++] !== '(') throw Error('root');
        var degree = sum(); if (tokens[i++] !== ',') throw Error('root');
        result = sum(); if (tokens[i++] !== ')' || !Number.isInteger(degree) || degree < 1) throw Error('root');
        return bounded(result < 0 && degree % 2 ? -Math.pow(-result, 1 / degree) : Math.pow(result, 1 / degree));
      }
      if (token === 'ln') {
        var grouped = tokens[i] === '(';
        if (!grouped && !/^(?:[\d.][\deE.+\-]*|pi|e)$/.test(tokens[i] || '')) throw Error('ln argument');
        result = atom();
        if (!grouped && i < tokens.length && tokens[i] !== ')' && tokens[i] !== ',') throw Error('ambiguous ln');
        return bounded(Math.log(result));
      }
      if (token === 'pi') return Math.PI;
      if (token === 'e') return Math.E;
      if (!token || !/^[\d.]/.test(token)) throw Error('number');
      return bounded(Number(token));
    }
    function power() { var n = atom(); return tokens[i] === '^' ? (i++, bounded(Math.pow(n, unary()))) : n; }
    function unary() { if (tokens[i] === '+') { i++; return unary(); } if (tokens[i] === '-') { i++; return -unary(); } return power(); }
    function product() {
      var n = unary();
      while (i < tokens.length && !/^[),+\-]$/.test(tokens[i])) {
        var token = tokens[i];
        if (token === '*' || token === '/') { i++; var b = unary(); n = bounded(token === '*' ? n * b : n / b); }
        else {
          // Implicit multiplication needs a symbol or bracket, not two numbers.
          if (/^[\d.]/.test(token) && tokens[i - 1] !== ')' && tokens[i - 1] !== 'pi' && tokens[i - 1] !== 'e') throw Error('product');
          n = bounded(n * unary());
        }
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
    var x = numeric(choice), y = numeric(answer);
    // Cap absolute tolerance so large counts cannot swallow an incorrect unit.
    return x !== null && y !== null && Math.abs(x - y) <= Math.min(1e-8, 1e-9 * Math.max(Math.abs(x), Math.abs(y)));
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
    if (!normal(choice)) return 0;
    if (equivalent(choice, answer.answer)) return max;
    // Unknown notation is not evidence of a wrong answer. Reuse self-assessment
    // so no zero score or wrongbook entry is recorded before the student confirms.
    return numeric(choice) !== null && numeric(answer.answer) !== null ? 0 : null;
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
