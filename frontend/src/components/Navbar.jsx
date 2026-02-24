import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, User, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Activity', path: '/activity' },
        ...(user?.role !== 'parent' ? [{ name: 'Student details', path: '/students' }] : []),
        { name: 'Announcements', path: '/announcements' },
    ];

    if (user?.role === 'teacher' || user?.role === 'admin') {
        links.push({ name: 'Dashboard', path: '/dashboard' });
    }

    if (user?.role === 'parent' || user?.role === 'teacher' || user?.role === 'admin') {
        links.push({ name: 'Attendance', path: '/attendance' });
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar-main" style={{
            background: 'var(--card-bg)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0.75rem 0'
        }}>
            <div className="container" style={{ padding: '0 0.5rem' }}>
                {/* Site name on top */}
                <div style={{ textAlign: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Link to="/" style={{ display: 'inline-block', fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
                        Poppinz Preschool and Daycare
                    </Link>
                </div>

                {/* Nav row: links at start, auth at end — full width */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                    <div className="desktop-menu navbar-links" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="navbar-link-item"
                                    style={{
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        color: isActive ? 'var(--primary)' : 'var(--text)',
                                        position: 'relative',
                                        padding: '0.5rem 1rem',
                                        textDecoration: 'none',
                                        border: isActive ? '1px solid var(--primary)' : '1px solid #e0e0e0',
                                        borderRadius: '10px',
                                        background: isActive ? '#f5f0f0' : 'transparent'
                                    }}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {user ? (
                                <>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>Hi, {user?.full_name ?? user?.name}</span>
                                    <button onClick={logout} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem',
                                        background: '#f0f0f0', color: 'var(--text)', border: '1px solid #e0e0e0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login">
                                    <button style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem',
                                        background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <LogIn size={16} /> Login
                                    </button>
                                </Link>
                            )}
                        </div>
                        <div className="mobile-toggle" onClick={toggleMenu} style={{ cursor: 'pointer', color: 'var(--text)', padding: '0.25rem' }}>
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
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

            {/* Styles for responsive hiding are needed in CSS usually, but I'll add inline style handling or rely on media queries in index.css */}
            <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-toggle { display: none !important; }
        }
        .navbar-main .navbar-link-item:hover {
          background: #f0f0f0 !important;
          border-color: #d0d0d0 !important;
        }
        .navbar-main button:hover { opacity: 0.9; transform: translateY(-1px); }
        .navbar-main button:active { transform: translateY(0); }
      `}</style>
        </nav>
    );
};

export default Navbar;
