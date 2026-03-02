import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { auditService } from '../store/auditService';
import { devService } from '../store/devService';
import { useTranslation } from 'react-i18next';

const IdentityModal = () => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mode, setMode] = useState(null); // 'SANDBOX' or 'PRODUCTION'
    const [isVisible, setIsVisible] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        const identity = auditService.getUserIdentity();
        const existingMode = localStorage.getItem('lrc_operation_mode');
        if (!identity || !existingMode) {
            setIsVisible(true);
        }
    }, []);

    const handleOnboard = async (e) => {
        if (e) e.preventDefault();

        if (name.trim() && email.trim() && mode) {
            auditService.setUserIdentity(name, email);
            devService.setMode(mode);

            if (mode === 'SANDBOX') {
                setIsSeeding(true);
                await devService.generateSeed();
                setIsSeeding(false);
            }

            auditService.log('LOGIN', 'SYSTEM', `Mode: ${mode}`);
            setIsVisible(false);
            window.location.reload(); // Refresh to initialize SyncService correctly
        }
    };

    if (!isVisible) return null;

    const isFrench = i18n.language.startsWith('fr');

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
                maxWidth: '500px',
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
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
                        {isFrench ? 'Identité Tactique' : 'Tactical Identity'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isFrench
                            ? 'Veuillez vous identifier et choisir votre mode d\'opération.'
                            : 'Please identify yourself and choose your operational mode.'}
                    </p>
                </div>

                {!mode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => setMode('SANDBOX')}
                            className="glass hover-glow"
                            style={{
                                padding: '24px', borderRadius: '16px', textAlign: 'left',
                                border: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center'
                            }}
                        >
                            <div style={{ backgroundColor: 'rgba(255, 170, 0, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                <Sparkles size={24} color="#ffaa00" />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '800' }}>{isFrench ? 'Mode Bac à Sable' : 'Explorer Sandbox'}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {isFrench ? 'Tester avec 120 utilisateurs fictifs et données simulées.' : 'Test with 120 fake users and simulated analytics.'}
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('PRODUCTION')}
                            className="glass hover-glow"
                            style={{
                                padding: '24px', borderRadius: '16px', textAlign: 'left',
                                border: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center'
                            }}
                        >
                            <div style={{ backgroundColor: 'rgba(57, 255, 20, 0.1)', padding: '12px', borderRadius: '12px' }}>
                                <Globe size={24} color="var(--accent-green)" />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '800' }}>{isFrench ? 'Mode Production' : 'Connect Production'}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {isFrench ? 'Connecter votre Vault Supabase et utiliser vos vraies données.' : 'Connect your Supabase vault and use real community data.'}
                                </p>
                            </div>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: mode === 'SANDBOX' ? '#ffaa00' : 'var(--accent-green)' }}>
                                {mode === 'SANDBOX' ? 'SANDBOX MODE' : 'PRODUCTION MODE'}
                            </span>
                            <button type="button" onClick={() => setMode(null)} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                                {isFrench ? 'Changer' : 'Change'}
                            </button>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                                {isFrench ? 'Nom Complet' : 'Full Name'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jean Dupont"
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px',
                                        backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)', fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
                                {isFrench ? 'Adresse Email' : 'Email Address'}
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
                                        width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px',
                                        backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)', fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSeeding}
                            style={{
                                marginTop: '10px', padding: '16px', borderRadius: '12px',
                                backgroundColor: mode === 'SANDBOX' ? '#ffaa00' : 'var(--accent-primary)',
                                color: 'black', fontWeight: '800', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                opacity: isSeeding ? 0.7 : 1, transition: 'all 0.2s ease'
                            }}
                        >
                            {isSeeding ? (isFrench ? 'Initialisation...' : 'Seeding...') : (isFrench ? 'Accéder au Centre' : 'Launch Command Center')}
                            {!isSeeding && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '24px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {isFrench ? 'ID de l\'Appareil :' : 'Device Identity :'} <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{auditService.getDeviceId()}</span>
                </p>
            </div>
        </div>
    );
};

export default IdentityModal;
