import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

/**
 * Data Service for LRC Stats (Tauri Version)
 */

const getDbPath = async (filename) => {
    return await join('db', `${filename}.json`);
};

const ensureDbDir = async () => {
    const dbDirExists = await exists('db', { baseDir: BaseDirectory.AppData });
    if (!dbDirExists) {
        await mkdir('db', { baseDir: BaseDirectory.AppData, recursive: true });
    }
};

export const dataService = {
    // People
    getPeople: async () => {
        try {
            await ensureDbDir();
            const path = await getDbPath('people');
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            }
            return [];
        } catch (err) {
            console.error('Error loading people:', err);
            return [];
        }
    },
    savePeople: async (people) => {
        if (people.some(p => !p.name || p.name.trim() === '')) {
            return { success: false, error: 'All personnel must have a valid name.' };
        }
        try {
            await ensureDbDir();
            const path = await getDbPath('people');
            await writeTextFile(path, JSON.stringify(people, null, 2), { baseDir: BaseDirectory.AppData });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    // Activities
    getActivities: async () => {
        try {
            await ensureDbDir();
            const path = await getDbPath('activities');
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            }
            return [];
        } catch (err) {
            console.error('Error loading activities:', err);
            return [];
        }
    },
    saveActivities: async (activities) => {
        if (activities.some(a => !a.name || a.name.trim() === '')) {
            return { success: false, error: 'Activity name is mandatory.' };
        }
        try {
            await ensureDbDir();
            const path = await getDbPath('activities');
            await writeTextFile(path, JSON.stringify(activities, null, 2), { baseDir: BaseDirectory.AppData });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    // Attendance
    getAttendance: async () => {
        try {
            await ensureDbDir();
            const path = await getDbPath('attendance');
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            }
            return [];
        } catch (err) {
            console.error('Error loading attendance:', err);
            return [];
        }
    },
    saveAttendance: async (attendance) => {
        try {
            await ensureDbDir();
            const path = await getDbPath('attendance');
            await writeTextFile(path, JSON.stringify(attendance, null, 2), { baseDir: BaseDirectory.AppData });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    // Images (Simple implementation for now)
    saveImage: async (id, base64Data) => {
        // Tauri image saving would involve converting base64 to Uint8Array
        // and writing to a specific images folder.
        // For simplicity during migration, we'll implement this if needed.
        return { success: false, error: 'Image saving not yet implemented for Tauri' };
    }
};

export const ACTIVITY_TYPES = [
    'REUNION MENSUELLE',
    'CONFERENCE',
    'SERVICE JRS',
    'ACTIVITE LUDIQUE',
    'AUTRES',
    'JPO'
];

export const createPersonModel = (data = {}) => ({
    id: Date.now().toString(),
    name: '',
    phone: '',
    status: 'active',
    dob: '',
    dateIntegration: '',
    dateDeparture: '',
    isJRs: false,
    image: '',
    isArchived: false,
    ...data
});

export const createActivityModel = (data = {}) => ({
    id: Date.now().toString(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: ACTIVITY_TYPES[0],
    notes: '',
    ...data
});
