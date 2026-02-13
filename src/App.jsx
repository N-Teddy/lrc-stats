import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard';
import PeopleModule from './modules/PeopleModule';
import ActivitiesModule from './modules/ActivitiesModule';
import AttendanceModule from './modules/AttendanceModule';
import StatsModule from './modules/StatsModule';
import PersonDetailModule from './modules/PersonDetailModule';
import ActivityDetailModule from './modules/ActivityDetailModule';
import AssistantModule from './modules/AssistantModule';
import AuditModule from './modules/AuditModule';
import RecycleBinModule from './modules/RecycleBinModule';
import SettingsModule from './modules/SettingsModule';
import IdentityModal from './components/IdentityModal';
import { ThemeProvider } from './store/ThemeContext';
import { notificationService } from './store/notificationService';
import { dataService } from './store/dataService';
import { syncService } from './store/syncService';
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
                const [people, activities, attendance] = await Promise.all([
                    dataService.getPeople(),
                    dataService.getActivities(),
                    dataService.getAttendance()
                ]);
                notificationService.checkBirthdays(people);
                notificationService.checkUnlockedActivities(activities, attendance);
            }
        };

        const autoSync = async () => {
            const envUrl = import.meta.env.VITE_SUPABASE_URL;
            const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const binId = localStorage.getItem('lrc_bin_id');
            const masterKey = localStorage.getItem('lrc_master_key');

            if (envUrl || (binId && masterKey)) {
                console.log('Initiating Tactical Cloud Sync...');
                try {
                    await syncService.sync();
                } catch (err) {
                    console.warn('Silent Sync deferred: check network connectivity.', err);
                }
            }
        };

        initNotifications();
        autoSync();

        // Daily Cron: Re-run checks every 24 hours
        const dailyCron = setInterval(initNotifications, 1000 * 60 * 60 * 24);
        return () => clearInterval(dailyCron);
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
                return <AuditModule />;
            case 'assistant':
                return <AssistantModule />;
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
            <IdentityModal />
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
