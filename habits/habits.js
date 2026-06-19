/* ========== HABITS TRACKER ========== */

const ICONS = [
  { id: 'dollar-sign', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' },
  { id: 'activity', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' },
  { id: 'book', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' },
  { id: 'dumbbell', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"></path><path d="M6 20v-2a6 6 0 1 1 12 0v2"></path><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle></svg>' },
  { id: 'brain', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>' },
  { id: 'droplet', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>' },
  { id: 'apple', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><path d="M10 2c1 .5 2 2 2 5"></path></svg>' },
  { id: 'music', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' },
  { id: 'laptop', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>' },
  { id: 'pen', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>' },
  { id: 'palette', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>' },
  { id: 'target', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>' },
  { id: 'flame', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>' },
  { id: 'star', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
  { id: 'heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>' }
];
let habits = JSON.parse(localStorage.getItem('habits') || '[]');
let selectedIcon = ICONS[0];
let editingHabitId = null;
let editSelectedIcon = ICONS[0];
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
    icon: selectedIcon.id,
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
    habit.icon = editSelectedIcon.id;
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
    playSkipSound();
    if (event) {
      createSkipParticles(event.clientX, event.clientY);
      if (event.target) {
        event.target.classList.add('shake');
        setTimeout(() => {
          event.target.classList.remove('shake');
        }, 300);
      }
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

  // Очищаємо кеш, щоб гарантувати свіжі дані
  cachedYearDates = null;
  cachedYear = null;

  const currentYear = new Date().getFullYear();
  const yearDates = getYearDates();
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
      week.forEach((cellData) => {
        const dateStr = cellData.dateStr;
        const isPadding = cellData.isPadding;
        const isActive = habitDatesSet.has(dateStr);
        const isSkipped = habitSkippedSet.has(dateStr);
        const isToday = dateStr === today;

        // Конвертуємо дату у формат dd.mm.yyyy для відображення
        const [year, month, day] = dateStr.split('-');
        const displayDate = `${day}.${month}`;

        if (isPadding) {
          // Клітинки з попереднього/наступного року - можна натискати, але вони з іншим стилем
          heatmapHTML += `<div class="day-cell padding ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''}"
            onclick="toggleDate(${habit.id}, '${dateStr}', event)"
            oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
            title="${displayDate}"></div>`;
        } else {
          // Клітинки поточного року
          heatmapHTML += `<div class="day-cell ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''} ${isToday ? 'today' : ''}"
            onclick="toggleDate(${habit.id}, '${dateStr}', event)"
            oncontextmenu="toggleSkippedDate(${habit.id}, '${dateStr}', event)"
            title="${displayDate}"></div>`;
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
           ondragleave="handleDragLeave(event)"
           oncontextmenu="return false;">
        <div class="habit-main">
          <div class="habit-header">
            <div class="habit-icon">${habit.icon}</div>
            <div class="habit-name" onclick="openEditModal(${habit.id})">${habit.name}</div>
            <button class="delete-btn" onclick="event.stopPropagation(); deleteHabit(${habit.id})">✕</button>
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
        if (!isHoveredActive) {
          hoveredCell.style.removeProperty('border-color');
        }
        hoveredCell.style.removeProperty('transform');
        hoveredCell.style.removeProperty('z-index');
        hoveredCell.style.removeProperty('position');
      }

      // Додаємо hover до нової клітинки
      if (closestCell && closestCell !== hoveredCell) {
        const isClosestActive = closestCell.classList.contains('active');
        if (!isClosestActive) {
          closestCell.style.borderColor = '#8b949e';
        }
        closestCell.style.transform = 'scale(1.2)';
        closestCell.style.zIndex = '10';
        closestCell.style.position = 'relative';
        hoveredCell = closestCell;
      }
    });

    heatmap.addEventListener('mouseleave', () => {
      if (hoveredCell) {
        const isHoveredActive = hoveredCell.classList.contains('active');
        if (!isHoveredActive) {
          hoveredCell.style.removeProperty('border-color');
        }
        hoveredCell.style.removeProperty('transform');
        hoveredCell.style.removeProperty('z-index');
        hoveredCell.style.removeProperty('position');
        hoveredCell = null;
      }
    });
  });
}
