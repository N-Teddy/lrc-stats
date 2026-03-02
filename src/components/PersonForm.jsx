import React, { useState, useRef, useEffect } from 'react';
import { X, User, Phone, Calendar, Shield, Save, Upload, Camera } from 'lucide-react';
import { dataService, createPersonModel } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { useTranslation } from 'react-i18next';
import { convertFileSrc } from '@tauri-apps/api/core';

const PersonForm = ({ person, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(person || createPersonModel());
    const [previewImage, setPreviewImage] = useState(person?.image || null);
    const [isProcessing, setIsProcessing] = useState(false);
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
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                setPreviewImage(base64);
                console.log('[DEBUG] Image loaded into preview (base64 string starts with:', base64.substring(0, 30), ')');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return notificationService.notify(t('common.error'), t('person_form.name_required'), 'error');

        setIsProcessing(true);
        console.log('[DEBUG] Form submission started. Name:', formData.name);

        try {
            let finalData = { ...formData };

            // If a new image was selected (it will be a base64 string in previewImage)
            if (previewImage && previewImage.startsWith('data:image')) {
                console.log('[DEBUG] Attempting to save new image to local storage...');
                const result = await dataService.saveImage(formData.id, previewImage);

                if (result.success) {
                    console.log('[DEBUG] Image saved successfully. Path:', result.url);
                    finalData.image = result.url;
                } else {
                    console.error('[DEBUG] Image saving failed:', result.error);
                    notificationService.notify(t('common.error'), t('person_form.image_save_error') + ': ' + result.error, 'error');
                }
            } else {
                console.log('[DEBUG] No new image to save or image already in path format.');
            }

            console.log('[DEBUG] Calling onSave with final data:', finalData);
            await onSave(finalData);
        } catch (err) {
            console.error('[DEBUG] handleSubmit Exception:', err);
            notificationService.notify(t('common.error'), t('common.error'), 'error');
        } finally {
            setIsProcessing(false);
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
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                        {person ? t('person_form.update_title') : t('person_form.register_title')}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        ID: {formData.id}
                    </p>
                </div>
                <button onClick={onCancel} style={{ color: 'var(--text-muted)', padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }}><X size={20} /></button>
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
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px dashed var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'all 0.2s',
                            opacity: isProcessing ? 0.5 : 1
                        }}
                    >
                        {previewImage ? (
                            <img src={previewImage.startsWith('http') || previewImage.startsWith('data:') ? previewImage : convertFileSrc(previewImage)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <>
                                <Camera size={24} color="var(--border-color)" />
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 'bold' }}>PHOTO</span>
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
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('person_form.profile_image')}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {previewImage ? t('person_form.change_photo') : t('person_form.upload_photo')}
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

                {/* Name and Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{t('person_form.full_name')} *</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <User size={18} color="var(--text-muted)" />
                            <input
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder={t('person_form.name_placeholder')}
                                style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--text-primary)', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{t('person_form.status')}</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                backgroundColor: 'var(--bg-tertiary)',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="Membre">Membre</option>
                            <option value="Eleve">Eleve</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Phone */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('person_form.phone')}</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <Phone size={18} color="var(--text-muted)" />
                            <input
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleChange}
                                placeholder="+237..."
                                style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                    </div>
                    {/* DOB */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('person_form.dob')}</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <Calendar size={18} color="var(--text-muted)" />
                            <input
                                name="dob"
                                type="date"
                                value={formData.dob || ''}
                                onChange={handleChange}
                                style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--text-primary)', colorScheme: 'inherit', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Integration Date */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('person_form.integration_date')}</label>
                        <input
                            name="dateIntegration"
                            type="date"
                            value={formData.dateIntegration || ''}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-primary)', colorScheme: 'inherit', outline: 'none' }}
                        />
                    </div>
                    {/* Departure Date */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>{t('person_form.departure')}</label>
                        <input
                            name="dateDeparture"
                            type="date"
                            value={formData.dateDeparture || ''}
                            onChange={handleChange}
                            style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.95rem', color: 'var(--text-primary)', colorScheme: 'inherit', outline: 'none' }}
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
                            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-green)' }}>{t('person_form.jr_member')}</p>
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
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            backgroundColor: isProcessing ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                            color: 'var(--text-inverted)',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '1rem',
                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isProcessing ? t('person_form.processing') : <><Save size={20} /> {t('person_form.save_profile')}</>}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        style={{ padding: '16px 24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '600' }}
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>

            <style>{`
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-tertiary); transition: .4s; border-radius: 24px; border: 1px solid var(--border-color); }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: rgba(57, 255, 20, 0.2); border-color: var(--accent-green); }
                input:checked + .slider:before { transform: translateX(20px); background-color: var(--accent-green); }
            `}</style>
        </div>
    );
};

export default PersonForm;
