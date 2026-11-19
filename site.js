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

function record(item, topicName, base) {
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
  if (item.originalTitle) tags.append(element('span', 'Translated title', 'tag'));
  tags.append(...[item.region === 'international' ? 'International' : 'Domestic', item.type, topicName].map(label => element('span', label, 'tag')));
  for (const resource of item.links) {
    const link = element('a', resource.label);
    link.href = resource.url;
    link.setAttribute('aria-label', resource.label + ' · ' + item.title);
    tags.append(link);
  }
  content.append(title, element('p', item.authors), element('p', item.venue), tags);
  article.append(thumb, content);
  return article;
}

async function loadPublications() {
  const search = document.getElementById('publication-search');
  const region = document.getElementById('publication-region');
  const type = document.getElementById('publication-type');
  const order = document.getElementById('publication-sort');
  const count = document.getElementById('publication-count');
  const reset = document.getElementById('publication-reset');
  const topicButtons = [...document.querySelectorAll('#publication-topics button')];
  const topics = new Map(topicButtons.map(button => [button.dataset.topic, button.textContent]));
  const source = new URL(list.dataset.source, location.href);
  let topic = '';
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
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const searchable = items.map(item => ({
    ...item, searchText: normalize([item.title, item.authors, item.venue, topics.get(item.topic), item.type, item.originalTitle, item.originalAuthors].join(' '))
  }));
  function update() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    const filtered = searchable.filter(item =>
      (!topic || item.topic === topic) &&
      (!region.value || item.region === region.value) &&
      (!type.value || item.type === type.value) &&
      terms.every(term => item.searchText.includes(term))
    );
    const byYear = new Map();
    for (const item of filtered) {
      if (!byYear.has(item.year)) byYear.set(item.year, []);
      byYear.get(item.year).push(item);
    }
    const years = [...byYear.keys()].sort((a, b) => order.value === 'old' ? a - b : b - a);
    const sections = years.map(year => {
      const section = element('section', '', 'publication-group');
      section.append(element('h2', String(year)), ...byYear.get(year).map(item => record(item, topics.get(item.topic), source)));
      return section;
    });
    count.textContent = filtered.length + ' of ' + items.length + ' publications';
    reset.hidden = !(search.value || topic || region.value || type.value || order.value === 'old');
    for (const button of topicButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.topic === topic));
    }
    list.replaceChildren(...(sections.length ? sections : [element('p', 'No results. Try a different search term or filter.', 'empty')]));
  }
  search.addEventListener('input', update);
  for (const select of [region, type, order]) select.addEventListener('change', update);
  for (const button of topicButtons) button.addEventListener('click', () => {
    topic = button.dataset.topic;
    update();
  });
  reset.addEventListener('click', () => {
    search.value = region.value = type.value = topic = '';
    order.value = 'new';
    update();
    search.focus();
  });
  document.querySelector('.publication-controls').hidden = false;
  update();
}
