# LivePoll Deployment Guide

This guide covers how to deploy the LivePoll Soroban Smart Contract to the Stellar Testnet and configure the Next.js frontend to use it.

## Prerequisites

1. Install [Rust](https://rustup.rs/) (which includes `cargo`).
2. Add the webassembly target:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
3. Install the Stellar CLI:
   ```bash
   cargo install --locked stellar-cli --features opt
   ```

## 1. Build the Smart Contract

Navigate to the contract directory and build the WebAssembly binary:

```bash
cd contracts/live_poll
cargo build --target wasm32-unknown-unknown --release
```

This will output a `.wasm` file at:
`contracts/live_poll/target/wasm32-unknown-unknown/release/live_poll.wasm`

## 2. Optimize the WASM (Optional but recommended)

```bash
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/live_poll.wasm
```
This produces `live_poll.optimized.wasm`.

## 3. Configure the Stellar CLI Network

Set up the Testnet and generate an identity:

```bash
stellar network add \
  --global testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"

stellar keys generate --global alice --network testnet
```

## 4. Deploy the Contract

Deploy the optimized WASM to the Testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/live_poll.optimized.wasm \
  --source alice \
  --network testnet
```

*Note the `Contract ID` output by this command (it looks like `C...`).*

## 5. Configure the Frontend

Copy the `.env.example` file to `.env.local` (or create it if it doesn't exist) in the root of your Next.js project:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org:443
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_LIVE_POLL_CONTRACT_ID=C<YOUR_CONTRACT_ID>
```

Replace `C<YOUR_CONTRACT_ID>` with the actual ID returned from step 4.

## 6. Run the Next.js App

```bash
npm run dev
```

Visit `http://localhost:3000` and start interacting with your live on-chain polling dApp!
