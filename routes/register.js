require("dotenv").config();
const express = require("express");
const registerRouter = express.Router();
const nodemailer = require("nodemailer");
const { pool, bcrypt } = require("../auth");
const jwt = require("jsonwebtoken");

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
    accessToken: process.env.ACCESS,
  },
});

const uniqueKey = () => {
  let subs = "";
  for (let i = 0; i < 4; i++) {
    subs += Math.random().toString(16).substr(2);
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
        approved: false,
      };
    } else {
      const current = Math.floor(Date.now() / 1000);
      const stamp = Number(handshake.rows[0].stamp);
      if (current > stamp + 3600) {
        res.json({ valid: false, msg: "Link expired register again!" });
        return {
          approved: false,
        };
      } else {
        return {
          approved: true,
          payload: handshake.rows[0],
        };
      }
    }
  } catch (err) {
    res.status(500).json({ valid: false, msg: "Server Error" });
    return {
      approved: false,
    };
  }
};
registerRouter.post("/knock", async (req, res, next) => {
  const status = await signature(req, res);
  if (status.approved) {
    res.json({ valid: true });
  }
});

registerRouter.post("/enroll", async (req, res, next) => {
  const status = await signature(req, res);
  if (status.approved) {
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        "update authorized set password = $1, token = $2, stamp = $3 where token = $4",
        [hash, new Date(), 1010, status.payload.token]
      );
      return res.json({
        valid: true,
        msg: "New password set. Redirecting to login !",
      });
    } catch (err) {
      console.log(err.stack);
      return res.status(500).json({ valid: false, msg: "Server Error" });
    }
  }
});

registerRouter.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const rex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){5,}@(gmail\.com|(iite\.)?indusuni\.ac\.in)$/;
    if (!rex.test(email)) {
      return res.json({
        sent: false,
        field: "emailError",
        msg: "Invalid email. Please use gmail/college id",
      });
    }
    const [user, domain] = email.split("@");
    const check = await pool.query(
      "select * from authorized where username = $1",
      [user]
    );
    if (check.rowCount === 0) {
      const setter = uniqueKey();
      const time = Math.floor(Date.now() / 1000);
      const entry = await pool.query(
        "insert into authorized(username, token, stamp, domain) values ($1, $2, $3, $4)",
        [user, setter, time, domain]
      );
      await mailer(res, email, setter, req.headers.host);
    } else {
      res.json({ msg: "Please don't register twice", sent: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error", sent: false });
  }
});

registerRouter.post("/renew", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    try {
      if (!err && payload.username === "feedbackloop08") {
        const email = req.body.username + "@" + req.body.domain;
        const setter = uniqueKey();
        const time = Math.floor(Date.now() / 1000);
        const update = await pool.query(
          "Update authorized set token = $1, stamp = $2 where username = $3",
          [setter, time, req.body.username]
        );
        return await mailer(res, email, setter, req.headers.host);
      } else {
        return res.status(401).json({ sent: false, msg: "You ain't Ad!" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ sent: false, msg: "Email not sent :/" });
    }
  });
});

const mailer = (res, email, setter, host) => {
  const emailPromise = new Promise((kept, broken) => {
    const user = email.split("@")[0];
    const message = {
      from: "Dineat <feedbackloop08@gmail.com>",
      to: email,
      subject: "Set your password for Dineat",
      html: `Welcome! <br> <br> Your username for the Dineat app is ${user}. Please use the following link to set your password. Link is valid for 60 minutes from now. <br> <br> http://${host}/reset/${setter}`,
    };
    transporter.sendMail(message, (err, result) => {
      if (err) {
        console.log(err);
        broken({ msg: "Email not sent :/", sent: false });
      } else {
        console.log(result);
        res.json({
          msg: "A password setter link has been sent to your email address.",
          sent: true,
        });
        kept("Email sent successfully");
      }
      transporter.close();
    });
  });
  return emailPromise;
};

module.exports = {
  registerRouter,
  uniqueKey,
};
