import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = user?.role === 'admin'
        ? []
        : [
            ...(user?.role === 'teacher' ? [{ name: 'Dashboard', path: '/dashboard' }] : []),
            ...(user ? [{ name: 'Activity', path: '/activity' }] : []),
            ...(user && user?.role === 'teacher' ? [{ name: 'Student details', path: '/students' }] : []),
            ...(user ? [{ name: 'Announcements', path: '/announcements' }] : []),
            ...(user?.role === 'parent' || user?.role === 'teacher' ? [{ name: 'Attendance', path: '/attendance' }] : []),
            ...(user?.role === 'parent' ? [{ name: 'Feedback', path: '/feedback' }] : []),
          ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar-main" style={{
            background: 'var(--card-bg, #ffffff)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '1.25rem 0',
            minHeight: '72px',
            borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
            <div className="container navbar-container" style={{ padding: '0 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Row 1: Logo + name (left) | Hi + Logout (right) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textDecoration: 'none',
                            color: 'var(--primary)'
                        }}
                    >
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            background: 'var(--primary)',
                            color: 'white',
                            flexShrink: 0
                        }}>
                            <Sparkles size={22} strokeWidth={2.5} />
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Poppinz Preschool & Daycare
                        </span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {user ? (
                                <>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>Hi, {user?.full_name ?? user?.name}</span>
                                    <button onClick={logout} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem',
                                        background: '#f0f0f0', color: 'var(--text)', border: '1px solid #e0e0e0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                    <Link to="/login">
                                        <button style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem',
                                            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            <LogIn size={16} /> Login
                                        </button>
                                    </Link>
                                )}
                        </div>
                        {links.length > 0 && (
                        <div className="mobile-toggle" onClick={toggleMenu} style={{ cursor: 'pointer', color: 'var(--text)', padding: '0.35rem' }}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </div>
                        )}
                    </div>
                </div>

                {/* Row 2: Nav links below — only when logged in */}
                {links.length > 0 && (
                <div
                    className="desktop-menu navbar-links"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        flexWrap: 'wrap',
                        width: '100%',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                        gap: '0.5rem',
                    }}
                >
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar-link-item ${isActive ? 'navbar-link-active' : ''}`}
                                style={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: isActive ? 'var(--primary)' : 'var(--text)',
                                    padding: '0.6rem 1.25rem',
                                    textDecoration: 'none',
                                    borderRadius: '10px',
                                    background: isActive ? 'rgba(255,107,107,0.12)' : 'transparent',
                                    border: isActive ? '1px solid rgba(255,107,107,0.25)' : '1px solid transparent',
                                    transition: 'color 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s',
                                }}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
                )}
            </div>

            {/* Mobile Menu — only when there are links */}
            {links.length > 0 && (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', background: 'var(--card-bg)', borderTop: '1px solid #eee' }}
                    >
                        <div className="container" style={{ display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
                            {links.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    style={{ padding: '1rem 0', fontWeight: 700, color: 'var(--text)', borderBottom: '1px solid #f0f0f0' }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {user ? (
                                <button onClick={() => { logout(); setIsOpen(false); }} style={{ marginTop: '1rem', background: '#eee', color: 'var(--text)', width: '100%', padding: '1rem 0', fontWeight: 700 }}>
                                    Logout
                                </button>
                            ) : (
                                <Link to="/login" onClick={() => setIsOpen(false)} style={{ padding: '1rem 0', color: 'var(--primary)', fontWeight: 800 }}>
                                    Teacher Login
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* Styles for responsive hiding are needed in CSS usually, but I'll add inline style handling or rely on media queries in index.css */}
            <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
        .navbar-main .navbar-link-item:hover {
          background: rgba(255,107,107,0.08) !important;
          color: var(--primary) !important;
          border-color: rgba(255,107,107,0.15) !important;
        }
        .navbar-main .navbar-link-item.navbar-link-active:hover {
          background: rgba(255,107,107,0.18) !important;
          border-color: rgba(255,107,107,0.35) !important;
          box-shadow: 0 2px 8px rgba(255,107,107,0.15);
        }
        .navbar-main button:hover { opacity: 0.9; transform: translateY(-1px); }
        .navbar-main button:active { transform: translateY(0); }
      `}</style>
        </nav>
    );
};

export default Navbar;
