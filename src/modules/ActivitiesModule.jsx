import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Tag, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { dataService, createActivityModel, ACTIVITY_TYPES } from '../store/dataService';

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
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid #333'
        }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>
                {activity ? 'Edit Activity' : 'New Activity'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Activity Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Monthly Reunion"
                        style={{ width: '100%', backgroundColor: '#111', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #222', color: 'white' }}
                        required
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Date</label>
                        <input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: '#111', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #222', color: 'white', colorScheme: 'dark' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: '#111', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #222', color: 'white' }}
                        >
                            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Notes (Optional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows="3"
                        style={{ width: '100%', backgroundColor: '#111', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #222', color: 'white', resize: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, backgroundColor: 'var(--accent-cyan)', color: 'black', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: '700' }}>Save Activity</button>
                    <button type="button" onClick={onCancel} style={{ padding: '12px 20px', border: '1px solid #222', borderRadius: 'var(--radius-md)', color: '#666' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

const ActivitiesModule = ({ onTrackAttendance }) => {
    const [activities, setActivities] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => { loadActivities(); }, []);

    const loadActivities = async () => {
        const data = await dataService.getActivities();
        setActivities(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };

    const handleSave = async (formData) => {
        const updated = editingActivity
            ? activities.map(a => a.id === formData.id ? formData : a)
            : [...activities, formData];
        await dataService.saveActivities(updated);
        setActivities(updated);
        setIsFormOpen(false);
    };

    const filtered = activities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Activities</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Log events and track participation history.</p>
                </div>
                <button
                    onClick={() => { setEditingActivity(null); setIsFormOpen(true); }}
                    style={{ backgroundColor: 'var(--accent-cyan)', color: 'black', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <Plus size={20} /> New Activity
                </button>
            </header>

            <div style={{ position: 'relative', marginBottom: '30px', backgroundColor: '#111', borderRadius: 'var(--radius-md)', border: '1px solid #222' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                <input
                    placeholder="Search activities..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '14px 14px 14px 48px', border: 'none', background: 'transparent', color: 'white' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(activity => (
                    <div key={activity.id} className="glass" style={{ padding: '20px 24px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ padding: '12px', backgroundColor: '#111', borderRadius: 'var(--radius-sm)', border: '1px solid #222' }}>
                                <Calendar size={20} color="var(--accent-cyan)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{activity.name}</h3>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> {activity.date}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {activity.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => onTrackAttendance(activity)}
                            style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Track Attendance <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#444', padding: '40px' }}>No activities found.</p>}
            </div>

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
