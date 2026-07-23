import React from 'react';
import { render, screen } from '@testing-library/react';
import PollList from '../components/polls/poll-list';
import * as hooks from '../hooks/use-polls';

jest.mock('../hooks/use-polls');

test('renders loading skeletons when loading', () => {
  (hooks as any).usePolls = jest.fn(() => ({ polls: [], loading: true, error: null }));
  render(<PollList />);
  expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(1);
});

test('renders polls when available', () => {
  const mock = [{ id: 1, question: 'Q?', options: ['a'], closed: false }];
  (hooks as any).usePolls = jest.fn(() => ({ polls: mock, loading: false, error: null }));
  render(<PollList />);
  expect(screen.getByText('Q?')).toBeInTheDocument();
});
