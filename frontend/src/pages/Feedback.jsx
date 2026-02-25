import React, { useState } from 'react';
import { Send, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FEEDBACK_CATEGORIES = [
    { value: 'compliment', label: 'Compliment' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'concern', label: 'Concern' },
];

const Feedback = () => {
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('compliment');
    const [anonymous, setAnonymous] = useState(false);
    const parentNameDefault = user?.role === 'parent' ? (user?.full_name || user?.name || '') : '';

    const recentFeedbacks = (() => {
        try {
            const list = JSON.parse(localStorage.getItem('feedbacks') || '[]');
            return list.slice(0, 5);
        } catch {
            return [];
        }
    })();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const feedback = {
            id: Date.now(),
            parentName: anonymous ? 'Anonymous' : formData.get('parentName'),
            message: formData.get('message'),
            rating: rating || 5,
            category: category,
            date: new Date().toLocaleDateString(),
        };
        const existing = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        localStorage.setItem('feedbacks', JSON.stringify([feedback, ...existing]));
        setSubmitted(true);
        setRating(0);
        setHoverRating(0);
        setCategory('compliment');
        setAnonymous(false);
    };

    if (submitted) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div style={{ background: 'var(--secondary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                        <Star size={40} color="white" fill="white" />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>Thank You!</h2>
                    <p style={{ color: '#666' }}>Your feedback helps us grow.</p>
                    <button onClick={() => setSubmitted(false)} style={{ background: 'var(--primary)', color: 'white', marginTop: '2rem' }}>
                        Send Another
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>We'd Love to Hear From You</h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
                    How was your experience with Poppinz Preschool and Daycare?
                </p>

                {/* Recent feedback strip */}
                {recentFeedbacks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            padding: '1.25rem',
                            borderRadius: '16px',
                            marginBottom: '2rem',
                            border: '1px solid rgba(0,119,182,0.1)'
                        }}
                    >
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                            <MessageCircle size={20} /> What other parents are saying
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentFeedbacks.map((f) => (
                                <div key={f.id} style={{ background: 'white', padding: '0.75rem 1rem', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                        <span style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={14} color="#FFE66D" fill={s <= (f.rating || 5) ? '#FFE66D' : 'none'} />
                                            ))}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' }}>{f.category}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#999' }}>· {f.date}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
                                        "{f.message.length > 120 ? f.message.slice(0, 120) + '…' : f.message}"
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.35rem' }}>— {f.parentName}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>How would you rate us? *</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            padding: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Star
                                            size={36}
                                            color="#FFE66D"
                                            fill={(hoverRating || rating) >= star ? '#FFE66D' : 'none'}
                                            style={{ transition: 'transform 0.2s' }}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.35rem' }}>
                                {(hoverRating || rating) === 0 ? 'Click to rate' : (hoverRating || rating) === 5 ? 'We\'re so glad!' : `${hoverRating || rating} out of 5`}
                            </p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                            >
                                {FEEDBACK_CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Parent Name *</label>
                            {parentNameDefault && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                                    Submitting as parent
                                </p>
                            )}
                            <input
                                name="parentName"
                                type="text"
                                defaultValue={parentNameDefault}
                                disabled={anonymous}
                                required={!anonymous}
                                placeholder={anonymous ? 'Submitted anonymously' : 'Your name'}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    opacity: anonymous ? 0.7 : 1
                                }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', cursor: 'pointer' }}>
                                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                                Submit anonymously
                            </label>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Message *</label>
                            <textarea
                                name="message"
                                rows="4"
                                placeholder="Share your thoughts..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={rating === 0}
                            style={{
                                background: rating === 0 ? '#ccc' : 'var(--primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                                cursor: rating === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Send size={18} /> Send Feedback
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
