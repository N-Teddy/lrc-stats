import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, Download, CheckCircle, Clock, Cake, Gift } from 'lucide-react';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { convertFileSrc } from '@tauri-apps/api/core';

const StatCard = ({ icon: Icon, label, value, trend, color, subtext }) => (
    <div className="glass hover-glow" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s ease' }}>
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

const Dashboard = () => {
    const [stats, setStats] = useState({
        membres: 0,
        eleves: 0,
        jrs: 0,
        total: 0,
        activitiesCount: 0,
        avgAttendance: 0,
        recentAttendance: [],
        birthdays: []
    });
    const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
    const [trendFilter, setTrendFilter] = useState('all'); // all, membres, eleves, jrs
    const [allData, setAllData] = useState({ people: [], activities: [], attendance: [] });

    useEffect(() => {
        async function loadStats() {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const activePeople = people.filter(p => !p.isArchived);
            const jrs = activePeople.filter(p => p.isJRs).length;
            const membres = activePeople.filter(p => p.status === 'Membre').length;
            const eleves = activePeople.filter(p => p.status === 'Eleve').length;

            // Calculate Average Attendance
            const totalAttendanceRecords = attendance.reduce((sum, entry) => sum + (entry.count || 0), 0);
            const avg = attendance.length > 0 ? Math.round(totalAttendanceRecords / attendance.length) : 0;

            // Prepare Chart Data (Last 7 activities)
            const chartData = attendance
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(-7)
                .map(a => ({
                    name: a.activityName.length > 10 ? a.activityName.substring(0, 8) + '...' : a.activityName,
                    count: a.count,
                    date: a.date
                }));

            // 4. Calculate Birthdays this month
            const currentMonth = new Date().getMonth();
            const monthlyBirthdays = activePeople.filter(p => {
                if (!p.dob) return false;
                const dob = new Date(p.dob);
                return dob.getMonth() === currentMonth;
            });

            setStats({
                membres, eleves, jrs,
                total: activePeople.length,
                activitiesCount: activities.length,
                avgAttendance: avg,
                recentAttendance: chartData,
                birthdays: monthlyBirthdays
            });

            setAllData({ people: activePeople, activities, attendance });
        }
        loadStats();
    }, []);

    // Memoized filtered chart data
    const filteredChartData = React.useMemo(() => {
        if (!allData.attendance.length) return [];

        return allData.attendance
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7)
            .map(a => {
                let count = a.count;
                if (trendFilter !== 'all') {
                    const attendees = allData.people.filter(p => a.personIds.includes(p.id));
                    if (trendFilter === 'membres') count = attendees.filter(p => (p.status || 'Membre') === 'Membre').length;
                    if (trendFilter === 'eleves') count = attendees.filter(p => p.status === 'Eleve').length;
                    if (trendFilter === 'jrs') count = attendees.filter(p => p.isJRs).length;
                }

                return {
                    name: a.activityName.length > 10 ? a.activityName.substring(0, 8) + '...' : a.activityName,
                    count,
                    date: a.date
                };
            });
    }, [allData, trendFilter]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{payload[0].value} Attendees</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{payload[0].payload.date}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Command Center</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Pulse of Operations • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass" style={{ padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-primary)' }}>System Nominal</span>
                    </div>
                    <div className="glass" style={{ padding: '8px 20px', borderRadius: '30px', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>Network Strength: {Math.min(100, (stats.total / 100) * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="animate-in stagger-1">
                    <StatCard
                        icon={Users}
                        label="Membres"
                        value={stats.membres}
                        color="0, 210, 255"
                        subtext="Permanent Members"
                    />
                </div>
                <div className="animate-in stagger-2">
                    <StatCard
                        icon={Users}
                        label="Eleves"
                        value={stats.eleves}
                        color="121, 40, 202"
                        subtext="Probationary / Students"
                    />
                </div>
                <div className="animate-in stagger-3">
                    <StatCard
                        icon={Activity}
                        label="Jeunes (JRs)"
                        value={stats.jrs}
                        color="57, 255, 20"
                        subtext="Rosicrucian Youth"
                    />
                </div>
                <div className="animate-in stagger-4">
                    <StatCard
                        icon={Calendar}
                        label="Operations"
                        value={stats.activitiesCount}
                        color="0, 112, 243"
                        subtext={`Avg. Attendance: ${stats.avgAttendance}`}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {/* Main Presence Chart */}
                <div className="glass animate-in stagger-2" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Engagement Dynamics</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attendance volume over recent activities</p>
                        </div>
                        <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            {['all', 'membres', 'eleves', 'jrs'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setTrendFilter(f)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '4px', border: 'none',
                                        backgroundColor: trendFilter === f ? 'var(--bg-secondary)' : 'transparent',
                                        color: trendFilter === f ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                        fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                        {filteredChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={filteredChartData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--accent-cyan)"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Awaiting operational data to generate analytics.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Performance & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass animate-in stagger-3" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                            Recent Activity Hub
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.recentAttendance.length > 0 ? stats.recentAttendance.slice(-3).reverse().map((act, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{act.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.date}</p>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{act.count}</span>
                                </div>
                            )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No activities logged yet.</p>}
                        </div>
                    </div>

                    {/* Birthday Watch Widget */}
                    <div className="glass animate-in stagger-3" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.05) 0%, transparent 100%)', border: '1px solid rgba(255, 170, 0, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffaa00' }}>
                                Birthday Watch
                            </h3>
                            <Cake size={16} color="#ffaa00" />
                        </div>

                        {stats.birthdays.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {stats.birthdays.slice(0, 3).map((p, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {p.image ? <img src={p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : convertFileSrc(p.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Gift size={16} color="var(--text-muted)" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{p.name}</p>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.dob?.substring(5)}</p>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setIsBirthdayModalOpen(true)}
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', backgroundColor: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    View All Celebrations
                                </button>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No birthdays this month.</p>
                        )}
                    </div>

                    <div className="glass animate-in stagger-4" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.05) 0%, transparent 100%)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '16px' }}>Network Utilities</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => reportService.generateYearlyReport()}
                                style={{
                                    width: '100%', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px',
                                    border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
                                }}
                            >
                                <Download size={14} /> Generate Yearly Audit
                            </button>
                            <button style={{
                                width: '100%', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px',
                                border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <Clock size={14} /> View Archived Personnel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isBirthdayModalOpen && (
                <div
                    onClick={() => setIsBirthdayModalOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="glass"
                        style={{ width: '600px', maxHeight: '80vh', padding: '40px', borderRadius: 'var(--radius-lg)', position: 'relative', overflowY: 'auto' }}
                    >
                        <header style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <Cake size={48} color="#ffaa00" style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>Month of Celebration</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Happy Birthday to our distinguished members!</p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {stats.birthdays.map((p, idx) => (
                                <div key={idx} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ffaa00' }}>
                                        {p.image ? (
                                            <img src={p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : convertFileSrc(p.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : <Users size={24} color="var(--text-muted)" />}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '800', fontSize: '1rem' }}>{p.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#ffaa00', fontWeight: '700' }}>{p.dob}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsBirthdayModalOpen(false)}
                            style={{ width: '100%', padding: '14px', marginTop: '32px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontWeight: '700' }}
                        >
                            Close Spotlight
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .recharts-cartesian-grid-horizontal line {
                    stroke-dasharray: 4 4;
                }
                .recharts-tooltip-wrapper {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
