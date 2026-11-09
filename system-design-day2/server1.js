const express = require("express");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello from Server 1");
});

app.listen(3001, () => {
  console.log("Server 1 running on port 3001");
});