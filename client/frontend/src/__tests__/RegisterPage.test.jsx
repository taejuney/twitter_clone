import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';

test('navigates to /login on register', () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>LOGIN SCREEN</div>} />
      </Routes>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('Username'), {
    target: { value: 'bob' }
  });
  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(screen.getByText('LOGIN SCREEN')).toBeInTheDocument();
});