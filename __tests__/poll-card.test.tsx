import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollCard from '../components/polls/poll-card';

global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as any;

test('renders options and handles click', async () => {
  const poll = { id: 1, question: 'Q?', options: ['a','b'], closed:false };
  render(<PollCard poll={poll} />);
  const btn = screen.getByText('a');
  fireEvent.click(btn);
  expect(await screen.findByText(/Sending vote.../i)).toBeInTheDocument();
});
