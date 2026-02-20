//Regex validation rules

// Description has to be non-empty, no leading/trailing spaces, and max 200 chars
const RE_DESCRIPTION = /^\S(?:.*\S)?$/;

//The amount must be a positive number with up to 2 decimal places, and no leading zeros (except for "0" itself)
const RE_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// Date formatting is YYYY-MM-DD
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Category/tag (letters, spaces, hyphens) 
const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// Duplicated words are detected using this pattern
const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

// The currency exchange rate validation 
const RE_RATE = /^\d+(\.\d{1,6})?$/;

export function validateDescription(val) {
  if (!val || val.trim() === '') return 'Description is required.';
  if (!RE_DESCRIPTION.test(val)) return 'Description must not start or end with spaces.';
  if (val.length > 200) return 'Description must be 200 characters or fewer.';
  return '';
}

export function checkDuplicateWords(val) {
  const match = RE_DUPLICATE_WORD.exec(val);
  if (match) return `Duplicate word detected: "${match[1]}"`;
  return '';
}

export function validateAmount(val) {
  if (!val || val.trim() === '') return 'Amount is required.';
  if (!RE_AMOUNT.test(val.trim())) return 'Enter a valid amount (e.g. 12.50).';
  const num = parseFloat(val);
  if (num <= 0) return 'Amount must be greater than zero.';
  if (num > 1_000_000) return 'Amount must be below $1,000,000.';
  return '';
}

export function validateDate(val) {
  if (!val || val.trim() === '') return 'Date is required.';
  if (!RE_DATE.test(val.trim())) return 'Enter a valid date (YYYY-MM-DD).';

  // Check if date is not in the future
  const inputDate = new Date(val);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);

  tomorrow.setDate(tomorrow.getDate() + 1);

  if (inputDate >= tomorrow) {
    return 'Date cannot be in the future.';
  }

  return '';
}

export function validateCategory(val) {
  if (!val || val.trim() === '') return 'Please select a category.';
  if (!RE_CATEGORY.test(val.trim())) return 'Category may only contain letters, spaces, and hyphens.';
  return '';
}

export function validateName(val) {
  if (!val || val.trim() === '') return 'Name is required.';
  const trimmed = val.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 50) return 'Name must be 50 characters or fewer.';
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  return '';
}

export function validateRate(val) {
  if (!val || val.trim() === '') return 'Rate is required.';
  if (!RE_RATE.test(val.trim())) return 'Enter a valid positive number (e.g. 0.92).';
  const num = parseFloat(val);
  if (num <= 0) return 'Rate must be greater than zero.';
  return '';
}

export function validateBudgetCap(val) {
  if (!val || val.trim() === '') return '';
  if (!RE_AMOUNT.test(val.trim())) return 'Enter a valid amount (e.g. 500.00).';
  const num = parseFloat(val);
  if (num <= 0) return 'Cap must be greater than zero.';
  return '';
}

export function validateTransaction(data) {
  const errors = {};
  const descErr = validateDescription(data.description);
  if (descErr) errors.description = descErr;

  const amtErr = validateAmount(String(data.amount));
  if (amtErr) errors.amount = amtErr;

  const dateErr = validateDate(data.date);
  if (dateErr) errors.date = dateErr;

  const catErr = validateCategory(data.category);
  if (catErr) errors.category = catErr;

  return errors;
}

export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

export function highlightMatches(text, re) {
  if (!re) return escapeHtml(text);
  const parts = [];
  let lastIndex = 0;
  re.lastIndex = 0;
  const globalRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let match;
  while ((match = globalRe.exec(text)) !== null) {
    parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    parts.push(`<mark>${escapeHtml(match[0])}</mark>`);
    lastIndex = globalRe.lastIndex;
    if (globalRe.lastIndex === match.index) globalRe.lastIndex++; // prevent infinite loop
  }
  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join('');
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
