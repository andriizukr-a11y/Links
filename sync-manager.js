/* ========== CENTRALIZED SYNC MANAGER ========== */

const SYNC_CONFIG_KEY = 'gist_config';
const SYNC_INTERVAL = 300000; // 5 minutes
const SYNC_DEBOUNCE_MS = 10000; // 10 seconds

class SyncManager {
  constructor() {
    this.config = this.loadConfig();
    this.syncTimer = null;
    this.debounceTimer = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.pendingNotesChanges = false;
    this.pendingHabitsChanges = false;
    this.lastNotesData = null;
    this.lastHabitsData = null;
    this._suppressAutoSync = false;
  }

  loadConfig() {
    try {
      const config = JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY));
      return config || { token: '', gistId: '137d2db17448a9e988cf472452f77672', enabled: false };
    } catch {
      return { token: '', gistId: '137d2db17448a9e988cf472452f77672', enabled: false };
    }
  }

  saveConfig(config) {
    this.config = config;
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  }

  isEnabled() {
    return this.config.enabled && this.config.token && this.config.gistId;
  }

  // Отримання даних з notes модуля (будуть викликатися ззовні)
  getNotesData() {
    if (typeof getNotesData === 'function') return getNotesData();
    if (typeof getNotesTopics === 'function') return getNotesTopics();
    return null;
  }

  // Отримання даних з habits модуля
  getHabitsData() {
    if (typeof habits !== 'undefined') return habits;
    return null;
  }

  async syncToGist() {
    if (!this.isEnabled() || this.isSyncing) {
      return;
    }

    if (!this.pendingNotesChanges && !this.pendingHabitsChanges) {
      console.log('No changes to sync');
      return;
    }

    this.isSyncing = true;

    try {
      // Збираємо дані для синхронізації
      const files = {};

      // Додаємо notes дані якщо є зміни
      if (this.pendingNotesChanges) {
        const notesData = {
          notes: typeof getNotesData === 'function' ? getNotesData() : {},
          topics: typeof getNotesTopics === 'function' ? getNotesTopics() : [],
          timestamps: typeof getNotesTimestamps === 'function' ? getNotesTimestamps() : {},
          groups: typeof getNotesGroups === 'function' ? getNotesGroups() : [],
          topicGroups: typeof getTopicGroups === 'function' ? getTopicGroups() : {},
          mainGroup: typeof getMainGroupName === 'function' ? getMainGroupName() : '',
          collapsedGroups: typeof getCollapsedGroups === 'function' ? getCollapsedGroups() : [],
          activeTopic: typeof notesActiveTopic !== 'undefined' ? notesActiveTopic : '',
          sidebarWidth: parseInt(localStorage.getItem('notes_sidebar_width')) || 240,
          layoutWidth: parseInt(localStorage.getItem('notes_layout_width')) || 900,
          lastSync: new Date().toISOString()
        };

        const notesDataHash = JSON.stringify(notesData);
        if (this.lastNotesData !== notesDataHash) {
          files['notes-data.json'] = {
            content: JSON.stringify(notesData, null, 2)
          };
          this.lastNotesData = notesDataHash;
        } else {
          console.log('Notes data unchanged, skipping notes sync');
          this.pendingNotesChanges = false;
        }
      }

      // Додаємо habits дані якщо є зміни
      if (this.pendingHabitsChanges) {
        const habitsData = {
          version: '1.0',
          habits: this.getHabitsData(),
          lastSync: new Date().toISOString()
        };

        const habitsDataHash = JSON.stringify(habitsData);
        if (this.lastHabitsData !== habitsDataHash) {
          files['habits-data.json'] = {
            content: JSON.stringify(habitsData, null, 2)
          };
          this.lastHabitsData = habitsDataHash;
        } else {
          console.log('Habits data unchanged, skipping habits sync');
          this.pendingHabitsChanges = false;
        }
      }

      // Якщо немає файлів для оновлення, пропускаємо
      if (Object.keys(files).length === 0) {
        console.log('No files to update');
        this.isSyncing = false;
        return;
      }

      // Отримуємо поточний gist
      const gistResponse = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        headers: {
          'Authorization': `token ${this.config.token}`
        }
      });

      if (!gistResponse.ok) {
        throw new Error('Не вдалося завантажити gist');
      }

      const gist = await gistResponse.json();

      // Оновлюємо файли, зберігаючи інші
      const updatedFiles = { ...gist.files };
      Object.assign(updatedFiles, files);

      // Видаляємо файли, які не повинні бути в gist
      const updateResponse = await fetch(`https://api.github.com/gists/${this.config.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: updatedFiles })
      });

      if (!updateResponse.ok) {
        throw new Error('Не вдалося оновити gist');
      }

      this.lastSyncTime = new Date();
      this.pendingNotesChanges = false;
      this.pendingHabitsChanges = false;

      console.log('Sync completed successfully');

    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  markNotesPendingChanges() {
    if (this._suppressAutoSync) return;
    this.pendingNotesChanges = true;
    this.scheduleImmediateSync();
  }

  markHabitsPendingChanges() {
    if (this._suppressAutoSync) return;
    this.pendingHabitsChanges = true;
    this.scheduleImmediateSync();
  }

  scheduleImmediateSync() {
    if (!this.isEnabled() || this._suppressAutoSync) return;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if ((this.pendingNotesChanges || this.pendingHabitsChanges) && !this.isSyncing) {
        this.syncToGist().catch(err => {
          console.error('Immediate sync failed:', err);
        });
      }
    }, SYNC_DEBOUNCE_MS);
  }

  startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (!this.isEnabled()) {
      return;
    }

    this.syncTimer = setInterval(() => {
      if ((this.pendingNotesChanges || this.pendingHabitsChanges) && !this.isSyncing) {
        this.syncToGist().catch(err => {
          console.error('Auto-sync failed:', err);
        });
      }
    }, SYNC_INTERVAL);
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

// Створюємо глобальний екземпляр
const syncManager = new SyncManager();