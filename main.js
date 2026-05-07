/* ========== ГОЛОВНИЙ ФАЙЛ ========== */

/* ============ НАЛАШТУВАННЯ ============ */

const CONFIG = {
  allowedIP: '176.37.220.254',

  dir: 'bookmarks',
  
  ui: {
    titleSuffix: 'Посилання',
    showCounts: true
  },
  
  cleanTitleSites: [
    'YouTube',
    'Google Диск',
    'Google Drive'
  ],

  customIcons: {
    'docs.google.com/document': 'data/favicons/document.ico',
    'docs.google.com/spreadsheets': 'data/favicons/spreadsheets.ico',
    'onlinevkino.com': 'data/favicons/default.png'
  },
  
  tabs: [
    'Спорт',
    'Проектор',
    'Робота',
    'Нотатки',
    'Завдання'
  ],

  specialTabs: {
    'Нотатки': 'notes',
    'Завдання': 'tasks'
  }
};

/* ============ КІНЕЦЬ НАЛАШТУВАНЬ ============ */

// Глобальні змінні
const bookmarksData = {};

async function checkIP() {
  try {
    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();
    return data.ip === CONFIG.allowedIP;
  } catch {
    return false;
  }
}

// Ініціалізація після завантаження всіх модулів
document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await checkIP();
  if (!allowed) {
    document.getElementById('preloader').classList.add('hidden');
    document.body.innerHTML = '';
    return;
  }
  loadDirectory();
});
