"use strict";

// Project Copilot Volunteer Client
// Copyright 2016 Project Copilot


var provider = new firebase.auth.GoogleAuthProvider();

firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  var user = result.user;

  var root = firebase.database().ref("/");
  var volunteers = firebase.database().ref("volunteers");
  var messages = firebase.database().ref("messages");


  firebase.database().ref().child("messages").on("child_added", function (s) {
    console.log(s.val());
  });
}).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  var email = error.email;
  var credential = error.credential;
  // ...
});
