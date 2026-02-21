// scripts/storage.js — This handles all interactions with localStorage, including loading/saving transactions and settings, as well as import/export functionality.

const KEYS = {
  transactions: 'rocel:transactions',
  settings: 'rocel:settings',
};

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(KEYS.transactions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('rocel: Failed to parse transactions from storage');
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(KEYS.transactions, JSON.stringify(transactions));
  } catch (e) {
    console.error('rocel: Failed to save transactions', e);
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return getDefaultSettings();

    const parsed = JSON.parse(raw);

    const defaults = getDefaultSettings();
    const merged = { ...defaults, ...parsed };

    if (parsed.rate1 && !parsed.rateUSD) {
      merged.rateUSD = parsed.rate1;
    }

    if (parsed.rate2 && !parsed.rateNGN) {
      merged.rateNGN = parsed.rate2;
    }

    return merged;
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch (e) {
    console.error('rocel: Failed to save settings', e);
  }
}

function getDefaultSettings() {
  return {
    userName: '',
    budgetCap: null,
    baseCurrency: 'NGN',
    altCurrency: 'USD',
    exchangeRates:0.00063,
    theme: 'light'
  };
}

export function clearAllData() {
  localStorage.removeItem(KEYS.transactions);
  localStorage.removeItem(KEYS.settings);
}

export function exportJSON(transactions, settings) {
  const payload = {
    _meta: {
      app: 'rocel',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      recordCount: transactions.length,
    },
    transactions,
    settings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rocel-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}


export function importJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText);

    let transactions = [];
    let settings = null;

    if (Array.isArray(data)) {
      transactions = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.transactions)) {
        transactions = data.transactions;
      } else {
        return { transactions: [], settings: null, error: 'Invalid format: missing "transactions" array.' };
      }
      if (data.settings && typeof data.settings === 'object') {
        settings = {
          ...getDefaultSettings(),
          ...data.settings
        };
      }
    } else {
      return { transactions: [], settings: null, error: 'Invalid JSON format.' };
    }

    // Validation for each of the records in transactions array
    const errors = [];
    const validated = [];
    transactions.forEach((rec, i) => {
      if (!rec || typeof rec !== 'object') {
        errors.push(`Record ${i + 1}: Not an object`);
        return;
      }
      if (!rec.id || typeof rec.id !== 'string') {
        errors.push(`Record ${i + 1}: Missing or invalid 'id'`);
        return;
      }
      if (!rec.description || typeof rec.description !== 'string') {
        errors.push(`Record ${i + 1}: Missing or invalid 'description'`);
        return;
      }
      const amount = parseFloat(rec.amount);
      if (isNaN(amount) || amount < 0) {
        errors.push(`Record ${i + 1}: Invalid 'amount'`);
        return;
      }
      if (!['income', 'expense'].includes(rec.type)) {
        errors.push(`Record ${i + 1}: 'type' must be "income" or "expense"`);
        return;
      }
      validated.push({
        ...rec,
        amount: parseFloat(rec.amount),
        createdAt: rec.createdAt || new Date().toISOString(),
        updatedAt: rec.updatedAt || new Date().toISOString(),
      });
    });

    if (errors.length > 0) {
      return {
        transactions: [],
        settings: null,
        error: `Validation failed:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}`,
      };
    }

    return { transactions: validated, settings, error: null };
  } catch (e) {
    return { transactions: [], settings: null, error: `JSON parse error: ${e.message}` };
  }
}
