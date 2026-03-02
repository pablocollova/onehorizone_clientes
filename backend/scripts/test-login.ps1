# backend/scripts/test-login.ps1
# Guarda $token en la sesión actual de PowerShell para que otros scripts lo usen.
# Uso: . .\scripts\test-login.ps1  (dot-sourcing para que $token quede en scope)

$BASE = "http://localhost:4000"
$USERNAME = "admin"      # <-- cambiá si tu usuario es distinto
$PASSWORD = "admin"      # <-- cambiá si tu password es distinto

Write-Host "`n=== POST /auth/login ===" -ForegroundColor Cyan

$body = @{ username = $USERNAME; password = $PASSWORD } | ConvertTo-Json
try {
    $resp = Invoke-WebRequest -Uri "$BASE/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "Status  : $($resp.StatusCode)" -ForegroundColor Green
    $json = $resp.Content | ConvertFrom-Json
    Write-Host "Payload : $($resp.Content)"

    # Exportar $token al scope padre si se usa dot-sourcing
    $global:token = $json.token
    Write-Host "`n✅ `$global:token guardado. Usalo en otros scripts de la misma sesión." -ForegroundColor Yellow
}
catch {
    Write-Host "Status  : $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error   : $($_.Exception.Message)"
}
