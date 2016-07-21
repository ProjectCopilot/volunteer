"use strict";

// Project Copilot Volunteer Client
// Copyright 2016 Project Copilot

(function () {
  var HOSTNAME = "{HOSTNAME}";
  var PORT = "{PORT}";
  var FIREBASE_ID = "{FIREBASE_ID}";
  var FIREBASE_API_KEY = "{FIREBASE_API_KEY}";

  var config = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_ID+".firebaseapp.com",
    databaseURL: "https://"+FIREBASE_ID+".firebaseio.com",
    storageBucket: FIREBASE_ID+".appspot.com",
  };
  firebase.initializeApp(config);

  var currentCaseID = "";

});
