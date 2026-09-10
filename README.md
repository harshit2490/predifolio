# 📈 Stock Market Portfolio Calculator & Tracker

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, high-performance, and responsive **Stock Market Portfolio Calculator & Tracker** built for Indian equities (NSE/BSE). Track investments, fetch live market prices, plan multiple sell target predictions, and intuitively organize your portfolio with drag-and-drop card reordering.

---

## 🌟 Key Features

### 1. 📊 Real-Time Portfolio Overview
- **Summary Metrics**: Live calculation of Total Invested Capital, Projected Portfolio Value, and Total Expected Profit/Loss.
- **Dynamic Indian Number Formatting**: Values formatted in Indian Rupee denomination (e.g., `₹1,50,000.00`).
- **Live Market Price**: Displays live stock values fetched from Screener.in with percentage change and P&L indicators.

### 2. 🎯 Multiple Sell Predictions & Targets
- **Multi-Target Planning**: Add multiple sell price targets for each stock.
- **Instant P&L Projections**: Calculates exact return percentage and total profit amount for each prediction.
- **Inline Editing & Deletion**: Quick inline editing of target prices without opening separate modals.

### 3. 🖐️ Drag & Drop Card Positioning
- **Instant Drag Handle**: Click and drag the `FiMove` icon to reposition cards immediately with zero delay.
- **2.5s Long-Press Activation**: Hold down anywhere on the card body for 2.5 seconds (with a smooth visual progress bar) to unlock card dragging.
- **Accidental Drag Protection**: Quick clicks, text selections, and double-clicks never accidentally trigger drag gestures.
- **Persistent Order**: Custom card positioning is automatically saved and preserved across browser sessions.

### 4. 🔍 Intelligent Stock Search & Autocomplete
- **Debounced Autocomplete**: Integrated with Screener's company database with a 1.5-second debounce to minimize network calls.
- **Smart Date Prefilling**: Buy dates prefill with local Indian Standard Time (IST).
- **Auto Calculated Quantities**: Enter buy price and quantity, and the total invested amount calculates automatically.

### 5. 🎨 Premium Glassmorphic UI & Themes
- **Dark & Light Modes**: High-contrast, meticulously tailored color palettes for both dark and light modes.
- **Micro-Animations**: Smooth hover transitions, interactive modal overlays, and haptic feedback.
- **CSV Portfolio Export**: Export your complete portfolio, targets, and notes into an Excel/CSV spreadsheet with one click.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component-based UI logic and state management |
| **Vite** | Ultra-fast build tool and local development server |
| **Supabase** | Cloud PostgreSQL database with Row Level Security (RLS) |
| **Vanilla CSS** | Modern CSS variables, glassmorphism, responsive grid layout |
| **React Icons** | Feather Icons (`react-icons/fi`) for crisp iconography |
| **React Hot Toast** | Non-intrusive, customizable toast alerts |

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/stock-market-calci.git
cd stock-market-calci
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
