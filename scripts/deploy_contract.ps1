Param(
  [string]$WasmPath = "target/wasm32-unknown-unknown/release/live_poll.wasm",
  [string]$Network = "https://rpc.testnet.soroban.stellar.org:443",
  [string]$Secret = $env:SOROBAN_ACCOUNT_SECRET
)
if (-not $Secret) { Write-Error "Set SOROBAN_ACCOUNT_SECRET env var or pass as parameter"; exit 1 }
soroban contract deploy --wasm $WasmPath --network $Network --secret-key $Secret --wait > deploy.out
Select-String -Path deploy.out -Pattern "Transaction hash:" | ForEach-Object {
  $_.Line -replace ".*Transaction hash:\s*",""
}
