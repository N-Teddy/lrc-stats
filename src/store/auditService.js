import { readTextFile, writeTextFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { v4 as uuidv4 } from 'uuid';

const AUDIT_FILE = 'audit_logs.json';

const getAuditPath = async () => {
    return await join('db', AUDIT_FILE);
};

export const auditService = {
    getUserIdentity: () => {
        const stored = localStorage.getItem('lrc_user_identity');
        return stored ? JSON.parse(stored) : null;
    },

    setUserIdentity: (name, email) => {
        const identity = { name, email, deviceId: auditService.getDeviceId() };
        localStorage.setItem('lrc_user_identity', JSON.stringify(identity));
        return identity;
    },

    getDeviceId: () => {
        let deviceId = localStorage.getItem('lrc_device_id');
        if (!deviceId) {
            deviceId = `DEV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            localStorage.setItem('lrc_device_id', deviceId);
        }
        return deviceId;
    },

    log: async (action, entityType, entityName, metadata = {}) => {
        try {
            const identity = auditService.getUserIdentity();
            const logEntry = {
                id: uuidv4(),
                action, // CREATE, UPDATE, DELETE, PDF_GEN, LOGIN
                entityType,
                entityName,
                timestamp: new Date().toISOString(),
                userName: identity?.name || 'Unknown',
                userEmail: identity?.email || 'Unknown',
                deviceId: auditService.getDeviceId(),
                ...metadata
            };

            // Save locally
            const path = await getAuditPath();
            let logs = [];
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                logs = JSON.parse(content);
            }

            logs.unshift(logEntry);

            // Keep only last 1000 logs locally
            if (logs.length > 1000) logs = logs.slice(0, 1000);

            await writeTextFile(path, JSON.stringify(logs, null, 2), { baseDir: BaseDirectory.AppData });

            // Note: Cloud sync will handle pushing these to Supabase
            return logEntry;
        } catch (err) {
            console.error('Audit Log Error:', err);
        }
    },

    getLogs: async () => {
        try {
            const path = await getAuditPath();
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            }
            return [];
        } catch (err) {
            console.error('Error reading logs:', err);
            return [];
        }
    }
};
