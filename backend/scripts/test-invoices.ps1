# backend/scripts/test-invoices.ps1
# Requiere $global:token — corré test-login.ps1 primero.
# Podés pasar status como argumento: .\test-invoices.ps1 -Status ISSUED

param(
    [string]$Status = "",       # Opcional: DRAFT | ISSUED | PAID | OVERDUE | CANCELED
    [string]$ClientId = ""      # Opcional (solo para admins sin clientId en token)
)

$BASE = "http://localhost:4000"
$TOKEN = $global:token

Write-Host "`n=== GET /invoices ===" -ForegroundColor Cyan

if (-not $TOKEN) {
    Write-Host "⚠️  Sin token. Corré: . .\scripts\test-login.ps1" -ForegroundColor Red
    exit 1
}

# Construir query string
$qs = @()
if ($Status) { $qs += "status=$Status" }
if ($ClientId) { $qs += "clientId=$ClientId" }
$query = if ($qs.Count -gt 0) { "?" + ($qs -join "&") } else { "" }

$url = "$BASE/invoices$query"
Write-Host "URL     : $url"

try {
    $resp = Invoke-WebRequest -Uri $url `
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
