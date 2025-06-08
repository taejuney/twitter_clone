import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NewTweetPage from './pages/NewTweetPage';
import ReplyTweetPage from './pages/ReplyTweetPage';
import RepliesPage from './pages/RepliesPage';
import ProfilePage from './pages/ProfilePage';
import ErrorPage from './pages/ErrorPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/post" element={<NewTweetPage />} />
                  <Route path="/post/:id" element={<ReplyTweetPage />} />
                  <Route path="/replies/:id" element={<RepliesPage />} />
                  <Route path="/profile/:username" element={<ProfilePage />} />
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}