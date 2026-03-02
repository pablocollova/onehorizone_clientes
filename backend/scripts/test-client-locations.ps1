# backend/scripts/test-client-locations.ps1
# Requiere $global:token — corré test-login.ps1 primero.
# Ajustá $CLIENT_ID con el ID real del client de tu DB.

$BASE = "http://localhost:4000"
$TOKEN = $global:token
$CLIENT_ID = "REEMPLAZAR_CON_CLIENT_ID"  # <-- cambiá este valor

Write-Host "`n=== GET /clients/$CLIENT_ID/locations ===" -ForegroundColor Cyan

if (-not $TOKEN) {
    Write-Host "⚠️  Sin token. Corré: . .\scripts\test-login.ps1" -ForegroundColor Red
    exit 1
}

if ($CLIENT_ID -eq "REEMPLAZAR_CON_CLIENT_ID") {
    Write-Host "⚠️  Actualizá `$CLIENT_ID en el script con un ID real." -ForegroundColor Yellow
    Write-Host "    Tip: corré test-clients.ps1 para ver los IDs disponibles."
    exit 1
}

try {
    $resp = Invoke-WebRequest -Uri "$BASE/clients/$CLIENT_ID/locations" `
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
