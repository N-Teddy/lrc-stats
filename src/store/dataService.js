/**
 * Data Service for LRC Stats
 * Provides abstract layer for database operations
 */

// Use a getter to ensure we always get the latest version of the API from the window
const getAPI = () => {
    if (window.electronAPI) return window.electronAPI;

    // Fallback/Mock for development in browser or if bridge is slow to load
    console.warn("Electron API not found on window. Ensure you are running inside Electron.");
    return {
        loadData: async () => [],
        saveData: async () => ({ success: false, error: 'Not in Electron environment' }),
        saveImage: async () => ({ success: false, error: 'Not in Electron environment' }),
        ping: async () => 'pong'
    };
};

export const dataService = {
    // People
    getPeople: () => getAPI().loadData('people'),
    savePeople: (people) => getAPI().saveData('people', people),

    // Activities
    getActivities: () => getAPI().loadData('activities'),
    saveActivities: (activities) => getAPI().saveData('activities', activities),

    // Images
    saveImage: (id, base64Data) => getAPI().saveImage(id, base64Data),

    // Attendance
    getAttendance: () => getAPI().loadData('attendance'),
    saveAttendance: (attendance) => getAPI().saveData('attendance', attendance),
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
