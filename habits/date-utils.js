/* ========== DATE UTILITIES FOR HABITS ========== */

// Cache variables for year dates
let cachedYearDates = null;
let cachedYear = null;

function clearYearDatesCache() {
  cachedYearDates = null;
  cachedYear = null;
}

// These are pure utility functions that don't depend on global state

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