"use strict";

// Project Copilot Volunteer Client
// Copyright 2016 Project Copilot

var HOSTNAME = "{HOSTNAME}";
var PORT = "{PORT}";
var MAILROOM_HOSTNAME = "{MAILROOM_HOSTNAME}";
var MAILROOM_PORT = "{MAILROOM_PORT}";

// temporary max cases variable (used for demo)
var NUM_MAX_CASES = 5
var CURRENT_CASE = ""; // current case ID

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

var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  var user = result.user;

  // init database connection
  var db = firebase.database().ref("/");

  // ask the Mailroom for a list of cases to handle
  $.getJSON("//"+MAILROOM_HOSTNAME+":"+MAILROOM_PORT+"/api/getRequests/"+NUM_MAX_CASES.toString(), function (cases) {
      var id_count = 0;
      for (var k in cases) {
        if (id_count == 0) {
          CURRENT_CASE = k;
        }
        var template = '<div class="case" id="'+k+'"><img class="caseImage" src="https://u.ph.edim.co/default-avatars/45_140.jpg"><span class="caseName">Panda '+k+'</span><span class="caseLastMessage">'+ cases[k].gender +'</span></div>'
        $(".cases").append(template);
        id_count++;
      }

      $(".case").click(function() {
        CURRENT_CASE = $(this).attr("id");
      });


      db.child("cases").child(CURRENT_CASE).child('messages').on("child_added", function (s) {
        if (s.val().sender == "user") {
            $(".messageSpace").append('<div class="received">'+s.val().body+'</div><br /><br /><br />');
        } else {
            $(".messageSpace").append('<div class="sent">'+s.val().body+'</div><br /><br /><br />');
        }

      });

      // new message input
      $("#mainInput").keydown(function (evt) {
          if (evt.keyCode == 13) {
            db.child("cases").child(CURRENT_CASE).child("messages").push({"body": $("#mainInput").val(), "sent": false, "sender":"volunteer", "from": "copilot"}, function() {
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
