# FINGUARD Development - Start All Services
# This script starts both backend (port 3000) and frontend (port 5173)

$root = Get-Location
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "🚀 Starting FINGUARD Development Services..." -ForegroundColor Cyan

# 1. Start Backend Server (Port 3000)
Write-Host "Starting Backend on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm start" -WindowStyle Normal

# 2. Start Frontend Server (Port 5173)
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ All services initiated. Check the newly opened windows for logs." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
Write-Host "Onboarding: http://localhost:3000/onboarding.html"
Write-Host "Admin Dashboard: http://localhost:3000/index.html"
