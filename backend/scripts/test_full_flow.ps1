# scripts/test_full_flow.ps1
# Full end-to-end test: Admin invites user -> User activates -> User logs in

$BaseUrl = "http://localhost:4000"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Full E2E: Admin Invite + Activation Flow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# STEP 1: Login as PLATFORM_ADMIN
Write-Host "`n[STEP 1] Login as PLATFORM_ADMIN (platform_admin)..." -ForegroundColor Yellow
$loginBody = @{ username = "platform_admin"; password = "admin123" } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $adminToken = $loginResponse.token
    Write-Host "  ✅ Login OK. Role: $($loginResponse.user.role)." -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Login failed: $_" -ForegroundColor Red; exit
}

# STEP 2: Select a client for the invited user
Write-Host "`n[STEP 2] Loading clients..." -ForegroundColor Yellow
try {
    $clients = Invoke-RestMethod -Uri "$BaseUrl/api/admin/clients" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
    if (-not $clients -or $clients.Count -eq 0) {
        Write-Host "  ❌ No clients available for invite." -ForegroundColor Red; exit
    }
    $adminClientId = $clients[0].id
    Write-Host "  ✅ Using client: $($clients[0].name) ($adminClientId)" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Client load failed: $_" -ForegroundColor Red; exit
}

# STEP 3: Invite a new user
$TestEmail = "e2e_test_$(Get-Date -Format 'HHmmss')@onehorizon.com"
Write-Host "`n[STEP 3] Inviting new user: $TestEmail ..." -ForegroundColor Yellow
$inviteBody = @{
    email    = $TestEmail
    name     = "E2E Test User"
    role     = "CLIENT_USER"
    clientId = $adminClientId
} | ConvertTo-Json

try {
    $inviteResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin/invites" -Method Post -Body $inviteBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $adminToken" }
    Write-Host "  ✅ Invite sent! $($inviteResponse.message)" -ForegroundColor Green
    $inviteLink = $inviteResponse.inviteLink
}
catch {
    Write-Host "  ❌ Invite failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "  Detail: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit
}

# STEP 4: Extract the activation token from the invite response
Write-Host "`n[STEP 4] Extracting activation token from invite response..." -ForegroundColor Yellow
if ($inviteLink -match "token=([a-f0-9]+)") {
    $activationToken = $Matches[1]
    Write-Host "  ✅ Token found (last 8 chars): ....$($activationToken.Substring($activationToken.Length - 8))" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Could not parse token from invite response." -ForegroundColor Red; exit
}

# STEP 5: Activate the account
Write-Host "`n[STEP 5] Activating account..." -ForegroundColor Yellow
$activateBody = @{
    token    = $activationToken
    password = "SecurePass123!"
    profile  = @{ phone = "+34 600 000 000"; address = "Madrid, Spain" }
} | ConvertTo-Json -Depth 5

try {
    $activateResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/activate" -Method Post -Body $activateBody -ContentType "application/json"
    Write-Host "  ✅ Activation OK! User: $($activateResponse.user.username), Status: $($activateResponse.user.status)" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ Activation failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "  Detail: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit
}

# STEP 6: Login with EMAIL
Write-Host "`n[STEP 6] Login with email after activation..." -ForegroundColor Yellow
$loginBody2 = @{ username = $TestEmail; password = "SecurePass123!" } | ConvertTo-Json
try {
    $loginResponse2 = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody2 -ContentType "application/json"
    Write-Host "  ✅ Login OK! Role: $($loginResponse2.user.role), Status: $($loginResponse2.user.status)" -ForegroundColor Green
    Write-Host "  JWT Preview: $($loginResponse2.token.Substring(0,30))..." -ForegroundColor Gray
}
catch {
    Write-Host "  ❌ Login failed: $_" -ForegroundColor Red
}

# STEP 7: Verify platform_admin/admin123 still works
Write-Host "`n[STEP 7] Verify platform_admin/admin123 still works..." -ForegroundColor Yellow
try {
    $adminCheck = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body (@{username = "platform_admin"; password = "admin123" } | ConvertTo-Json) -ContentType "application/json"
    Write-Host "  ✅ platform_admin/admin123 still works! Role: $($adminCheck.user.role)" -ForegroundColor Green
}
catch {
    Write-Host "  ❌ platform_admin/admin123 broken! $_" -ForegroundColor Red
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " All steps completed!" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
