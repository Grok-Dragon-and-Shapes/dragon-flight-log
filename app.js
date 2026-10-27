const BIOMES = [
  { id: 'mountains', label: 'Горные пики' },
  { id: 'forest', label: 'Лес' },
  { id: 'desert', label: 'Пустыня' },
  { id: 'swamp', label: 'Болото' },
  { id: 'tundra', label: 'Тундра' },
  { id: 'caves', label: 'Пещеры' }
];

const KEY = 'dragon-flight-log-v1';
const MAX_ALTITUDE = 400;

const els = {
  form: document.getElementById('addForm'),
  date: document.getElementById('date'),
  biome: document.getElementById('biome'),
  altitude: document.getElementById('altitude'),
  note: document.getElementById('note'),
  error: document.getElementById('formError'),
  stats: document.getElementById('stats'),
  list: document.getElementById('list'),
  empty: document.getElementById('empty')
};

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let flights = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(flights));
}

function biomeLabel(id) {
  const b = BIOMES.find(x => x.id === id);
  return b ? b.label : id;
}

function renderStats() {
  const highest = flights.reduce((max, f) => Math.max(max, f.altitude), 0);
  const biomesVisited = new Set(flights.map(f => f.biome)).size;
  const stats = [
    ['Полётов', flights.length],
    ['Выше всего, блоков', flights.length ? highest : '—'],
    ['Биомов пройдено', `${biomesVisited} из ${BIOMES.length}`]
  ];
  els.stats.replaceChildren(...stats.map(([label, value]) => {
    const box = document.createElement('div');
    box.className = 'stat';
    const strong = document.createElement('strong');
    strong.textContent = value;
    const span = document.createElement('span');
    span.textContent = label;
    box.append(strong, span);
    return box;
  }));
}

function renderList() {
  const sorted = [...flights].sort((a, b) => b.date.localeCompare(a.date));
  els.list.replaceChildren(...sorted.map(f => {
    const li = document.createElement('li');

    const head = document.createElement('div');
    head.className = 'head';
    const title = document.createElement('strong');
    title.textContent = `${f.date} · ${biomeLabel(f.biome)} · ${f.altitude} блоков`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'ghost';
    remove.textContent = 'Удалить';
    remove.addEventListener('click', () => removeFlight(f.id));
    head.append(title, remove);

    li.append(head);
    if (f.note) {
      const note = document.createElement('p');
      note.className = 'note';
      note.textContent = f.note;
      li.append(note);
    }
    return li;
  }));
  els.empty.hidden = flights.length > 0;
}

function render() {
  renderStats();
  renderList();
}

function removeFlight(id) {
  flights = flights.filter(f => f.id !== id);
  save();
  render();
}

els.form.addEventListener('submit', event => {
  event.preventDefault();
  const altitude = Number(els.altitude.value);
  if (!Number.isInteger(altitude) || altitude < 0 || altitude > MAX_ALTITUDE) {
    els.error.textContent = 'Высота должна быть целым числом от 0 до ' + MAX_ALTITUDE + '.';
    return;
  }
  els.error.textContent = '';
  flights.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: els.date.value,
    biome: els.biome.value,
    altitude,
    note: els.note.value.trim()
  });
  save();
  els.altitude.value = '';
  els.note.value = '';
  render();
});

BIOMES.forEach(b => els.biome.append(new Option(b.label, b.id)));
els.date.value = new Date().toISOString().slice(0, 10);
render();
