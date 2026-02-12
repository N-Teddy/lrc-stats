import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import CustomSelect from '../components/CustomSelect';
import { Download, Filter, Sliders, Heart, TrendingUp, Users, AlertCircle, Award } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';

const StatsModule = () => {
    const { accentColor } = useTheme();
    const [rawStats, setRawStats] = useState({ people: [], activities: [], attendance: [] });
    const [selectedCurveYear, setSelectedCurveYear] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const [people, activities, attendance] = await Promise.all([
                    dataService.getPeople(),
                    dataService.getActivities(),
                    dataService.getAttendance()
                ]);
                setRawStats({ people, activities, attendance });
            } catch (err) {
                console.error('Failed to load community stats:', err);
            }
        };
        loadBaseData();
    }, []);

    // Memoized basic stats (Distribution, Years)
    const { activePeople, sortedActivities, availableYears, distribution } = useMemo(() => {
        const people = rawStats.people.filter(p => !p.isArchived && !p.isDeleted);
        const activities = rawStats.activities.filter(a => !a.isDeleted).sort((a, b) => new Date(a.date) - new Date(b.date));

        const years = [...new Set(activities.map(a => new Date(a.date).getFullYear().toString()))].sort((a, b) => b - a);

        const membres = people.filter(p => (p.status || 'Membre') === 'Membre').length;
        const eleves = people.filter(p => p.status === 'Eleve').length;

        return {
            activePeople: people,
            sortedActivities: activities,
            availableYears: ['all', ...years],
            distribution: [
                { name: 'Membres', value: membres },
                { name: 'Eleves', value: eleves }
            ]
        };
    }, [rawStats]);

    // Computed Trend Data & Resonance based on selection
    const { trendData, resonanceData, atRisk } = useMemo(() => {
        if (rawStats.people.length === 0) return { trendData: [], resonanceData: [], atRisk: [] };

        const monthlyStats = {};
        const { attendance } = rawStats;

        // Trend calculation
        if (selectedCurveYear === 'all') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            sortedActivities.forEach(act => {
                const date = new Date(act.date);
                if (date >= sixMonthsAgo) {
                    const monthYear = date.toLocaleString('default', { month: 'short' });
                    if (!monthlyStats[monthYear]) monthlyStats[monthYear] = { name: monthYear, attendance: 0, count: 0 };
                    const attCount = attendance.filter(att => att.activityId === act.id).length;
                    monthlyStats[monthYear].attendance += attCount;
                    monthlyStats[monthYear].count += 1;
                }
            });
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach(m => monthlyStats[m] = { name: m, attendance: 0, count: 0 });

            sortedActivities.forEach(act => {
                const date = new Date(act.date);
                if (date.getFullYear().toString() === selectedCurveYear) {
                    const month = date.toLocaleString('default', { month: 'short' });
                    const attCount = attendance.filter(att => att.activityId === act.id).length;
                    monthlyStats[month].attendance += attCount;
                    monthlyStats[month].count += 1;
                }
            });
        }

        // Resonance calculation
        const typeMetrics = {};
        sortedActivities.forEach(act => {
            if (!typeMetrics[act.type]) typeMetrics[act.type] = { subject: act.type, A: 0, count: 0 };
            const attCount = attendance.filter(att => att.activityId === act.id).length;
            typeMetrics[act.type].A += (attCount / (activePeople.length || 1)) * 100;
            typeMetrics[act.type].count += 1;
        });
        const resData = Object.values(typeMetrics).map(m => ({ ...m, A: Math.round(m.A / (m.count || 1)) }));

        // At Risk calculation
        const last3Activities = [...sortedActivities].reverse().slice(0, 3);
        let drifting = [];
        if (last3Activities.length >= 3) {
            drifting = activePeople.filter(person => {
                const presentInLast3 = attendance.filter(att =>
                    att.personId === person.id &&
                    last3Activities.map(a => a.id).includes(att.activityId)
                ).length;
                return presentInLast3 === 0;
            }).slice(0, 5);
        }

        return {
            trendData: Object.values(monthlyStats),
            resonanceData: resData,
            atRisk: drifting
        };
    }, [activePeople, sortedActivities, rawStats.attendance, selectedCurveYear]);

    const COLORS = [accentColor, '#39ff14', '#0070f3', '#7928ca', '#ff0080', '#f5a623'];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Community Insights</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Advanced metrics for group harmony and congregational care.</p>
                </div>
                <button
                    onClick={() => reportService.generateYearlyReport()}
                    disabled={isGenerating || distribution[0]?.value === 0}
                    style={{
                        backgroundColor: 'var(--accent-primary)', color: 'black', padding: '12px 24px',
                        borderRadius: 'var(--radius-md)', fontWeight: '800', display: 'flex',
                        alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(var(--accent-primary-rgb), 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    <Download size={18} /> {isGenerating ? 'Compiling...' : 'Download Yearly Audit'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', marginBottom: '40px' }}>
                {/* Participation Trend */}
                <div className="glass animate-in stagger-1" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={18} color="var(--accent-primary)" /> Participation Curve
                        </h3>
                        <div style={{ width: '120px' }}>
                            <CustomSelect
                                value={selectedCurveYear}
                                onChange={setSelectedCurveYear}
                                options={availableYears}
                            />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="attendance" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reach Out / At Risk */}
                <div className="glass animate-in stagger-2" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4d4d' }}>
                        <AlertCircle size={18} /> Reach Out Needs
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Members missed last 3 gatherings.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {atRisk.length > 0 ? atRisk.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255, 77, 77, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Heart size={14} color="#ff4d4d" />
                                    </div>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</span>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>3+ ABSENT</span>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <Heart size={32} style={{ marginBottom: '12px', opacity: 0.2 }} />
                                <p style={{ fontSize: '0.85rem' }}>Everyone is accounted for.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                {/* Activity Resonance (Radar) */}
                <div className="glass animate-in stagger-3" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={18} color="var(--accent-green)" /> Activity Resonance (%)
                    </h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resonanceData}>
                                <PolarGrid stroke="var(--border-color)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Resonance" dataKey="A" stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Segmentation (Pie) */}
                <div className="glass animate-in stagger-4" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={18} color="var(--accent-primary)" /> Community Distribution
                    </h3>
                    <div style={{ width: '100%', height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                        {distribution.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.name}: {d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .stagger-1 { animation-delay: 0.1s; }
                .stagger-2 { animation-delay: 0.2s; }
                .stagger-3 { animation-delay: 0.3s; }
                .stagger-4 { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
};

export default StatsModule;
