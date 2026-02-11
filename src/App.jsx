import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import PeopleModule from './modules/PeopleModule';
import ActivitiesModule from './modules/ActivitiesModule';
import AttendanceModule from './modules/AttendanceModule';
import StatsModule from './modules/StatsModule';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleTrackAttendance = (activity) => {
        setSelectedActivity(activity);
        setActiveTab('attendance');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'people':
                return <PeopleModule />;
            case 'activities':
                return <ActivitiesModule onTrackAttendance={handleTrackAttendance} />;
            case 'attendance':
                return <AttendanceModule
                    activity={selectedActivity}
                    onBack={() => setActiveTab('activities')}
                />;
            case 'stats':
                return <StatsModule />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <Layout activeTab={activeTab === 'attendance' ? 'activities' : activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </Layout>
    );
}

export default App;
