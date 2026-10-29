'use strict';
(async () => {
  const root = document.querySelector('#route-content');
  const kind = root.dataset.routePage || document.body.dataset.routePage;
  const node = (tag, text, parent = root) => { const el = document.createElement(tag); el.textContent = text; parent.append(el); return el; };
  const link = (parent, label, href) => { const a = node('a', label, parent); a.href = href; return a; };
  try {
    const response = await fetch('data/learning-index.json');
    if (!response.ok) throw new Error('课程数据不可用');
    const data = await response.json();
    const lessons = data.lessons.filter(item => item.ready);
    if (kind === 'tools') {
      node('p', '这些公共教具用于课程中的观察和操作。打开已上线课程即可体验。');
      const tools = await (await fetch('data/manip-index.json')).json();
      for (const item of tools) {
        const section = node('section', ''); node('h2', item.name, section);
        if (item.lessons.length) item.lessons.forEach(lesson => { const p = node('p', '', section); link(p, lesson.title, `lessons/${lesson.id}.html`); });
        else node('p', '暂无已上线课程使用。', section);
      }
      return;
    }
    const books = [...new Set(data.units.map(item => item.bookTitle))];
    renderBooks(books, root);
    function renderBooks(selected, target) {
      for (const book of selected) {
        const group = node('section', '', target); node('h2', book, group);
        if (data.lessons.some(item => item.bookTitle === book && item.placeholder)) node('p', '本册目录暂按旧版占位，待新版核对。', group);
        const units = data.units.filter(unit => unit.bookTitle === book);
        for (const unit of units) {
          const details = node('details', '', group); node('summary', unit.unitTitle, details);
          const rows = lessons.filter(item => item.unitId === unit.id);
          if (unit.ready) { const p = node('p', '', details); link(p, unit.isActivity ? '打开活动' : '打开单元首页与闯关', `lessons/${unit.id}.html`); }
          if (!rows.length && !unit.ready) node('p', '本单元暂无已上线课时。', details);
          for (const item of rows) { const p = node('p', '', details); link(p, item.rawTitle, `lessons/${item.id}.html`); }
        }
      }
    }
  } catch (error) { root.textContent = `无法加载课程：${error.message}。请返回首页重试。`; }
})();
