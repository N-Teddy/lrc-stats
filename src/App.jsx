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
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [analyzingActivity, setAnalyzingActivity] = useState(null);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

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
        const checkForUpdates = async () => {
            try {
                const update = await check();
                if (update?.available) {
                    console.log(`Update ${update.version} available!`);
                    setPendingUpdate(update);
                }
            } catch (error) {
                console.error('Update check failed:', error);
            }
        };

        // Check for updates shortly after startup
        const timer = setTimeout(checkForUpdates, 3000);
        return () => clearTimeout(timer);
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

    const handleInstallUpdate = async () => {
        if (!pendingUpdate) return;
        try {
            setIsUpdating(true);
            await pendingUpdate.downloadAndInstall();
            await relaunch();
        } catch (error) {
            console.error('Failed to install update:', error);
            setIsUpdating(false);
        }
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
            {pendingUpdate && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-md bg-zinc-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Update Available</p>
                            <p className="text-xs text-zinc-400">Version {pendingUpdate.version} is ready for installation.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleInstallUpdate}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isUpdating
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
                            }`}
                    >
                        {isUpdating ? 'Installing...' : 'Install Now'}
                    </button>
                </div>
            )}
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
