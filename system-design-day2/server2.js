const express = require("express");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello from Server 2");
});

app.listen(3002, () => {
  console.log("Server 2 running on port 3002");
});