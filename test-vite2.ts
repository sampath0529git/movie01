fetch("http://localhost:3000/src/main.tsx", { method: "POST" })
  .then(r => console.log(r.status, r.statusText))
  .catch(console.error);
