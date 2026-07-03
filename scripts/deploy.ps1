#Requires -Version 5.1
<#
.SYNOPSIS
  Deploy AESTHETE: Supabase → Render → Vercel (from local machine)

.USAGE
  1. Copy deploy.env.example → deploy.env and fill secrets
  2. .\scripts\deploy.ps1 -Step all
     Or step by step: supabase | render | vercel | migrate
#>
param(
    [ValidateSet("all", "supabase", "render", "vercel", "migrate", "login")]
    [string]$Step = "all"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Load-DeployEnv {
    $envFile = Join-Path $Root "deploy.env"
    if (-not (Test-Path $envFile)) {
        Write-Host "Missing deploy.env — copy from deploy.env.example" -ForegroundColor Yellow
        return $false
    }
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
        $k, $v = $_ -split '=', 2
        Set-Item -Path "env:$($k.Trim())" -Value $v.Trim()
    }
    return $true
}

function Step-SupabaseLogin {
    Write-Host "`n=== Supabase login (browser will open) ===" -ForegroundColor Cyan
    npx supabase login
}

function Step-SupabaseCreate {
    if (-not (Load-DeployEnv)) { return }
    if (-not $env:SUPABASE_DB_PASSWORD) {
        Write-Host "Set SUPABASE_DB_PASSWORD in deploy.env" -ForegroundColor Red
        return
    }
    Write-Host "`n=== Create Supabase project (region: Singapore) ===" -ForegroundColor Cyan
    $orgs = npx supabase orgs list 2>&1
    Write-Host $orgs
    $orgId = (npx supabase orgs list -o json | ConvertFrom-Json | Select-Object -First 1).id
    if (-not $orgId) {
        Write-Host "No Supabase org found. Create one at https://supabase.com/dashboard" -ForegroundColor Red
        return
    }
    $result = npx supabase projects create aesthete-orvana `
        --org-id $orgId `
        --db-password $env:SUPABASE_DB_PASSWORD `
        --region ap-southeast-1 2>&1
    Write-Host $result
    Write-Host "`nGet DATABASE_URL from: https://supabase.com/dashboard → Project Settings → Database → URI (Session pooler, port 6543)" -ForegroundColor Green
}

function Step-RenderBlueprint {
    Write-Host "`n=== Render Blueprint ===" -ForegroundColor Cyan
    Write-Host "Open: https://dashboard.render.com/blueprints" -ForegroundColor Green
    Write-Host "1. New Blueprint Instance → connect GitHub repo Thanitasjc/orvana-ecommerce"
    Write-Host "2. Set sync: false env vars:"
    Write-Host "   DATABASE_URL = (Supabase connection string)"
    Write-Host "   APP_URL      = https://aesthete-api.onrender.com (or your service URL)"
    Write-Host "   FRONTEND_URL = (Vercel URL after frontend deploy)"
    Write-Host "   SANCTUM_STATEFUL_DOMAINS = (Vercel host without https)"
    Start-Process "https://dashboard.render.com/blueprints"
}

function Step-VercelDeploy {
    if (Load-DeployEnv) {
        if ($env:VERCEL_TOKEN) { $env:VERCEL_ORG_ID = $null }
    }
    Write-Host "`n=== Vercel deploy (frontend) ===" -ForegroundColor Cyan
    Push-Location (Join-Path $Root "frontend")
    if ($env:VERCEL_TOKEN) {
        npx vercel deploy --prod --token $env:VERCEL_TOKEN --yes
    } else {
        Write-Host "Running vercel login + deploy (interactive)..." -ForegroundColor Yellow
        npx vercel login
        $apiUrl = $env:RENDER_SERVICE_URL
        if ($apiUrl) {
            npx vercel env add NEXT_PUBLIC_API_URL production --force 2>$null
            echo "$apiUrl/api/v1" | npx vercel env add NEXT_PUBLIC_API_URL production
        }
        npx vercel --prod
    }
    Pop-Location
}

function Step-MigrateSeed {
    if (-not (Load-DeployEnv)) { return }
    if (-not $env:DATABASE_URL) {
        Write-Host "Set DATABASE_URL in deploy.env" -ForegroundColor Red
        return
    }
    Write-Host "`n=== Migrate + seed on Supabase (local artisan) ===" -ForegroundColor Cyan
    Push-Location (Join-Path $Root "backend")
    $env:DB_CONNECTION = "pgsql"
    $env:DATABASE_URL = $env:DATABASE_URL
    php artisan migrate --force
    php artisan db:seed --force
    Pop-Location
    Write-Host "Done." -ForegroundColor Green
}

switch ($Step) {
    "login"    { Step-SupabaseLogin }
    "supabase" { Step-SupabaseLogin; Step-SupabaseCreate }
    "render"   { Step-RenderBlueprint }
    "vercel"   { Step-VercelDeploy }
    "migrate"  { Step-MigrateSeed }
    "all" {
        Step-SupabaseLogin
        Step-SupabaseCreate
        Step-MigrateSeed
        Step-RenderBlueprint
        Step-VercelDeploy
    }
}
