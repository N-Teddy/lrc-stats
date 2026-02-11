import React, { useState, useRef } from 'react';
import { X, User, Phone, Calendar, Shield, Save, Upload, Camera } from 'lucide-react';
import { dataService, createPersonModel } from '../store/dataService';

const PersonForm = ({ person, onSave, onCancel }) => {
    const [formData, setFormData] = useState(person || createPersonModel());
    const [previewImage, setPreviewImage] = useState(person?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Name is mandatory');
            return;
        }

        try {
            let finalData = { ...formData };

            // If a new image was selected, save it to the local folder
            if (imageFile && previewImage) {
                const result = await dataService.saveImage(formData.id, previewImage);
                if (result.success) {
                    finalData.image = result.url; // Use the custom path (lrc-img://...)
                }
            }

            console.log('[DEBUG] Form submission logic triggered with:', finalData);
            onSave(finalData);
        } catch (err) {
            console.error('Submission failed:', err);
            alert('Failed to save profile. Check the console for details.');
        }
    };

    return (
        <div className="glass" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            zIndex: 1000,
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            border: '1px solid #333'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                        {person ? 'Update Profile' : 'Member Registration'}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ID: {formData.id}
                    </p>
                </div>
                <button onClick={onCancel} style={{ color: '#444', padding: '8px', borderRadius: '50%', backgroundColor: '#111' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Profile Image Section */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '8px' }}>
                    <div
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#111',
                            border: '1px dashed #333',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'border-color 0.2s'
                        }}
                    >
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <>
                                <Camera size={24} color="#333" />
                                <span style={{ fontSize: '0.65rem', color: '#444', marginTop: '4px', fontWeight: 'bold' }}>PHOTO</span>
                            </>
                        )}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', textAlign: 'center'
                        }}>
                            <Upload size={12} color="white" />
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Profile Image</p>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                            Upload a portrait photo. Recommended size is square (e.g. 256x256).
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Name (Mandatory) */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Full Name *</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1a1a1a' }}>
                        <User size={18} color="#444" />
                        <input
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            placeholder="e.g. Jean Dupont"
                            style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '1rem', color: 'white', outline: 'none' }}
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Phone */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Phone</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1a1a1a' }}>
                            <Phone size={18} color="#444" />
                            <input
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="+237..."
                                style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.95rem', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>
                    {/* DOB */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Date of Birth</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#111', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1a1a1a' }}>
                            <Calendar size={18} color="#444" />
                            <input
                                name="dob"
                                type="date"
                                value={formData.dob || ''}
                                onChange={handleChange}
                                style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.95rem', color: 'white', colorScheme: 'dark', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Integration Date */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Integration Date</label>
                        <input
                            name="dateIntegration"
                            type="date"
                            value={formData.dateIntegration || ''}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: '#111', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1a1a1a', fontSize: '0.95rem', color: 'white', colorScheme: 'dark', outline: 'none' }}
                        />
                    </div>
                    {/* Departure Date */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>Departure</label>
                        <input
                            name="dateDeparture"
                            type="date"
                            value={formData.dateDeparture || ''}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: '#111', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #1a1a1a', fontSize: '0.95rem', color: 'white', colorScheme: 'dark', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* JRs Toggle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: 'rgba(57, 255, 20, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(57, 255, 20, 0.1)'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Shield size={20} color="var(--accent-green)" />
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-green)' }}>Junior Member (JRs)</p>
                            <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>Verify eligibility before toggling</p>
                        </div>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="isJRs"
                            checked={formData.isJRs || false}
                            onChange={handleChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                    <button
                        type="submit"
                        className="no-drag"
                        style={{
                            flex: 1,
                            backgroundColor: 'var(--accent-cyan)',
                            color: 'black',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '1rem',
                            boxShadow: '0 4px 20px rgba(0, 210, 255, 0.4)'
                        }}
                    >
                        <Save size={20} />
                        Save Profile
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="no-drag"
                        style={{ padding: '16px 24px', border: '1px solid #222', borderRadius: 'var(--radius-md)', color: '#666', fontWeight: '600' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <style>{`
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #1a1a1a; transition: .4s; border-radius: 24px; border: 1px solid #333; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: #444; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: rgba(57, 255, 20, 0.2); border-color: var(--accent-green); }
                input:checked + .slider:before { transform: translateX(20px); background-color: var(--accent-green); }
            `}</style>
        </div>
    );
};

export default PersonForm;
