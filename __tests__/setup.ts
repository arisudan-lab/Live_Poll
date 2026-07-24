import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_STELLAR_NETWORK = 'testnet';
process.env.NEXT_PUBLIC_STELLAR_RPC_URL = 'https://soroban-testnet.stellar.org:443';
process.env.NEXT_PUBLIC_CONTRACT_ID = 'CCA26PC7SVUMK43SVNHVSGQCTZ4NV3BSLDF7XV3ODHJVH5AFTYQWTJRU';

// Mock window.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});
