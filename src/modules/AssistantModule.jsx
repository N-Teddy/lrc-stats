import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ArrowRight, Star, Heart, TrendingUp, Users, Phone, Calendar } from 'lucide-react';
import { dataService } from '../store/dataService';

const InsightCard = ({ icon: Icon, title, description, badge, color, data = [] }) => (
    <div className="glass animate-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: `1px solid ${color}33` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ padding: '10px', backgroundColor: `${color}11`, borderRadius: '12px', border: `1px solid ${color}22` }}>
                <Icon size={20} color={color} />
            </div>
            {badge && <span style={{ fontSize: '0.65rem', backgroundColor: `${color}22`, color: color, padding: '4px 10px', borderRadius: '20px', fontWeight: '800', letterSpacing: '1px' }}>{badge}</span>}
        </div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>{title}</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>{description}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.length > 0 ? data.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.name}</span>
                    </div>
                    {item.meta && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{item.meta}</span>}
                </div>
            )) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Thinking...</p>
            )}
        </div>
    </div>
);

const AssistantModule = () => {
    const [query, setQuery] = useState(null);
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const inquiries = [
        { id: 'harmony', label: "Who are our Harmony Leaders this month?", icon: Star, color: 'var(--accent-primary)' },
        { id: 'care', label: "Who needs a friendly check-in?", icon: Heart, color: '#ff4d4d' },
        { id: 'growth', label: "Are we growing this year?", icon: TrendingUp, color: 'var(--accent-green)' },
        { id: 'popular', label: "Which gatherings are most popular?", icon: Users, color: '#7928ca' }
    ];

    const runInquiry = async (id) => {
        setIsLoading(true);
        setQuery(id);

        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        setTimeout(() => { // Subtle delay for "Intelligence" feel
            switch (id) {
                case 'harmony':
                    // Top attendance this month
                    const monthActivities = activities.filter(a => {
                        const d = new Date(a.date);
                        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    });
                    const leaderboard = activePeople.map(p => {
                        const count = attendance.filter(att =>
                            att.personIds.includes(p.id) &&
                            monthActivities.some(ma => ma.id === att.activityId)
                        ).length;
                        return { name: p.name, count };
                    }).sort((a, b) => b.count - a.count).slice(0, 5);

                    setResults({
                        title: "Harmony Leaders",
                        description: "These members have shown the most consistent participation this month. They are the group's current pillars.",
                        color: 'var(--accent-primary)',
                        icon: Star,
                        badge: 'TOP ENGAGEMENT',
                        data: leaderboard.map(l => ({ name: l.name, meta: `${l.count} Sessions` }))
                    });
                    break;

                case 'care':
                    // Missed last 3 gatherings
                    const sortedPast = activities.filter(a => new Date(a.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));
                    const last3 = sortedPast.slice(0, 3);
                    const drifting = activePeople.filter(p => {
                        const present = attendance.filter(att =>
                            att.personIds.includes(p.id) &&
                            last3.some(l => l.id === att.activityId)
                        ).length;
                        return present === 0;
                    }).slice(0, 5);

                    setResults({
                        title: "Caring Opportunities",
                        description: "These members haven't joined the last 3 gatherings. A simple call or visit could mean a lot to them.",
                        color: '#ff4d4d',
                        icon: Heart,
                        badge: 'CHECK-IN NEEDED',
                        data: drifting.map(d => ({ name: d.name, meta: "3+ Absences" }))
                    });
                    break;

                case 'growth':
                    const thisYearBirths = activePeople.filter(p => p.dateIntegration && new Date(p.dateIntegration).getFullYear() === currentYear).length;
                    const thisYearDepartures = activePeople.filter(p => p.dateDeparture && new Date(p.dateDeparture).getFullYear() === currentYear).length;

                    setResults({
                        title: "Growth Momentum",
                        description: "Analyzing new connections vs. departures for the current calendar year.",
                        color: 'var(--accent-green)',
                        icon: TrendingUp,
                        badge: 'COMMUNITY HEALTH',
                        data: [
                            { name: "New Connections", meta: `+${thisYearBirths}` },
                            { name: "Departures", meta: `-${thisYearDepartures}` },
                            { name: "Net Growth", meta: `${thisYearBirths - thisYearDepartures}` }
                        ]
                    });
                    break;

                case 'popular':
                    const typeStats = {};
                    activities.forEach(a => {
                        const attCount = attendance.find(att => att.activityId === a.id)?.count || 0;
                        if (!typeStats[a.type]) typeStats[a.type] = { total: 0, count: 0 };
                        typeStats[a.type].total += attCount;
                        typeStats[a.type].count += 1;
                    });
                    const resonance = Object.keys(typeStats).map(t => ({
                        name: t,
                        avg: Math.round(typeStats[t].total / typeStats[t].count)
                    })).sort((a, b) => b.avg - a.avg);

                    setResults({
                        title: "Activity Resonance",
                        description: "Based on average participation, these types of gatherings resonate most with the community.",
                        color: '#7928ca',
                        icon: Users,
                        badge: 'PEAK MOMENTUM',
                        data: resonance.map(r => ({ name: r.name, meta: `Avg ${r.avg} present` }))
                    });
                    break;

                default: break;
            }
            setIsLoading(false);
        }, 600);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <div style={{ backgroundColor: 'var(--accent-primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={24} color="black" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Simple Assistant</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Quick inquiries for community harmony and collective care.</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
                {/* Inquiry Panel */}
                <div>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '24px' }}>Tactical Inquiries</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {inquiries.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => runInquiry(item.id)}
                                disabled={isLoading}
                                className={`glass hover-glow ${query === item.id ? 'active' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                                    borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                                    border: query === item.id ? `1px solid ${item.color}` : '1px solid var(--border-color)',
                                    backgroundColor: query === item.id ? `${item.color}08` : 'transparent',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <div style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)', color: item.color }}>
                                    <item.icon size={18} />
                                </div>
                                <span style={{ flex: 1, fontWeight: '700', fontSize: '0.95rem' }}>{item.label}</span>
                                <ArrowRight size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Intelligence View */}
                <div style={{ position: 'relative' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '20px' }}>
                            <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', letterSpacing: '1px' }}>ANALYZING HARMONY RECORDS...</p>
                        </div>
                    ) : results ? (
                        <InsightCard {...results} />
                    ) : (
                        <div className="glass" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                            <MessageSquare size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                            <h3 style={{ color: 'var(--text-muted)', fontWeight: '800', marginBottom: '8px' }}>Awaiting Inquiry</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a question from the left to generate deep-care intelligence.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .active { transform: translateX(10px); }
            `}</style>
        </div>
    );
};

export default AssistantModule;
