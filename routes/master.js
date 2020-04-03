require("dotenv").config();
const express = require("express");
const { pool } = require("../auth");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CDY_NAME,
  api_key: process.env.CDY_API_KEY,
  api_secret: process.env.CDY_API_SECRET
});

const master = express.Router();

master.post("/remove", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    try {
      if (!err && payload.username === "feedbackloop08") {
        const confirm = await pool.query(
          "Delete from authorized where username = $1",
          [req.body.user]
        );
        return confirm.rowCount
          ? res.json({ valid: true, msg: "Deletion Successful!", dtd: true })
          : res.json({ valid: true, msg: "Deletion Failed :/", dtd: false });
      } else {
        return res.json({ valid: false, msg: "Deletion Failed :/" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  });
});

const storage = multer.diskStorage({
  destination: "images/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage,

  limits: {
    fileSize: 1024 * 2048
  },
  fileFilter: (req, file, cb) => {
    if (
      !["image/jpg", "image/jpeg", "image/png"].filter(
        imageType => file.mimetype === imageType
      ).length
    ) {
      cb(new Error("Invalid image type"), false);
    } else {
      cb(null, true);
    }
  }
}).single("image");

master.post("/collect", (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      console.log(err);
      return res.json({ valid: false, msg: err.message });
    } else {
      try {
        cloudinary.uploader.upload(req.file.path, async (err, success) => {
          if (err) {
            throw new Error("Upload Error");
          } else {
            const body = req.body;
            const metadata = success.url.split("/");
            const imageData =
              metadata[metadata.length - 2] +
              "/" +
              metadata[metadata.length - 1];
            console.log(imageData);
            try {
              const push = await pool.query(
                "Insert into restaurant(name, speciality, cuisines, area, image, time, tables, available) values ($1, $2, $3, $4, $5, $6, $7, $8)",
                [
                  body.name,
                  body.speciality,
                  body.cuisines,
                  body.location,
                  imageData,
                  body.openhrs,
                  body.tables,
                  body.tables
                ]
              );
              if (push.rowCount) {
                console.log(push);
                return res.json({ valid: true, msg: "Restaurant Saved" });
              }
            } catch (err) {
              console.log(err);
              return res.status(500).json({ msg: "Database Server Error :/" });
            }
          }
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: "Upload Error :/" });
      }
    }
  });
});

master.post("/records", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    try {
      if (!err && payload.username === "feedbackloop08") {
        const data = await pool.query(
          "Select username, token, stamp from authorized"
        );
        constructData(res, [...data.rows]);
        return;
      } else {
        return res.status(401).json({ valid: false });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ msg: "Internal Server Error" });
    }
  });
});

const constructData = (res, users) => {
  const currentDate = Date.now() / 1000;
  users.forEach(user => {
    user.token =
      user.stamp === "1010"
        ? dateFilter(
            new Date(user.token).toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
              hour12: false
            })
          )
        : ["-", "-"];
    if (user.stamp === "1010") {
      user.stamp = "Registered";
    } else if (currentDate > Number(user.stamp) + 3600) {
      user.stamp = "Link Expired";
    } else {
      user.stamp = "Pending";
    }
    user.date = user.token[0];
    user.time = user.token[1];
    user.status = user.stamp;
    delete user.token;
    delete user.stamp;
  });
  return res.send({ valid: true, users: users });
};

const dateFilter = date => {
  const tempDate = date.split(",");
  let dateString = tempDate[0].split("/");
  return [
    dateString[1] + "-" + dateString[0] + "-" + dateString[2],
    tempDate[1].trim()
  ];
};

module.exports = master;
