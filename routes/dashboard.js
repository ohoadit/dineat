const express = require("express");
const jwt = require("jsonwebtoken");
const qrCode = require("qrcode");
const { pool } = require("../auth");
const { uniqueKey } = require("./register");
const dashboardRouter = express.Router();

dashboardRouter.get("/", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, (err, payload) => {
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

const options = {
  width: 256,
  quality: 1,
  margin: 4,
};

dashboardRouter.post("/dates", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, (err, payload) => {
    if (!err) {
      const date = new Date();

      const today = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      let unformatted = "";

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
    } else {
      return res.status(401).json({ msg: "Invalid Request" });
    }
  });
});

dashboardRouter.post("/book", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    if (!err) {
      const bkgId = uniqueKey();
      const body = req.body;
      const selDate = body.date;
      const selTime = body.time;
      try {
        if (await validSchedule(selDate, selTime.split(":"), body.resId)) {
          const entered = await pool.query(
            "Insert into bookings values ($1, $2, $3, $4, $5, $6)",
            [
              payload.username,
              body.name,
              selDate + "@" + selTime,
              bkgId,
              body.resId,
              body.guests,
            ]
          );
          const url = await qrCode.toDataURL(bkgId, options);
          if (entered.rowCount) {
            return res.json({
              saved: true,
              ticket: url,
              msg: "Booking successful!",
            });
          }
        } else {
          return res.json({ msg: "Invalid Date/Time", saved: false });
        }
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Internal Server Error :/" });
      }
    } else {
      return res.status(401).json({ msg: "Invalid Request" });
    }
  });
});

const validSchedule = (date, [hrs, mins], id) => {
  hrs = Number(hrs);
  mins = Number(mins);
  const now = new Date();
  const allowed = [0, 15, 30, 45];
  const currHrs = now.getHours();
  const currMins = now.getMinutes();

  return pool
    .query("Select time from restaurant where id = $1", [id])
    .then((data) => {
      const timings = data.rows[0].time;
      if (!timings) {
        return false;
      }
      if (timings.includes(" ")) {
        const [A, B] = timings.split(" ");
        const [A1, A2] = A.split("-");
        const [B1, B2] = B.split("-");
        if (hrs < Number(A2)) {
          if (!(hrs >= Number(A1))) {
            return false;
          }
        } else if (hrs >= Number(B1)) {
          if (!(hrs < Number(B2))) {
            return false;
          }
        }
      } else {
        const [L, U] = timings.split("-");
        if (!(hrs >= Number(L) && hrs < Number(U))) {
          return false;
        }
      }
      const availDates = [...dates];

      if (availDates.includes(date) && allowed.includes(mins)) {
        if (date === availDates[0]) {
          if (hrs === currHrs) {
            return mins - currMins >= 15 ? true : false;
          } else if (hrs === currHrs + 1 && mins == 0) {
            return currMins > 45 ? false : true;
          } else if (hrs > currHrs) {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
};
module.exports = dashboardRouter;
