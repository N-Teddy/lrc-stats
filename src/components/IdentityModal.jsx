import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { auditService } from '../store/auditService';

const IdentityModal = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const identity = auditService.getUserIdentity();
        if (!identity) {
            setIsVisible(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && email.trim()) {
            auditService.setUserIdentity(name, email);
            auditService.log('LOGIN', 'SYSTEM', 'User Session Started');
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass animate-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '40px',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <ShieldCheck size={32} color="var(--accent-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Tactical Identity</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Please identify yourself to access the LRC Stats Command Center. This is required for audit trail consistency.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Jean Dupont"
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 40px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@lrc-africa.org"
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 40px',
                                    borderRadius: '12px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '10px',
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--accent-primary)',
                            color: 'black',
                            fontWeight: '800',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
                        }}
                    >
                        Initialize Session <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ marginTop: '24px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Device Authorization: <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{auditService.getDeviceId()}</span>
                </p>
            </div>
        </div>
    );
};

export default IdentityModal;
