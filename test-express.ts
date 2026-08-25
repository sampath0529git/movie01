import express from "express";
const app = express();
app.get("/test", (req, res) => res.send("GET test"));
const server = app.listen(0, () => {
  const port = server.address().port;
  fetch(`http://localhost:${port}/test`, { method: "POST" })
    .then(r => console.log(r.status, r.statusText))
    .finally(() => server.close());
});
