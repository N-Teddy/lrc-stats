import React, { useState } from 'react';
import { Settings, Shield, Cloud, Save, Download, Upload, Trash2, Bell, Eye, EyeOff, Palette, Check } from 'lucide-react';
import { useTheme, ACCENTS } from '../store/ThemeContext';
import { dataService } from '../store/dataService';
import { notificationService } from '../store/notificationService';

const SettingsModule = () => {
    const { theme, toggleTheme, accent, setAccent } = useTheme();
    const [binId, setBinId] = useState(localStorage.getItem('lrc_bin_id') || '');
    const [masterKey, setMasterKey] = useState(localStorage.getItem('lrc_master_key') || '');
    const [showToken, setShowToken] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(localStorage.getItem('lrc_last_sync') || 'Never');

    const handleSaveCloudConfig = () => {
        localStorage.setItem('lrc_bin_id', binId);
        localStorage.setItem('lrc_master_key', masterKey);
        alert('Community Sync Configuration saved.');
    };

    const handleCloudSync = async () => {
        if (!binId) return alert('Please provide a Bin ID first.');
        setIsSyncing(true);
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const payload = { people, activities, attendance, timestamp: Date.now() };

            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey,
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const now = new Date().toLocaleString();
                setLastSync(now);
                localStorage.setItem('lrc_last_sync', now);
                notificationService.notify('Sync Successful', 'Community records have been updated.');
            } else {
                const errData = await response.json();
                throw new Error(errData.message || `Server responded with ${response.status}`);
            }
        } catch (err) {
            console.error(err);
            alert(`Sync Failed: ${err.message}. Ensure your Bin ID and Master Key are correct.`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportBackup = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);
        const backup = { people, activities, attendance, version: '4.0.0' };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LRC_Community_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        notificationService.notify('Backup Created', 'Community records have been exported successfully.');
    };

    const handleRestoreBackup = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!window.confirm('WARNING: This will overwrite ALL current local records with data from the backup file. This cannot be undone. Proceed?')) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.people || !data.activities || !data.attendance) {
                    throw new Error('Invalid backup format. Missing required data segments.');
                }

                // Overwrite local databases
                await Promise.all([
                    dataService.savePeople(data.people),
                    dataService.saveActivities(data.activities),
                    dataService.saveAttendance(data.attendance)
                ]);

                notificationService.notify('Restore Successful', 'Community records have been restored.');
                alert('Database Restored Successfully. The application will now reload.');
                window.location.reload();
            } catch (err) {
                console.error('Extraction Error:', err);
                alert(`Restore Failed: ${err.message}`);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>System Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Configuration, community sync, and record preservation.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Community & Data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Cloud size={22} color="var(--accent-primary)" /> Community Synchronisation
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Community Bin ID</label>
                                <input
                                    value={binId} onChange={(e) => setBinId(e.target.value)}
                                    placeholder="e.g. 64e..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>X-Master-Key (Secret)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showToken ? 'text' : 'password'}
                                        value={masterKey} onChange={(e) => setMasterKey(e.target.value)}
                                        placeholder="Your secret key"
                                        style={{ width: '100%', padding: '12px 40px 12px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    />
                                    <button
                                        onClick={() => setShowToken(!showToken)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                                    >
                                        {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button
                                    onClick={handleSaveCloudConfig}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontWeight: '700', fontSize: '0.85rem' }}
                                >
                                    Save Config
                                </button>
                                <button
                                    onClick={handleCloudSync}
                                    disabled={isSyncing}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {isSyncing ? 'Syncing...' : <><Cloud size={16} /> Sync Now</>}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Last successful sync: {lastSync}</p>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Save size={22} color="var(--accent-green)" /> Local Data Management
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={handleExportBackup}
                                style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)', fontWeight: '700' }}
                            >
                                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(57, 255, 20, 0.1)' }}>
                                    <Download size={18} color="var(--accent-green)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ textAlign: 'left' }}>Export Group Backup</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>Save a snapshot of all community data</p>
                                </div>
                            </button>

                            <label style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}>
                                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)' }}>
                                    <Upload size={18} color="var(--accent-primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ textAlign: 'left' }}>Restore from File</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>Import records from a backup JSON</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleRestoreBackup}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={22} color="var(--accent-primary)" /> System Notifications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700' }}>Birthday Alerts</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notify on app launch for birthdays.</p>
                                </div>
                                <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--accent-primary)', borderRadius: '20px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Palette size={22} color="var(--accent-primary)" /> Personalization
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>Community Accent Theme</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    {Object.entries(ACCENTS).map(([key, data]) => (
                                        <button
                                            key={key}
                                            onClick={() => setAccent(key)}
                                            style={{
                                                padding: '16px 8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)',
                                                border: `1px solid ${accent === key ? data.color : 'var(--border-color)'}`,
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                                transition: 'all 0.2s ease', position: 'relative'
                                            }}
                                        >
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: data.color, boxShadow: accent === key ? `0 0 15px ${data.color}88` : 'none' }} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: accent === key ? 'var(--text-primary)' : 'var(--text-muted)' }}>{data.name.toUpperCase()}</span>
                                            {accent === key && <Check size={12} style={{ position: 'absolute', top: '8px', right: '8px', color: data.color }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Laboratory Mode</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Switch to the light community theme.</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '6px 16px', borderRadius: '20px', backgroundColor: theme === 'light' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                        color: theme === 'light' ? 'black' : 'var(--text-primary)', fontSize: '0.75rem', fontWeight: '800', border: '1px solid var(--border-color)'
                                    }}
                                >
                                    {theme === 'light' ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4d' }}>
                            <Shield size={22} /> Advanced Maintenance
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Resetting the community system is IRREVERSIBLE.</p>
                        <button
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ff4d4d', color: '#ff4d4d', backgroundColor: 'transparent', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Trash2 size={16} /> FACTORY SYSTEM RESET
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default SettingsModule;
