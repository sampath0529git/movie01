fetch("http://localhost:3000/api/generate-ai", { method: "POST", headers: {"Content-Type": "application/json"} }).then(async r => console.log(r.status, await r.text())).catch(console.error);
