import { render, screen } from '@testing-library/react';
import { renderWithAuth } from './test-utils';
import ReplyTweetPage from '../pages/ReplyTweetPage';
import { Route, Routes } from 'react-router-dom';

test('shows correct heading with id param', () => {
  renderWithAuth(
    <Routes>
      <Route path="/post/:id" element={<ReplyTweetPage />} />
    </Routes>,
    { route: '/post/123' }
  );
  expect(screen.getByText('Reply to Tweet #123')).toBeInTheDocument();
});