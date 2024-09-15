const User = require("../models/user");

module.exports.renderSignupform=(req, res) => {
  
    res.render("users/signup.ejs");
  }

module.exports.signup=async (req, res, next) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          console.log("Error during login:", err);
          return next(err);
        }
        req.flash("info", "Welcome to Staysphere!");
        return res.redirect("/listings");
      });
    } catch (e) {
      console.log("Error during signup:", e.message);
      req.flash("error", e.message);
      return res.redirect("/signup");
    }
  };

  module.exports.renderLoginform= (req, res) => {
  
    res.render("users/login.ejs");
  }


 module.exports.login= async(req, res) => {
  
    req.flash("info", "Welcome back to Staysphere!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }

  module.exports.logout=(req,res)=>{
    req.logout((err)=>{
      if(err){
       next(err);
      }
      req.flash("info","you are logged out!");
      res.redirect("/listings");
    })
  };