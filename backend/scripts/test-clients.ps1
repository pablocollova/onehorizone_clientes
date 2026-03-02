# backend/scripts/test-clients.ps1
# Requiere $global:token — corré test-login.ps1 primero.

$BASE = "http://localhost:4000"
$TOKEN = $global:token

Write-Host "`n=== GET /clients ===" -ForegroundColor Cyan

if (-not $TOKEN) {
    Write-Host "⚠️  Sin token. Corré: . .\scripts\test-login.ps1" -ForegroundColor Red
    exit 1
}

try {
    $resp = Invoke-WebRequest -Uri "$BASE/clients" `
        -Method GET `
        -Headers @{ Authorization = "Bearer $TOKEN" } `
        -UseBasicParsing

    Write-Host "Status  : $($resp.StatusCode)" -ForegroundColor Green
    Write-Host "Payload : $($resp.Content)"
}
catch {
    Write-Host "Status  : $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error   : $($_.Exception.Message)"
}
