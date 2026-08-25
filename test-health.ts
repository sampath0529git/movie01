fetch("http://localhost:3000/api/health").then(async r => console.log(r.status, await r.text())).catch(console.error);
