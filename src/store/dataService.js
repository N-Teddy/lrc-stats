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

    // Images implementation for Tauri
    saveImage: async (id, base64Data) => {
        try {
            // 1. Ensure directories
            await ensureDbDir();
            const imagesDirExists = await exists('images', { baseDir: BaseDirectory.AppData });
            if (!imagesDirExists) {
                await mkdir('images', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            // 2. Process base64
            const base64Image = base64Data.split(';base64,').pop();
            const binaryString = atob(base64Image);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // 3. Save file
            const fileName = `${id}_${Date.now()}.png`;
            const relativePath = await join('images', fileName);
            const { writeFile } = await import('@tauri-apps/plugin-fs');
            await writeFile(relativePath, bytes, { baseDir: BaseDirectory.AppData });

            // 4. Return full path for Tauri use
            const appData = await appDataDir();
            const fullPath = await join(appData, relativePath);
            // Prefix for Tauri's internal asset serving if needed,
            // but usually just the path works with convertFileSrc
            return { success: true, url: fullPath };
        } catch (err) {
            console.error('Error saving image in Tauri:', err);
            return { success: false, error: err.message };
        }
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

export const PERSON_STATUS_TYPES = [
    'Membre',
    'Eleve'
];

export const createPersonModel = (data = {}) => ({
    id: Date.now().toString(),
    name: '',
    phone: '',
    status: PERSON_STATUS_TYPES[0], // Default to 'Membre'
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
