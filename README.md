# 🗳️ LivePoll — Decentralized Polling on Stellar

LivePoll is a fully decentralized real-time polling platform built on
Soroban Smart Contracts, Next.js 15, and Stellar Wallets Kit.

Users can create polls, vote securely on-chain, and track results
in real time with complete transparency and immutability.

---

## 🔗 Project Links

- Live Demo: https://live-poll-gamma.vercel.app/

---

## 📸 Screenshots & Architecture Proof

### 1. Landing Page
![Landing](public/screenshots/landing.png)

### 2. Poll Dashboard
![Dashboard](public/screenshots/dashboard.png)

### 3. Poll Creation
![Create Poll](public/screenshots/create_poll.png)

### 4. Voting Interface
![Voting](public/screenshots/vote.png)

### 5. Activity Feed
![Activity](public/screenshots/activity.png)

### 6. Mobile Responsive Design
![Mobile](public/screenshots/mobile.png)

---

## ⛓ Deployed Addresses

### Stellar Testnet

Contract ID:
`YOUR_CONTRACT_ID`

Deployer Address:
`YOUR_WALLET_ADDRESS`

Deployment Transaction:
`YOUR_TX_HASH`

---

## 🏗 Architecture

```text
                 CREATE POLL
                      │
                      ▼
          ┌────────────────────┐
          │ Soroban Contract   │
          └────────────────────┘
                 ▲       ▲
                 │       │
          Vote Cast   Close Poll
                 │
                 ▼
        Event Emission Layer
                 │
                 ▼
      Next.js Activity Feed
```

---

## 🔐 Wallet Authentication Flow

```text
[Freighter Wallet]
        │
        ▼
Connect Wallet
        │
        ▼
Public Key Retrieved
        │
        ▼
Wallet Session Stored
        │
        ▼
Access Poll Features
```

---

## 📜 Smart Contract Specifications

### Core Methods

- create_poll()
- vote()
- close_poll()
- get_poll()
- get_polls()
- get_poll_count()

---

## 🚀 User Proof of Concept

1. Connect Wallet
2. Create Poll
3. Cast Vote
4. View Live Results
5. Track Events
6. Close Poll

---

## 🛠 Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Stellar Soroban
- Rust
- Zustand
- React Query

---


## ⚙️ Local Setup

### Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm 10+
* Git
* Freighter Wallet (for Stellar Testnet interaction)

Verify installation:

```bash
node -v
npm -v
git --version
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/arisudan-lab/Live_Poll.git
cd Live_Poll
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID
```

Replace `YOUR_CONTRACT_ID` with your deployed Soroban contract address.

---

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

### 5. Connect Stellar Wallet

1. Install Freighter Wallet extension.
2. Switch network to **Stellar Testnet**.
3. Fund your testnet account using Stellar Friendbot.
4. Connect the wallet from the LivePoll dashboard.

---

### 6. Build for Production

```bash
npm run build
npm start
```

---

### Project Structure

```text
Live_Poll/
│
├── app/
├── components/
├── lib/
├── public/
│   └── screenshots/
├── contracts/
├── hooks/
├── store/
├── types/
├── .env.local
├── package.json
└── README.md
```

---

### Troubleshooting

#### Dependency Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

#### Environment Variables Not Loading

Restart the development server after modifying `.env.local`:

```bash
npm run dev
```

---

### Testnet Resources

* Freighter Wallet: https://www.freighter.app/
* Stellar Friendbot: https://friendbot.stellar.org/
* Stellar Testnet Explorer: https://stellar.expert/explorer/testnet


---

## 📜 License

MIT
