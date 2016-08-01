'use strict';

// Project Copilot Volunteer Client
// Copyright 2016 Project Copilot

const HOSTNAME = '{HOSTNAME}';
const PORT = '{PORT}';
const MAILROOM_HOSTNAME = '{MAILROOM_HOSTNAME}';
const MAILROOM_PORT = '{MAILROOM_PORT}';

// temporary max cases variable (used for demo)
const NUM_MAX_CASES = 5;
let CURRENT_CASE = ''; // current case ID

// Firebase Config
const FIREBASE_ID = '{FIREBASE_ID}';
const FIREBASE_API_KEY = '{FIREBASE_API_KEY}';
const config = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_ID + '.firebaseapp.com',
  databaseURL: 'https://' + FIREBASE_ID + '.firebaseio.com',
  storageBucket: FIREBASE_ID + '.appspot.com',
};

firebase.initializeApp(config);

// Grant access to Firebase via Google Auth permissions
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function (result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  const token = result.credential.accessToken;
  const user = result.user;

  // init database connection
  const db = firebase.database().ref('/');

  // ask the Mailroom for a list of cases to handle
  $.getJSON('//' + MAILROOM_HOSTNAME + ':' + MAILROOM_PORT + '/api/getRequests/' + NUM_MAX_CASES.toString(), function (cases) {
      // initially load the cases
    let id_count = 0;
    for (const k in cases) {
      if (id_count == 0) {
        CURRENT_CASE = k;
        $('#currentCaseDisplayName').text(cases[k].display_name);
        var template = '<div class="case active" name="' + cases[k].display_name + '"id="' + k + '"><img class="caseImage" src="https://u.ph.edim.co/default-avatars/45_140.jpg"><span class="caseName">' + cases[k].display_name + '</span><span class="caseLastMessage">' + cases[k].gender + '</span></div>';
        $('.cases').append(template);
      } else {
        var template = '<div class="case" name="' + cases[k].display_name + '"id="' + k + '"><img class="caseImage" src="https://u.ph.edim.co/default-avatars/45_140.jpg"><span class="caseName">' + cases[k].display_name + '</span><span class="caseLastMessage">' + cases[k].gender + '</span></div>';
        $('.cases').append(template);
      }

      id_count++;
    }

    updateScroll();


      // when a new message arrives
    let newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages').on('child_added', function (s) {
      if (s.val().sender == 'user') {
        $('.messageSpace').append('<div class="message from" id="' + s.name + '">' + s.val().body + '</div>');
      } else {
        $('.messageSpace').append('<div class="message to" id="' + s.name + '">' + s.val().body + '</div>');
      }

      updateScroll();
    });


      // when the user selects a new case
    $('.case').click(function () {
      db.child('cases').child(CURRENT_CASE).child('messages').off(); // detach currently listener

      CURRENT_CASE = $(this).attr('id');
      $('#currentCaseDisplayName').text($(this).attr('name'));
      $('.case').removeClass('active');
      $(this).addClass('active');

        // change the new message listener to start listening for updates from the new case
      newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages').on('child_added', function (s) {
        if (s.val().sender == 'user') {
          $('.messageSpace').append('<div class="message from" id="' + s.name + '">' + s.val().body + '</div>');
        } else {
          $('.messageSpace').append('<div class="message to" id="' + s.name + '">' + s.val().body + '</div>');
        }

        updateScroll();
      });

        // pull the selected case's conversation
      db.child('cases').child(CURRENT_CASE).child('messages').once('value', function (s) {
        $('.messageSpace').html(''); // wipe messageSpace content
        for (const message in s.val()) {
          if (s.val()[message].sender == 'user') {
            $('.messageSpace').append('<div class="message from" id="' + message + '">' + s.val()[message].body + '</div>');
          } else {
            $('.messageSpace').append('<div class="message to" id="' + message + '">' + s.val()[message].body + '</div>');
          }
        }
      });
    });


      // new message input
    $('#mainInput').keydown(function (evt) {
      if (evt.keyCode == 13) {
        db.child('cases').child(CURRENT_CASE).child('messages').push({ 'body': $('#mainInput').val(), 'sent': false, 'sender': 'volunteer', 'from': 'copilot' }, function () {
          $('#mainInput').val('');
        });
      }
    });
  });
}).catch(function (error) {
  // Handle Errors here.
  const errorCode = error.code;
  const errorMessage = error.message;
  const email = error.email;
  const credential = error.credential;
  // ...
});


// update bottom of .messageSpace
function updateScroll() {
  const element = document.getElementsByClassName('messages');
  element[0].scrollTop = element[0].scrollHeight + 100;
}
