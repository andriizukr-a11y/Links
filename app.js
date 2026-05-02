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
    content.innerHTML = `<div id="output-${id}"></div>`;
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
  try {
    createTabs();

    const loadPromises = CONFIG.tabs.map(async (tabName, index) => {
      const fileName = `tab${index + 1}.xbel`;
      const id = fileId(fileName);
      const bookmarks = await loadFileData(`${CONFIG.dir}/${fileName}`);
      bookmarksData[id].bookmarks = bookmarks;
      displayBookmarks(id, bookmarks);
    });

    await Promise.all(loadPromises);
    document.getElementById('preloader').classList.add('hidden');

  } catch (err) {
    document.getElementById('tabs-container').innerHTML =
      `<div class="error">Помилка завантаження: ${err.message}</div>`;
    document.getElementById('preloader').classList.add('hidden');
  }
}

window.addEventListener('hashchange', openTabFromHash);
