const bodyParser = require("body-parser")
const express = require("express")

const app = express()

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: false}))

app.post("/form", (req, res) => {
  res.json("OK")
})

const listener = app.listen(process.env.PORT, function () {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
