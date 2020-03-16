const express = require('express')
const dashboardRouter = express.Router()
const jwt = require("jsonwebtoken");

dashboardRouter.use((req, res, next) => {
 const name = "Dineat"
  const set = req.cookies[name]
  jwt.verify(set, process.env.LOB, (err, success) => {
    if (!err) {
      return res.json({valid: true})
    } else {
      return res.json({valid: false})
    }
  })
})
module.exports = dashboardRouter;