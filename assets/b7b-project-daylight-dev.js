/* Only j7b-p2. Work stays in memory; no network, storage or learning-ledger writes. */
(function () {
  'use strict';
  if (document.body.dataset.sec !== 'j7b-p2') return;
  const root = document.getElementById('daylight-project');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = s => root.querySelector(s);
  const terms = '小寒 大寒 立春 雨水 惊蛰 春分 清明 谷雨 立夏 小满 芒种 夏至 小暑 大暑 立秋 处暑 白露 秋分 寒露 霜降 立冬 小雪 大雪 冬至'.split(' ');
  const keys = 'term,date,place,lat,lon,zone,rise,set,minutes,source,precision,kind'.split(',');
  const form = $('#dl-row'), status = $('#dl-status');
  let rows = [], editing = -1, plotted = false;
  function node(tag, text, parent) {
    const n = document.createElement(tag); n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  terms.forEach(t => { const o = node('option', t, form.elements.term); o.value = t; });
  function fail(message) { throw new Error(message); }
  function clock(s) {
    if (!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(s)) fail('时刻须为半角HH:MM，范围00:00—23:59。');
    return Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  }
  function decimal(s, limit, label) {
    if (!/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(s) || Math.abs(Number(s)) > limit) fail(label + '须为范围内半角十进制数，不收单位、空白、指数或上标。');
    return Number(s);
  }
  function validate(r) {
    keys.forEach(k => { if (typeof r[k] !== 'string' || !r[k].trim()) fail('请完整填写每一项；缺数据请留在缺口报告，不编造。'); });
    if (!terms.includes(r.term)) fail('节气须选列表中的名称。');
    if (!/^2026-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/.test(r.date) || new Date(r.date + 'T00:00:00Z').toISOString().slice(0, 10) !== r.date) fail('日期须为真实的2026-MM-DD；节气与日期对应请自己对照原表核验。');
    decimal(r.lat, 60, '纬度（本工具限-60到60）'); decimal(r.lon, 180, '经度（-180到180）');
    if (r.zone !== 'UTC+8') fail('本项目统一使用UTC+8。');
    if (!['历算预报', '观测', '估算'].includes(r.kind)) fail('请声明数据性质。');
    const a = clock(r.rise), b = clock(r.set);
    if (b <= a) fail('此工具仅接收同日且日落晚于日出的记录；不处理极昼极夜、相等时刻或跨午夜。');
    if (!/^(?:0|[1-9][0-9]*)$/.test(r.minutes)) fail('白昼须为半角整数分钟，不收小数、上标、单位或空白。');
    if (Number(r.minutes) !== b - a) fail('分钟减法不一致：先把两时刻各换为总分钟，再用日落减日出。请自己重算。');
    if (r.place.length > 40 || r.source.length > 700 || r.precision.length > 120) fail('地点、来源或精度文字过长，请缩短。');
    return {...r};
  }
  function validateSet(data) {
    if (data.length > 200) fail('最多200行。');
    const seen = new Set(), seenTerm = new Set(), places = new Map(), dates = new Map();
    return data.map((r, i) => {
      try {
        r = validate(r);
        const key = r.place + '|' + r.date, tk = r.place + '|' + r.term;
        if (seen.has(key) || seenTerm.has(tk)) fail('同地点日期或节气重复，请编辑原行。');
        const geo = [Number(r.lat), Number(r.lon), r.zone].join('|');
        if (places.has(r.place) && places.get(r.place) !== geo) fail('同名地点必须保持同一经纬度与时区。');
        if (dates.has(r.term) && dates.get(r.term) !== r.date) fail('同一节气的比较须用同一UTC+8日期。');
        seen.add(key); seenTerm.add(tk); places.set(r.place, geo); dates.set(r.term, r.date);
        return r;
      } catch (e) { fail('第' + (i + 1) + '行：' + e.message); }
    });
  }
  function invalidate() {
    $('#dl-chart').setAttribute('hidden', ''); $('#dl-chart').replaceChildren(); $('#dl-legend').textContent = '';
    $('#dl-self-result').textContent = ''; plotted = false;
  }
  function cancel() { form.reset(); editing = -1; }
  function render() {
    const body = $('#dl-table tbody'); body.replaceChildren();
    $('#dl-table caption').textContent = '我的数据（' + rows.length + '行；格式核算不代表来源认证）';
    rows.forEach((r, i) => {
      const tr = node('tr', '', body);
      [r.term + ' / ' + r.date, r.place + ' / ' + r.lat + ' / ' + r.lon + ' / ' + r.zone, r.rise + ' / ' + r.set, r.minutes, r.source + ' / ' + r.precision + ' / ' + r.kind].forEach(v => node('td', v, tr));
      const td = node('td', '', tr), edit = node('button', '编辑第' + (i + 1) + '行', td), del = node('button', '删除第' + (i + 1) + '行', td);
      edit.type = del.type = 'button';
      edit.onclick = () => { editing = i; keys.forEach(k => { form.elements[k].value = r[k]; }); invalidate(); status.textContent = '正在编辑第' + (i + 1) + '行，图与自核提示已清除。修改后重新核算。'; form.elements.term.focus(); };
      del.onclick = () => { rows.splice(i, 1); cancel(); invalidate(); render(); status.textContent = '已删除，可重新录入。'; };
    });
    const beijing = rows.filter(r => r.place === '北京' && r.kind !== '估算');
    const missing = terms.filter(t => !beijing.some(r => r.term === t));
    $('#dl-gaps').textContent = '北京非估算记录 ' + beijing.length + '/24（仅按你的声明计数，来源与日期未认证）。缺口：' + (missing.join('、') || '列表已齐，仍须回查来源与日期') + '。';
  }
  form.addEventListener('submit', e => {
    e.preventDefault(); invalidate();
    try {
      const r = Object.fromEntries(keys.map(k => [k, form.elements[k].value]));
      const data = rows.slice(); if (editing < 0) data.push(r); else data[editing] = r;
      rows = validateSet(data); cancel(); render(); status.textContent = '分钟减法与格式一致，已列入表格。请继续回查来源，不代表项目完成。';
    } catch (err) { status.textContent = err.message; }
  });
  form.addEventListener('input', () => { invalidate(); status.textContent = '本行已改动，请重新核算；图与自核提示已清除。'; });
  form.addEventListener('change', invalidate);
  $('#dl-cancel').onclick = () => { cancel(); invalidate(); status.textContent = '本行已清空，已入表记录保留。'; };
  function csv(text) {
    text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const lines = text.split('\n'); if (lines.at(-1) === '') lines.pop();
    function fields(line) {
      const out = []; let pos = 0;
      while (pos <= line.length) {
        let value = '';
        if (line[pos] === '"') {
          pos++; let closed = false;
          while (pos < line.length) {
            if (line[pos] === '"') { if (line[pos + 1] === '"') { value += '"'; pos += 2; } else { pos++; closed = true; break; } }
            else value += line[pos++];
          }
          if (!closed || (pos < line.length && line[pos] !== ',')) fail('CSV引号未闭合或引号后有多余字符。');
        } else {
          while (pos < line.length && line[pos] !== ',') { if (line[pos] === '"') fail('CSV引号须从字段首开始。'); value += line[pos++]; }
        }
        out.push(value); if (pos >= line.length) break; pos++;
      }
      return out;
    }
    if (!lines.length || fields(lines.shift()).join(',') !== keys.join(',')) fail('CSV表头须与说明完全一致。');
    if (!lines.length || lines.length > 200) fail('CSV须有1—200行记录。');
    return validateSet(lines.map(line => { const f = fields(line); if (f.length !== keys.length) fail('CSV每行须有12个字段。'); return Object.fromEntries(keys.map((k, i) => [k, f[i]])); }));
  }
  let importEpoch = 0;
  $('#dl-file').onchange = () => { importEpoch++; invalidate(); };
  $('#dl-import').onclick = async () => {
    const epoch = ++importEpoch, f = $('#dl-file').files[0]; invalidate();
    try {
      if (!f || f.size > 500000) fail('请选择不超过500KB的本机CSV。');
      const text = await f.text(); if (epoch !== importEpoch) return;
      rows = csv(text); cancel(); render(); status.textContent = '本机CSV已整体替换表格；仅核格式与减法，来源须自行复核。';
    } catch (e) { if (epoch === importEpoch) status.textContent = e.message + ' 原表保留。'; }
  };
  const ns = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, text) { const n = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,v)); if (text !== undefined) n.textContent = text; $('#dl-chart').appendChild(n); return n; }
  function day(date) { return (Date.parse(date + 'T00:00:00Z') - Date.UTC(2026, 0, 1)) / 86400000; }
  function plot() {
    invalidate();
    if (!rows.length || editing >= 0 || keys.some(k => form.elements[k].value)) { status.textContent = '请先把本行核算入表或清空本行，再制图；表格至少需要一行。'; return; }
    const chart = $('#dl-chart'); chart.removeAttribute('hidden');
    const X = d => 170 + day(d) * 440 / 364, Y = m => 350 - m * 240 / 1440;
    svg('path', {d:'M170 110 V350 H610',fill:'none',stroke:'var(--fg)'});
    for (let m = 0; m <= 1440; m += 360) {
      svg('line',{x1:170,x2:610,y1:Y(m),y2:Y(m),stroke:'var(--line)'});
      svg('text',{x:160,y:Y(m)+5,'text-anchor':'end',fill:'var(--fg)','font-size':16},String(m));
    }
    [['2026-01-01','1/1'],['2026-04-01','4/1'],['2026-07-01','7/1'],['2026-10-01','10/1'],['2026-12-31','12/31']].forEach(([date,label]) => svg('text',{x:X(date),y:375,'text-anchor':'middle',fill:'var(--fg)','font-size':16},label));
    svg('text',{x:170,y:65,fill:'var(--fg)','font-size':18},'白昼（分钟）');
    svg('text',{x:350,y:410,'text-anchor':'middle',fill:'var(--fg)','font-size':18},'2026年日期（实际间距）');
    const places = [...new Set(rows.map(r => r.place))];
    const colors = ['var(--a)','var(--b)','var(--no)','var(--fg)'];
    places.forEach((place, i) => {
      const data = rows.filter(r => r.place === place).sort((a,b) => a.date.localeCompare(b.date));
      const color = colors[i % colors.length];
      data.forEach((r,j) => {
        const prev = data[j-1];
        if ($('#dl-chart-kind').value === 'line' && prev && terms.indexOf(r.term) === terms.indexOf(prev.term) + 1 && r.kind === prev.kind) svg('line',{x1:X(prev.date),y1:Y(Number(prev.minutes)),x2:X(r.date),y2:Y(Number(r.minutes)),stroke:color,'stroke-width':2,'stroke-dasharray':i%2?'6 3':'none'});
        const mark = svg('circle',{cx:X(r.date),cy:Y(Number(r.minutes)),r:4+i%3,fill:color});
        const title = document.createElementNS(ns,'title'); title.textContent = place + ' ' + r.date + ' ' + r.term + ' ' + r.minutes + '分钟 / ' + r.kind; mark.appendChild(title);
      });
    });
    $('#dl-legend').textContent = '图例（按序循环配色，超过四地请分图）：' + places.map((p,i) => (i+1) + '. ' + p + ' / ' + ['色a','色b','强调色','文字色'][i%4]).join('；') + '。详细数值与性质见上表；历算/观测/估算并列不等于同口径比较。';
    plotted = true; status.textContent = '已按当前表格制图；只呈现录入值，不认证来源、日期配对或猜想。';
  }
  $('#dl-plot').onclick = plot;
  $('#dl-chart-kind').onchange = invalidate;
  root.querySelectorAll('[data-work]').forEach(n => n.addEventListener('input', () => { $('#dl-self-result').textContent = ''; }));
  $('#dl-self').onclick = () => {
    const missing = [...root.querySelectorAll('[data-work]:not([data-work="optional"])')].filter(n => !n.value.trim()).length;
    $('#dl-self-result').textContent = '自核提示（不评分、不认证）：' + (missing ? '仍有' + missing + '个必做文字区空白。' : '文字区已有输入，但不代表内容合格。') + (plotted ? '已有当前表格图。' : '尚无当前表格图。') + '请逐项核：北京24节气或明确缺口；2026日期/坐标/UTC+8/来源精度/性质；独立分钟计算；同日期同口径的两地比较与控制因素；带数值图表报告和有限样本边界；外部软件作品、纸笔描点；同伴实际质疑与修订或注明尚待验证。任意文字不能证明调查、软件操作或同伴活动发生。选做不计必做。';
  };
  $('#dl-reset').onclick = () => {
    importEpoch++; rows = []; cancel(); $('#dl-file').value = '';
    root.querySelectorAll('[data-work]').forEach(n => { n.value = ''; });
    invalidate(); render(); status.textContent = '整个项目已清空，可以重试。';
  };
  // Theme uses CSS variables in the SVG; switching theme needs no data mutation.
  render();
})();
