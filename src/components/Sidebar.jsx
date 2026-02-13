import React from 'react';
import { Home, Users, Calendar, BarChart2, Settings, Sun, Moon, Shield, Trash2, Sparkles } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';

import logo from '../assets/logo.jpg';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all no-drag ${active ? 'active' : ''}`}
        style={{
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            width: '100%',
            textAlign: 'left',
            fontSize: '0.9rem',
            fontWeight: '500',
            backgroundColor: active ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
            color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: active ? '1px solid var(--accent-primary)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
        onMouseOut={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
        <Icon size={18} color={active ? 'var(--accent-primary)' : 'currentColor'} />
        <span>{label}</span>
    </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <div className="glass" style={{
            width: 'var(--sidebar-width)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px 20px 16px',
            borderRight: '1px solid var(--glass-border)',
            backgroundColor: 'var(--bg-secondary)',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ marginBottom: '40px', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    <img src={logo} alt="LRC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1.2' }}>
                        LRC STATS
                    </h1>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '2px' }}>
                        Command Center v4.6.0
                    </p>
                </div>
            </div>

            <nav style={{ flex: 1 }}>
                <SidebarItem
                    icon={Home}
                    label={t('sidebar.dashboard')}
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon={Users}
                    label={t('sidebar.directory')}
                    active={activeTab === 'people'}
                    onClick={() => setActiveTab('people')}
                />
                <SidebarItem
                    icon={Calendar}
                    label={t('sidebar.activities')}
                    active={activeTab === 'activities'}
                    onClick={() => setActiveTab('activities')}
                />
                <SidebarItem
                    icon={Sparkles}
                    label={t('sidebar.assistant')}
                    active={activeTab === 'assistant'}
                    onClick={() => setActiveTab('assistant')}
                />
                <SidebarItem
                    icon={BarChart2}
                    label={t('sidebar.stats')}
                    active={activeTab === 'stats'}
                    onClick={() => setActiveTab('stats')}
                />
                <SidebarItem
                    icon={Shield}
                    label={t('sidebar.history')}
                    active={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                />
                <SidebarItem
                    icon={Trash2}
                    label={t('sidebar.recycle_bin')}
                    active={activeTab === 'trash'}
                    onClick={() => setActiveTab('trash')}
                />
            </nav>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                    onClick={toggleTheme}
                    className="w-full transition-all no-drag"
                    style={{
                        padding: '12px 16px', borderRadius: '8px', width: '100%', textAlign: 'left',
                        fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    {theme === 'dark' ? <Sun size={18} color="var(--accent-primary)" /> : <Moon size={18} color="var(--accent-primary)" />}
                    <span>{theme === 'dark' ? t('common.light_mode', { defaultValue: 'Light Mode' }) : t('common.dark_mode', { defaultValue: 'Dark Mode' })}</span>
                </button>
                <SidebarItem
                    icon={Settings}
                    label={t('sidebar.settings')}
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </div>
        </div>
    );
};

export default Sidebar;
