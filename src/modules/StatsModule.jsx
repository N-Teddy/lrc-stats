import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import { Download, FileText, Filter, Printer, Sliders } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import ReportWizard from '../components/ReportWizard';

const StatsModule = () => {
    const { accentColor } = useTheme();
    const [distribution, setDistribution] = useState([]);
    const [typeData, setTypeData] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            // 1. Membership Distribution (Active vs JRs)
            const activePeople = people.filter(p => !p.isArchived);
            const jrs = activePeople.filter(p => p.isJRs).length;
            setDistribution([
                { name: 'Regular Personnel', value: activePeople.length - jrs },
                { name: 'Junior Core', value: jrs }
            ]);

            // 2. Activity Type Distribution
            const types = {};
            activities.forEach(a => {
                types[a.type] = (types[a.type] || 0) + 1;
            });
            setTypeData(Object.keys(types).map(k => ({ name: k, count: types[k] })));
        };
        loadStats();
    }, []);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            await reportService.generateYearlyReport(new Date().getFullYear());
        } finally {
            setIsGenerating(false);
        }
    };

    const COLORS = [accentColor, '#39ff14', '#0070f3', '#7928ca', '#ff0080', '#f5a623'];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Strategic Analytics</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Advanced network distribution and participation metrics.</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    style={{
                        backgroundColor: 'var(--accent-primary)', color: 'black', padding: '12px 24px',
                        borderRadius: 'var(--radius-md)', fontWeight: '800', display: 'flex',
                        alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(var(--accent-primary-rgb), 0.3)'
                    }}
                >
                    <Download size={18} /> Open Report Wizard
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                {/* Personnel Distribution */}
                <div className="glass animate-in stagger-1" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: 'var(--accent-green)' }} />
                        Personnel Segmentation
                    </h3>
                    <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}
                                />
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

                {/* Activity Load */}
                <div className="glass animate-in stagger-2" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: 'var(--accent-primary)' }} />
                        Operational Workload (by Type)
                    </h3>
                    <div style={{ width: '100%', height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Yearly Report Preview Placeholder */}
            <div className="glass" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                <FileText size={48} color="var(--border-color)" style={{ marginBottom: '20px' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>Ready for Yearly Audit?</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 24px' }}>
                    Compiling all attendance sheets, activity logs, and personnel status into a standardized PDF format for the current administrative year.
                </p>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    style={{ padding: '12px 32px', borderRadius: '30px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'transparent', fontSize: '0.85rem' }}
                >
                    Launch Tactical Export Sequence
                </button>
            </div>

            <ReportWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />

            <style>{`
@keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
}.
`}</style>
        </div>
    );
};

export default StatsModule;
