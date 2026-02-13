import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, Terminal, User, Laptop, Activity, FileText, Trash2, Edit, Plus, Download } from 'lucide-react';
import { auditService } from '../store/auditService';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';

const AuditModule = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    useEffect(() => {
        loadLogs();
        // Set up polling for new logs
        const interval = setInterval(loadLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadLogs = async () => {
        const rawLogs = await auditService.getLogs();
        setLogs(rawLogs);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE': return <Plus size={14} color="var(--accent-green)" />;
            case 'UPDATE': return <Edit size={14} color="var(--accent-primary)" />;
            case 'DELETE': return <Trash2 size={14} color="var(--accent-crimson)" />;
            case 'PDF_GEN': return <FileText size={14} color="var(--accent-purple)" />;
            case 'LOGIN': return <User size={14} color="var(--accent-cyan)" />;
            default: return <Activity size={14} color="var(--text-muted)" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'var(--accent-green)';
            case 'UPDATE': return 'var(--accent-primary)';
            case 'DELETE': return 'var(--accent-crimson)';
            case 'PDF_GEN': return 'var(--accent-purple)';
            case 'LOGIN': return 'var(--accent-cyan)';
            default: return 'var(--text-muted)';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesAction = filter === 'all' || log.action === filter;
        const matchesSearch =
            log.userName.toLowerCase().includes(search.toLowerCase()) ||
            log.entityName.toLowerCase().includes(search.toLowerCase()) ||
            log.action.toLowerCase().includes(search.toLowerCase());
        return matchesAction && matchesSearch;
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
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Shield size={40} color="var(--accent-primary)" /> {t('audit.title', { defaultValue: 'Tactical Audit' })}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('audit.subtitle', { defaultValue: 'Tracking every action within the Command Center' })}</p>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '100px', backgroundColor: 'rgba(0, 210, 255, 0.1)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', animation: 'pulseGlow 2s infinite' }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Live</span>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder={t('audit.search_placeholder', { defaultValue: 'Search by user, subject, or action...' })}
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <div style={{ width: 'max-content' }}>
                    <CustomSelect
                        value={filter}
                        onChange={setFilter}
                        icon={Filter}
                        options={[
                            { label: 'All Actions', value: 'all' },
                            { label: 'Creations', value: 'CREATE' },
                            { label: 'Modifications', value: 'UPDATE' },
                            { label: 'Deletions', value: 'DELETE' },
                            { label: 'Reports', value: 'PDF_GEN' }
                        ]}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paginated.map((log, index) => (
                    <div key={log.id} className="glass hover-glow" style={{
                        padding: '16px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        animation: `slideUpFade 0.3s ease-out ${index % 15 * 0.05}s both`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        {/* Time Column */}
                        <div style={{ minWidth: '80px' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: '800', fontFamily: 'monospace' }}>
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Action Column */}
                        <div style={{ minWidth: '120px' }}>
                            <div style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: `rgba(${getActionColor(log.action) === 'var(--accent-green)' ? '57, 255, 20' : '0, 210, 255'}, 0.1)`,
                                border: `1px solid ${getActionColor(log.action)}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                {getActionIcon(log.action)}
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', color: getActionColor(log.action) }}>{log.action}</span>
                            </div>
                        </div>

                        {/* Subject & User Column */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{log.entityName}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{log.entityType}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={12} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.userName}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Laptop size={12} color="var(--text-muted)" />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.deviceId}</span>
                                </div>
                            </div>
                        </div>

                        {/* Optional Download/Expand */}
                        <div>
                            <Terminal size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                        <Terminal size={40} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
                        <p>{t('audit.no_logs', { defaultValue: 'No tactical logs found for the current selection.' })}</p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={filteredLogs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
            />

            <style>{`
                @keyframes pulseGlow {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 10px var(--accent-primary); }
                    100% { transform: scale(1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default AuditModule;
