# ============================================================================
# LivePoll Smart Contract Deployment Script (PowerShell)
# ============================================================================
# This script deploys the LivePoll and EventStream contracts to Stellar Testnet
# and stores deployment metadata for tracking.
# ============================================================================

param(
    [string]$Network = "testnet",
    [string]$RpcUrl = "https://soroban-testnet.stellar.org:443",
    [string]$NetworkPassphrase = "Test SDF Network ; September 2015"
)

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ContractsDir = Join-Path $ProjectRoot "contracts"
$DeploymentsDir = Join-Path $ProjectRoot "deployments"
$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"

# Create deployments directory
if (!(Test-Path $DeploymentsDir)) {
    New-Item -ItemType Directory -Path $DeploymentsDir | Out-Null
}

Write-Host "================================================================" -ForegroundColor Blue
Write-Host "         LivePoll Smart Contract Deployment Script" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

# Check if Stellar CLI is installed
try {
    $stellarVersion = stellar --version 2>&1
} catch {
    Write-Host "Error: Stellar CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it with: cargo install --locked stellar-cli --features opt" -ForegroundColor Yellow
    exit 1
}

# Check if account is configured
$SorobanAccount = $env:SOROBAN_ACCOUNT
if ([string]::IsNullOrEmpty($SorobanAccount)) {
    Write-Host "Error: SOROBAN_ACCOUNT environment variable is not set." -ForegroundColor Red
    Write-Host "Please set it (e.g., `$env:SOROBAN_ACCOUNT='alice')" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# Step 1: Build contracts
# ============================================================================
Write-Host "Step 1: Building smart contracts..." -ForegroundColor Yellow

# Build live_poll contract
Write-Host "Building live_poll contract..."
$LivePollDir = Join-Path $ContractsDir "live_poll"
Set-Location $LivePollDir
cargo build --target wasm32-unknown-unknown --release

$LivePollWasm = Join-Path $LivePollDir "target/wasm32-unknown-unknown/release/live_poll.wasm"

if (!(Test-Path $LivePollWasm)) {
    Write-Host "Error: live_poll.wasm not found after build" -ForegroundColor Red
    exit 1
}

# Build event_stream contract
Write-Host "Building event_stream contract..."
$EventStreamDir = Join-Path $ContractsDir "event_stream"
Set-Location $EventStreamDir
cargo build --target wasm32-unknown-unknown --release

$EventStreamWasm = Join-Path $EventStreamDir "target/wasm32-unknown-unknown/release/event_stream.wasm"

if (!(Test-Path $EventStreamWasm)) {
    Write-Host "Error: event_stream.wasm not found after build" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Contracts built successfully" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 2: Optimize WASM files
# ============================================================================
Write-Host "Step 2: Optimizing WASM files..." -ForegroundColor Yellow

Set-Location $LivePollDir
stellar contract optimize --wasm $LivePollWasm
$LivePollOptimized = Join-Path $LivePollDir "target/wasm32-unknown-unknown/release/live_poll.optimized.wasm"

Set-Location $EventStreamDir
stellar contract optimize --wasm $EventStreamWasm
$EventStreamOptimized = Join-Path $EventStreamDir "target/wasm32-unknown-unknown/release/event_stream.optimized.wasm"

Write-Host "✓ WASM files optimized" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 3: Deploy contracts
# ============================================================================
Write-Host "Step 3: Deploying contracts to $Network..." -ForegroundColor Yellow

# Deploy live_poll contract
Write-Host "Deploying live_poll contract..."
Set-Location $ProjectRoot
try {
    $LivePollOutput = stellar contract deploy `
        --wasm $LivePollOptimized `
        --source $SorobanAccount `
        --network $Network `
        --wait 2>&1
} catch {
    Write-Host "Error deploying live_poll contract:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Extract contract ID
if ($LivePollOutput -match "Contract ID: ([A-Z0-9]+)") {
    $LivePollContractId = $matches[1]
} else {
    Write-Host "Error: Could not extract live_poll contract ID" -ForegroundColor Red
    Write-Host $LivePollOutput
    exit 1
}

Write-Host "✓ live_poll deployed: $LivePollContractId" -ForegroundColor Green

# Deploy event_stream contract
Write-Host "Deploying event_stream contract..."
try {
    $EventStreamOutput = stellar contract deploy `
        --wasm $EventStreamOptimized `
        --source $SorobanAccount `
        --network $Network `
        --wait 2>&1
} catch {
    Write-Host "Error deploying event_stream contract:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Extract contract ID
if ($EventStreamOutput -match "Contract ID: ([A-Z0-9]+)") {
    $EventStreamContractId = $matches[1]
} else {
    Write-Host "Error: Could not extract event_stream contract ID" -ForegroundColor Red
    Write-Host $EventStreamOutput
    exit 1
}

Write-Host "✓ event_stream deployed: $EventStreamContractId" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 4: Get WASM hashes
# ============================================================================
Write-Host "Step 4: Computing WASM hashes..." -ForegroundColor Yellow

$LivePollWasmHash = stellar contract hash --wasm $LivePollOptimized
$EventStreamWasmHash = stellar contract hash --wasm $EventStreamOptimized

Write-Host "✓ WASM hashes computed" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 5: Store deployment metadata
# ============================================================================
Write-Host "Step 5: Storing deployment metadata..." -ForegroundColor Yellow

$DeploymentFile = Join-Path $DeploymentsDir "deployment-$Network-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

# Extract transaction hashes
$LivePollTxHash = if ($LivePollOutput -match "Transaction hash: ([a-f0-9]+)") { $matches[1] } else { "unknown" }
$EventStreamTxHash = if ($EventStreamOutput -match "Transaction hash: ([a-f0-9]+)") { $matches[1] } else { "unknown" }

# Get git info
try {
    $GitCommit = git rev-parse HEAD 2>&1
    $GitBranch = git rev-parse --abbrev-ref HEAD 2>&1
} catch {
    $GitCommit = "unknown"
    $GitBranch = "unknown"
}

# Create metadata JSON
$DeploymentMetadata = @{
    deployment = @{
        timestamp = $Timestamp
        network = $Network
        network_passphrase = $NetworkPassphrase
        rpc_url = $RpcUrl
        deployer_account = $SorobanAccount
        git_commit = $GitCommit
        git_branch = $GitBranch
    }
    contracts = @{
        live_poll = @{
            contract_id = $LivePollContractId
            wasm_hash = $LivePollWasmHash
            deployment_tx = $LivePollTxHash
            wasm_path = $LivePollOptimized
            version = "1.0.0"
        }
        event_stream = @{
            contract_id = $EventStreamContractId
            wasm_hash = $EventStreamWasmHash
            deployment_tx = $EventStreamTxHash
            wasm_path = $EventStreamOptimized
            version = "1.0.0"
        }
    }
    explorer_links = @{
        live_poll = "https://stellar.expert/explorer/$Network/contract/$LivePollContractId"
        event_stream = "https://stellar.expert/explorer/$Network/contract/$EventStreamContractId"
        live_poll_tx = "https://stellar.expert/explorer/$Network/tx/$LivePollTxHash"
        event_stream_tx = "https://stellar.expert/explorer/$Network/tx/$EventStreamTxHash"
    }
}

$DeploymentMetadata | ConvertTo-Json -Depth 10 | Out-File -FilePath $DeploymentFile -Encoding utf8

Write-Host "✓ Deployment metadata saved to: $DeploymentFile" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Step 6: Update .env.example
# ============================================================================
Write-Host "Step 6: Updating environment configuration..." -ForegroundColor Yellow

$EnvExample = @"
# Stellar Network Configuration
NEXT_PUBLIC_STELLAR_NETWORK=$Network
NEXT_PUBLIC_STELLAR_RPC_URL=$RpcUrl
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=`"$NetworkPassphrase`"

# Contract Addresses (update after deployment)
NEXT_PUBLIC_CONTRACT_ID=$LivePollContractId
NEXT_PUBLIC_EVENT_STREAM_CONTRACT_ID=$EventStreamContractId

# Optional: Deployer account for reference
# SOROBAN_ACCOUNT=$SorobanAccount
"@

$EnvExample | Out-File -FilePath (Join-Path $ProjectRoot ".env.example") -Encoding utf8

Write-Host "✓ .env.example updated" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Summary
# ============================================================================
Write-Host "================================================================" -ForegroundColor Blue
Write-Host "                    Deployment Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""
Write-Host "LivePoll Contract:" -ForegroundColor Yellow
Write-Host "  ID: $LivePollContractId"
Write-Host "  Explorer: https://stellar.expert/explorer/$Network/contract/$LivePollContractId"
Write-Host ""
Write-Host "EventStream Contract:" -ForegroundColor Yellow
Write-Host "  ID: $EventStreamContractId"
Write-Host "  Explorer: https://stellar.expert/explorer/$Network/contract/$EventStreamContractId"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Copy .env.example to .env.local"
Write-Host "  2. Update the contract IDs if needed"
Write-Host "  3. Run 'npm run dev' to start the frontend"
Write-Host "  4. Initialize the contract with your admin address"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - Deployment metadata: $DeploymentFile"
Write-Host "  - See DEPLOYMENT.md for detailed instructions"
Write-Host ""

Set-Location $ProjectRoot
