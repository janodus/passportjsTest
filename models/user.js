// setup for the User model. 
var mongoose = require("mongoose"); 
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  username: String, 
  password: String, 
});

// THIS NEEDS TO BE ADDED TO THE userSchema BEFORE the var User is set (otherwise, you're setting the variable BEFORE the plugin
// has been included into the object) -- GOTCHA!
userSchema.plugin(passportLocalMongoose); // PLM adds features and functionality to the userSchema. 

var User = mongoose.model("User", userSchema); //compiling schema to usable model (mongoose object)

module.exports = User; // explorting User model for use in app.js