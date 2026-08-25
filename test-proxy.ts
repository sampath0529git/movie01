fetch("http://localhost:3000/api/ai/proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "sk-or-dummy", model: "test", prompt: "hi" })
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
