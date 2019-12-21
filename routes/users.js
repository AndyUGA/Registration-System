const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");
const uuidv4 = require("uuid/v4");

const MongoClient = require("mongodb").MongoClient;

const uri = require("../config/keys").MongoURI;

const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(err => {
  console.log(err);
  const collection = client.db(process.env.client).collection(process.env.collection);


  //User model
  const User = require("../models/User");

  //Login page
  router.get("/login", (req, res) => {
 
    if (req.isAuthenticated()) {
      res.redirect("/dashboard");
    } else {
      res.render("Account/login", { layout: "userLayout", title: "Login" });
    }
  });

  //Register page
  router.get("/register", (req, res) =>
    res.render("Account/register", { title: "Register", layout: "userLayout" })
  );

  //Register Post Request
  router.post("/register", (req, res) => {
    console.log(33, req);
    const { name, email, password, password2 } = req.body;

    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({ msg: "Please fill in all fields" });
    }

    if (password !== password2) {
      errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 6) {
      errors.push({ msg: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {

      res.render("Account/register", {
        errors,
        name,
        email,
        password,
        password2,
        title: "Register",
        layout: "userLayout"
      });
    } else {
      User.findOne({ email: email }).then(user => {
        //When user exists
        if (user) {
          errors.push({ msg: "Email is already registered" });
          res.render("Account/register", {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          let token = uuidv4();
          const newUser = new User({
            name,
            email,
            password,
            token
          });

          //Hash password
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              newUser.password = hash;

              //Save user
              newUser
                .save()
                .then(() => {
                  let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    service: "smtp.gmail.com",
                    //secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
                    auth: {
                      user: process.env.email,
                      pass: process.env.token
                    }
                  });

                  let baseURL = "https://caterwauling-puma.glitch.me" + "/activateAccount/";
                  let mailOptions = {
                    from: "BookNoteTracker@gmail.com", // sender address
                    to: email, // list of receivers
                    subject: "Please Confirm your Account", // Subject line
                    html: `<p> Click on link to confirm account: ${baseURL}${token} </p>` // html body
                  };
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      return console.log(error);
                    }
                  });
                })
                .then(user => {
                  req.flash(
                    "success_msg",
                    `Please check your inbox for confirmation email`
                  );
                  res.redirect("/users/login");
                })
                .catch(err => console.log(err));
            })
          );
        }
      });
    }
  });

  // Login
  router.post("/login", (req, res, next) => {

    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true
    })(req, res, next);
  });



  //Forgot Password page
  router.get("/forgotPassword", (req, res) =>
    res.render("Account/forgotPassword", { title: "Forgot Password", layout: "userLayout" })
  );

  //Password Reset Page
  router.get("/resetPassword/:token", (req, res) => {
    const token = req.params.token;

    collection.find({ token: token }).toArray((err, result) => {
      console.log(result.length);
      if (result.length != 1) {
        req.flash("error_msg", "Invalid Page");
        res.redirect("/users/login");
      }
      else {
        res.render("Account/resetPassword", { title: "Reset Password", token: token, layout: "userLayout" })
      }
    });

  });

  //Send password reset link
  router.post("/sendResetLink", (req, res) => {

    const { email } = req.body;
    let token = uuidv4();


    collection.findOneAndUpdate({ email: email }, { $set: { token: token } }).then(result => {

      if (result.value != null) {
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          service: "smtp.gmail.com",
          auth: {
            user: process.env.email,
            pass: process.env.token
          }
        });

        let baseURL = "https://notetracker.andytruong.dev" + "/users/resetPassword/";
        let mailOptions = {
          from: "BookNoteTracker@gmail.com",
          to: email,
          subject: "Password Reset", 
          html: `<p> Click on link to reset password: ${baseURL}${token} </p>` 
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
        })

      }
    });


    req.flash("success_msg", "Password reset email has been sent!");
    res.redirect("/users/login");

  });

  //Password Reset Link
  router.post("/resetPassword/:token", (req, res) => {
    const token = req.params.token;
    const { password } = req.body;


    bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;


        collection.findOneAndUpdate({ token: token }, { $set: { password: hash } });
      }));

    req.flash("success_msg", "Your password has been sucessfully reset!");
    res.redirect("/users/login");

  });


  //logout
  router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });

});

module.exports = router;
