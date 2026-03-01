Write-Host "--- Testing /health endpoint ---"
$health = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get
$health | ConvertTo-Json

Write-Host "`n--- Testing POST /auth/login (Invoke-RestMethod) ---"
$body = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Status: 200 OK"
    $response | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errResp = $streamReader.ReadToEnd()
        $errResp | ConvertFrom-Json | ConvertTo-Json
    } else {
        Write-Host $_.Exception.Message
    }
}
