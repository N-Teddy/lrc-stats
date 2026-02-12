import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import PeopleModule from './modules/PeopleModule';
import ActivitiesModule from './modules/ActivitiesModule';
import AttendanceModule from './modules/AttendanceModule';
import StatsModule from './modules/StatsModule';
import PersonDetailModule from './modules/PersonDetailModule';
import ActivityDetailModule from './modules/ActivityDetailModule';
import HistoryModule from './modules/HistoryModule';
import RecycleBinModule from './modules/RecycleBinModule';
import SettingsModule from './modules/SettingsModule';
import { notificationService } from './store/notificationService';
import { dataService } from './store/dataService';
import CommandPalette from './components/CommandPalette';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [analyzingActivity, setAnalyzingActivity] = useState(null);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    useEffect(() => {
        const initNotifications = async () => {
            const granted = await notificationService.init();
            if (granted) {
                const people = await dataService.getPeople();
                notificationService.checkBirthdays(people);
            }
        };

        const autoSync = async () => {
            const binId = localStorage.getItem('lrc_bin_id');
            const masterKey = localStorage.getItem('lrc_master_key');
            if (binId && masterKey) {
                console.log('Initiating Communal Silent Sync...');
                try {
                    const [people, activities, attendance] = await Promise.all([
                        dataService.getPeople(),
                        dataService.getActivities(),
                        dataService.getAttendance()
                    ]);
                    await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': masterKey,
                            'X-Bin-Versioning': 'false'
                        },
                        body: JSON.stringify({ people, activities, attendance, timestamp: Date.now() })
                    });
                    localStorage.setItem('lrc_last_sync', new Date().toLocaleString());
                } catch (err) {
                    console.warn('Communal Sync deferred: check network connectivity.', err);
                }
            }
        };

        initNotifications();
        autoSync();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handlePaletteNavigate = (view, data) => {
        if (view === 'person-detail') {
            handleViewPerson(data);
        } else if (view === 'activity-detail') {
            handleAnalyzeActivity(data);
        }
    };

    const handleTrackAttendance = (activity) => {
        setSelectedActivity(activity);
        setActiveTab('attendance');
    };

    const handleViewPerson = (personId) => {
        setSelectedPersonId(personId);
        setActiveTab('person-detail');
    };

    const handleAnalyzeActivity = (activity) => {
        setAnalyzingActivity(activity);
        setActiveTab('activity-detail');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'people':
                return <PeopleModule onViewPerson={handleViewPerson} />;
            case 'person-detail':
                return <PersonDetailModule
                    personId={selectedPersonId}
                    onBack={() => setActiveTab('people')}
                />;
            case 'activities':
                return <ActivitiesModule
                    onTrackAttendance={handleTrackAttendance}
                    onAnalyzeActivity={handleAnalyzeActivity}
                />;
            case 'activity-detail':
                return <ActivityDetailModule
                    activity={analyzingActivity}
                    onBack={() => setActiveTab('activities')}
                />;
            case 'logs':
                return <HistoryModule />;
            case 'attendance':
                return <AttendanceModule
                    activity={selectedActivity}
                    onBack={() => setActiveTab('activities')}
                />;
            case 'stats':
                return <StatsModule />;
            case 'settings':
                return <SettingsModule />;
            case 'trash':
                return <RecycleBinModule />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <Layout activeTab={activeTab === 'attendance' ? 'activities' : activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
            <CommandPalette
                isOpen={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                onNavigate={handlePaletteNavigate}
            />
        </Layout>
    );
}

export default App;
