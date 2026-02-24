import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, Save, Gift, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function getUpcomingBirthdays(students, withinDays = 30) {
    const today = new Date();
    const result = [];
    students.forEach((s) => {
        if (!s.birthday) return;
        const parts = s.birthday.split('-').map(Number);
        const year = parts[0];
        const month = (parts[1] || 1) - 1;
        const day = parts[2] || 1;
        const bdayThisYear = new Date(today.getFullYear(), month, day);
        let diff = (bdayThisYear - today) / (1000 * 60 * 60 * 24);
        if (diff < 0) bdayThisYear.setFullYear(today.getFullYear() + 1);
        diff = (bdayThisYear - today) / (1000 * 60 * 60 * 24);
        if (diff >= 0 && diff <= withinDays)
            result.push({ ...s, nextBirthday: new Date(bdayThisYear), daysUntil: Math.round(diff) });
    });
    result.sort((a, b) => a.daysUntil - b.daysUntil);
    return result;
}

function formatBirthday(bday) {
    if (!bday) return '—';
    const [y, m, d] = bday.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1] || m} ${d}`;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const Students = () => {
    const { user } = useAuth();
    // Initial State: Load from localStorage or use empty array
    const [students, setStudents] = useState(() => {
        const saved = localStorage.getItem('students');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [createParentLogin, setCreateParentLogin] = useState(false);
    const [parentName, setParentName] = useState("");
    const [parentPassword, setParentPassword] = useState("");
    const [createParentError, setCreateParentError] = useState("");

    // Form State
    const [currentStudent, setCurrentStudent] = useState({
        id: null,
        name: '',
        section: 'Preschool',
        birthday: '',
        parentEmail: ''
    });

    // Save to LocalStorage whenever students change
    useEffect(() => {
        localStorage.setItem('students', JSON.stringify(students));
    }, [students]);

    // Handlers
    const handleAddNew = () => {
        setCurrentStudent({ id: null, name: '', section: 'Preschool', birthday: '', parentEmail: '' });
        setCreateParentLogin(false);
        setParentName("");
        setParentPassword("");
        setCreateParentError("");
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setCurrentStudent(student);
        setCreateParentLogin(false);
        setParentName("");
        setParentPassword("");
        setCreateParentError("");
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            setStudents(students.filter(s => s.id !== id));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!currentStudent.name || !currentStudent.section) {
            alert("Please fill in the required fields");
            return;
        }

        setCreateParentError("");

        if (!isEditing && createParentLogin && (currentStudent.parentEmail || parentName || parentPassword)) {
            const email = (currentStudent.parentEmail || "").trim();
            const name = (parentName || "").trim();
            const password = parentPassword;
            if (!email || !name || !password) {
                setCreateParentError("To create a parent login, please fill Parent email, Parent name, and Parent password.");
                return;
            }
            const token = localStorage.getItem("access_token");
            if (!token) {
                setCreateParentError("You must be logged in to create a parent account.");
                return;
            }
            try {
                const res = await fetch(`${API_URL}/users/create-parent`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, email, password }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setCreateParentError(data.detail || "Failed to create parent account.");
                    return;
                }
            } catch (err) {
                setCreateParentError(err.message || "Could not reach server.");
                return;
            }
        }

        if (isEditing) {
            const updated = { ...currentStudent, birthday: currentStudent.birthday || undefined };
            if (!updated.parentEmail) delete updated.parentEmail;
            setStudents(students.map(s => s.id === currentStudent.id ? updated : s));
        } else {
            const newStudent = { ...currentStudent, id: Date.now() };
            if (!newStudent.birthday) delete newStudent.birthday;
            if (!newStudent.parentEmail) delete newStudent.parentEmail;
            setStudents([...students, newStudent]);
        }
        setIsModalOpen(false);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.section?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const upcomingBirthdays = getUpcomingBirthdays(students, 30);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            {/* Upcoming birthdays */}
            {upcomingBirthdays.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, #FFF5E6 0%, #FFE66D33 100%)',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255,230,109,0.5)'
                    }}
                >
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                        <Gift size={22} color="var(--accent)" /> Upcoming birthdays (next 30 days)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {upcomingBirthdays.map((s) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span><strong>{s.name}</strong> <span style={{ color: '#666', fontSize: '0.9rem' }}>({s.section})</span></span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
                                    {formatBirthday(s.birthday)} — {s.daysUntil === 0 ? 'Today!' : s.daysUntil === 1 ? 'Tomorrow' : `in ${s.daysUntil} days`}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: 0 }}>Student Management</h1>
            </div>

            {/* Search bar + Add New Student — same row, full width */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: '100%',
                marginBottom: '2rem',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    background: 'white',
                    padding: '0.8rem 1.2rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                }}>
                    <Search size={20} color="#888" style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', outline: 'none', marginLeft: '0.8rem', width: '100%', fontSize: '1rem', color: 'var(--text)', background: 'transparent', minWidth: 0 }}
                    />
                </div>
                <button
                    onClick={handleAddNew}
                    style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, padding: '0.8rem 1.2rem', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                >
                    <Plus size={20} /> Add New Student
                </button>
            </div>

            {/* Students List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        <p>No students found.</p>
                    </div>
                ) : (
                    filteredStudents.map(student => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                borderLeft: '5px solid var(--primary)'
                            }}
                        >
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>{student.name}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.95rem', color: '#666' }}>
                                    <span><strong>Section:</strong> {student.section}</span>
                                    {student.parentEmail && <span><strong>Parent:</strong> {student.parentEmail}</span>}
                                    {student.birthday && <span><strong>Birthday:</strong> {formatBirthday(student.birthday)}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                    onClick={() => handleEdit(student)}
                                    style={{ padding: '0.6rem', background: '#F0FDF4', borderRadius: '10px', color: '#166534' }}
                                    title="Edit"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(student.id)}
                                    style={{ padding: '0.6rem', background: '#FEF2F2', borderRadius: '10px', color: '#991B1B' }}
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal for Add/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                        backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: 'white',
                                padding: '2.5rem',
                                borderRadius: '24px',
                                width: '90%',
                                maxWidth: '500px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    background: 'transparent',
                                    padding: '0.5rem'
                                }}
                            >
                                <X size={24} color="#666" />
                            </button>

                            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                {isEditing ? 'Edit Student Details' : 'Add New Student'}
                            </h2>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentStudent.name}
                                        onChange={e => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Section *</label>
                                    <select
                                        value={currentStudent.section}
                                        onChange={e => setCurrentStudent({ ...currentStudent, section: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', background: 'white' }}
                                        required
                                    >
                                        <option value="Preschool">Preschool</option>
                                        <option value="LKG">LKG</option>
                                        <option value="UKG">UKG</option>
                                    </select>
                                </div>
                                {(user?.role === 'teacher' || user?.role === 'admin') && !isEditing && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                type="checkbox"
                                                id="create-parent-login"
                                                checked={createParentLogin}
                                                onChange={e => setCreateParentLogin(e.target.checked)}
                                            />
                                            <label htmlFor="create-parent-login" style={{ fontWeight: 600, color: '#444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                <UserPlus size={18} /> Create parent login (create account for this email)
                                            </label>
                                        </div>
                                        {createParentLogin && (
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Parent email</label>
                                                    <input
                                                        type="email"
                                                        value={currentStudent.parentEmail || ''}
                                                        onChange={e => setCurrentStudent({ ...currentStudent, parentEmail: e.target.value.trim() })}
                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                                        placeholder="parent@example.com"
                                                    />
                                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>The email this parent uses to log in. They will only see this child in Attendance.</p>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Parent name *</label>
                                                    <input
                                                        type="text"
                                                        value={parentName}
                                                        onChange={e => setParentName(e.target.value)}
                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                                        placeholder="e.g. Jane Smith"
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Parent password *</label>
                                                    <input
                                                        type="password"
                                                        value={parentPassword}
                                                        onChange={e => setParentPassword(e.target.value)}
                                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                                        placeholder="Min 6 characters"
                                                    />
                                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>Parent will use this with the email above to log in.</p>
                                                </div>
                                            </>
                                        )}
                                        {createParentError && (
                                            <p style={{ fontSize: '0.9rem', color: '#b91c1c', margin: 0 }}>{createParentError}</p>
                                        )}
                                    </>
                                )}
                                {isEditing && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Parent email</label>
                                    <input
                                        type="email"
                                        value={currentStudent.parentEmail || ''}
                                        onChange={e => setCurrentStudent({ ...currentStudent, parentEmail: e.target.value.trim() })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        placeholder="parent@example.com"
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>The email this parent uses to log in. They will only see this child in Attendance.</p>
                                </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444' }}>Birthday (optional)</label>
                                    <input
                                        type="date"
                                        value={currentStudent.birthday || ''}
                                        onChange={e => setCurrentStudent({ ...currentStudent, birthday: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '1rem',
                                        background: 'var(--secondary)',
                                        color: 'white',
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Save size={20} /> {isEditing ? 'Save Changes' : 'Add Student'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Students;
