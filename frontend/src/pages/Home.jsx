import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Star, Heart, Clock, Mail, Phone, MapPin, User } from 'lucide-react';

const TEAM = [
    { name: 'Shruti', role: 'Principal', bio: 'Leads the school with vision and care for every child.' },
    { name: 'Pushpa', role: 'Academic Coordinator', bio: 'Designs curriculum and supports our teaching team.' },
    { name: 'Sindhu', role: 'Student Welfare & Programs', bio: 'Ensures a safe, inclusive environment for all children.' },
];

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin', { replace: true });
            return;
        }
        if (user?.role === 'teacher') {
            navigate('/dashboard', { replace: true });
            return;
        }
        if (location.hash === '#about') {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [user?.role, location.hash, navigate]);

    const scrollToAbout = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            {/* Hero */}
            <section style={{
                position: 'relative',
                background: `url('/hero-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: '8rem 0',
                textAlign: 'center',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 119, 182, 0.3) 100%)',
                    zIndex: 1,
                }} />
                <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '3.5rem', lineHeight: 1.1, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                    >
                        Welcome to <br /> Poppinz Preschool and Daycare
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontSize: '1.25rem', maxWidth: '600px', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}
                    >
                        Where every day is an adventure! We provide a nurturing environment for your child to learn, play, and grow.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'stretch', flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                        <button
                            type="button"
                            onClick={scrollToAbout}
                            style={{ background: 'var(--secondary)', color: 'white', padding: '0.75rem 1.5rem', minHeight: '48px', fontSize: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Learn More
                        </button>
                        <Link to="/login" style={{ display: 'block' }}>
                            <button style={{ background: 'white', color: 'var(--text)', border: '2px solid #eee', padding: '0.75rem 1.5rem', minHeight: '48px', fontSize: '1rem', borderRadius: '8px', cursor: 'pointer' }}>
                                Login
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Poppinz */}
            <section style={{ padding: '6rem 0', background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>Why Choose Poppinz?</h2>
                        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                            We create a space where learning feels like play and every child gets the attention they deserve.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <FeatureCard icon={<Star size={40} color="var(--primary)" />} title="Creative Learning" description="Art, music, and imaginative play are at the heart of our curriculum." bgColor="#fef0f0" />
                        <FeatureCard icon={<Heart size={40} color="var(--primary)" />} title="Safe & Nurturing" description="A secure environment where every child feels loved and valued." bgColor="#fef0f0" />
                        <FeatureCard icon={<Sun size={40} color="var(--primary)" />} title="Outdoor Fun" description="Daily outdoor activities to connect with nature and stay active." bgColor="#fef0f0" />
                    </div>
                </div>
            </section>

            {/* About Poppinz (id for anchor) */}
            <section id="about" style={{ padding: '6rem 0', background: 'white' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>About Poppinz Preschool and Daycare</h2>
                        <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: '#666' }}>
                            We believe in the power of play. Our preschool is dedicated to providing a warm,
                            inclusive, and stimulating environment where children can explore, create, and grow.
                        </p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        <SectionCard title="Our Philosophy" content="We follow a play-based curriculum that encourages curiosity and fosters a lifelong love for learning. We integrate arts, science, and outdoor play into our daily routine." accentColor="var(--accent)" />
                        <SectionCard title="Our Teachers" content="Our team matches experience with passion. We are dedicated early childhood educators who are committed to the well-being and development of every child." accentColor="var(--secondary)" />
                    </div>

                    {/* School Hours & Contact */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div style={{
                            padding: '2rem',
                            background: 'linear-gradient(135deg, #fef7f5 0%, #fff 100%)',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            borderLeft: '5px solid var(--primary)',
                        }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
                                <Clock size={24} color="var(--primary)" /> School Hours
                            </h3>
                            <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>Monday – Friday</strong></p>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>8:00 AM – 6:00 PM</p>
                            <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>Saturday</strong></p>
                            <p style={{ margin: 0, color: '#666' }}>9:00 AM – 1:00 PM (optional programs)</p>
                        </div>
                        <div style={{
                            padding: '2rem',
                            background: 'linear-gradient(135deg, #f0fdfa 0%, #fff 100%)',
                            borderRadius: '20px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            borderLeft: '5px solid var(--secondary)',
                        }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
                                <Mail size={24} color="var(--secondary)" /> Contact Us
                            </h3>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                                <Phone size={18} /> 9110851381
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                                <Mail size={18} /> <a href="mailto:info@poppinz-preschool.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>info@poppinz-preschool.com</a>
                            </p>
                            <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                                <MapPin size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                                Kumbalagodu, Post, Kengeri Hobli, Bengaluru, Karnataka 560074
                            </p>
                        </div>
                    </div>

                    {/* Meet the Team */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ marginTop: '4rem' }}
                    >
                        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text)' }}>Meet the Team</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                            {TEAM.map((person) => (
                                <div
                                    key={person.name}
                                    style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        textAlign: 'center',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem',
                                    }}>
                                        <User size={40} color="white" />
                                    </div>
                                    <h3 style={{ margin: '0 0 0.35rem 0', color: 'var(--text)' }}>{person.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>{person.role}</p>
                                    <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: '#666' }}>{person.bio}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, bgColor }) => (
    <motion.div
        whileHover={{ y: -8 }}
        style={{
            background: 'white',
            padding: '2.5rem 2rem',
            borderRadius: '24px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            border: '1px solid rgba(0,0,0,0.05)',
        }}
    >
        <div style={{ background: bgColor || '#fef7f5', padding: '1.5rem', borderRadius: '20px' }}>
            {icon}
        </div>
        <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>{description}</p>
    </motion.div>
);

const SectionCard = ({ title, content, accentColor }) => (
    <div style={{
        padding: '2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        borderTop: `6px solid ${accentColor}`,
        border: '1px solid rgba(0,0,0,0.05)',
    }}>
        <h3 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>{title}</h3>
        <p style={{ color: '#666', margin: 0 }}>{content}</p>
    </div>
);

export default Home;
