import { render, screen } from '@testing-library/react';
import { renderWithAuth } from './test-utils';
import HomePage from '../pages/HomePage';

test('renders dummy tweets', () => {
  renderWithAuth(<HomePage />);
  expect(screen.getByText('@alice')).toBeInTheDocument();
  expect(screen.getByText('Hello world!')).toBeInTheDocument();
});