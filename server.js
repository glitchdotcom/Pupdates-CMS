const bodyParser = require("body-parser");
const express = require("express");

const app = express();

function wrap (fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));

const listener = app.listen(process.env.PORT, async () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
