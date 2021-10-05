require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const app = express();

const loginRouter = require("./routes/login");
const { registerRouter } = require("./routes/register");
const dashboardRouter = require("./routes/dashboard");
const masterRouter = require("./routes/master");
const eateryRouter = require("./routes/eatery");

helmet.contentSecurityPolicy({
  directives: {
      "default-src":[ "'self'" ],
      "base-uri":[ "'self'" ],
      "font-src":[ "'self'", "https:", "data:" ],
      "frame-ancestors":[ "'self'" ],
      "img-src":[ "'self'", "data:", "https://res.cloudinary.com"],
      "script-src":[ "'self'" ],
      "script-src-attr":[ "'none'" ],
      "style-src":[ "'self'", "https:", "'unsafe-inline'" ],
  }
});

app
  .use(morgan("dev"))
  .use(cors())
  .use(helmet())
  .use(compression())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(cookieParser())
  .use("/gate", loginRouter)
  .use("/admit", registerRouter)
  .use("/bank", dashboardRouter)
  .use("/master", masterRouter)
  .use("/rest", eateryRouter);

app.use(express.static(__dirname + "/client/dist/"));
app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/client/dist/index.html", (err) => {
    res.status(500).send(err);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
