# LivePoll — Decentralized Polling on Stellar

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stellar](https://img.shields.io/badge/Stellar-Soroban-purple.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)

**LivePoll** is a fully decentralized, real-time polling DApp built natively on the Stellar blockchain using Soroban smart contracts. It enables users to create, participate in, and track polls transparently, guaranteeing tamper-proof voting without central gatekeepers.

The project demonstrates a complete, production-ready integration between a Next.js 15 frontend, the Stellar SDK, and a custom Rust-based Soroban smart contract.

---

## 🌟 Key Features

- **Decentralized & Immutable Polling**: Polls and votes are stored directly on the Stellar blockchain. Once a poll is created or a vote is cast, it cannot be altered or deleted.
- **Robust Wallet Integration**: First-class support for Freighter and other Stellar-compatible wallets via `@creit.tech/stellar-wallets-kit` (v3). Includes seamless connection management and transaction signing.
- **Live Event Indexing**: Watch votes stream in instantly. The app hooks into Soroban RPC events to provide a live, network-wide Activity Feed of poll creations, votes, and closures.
- **In-App Transaction Tracking**: Monitor your transactions with real-time status updates (pending, success, failed). Every transaction includes a direct link to Stellar Expert for on-chain verification.
- **Premium UI/UX**: Built with Next.js 15, Tailwind CSS, and shadcn/ui. The interface features a modern dark theme, smooth micro-animations, glassmorphism, dynamic progress bars, and highly responsive design.
- **Double-Vote Prevention**: The smart contract enforces strict logic to ensure a wallet address can only vote once per poll.

---

## 🏗️ System Architecture

### 1. Smart Contract (Soroban / Rust)
Located in `contracts/live_poll/src/lib.rs`, the contract manages the core state and logic:
- **State Storage**: Uses Soroban's `env.storage().instance()` and `env.storage().persistent()` to store poll details and user voting records.
- **Methods**: `create_poll`, `vote`, `close_poll`, and multiple read-only queries (`get_poll`, `get_polls`, `get_poll_count`).
- **Events**: Emits specific events (`poll_created`, `vote_cast`, `poll_closed`) which the frontend indexes to provide real-time updates.

### 2. Frontend (Next.js 15)
The client-side application is built using the new React App Router:
- **State Management**: 
  - **Zustand**: Handles local client state (wallet connection, transaction history).
  - **TanStack React Query**: Manages asynchronous RPC state (fetching polls, checking vote status) with automatic caching and refetching.
- **Contract Interactions**: Implements the required Soroban 3-step transaction flow:
  1. `simulateTransaction`: Calculates resource limits and footprint.
  2. `assembleTransaction`: Builds the transaction envelope.
  3. `sendTransaction`: Submits the wallet-signed XDR to the network.

---

## 📁 Project Structure

```text
Live_Poll/
├── app/                        # Next.js App Router pages and layouts
├── components/                 # Reusable UI components
│   ├── activity/               # Live event feed components
│   ├── layout/                 # Sidebar, header, footer, etc.
│   ├── polls/                  # Poll creation, lists, and detail views
│   ├── transactions/           # Transaction tracking lists and banners
│   └── ui/                     # Generic UI elements (buttons, inputs, etc.)
├── contracts/                  # Soroban Rust smart contract
│   └── live_poll/
│       ├── src/                # Contract source code (lib.rs)
│       └── Cargo.toml          # Rust dependencies
├── hooks/                      # Custom React hooks (usePolls, useWallet)
├── lib/                        # Utility functions and core logic
│   ├── stellar/                # SDK setup, contract builders, RPC logic
│   └── wallet/                 # stellar-wallets-kit integration
├── stores/                     # Zustand state stores
├── types/                      # TypeScript interfaces and enums
└── DEPLOYMENT.md               # Guide for deploying the smart contract
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Freighter Wallet](https://freighter.app/) browser extension (configured to Stellar Testnet)
- *(Optional)* [Rust](https://www.rust-lang.org/) and the `stellar-cli` if you wish to deploy the contract yourself.

### 1. Smart Contract Deployment (Optional)
If you want to deploy your own instance of the contract, please refer to the detailed instructions in the [DEPLOYMENT.md](DEPLOYMENT.md) guide. Otherwise, the app comes pre-configured with a deployed Testnet contract ID.

### 2. Frontend Setup

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd Live_Poll
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and ensure the values look like this:
   ```env
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
   NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
   NEXT_PUBLIC_LIVE_POLL_CONTRACT_ID=C... # Your deployed contract ID
   NEXT_PUBLIC_EXPLORER_URL=https://stellar.expert/explorer/testnet
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Access the DApp:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage Guide

1. **Connect Wallet**: Click the "Connect Wallet" button in the sidebar or header. Authorize the connection using the Freighter extension. Ensure Freighter is set to the **Testnet** network and has some test XLM (use Friendbot if needed).
2. **Create a Poll**: Navigate to the "Polls" tab and click "Create Poll". Fill in the title, description, and multiple options. Confirm and sign the transaction in your wallet.
3. **Vote**: Click on any active poll. Select your preferred option and click "Submit Vote". Sign the transaction. Once confirmed, the progress bars will update instantly.
4. **Monitor Activity**: Go to the "Activity" tab to watch a live feed of all network events emitted by the smart contract.
5. **View Transactions**: The "Transactions" tab tracks your local session's blockchain interactions, providing direct links to Stellar Expert.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Blockchain**: [Stellar Soroban](https://soroban.stellar.org/), [Rust](https://www.rust-lang.org/)
- **Libraries**: 
  - `@stellar/stellar-sdk` (RPC & XDR Building)
  - `@creit.tech/stellar-wallets-kit` (Wallet Connection)
  - `@tanstack/react-query` (Data Fetching)
  - `zustand` (State Management)

---

## ⚠️ Troubleshooting

- **`Transaction was rejected`**: Ensure you are approving the transaction prompt in Freighter.
- **`Insufficient XLM balance`**: You need Testnet XLM to pay for network fees. Go to the Freighter settings and use the "Fund with Friendbot" option.
- **`Simulation failed` or `Invalid Contract ID`**: Double-check that your `NEXT_PUBLIC_LIVE_POLL_CONTRACT_ID` in `.env.local` is correct and deployed on the same network (Testnet) you are connected to.
- **Wallet Not Found**: Ensure the Freighter extension is installed and unlocked in your browser.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
