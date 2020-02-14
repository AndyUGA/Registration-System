var ObjectID = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const uri = require("../config/keys").MongoURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, adminAuthenticated } = require("../config/auth");
const uuidv4 = require("uuid/v4");

var result;

client.connect(err => {
  const collection = client.db(process.env.client).collection(process.env.collection);


  router.get("/overview", adminAuthenticated, (req, res) => {


    //Name of page
    const content = req.params.content;

    collection.find({}).toArray(function (err, result) {

      if (err) {
        res.send({ error: " An error has occurred" });
      } else {

        res.render("Admin/overview", {
          result: result,
          numRegistered: result.length,
          title: "Admin Overview",

        })

      }
    });
  });

  router.get("/attendeeinfo", adminAuthenticated, (req, res) => {


    collection.find({}).toArray(function (err, result) {

      if (err) {
        res.send({ error: " An error has occurred" });
      } else {

        //List of schools for registration from
        let schoolList = ["Auburn University", "Clemnson University", "Emory University", "Florida State University", "Georgia Institute of Technology",
          "Georgia State University", "Kennesaw State University", "Mercer University", "University of Alabama at Birmingham", "University of Central Florida",
          "University of Florida", "University of Memphis", "University of North Carolina at Charlotte", "University University of North Carolina at Greensboro",
          "University of South Carolina", "University of South Florida", "University of West Florida", "University of Tennessee at Knoxville", "Other"];

        //List of Fields names for Admin View
        let fieldNames = ["Name", "School", "Other School", "EM Contact Name", "EM Contact Relationship", "EM Contact Phone", "Committee", "Arrival Date", "Arrival Time",
          "Deparature Date", "Deparature Time", "Housing Date", "Arriving with Others", "Others Arriving With", "Getting Dinner", "First Time Staff", "What they want to Learn",
          "Vegetarian", "Medical Conditions", "Allergies", "Authorization"];



        let tempArray = [];

        //Only display info for users who have completed registration form
        for (let i = 0; i < result.length; i++) {
          try {

            if (result[i].elementRetreat2019.length > 0 && result[i].firstName != 'admin') {
              tempArray[i] = result[i];
            }
          }
          catch (err) {
            console.log(73, "Error is " + err);
          }


        }

        //Delete empty items in set
        tempArray = tempArray.filter(x => x);


        res.render("Admin/attendeeinfo", {
          result: result,
          tempArray: tempArray,
          fieldNames: fieldNames,
          schoolList: schoolList,
          numRegistered: result.length,
          title: "Admin Attendee Info",

        });

      }
    });
  });

  router.get("/registeredAccounts", adminAuthenticated, (req, res) => {


    collection.find({}).toArray(function (err, result) {

      if (err) {
        res.send({ error: " An error has occurred" });
      } else {

        //List of schools for registration from
        console.log(106, result);

        res.render("Admin/registeredAccounts", {
          result: result,
          title: "Registered Accounts",
        });

      }
    });
  });

  router.get("/notCompleted", adminAuthenticated, (req, res) => {


    collection.find({}).toArray(function (err, result) {

      if (err) {
        res.send({ error: " An error has occurred" });
      } else {

        //List of schools for registration from
        console.log(127, result[5].elementRetreat2019.length);
        res.render("Admin/notcompleted", {
          result: result,
          title: "Registered Accounts",
        });

      }
    });
  });

  router.get("/dashboard", adminAuthenticated, (req, res) => {


    collection.find({}).toArray(function (err, result) {

      if (err) {
        res.send({ error: " An error has occurred" });
      } else {



        //List of Fields names for Admin View

        let fieldNames = ["Name", "School", "Other School", "EM Contact Name", "EM Contact Relationship", "EM Contact Phone", "Arrival Date", "Arrival Time",
          "Deparature Date", "Deparature Time", "Housing Date", "Arriving with Others", "Others Arriving With", "Getting Dinner", "First Time Staff", "What they want to Learn",
          "Vegetarian", "Medical Conditions", "Allergies"];


        //Get names of the last 2 users who registered most recently
        let lastIndex = result.length - 1;
        let recentEmails = [result[lastIndex].name, result[lastIndex - 1].name];


        //Get number of forms that are completed / non-completed
        let formsCompleted = 0;
        let formsNotCompleted = 0;


        //Get number of vegetarians and non-vegetarians
        let numVegetarians = 0;
        let numNonVegetarians = 0;


        try {
          for (let i = 0; i < result.length; i++) {
          
            if ((result[i].elementRetreat2019.length) != 0) {

     
              if (result[i].elementRetreat2019[0].vegetarian == "Yes") {
           
                numVegetarians++;
              }
              else {
              
                numNonVegetarians++;  
              }


            }

          }
        }
        catch (err) {
          console.log(147, "Error is " + err);
        }


        try {
          for (let i = 0; i < result.length; i++) {
       
            if (Object.keys(result[i].elementRetreat2019).length == 1) {

              formsCompleted++;
            }
            else {
              formsNotCompleted++;
            }
          }
        }
        catch (err) {
          console.log("158 Error is " + err);
        }




        res.render("Admin/dashboard", {
          result: result,
          fieldNames: fieldNames,
          formsCompleted: formsCompleted,
          numRegistered: result.length,
          recentEmails: recentEmails,
          numVegetarians: numVegetarians,
          numNonVegetarians: numNonVegetarians,
          title: "Admin Dashboard",

        })

      }
    });
  });







});

module.exports = router;
