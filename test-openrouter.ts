fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "OPTIONS",
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
