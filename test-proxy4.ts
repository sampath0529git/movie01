fetch("http://localhost:3000/api/nonexistent", {
  method: "POST",
}).then(r => console.log("Status:", r.status)).catch(console.error);
