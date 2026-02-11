import React from 'react';

function App() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#121212',
            color: '#00d2ff',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>LRC Stats</h1>
            <p style={{ fontSize: '1.2rem', color: '#888' }}>Phase 1: Project Setup Complete</p>
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#1e1e1e' }}>
                <p>✓ React 19 + Vite</p>
                <p>✓ Electron Core</p>
                <p>✓ Obsidian Tech Style Initialized</p>
            </div>
        </div>
    );
}

export default App;
