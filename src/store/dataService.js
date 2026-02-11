/**
 * Data Service for LRC Stats
 * Provides abstract layer for database operations
 */

const API = window.electronAPI;

export const dataService = {
    // People
    getPeople: () => API.loadData('people'),
    savePeople: (people) => API.saveData('people', people),

    // Activities
    getActivities: () => API.loadData('activities'),
    saveActivities: (activities) => API.saveData('activities', activities),

    // Attendance
    getAttendance: () => API.loadData('attendance'),
    saveAttendance: (attendance) => API.saveData('attendance', attendance),
};

// Activity Types as requested
export const ACTIVITY_TYPES = [
    'reunion mensuelle',
    'conference',
    'service jrs',
    'activite ludique',
    'autres',
    'jpo'
];

// Helper to create a new person object with all required fields
export const createPersonModel = (data = {}) => ({
    id: Date.now().toString(),
    name: '',
    phone: '',
    status: 'active', // e.g., active, inactive, archived
    dob: '',
    dateIntegration: '',
    dateDeparture: '',
    isJRs: false,
    image: '',
    isArchived: false,
    ...data
});

// Helper to create a new activity object
export const createActivityModel = (data = {}) => ({
    id: Date.now().toString(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: ACTIVITY_TYPES[0],
    notes: '',
    ...data
});
