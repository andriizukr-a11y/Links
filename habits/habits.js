/* ========== HABITS TRACKER ========== */

let habits = [];
let habitToDelete = null;

// Перевіряємо цілісність даних при завантаженні
try {
  const stored = localStorage.getItem("habits");
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      habits = parsed;
    }
  }
} catch (e) {
  console.error("Error loading habits from localStorage:", e);
  habits = [];
}

// Перевіряємо чи потрібно мігрувати
habits = habits.map((habit) => {
  if (typeof habit.icon === "string" && emojiToIconMap[habit.icon]) {
    return { ...habit, icon: emojiToIconMap[habit.icon] };
  }
  // Додаємо halfDates якщо його немає
  if (!habit.halfDates) {
    return { ...habit, halfDates: [] };
  }
  // Додаємо type якщо його немає (default: 'good')
  if (!habit.type) {
    return { ...habit, type: "good" };
  }
  return habit;
});

// Зберігаємо міговані дані
localStorage.setItem("habits", JSON.stringify(habits));
let selectedIcon = ICONS[0];
let editingHabitId = null;
let editSelectedIcon = ICONS[0];
let draggedHabitId = null;

function initHabits() {
  const output = document.getElementById("output-habits");
  if (!output) return;

  // Load CSS
  if (!document.querySelector('link[href="habits/styles.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "habits/styles.css";
    document.head.appendChild(link);
  }

  // Load module scripts dynamically
  const loadModule = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Load all modules
  Promise.all([
    loadModule("habits/ui-tools.js"),
    loadModule("habits/modals.js"),
    loadModule("habits/data-manager.js"),
    loadModule("habits/statistics.js"),
    loadModule("habits/habit-interactions.js"),
    loadModule("habits/date-utils.js"),
  ])
    .then(() => {
      console.log("All modules loaded successfully");
      // Перевіряємо, чи доступні необхідні функції
      if (typeof getLocalDateStr === "function") {
        console.log("getLocalDateStr is available");
      } else {
        console.error("getLocalDateStr is not available");
      }
      renderIconPicker();
      renderEditIconPicker();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          renderHabits();
        });
      });
    })
    .catch((err) => {
      console.error("Failed to load modules:", err);
    });

  // Load reminders.js
  if (!document.querySelector('script[src="habits/reminders.js"]')) {
    const script = document.createElement("script");
    script.src = "habits/reminders.js";
    script.onload = function () {
      console.log("reminders.js loaded successfully");
      // Ініціалізуємо нагадування після завантаження
      if (typeof startReminderChecker === "function") {
        startReminderChecker(habits, ICONS, getLocalDateStr);
      }
      if (typeof cleanupOldReminders === "function") {
        cleanupOldReminders();
      }
    };
    script.onerror = function () {
      console.error("Failed to load reminders.js");
    };
    document.head.appendChild(script);
  } else {
    // Якщо скрипт вже завантажений, ініціалізуємо нагадування
    setTimeout(() => {
      if (typeof startReminderChecker === "function") {
        startReminderChecker(habits, ICONS, getLocalDateStr);
      }
      if (typeof cleanupOldReminders === "function") {
        cleanupOldReminders();
      }
    }, 100);
  }

  // ВИМКНЕНО автоматичне завантаження з gist при ініціалізації, щоб уникнути перезапису локальних змін
  // Якщо потрібна синхронізація, використовуйте кнопку "Синхронізувати з Gist"
  // if (habitsGistStorage.isEnabled()) {
  //   habitsGistStorage.loadHabitsFromGist().then(gistHabits => {
  //     if (gistHabits && gistHabits.length > 0) {
  //       // Порівнюємо з локальними даними та беремо новіші
  //       const localHabits = JSON.parse(localStorage.getItem('habits') || '[]');
  //       if (gistHabits.length !== localHabits.length ||
  //           JSON.stringify(gistHabits) !== JSON.stringify(localHabits)) {
  //         habits = gistHabits;
  //         localStorage.setItem('habits', JSON.stringify(habits));
  //         console.log('Habits loaded from Gist');
  //       }
  //     }
  //     habitsGistStorage.startAutoSync();
  //   }).catch(err => {
  //     console.error('Failed to load habits from Gist:', err);
  //     habitsGistStorage.startAutoSync();
  //   });
  // }

  // Тільки авто-синхронізація для збереження змін в gist (без завантаження)
  if (habitsGistStorage.isEnabled()) {
    habitsGistStorage.startAutoSync();
  }

  // Перевіряємо, чи є звички з увімкненими нагадуваннями
  const hasReminderEnabled = habits.some((h) => h.reminderEnabled);
  if (hasReminderEnabled) {
    requestNotificationPermission();
  }

  // HTML content directly embedded
  const html = `
<div class="habits-container" id="habitsContainer"></div>

<div class="habits-actions">
  <button class="export-btn" onclick="exportData()" title="Експортувати дані">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
  </button>
  <button class="import-btn" onclick="document.getElementById('importFile').click()" title="Імпортувати дані">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
  </button>
  <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importData(event)">
  <button class="sync-btn" onclick="manualSync()" title="Синхронізувати з Gist">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
  </button>
  <button class="stats-btn" onclick="openStatsModal()" title="Статистика">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
  </button>
  <button class="notification-btn" onclick="testNotification()" title="Тест сповіщень">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  </button>
  <button class="add-btn" onclick="openModal()">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  </button>
</div>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <h3>Нова звичка</h3>
    <input type="text" id="habitName" placeholder="наприклад, Спорт" maxlength="30">
    <div class="modal-section-label">Іконка</div>
    <div class="icon-picker" id="iconPicker"></div>
    <div class="modal-section-label">Тип звички</div>
    <div class="type-selector">
      <label class="type-option">
        <input type="radio" name="habitType" value="good" checked>
        <span class="type-label good">Корисна</span>
      </label>
      <label class="type-option">
        <input type="radio" name="habitType" value="bad">
        <span class="type-label bad">Шкідлива</span>
      </label>
    </div>
    <div class="reminder-settings">
      <label class="reminder-toggle">
        <input type="checkbox" id="reminderEnabled">
        <span>Нагадування</span>
      </label>
      <input type="time" id="reminderTime" class="reminder-time-input" style="display: none;" value="09:00">
    </div>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeModal()">Скасувати</button>
      <button class="modal-btn save" onclick="saveHabit()">Зберегти</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="editModal">
  <div class="modal">
    <h3>Редагувати звичку</h3>
    <input type="text" id="editHabitName" placeholder="наприклад, Спорт" maxlength="30">
    <div class="modal-section-label">Іконка</div>
    <div class="icon-picker" id="editIconPicker"></div>
    <div class="modal-section-label">Тип звички</div>
    <div class="type-selector">
      <label class="type-option">
        <input type="radio" name="editHabitType" value="good">
        <span class="type-label good">Корисна</span>
      </label>
      <label class="type-option">
        <input type="radio" name="editHabitType" value="bad">
        <span class="type-label bad">Шкідлива</span>
      </label>
    </div>
    <div class="reminder-settings">
      <label class="reminder-toggle">
        <input type="checkbox" id="editReminderEnabled">
        <span>Нагадування</span>
      </label>
      <input type="time" id="editReminderTime" class="reminder-time-input" style="display: none;" value="09:00">
    </div>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeEditModal()">Скасувати</button>
      <button class="modal-btn danger" onclick="deleteHabitFromEditModal()">Видалити</button>
      <button class="modal-btn save" onclick="saveEditHabit()">Зберегти</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="statsModal">
  <div class="modal stats-modal">
    <h3>📊 Статистика</h3>
    <div class="stats-tabs">
      <button class="stats-tab active" data-tab="trends">Тенденції</button>
      <button class="stats-tab" data-tab="comparison">Порівняння</button>
      <button class="stats-tab" data-tab="analysis">Аналіз</button>
    </div>
    <div class="stats-content" id="statsContent"></div>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeStatsModal()">Закрити</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="deleteModal">
  <div class="modal">
    <h3>Підтвердження видалення</h3>
    <p style="color: #e8e8e8; text-align: center; margin-bottom: 24px;">Ви впевнені, що хочете видалити цю звичку?</p>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeDeleteModal()">Скасувати</button>
      <button class="modal-btn danger" onclick="confirmDelete()">Видалити</button>
    </div>
  </div>
</div>`;

  output.innerHTML = html;

  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("editModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  // Додамо event listeners для кнопки плюс
  const addBtn = document.querySelector(".add-btn");
  const habitsActions = document.querySelector(".habits-actions");
  if (addBtn && habitsActions) {
    addBtn.addEventListener("mouseenter", () => {
      habitsActions.classList.add("show-actions");
    });

    habitsActions.addEventListener("mouseleave", () => {
      habitsActions.classList.remove("show-actions");
    });
  }
  document.getElementById("statsModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeStatsModal();
  });

  // Stats tabs event listeners
  document.querySelectorAll(".stats-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".stats-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderStatsContent(tab.dataset.tab);
    });
  });

  // Reminder toggle event listeners
  const reminderEnabled = document.getElementById("reminderEnabled");
  const reminderTime = document.getElementById("reminderTime");
  if (reminderEnabled && reminderTime) {
    reminderEnabled.addEventListener("change", () => {
      reminderTime.style.display = reminderEnabled.checked ? "block" : "none";
    });
  }

  const editReminderEnabled = document.getElementById("editReminderEnabled");
  const editReminderTime = document.getElementById("editReminderTime");
  if (editReminderEnabled && editReminderTime) {
    editReminderEnabled.addEventListener("change", () => {
      editReminderTime.style.display = editReminderEnabled.checked
        ? "block"
        : "none";
    });
  }
}

function handleMiddleClick(habitId, dateStr, event) {
  // Перевіряємо, чи натиснута середня кнопка миші (button === 1)
  if (event.button === 1) {
    event.preventDefault();
    toggleHalfDate(habitId, dateStr, event);
  }
}

function toggleToday(habitId, event) {
  const today = new Date().toISOString().split("T")[0];
  toggleDate(habitId, today, event);
}

function manualSync() {
  if (!habitsGistStorage.isEnabled()) {
    alert("Gist синхронізація не налаштована");
    return;
  }

  habitsGistStorage
    .loadHabitsFromGist()
    .then((gistHabits) => {
      if (gistHabits && gistHabits.length > 0) {
        if (
          confirm(
            `Знайдено ${gistHabits.length} звичок в Gist. Перезаписати локальні дані?`,
          )
        ) {
          habits = gistHabits;
          saveHabits();
          renderHabits();
          alert("Дані успішно синхронізовано з Gist!");
        }
      } else {
        alert("Gist порожній або недоступний");
      }
    })
    .catch((err) => {
      console.error("Failed to sync with Gist:", err);
      alert("Помилка синхронізації: " + err.message);
    });
}

function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied");
      }
    });
  } else {
    console.log("This browser does not support desktop notification");
  }
}

function testNotification() {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Тест сповіщення", {
        body: "Це тестове сповіщення від Habits Tracker",
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Тест сповіщення", {
            body: "Це тестове сповіщення від Habits Tracker",
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
          });
        }
      });
    } else {
      alert(
        "Сповіщення заблоковано. Будь ласка, дозвольте сповіщення в налаштуваннях браузера.",
      );
    }
  } else {
    alert("Цей браузер не підтримує сповіщення");
  }
}

function toggleStats() {
  const statsBlock = document.getElementById("habitsStats");
  if (statsBlock) {
    statsBlock.classList.toggle("collapsed");
    const isCollapsed = statsBlock.classList.contains("collapsed");
    localStorage.setItem("habitsStatsCollapsed", isCollapsed);
  }
}

function renderHabits() {
  const container = document.getElementById("habitsContainer");
  if (!container) return;

  if (!habits.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Ще немає звичок</h3>
        <p>Натисніть кнопку +, щоб додати першу звичку</p>
      </div>
    `;
    return;
  }

  // Розділяємо звички за типом
  const goodHabits = habits.filter((h) => (h.type || "good") === "good");
  const badHabits = habits.filter((h) => h.type === "bad");

  if (!goodHabits.length && !badHabits.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Ще немає звичок</h3>
        <p>Натисніть кнопку +, щоб додати першу звичку</p>
      </div>
    `;
    return;
  }

  // Очищаємо кеш, щоб гарантувати свіжі дані
  if (typeof clearYearDatesCache === "function") {
    clearYearDatesCache();
  }

  const currentYear = new Date().getFullYear();
  const yearDates = typeof getYearDates === "function" ? getYearDates() : [];
  const today = new Date().toISOString().split("T")[0];

  // Оптимізація: обчислюємо загальні дані один раз для всіх звичок
  const daysGrid = yearDates.map((dateStr) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0 = неділя, 1 = понеділок, ..., 6 = субота
    // Конвертуємо в систему де 0 = понеділок, 6 = неділя
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      dateStr,
      dayOfWeek: adjustedDayOfWeek,
      month: d.getMonth(),
    };
  });

  const firstDayOffset = daysGrid[0].dayOfWeek;
  const lastDayOffset = daysGrid[daysGrid.length - 1].dayOfWeek;
  const endPadding = 6 - lastDayOffset;

  // Генеруємо дати з попереднього року для заповнення початку
  const previousYearDates = [];
  if (firstDayOffset > 0) {
    const prevYear = currentYear - 1;
    const prevYearEnd = new Date(prevYear, 11, 31);
    // Йдемо назад від останнього дня попереднього року в правильному порядку
    for (let i = 0; i < firstDayOffset; i++) {
      const d = new Date(prevYearEnd);
      d.setDate(d.getDate() - (firstDayOffset - 1 - i));
      // Формуємо дату вручну, щоб уникнути проблем з часовими зонами
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      previousYearDates.push(`${year}-${month}-${day}`);
    }
  }

  // Генеруємо дати з наступного року для заповнення кінця
  const nextYearDates = [];
  if (endPadding > 0) {
    const nextYear = currentYear + 1;
    const nextYearStart = new Date(nextYear, 0, 1);
    // Йдемо вперед від першого дня наступного року
    for (let i = 0; i < endPadding; i++) {
      const d = new Date(nextYearStart);
      d.setDate(d.getDate() + i);
      // Формуємо дату вручну, щоб уникнути проблем з часовими зонами
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      nextYearDates.push(`${year}-${month}-${day}`);
    }
  }

  const allCells = [];
  // Додаємо дати з попереднього року
  previousYearDates.forEach((date) =>
    allCells.push({ dateStr: date, isPadding: true }),
  );
  // Додаємо дати поточного року
  daysGrid.forEach((day) =>
    allCells.push({ dateStr: day.dateStr, isPadding: false }),
  );
  // Додаємо дати з наступного року
  nextYearDates.forEach((date) =>
    allCells.push({ dateStr: date, isPadding: true }),
  );

  const weeks = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  const totalDays = yearDates.length;

  // Функція для генерації HTML однієї звички
  const renderHabitCard = (habit) => {
    const completed =
      habit.dates.length + (habit.halfDates ? habit.halfDates.length * 0.5 : 0);
    const percent = totalDays ? Math.round((completed / totalDays) * 100) : 0;
    const streak =
      typeof getStreak === "function"
        ? getStreak(habit.dates, habit.skippedDates, habit.type)
        : 0;
    const longest =
      typeof getLongestStreak === "function"
        ? getLongestStreak(habit.dates)
        : 0;
    const monthData =
      typeof getMonthData === "function" ? getMonthData(habit.dates) : [];
    const isDoneToday = habit.dates.includes(today);
    const isSkippedToday =
      habit.skippedDates && habit.skippedDates.includes(today);
    const maxMonth =
      monthData.length > 0 ? Math.max(...monthData.map((m) => m.count), 1) : 1;
    const habitType = habit.type || "good";

    // Build heatmap HTML
    let heatmapHTML = '<div class="heatmap-wrapper">';

    // Оптимізація: використовуємо Set для O(1) lookup дат
    const habitDatesSet = new Set(habit.dates);
    const habitSkippedSet = new Set(habit.skippedDates || []);
    const habitHalfSet = new Set(habit.halfDates || []);

    // Для шкідливих звичок: будуємо Set дат, що лежать між
    // сусідніми відміченими клітинками (і від останньої до сьогодні)
    const cleanDatesSet = new Set();
    if (habitType === "bad") {
      const sortedDates = [...habit.dates].sort();
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const from = sortedDates[i];
        const to = sortedDates[i + 1];
        // Додаємо всі дати між двома сусідніми active-датами
        let d = new Date(from);
        d.setDate(d.getDate() + 1);
        const end = new Date(to);
        while (d < end) {
          cleanDatesSet.add(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
      }
      // Від останньої active-дати до сьогодні
      if (sortedDates.length > 0) {
        const last = sortedDates[sortedDates.length - 1];
        if (last < today) {
          let d = new Date(last);
          d.setDate(d.getDate() + 1);
          const end = new Date(today);
          end.setDate(end.getDate() + 1); // включаємо today
          while (d < end) {
            cleanDatesSet.add(d.toISOString().slice(0, 10));
            d.setDate(d.getDate() + 1);
          }
        }
      }
    }

    // Heatmap grid
    heatmapHTML += '<div class="heatmap">';
    weeks.forEach((week, weekIdx) => {
      heatmapHTML += '<div class="week-column">';
      week.forEach((cellData) => {
        const dateStr = cellData.dateStr;
        const isPadding = cellData.isPadding;
        const isActive = habitDatesSet.has(dateStr);
        const isSkipped = habitSkippedSet.has(dateStr);
        const isHalf = habitHalfSet.has(dateStr);
        const isToday = dateStr === today;
        const isFuture = dateStr > today;
        const isClean =
          habitType === "bad" &&
          cleanDatesSet.has(dateStr) &&
          !isActive &&
          !isSkipped;

        // Конвертуємо дату у формат dd.mm.yyyy для відображення
        const [year, month, day] = dateStr.split("-");
        const displayDate = `${day}.${month}`;

        if (isPadding) {
          // Клітинки з попереднього/наступного року - можна натискати, але вони з іншим стилем
          heatmapHTML += `<div class="day-cell padding ${isActive ? "active" : ""} ${isSkipped ? "skipped" : ""} ${isHalf ? "half" : ""} ${isClean ? "clean" : ""}"
            onclick="toggleDate(${habit.id}, '${dateStr}', event)"
            oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
            onmousedown="handleMiddleClick(${habit.id}, '${dateStr}', event)"
            data-date="${displayDate}"></div>`;
        } else {
          // Клітинки поточного року
          heatmapHTML += `<div class="day-cell ${isActive ? "active" : ""} ${isSkipped ? "skipped" : ""} ${isHalf ? "half" : ""} ${isToday ? "today" : ""} ${isFuture ? "future" : ""} ${isClean ? "clean" : ""}"
          onclick="toggleDate(${habit.id}, '${dateStr}', event)"
          oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
          onmousedown="handleMiddleClick(${habit.id}, '${dateStr}', event)"
          data-date="${displayDate}"></div>`;
        }
      });
      heatmapHTML += "</div>";
    });
    heatmapHTML += "</div></div>";

    const chartHTML = monthData
      .map(
        (m) => `
      <div class="bar" style="height: ${Math.max((m.count / maxMonth) * 50, 4)}px;">
        <div class="bar-value">${m.count}</div>
        <div class="bar-label">${m.month}</div>
      </div>
    `,
      )
      .join("");

    const iconSvg =
      ICONS.find((icon) => icon.id === habit.icon)?.svg || ICONS[0].svg;
    const reminderIndicator = habit.reminderEnabled
      ? `<div class="reminder-indicator" title="Нагадування о ${habit.reminderTime}">🔔</div>`
      : "";

    return `
      <div class="habit-card ${habitType === "bad" ? "bad-habit" : ""}" data-habit-id="${habit.id}"
           ondragover="handleHabitDragOver(event)" ondrop="handleHabitDrop(event)"
           ondragleave="handleHabitDragLeave(event)"
           oncontextmenu="return false;">
        <div class="habit-drag-handle" draggable="true"
             ondragstart="handleHabitDragStart(event)" ondragend="handleHabitDragEnd(event)">⋮⋮</div>
        <div class="habit-main">
          <div class="habit-header">
            <div class="habit-icon" onclick="openEditModal(${habit.id})">${iconSvg}</div>
            <div class="habit-name" onclick="openEditModal(${habit.id})">${habit.name}</div>
            <div class="habit-top-right" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
              ${
                streak > 0
                  ? `
              <div class="streak-badge ${habitType === "bad" ? "bad-streak" : ""}" title="Серія: ${streak} днів поспіль">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                <span class="streak-count">${streak}</span>
              </div>
              `
                  : ""
              }
              <div class="habit-checkbox ${habitType === "bad" ? "bad-checkbox" : ""} ${isDoneToday ? "done" : ""} ${isSkippedToday ? "skipped" : ""}" onclick="toggleToday(${habit.id}, event)" oncontextmenu="toggleSkippedDate(${habit.id}, '${today}', event)">
                ${
                  isSkippedToday
                    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
                    : habitType === "bad"
                      ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
                      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
                }
              </div>
            </div>
          </div>
          ${heatmapHTML}
        </div>
      </div>
    `;
  };

  // Розраховуємо загальну статистику
  let totalCompleted = 0;
  let totalSkipped = 0;
  let totalBadActive = 0;

  goodHabits.forEach((h) => {
    totalCompleted += h.dates.length;
    totalSkipped += h.skippedDates ? h.skippedDates.length : 0;
  });

  badHabits.forEach((h) => {
    totalBadActive += h.dates.length;
    totalSkipped += h.skippedDates ? h.skippedDates.length : 0;
  });

  // Ефективність — останні 30 днів
  const d30ago = new Date();
  d30ago.setDate(d30ago.getDate() - 29);
  const cutoff = getLocalDateStr(d30ago);

  let r30Completed = 0,
    r30Skipped = 0,
    r30Bad = 0;
  goodHabits.forEach((h) => {
    r30Completed += h.dates.filter((d) => d >= cutoff).length;
    r30Skipped += h.skippedDates
      ? h.skippedDates.filter((d) => d >= cutoff).length
      : 0;
  });
  badHabits.forEach((h) => {
    r30Bad += h.dates.filter((d) => d >= cutoff).length;
    r30Skipped += h.skippedDates
      ? h.skippedDates.filter((d) => d >= cutoff).length
      : 0;
  });

  const r30Possible = r30Completed + r30Skipped + r30Bad;
  const efficiency =
    r30Possible > 0 ? Math.round((r30Completed / r30Possible) * 100) : 0;
  const todayDone = goodHabits.filter((h) => h.dates.includes(today)).length;
  const todayTotal = goodHabits.length;
  const todayPct =
    todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const svgCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
  const svgSkip = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
  const svgBad = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  let html = `
    <div class="habits-stats" id="habitsStats">
      <button class="hstats-toggle" onclick="toggleStats()" title="Згорнути/розгорнути">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="hstats-panels">
        <div class="hstats-panel">
          <div class="hstats-panel-label">Сьогодні</div>
          <div class="hstats-panel-row">
            <span class="hstats-num">${todayDone}<em> / ${todayTotal}</em></span>
            <div class="hstats-bar"><div class="hstats-bar-fill hstats-bar--blue" style="width:${todayPct}%"></div></div>
          </div>
        </div>
        <div class="hstats-panel">
          <div class="hstats-panel-label">Ефективність <span class="hstats-period">за 30 днів</span></div>
          <div class="hstats-panel-row">
            <span class="hstats-num">${efficiency}<em>%</em></span>
            <div class="hstats-bar"><div class="hstats-bar-fill hstats-bar--green" style="width:${efficiency}%"></div></div>
          </div>
        </div>
      </div>
      <div class="hstats-chips">
        <div class="hstats-chip hstats-chip--done">${svgCheck}<b>${totalCompleted}</b><span class="hstats-chip-lbl">виконано</span></div>
        <div class="hstats-chip hstats-chip--skip">${svgSkip}<b>${totalSkipped}</b><span class="hstats-chip-lbl">пропущено</span></div>
        <div class="hstats-chip hstats-chip--bad">${svgBad}<b>${totalBadActive}</b><span class="hstats-chip-lbl">порушено</span></div>
      </div>
    </div>
  `;
  if (goodHabits.length > 0) {
    html += '<div class="habits-section">';
    html += goodHabits.map(renderHabitCard).join("");
    html += "</div>";
  }

  // Додаємо шкідливі звички
  if (badHabits.length > 0) {
    html += '<div class="habits-section">';
    html += badHabits.map(renderHabitCard).join("");
    html += "</div>";
  }

  container.innerHTML = html;

  // Відновлюємо стан згортання з localStorage
  const statsBlock = document.getElementById("habitsStats");
  if (statsBlock) {
    const savedCollapsed = localStorage.getItem("habitsStatsCollapsed");
    if (savedCollapsed === "true") {
      statsBlock.classList.add("collapsed");
    } else {
      statsBlock.classList.remove("collapsed");
    }
  }

  // Додаємо event listeners для hover на всі heatmap
  setupHoverListeners();
}
