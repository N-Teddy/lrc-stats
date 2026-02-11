# Technology Stack & System Architecture

## 1. Core Runtime & Frameworks
- **Runtime**: **Electron** (Cross-platform desktop application)
- **Frontend Framework**: **React 19** with **Vite** (Optimized build tools)
- **Language**: **JavaScript** (ES6+)

## 2. Data Persistence (Local Storage)
- **Engine**: **File-based JSON Repository**
- **Rationale**: Minimal overhead, zero-dependency builds, and perfect for portable desktop apps.
- **Library**: Node.js `fs` module (Atomic writes via Electron IPC).
- **Schema Management**: Manual JSON validation and mapping.

## 3. UI & Design System ("Obsidian Tech")
- **Styling**: **Vanilla CSS** (Custom high-precision corporate aesthetic)
- **Design Principles**:
    - High-precision 4px/6px border radii.
    - Dark mode by default (Charcoal/Carbon palette with Brand Accents).
    - Glassmorphism effects for modals and cards.
- **Icons**: **Lucide React** (Clean, minimalist stroke icons).
- **Typography**: Space Grotesk (Headings) / Inter (Body).

## 4. Visualization & Reporting
- **Analytics**: **Recharts** (Direct integration with React state for dynamic charts).
- **Reporting**: **jsPDF** & **AutoTable** (Client-side PDF generation for yearly audits).

## 5. Directory Structure
```text
/
├── docs/               # Project documentation
├── electron/           # Main process logic & IPC handlers
│   ├── main.js         # Entry point
│   └── preload.js      # Bridge between Electron & React
├── src/                # React components & UI logic
│   ├── components/     # Reusable UI elements (Button, Card, Input)
│   ├── modules/        # Feature-based pages (People, Activities, Stats)
│   ├── store/          # Context/State management for cached data
│   └── styles/         # Global styles & design system tokens
└── db/                 # Local directory for JSON data storage
```
