/* ========== HABIT INTERACTION FUNCTIONS ========== */

// These functions expect the following globals from the main file:
// - habits (array of habit objects)
// - saveHabits() (function)
// - renderHabits() (function)
// - playSuccessSound() (function from ui-tools.js)
// - playUncheckSound() (function from ui-tools.js)
// - playSkipSound() (function from ui-tools.js)
// - createConfetti() (function from ui-tools.js)
// - createSkipParticles() (function from ui-tools.js)
// - restoreHover() (function from ui-tools.js)
// - getLocalDateStr() (function from date-utils.js)

function toggleDate(habitId, dateStr, event = null) {
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  // Зберігаємо поточну позицію миші для відновлення hover
  const mouseX = event ? event.clientX : 0;
  const mouseY = event ? event.clientY : 0;

  const habitType = habit.type || "good";
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

    // Для шкідливих звичок використовуємо інші звуки та ефекти
    if (habitType === "bad") {
      playSkipSound(); // Використовуємо звук пропуску для шкідливих звичок
      if (event) {
        createSkipParticles(event.clientX, event.clientY); // Використовуємо червоні частинки
      }
    } else {
      playSuccessSound();
      if (event) {
        createConfetti(event.clientX, event.clientY);
      }
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
      const heatmaps = document.querySelectorAll(".heatmap");
      heatmaps.forEach((heatmap) => {
        const rect = heatmap.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          const cells = heatmap.querySelectorAll(".day-cell");
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach((cell) => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(
              Math.pow(localMouseX - cellX, 2) +
                Math.pow(localMouseY - cellY, 2),
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            const animationClass = habitType === "bad" ? "shake" : "pulse";
            closestCell.classList.add(animationClass);
            setTimeout(() => {
              closestCell.classList.remove(animationClass);
            }, 300);
          }
        }
      });
    }, 0);
  }
}

function toggleSkippedDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find((h) => h.id === habitId);
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
      const heatmaps = document.querySelectorAll(".heatmap");
      heatmaps.forEach((heatmap) => {
        const rect = heatmap.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          const cells = heatmap.querySelectorAll(".day-cell");
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach((cell) => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(
              Math.pow(localMouseX - cellX, 2) +
                Math.pow(localMouseY - cellY, 2),
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add("shake");
            setTimeout(() => {
              closestCell.classList.remove("shake");
            }, 400);
          }
        }
      });
    }, 0);
  }
}

function toggleCleanDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  // Зберігаємо поточну позицію миші для відновлення hover
  const mouseX = event ? event.clientX : 0;
  const mouseY = event ? event.clientY : 0;

  // Переконуємося, що cleanDates існує
  if (!habit.cleanDates) {
    habit.cleanDates = [];
  }

  const idx = habit.cleanDates.indexOf(dateStr);
  if (idx > -1) {
    habit.cleanDates.splice(idx, 1);
    playUncheckSound();
  } else {
    habit.cleanDates.push(dateStr);
    // Видаляємо з активних дат (впав у звичку), якщо є
    const activeIdx = habit.dates.indexOf(dateStr);
    if (activeIdx > -1) {
      habit.dates.splice(activeIdx, 1);
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
      const heatmaps = document.querySelectorAll(".heatmap");
      heatmaps.forEach((heatmap) => {
        const rect = heatmap.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          const cells = heatmap.querySelectorAll(".day-cell");
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach((cell) => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(
              Math.pow(localMouseX - cellX, 2) +
                Math.pow(localMouseY - cellY, 2),
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add("pulse");
            setTimeout(() => {
              closestCell.classList.remove("pulse");
            }, 300);
          }
        }
      });
    }, 0);
  }
}

function toggleHalfDate(habitId, dateStr, event) {
  event.preventDefault();
  const habit = habits.find((h) => h.id === habitId);
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
      const heatmaps = document.querySelectorAll(".heatmap");
      heatmaps.forEach((heatmap) => {
        const rect = heatmap.getBoundingClientRect();
        if (
          mouseX >= rect.left &&
          mouseX <= rect.right &&
          mouseY >= rect.top &&
          mouseY <= rect.bottom
        ) {
          const cells = heatmap.querySelectorAll(".day-cell");
          let closestCell = null;
          let closestDistance = Infinity;

          const localMouseX = mouseX - rect.left;
          const localMouseY = mouseY - rect.top;

          cells.forEach((cell) => {
            const cellRect = cell.getBoundingClientRect();
            const cellX = cellRect.left - rect.left + cellRect.width / 2;
            const cellY = cellRect.top - rect.top + cellRect.height / 2;

            const distance = Math.sqrt(
              Math.pow(localMouseX - cellX, 2) +
                Math.pow(localMouseY - cellY, 2),
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCell = cell;
            }
          });

          if (closestCell && closestDistance < 20) {
            closestCell.classList.add("pulse");
            setTimeout(() => {
              closestCell.classList.remove("pulse");
            }, 300);
          }
        }
      });
    }, 0);
  }
}
