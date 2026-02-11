import React, { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { dataService } from '../store/dataService';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
                padding: '10px',
                backgroundColor: `rgba(${color}, 0.1)`,
                borderRadius: 'var(--radius-md)',
                color: `rgb(${color})`
            }}>
                <Icon size={20} />
            </div>
            {trend && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: '600' }}>
                    +{trend}%
                </span>
            )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: '800', marginTop: '4px' }}>{value}</p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ people: 0, jrs: 0, activities: 0 });

    useEffect(() => {
        async function loadStats() {
            const people = await dataService.getPeople();
            const activities = await dataService.getActivities();
            setStats({
                people: people.length,
                jrs: people.filter(p => p.isJRs && !p.isArchived).length,
                activities: activities.length
            });
        }
        loadStats();
    }, []);

    return (
        <div>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back. Here is your organization overview.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <StatCard icon={Users} label="Total Members" value={stats.people} color="0, 210, 255" />
                <StatCard icon={Activity} label="Active JRs" value={stats.jrs} color="57, 255, 20" />
                <StatCard icon={Calendar} label="Activities" value={stats.activities} color="0, 112, 243" />
                <StatCard icon={TrendingUp} label="Avg. Attendance" value="--" color="121, 40, 202" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="glass" style={{ height: '300px', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', color: '#222' }}>
                    <p className="font-technical" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Recent Activity Chart Placeholder</p>
                </div>
                <div className="glass" style={{ height: '300px', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {['Log Attendance', 'Export Yearly Report', 'Add New Person'].map(action => (
                            <button
                                key={action}
                                style={{
                                    textAlign: 'left',
                                    padding: '12px 16px',
                                    backgroundColor: '#111',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem',
                                    border: '1px solid transparent',
                                    transition: 'border var(--transition-fast)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#333'}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
