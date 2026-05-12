#!/usr/bin/env pwsh
<#
.SYNOPSIS
    FINGUARD Platform - Complete Setup & Run Script
    
.DESCRIPTION
    Starts both Backend and Frontend for the FINGUARD platform
    
.NOTES
    Backend:  http://localhost:3000
    Admin:    http://localhost:3000/#adminPortal
    Customer: http://localhost:3000
#>

Write-Host "`n" + ("="*60) -ForegroundColor Cyan
Write-Host "🚀 FINGUARD Platform - Complete Setup" -ForegroundColor Cyan
Write-Host ("="*60) -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"

# Step 1: Check Node.js
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node -v 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$backendDir/node_modules")) {
    Write-Host "   Installing backend packages..."
    Push-Location $backendDir
    npm install --silent
    Pop-Location
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Step 3: Display URLs
Write-Host "`n" + ("="*60) -ForegroundColor Green
Write-Host "🎯 FINGUARD Platform URLs" -ForegroundColor Green
Write-Host ("="*60) -ForegroundColor Green
Write-Host "
📱 Customer Onboarding:  http://localhost:3000
   ├─ Start Account:     http://localhost:3000
   ├─ AI Chat:          Built-in Sidebar Widget
   └─ Resume Draft:      Enter Mobile Number

👮 Admin Dashboard:     http://localhost:3000/#adminPortal
   ├─ Login:           admin / Admin@123
   ├─ Sections:        Engagement, Identity, Workflow, Compliance, Analytics
   └─ Permissions:     View, Approve, Reject Applications

🔧 API Endpoints:       http://localhost:3000/api/
   ├─ Auth:            POST /auth/login, /auth/register-admin, GET /auth/me
   ├─ Applications:    CRUD /applications, /applications/:id/approve|reject
   ├─ Drafts:         POST /drafts (autosave), GET /drafts/:mobile (resume)
   ├─ Audit:          GET /audit-logs, /audit-logs/summary
   ├─ Chat:           POST /chat, /onboarding
   └─ Health:         GET /health

" -ForegroundColor Cyan

# Step 4: Start Backend
Write-Host ("="*60) -ForegroundColor Green
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Green
Write-Host ("="*60) -ForegroundColor Green

Push-Location $backendDir
npm start

Pop-Location
