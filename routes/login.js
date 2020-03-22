const express = require("express");
const loginRouter = express.Router();
const { pool, bcrypt } = require("../auth");
const jwt = require("jsonwebtoken");

loginRouter.post("/", async (req, res, next) => {
  try {
    const check = await pool.query(
      "select password from authorized where username = $1",
      [req.body.username]
    );
    if (check.rowCount) {
      bcrypt.compare(
        req.body.password,
        check.rows[0].password,
        (err, compare) => {
          if (compare) {
            const entryPass = jwt.sign({username: req.body.username}, process.env.LOB, {expiresIn: "1800000"});
            res.cookie("Dineat", entryPass, {
              expires: new Date(Date.now() + 1800000),
              maxAge: 1800000
            });
            res.send({ matched: true, msg: "Granted" });
          } else {
            res.status(401).json({
              matched: false,
              field: "passError",
              msg: "Invalid password"
            });
          }
        }
      );
    } else {
      return res.status(401).json({
        matched: false,
        field: "userError",
        msg: "Invalid user"
      });
    }
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({
      matched: false,
      field: "passError",
      msg: "Internal server error :/"
    })
  }
});

module.exports = loginRouter;
