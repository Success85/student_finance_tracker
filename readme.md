<<<<<<< HEAD
Project structure:

/student-finance-tracker
│
├── index.html
├── about.html
├── dashboard.html
├── settings.html
├── tests.html
├── seed.json
│
├── styles/
│   ├── main.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
│
├── scripts/
│   ├── storage.js
│   ├── state.js
│   ├── ui.js
│   ├── validators.js
│   ├── search.js
│   ├── stats.js
│   └── settings.js
│
└── assets/
=======
# 💰 Rocel Student Finance Tracker

A clean, modern, and responsive Personal Finance Tracker built with Vanilla JavaScript.
This application helps users manage income and expenses, set a budget cap, and configure currency conversion — all with persistent local storage.

---

# 📌 Project Overview

The Personal Finance Tracker is a fully client-side web application designed to help users:

* Track income and expenses
* Monitor total balance
* Set and manage a spending budget
* Configure currency display and conversion
* Persist data using LocalStorage

The project follows a modular JavaScript architecture and emphasizes clean UI, accessibility, and structured code organization.

---

# 🚀 Features

## 1️⃣ Transaction Management

* Add income transactions
* Add expense transactions
* Categorize transactions
* Delete transactions
* Automatically calculate:

  * Total Income
  * Total Expenses
  * Net Balance

## 2️⃣ Budget Cap System

* Set a spending limit
* Automatically compare expenses to budget
* Clear budget functionality
* Real-time UI updates

## 3️⃣ Profile Settings

* User name validation
* Persistent name storage
* Personalized dashboard greeting

## 4️⃣ Currency Display & Conversion

* Select base currency (RWF, USD, NGN)
* Convert base currency to one alternate currency
* Manual exchange rate input
* Quick currency converter
* Automatic UI refresh after saving settings

## 5️⃣ Form Validation

* Name validation
* Budget validation
* Currency rate validation
* Accessible error messaging

## 6️⃣ User Experience Enhancements

* Toast notifications
* Status messages
* Accessible ARIA live regions
* Clean, minimal UI design

---

# 🏗️ Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript (ES Modules)
* LocalStorage API

No external frameworks or libraries are used.

---

# 📂 Project Structure

```
finance-tracker/
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
│   ├── app.js              # Main application controller
│   ├── ui.js               # Rendering and UI utilities
│   ├── storage.js          # LocalStorage logic
│   ├── validators.js       # Form validation logic
│   ├── currency.js         # Currency conversion logic
│   └── utils.js            # Shared helpers
│
└── README.md
```

---

# 🧠 Architecture Overview

The application follows a modular pattern:

## app.js

* Entry point
* Event listeners
* Navigation handling
* Coordinates modules

## ui.js

* Renders dashboard statistics
* Renders transaction table
* Formats currency display
* Shows toasts and status messages

## storage.js

* Handles LocalStorage read/write
* Manages transactions
* Manages user settings

## validators.js

Contains reusable validation functions:

* validateName()
* validateBudgetCap()
* validateRate()

## currency.js

* Stores base and alternate currencies
* Applies exchange rate
* Performs conversions

---

# 💾 Data Storage

All application data is stored in LocalStorage.

Example structure:

```
{
  userName: "John",
  budgetCap: 500,
  baseCurrency: "RWF",
  altCurrency: "USD",
  rate: 0.00078,
  transactions: [
    {
      id: "abc123",
      type: "income",
      amount: 200000,
      category: "Salary",
      date: "2026-02-01"
    }
  ]
}
```

---

# 💱 Currency Conversion Logic

Conversion formula:

```
convertedAmount = baseAmount × rate
```

Example:

If base = RWF
If alt = USD
If rate = 0.00078

Then:

```
200 RWF × 0.00078 = 0.156 USD
```

---

# 📊 Dashboard Calculations

The system automatically calculates:

* Total Income
* Total Expenses
* Net Balance
* Remaining Budget

All values are formatted based on the selected base currency.

---

# ♿ Accessibility

* ARIA live regions for dynamic updates
* Clear form error messages
* Semantic HTML structure
* Accessible status notifications

---

# 🛠️ Setup Instructions

1. Clone the repository:

```
git clone https://github.com/Success85/student_finance_tracker.git
```

2. Navigate into the project folder:

```
cd finance-tracker
```

3. Open `index.html` in your browser.

No backend or server setup required.

---

# 🧪 Testing Checklist

* [ ] Add income transaction
* [ ] Add expense transaction
* [ ] Delete transaction
* [ ] Set budget cap
* [ ] Clear budget cap
* [ ] Change base currency
* [ ] Save currency rate
* [ ] Test quick converter
* [ ] Refresh page and verify persistence

---

# 🔮 Future Improvements

* Automatic exchange rate API integration
* Data visualization charts
* Dark mode toggle
* CSV export feature
* Monthly reports
* Backend integration
* User authentication

---

# 📐 Wireframe

Add your wireframe link here:

[Wireframe Link](https:)

---

# 🎥 Demo Video

[Demo Video Link](https://)

---

# 👤 Author

Success Ituma
SOftware Engineer
>>>>>>> origin/master
