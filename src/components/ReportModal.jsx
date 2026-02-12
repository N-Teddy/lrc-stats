import React, { useState } from 'react';
import { X, Download, Filter, Settings, FileText, CheckCircle2 } from 'lucide-react';
import CustomSelect from './CustomSelect';

const ReportModal = ({ isOpen, onClose, onGenerate, title, type, options = {} }) => {
    const [config, setConfig] = useState({
        years: [],
        sortBy: 'name',
        order: 'asc',
        fields: {
            status: true,
            image: false,
            integration: true,
            percentage: true
        },
        includeTypes: options.activityTypes || [],
        ...options.initialConfig
    });

    if (!isOpen) return null;

    const toggleYear = (year) => {
        const newYears = config.years.includes(year)
            ? config.years.filter(y => y !== year)
            : [...config.years, year];
        setConfig({ ...config, years: newYears });
    };

    const toggleField = (field) => {
        setConfig({
            ...config,
            fields: { ...config.fields, [field]: !config.fields[field] }
        });
    };

    const toggleType = (type) => {
        const newTypes = config.includeTypes.includes(type)
            ? config.includeTypes.filter(t => t !== type)
            : [...config.includeTypes, type];
        setConfig({ ...config, includeTypes: newTypes });
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '20px' }}>
            <div className="glass animate-in" style={{ width: '100%', maxWidth: '600px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <header style={{ padding: '24px 32px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: 'var(--accent-primary)', padding: '8px', borderRadius: '8px' }}>
                            <FileText size={20} color="black" />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{title}</h2>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </header>

                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Year Selection */}
                    {options.availableYears && (
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Temporal Scope (Select Years)</label>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {options.availableYears.map(y => (
                                    <button
                                        key={y}
                                        onClick={() => toggleYear(y)}
                                        style={{
                                            padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                            backgroundColor: config.years.includes(y) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                            color: config.years.includes(y) ? 'black' : 'var(--text-primary)',
                                            fontWeight: '800', fontSize: '0.85rem', transition: 'all 0.2s'
                                        }}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Field Toggles */}
                    {type === 'people' && (
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>Tactical Fields to Include</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {Object.keys(config.fields).map(field => (
                                    <div
                                        key={field}
                                        onClick={() => toggleField(field)}
                                        style={{
                                            padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: config.fields[field] ? 'var(--accent-primary)' : 'transparent' }}>
                                            {config.fields[field] && <CheckCircle2 size={14} color="black" />}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize' }}>{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sorting Engine */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Sort By</label>
                            <CustomSelect
                                value={config.sortBy}
                                onChange={(val) => setConfig({ ...config, sortBy: val })}
                                searchable={false}
                                options={options.sortOptions || [
                                    { label: 'Name', value: 'name' },
                                    { label: 'Attendance', value: 'attendance' }
                                ]}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Direction</label>
                            <CustomSelect
                                value={config.order}
                                onChange={(val) => setConfig({ ...config, order: val })}
                                searchable={false}
                                options={[
                                    { label: 'ASC (Low to High)', value: 'asc' },
                                    { label: 'DESC (High to Low)', value: 'desc' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Operational Filters for Personal Report */}
                    {type === 'personal' && options.activityTypes && (
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Activity Type Filter</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {options.activityTypes.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => toggleType(t)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
                                            backgroundColor: config.includeTypes.includes(t) ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                                            color: config.includeTypes.includes(t) ? 'var(--accent-primary)' : 'var(--text-muted)',
                                            fontSize: '0.7rem', fontWeight: '800', transition: 'all 0.2s'
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <footer style={{ padding: '24px 32px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '800', color: 'var(--text-muted)' }}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => onGenerate(config)}
                        style={{ flex: 2, padding: '14px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <Download size={18} /> GENERATE AUDIT REPORT
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ReportModal;
