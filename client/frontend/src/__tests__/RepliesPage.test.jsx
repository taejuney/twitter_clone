import { render, screen } from '@testing-library/react';
import { renderWithAuth } from './test-utils';
import RepliesPage from '../pages/RepliesPage';
import { Route, Routes } from 'react-router-dom';

test('renders original tweet and replies or no replies', () => {
  renderWithAuth(
    <Routes>
      <Route path="/replies/:id" element={<RepliesPage />} />
    </Routes>,
    { route: '/replies/3' }
  );
  expect(screen.getByText('@bob')).toBeInTheDocument();
  expect(screen.getByText('React is great!')).toBeInTheDocument();
});