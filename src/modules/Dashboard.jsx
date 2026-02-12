import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Activity, TrendingUp, Download, CheckCircle, Clock, Cake, Gift, Layout, Move, Eye, EyeOff, Save, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import { useTheme } from '../store/ThemeContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { convertFileSrc } from '@tauri-apps/api/core';

// --- Dashboard Widgets Components ---

const StatCard = ({ icon: Icon, label, value, trend, color, subtext }) => (
    <div className="glass hover-glow" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px',
            background: `radial-gradient(circle, rgba(${color}, 0.15) 0%, transparent 70%)`, zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: '16px', border: '1px solid var(--border-color)', color: `rgb(${color})` }}>
                <Icon size={20} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{label}</p>
            <p style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '4px', letterSpacing: '-1px' }}>{value}</p>
            {subtext && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtext}</p>}
        </div>
    </div>
);

const PresenceChart = ({ data, filter, onFilterChange }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{payload[0].value} Attendees</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{payload[0].payload.date}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-color)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Engagement Dynamics</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attendance volume over recent activities</p>
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {['all', 'membres', 'eleves', 'jrs'].map(f => (
                        <button
                            key={f}
                            onClick={() => onFilterChange(f)}
                            style={{
                                padding: '6px 12px', borderRadius: '4px', border: 'none',
                                backgroundColor: filter === f ? 'var(--bg-secondary)' : 'transparent',
                                color: filter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                                fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="count" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const ActivityHub = ({ items }) => (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', height: '100%' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recent Activity Hub</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.length > 0 ? items.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{act.name}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.date}</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{act.count}</span>
                </div>
            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No activities logged.</p>}
        </div>
    </div>
);

const BirthdayWatch = ({ people, onViewAll }) => (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.05) 0%, transparent 100%)', border: '1px solid rgba(255, 170, 0, 0.2)', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: '#ffaa00' }}>Birthday Watch</h3>
            <Cake size={16} color="#ffaa00" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {people.slice(0, 3).map((p, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.image ? <img src={p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : convertFileSrc(p.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Gift size={16} color="var(--text-muted)" />}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{p.name}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.dob?.substring(5)}</p>
                    </div>
                </div>
            ))}
            {people.length > 0 && (
                <button onClick={onViewAll} style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800' }}>View All Celebrations</button>
            )}
        </div>
    </div>
);

// --- Main Dashboard Component ---

const Dashboard = () => {
    const { accent } = useTheme();
    const [stats, setStats] = useState({
        membres: 0, eleves: 0, jrs: 0, total: 0, activitiesCount: 0, avgAttendance: 0,
        recentAttendance: [], birthdays: []
    });
    const [allData, setAllData] = useState({ people: [], activities: [], attendance: [] });
    const [trendFilter, setTrendFilter] = useState('all');
    const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Layout State: Each object defines a widget's ID, visibility, and grid position
    const [layout, setLayout] = useState(() => {
        const saved = localStorage.getItem('dashboard-layout-v3');
        return saved ? JSON.parse(saved) : [
            { id: 'stats-grid', visible: true },
            { id: 'engagement-chart', visible: true },
            { id: 'activity-hub', visible: true },
            { id: 'birthday-watch', visible: true }
        ];
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);
        const jrs = activePeople.filter(p => p.isJRs).length;
        const membres = activePeople.filter(p => p.status === 'Membre').length;
        const eleves = activePeople.filter(p => p.status === 'Eleve').length;

        const totalAttendance = attendance.reduce((sum, entry) => sum + (entry.count || 0), 0);
        const avg = attendance.length > 0 ? Math.round(totalAttendance / attendance.length) : 0;

        const currentMonth = new Date().getMonth();
        const monthlyBirthdays = activePeople.filter(p => p.dob && new Date(p.dob).getMonth() === currentMonth);

        setStats({
            membres, eleves, jrs, total: activePeople.length,
            activitiesCount: activities.length, avgAttendance: avg,
            recentAttendance: attendance.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7),
            birthdays: monthlyBirthdays
        });
        setAllData({ people: activePeople, activities, attendance });
    };

    const chartData = useMemo(() => {
        if (!stats.recentAttendance.length) return [];
        return stats.recentAttendance.map(a => {
            let count = a.count;
            if (trendFilter !== 'all') {
                const attendees = allData.people.filter(p => a.personIds.includes(p.id));
                if (trendFilter === 'membres') count = attendees.filter(p => (p.status || 'Membre') === 'Membre').length;
                if (trendFilter === 'eleves') count = attendees.filter(p => p.status === 'Eleve').length;
                if (trendFilter === 'jrs') count = attendees.filter(p => p.isJRs).length;
            }
            return {
                name: a.activityName.length > 8 ? a.activityName.substring(0, 6) + '...' : a.activityName,
                count, date: a.date
            };
        });
    }, [stats.recentAttendance, trendFilter, allData.people]);

    const moveWidget = (index, direction) => {
        const newLayout = [...layout];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newLayout.length) return;
        [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
        setLayout(newLayout);
    };

    const toggleVisibility = (id) => {
        setLayout(layout.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
    };

    const saveLayout = () => {
        localStorage.setItem('dashboard-layout-v3', JSON.stringify(layout));
        setIsEditMode(false);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Command Center</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Tactical Mission Hub • Phase 4 Operational</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={() => isEditMode ? saveLayout() : setIsEditMode(true)}
                        className="glass"
                        style={{
                            padding: '10px 20px', borderRadius: 'var(--radius-md)', fontWeight: '800',
                            display: 'flex', alignItems: 'center', gap: '10px', color: isEditMode ? 'var(--accent-green)' : 'var(--text-primary)',
                            borderColor: isEditMode ? 'var(--accent-green)' : 'var(--border-color)'
                        }}
                    >
                        {isEditMode ? <><Save size={18} /> SAVE LAYOUT</> : <><Layout size={18} /> CUSTOMIZE</>}
                    </button>
                    {!isEditMode && (
                        <div className="glass" style={{ padding: '8px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase' }}>System Nominal</span>
                        </div>
                    )}
                </div>
            </header>

            {isEditMode && (
                <div className="glass animate-in" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '32px', border: '1px solid var(--accent-primary)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Move size={18} /> Rearrange Modular Widgets
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {layout.map((widget, idx) => (
                            <div key={widget.id} style={{
                                backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)'
                            }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: widget.visible ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    {widget.id.replace('-', ' ').toUpperCase()}
                                </span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => toggleVisibility(widget.id)} style={{ color: widget.visible ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                        {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button onClick={() => moveWidget(idx, -1)} disabled={idx === 0}><ChevronUp size={16} /></button>
                                    <button onClick={() => moveWidget(idx, 1)} disabled={idx === layout.length - 1}><ChevronDown size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {layout.filter(w => w.visible).map((widget) => {
                    switch (widget.id) {
                        case 'stats-grid':
                            return (
                                <div key="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                    <StatCard icon={Users} label="Membres" value={stats.membres} color="0, 210, 255" subtext="Permanent Assets" />
                                    <StatCard icon={Users} label="Eleves" value={stats.eleves} color="121, 40, 202" subtext="Probationary" />
                                    <StatCard icon={Activity} label="JRs Group" value={stats.jrs} color="57, 255, 20" subtext="Active Segment" />
                                    <StatCard icon={Calendar} label="Operations" value={stats.activitiesCount} color="0, 112, 243" subtext={`Average: ${stats.avgAttendance}`} />
                                </div>
                            );
                        case 'engagement-chart':
                            return (
                                <div key="engagement-chart" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                    <PresenceChart data={chartData} filter={trendFilter} onFilterChange={setTrendFilter} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <ActivityHub items={stats.recentAttendance.slice(-3).reverse()} />
                                    </div>
                                </div>
                            );
                        case 'activity-hub':
                            // Integrated above in V3 style, but we can add more logic here if needed
                            return null;
                        case 'birthday-watch':
                            return (
                                <div key="birthday-watch" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <BirthdayWatch people={stats.birthdays} onViewAll={() => setIsBirthdayModalOpen(true)} />
                                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '4px' }}>TACTICAL AUDITS</h3>
                                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                            <button
                                                onClick={() => reportService.generateYearlyReport()}
                                                style={{ flex: 1, padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', justifyContent: 'center', fontSize: '0.85rem' }}
                                            >
                                                <Download size={16} color="var(--accent-primary)" /> Yearly
                                            </button>
                                            <button
                                                onClick={() => reportService.generateAllActivitiesReport()}
                                                style={{ flex: 1, padding: '14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', justifyContent: 'center', fontSize: '0.85rem' }}
                                            >
                                                <Clock size={16} color="var(--accent-green)" /> Master Log
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>

            {isBirthdayModalOpen && (
                <div onClick={() => setIsBirthdayModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div onClick={e => e.stopPropagation()} className="glass" style={{ width: '600px', maxHeight: '80vh', padding: '40px', borderRadius: 'var(--radius-lg)', overflowY: 'auto' }}>
                        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <Cake size={48} color="#ffaa00" style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>Month of Celebration</h2>
                        </header>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {stats.birthdays.map((p, idx) => (
                                <div key={idx} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ffaa00' }}>
                                        {p.image ? <img src={p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : convertFileSrc(p.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} />}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '800' }}>{p.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#ffaa00' }}>{p.dob}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsBirthdayModalOpen(false)} style={{ width: '100%', padding: '14px', marginTop: '32px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', fontWeight: '800' }}>CLOSE</button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
