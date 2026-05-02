/* ---------- APP (TABS + LOADING) ---------- */

function fileId(filename) {
  return filename.replace(/\.xbel$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
}

function createTabs() {
  const tabsContainer = document.getElementById('tabs-container');
  const contentsContainer = document.getElementById('contents-container');

  CONFIG.tabs.forEach((tabName, index) => {
    // Генеруємо ім'я файлу з назви таба
    const fileName = `tab${index + 1}.xbel`;
    const id = fileId(fileName);

    // Створюємо кнопку таба
    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab' + (index === 0 ? ' active' : '');
    tabBtn.onclick = () => switchTab(id);
    
    // Формуємо контент кнопки
    let tabContent = tabName;
    if (CONFIG.ui.showCounts) {
      tabContent += ` <span class="tab-count" id="count-${id}">(0)</span>`;
    }
    
    tabBtn.innerHTML = tabContent;
    tabBtn.dataset.tabId = id;
    tabsContainer.appendChild(tabBtn);

    // Створюємо контент таба
    const content = document.createElement('div');
    content.id = `content-${id}`;
    content.className = 'tab-content' + (index === 0 ? ' active' : '');
    content.innerHTML = `
      <div class="search-wrapper">
        <input class="search-input" id="search-${id}" type="search" placeholder="Пошук..." autocomplete="off">
        <span class="search-count" id="search-count-${id}"></span>
      </div>
      <div id="output-${id}"></div>
    `;
    contentsContainer.appendChild(content);

    // Зберігаємо дані таба
    bookmarksData[id] = {
      path: `${CONFIG.dir}/${fileName}`,
      name: tabName
    };
  });

  if (CONFIG.tabs.length > 0) {
    document.title = `${CONFIG.tabs[0]} – ${CONFIG.ui.titleSuffix}`;
  }

  openTabFromHash();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');
  document.getElementById(`content-${tabId}`).classList.add('active');

  const searchEl = document.getElementById(`search-${tabId}`);
  if (searchEl) {
    searchEl.value = '';
    filterBookmarks(tabId, '');
  }

  // Оновлюємо title сторінки
  const tabData = bookmarksData[tabId];
  const tabName = tabData?.name || 'Посилання';
  document.title = `${tabName} – ${CONFIG.ui.titleSuffix}`;

  window.location.hash = tabId;
}

function openTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.querySelector(`[data-tab-id="${hash}"]`)) {
    switchTab(hash);
  }
}

async function loadFileData(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return parseBookmarks(await response.text());
  } catch (err) {
    throw new Error(`Не вдалося завантажити ${path}: ${err.message}`);
  }
}

async function loadDirectory() {
  createTabs();

  const loadPromises = CONFIG.tabs.map(async (tabName, index) => {
    const fileName = `tab${index + 1}.xbel`;
    const id = fileId(fileName);
    try {
      const bookmarks = await loadFileData(`${CONFIG.dir}/${fileName}`);
      bookmarksData[id].bookmarks = bookmarks;
      displayBookmarks(id, bookmarks);
    } catch (err) {
      const output = document.getElementById(`output-${id}`);
      if (output) output.innerHTML = `<div class="error">Помилка: ${err.message}</div>`;
    }
  });

  await Promise.allSettled(loadPromises);
  document.getElementById('preloader').classList.add('hidden');
  initSearch();
}

function filterBookmarks(tabId, query) {
  const output = document.getElementById(`output-${tabId}`);
  if (!output) return;
  const q = query.trim().toLowerCase();
  const items = output.querySelectorAll('.bookmark-item');
  const separators = output.querySelectorAll('.separator');
  const total = items.length;
  let visible = 0;

  items.forEach(item => {
    const title = item.querySelector('.bookmark-title')?.textContent.toLowerCase() || '';
    const domain = item.querySelector('.bookmark-domain')?.textContent.toLowerCase() || '';
    const match = !q || title.includes(q) || domain.includes(q);
    item.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  separators.forEach(sep => { sep.style.display = q ? 'none' : ''; });

  const countEl = document.getElementById(`search-count-${tabId}`);
  if (countEl) countEl.textContent = q ? `${visible} з ${total}` : '';

  const noResults = output.querySelector('.no-results-search');
  if (!q && noResults) { noResults.remove(); return; }
  if (q && visible === 0) {
    if (!noResults) {
      const el = document.createElement('div');
      el.className = 'no-results no-results-search';
      el.textContent = 'Нічого не знайдено';
      output.appendChild(el);
    }
  } else if (noResults) {
    noResults.remove();
  }
}

function initSearch() {
  document.querySelectorAll('.search-input').forEach(input => {
    const tabId = input.id.replace('search-', '');
    input.addEventListener('input', () => filterBookmarks(tabId, input.value));
  });
}

window.addEventListener('hashchange', openTabFromHash);

window.addEventListener('scroll', () => {
  document.getElementById('tabs-container').classList.toggle('scrolled', window.scrollY > 10);
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

  if ((e.key === '/' || e.key === 'f') && !isInput && !e.ctrlKey && !e.metaKey) {
    const activTab = document.querySelector('.tab.active');
    if (!activTab) return;
    const tabId = activTab.dataset.tabId;
    const searchEl = document.getElementById(`search-${tabId}`);
    if (searchEl) { e.preventDefault(); searchEl.focus(); searchEl.select(); }
    return;
  }

  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isInput) {
    const tabs = [...document.querySelectorAll('.tab')];
    const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
    if (activeIndex === -1) return;
    const next = e.key === 'ArrowRight'
      ? tabs[activeIndex + 1]
      : tabs[activeIndex - 1];
    if (next) switchTab(next.dataset.tabId);
  }

  if (e.key === 'Escape' && isInput) {
    document.activeElement.blur();
  }
});
