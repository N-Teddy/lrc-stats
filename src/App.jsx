import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import PeopleModule from './modules/PeopleModule';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'people':
                return <PeopleModule />;
            case 'activities':
                return (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h2 className="gradient-text" style={{ fontSize: '2rem' }}>Coming Soon</h2>
                        <p style={{ color: '#444' }}>Activity management module is scheduled for Phase 4.</p>
                    </div>
                );
            case 'stats':
                return (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <h2 className="gradient-text" style={{ fontSize: '2rem' }}>Coming Soon</h2>
                        <p style={{ color: '#444' }}>Statistics & visualization module is scheduled for Phase 5.</p>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </Layout>
    );
}

export default App;
