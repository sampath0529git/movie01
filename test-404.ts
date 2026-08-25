fetch("http://localhost:3000/some/unknown/path", { method: "POST" }).then(async r => console.log(r.status, await r.text())).catch(console.error);
