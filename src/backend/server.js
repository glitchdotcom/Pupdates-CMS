const express = require("express");
const proxy = require('http-proxy-middleware');

const {wrap} = require("./utils");

const app = express();

const hmrProxy = proxy({target: 'ws://localhost:12345/', ws: true, ignorePath: true});
app.use('/__hmr:12345/', hmrProxy);

app.use(express.json());

app.use(express.static("dist/"));

app.get("*", wrap(async (req, res) => {
  res.sendFile("/app/dist/index.html");
}));

const listener = app.listen(process.env.PORT);
listener.on('upgrade', hmrProxy.upgrade);
