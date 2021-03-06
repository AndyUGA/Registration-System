module.exports = {
  ensureAuthenticated: function(req, res, next) {
   
    if (req.isAuthenticated()) {
      
      if (res.url == "/dashboard") {
        console.log("Dashboard is being requested");
      }
      return next();
    }
    req.flash("error_msg", "Please login to view this resource");
    res.redirect("/users/login");
  },
  adminAuthenticated: function(req, res, next) {
    
    if (req.isAuthenticated() && req.user.email == "admin@gmail.com") {
      
      if (res.url == "/dashboard") {
        console.log("Dashboard is being requested");
      }
      return next();
    }
    req.flash("error_msg", "Invalid permissions to view page");
    
    res.redirect("/dashboard");
  }
};
