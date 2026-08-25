fetch("http://localhost:3000/index.html", { method: "POST" })
  .then(r => console.log(r.status, r.statusText))
  .catch(console.error);
