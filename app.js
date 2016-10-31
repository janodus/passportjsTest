// ==================== SETUP ==================== 
var express               = require("express"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    mongoose              = require("mongoose"),
    User                  = require("./models/user"),
    app                   = express();


app.set("view engine", "ejs"); // setting the universal view extension to .ejs by default
app.use(bodyParser.urlencoded({extended:true})); // setting up body parser for POSTed FORMS to be parsed/readable
mongoose.connect("mongodb://localhost/auth_demo_app"); // using AUT_DEMO_APP DB in mongodb

// USE THIS TO SET UP EXPRESSION SESSION, as it NEEDS callback functions- it's easier this way.
app.use(require("express-session")({
  secret: "All I Do Is Win",
  resave: false,
  saveUninitialized: false,
})); 

// IMPORTANT!! NEEDED TO INITIALIZE
app.use(passport.initialize());
app.use(passport.session());

// PASSPORT STRATEGY FUNCTIONS INITIALIZATION
passport.use(new LocalStrategy(User.authenticate())); // User.authenticate method is what's being used for the local strategy
passport.serializeUser(User.serializeUser()); // encrypts User data for login messages
passport.deserializeUser(User.deserializeUser()); // descrypts User data to authorize a login


// ==================== ROUTES ==================== 
// RootRoute
app.get("/", function(req, res){
  res.render("home");
});

// Secret Page
app.get("/secret", isLoggedIn ,function(req, res){
  res.render("secret");
});

// AUTHENTICATION ROUTES 
// Signup form
app.get("/register", function(req, res){
  res.render("register");
});

//handing user signup ==== NOTE- Remember that body-parser needs to be configued for the JSON parsing to work.
app.post("/register", function(req, res){
  // the req.body.prop is passed from the POST request. 
  // IMPORTANT: User.register(new User({name: x}), password, callbackfunction) syntax. 2nd arg needs to be separate for hashing purposes. 
  User.register(new User({username: req.body.username}), req.body.password, function(err, newUser){
    if(err){
      console.log("NEW USER went wrong:" + err);
      return res.render('register');
    }
    else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secret");
      });
    }
  });
  
});

// LOGIN ROUTES
// Login form
app.get("/login", function(req, res){
  res.render("login");
});

// POST REQUREST TO LOGIN - the passport.authenticate is part of the .post parameters.
// middleware = runs between the beginning of route and the end of the route
// passport.authenticate automatically uses the previous setup to find username and password from the req.body
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret", 
  failureRedirect: "/login", 
}), function(req, res){
  
});

// LOGOUT ROUTE
app.get("/logout", function(req, res){
  req.logout(); // Passport just destroys all user data that's in the session. So no persistant user id through cookies/session resources.
  res.redirect("/");
});

// ==================== FUNCTIONS ==================== 

// this is the standard format for middleware functions- place this functions as a second argument 
// to the normal get request, and remember to use NEXT() which actually runs the final argument/callback function 
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){ //.isAuthenticated is a part of passport that checks to see if the user has actually logged in (check for salt and hash)
    return next();// if user is authenticated, then the callback function where this function is being called will be ran.
  }
  res.redirect("/login");
}



// ==================== SERVER ==================== 
app.listen(process.env.PORT, process.env.IP, function(){
  console.log("SERVER STARTED");
});