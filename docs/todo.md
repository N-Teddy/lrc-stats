# Implementation Roadmap: LRC Stats

This document outlines the granular tasks required to build the LRC Stats desktop application from scratch to final packaging.

## Phase 1: Project Setup & Initialization ✅
- [x] **Environment Setup**: Initialize project with `pnpm create vite@latest . --template react`.
- [x] **Dependencies**: Install core packages (`electron`, `electron-builder`, `lucide-react`, `recharts`, `jspdf`, `jspdf-autotable`).
- [x] **Electron Configuration**:
    - [x] Create `electron/main.js` (Window management & IPC).
    - [x] Create `electron/preload.js` (Secure bridge).
    - [x] Update `package.json` with scripts for `dev` and `build`.
- [x] **Folder Structure**: Scaffolding the directory tree as per `tech_stack.md`.

## Phase 2: Architecture & Data Layer ✅
- [x] **Database Setup**: Initialize `db/` folder with empty JSON templates (`people.json`, `activities.json`, `attendance.json`).
- [x] **IPC Infrastructure**:
    - [x] Implement `loadData` / `saveData` handlers in the Main process.
    - [x] Create API bridge for CRUD operations.
- [x] **Data Model Implementation**:
    - [x] **People**: Support for phone, status, dob, integration/departure dates, isJRs flag, image path, and `isArchived` flag.
    - [x] **Activities**: Support for types: *reunion mensuelle, conference, service jrs, activite ludique, autres, jpo*.

## Phase 3: Core UI Development ✅
- [x] **Design Foundation**: Create `src/styles/design-tokens.css` (Glassmorphism, Charcoal palette, technical typography).
- [x] **Main Layout**: Implement Sidebar navigation and high-precision App Shell.
- [x] **People Module**:
    - [x] Searchable directory with profile cards.
    - [x] Form for adding/editing members (with all custom fields).
    - [x] **Archive logic**: Implementation of the "Archive" action instead of deletion.
- [ ] **Activity Module**:
    - [ ] Calendar/List view of events.
    - [ ] Creation flow with specific activity type dropdowns.

## Phase 4: Business Logic & Statistics
- [ ] **Attendance Engine**:
    - [ ] Interactive checklist for marking presence.
    - [ ] Bulk-save logic to persist attendance to JSON.
- [ ] **Dashboard Visualization**:
    - [ ] Metric cards (Total People, Active JRs, Avg. Attendance).
    - [ ] Line chart for attendance trends (Recharts).
- [ ] **Reporting System**:
    - [ ] Implementation of PDF generation engine using `jsPDF`.
    - [ ] Yearly report logic: Format data into tables for mandatory yearly audits.

## Phase 5: Polish & Completion
- [ ] **Micro-animations**: Add entrance transitions for charts and list items.
- [ ] **Data Validation**: Ensure no duplicate entries and mandatory field checks.
- [ ] **Packaging**:
    - [ ] Configure `electron-builder` for one-click installation.
    - [ ] Build for target OS (Windows/Linux/Mac).
- [ ] **Review**: Final audit against `project_overview.md` requirements.
