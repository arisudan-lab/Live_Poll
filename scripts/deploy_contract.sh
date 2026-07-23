#!/usr/bin/env bash
set -euo pipefail
# Usage: ./deploy_contract.sh <wasm-path> <network> <account-secret>
WASM_PATH=${1:-target/wasm32-unknown-unknown/release/live_poll.wasm}
NETWORK=${2:-https://rpc.testnet.soroban.stellar.org:443}
SECRET=${3:-$SOROBAN_ACCOUNT_SECRET}
if [ -z "$SECRET" ]; then
  echo "Set SOROBAN_ACCOUNT_SECRET env var or pass as third arg"
  exit 1
fi
# deploy contract using soroban CLI
soroban contract deploy --wasm "$WASM_PATH" --network "$NETWORK" --secret-key "$SECRET" --wait > deploy.out
# attempt to extract transaction hash
TXHASH=$(grep -oP 'Transaction hash: \K[0-9a-fA-F]+' deploy.out | head -n1 || true)
echo "TXHASH=${TXHASH}"
echo "deploy.out saved"
