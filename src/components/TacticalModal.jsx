import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const TacticalModal = () => {
    const [modal, setModal] = useState(null);

    useEffect(() => {
        const handleConfirm = (e) => {
            setModal(e.detail);
        };

        window.addEventListener('lrc-confirm', handleConfirm);
        return () => window.removeEventListener('lrc-confirm', handleConfirm);
    }, []);

    if (!modal) return null;

    const handleAction = (choice) => {
        modal.resolve(choice);
        setModal(null);
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
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="glass" style={{
                width: '400px',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                textAlign: 'center',
                animation: 'modalSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        padding: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 77, 77, 0.1)',
                        color: 'var(--accent-crimson)'
                    }}>
                        <ShieldAlert size={32} />
                    </div>
                </div>

                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-technical)'
                }}>
                    {modal.title.toUpperCase()}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    lineHeight: '1.5'
                }}>
                    {modal.body}
                </p>

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
                        {modal.cancelText}
                    </button>
                    <button
                        onClick={() => handleAction(true)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent-crimson)',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 12px rgba(255, 77, 77, 0.3)'
                        }}
                    >
                        {modal.confirmText}
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

export default TacticalModal;
