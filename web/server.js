var async = require('async');
var dotenv = require('dotenv');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var querystring = require('querystring');
var request = require('request');

dotenv.load();

var port = process.env.PORT;
var mongoUrl = process.env.MONGO_URL;
var app = express();

app.use(logger('dev'));

app.set('views', './views');
app.set('view engine', 'pug');

app.use('/public', express.static(__dirname + '/public'));
app.use(require('./server/routes'));

// No other middleware handled request
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// Error handling middleware
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
