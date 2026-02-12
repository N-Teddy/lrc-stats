import React from 'react';
import { Home, Users, Calendar, BarChart2, Settings, LogOut, Sun, Moon, History, Trash2 } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

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
            backgroundColor: active ? 'var(--bg-secondary)' : 'transparent',
            color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            cursor: 'pointer'
        }}
        onMouseOver={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseOut={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-secondary)'; }}
    >
        <Icon size={18} color={active ? 'var(--accent-primary)' : 'currentColor'} />
        <span>{label}</span>
    </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="glass" style={{
            width: 'var(--sidebar-width)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 16px 20px 16px',
            borderRight: '1px solid var(--glass-border)'
        }}>
            <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
                <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px' }}>
                    LRC STATS
                </h1>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
                    Command Center v3.0.0
                </p>
            </div>

            <nav style={{ flex: 1 }}>
                <SidebarItem
                    icon={Home}
                    label="Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon={Users}
                    label="People"
                    active={activeTab === 'people'}
                    onClick={() => setActiveTab('people')}
                />
                <SidebarItem
                    icon={Calendar}
                    label="Activities"
                    active={activeTab === 'activities'}
                    onClick={() => setActiveTab('activities')}
                />
                <SidebarItem
                    icon={BarChart2}
                    label="Statistics"
                    active={activeTab === 'stats'}
                    onClick={() => setActiveTab('stats')}
                />
                <SidebarItem
                    icon={History}
                    label="Logs"
                    active={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                />
                <SidebarItem
                    icon={Trash2}
                    label="Recycle Bin"
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
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <SidebarItem
                    icon={Settings}
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                />
            </div>
        </div>
    );
};

export default Sidebar;
