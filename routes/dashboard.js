const express = require("express");
const dashboardRouter = express.Router();
const jwt = require("jsonwebtoken");

dashboardRouter.get("/", (req, res, next) => {
  const name = "Dineat";
  const set = req.cookies[name];
  jwt.verify(set, process.env.LOB, (err, payload) => {
    if (!err) {
      return res.json({
        valid: true,
        user: payload,
        admin: payload.username === "feedbackloop08" ? true : false,
      });
    } else {
      return res.json({ valid: false });
    }
  });
});

dashboardRouter.post("/dates", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, (err, payload) => {
    if (!err) {
      const date = new Date();
      const dates = [];
      let unformatted = "";
      let today;
      for (let i = 1; i <= 15; i++) {
        unformatted = date
          .toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .split(",")[0]
          .split("/");
        unformatted.unshift(unformatted.pop());
        dates.push(unformatted.join("-"));
        date.setDate(date.getDate() + 1);
      }

      return res.json({
        dates: dates,
      });
    }
  });
});
module.exports = dashboardRouter;
