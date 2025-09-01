const API_URL = 'https://script.google.com/macros/s/AKfycbySFb5v2NMnxX8dMkgm3TZZ7nT8vPicMjnRbtnaANnGKOTYxSJDHw4XeMgtPoQoY9zD/exec';
const CACHE_KEY = 'fridge.latest.Refrige';

const openBtn = document.getElementById('openBtn');
const fridge = document.getElementById('fridge');
const contentEl = document.getElementById('content');
const versionInfo = document.getElementById('versionInfo');

let fetching = false;

openBtn.addEventListener('click', () => {
  if (fridge.classList.contains('open')) return;
  fridge.classList.add('open');
  openBtn.setAttribute('aria-expanded', 'true');
  openBtn.disabled = true;

  const cache = loadCache();
  renderState('loading', cache);
  fetchLatest();
});

function renderState(state, payload = {}) {
  fridge.classList.toggle('loading', state === 'loading');
  contentEl.innerHTML = '';

  if (state === 'loading' && payload && payload.text) {
    const textNode = document.createElement('div');
    textNode.textContent = payload.text;
    contentEl.appendChild(textNode);
  }

  switch (state) {
    case 'loaded': {
      const textNode = document.createElement('div');
      textNode.textContent = payload.text;
      contentEl.appendChild(textNode);
      if (payload.fetchedAt) {
        const meta = document.createElement('div');
        meta.className = 'meta';
        const date = new Date(payload.fetchedAt);
        meta.textContent = `最終更新: ${date.toLocaleString('ja-JP')}`;
        contentEl.appendChild(meta);
      }
      break;
    }
    case 'empty': {
      contentEl.textContent = 'いま冷蔵庫メモはありません';
      break;
    }
    case 'error': {
      const msg = document.createElement('p');
      msg.textContent = payload.message || '通信に失敗しました';
      contentEl.appendChild(msg);
      if (payload.cache && payload.cache.text) {
        const cached = document.createElement('div');
        cached.textContent = payload.cache.text;
        contentEl.appendChild(cached);
        if (payload.cache.fetchedAt) {
          const meta = document.createElement('div');
          meta.className = 'meta';
          const date = new Date(payload.cache.fetchedAt);
          meta.textContent = `最終更新: ${date.toLocaleString('ja-JP')}`;
          contentEl.appendChild(meta);
        }
      }
      const retry = document.createElement('button');
      retry.textContent = '再試行';
      retry.addEventListener('click', fetchLatest);
      contentEl.appendChild(retry);
      break;
    }
  }
}

function fetchLatest() {
  if (fetching) return;
  fetching = true;
  renderState('loading');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  fetch(`${API_URL}?mode=latest&search=Refrige`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: controller.signal
  })
    .then(r => {
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      fetching = false;
      if (data && typeof data.result === 'string') {
        const cache = {
          text: data.result,
          meta: data.meta,
          fetchedAt: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        renderState('loaded', cache);
      } else {
        renderState('empty');
      }
    })
    .catch(err => {
      fetching = false;
      console.error(err);
      const cache = loadCache();
      if (cache) {
        renderState('error', { message: '最新の取得に失敗しました', cache });
      } else {
        renderState('error');
      }
    });
}

function loadCache() {
  try {
    const str = localStorage.getItem(CACHE_KEY);
    if (!str) return null;
    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return null;
  }
}

// footer version info
versionInfo.textContent = `v1.0.0`;
