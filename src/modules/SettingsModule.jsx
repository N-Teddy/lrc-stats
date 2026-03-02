import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import pako from 'pako';
import { Settings, Shield, Cloud, Save, Download, Upload, Trash2, Bell, Eye, EyeOff, Palette, Check, Languages } from 'lucide-react';
import { useTheme, ACCENTS } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import { dataService } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { syncService } from '../store/syncService';
import { devService } from '../store/devService';

const SettingsModule = () => {
    const { theme, toggleTheme, accent, setAccent } = useTheme();
    const { t, i18n } = useTranslation();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(localStorage.getItem('lrc_last_sync') || 'Never');

    const handleCloudSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncService.sync();
            if (result.success) {
                setLastSync(localStorage.getItem('lrc_last_sync'));
                notificationService.notify(t('settings.sync_success'), t('settings.sync_success_msg'));
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error(err);
            notificationService.notify(t('settings.sync_failed_title'), t('settings.sync_failed', { error: err.message }), 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportBackup = async () => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const encryptionKey = localStorage.getItem('lrc_master_key') ||
                import.meta.env.VITE_SUPABASE_ANON_KEY ||
                await notificationService.prompt(t('settings.personalization'), t('settings.decrypt_prompt'), '********', '', 'password');
            if (!encryptionKey) return;

            const backup = { people, activities, attendance, version: '4.6.0', exportedAt: new Date().toISOString() };
            const jsonString = JSON.stringify(backup);

            // 1. Compress
            const compressed = pako.deflate(jsonString);
            const base64Compressed = btoa(String.fromCharCode.apply(null, compressed));

            // 2. Encrypt
            const encrypted = CryptoJS.AES.encrypt(base64Compressed, encryptionKey).toString();

            // 3. Add Header
            const finalPayload = `LRCV2_${encrypted}`;

            const blob = new Blob([finalPayload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LRC_Secure_Vault_${new Date().toISOString().split('T')[0]}.lrc`;
            a.click();

            notificationService.notify(t('settings.backup_created'), t('settings.backup_created_msg'));
        } catch (err) {
            console.error('Vault Export Error:', err);
            notificationService.notify(t('common.error'), t('settings.encryption_error'), 'error');
        }
    };

    const handleRestoreBackup = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawContent = e.target.result;
            let data;

            try {
                if (rawContent.startsWith('LRCV2_')) {
                    // SECURE DECRYPT FLOW
                    const encryptedData = rawContent.replace('LRCV2_', '');
                    const encryptionKey = localStorage.getItem('lrc_master_key') ||
                        import.meta.env.VITE_SUPABASE_ANON_KEY ||
                        await notificationService.prompt(t('settings.personalization'), t('settings.decrypt_prompt'), '********', '', 'password');

                    if (!encryptionKey) {
                        event.target.value = '';
                        return;
                    }

                    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
                    const base64Compressed = bytes.toString(CryptoJS.enc.Utf8);

                    if (!base64Compressed) throw new Error(t('settings.decrypt_failed'));

                    // Decompress
                    const compressed = new Uint8Array(atob(base64Compressed).split("").map(c => c.charCodeAt(0)));
                    const jsonString = pako.inflate(compressed, { to: 'string' });
                    data = JSON.parse(jsonString);
                } else {
                    // LEGACY JSON FLOW
                    if (!await notificationService.confirm(t('settings.restore_backup'), t('settings.restore_legacy_confirm'))) {
                        event.target.value = '';
                        return;
                    }
                    data = JSON.parse(rawContent);
                }

                if (!data.people || !data.activities || !data.attendance) {
                    throw new Error('Invalid vault structure. Missing core segments.');
                }

                // Final confirmation
                if (!await notificationService.confirm(t('settings.restore_backup'), t('settings.restore_confirm'))) {
                    event.target.value = '';
                    return;
                }

                await Promise.all([
                    dataService.savePeople(data.people),
                    dataService.saveActivities(data.activities),
                    dataService.saveAttendance(data.attendance)
                ]);

                notificationService.notify(t('settings.restore_success'), t('settings.restore_success_msg'));
                notificationService.notify(t('settings.restore_success'), t('settings.restore_reload'));
                setTimeout(() => window.location.reload(), 2000);
            } catch (err) {
                console.error('Vault Extraction Error:', err);
                notificationService.notify(t('common.error'), t('settings.restore_failed', { error: err.message }), 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleFactoryReset = async () => {
        if (await notificationService.confirm(t('settings.factory_reset'), t('settings.restore_confirm'))) {
            const secondConfirm = await notificationService.confirm(t('settings.factory_reset'), t('recycle_bin.empty_bin_confirm'));
            if (secondConfirm) {
                const result = await dataService.factoryReset();
                if (result.success) {
                    localStorage.removeItem('lrc_operation_mode');
                    notificationService.notify(t('settings.restore_success'), t('settings.restore_reload'));
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    notificationService.notify(t('common.error'), t('settings.restore_failed', { error: result.error }), 'error');
                }
            }
        }
    };

    const handleSwitchToProduction = async () => {
        const text = i18n.language.startsWith('fr')
            ? "Passer en PRODUCTION ? Toutes vos données de test seront effacées localement pour laisser place à vos vraies données du vault Supabase. Continuer ?"
            : "Switch to PRODUCTION? All test data will be wiped locally to make room for your real Supabase vault data. Continue?";

        if (await notificationService.confirm(t('settings.maintenance'), text)) {
            await devService.clearData();
            devService.setMode('PRODUCTION');
            notificationService.notify(t('settings.mode_updated'), t('settings.restore_reload'));
            setTimeout(() => window.location.reload(), 2000);
        }
    };

    const handleSwitchToSandbox = async () => {
        const text = i18n.language.startsWith('fr')
            ? "Activer le Mode BAC À SABLE ? Vos données locales actuelles (si non synchronisées) seront remplacées par le dataset de simulation. Supabase ne sera pas affecté. Continuer ?"
            : "Activate SANDBOX Mode? Your current local data (if not synced) will be replaced by the simulation dataset. Supabase will not be affected. Continue?";

        if (await notificationService.confirm(t('settings.maintenance'), text)) {
            await devService.clearData();
            devService.setMode('SANDBOX');
            await devService.generateSeed();
            notificationService.notify(t('settings.mode_updated'), t('settings.restore_reload'));
            setTimeout(() => window.location.reload(), 2000);
        }
    };

    const isSandbox = localStorage.getItem('lrc_operation_mode') === 'SANDBOX';

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{t('settings.title')}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{t('settings.subtitle')}</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Community & Data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Cloud size={22} color="var(--accent-primary)" /> {t('settings.community_sync')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                                    {i18n.language.startsWith('fr') ? 'Statut du Communal Vault' : 'Communal Vault Status'}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {i18n.language.startsWith('fr')
                                        ? 'Votre appareil est configuré pour se synchroniser avec le vault central sécurisé de la communauté.'
                                        : 'Your device is configured to synchronize with the community\'s secure central vault.'}
                                </p>
                            </div>

                            <button
                                onClick={handleCloudSync}
                                disabled={isSyncing}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '8px',
                                    backgroundColor: 'var(--accent-primary)', color: 'black',
                                    fontWeight: '800', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                {isSyncing ? t('settings.syncing') : <><Cloud size={20} /> {t('settings.sync_now')}</>}
                            </button>

                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('settings.last_sync')}: {lastSync}</p>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Save size={22} color="var(--accent-green)" /> {t('settings.data_management')}
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
                                    <p style={{ textAlign: 'left' }}>{t('settings.export_backup')}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>{t('settings.export_desc')}</p>
                                </div>
                            </button>

                            <label style={{ width: '100%', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}>
                                <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)' }}>
                                    <Upload size={18} color="var(--accent-primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ textAlign: 'left' }}>{t('settings.restore_backup')}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '400' }}>{t('settings.restore_desc')}</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".json,.lrc"
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
                            <Bell size={22} color="var(--accent-primary)" /> {t('settings.notifications')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700' }}>{t('settings.birthday_alerts')}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.birthday_alerts_desc')}</p>
                                </div>
                                <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--accent-primary)', borderRadius: '20px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontWeight: '700' }}>{t('settings.test_notification')}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('settings.test_notification_desc')}</p>
                                </div>
                                <button
                                    onClick={() => notificationService.notify('Test LRC Stats', 'Ceci est une notification de test.')}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', backgroundColor: 'transparent', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    TEST
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Palette size={22} color="var(--accent-primary)" /> {t('settings.personalization')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>{t('settings.accent_theme')}</label>
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
                                    <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{t('settings.lab_mode')}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('settings.lab_mode_desc')}</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    style={{
                                        padding: '6px 16px', borderRadius: '20px', backgroundColor: theme === 'light' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                        color: theme === 'light' ? 'black' : 'var(--text-primary)', fontSize: '0.75rem', fontWeight: '800', border: '1px solid var(--border-color)'
                                    }}
                                >
                                    {theme === 'light' ? t('settings.enabled') : t('settings.disabled')}
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Languages size={14} /> {t('settings.language')}
                                </label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => i18n.changeLanguage('en')}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '8px',
                                            backgroundColor: i18n.language.startsWith('en') ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-tertiary)',
                                            border: i18n.language.startsWith('en') ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            color: i18n.language.startsWith('en') ? 'var(--accent-primary)' : 'var(--text-primary)',
                                            fontWeight: '800', fontSize: '0.85rem'
                                        }}
                                    >
                                        {t('settings.english')}
                                    </button>
                                    <button
                                        onClick={() => i18n.changeLanguage('fr')}
                                        style={{
                                            flex: 1, padding: '12px', borderRadius: '8px',
                                            backgroundColor: i18n.language.startsWith('fr') ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-tertiary)',
                                            border: i18n.language.startsWith('fr') ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                            color: i18n.language.startsWith('fr') ? 'var(--accent-primary)' : 'var(--text-primary)',
                                            fontWeight: '800', fontSize: '0.85rem'
                                        }}
                                    >
                                        {t('settings.french')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4d' }}>
                            <Shield size={22} color="#ff4d4d" /> {t('settings.maintenance')}
                        </h3>

                        {/* Operational Mode Switcher */}
                        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: isSandbox ? 'rgba(255, 170, 0, 0.05)' : 'rgba(57, 255, 20, 0.05)', border: `1px dashed ${isSandbox ? '#ffaa00' : 'var(--accent-green)'}` }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '800', color: isSandbox ? '#ffaa00' : 'var(--accent-green)', marginBottom: '4px' }}>
                                {isSandbox ? 'ACTUEL: MODE BAC À SABLE' : 'ACTUEL: MODE PRODUCTION'}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                {isSandbox
                                    ? (i18n.language.startsWith('fr') ? "Vous utilisez des données de simulation. La synchro cloud est désactivée." : "Using simulated data. Cloud sync is disabled.")
                                    : (i18n.language.startsWith('fr') ? "Connecté au Vault Supabase. Synchro cloud active." : "Connected to Supabase Vault. Cloud sync active.")
                                }
                            </p>
                            <button
                                onClick={isSandbox ? handleSwitchToProduction : handleSwitchToSandbox}
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '8px',
                                    backgroundColor: isSandbox ? 'var(--accent-primary)' : 'rgba(255, 170, 0, 0.1)',
                                    color: isSandbox ? 'black' : '#ffaa00',
                                    border: isSandbox ? 'none' : '1px solid #ffaa00',
                                    fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer'
                                }}
                            >
                                {isSandbox
                                    ? (i18n.language.startsWith('fr') ? "PASSER EN PRODUCTION" : "SWITCH TO PRODUCTION")
                                    : (i18n.language.startsWith('fr') ? "REPASSER EN BAC À SABLE" : "BACK TO SANDBOX")
                                }
                            </button>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('settings.maintenance_desc')}</p>
                        <button
                            onClick={handleFactoryReset}
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ff4d4d', color: '#ff4d4d', backgroundColor: 'transparent', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            <Trash2 size={16} /> {t('settings.factory_reset')}
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
