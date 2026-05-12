# FINGUARD Platform - Instant Live Sharing
# This script uses Localtunnel to instantly create public URLs for your local servers.
# It requires NO signup, NO cloud configuration, and works immediately.

Write-Host "🚀 Starting FINGUARD Live Sharing..." -ForegroundColor Cyan

# Ensure npx is available
if (!(Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js (npx) is required but not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Start the actual servers in the background if they aren't already running
Write-Host "1. Checking local servers..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue

if (!$port3000 -or !$port8081) {
    Write-Host "Servers aren't running yet. Starting them now..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\start_all.ps1" -WindowStyle Normal
    Start-Sleep -Seconds 5
}

Write-Host "`n2. Generating Public URLs (Powered by Localtunnel)..." -ForegroundColor Cyan

# Generate unique subdomains
$random = Get-Random -Minimum 1000 -Maximum 9999
$onboardingSubdomain = "finguard-onboarding-$random"
$adminSubdomain = "finguard-admin-$random"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "🌐 LIVE URLs ARE READY!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Onboarding App : https://$onboardingSubdomain.loca.lt" -ForegroundColor White
Write-Host "Admin Dashboard: https://$adminSubdomain.loca.lt" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host "⚠️ IMPORTANT: When you visit the link, click 'Click to Continue' on the friendly warning page." -ForegroundColor Yellow
Write-Host "`nKeep this window open to maintain the live URLs. Press Ctrl+C to stop sharing." -ForegroundColor Gray

# Run both localtunnels in parallel
$job1 = Start-Job -ScriptBlock { param($sub) npx -y localtunnel --port 3000 --subdomain $sub } -ArgumentList $onboardingSubdomain
$job2 = Start-Job -ScriptBlock { param($sub) npx -y localtunnel --port 8081 --subdomain $sub } -ArgumentList $adminSubdomain

try {
    # Keep script running
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n🛑 Stopping Live Sharing..." -ForegroundColor Red
    Stop-Job $job1, $job2
    Remove-Job $job1, $job2
}
