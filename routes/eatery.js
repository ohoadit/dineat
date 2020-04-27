require("dotenv").config();
const express = require("express");
const { pool, bcrypt } = require("../auth");
const jwt = require("jsonwebtoken");
const eateryRouter = express.Router();

eateryRouter.post("/gate", async (req, res, next) => {
  try {
    const user = await pool.query("Select password, name from restaurant where id = $1", [
      req.body.username,
    ]);
    if (!user.rowCount) {
      return res.status(401).json({ field: "idErr", msg: "Invalid ID" });
    } else {
      bcrypt.compare(req.body.password, user.rows[0].password, (err, same) => {
        if (same) {
          const entryPass = jwt.sign(
            { id: req.body.username, username: user.rows[0].name },
            process.env.LOB,
            { expiresIn: "18000000" }
          );
          res.cookie("Dineat", entryPass, {
            expiresIn: new Date(Date.now() + 18000000),
            maxAge: 18000000,
          });
          return res.json({ matched: true });
        } else {
          return res.status(401).json({ field: "passErr", msg: "Invalid password" });
        }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ field: "passErr", msg: "Internal Server Error :/" });
  }
});

eateryRouter.post("/verify", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    if (!err && payload.id) {
      const query = await pool.query(
        "Select username, name, date, time from bookings where uid = $1 and resid = $2",
        [req.body.ticket, payload.id]
      );
      if (query.rowCount) {
        if (checkDateTime(query.rows[0].date, query.rows[0].time)) {
          return res.json({ success: true });
        } else {
          await pool.query("update bookings set uid = $1 where uid = $2", [
            "expired",
            req.body.ticket,
          ]);
          return res.json({ success: false, msg: "QR code expired!" });
        }
      } else {
        return res.json({ success: false, msg: "Invalid QR Code" });
      }
    } else {
      return res.status(401).json({ msg: "Invalid Request" });
    }
  });
});

const checkDateTime = (date, time) => {
  const current = new Date(date);
  const [hrs, mins] = time.split(":");
  const setTime = new Date(current.setHours(hrs)).setMinutes(mins);
  if (Math.abs(setTime - Date.now()) <= 900000) {
    return true;
  } else if (Date.now() - setTime > 900000) {
    return false;
  }
};
module.exports = eateryRouter;
