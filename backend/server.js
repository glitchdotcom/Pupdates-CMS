const fs = require("fs");

const express = require("express");

const {
  pause,
  proxyParcelHMR,
  wrap,
} = require("./utils");

const app = express();
const proxy = proxyParcelHMR(app);

app.use(express.json());

app.use(express.static("dist/"));

app.get("*", wrap(async (req, res) => {
  while (!fs.existsSync("/app/dist/index.html")) {
    await pause(500);
  }
  res.sendFile("/app/dist/index.html");
}));

app.listen(process.env.PORT, () => {
  console.log("Backend restarted. Make sure to refresh the preview  
}).on('upgrade', proxy.upgrade);
