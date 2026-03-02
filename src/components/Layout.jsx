import Sidebar from './Sidebar';
import NotificationOverlay from './NotificationOverlay';
import TacticalModal from './TacticalModal';
import TacticalPrompt from './TacticalPrompt';

const Layout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <NotificationOverlay />
            <TacticalModal />
            <TacticalPrompt />
            <div className="title-bar-drag" />

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main style={{
                flex: 1,
                padding: '40px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-primary)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
