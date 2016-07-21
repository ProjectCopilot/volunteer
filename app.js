// Copilot Volunteer Interface

var express = require('express');
var app = express();
var dotenv = require('dotenv').config({path: __dirname+'/.env'});

app.get('/', function (req, res) {
    res.redirect("/login");
});

app.get("/login", function (req, res) {
    res.send("WIP");
});

app.get("/volunteer/:volunteerId", function (req, res) {
    res.sendFile(__dirname+'/static/index.html');
});

app.use("/volunteer", express.static(__dirname+"/static"));

app.listen(process.env.PORT, process.env.HOSTNAME, function () {
    console.log('Copilot volunteer interface successfully running at '
        + process.env.HOSTNAME + ':' + process.env.PORT);
});
