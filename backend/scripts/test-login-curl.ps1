Write-Host "--- Testing /health endpoint (curl.exe) ---"
curl.exe -s http://localhost:4000/health

Write-Host "`n`n--- Testing POST /api/auth/login (curl.exe) ---"
curl.exe -s -w "\nHTTP Status: %{http_code}" -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\`"username\`": \`"platform_admin\`", \`"password\`": \`"admin123\`"}"
Write-Host "`n"
