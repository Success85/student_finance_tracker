# 💰 Rocel — Student Personal Finance Tracker

> A clean, modern, and mobile-first personal finance tracker built for students with Vanilla JavaScript. Track income and expenses, visualize spending habits, set a monthly budget, and manage your full transaction history — all in the browser with no backend required.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Regex & Validation Catalog](#regex--validation-catalog)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Currency & Conversion](#currency--conversion)
- [Data Storage](#data-storage)
- [Charts & Visualization](#charts--visualization)
- [Data Management](#data-management)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Accessibility](#accessibility)
- [Browser Support](#browser-support)
- [Testing Checklist](#testing-checklist)
- [Future Improvements](#future-improvements)
- [Wireframe & Demo](#wireframe--demo)
- [Credits](#credits)

---

## Overview

Rocel is a single-page application (SPA) designed to help students take control of their personal finances. It runs entirely in the browser using vanilla JavaScript with ES modules — no frameworks, no server, no accounts required. All data is persisted to `localStorage` so your records survive page refreshes.

The base currency is **Nigerian Naira (₦ NGN)**, with built-in conversion support for USD and RWF.

---

## Features

### 1️⃣ Transaction Management
- **Add** income or expense transactions with a description, amount, category, and date
- **Edit** any existing transaction via an inline modal form
- **Delete** transactions with a confirmation prompt to prevent accidental loss
- Descriptions are automatically trimmed of leading and trailing whitespace before saving
- Duplicate description detection warns you before saving similar entries
- Automatically calculates **Total Income**, **Total Expenses**, and **Net Balance**

### 2️⃣ Budget Cap System
- Set a monthly spending limit in Settings (in ₦ NGN)
- Dashboard shows a live progress bar that fills as you spend — turns red when over budget
- Real-time status message: remaining amount or overspend warning
- Clear the budget at any time with one click

### 3️⃣ Profile Settings
- Save your name for a personalised dashboard greeting
- Name defaults to a preconfigured value until updated
- All settings are validated before saving and persisted to `localStorage`

### 4️⃣ Currency Display & Conversion
- Base currency is **NGN (₦)**
- Quick converter in Settings converts any NGN amount to:
  - **USD ($)** using your configured rate
  - **RWF** using your configured rate
- Exchange rates are fully editable so you can keep them current
- All displayed amounts update automatically after saving settings

### 5️⃣ Search, Filter & Sort
- **Live search** across description, category, and amount fields
- **Case-sensitive toggle** for precise searches
- **Filter by type** — All / Income / Expense
- **Filter by category** — dynamically populated from your data
- **Sort** by date (newest/oldest), amount (highest/lowest), or description (A→Z / Z→A)
- Result count updates live as you filter

### 6️⃣ Charts & Visualization
All charts powered by **Chart.js v4.4.1** via CDN:
- **Monthly line chart** — income vs. expenses trend
- **Category donut chart** — spending breakdown by category
- **Income source bar chart** — where your money comes from
- **Balance sparkline** — minimal at-a-glance balance trend
- **Last 7 days bar chart** — daily spending over the past week

### 7️⃣ Data Management
- **Export JSON** — download a full backup of all transactions
- **Import JSON** — restore from a previously exported file; validated before saving
- **Clear All Data** — wipe transaction history with a confirmation step
- `seed.json` included in the project root for loading sample data during development

### 8️⃣ Theme
- **Dark mode** and **Light mode** toggle
- Theme preference saved to `localStorage` and restored on next visit
- Toggle available in both the sidebar (desktop) and topbar (mobile)

### 9️⃣ Form Validation
- Description, amount, date, and category all validated before saving
- Descriptions automatically trimmed of whitespace
- Accessible inline error messages with ARIA live regions
- Malicious input detection on all text fields

---

## Project Structure

```
student_finance_tracker/
├── index.html              # Main application entry point
├── tests.html              # Manual test cases and QA sandbox
├── seed.json               # Sample transaction data for development
├── README.md               # Project documentation
│
├── styles/
│   ├── main.css            # Design system, CSS variables, mobile-first base styles
│   ├── responsive.css      # min-width breakpoints (≥480px, ≥768px, ≥1024px, ≥1280px)
│   └── components.css      # Reusable component styles — badges, pills, cards, rates
│
└── scripts/
    ├── app.js              # Entry point — event listeners, navigation, keyboard shortcuts
    ├── ui.js               # All rendering — stats, charts, table, mobile cards, settings
    ├── charts.js           # Chart.js wrapper — creates, updates, and destroys instances
    ├── state.js            # Centralized state with pub/sub pattern
    ├── storage.js          # localStorage persistence, import/export logic
    └── validator.js        # Validation, regex search, HTML escaping, input sanitization
```

---

## Architecture Overview

The application follows a modular ES module pattern with a single source of truth in `state.js`.

### `app.js`
Entry point. Wires up all event listeners, handles SPA navigation between Dashboard, About, and Settings, and coordinates all other modules. Also manages keyboard shortcuts.

### `ui.js`
Responsible for all DOM rendering. Renders dashboard statistics, the transaction table (desktop) and card list (mobile), currency formatting via `fmt()`, settings form state, and toast notifications.

### `state.js`
Centralized store using a pub/sub pattern. Holds all transactions, user settings, and UI state (current page, sort, search, filters). Notifies subscribers on every state change and auto-saves to `localStorage`.

### `storage.js`
Handles reading and writing to `localStorage` and manages JSON import/export. Validates imported files before writing to state.

### `charts.js`
Thin wrapper around Chart.js. Creates donut, bar, line, and sparkline instances. Tracks all active instances and destroys them before re-rendering to prevent memory leaks. Updates chart colors on theme change.

### `validator.js`
Reusable validation functions for all form fields — `validateDescription()`, `validateBudgetCap()`, `validateRate()`. Includes regex-powered search compilation, HTML escaping to prevent XSS, and malicious input detection.

---
---

## Regex & Validation Catalog

All validation logic lives in `scripts/validator.js`. Below is a reference of every regex pattern, what it matches, and where it is used.

### Core Patterns

| Constant | Pattern | Purpose |
|---|---|---|
| `RE_DESCRIPTION` | `/^\S(?:.*\S)?$/` | Ensures description does not start or end with whitespace |
| `RE_AMOUNT` | `/^\d+(\.\d{1,2})?$/` | Digits only, optional 1–2 decimal places — no letters or symbols |
| `RE_DATE` | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` | Strict `YYYY-MM-DD` format with valid month and day ranges |
| `RE_CATEGORY` | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters only, with optional spaces or hyphens between words |
| `RE_DUPLICATE_WORD` | `/\b(\w+)\s+\1\b/i` | Back-reference catches repeated consecutive words (e.g. `"the the"`) |
| `RE_RATE` | `/^\d+(\.\d{1,6})?$/` | Positive decimal up to 6 places — used for exchange rate inputs |

---

### Security — Blocked Patterns (`BLOCKED_PATTERNS`)

Checked on every text input via `detectMalicious()`. Returns an error message on first match.

| Category | Example Match | Blocked Because |
|---|---|---|
| HTML / tag injection | `<script>`, `<iframe>`, `<img>` | Prevents XSS via injected markup |
| JS protocol | `javascript:alert(1)` | Blocks inline script execution |
| VBScript / data URIs | `vbscript:`, `data:` | Blocks alternative script and data injection vectors |
| Event handlers | `onclick=`, `onerror=` | Prevents DOM event-based script execution |
| Shell commands | `rm`, `sudo`, `curl`, `eval`, `exec` | Blocks terminal command injection |
| Shell operators | `\|`, `&`, `;`, `` ` ``, `$`, `(`, `)` | Strips shell metacharacters |
| SQL injection | `'`, `--`, `DROP`, `SELECT`, `UNION` | Prevents SQL injection patterns |
| JS globals | `alert()`, `console.`, `document.`, `window.` | Blocks browser API abuse |
| Path traversal | `../../`, `%2e%2e` | Prevents directory traversal attempts |
| Encoded attacks | `%3c`, `%3e`, `&#x`, `&#0` | Blocks URL/HTML-encoded injection |

---

### Exported Validation Functions

| Function | Validates | Key Rules |
|---|---|---|
| `validateDescription(val)` | Transaction description | Required, ≤100 chars, trimmed, no malicious content |
| `validateAmount(val)` | Transaction amount | Required, numbers only, no letters or symbols, >0, ≤1,000,000,000 |
| `validateDate(val)` | Transaction date | Required, `YYYY-MM-DD` format, cannot be in the future |
| `validateCategory(val)` | Transaction category | Required, letters/spaces/hyphens only, no malicious content |
| `validateName(val)` | User profile name | Required, 2–50 chars, letters/spaces/hyphens/apostrophes only |
| `validateRate(val)` | Currency exchange rate | Required, positive decimal, numbers only |
| `validateBudgetCap(val)` | Monthly budget cap | Optional — if provided must be a positive number |
| `validateTransaction(data)` | Full transaction object | Runs all four field validators, returns `errors` object |
| `checkDuplicateWords(val)` | Any text field | Warns if the same word appears twice consecutively |

---

### Utility Functions

| Function | Purpose |
|---|---|
| `compileRegex(input, flags)` | Safely compiles user search input into a `RegExp` — returns `null` on invalid pattern instead of throwing |
| `highlightMatches(text, re)` | Wraps regex matches in `<mark>` tags for search highlighting in the transaction list |
| `escapeHtml(str)` | Escapes `&`, `<`, `>`, `"`, `'`, `/` before inserting any user content into the DOM |
| `sanitize(str)` | Strips HTML tags, JS/VBScript protocols, event handlers, and shell operators before saving to state |
```
```

## Getting Started

No build step or package manager required.

**1. Clone the repository**
```bash
git clone https://github.com/Success85/student_finance_tracker.git
cd rocel
```

**2. Open in browser**

Open `index.html` directly in any modern browser, or serve locally:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`.

**3. (Optional) Load sample data**

Go to **Settings → Data Management**, click **Import JSON**, and select `seed.json` from the project root to populate the app with sample transactions for testing.

---

## Usage Guide

### Adding a Transaction
1. Click **➕ Add** on the Dashboard
2. Toggle between **Expense** and **Income** at the top of the modal
3. Fill in the description, amount (in ₦), date, and category
4. Click **Add Transaction** — the dashboard updates immediately

### Editing a Transaction
1. Find the transaction in the table (desktop) or card list (mobile)
2. Click **Edit** — the modal pre-fills with existing values
3. Make your changes and click **Save Changes**

### Deleting a Transaction
1. Click **Delete** next to any transaction
2. Confirm in the prompt — this cannot be undone

### Setting a Budget
1. Go to **Settings → Profile & Budget**
2. Enter your name and a monthly budget cap in ₦
3. Click **Save Settings** — the dashboard will show your live budget progress

### Importing Data
1. Go to **Settings → Data Management** or click **↓ Import** on the Dashboard
2. Select a `.json` file previously exported from Rocel
3. The file is validated before any data is written

---

## Currency & Conversion

All transaction amounts are stored internally in **NGN (₦)**. The quick converter in Settings lets you see equivalent values without affecting stored data.

**Conversion formula:**
```
convertedAmount = baseAmount × rate
```

**Example:**
```
₦200,000 × 0.00074 = $148.00 USD
₦200,000 × 1.02    = RWF 204000.00
```

| Setting | Description |
|---|---|
| `rateUSD` | NGN → USD exchange rate (e.g. `0.00074`) |
| `rateRWF` | NGN → RWF exchange rate (e.g. `1.02`) |

Update these in Settings whenever market rates change.

---

## Data Storage

All data is stored in `localStorage`. Example structure:

```json
{
  "userName": "Eric",
  "budgetCap": 150000,
  "baseCurrency": "NGN",
  "rateUSD": 0.00074,
  "rateRWF": 1.02,
  "theme": "dark",
  "transactions": [
    {
      "id": "abc123",
      "type": "income",
      "amount": 200000,
      "description": "Monthly stipend",
      "category": "Salary",
      "date": "2026-02-01"
    }
  ]
}
```

---

## Charts & Visualization

Charts are rendered using [Chart.js v4.4.1](https://www.chartjs.org/) from jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js"></script>
```

All chart instances are tracked and destroyed before re-rendering to prevent memory leaks. Colors update automatically when switching between dark and light mode.

---

## Data Management

| Action | Location | Format |
|---|---|---|
| Export | Dashboard or Settings | `.json` |
| Import | Dashboard or Settings | `.json` |
| Clear all | Settings → Data Management | — |

Exported JSON contains all transaction records and can be re-imported on any device running Rocel. Malformed files are rejected with an error message — no partial writes occur.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl + H` | Go to Dashboard |
| `Ctrl + S` | Go to Settings |
| `/` | Focus the search input |
| `Esc` | Close any open modal |

---

## Accessibility

- Semantic HTML5 landmarks — `<main>`, `<aside>`, `<header>`, `<nav>`, `<footer>`
- All interactive elements have `aria-label` or visible labels
- `aria-live` regions for dynamic content — search results, toast notifications, budget status
- Full keyboard navigation — modals trap focus and restore it on close
- Skip link for screen reader and keyboard users
- `@media (prefers-reduced-motion: reduce)` support
- `@media (prefers-contrast: high)` support
- Mobile-first responsive layout tested at 360px, 480px, 768px, 1024px, and 1280px

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

Requires: ES Modules (`type="module"`), CSS Custom Properties, CSS Grid, FileReader API.

---

## Testing Checklist

Use `tests.html` for structured QA. Manual test cases:

- [ ] Add an income transaction
- [ ] Add an expense transaction
- [ ] Edit an existing transaction
- [ ] Delete a transaction
- [ ] Set a monthly budget cap
- [ ] Verify budget progress bar and status message update correctly
- [ ] Clear budget cap
- [ ] Export transactions as JSON
- [ ] Import a JSON backup file
- [ ] Clear all transaction data
- [ ] Toggle between dark and light mode
- [ ] Use the quick currency converter in Settings
- [ ] Search, filter, and sort the transaction list
- [ ] Refresh the page and verify all data persists
- [ ] Test on a mobile viewport (360px width)

---

## Future Improvements

- Automatic exchange rate API integration (live rates)
- CSV export in addition to JSON
- Monthly summary PDF reports
- Recurring transaction support
- Category-level budget caps
- Backend integration for cloud sync
- User authentication and multi-profile support
- PWA support for offline use and home screen installation

---

## Wireframe & Demo

**Wireframe:** [View Wireframe](https://)

**Demo Video:** [Watch Demo](https://)

**Live Page:** [Watch Demo](https://https://success85.github.io/student_finance_tracker)

---

## Tech Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES Modules)
- Chart.js v4.4.1 (CDN)
- localStorage API

No external frameworks or libraries beyond Chart.js.

---

## Credits

**Built by** [Success Ituma](https://www.linkedin.com/in/success-ituma-4176ba263) — Software Engineer

**Charts** — [Chart.js](https://www.chartjs.org/) (MIT License)

**Fonts** — [DM Serif Display & DM Sans](https://fonts.google.com/) via Google Fonts

---

*Rocel © 2026*
