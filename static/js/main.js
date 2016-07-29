"use strict";

// Project Copilot Volunteer Client
// Copyright 2016 Project Copilot

var HOSTNAME = "{HOSTNAME}";
var PORT = "{PORT}";
var MAILROOM_HOSTNAME = "{MAILROOM_HOSTNAME}";
var MAILROOM_PORT = "{MAILROOM_PORT}";

// temporary max cases variable (used for demo)
var NUM_MAX_CASES = 5

// Firebase Config
var FIREBASE_ID = "{FIREBASE_ID}";
var FIREBASE_API_KEY = "{FIREBASE_API_KEY}";
var config = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_ID+".firebaseapp.com",
  databaseURL: "https://"+FIREBASE_ID+".firebaseio.com",
  storageBucket: FIREBASE_ID+".appspot.com",
};

firebase.initializeApp(config);

var CURRENT_CASE = {};


var provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  var user = result.user;


  // init database connection
  var db = firebase.database().ref("/");

  $.getJSON("//"+HOSTNAME+":"+PORT+"/api/getRequests/"+NUM_MAX_CASES.toString(), function (err, data) {
      console.log(data);
      db.child("cases").on("child_added", function (s) {
        console.log(s.val());
      });

      // new message input
      $("#mainInput").keydown(function (evt) {
          if (evt.keyCode == 13) {
            volunteers.child(user.email.replace(".", "")).push({"body": $("#mainInput").val()}, function() {
              $("#mainInput").val("");
            });
          }
      });
  });



}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  var email = error.email;
  var credential = error.credential;
  // ...
});
