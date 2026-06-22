/* ========== HABITS TRACKER ========== */

let habits = [];
let habitToDelete = null;

// Перевіряємо цілісність даних при завантаженні
try {
  const stored = localStorage.getItem('habits');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      habits = parsed;
    }
  }
} catch (e) {
  console.error('Error loading habits from localStorage:', e);
  habits = [];
}

// Перевіряємо чи потрібно мігрувати
habits = habits.map(habit => {
  if (typeof habit.icon === 'string' && emojiToIconMap[habit.icon]) {
    return { ...habit, icon: emojiToIconMap[habit.icon] };
  }
  // Додаємо halfDates якщо його немає
  if (!habit.halfDates) {
    return { ...habit, halfDates: [] };
  }
  return habit;
});

// Зберігаємо міговані дані
localStorage.setItem('habits', JSON.stringify(habits));
let selectedIcon = ICONS[0];
let editingHabitId = null;
let editSelectedIcon = ICONS[0];
let draggedHabitId = null;
let cachedYearDates = null;
let cachedYear = null;

// Створюємо кастомний tooltip елемент
function createTooltip() {
  let tooltip = document.querySelector('.custom-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

// Показуємо кастомний tooltip
function showTooltip(text, x, y) {
  const tooltip = createTooltip();
  tooltip.textContent = text;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.classList.add('visible');
}

// Ховаємо кастомний tooltip
function hideTooltip() {
  const tooltip = document.querySelector('.custom-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}

function playSuccessSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const frequencies = [523.25, 659.25, 783.99];
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    const startTime = audioContext.currentTime + (index * 0.1);
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  });
}

function playUncheckSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const frequencies = [783.99, 659.25, 523.25];
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    const startTime = audioContext.currentTime + (index * 0.1);
    gainNode.gain.setValueAtTime(0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  });
}

function createConfetti(x, y) {
  const colors = ['#5b9cf5', '#4ac06a', '#ffd700', '#ff6b6b', '#a855f7'];
  const confettiCount = 30;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    `;
    
    document.body.appendChild(confetti);
    
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const velocity = 5 + Math.random() * 5;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let offsetX = 0;
    let offsetY = 0;
    let opacity = 1;
    
    const animate = () => {
      offsetX += vx;
      offsetY += vy + 2;
      opacity -= 0.02;
      
      confetti.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX * 10}deg)`;
      confetti.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    };
    
    requestAnimationFrame(animate);
  }
}

function playSkipSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const frequencies = [392.00, 349.23, 329.63];
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    const startTime = audioContext.currentTime + (index * 0.1);
    gainNode.gain.setValueAtTime(0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  });
}

function createSkipParticles(x, y) {
  const colors = ['#f85149', '#ff6b6b', '#cc3b33', '#e5534b'];
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
    `;
    
    document.body.appendChild(particle);
    
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const velocity = 3 + Math.random() * 4;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let offsetX = 0;
    let offsetY = 0;
    let opacity = 1;
    let rotation = 0;
    
    const animate = () => {
      offsetX += vx;
      offsetY += vy + 3;
      rotation += 10;
      opacity -= 0.025;
      
      particle.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animate);
  }
}

function initHabits() {
  const output = document.getElementById('output-habits');
  if (!output) return;

  // Load CSS
  if (!document.querySelector('link[href="habits/styles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'habits/styles.css';
    document.head.appendChild(link);
  }

  // Load reminders.js
  if (!document.querySelector('script[src="habits/reminders.js"]')) {
    const script = document.createElement('script');
    script.src = 'habits/reminders.js';
    script.onload = function() {
      console.log('reminders.js loaded successfully');
      // Ініціалізуємо нагадування після завантаження
      if (typeof cleanupOldReminders === 'function') {
        cleanupOldReminders();
      }
      if (typeof startReminderChecker === 'function') {
        startReminderChecker(habits, ICONS, getLocalDateStr);
      }
    };
    script.onerror = function() {
      console.error('Failed to load reminders.js');
    };
    document.head.appendChild(script);
  } else {
    // Якщо скрипт вже завантажений, ініціалізуємо нагадування
    setTimeout(() => {
      if (typeof cleanupOldReminders === 'function') {
        cleanupOldReminders();
      }
      if (typeof startReminderChecker === 'function') {
        startReminderChecker(habits, ICONS, getLocalDateStr);
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
  const hasReminderEnabled = habits.some(h => h.reminderEnabled);
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
    <div class="icon-picker" id="iconPicker"></div>
    <div class="reminder-settings">
      <label class="reminder-toggle">
        <input type="checkbox" id="reminderEnabled" onchange="toggleReminderTimeInput('reminderEnabled', 'reminderTime')">
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
    <div class="icon-picker" id="editIconPicker"></div>
    <div class="reminder-settings">
      <label class="reminder-toggle">
        <input type="checkbox" id="editReminderEnabled" onchange="toggleReminderTimeInput('editReminderEnabled', 'editReminderTime')">
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

  // Initialize the habits functionality - відкладаємо важкий рендеринг
  renderIconPicker();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      renderHabits();
    });
  });

  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  // Додамо event listeners для кнопки плюс
  const addBtn = document.querySelector('.add-btn');
  const habitsActions = document.querySelector('.habits-actions');
  if (addBtn && habitsActions) {
    addBtn.addEventListener('mouseenter', () => {
      habitsActions.classList.add('show-actions');
    });

    habitsActions.addEventListener('mouseleave', () => {
      habitsActions.classList.remove('show-actions');
    });
  }
  document.getElementById('statsModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeStatsModal();
  });
  
  // Stats tabs event listeners
  document.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStatsContent(tab.dataset.tab);
    });
  });
}

function renderIconPicker() {
  const picker = document.getElementById('iconPicker');
  if (!picker) return;
  picker.innerHTML = ICONS.map(icon => `
    <div class="icon-option ${icon.id === selectedIcon.id ? 'selected' : ''}" onclick="selectIcon('${icon.id}')">
      ${icon.svg}
    </div>
  `).join('');
}

function renderEditIconPicker() {
  const picker = document.getElementById('editIconPicker');
  if (!picker) return;
  picker.innerHTML = ICONS.map(icon => `
    <div class="icon-option ${icon.id === editSelectedIcon.id ? 'selected' : ''}" onclick="selectEditIcon('${icon.id}')">
      ${icon.svg}
    </div>
  `).join('');
}

function selectIcon(iconId) {
  selectedIcon = ICONS.find(icon => icon.id === iconId);
  renderIconPicker();
}

function selectEditIcon(iconId) {
  editSelectedIcon = ICONS.find(icon => icon.id === iconId);
  renderEditIconPicker();
}

function openModal() {
  document.getElementById('modal').classList.add('open');
  document.getElementById('habitName').value = '';
  document.getElementById('reminderEnabled').checked = false;
  document.getElementById('reminderTime').style.display = 'none';
  document.getElementById('reminderTime').value = '09:00';
  document.getElementById('habitName').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function openEditModal(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  editingHabitId = habitId;
  editSelectedIcon = ICONS.find(icon => icon.id === habit.icon) || ICONS[0];
  document.getElementById('editHabitName').value = habit.name;
  renderEditIconPicker();
  
  // Встановлюємо значення нагадувань
  document.getElementById('editReminderEnabled').checked = habit.reminderEnabled || false;
  document.getElementById('editReminderTime').value = habit.reminderTime || '09:00';
  
  if (habit.reminderEnabled) {
    document.getElementById('editReminderTime').style.display = 'block';
  } else {
    document.getElementById('editReminderTime').style.display = 'none';
  }
  
  document.getElementById('editModal').classList.add('open');
  document.getElementById('editHabitName').focus();
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
  editingHabitId = null;
}

function openDeleteModal(habitId) {
  habitToDelete = habitId;
  document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  habitToDelete = null;
}

function confirmDelete() {
  if (habitToDelete === null) return;
  habits = habits.filter(h => h.id !== habitToDelete);
  saveHabits();
  renderHabits();
  closeDeleteModal();
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) return;

  const reminderEnabled = document.getElementById('reminderEnabled').checked;
  const reminderTime = document.getElementById('reminderTime').value;

  const habit = {
    id: Date.now(),
    name,
    icon: selectedIcon.id,
    dates: [],           // <-- НЕ відмічаємо сьогодні автоматично
    skippedDates: [],    // <-- пустий масив для пропусків
    reminderEnabled,
    // Зберігаємо час нагадування навіть якщо вимкнено, щоб не загубити попереднє значення
    reminderTime: reminderEnabled ? reminderTime : (reminderTime || null)
  };

  habits.push(habit);
  saveHabits();
  closeModal();
  renderHabits();
}

function saveEditHabit() {
  const name = document.getElementById('editHabitName').value.trim();
  if (!name || !editingHabitId) return;

  const habit = habits.find(h => h.id === editingHabitId);
  if (habit) {
    habit.name = name;
    habit.icon = editSelectedIcon.id;
    
    const reminderEnabled = document.getElementById('editReminderEnabled').checked;
    const reminderTime = document.getElementById('editReminderTime').value;
    
    habit.reminderEnabled = reminderEnabled;
    // Зберігаємо час нагадування навіть якщо вимкнено, щоб не загубити попереднє значення
    if (reminderEnabled) {
      habit.reminderTime = reminderTime;
    }
    // Якщо вимкнено і час не було встановлено, залишаємо null, інакше зберігаємо поточне значення інпуту
    else if (reminderTime) {
      habit.reminderTime = reminderTime;
    }
    
    saveHabits();
  }
  closeEditModal();
  renderHabits();
}

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

function deleteHabit(id) {
  openDeleteModal(id);
}

function deleteHabitFromEditModal() {
  if (editingHabitId) {
    closeEditModal();
    openDeleteModal(editingHabitId);
  }
}

function handleHabitDragStart(event) {
  const handle = event.target.closest('.habit-drag-handle');
  const card = handle ? handle.closest('.habit-card') : event.target.closest('.habit-card');
  if (!card) return;
  draggedHabitId = parseInt(card.dataset.habitId);
  card.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
}

function handleHabitDragEnd(event) {
  const card = event.target.closest('.habit-card');
  if (card) {
    card.classList.remove('dragging');
  }
  document.querySelectorAll('.habit-card').forEach(c => {
    c.classList.remove('drag-over');
  });
}

function handleHabitDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const card = event.target.closest('.habit-card');
  if (card && parseInt(card.dataset.habitId) !== draggedHabitId) {
    card.classList.add('drag-over');
  }
}

function handleHabitDragLeave(event) {
  const card = event.target.closest('.habit-card');
  if (card) {
    card.classList.remove('drag-over');
  }
}

function handleHabitDrop(event) {
  event.preventDefault();
  const card = event.target.closest('.habit-card');
  if (!card) return;

  const targetHabitId = parseInt(card.dataset.habitId);
  if (targetHabitId === draggedHabitId) return;

  const draggedIndex = habits.findIndex(h => h.id === draggedHabitId);
  const targetIndex = habits.findIndex(h => h.id === targetHabitId);

  if (draggedIndex !== -1 && targetIndex !== -1) {
    const [draggedHabit] = habits.splice(draggedIndex, 1);
    habits.splice(targetIndex, 0, draggedHabit);
    saveHabits();
    renderHabits();
  }

  draggedHabitId = null;
}

function toggleDate(habitId, dateStr, event) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  // Зберігаємо поточну позицію миші для відновлення hover
  const mouseX = event ? event.clientX : 0;
  const mouseY = event ? event.clientY : 0;

  const idx = habit.dates.indexOf(dateStr);
  if (idx > -1) {
    habit.dates.splice(idx, 1);
    playUncheckSound();
  } else {
    habit.dates.push(dateStr);
    if (habit.skippedDates) {
      const skippedIdx = habit.skippedDates.indexOf(dateStr);
      if (skippedIdx > -1) {
        habit.skippedDates.splice(skippedIdx, 1);
      }
    }
    playSuccessSound();
    if (event) {
      createConfetti(event.clientX, event.clientY);
    }
  }
  // Зберігаємо негайно і переконуємося, що запис завершився
  saveHabits();
  renderHabits();
  // Відновлюємо hover на клітинці після перерендерингу
  restoreHover(mouseX, mouseY);

  // Додаємо анімацію pulse до новозмальованої клітинки
  if (event && idx === -1) {
    setTimeout(() => {
      const heatmaps = document.querySelectorAll('.heatmap');
      heatmaps.forEach(heatmap => {
        const rect = heatmap.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          const cells = heatmap.querySelectorAll('.day-cell');
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(Math.pow(localMouseX - cellX, 2) + Math.pow(localMouseY - cellY, 2));
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add('pulse');
            setTimeout(() => {
              closestCell.classList.remove('pulse');
            }, 300);
          }
        }
      });
    }, 0);
  }
}

function toggleSkippedDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  // Зберігаємо поточну позицію миші для відновлення hover
  const mouseX = event ? event.clientX : 0;
  const mouseY = event ? event.clientY : 0;

  if (!habit.skippedDates) {
    habit.skippedDates = [];
  }

  const idx = habit.skippedDates.indexOf(dateStr);
  if (idx > -1) {
    habit.skippedDates.splice(idx, 1);
    playUncheckSound();
  } else {
    habit.skippedDates.push(dateStr);
    const doneIdx = habit.dates.indexOf(dateStr);
    if (doneIdx > -1) {
      habit.dates.splice(doneIdx, 1);
    }
    playSkipSound();
    if (event) {
      createSkipParticles(event.clientX, event.clientY);
    }
  }
  // Зберігаємо негайно і переконуємося, що запис завершився
  saveHabits();
  renderHabits();
  // Відновлюємо hover на клітинці після перерендерингу
  restoreHover(mouseX, mouseY);

  // Додаємо анімацію shake до новозмальованої клітинки
  if (event && idx === -1) {
    setTimeout(() => {
      const heatmaps = document.querySelectorAll('.heatmap');
      heatmaps.forEach(heatmap => {
        const rect = heatmap.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          const cells = heatmap.querySelectorAll('.day-cell');
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(Math.pow(localMouseX - cellX, 2) + Math.pow(localMouseY - cellY, 2));
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add('shake');
            setTimeout(() => {
              closestCell.classList.remove('shake');
            }, 400);
          }
        }
      });
    }, 0);
  }
}

function toggleHalfDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  // Зберігаємо поточну позицію миші для відновлення hover
  const mouseX = event ? event.clientX : 0;
  const mouseY = event ? event.clientY : 0;

  // Переконуємося, що halfDates існує
  if (!habit.halfDates) {
    habit.halfDates = [];
  }

  const idx = habit.halfDates.indexOf(dateStr);
  if (idx > -1) {
    habit.halfDates.splice(idx, 1);
    playUncheckSound();
  } else {
    habit.halfDates.push(dateStr);
    // Видаляємо з повних дат, якщо є
    const fullIdx = habit.dates.indexOf(dateStr);
    if (fullIdx > -1) {
      habit.dates.splice(fullIdx, 1);
    }
    // Видаляємо з пропущених дат, якщо є
    if (habit.skippedDates) {
      const skippedIdx = habit.skippedDates.indexOf(dateStr);
      if (skippedIdx > -1) {
        habit.skippedDates.splice(skippedIdx, 1);
      }
    }
    playSuccessSound();
    if (event) {
      createConfetti(event.clientX, event.clientY);
    }
  }
  saveHabits();
  renderHabits();
  // Відновлюємо hover на клітинці після перерендерингу
  restoreHover(mouseX, mouseY);

  // Додаємо анімацію pulse до новозмальованої клітинки
  if (event && idx === -1) {
    setTimeout(() => {
      const heatmaps = document.querySelectorAll('.heatmap');
      heatmaps.forEach(heatmap => {
        const rect = heatmap.getBoundingClientRect();
        if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
          const cells = heatmap.querySelectorAll('.day-cell');
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(Math.pow(localMouseX - cellX, 2) + Math.pow(localMouseY - cellY, 2));
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add('pulse');
            setTimeout(() => {
              closestCell.classList.remove('pulse');
            }, 300);
          }
        }
      });
    }, 0);
  }
}

function handleMiddleClick(habitId, dateStr, event) {
  // Перевіряємо, чи натиснута середня кнопка миші (button === 1)
  if (event.button === 1) {
    event.preventDefault();
    toggleHalfDate(habitId, dateStr, event);
  }
}

function toggleToday(habitId) {
  const today = getLocalDateStr();
  toggleDate(habitId, today);
}

function getLocalDateStr(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYearDates() {
  const currentYear = new Date().getFullYear();
  if (cachedYearDates && cachedYear === currentYear) {
    return cachedYearDates;
  }

  const dates = [];
  const start = new Date(currentYear, 0, 1);
  const end = new Date(currentYear, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Формуємо дату вручну, щоб уникнути проблем з часовими зонами
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  cachedYearDates = dates;
  cachedYear = currentYear;
  return dates;
}

function getMonthData(dates) {
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const counts = {};
  months.forEach(m => counts[m] = 0);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (const dateStr of dates) {
    const d = new Date(dateStr);
    const m = monthNames[d.getMonth()];
    if (counts.hasOwnProperty(m)) {
      counts[m]++;
    }
  }

  return months.map(m => ({ month: m, count: counts[m] }));
}

function getStreak(dates, skippedDates = []) {
  if (!dates || dates.length === 0) return 0;

  const datesSet = new Set(dates);
  const skippedSet = new Set(skippedDates);
  
  // Знаходимо найпізнішу відмічену дату
  const sortedDates = [...dates].sort();
  let lastCheckedDate = new Date(sortedDates[sortedDates.length - 1]);
  
  // Перевіряємо, чи є скіпи після останньої відміченої дати
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastCheckedDate.setHours(0, 0, 0, 0);
  
  // Перевіряємо дати від lastCheckedDate+1 до today
  let checkDate = new Date(lastCheckedDate);
  checkDate.setDate(checkDate.getDate() + 1);
  
  while (checkDate <= today) {
    const dateStr = getLocalDateStr(checkDate);
    if (skippedSet.has(dateStr)) {
      // Якщо є скіп після останньої відміченої дати, серія не рахується
      return 0;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  let streak = 0;
  checkDate = new Date(lastCheckedDate);

  // Рахуємо серію від останньої відміченої дати
  while (true) {
    const dateStr = getLocalDateStr(checkDate);
    if (datesSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (skippedSet.has(dateStr)) {
      // Якщо знайдено skip, перериваємо серію
      break;
    } else {
      break;
    }
  }
  return streak;
}

function getLongestStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort();
  let max = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime();
    const curr = new Date(sorted[i]).getTime();
    const diff = (curr - prev) / 86400000;

    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  return max;
}

function renderHabits() {
  const container = document.getElementById('habitsContainer');
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

  // Очищаємо кеш, щоб гарантувати свіжі дані
  cachedYearDates = null;
  cachedYear = null;

  const currentYear = new Date().getFullYear();
  const yearDates = getYearDates();
  const today = getLocalDateStr();

  // Оптимізація: обчислюємо загальні дані один раз для всіх звичок
  const daysGrid = yearDates.map(dateStr => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0 = неділя, 1 = понеділок, ..., 6 = субота
    // Конвертуємо в систему де 0 = понеділок, 6 = неділя
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return {
      dateStr,
      dayOfWeek: adjustedDayOfWeek,
      month: d.getMonth()
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
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
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
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      nextYearDates.push(`${year}-${month}-${day}`);
    }
  }

  const allCells = [];
  // Додаємо дати з попереднього року
  previousYearDates.forEach(date => allCells.push({ dateStr: date, isPadding: true }));
  // Додаємо дати поточного року
  daysGrid.forEach(day => allCells.push({ dateStr: day.dateStr, isPadding: false }));
  // Додаємо дати з наступного року
  nextYearDates.forEach(date => allCells.push({ dateStr: date, isPadding: true }));

  const weeks = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  const totalDays = yearDates.length;

  container.innerHTML = habits.map(habit => {
    const completed = habit.dates.length + (habit.halfDates ? habit.halfDates.length * 0.5 : 0);
    const percent = totalDays ? Math.round((completed / totalDays) * 100) : 0;
    const streak = getStreak(habit.dates, habit.skippedDates);
    const longest = getLongestStreak(habit.dates);
    const monthData = getMonthData(habit.dates);
    const isDoneToday = habit.dates.includes(today);
    const maxMonth = monthData.length > 0 ? Math.max(...monthData.map(m => m.count), 1) : 1;

    // Build heatmap HTML
    let heatmapHTML = '<div class="heatmap-wrapper">';

    // Оптимізація: використовуємо Set для O(1) lookup дат
    const habitDatesSet = new Set(habit.dates);
    const habitSkippedSet = new Set(habit.skippedDates || []);
    const habitHalfSet = new Set(habit.halfDates || []);

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
        const isFuture = dateStr > today;  // Add this line

        // Конвертуємо дату у формат dd.mm.yyyy для відображення
        const [year, month, day] = dateStr.split('-');
        const displayDate = `${day}.${month}`;

        if (isPadding) {
          // Клітинки з попереднього/наступного року - можна натискати, але вони з іншим стилем
          heatmapHTML += `<div class="day-cell padding ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''} ${isHalf ? 'half' : ''}"
            onclick="toggleDate(${habit.id}, '${dateStr}', event)"
            oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
            onmousedown="handleMiddleClick(${habit.id}, '${dateStr}', event)"
            data-date="${displayDate}"></div>`;
        } else {
          // Клітинки поточного року
        heatmapHTML += `<div class="day-cell ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''} ${isHalf ? 'half' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}"
          onclick="toggleDate(${habit.id}, '${dateStr}', event)"
          oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
          onmousedown="handleMiddleClick(${habit.id}, '${dateStr}', event)"
          data-date="${displayDate}"></div>`;
        }
      });
      heatmapHTML += '</div>';
    });
    heatmapHTML += '</div></div>';

    const chartHTML = monthData.map(m => `
      <div class="bar" style="height: ${Math.max((m.count / maxMonth) * 50, 4)}px;">
        <div class="bar-value">${m.count}</div>
        <div class="bar-label">${m.month}</div>
      </div>
    `).join('');

    const iconSvg = ICONS.find(icon => icon.id === habit.icon)?.svg || ICONS[0].svg;
    const reminderIndicator = habit.reminderEnabled ? 
      `<div class="reminder-indicator" title="Нагадування о ${habit.reminderTime}">🔔</div>` : '';

    return `
      <div class="habit-card" data-habit-id="${habit.id}"
           ondragover="handleHabitDragOver(event)" ondrop="handleHabitDrop(event)"
           ondragleave="handleHabitDragLeave(event)"
           oncontextmenu="return false;">
        <div class="habit-drag-handle" draggable="true"
             ondragstart="handleHabitDragStart(event)" ondragend="handleHabitDragEnd(event)">⋮⋮</div>
        <div class="habit-main">
          <div class="habit-header">
            <div class="habit-icon" onclick="openEditModal(${habit.id})">${iconSvg}</div>
            <div class="habit-name" onclick="openEditModal(${habit.id})">${habit.name}</div>
            ${streak > 0 ? `
            <div class="streak-badge" title="Серія: ${streak} днів поспіль">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
              <span class="streak-count">${streak}</span>
            </div>
            ` : ''}
          </div>
          ${heatmapHTML}
        </div>
      </div>
    `;
  }).join('');

  // Додаємо event listeners для hover на всі heatmap
  setupHoverListeners();
}

function setupHoverListeners() {
  const heatmaps = document.querySelectorAll('.heatmap');
  heatmaps.forEach(heatmap => {
    let hoveredCell = null;

    heatmap.addEventListener('mousemove', (e) => {
      const cells = heatmap.querySelectorAll('.day-cell');
      if (cells.length === 0) return;

      // Знаходимо найближчу клітинку до курсора
      let closestCell = null;
      let closestDistance = Infinity;

      const rect = heatmap.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      cells.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        const cellX = cellRect.left - rect.left + cellRect.width / 2;
        const cellY = cellRect.top - rect.top + cellRect.height / 2;

        const distance = Math.sqrt(Math.pow(mouseX - cellX, 2) + Math.pow(mouseY - cellY, 2));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCell = cell;
        }
      });

      // Прибираємо hover з попередньої клітинки
      if (hoveredCell && hoveredCell !== closestCell) {
        const isHoveredActive = hoveredCell.classList.contains('active');
        const isHoveredSkipped = hoveredCell.classList.contains('skipped');
        if (!isHoveredActive && !isHoveredSkipped) {
          hoveredCell.style.removeProperty('border-color');
        }
        hoveredCell.style.removeProperty('transform');
        hoveredCell.style.removeProperty('z-index');
        hoveredCell.style.removeProperty('position');
      }

      // Додаємо hover до нової клітинки
      if (closestCell && closestCell !== hoveredCell) {
        const isClosestActive = closestCell.classList.contains('active');
        const isClosestSkipped = closestCell.classList.contains('skipped');
        if (!isClosestActive) {
          if (isClosestSkipped) {
            closestCell.style.borderColor = '#f85149';
          } else {
            closestCell.style.borderColor = '#8b949e';
          }
        }
        closestCell.style.transform = 'scale(1.2)';
        closestCell.style.zIndex = '10';
        closestCell.style.position = 'relative';
        hoveredCell = closestCell;

        // Показуємо кастомний tooltip
        const cellRect = closestCell.getBoundingClientRect();
        const dateStr = closestCell.getAttribute('data-date');
        if (dateStr) {
          showTooltip(dateStr, cellRect.left + cellRect.width / 2, cellRect.top);
        }
      }
    });

    heatmap.addEventListener('mouseleave', () => {
      if (hoveredCell) {
        const isHoveredActive = hoveredCell.classList.contains('active');
        const isHoveredSkipped = hoveredCell.classList.contains('skipped');
        if (!isHoveredActive && !isHoveredSkipped) {
          hoveredCell.style.removeProperty('border-color');
        }
        hoveredCell.style.removeProperty('transform');
        hoveredCell.style.removeProperty('z-index');
        hoveredCell.style.removeProperty('position');
        hoveredCell = null;
      }
      // Ховаємо кастомний tooltip
      hideTooltip();
    });
  });
}

function restoreHover(mouseX, mouseY) {
  const heatmaps = document.querySelectorAll('.heatmap');
  heatmaps.forEach(heatmap => {
    const rect = heatmap.getBoundingClientRect();
    // Перевіряємо чи миша над цією heatmap
    if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
      const cells = heatmap.querySelectorAll('.day-cell');
      if (cells.length === 0) return;

      // Знаходимо найближчу клітинку до позиції миші
      let closestCell = null;
      let closestDistance = Infinity;

      const localMouseX = mouseX - rect.left;
      const localMouseY = mouseY - rect.top;

      cells.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        const cellX = cellRect.left - rect.left + cellRect.width / 2;
        const cellY = cellRect.top - rect.top + cellRect.height / 2;

        const distance = Math.sqrt(Math.pow(localMouseX - cellX, 2) + Math.pow(localMouseY - cellY, 2));
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCell = cell;
        }
      });

      // Застосовуємо hover стилі до знайденої клітинки
      if (closestCell && closestDistance < 20) {
        const isClosestActive = closestCell.classList.contains('active');
        const isClosestSkipped = closestCell.classList.contains('skipped');
        if (!isClosestActive) {
          if (isClosestSkipped) {
            closestCell.style.borderColor = '#f85149';
          } else {
            closestCell.style.borderColor = '#8b949e';
          }
        }
        closestCell.style.transform = 'scale(1.2)';
        closestCell.style.zIndex = '10';
        closestCell.style.position = 'relative';

        // Показуємо кастомний tooltip
        const cellRect = closestCell.getBoundingClientRect();
        const dateStr = closestCell.getAttribute('data-date');
        if (dateStr) {
          showTooltip(dateStr, cellRect.left + cellRect.width / 2, cellRect.top);
        }
      }
    }
  });
}

// ========== EXPORT/IMPORT FUNCTIONS ==========

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

// ========== GIST STORAGE FOR HABITS ==========

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
