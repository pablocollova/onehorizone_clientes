Write-Host "--- Testing /health endpoint (curl.exe) ---"
curl.exe -s http://localhost:4000/health

Write-Host "`n`n--- Testing POST /auth/login (curl.exe) ---"
curl.exe -s -w "\nHTTP Status: %{http_code}" -X POST http://localhost:4000/auth/login `
  -H "Content-Type: application/json" `
  -d "{\`"username\`": \`"admin\`", \`"password\`": \`"password\`"}"
Write-Host "`n"
