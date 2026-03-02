import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Search, User, Filter, Save, Lock, LayoutGrid, List } from 'lucide-react';
import { dataService, PERSON_STATUS_TYPES, getActivityTypeKey } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';

const AttendanceModule = ({ activity, onBack }) => {
    const { t } = useTranslation();
    const [people, setPeople] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

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
            notificationService.notify(shouldLock ? t('attendance.locked') : t('attendance.recording'), shouldLock ? t('attendance.finalized_msg') : t('attendance.saved_msg'), 'success');
            onBack();
        } catch (err) {
            console.error(err);
            notificationService.notify(t('common.error'), 'Failed to save attendance.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPeople = people.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (p.status || 'Membre') === statusFilter;
        if (isLocked) {
            return matchesSearch && selectedIds.has(p.id) && matchesStatus;
        }
        return matchesSearch && matchesStatus;
    });

    const paginated = filteredPeople.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <button
                onClick={onBack}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}
            >
                <ArrowLeft size={16} /> {t('attendance.back')}
            </button>

            <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: isLocked ? '1px solid #ff4d4d' : '1px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.7rem', color: isLocked ? '#ff4d4d' : 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLocked ? <><Lock size={12} /> {t('attendance.locked')}</> : <>{t('attendance.recording')}</>}
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '4px' }}>{activity.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{activity.date} • {t(`activities.type_${getActivityTypeKey(activity.type)}`)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('attendance.present')}</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: '800', color: isLocked ? 'var(--text-muted)' : 'var(--accent-green)' }}>{selectedIds.size}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder={t('attendance.search_placeholder')}
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <div style={{ width: '160px' }}>
                    <CustomSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        searchable={false}
                        options={['all', ...PERSON_STATUS_TYPES].map(type =>
                            type === 'all'
                                ? { label: t('common.all').toUpperCase(), value: 'all' }
                                : { label: t(`directory.${type.toLowerCase()}`).toUpperCase(), value: type }
                        )}
                    />
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '4px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'list' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                    >
                        <List size={18} />
                    </button>
                </div>
                {!isLocked && (
                    <>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            style={{
                                backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '0 24px',
                                borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--border-color)'
                            }}
                        >
                            <Save size={18} /> {t('attendance.save')}
                        </button>
                        <button
                            onClick={async () => {
                                const confirmed = await notificationService.confirm(
                                    t('attendance.finalize'),
                                    t('attendance.finalize_confirm')
                                );
                                if (confirmed) {
                                    handleSave(true);
                                }
                            }}
                            disabled={isSaving}
                            style={{
                                backgroundColor: 'var(--accent-primary)', color: 'black', padding: '0 32px',
                                borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.95rem',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            {isSaving ? t('common.loading') : <><Lock size={18} /> {t('attendance.finalize')}</>}
                        </button>
                    </>
                )}
            </div>

            <div style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                flexDirection: viewMode === 'grid' ? 'unset' : 'column',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : 'unset',
                gap: '12px'
            }}>
                {paginated.map(person => {
                    const isSelected = selectedIds.has(person.id);
                    return (
                        <div
                            key={person.id}
                            onClick={() => togglePerson(person.id)}
                            className={`glass ${isLocked ? '' : 'hover-glow'}`}
                            style={{
                                padding: viewMode === 'grid' ? '16px 20px' : '12px 20px',
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
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{t(`directory.${(person.status || 'Membre').trim().toLowerCase()}`).toUpperCase()}</span>
                                    {person.isJRs && <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />}
                                    {person.isJRs && <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>JRs</span>}
                                </div>
                            </div>
                            {isSelected && <Check size={20} color="var(--accent-green)" />}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '30px' }}>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredPeople.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default AttendanceModule;
