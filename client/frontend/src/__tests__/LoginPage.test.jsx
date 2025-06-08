import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import { MemoryRouter } from 'react-router-dom';

test('calls login with username', () => {
  const login = jest.fn();
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login }}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'alice' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  expect(login).toHaveBeenCalledWith('alice');
});