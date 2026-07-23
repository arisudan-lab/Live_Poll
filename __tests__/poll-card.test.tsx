import React from 'react';
import { render, screen } from '@testing-library/react';
import { PollCard } from '../components/polls/poll-card';
import { PollStatus } from '../types';

const poll = {
  id: 1,
  creator: 'GBTESTADDRESS0000000000000000000000000000000000000000000',
  title: 'Test poll',
  description: 'This is a test poll.',
  options: [
    { label: 'Option A', voteCount: 5 },
    { label: 'Option B', voteCount: 15 },
  ],
  totalVotes: 20,
  status: PollStatus.Active,
  createdAt: Date.now(),
  endTime: 0,
};

test('renders poll card content', () => {
  render(<PollCard poll={poll as any} />);
  expect(screen.getByText('Test poll')).toBeInTheDocument();
  expect(screen.getByText('This is a test poll.')).toBeInTheDocument();
  expect(screen.getByText('Option A')).toBeInTheDocument();
  expect(screen.getByText('20 votes')).toBeInTheDocument();
});
