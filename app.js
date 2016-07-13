// Copilot Volunteer Interface

var express = require('express');
var app = express();
var dotenv = require('dotenv').config({path: __dirname+'/.env'});

app.get('/', function (req, res) {
      res.send('Hello World!');
});

app.listen(process.env.port, process.env.HOSTNAME, function () {
    console.log('Copilot volunteer interface successfully running at '
        + process.env.HOSTNAME + ':' + process.env.PORT);
});

