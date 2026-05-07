/* ---------- TASKS ---------- */

const TASKS_STORAGE_KEY = 'tasks_data';
const SAVE_DELAY = 500;

let tasksSaveTimer = null;

function getTasksData() {
  try {
    return JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveTasksData(data) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data));
}

function initTasks() {
  const output = document.getElementById('output-tasks');
  if (!output) return;
  renderTasksUI(output);
}

function renderTasksUI(container) {
  const tasks = getTasksData();

  const tasksHtml = tasks.map((task, index) => {
    const checked = task.done ? ' checked' : '';
    const textClass = task.done ? ' done' : '';
    return `
      <div class="task-item" data-index="${index}">
        <label class="task-checkbox-label">
          <input type="checkbox" class="task-checkbox"${checked}>
          <span class="task-checkmark"></span>
        </label>
        <span class="task-text${textClass}">${escapeHtml(task.text)}</span>
        <button class="task-delete" title="Видалити">×</button>
      </div>
    `;
  }).join('');

  const emptyHtml = tasks.length === 0
    ? '<div class="no-results">Немає завдань</div>'
    : '';

  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const progressHtml = totalCount > 0
    ? `<div class="tasks-progress">
        <div class="tasks-progress-bar">
          <div class="tasks-progress-fill" style="width:${totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%"></div>
        </div>
        <span class="tasks-progress-text">${doneCount} з ${totalCount}</span>
      </div>`
    : '';

  container.innerHTML = `
    <div class="tasks-container">
      ${progressHtml}
      <div class="tasks-list" id="tasks-list">
        ${tasksHtml}
        ${emptyHtml}
      </div>
      <div class="tasks-add-wrapper">
        <input type="text" class="tasks-add-input" id="tasks-add-input" placeholder="Нове завдання..." autocomplete="off">
        <button class="tasks-add-btn" id="tasks-add-btn">Додати</button>
      </div>
    </div>
  `;

  bindTasksEvents(container);
}

function bindTasksEvents(container) {
  const addInput = container.querySelector('#tasks-add-input');
  const addBtn = container.querySelector('#tasks-add-btn');

  function addTask() {
    const text = addInput.value.trim();
    if (!text) return;
    const tasks = getTasksData();
    tasks.push({ text, done: false });
    saveTasksData(tasks);
    addInput.value = '';
    renderTasksUI(container);
    addInput.focus();
  }

  addBtn.addEventListener('click', addTask);
  addInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addTask(); }
  });

  container.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const index = parseInt(cb.closest('.task-item').dataset.index);
      const tasks = getTasksData();
      if (tasks[index]) {
        tasks[index].done = cb.checked;
        saveTasksData(tasks);
        renderTasksUI(container);
      }
    });
  });

  container.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.closest('.task-item').dataset.index);
      const tasks = getTasksData();
      tasks.splice(index, 1);
      saveTasksData(tasks);
      renderTasksUI(container);
    });
  });

  container.querySelectorAll('.task-text').forEach(textEl => {
    textEl.addEventListener('dblclick', () => {
      const item = textEl.closest('.task-item');
      const index = parseInt(item.dataset.index);
      const tasks = getTasksData();
      if (!tasks[index]) return;

      const oldText = tasks[index].text;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'task-edit-input';
      input.value = oldText;

      const commit = () => {
        const trimmed = input.value.trim();
        input.remove();
        textEl.style.display = '';
        if (!trimmed || trimmed === oldText) return;
        tasks[index].text = trimmed;
        saveTasksData(tasks);
        renderTasksUI(container);
      };

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); }
        if (e.key === 'Escape') { input.remove(); textEl.style.display = ''; }
      });
      input.addEventListener('blur', commit);

      textEl.style.display = 'none';
      textEl.parentNode.insertBefore(input, textEl.nextSibling);
      input.focus();
      input.select();
    });
  });
}
