import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext } from './context/AuthContext';
import App from './App';

// Ensure login page shows when unauthenticated
test('renders login page by default', () => {
  render(
    <AuthContext.Provider value={{ user: null, login: jest.fn() }}>
      <App />
    </AuthContext.Provider>
  );

  // LoginPage shows a heading 'Login'
  expect(
    screen.getByRole('heading', { name: /login/i })
  ).toBeInTheDocument();
});