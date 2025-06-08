import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';

test('NavBar shows links and logout triggers context logout', () => {
  const logout = jest.fn();
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: { username: 'alice' }, logout }}>
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Profile')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Logout'));
  expect(logout).toHaveBeenCalled();
});