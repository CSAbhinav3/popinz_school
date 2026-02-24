import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Star, Heart } from 'lucide-react';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                background: `url('/hero-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                padding: '8rem 0',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Overlay for better readability - reduced opacity to show more blue */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 119, 182, 0.3) 100%)',
                    zIndex: 1
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
                        style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'stretch' }}
                    >
                        <Link to="/about" style={{ display: 'block' }}>
                            <button style={{ background: 'var(--secondary)', color: 'white', padding: '0.75rem 1.5rem', minHeight: '48px', fontSize: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Learn More</button>
                        </Link>
                        <Link to="/login" style={{ display: 'block' }}>
                            <button style={{ background: 'white', color: 'var(--text)', border: '2px solid #eee', padding: '0.75rem 1.5rem', minHeight: '48px', fontSize: '1rem', borderRadius: '8px', cursor: 'pointer' }}>Login</button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '8rem 0', background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#0077b6' }}>Why Choose Poppinz?</h2>
                        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>We create a space where learning feels like play and every child gets the attention they deserve.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FeatureCard
                            icon={<Star size={40} color="#0077b6" />}
                            title="Creative Learning"
                            description="Art, music, and imaginative play are at the heart of our curriculum."
                            bgColor="#e0f2fe"
                        />
                        <FeatureCard
                            icon={<Heart size={40} color="#0077b6" />}
                            title="Safe & Nurturing"
                            description="A secure environment where every child feels loved and valued."
                            bgColor="#e0f2fe"
                        />
                        <FeatureCard
                            icon={<Sun size={40} color="#0077b6" />}
                            title="Outdoor Fun"
                            description="Daily outdoor activities to connect with nature and stay active."
                            bgColor="#e0f2fe"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, bgColor }) => (
    <motion.div
        whileHover={{ y: -10 }}
        style={{
            background: 'white',
            padding: '3rem 2rem',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            border: '1px solid #f0f9ff'
        }}
    >
        <div style={{ background: bgColor || '#FFFDF5', padding: '1.5rem', borderRadius: '20px' }}>
            {icon}
        </div>
        <h3 style={{ color: '#0077b6' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>{description}</p>
    </motion.div>
);

export default Home;
