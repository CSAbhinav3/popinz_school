import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--text)', color: 'white', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Poppinz Preschool and Daycare</h3>
                <p style={{ marginBottom: '1rem', opacity: 0.8 }}>Nurturing curiosity, creativity, and kindness.</p>

            </div>
        </footer>
    );
};

export default Footer;
