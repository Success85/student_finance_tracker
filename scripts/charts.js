// The chart rendering logic using Chart.js


function getTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text:   isDark ? '#c9c9d4' : '#333333',
    muted:  isDark ? '#888899' : '#777777',
    grid:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    bg:     isDark ? '#1e1e2e' : '#ffffff',
  };
}

const INCOME_COLOR   = '#4CAF50';
const EXPENSE_COLOR  = '#EF5350';
const PALETTE = [
  '#9C27B0', '#00BCD4', '#4CAF50',
  '#FF9800', '#EF5350', '#2196F3',
  '#FF5722', '#607D8B', '#E91E63',
];

function baseOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    plugins: {
      legend: {
        labels: {
          color: theme.text,
          font: { family: 'DM Sans, sans-serif', size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
          padding: 16,
        },
      },
    },
  };
}

export function createBarChart(canvasId, labels, incomeData, expenseData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const theme = getTheme();
  const isSingle = !expenseData || expenseData.length === 0;

  const datasets = isSingle
    ? [{
        label: 'Income',
        data: incomeData,
        backgroundColor: PALETTE,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 40,
      }]
    : [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: INCOME_COLOR + 'bb',
          borderColor: INCOME_COLOR,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 36,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: EXPENSE_COLOR + 'bb',
          borderColor: EXPENSE_COLOR,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 36,
        },
      ];

  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      ...baseOptions(theme),
      plugins: {
        ...baseOptions(theme).plugins,
        tooltip: {
          callbacks: {
            label: ctx =>
              ` ${ctx.dataset.label}: RWF ${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: theme.text, font: { family: 'DM Sans, sans-serif', size: 11 } },
          grid:  { color: theme.grid },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: theme.text,
            font: { family: 'DM Sans, sans-serif', size: 11 },
            callback: v => 'RWF ' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v),
          },
          grid: { color: theme.grid },
        },
      },
    },
  });
}

export function createPieChart(canvasId, labels, data, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const theme   = getTheme();
  const palette = colors && colors.length ? colors : PALETTE;
  const total   = data.reduce((a, b) => a + b, 0);

  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: palette.slice(0, data.length),
        borderColor: theme.bg,
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: {
      ...baseOptions(theme),
      cutout: '62%',
      plugins: {
        ...baseOptions(theme).plugins,
        legend: {
          ...baseOptions(theme).plugins.legend,
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: RWF ${ctx.parsed.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
    },
    plugins: [{
      // Centre label showing total
      id: 'centreLabel',
      afterDraw(chart) {
        const { ctx, chartArea: { width, height, top } } = chart;
        ctx.save();
        const cx = width / 2;
        const cy = top + height / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = theme.muted;
        ctx.font = `500 11px DM Sans, sans-serif`;
        ctx.fillText('TOTAL', cx, cy - 12);
        ctx.fillStyle = theme.text;
        ctx.font = `700 14px DM Sans, sans-serif`;
        ctx.fillText(
          'RWF ' + (total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)),
          cx, cy + 8
        );
        ctx.restore();
      },
    }],
  });
}

export function createSparkline(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const positive = data.length === 0 || data[data.length - 1] >= 0;
  const color    = positive ? INCOME_COLOR : EXPENSE_COLOR;

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 2,
        backgroundColor: color + '22',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend:  { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
}