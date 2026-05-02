/* ============ НАЛАШТУВАННЯ ============ */

const CONFIG = {
  repo: 'andriizukr-a11y/Links',
  dir: 'bookmarks',

  // 👇 ВАЖЛИВО: список файлів вручну
  files: [
    'tab1.xbel',
    'tab2.xbel'
  ]
};

const TAB_NAMES = {
  'tab1': 'Спорт',
  'tab2': 'Різне'
};

/* ============ КІНЕЦЬ НАЛАШТУВАНЬ ============ */

let currentTab = null;
const bookmarksData = {};
let filesList = [];

function fileId(filename) {
  return filename.replace(/\.xbel$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
}

function formatTabName(filename) {
  const baseName = filename.replace(/\.xbel$/i, '');
  return TAB_NAMES[baseName] || baseName;
}

function createTabs(files) {
  const tabsContainer = document.getElementById('tabs-container');
  const contentsContainer = document.getElementById('contents-container');

  files.forEach((file, index) => {
    const id = fileId(file.name);
    const tabName = formatTabName(file.name);

    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab' + (index === 0 ? ' active' : '');
    tabBtn.onclick = () => switchTab(id);
    tabBtn.innerHTML = `${tabName} <span class="tab-count" id="count-${id}">(0)</span>`;
    tabBtn.dataset.tabId = id;
    tabsContainer.appendChild(tabBtn);

    const content = document.createElement('div');
    content.id = `content-${id}`;
    content.className = 'tab-content' + (index === 0 ? ' active' : '');
    content.innerHTML = `<div id="output-${id}"></div>`;
    contentsContainer.appendChild(content);

    bookmarksData[id] = {
      path: `${CONFIG.dir}/${file.name}`,
      name: file.name
    };
  });

  if (files.length > 0) {
    currentTab = fileId(files[0].name);
  }

  openTabFromHash();
}

function switchTab(tabId) {
  currentTab = tabId;

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');
  document.getElementById(`content-${tabId}`).classList.add('active');

  window.location.hash = tabId;
}

function openTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && document.querySelector(`[data-tab-id="${hash}"]`)) {
    switchTab(hash);
  }
}

function parseBookmarks(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const bookmarks = xmlDoc.getElementsByTagName("bookmark");
  const result = [];

  for (let bookmark of bookmarks) {
    const href = bookmark.getAttribute("href");
    const title = bookmark.getElementsByTagName("title")[0]?.textContent || "Без назви";
    result.push({ title, href });
  }

  return result;
}

function displayBookmarks(tabId, bookmarks) {
  const output = document.getElementById(`output-${tabId}`);
  const countEl = document.getElementById(`count-${tabId}`);

  const realBookmarks = bookmarks.filter(b => !b.href.includes('separator.floccus.org'));
  countEl.textContent = `(${realBookmarks.length})`;

  if (bookmarks.length === 0) {
    output.innerHTML = '<div class="no-results">Закладки не знайдено</div>';
    return;
  }

  const bookmarksHTML = bookmarks.map(bookmark => {
    if (bookmark.href.includes('separator.floccus.org')) {
      return `<div class="separator"></div>`;
    }

    try {
      const domain = new URL(bookmark.href).hostname;
      return `
        <div class="bookmark-item">
          <img class="bookmark-icon"
               src="https://www.google.com/s2/favicons?domain=${domain}&sz=32"
               onerror="this.style.display='none'">
          <a href="${bookmark.href}" target="_blank">
            ${escapeHtml(bookmark.title)}
          </a>
        </div>
      `;
    } catch {
      return `
        <div class="bookmark-item">
          <span style="margin-right: 12px;">🔗</span>
          <a href="${bookmark.href}" target="_blank">
            ${escapeHtml(bookmark.title)}
          </a>
        </div>
      `;
    }
  }).join('');

  output.innerHTML = `<div class="bookmarks-list">${bookmarksHTML}</div>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadFileData(path) {
  const rawUrl = `https://raw.githubusercontent.com/${CONFIG.repo}/main/${path}`;

  try {
    const response = await fetch(rawUrl + '?t=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const text = await response.text();
    return parseBookmarks(text);
  } catch (err) {
    console.warn('Помилка завантаження:', path, err);
    return [];
  }
}

async function loadDirectory() {
  const tabsContainer = document.getElementById('tabs-container');

  try {
    const xbelFiles = CONFIG.files.map(name => ({
      name,
      path: `${CONFIG.dir}/${name}`
    }));

    const loadedData = {};

    await Promise.all(xbelFiles.map(async (file) => {
      const id = fileId(file.name);
      const bookmarks = await loadFileData(file.path);
      loadedData[id] = bookmarks;
    }));

    filesList = xbelFiles;
    tabsContainer.innerHTML = '';
    createTabs(xbelFiles);

    Object.keys(loadedData).forEach(tabId => {
      displayBookmarks(tabId, loadedData[tabId]);
    });

    document.getElementById('preloader').classList.add('hidden');

  } catch (err) {
    tabsContainer.innerHTML =
      `<div class="error">Помилка завантаження: ${err.message}</div>`;
    document.getElementById('preloader').classList.add('hidden');
  }
}

window.addEventListener('hashchange', openTabFromHash);

loadDirectory();