const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
// Setup dotenv to read env files
const dotenv = require("dotenv");
dotenv.config();

// Get MONGODB URI KEY
const KEY = process.env.MONGODB_URI;
const MONGODB_URI = `${KEY}`;

const app = express();

// Setup session store for more secure and stable memory
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const errorController = require("./controllers/error");
const User = require("./models/user");

// Setup custom templating engine (handlebars) if use one
// app.engine("handlebars", expressHbs({ layoutsDir: "views/layouts/", defaultLayout: 'main-layout' }));

// Setup configuration for which view engine (template engine)
// express will be using
app.set("view engine", "ejs");

// Setup configuration for where to find the template
// default is views folder
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));

// Setup read access only to public folder with express static middleware
app.use(express.static(path.join(__dirname, "public")));

// Setup configuration for your express-session
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//Setup csrf token
app.use(csrfProtection);

// Setup flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      next(new Error(error));
    });
});

// Setup routes, add filtering path for admin page
app.use("/admin", adminRoutes);

// Setup routes for shop page
app.use(shopRoutes);

// Setup routes for auth page
app.use(authRoutes);

// Setup 500 error handling page
app.get("/500", errorController.get500);

// Add catch all route to handle undefined routes (404)
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    docTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// Connect to DB with mongoose
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((error) => {
    console.log(error);
  });
