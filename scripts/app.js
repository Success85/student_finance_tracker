import {
  initState, addTransaction, updateTransaction, deleteTransaction,
  getTransactionById, replaceAllTransactions, generateId,
  setSort, setSearch, setFilterType, setFilterCategory,
  getSort, getSettings, updateSettings, getTransactions
} from '../scripts/state.js';
import {
  renderAll, renderStats, renderHomeStats, renderCharts, renderChart, renderDashboardWelcome,
  renderRecentList, renderTable, renderCategoryFilter,
  renderSettings, showToast, convertCurrency
} from '../scripts/ui.js';

import {
  validateDescription, validateAmount, validateDate,
  validateCategory, validateRate, validateName, validateBudgetCap,
  checkDuplicateWords, compileRegex
} from '../scripts/validators.js';
import { exportJSON, importJSON, loadTransactions } from '../scripts/storage.js';

import { createPieChart, createBarChart, createSparkline } from "../scripts/charts.js";

// The page theme toggle is a bit more involved since it needs to persist across sessions and update multiple elements. Here's how we can implement it:
function initTheme() {
  const saved = localStorage.getItem('rocel:theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rocel:theme', next);
  updateThemeIcon(next);
  showToast(`Switched to ${next} mode`, 'info');
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-icon');
  const labels = document.querySelectorAll('#themeLabel');
  icons.forEach(icon => icon.textContent = theme === 'light' ? '🌙' : '☀️');
  labels.forEach(label => label.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode');
}
// The page nagivation 

const pages = ['dashboard', 'about', 'settings'];

function navigateTo(pageId) {
  if (!pages.includes(pageId)) return;


  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === pageId);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    const active = link.dataset.page === pageId;
    link.classList.toggle('active', active);
    link.setAttribute('aria-current', active ? 'page' : 'false');
  });

 
  closeSidebar();

  // Render page contents as needed
  if (pageId === 'dashboard') { renderStats(); renderChart(); renderTable(); renderCategoryFilter(); renderDashboardWelcome(); }
  if (pageId === 'settings') renderSettings();

  // The page url and navigation to focus management
  window.location.hash = pageId;

  const main = document.getElementById('main-content');
  if (main) main.focus?.();
}

const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('navOverlay');
const hamburger = document.getElementById('hamburger');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('visible');
  overlay.removeAttribute('aria-hidden');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  const firstFocusable = sidebar.querySelector('a, button');
  firstFocusable?.focus();
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// const transactionsDropdown = document.getElementById('transactionsDropdown');
// const transactionsMenu = document.getElementById('transactionsMenu');

// transactionsDropdown?.addEventListener('click', (e) => {
//   e.preventDefault();

//   const isOpen = transactionsMenu.hasAttribute('hidden') === false;

//   transactionsMenu.hidden = isOpen;
//   transactionsDropdown.setAttribute('aria-expanded', String(!isOpen));
// });

// Dropdown filter buttons
document.querySelectorAll('.nav-sub-link').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    setFilterType(filter === 'all' ? 'all' : filter);
    navigateTo('dashboard');
    renderTable();
  });
});

function showError(inputEl, errorEl, msg) {
  if (inputEl) inputEl.classList.toggle('invalid', !!msg);
  if (errorEl) errorEl.textContent = msg || '';
}

function clearError(inputEl, errorEl) {
  showError(inputEl, errorEl, '');
}

function setFormStatus(statusEl, msg, type = '') {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = `form-status ${type}`;
}

const transactionModal = document.getElementById('transactionModal');
let currentTransactionType = 'expense';

const incomeCategories = ['Salary', 'Scholarship', 'Freelance', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Books', 'Transport', 'Entertainment', 'Fees', 'Other'];

function openTransactionModal() {
  currentTransactionType = 'expense';
  updateTransactionModal('expense');
  transactionModal.hidden = false;
  document.getElementById('txDescription').focus();
  document.body.style.overflow = 'hidden';
}

function closeTransactionModal() {
  transactionModal.hidden = true;
  document.getElementById('transactionForm').reset();
  clearTransactionErrors();
  document.body.style.overflow = '';
}

function updateTransactionModal(type) {
  currentTransactionType = type;

  // Toggle the income and expense button for adding transactions
  document.getElementById('expenseToggle').classList.toggle('active', type === 'expense');
  document.getElementById('incomeToggle').classList.toggle('active', type === 'income');


  const categorySelect = document.getElementById('txCategory');
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  categorySelect.innerHTML = '<option value="">Select category</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');

  document.getElementById('submitBtnText').textContent =
    type === 'income' ? 'Add Income' : 'Add Expense';
}

function clearTransactionErrors() {
  ['txDescErr', 'txAmtErr', 'txDateErr', 'txCatErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['txDescription', 'txAmount', 'txDate', 'txCategory'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('invalid');
  });
  const dupWarn = document.getElementById('txDupWarn');
  if (dupWarn) dupWarn.textContent = '';
  const status = document.getElementById('txFormStatus');
  if (status) status.textContent = '';
}

// Open and closing of Transaction modal
document.getElementById('openTransactionModal')?.addEventListener('click', openTransactionModal);
document.getElementById('closeTransactionModal')?.addEventListener('click', closeTransactionModal);
document.getElementById('cancelTransaction')?.addEventListener('click', closeTransactionModal);
document.getElementById('expenseToggle')?.addEventListener('click', () => updateTransactionModal('expense'));
document.getElementById('incomeToggle')?.addEventListener('click', () => updateTransactionModal('income'));

const transactionForm = document.getElementById('transactionForm');
if (transactionForm) {
  transactionForm.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'txDescription') {
      const err = validateDescription(t.value);
      showError(t, document.getElementById('txDescErr'), err);
      const dup = checkDuplicateWords(t.value);
      const dupEl = document.getElementById('txDupWarn');
      if (dupEl) dupEl.textContent = dup ? `⚠ ${dup}` : '';
    }
    if (t.id === 'txAmount') {
      const err = validateAmount(t.value);
      showError(t, document.getElementById('txAmtErr'), err);
    }
    if (t.id === 'txDate') {
      const err = validateDate(t.value);
      showError(t, document.getElementById('txDateErr'), err);
    }
  });

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('txDescription').value.trim();
    const amount = document.getElementById('txAmount').value.trim();
    const date = document.getElementById('txDate').value;
    const category = document.getElementById('txCategory').value;

    const descErr = validateDescription(desc);
    const amtErr = validateAmount(amount);
    const dateErr = validateDate(date);
    const catErr = validateCategory(category);

    showError(document.getElementById('txDescription'), document.getElementById('txDescErr'), descErr);
    showError(document.getElementById('txAmount'), document.getElementById('txAmtErr'), amtErr);
    showError(document.getElementById('txDate'), document.getElementById('txDateErr'), dateErr);
    showError(document.getElementById('txCategory'), document.getElementById('txCatErr'), catErr);

    if (descErr || amtErr || dateErr || catErr) {
      setFormStatus(document.getElementById('txFormStatus'), 'Please fix the errors above.', 'error');
      return;
    }

    const tx = {
      id: generateId(),
      description: desc,
      amount: parseFloat(amount),
      category,
      date,
      type: currentTransactionType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTransaction(tx);
    closeTransactionModal();
    renderAll();
    showToast(`${currentTransactionType === 'income' ? 'Income' : 'Expense'} "${desc}" added!`, 'success');
  });
}


const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
let pendingDeleteId = null;

function openEditModal(id) {
  const tx = getTransactionById(id);
  if (!tx) return;

  document.getElementById('editId').value = id;
  document.getElementById('editDesc').value = tx.description;
  document.getElementById('editAmount').value = tx.amount;
  document.getElementById('editDate').value = tx.date;
  document.getElementById('editCategory').value = tx.category;
  document.getElementById('editType').value = tx.type;
  setFormStatus(document.getElementById('editFormStatus'), '');

  editModal.hidden = false;
  editModal.querySelector('input, select')?.focus();
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  editModal.hidden = true;
  document.body.style.overflow = '';
}

function openDeleteModal(id) {
  const tx = getTransactionById(id);
  if (!tx) return;
  pendingDeleteId = id;
  document.getElementById('deleteTargetName').textContent = tx.description;
  deleteModal.hidden = false;
  document.getElementById('confirmDelete').focus();
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  pendingDeleteId = null;
  document.body.style.overflow = '';
}

// Event delegation for edit/delete buttons
document.addEventListener('click', (e) => {
  // Edit button
  if (e.target.classList.contains('edit') && e.target.dataset.id) {
    openEditModal(e.target.dataset.id);
  }
  // Delete button
  if (e.target.classList.contains('delete') && e.target.dataset.id) {
    openDeleteModal(e.target.dataset.id);
  }
  // Nav links (both sidebar nav-link and data-nav buttons)
  if (e.target.classList.contains('nav-link') && e.target.dataset.page) {
    e.preventDefault();
    navigateTo(e.target.dataset.page);
  }
  if (e.target.dataset.nav) {
    navigateTo(e.target.dataset.nav);
  }
  if (e.target.classList.contains('link-btn') && e.target.dataset.nav) {
    navigateTo(e.target.dataset.nav);
  }
});

// Edit form submission
const editForm = document.getElementById('editForm');
if (editForm) {
  editForm.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'editDesc') showError(t, document.getElementById('editDescErr'), validateDescription(t.value));
    if (t.id === 'editAmount') showError(t, document.getElementById('editAmtErr'), validateAmount(t.value));
    if (t.id === 'editDate') showError(t, document.getElementById('editDateErr'), validateDate(t.value));
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const desc = document.getElementById('editDesc').value.trim();
    const amount = document.getElementById('editAmount').value.trim();
    const date = document.getElementById('editDate').value;
    const category = document.getElementById('editCategory').value;
    const type = document.getElementById('editType').value;

    const descErr = validateDescription(desc);
    const amtErr = validateAmount(amount);
    const dateErr = validateDate(date);

    showError(document.getElementById('editDesc'), document.getElementById('editDescErr'), descErr);
    showError(document.getElementById('editAmount'), document.getElementById('editAmtErr'), amtErr);
    showError(document.getElementById('editDate'), document.getElementById('editDateErr'), dateErr);

    if (descErr || amtErr || dateErr) {
      setFormStatus(document.getElementById('editFormStatus'), 'Please fix the errors above.', 'error');
      return;
    }

    const success = updateTransaction(id, { description: desc, amount: parseFloat(amount), date, category, type });
    if (success) {
      closeEditModal();
      renderAll();
      showToast('Transaction updated!', 'success');
    }
  });
}

// Modal close buttons
document.getElementById('closeEditModal')?.addEventListener('click', closeEditModal);
document.getElementById('cancelEdit')?.addEventListener('click', closeEditModal);
document.getElementById('closeDeleteModal')?.addEventListener('click', closeDeleteModal);
document.getElementById('cancelDelete')?.addEventListener('click', closeDeleteModal);

document.getElementById('confirmDelete')?.addEventListener('click', () => {
  if (pendingDeleteId) {
    deleteTransaction(pendingDeleteId);
    closeDeleteModal();
    renderAll();
    showToast('Transaction deleted.', 'info');
  }
});

// Close modals on backdrop click
[editModal, deleteModal].forEach(modal => {
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal === editModal ? closeEditModal() : closeDeleteModal();
    }
  });
});

// Escape key closes modals/sidebar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!editModal?.hidden) closeEditModal();
    if (!deleteModal?.hidden) closeDeleteModal();
    if (sidebar?.classList.contains('open')) closeSidebar();
  }
});

// Search and sorting items using regex patterns for better matching and performance

const searchInput = document.getElementById('searchInput');
const caseSensBtn = document.getElementById('caseSensBtn');

let searchTimeout;
if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const cs = caseSensBtn?.getAttribute('aria-pressed') === 'true';
      setSearch(searchInput.value, cs);
      renderTable();
    }, 200);
  });
}

if (caseSensBtn) {
  caseSensBtn.addEventListener('click', () => {
    const current = caseSensBtn.getAttribute('aria-pressed') === 'true';
    caseSensBtn.setAttribute('aria-pressed', String(!current));
    const cs = !current;
    setSearch(searchInput?.value || '', cs);
    renderTable();
  });
}

// Sort select dropdown
document.getElementById('sortSelect')?.addEventListener('change', (e) => {
  const [key, dir] = e.target.value.split('-');
  setSort(key, dir);
  renderTable();
});

// Column sort buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { sortKey, sortDir } = getSort();
    const key = btn.dataset.sort;
    const newDir = (sortKey === key && sortDir === 'asc') ? 'desc' : 'asc';
    setSort(key, newDir);
    // Update button classes
    document.querySelectorAll('.sort-btn').forEach(b => b.className = 'sort-btn');
    btn.classList.add(newDir);
    renderTable();
  });
});

// Type filter
document.getElementById('filterType')?.addEventListener('change', (e) => {
  setFilterType(e.target.value);
  renderTable();
});

// Category filter
document.getElementById('filterCategory')?.addEventListener('change', (e) => {
  setFilterCategory(e.target.value);
  renderTable();
});

// Save  data, import and export data using json
function handleExport() {
  const txns = getTransactions();
  const settings = getSettings();
  exportJSON(txns, settings);
  showToast(`Exported ${txns.length} transactions.`, 'success');
}

function handleImport(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const { transactions, settings, error } = importJSON(e.target.result);
    if (error) {
      showToast(`Import failed: ${error}`, 'error');
      return;
    }
    replaceAllTransactions(transactions);
    if (settings) updateSettings(settings);
    renderAll();
    showToast(`Imported ${transactions.length} transactions!`, 'success');
  };
  reader.readAsText(file);
}

document.getElementById('exportBtn')?.addEventListener('click', handleExport);
document.getElementById('exportBtnSettings')?.addEventListener('click', handleExport);
document.getElementById('importInput')?.addEventListener('change', (e) => {
  handleImport(e.target.files[0]);
  e.target.value = ''; 
});
document.getElementById('importInputSettings')?.addEventListener('change', (e) => {
  handleImport(e.target.files[0]);
  e.target.value = '';
});

const form = document.getElementById('profileBudgetForm');

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('userName');
  const budgetInput = document.getElementById('budgetCap');
  const statusMsg = document.getElementById('profileBudgetSavedMsg');

 
  const name = nameInput.value.trim();
  const nameErr = validateName(name);
  showError(nameInput, document.getElementById('userNameErr'), nameErr);

  const capValue = budgetInput.value.trim();
  const budgetErr = validateBudgetCap(capValue);
  showError(budgetInput, document.getElementById('budgetCapErr'), budgetErr);

  // Stop if any error
  if (nameErr || budgetErr) return;

  updateSettings({
    userName: name,
    budgetCap: capValue ? parseFloat(capValue) : null
  });


  setFormStatus(statusMsg, 'Settings saved!', 'success');
  setTimeout(() => setFormStatus(statusMsg, ''), 3000);

  renderDashboardWelcome();
  renderStats();
  showToast('Profile & budget updated!', 'success');
});

document.getElementById('clearBudgetBtn')?.addEventListener('click', () => {
  const budgetInput = document.getElementById('budgetCap');
  budgetInput.value = '';
  updateSettings({ budgetCap: null });
  renderStats();
  showToast('Budget cleared!', 'success');
});

// Currency conversion form

const RATES = { USD: 0.00069, NGN: 1.02 };

document.getElementById('convertInput')?.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  const results = document.getElementById('convertResults');
  if (!results) return;

  if (isNaN(val) || val < 0) {
    results.innerHTML = '';
    return;
  }

  results.innerHTML = `
    <div class="rate-row"><span>USD</span><strong>$ ${(val * RATES.USD).toFixed(4)}</strong></div>
    <div class="rate-row"><span>NGN</span><strong>₦ ${(val * RATES.NGN).toFixed(2)}</strong></div>
  `;
});

// Clear all data
document.getElementById('clearAllBtn')?.addEventListener('click', () => {
  if (confirm('Are you sure? This will permanently delete ALL your transactions and reset settings. This cannot be undone.')) {
    import('../scripts/storage.js').then(({ clearAllData }) => {
      clearAllData();
      window.location.reload();
    });
  }
});

document.getElementById('sidebarThemeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

document.getElementById('notificationBtn')?.addEventListener('click', () => {
  showToast('Notifications feature coming in a future version! 🚀', 'info');
});

//Adding the keyboard shortcuts 
document.addEventListener('keydown', (e) => {
  const isCtrl = e.ctrlKey || e.metaKey;


  if (isCtrl && e.key === 'h') {
    e.preventDefault();
    navigateTo('dashboard');
  }

  if (isCtrl && e.key === 's') {
    e.preventDefault();
    navigateTo('settings');
  }

  // Focus search: /
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
});

hamburger?.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  if (pages.includes(hash)) navigateTo(hash);
}

window.addEventListener('hashchange', handleHashChange);

function setDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  const dateInputs = ['incomeDate', 'expenseDate'];
  dateInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = today;
  });
}

initTheme(); 
initState();
renderAll();
setDefaultDates();

const initialHash = window.location.hash.slice(1);
if (pages.includes(initialHash)) {
  navigateTo(initialHash);
} else {
  navigateTo('dashboard');
}

// Call renderCharts when navigating to dashboard
if (pageId === 'dashboard') { 
  renderStats(); 
  renderChart(); 
  renderTable(); 
  renderCategoryFilter(); 
  renderDashboardWelcome();
  renderCharts(); // ADD THIS
}
