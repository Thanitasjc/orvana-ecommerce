#Requires -Version 5.1
<#
.SYNOPSIS
  Sync local catalog (categories, products, variations) to Supabase production.

.USAGE
  1. Ensure deploy.env has DATABASE_URL (Supabase session pooler, port 6543)
  2. .\scripts\sync-to-supabase.ps1
     .\scripts\sync-to-supabase.ps1 -DryRun
     .\scripts\sync-to-supabase.ps1 -WithCustomers -DeployFrontend
#>
param(
    [switch]$DryRun,
    [switch]$WithCustomers,
    [switch]$DeployFrontend
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $Root "deploy.env"

if (-not (Test-Path $envFile)) {
    Write-Host "Missing deploy.env - copy from deploy.env.example and set DATABASE_URL" -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_ -split '=', 2
    Set-Item -Path "env:$($k.Trim())" -Value $v.Trim()
}

if (-not $env:DATABASE_URL) {
    Write-Host "Set DATABASE_URL in deploy.env" -ForegroundColor Red
    exit 1
}

$env:REMOTE_DATABASE_URL = $env:DATABASE_URL
if (-not $env:REMOTE_DB_SCHEMA) { $env:REMOTE_DB_SCHEMA = "aesthete" }
if (-not $env:REMOTE_DB_SSLMODE) { $env:REMOTE_DB_SSLMODE = "require" }

Write-Host "`n=== Sync local catalog -> Supabase (schema: $($env:REMOTE_DB_SCHEMA)) ===" -ForegroundColor Cyan

Push-Location (Join-Path $Root "backend")

$args = @("artisan", "catalog:sync-remote")
if ($DryRun) { $args += "--dry-run" }
if ($WithCustomers) { $args += "--with-customers" }

php @args
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -ne 0) { exit $exitCode }

if ($DeployFrontend -and -not $DryRun) {
    Write-Host "`n=== Redeploy Vercel (synced product images) ===" -ForegroundColor Cyan
    Push-Location (Join-Path $Root "frontend")
    if ($env:VERCEL_TOKEN) {
        npx vercel deploy --prod --token $env:VERCEL_TOKEN --yes
    } else {
        npx vercel deploy --prod --yes
    }
    Pop-Location
}

Write-Host "`nDone. Verify API products endpoint on Render." -ForegroundColor Green
