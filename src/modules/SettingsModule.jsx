import React, { useState } from 'react';
import { Settings, Shield, Cloud, Save, Download, Upload, Trash2, Bell, Eye, EyeOff, Palette, Check } from 'lucide-react';
import { useTheme, ACCENTS } from '../store/ThemeContext';
import { dataService } from '../store/dataService';
import { notificationService } from '../store/notificationService';

const SettingsModule = () => {
    const { theme, toggleTheme, accent, setAccent } = useTheme();
    const [syncUrl, setSyncUrl] = useState(localStorage.getItem('lrc_sync_url') || '');
    const [syncToken, setSyncToken] = useState(localStorage.getItem('lrc_sync_token') || '');
    const [showToken, setShowToken] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(localStorage.getItem('lrc_last_sync') || 'Never');

    const handleSaveCloudConfig = () => {
        localStorage.setItem('lrc_sync_url', syncUrl);
        localStorage.setItem('lrc_sync_token', syncToken);
        alert('Cloud Configuration saved.');
    };

    const handleCloudSync = async () => {
        if (!syncUrl) return alert('Please provide a Sync URL first.');
        setIsSyncing(true);
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const payload = { people, activities, attendance, timestamp: Date.now() };

            const response = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${syncToken}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const now = new Date().toLocaleString();
                setLastSync(now);
                localStorage.setItem('lrc_last_sync', now);
                alert('Cloud Sync successful!');
            } else {
                throw new Error(`Server responded with ${response.status}`);
            }
        } catch (err) {
            console.error(err);
            alert(`Sync Failed: ${err.message}. Ensure your private storage endpoint is active.`);
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
        const backup = { people, activities, attendance, version: '3.0.0' };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LRC_Stats_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        notificationService.notify('Backup Created', 'Local system backup has been exported successfully.');
    };

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>System Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Configuration, precision audits, and data synchronization.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Cloud & Data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Cloud size={22} color="var(--accent-primary)" /> Cloud Synchronisation
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Private Sync EndPoint (URL)</label>
                                <input
                                    value={syncUrl} onChange={(e) => setSyncUrl(e.target.value)}
                                    placeholder="https://your-storage.com/api/sync"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Security Access Token</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showToken ? 'text' : 'password'}
                                        value={syncToken} onChange={(e) => setSyncToken(e.target.value)}
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
                                <div>
                                    <p style={{ textAlign: 'left' }}>Export Local Backup</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>Save a snapshot of all data as JSON</p>
                                </div>
                            </button>
                            <button
                                style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)', fontWeight: '700', opacity: 0.6 }}
                            >
                                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)' }}>
                                    <Upload size={18} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <p style={{ textAlign: 'left' }}>Restore from File</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>Coming soon in build 2.1.0</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System & Polish */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={22} color="var(--accent-primary)" /> System Notifications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700' }}>Birthday Alerts</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notify on app launch if there is a birthday.</p>
                                </div>
                                <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--accent-primary)', borderRadius: '20px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700' }}>Activity Reminders</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scheduled alerts for periodic operations.</p>
                                </div>
                                <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ position: 'absolute', left: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'var(--text-muted)', borderRadius: '50%' }} />
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
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>Tactical Accent Overlays</label>
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
                                    <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Light Mode Alpha</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enable high-contrast laboratory theme.</p>
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
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Resetting the system database is an IRREVERSIBLE action. Ensure you have a backup.</p>
                        <button
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ff4d4d', color: '#ff4d4d', backgroundColor: 'transparent', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.05)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
