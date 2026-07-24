// ============================================================================
// Wallet Connection Flow Tests
// ============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectButton } from '../components/wallet/connect-button';
import { useWalletStore } from '../stores/wallet-store';

// Mock the wallet store
jest.mock('../stores/wallet-store', () => ({
  useWalletStore: jest.fn(),
}));

describe('Wallet Connection Flow', () => {
  const mockConnect = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock: not connected
    (useWalletStore as jest.Mock).mockReturnValue({
      address: null,
      isConnected: false,
      isConnecting: false,
      balance: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });
  });

  test('renders connect button when not connected', () => {
    render(<ConnectButton />);
    
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  test('shows connecting state when connecting', async () => {
    (useWalletStore as jest.Mock).mockReturnValue({
      address: null,
      isConnected: false,
      isConnecting: true,
      balance: null,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<ConnectButton />);
    
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  test('shows wallet address when connected', () => {
    const mockAddress = 'GBTESTADDRESS0000000000000000000000000000000000000000000';
    const mockBalance = '1000.00';

    (useWalletStore as jest.Mock).mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
      balance: mockBalance,
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<ConnectButton />);
    
    // Should show truncated address
    expect(screen.getByText(/GBTEST...0000/i)).toBeInTheDocument();
    expect(screen.getByText(/1000\.00 XLM/i)).toBeInTheDocument();
  });

  test('calls connect function when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<ConnectButton />);
    
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await user.click(connectButton);
    
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  test('shows disconnect option when connected', async () => {
    const user = userEvent.setup();
    const mockAddress = 'GBTESTADDRESS0000000000000000000000000000000000000000000';

    (useWalletStore as jest.Mock).mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
      balance: '1000.00',
      connect: mockConnect,
      disconnect: mockDisconnect,
    });

    render(<ConnectButton />);
    
    // Click on the connected button to open menu
    await user.click(screen.getByRole('button'));
    
    // Wait for disconnect option to appear
    await waitFor(() => {
      expect(screen.queryByText(/disconnect/i)).toBeInTheDocument();
    });
  });
});
