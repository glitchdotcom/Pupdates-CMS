const express = require("express");

const {wrap} = require("./utils");

const app = express();

app.use(express.json());

app.use(express.static("dist/"));

const listener = app.listen(process.env.PORT, async () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
