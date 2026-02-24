import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users, UserCheck, UserX, Activity, Megaphone, Gift,
    AlertCircle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function getUpcomingBirthdays(students, withinDays = 14) {
    const today = new Date();
    const result = [];
    students.forEach((s) => {
        if (!s.birthday) return;
        const parts = s.birthday.split('-').map(Number);
        const month = (parts[1] || 1) - 1;
        const day = parts[2] || 1;
        const bdayThisYear = new Date(today.getFullYear(), month, day);
        let diff = (bdayThisYear - today) / (1000 * 60 * 60 * 24);
        if (diff < 0) bdayThisYear.setFullYear(today.getFullYear() + 1);
        diff = (bdayThisYear - today) / (1000 * 60 * 60 * 24);
        if (diff >= 0 && diff <= withinDays)
            result.push({ ...s, daysUntil: Math.round(diff) });
    });
    result.sort((a, b) => a.daysUntil - b.daysUntil);
    return result;
}

function formatBirthday(bday) {
    if (!bday) return '—';
    const [, m, d] = bday.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1] || m} ${d}`;
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

const Dashboard = () => {
    const { user } = useAuth();

    const students = (() => {
        try { return JSON.parse(localStorage.getItem('students') || '[]'); } catch { return []; }
    })();
    const attendanceLog = (() => {
        try { return JSON.parse(localStorage.getItem('attendance_log') || '[]'); } catch { return []; }
    })();
    const activities = (() => {
        try { return JSON.parse(localStorage.getItem('activities') || '[]'); } catch { return []; }
    })();
    const announcements = (() => {
        try { return JSON.parse(localStorage.getItem('announcements') || '[]'); } catch { return []; }
    })();

    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendanceLog.filter(log => log.date === today);
    const presentTodayIds = new Set(presentToday.map(log => log.studentId));
    const absentToday = students.filter(s => !presentTodayIds.has(s.id));
    const totalStudents = students.length;
    const attendancePct = totalStudents > 0 ? Math.round((presentToday.length / totalStudents) * 100) : 0;

    const latestAnnouncements = announcements.slice(0, 3);
    const upcomingBirthdays = getUpcomingBirthdays(students, 14);
    const last7Days = getLast7Days();
    const attendanceByDay = last7Days.map(date => {
        const present = attendanceLog.filter(log => log.date === date).length;
        return { date, present, pct: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0 };
    });
    const weekPct = attendanceByDay.length
        ? Math.round(attendanceByDay.reduce((s, d) => s + d.pct, 0) / attendanceByDay.length)
        : 0;

    const studentsWithoutParent = students.filter(s => !(s.parentEmail || '').trim());
    const noAttendanceYet = totalStudents > 0 && presentToday.length === 0;
    const alerts = [];
    if (noAttendanceYet) alerts.push({ type: 'warning', msg: 'No attendance marked yet today.' });
    if (studentsWithoutParent.length > 0)
        alerts.push({ type: 'info', msg: `${studentsWithoutParent.length} student(s) not linked to a parent email.` });

    const cardStyle = {
        background: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #eee',
    };

    return (
        <div className="container" style={{ padding: '2rem 0 4rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Welcome, {user?.full_name ?? user?.name}!</h1>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {alerts.map((a, i) => (
                        <div
                            key={i}
                            style={{
                                ...cardStyle,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderLeft: `4px solid ${a.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                                background: a.type === 'warning' ? '#fffbeb' : '#eff6ff',
                            }}
                        >
                            <AlertCircle size={18} color={a.type === 'warning' ? '#f59e0b' : '#3b82f6'} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{a.msg}</span>
                            {a.type === 'info' && studentsWithoutParent.length > 0 && (
                                <Link to="/students" style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    Link in Student details →
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* All cards — three per row, same size */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {/* Stats */}
                <div style={{ ...cardStyle, borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                        <Users size={18} /> Total Students
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>{totalStudents}</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #4ECDC4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                        <UserCheck size={18} /> Today's Attendance
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ECDC4' }}>{attendancePct}%</div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{presentToday.length} present</div>
                </div>
                <div style={{ ...cardStyle, borderLeft: '4px solid #FF6B6B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                        <UserX size={18} /> Absent Today
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FF6B6B' }}>{absentToday.length}</div>
                </div>

                {/* Present today */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <UserCheck size={18} color="#4ECDC4" /> Present today
                    </h3>
                    {presentToday.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>No check-ins yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {presentToday.slice(0, 6).map(log => (
                                <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem' }}>
                                    <span>{log.name}</span>
                                    <span style={{ color: '#888' }}>{log.time}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {presentToday.length > 0 && (
                        <Link to="/attendance" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                            View all →
                        </Link>
                    )}
                </div>

                {/* Absent today */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <UserX size={18} color="#FF6B6B" /> Absent today
                    </h3>
                    {absentToday.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>All present.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {absentToday.slice(0, 6).map(s => (
                                <li key={s.id} style={{ padding: '0.35rem 0', fontSize: '0.9rem' }}>{s.name} <span style={{ color: '#888' }}>({s.section})</span></li>
                            ))}
                        </ul>
                    )}
                    {absentToday.length > 0 && (
                        <Link to="/attendance" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                            Mark attendance →
                        </Link>
                    )}
                </div>

                {/* Upcoming birthdays */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <Gift size={18} color="#f59e0b" /> Upcoming birthdays (14 days)
                    </h3>
                    {upcomingBirthdays.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>No birthdays in the next 14 days.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {upcomingBirthdays.slice(0, 5).map(s => (
                                <li key={s.id} style={{ padding: '0.35rem 0', fontSize: '0.9rem' }}>
                                    <strong>{s.name}</strong> — {formatBirthday(s.birthday)}
                                    {s.daysUntil === 0 ? ' (Today!)' : s.daysUntil === 1 ? ' (Tomorrow)' : ` (in ${s.daysUntil} days)`}
                                </li>
                            ))}
                        </ul>
                    )}
                    {upcomingBirthdays.length > 0 && (
                        <Link to="/students" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                            View students →
                        </Link>
                    )}
                </div>

                {/* Latest announcements */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <Megaphone size={18} color="#0077b6" /> Latest announcements
                    </h3>
                    {latestAnnouncements.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>No announcements yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {latestAnnouncements.map(a => (
                                <li key={a.id} style={{ padding: '0.35rem 0', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}>
                                    <strong>{a.title}</strong>
                                    <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' }}>{a.date}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link to="/announcements" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                        View all →
                    </Link>
                </div>

                {/* Attendance trend */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <TrendingUp size={18} color="#059669" /> Attendance trend
                    </h3>
                    <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        Last 7 days average: <strong style={{ color: '#059669' }}>{weekPct}%</strong>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: 56 }}>
                        {attendanceByDay.map((d) => (
                            <div
                                key={d.date}
                                title={`${d.date}: ${d.pct}%`}
                                style={{
                                    flex: 1,
                                    background: d.pct >= 80 ? '#22c55e' : d.pct >= 50 ? '#eab308' : '#ef4444',
                                    borderRadius: '4px 4px 0 0',
                                    height: `${Math.max(8, d.pct)}%`,
                                    minHeight: 8,
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.35rem' }}>Last 7 days</div>
                </div>

                {/* Latest activity */}
                <div style={cardStyle}>
                    <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700 }}>
                        <Activity size={18} color="var(--primary)" /> Latest activity
                    </h3>
                    {activities.length > 0 && activities[0].image ? (
                        <>
                            <Link to="/activity" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                                <img src={activities[0].image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{activities[0].title}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{activities[0].date}</div>
                            </Link>
                            <Link to="/activity" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                View all →
                            </Link>
                        </>
                    ) : (
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>No activities yet.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
