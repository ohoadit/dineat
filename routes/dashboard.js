const express = require('express')
const dashboardRouter = express.Router()
const jwt = require("jsonwebtoken");

dashboardRouter.get('/', (req, res, next) => {
 const name = "Dineat"
  const set = req.cookies[name]
  jwt.verify(set, process.env.LOB, (err, payload) => {
    console.log(payload)
    if (!err) {
      return res.json({valid: true, user: payload, admin: payload === 'feedbackloop08' ? true : false})
    } else {
      return res.json({valid: false})
    }
  })
})
module.exports = dashboardRouter;