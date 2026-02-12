import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Calendar, Command, X } from 'lucide-react';
import { dataService } from '../store/dataService';

const CommandPalette = ({ isOpen, onClose, onNavigate }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState({ people: [], activities: [] });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            loadResults();
        } else {
            setSearch('');
        }
    }, [isOpen]);

    const loadResults = async () => {
        const [people, activities] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities()
        ]);

        const filteredPeople = people
            .filter(p => !p.isArchived && p.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 5);

        const filteredActivities = activities
            .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 5);

        setResults({ people: filteredPeople, activities: filteredActivities });
        setSelectedIndex(0);
    };

    useEffect(() => {
        loadResults();
    }, [search]);

    const handleKeyDown = (e) => {
        const total = results.people.length + results.activities.length;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % total);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + total) % total);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = () => {
        const totalPeople = results.people.length;
        if (selectedIndex < totalPeople) {
            const person = results.people[selectedIndex];
            onNavigate('person-detail', person.id);
        } else {
            const activity = results.activities[selectedIndex - totalPeople];
            onNavigate('activity-detail', activity);
        }
        onClose();
    };

    if (!isOpen) return null;

    const allItems = [...results.people.map(p => ({ ...p, type: 'person' })), ...results.activities.map(a => ({ ...a, type: 'activity' }))];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />

            <div className="glass" style={{
                width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                animation: 'paletteIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <Search size={22} color="var(--accent-primary)" style={{ marginRight: '16px' }} />
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for missions, personnel, or commands..."
                        style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1.2rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <div style={{ padding: '4px 8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESC</div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {allItems.length > 0 ? (
                        <div style={{ padding: '8px' }}>
                            {results.people.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 12px' }}>Personnel Intelligence</h4>
                                    {results.people.map((p, i) => (
                                        <div
                                            key={p.id}
                                            onClick={() => { onNavigate('person-detail', p.id); onClose(); }}
                                            style={{
                                                padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                                                backgroundColor: selectedIndex === i ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                                                border: selectedIndex === i ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={18} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.status} • Tactical Profile</p>
                                            </div>
                                            {selectedIndex === i && <Command size={14} color="var(--accent-primary)" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.activities.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 12px' }}>Operational History</h4>
                                    {results.activities.map((a, i) => {
                                        const idx = i + results.people.length;
                                        return (
                                            <div
                                                key={a.id}
                                                onClick={() => { onNavigate('activity-detail', a); onClose(); }}
                                                style={{
                                                    padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                                                    backgroundColor: selectedIndex === idx ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                                                    border: selectedIndex === idx ? '1px solid var(--accent-primary)' : '1px solid transparent'
                                                }}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                            >
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={18} color="var(--accent-primary)" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{a.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.date} • Operation Log</p>
                                                </div>
                                                {selectedIndex === idx && <Command size={14} color="var(--accent-primary)" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No results match your current tactical search.</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ padding: '2px 4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', fontSize: '0.6rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>↑↓</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Navigate</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ padding: '2px 4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', fontSize: '0.6rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>ENTER</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Select</span>
                        </div>
                    </div>
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

export default CommandPalette;
