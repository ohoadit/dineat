require("dotenv").config();
const express = require("express");
const { pool } = require("../auth");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const master = express.Router();

master.post("/remove", (req, res, next) => {
  jwt.verify(req.cookies["Dineat"], process.env.LOB, async (err, payload) => {
    try {
      if (!err && payload.username === "feedbackloop08") {
        const confirm = await pool.query("Delete from authorized where username = $1", [req.body.user])
          return confirm.rowCount ? res.json({valid: true, msg: "Deletion Successful!", dtd: true}) : res.json({valid: true, msg: "Deletion Failed :/", dtd: false})
      } else {
        return res.json({valid: false, msg: "Deletion Failed :/"})
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({msg : "Internal Server Error"})
    }
  });
});

const upload = multer();

master.post('/collect', upload.single('image'), (req, res, next) => {
  if (fileFilter(req.file, res)) {
    console.log(req.file)
    
    try {
      return res.json({valid: true})
    } catch (err) {
      console.log(err)
    }
  }
})


const fileFilter = (file, res) => {
  if (!["image/jpg", "image/jpeg", "image/png"].filter(imageType => file.mimetype === imageType).length) {
    res.json({valid: false, msg: "Invalid image type"})
    return false
  } else if (!(file.size < 1024 * 2048)) {
    res.json({valid: false, msg: "Image size should be less than 2 MB" })
    return false
  } else {
    return true
  }
}
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
      return res.status(500).send({msg: "Internal Server Error"});
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
