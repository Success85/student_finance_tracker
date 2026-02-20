# 💰 Student Finance Tracker

## 🌐 Repository & Live Demo

**GitHub Repository:**
[https://github.com/Success85/student_finance_tracker](https://github.com/Success85/student_finance_tracker)

**GitHub Pages Deployment:**
[https://success85.github.io/student_finance_tracker/](https://success85.github.io/student_finance_tracker/)

> ⚠️ Note: The project is deployed using GitHub Pages as required. No Netlify, Heroku, Render, or other platforms are used.

---

# 🎯 Chosen Theme

**Theme:** Personal Student Finance Management System

This application is designed to help students track income and expenses, manage a spending budget, and configure currency display and conversion. The system focuses on usability, accessibility, clean architecture, and robust input validation using regular expressions.

---

# 🚀 Features List

## 1️⃣ Transaction Management

* Add income and expense transactions
* Delete transactions
* Categorize transactions
* Real-time dashboard updates
* Automatic calculation of:

  * Total Income
  * Total Expenses
  * Net Balance

## 2️⃣ Budget Cap System

* Set a maximum spending limit
* Compare expenses against budget
* Clear budget option
* Visual feedback for overspending

## 3️⃣ Profile Settings

* User name validation
* Persistent name storage using LocalStorage
* Personalized dashboard greeting

## 4️⃣ Currency Display & Conversion

* Select base currency (RWF, USD, NGN)
* Convert base currency to one alternate currency
* Manual exchange rate configuration
* Quick currency converter
* Dynamic UI update after saving settings

## 5️⃣ Data Persistence

* All transactions stored in LocalStorage
* Settings preserved across sessions
* Seed data import support

## 6️⃣ Import / Export

* Import transactions from JSON
* Export transactions to JSON
* Supports edge cases and special characters

## 7️⃣ Accessibility (A11y)

* ARIA live regions for status updates
* Accessible form error messaging
* Semantic HTML structure
* Keyboard navigable interface

---

# 🔎 Regex Catalog

The project uses regular expressions to validate user input.

## 1️⃣ Name Validation

**Pattern:**

```
/^[a-zA-Z\s'-]{2,50}$/
```

**Description:**

* Allows letters
* Allows spaces
* Allows hyphens and apostrophes
* Minimum 2 characters
* Maximum 50 characters

**Valid Examples:**

* John Doe
* Mary-Jane
* O'Connor

**Invalid Examples:**

* J
* John123
* @Mary

---

## 2️⃣ Budget / Amount Validation

**Pattern:**

```
/^\d+(\.\d{1,2})?$/
```

**Description:**

* Allows positive numbers
* Allows up to 2 decimal places

**Valid Examples:**

* 100
* 50.5
* 9999.99

**Invalid Examples:**

* -50
* 10.999
* abc

---

## 3️⃣ Currency Rate Validation

**Pattern:**

```
/^\d+(\.\d+)?$/
```

**Description:**

* Must be a positive number
* Allows decimals
* No negative values

**Valid Examples:**

* 0.00078
* 1.5
* 1200

**Invalid Examples:**

* -1
* abc
* 1..2

---

# ⌨️ Keyboard Map

The application fully supports keyboard navigation.

| Key         | Action                           |
| ----------- | -------------------------------- |
| Tab         | Move to next interactive element |
| Shift + Tab | Move to previous element         |
| Enter       | Submit form                      |
| Escape      | Close modal (if applicable)      |
| Arrow Keys  | Navigate dropdown selections     |

All interactive elements are reachable without using a mouse.

---

# ♿ Accessibility Notes (A11y)

* Forms use `aria-describedby` for error messages
* Error messages use `role="alert"`
* Status messages use `aria-live="polite"`
* Buttons and inputs are properly labeled
* Color contrast follows accessibility guidelines
* Semantic HTML elements used throughout

Keyboard-only users can:

* Add transactions
* Set budget
* Change currency
* Import/export JSON
* Navigate between pages

---

# 🧪 How to Run Tests

This project uses manual functional testing and edge-case validation.

## Manual Test Checklist

* [ ] Add income transaction
* [ ] Add expense transaction
* [ ] Delete transaction
* [ ] Set budget cap
* [ ] Clear budget cap
* [ ] Enter invalid name
* [ ] Enter invalid budget
* [ ] Enter invalid currency rate
* [ ] Test quick currency conversion
* [ ] Import seed.json
* [ ] Export transactions
* [ ] Refresh page and confirm persistence

## Edge Case Testing

* Large numbers (999999999)
* Very small decimals (0.0001)
* Edge dates (e.g., 1900-01-01, 2099-12-31)
* Special characters in categories
* Empty form submission

---

# 📦 seed.json

The repository includes a `seed.json` file containing at least 10 diverse records including:

* Very large amounts
* Very small amounts
* Edge-case dates
* Complex category strings
* Mixed income and expense records

This file is used for import testing and validation.

---

# 🛠️ Project Structure

```
student_finance_tracker/
│
├── index.html
├── settings.html
│
├── styles/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── variables.css
│
├── scripts/
│   ├── app.js
│   ├── ui.js
│   ├── storage.js
│   ├── validators.js
│   ├── currency.js
│   └── utils.js
│
├── seed.json
└── README.md
```

---

# ▶️ How to Run the Project Locally

1. Clone the repository:

```
git clone https://github.com/Success85/student_finance_tracker.git
```

2. Navigate into the project folder:

```
cd student_finance_tracker
```

3. Open `index.html` in your browser.

No server setup required.

---

# 🎥 Demo Video

**Unlisted Demo Video Link:**
(Add your unlisted YouTube link here)

The demo video demonstrates:

* Keyboard navigation
* Regex validation edge cases
* Import and export functionality
* Currency conversion
* Budget validation

---

# 📐 Wireframe

Add your wireframe link here:

[Wireframe Link](https://drive.google.com/drive/folders/1AaIOC2UzheL7cRoxx7TrfvtNGhdwJqPJ?usp=drive_link)

---

# 🎥 Demo Video

[Demo Video Link](https://youtu.be/MjT3V2qKwLY?si=bT6EQ4A_JwB_wN3g)

---
# The web app link: Deployed on github pages

[Website Link](https://success85.github.io/student_finance_tracker)

---

# 👤 Author

Success85
Bachelor of Software Engineering Student
