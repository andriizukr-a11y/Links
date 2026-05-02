/* ---------- APP (TABS + LOADING) ---------- */

let currentTab = null;

function fileId(filename) {
  return filename.replace(/\.xbel$/i, '').replace(/[^a-zA-Z0-9]/g, '_');
}

function formatTabName(filename) {
  const baseName = filename.replace(/\.xbel$/i, '');
  return TAB_NAMES[baseName] || baseName;
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
    const firstFileName = `tab1.xbel`;
    currentTab = fileId(firstFileName);
    // Встановлюємо початковий title
    const firstTabName = CONFIG.tabs[0];
    document.title = `${firstTabName} – ${CONFIG.ui.titleSuffix}`;
  }

  // Відкриваємо таб з хешу ПІСЛЯ створення всіх табів
  setTimeout(() => openTabFromHash(), 0);
}

function switchTab(tabId) {
  currentTab = tabId;

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
  // Спроба 1: GitHub API
  const apiUrl = `https://api.github.com/repos/${CONFIG.repo}/contents/${path}`;

  try {
    console.log("Спроба завантаження через API:", apiUrl);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content) {
      throw new Error("Пустий контент у відповіді");
    }
    
    // Правильне декодування UTF-8 з base64
    const binaryString = atob(data.content.replace(/\n/g, ''));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const xmlText = new TextDecoder('utf-8').decode(bytes);
    return parseBookmarks(xmlText);

  } catch (apiErr) {
    console.warn("API не спрацював, пробуємо raw GitHub:", apiErr.message);
    
    // Спроба 2: Raw GitHub
    try {
      const rawUrl = `https://raw.githubusercontent.com/${CONFIG.repo}/main/${path}`;
      console.log("Спроба завантаження raw:", rawUrl);
      
      const response = await fetch(rawUrl);
      
      if (!response.ok) {
        throw new Error(`Raw HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      return parseBookmarks(xmlText);
      
    } catch (rawErr) {
      console.error("Обидва методи не спрацювали для:", path, rawErr);
      
      // Показуємо помилку користувачеві
      const tabsContainer = document.getElementById('tabs-container');
      if (tabsContainer && !tabsContainer.querySelector('.error')) {
        tabsContainer.innerHTML += 
          `<div class="error">Не вдалося завантажити ${path}: ${rawErr.message}</div>`;
      }
      
      return [];
    }
  }
}

async function loadDirectory() {
  const tabsContainer = document.getElementById('tabs-container');

  try {
    tabsContainer.innerHTML = '';
    createTabs();

    // Чекаємо на завантаження ВСІХ файлів
    const loadPromises = CONFIG.tabs.map(async (tabName, index) => {
      const fileName = `tab${index + 1}.xbel`;
      const id = fileId(fileName);
      const bookmarks = await loadFileData(`${CONFIG.dir}/${fileName}`);
      bookmarksData[id].bookmarks = bookmarks;
      displayBookmarks(id, bookmarks);
      return bookmarks;
    });

    await Promise.all(loadPromises);

    // Тільки після завантаження всіх даних ховаємо прелоадер
    document.getElementById('preloader').classList.add('hidden');

  } catch (err) {
    tabsContainer.innerHTML =
      `<div class="error">Помилка завантаження: ${err.message}</div>`;
    document.getElementById('preloader').classList.add('hidden');
  }
}

window.addEventListener('hashchange', openTabFromHash);
