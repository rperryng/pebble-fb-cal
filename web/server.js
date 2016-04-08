var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var express = require('express');
var logger = require('morgan');
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

  var url = 'https://graph.facebook.com/v2.3/oauth/access_token' +
    '?client_id=' + process.env.FB_CLIENT_ID +
    '&client_secret=' + process.env.FB_CLIENT_SECRET +
    '&redirect_uri=' + process.env.DOMAIN + '/fb-callback' +
    '&code=' + req.query.code;

  request(url, function (err, response, body) {
    if (err || response.statusCode !== 200) return next(err);

    var fbResponse = JSON.parse(body);
    var url = 'https://graph.facebook.com/v2.5/me' +
      '?fields=id' +
      '&access_token=' + fbResponse.access_token;

    request(url, function (idErr, idResponse, idBody) {
      if (err || response.statusCode !== 200) return next(err);

      var jsonId = JSON.parse(idBody);
      var data = {
        token: fbResponse.access_token,
        id: jsonId.id
      };
      res.render('done', {data: JSON.stringify(data)});
    });
  });
});

// No other middleware handled request
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, function () {
  console.log('fb timeline fun happens on port ' + port);
});
