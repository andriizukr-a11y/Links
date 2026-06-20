/* ========== REMINDERS SYSTEM ========== */

// Load CSS
if (!document.querySelector('link[href="habits/reminders.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'habits/reminders.css';
  document.head.appendChild(link);
}

let reminderCheckInterval = null;
let currentHabits = null;
let currentICONS = null;
let currentGetLocalDateStr = null;

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Цей браузер не підтримує сповіщення');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

function sendHabitReminder(habit) {
  if (!currentICONS || !currentGetLocalDateStr) {
    console.error('Reminder data not initialized');
    return;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  const ICONS = currentICONS;
  const getLocalDateStr = currentGetLocalDateStr;
  const today = getLocalDateStr();
  const isAlreadyDone = habit.dates.includes(today);
  const isAlreadySkipped = habit.skippedDates && habit.skippedDates.includes(today);

  if (isAlreadyDone || isAlreadySkipped) {
    return; // Не відправляти нагадування, якщо вже виконано або пропущено сьогодні
  }

  const iconSvg = ICONS.find(icon => icon.id === habit.icon)?.svg || '';

  console.log(`Creating notification for: ${habit.name}`);

  const notification = new Notification(`🔔 Нагадування: ${habit.name}`, {
    body: 'Час виконати вашу звичку!',
    icon: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`,
    tag: `habit-${habit.id}-${today}`,
    requireInteraction: true
  });

  notification.onclick = function() {
    window.focus();
    notification.close();
  };
}

function checkReminders() {
  if (!currentHabits || !currentICONS || !currentGetLocalDateStr) {
    console.log('Reminder data not initialized');
    return;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = currentGetLocalDateStr();

  console.log('Checking reminders at:', currentTime);

  // Отримуємо актуальні дані про звички з localStorage
  const habits = JSON.parse(localStorage.getItem('habits') || '[]');
  const ICONS = currentICONS;
  const getLocalDateStr = currentGetLocalDateStr;

  // Отримуємо час останніх нагадувань з localStorage
  const lastReminders = JSON.parse(localStorage.getItem('lastReminders') || '{}');

  habits.forEach(habit => {
    if (!habit.reminderEnabled) return;

    const today = getLocalDateStr();
    const isAlreadyDone = habit.dates.includes(today);
    const isAlreadySkipped = habit.skippedDates && habit.skippedDates.includes(today);

    console.log(`Habit: ${habit.name}, enabled: ${habit.reminderTime}, done: ${isAlreadyDone}, skipped: ${isAlreadySkipped}`);

    // Не відправляти нагадування, якщо вже виконано або пропущено сьогодні
    if (isAlreadyDone || isAlreadySkipped) return;

    const habitReminderKey = `habit-${habit.id}-${today}`;
    const lastReminderTime = lastReminders[habitReminderKey];

    // Перевіряємо чи настав час нагадування
    let shouldSendReminder = false;

    if (!lastReminderTime) {
      // Перше нагадування дня - відправляємо у вказаний час
      console.log(`First reminder check: habit time ${habit.reminderTime} vs current ${currentTime}`);
      if (habit.reminderTime === currentTime) {
        shouldSendReminder = true;
      }
    } else {
      // Повторні нагадування - кожні 2 години після першого
      const lastReminderDate = new Date(lastReminderTime);
      const hoursSinceLastReminder = (now - lastReminderDate) / (1000 * 60 * 60);

      console.log(`Repeat reminder check: hours since last: ${hoursSinceLastReminder.toFixed(2)}`);

      if (hoursSinceLastReminder >= 2) {
        // Відправляємо якщо пройшло 2 або більше годин
        shouldSendReminder = true;
      }
    }

    if (shouldSendReminder) {
      console.log(`Sending reminder for: ${habit.name}`);
      sendHabitReminder(habit);
      // Зберігаємо час цього нагадування
      lastReminders[habitReminderKey] = now.toISOString();
      localStorage.setItem('lastReminders', JSON.stringify(lastReminders));
    }
  });
}

function startReminderChecker(habits, ICONS, getLocalDateStr) {
  // Зберігаємо посилання на актуальні дані
  currentHabits = habits;
  currentICONS = ICONS;
  currentGetLocalDateStr = getLocalDateStr;

  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
  }

  console.log('Starting reminder checker');

  // Перевіряємо кожну хвилину
  reminderCheckInterval = setInterval(checkReminders, 60000);

  // Також перевіряємо одразу при старті
  checkReminders();
}

function stopReminderChecker() {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
    reminderCheckInterval = null;
  }
}

async function testNotification() {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    alert('Будь ласка, надайте дозвіл на сповіщення в налаштуваннях браузера');
    return;
  }

  const testNotification = new Notification('🔔 Тест сповіщень', {
    body: 'Сповіщення працюють коректно!',
    icon: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%235b9cf5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'),
    requireInteraction: true
  });

  testNotification.onclick = function() {
    window.focus();
    testNotification.close();
  };
}

function toggleReminderTimeInput(checkboxId, timeInputId) {
  const checkbox = document.getElementById(checkboxId);
  const timeInput = document.getElementById(timeInputId);
  
  if (checkbox.checked) {
    timeInput.style.display = 'block';
    // Запитуємо дозвіл на сповіщення при ввімкненні нагадувань
    requestNotificationPermission();
  } else {
    timeInput.style.display = 'none';
  }
}

function cleanupOldReminders() {
  if (!currentGetLocalDateStr) {
    console.error('getLocalDateStr not initialized');
    return;
  }

  const lastReminders = JSON.parse(localStorage.getItem('lastReminders') || '{}');
  const today = currentGetLocalDateStr();
  let cleaned = false;

  console.log('Cleaning old reminders for today:', today);

  // Видаляємо записи з попередніх днів
  Object.keys(lastReminders).forEach(key => {
    if (!key.includes(today)) {
      delete lastReminders[key];
      cleaned = true;
    }
  });

  if (cleaned) {
    localStorage.setItem('lastReminders', JSON.stringify(lastReminders));
    console.log('Cleaned old reminders');
  }
}

// Функція для ручного тестування нагадувань
function testHabitReminder() {
  if (!currentHabits || currentHabits.length === 0) {
    console.log('No habits available');
    return;
  }

  const habitWithReminder = currentHabits.find(h => h.reminderEnabled);
  if (!habitWithReminder) {
    console.log('No habits with reminders enabled');
    return;
  }

  console.log('Testing reminder for:', habitWithReminder.name);
  sendHabitReminder(habitWithReminder);
}

// Експортуємо функції для використання в habits.js
window.requestNotificationPermission = requestNotificationPermission;
window.startReminderChecker = startReminderChecker;
window.stopReminderChecker = stopReminderChecker;
window.testNotification = testNotification;
window.toggleReminderTimeInput = toggleReminderTimeInput;
window.cleanupOldReminders = cleanupOldReminders;
window.testHabitReminder = testHabitReminder;
