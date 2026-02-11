# LRC Stats App - Project Overview

## 1. Idea & Concept
The LRC Stats app is a desktop application designed to manage attendance and generate statistics for people and activities. It aims to simplify the process of tracking participation and visualizing engagement over time.

**Core Workflow:**
1.  Manage a list of **People**.
2.  Manage a list of **Activities** (events/sessions).
3.  Record **Attendance** (linking People to Activities).
4.  Generate and View **Statistics**.

## 2. Implementation & Architecture

For granular technical details and task tracking, please refer to:
- [Technical Stack](tech_stack.md)
- [Implementation Roadmap (TODO)](todo.md)

### Development Phases

1.  **Database Design**: Creating schemas for `People`, `Activities`, and `Attendance`.
2.  **UI Development**:
    *   **Dashboard**: Overview of key metrics.
    *   **People Management**: Add, Edit, Delete, View profiles.
    *   **Activity Management**: Create activities, View history.
    *   **Attendance Recording**: Interface to mark presence for an activity.
    *   **Statistics**: Charts and data tables.
5.  **Refinement & Packaging**: Polishing the UI/UX and building the executable.

## 3. Features & Requirements

### 3.1 People Management
*   **List View**: See all registered individuals.
*   **Add/Edit**: basic details (Name is mandatory). *Open Question: What other fields? (e.g., Phone, Email, Role?)*

### 3.2 Activity Management
*   **Create Activity**: Define an event (Name, Date, Type?).
*   **List Activities**: View past and upcoming activities.
*   **Edit Activity**: Edit an activity (e.g., change date, type).

### 3.3 Attendance Recording
*   **Select Activity**: Choose which event to mark attendance for.
*   **Mark Presence**: Select people from the list who attended.
*   **Efficiency**: Bulk selection or search-to-add for speed.

### 3.4 Statistics & Reporting
*   **Activity Stats**: Total attendance count per event.
*   **Person Stats**: Attendance frequency/rate per person.
*   **Trends**: Attendance over time (line charts).

### Answers

3.1 - add fields like phone, status, dob, date of integration(optional), date of departure(optional, year & month), is JRs(boolean), image

- no deletion of a person record. there should be archive, instead

3.2 - for activity type, there should be: reunion mensuelle, conference, service jrs, activite ludique, autres, jpo

3.3 - also there should be a yearly pdf report generation


