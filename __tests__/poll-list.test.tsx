import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PollList } from '../components/polls/poll-list';
import { PollStatus } from '../types';

const polls = [
  {
    id: 1,
    creator: 'GBTESTADDRESS0000000000000000000000000000000000000000000',
    title: 'Favorite Stellar feature?',
    description: 'Pick the feature you use the most.',
    options: [
      { label: 'Soroban', voteCount: 12 },
      { label: 'Wallets', voteCount: 8 },
    ],
    totalVotes: 20,
    status: PollStatus.Active,
    createdAt: 0,
    endTime: 0,
  },
  {
    id: 2,
    creator: 'GBTESTADDRESS0000000000000000000000000000000000000000000',
    title: 'Closed poll',
    description: 'Already finished.',
    options: [
      { label: 'Yes', voteCount: 4 },
      { label: 'No', voteCount: 6 },
    ],
    totalVotes: 10,
    status: PollStatus.Closed,
    createdAt: 0,
    endTime: 0,
  },
];

test('renders loading state with skeletons', () => {
  const { container } = render(<PollList polls={undefined} isLoading={true} isError={false} error={null} />);
  expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
});

test('renders polls and filters by status', async () => {
  render(<PollList polls={polls as any} isLoading={false} isError={false} error={null} />);
  expect(screen.getByText('Favorite Stellar feature?')).toBeInTheDocument();
  expect(screen.getByText('Closed poll')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Closed' }));
  expect(screen.getByText('Closed poll')).toBeInTheDocument();
});
