/* global $, firebase */
// Project Copilot Volunteer Client
// Copyright 2017 Project Copilot

const MAILROOM_URL = '{{MAILROOM_URL}}';

// max number of cases
const NUM_MAX_CASES = 10000;
let CURRENT_CASE = ''; // current case ID
let CURRENT_CASENAME = ''; // current case name (e.g. Anonymous Cow)
let AUTH_NAME = ''; // volunteer name (e.g. Ankit Ranjan)
let AUTH_EMAIL = ''; // volunteer email

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
      AUTH_EMAIL = user.email;
      init();
    }
  } else {
    // Redirect to the login page
    location.href = "/login"
  }
});

// Timeago Timestamp Config
var time = timeago();

function init() {
  $("#user_name").text(AUTH_NAME);

  // init database connection
  const db = firebase.database().ref('/');

  // ask the Mailroom for a list of cases to handle
  $.getJSON(`//${MAILROOM_URL}/api/getRequests/${NUM_MAX_CASES.toString()}`,
      (cases) => {
        // initially load the cases
        let idCount = 0;
        Object.keys(cases).forEach((k) => {
          // By default, set the first case that loads as the volunteer's current active case
          if (idCount === 0 && (cases[k].helped == AUTH_EMAIL || cases[k].helped == false)) {
            CURRENT_CASE = k;
            CURRENT_CASENAME = cases[k].display_name;
            $('#currentCaseDisplayName #name').text(cases[k].display_name);
            $('#gender').addClass(cases[k].gender == 'Non-binary' ? 'ion-transgender' : 'ion-'+cases[k].gender.toLowerCase());

            const template = `<div class="case active" name="${cases[k].display_name}" id="${k}"><span class="caseName"><span class="ion-${cases[k].gender == 'Non-binary' ? 'transgender' : cases[k].gender.toLowerCase()}"></span> ${cases[k].display_name}</span></div>`;
            $('.cases').append(template);

            // give current volunteer ownership of case
            db.child('cases').child(CURRENT_CASE).child('helped').set(AUTH_EMAIL).catch((e) => {
		// find out if the user is verified, if not kick them out
		if (e.code == "PERMISSION_DENIED") {
		    firebase.auth().signOut().then(() => {	
			location.href = "/login";
		    });
		}
	    });
            db.child('cases').child(CURRENT_CASE).child('last_modified').set(Date.now());
            idCount++;
            return;

          } else {
            // Get the next case available as the current case if first case is inactive
            if (!CURRENT_CASE && (cases[k].helped == AUTH_EMAIL || cases[k].helped == false)) {
              CURRENT_CASE = k;
              CURRENT_CASENAME = cases[k].dispay_name;
              $('#currentCaseDisplayName #name').text(cases[k].display_name);
              $('#gender').addClass(cases[k].gender == 'Non-binary' ? 'ion-transgender' : 'ion-'+cases[k].gender.toLowerCase());

              const template = `<div class="case active" name="${cases[k].display_name}" id="${k}"><span class="caseName"><span class="ion-${cases[k].gender == 'Non-binary' ? 'transgender' : cases[k].gender.toLowerCase()}"></span> ${cases[k].display_name}</span></div>`;
              $('.cases').append(template);

              // give current volunteer ownership of case
              db.child('cases').child(CURRENT_CASE).child('helped').set(AUTH_EMAIL);
              db.child('cases').child(CURRENT_CASE).child('last_modified').set(Date.now());
              return;
            }

            const template = `<div class="case" name="${cases[k].display_name}" id="${k}"><span class="caseName"><span class="ion-${cases[k].gender == 'Non-binary' ? 'transgender' : cases[k].gender.toLowerCase()}"></span> ${cases[k].display_name}</span></div>`;
            $('.cases').append(template);
          }

          idCount++;

        });

        updateScroll();

        // listen for inactivated cases
        db.child('cases').on('value', (snap) => {
          var inactivated = 0;
          Object.keys(snap.val()).forEach((k) => {
            $(`#${k}`).removeClass('inactive');
            if (snap.val()[k].helped == AUTH_EMAIL) return;
            if (snap.val()[k].helped == false) return
            $(`#${k}`).addClass('inactive');
            inactivated++;
          });

          // if current case is taken by another volunteer, refresh page
          if ($(`#${CURRENT_CASE}`).hasClass('inactive')) location.reload();

          // inform the volunteer that all cases are inactive
          if (inactivated == $('.case').length) {
            $('#currentCaseDisplayName #name').text('No Cases Available.');
            $('#gender').removeClass();
            $('#gender').text('Please refresh and try again later');

            // wipe all case inputs and data
            $('.messageSpace').html('');
            $('#mainInput').val('');
            $('.notes').val('');
            db.child('cases').child(CURRENT_CASE).child('messages')
              .off();
            CURRENT_CASE = null;
            CURRENT_CASENAME = null;
          }
        });

          // when a new message arrives
          let newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages')
              .on('child_added', (s) => {
		  if (s.val() != null) {
		      const message = s.val();
		      if (s.val().sender === 'user') {
			  $('.messageSpace')
			      .append(`<div class="message from" id="${s.key}">
				      <div class="sender_name">${message.sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}
				      <div class="date" datetime="${message.time}"></div>
				      </div>${message.body}</div>`);
		      } else {
			  $('.messageSpace')
			      .append(`<div class="message to" id="${s.key}">
				      <div class="sender_name">${message.sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}
				      <div class="date" datetime="${message.time}"></div>
				      </div>${message.body}</div>`);
		      }

		      if (s.val().sent == 'failed')
			  $(`#${s.key}`).append(`&nbsp; <span class="failed ion-close-circled"></span>`);
		      
		      updateScroll();
		      updateTimestamps();
		  }
              });

	  // when a message fails to send
	  let failedMessageListener = db.child('cases').child(CURRENT_CASE).child('messages').on('child_changed', (s) => {
	      if (s.val().sent == 'failed')
		  $(`#${s.key}`).append(`&nbsp; <span class="failed ion-close-circled"></span>`);
	  });
	  
          // initially poll the Firebase for current case's notes
          db.child('cases').child(CURRENT_CASE).child('notes').once('value', (s) => {
              $('.notes').val(s.val() == null ? '' : s.val());
          });

          // when the user selects a new case detach current listener
          $('.case').click((evt) => {
              if ($(`#${evt.currentTarget.id}`).hasClass('inactive')) return;

              db.child('cases').child(CURRENT_CASE).child('messages')
		  .off();

              CURRENT_CASE = evt.currentTarget.id;
              CURRENT_CASENAME = $('#'+evt.currentTarget.id).children('.caseName').text();

              $('#currentCaseDisplayName #name').text($('#'+evt.currentTarget.id).children('.caseName').text());
              $("#gender").removeClass($("#gender").attr('class'));
              $('#gender').addClass($('#'+evt.currentTarget.id).children('.caseName').children('span:nth-child(1)').attr('class'));

              $('.case').removeClass('active');
              $('#'+evt.currentTarget.id).addClass('active');

              // give current volunteer ownership of case
              db.child('cases').child(CURRENT_CASE).child('helped').set(AUTH_EMAIL);
              db.child('cases').child(CURRENT_CASE).child('last_modified').set(Date.now());

              // change the new message listener to start listening for updates from the new case
              newMessageListener = db.child('cases').child(CURRENT_CASE).child('messages')
		  .on('child_added', (s) => {
                      const message = s.val();
                      $('.messageSpace')
			  .append(`<div class="message
${s.val().sender === 'user' ? "from" : "to"}
" id="${s.key}"><div class="sender_name">${message.sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}
        			  <div class="date" datetime="${message.time}"></div>
				  </div>${message.body}</div>`);
				 
		      updateScroll();
		      updateTimestamps();
		  });

	      // update failed message handler for new messages
	      failedMessageListener = db.child('cases').child(CURRENT_CASE).child('messages').on('child_changed', (s) => {
		  if (s.val().sent == 'failed')
		      $(`#${s.key}`).append(`&nbsp; <span class="failed ion-close-circled"></span>`);
	      });
	      
              // pull the selected case's conversation
              db.child('cases').child(CURRENT_CASE).child('messages')
		  .once('value', (s) => {
		      const message = s.val();
		      $('.messageSpace').html(''); // wipe messageSpace content
		      if (s.val() !== null) {
			  Object.keys(message).forEach((id) => {
			      $('.messageSpace')
				  .append(`<div class="message
${message[id].sender === 'user' ? 'from': 'to'}
" id="${id}"><div class="sender_name">${message[id].sender === 'user' ? CURRENT_CASENAME: 'Copilot Volunteer'}
					  <div class="date" datetime="${message[id].time}"></div>
					  </div>
					  ${message[id].body}
					  ${message[id].sent == 'failed' ? '&nbsp; <span class="failed ion-close-circled"></span>':''}
					  </div>`);
			  });

			  updateTimestamps();
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
			  time: Date.now()
		      }, () => {
			  $('#mainInput').val('');

			  // give current volunteer ownership of case
			  db.child('cases').child(CURRENT_CASE).child('helped').set(AUTH_EMAIL);
			  db.child('cases').child(CURRENT_CASE).child('last_modified').set(Date.now());
			  updateTimestamps();
		      });
              }
          });

          // notes real-time editing
          var typingTimer;
          $('.notes').keyup(() => {
              clearTimeout(typingTimer);
              typingTimer = setTimeout(() => {
		  // upload to Firebase
		  db.child('cases').child(CURRENT_CASE).child('notes').set($('.notes').val());

		  // give current volunteer ownership of case
		  db.child('cases').child(CURRENT_CASE).child('helped').set(AUTH_EMAIL);
		  db.child('cases').child(CURRENT_CASE).child('last_modified').set(Date.now());
              }, 200);
          });

          // on keydown, clear the countdown
          $('.notes').keydown(() => {
              clearTimeout(typingTimer);
          });
      });
}

// when logout button is pressed
$("#logOut").click(() => {
    firebase.auth().signOut();
});

// update bottom of .messageSpace UI handler
function updateScroll() {
    const element = document.getElementsByClassName('messages');
    element[0].scrollTop = element[0].scrollHeight + 100;

    if (!CURRENT_CASENAME) CURRENT_CASENAME = $('#currentCaseDisplayName #name').text();
}

// refresh pretty message timestamps
function updateTimestamps() {
    timeago.cancel();
    const timestamps = document.querySelectorAll('.date');
    time.render(timestamps);
}
