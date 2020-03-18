var ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const uri = require("../config/keys").MongoURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const uuidv4 = require("uuid/v4");

var result;

client.connect(err => {
  const collection = client.db(process.env.client).collection(process.env.collection);

  //Get Welcome page
  router.get("/", (req, res) => res.render("Account/login", { layout: "userLayout", title: "Login" }));

  router.get('/favicon.ico', function (req, res) {
    console.log("Favi icon loaded");
  });


  //Returns view for dashboard or profile
  router.get("/:content", ensureAuthenticated, (req, res) => {

    //Name of page
    const content = req.params.content;

    //Current user's email
    let email = req.user.email;

    console.log(27, email);
    let collectionCriteria = {
      email: email
    };

    //List of schools for registration from
    let schoolList = ["University of Georgia", "Auburn University", "Clemnson University", "Emory University", "Florida State University", "Georgia Institute of Technology",
      "Georgia State University", "Kennesaw State University", "Mercer University", "University of Alabama at Birmingham", "University of Central Florida",
      "University of Florida", "University of Memphis", "University of North Carolina at Charlotte", "University of North Carolina at Greensboro",
      "University of South Carolina", "University of South Florida", "University of West Florida", "University of Tennessee at Knoxville", "Other"];


    collection.find(collectionCriteria).toArray(function (err, result) {


      if (err) {
        console.log("Error is " + err);
        res.send({ error: " An error has occurred" });
      }
      //Redirect admin account to overview page
      else if (req.user.email == "admin@gmail.com" && content == "dashboard") {
        res.redirect("admin/overview");
      }



      else {

        let title = content[0].toUpperCase() + content.substring(1);
        console.log(53, result);

        if (result[0].element3.length > 0 && content == "eventRegister") {
          req.flash("error_msg", "You have already registered for the event");
          res.redirect("dashboard");
        }
        else if (content == "eventRegister") {
          res.render("User/" + content, {
            result: result,
            schoolList: schoolList,
            alreadyRegistered: result[0].element3.length,
            title: "Registration Form",
          })
        }
        else if (content == "elementRegister") {
          if(result[0].element3.length > 0) {
            res.redirect("/dashboard");
          }
          else {
            res.render("User/elementRegister", {
              result: result,
              schoolList: schoolList,
              alreadyRegistered: result[0].element3.length,
              title: title,
            })
          }
        
        }
        else {

          res.render("User/" + content, {
            result: result,
            schoolList: schoolList,
            alreadyRegistered: result[0].element3.length,
            title: title,
          })
        }


      }
    });
  });



  //Submit form
  router.post("/submitForm", (req, res) => {

    let token = req.user.token;
    let questions = ["school", "otherSchool", "emFullName", "emRelationship", "emPhoneNumber", "committee", "arrivalDate", "arrivalTime", "departureDate", "departureTime", "housingDate", "arrivingWithOthers", "othersArrivingWith", "gettingDinner", "firstTimeStaff", "gainFromStaffRetreat", "vegetarian", "medicalConditions", "allergies", "allowAuthorization"];

    let dataDocument = {};
    for (let i = 0; i < questions.length; i++) {
      dataDocument[questions[i]] = req.body[questions[i]];
    }




    let schoolList = ["Auburn University", "Clemnson University", "Emory University", "Florida State University", "Georgia Institute of Technology",
      "Georgia State University", "Kennesaw State University", "Mercer University", "University of Alabama at Birmingham", "University of Central Florida", "University of Georgia",
      "University of Florida", "University of Memphis", "University of North Carolina at Charlotte", "University of North Carolina at Greensboro",
      "University of South Carolina", "University of South Florida", "University of West Florida", "University of Tennessee at Knoxville", "Other"];

    let errors = [];
    //Check required fields


    //Check if any fields are blank
    for (let a = 0; a < questions.length - 1; a++) {
      console.log(115, req.body[questions[a]]);
      if (req.body[questions[a]] == '') {

        errors.push({ msg: `UNSUCCESSFUL! Please fill in all fields!` });
        break;
      }
    }

    if (errors.length > 0) {

      res.render("User/eventRegister", {
        errors,
        schoolList: schoolList,
        title: "Registration Form",
      })
    }
    else {
      collection.updateOne({ token: token }, { $push: { "element3": dataDocument } });
      res.redirect("/dashboard");
    }

  });

  //Submit form
  router.post("/submitElementRegistration", (req, res) => {

    let token = req.user.token;
    let questions = ["firstName", "lastName", "email", "phoneNumber", "school", "otherSchool", "pronouns",
      "dateOfBirth", "major", "EMName", "EMPhoneNumber", "medicalConditions", "allergies",
      "dietaryRestrictions", "tshirtSize", "gainFromConference", "allowAuthorization",
      "roommatePreferenceName", "neat", "cleanliness", "typeOfSleeper", "snore", "genderPreference",
      "sleepTime", "ACPreference", "noiseLevel", "noisePreference", "petPeeve",
    ];


    let dataDocument = {};
    for (let i = 0; i < questions.length; i++) {
      dataDocument[questions[i]] = req.body[questions[i]];
    }



    let schoolList = ["Auburn University", "Clemnson University", "Emory University", "Florida State University", "Georgia Institute of Technology",
      "Georgia State University", "Kennesaw State University", "Mercer University", "University of Alabama at Birmingham", "University of Central Florida", "University of Georgia",
      "University of Florida", "University of Memphis", "University of North Carolina at Charlotte", "University of North Carolina at Greensboro",
      "University of South Carolina", "University of South Florida", "University of West Florida", "University of Tennessee at Knoxville", "Other"];

    let errors = [];
    //Check required fields


    //Check if any fields are blank
    for (let a = 0; a < questions.length - 1; a++) {
      console.log(115, req.body[questions[a]]);

    }

    if (errors.length > 0) {

      res.render("User/eventRegister", {
        errors,
        schoolList: schoolList,
        title: "Registration Form",
      })
    }
    else {
      console.log(192, dataDocument);
      collection.updateOne({ token: token }, { $push: { "element3": dataDocument } });
      res.redirect("/dashboard");
    }

  });



});

module.exports = router;
