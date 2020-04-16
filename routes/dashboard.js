const express = require("express");
const dashboardRouter = express.Router();
const jwt = require("jsonwebtoken");
const { pool } = require("../auth");
const { uniqueKey } = require("./register");

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
let dates = new Set();

dashboardRouter.post("/dates", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, (err, payload) => {
    if (!err) {
      const date = new Date();
      let unformatted = "";
      let today = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
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
        dates.add(unformatted.join("-"));
        date.setDate(date.getDate() + 1);
      }
      return res.json({
        dates: [...dates],
        today: today,
      });
    }
  });
});

dashboardRouter.post("/book", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    if (!err) {
      const bkgId = uniqueKey();
      const body = req.body;
      let schedule = "";
      return;
      const entered = await pool.query(
        "Insert into bookings values ($1, $2, $3, $4, $5, $6, $7)",
        [
          payload.username,
          body.name,
          schedule,
          bkgId,
          body.resId,
          req.body.guests,
        ]
      );
    }
  });
});
module.exports = dashboardRouter;
