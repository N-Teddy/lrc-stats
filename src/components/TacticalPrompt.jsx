import React, { useState, useEffect, useRef } from 'react';
import { Key } from 'lucide-react';

const TacticalPrompt = () => {
    const [modal, setModal] = useState(null);
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const handlePrompt = (e) => {
            setModal(e.detail);
            setValue(e.detail.defaultValue || '');
        };

        window.addEventListener('lrc-prompt', handlePrompt);
        return () => window.removeEventListener('lrc-prompt', handlePrompt);
    }, []);

    useEffect(() => {
        if (modal && inputRef.current) {
            inputRef.current.focus();
        }
    }, [modal]);

    if (!modal) return null;

    const handleAction = (choice) => {
        if (choice) {
            modal.resolve(value);
        } else {
            modal.resolve(null);
        }
        setModal(null);
        setValue('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="glass" style={{
                width: '400px',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        padding: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)',
                        color: 'var(--accent-primary)'
                    }}>
                        <Key size={32} />
                    </div>
                </div>

                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-technical)',
                    textAlign: 'center'
                }}>
                    {modal.title.toUpperCase()}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    lineHeight: '1.5',
                    textAlign: 'center'
                }}>
                    {modal.body}
                </p>

                <div style={{ marginBottom: '32px' }}>
                    <input
                        ref={inputRef}
                        type={modal.inputType || 'text'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={modal.placeholder}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAction(true);
                            if (e.key === 'Escape') handleAction(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            outline: 'none',
                            textAlign: 'center'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => handleAction(false)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontWeight: '700',
                            fontSize: '0.85rem'
                        }}
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={() => handleAction(true)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-primary)',
                            color: 'black',
                            fontWeight: '800',
                            fontSize: '0.85rem'
                        }}
                    >
                        CONFIRM
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default TacticalPrompt;
