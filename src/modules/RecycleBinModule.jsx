import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, User, Calendar, ShieldAlert, Search, Database } from 'lucide-react';
import { dataService } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import Pagination from '../components/Pagination';

const RecycleBinModule = () => {
    const [deletedAssets, setDeletedAssets] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, person, activity
    const [currentPage, setCurrentPage] = useState(1);
    const [isConfirmingAll, setIsConfirmingAll] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        loadDeletedAssets();
    }, []);

    const loadDeletedAssets = async () => {
        const [people, activities] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities()
        ]);

        const deletedPeople = people.filter(p => p.isDeleted).map(p => ({ ...p, assetType: 'person' }));
        const deletedActivities = activities.filter(a => a.isDeleted).map(a => ({ ...a, assetType: 'activity' }));

        const all = [...deletedPeople, ...deletedActivities].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        setDeletedAssets(all);
    };

    const handleRestore = async (asset) => {
        if (asset.assetType === 'person') {
            const people = await dataService.getPeople();
            const updated = people.map(p => p.id === asset.id ? { ...p, isDeleted: false, deletedAt: null } : p);
            await dataService.savePeople(updated);
            notificationService.notify('Asset Restored', `${asset.name} has been returned to the directory.`);
        } else {
            const activities = await dataService.getActivities();
            const updated = activities.map(a => a.id === asset.id ? { ...a, isDeleted: false, deletedAt: null } : a);
            await dataService.saveActivities(updated);
            notificationService.notify('Activity Restored', `${asset.name} has been returned to operations.`);
        }
        loadDeletedAssets();
    };

    const handlePermanentDelete = async (asset) => {
        if (!confirm(`Are you absolutely sure you want to permanently delete "${asset.name}"? This action is irreversible.`)) return;

        if (asset.assetType === 'person') {
            const people = await dataService.getPeople();
            const updated = people.filter(p => p.id !== asset.id);
            await dataService.savePeople(updated);
        } else {
            const activities = await dataService.getActivities();
            const updated = activities.filter(a => a.id !== asset.id);
            await dataService.saveActivities(updated);
        }
        loadDeletedAssets();
        notificationService.notify('Permanent Deletion', 'Asset has been shredded from the tactical database.');
    };

    const handleEmptyBin = async () => {
        if (!confirm('Shred ALL assets in the recycle bin? All data will be lost forever.')) return;

        const people = await dataService.getPeople();
        const activities = await dataService.getActivities();

        const cleanPeople = people.filter(p => !p.isDeleted);
        const cleanActivities = activities.filter(a => !a.isDeleted);

        await Promise.all([
            dataService.savePeople(cleanPeople),
            dataService.saveActivities(cleanActivities)
        ]);

        loadDeletedAssets();
        notificationService.notify('Data Sanitized', 'Recycle bin has been successfully purged.');
    };

    const filtered = deletedAssets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'all' || a.assetType === filter;
        return matchesSearch && matchesType;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Recycle Bin</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Tactical recovery area for soft-deleted organizational assets.</p>
                </div>
                {deletedAssets.length > 0 && (
                    <button
                        onClick={handleEmptyBin}
                        style={{
                            backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '12px 24px',
                            borderRadius: 'var(--radius-md)', fontWeight: '800', border: '1px solid rgba(255, 77, 77, 0.3)',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <Trash2 size={18} /> Empty Bin
                    </button>
                )}
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search deleted assets..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-color)' }}>
                    {['all', 'person', 'activity'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{
                                padding: '8px 16px', borderRadius: '4px', border: 'none',
                                backgroundColor: filter === t ? 'var(--bg-secondary)' : 'transparent',
                                color: filter === t ? 'var(--accent-primary)' : 'var(--text-muted)',
                                fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paginated.map((asset, index) => (
                    <div key={`${asset.assetType}-${asset.id}`} className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                {asset.assetType === 'person' ? <User size={20} color="var(--accent-primary)" /> : <Calendar size={20} color="var(--accent-green)" />}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{asset.name}</h3>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deleted: {new Date(asset.deletedAt).toLocaleString()}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{asset.assetType.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => handleRestore(asset)}
                                style={{
                                    padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)',
                                    color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
                                    backgroundColor: 'transparent', cursor: 'pointer'
                                }}
                            >
                                <RotateCcw size={16} /> Restore
                            </button>
                            <button
                                onClick={() => handlePermanentDelete(asset)}
                                style={{
                                    padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 77, 77, 0.3)',
                                    color: '#ff4d4d', backgroundColor: 'transparent', cursor: 'pointer'
                                }}
                                title="Delete Permanently"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="glass" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                        <ShieldAlert size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                        <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>Recycle Bin is Sanitary</h4>
                        <p style={{ fontSize: '0.9rem' }}>No recently deleted assets detected in the tactical database.</p>
                    </div>
                )}
            </div>

            <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default RecycleBinModule;
