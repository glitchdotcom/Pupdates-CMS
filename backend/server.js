const fs = require("fs");

const express = require("express");

const {
  pause,
  proxyParcelHMR,
  wrap,
} = require("./utils");

const app = express();
// This is needed to make Parcel live-updates work on Glitch.
const proxy = proxyParcelHMR(app);

app.use(express.json());

app.use(express.static("dist/"));

// if a file is not found in dist/, then serve dist/index.html.
app.get("*", wrap(async (req, res) => {
  // if dist/index.html is not available yet, wait until it is available.
  while (!fs.existsSync("dist/index.html")) {
    await pause(500);
  }
  res.sendFile("index.html", {root: "dist"});
}));

app.listen(process.env.PORT, () => {
  console.error("\nBackend restarted. Refresh the preview to see the changes.\n");
}).on('upgrade', proxy.upgrade); // This is needed to make Parcel live-updates work on Glitch.
