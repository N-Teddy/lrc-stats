import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Calendar, Clock, TrendingUp, Award, Activity, Download } from 'lucide-react';
import { dataService } from '../store/dataService';
import { reportService } from '../store/reportService';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { convertFileSrc } from '@tauri-apps/api/core';

const PersonDetailModule = ({ personId, onBack }) => {
    const [person, setPerson] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [stats, setStats] = useState({
        totalAttendance: 0,
        rate: 0,
        lastSeen: '---',
        joinedDate: '---'
    });
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, [personId]);

    const loadData = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const currentPerson = people.find(p => p.id === personId);
        if (!currentPerson) return;
        setPerson(currentPerson);

        // Process Attendance - Attendance is stored as { activityId, personIds: [] }
        const personAttendance = attendance
            .filter(record => record.personIds.includes(personId))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const history = personAttendance.map(record => {
            const activity = activities.find(act => act.id === record.activityId);
            return {
                id: record.activityId,
                name: activity?.name || record.activityName || 'Unknown Activity',
                date: record.date,
                timestamp: new Date(record.date).getTime()
            };
        });

        setAttendanceHistory(history);

        // Calculate Stats
        const totalPossible = activities.filter(act => new Date(act.date) >= new Date(currentPerson.dateIntegration || act.date)).length;

        setStats({
            totalAttendance: history.length,
            rate: totalPossible > 0 ? Math.round((history.length / totalPossible) * 100) : 0,
            lastSeen: history[0]?.date || 'Never',
            joinedDate: currentPerson.dateIntegration || '---'
        });
    };

    if (!person) return <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

    const chartData = [...attendanceHistory].reverse().map(h => ({
        date: h.date,
        val: 1 // Just binary for now, can be improved to "Score"
    }));

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to Directory
                </button>
                <button
                    onClick={async () => {
                        setIsExporting(true);
                        await reportService.generatePersonReport(person, attendanceHistory, stats);
                        setIsExporting(false);
                    }}
                    disabled={isExporting}
                    style={{
                        backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                        padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '700', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <Download size={16} /> {isExporting ? 'Generating...' : 'Export Audit'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
                {/* Left Column: Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: 'var(--radius-md)',
                            margin: '0 auto 24px', backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)', overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {person.image ? (
                                <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={48} color="var(--border-color)" />
                            )}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>{person.name}</h2>
                        <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '0.65rem', background: person.status === 'Eleve' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(var(--accent-primary-rgb), 0.1)', color: person.status === 'Eleve' ? '#ffaa00' : 'var(--accent-primary)', padding: '4px 12px', borderRadius: '50px', fontWeight: '900', border: '1px solid currentColor' }}>
                                {person.status?.toUpperCase() || 'MEMBRE'}
                            </span>
                            {person.isJRs && <span style={{ fontSize: '0.65rem', background: 'rgba(57, 255, 20, 0.1)', color: 'var(--accent-green)', padding: '4px 12px', borderRadius: '50px', fontWeight: '900', border: '1px solid currentColor' }}>JRS</span>}
                        </div>

                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Phone size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.9rem' }}>{person.phone || 'No phone'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Calendar size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.9rem' }}>Born: {person.dob || '---'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Clock size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.9rem' }}>Joined: {stats.joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Engagement</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{stats.rate}%</p>
                        </div>
                        <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Sessions</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-green)' }}>{stats.totalAttendance}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Activity Pipeline Chart */}
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={20} color="var(--accent-primary)" /> Activity Pulse
                        </h3>
                        <div style={{ width: '100%', height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="date" hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                        itemStyle={{ display: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="val" stroke="var(--accent-primary)" fill="rgba(var(--accent-primary-rgb), 0.1)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Attendance Logs */}
                    <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--accent-green)" /> Recent Participation
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {attendanceHistory.length > 0 ? (
                                attendanceHistory.slice(0, 10).map((h, i) => (
                                    <div key={i} style={{
                                        padding: '16px', backgroundColor: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{h.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.date}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', color: 'var(--accent-green)' }}>
                                            <Award size={16} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: '900' }}>PRESENT</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', py: '40px', color: 'var(--text-muted)' }}>
                                    No attendance records found for this member.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PersonDetailModule;
