import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, User, Calendar, ShieldAlert, Search, Database } from 'lucide-react';
import { dataService } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { useTranslation } from 'react-i18next';
import Pagination from '../components/Pagination';

const RecycleBinModule = () => {
    const { t } = useTranslation();
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
            notificationService.notify(t('recycle_bin.restore'), t('recycle_bin.restore_success_person', { name: asset.name }));
        } else {
            const activities = await dataService.getActivities();
            const updated = activities.map(a => a.id === asset.id ? { ...a, isDeleted: false, deletedAt: null } : a);
            await dataService.saveActivities(updated);
            notificationService.notify(t('recycle_bin.restore'), t('recycle_bin.restore_success_activity', { name: asset.name }));
        }
        loadDeletedAssets();
    };

    const handlePermanentDelete = async (asset) => {
        const confirmed = await notificationService.confirm(
            t('recycle_bin.delete_permanently'),
            t('recycle_bin.delete_permanent_confirm', { name: asset.name })
        );
        if (!confirmed) return;

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
        notificationService.notify(t('recycle_bin.delete_permanently'), t('recycle_bin.delete_permanent_success'));
    };

    const handleEmptyBin = async () => {
        const confirmed = await notificationService.confirm(
            t('recycle_bin.empty_bin'),
            t('recycle_bin.empty_bin_confirm')
        );
        if (!confirmed) return;

        const people = await dataService.getPeople();
        const activities = await dataService.getActivities();

        const cleanPeople = people.filter(p => !p.isDeleted);
        const cleanActivities = activities.filter(a => !a.isDeleted);

        await Promise.all([
            dataService.savePeople(cleanPeople),
            dataService.saveActivities(cleanActivities)
        ]);

        loadDeletedAssets();
        notificationService.notify(t('recycle_bin.empty_bin_success_title'), t('recycle_bin.empty_bin_success_msg'));
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
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}>{t('recycle_bin.title')}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('recycle_bin.subtitle')}</p>
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
                        <Trash2 size={18} /> {t('recycle_bin.empty_bin')}
                    </button>
                )}
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder={t('recycle_bin.search_placeholder')}
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-color)' }}>
                    {['all', 'person', 'activity'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '8px 16px', borderRadius: '4px', border: 'none',
                                backgroundColor: filter === type ? 'var(--bg-secondary)' : 'transparent',
                                color: filter === type ? 'var(--accent-primary)' : 'var(--text-muted)',
                                fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase'
                            }}
                        >
                            {t(`recycle_bin.filter_${type}`)}
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
                                <RotateCcw size={16} /> {t('recycle_bin.restore')}
                            </button>
                            <button
                                onClick={() => handlePermanentDelete(asset)}
                                style={{
                                    padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 77, 77, 0.3)',
                                    color: '#ff4d4d', backgroundColor: 'transparent', cursor: 'pointer'
                                }}
                                title={t('recycle_bin.delete_permanently')}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="glass" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                        <ShieldAlert size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                        <h4 style={{ fontWeight: '800', marginBottom: '8px' }}>{t('recycle_bin.bin_empty_title')}</h4>
                        <p style={{ fontSize: '0.9rem' }}>{t('recycle_bin.bin_empty_msg')}</p>
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
