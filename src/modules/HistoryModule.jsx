import React, { useState, useEffect } from 'react';
import { Clock, UserPlus, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import { dataService } from '../store/dataService';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';

const HistoryModule = () => {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all'); // all, person, activity
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        const [people, activities] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities()
        ]);

        const personLogs = people
            .filter(p => p.dateIntegration)
            .map(p => ({
                id: `p-${p.id}`,
                type: 'person',
                title: 'New Member Integrated',
                description: `${p.name} joined as ${p.status}.`,
                date: p.dateIntegration,
                timestamp: new Date(p.dateIntegration).getTime(),
                icon: UserPlus,
                color: 'var(--accent-primary)'
            }));

        const activityLogs = activities.map(a => ({
            id: `a-${a.id}`,
            type: 'activity',
            title: 'Activity Organized',
            description: `${a.name} (${a.type}) was held.`,
            date: a.date,
            timestamp: new Date(a.date).getTime(),
            icon: Calendar,
            color: 'var(--accent-green)'
        }));

        const allLogs = [...personLogs, ...activityLogs].sort((a, b) => b.timestamp - a.timestamp);
        setLogs(allLogs);
    };

    const filteredLogs = logs.filter(log => {
        const matchesType = filter === 'all' || log.type === filter;
        const matchesSearch = log.title.toLowerCase().includes(search.toLowerCase()) ||
            log.description.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter]);

    const paginated = filteredLogs.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Operational Logs</h2>
                <p style={{ color: 'var(--text-secondary)' }}>A chronological audit trail of all organization events.</p>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search logs..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <div style={{ width: '200px' }}>
                    <CustomSelect
                        value={filter}
                        onChange={setFilter}
                        icon={Filter}
                        options={[
                            { label: 'ALL LOG ENTRIES', value: 'all' },
                            { label: 'MEMBER GROWTH', value: 'person' },
                            { label: 'ACTIVITY HISTORY', value: 'activity' }
                        ]}
                    />
                </div>
            </div>

            <div style={{ position: 'relative', paddingLeft: '32px' }}>
                {/* Timeline Line */}
                <div style={{
                    position: 'absolute', left: '15px', top: '0', bottom: '0',
                    width: '2px', backgroundColor: 'var(--border-color)', opacity: 0.5
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {paginated.map((log, index) => (
                        <div key={log.id} style={{ position: 'relative', animation: `fadeIn 0.3s ease-out ${index % 10 * 0.05}s both` }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute', left: '-25px', top: '4px',
                                width: '16px', height: '16px', borderRadius: '50%',
                                backgroundColor: log.color, border: '4px solid var(--bg-primary)',
                                zIndex: 1
                            }} />

                            <div className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{
                                            padding: '8px', borderRadius: 'var(--radius-sm)',
                                            backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <log.icon size={18} color={log.color} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>{log.title}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.description}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>{log.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredLogs.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />

                {filteredLogs.length === 0 && (
                    <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                        No logs match your current filter.
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default HistoryModule;
