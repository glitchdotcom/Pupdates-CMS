const fs = require("fs");

const express = require("express");

const {
  pause,
  proxyParcelHMR,
  wrap,
} = require("./utils");
const { getHomeData, getAllPages } = require('./home-data');

const app = express();
// This is needed to make Parcel live-updates work on Glitch.
const proxy = proxyParcelHMR(app);

app.use(express.json());

app.use(express.static("dist"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.get("/pupdate.json", async (req, res) => {
  try {
    const data = await getHomeData();
    res.json(data);
  } catch (e) {
    console.error(e.data);
    res.status(500).send('👎');
  }
});

const GLITCH_TEAM_ID = 74;

app.post('/pupdate.json', async (req, res) => {
  const persistentToken = req.headers.authorization;
  
  const teams = await getAllPages(`/v1/users/by/persistentToken/teams?persistentToken=${persistentToken}&limit=100`);
  if (!teams.some((team) => team.id === GLITCH_TEAM_ID)) throw new Error('Forbidden');
    
  await fs.promises.writeFile('.data/pupdate.json', JSON.stringify(req.body));
  res.sendStatus(200);
});

app.get("/", wrap(async (req, res) => {
  // if dist/index.html is not available yet, wait until it is available.
  while (!fs.existsSync("dist/index.html")) {
    await pause(500);
  }
  res.sendFile("index.html", {root: "dist"});
}));

app.listen(process.env.PORT, () => {
  console.error("\nBackend restarted. Refresh the preview to see the changes.\n");
}).on('upgrade', proxy.upgrade); // This is needed to make Parcel live-updates work on Glitch.
