//messages
const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const morgan = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");

const methodOverride = require("method-override");

const bodyParser = require("body-parser");
const { ensureAdmin } = require("./helpers/auth");
const { ensureGuest } = require("./helpers/auth");
const authorizationRoute = require("./routes/authorization");
const adminRoute = require("./routes/admin");
const galleryRoute = require("./routes/gallery");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport Config
require("./config/passport")(passport);

app.use(cookieParser());

app.use(
  session({
    secret: "xodarap",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(
  passport.session({
    cookie: { maxAhe: 60000 },
  })
);

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

// Method override middleware
app.use(methodOverride("_method"));

// DOENV CONFIG
dotenv.config({ path: "./config/config.env" });

// LOGGING WITH MORGAN
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// STATIC FOLDER
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  res.locals.image = req.image || null;
  res.locals.session = req.session;
  next();
});

app.use("/authorization", authorizationRoute);
app.use("/", galleryRoute);
app.use("/admin", ensureAdmin, adminRoute);

async function start() {
  try {
    await mongoose.connect(
      "mongodb+srv://Yaroslav:12351999@cluster0.aloql.mongodb.net/PracticeGallery",
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    app.listen(8081, () => {
      console.log("Сервер запущен");
    });
  } catch (e) {
    console.log(e);
  }
}

start();
