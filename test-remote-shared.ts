fetch("https://ais-pre-lrpt4simqqbwacagppqypi-226485685421.asia-southeast1.run.app/api/ai/proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "test", model: "model", prompt: "hi" })
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
