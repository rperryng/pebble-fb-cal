var async = require('async');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var express = require('express');
var logger = require('morgan');
var querystring = require('querystring');
var request = require('request');

dotenv.load();

var port = process.env.PORT;
var app = express();

app.use(logger('dev'));

app.set('view engine', 'pug');
app.set('views', './views');

app.use('/public', express.static(__dirname + '/public'));

app.get(['/', '/config'], function (req, res, next) {
  var fbUrl = 'https://www.facebook.com/dialog/oauth' +
    '?client_id=' + process.env.FB_CLIENT_ID +
    '&redirect_uri=' + encodeURIComponent(process.env.DOMAIN) + '/fb-callback';

  res.render('sign-in', {fbUrl: fbUrl});
});

app.get('/fb-callback', function (req, res, next) {
  async.waterfall([
    // Get short lived access token
    function (callback) {
      var urlParams = querystring.stringify({
        client_id: process.env.FB_CLIENT_ID,
        client_secret: process.env.FB_CLIENT_SECRET,
        redirect_uri: process.env.DOMAIN + '/fb-callback',
        code: req.query.code
      });
      var url = 'https://graph.facebook.com/v2.3/oauth/access_token?' + urlParams;

      request(url, function (err, response, body) {
        if (err) return callback(err);

        var fbResponse = JSON.parse(body);
        callback(null, fbResponse.access_token);
      });
    },

    // Get long lived access token
    function (token, callback) {
      var urlParams = querystring.stringify({
        grant_type: 'fb_exchange_token',
        client_id: process.env.FB_CLIENT_ID,
        client_secret: process.env.FB_CLIENT_SECRET,
        fb_exchange_token: token
      });
      var url = 'https://graph.facebook.com/v2.3/oauth/access_token?' + urlParams;

      request(url, function (err, response, body) {
        if (err) return callback(err);

        var fbResponse = JSON.parse(body);
        console.log('got', fbResponse);
        callback(null, fbResponse.access_token);
      });
    },

    // Get facebook id
    function (token, callback) {
      var urlParams = querystring.stringify({
        fields: 'id',
        access_token: token
      });
      var url = 'https://graph.facebook.com/v2.5/me?' + urlParams;

      request(url, function (err, response, body) {
        if (err) return callback(err);

        var fbResponse = JSON.parse(body);
        console.log('got FB response', fbResponse);
        callback(null, {
          token: token,
          id: fbResponse.id
        });
      });
    }

  ], function (err, data) {
    if (err) return next(err);

    console.log('done', data);
    res.render('done', {data: JSON.stringify(data)});
  });
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// No other middleware handled request
app.use(function (req, res, next) {
  res.sendStatus(404);
});

app.listen(port, function () {
  console.log('fb timeline fun happens on port ' + port);
});
