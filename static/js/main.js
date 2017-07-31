/* global $, firebase */
// Project Copilot Volunteer Client
// Copyright 2017 Project Copilot

const MAILROOM_HOSTNAME = '{{MAILROOM_HOSTNAME}}';
const MAILROOM_PORT = '{{MAILROOM_PORT}}';

// temporary max cases variable (used for demo)
const NUM_MAX_CASES = 10000;
let CURRENT_CASE = ''; // current case ID
let CURRENT_CASENAME = '';
let AUTH_NAME = '';

// Firebase Config
const FIREBASE_ID = '{{FIREBASE_ID}}';
const FIREBASE_API_KEY = '{{FIREBASE_API_KEY}}';
const config = {
  apiKey: FIREBASE_API_KEY,
  authDomain: `${FIREBASE_ID}.firebaseapp.com`,
  databaseURL: `https://${FIREBASE_ID}.firebaseio.com`,
  storageBucket: `${FIREBASE_ID}.appspot.com`,
};

firebase.initializeApp(config);

// Grant access to Firebase via Google Auth permissions
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().onAuthStateChanged((user) => {
  if (user) { // The user is already signed in.
    if (AUTH_NAME.length == 0) {
      AUTH_NAME = user.displayName;
      init();
    }
  } else {
    // Redirect to the login page
    location.href = "/login"
  }
});

function init() {
  $("#user_name").text(AUTH_NAME);

  // init database connection
  const db = firebase.database().ref('/');

  // ask the Mailroom for a list of cases to handle
  $.getJSON(`//${MAILROOM_HOSTNAME}:${MAILROOM_PORT}/api/getRequests/${NUM_MAX_CASES.toString()}`,
      (cases) => {
      // initially load the cases
        let idCount = 0;
        Object.keys(cases).forEach((k) => {
          if (idCount === 0) {
            CURRENT_CASE = k;
            CURRENT_CASENAME = cases[k].display_name;
            $('#currentCaseDisplayName #name').text(cases[k].display_name);
            const template = `<div class="case active" name="${cases[k].display_name}" id="${k}"><span class="caseName"><span class="ion-${cases[k].gender == 'Non-binary' ? 'transgender' : cases[k].gender.toLowerCase()}"></span> ${cases[k].display_name}</span></div>`;
            $('.cases').append(template);
          } else {
            const template = `<div class="case" name="${cases[k].display_name}" id="${k}"><span class="caseName"><span class="ion-${cases[k].gender == 'Non-binary' ? 'transgender' : cases[k].gender.toLowerCase()}"></span> ${cases[k].display_name}</span></div>`;
            $('.cases').append(template);
          }

          idCount++;
        });

        updateScroll();


        // when a new message arrives
        // eslint-disable-next-line no-unused-vars
        let newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages')
          .on('child_added', (s) => {
            if (s.val() != null) {
              if (s.val().sender === 'user') {
                $('.messageSpace')
                  .append(`<div class="message from" id="${s.name}"><div class="sender_name">${s.val().sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}</div>${s.val().body}</div>`);
              } else {
                $('.messageSpace')
                  .append(`<div class="message to" id="${s.name}"><div class="sender_name">${s.val().sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}</div>${s.val().body}</div>`);
              }
              updateScroll();
            }
        });

        // Initially poll the Firebase for current case's notes
        db.child('cases').child(CURRENT_CASE).child('notes').once('value', (s) => {
            $('.notes').val(s.val() == null ? '' : s.val());
        });

        // when the user selects a new case detach current listener
        $('.case').click((evt) => {
          db.child('cases').child(CURRENT_CASE).child('messages')
            .off();

          CURRENT_CASE = evt.currentTarget.id;
          CURRENT_CASENAME = $('#'+evt.currentTarget.id).children('.caseName').text();

          $('#currentCaseDisplayName #name').text($('#'+evt.currentTarget.id).children('.caseName').text());
          $('.case').removeClass('active');
          $('#'+evt.currentTarget.id).addClass('active');

          // change the new message listener to start listening for updates from the new case
          newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages')
            .on('child_added', (s) => {
                $('.messageSpace')
                  .append(`<div class="message
                  ${s.val().sender === 'user' ? "from" : "to"}"
                  id="${s.name}"><div class="sender_name">${s.val().sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}</div>${s.val().body}</div>`);
              updateScroll();
            });

          // pull the selected case's conversation
          db.child('cases').child(CURRENT_CASE).child('messages')
            .once('value', (s) => {
              $('.messageSpace').html(''); // wipe messageSpace content
              if (s.val() !== null) {
                Object.keys(s.val()).forEach((message) => {
                    $('.messageSpace')
                      .append(`<div class="message
                      ${s.val()[message].sender === 'user' ? 'from': 'to'}
                      " id="${message}"><div class="sender_name">${s.val()[message].sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}</div>${s.val()[message].body}</div>`);
                });
              }
            });

          db.child('cases').child(CURRENT_CASE).child('notes').once('value', (s) => {
            $('.notes').val(s.val() == null ? '' : s.val());
          });
        });


        // new message input
        $('#mainInput').keyup((evt) => {
          if (evt.keyCode === 13 && $("#mainInput").val().length != 0) {
            db.child('cases').child(CURRENT_CASE).child('messages')
              .push({
                body: $('#mainInput').val(),
                sent: false,
                sender: 'volunteer',
                from: 'copilot',
              }, () => {
                $('#mainInput').val('');
              });
          }
        });

        // Notes real-time editing
        var typingTimer;
        $('.notes').keyup(function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(function() {
              // upload to Firebase
              db.child('cases').child(CURRENT_CASE).child('notes').set($('.notes').val())
            }, 200);
        });

        //on keydown, clear the countdown
        $('.notes').keydown(function() {
            clearTimeout(typingTimer);
        });
      });
}

// When logout button is pressed
$("#logOut").click(() => {
  firebase.auth().signOut();
});

// update bottom of .messageSpace
function updateScroll() {
  const element = document.getElementsByClassName('messages');
  element[0].scrollTop = element[0].scrollHeight + 100;
}
