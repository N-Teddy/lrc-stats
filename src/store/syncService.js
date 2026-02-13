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
        const url = localStorage.getItem('lrc_bin_id'); // We'll repurpose this for Supabase URL
        const key = localStorage.getItem('lrc_master_key'); // We'll repurpose this for Anon Key

        if (url && key && url.includes('supabase.co')) {
            this.supabase = createClient(url, key);
        }
    }

    async sync() {
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
            const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
            newObj[camelKey] = obj[key];
        }
        return newObj;
    }

    toSnakeCase(obj) {
        const newObj = {};
        for (let key in obj) {
            if (key === 'syncedAt') continue; // Don't push this to DB
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[snakeKey] = obj[key];
        }
        return newObj;
    }
}

export const syncService = new SyncService();
