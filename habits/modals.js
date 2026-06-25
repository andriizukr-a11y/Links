/* ========== MODAL FUNCTIONS ========== */

// These functions expect the following globals from the main file:
// - habits (array of habit objects)
// - ICONS (array of icon objects)
// - selectedIcon (selected icon object)
// - editingHabitId (ID of habit being edited)
// - editSelectedIcon (selected icon for editing)
// - habitToDelete (ID of habit to delete)
// - saveHabits() (function)
// - renderHabits() (function)

function renderIconPicker() {
  const picker = document.getElementById("iconPicker");
  if (!picker) return;
  picker.innerHTML = ICONS.map(
    (icon) => `
    <div class="icon-option ${icon.id === selectedIcon.id ? "selected" : ""}" onclick="selectIcon('${icon.id}')">
      ${icon.svg}
    </div>
  `,
  ).join("");
}

function renderEditIconPicker() {
  const picker = document.getElementById("editIconPicker");
  if (!picker) return;
  picker.innerHTML = ICONS.map(
    (icon) => `
    <div class="icon-option ${icon.id === editSelectedIcon.id ? "selected" : ""}" onclick="selectEditIcon('${icon.id}')">
      ${icon.svg}
    </div>
  `,
  ).join("");
}

function selectIcon(iconId) {
  selectedIcon = ICONS.find((icon) => icon.id === iconId);
  renderIconPicker();
}

function selectEditIcon(iconId) {
  editSelectedIcon = ICONS.find((icon) => icon.id === iconId);
  renderEditIconPicker();
}

function openModal() {
  document.getElementById("modal").classList.add("open");
  document.getElementById("habitName").value = "";
  document.getElementById("reminderEnabled").checked = false;
  document.getElementById("reminderTime").style.display = "none";
  document.getElementById("reminderTime").value = "09:00";
  // Reset type to 'good'
  const typeGood = document.querySelector(
    'input[name="habitType"][value="good"]',
  );
  if (typeGood) typeGood.checked = true;
  document.getElementById("habitName").focus();
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

function openEditModal(habitId) {
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;
  editingHabitId = habitId;
  editSelectedIcon = ICONS.find((icon) => icon.id === habit.icon) || ICONS[0];
  document.getElementById("editHabitName").value = habit.name;
  renderEditIconPicker();

  // Встановлюємо значення типу
  const type = habit.type || "good";
  document.querySelector(
    `input[name="editHabitType"][value="${type}"]`,
  ).checked = true;

  // Встановлюємо значення нагадувань
  document.getElementById("editReminderEnabled").checked =
    habit.reminderEnabled || false;
  document.getElementById("editReminderTime").value =
    habit.reminderTime || "09:00";

  if (habit.reminderEnabled) {
    document.getElementById("editReminderTime").style.display = "block";
  } else {
    document.getElementById("editReminderTime").style.display = "none";
  }

  document.getElementById("editModal").classList.add("open");
  document.getElementById("editHabitName").focus();
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("open");
  editingHabitId = null;
}

function openDeleteModal(habitId) {
  habitToDelete = habitId;
  document.getElementById("deleteModal").classList.add("open");
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("open");
  habitToDelete = null;
}

function confirmDelete() {
  if (habitToDelete === null) return;
  habits = habits.filter((h) => h.id !== habitToDelete);
  saveHabits();
  renderHabits();
  closeDeleteModal();
}

function saveHabit() {
  const name = document.getElementById("habitName").value.trim();
  if (!name) return;

  const reminderEnabled = document.getElementById("reminderEnabled").checked;
  const reminderTime = document.getElementById("reminderTime").value;
  const typeInput = document.querySelector('input[name="habitType"]:checked');
  const type = typeInput ? typeInput.value : "good";

  const habit = {
    id: Date.now(),
    name,
    icon: selectedIcon.id,
    type: type || "good",
    dates: [], // <-- НЕ відмічаємо сьогодні автоматично
    skippedDates: [], // <-- пустий масив для пропусків
    reminderEnabled,
    // Зберігаємо час нагадування навіть якщо вимкнено, щоб не загубити попереднє значення
    reminderTime: reminderEnabled ? reminderTime : reminderTime || null,
  };

  habits.push(habit);
  saveHabits();
  closeModal();
  renderHabits();
}

function saveEditHabit() {
  const name = document.getElementById("editHabitName").value.trim();
  if (!name || !editingHabitId) return;

  const habit = habits.find((h) => h.id === editingHabitId);
  if (habit) {
    habit.name = name;
    habit.icon = editSelectedIcon.id;
    habit.type = document.querySelector(
      'input[name="editHabitType"]:checked',
    ).value;

    const reminderEnabled = document.getElementById(
      "editReminderEnabled",
    ).checked;
    const reminderTime = document.getElementById("editReminderTime").value;

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

function deleteHabit(id) {
  openDeleteModal(id);
}

function deleteHabitFromEditModal() {
  if (editingHabitId) {
    closeEditModal();
    openDeleteModal(editingHabitId);
  }
}

function toggleReminderTimeInput(checkboxId, timeInputId) {
  const checkbox = document.getElementById(checkboxId);
  const timeInput = document.getElementById(timeInputId);
  if (checkbox && timeInput) {
    timeInput.style.display = checkbox.checked ? "block" : "none";
  }
}
