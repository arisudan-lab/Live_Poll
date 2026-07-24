#!/bin/bash

# ============================================================================
# LivePoll Smart Contract Deployment Script
# ============================================================================
# This script deploys the LivePoll and EventStream contracts to Stellar Testnet
# and stores deployment metadata for tracking.
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONTRACTS_DIR="$PROJECT_ROOT/contracts"
DEPLOYMENTS_DIR="$PROJECT_ROOT/deployments"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NETWORK="${NETWORK:-testnet}"
RPC_URL="${RPC_URL:-https://soroban-testnet.stellar.org:443}"
NETWORK_PASSPHRASE="${NETWORK_PASSPHRASE:-Test SDF Network ; September 2015}"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}         LivePoll Smart Contract Deployment Script${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

# Check if Stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo -e "${RED}Error: Stellar CLI is not installed.${NC}"
    echo "Please install it with: cargo install --locked stellar-cli --features opt"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: Rust/Cargo is not installed.${NC}"
    echo "Please install it from: https://rustup.rs/"
    exit 1
fi

# Create deployments directory
mkdir -p "$DEPLOYMENTS_DIR"

# ============================================================================
# Step 1: Build contracts
# ============================================================================
echo -e "${YELLOW}Step 1: Building smart contracts...${NC}"

# Build live_poll contract
echo "Building live_poll contract..."
cd "$CONTRACTS_DIR/live_poll"
cargo build --target wasm32-unknown-unknown --release

LIVE_POLL_WASM="$CONTRACTS_DIR/live_poll/target/wasm32-unknown-unknown/release/live_poll.wasm"

if [ ! -f "$LIVE_POLL_WASM" ]; then
    echo -e "${RED}Error: live_poll.wasm not found after build${NC}"
    exit 1
fi

# Build event_stream contract
echo "Building event_stream contract..."
cd "$CONTRACTS_DIR/event_stream"
cargo build --target wasm32-unknown-unknown --release

EVENT_STREAM_WASM="$CONTRACTS_DIR/event_stream/target/wasm32-unknown-unknown/release/event_stream.wasm"

if [ ! -f "$EVENT_STREAM_WASM" ]; then
    echo -e "${RED}Error: event_stream.wasm not found after build${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contracts built successfully${NC}"
echo ""

# ============================================================================
# Step 2: Optimize WASM files
# ============================================================================
echo -e "${YELLOW}Step 2: Optimizing WASM files...${NC}"

cd "$CONTRACTS_DIR/live_poll"
stellar contract optimize --wasm "$LIVE_POLL_WASM"
LIVE_POLL_OPTIMIZED="$CONTRACTS_DIR/live_poll/target/wasm32-unknown-unknown/release/live_poll.optimized.wasm"

cd "$CONTRACTS_DIR/event_stream"
stellar contract optimize --wasm "$EVENT_STREAM_WASM"
EVENT_STREAM_OPTIMIZED="$CONTRACTS_DIR/event_stream/target/wasm32-unknown-unknown/release/event_stream.optimized.wasm"

echo -e "${GREEN}✓ WASM files optimized${NC}"
echo ""

# ============================================================================
# Step 3: Deploy contracts
# ============================================================================
echo -e "${YELLOW}Step 3: Deploying contracts to $NETWORK...${NC}"

# Check if account is configured
if [ -z "$SOROBAN_ACCOUNT" ]; then
    echo -e "${RED}Error: SOROBAN_ACCOUNT environment variable is not set.${NC}"
    echo "Please set it to your Stellar account name (e.g., export SOROBAN_ACCOUNT=alice)"
    exit 1
fi

# Deploy live_poll contract
echo "Deploying live_poll contract..."
cd "$PROJECT_ROOT"
LIVE_POLL_OUTPUT=$(stellar contract deploy \
    --wasm "$LIVE_POLL_OPTIMIZED" \
    --source "$SOROBAN_ACCOUNT" \
    --network "$NETWORK" \
    --wait 2>&1) || {
    echo -e "${RED}Error deploying live_poll contract:${NC}"
    echo "$LIVE_POLL_OUTPUT"
    exit 1
}

LIVE_POLL_CONTRACT_ID=$(echo "$LIVE_POLL_OUTPUT" | grep -oP 'Contract ID: \K[A-Z0-9]+' || echo "")

if [ -z "$LIVE_POLL_CONTRACT_ID" ]; then
    echo -e "${RED}Error: Could not extract live_poll contract ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ live_poll deployed: $LIVE_POLL_CONTRACT_ID${NC}"

# Deploy event_stream contract
echo "Deploying event_stream contract..."
EVENT_STREAM_OUTPUT=$(stellar contract deploy \
    --wasm "$EVENT_STREAM_OPTIMIZED" \
    --source "$SOROBAN_ACCOUNT" \
    --network "$NETWORK" \
    --wait 2>&1) || {
    echo -e "${RED}Error deploying event_stream contract:${NC}"
    echo "$EVENT_STREAM_OUTPUT"
    exit 1
}

EVENT_STREAM_CONTRACT_ID=$(echo "$EVENT_STREAM_OUTPUT" | grep -oP 'Contract ID: \K[A-Z0-9]+' || echo "")

if [ -z "$EVENT_STREAM_CONTRACT_ID" ]; then
    echo -e "${RED}Error: Could not extract event_stream contract ID${NC}"
    exit 1
fi

echo -e "${GREEN}✓ event_stream deployed: $EVENT_STREAM_CONTRACT_ID${NC}"
echo ""

# ============================================================================
# Step 4: Register event contract with live_poll
# ============================================================================
echo -e "${YELLOW}Step 4: Registering event_stream with live_poll...${NC}"

echo "Note: This step requires invoking the contract's register_event_contract method."
echo "You can do this manually using:"
echo ""
echo "stellar contract invoke \\"
echo "  --id $LIVE_POLL_CONTRACT_ID \\"
echo "  --source $SOROBAN_ACCOUNT \\"
echo "  --network $NETWORK \\"
echo "  -- \\\"register_event_contract\\\" \\\"<admin_address>\\\" \\\"$EVENT_STREAM_CONTRACT_ID\\\""
echo ""

# ============================================================================
# Step 5: Store deployment metadata
# ============================================================================
echo -e "${YELLOW}Step 5: Storing deployment metadata...${NC}"

DEPLOYMENT_FILE="$DEPLOYMENTS_DIR/deployment-${NETWORK}-$(date +%Y%m%d-%H%M%S).json"

# Get WASM hashes
LIVE_POLL_WASM_HASH=$(stellar contract hash --wasm "$LIVE_POLL_OPTIMIZED")
EVENT_STREAM_WASM_HASH=$(stellar contract hash --wasm "$EVENT_STREAM_OPTIMIZED")

# Get deployment transaction hashes (extract from output)
LIVE_POLL_TX_HASH=$(echo "$LIVE_POLL_OUTPUT" | grep -oP 'Transaction hash: \K[a-f0-9]+' || echo "unknown")
EVENT_STREAM_TX_HASH=$(echo "$EVENT_STREAM_OUTPUT" | grep -oP 'Transaction hash: \K[a-f0-9]+' || echo "unknown")

# Create metadata JSON
cat > "$DEPLOYMENT_FILE" << EOF
{
  "deployment": {
    "timestamp": "$TIMESTAMP",
    "network": "$NETWORK",
    "network_passphrase": "$NETWORK_PASSPHRASE",
    "rpc_url": "$RPC_URL",
    "deployer_account": "$SOROBAN_ACCOUNT",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
  },
  "contracts": {
    "live_poll": {
      "contract_id": "$LIVE_POLL_CONTRACT_ID",
      "wasm_hash": "$LIVE_POLL_WASM_HASH",
      "deployment_tx": "$LIVE_POLL_TX_HASH",
      "wasm_path": "$LIVE_POLL_OPTIMIZED",
      "version": "1.0.0"
    },
    "event_stream": {
      "contract_id": "$EVENT_STREAM_CONTRACT_ID",
      "wasm_hash": "$EVENT_STREAM_WASM_HASH",
      "deployment_tx": "$EVENT_STREAM_TX_HASH",
      "wasm_path": "$EVENT_STREAM_OPTIMIZED",
      "version": "1.0.0"
    }
  },
  "explorer_links": {
    "live_poll": "https://stellar.expert/explorer/$NETWORK/contract/$LIVE_POLL_CONTRACT_ID",
    "event_stream": "https://stellar.expert/explorer/$NETWORK/contract/$EVENT_STREAM_CONTRACT_ID",
    "live_poll_tx": "https://stellar.expert/explorer/$NETWORK/tx/$LIVE_POLL_TX_HASH",
    "event_stream_tx": "https://stellar.expert/explorer/$NETWORK/tx/$EVENT_STREAM_TX_HASH"
  }
}
EOF

echo -e "${GREEN}✓ Deployment metadata saved to: $DEPLOYMENT_FILE${NC}"

# ============================================================================
# Step 6: Update .env.example
# ============================================================================
echo -e "${YELLOW}Step 6: Updating environment configuration...${NC}"

cat > "$PROJECT_ROOT/.env.example" << EOF
# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=$NETWORK
NEXT_PUBLIC_STELLAR_RPC_URL=$RPC_URL
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="$NETWORK_PASSPHRASE"

# Contract Addresses (update after deployment)
NEXT_PUBLIC_CONTRACT_ID=$LIVE_POLL_CONTRACT_ID
NEXT_PUBLIC_EVENT_STREAM_CONTRACT_ID=$EVENT_STREAM_CONTRACT_ID

# Optional: Deployer account for reference
# SOROBAN_ACCOUNT=$SOROBAN_ACCOUNT
EOF

echo -e "${GREEN}✓ .env.example updated${NC}"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}================================================================${NC}"
echo -e "${GREEN}                    Deployment Complete!${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""
echo -e "${YELLOW}LivePoll Contract:${NC}"
echo "  ID: $LIVE_POLL_CONTRACT_ID"
echo "  Explorer: https://stellar.expert/explorer/$NETWORK/contract/$LIVE_POLL_CONTRACT_ID"
echo ""
echo -e "${YELLOW}EventStream Contract:${NC}"
echo "  ID: $EVENT_STREAM_CONTRACT_ID"
echo "  Explorer: https://stellar.expert/explorer/$NETWORK/contract/$EVENT_STREAM_CONTRACT_ID"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Copy .env.example to .env.local"
echo "  2. Update the contract IDs if needed"
echo "  3. Run 'npm run dev' to start the frontend"
echo "  4. Initialize the contract with your admin address"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  - Deployment metadata: $DEPLOYMENT_FILE"
echo "  - See DEPLOYMENT.md for detailed instructions"
echo ""
