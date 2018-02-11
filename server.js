const bodyParser = require("body-parser")
const express = require("express")
const Recurly = require("recurly")

const app = express()
const recurly = new Recurly({
  API_KEY: process.env.RECURLY_API_KEY,
  SUBDOMAIN: "glitch",
  ENVIRONMENT: "sandbox",
  DEBUG: true
})

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: false}))

app.post("/form", (req, res) => {
  console.log(req.body)
  const details = {
    plan_code: "pyrite",
    currency: "USD",
    account: {
      account_code: "can_this_be_set",
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      
    billing_info: {
      token_id: req.body.recurly_token
    }
    }
  }
  recurly.subscriptions.create(details, (err, subscription) => {
    if (err) {
      console.error(err)
      res.status(503).json(err)
    } else {
      res.json(subscription)
    }
  })
})

const listener = app.listen(process.env.PORT, function () {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
