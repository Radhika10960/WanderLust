require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3005;

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= DB CONNECTION =================
mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log("✅ DB connected successfully");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err);
  });

// ================= SESSION =================
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true
  }
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); // FIXED (errorr → error)
  res.locals.currUser = req.user;
  next();
});

// ================= ROUTES =================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ================= ERROR HANDLING =================
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ================= SERVER =================
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});