# scripts/test_admin_invite.ps1

$BaseUrl = "http://localhost:4000"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Testing Admin Invite Flow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Login as PLATFORM_ADMIN (platform_admin/admin123)
Write-Host "`n1. Logging in as PLATFORM_ADMIN (platform_admin)..." -ForegroundColor Yellow
$loginBody = @{
    username = "platform_admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $apiToken = $loginResponse.token
    Write-Host "✅ Login successful. Token received." -ForegroundColor Green
    
    $clients = Invoke-RestMethod -Uri "$BaseUrl/api/admin/clients" -Method Get -Headers @{ Authorization = "Bearer $apiToken" }
    if (-not $clients -or $clients.Count -eq 0) {
        Write-Host "❌ No clients available for invite." -ForegroundColor Red
        exit 1
    }
    $targetClientId = $clients[0].id
    Write-Host "Using clientId: $targetClientId" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit
}

# 2. Try inviting a new user as PLATFORM_ADMIN
Write-Host "`n2. Inviting a new user (test_invite@onehorizon.com)..." -ForegroundColor Yellow
$inviteBody = @{
    email    = "test_invite@onehorizon.com"
    name     = "Test Invite"
    role     = "CLIENT_USER"
    clientId = $targetClientId
} | ConvertTo-Json

try {
    $inviteResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin/invites" -Method Post -Body $inviteBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $apiToken" }
    Write-Host "✅ Invite sent successfully!" -ForegroundColor Green
    Write-Host "Activation link: $($inviteResponse.inviteLink)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Invite failed: $_" -ForegroundColor Red
    
    # Print response detail if possible
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $detail = $reader.ReadToEnd()
        Write-Host "Detail: $detail" -ForegroundColor Red
    }
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " Use the activation link printed above for test_activation.ps1." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
