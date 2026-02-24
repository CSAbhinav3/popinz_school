import React, { useState } from 'react';
import { Megaphone, Plus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ANNOUNCEMENT_TYPES = [
    { value: 'general', label: 'General', color: '#4ECDC4' },
    { value: 'event', label: 'Event', color: '#FFE66D' },
    { value: 'holiday', label: 'Holiday / Closure', color: '#FF6B6B' },
];

const Announcements = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState(() => {
        try {
            const saved = localStorage.getItem('announcements');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        type: 'general',
        date: new Date().toISOString().split('T')[0],
    });

    React.useEffect(() => {
        localStorage.setItem('announcements', JSON.stringify(announcements));
    }, [announcements]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newAnn = {
            id: Date.now(),
            ...formData,
            date: formData.date,
            createdBy: user?.name || 'Staff',
        };
        setAnnouncements([newAnn, ...announcements]);
        setShowForm(false);
        setFormData({ title: '', body: '', type: 'general', date: new Date().toISOString().split('T')[0] });
    };

    const canAdd = user?.role === 'teacher' || user?.role === 'admin';

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Megaphone size={32} color="var(--primary)" /> Announcements
                </h1>
                {canAdd && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={20} /> New Announcement
                    </button>
                )}
            </div>

            <AnimatePresence>
                {showForm && canAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            marginBottom: '2rem',
                        }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Post an announcement</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. School closed Monday"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', background: 'white' }}
                                >
                                    {ANNOUNCEMENT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd' }}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>Message</label>
                                <textarea
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    rows={4}
                                    placeholder="Full announcement text..."
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" style={{ background: 'var(--secondary)', color: 'white' }}>
                                    Publish
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#555' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '20px', color: '#888' }}>
                    <Megaphone size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No announcements yet. Check back soon!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {announcements.map((a) => {
                        const typeConfig = ANNOUNCEMENT_TYPES.find((t) => t.value === a.type) || ANNOUNCEMENT_TYPES[0];
                        return (
                            <motion.article
                                key={a.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                    borderLeft: `5px solid ${typeConfig.color}`,
                                }}
                            >
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                color: typeConfig.color,
                                            }}
                                        >
                                            {typeConfig.label}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: '#888' }}>
                                            <Calendar size={14} /> {a.date}
                                        </span>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{a.title}</h3>
                                    <p style={{ color: '#555', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{a.body}</p>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Announcements;
