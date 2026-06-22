/* ========== STATISTICS FUNCTIONS ========== */

// These functions expect the following globals from the main file:
// - habits (array of habit objects)
// - ICONS (array of icon objects)
// - getYearDates() (function)
// - getStreak() (function)
// - getLongestStreak() (function)

function openStatsModal() {
  document.getElementById('statsModal').classList.add('open');
  renderStatsContent('trends');
}

function closeStatsModal() {
  document.getElementById('statsModal').classList.remove('open');
}

function renderStatsContent(tab) {
  const content = document.getElementById('statsContent');
  if (!content) return;

  switch(tab) {
    case 'trends':
      renderTrendsTab(content);
      break;
    case 'comparison':
      renderComparisonTab(content);
      break;
    case 'analysis':
      renderAnalysisTab(content);
      break;
  }
}

function renderTrendsTab(container) {
  if (habits.length === 0) {
    container.innerHTML = '<div class="stats-empty">Немає звичок для аналізу</div>';
    return;
  }

  const currentYear = new Date().getFullYear();
  const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
  
  let html = '<div class="stats-chart-container">';
  html += '<canvas id="trendsChart" width="700" height="300"></canvas>';
  html += '</div>';
  
  html += '<div class="stats-legend">';
  habits.forEach((habit, index) => {
    const iconSvg = ICONS.find(icon => icon.id === habit.icon)?.svg || ICONS[0].svg;
    const colors = ['#5b9cf5', '#4ac06a', '#ffd700', '#ff6b6b', '#a855f7', '#ff9f43', '#00d2d3', '#5f27cd'];
    const color = colors[index % colors.length];
    html += `<div class="legend-item">
      <div class="legend-color" style="background: ${color}"></div>
      <div class="legend-icon">${iconSvg}</div>
      <div class="legend-name">${habit.name}</div>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;

  // Draw chart after DOM update
  setTimeout(() => drawTrendsChart(currentYear, months), 0);
}

function drawTrendsChart(year, months) {
  const canvas = document.getElementById('trendsChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Chart settings
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Get monthly data for each habit
  const habitData = habits.map(habit => {
    const monthlyData = new Array(12).fill(0);
    habit.dates.forEach(dateStr => {
      const d = new Date(dateStr);
      if (d.getFullYear() === year) {
        monthlyData[d.getMonth()]++;
      }
    });
    return monthlyData;
  });
  
  // Find max value for scaling
  const maxValue = Math.max(...habitData.flat(), 1);
  
  // Colors for lines
  const colors = ['#5b9cf5', '#4ac06a', '#ffd700', '#ff6b6b', '#a855f7', '#ff9f43', '#00d2d3', '#5f27cd'];
  
  // Draw grid lines
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight * i / 5);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#666666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    const value = Math.round(maxValue * (5 - i) / 5);
    ctx.fillText(value.toString(), padding.left - 10, y + 4);
  }
  
  // Draw month labels
  ctx.textAlign = 'center';
  months.forEach((month, index) => {
    const x = padding.left + (chartWidth * index / 11);
    ctx.fillText(month, x, height - padding.bottom + 20);
  });
  
  // Draw lines for each habit
  habitData.forEach((data, habitIndex) => {
    const color = colors[habitIndex % colors.length];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((value, monthIndex) => {
      const x = padding.left + (chartWidth * monthIndex / 11);
      const y = padding.top + chartHeight - (value / maxValue * chartHeight);
      
      if (monthIndex === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = color;
    data.forEach((value, monthIndex) => {
      if (value > 0) {
        const x = padding.left + (chartWidth * monthIndex / 11);
        const y = padding.top + chartHeight - (value / maxValue * chartHeight);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });
}

function renderComparisonTab(container) {
  if (habits.length === 0) {
    container.innerHTML = '<div class="stats-empty">Немає звичок для порівняння</div>';
    return;
  }

  const currentYear = new Date().getFullYear();
  const yearDates = getYearDates();
  const totalDays = yearDates.length;
  
  // Calculate comparison metrics
  const habitMetrics = habits.map(habit => {
    const completed = habit.dates.filter(d => new Date(d).getFullYear() === currentYear).length +
                     (habit.halfDates ? habit.halfDates.filter(d => new Date(d).getFullYear() === currentYear).length * 0.5 : 0);
    const percent = totalDays ? Math.round((completed / totalDays) * 100) : 0;
    const streak = getStreak(habit.dates, habit.skippedDates);
    const longest = getLongestStreak(habit.dates);
    const skipped = (habit.skippedDates || []).filter(d => new Date(d).getFullYear() === currentYear).length;
    
    return {
      ...habit,
      completed,
      percent,
      streak,
      longest,
      skipped
    };
  }).sort((a, b) => b.completed - a.completed);
  
  let html = '<div class="comparison-table">';
  html += '<div class="comparison-header">';
  html += '<div class="comparison-cell">Звичка</div>';
  html += '<div class="comparison-cell">Днів</div>';
  html += '<div class="comparison-cell">Успіх</div>';
  html += '<div class="comparison-cell">Серія</div>';
  html += '<div class="comparison-cell">Найкраща</div>';
  html += '<div class="comparison-cell">Пропущено</div>';
  html += '</div>';
  
  habitMetrics.forEach((habit, index) => {
    const iconSvg = ICONS.find(icon => icon.id === habit.icon)?.svg || ICONS[0].svg;
    const rank = index + 1;
    const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
    
    html += `<div class="comparison-row ${rankClass}">`;
    html += `<div class="comparison-cell habit-cell">
      <span class="rank-badge">${rank}</span>
      <div class="habit-icon-small">${iconSvg}</div>
      <span class="habit-name-small">${habit.name}</span>
    </div>`;
    html += `<div class="comparison-cell">${habit.completed}</div>`;
    html += `<div class="comparison-cell">${habit.percent}%</div>`;
    html += `<div class="comparison-cell">${habit.streak} 🔥</div>`;
    html += `<div class="comparison-cell">${habit.longest} ⭐</div>`;
    html += `<div class="comparison-cell">${habit.skipped}</div>`;
    html += '</div>';
  });
  
  html += '</div>';
  
  // Add summary
  const totalCompleted = habitMetrics.reduce((sum, h) => sum + h.completed, 0);
  const totalSkipped = habitMetrics.reduce((sum, h) => sum + h.skipped, 0);
  const avgPercent = Math.round(habitMetrics.reduce((sum, h) => sum + h.percent, 0) / habitMetrics.length);
  
  html += '<div class="comparison-summary">';
  html += `<div class="summary-item">
    <div class="summary-label">Всього виконано</div>
    <div class="summary-value">${totalCompleted}</div>
  </div>`;
  html += `<div class="summary-item">
    <div class="summary-label">Всього пропущено</div>
    <div class="summary-value">${totalSkipped}</div>
  </div>`;
  html += `<div class="summary-item">
    <div class="summary-label">Середній успіх</div>
    <div class="summary-value">${avgPercent}%</div>
  </div>`;
  html += '</div>';
  
  container.innerHTML = html;
}

function renderAnalysisTab(container) {
  if (habits.length === 0) {
    container.innerHTML = '<div class="stats-empty">Немає звичок для аналізу</div>';
    return;
  }

  const currentYear = new Date().getFullYear();
  const weekdays = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  const months = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
  
  // Analyze by weekday
  const weekdayAnalysis = weekdays.map((day, index) => {
    let total = 0;
    let completed = 0;
    
    habits.forEach(habit => {
      habit.dates.forEach(dateStr => {
        const d = new Date(dateStr);
        if (d.getFullYear() === currentYear && d.getDay() === (index + 1) % 7) {
          completed++;
        }
      });
      // Count total possible days for this weekday in current year
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
        if (currentDate.getDay() === (index + 1) % 7) {
          total += habits.length;
        }
      }
    });
    
    return {
      day: day.substring(0, 3),
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  });
  
  // Analyze by month
  const monthAnalysis = months.map((month, index) => {
    let total = 0;
    let completed = 0;
    
    habits.forEach(habit => {
      habit.dates.forEach(dateStr => {
        const d = new Date(dateStr);
        if (d.getFullYear() === currentYear && d.getMonth() === index) {
          completed++;
        }
      });
      // Count days in this month
      const daysInMonth = new Date(currentYear, index + 1, 0).getDate();
      total += daysInMonth * habits.length;
    });
    
    return {
      month: month.substring(0, 3),
      total,
      completed,
      percent: total ? Math.round((completed / total) * 100) : 0
    };
  });
  
  let html = '<div class="analysis-section">';
  html += '<h4>📅 Успіх за днями тижня</h4>';
  html += '<div class="analysis-chart">';
  
  const maxWeekdayPercent = Math.max(...weekdayAnalysis.map(d => d.percent), 1);
  
  weekdayAnalysis.forEach(data => {
    const barWidth = (data.percent / maxWeekdayPercent) * 100;
    html += `<div class="analysis-bar-item">
      <div class="analysis-label">${data.day}</div>
      <div class="analysis-bar-track">
        <div class="analysis-bar-fill" style="width: ${barWidth}%"></div>
      </div>
      <div class="analysis-value">${data.percent}%</div>
    </div>`;
  });
  
  html += '</div></div>';
  
  html += '<div class="analysis-section">';
  html += '<h4>📆 Успіх за місяцями</h4>';
  html += '<div class="analysis-chart">';
  
  const maxMonthPercent = Math.max(...monthAnalysis.map(m => m.percent), 1);
  
  monthAnalysis.forEach(data => {
    const barWidth = (data.percent / maxMonthPercent) * 100;
    html += `<div class="analysis-bar-item">
      <div class="analysis-label">${data.month}</div>
      <div class="analysis-bar-track">
        <div class="analysis-bar-fill" style="width: ${barWidth}%"></div>
      </div>
      <div class="analysis-value">${data.percent}%</div>
    </div>`;
  });
  
  html += '</div></div>';
  
  // Find best and worst days
  const bestDay = weekdayAnalysis.reduce((best, current) => current.percent > best.percent ? current : best);
  const worstDay = weekdayAnalysis.reduce((worst, current) => current.percent < worst.percent ? current : worst);
  const bestMonth = monthAnalysis.reduce((best, current) => current.percent > best.percent ? current : best);
  const worstMonth = monthAnalysis.reduce((worst, current) => current.percent < worst.percent ? current : worst);
  
  html += '<div class="analysis-insights">';
  html += `<div class="insight-item">
    <div class="insight-icon">🏆</div>
    <div class="insight-text">
      <div class="insight-label">Найкращий день</div>
      <div class="insight-value">${bestDay.day} (${bestDay.percent}%)</div>
    </div>
  </div>`;
  html += `<div class="insight-item">
    <div class="insight-icon">📉</div>
    <div class="insight-text">
      <div class="insight-label">Найгірший день</div>
      <div class="insight-value">${worstDay.day} (${worstDay.percent}%)</div>
    </div>
  </div>`;
  html += `<div class="insight-item">
    <div class="insight-icon">🌟</div>
    <div class="insight-text">
      <div class="insight-label">Найкращий місяць</div>
      <div class="insight-value">${bestMonth.month} (${bestMonth.percent}%)</div>
    </div>
  </div>`;
  html += `<div class="insight-item">
    <div class="insight-icon">📊</div>
    <div class="insight-text">
      <div class="insight-label">Найгірший місяць</div>
      <div class="insight-value">${worstMonth.month} (${worstMonth.percent}%)</div>
    </div>
  </div>`;
  html += '</div>';
  
  container.innerHTML = html;
}