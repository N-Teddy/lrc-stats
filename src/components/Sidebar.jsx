import React from 'react';
import { Home, Users, Calendar, BarChart2, Settings, LogOut } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all no-drag ${active
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
            }`}
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
            fontWeight: '500'
        }}
    >
        <Icon size={18} color={active ? 'var(--accent-cyan)' : 'currentColor'} />
        <span>{label}</span>
    </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
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
                    Management v1.0
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
            </nav>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
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
