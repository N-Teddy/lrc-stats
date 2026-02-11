import React, { useEffect, useState } from 'react';
import { dataService } from './store/dataService';

function App() {
    const [dbStatus, setDbStatus] = useState({ loading: true, status: 'connecting' });
    const [counts, setCounts] = useState({ people: 0, activities: 0 });

    useEffect(() => {
        async function checkDb() {
            try {
                const people = await dataService.getPeople();
                const activities = await dataService.getActivities();
                setCounts({ people: people.length, activities: activities.length });
                setDbStatus({ loading: false, status: 'ready' });
            } catch (err) {
                setDbStatus({ loading: false, status: 'error' });
            }
        }
        checkDb();
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #00d2ff, #39ff14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
                LRC Stats
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#a0a0a0', marginBottom: '2.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Phase 2: Architecture & Data Layer
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                width: '450px'
            }}>
                <div style={{ padding: '2rem', border: '1px solid #222', borderRadius: '12px', backgroundColor: '#111', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <p style={{ color: '#00d2ff', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>PEOPLE ENTRIES</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{counts.people}</p>
                </div>
                <div style={{ padding: '2rem', border: '1px solid #222', borderRadius: '12px', backgroundColor: '#111', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    <p style={{ color: '#39ff14', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>ACTIVITY LOGS</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{counts.activities}</p>
                </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '20px', border: '1px solid #222', backgroundColor: '#050505' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dbStatus.status === 'ready' ? '#39ff14' : '#ff3131', boxShadow: dbStatus.status === 'ready' ? '0 0 10px #39ff14' : '0 0 10px #ff3131' }}></div>
                <p style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' }}>
                    System Engine: <span style={{ color: dbStatus.status === 'ready' ? '#39ff14' : '#ff3131' }}>{dbStatus.status}</span>
                </p>
            </div>
        </div>
    );
}

export default App;
