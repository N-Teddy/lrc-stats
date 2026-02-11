import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, Shield, Calendar, Phone, Mail, Archive } from 'lucide-react';
import { dataService, createPersonModel } from '../store/dataService';

const PeopleModule = () => {
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, archived, jrs

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        const data = await dataService.getPeople();
        setPeople(data);
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
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Manage members, status, and engagement levels.
                    </p>
                </div>
                <button
                    style={{
                        backgroundColor: 'var(--accent-cyan)',
                        color: 'black',
                        padding: '10px 20px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}
                >
                    <UserPlus size={18} />
                    Register Person
                </button>
            </header>

            <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '30px',
                alignItems: 'center'
            }}>
                <div style={{
                    position: 'relative',
                    flex: 1,
                    backgroundColor: '#111',
                    borderRadius: 'var(--radius-md)',
                    padding: '2px'
                }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {['active', 'jrs', 'archived'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                border: filter === f ? '1px solid var(--accent-cyan)' : '1px solid #222',
                                color: filter === f ? 'var(--accent-cyan)' : '#666',
                                backgroundColor: filter === f ? 'rgba(0, 210, 255, 0.05)' : 'transparent'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {filteredPeople.map(person => (
                    <div key={person.id} className="glass" style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        position: 'relative',
                        transition: 'transform var(--transition-fast)'
                    }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <UserPlus size={24} color="#333" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{person.name || 'Unnamed Person'}</h3>
                                    {person.isJRs && (
                                        <span style={{
                                            fontSize: '0.65rem',
                                            backgroundColor: 'rgba(57, 255, 20, 0.1)',
                                            color: 'var(--accent-green)',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: '800',
                                            border: '1px solid rgba(57, 255, 20, 0.2)'
                                        }}>JRS</span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {person.phone || 'No phone'}
                                </p>
                            </div>
                            <button style={{ color: '#444' }}><MoreVertical size={20} /></button>
                        </div>
                    </div>
                ))}

                {filteredPeople.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1',
                        padding: '100px 0',
                        textAlign: 'center',
                        color: '#333',
                        border: '2px dashed #111',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <p>No persons found in this category.</p>
                    </div>
                )}
            </div>

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
