import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithAuth } from './test-utils';
import ProfilePage from '../pages/ProfilePage';
import { Routes, Route } from 'react-router-dom';

test('displays the @username heading from params', () => {
  renderWithAuth(
    <Routes>
      <Route path="/profile/:username" element={<ProfilePage />} />
    </Routes>,
    { route: '/profile/alice' }
  );

  // ProfilePage renders the username as "@alice"
  expect(screen.getByText('@alice')).toBeInTheDocument();
});
