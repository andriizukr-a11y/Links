/* ---------- ЗАВДАННЯ ---------- */

const TASKS_STORAGE_KEY = 'tasks';
const NOTES_STORAGE_KEY = 'notes';

let tasks = [];

function loadTasks() {
  const saved = localStorage.getItem(TASKS_STORAGE_KEY);
  if (saved) {
    tasks = JSON.parse(saved);
  }
  renderTasks();
}

function saveTasks() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const tasksList = document.getElementById('tasks-list');
  if (!tasksList) return;

  tasksList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.index = index;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(index));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    text.style.cursor = 'pointer';
    text.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      toggleTask(index);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Видалити';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(index);
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    tasksList.appendChild(li);
  });
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.push({
    text: trimmed,
    completed: false
  });

  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function initTasks() {
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');

  if (taskInput && addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      addTask(taskInput.value);
      taskInput.value = '';
      taskInput.focus();
    });

    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTask(taskInput.value);
        taskInput.value = '';
      }
    });
  }

  loadTasks();
  initNotes();
}

/* ---------- НОТАТКИ ---------- */

function loadNotes() {
  const saved = localStorage.getItem(NOTES_STORAGE_KEY);
  const notesTextarea = document.getElementById('notes-textarea');
  if (notesTextarea && saved) {
    notesTextarea.value = saved;
  }
}

function saveNotes() {
  const notesTextarea = document.getElementById('notes-textarea');
  if (notesTextarea) {
    localStorage.setItem(NOTES_STORAGE_KEY, notesTextarea.value);
  }
}

function initNotes() {
  const notesTextarea = document.getElementById('notes-textarea');
  if (notesTextarea) {
    loadNotes();
    notesTextarea.addEventListener('input', saveNotes);
  }
}

document.addEventListener('DOMContentLoaded', initTasks);
