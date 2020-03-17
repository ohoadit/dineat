const express = require('express')
const dashboardRouter = express.Router()
const jwt = require("jsonwebtoken");

dashboardRouter.use((req, res, next) => {
 const name = "Dineat"
  const set = req.cookies[name]
  jwt.verify(set, process.env.LOB, (err, payload) => {
    console.log(payload)
    if (!err) {
      return res.json({valid: true, user: payload})
    } else {
      return res.json({valid: false})
    }
  })
})
module.exports = dashboardRouter;