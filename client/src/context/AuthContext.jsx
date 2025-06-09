import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [lastActivity, setLastActivity] = useState(Date.now());

  // auto‐logout after 15m inactivity
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    ['click','keydown'].forEach(evt => window.addEventListener(evt, updateActivity));
    return () => ['click','keydown'].forEach(evt => window.removeEventListener(evt, updateActivity));
  }, []);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      if (Date.now() - lastActivity > 15*60*1000) {
        logout();
      }
    }, 60*1000);
    return () => clearInterval(id);
  }, [lastActivity, user]);

  const login = (username, token) => {
    const u = { username, token };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    navigate('/');
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
