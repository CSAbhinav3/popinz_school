import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, User, Lock, CheckCircle, AlertCircle, Users, UserCog, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const Admin = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('teachers');

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [parentEmail, setParentEmail] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentPassword, setParentPassword] = useState('');
    const [parentLoading, setParentLoading] = useState(false);
    const [parentSuccess, setParentSuccess] = useState(false);
    const [parentError, setParentError] = useState('');

    const fetchUsers = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        setUsersLoading(true);
        try {
            const res = await fetch(`${API_URL}/users?limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (_) {
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleActive = async (u) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/users/${u.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ is_active: !u.is_active }),
            });
            if (res.ok) await fetchUsers();
        } catch (_) {}
    };

    const teachers = users.filter((u) => u.role === 'teacher');
    const parents = users.filter((u) => u.role === 'parent');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        if (!email.trim() || !fullName.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters with uppercase, lowercase, and a number.');
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) {
            setError('You must be logged in.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: email.trim(),
                    full_name: fullName.trim(),
                    password,
                    role: 'teacher',
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = Array.isArray(data.detail) ? data.detail.map((d) => d.msg || d).join(', ') : (data.detail || 'Failed to create teacher.');
                setError(msg);
                return;
            }
            setSuccess(true);
            setEmail('');
            setFullName('');
            setPassword('');
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Could not create teacher. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateParent = async (e) => {
        e.preventDefault();
        setParentError('');
        setParentSuccess(false);
        if (!parentEmail.trim() || !parentName.trim() || !parentPassword) {
            setParentError('Please fill in all fields.');
            return;
        }
        if (parentPassword.length < 6) {
            setParentError('Password must be at least 6 characters.');
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) {
            setParentError('You must be logged in.');
            return;
        }
        setParentLoading(true);
        try {
            const res = await fetch(`${API_URL}/users/create-parent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: parentEmail.trim(),
                    name: parentName.trim(),
                    password: parentPassword,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setParentError(data.detail || 'Failed to create parent account.');
                return;
            }
            setParentSuccess(true);
            setParentEmail('');
            setParentName('');
            setParentPassword('');
            fetchUsers();
        } catch (err) {
            setParentError(err.message || 'Could not reach server.');
        } finally {
            setParentLoading(false);
        }
    };

    const cardStyle = {
        background: 'var(--card-bg, #fff)',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        padding: '2rem',
        border: '1px solid rgba(0,0,0,0.06)',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        fontSize: '1rem',
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', maxWidth: '720px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Admin</h1>
                <p style={{ color: '#666', fontSize: '1rem' }}>Create and manage teacher and parent accounts.</p>
            </motion.div>

            {/* Tabs — equal width */}
            <div style={{ display: 'flex', width: '100%', marginBottom: '1.5rem', borderBottom: '2px solid #eee' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('teachers')}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1.25rem',
                        border: 'none',
                        background: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: activeTab === 'teachers' ? 'var(--primary)' : '#666',
                        borderBottom: activeTab === 'teachers' ? '2px solid var(--primary)' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                    }}
                >
                    <UserCog size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Teachers
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('parents')}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1.25rem',
                        border: 'none',
                        background: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: activeTab === 'parents' ? 'var(--secondary)' : '#666',
                        borderBottom: activeTab === 'parents' ? '2px solid var(--secondary)' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                    }}
                >
                    <Users size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Parents
                </button>
            </div>

            {/* Teachers tab */}
            {activeTab === 'teachers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={cardStyle}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Create Teacher</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Add a new teacher. They can log in with the email and password you set.</p>
                    {success && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(78, 205, 196, 0.15)', borderRadius: '12px', color: 'var(--secondary)', fontWeight: 600 }}>
                            <CheckCircle size={20} /> Teacher account created.
                        </div>
                    )}
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,107,107,0.1)', borderRadius: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><Mail size={18} /> Teacher email *</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@poppinz.com" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><User size={18} /> Full name *</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Teacher name" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><Lock size={18} /> Password *</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, uppercase, lowercase, number" required minLength={8} style={inputStyle} />
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.35rem' }}>At least 8 characters, one uppercase, one lowercase, one digit.</p>
                        </div>
                        <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem 1.25rem', background: loading ? '#ccc' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <UserPlus size={20} /> {loading ? 'Creating…' : 'Create Teacher'}
                        </button>
                    </form>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />

                    <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Teacher accounts</h3>
                    {usersLoading ? (
                        <p style={{ color: '#888' }}>Loading…</p>
                    ) : teachers.length === 0 ? (
                        <p style={{ color: '#888' }}>No teachers yet. Create one above.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {teachers.map((u) => (
                                <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div>
                                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.full_name}</span>
                                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>{u.email}</span>
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: u.is_active ? 'var(--secondary)' : '#999' }}>({u.is_active ? 'Active' : 'Inactive'})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleActive(u)}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: u.is_active ? 'rgba(255,107,107,0.15)' : 'rgba(78, 205, 196, 0.2)',
                                            color: u.is_active ? 'var(--primary)' : 'var(--secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                        }}
                                    >
                                        {u.is_active ? <><UserX size={16} /> Deactivate</> : <><UserCheck size={16} /> Activate</>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            )}

            {/* Parents tab */}
            {activeTab === 'parents' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={cardStyle}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Create Parent</h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Create login credentials for a parent. They can then log in and view their child&apos;s activity and attendance.</p>
                    {parentSuccess && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(78, 205, 196, 0.15)', borderRadius: '12px', color: 'var(--secondary)', fontWeight: 600 }}>
                            <CheckCircle size={20} /> Parent account created.
                        </div>
                    )}
                    {parentError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,107,107,0.1)', borderRadius: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                            <AlertCircle size={20} /> {parentError}
                        </div>
                    )}
                    <form onSubmit={handleCreateParent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><Mail size={18} /> Parent email *</label>
                            <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} placeholder="parent@poppinz.com" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><User size={18} /> Parent name *</label>
                            <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Jane Smith" required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><Lock size={18} /> Password *</label>
                            <input type="password" value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} style={inputStyle} />
                        </div>
                        <button type="submit" disabled={parentLoading} style={{ marginTop: '0.5rem', padding: '0.9rem 1.25rem', background: parentLoading ? '#ccc' : 'var(--secondary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: parentLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <UserPlus size={20} /> {parentLoading ? 'Creating…' : 'Create Parent'}
                        </button>
                    </form>

                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />

                    <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Parent accounts</h3>
                    {usersLoading ? (
                        <p style={{ color: '#888' }}>Loading…</p>
                    ) : parents.length === 0 ? (
                        <p style={{ color: '#888' }}>No parents yet. Create one above.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {parents.map((u) => (
                                <li key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div>
                                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.full_name}</span>
                                        <span style={{ color: '#666', marginLeft: '0.5rem' }}>{u.email}</span>
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: u.is_active ? 'var(--secondary)' : '#999' }}>({u.is_active ? 'Active' : 'Inactive'})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleActive(u)}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: u.is_active ? 'rgba(255,107,107,0.15)' : 'rgba(78, 205, 196, 0.2)',
                                            color: u.is_active ? 'var(--primary)' : 'var(--secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                        }}
                                    >
                                        {u.is_active ? <><UserX size={16} /> Deactivate</> : <><UserCheck size={16} /> Activate</>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Admin;
