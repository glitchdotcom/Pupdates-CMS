const fs = require("fs");

const express = require("express");
const proxy = require('http-proxy-middleware');

const {wrap} = require("./utils");

const app = express();

const hmrProxy = proxy({
  target: 'ws://localhost:12345/',
  ws: true,
  ignorePath: true,
  onOpen: (socket) => {
    // keepalive
    const handler = setInterval(() => {
      socket.write('\x89\x00', 'binary');
    }, 30000);
    socket.on('close', () => {
      clearInterval(handler);
    });
  },
});
app.use('/__hmr:12345/', hmrProxy);

app.use(express.json());

app.use(express.static("dist/"));

app.get("*", wrap(async (req, res) => {
  if (!fs.existsSync("/app/dist/index.html")) {
    res.end("Please wait for the build to finish");
  }
  res.sendFile("/app/dist/index.html");
}));

const listener = app.listen(process.env.PORT);
listener.on('upgrade', hmrProxy.upgrade);
