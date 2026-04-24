# FINGUARD Platform - End All Services
# This script stops the processes running on ports 3000 and 8081.

Write-Host "🛑 Stopping FINGUARD Platform Services..." -ForegroundColor Red

$ports = @(3000, 8081)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan
    $processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    
    if ($processId) {
        Write-Host "Found process with PID $processId using port $port. Stopping..." -ForegroundColor Yellow
        $processId | ForEach-Object {
            try {
                Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Stopped process $_." -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to stop process $_. You may need Administrator privileges." -ForegroundColor DarkRed
            }
        }
    } else {
        Write-Host "No process found on port $port." -ForegroundColor Gray
    }
}

Write-Host "`n✅ Done. All services stopped." -ForegroundColor Yellow
