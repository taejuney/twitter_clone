import { render, screen } from '@testing-library/react';
import ErrorPage from '../pages/ErrorPage';
import { MemoryRouter } from 'react-router-dom';

test('shows 404 and home link', () => {
  render(
    <MemoryRouter>
      <ErrorPage />
    </MemoryRouter>
  );
  expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
});