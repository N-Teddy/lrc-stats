# Changelog

## [2.0.0] - Upcoming
### Planned Features
- *To be defined...*

## [1.1.0] - 2026-02-11
### Added
- **Tauri Migration**: Successfully migrated the entire backend from Electron to Tauri v2.
- **Improved Data Service**: Native file system implementation using `@tauri-apps/plugin-fs`.
- **Image Support**: Fully functional local image storage in AppData directory.
- **Enhanced Reports**: Yearly Attendance Audit now supports landscape orientation and handles 100+ users.
- **Classification System**: Added "Membre" vs "Eleve" status with visual badges and Dashboard breakdown.
- **JRs Tracking**: Dedicated counting and visualization for "Jeunes Rosicruciens".

### Fixed
- jsPDF AutoTable integration issues in modern bundlers (Vite).
- Tauri capability system permissions for recursive file access.
- Compilation errors related to nonexistent path plugins.
