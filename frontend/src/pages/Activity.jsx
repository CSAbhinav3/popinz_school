import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Edit2, Calendar, X, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITY_CATEGORIES = ['Art', 'Music', 'Outdoor', 'Story Time', 'Science', 'Play', 'Other'];

const Activity = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState(() => {
        const saved = localStorage.getItem('activities');
        return saved ? JSON.parse(saved) : [];
    });
    const [lightboxActivity, setLightboxActivity] = useState(null);

    React.useEffect(() => {
        try {
            localStorage.setItem('activities', JSON.stringify(activities));
        } catch (e) {
            console.error('Failed to save activities to localStorage:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Storage limit reached! Please delete some activities or upload smaller images.');
            }
        }
    }, [activities]);

    const [isEditing, setIsEditing] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', image: '', date: new Date().toISOString().split('T')[0],
        category: 'Play'
    });
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const handleUpload = (e) => {
        e.preventDefault();
        const newActivity = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            date: formData.date,
            category: formData.category || 'Play',
            image: formData.image || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80"
        };
        setActivities([newActivity, ...activities]);
        setShowUpload(false);
        setFormData({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], category: 'Play' });
    };

    const startEdit = (activity) => {
        setIsEditing(activity.id);
        setFormData({
            title: activity.title,
            description: activity.description,
            image: activity.image,
            date: activity.date,
            category: activity.category || 'Play'
        });
        setShowUpload(true);
    };

    const handleUpdate = () => {
        setActivities(activities.map(a => a.id === isEditing ? { ...a, ...formData } : a));
        setIsEditing(null);
        setShowUpload(false);
        setFormData({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], category: 'Play' });
    };

    const handleDelete = (activity) => {
        if (!window.confirm(`Delete "${activity.title}"? This cannot be undone.`)) return;
        setActivities(activities.filter(a => a.id !== activity.id));
        if (isEditing === activity.id) {
            setIsEditing(null);
            setShowUpload(false);
            setFormData({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], category: 'Play' });
        }
    };

    const filteredActivities = activities.filter(a => {
        const matchDate = !filterDate || a.date === filterDate;
        const matchCategory = !filterCategory || (a.category || 'Other') === filterCategory;
        return matchDate && matchCategory;
    });

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            {/* Title */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Classroom Activities</h1>
            </div>

            {/* Filters + Add Activity — full width, one row */}
            <div style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '1rem',
                width: '100%',
                marginBottom: '2rem',
                flexWrap: 'nowrap',
            }}>
                {/* Category filter */}
                <div style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(255,230,109,0.06) 50%, rgba(78,205,196,0.06) 100%)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(255,107,107,0.08)',
                    border: '1px solid rgba(255,107,107,0.15)',
                    overflow: 'hidden',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', width: '100%' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>
                            <Filter size={18} color="var(--primary)" /> Category
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {['', ...ACTIVITY_CATEGORIES].map(cat => {
                            const isSelected = (filterCategory || '') === (cat || '');
                            return (
                            <button
                                key={cat || 'all'}
                                type="button"
                                onClick={() => setFilterCategory(cat)}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    borderRadius: '12px',
                                    border: isSelected ? 'none' : '1px solid rgba(255,107,107,0.2)',
                                    background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.7)',
                                    color: isSelected ? 'white' : 'var(--text)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s, color 0.2s, transform 0.15s',
                                    flexShrink: 0,
                                    boxShadow: isSelected ? '0 2px 8px rgba(255,107,107,0.3)' : 'none',
                                }}
                            >
                                {cat || 'All'}
                            </button>
                            );
                        })}
                        </div>
                    </div>
                </div>

                {/* Date filter */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'linear-gradient(135deg, rgba(78,205,196,0.08) 0%, rgba(255,230,109,0.06) 100%)',
                    padding: '0.5rem 1rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 12px rgba(78,205,196,0.1)',
                    border: '1px solid rgba(78,205,196,0.2)',
                    flexShrink: 0,
                }}>
                    <Calendar size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            background: 'transparent',
                            minWidth: '130px',
                        }}
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                background: '#f0f4f8',
                                color: '#555',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Upload / Add Activity button */}
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <button
                        onClick={() => { setShowUpload(!showUpload); setIsEditing(null); setFormData({ title: '', description: '', image: '', date: new Date().toISOString().split('T')[0], category: 'Play' }); }}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexShrink: 0,
                            padding: '0.5rem 1.25rem',
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        }}
                    >
                        <Upload size={18} /> {showUpload && !isEditing ? 'Cancel' : 'Upload Activity'}
                    </button>
                )}
            </div>

            {showUpload && (user?.role === 'teacher' || user?.role === 'admin') && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '3rem' }}
                >
                    <h2 style={{ marginBottom: '1rem' }}>{isEditing ? 'Edit Activity' : 'New Activity'}</h2>
                    <form onSubmit={(e) => { e.preventDefault(); isEditing ? handleUpdate() : handleUpload(e); }} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                required
                            />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '0.25rem' }}
                            >
                                {ACTIVITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <textarea
                            placeholder="What did the students do today?"
                            rows="3"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', fontFamily: 'inherit' }}
                            required
                        />
                        {/* Real File Upload */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image: reader.result });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                                required={!isEditing} // Required only for new uploads
                            />
                        </div>
                        {formData.image && (
                            <img src={formData.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                        )}

                        <button type="submit" style={{ background: 'var(--secondary)', color: 'white', justifySelf: 'start' }}>
                            {isEditing ? 'Update' : 'Post Activity'}
                        </button>
                    </form>
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {filteredActivities.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '3rem 2rem',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: '1px dashed #ddd'
                        }}
                    >
                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '1rem' }}>
                            {activities.length === 0
                                ? 'No activities yet. Teachers can post the first one!'
                                : filterCategory || filterDate
                                    ? `No activities ${filterCategory ? `in "${filterCategory}"` : `on ${filterDate}`}. Click "All" below to see everything, or try another filter.`
                                    : 'No activities to show.'}
                        </p>
                        {(filterCategory || filterDate) && (
                            <button
                                type="button"
                                onClick={() => { setFilterCategory(''); setFilterDate(''); }}
                                style={{ background: 'var(--primary)', color: 'white' }}
                            >
                                Show all activities
                            </button>
                        )}
                    </motion.div>
                ) : (
                    filteredActivities.map(activity => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                    >
                        <div
                            style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setLightboxActivity(activity)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setLightboxActivity(activity)}
                        >
                            <img src={activity.image} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', background: 'var(--secondary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '8px', fontWeight: 600 }}>
                                        {activity.category || 'Play'}
                                    </span>
                                    <h3 style={{ margin: '0.5rem 0 0 0' }}>{activity.title}</h3>
                                </div>
                                {(user?.role === 'teacher' || user?.role === 'admin') && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => startEdit(activity)} style={{ padding: '0.25rem', background: 'transparent', color: 'var(--primary)', boxShadow: 'none' }} title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(activity)} style={{ padding: '0.25rem', background: 'transparent', color: '#c53030', boxShadow: 'none' }} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                <Calendar size={14} /> {activity.date}
                            </div>
                            <p style={{ color: '#666', lineHeight: '1.5' }}>{activity.description}</p>
                        </div>
                    </motion.div>
                ))
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxActivity && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.9)',
                            zIndex: 3000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setLightboxActivity(null)}
                    >
                        <button
                            onClick={() => setLightboxActivity(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'white', color: '#333', padding: '0.5rem', borderRadius: '50%' }}
                            aria-label="Close"
                        >
                            <X size={28} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                        >
                            <img
                                src={lightboxActivity.image}
                                alt={lightboxActivity.title}
                                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }}
                            />
                            <p style={{ color: 'white', textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem' }}>{lightboxActivity.title}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Activity;
