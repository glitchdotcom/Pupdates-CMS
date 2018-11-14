const fs = require("fs");

const express = require("express");

const {wrap, pause, proxyHMR} = require("./utils");

const app = express();
const proxy = proxyHMR(app);

app.use(express.json());

app.use(express.static("dist/"));

app.get("*", wrap(async (req, res) => {
  while (!fs.existsSync("/app/dist/index.html")) {
    await pause(500);
  }
  res.sendFile("/app/dist/index.html");
}));

const listener = app.listen(process.env.PORT);
listener.on('upgrade', proxy.upgrade);
