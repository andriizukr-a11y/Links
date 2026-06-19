/* ========== HABITS TRACKER ========== */

const ICONS = ['💰', '🏃', '📚', '💪', '🧘', '💧', '🥗', '🎸', '💻', '✍️', '🎨', '🎯', '🔥', '⭐', '❤️'];
let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let selectedIcon = '💰';
let editingHabitId = null;
let editSelectedIcon = '💰';
let draggedHabitId = null;
let cachedYearDates = null;
let cachedYear = null;

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

  // HTML content directly embedded
  const html = `
<div class="habits-container" id="habitsContainer"></div>

<button class="add-btn" onclick="openModal()">+</button>

<div class="modal-overlay" id="modal">
  <div class="modal">
    <h3>New Habit</h3>
    <input type="text" id="habitName" placeholder="e.g. Side Hustle" maxlength="30">
    <div class="icon-picker" id="iconPicker"></div>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeModal()">Cancel</button>
      <button class="modal-btn save" onclick="saveHabit()">Save</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="editModal">
  <div class="modal">
    <h3>Edit Habit</h3>
    <input type="text" id="editHabitName" placeholder="e.g. Side Hustle" maxlength="30">
    <div class="icon-picker" id="editIconPicker"></div>
    <div class="modal-buttons">
      <button class="modal-btn cancel" onclick="closeEditModal()">Cancel</button>
      <button class="modal-btn save" onclick="saveEditHabit()">Save</button>
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
}

function renderIconPicker() {
  const picker = document.getElementById('iconPicker');
  if (!picker) return;
  picker.innerHTML = ICONS.map(icon => `
    <div class="icon-option ${icon === selectedIcon ? 'selected' : ''}" onclick="selectIcon('${icon}')">
      ${icon}
    </div>
  `).join('');
}

function renderEditIconPicker() {
  const picker = document.getElementById('editIconPicker');
  if (!picker) return;
  picker.innerHTML = ICONS.map(icon => `
    <div class="icon-option ${icon === editSelectedIcon ? 'selected' : ''}" onclick="selectEditIcon('${icon}')">
      ${icon}
    </div>
  `).join('');
}

function selectIcon(icon) {
  selectedIcon = icon;
  renderIconPicker();
}

function selectEditIcon(icon) {
  editSelectedIcon = icon;
  renderEditIconPicker();
}

function openModal() {
  document.getElementById('modal').classList.add('open');
  document.getElementById('habitName').value = '';
  document.getElementById('habitName').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function openEditModal(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  editingHabitId = habitId;
  editSelectedIcon = habit.icon;
  document.getElementById('editHabitName').value = habit.name;
  renderEditIconPicker();
  document.getElementById('editModal').classList.add('open');
  document.getElementById('editHabitName').focus();
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
  editingHabitId = null;
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) return;

  const habit = {
    id: Date.now(),
    name,
    icon: selectedIcon,
    dates: [getLocalDateStr()]
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
    habit.icon = editSelectedIcon;
    saveHabits();
  }
  closeEditModal();
  renderHabits();
}

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function deleteHabit(id) {
  if (!confirm('Delete this habit?')) return;
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits();
}

function toggleDate(habitId, dateStr, event) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const idx = habit.dates.indexOf(dateStr);
  if (idx > -1) {
    habit.dates.splice(idx, 1);
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
      if (event.target) {
        event.target.classList.add('pulse');
        setTimeout(() => {
          event.target.classList.remove('pulse');
        }, 300);
      }
    }
  }
  saveHabits();
  // Відкладаємо перерендеринг, щоб анімація пульсації встигла відіграти
  setTimeout(() => {
    renderHabits();
  }, 300);
}

function toggleSkippedDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  if (!habit.skippedDates) {
    habit.skippedDates = [];
  }

  const idx = habit.skippedDates.indexOf(dateStr);
  if (idx > -1) {
    habit.skippedDates.splice(idx, 1);
  } else {
    habit.skippedDates.push(dateStr);
    const doneIdx = habit.dates.indexOf(dateStr);
    if (doneIdx > -1) {
      habit.dates.splice(doneIdx, 1);
    }
  }
  saveHabits();
  renderHabits();
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
    dates.push(new Date(d).toISOString().split('T')[0]);
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

function getStreak(dates) {
  if (!dates.length) return 0;

  const today = getLocalDateStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Оптимізація: використовуємо Set для O(1) lookup
  const datesSet = new Set(dates);

  let streak = 0;
  let checkDate = today;

  if (!datesSet.has(today)) {
    if (datesSet.has(yesterday)) {
      checkDate = yesterday;
    } else {
      return 0;
    }
  }

  while (datesSet.has(checkDate)) {
    streak++;
    const prev = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
    checkDate = prev;
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
        <h3>No habits yet</h3>
        <p>Click the + button to add your first habit</p>
      </div>
    `;
    return;
  }

  const yearDates = getYearDates();
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = getLocalDateStr();

  // Оптимізація: обчислюємо загальні дані один раз для всіх звичок
  const daysGrid = yearDates.map(dateStr => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return {
      dateStr,
      dayOfWeek: dayOfWeek === 0 ? 6 : dayOfWeek - 1,
      month: d.getMonth()
    };
  });

  const firstDayOffset = daysGrid[0].dayOfWeek;
  const lastDayOffset = daysGrid[daysGrid.length - 1].dayOfWeek;
  const endPadding = 6 - lastDayOffset;

  const allCells = [];
  for (let i = 0; i < firstDayOffset; i++) {
    allCells.push(null);
  }
  daysGrid.forEach(day => {
    allCells.push(day.dateStr);
  });
  for (let i = 0; i < endPadding; i++) {
    allCells.push(null);
  }

  const weeks = [];
  for (let i = 0; i < allCells.length; i += 7) {
    weeks.push(allCells.slice(i, i + 7));
  }

  const monthLabels = [];
  let currentMonth = -1;
  weeks.forEach((week, weekIdx) => {
    for (let day of week) {
      if (day) {
        const d = new Date(day);
        const m = d.getMonth();
        if (m !== currentMonth) {
          monthLabels.push({ week: weekIdx, month: monthNames[m] });
          currentMonth = m;
        }
        break;
      }
    }
  });

  const totalDays = yearDates.length;

  container.innerHTML = habits.map(habit => {
    const completed = habit.dates.length;
    const percent = totalDays ? Math.round((completed / totalDays) * 100) : 0;
    const streak = getStreak(habit.dates);
    const longest = getLongestStreak(habit.dates);
    const monthData = getMonthData(habit.dates);
    const isDoneToday = habit.dates.includes(today);
    const maxMonth = monthData.length > 0 ? Math.max(...monthData.map(m => m.count), 1) : 1;

    // Build heatmap HTML
    let heatmapHTML = '<div class="heatmap-wrapper">';

    // Оптимізація: використовуємо Set для O(1) lookup дат
    const habitDatesSet = new Set(habit.dates);
    const habitSkippedSet = new Set(habit.skippedDates || []);

    // Heatmap grid
    heatmapHTML += '<div class="heatmap">';
    weeks.forEach((week) => {
      heatmapHTML += '<div class="week-column">';
      week.forEach((dateStr) => {
        if (dateStr) {
          const isActive = habitDatesSet.has(dateStr);
          const isSkipped = habitSkippedSet.has(dateStr);
          const isToday = dateStr === today;
          heatmapHTML += `<div class="day-cell ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''} ${isToday ? 'today' : ''}"
            onclick="toggleDate(${habit.id}, '${dateStr}', event)"
            oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
            title="${dateStr}"></div>`;
        } else {
          heatmapHTML += '<div class="day-cell empty"></div>';
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

    return `
      <div class="habit-card" draggable="true" data-habit-id="${habit.id}"
           ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)"
           ondragover="handleDragOver(event)" ondrop="handleDrop(event)"
           ondragleave="handleDragLeave(event)">
        <div class="habit-main">
          <div class="habit-header">
            <div class="habit-name" onclick="openEditModal(${habit.id})">${habit.name}</div>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteHabit(${habit.id})">✕</button>
          </div>
          ${heatmapHTML}
        </div>
      </div>
    `;
  }).join('');
}
