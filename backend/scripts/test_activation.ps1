# scripts/test_activation.ps1
param(
    [Parameter(Mandatory = $true)]
    [string]$Token,
    [string]$Email = "test_invite@onehorizon.com",
    [string]$Password = "NewSecurePassword123!"
)

$BaseUrl = "http://localhost:4000"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Testing User Activation Flow" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host "`n1. Activating user with token ending in $($Token.Substring($Token.Length - 6))..." -ForegroundColor Yellow
$activateBody = @{
    token    = $Token
    password = $Password
    profile  = @{
        phone     = "+34 600 123 456"
        address   = "Test St. 123, Madrid"
        docType   = "NIE"
        docNumber = "Y1234567Z"
    }
} | ConvertTo-Json

try {
    $activateResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/activate" -Method Post -Body $activateBody -ContentType "application/json"
    $apiToken = $activateResponse.token
    Write-Host "✅ Activation successful! JWT received." -ForegroundColor Green
    
    # Store token for a follow up request
    $newJwt = $activateResponse.token
    Write-Host ($activateResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
}
catch {
    Write-Host "❌ Activation failed: $_" -ForegroundColor Red
    
    # Print response detail if possible
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $detail = $reader.ReadToEnd()
        Write-Host "Detail: $detail" -ForegroundColor Red
    }
    exit
}

# 3. Test logging in with new credentials
Write-Host "`n2. Logging in with new credentials..." -ForegroundColor Yellow
$loginBody = @{
    username = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $apiToken = $loginResponse.token
    Write-Host "✅ Login successful! Token received." -ForegroundColor Green
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $detail = $reader.ReadToEnd()
        Write-Host "Detail: $detail" -ForegroundColor Red
    }
}
