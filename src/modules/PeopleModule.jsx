import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, Shield, Archive, Edit2, Trash2, User, Phone, LayoutGrid, List } from 'lucide-react';
import { dataService, createPersonModel } from '../store/dataService';
import PersonForm from '../components/PersonForm';
import { convertFileSrc } from '@tauri-apps/api/core';

const PeopleModule = () => {
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('active');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        const data = await dataService.getPeople();
        setPeople(data);
    };

    const handleSave = async (formData) => {
        console.log('[DEBUG] handleSave triggered with:', formData);
        let updatedPeople;
        if (editingPerson) {
            updatedPeople = people.map(p => p.id === formData.id ? formData : p);
        } else {
            updatedPeople = [...people, formData];
        }

        console.log('[DEBUG] Saving updated people list (total:', updatedPeople.length, ')');
        const result = await dataService.savePeople(updatedPeople);
        console.log('[DEBUG] Save result:', result);

        setPeople(updatedPeople);
        setIsFormOpen(false);
        setEditingPerson(null);
    };

    const handleArchive = async (id) => {
        const updatedPeople = people.map(p =>
            p.id === id ? { ...p, isArchived: !p.isArchived } : p
        );
        await dataService.savePeople(updatedPeople);
        setPeople(updatedPeople);
        setActiveMenuId(null);
    };

    const filteredPeople = people.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        if (filter === 'archived') return matchesSearch && p.isArchived;
        if (filter === 'jrs') return matchesSearch && !p.isArchived && p.isJRs;
        return matchesSearch && !p.isArchived;
    });

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Manage {people.length} members across all categories.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'table' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingPerson(null); setIsFormOpen(true); }}
                        style={{
                            backgroundColor: 'var(--accent-cyan)',
                            color: 'black',
                            padding: '12px 24px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
                        }}
                    >
                        <UserPlus size={20} />
                        Add Member
                    </button>
                </div>
            </header>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-primary)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-color)' }}>
                    {['active', 'jrs', 'archived'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '25px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                                backgroundColor: filter === f ? 'var(--bg-secondary)' : 'transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content View */}
            {viewMode === 'grid' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredPeople.map((person, index) => (
                        <div
                            key={person.id}
                            className={`glass hover-glow animate-in stagger-${(index % 4) + 1}`}
                            style={{
                                padding: '24px',
                                borderRadius: 'var(--radius-lg)',
                                border: activeMenuId === person.id ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                                position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{
                                    width: '72px', height: '72px', borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '1px solid var(--border-color)', overflow: 'hidden'
                                }}>
                                    {person.image ? (
                                        <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={32} color={person.isJRs ? 'var(--accent-green)' : 'var(--border-color)'} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{person.name}</h3>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            background: person.status === 'Eleve' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(0, 210, 255, 0.1)',
                                            color: person.status === 'Eleve' ? '#ffaa00' : 'var(--accent-cyan)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: '900',
                                            border: person.status === 'Eleve' ? '1px solid rgba(255, 170, 0, 0.2)' : '1px solid rgba(0, 210, 255, 0.2)'
                                        }}>
                                            {(person.status || 'Membre').toUpperCase()}
                                        </span>
                                        {person.isJRs && (
                                            <span style={{ fontSize: '0.6rem', background: 'rgba(57, 255, 20, 0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: '900', border: '1px solid rgba(57, 255, 20, 0.2)' }}>JRS</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} /> {person.phone || 'N/A'}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Joined: {person.dateIntegration || '---'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setActiveMenuId(activeMenuId === person.id ? null : person.id)}
                                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {activeMenuId === person.id && (
                                        <div className="glass" style={{
                                            position: 'absolute', right: 0, top: '30px', width: '160px',
                                            borderRadius: 'var(--radius-md)', padding: '8px', zIndex: 10,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)'
                                        }}>
                                            <button
                                                onClick={() => { setEditingPerson(person); setIsFormOpen(true); setActiveMenuId(null); }}
                                                style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px' }}
                                            >
                                                <Edit2 size={16} /> Edit Profile
                                            </button>
                                            <button
                                                onClick={() => handleArchive(person.id)}
                                                style={{ width: '100%', textAlign: 'left', padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px', color: person.isArchived ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
                                            >
                                                <Archive size={16} /> {person.isArchived ? 'Restore' : 'Archive'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass animate-in" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phone</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Joined</th>
                                <th style={{ padding: '16px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPeople.map((person) => (
                                <tr key={person.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {person.image ? (
                                                    <img src={person.image.startsWith('http') || person.image.startsWith('data:') ? person.image : convertFileSrc(person.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <User size={16} color="var(--text-muted)" />}
                                            </div>
                                            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{person.name}</span>
                                            {person.isJRs && <span style={{ fontSize: '0.6rem', background: 'rgba(57, 255, 20, 0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontWeight: '900', border: '1px solid rgba(57, 255, 20, 0.2)', marginLeft: '8px' }}>JRS</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            color: person.status === 'Eleve' ? '#ffaa00' : 'var(--accent-cyan)',
                                            fontWeight: '800'
                                        }}>
                                            {(person.status || 'Membre').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{person.phone || '---'}</td>
                                    <td style={{ padding: '12px 24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{person.dateIntegration || '---'}</td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => { setEditingPerson(person); setIsFormOpen(true); }} style={{ padding: '6px', color: 'var(--text-muted)' }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleArchive(person.id)} style={{ padding: '6px', color: person.isArchived ? 'var(--accent-cyan)' : 'var(--text-muted)' }}><Archive size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredPeople.length === 0 && (
                <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                    <p>No members match your criteria.</p>
                </div>
            )}

            {isFormOpen && (
                <>
                    <div
                        onClick={() => setIsFormOpen(false)}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, backdropFilter: 'blur(4px)' }}
                    />
                    <PersonForm
                        person={editingPerson}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default PeopleModule;
