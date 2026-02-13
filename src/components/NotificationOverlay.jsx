import React, { useState, useEffect } from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const NotificationOverlay = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleNewNotification = (e) => {
            const { title, body, type = 'info' } = e.detail;
            const id = Date.now();

            setNotifications(prev => [...prev, { id, title, body, type }]);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                removeNotification(id);
            }, 10000);
        };

        window.addEventListener('lrc-notify', handleNewNotification);
        return () => window.removeEventListener('lrc-notify', handleNewNotification);
    }, []);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case 'success':
                return { icon: <CheckCircle size={20} />, color: 'var(--accent-green)' };
            case 'error':
                return { icon: <AlertTriangle size={20} />, color: 'var(--accent-crimson)' };
            case 'warning':
                return { icon: <AlertTriangle size={20} />, color: '#ffaa00' };
            default:
                return { icon: <Bell size={20} />, color: 'var(--accent-primary)' };
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '40px',
            right: '40px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none'
        }}>
            {notifications.map(n => {
                const config = getTypeConfig(n.type);
                return (
                    <div
                        key={n.id}
                        className="glass"
                        style={{
                            width: '320px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: `1px solid ${config.color}33`,
                            display: 'flex',
                            gap: '12px',
                            animation: 'slideIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            pointerEvents: 'auto',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 15px ${config.color}11`,
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(10, 10, 10, 0.9)'
                        }}
                    >
                        {/* Animated Progress Bar */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '3px',
                            backgroundColor: config.color,
                            animation: 'progress 10s linear forwards',
                            width: '100%'
                        }} />

                        <div style={{ color: config.color, marginTop: '2px' }}>
                            {config.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h4 style={{
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                marginBottom: '4px',
                                color: 'var(--text-primary)',
                                letterSpacing: '1px',
                                fontFamily: 'var(--font-technical)'
                            }}>
                                {n.title.toUpperCase()}
                            </h4>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.4'
                            }}>
                                {n.body}
                            </p>
                        </div>

                        <button
                            onClick={() => removeNotification(n.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 'fit-content'
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationOverlay;
