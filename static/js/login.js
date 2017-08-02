/* global $, firebase */
// Project Copilot Volunteer Login
// Copyright 2017 Project Copilot

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

// Is a user already logged in?
firebase.auth().onAuthStateChanged((user) => {
  if (user) // The user is already signed in.
    location.href = "/"; // Redirect to main client
});

document.getElementById('login').onclick = () => {
  firebase.auth().signInWithPopup(provider).then((user) => {
      location.href = "/"
  });
};
