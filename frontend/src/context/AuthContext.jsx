import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ Use deployed backend URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://preschool-backend-production.up.railway.app/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Load user on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser({ ...data, name: data.full_name || data.name });
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ FIXED LOGIN (IMPORTANT 🔥)
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email, // ⚠️ FastAPI expects 'username'
        password: password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data.detail ||
        (Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(', ')
          : 'Invalid credentials');
      throw new Error(msg);
    }

    localStorage.setItem('access_token', data.access_token);

    // ✅ Fetch user profile
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!meRes.ok) {
      localStorage.removeItem('access_token');
      throw new Error('Could not load user profile. Try logging in again.');
    }

    const me = await meRes.json();
    setUser({ ...me, name: me.full_name || me.name });
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
