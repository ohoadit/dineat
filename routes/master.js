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
        return res.status(401).json({ valid: false, msg: "Invalid Request :/" });
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
  jwt.verify(req.cookies['Dineat'], process.env.LOB, (err, payload) => {
  
    if (err || payload.username !== 'feedbackloop08') {
      return res.status(401).json({msg: "User"})
    }
  
  upload(req, res, err => {
    if (err) {
      console.log(err);
      return res.json({ valid: false, msg: err.message });
    } else {
        cloudinary.uploader.upload(req.file.path, async (err, success) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ msg: "Upload Error :/ Please check your Internet Connection" });
          } else {
            const metadata = success.url.split("/");
            const imageData = metadata[metadata.length - 2] + "/" + metadata[metadata.length - 1];
            const data = []
            for (const key in req.body) {
              data.push(req.body[key])
            }
            data.push(req.body.tables)
            data.push(imageData)
            const restaurant = {...req.body}
            restaurant.image = process.env.CDY_URL + imageData
            try {
              const push = await pool.query(
                "Insert into restaurant(name, speciality, location, cuisines, tables, time, available, image) values ($1, $2, $3, $4, $5, $6, $7, $8)", data);
              if (push.rowCount) {
                return res.json({ valid: true, msg: "Restaurant added to the base!", data: restaurant});
              }
            } catch (err) {
              console.log(err);
              return res.status(500).json({ msg: "Database Server Error :/" });
            }
          }
        });
    }
  });
  })
});

master.post("/pull", (req, res, next) => {
    jwt.verify(req.cookies['Dineat'], process.env.LOB, async (err, payload) => {
      try {
        if (!err && payload.username === 'feedbackloop08') {
          const retrieve = await pool.query('Select * from restaurant')
          retrieve.rows.forEach(res => res.image = process.env.CDY_URL + res.image)
          console.log(retrieve)
          return res.json({valid: true, places: [...retrieve.rows]})
        } else {
          return res.status(401).json({valid: false})
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({msg: "Database Server Error :/"})
      }
    })
})

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
      return res.status(500).send({ msg: "Database Server Error :/" });
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
