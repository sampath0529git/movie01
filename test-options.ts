fetch("https://ais-dev-lrpt4simqqbwacagppqypi-226485685421.asia-southeast1.run.app/api/ai/proxy", {
  method: "OPTIONS",
  headers: { "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type", "Origin": "https://ais-dev-lrpt4simqqbwacagppqypi-226485685421.asia-southeast1.run.app" }
}).then(async r => console.log(r.status, r.statusText, await r.text())).catch(console.error);
