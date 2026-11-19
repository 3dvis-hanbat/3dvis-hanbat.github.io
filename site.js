const html = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

function syncTheme() {
  const dark = html.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  themeToggle.title = dark ? 'Light theme' : 'Dark theme';
  themeColor.content = dark ? '#141525' : '#fbfbfe';
}
syncTheme();
themeToggle.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('3dvis-theme', html.dataset.theme); } catch {}
  syncTheme();
});

const list = document.getElementById('publication-list');
if (list) loadPublications();

function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}

function record(item, base) {
  const article = element('article', '', 'publication-record');
  const thumb = element('img');
  thumb.src = new URL(item.thumbnail ?? item.topic + '.png', base).href;
  thumb.loading = 'lazy';
  thumb.alt = '';
  thumb.width = 300;
  thumb.height = 188;
  const content = element('div');
  const title = element('h3', item.title);
  const paper = item.links.find(link => link.label === 'Paper');
  if (paper) {
    const link = element('a', item.title);
    link.href = paper.url;
    title.replaceChildren(link);
  }
  const tags = element('div', '', 'publication-tags');
  tags.append(element('span', item.type, 'tag'));
  for (const resource of item.links) {
    const link = element('a', resource.label);
    link.href = resource.url;
    link.setAttribute('aria-label', resource.label + ' · ' + item.title);
    tags.append(link);
  }
  const authors = element('p', item.authors);
  const venue = element('p', item.venue);
  if (item.region === 'domestic') {
    if (/[가-힣]/.test(item.title)) title.lang = 'ko';
    authors.lang = venue.lang = 'ko';
  }
  content.append(title, authors, venue, tags);
  article.append(thumb, content);
  return article;
}

async function loadPublications() {
  const type = document.getElementById('publication-type');
  const order = document.getElementById('publication-sort');
  const count = document.getElementById('publication-count');
  const reset = document.getElementById('publication-reset');
  const scopeButtons = [...document.querySelectorAll('#publication-scopes button')];
  const source = new URL(list.dataset.source, location.href);
  let scope = 'international';
  let items;
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error(response.status);
    items = await response.json();
  } catch {
    count.textContent = 'Could not load the publications.';
    const original = element('a', 'View publications on the previous site');
    original.href = 'https://sites.google.com/view/3dvislab/publications';
    list.append(original);
    return;
  }
  function update() {
    const scoped = items.filter(item => item.region === scope);
    const filtered = scoped.filter(item => !type.value || item.type === type.value);
    const byYear = new Map();
    for (const item of filtered) {
      if (!byYear.has(item.year)) byYear.set(item.year, []);
      byYear.get(item.year).push(item);
    }
    const years = [...byYear.keys()].sort((a, b) => order.value === 'old' ? a - b : b - a);
    const sections = years.map(year => {
      const section = element('section', '', 'publication-group');
      section.append(element('h2', String(year)), ...byYear.get(year).map(item => record(item, source)));
      return section;
    });
    count.textContent = filtered.length + ' of ' + scoped.length + ' publications';
    reset.hidden = !type.value && order.value === 'new';
    for (const button of scopeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.scope === scope));
    }
    list.replaceChildren(...(sections.length ? sections : [element('p', 'No publications match this filter.', 'empty')]));
  }
  for (const select of [type, order]) select.addEventListener('change', update);
  for (const button of scopeButtons) button.addEventListener('click', () => {
    if (scope === button.dataset.scope) return;
    scope = button.dataset.scope;
    type.value = '';
    update();
  });
  reset.addEventListener('click', () => {
    type.value = '';
    order.value = 'new';
    update();
    type.focus();
  });
  document.querySelector('.publication-controls').hidden = false;
  update();
}
