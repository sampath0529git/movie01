fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({})
}).then(r => console.log(r.status, r.statusText)).catch(console.error);
