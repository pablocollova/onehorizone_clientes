# scripts/test_admin_invite.ps1

$BaseUrl = "http://localhost:4000"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Testing Admin Invite Flow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Login as PLATFORM_ADMIN (admin/admin123)
Write-Host "`n1. Logging in as PLATFORM_ADMIN (admin)..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $apiToken = $loginResponse.token
    Write-Host "✅ Login successful. Token received." -ForegroundColor Green
    
    # Store clientId of the platform admin for later
    $adminClient = $loginResponse.user.clientId
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
    clientId = $adminClient  # Use the same client ID for simplicity
} | ConvertTo-Json

try {
    $inviteResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users/invite" -Method Post -Body $inviteBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $apiToken" }
    Write-Host "✅ Invite sent successfully!" -ForegroundColor Green
    Write-Host ($inviteResponse | ConvertTo-Json) -ForegroundColor Gray
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
Write-Host " Please check the backend console for the Activation Link." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
