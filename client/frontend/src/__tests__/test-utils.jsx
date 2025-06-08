import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Wraps a UI element in MemoryRouter + AuthContext so that
 * any component using <NavBar /> or useContext(AuthContext)
 * won’t crash during tests.
 */
export function renderWithAuth(ui, { route = '/', user = { username: 'alice' } } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthContext.Provider value={{ user, login: jest.fn(), logout: jest.fn() }}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

// Dummy test so that Jest doesn’t complain about an empty suite
test('test-utils helper loads', () => {});
