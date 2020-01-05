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

  //Submit form
  router.post("/submitForm", (req, res) => {

    let token = req.user.token;
    let dataArray = ["fullname", "school", "otherSchool", "emFullName", "emRelationship", "emPhoneNumber", "arrivalDate", "arrivalTime", "departureDate", "departureTime", "housingDate", "arrivingWithOthers", "othersArrivingWith", "gettingDinner", "firstTimeStaff", "gainFromStaffRetreat", "vegetarian", "medicalConditions", "allergies"];

    let dataDocument = {};
    for (let i = 0; i < dataArray.length; i++) {
      dataDocument[dataArray[i]] = req.body[dataArray[i]];
    }

    console.log(dataDocument);

    collection.updateOne({ token: token }, { $push: { "elementRetreat2019": dataDocument } });
    res.redirect("/dashboard");
  });

  //Activate Account
  router.get("/activateAccount/:token", (req, res, next) => {
    const token = req.params.token;
    console.log("token is " + token);
    collection.updateOne({ token: token }, { $set: { isVerified: true } });
    req.flash("success_msg", `Your Account has been Activated. Please login`);
    res.redirect("/users/login");
  });



  router.get('/favicon.ico', function (req, res) {
    console.log("Favi icon loaded");
  });

  //Returns view for dashboard or profile
  router.get("/:content", ensureAuthenticated, (req, res) => {

    //Name of page
    const content = req.params.content;

    //Current user's email
    let email = req.user.email;

    let collectionCriteria = {
      email: email
    };

    //List of schools for registration from
    let schoolList = ["Auburn University", "Clemnson University", "Emory University", "Florida State University", "Georgia Institute of Technology",
      "Georgia State University", "Kennesaw State University", "Mercer University", "University of Alabama at Birmingham", "University of Central Florida",
      "University of Florida", "University of Memphis", "University of North Carolina at Charlotte", "University University of North Carolina at Greensboro",
      "University of South Carolina", "University of South Florida", "University of West Florida", "University of Tennessee at Knoxville", "Other"];


    collection.find(collectionCriteria).toArray(function (err, result) {


      if (err) {
        console.log("Error is " + err);
        res.send({ error: " An error has occurred" });
      }
      else if (req.user.email == "admin@gmail.com") {
        res.redirect("admin/overview");
      }
      else {

        let title = content[0].toUpperCase() + content.substring(1);
        //console.log(81, result);

        if(result[0].elementRetreat2019.length > 0 && content == "eventRegister") {
          req.flash("error_msg", "You have already registered for the event");
          res.redirect("dashboard");
        }
        else {
          res.render("User/" + content, {
            result: result,
            schoolList: schoolList,
            alreadyRegistered: result[0].elementRetreat2019.length,
            title: title,
          })
        }
       

      }
    });
  });

  //Get notes from selected book title
  router.get("/getBookNotes/:index/:name", ensureAuthenticated, (req, res) => {
    const index = req.params.index;
    const name = req.params.name;

    let bookTitle;
    let author;
    collection.find({}).toArray(function (err, result) {
      if (err) {
        console.log("Error is " + err);
        res.send({ error: " An error has occurred" });
      } else {
        const currentID = { _id: ObjectID(req.user._id) };
        for (let i = 0; i < result.length; i++) {
          let dbID = { _id: ObjectID(result[i]._id) };
          if (currentID._id.equals(dbID._id)) {
            result = result[i];
            bookTitle = result.BookTitle[index].Title;
            author = result.BookTitle[index].Author;
          }
        }
        res.render("User/BookNotes", {
          result: result,
          index: index,
          name: name,
          bookTitle: bookTitle,
          title: "Notes",
          author: author
        });


      }
    });
  });

  //Request to create book entry
  router.post("/createBookEntry/:name", ensureAuthenticated, (req, res, next) => {
    const name = req.params.name;

    const title = req.body.title;
    const author = req.body.author;

    collection.updateOne({ name: name }, { $push: { BookTitle: { Title: title, Author: author, Note: [] } } });

    res.redirect("/dashboard");
  });

  //Requst to create note
  router.post("/insertNote/:index/:name/:bookTitle", ensureAuthenticated, (req, res, next) => {
    const name = req.params.name;
    const index = req.params.index;
    const title = req.body.title;
    const bookTitle = req.params.bookTitle;
    const note = { content: req.body.note, created: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) };

    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $push: { "BookTitle.$.Note": note } });

    res.redirect("/getBookNotes/" + index + "/" + name);
  });

  //Request to update note
  router.post("/updateNote/:noteIndex/:name/:bookTitle/:bookIndex", ensureAuthenticated, (req, res, next) => {
    const name = req.params.name;
    const bookIndex = req.params.bookIndex;
    const noteIndex = req.params.noteIndex;
    const title = req.body.title;
    const bookTitle = req.params.bookTitle;
    const note = { content: req.body.note, created: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) };

    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $set: { ["BookTitle.$.Note." + noteIndex]: note } });

    res.redirect("/getBookNotes/" + bookIndex + "/" + name);
  });

  //Request to delete book entry
  router.post("/deleteNote/:bookTitle/:name", ensureAuthenticated, (req, res, next) => {
    const name = req.params.name;
    const bookTitle = req.params.bookTitle;

    collection.updateOne({ name: name, "BookTitle.Title": bookTitle }, { $pull: { BookTitle: { Title: bookTitle } } });

    res.redirect("/dashboard");
  });
});

module.exports = router;
