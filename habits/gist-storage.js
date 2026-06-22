/* ========== GIST STORAGE FOR HABITS ========== */

// This class expects the following global from the main file:
// - habits (array of habit objects)

class HabitsGistStorage {
  constructor() {
    this.config = this.loadConfig();
    this.isSyncing = false;
    this.syncTimer = null;
    this.debounceTimer = null;
    this.pendingChanges = false;
    this.lastSyncTime = null;
    this.lastSyncData = null;
    this._suppressAutoSync = false;
  }

  loadConfig() {
    try {
      // Використовуємо той самий config, що й нотатки
      const config = JSON.parse(localStorage.getItem('gist_config'));
      return config || { token: '', gistId: '', enabled: false };
    } catch {
      return { token: '', gistId: '', enabled: false };
    }
  }

  saveConfig(config) {
    this.config = config;
    localStorage.setItem('gist_config', JSON.stringify(config));
  }

  isEnabled() {
    return this.config.enabled && this.config.token && this.config.gistId;
  }

  async updateHabitsInGist() {
    if (!this.isEnabled() || this.isSyncing) {
      return false;
    }

    this.isSyncing = true;

    try {
      const habitsData = {
        version: '1.0',
        habits: habits,
        lastSync: new Date().toISOString()
      };

      // Перевіряємо чи змінилися дані порівняно з останньою синхронізацією
      const currentDataHash = JSON.stringify(habitsData);
      if (this.lastSyncData === currentDataHash) {
        console.log('Habits data unchanged, skipping sync');
        this.pendingChanges = false;
        this.isSyncing = false;
        return false;
      }

      // Спочатку завантажуємо поточний gist
      const gistResponse = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        headers: {
          'Authorization': `token ${this.config.token}`
        }
      });

      if (!gistResponse.ok) {
        throw new Error('Не вдалося завантажити gist');
      }

      const gist = await gistResponse.json();

      // Оновлюємо тільки habits-data.json, зберігаючи інші файли
      const files = { ...gist.files };
      files['habits-data.json'] = {
        content: JSON.stringify(habitsData, null, 2)
      };

      // Видаляємо файли, які не повинні бути в gist (notes-data.json залишаємо)
      const updateResponse = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files })
      });

      if (!updateResponse.ok) {
        throw new Error('Не вдалося оновити gist');
      }

      this.lastSyncTime = new Date();
      this.lastSyncData = currentDataHash;
      this.pendingChanges = false;
      return true;
    } catch (error) {
      console.error('Habits Gist sync error:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  async loadHabitsFromGist() {
    if (!this.isEnabled()) {
      throw new Error('Gist синхронізація не налаштована');
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        headers: {
          'Authorization': `token ${this.config.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Не вдалося завантажити gist');
      }

      const gist = await response.json();
      const file = gist.files['habits-data.json'];

      if (!file) {
        // Якщо файл habits не існує, створюємо його з поточними даними
        await this.updateHabitsInGist();
        return habits;
      }

      let content = file.content;

      if (file.truncated) {
        const rawResponse = await fetch(file.raw_url);
        if (!rawResponse.ok) throw new Error('Не вдалося завантажити повний вміст gist');
        content = await rawResponse.text();
      }

      const data = JSON.parse(content);

      if (data.habits && Array.isArray(data.habits)) {
        return data.habits;
      }

      throw new Error('Невірний формат даних habits');
    } catch (error) {
      console.error('Habits Gist load error:', error);
      throw error;
    }
  }

  startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (!this.isEnabled()) {
      return;
    }

    // Синхронізація кожні 5 хвилин (300 секунд) тільки якщо є зміни
    this.syncTimer = setInterval(() => {
      if (this.pendingChanges && !this.isSyncing) {
        this.updateHabitsInGist().catch(err => {
          console.error('Auto-sync failed:', err);
        });
      }
    }, 300000);
  }

  markPendingChanges() {
    if (this._suppressAutoSync) return;
    this.pendingChanges = true;
    this.scheduleImmediateSync();
  }

  scheduleImmediateSync() {
    if (!this.isEnabled() || this._suppressAutoSync) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (this.pendingChanges && !this.isSyncing) {
        this.updateHabitsInGist().catch(err => {
          console.error('Immediate sync failed:', err);
        });
      }
    }, 10000); // 10 секунд debounce, як в notes
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Створюємо екземпляр gist storage для habits
const habitsGistStorage = new HabitsGistStorage();

function manualSync() {
  if (!habitsGistStorage.isEnabled()) {
    alert('Синхронізація з Gist не налаштована. Налаштуйте її в нотатках.');
    return;
  }

  const syncBtn = document.querySelector('.sync-btn');
  if (syncBtn) {
    syncBtn.classList.add('syncing');
  }

  habitsGistStorage.loadHabitsFromGist()
    .then(gistHabits => {
      if (gistHabits && gistHabits.length > 0) {
        const localHabits = JSON.parse(localStorage.getItem('habits') || '[]');
        if (gistHabits.length !== localHabits.length || 
            JSON.stringify(gistHabits) !== JSON.stringify(localHabits)) {
          habits = gistHabits;
          localStorage.setItem('habits', JSON.stringify(habits));
          renderHabits();
          alert('Дані успішно синхронізовано з Gist!');
        } else {
          alert('Дані вже синхронізовано.');
        }
      }
      habitsGistStorage.updateHabitsInGist();
    })
    .catch(err => {
      console.error('Manual sync error:', err);
      alert('Помилка синхронізації: ' + err.message);
    })
    .finally(() => {
      if (syncBtn) {
        syncBtn.classList.remove('syncing');
      }
    });
}