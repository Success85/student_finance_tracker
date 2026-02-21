// scripts/validators.js — Regex validation rules

// Description (no leading/trailing spaces)
const RE_DESCRIPTION = /^\S(?:.*\S)?$/;

// Amount — digits only, optional 2 decimal places, NO letters allowed at all
const RE_AMOUNT = /^\d+(\.\d{1,2})?$/;

// Date (YYYY-MM-DD)
const RE_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// Category (letters, spaces, hyphens only)
const RE_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// Duplicate word detection (back-reference)
const RE_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

// Rate validation (positive decimal, digits only)
const RE_RATE = /^\d+(\.\d{1,6})?$/;

const BLOCKED_PATTERNS = [
  // HTML / Script injection
  { re: /<[^>]*>/i,                        msg: 'Invalid content detected.' },
  { re: /<\/?(script|iframe|object|embed|form|input|link|meta|style|svg|img|a)[^>]*>/i, msg: 'Invalid content detected.' },

  // JS / protocol attacks
  { re: /javascript\s*:/i,                 msg: 'Invalid content detected.' },
  { re: /vbscript\s*:/i,                   msg: 'Invalid content detected.' },
  { re: /data\s*:/i,                       msg: 'Invalid content detected.' },

  // Event handlers
  { re: /on\w+\s*=/i,                      msg: 'Invalid content detected.' },

  // Shell / terminal commands
  { re: /\b(rm|sudo|chmod|chown|kill|curl|wget|bash|sh|zsh|cmd|powershell|exec|eval|spawn|fork)\b/i, msg: 'Command input is not allowed.' },
  { re: /[|&;`$(){}[\]\\]/,               msg: 'Special characters are not allowed.' },

  // SQL injection
  { re: /('|--|;|\/\*|\*\/)/,              msg: 'Invalid characters detected.' },
  { re: /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute|union|xp_)\b/i, msg: 'Invalid content detected.' },

  // Message box / alert / console commands
  { re: /\b(alert|confirm|prompt|msgbox|console\s*\.|document\s*\.|window\s*\.|process\s*\.|require\s*\()\b/i, msg: 'Invalid content detected.' },

  // Path traversal
  { re: /(\.\.[/\\]|[/\\]\.\.|%2e%2e)/i,  msg: 'Invalid content detected.' },

  // Encoded attacks
  { re: /(%3c|%3e|%22|%27|%60|&#x|&#\d)/i, msg: 'Invalid content detected.' },
];

// Returns error message string or empty string if clean.
function detectMalicious(val) {
  for (const { re, msg } of BLOCKED_PATTERNS) {
    if (re.test(val)) return msg;
  }
  return '';
}


export function validateDescription(val) {
  val = val ? val.trim() : '';

  if (val === '') return 'Description is required.';
  if (val.length > 100) return 'Description must be 100 characters or fewer.';

  const malicious = detectMalicious(val);
  if (malicious) return malicious;

  return '';
}

export function checkDuplicateWords(val) {
  const match = RE_DUPLICATE_WORD.exec(val);
  if (match) return `Duplicate word detected: "${match[1]}"`;
  return '';
}

export function validateAmount(val) {
  if (!val || String(val).trim() === '') return 'Amount is required.';

  const trimmed = String(val).trim();

  // Immediately reject anything with letters
  if (/[a-zA-Z]/.test(trimmed))   return 'Amount must contain numbers only.';

  // Reject any symbol other than a single dot
  if (/[^0-9.]/.test(trimmed))    return 'Amount must contain numbers only.';

  // Reject multiple dots
  if ((trimmed.match(/\./g) || []).length > 1) return 'Enter a valid amount (e.g. 1000 or 12.50).';

  // Must match strict numeric format
  if (!RE_AMOUNT.test(trimmed))   return 'Enter a valid amount (e.g. 1000 or 12.50).';

  const num = parseFloat(trimmed);
  if (isNaN(num))                 return 'Enter a valid number.';
  if (num <= 0)                   return 'Amount must be greater than zero.';
  if (num > 1_000_000_000)        return 'Amount is too large.';

  return '';
}

export function validateDate(val) {
  if (!val || val.trim() === '')  return 'Date is required.';
  if (!RE_DATE.test(val.trim()))  return 'Enter a valid date (YYYY-MM-DD).';

  const inputDate = new Date(val);
  const tomorrow  = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (inputDate >= tomorrow)      return 'Date cannot be in the future.';
  return '';
}

export function validateCategory(val) {
  if (!val || val.trim() === '')     return 'Please select a category.';

  const malicious = detectMalicious(val);
  if (malicious) return malicious;

  if (!RE_CATEGORY.test(val.trim())) return 'Category may only contain letters, spaces, and hyphens.';
  return '';
}

export function validateName(val) {
  if (!val || val.trim() === '')     return 'Name is required.';
  const trimmed = val.trim();
  if (trimmed.length < 2)           return 'Name must be at least 2 characters.';
  if (trimmed.length > 50)          return 'Name must be 50 characters or fewer.';

  const malicious = detectMalicious(trimmed);
  if (malicious) return malicious;

  if (!/^[a-zA-Z\s'-]+$/.test(trimmed))
    return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
  return '';
}

export function validateRate(val) {
  if (!val || val.trim() === '')    return 'Rate is required.';
  if (/[a-zA-Z]/.test(val.trim())) return 'Rate must contain numbers only.';
  if (!RE_RATE.test(val.trim()))    return 'Enter a valid positive number (e.g. 0.92).';
  const num = parseFloat(val);
  if (num <= 0)                     return 'Rate must be greater than zero.';
  return '';
}

export function validateBudgetCap(val) {
  if (!val || val.trim() === '')    return '';
  if (/[a-zA-Z]/.test(val.trim())) return 'Budget must contain numbers only.';
  if (!RE_AMOUNT.test(val.trim()))  return 'Enter a valid amount (e.g. 500.00).';
  const num = parseFloat(val);
  if (num <= 0)                     return 'Cap must be greater than zero.';
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

// Safe Regex Compiler 

export function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

// Highlight Matches

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
    if (globalRe.lastIndex === match.index) globalRe.lastIndex++;
  }
  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join('');
}

// Escape HTML
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize (strip dangerous content before saving)

export function sanitize(str) {
  return String(str)
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript\s*:/gi, '')   // strip js: protocol
    .replace(/vbscript\s*:/gi, '')     // strip vbscript:
    .replace(/data\s*:/gi, '')         // strip data: URIs
    .replace(/on\w+\s*=/gi, '')        // strip event handlers
    .replace(/[|&;`$]/g, '')           // strip shell operators
    .trim();
}