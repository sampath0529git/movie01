fetch("http://localhost:3000/api/ai/proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "AIzaSy-dummy", model: "gemini-1.5-flash", prompt: "hi", schema: {} })
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
