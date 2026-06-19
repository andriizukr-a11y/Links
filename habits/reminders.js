/* ========== REMINDERS SYSTEM ========== */

// Load CSS
if (!document.querySelector('link[href="habits/reminders.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'habits/reminders.css';
  document.head.appendChild(link);
}

let reminderCheckInterval = null;

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

function sendHabitReminder(habit, ICONS, getLocalDateStr) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const today = getLocalDateStr();
  const isAlreadyDone = habit.dates.includes(today);
  const isAlreadySkipped = habit.skippedDates && habit.skippedDates.includes(today);

  if (isAlreadyDone || isAlreadySkipped) {
    return; // Не відправляти нагадування, якщо вже виконано або пропущено сьогодні
  }

  const iconSvg = ICONS.find(icon => icon.id === habit.icon)?.svg || '';
  
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

function checkReminders(habits, ICONS, getLocalDateStr) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = getLocalDateStr();

  habits.forEach(habit => {
    if (habit.reminderEnabled && habit.reminderTime === currentTime) {
      sendHabitReminder(habit, ICONS, getLocalDateStr);
    }
  });
}

function startReminderChecker(habits, ICONS, getLocalDateStr) {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
  }
  
  // Перевіряємо кожну хвилину
  reminderCheckInterval = setInterval(() => checkReminders(habits, ICONS, getLocalDateStr), 60000);
  
  // Також перевіряємо одразу при старті
  checkReminders(habits, ICONS, getLocalDateStr);
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

// Експортуємо функції для використання в habits.js
window.requestNotificationPermission = requestNotificationPermission;
window.startReminderChecker = startReminderChecker;
window.stopReminderChecker = stopReminderChecker;
window.testNotification = testNotification;
window.toggleReminderTimeInput = toggleReminderTimeInput;
