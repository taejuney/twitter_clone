import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

test('redirects to login when not authenticated', () => {
  render(
    <MemoryRouter initialEntries={['/protected']}>  
      <AuthContext.Provider value={{ user: null }}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByText('Login Page')).toBeInTheDocument();
});