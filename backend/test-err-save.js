const fs = require('fs');
fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "password" })
}).then(res => res.text()).then(text => fs.writeFileSync('error_full.html', text)).catch(console.error);
