(() => {
  const q = document.querySelector('#search-q'), results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status'), topic = document.querySelector('#search-topic');
  const level = document.querySelector('#search-level'), type = document.querySelector('#search-type');
  let rows = [], active = -1, expanded = new Set();
  const normalize = s => s.toLowerCase().replace(/\s+/g, '');
  function highlight(text, terms) {
    const span = document.createElement('span');
    const escaped = terms.filter(Boolean).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!escaped.length) { span.textContent = text; return span; }
    const pattern = new RegExp(`(${escaped.join('|')})`, 'ig');
    text.split(pattern).forEach((part, i) => { const el = i % 2 ? document.createElement('mark') : document.createTextNode(part); if (i % 2) el.textContent = part; span.append(el); });
    return span;
  }
  function render() {
    active = -1; results.replaceChildren(); q.removeAttribute('aria-activedescendant');
    const query = q.value.trim();
    // Split Han/digit boundaries without splitting identifiers such as P006499 or FR002.
    const terms = query.replace(/(\p{Script=Han})([0-9])/gu, '$1 $2')
      .replace(/([0-9])(\p{Script=Han})/gu, '$1 $2').split(/\s+/).filter(Boolean);
    const number = /^(19|20)\d{2}$/.test(query) ? null : query.match(/^p?0*(\d+)$/i);
    const filtered = query ? rows.filter(r => {
      const hay = normalize(`${r.title} ${r.summary} ${r.fr || ''}`);
      const match = number ? r.group === '题目' && Number(r.title.match(/^P(\d+)/)?.[1]) === Number(number[1]) : terms.every(t => hay.includes(normalize(t)));
      return match && (r.group !== '题目' || ((!topic.value || r.fr === topic.value) && (!level.value || `F${r.lv}` === level.value) && (!type.value || r.type === type.value)));
    }) : [];
    status.textContent = query ? `找到 ${filtered.length} 条结果${filtered.length ? '' : '。试试题号、较短的关键词或减少筛选条件。'}` : '输入关键词开始搜索。';
    for (const group of ['专题','方法','公式','易错','考情','题目']) {
      const items = filtered.filter(r => r.group === group); if (!items.length) continue;
      const section = document.createElement('section'); section.setAttribute('role', 'group'); section.setAttribute('aria-label', group); const h = document.createElement('h2'); h.textContent = `${group}（${items.length}）`; section.append(h);
      for (const r of items.slice(0, expanded.has(group) ? undefined : 8)) {
        const a = document.createElement('a'); a.href = r.url; a.className = 'search-result'; a.setAttribute('role','option'); a.id = `search-option-${results.querySelectorAll('[role=option]').length + section.querySelectorAll('[role=option]').length}`;
        const strong = document.createElement('strong'); strong.append(highlight(r.title, terms)); const small = document.createElement('span'); small.append(highlight(r.summary, terms)); a.append(strong, small); section.append(a);
      }
      if (items.length > 8 && !expanded.has(group)) { const button = document.createElement('button'); button.type = 'button'; button.className = 'pill'; button.textContent = `展开全部 ${items.length} 条`; button.onclick = () => { expanded.add(group); render(); }; section.append(button); }
      results.append(section);
    }
  }
  q.addEventListener('input', () => { expanded.clear(); q.setAttribute('aria-expanded', 'true'); render(); });
  [topic, level, type].forEach(el => el.addEventListener('change', render));
  q.addEventListener('keydown', e => {
    const opts = [...results.querySelectorAll('[role=option]')];
    if (e.key === 'Escape') { q.value = ''; expanded.clear(); render(); q.setAttribute('aria-expanded','false'); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!opts.length) return; e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; opts.forEach((o,i) => o.setAttribute('aria-selected', String(i === active))); q.setAttribute('aria-activedescendant',opts[active].id); q.setAttribute('aria-expanded','true'); opts[active].scrollIntoView({block:'nearest'}); }
    if (e.key === 'Enter' && opts.length) { e.preventDefault(); location.href = opts[Math.max(active,0)].href; }
  });
  fetch('assets/search-index.json').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => {
    rows = data; const seen = new Map(); rows.filter(r => r.group === '题目').forEach(r => seen.set(r.fr,r.topic));
    [...seen].sort().forEach(([fr,name]) => { const option = document.createElement('option'); option.value=fr; option.textContent=`${fr} ${name}`; topic.append(option); });
    q.value = new URLSearchParams(location.search).get('q') || ''; render();
  }).catch(() => { status.textContent = '搜索索引加载失败，请刷新重试。'; });
})();
