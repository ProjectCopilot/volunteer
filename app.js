// Copilot Volunteer Interface

const express = require('express');
const app = express();
const colors = require('colors');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');

app.get('/js/main.js', function (req, res) {
  res.header('Content-Type', 'application/javascript');
  fs.readFile(__dirname + '/static/js/main.js', 'utf-8', function (e, data) {
    if (e) throw e;
    const script = data.replace(/{HOSTNAME}/g, process.env.HOSTNAME).replace(/{PORT}/g, process.env.PORT).replace(/{FIREBASE_ID}/g, process.env.FIREBASE_ID).replace(/{FIREBASE_API_KEY}/g, process.env.FIREBASE_CLIENT_API_KEY).replace(/{MAILROOM_PORT}/g, process.env.MAILROOM_PORT).replace(/{MAILROOM_HOSTNAME}/g, process.env.MAILROOM_HOSTNAME);
    res.send(script);
  });
});

app.use('/', express.static(__dirname + '/static'));

app.listen(process.env.PORT, process.env.HOSTNAME, function () {
  console.log(('Copilot Volunteer running at ').blue + (process.env.HOSTNAME + ':' + process.env.PORT).magenta);
});
