var async = require('async');
var dotenv = require('dotenv');
var express = require('express');
var logger = require('./logger');
var mongoose = require('mongoose');
var morgan = require('morgan');
var querystring = require('querystring');
var request = require('request');

dotenv.load();

var agendaInstance = require('./lib/agenda');

var port = process.env.PORT;
var mongoUrl = process.env.MONGO_URL;
var app = express();

// Logging
app.use(morgan('dev', {stream: logger.morganStream}));

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Expose public folder
app.use('/public', express.static(__dirname + '/public'));

// Middleware
app.use(require('./lib/routes'));

app.use(function (req, res, next) {
  res.sendStatus(404);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

mongoose.connect(mongoUrl, function (err) {
  if (err) console.log(err);
});

app.listen(port, function () {
  console.log('fb timeline fun happens on port ' + port);
});
