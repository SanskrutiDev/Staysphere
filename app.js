if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
//console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 
const Listing = require("./models/listing.js"); 

// Route files
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");




async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/Staysphere');
    console.log("Connected to DB");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

main();

// Database connection
//const dbURL = process.env.ARTLESTDB_URL || 'mongodb://127.0.0.1:27017/Staysphere'; // fallback for development
//const mongo_url='mongodb://127.0.0.1:27017/Staysphere'; 
// mongoose.connect(dbURL, {
//   tls: true, // Use TLS if required by MongoDB Atlas
//   tlsAllowInvalidCertificates: true, // For development only
// }).then(() => {
//   console.log("Connected to DB");
// }).catch((err) => {
//   console.error("Database connection error:", err);
// });



// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// const store = MongoStore.create({
//   mongoUrl: dbURL,
//   touchAfter: 24 * 3600,
// });

// store.on("error", (error) => {
//   console.log("ERROR IN MONGO SESSION STORE", error);
// });

// Session and flash configuration
const sessionOptions = {
  // store,
  secret: process.env.SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// Middleware to set flash messages and current user

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.currUser = req.user; // Ensure currUser is always available
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Error handler for unknown routes
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// General error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});

// Show listing route
app.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner').populate('reviews');
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    res.render('listings/show', { listing });
  } catch (e) {
    req.flash('error', 'Something went wrong');
    res.redirect('/listings');
  }
});

// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
