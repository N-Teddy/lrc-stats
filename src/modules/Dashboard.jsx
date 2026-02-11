import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, Download, CheckCircle, Clock } from 'lucide-react';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, trend, color, subtext }) => (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px',
            background: `radial-gradient(circle, rgba(${color}, 0.1) 0%, transparent 70%)`, zIndex: 0
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
            <div style={{
                padding: '10px',
                backgroundColor: `rgba(${color}, 0.1)`,
                borderRadius: 'var(--radius-md)',
                color: `rgb(${color})`
            }}>
                <Icon size={20} />
            </div>
            {trend !== undefined && (
                <span style={{ fontSize: '0.75rem', color: trend >= 0 ? 'var(--accent-green)' : '#ff4d4d', fontWeight: '800' }}>
                    {trend >= 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{label}</p>
        <p style={{ fontSize: '2.2rem', fontWeight: '900', marginTop: '4px', letterSpacing: '-1px' }}>{value}</p>
        {subtext && <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '4px' }}>{subtext}</p>}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        people: 0,
        jrs: 0,
        activitiesCount: 0,
        avgAttendance: 0,
        recentAttendance: []
    });

    useEffect(() => {
        async function loadStats() {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const activePeople = people.filter(p => !p.isArchived);
            const activeJrs = activePeople.filter(p => p.isJRs).length;

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

            setStats({
                people: activePeople.length,
                jrs: activeJrs,
                activitiesCount: activities.length,
                avgAttendance: avg,
                recentAttendance: chartData
            });
        }
        loadStats();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass" style={{ padding: '12px', border: '1px solid #333', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{payload[0].value} Attendees</p>
                    <p style={{ fontSize: '0.65rem', color: '#666' }}>{payload[0].payload.date}</p>
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
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>LRC Mission Statistics & Network Analysis</p>
                </div>
                <div style={{ padding: '8px 16px', backgroundColor: '#111', borderRadius: '30px', border: '1px solid #222', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#666' }}>System Active</span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div className="animate-in stagger-1"><StatCard icon={Users} label="Personnel" value={stats.people} color="0, 210, 255" subtext="Active members" /></div>
                <div className="animate-in stagger-2"><StatCard icon={Activity} label="Junior Core" value={stats.jrs} color="57, 255, 20" subtext="Eligible JRs" /></div>
                <div className="animate-in stagger-3"><StatCard icon={Calendar} label="Operations" value={stats.activitiesCount} color="0, 112, 243" subtext="Registered activities" /></div>
                <div className="animate-in stagger-4"><StatCard icon={TrendingUp} label="Flow Density" value={stats.avgAttendance} color="121, 40, 202" subtext="Avg. attendance" /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {/* Main Presence Chart */}
                <div className="glass animate-in stagger-2" style={{ borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Engagement Dynamics</h3>
                            <p style={{ fontSize: '0.8rem', color: '#444' }}>Attendance volume over recent activities</p>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '300px' }}>
                        {stats.recentAttendance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.recentAttendance}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#444', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
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
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #222', borderRadius: '12px' }}>
                                <p style={{ color: '#333', fontSize: '0.9rem' }}>Awaiting operational data to generate analytics.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Performance & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass animate-in stagger-3" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', flex: 1 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: '#555' }}>
                            Recent Activity Hub
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.recentAttendance.length > 0 ? stats.recentAttendance.slice(-3).reverse().map((act, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid #111' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{act.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#444' }}>{act.date}</p>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{act.count}</span>
                                </div>
                            )) : <p style={{ fontSize: '0.8rem', color: '#444' }}>No activities logged yet.</p>}
                        </div>
                    </div>

                    <div className="glass animate-in stagger-4" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.05) 0%, transparent 100%)' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '16px' }}>Network Utilities</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => reportService.generateYearlyReport()}
                                style={{
                                    width: '100%', padding: '12px', backgroundColor: '#111', borderRadius: '8px',
                                    border: '1px solid #1a1a1a', color: '#888', fontSize: '0.8rem', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
                                }}
                            >
                                <Download size={14} /> Generate Yearly Audit
                            </button>
                            <button style={{
                                width: '100%', padding: '12px', backgroundColor: '#111', borderRadius: '8px',
                                border: '1px solid #1a1a1a', color: '#888', fontSize: '0.8rem', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <Clock size={14} /> View Archived Personnel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .recharts-cartesian-grid-horizontal line {
                    stroke-dasharray: 4 4;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
