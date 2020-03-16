require("dotenv").config();
const express = require("express");
const admitRouter = express.Router();
const nodemailer = require("nodemailer");
const { pool, bcrypt } = require("../auth");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    type: "OAuth2",
    user: process.env.senderEmail,
    clientId: process.env.C_ID,
    clientSecret: process.env.C_KEY,
    refreshToken: process.env.REFRESH,
    accessToken: process.env.ACCESS
  }
});

const resetKey = () => {
  let subs = "";
  for (let i = 0; i < 4; i++) {
    subs += Math.random()
      .toString(16)
      .substr(2);
    if (i != 3) subs += "-";
  }
  return subs;
};

const signature = async (req, res) => {
  try {
    const key = req.body.key;
    const handshake = await pool.query(
      "select * from authorized where token = $1",
      [key]
    );
    if (handshake.rowCount === 0) {
      res.json({ valid: false });
      return {
        approved: false
      };
    } else {
      const current = Math.floor(Date.now() / 1000);
      const stamp = Number(handshake.rows[0].stamp);
      if (current > stamp + 3600) {
        await pool.query("Delete from authorized where token = $1", [key]);
        res.json({ valid: false, msg: "Link expired register again!" });
        return {
          approved: false
        };
      } else {
        return {
          approved: true,
          payload: handshake.rows[0]
        };
      }
    }
  } catch (err) {
    res.status(500).json({ valid: false, msg: "Server Error" });
    return {
      approved: false
    };
  }
};
admitRouter.post("/knock", async (req, res, next) => {
  const status = await signature(req, res);
  if (status.approved) {
    res.json({ valid: true });
  }
  next();
});

admitRouter.post("/enroll", async (req, res, next) => {
  const status = await signature(req, res);
  console.log(status);
  if (await signature(req, res)) {
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        "update authorized set password = $1, token = $2, stamp = $3 where token = $4",
        [hash, new Date(), 1010, status.payload.token]
      );
      return res.json({
        valid: true,
        msg: "New password set. Redirecting to login !"
      });
    } catch (err) {
      console.log(err.stack);
      return res.status(500).json({ valid: false, msg: "Server Error" });
    }
  }
});

admitRouter.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const user = email.split("@")[0];
    const check = await pool.query(
      "select * from authorized where username = $1",
      [user]
    );
    if (check.rowCount === 0) {
      const setter = resetKey();
      const time = Math.floor(Date.now() / 1000);
      const entry = await pool.query(
        "insert into authorized(username, token, stamp) values ($1, $2, $3)",
        [user, setter, time]
      );
      await mailer(res, email, setter);
      console.log(entry);
    } else {
      res.json({ msg: "Please don't register twice", sent: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

const mailer = (res, email, setter) => {
  const emailPromise = new Promise((kept, broken) => {
    const user = email.split("@")[0];
    const message = {
      from: "Dineat <feedbackloop08@gmail.com>",
      to: email,
      subject: "Set your password for Dineat",
      html: `Welcome! <br> <br> Your username for the Dineat app is ${user}. Please use the following link to set your password. Link is valid for 60 minutes from now. <br> <br> http://localhost:8080/reset/${setter}`
    };
    transporter.sendMail(message, (err, result) => {
      if (err) {
        console.log(err);
        broken({ msg: "Email not sent due to an error :/", sent: false});
      } else {
        console.log(result);
        res.json({ msg: "An email with the password setter link has been sent to your email.", sent: true });
        kept("Email sent successfully")
      }
      transporter.close();
    });
  });
  return emailPromise;
};

module.exports = admitRouter;
