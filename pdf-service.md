# LRC Stats V4: High-Precision PDF Reporting Specification

This document defines the technical requirements for the restructured PDF generation engine, focusing on "Tactical Audit" capabilities and high-fidelity archival.

## 📄 Standardized Report Configurations

### 1. Master Yearly Attendance Audit
*   **Target Module**: `StatsModule.jsx`
*   **Official Document Title**: `LRC DOUALA - JRs YEARLY ATTENDANCE REPORT`
*   **Handshake Interface (Modal)**:
    *   **Selection**: Multi-select Year capability (allows comparing cycles).
    *   **Sorting Engine**: `Name`, `Attendance Volume`.
    *   **Direction**: `ASC` (Ascending), `DESC` (Descending).
*   **Visual Engineering**: Multi-year reports must utilize distinct color-coding per table (e.g., Cyan for 2024, Purple for 2025) for immediate ocular differentiation.

### 2. Personnel Directory Audit (Liste Report)
*   **Target Module**: `PeopleModule.jsx`
*   **Official Document Title**: `LRC DOUALA - JRs LISTE REPORT`
    *   **Intelligence Metric**: Automated "Engagement Status" (Very Active / Active / Inactive).
*   **Handshake Interface (Modal)**:
    *   **Field Toggles (Checkboxes)**:
        *   [ ] Engagement Status (Calculated)
        *   [ ] Profile Image (Embedded thumbnails)
        *   [ ] Integration Date
        *   [ ] Attendance Percentage (%)
    *   **Sorting Engine**: `Name`, `Total Attendance`, `Engagement Status`.
    *   **Direction**: `ASC`, `DESC`.

### 3. Mission Session Documentation
*   **Target Module**: `ActivityDetailModule.jsx`
*   **Official Document Title**: `LRC DOUALA - JRs ACTIVITY ATTENDANCE REPORT`
*   **Logic**: High-fidelity attendance sheet for a specific operational gathering.

### 4. Individual Performance Audit (Personal Report)
*   **Target Module**: `PersonDetailModule.jsx`
*   **Official Document Title**: `LRC DOUALA - JRs PERSONAL REPORT`
*   **Handshake Interface (Modal)**:
    *   **Visual Logic**: [ ] Include Profile Image.
    *   **Temporal Filter**: Multi-year selection.
    *   **Operational Filter**: Include or Exclude specific Activity Types (e.g., exclude "Socials").
    *   **Sorting Engine**: `Date`, `Presence Status`.
    *   **Direction**: `ASC`, `DESC`.

---
**Build Status**: v4.0.0 (ENGINEERING PHASE)
**Atmosphere**: High-Precision / Accountability