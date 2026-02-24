import React, { useState } from 'react';
import { UserCheck, CheckCircle, Search, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function getConsecutiveStreak(attendanceLog, studentId) {
    const presentDates = new Set(
        attendanceLog
            .filter(log => log.studentId === studentId)
            .map(log => log.date)
    );
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    const oneDay = 24 * 60 * 60 * 1000;
    let check = new Date(today);
    for (let i = 0; i < 365; i++) {
        const dStr = check.toISOString().split('T')[0];
        if (presentDates.has(dStr)) {
            streak++;
            check = new Date(check.getTime() - oneDay);
        } else break;
    }
    return streak;
}

function getLast10Days() {
    const days = [];
    const oneDay = 24 * 60 * 60 * 1000;
    for (let i = 9; i >= 0; i--) {
        const d = new Date(Date.now() - i * oneDay);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

function getStudentAttendanceStats(attendanceLog, studentId, last10Days, addedDateStr = null) {
    const presentSet = new Set(
        attendanceLog
            .filter(log => log.studentId === studentId)
            .map(log => log.date)
    );
    const statusByDay = last10Days.map(date => {
        const present = presentSet.has(date);
        const beforeEnrollment = addedDateStr ? date < addedDateStr : false;
        return { date, present, beforeEnrollment };
    });
    const trackedDays = statusByDay.filter(d => !d.beforeEnrollment);
    const presentCount = trackedDays.filter(d => d.present).length;
    const absentCount = trackedDays.length - presentCount;
    const totalTracked = trackedDays.length;
    const percent = totalTracked ? Math.round((presentCount / totalTracked) * 100) : 0;
    return { percent, presentCount, absentCount, totalDays: totalTracked, statusByDay };
}

const Attendance = () => {
    const { user } = useAuth();
    const [searchPending, setSearchPending] = useState("");
    const [searchTodayLog, setSearchTodayLog] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [attendanceLog, setAttendanceLog] = useState(() => {
        const saved = localStorage.getItem('attendance_log');
        return saved ? JSON.parse(saved) : [];
    });

    const [students] = useState(() => {
        const saved = localStorage.getItem('students');
        return saved ? JSON.parse(saved) : [];
    });

    // Parents see only their children (linked by parent email)
    const parentEmail = (user?.email || '').toLowerCase().trim();
    const studentsForView = (user?.role === 'parent' && parentEmail)
        ? students.filter(s => (s.parentEmail || '').toLowerCase().trim() === parentEmail)
        : students;

    // Save logs to localStorage
    React.useEffect(() => {
        try {
            localStorage.setItem('attendance_log', JSON.stringify(attendanceLog));
        } catch (e) {
            console.error('Failed to save attendance logs:', e);
        }
    }, [attendanceLog]);

    const handleCheckIn = (student) => {
        const alreadyCheckedIn = attendanceLog.some(
            log => log.studentId === student.id && log.date === new Date().toISOString().split('T')[0]
        );

        if (alreadyCheckedIn) {
            alert(`${student.name} is already checked in for today.`);
            return;
        }

        const newRecord = {
            id: Date.now(),
            studentId: student.id,
            name: student.name,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            status: "Present"
        };

        setAttendanceLog([newRecord, ...attendanceLog]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const today = new Date().toISOString().split('T')[0];
    const presentTodayIds = attendanceLog
        .filter(log => log.date === today)
        .map(log => log.studentId);

    const absentStudents = studentsForView.filter(s => !presentTodayIds.includes(s.id));

    const filteredAbsent = absentStudents.filter(s =>
        s.name.toLowerCase().includes(searchPending.toLowerCase()) ||
        s.section?.toLowerCase().includes(searchPending.toLowerCase())
    );

    const todayLogRecords = attendanceLog.filter(log => log.date === today);
    const matchesTodaySearch = (name, section) =>
        !searchTodayLog.trim() ||
        name.toLowerCase().includes(searchTodayLog.toLowerCase()) ||
        (section || '').toLowerCase().includes(searchTodayLog.toLowerCase());
    const filteredTodayLog = todayLogRecords.filter(record => {
        const student = students.find(s => s.id === record.studentId);
        return matchesTodaySearch(record.name, student?.section);
    });

    const last10Days = getLast10Days();
    const studentsForOverview = studentsForView;

    return (
        <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header — teacher/admin only; parent sees no "Daily Attendance" / "Mark your child..." */}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
                <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Daily Attendance</h1>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        Mark students present for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#999' }}>One check-in per student per day.</p>
                </header>
            )}

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        style={{
                            background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                            color: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 14px rgba(45, 212, 191, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <CheckCircle size={20} /> Attendance marked successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Student attendance overview — last 10 days + legend + summary stats */}
            {studentsForView.length > 0 && (
                <div style={{
                    background: 'white',
                    padding: '1.75rem',
                    borderRadius: '20px',
                    marginBottom: '1.5rem',
                    border: '1px solid #eee',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                }}>
                    <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>
                        <CheckCircle size={22} color="#14b8a6" /> Attendance overview
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.25rem' }}>
                        Last 10 school days. Hover over a day to see date and status.
                    </p>

                    {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>
                            <span style={{ width: 20, height: 20, borderRadius: 6, background: '#22c55e', display: 'inline-block' }} aria-hidden />
                            Present
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#b91c1c' }}>
                            <span style={{ width: 20, height: 20, borderRadius: 6, background: '#ef4444', display: 'inline-block' }} aria-hidden />
                            Absent
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>
                            <span style={{ width: 20, height: 20, borderRadius: 6, background: '#94a3b8', display: 'inline-block' }} aria-hidden />
                            Before enrollment
                        </span>
                    </div>

                    {studentsForOverview.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>No students to show.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {studentsForOverview.map(student => {
                                const addedDateStr = typeof student.id === 'number' && student.id >= 1e12
                                    ? new Date(student.id).toISOString().split('T')[0]
                                    : null;
                                const { percent, presentCount, absentCount, totalDays, statusByDay } = getStudentAttendanceStats(attendanceLog, student.id, last10Days, addedDateStr);
                                return (
                                    <div
                                        key={student.id}
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '16px',
                                            background: 'linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            gap: '1.5rem 2rem'
                                        }}
                                    >
                                        {/* Student & Class — left */}
                                        <div style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', marginTop: '0.2rem' }}>{student.name}</div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class</span>
                                                <div style={{ fontWeight: 600, fontSize: '1rem', color: '#475569', marginTop: '0.2rem' }}>{student.section || '—'}</div>
                                            </div>
                                        </div>

                                        {/* Summary stats — center, fills remaining space */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', flex: '2 1 280px', minWidth: 0 }}>
                                            <div style={{ padding: '0.6rem 1rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', minWidth: '100px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>Present</span>
                                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#059669' }}>{presentCount} <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#047857' }}>days</span></div>
                                            </div>
                                            <div style={{ padding: '0.6rem 1rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', minWidth: '100px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b' }}>Absent</span>
                                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#dc2626' }}>{absentCount} <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#b91c1c' }}>days</span></div>
                                            </div>
                                            <div style={{ padding: '0.6rem 1rem', background: percent >= 80 ? '#ecfdf5' : percent >= 50 ? '#fffbeb' : '#fef2f2', borderRadius: '10px', border: `1px solid ${percent >= 80 ? '#a7f3d0' : percent >= 50 ? '#fde68a' : '#fecaca'}`, minWidth: '100px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Attendance</span>
                                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: percent >= 80 ? '#059669' : percent >= 50 ? '#d97706' : '#b91c1c' }}>{percent}%</div>
                                            </div>
                                        </div>

                                        {/* Last 10 days dots — right */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flex: '1 1 200px', minWidth: 0 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Last 10 days:</span>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 28px)', gap: '0.5rem' }}>
                                            {statusByDay.map(({ date, present, beforeEnrollment }) => (
                                                <span
                                                    key={date}
                                                    title={beforeEnrollment ? `${date} — Before enrollment` : `${date} — ${present ? 'Present' : 'Absent'}`}
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 8,
                                                        background: beforeEnrollment ? '#94a3b8' : present ? '#22c55e' : '#ef4444',
                                                        flexShrink: 0,
                                                        display: 'inline-block',
                                                        boxShadow: beforeEnrollment ? '0 1px 2px rgba(148,163,184,0.3)' : present ? '0 1px 2px rgba(34,197,94,0.3)' : '0 1px 2px rgba(239,68,68,0.3)'
                                                    }}
                                                    aria-label={beforeEnrollment ? 'Before enrollment' : present ? 'Present' : 'Absent'}
                                                />
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {user?.role === 'parent' && students.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f9fafb', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #eee' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 600, margin: 0, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
                        No students are in the system yet. Ask the school (teacher or admin) to add students from Dashboard → Students. Once your child is added, their name will appear here.
                    </p>
                </div>
            )}
            {user?.role === 'parent' && students.length > 0 && studentsForView.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fef3f2', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
                    <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
                        No children linked to your account. Ask the school to add your email <strong>({user?.email})</strong> as the parent for your child in Dashboard → Students.
                    </p>
                </div>
            )}

            {/* Pending check-in + Today's log — teacher/admin only (parents cannot check in) */}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                margin: '0 auto'
            }}>
                {/* Check In List — teacher/admin only */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                        <UserCheck size={20} color="var(--primary)" /> Pending check-in
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fafafa',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        marginBottom: '1rem'
                    }}>
                        <Search size={16} color="#888" style={{ flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search by name or section..."
                            value={searchPending}
                            onChange={(e) => setSearchPending(e.target.value)}
                            style={{ border: 'none', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.9rem', color: 'var(--text)', background: 'transparent' }}
                        />
                    </div>
                    {filteredAbsent.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem', padding: '0.5rem 0', margin: 0 }}>
                            {students.length === 0
                                ? "No students yet. Add students in Dashboard → Students."
                                : searchPending
                                    ? "No students match your search."
                                    : "All students checked in."}
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {filteredAbsent.map(student => (
                                <div
                                    key={student.id}
                                    style={{
                                        padding: '1rem 1.1rem',
                                        border: '1px solid #eee',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: '#fafafa'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{student.section}</div>
                                    </div>
                                    <button
                                        onClick={() => handleCheckIn(student)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            background: 'var(--secondary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        Check in
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Log — teacher/admin only */}
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                        <CheckCircle size={20} color="#14b8a6" /> Today's log
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fafafa',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        marginBottom: '1rem'
                    }}>
                        <Search size={16} color="#888" style={{ flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search by name or section..."
                            value={searchTodayLog}
                            onChange={(e) => setSearchTodayLog(e.target.value)}
                            style={{ border: 'none', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.9rem', color: 'var(--text)', background: 'transparent' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {filteredTodayLog.map(record => {
                                const streak = getConsecutiveStreak(attendanceLog, record.studentId);
                                return (
                                    <div
                                        key={record.id}
                                        style={{
                                            padding: '1rem 1.1rem',
                                            border: '1px solid #eee',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: '#fafafa'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{record.name}</div>
                                            {streak > 1 && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                                                    <Flame size={12} /> {streak} day streak
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ color: '#666', fontWeight: 600, fontSize: '0.9rem' }}>{record.time}</span>
                                    </div>
                                );
                            })}
                        {filteredTodayLog.length === 0 && (
                            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem', padding: '0.5rem 0', margin: 0 }}>
                                {todayLogRecords.length === 0 ? "No check-ins yet today." : "No check-ins match your search."}
                            </p>
                        )}
                    </div>
                </div>
                )}
            </div>
            )}
        </div>
    );
};

export default Attendance;
