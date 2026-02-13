import { readTextFile, writeTextFile, exists, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { v4 as uuidv4 } from 'uuid';
import { auditService } from './auditService';

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
    savePeople: async (people, auditInfo = null) => {
        if (people.some(p => !p.name || p.name.trim() === '')) {
            return { success: false, error: 'All personnel must have a valid name.' };
        }
        try {
            await ensureDbDir();
            const path = await getDbPath('people');
            await writeTextFile(path, JSON.stringify(people, null, 2), { baseDir: BaseDirectory.AppData });

            if (auditInfo) {
                await auditService.log(auditInfo.action, 'PERSON', auditInfo.name);
            }

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
    saveActivities: async (activities, auditInfo = null) => {
        if (activities.some(a => !a.name || a.name.trim() === '')) {
            return { success: false, error: 'Activity name is mandatory.' };
        }
        try {
            await ensureDbDir();
            const path = await getDbPath('activities');
            await writeTextFile(path, JSON.stringify(activities, null, 2), { baseDir: BaseDirectory.AppData });

            if (auditInfo) {
                await auditService.log(auditInfo.action, 'ACTIVITY', auditInfo.name);
            }

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
    saveAttendance: async (attendance, auditInfo = null) => {
        try {
            await ensureDbDir();
            const path = await getDbPath('attendance');
            await writeTextFile(path, JSON.stringify(attendance, null, 2), { baseDir: BaseDirectory.AppData });

            if (auditInfo) {
                await auditService.log(auditInfo.action, 'ATTENDANCE', auditInfo.name);
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },

    // Images implementation for Tauri
    saveImage: async (id, base64Data) => {
        try {
            await ensureDbDir();
            const imagesDirExists = await exists('images', { baseDir: BaseDirectory.AppData });
            if (!imagesDirExists) {
                await mkdir('images', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            const base64Image = base64Data.split(';base64,').pop();
            const binaryString = atob(base64Image);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const fileName = `${id}_${Date.now()}.png`;
            const relativePath = await join('images', fileName);
            const { writeFile } = await import('@tauri-apps/plugin-fs');
            await writeFile(relativePath, bytes, { baseDir: BaseDirectory.AppData });

            const appData = await appDataDir();
            const fullPath = await join(appData, relativePath);
            return { success: true, url: fullPath };
        } catch (err) {
            console.error('Error saving image in Tauri:', err);
            return { success: false, error: err.message };
        }
    },

    factoryReset: async () => {
        try {
            const { remove } = await import('@tauri-apps/plugin-fs');

            // Delete DB directory
            if (await exists('db', { baseDir: BaseDirectory.AppData })) {
                await remove('db', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            // Delete Images directory
            if (await exists('images', { baseDir: BaseDirectory.AppData })) {
                await remove('images', { baseDir: BaseDirectory.AppData, recursive: true });
            }

            // Clear localStorage
            localStorage.clear();

            return { success: true };
        } catch (err) {
            console.error('Factory Reset Error:', err);
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

export const getActivityTypeKey = (type) => {
    if (!type) return 'autres';
    const firstWord = type.trim().toUpperCase().split(' ')[0];
    const mapping = {
        'REUNION': 'reunion',
        'CONFERENCE': 'conference',
        'SERVICE': 'service',
        'ACTIVITE': 'activite',
        'JPO': 'jpo',
        'AUTRES': 'autres'
    };
    return mapping[firstWord] || 'autres';
};

export const PERSON_STATUS_TYPES = [
    'Membre',
    'Eleve'
];

export const createPersonModel = (data = {}) => ({
    id: uuidv4(),
    name: '',
    phone: '',
    status: PERSON_STATUS_TYPES[0],
    dob: '',
    dateIntegration: '',
    dateDeparture: '',
    isJRs: false,
    image: '',
    isArchived: false,
    isDeleted: false,
    deletedAt: null,
    updatedAt: new Date().toISOString(),
    ...data
});

export const createActivityModel = (data = {}) => ({
    id: uuidv4(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: ACTIVITY_TYPES[0],
    notes: '',
    isDeleted: false,
    deletedAt: null,
    updatedAt: new Date().toISOString(),
    ...data
});
