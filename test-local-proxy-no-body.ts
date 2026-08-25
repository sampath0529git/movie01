fetch("http://localhost:3000/api/ai/proxy", {
  method: "POST",
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
