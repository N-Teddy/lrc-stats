import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, label, placeholder = 'Select option...', icon: Icon, searchable = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [search, setSearch] = useState('');

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
    const displayValue = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : opt;
        return label.toLowerCase().includes(search.toLowerCase());
    });

    const handleSelect = (opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        onChange(val);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            {label && (
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                    {label}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="glass"
                style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'var(--bg-tertiary)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {Icon && <Icon size={16} color={isOpen ? 'var(--accent-primary)' : 'var(--text-muted)'} />}
                    <span style={{ fontSize: '0.9rem', color: displayValue ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {displayValue || placeholder}
                    </span>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
            </div>

            {isOpen && (
                <div
                    className="glass"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                        zIndex: 1000,
                        maxHeight: '240px',
                        overflowY: 'auto',
                        padding: '4px',
                        animation: 'paletteIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                >
                    {searchable && options.length > 8 && (
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                            <input
                                autoFocus
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Filter..."
                                onClick={e => e.stopPropagation()}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '0.8rem' }}
                            />
                        </div>
                    )}
                    {filteredOptions.length === 0 ? (
                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>No options found</div>
                    ) : (
                        filteredOptions.map((opt, i) => {
                            const optVal = typeof opt === 'object' ? opt.value : opt;
                            const optLabel = typeof opt === 'object' ? opt.label : opt;
                            const isActive = optVal === value;

                            return (
                                <div
                                    key={i}
                                    onClick={() => handleSelect(opt)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: isActive ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                                        color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                                        transition: 'background 0.1s'
                                    }}
                                    onMouseOver={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                                    onMouseOut={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>{optLabel}</span>
                                    {isActive && <Check size={14} />}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
