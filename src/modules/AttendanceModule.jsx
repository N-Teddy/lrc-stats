import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Search, User, Filter, Save, Lock, Unlock } from 'lucide-react';
import { dataService } from '../store/dataService';
import { convertFileSrc } from '@tauri-apps/api/core';

const AttendanceModule = ({ activity, onBack }) => {
    const [people, setPeople] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        loadData();
    }, [activity]);

    const loadData = async () => {
        const [allPeople, allAttendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getAttendance()
        ]);

        // Only show people who are not archived
        const activePeople = allPeople.filter(p => !p.isArchived);
        setPeople(activePeople);

        // Find existing attendance for this activity
        const currentActivityAttendance = allAttendance.find(a => a.activityId === activity.id);
        if (currentActivityAttendance) {
            setSelectedIds(new Set(currentActivityAttendance.personIds));
            setIsLocked(!!currentActivityAttendance.isLocked);
        }
    };

    const togglePerson = (id) => {
        if (isLocked) return;
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleSave = async (shouldLock = false) => {
        if (isLocked && !shouldLock) return; // Prevent saving if already locked unless unlocking (not implemented yet)
        setIsSaving(true);
        try {
            const allAttendance = await dataService.getAttendance();
            const otherAttendance = allAttendance.filter(a => a.activityId !== activity.id);

            const newEntry = {
                activityId: activity.id,
                activityName: activity.name,
                date: activity.date,
                personIds: Array.from(selectedIds),
                count: selectedIds.size,
                isLocked: shouldLock || isLocked
            };

            await dataService.saveAttendance([...otherAttendance, newEntry]);
            alert(shouldLock ? 'Attendance finalized and locked.' : 'Attendance saved successfully!');
            onBack();
        } catch (err) {
            console.error(err);
            alert('Failed to save attendance.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPeople = people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <button
                onClick={onBack}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}
            >
                <ArrowLeft size={16} /> Back to Activities
            </button>

            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: isLocked ? '1px solid #ff4d4d' : '1px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.7rem', color: isLocked ? '#ff4d4d' : 'var(--accent-cyan)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLocked ? <><Lock size={12} /> Records Locked</> : <>Recording Attendance</>}
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '4px' }}>{activity.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{activity.date} • {activity.type}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Present</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: isLocked ? 'var(--text-muted)' : 'var(--accent-green)' }}>{selectedIds.size}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search people..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving || isLocked}
                    style={{
                        backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0 24px',
                        borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border-color)',
                        opacity: isLocked ? 0.5 : 1
                    }}
                >
                    <Save size={18} /> Save Progress
                </button>
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure? Locking attendance prevents further changes to this session.')) {
                            handleSave(true);
                        }
                    }}
                    disabled={isSaving || isLocked}
                    style={{
                        backgroundColor: isLocked ? 'var(--bg-tertiary)' : 'var(--accent-cyan)', color: 'black', padding: '0 32px',
                        borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        opacity: isLocked ? 0.5 : 1
                    }}
                >
                    {isSaving ? 'Processing...' : <><Lock size={18} /> Finalize & Lock</>}
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '12px'
            }}>
                {filteredPeople.map(person => {
                    const isSelected = selectedIds.has(person.id);
                    return (
                        <div
                            key={person.id}
                            onClick={() => togglePerson(person.id)}
                            className="glass"
                            style={{
                                padding: '16px 20px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: isLocked ? 'default' : 'pointer',
                                border: isSelected ? '1px solid var(--accent-green)' : '1px solid var(--border-color)',
                                backgroundColor: isSelected ? 'rgba(57, 255, 20, 0.05)' : 'transparent',
                                transition: 'all 0.2s',
                                opacity: isLocked && !isSelected ? 0.4 : 1
                            }}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {person.image ? (
                                    <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={20} color="var(--text-muted)" />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: isSelected ? 'var(--accent-green)' : 'var(--text-primary)' }}>{person.name}</p>
                                {person.isJRs && <span style={{ fontSize: '0.6rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>JRs</span>}
                            </div>
                            {isSelected && <Check size={20} color="var(--accent-green)" />}
                        </div>
                    );
                })}
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default AttendanceModule;
