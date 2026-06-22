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

### 7. Stellar Expert Verification
![Explorer](public/screenshots/explorer.png)

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

```bash
npm install
npm run dev
```

---

## 📜 License

MIT
