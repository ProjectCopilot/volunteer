// Copilot Volunteer Interface

var express = require('express');
var app = express();
var dotenv = require('dotenv').config({path: __dirname+'/.env'});
var fs = require('fs');

app.get('/', function (req, res) {
    res.redirect("/login");
});

app.get("/login", function (req, res) {
    res.send("WIP");
});

app.get("/volunteer/:volunteerId", function (req, res) {
    res.sendFile(__dirname+'/static/index.html');
});

app.get("/volunteer/js/main.js", function (req, res) {
    res.header("Content-Type", "application/javascript");
    fs.readFile(__dirname + "/static/js/main.js", "utf-8", function (e, data) {
      if (e) throw e;
      var script = data.replace(/{HOSTNAME}/g, process.env.HOSTNAME).replace(/{PORT}/g, process.env.PORT).replace(/{FIREBASE_ID}/g, process.env.FIREBASE_ID).replace(/{FIREBASE_API_KEY}/g, process.env.FIREBASE_CLIENT_API_KEY);
      res.send(script);
    });
});

app.use("/volunteer", express.static(__dirname+"/static"));

app.listen(process.env.PORT, process.env.HOSTNAME, function () {
    console.log('Copilot volunteer interface successfully running at '
        + process.env.HOSTNAME + ':' + process.env.PORT);
});
