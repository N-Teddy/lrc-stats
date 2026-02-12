import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, UserCheck, PieChart as PieIcon, BarChart3, Clock, MapPin, Download } from 'lucide-react';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ActivityDetailModule = ({ activity, onBack }) => {
    const [stats, setStats] = useState({
        total: 0,
        membres: 0,
        eleves: 0
    });
    const [attendanceList, setAttendanceList] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, [activity]);

    const loadData = async () => {
        const [people, allAttendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getAttendance()
        ]);

        const record = allAttendance.find(a => a.activityId === activity.id);
        if (!record) return;

        const attendees = people.filter(p => record.personIds.includes(p.id));
        setAttendanceList(attendees);

        const counts = {
            total: attendees.length,
            membres: attendees.filter(p => (p.status || 'Membre') === 'Membre').length,
            eleves: attendees.filter(p => p.status === 'Eleve').length
        };

        setStats(counts);
    };

    const statusData = [
        { name: 'Membres', value: stats.membres, color: 'var(--accent-primary)' },
        { name: 'Eleves', value: stats.eleves, color: '#ffaa00' }
    ].filter(d => d.value > 0);

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to Operations
                </button>
                <button
                    onClick={async () => {
                        setIsExporting(true);
                        await reportService.generateActivityToken(activity, attendanceList);
                        setIsExporting(false);
                    }}
                    disabled={isExporting}
                    style={{
                        backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                        padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Download size={16} /> {isExporting ? 'Generating...' : 'Download Token'}
                </button>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '32px', border: '1px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>{activity.name}</h2>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} /> {activity.date}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={16} /> {activity.type}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Overall Presence</p>
                        <p style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--accent-primary)', lineHeight: 1 }}>{stats.total}</p>
                    </div>
                </div>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <PieIcon size={20} color="var(--accent-primary)" /> Organizational Status Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                    <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {statusData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: d.color }} />
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>{d.name}</p>
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '900', color: d.color }}>{d.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px' }}>Participant List</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {attendanceList.map(p => (
                        <div key={p.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.status === 'Eleve' ? '#ffaa00' : 'var(--accent-primary)' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default ActivityDetailModule;
