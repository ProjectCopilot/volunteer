/*
  * Copilot Volunteer
  * (c) Copyright 2016-2017 Project Copilot
*/

const express = require('express');
const app = express();
const fs = require('fs');
const keen = require('keen-tracking');

require('colors');
require('dotenv').config({ path: `${__dirname}/.env` });

// Initialize analytics tracking
let analytics = new keen({
    projectId: process.env.KEEN_PROJECTID,
    writeKey: process.env.KEEN_WRITEKEY
});

app.get('/js/main.js', (req, res) => {
  res.header('Content-Type', 'application/javascript');
  fs.readFile(`${__dirname}/static/js/main.js`, 'utf-8', (e, data) => {
    if (e) throw e;
    const script = data
      .replace(/{{FIREBASE_ID}}/g, process.env.FIREBASE_ID)
      .replace(/{{FIREBASE_API_KEY}}/g, process.env.FIREBASE_CLIENT_API_KEY)
      .replace(/{{MAILROOM_URL}}/g, process.env.MAILROOM_URL)
    res.send(script);
  });
});

app.get('/js/login.js', (req, res) => {
  res.header('Content-Type', 'application/javascript');
  fs.readFile(`${__dirname}/static/js/login.js`, 'utf-8', (e, data) => {
    if (e) throw e;
    const script = data
      .replace(/{{FIREBASE_ID}}/g, process.env.FIREBASE_ID)
      .replace(/{{FIREBASE_API_KEY}}/g, process.env.FIREBASE_CLIENT_API_KEY)
    res.send(script);
  });
});

app.use('/login', (req, res) => {
  res.sendFile(`${__dirname}/static/login.html`);
});

app.use('/', (req, res, next) => {
    if (req.originalUrl == '/')
	analytics.addEvent('volunteer_pageviews', {});
    next();
});
app.use('/', express.static(`${__dirname}/static`));

app.listen(process.env.PORT, process.env.HOSTNAME, function () {
  console.log(('Copilot Volunteer running at ').blue + (`${process.env.HOSTNAME}:${process.env.PORT}`).magenta);
});
