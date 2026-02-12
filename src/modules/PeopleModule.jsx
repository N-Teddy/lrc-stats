import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, Archive, Edit2, User, Phone, LayoutGrid, List, Eye, Download, Filter, Activity as PulseIcon, AlertTriangle, TrendingUp, Trash2 } from 'lucide-react';
import { dataService } from '../store/dataService';
import PersonForm from '../components/PersonForm';
import { reportService } from '../store/reportService';
import { convertFileSrc } from '@tauri-apps/api/core';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';
import ReportModal from '../components/ReportModal';
import { intelligenceService } from '../store/intelligenceService';

const PeopleModule = ({ onViewPerson }) => {
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('active');
    const [viewMode, setViewMode] = useState('grid');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [vitalityFilter, setVitalityFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('name');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        const data = await intelligenceService.getVitalityRankings();
        setPeople(data);
    };

    const handleSave = async (formData) => {
        let updatedPeople;
        const currentPeopleRaw = await dataService.getPeople();
        if (editingPerson) {
            updatedPeople = currentPeopleRaw.map(p => p.id === formData.id ? formData : p);
        } else {
            updatedPeople = [...currentPeopleRaw, formData];
        }
        await dataService.savePeople(updatedPeople);
        loadPeople();
        setIsFormOpen(false);
        setEditingPerson(null);
    };

    const handleArchive = async (id) => {
        const currentPeopleRaw = await dataService.getPeople();
        const updatedPeople = currentPeopleRaw.map(p =>
            p.id === id ? { ...p, isArchived: !p.isArchived } : p
        );
        await dataService.savePeople(updatedPeople);
        loadPeople();
        setActiveMenuId(null);
    };

    const handleSoftDelete = async (id) => {
        const currentPeopleRaw = await dataService.getPeople();
        const updatedPeople = currentPeopleRaw.map(p =>
            p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString() } : p
        );
        await dataService.savePeople(updatedPeople);
        loadPeople();
        setActiveMenuId(null);
    };

    const filteredPeople = people.filter(p => {
        if (p.isDeleted) return false;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesTab = filter === 'archived' ? p.isArchived : (filter === 'jrs' ? (!p.isArchived && p.isJRs) : !p.isArchived);
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesVitality = vitalityFilter === 'all' || p.vitality === vitalityFilter;

        return matchesSearch && matchesTab && matchesStatus && matchesVitality;
    }).sort((a, b) => {
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        if (sortOrder === 'vitality') {
            const weights = { 'Very Active': 3, 'Active': 2, 'Inactive': 1 };
            return weights[b.vitality] - weights[a.vitality];
        }
        return 0;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter, statusFilter, vitalityFilter, sortOrder]);

    const paginatedPeople = filteredPeople.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Tactical oversight of {people.length} organizational assets.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        style={{
                            backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Export Personnel Directory"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => { setEditingPerson(null); setIsFormOpen(true); }}
                        style={{
                            backgroundColor: 'var(--accent-primary)', color: 'black', padding: '12px 24px', borderRadius: 'var(--radius-md)',
                            fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(var(--accent-primary-rgb), 0.3)'
                        }}
                    >
                        <UserPlus size={20} /> Add Member
                    </button>
                </div>
            </header>

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="PERSONNEL DIRECTORY AUDIT"
                type="people"
                options={{
                    sortOptions: [
                        { label: 'Name', value: 'name' },
                        { label: 'Total Attendance', value: 'attendance' },
                        { label: 'Engagement Status', value: 'status' }
                    ]
                }}
                onGenerate={async (config) => {
                    setIsReportModalOpen(false);
                    await reportService.generateDirectoryReport(config);
                }}
            />

            <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search high-precision asset database..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: viewMode === 'table' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'table' ? 'var(--accent-primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px' }}>
                        <CustomSelect
                            value={filter}
                            onChange={setFilter}
                            options={[
                                { label: 'VIEW ALL ACTIVE', value: 'active' },
                                { label: 'VIEW JRs GROUP', value: 'jrs' },
                                { label: 'VIEW ARCHIVED', value: 'archived' }
                            ]}
                        />
                    </div>
                    <div style={{ width: '180px' }}>
                        <CustomSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            icon={Filter}
                            options={[
                                { label: 'ANY STATUS', value: 'all' },
                                { label: 'MEMBRES', value: 'Membre' },
                                { label: 'ELEVES', value: 'Eleve' }
                            ]}
                        />
                    </div>
                    <div style={{ width: '180px' }}>
                        <CustomSelect
                            value={vitalityFilter}
                            onChange={setVitalityFilter}
                            icon={PulseIcon}
                            options={[
                                { label: 'ANY VITALITY', value: 'all' },
                                { label: 'VERY ACTIVE', value: 'Very Active' },
                                { label: 'ACTIVE', value: 'Active' },
                                { label: 'INACTIVE', value: 'Inactive' }
                            ]}
                        />
                    </div>
                    <div style={{ width: '180px' }}>
                        <CustomSelect
                            value={sortOrder}
                            onChange={setSortOrder}
                            options={[
                                { label: 'SORT BY NAME', value: 'name' },
                                { label: 'SORT BY VITALITY', value: 'vitality' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {paginatedPeople.map((person, index) => (
                        <div
                            key={person.id}
                            className={`glass hover-glow animate-in stagger-${(index % 4) + 1}`}
                            style={{
                                padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative',
                                zIndex: activeMenuId === person.id ? 50 : 1
                            }}
                        >
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {person.image ? (
                                            <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : <User size={32} color="var(--text-muted)" />}
                                    </div>
                                    {person.forecastStatus === 'Drop Risk' && (
                                        <div style={{ position: 'absolute', top: '-8px', left: '-8px', backgroundColor: '#ff4d4d', color: 'white', padding: '4px', borderRadius: '50%', boxShadow: '0 0 10px rgba(255, 77, 77, 0.5)', animation: 'pulse 1.5s infinite' }}>
                                            <AlertTriangle size={14} />
                                        </div>
                                    )}
                                    {person.forecastStatus === 'Growing' && (
                                        <div style={{ position: 'absolute', top: '-8px', left: '-8px', backgroundColor: 'var(--accent-green)', color: 'white', padding: '4px', borderRadius: '50%', boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}>
                                            <TrendingUp size={14} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 onClick={() => onViewPerson(person.id)} style={{ fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer' }} className="hover-cyan">{person.name}</h3>
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.05)', color: person.vitalityColor || 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '900', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <PulseIcon size={10} /> {(person.vitality || 'ACTIVE').toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                                            {(person.status || 'Membre').toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{person.phone || 'No contact'}</p>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <button onClick={() => setActiveMenuId(activeMenuId === person.id ? null : person.id)} style={{ color: 'var(--text-muted)' }}><MoreVertical size={20} /></button>
                                    {activeMenuId === person.id && (
                                        <div className="glass" style={{ position: 'absolute', right: '0', top: '30px', width: '180px', borderRadius: 'var(--radius-md)', padding: '6px', zIndex: 100, border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                            <button onClick={() => { onViewPerson(person.id); setActiveMenuId(null); }} style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px', color: 'var(--accent-primary)' }}><Eye size={16} /> Analysis</button>
                                            <button onClick={() => { setEditingPerson(person); setIsFormOpen(true); setActiveMenuId(null); }} style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px' }}><Edit2 size={16} /> Edit Profile</button>
                                            <button onClick={() => handleArchive(person.id)} style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px' }}><Archive size={16} /> {person.isArchived ? 'Restore' : 'Archive'}</button>
                                            <button onClick={() => handleSoftDelete(person.id)} style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px', color: '#ff4d4d' }}><Trash2 size={16} /> Move to Trash</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Asset Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Vitality</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPeople.map(person => (
                                <tr key={person.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {person.image ? <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} color="var(--text-muted)" />}
                                            </div>
                                            <span style={{ fontWeight: '700' }}>{person.name}</span>
                                            {person.forecastStatus === 'Drop Risk' && <AlertTriangle size={14} color="#ff4d4d" style={{ marginLeft: '8px' }} />}
                                            {person.forecastStatus === 'Growing' && <TrendingUp size={14} color="var(--accent-green)" style={{ marginLeft: '8px' }} />}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <span style={{ color: person.vitalityColor, fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <PulseIcon size={12} /> {(person.vitality || 'ACTIVE').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{person.status}</td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => onViewPerson(person.id)} style={{ padding: '6px', color: 'var(--accent-primary)' }}><Eye size={16} /></button>
                                            <button onClick={() => { setEditingPerson(person); setIsFormOpen(true); }} style={{ padding: '6px', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredPeople.length > pageSize && (
                <Pagination currentPage={currentPage} totalItems={filteredPeople.length} pageSize={pageSize} onPageChange={setCurrentPage} />
            )}

            {filteredPeople.length === 0 && (
                <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <p>No organizational assets matching your criteria found.</p>
                </div>
            )}

            {isFormOpen && (
                <>
                    <div onClick={() => setIsFormOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
                    <PersonForm person={editingPerson} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
                </>
            )}

            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.1); opacity: 0.8; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .hover-cyan:hover { color: var(--accent-primary); }
            `}</style>
        </div>
    );
};

export default PeopleModule;
