fetch("http://localhost:3000/api/nonexistent", {
  method: "POST",
}).then(async r => console.log("Status:", r.status, await r.text().then(t => t.substring(0, 20)))).catch(console.error);
