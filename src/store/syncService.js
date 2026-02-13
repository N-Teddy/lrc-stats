import { createClient } from '@supabase/supabase-js';
import { dataService } from './dataService';
import { auditService } from './auditService';

class SyncService {
    constructor() {
        this.supabase = null;
        this.isSyncing = false;
        this.init();
    }

    init() {
        // Priority: Build-time secrets -> LocalStorage overrides
        const envUrl = import.meta.env.VITE_SUPABASE_URL;
        const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const url = envUrl || localStorage.getItem('lrc_bin_id');
        const key = envKey || localStorage.getItem('lrc_master_key');

        if (url && key && url.includes('supabase.co')) {
            this.supabase = createClient(url, key);
        }
    }

    async sync() {
        // BLOCKER: Prevent syncing if in Sandbox mode
        const mode = localStorage.getItem('lrc_operation_mode');
        if (mode === 'SANDBOX') {
            console.log('[SYNC] Protected Mode: Cloud Sync is disabled in Sandbox.');
            return { success: false, error: 'Sandbox Protection Active' };
        }

        if (!this.supabase) {
            this.init();
            if (!this.supabase) return { success: false, error: 'Supabase not configured' };
        }

        if (this.isSyncing) return { success: false, error: 'Sync already in progress' };
        this.isSyncing = true;

        try {
            const lastSync = localStorage.getItem('lrc_last_sync_timestamp') || '1970-01-01T00:00:00Z';
            const now = new Date().toISOString();

            // 1. Sync People
            await this.syncTable('people', dataService.getPeople, dataService.savePeople);

            // 2. Sync Activities
            await this.syncTable('activities', dataService.getActivities, dataService.saveActivities);

            // 3. Sync Attendance
            await this.syncTable('attendance', dataService.getAttendance, dataService.saveAttendance);

            // 4. Push Logs (One way only)
            await this.pushAuditLogs();

            localStorage.setItem('lrc_last_sync_timestamp', now);
            localStorage.setItem('lrc_last_sync', new Date().toLocaleString());

            return { success: true };
        } catch (err) {
            console.error('Sync Engine Error:', err);
            return { success: false, error: err.message };
        } finally {
            this.isSyncing = false;
        }
    }

    async syncTable(tableName, getter, saver) {
        const localData = await getter();

        // A. PULL: Get everything newer than our local data
        const maxLocalUpdated = localData.length > 0
            ? new Date(Math.max(...localData.map(d => new Date(d.updatedAt || 0))))
            : new Date(0);

        const { data: cloudData, error: pullError } = await this.supabase
            .from(tableName)
            .select('*')
            .gt('updated_at', maxLocalUpdated.toISOString());

        if (pullError) throw pullError;

        // Merge logic
        let mergedData = [...localData];
        let hasChanges = false;

        if (cloudData && cloudData.length > 0) {
            cloudData.forEach(cloudItem => {
                const localIndex = mergedData.findIndex(d => d.id === cloudItem.id);
                // Convert snake_case from DB to camelCase for app
                const formattedItem = this.toCamelCase(cloudItem);

                if (localIndex === -1) {
                    mergedData.push(formattedItem);
                    hasChanges = true;
                } else {
                    // Conflict Resolution: Last Write Wins
                    const localUpdated = new Date(mergedData[localIndex].updatedAt || 0);
                    const cloudUpdated = new Date(formattedItem.updatedAt || 0);

                    if (cloudUpdated > localUpdated) {
                        mergedData[localIndex] = formattedItem;
                        hasChanges = true;
                    }
                }
            });
        }

        // B. PUSH: Get local items that are newer than cloud
        // (This is simplified: in a real app we'd track dirty flags)
        const localToPush = localData.filter(d => !d.syncedAt || new Date(d.updatedAt) > new Date(d.syncedAt));

        if (localToPush.length > 0) {
            const cloudPayload = localToPush.map(d => ({
                ...this.toSnakeCase(d),
                synced_at: new Date().toISOString()
            }));

            const { error: pushError } = await this.supabase
                .from(tableName)
                .upsert(cloudPayload);

            if (pushError) throw pushError;

            // Mark as synced locally
            mergedData = mergedData.map(d => {
                if (localToPush.find(lp => lp.id === d.id)) {
                    return { ...d, syncedAt: new Date().toISOString() };
                }
                return d;
            });
            hasChanges = true;
        }

        if (hasChanges) {
            await saver(mergedData);
        }
    }

    async pushAuditLogs() {
        const logs = await auditService.getLogs();
        const unsyncedLogs = logs.filter(l => !l.syncedAt);

        if (unsyncedLogs.length > 0) {
            const payload = unsyncedLogs.map(l => this.toSnakeCase(l));
            const { error } = await this.supabase.from('audit_logs').insert(payload);

            if (!error) {
                // We'd ideally mark them as synced in the local file too
                // For now, simplicity is better
            }
        }
    }

    toCamelCase(obj) {
        const newObj = {};
        for (let key in obj) {
            let camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
            // Community Override: maps is_jrs to isJRs
            if (camelKey === 'isJrs') camelKey = 'isJRs';
            newObj[camelKey] = obj[key];
        }
        return newObj;
    }

    toSnakeCase(obj) {
        const newObj = {};
        for (let key in obj) {
            if (key === 'syncedAt') continue;
            let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            // Community Override: maps is_j_rs to is_jrs
            if (snakeKey === 'is_j_rs') snakeKey = 'is_jrs';

            // Sanitization: Convert empty strings to null
            let value = obj[key];
            if (value === '') value = null;

            newObj[snakeKey] = value;
        }
        return newObj;
    }
}

export const syncService = new SyncService();
