import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    ['click','keydown'].forEach(evt =>
      window.addEventListener(evt, updateActivity)
    );
    return () => {
      ['click','keydown'].forEach(evt =>
        window.removeEventListener(evt, updateActivity)
      );
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      if (Date.now() - lastActivity > 15 * 60 * 1000) {
        setUser(null);
        navigate('/login');
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [lastActivity, user, navigate]);

  const login = (username) => { setUser({ username }); navigate('/'); };
  const logout = () => { setUser(null); navigate('/login'); };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}