<#
Install script for Civora monorepo (Windows PowerShell)

Usage: Open PowerShell in the repo root and run:
  .\scripts\install-all.ps1

This script will:
 - Validate Node and npm are available
 - Run `npm install` in each package folder
 - Install AI runtime deps for `ai-services`

Note: This script does not install the Google Cloud SDK. Install it separately if you need deployments.
#>

function Abort([string]$msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

Write-Host "Starting Civora dependency install..." -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Abort "Node.js is not installed or not on PATH." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Abort "npm is not installed or not on PATH." }

# Determine repository root (parent of the scripts folder)
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Push-Location $root

Write-Host "Installing frontend dependencies (frontend-pwa)..." -ForegroundColor Yellow
Push-Location (Join-Path $root "frontend-pwa")
npm install
if ($LASTEXITCODE -ne 0) { Abort "npm install failed in frontend-pwa" }
Pop-Location

Write-Host "Installing backend dependencies (backend-api)..." -ForegroundColor Yellow
Push-Location (Join-Path $root "backend-api")
npm install
if ($LASTEXITCODE -ne 0) { Abort "npm install failed in backend-api" }
Pop-Location

Write-Host "Installing AI services dependencies (ai-services)..." -ForegroundColor Yellow
Push-Location (Join-Path $root "ai-services")
npm install
if ($LASTEXITCODE -ne 0) { Abort "npm install failed in ai-services" }

Write-Host "Installing AI runtime packages (node-fetch@2, @google-cloud/speech)..." -ForegroundColor Yellow
npm install node-fetch@2 @google-cloud/speech
if ($LASTEXITCODE -ne 0) { Abort "Failed to install AI packages" }
Pop-Location

Write-Host "All dependencies installed successfully." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host " - Start backend: cd backend-api; npm run dev" -ForegroundColor Gray
Write-Host " - Start frontend: cd frontend-pwa; npm run dev" -ForegroundColor Gray
Write-Host " - Run AI tests: cd ai-services; npm test" -ForegroundColor Gray

Pop-Location
