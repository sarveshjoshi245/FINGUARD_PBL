# FINGUARD Platform - Start All Services
# This script starts both the Backend (Onboarding) and Admin Dashboard.

$root = Get-Location
$onboardingAgentDir = Join-Path $root "De-coDe-main\Onboarding Interface\sbi-digital-account\agent"
$adminDashboardDir = Join-Path $root "De-coDe-main\AdminDashboard\sbi-digital-account"

Write-Host "🚀 Starting FINGUARD Platform Services..." -ForegroundColor Cyan

# 1. Start Backend Server (Port 3000)
# This also serves the onboarding frontend.
Write-Host "Starting Backend & Onboarding Interface on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$onboardingAgentDir'; npm start" -WindowStyle Normal

# 2. Start Admin Dashboard (Port 8081)
# Uses npx http-server to serve static files.
Write-Host "Starting Admin Dashboard on port 8081..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminDashboardDir'; npx http-server -p 8081" -WindowStyle Normal

Write-Host "`n✅ All services initiated. Check the newly opened windows for logs." -ForegroundColor Yellow
Write-Host "Onboarding: http://localhost:3000"
Write-Host "Admin Dashboard: http://localhost:8081"
