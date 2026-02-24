import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Mail, Phone, MapPin, User } from 'lucide-react';

const About = () => {
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>About Poppinz Preschool and Daycare</h1>
                <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: '#666' }}>
                    We believe in the power of play. Our preschool is dedicated to providing a warm,
                    inclusive, and stimulating environment where children can explore, create, and grow.
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                <Section
                    title="Our Philosophy"
                    content="We follow a play-based curriculum that encourages curiosity and fosters a lifelong love for learning. We integrate arts, science, and outdoor play into our daily routine."
                    color="#FFE66D"
                />
                <Section
                    title="Our Teachers"
                    content="Our team matches experience with passion. We are dedicated early childhood educators who are committed to the well-being and development of every child."
                    color="#4ECDC4"
                />
            </div>

            {/* School hours & Contact */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginTop: '4rem',
                }}
            >
                <div style={{
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderLeft: '5px solid var(--primary)',
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
                        <Clock size={24} color="var(--primary)" /> School Hours
                    </h2>
                    <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>Monday – Friday</strong></p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>8:00 AM – 6:00 PM</p>
                    <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>Saturday</strong></p>
                    <p style={{ margin: 0, color: '#666' }}>9:00 AM – 1:00 PM (optional programs)</p>
                </div>
                <div style={{
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    borderLeft: '5px solid var(--secondary)',
                }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
                        <Mail size={24} color="var(--secondary)" /> Contact Us
                    </h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                        <Phone size={18} /> 9110851381
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                        <Mail size={18} /> <a href="mailto:info@poppinz-preschool.com" style={{ color: 'inherit' }}>info@poppinz-preschool.com</a>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', margin: '0.5rem 0', color: '#666' }}>
                        <MapPin size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                        Kumbalagodu, Post, Kengeri Hobli, Bengaluru, Karnataka 560074
                    </p>
                </div>
            </motion.div>

            {/* Meet the team */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '4rem' }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text)' }}>Meet the Team</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '2rem',
                }}
                >
                    {[
                        { name: 'Shruti', role: 'Principal', bio: 'Leads the school with vision and care for every child.' },
                        { name: 'Pushpa', role: 'Academic Coordinator', bio: 'Designs curriculum and supports our teaching team.' },
                        { name: 'Sindhu', role: 'Student Welfare & Programs', bio: 'Ensures a safe, inclusive environment for all children.' },
                    ].map((person, i) => (
                        <div
                            key={person.name}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                textAlign: 'center',
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
                            }}
                            >
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
    );
};

const Section = ({ title, content, color }) => (
    <div style={{
        padding: '2rem',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        borderTop: `6px solid ${color}`
    }}>
        <h2 style={{ color: 'var(--text)' }}>{title}</h2>
        <p style={{ color: '#666' }}>{content}</p>
    </div>
);

export default About;
