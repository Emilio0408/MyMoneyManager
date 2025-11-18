# 💰 MyMoneyManager

A comprehensive mobile application for personal budget management with virtual accounts, expense tracking, and automated monthly reporting.


## 📋 Overview

**MyMoneyManager** is a mobile app designed to track monthly and total expenses. It primarily allows users to create independent virtual accounts, each representing a specific expense category (e.g., "Clothes," "Entertainment," "Travel").

Each virtual account can be configured with two distinct operating modes to suit different needs:

- Monthly Budget Accounts:

    - Ideal for recurring expenses and periodic budgeting.

    - The user sets a monthly spending limit.

    - Key Features: The account automatically resets at the beginning of each new monthly cycle. Before resetting, the app automatically generates a detailed consolidated report of the previous month's expenses, providing the user with a periodic history and a clear view of spending trends over time.

- Cumulative Budget Accounts:

    - Ideal for tracking long-term savings or spending on specific projects.

    - The user sets a total spending goal (or simply tracks the total amount without a limit).

    - Key features: This account balance is never reset, accumulating all entered expenses. It provides a real-time view of the total amount spent or saved toward a specific goal, without breaking it down into monthly periods.

## Key Concepts

- **Main Account**: Central hub tracking total available balance.
- **Virtual Accounts**: Category-based budgets with customizable spending limits.
- **Monthly Update Accounts**: Automatically reset each month for recurring expense categories.
- **Permanent Accounts**: Track total spending without monthly resets.
- **Automatic Reporting**: Historical data preserved for all monthly accounts.

## ✨ Core Features

### 🏦 Main Account Management 

**Balance Management**
- Set and modify main account balance directly
- Automatic deduction when expenses are added to virtual accounts

**Income Tracking**
- Register income entries with name, amount, and optional notes
- Automatic addition to main account balance
- Complete income history visualization
- Delete income entries with automatic balance recalculation

### 💳 Virtual Account System

**Account Creation & Management**
- Create unlimited virtual accounts for different spending categories
- Set custom spending limits for each account
- Choose between monthly-reset or permanent tracking
- Modify account name and spending limits
- Delete accounts (removes all associated expenses and reports)

**Expense Tracking**
- Add expenses with name, amount, date, and optional notes
- Real-time tracking of total spent vs. limit
- Visual progress bars showing spending percentage
- Edit or delete expenses with automatic total recalculation
- Expenses automatically deducted from main account balance

**Progress Visualization**
- Color-coded progress bars (green/red based on usage)
- Percentage display of limit utilization
- Clear overview of remaining budget

**Swipe Gestures**
- Swipe to delete for quick account removal

### 📊 Historical Data & Reports

**Automatic Monthly Reporting**
- System automatically detects month changes on app startup
- Creates comprehensive reports for monthly-update accounts
- Archives previous month's expenses before reset
- Maintains complete spending history

**Report Contents**
- Month and year identification
- All expenses from that period
- Total spent vs. account limit
- Individual expense details preserved

**Historical View**
- Browse past months' spending patterns
- Compare spending across different periods
- Access complete expense details for each month

### 🔄 Automatic Monthly Reset System

**Smart Detection**
- Checks for month change on every app launch
- Compares current date with stored system date
- Triggers reset process automatically when month changes

**Reset Process**
1. Generates reports for all monthly-update accounts
2. Archives all current month expenses to historical storage
3. Resets expense totals to zero
4. Maintains account limits and settings
5. Updates system date to current month/year

**Data Preservation**
- All expenses moved to `Storico_Spese` (Historical Expenses)
- Reports stored in `Report` table with month/year reference
- No data loss during reset process
- Permanent accounts remain unaffected

## 🛠️ Technologies

### Core Framework
- **React Native** - Cross-platform mobile development framework
- **Expo SDK** - Development platform and toolchain
- **Expo Router** - File-based routing system
- **TypeScript** - Type-safe JavaScript superset

### State Management
- **Zustand** - Lightweight state management library

### Database
- **SQLite** - Local relational database
- **expo-sqlite** - SQLite integration for Expo/React Native

###  UI Components & Design
- **React Native Paper** - Material Design component library
- **React Native Gesture Handler** - Native gesture management
- **Swipeable** - Swipe-to-delete functionality

### Animations
- **React Native Animated API** - Smooth, performant animations
- **Easing Functions** - Animation timing functions
- Fade, slide, and scale transitions throughout the app

### Development Tools
- **Expo Go** - Development client for testing
- **Expo CLI** - Command-line interface

## 📱 Project Structure

```
MyMoneyManager/
├── app/
│   ├── (tabs)/                          # Tab navigation group
│   │   ├── layout.tsx                   # Tab layout
│   │   ├── index.tsx                    # Main tab screen
│   │   └── VirtualAccountTab.tsx        # Virtual accounts tab
│   │
│   ├── layout.tsx                       # Root app layout
│   ├── HistoricDetails.tsx              # Historical data screen
│   ├── ReportDetails.tsx                # Report details screen
│   └── VirtualAccountDetails.tsx        # Virtual account details screen
│
└── src/
    ├── components/
    │   ├── IncomingList.tsx              # Income list component
    │   ├── MainAccountCard.tsx           # Main account display
    │   └── VirtualAccountsLists.tsx      # Virtual accounts list
    │
    ├── stores/
    │   ├── useMainAccountStore.ts        # Main account state management
    │   ├── useVirtualAccountStore.ts     # Virtual accounts state
    │   └── useManageVirtualAccountStore.ts # Account details state
    │
    ├── repositories/
    │   ├── mainAccountRepository.ts      # Main account CRUD operations
    │   ├── virtualAccountRepository.ts   # Virtual accounts CRUD
    │   └── ReportRepository.ts           # Reports & reset system
    │
    ├── database/
    │   └── db.ts                         # SQLite configuration
    │
    └── utils/
        └── utils.ts                      # Utility functions
```

## 🗄️ Database Schema

### Tables

**conto_principale** (Main Account)
- `id` - Primary key
- `saldo` - Current balance

**entrata** (Income)
- `id_entrata` - Primary key
- `nome` - Income name
- `nota` - Optional note
- `importo` - Amount
- `id_conto_principale` - Foreign key to main account

**Conto_Virtuale** (Virtual Account)
- `id_conto_virtuale` - Primary key
- `nome` - Account name
- `Totale_Spese` - Total spent
- `Limite` - Spending limit
- `AggiornamentoMensile` - Monthly update flag (0/1)

**Spesa** (Expense)
- `id_spesa` - Primary key
- `nome` - Expense name
- `nota` - Optional note
- `importo` - Amount
- `data` - Date
- `id_conto_virtuale` - Foreign key to virtual account

**Report** (Monthly Report)
- `Mese` - Month
- `Anno` - Year
- `id_conto_virtuale` - Virtual account ID
- `Limite` - Limit at report time
- `Nome` - Account name
- `Totale_Spese` - Total spent that month

**Storico_Spese** (Historical Expenses)
- `id_spesa` - Original expense ID
- `nome` - Expense name
- `nota` - Note
- `importo` - Amount
- `data` - Date
- `Mese` - Month
- `Anno` - Year
- `id_conto_virtuale` - Virtual account ID

**Data_Sistema** (System Date)
- `ID` - Primary key (always 1)
- `Mese` - Current month
- `Anno` - Current year

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/MyMoneyManager.git
cd MyMoneyManager
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npx expo start
```

4. **Run on device**
- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Or press `a` for Android emulator / `i` for iOS simulator


## 🤝 Contributing

This is a proprietary project. See [LICENSE](LICENSE) for usage restrictions.

For educational purposes, you may:
- View and study the code
- Download for personal learning
- Reference the architecture

You may NOT:
- Redistribute or republish
- Use in commercial projects
- Create derivative works
- Incorporate into other projects

## 📄 License

Copyright (c) 2025 Emilio Maione. All rights reserved.

This software is provided for viewing and educational purposes only. Commercial use, redistribution, and modification are prohibited without explicit written permission.

See [LICENSE](LICENSE) file for complete terms.

## 👤 Author

**Emilio Maione**
- GitHub: [@Emilio0408](https://github.com/yourusername)

⭐ If you find this project useful for learning, please star the repository!
