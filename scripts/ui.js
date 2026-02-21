// scripts/ui.js — UI rendering and updates

import { compileRegex, highlightMatches, escapeHtml } from './validators.js';
import {
  getTransactions, getTotals, getMonthTotals, getLast7DaysTotals,
  getLast7DaysSpend, getTopCategory, getAvgTransaction, getSettings,
  getSort, getSearch, getFilters, getCategories,
} from './state.js';

//Chart rendering functions

import { createPieChart, createBarChart, createSparkline } from './charts.js';

function fmt(n) {
  const settings = getSettings() || {};
  const currency = settings.baseCurrency || 'NGN';

  const symbols = {
    RWF: 'RWF ',
    USD: '$',
    NGN: '₦'
  };

  const rateUSD = parseFloat(settings.rateUSD);
  const rateRWF = parseFloat(settings.rateRWF);

  let amount = Math.abs(n);

  if (currency === 'USD' && !isNaN(rateUSD)) {
    amount = amount * rateUSD;
  } else if (currency === 'RWF' && !isNaN(rateRWF)) {
    amount = amount * rateRWF;
  }

  return (symbols[currency] || '₦') +
    amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
const fmtSigned = (n, type) => type === 'income' ? `+${fmt(n)}` : `−${fmt(n)}`;

// Convert amount from the base RWF currency to two other alternative currencies the NGN ans UDS
export function convertCurrency(amountUSD, settings) {
  const symbols = { RWF: 'RWF', USD: '$', NGN: '₦' };
  const baseSymbol = symbols[settings.baseCurrency] || '$';

  // const r1 = parseFloat(settings.rate1) || 0.92;
  // const r2 = parseFloat(settings.rate2) || 0.79;

  // return {
  //   base: `${baseSymbol}${amountUSD.toFixed(2)}`,
  //   alt1: `${sym1}${(amountUSD * r1).toFixed(2)}`,
  //   alt2: `${sym2}${(amountUSD * r2).toFixed(2)}`,
  // };
}

export function renderStats() {
  const { income, expenses, balance } = getTotals();
  const settings = getSettings();

  setEl('statIncome', fmt(income));
  setEl('statExpense', fmt(expenses));

  const balEl = document.getElementById('statBalance');
  if (balEl) {
    balEl.textContent = fmt(Math.abs(balance));
    balEl.style.color = balance >= 0 ? 'var(--income)' : 'var(--expense)';
  }

  // Sidebar balance at the footer
  setEl('sidebarBalanceValue', fmt(Math.abs(balance)));
  const sbVal = document.getElementById('sidebarBalanceValue');
  if (sbVal) sbVal.style.color = balance >= 0 ? 'var(--income)' : 'var(--expense)';

  // Topbar balance on the mobile screen view
  setEl('topbarBalance', fmt(Math.abs(balance)));

  // Budget capacity bar tracking the expenses against the set budget cap
  const cap = settings.budgetCap ? parseFloat(settings.budgetCap) : null;
  const capEl = document.getElementById('statCap');
  const barEl = document.getElementById('budgetBar');
  const statusEl = document.getElementById('budgetStatus');

  if (cap && cap > 0) {
    if (capEl) capEl.textContent = fmt(cap);
    const pct = Math.min((expenses / cap) * 100, 100);
    if (barEl) {
      barEl.style.width = pct + '%';
      barEl.classList.toggle('over', expenses > cap);
    }
    if (statusEl) {
      if (expenses > cap) {
        statusEl.textContent = `⚠ Over budget by ${fmt(expenses - cap)}`;
        statusEl.className = 'budget-status-msg over';
        statusEl.parentElement.setAttribute('aria-live', 'assertive');
      } else {
        const remaining = cap - expenses;
        statusEl.textContent = `${fmt(remaining)} remaining`;
        statusEl.className = 'budget-status-msg';
        statusEl.parentElement.setAttribute('aria-live', 'polite');
      }
    }
  } else {
    if (capEl) capEl.textContent = 'Not set';
    if (barEl) barEl.style.width = '0%';
    if (statusEl) statusEl.textContent = '';
  }
}

export function renderHomeStats() {
  const { income, expenses, balance } = getMonthTotals();

  setEl('heroMonthIncome', `+${fmt(income)}`);
  setEl('heroMonthExpense', `−${fmt(expenses)}`);

  const hb = document.getElementById('heroBalance');
  if (hb) {
    hb.textContent = fmt(Math.abs(balance));
    hb.style.color = balance >= 0 ? 'var(--income)' : 'var(--expense)';
  }

  const txns = getTransactions();
  setEl('stripTransCount', txns.length);
  setEl('stripTopCat', getTopCategory());
  setEl('stripWeekSpend', fmt(getLast7DaysSpend()));
  const avg = getAvgTransaction();
  setEl('stripAvg', avg > 0 ? fmt(avg) : '0.00 ₦');
}

export function renderChart() {
  const chartEl = document.getElementById('barChart');
  const labelsEl = document.getElementById('chartLabels');
  if (!chartEl || !labelsEl) return;

  const days = getLast7DaysTotals();
  const maxVal = Math.max(...days.flatMap(d => [d.income, d.expense]), 1);

  const today = new Date().toISOString().slice(0, 10);

  chartEl.innerHTML = days.map(day => {
    const expPct = (day.expense / maxVal) * 100;
    const incPct = (day.income / maxVal) * 100;
    const isToday = day.date === today;

    return `
      <div class="bar-wrap" role="presentation">
        ${day.income > 0 ? `
          <div class="bar-amount">${fmt(day.income)}</div>
          <div class="bar-fill has-income${isToday ? ' today' : ''}"
               style="height:${incPct}%"
               title="${day.label} income: ${fmt(day.income)}"
               aria-label="${day.label} income ${fmt(day.income)}"></div>
        ` : ''}
        ${day.expense > 0 ? `
          <div class="bar-fill has-expense${isToday ? ' today' : ''}"
               style="height:${expPct}%"
               title="${day.label} expenses: ${fmt(day.expense)}"
               aria-label="${day.label} expenses ${fmt(day.expense)}"></div>
        ` : ''}
        ${day.income === 0 && day.expense === 0 ? `
          <div class="bar-fill" style="height:4px;background:var(--border)"></div>
        ` : ''}
      </div>
    `;
  }).join('');

  labelsEl.innerHTML = days.map(day => {
    const isToday = day.date === today;
    return `<span class="chart-label" style="${isToday ? 'color:var(--accent);font-weight:700' : ''}">${day.label}</span>`;
  }).join('');
}

export function renderRecentList() {
  const list = document.getElementById('recentList');
  const empty = document.getElementById('recentEmpty');
  if (!list) return;

  const txns = getTransactions()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (txns.length === 0) {
    if (empty) empty.hidden = false;
    list.innerHTML = '';
    list.appendChild(empty || document.createTextNode(''));
    return;
  }

  if (empty) empty.hidden = true;

  list.innerHTML = txns.map(tx => `
    <div class="recent-item" role="listitem">
      <div>
        <div class="recent-desc">${escapeHtml(tx.description)}</div>
        <div class="recent-cat"><span class="cat-dot cat-${escapeHtml(tx.category)}" aria-hidden="true"></span>${escapeHtml(tx.category)}</div>
      </div>
      <div class="recent-date">${formatDate(tx.date)}</div>
      <div class="recent-amount ${tx.type}">${fmtSigned(tx.amount, tx.type)}</div>
    </div>
  `).join('');
}

export function renderTable() {
  const tbody = document.getElementById('transBody');
  const tableEmpty = document.getElementById('tableEmpty');
  const resultCount = document.getElementById('resultCount');
  if (!tbody) return;

  const { sortKey, sortDir } = getSort();
  const { searchQuery, caseSensitive } = getSearch();
  const { filterType, filterCategory } = getFilters();

  // The search regex is compiled once and reused for filtering and highlighting, with error handling to avoid crashes on invalid patterns
  const re = searchQuery ? compileRegex(searchQuery, caseSensitive ? '' : 'i') : null;
  const searchValid = !searchQuery || re !== null;

  // Update search indicator for invalid regex
  const indicator = document.getElementById('searchIndicator');
  if (indicator) {
    if (searchQuery && !re) {
      indicator.textContent = '⚠ Invalid regex';
      indicator.style.color = 'var(--expense)';
    } else {
      indicator.textContent = '';
    }
  }

  // Filter, sort and search for transactions.
  let txns = getTransactions().filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (re) {
      const searchText = [tx.description, tx.category, tx.date, String(tx.amount)].join(' ');
      return re.test(searchText);
    }
    return true;
  });

  // Sort traction using selected keyword
  txns.sort((a, b) => {
    let valA, valB;
    switch (sortKey) {
      case 'amount': valA = a.amount; valB = b.amount; break;
      case 'desc': valA = a.description.toLowerCase(); valB = b.description.toLowerCase(); break;
      default: valA = new Date(a.date); valB = new Date(b.date); break;
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Update count of results found after filtering and searching
  if (resultCount) {
    resultCount.textContent = `${txns.length} transaction${txns.length !== 1 ? 's' : ''}`;
  }

  // Empty state 
  if (txns.length === 0) {
    tbody.innerHTML = '';
    if (tableEmpty) tableEmpty.hidden = false;
    return;
  }
  if (tableEmpty) tableEmpty.hidden = true;

  // Render rows with highlight for search matches.
  tbody.innerHTML = txns.map(tx => {
    const descHtml = re ? highlightMatches(tx.description, re) : escapeHtml(tx.description);
    const catHtml = re ? highlightMatches(tx.category, re) : escapeHtml(tx.category);

    return `
      <tr data-id="${tx.id}">
        <td>
          <div class="td-desc">${descHtml}</div>
        </td>
        <td>
          <span class="td-amount ${tx.type}">${fmtSigned(tx.amount, tx.type)}</span>
        </td>
        <td>
          <span class="cat-badge">
            <span class="cat-dot cat-${escapeHtml(tx.category)}" aria-hidden="true"></span>${catHtml}
          </span>
        </td>
        <td>${formatDate(tx.date)}</td>
        <td class="td-type">
          <span class="type-badge ${tx.type}" aria-label="${tx.type}">
            ${tx.type === 'income' ? '↑' : '↓'} ${tx.type}
          </span>
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" 
                    data-id="${tx.id}" 
                    aria-label="Edit ${escapeHtml(tx.description)}">Edit</button>
            <button class="action-btn delete" 
                    data-id="${tx.id}"
                    aria-label="Delete ${escapeHtml(tx.description)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Mobile carrds
  renderMobileCards(txns, re);
}

function renderMobileCards(txns, re) {
  // Find or create mobile cards container
  let cardsContainer = document.querySelector('.trans-cards-mobile');
  if (!cardsContainer) {
    cardsContainer = document.createElement('div');
    cardsContainer.className = 'trans-cards-mobile';
    cardsContainer.setAttribute('role', 'list');
    cardsContainer.setAttribute('aria-label', 'Transactions list');
    const tableSection = document.querySelector('.table-section');
    if (tableSection) {
      const tableWrap = tableSection.querySelector('.table-wrap');
      if (tableWrap) tableWrap.after(cardsContainer);
    }
  }

  if (txns.length === 0) {
    cardsContainer.innerHTML = '';
    return;
  }

  cardsContainer.innerHTML = txns.map(tx => {
    const descHtml = re ? highlightMatches(tx.description, re) : escapeHtml(tx.description);
    return `
      <div class="trans-card" role="listitem" style="display:flex">
        <div class="trans-card-header">
          <div>
            <div class="trans-card-meta">
              <span class="cat-badge">
                <span class="cat-dot cat-${escapeHtml(tx.category)}" aria-hidden="true"></span>
                ${escapeHtml(tx.category)}
              </span>
              <span class="trans-card-date">${formatDate(tx.date)}</span>
            </div>
          </div>
          <div>
            <div class="trans-card-amount ${tx.type}">${fmtSigned(tx.amount, tx.type)}</div>
            <span class="type-badge ${tx.type}" style="font-size:0.65rem">
              ${tx.type === 'income' ? '↑' : '↓'} ${tx.type}
            </span>
          </div>
        </div>
        <div class="trans-card-actions">
                    <div class="trans-card-desc">${descHtml}</div>
           <button class="action-btn edit" data-id="${tx.id}"
          aria-label="Edit ${escapeHtml(tx.description)}">✎</button>
            <button class="action-btn delete" data-id="${tx.id}"
          aria-label="Delete ${escapeHtml(tx.description)}">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

export function renderCategoryFilter() {
  const select = document.getElementById('filterCategory');
  if (!select) return;
  const cats = getCategories();
  const current = select.value;
  select.innerHTML = '<option value="all">All Categories</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}"${c === current ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

/**
 * Render dashboard welcome message with user name
 */
export function renderDashboardWelcome() {
  const settings = getSettings();
  const welcome = document.getElementById('dashboardWelcome');
  if (!welcome) return;

  const name = settings.userName?.trim();
  if (name) {
    welcome.textContent = `Welcome, ${name}!`;
  } else {
    welcome.textContent = 'Dashboard';
  }
}

export function renderSettings() {
  const s = getSettings();
  setInputVal('budgetCap', s.budgetCap || '');
  setInputVal('baseCurrency', s.baseCurrency);
  setInputVal('rateUSD', s.rateUSD || '');
  setInputVal('rateNGN', s.rateNGN || '');
}

let toastTimer = null;
export function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setInputVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function formatDate(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

let categoryChart = null;
let monthlyChart = null;
let incomeChart = null;
let sparklineChart = null;

export function renderCharts() {
  renderBalanceCard();
  renderCategoryPieChart();
  renderMonthlyBarChart();
  renderIncomeSourceChart();
}

function renderBalanceCard() {
  const { balance } = getTotals();
  const balanceEl = document.getElementById('balanceAmount');
  if (balanceEl) {
    balanceEl.textContent = fmt(balance);
  }

  // Sparkline: last 7 days balance changes
  const last7Days = getLast7DaysBalances();
  if (sparklineChart) sparklineChart.destroy();
  sparklineChart = createSparkline('balanceSparkline', last7Days);
}

function renderCategoryPieChart() {
  const txns = getTransactions().filter(t => t.type === 'expense');
  const categoryTotals = {};

  txns.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = ['#9C27B0', '#00BCD4', '#4CAF50', '#FF9800', '#EF5350', '#2196F3'];

  if (categoryChart) categoryChart.destroy();
  if (labels.length > 0) {
    categoryChart = createPieChart('categoryPieChart', labels, data, colors);
  }
}

function renderMonthlyBarChart() {
  // Get last 12 months data
  const monthlyData = getMonthlyData();
  const labels = monthlyData.map(m => m.month);
  const incomeData = monthlyData.map(m => m.income);
  const expenseData = monthlyData.map(m => m.expenses);

  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = createBarChart('monthlyChart', labels, incomeData, expenseData);
}

function renderIncomeSourceChart() {
  // Group income transactions by category
  const incomeTxns = getTransactions().filter(t => t.type === 'income');
  const sourceTotals = {};

  incomeTxns.forEach(tx => {
    sourceTotals[tx.category] = (sourceTotals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(sourceTotals);
  const data = Object.values(sourceTotals);

  if (incomeChart) incomeChart.destroy();
  if (labels.length > 0) {
    incomeChart = createBarChart('incomeSourceChart', labels, data, []);
  }
}

// Getting the last 7 days cumulative balance
function getLast7DaysBalances() {
  const balances = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const txnsUpToDate = getTransactions().filter(t => t.date <= dateStr);
    const balance = txnsUpToDate.reduce((sum, t) =>
      sum + (t.type === 'income' ? t.amount : -t.amount), 0
    );
    balances.push(balance);
  }

  return balances;
}

// Getting the last monthly data for last 12 months
function getMonthlyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();
  const data = [];

  months.forEach((month, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const txnsInMonth = getTransactions().filter(t => {
      const txDate = new Date(t.date);
      return txDate.getFullYear() === currentYear &&
        (txDate.getMonth() + 1) === (idx + 1);
    });

    const income = txnsInMonth
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = txnsInMonth
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    data.push({ month, income, expenses });
  });

  return data;
}

// Base chart options with theming support
export function renderAll() {
  renderStats();
  renderHomeStats();
  renderChart();
  renderRecentList();
  renderTable();
  renderCategoryFilter();
  renderDashboardWelcome();
  renderCharts();
}
