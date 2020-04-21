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
          const check = await pool.query(
            "Select * from bookings where username = $1 and date = $2 and resid = $3 and uid != 'expired'",
            [payload.username, selDate, body.resId]
          );
          if (check.rowCount === 1) {
            return res.json({ msg: "Cannot book the same restaurant twice!" });
          }
          const entered = await pool.query(
            "Insert into bookings(username, name, date, uid, resid, guests, time) values ($1, $2, $3, $4, $5, $6, $7)",
            [payload.username, body.name, selDate, bkgId, body.resId, body.guests, selTime]
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
          return res.json({ msg: "Invalid Date/Time" });
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

dashboardRouter.post("/passbook", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    if (!err) {
      try {
        const bookings = await pool.query(
          `SELECT bookings.name, bookings.date, bookings.time, bookings.guests, bookings.id, restaurant.name, restaurant.location 
              FROM bookings INNER JOIN restaurant ON restaurant.id = bookings.resid WHERE bookings.username = $1 ORDER BY bookings.id DESC`,
          [payload.username]
        );
        let date, time, now;

        bookings.rows.forEach((booking) => {
          date = booking.date;
          time = booking.time;
          date = date.replace(/\-/g, "/") + ", " + time;
          now = new Date(date).toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          booking.schedule = now + ` ${time}`;
        });
        return bookings.rows.length
          ? res.json({ valid: true, bookings: bookings.rows })
          : res.json({ msg: "No previous bookings" });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Internal Server Error :/" });
      }
    } else {
      return res.status(401).json({ msg: "Invalid Request" });
    }
  });
});

dashboardRouter.post("/getQR", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    if (!err) {
      try {
        const data = await pool.query("Select uid from bookings where username = $1 and id = $2", [
          payload.username,
          req.body.id,
        ]);
        const token = data.rows[0].uid;
        if (token === "expired") {
          return res.json({ msg: "The ticket has been used or expired." });
        }
        if (token) {
          const url = await qrCode.toDataURL(token, options);
          return res.json({ valid: true, blob: url });
        } else {
          return res.json({ msg: "No such entry" });
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

dashboardRouter.post("/regenqr", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, (err, data) => {
    if (!err) {
      try {
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Internal Server Error :/" });
      }
    } else {
      return res.status(401).json({ msg: "Invalid Request" });
    }
  });
});

module.exports = dashboardRouter;
