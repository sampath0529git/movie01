fetch("http://localhost:3000/api/ai/proxy", {
  method: "OPTIONS",
  headers: { "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type", "Origin": "http://localhost:3000" }
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
