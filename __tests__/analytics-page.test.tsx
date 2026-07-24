// ============================================================================
// Analytics Page Tests
// ============================================================================

import { render, screen } from '@testing-library/react';
import AnalyticsPage from '../app/analytics/page';
import { usePolls, usePollCount } from '../hooks/use-polls';
import { useEventStats } from '../hooks/use-events';
import { useTransactionStats } from '../stores/transaction-store';

// Mock the hooks
jest.mock('../hooks/use-polls', () => ({
  usePolls: jest.fn(),
  usePollCount: jest.fn(),
}));

jest.mock('../hooks/use-events', () => ({
  useEventStats: jest.fn(),
}));

jest.mock('../stores/transaction-store', () => ({
  useTransactionStats: jest.fn(),
}));

describe('Analytics Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (usePolls as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          creator: 'GBTESTADDRESS',
          title: 'Test Poll 1',
          description: 'Description 1',
          options: [
            { label: 'Option A', voteCount: 10 },
            { label: 'Option B', voteCount: 5 },
          ],
          totalVotes: 15,
          status: 'active',
          createdAt: Date.now(),
          endTime: 0,
        },
        {
          id: 2,
          creator: 'GBTESTADDRESS',
          title: 'Test Poll 2',
          description: 'Description 2',
          options: [
            { label: 'Yes', voteCount: 20 },
            { label: 'No', voteCount: 10 },
          ],
          totalVotes: 30,
          status: 'closed',
          createdAt: Date.now(),
          endTime: 0,
        },
      ],
      isLoading: false,
      isError: false,
    });

    (usePollCount as jest.Mock).mockReturnValue({
      data: 2,
    });

    (useEventStats as jest.Mock).mockReturnValue({
      total: 50,
      pollCreated: 10,
      voteCast: 35,
      pollClosed: 5,
    });

    (useTransactionStats as jest.Mock).mockReturnValue({
      total: 45,
      pending: 2,
      success: 40,
      failed: 3,
      avgConfirmationTime: 5,
    });
  });

  test('renders analytics page header', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/platform metrics and activity insights/i)).toBeInTheDocument();
  });

  test('displays total polls statistic', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/total polls/i)).toBeInTheDocument();
  });

  test('displays total votes statistic', () => {
    render(<AnalyticsPage />);
    
    // Total votes should be 15 + 30 = 45
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText(/total votes/i)).toBeInTheDocument();
  });

  test('displays active polls count', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/active polls/i)).toBeInTheDocument();
  });

  test('displays average votes per poll', () => {
    render(<AnalyticsPage />);
    
    // Avg = 45 / 2 = 22.5, rounded to 23
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText(/avg votes\/poll/i)).toBeInTheDocument();
  });

  test('displays transaction statistics', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText(/successful/i)).toBeInTheDocument();
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  test('displays event statistics', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/polls created/i)).toBeInTheDocument();
    
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText(/votes cast/i)).toBeInTheDocument();
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/polls closed/i)).toBeInTheDocument();
  });

  test('renders poll status breakdown', () => {
    render(<AnalyticsPage />);
    
    expect(screen.getByText(/poll status breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/closed/i)).toBeInTheDocument();
  });

  test('shows loading state when polls are loading', () => {
    (usePolls as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<AnalyticsPage />);
    
    // Should still render the page structure
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  test('handles empty data gracefully', () => {
    (usePolls as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    (usePollCount as jest.Mock).mockReturnValue({
      data: 0,
    });

    (useEventStats as jest.Mock).mockReturnValue({
      total: 0,
      pollCreated: 0,
      voteCast: 0,
      pollClosed: 0,
    });

    (useTransactionStats as jest.Mock).mockReturnValue({
      total: 0,
      pending: 0,
      success: 0,
      failed: 0,
      avgConfirmationTime: 0,
    });

    render(<AnalyticsPage />);
    
    // Should show zeros or dashes
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
