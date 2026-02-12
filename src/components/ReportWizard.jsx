import React, { useState, useEffect } from 'react';
import { X, FileText, Users, Calendar, Image as ImageIcon, Download, Settings, ChevronRight, Check } from 'lucide-react';
import { reportService } from '../store/reportService';
import { dataService } from '../store/dataService';
import CustomSelect from './CustomSelect';

const ReportWizard = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [reportType, setReportType] = useState('yearly'); // yearly, directory, custom, global_log
    const [config, setConfig] = useState({
        year: new Date().getFullYear().toString(),
        includeImages: true,
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        selectedPeople: []
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [people, setPeople] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            loadPeople();
        }
    }, [isOpen]);

    const loadPeople = async () => {
        const data = await dataService.getPeople();
        setPeople(data.filter(p => !p.isArchived).sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            switch (reportType) {
                case 'yearly':
                    await reportService.generateYearlyReport({
                        year: parseInt(config.year),
                        includeImages: config.includeImages
                    });
                    break;
                case 'directory':
                    await reportService.generateDirectoryReport(people, {
                        includeImages: config.includeImages
                    });
                    break;
                case 'global_log':
                    await reportService.generateAllActivitiesReport();
                    break;
                case 'custom':
                    await reportService.generateCustomReport(
                        config.selectedPeople.length > 0 ? config.selectedPeople : people,
                        config.startDate,
                        config.endDate
                    );
                    break;
            }
            onClose();
        } catch (err) {
            console.error('Report Generation Error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    const reportTypes = [
        { id: 'yearly', title: 'Yearly Operational Audit', description: 'Comprehensive grid of attendance across the entire year.', icon: Calendar, color: 'var(--accent-primary)' },
        { id: 'directory', title: 'Personnel Directory', description: 'Official list of all active assets with contact and integration data.', icon: Users, color: 'var(--accent-green)' },
        { id: 'global_log', title: 'Global Activity Log', description: 'Master list of all interventions and operations since inception.', icon: FileText, color: 'var(--accent-blue)' },
        { id: 'custom', title: 'Tactical Custom Audit', description: 'Select specific assets and date ranges for a precision report.', icon: Settings, color: '#7928ca' }
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />

            <div className="glass" style={{
                width: '100%', maxWidth: '700px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                animation: 'paletteIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)', maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Dynamic Report Wizard</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phase 3: High-Fidelity Enterprise Exports</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {step === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Report Protocol</h3>
                            {reportTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => { setReportType(type.id); setStep(2); }}
                                    className="glass hover-glow"
                                    style={{
                                        padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                                        display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', color: type.color, border: '1px solid var(--border-color)' }}>
                                        <type.icon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: '800', fontSize: '1.1rem' }}>{type.title}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{type.description}</p>
                                    </div>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>← CHANGE PROTOCOL</button>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.8rem' }}>CONFIGURE EXPORT</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Options based on type */}
                                {reportType === 'yearly' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Target Administrative Year</label>
                                        <input
                                            type="number"
                                            value={config.year}
                                            onChange={e => setConfig({ ...config, year: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                )}

                                {reportType === 'custom' && (
                                    <>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Start Date</label>
                                            <input type="date" value={config.startDate} onChange={e => setConfig({ ...config, startDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>End Date</label>
                                            <input type="date" value={config.endDate} onChange={e => setConfig({ ...config, endDate: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }} />
                                        </div>
                                    </>
                                )}

                                {(reportType === 'yearly' || reportType === 'directory') && (
                                    <div
                                        onClick={() => setConfig({ ...config, includeImages: !config.includeImages })}
                                        className="glass"
                                        style={{
                                            gridColumn: 'span 2', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <ImageIcon size={18} color={config.includeImages ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                                            <div>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Incorporate Personnel Visualization</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Include high-resolution headshots in the final document.</p>
                                            </div>
                                        </div>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: config.includeImages ? 'var(--accent-primary)' : 'transparent', borderColor: config.includeImages ? 'var(--accent-primary)' : 'var(--border-color)' }}>
                                            {config.includeImages && <Check size={14} color="black" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    {step === 2 && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                padding: '10px 24px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'black',
                                border: 'none', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            {isGenerating ? 'Compiling PDF...' : <><Download size={18} /> INITIATE EXPORT</>}
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes paletteIn {
                    from { transform: scale(0.95) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ReportWizard;
