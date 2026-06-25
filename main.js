/* ========== ГОЛОВНИЙ ФАЙЛ ========== */

/* ============ НАЛАШТУВАННЯ ============ */

const CONFIG = {
  secretKeyHash:
    "d10bad463e36ebb3c062074b1da3d3204d2eeea7573570874c68579aeff24f6a",

  dir: "bookmarks",

  ui: {
    titleSuffix: "Посилання",
    showCounts: true,
  },

  cleanTitleSites: ["YouTube", "Google Диск", "Google Drive"],

  customIcons: {
    "docs.google.com/document": "data/favicons/document.ico",
    "docs.google.com/spreadsheets": "data/favicons/spreadsheets.ico",
    "onlinevkino.com": "data/favicons/default.png",
  },

  tabs: ["Спорт", "Проектор", "Робота", "Звички", "Нотатки", "Завдання"],

  specialTabs: {
    Звички: "habits",
    Нотатки: "notes",
    Завдання: "tasks",
  },
};

/* ============ КІНЕЦЬ НАЛАШТУВАНЬ ============ */

// Глобальні змінні
const bookmarksData = {};

async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkAccess() {
  const LS_KEY = "tab_links_access";
  const ATTEMPTS_KEY = "tab_links_attempts";
  const LAST_KEY = "tab_links_last_attempt";

  if (localStorage.getItem(LS_KEY) === CONFIG.secretKeyHash) return true;

  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0");
  const lastAttempt = parseInt(localStorage.getItem(LAST_KEY) || "0");

  const waitSeconds =
    attempts === 0 ? 0 : Math.min(Math.pow(2, attempts - 1), 300);
  const elapsed = (Date.now() - lastAttempt) / 1000;

  if (elapsed < waitSeconds) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#ccc;font-family:sans-serif;font-size:18px">
        Зачекайте ${Math.ceil(waitSeconds - elapsed)} сек.
      </div>`;
    return false;
  }

  const password = prompt(
    attempts >= 5
      ? "Введіть пароль (спроба " + (attempts + 1) + "):"
      : "Введіть пароль:",
  );
  if (!password) return false;

  const hash = await sha256(password);
  if (hash === CONFIG.secretKeyHash) {
    localStorage.setItem(LS_KEY, CONFIG.secretKeyHash);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LAST_KEY);
    return true;
  }

  localStorage.setItem(ATTEMPTS_KEY, attempts + 1);
  localStorage.setItem(LAST_KEY, Date.now());
  alert("Невірний пароль!");
  return false;
}

function injectBody() {
  document.body.insertAdjacentHTML(
    "beforeend",
    '<div class="tabs" id="tabs-container"></div>' +
      '<div id="contents-container"></div>',
  );
}

// Завантажуємо скрипти паралельно, але виконуємо в заданому порядку
// (script.async = false для динамічно доданих скриптів зберігає порядок).
function loadScriptsInOrder(srcs) {
  return new Promise((resolve, reject) => {
    let remaining = srcs.length;
    if (!remaining) return resolve();
    srcs.forEach((src) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => {
        if (--remaining === 0) resolve();
      };
      s.onerror = reject;
      document.body.appendChild(s);
    });
  });
}

// Lazy-завантаження модуля нотаток (CSS + JS). Викликається з switchTab при першому
// відкритті вкладок "Нотатки" / "Швидка нотатка".
let _notesModulePromise = null;
function ensureNotesLoaded() {
  if (_notesModulePromise) return _notesModulePromise;
  _notesModulePromise = (async () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "notes/styles.css";
    document.head.appendChild(link);

    await loadScriptsInOrder([
      "notes/gist-storage.js",
      "notes/file-storage.js",
      "notes/storage.js",
      "notes/utils.js",
      "notes/checklists.js",
      "notes/ui.js",
      "notes/events.js",
      "notes/notes.js",
      "notes/gist-settings.js",
      "notes/quick-notes.js",
    ]);

    if (typeof initNotes === "function") initNotes();
    if (typeof initQuickNotes === "function") initQuickNotes();
  })();
  return _notesModulePromise;
}

// Реєстрація Service Worker (миттєвий повторний візит + офлайн).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

(async () => {
  const allowed = await checkAccess();
  if (!allowed) {
    window.location.replace("about:blank");
    return;
  }

  injectBody();

  // Тільки core: bookmarks + tasks + app + habits. Нотатки — lazy при першому відкритті.
  await loadScriptsInOrder([
    "bookmarks.js",
    "tasks.js",
    "habits/icons.js",
    "habits/date-utils.js",
    "habits/reminders.js",
    "habits/statistics.js",
    "habits/habits.js",
    "habits/gist-storage.js",
    "app.js",
  ]);

  loadDirectory();
})();
