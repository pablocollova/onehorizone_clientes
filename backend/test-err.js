fetch("http://localhost:4000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "password" })
}).then(res => res.text()).then(text => console.log(text)).catch(console.error);
