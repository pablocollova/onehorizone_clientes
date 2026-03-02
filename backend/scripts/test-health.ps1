# backend/scripts/test-health.ps1
$BASE = "http://localhost:4000"

Write-Host "`n=== GET /health ===" -ForegroundColor Cyan

try {
    $resp = Invoke-WebRequest -Uri "$BASE/health" -Method GET -UseBasicParsing
    Write-Host "Status  : $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Payload : $($resp.Content)"
}
catch {
    Write-Host "Status  : $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error   : $($_.Exception.Message)"
}
