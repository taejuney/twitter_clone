import { render, screen } from '@testing-library/react';
import { renderWithAuth } from './test-utils';
import NewTweetPage from '../pages/NewTweetPage';

test('renders textarea and post button', () => {
  renderWithAuth(<NewTweetPage />);
  expect(screen.getByPlaceholderText("What's happening?"))
    .toBeInTheDocument();
  expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
});