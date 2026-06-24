/* ========== DATA MANAGEMENT FUNCTIONS ========== */

// These functions expect the following globals from the main file:
// - habits (array of habit objects)
// - habitsGistStorage (object for gist storage)
// - ICONS (array of icon objects)
// - saveHabits() (function)
// - renderHabits() (function)

function saveHabits() {
  try {
    const data = JSON.stringify(habits);
    localStorage.setItem('habits', data);
    // Перевіряємо, що дані реально збережені
    const saved = localStorage.getItem('habits');
    if (saved !== data) {
      console.error('Habits save verification failed');
      // Пробуємо ще раз
      localStorage.setItem('habits', data);
    } else {
      console.log('Habits saved successfully, total habits:', habits.length);
    }
  } catch (e) {
    console.error('Error saving habits to localStorage:', e);
  }
  // Синхронізація з gist через debounce
  if (habitsGistStorage.isEnabled()) {
    habitsGistStorage.markPendingChanges();
  }
}

function exportData() {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    habits: habits
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Валідація даних
      if (!data.habits || !Array.isArray(data.habits)) {
        throw new Error('Невірний формат даних');
      }

      // Валідація структури кожної звички
      const validHabits = data.habits.filter(habit => {
        return habit.id && 
               habit.name && 
               habit.icon && 
               Array.isArray(habit.dates);
      });

      if (validHabits.length === 0) {
        throw new Error('Немає валідних звичок для імпорту');
      }

      // Підтвердження імпорту
      if (confirm(`Імпортувати ${validHabits.length} звичок? Ця дія перезапише поточні дані.`)) {
        habits = validHabits;
        saveHabits();
        renderHabits();
        alert('Дані успішно імпортовано!');
      }
    } catch (error) {
      alert('Помилка імпорту: ' + error.message);
    } finally {
      // Очищення input
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}

function manualSync() {
  if (!habitsGistStorage.isEnabled()) {
    alert('Gist синхронізація не налаштована');
    return;
  }

  habitsGistStorage.loadHabitsFromGist().then(gistHabits => {
    if (gistHabits && gistHabits.length > 0) {
      if (confirm(`Знайдено ${gistHabits.length} звичок в Gist. Перезаписати локальні дані?`)) {
        habits = gistHabits;
        saveHabits();
        renderHabits();
        alert('Дані успішно синхронізовано з Gist!');
      }
    } else {
      alert('Gist порожній або недоступний');
    }
  }).catch(err => {
    console.error('Failed to sync with Gist:', err);
    alert('Помилка синхронізації: ' + err.message);
  });
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    });
  } else {
    console.log('This browser does not support desktop notification');
  }
}

function testNotification() {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Тест сповіщення', {
        body: 'Це тестове сповіщення від Habits Tracker',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Тест сповіщення', {
            body: 'Це тестове сповіщення від Habits Tracker',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>'
          });
        }
      });
    } else {
      alert('Сповіщення заблоковано. Будь ласка, дозвольте сповіщення в налаштуваннях браузера.');
    }
  } else {
    alert('Цей браузер не підтримує сповіщення');
  }
}
