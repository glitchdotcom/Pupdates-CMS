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

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// app.get("/home.json", (req, res) => {
//   res.sendFile('home.json', { root: 'dist' });
// });

// app.patch('/home.json', async (req, res) => {
//   // TODO: validate auth header
  
//   await fs.promises.writeFile('dist/home.json', req.body);
//   res.sendStatus(200);
// });

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
