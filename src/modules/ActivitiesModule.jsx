import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, BarChart3, ChevronRight, LayoutGrid, List, Trash2 } from 'lucide-react';
import { dataService, createActivityModel, ACTIVITY_TYPES } from '../store/dataService';
import CustomSelect from '../components/CustomSelect';
import Pagination from '../components/Pagination';

const ActivityForm = ({ activity, onSave, onCancel }) => {
    const [formData, setFormData] = useState(activity || createActivityModel());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return alert('Activity Name is required');
        onSave(formData);
    };

    return (
        <div className="glass" style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '450px', padding: '32px', borderRadius: 'var(--radius-lg)', zIndex: 1000,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid var(--border-color)'
        }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>
                {activity ? 'Edit Activity' : 'New Activity'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Activity Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Monthly Reunion"
                        style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        required
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
                        <input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        >
                            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Notes (Optional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, backgroundColor: 'var(--accent-primary)', color: 'black', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '700' }}>Save Activity</button>
                    <button type="button" onClick={onCancel} style={{ padding: '12px 20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

const ActivitiesModule = ({ onTrackAttendance, onAnalyzeActivity }) => {
    const [activities, setActivities] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [timelineFilter, setTimelineFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => { loadActivities(); }, []);

    const loadActivities = async () => {
        const data = await dataService.getActivities();
        setActivities(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const handleSave = async (formData) => {
        const updated = editingActivity
            ? activities.map(a => a.id === formData.id ? formData : a)
            : [...activities, formData];
        const sorted = updated.sort((a, b) => new Date(b.date) - new Date(a.date));
        await dataService.saveActivities(sorted);
        setActivities(sorted);
        setIsFormOpen(false);
    };

    const handleSoftDelete = async (id) => {
        const currentActivities = await dataService.getActivities();
        const updated = currentActivities.map(a =>
            a.id === id ? { ...a, isDeleted: true, deletedAt: new Date().toISOString() } : a
        );
        await dataService.saveActivities(updated);
        setActivities(updated.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const years = [...new Set(activities.map(a => new Date(a.date).getFullYear().toString()))].sort((a, b) => b - a);

    const filtered = activities.filter(a => {
        if (a.isDeleted) return false;
        const matchesYear = selectedYear === 'all' || new Date(a.date).getFullYear().toString() === selectedYear;
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || a.type === typeFilter;

        const isFuture = new Date(a.date) > new Date();
        const matchesTimeline = timelineFilter === 'all' ||
            (timelineFilter === 'past' && !isFuture) ||
            (timelineFilter === 'scheduled' && isFuture);

        return matchesYear && matchesSearch && matchesType && matchesTimeline;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedYear, typeFilter, timelineFilter]);

    const paginated = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Operations</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Log events and track participation history.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{ padding: '8px', borderRadius: '4px', backgroundColor: viewMode === 'list' ? 'var(--bg-secondary)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingActivity(null); setIsFormOpen(true); }}
                        style={{ backgroundColor: 'var(--accent-primary)', color: 'black', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <Plus size={20} /> New Activity
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
                <div style={{ position: 'relative', flex: 1, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        placeholder="Search high-precision operational database..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'var(--text-primary)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '140px' }}>
                        <CustomSelect
                            value={selectedYear}
                            onChange={setSelectedYear}
                            options={['all', ...years]}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <CustomSelect
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={['all', ...ACTIVITY_TYPES]}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <CustomSelect
                            value={timelineFilter}
                            onChange={setTimelineFilter}
                            options={[
                                { label: 'ALL LOGS', value: 'all' },
                                { label: 'PAST ONLY', value: 'past' },
                                { label: 'SCHEDULED', value: 'scheduled' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {paginated.map((activity, index) => (
                        <div key={activity.id} className="glass hover-glow animate-in" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                    <Calendar size={20} color="var(--accent-primary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{activity.name}</h3>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activity.date}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{activity.type.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => onAnalyzeActivity(activity)} style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', backgroundColor: 'transparent' }}><BarChart3 size={16} /></button>
                                <button onClick={() => handleSoftDelete(activity.id)} style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 77, 77, 0.3)', color: '#ff4d4d', backgroundColor: 'transparent' }}><Trash2 size={16} /></button>
                                <button onClick={() => onTrackAttendance(activity)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent' }}>Track <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {paginated.map((activity) => (
                        <div key={activity.id} className="glass hover-glow animate-in" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}><Calendar size={24} color="var(--accent-primary)" /></div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{activity.type.toUpperCase()}</span>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>{activity.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{activity.date}</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => onTrackAttendance(activity)} style={{ flex: 1, padding: '10px', backgroundColor: 'var(--accent-primary)', color: 'black', fontWeight: '800', borderRadius: 'var(--radius-sm)', border: 'none' }}>TRACK</button>
                                <button onClick={() => onAnalyzeActivity(activity)} style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', backgroundColor: 'transparent' }}><BarChart3 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} />

            {isFormOpen && (
                <>
                    <div onClick={() => setIsFormOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
                    <ActivityForm activity={editingActivity} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
                </>
            )}
        </div>
    );
};

export default ActivitiesModule;
