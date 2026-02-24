import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <p style={{ color: '#666' }}>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <ShieldX size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Access Denied</h2>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                        Your role ({user.role}) does not have permission to view this page.
                    </p>
                    <Link to="/">
                        <button style={{ background: 'var(--primary)', color: 'white' }}>Back to Home</button>
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;