var async = require('async');
var express = require('express');
var querystring = require('querystring');
var request = require('request');

var router = module.exports = express.Router();
var User = require('./user.model');

var FB_GRAPH_URL = 'https://graph.facebook.com/v2.5';

router.get(['/', '/register'], function (req, res, next) {
  var timelineToken = req.query.timelineToken;
  if (!timelineToken) {
    res.status(400).json({
      error: 'Timeline token required'
    });
    return;
  }

  var urlParams = querystring.stringify({
    client_id: process.env.FB_CLIENT_ID,
    redirect_uri: process.env.DOMAIN + '/fb-callback?timelineToken=' + timelineToken
  });
  var fbUrl = 'https://www.facebook.com/dialog/oauth?' + urlParams;

  res.render('register', {fbUrl: fbUrl});
});

router.get('/fb-callback', function (req, res, next) {
  var timelineToken = req.query.timelineToken;

  async.waterfall([
    // Get short lived access token
    function (callback) {
      var urlParams = querystring.stringify({
        client_id: process.env.FB_CLIENT_ID,
        client_secret: process.env.FB_CLIENT_SECRET,
        redirect_uri: process.env.DOMAIN + '/fb-callback?timelineToken=' + timelineToken,
        code: req.query.code
      });
      var url = FB_GRAPH_URL + '/oauth/access_token?' + urlParams;

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
      var url = FB_GRAPH_URL + '/oauth/access_token?' + urlParams;

      request(url, function (err, response, body) {
        if (err) return callback(err);

        var fbResponse = JSON.parse(body);
        callback(null, fbResponse.access_token);
      });
    },

    // Get facebook id
    function (token, callback) {
      var urlParams = querystring.stringify({
        fields: 'id',
        access_token: token
      });
      var url = FB_GRAPH_URL + '/me?' + urlParams;

      request(url, function (err, response, body) {
        if (err) return callback(err);

        var fbResponse = JSON.parse(body);
        console.log('got FB response', fbResponse);
        console.log('still have timelineToken', timelineToken);
        callback(null, {
          token: token,
          id: fbResponse.id
        });
      });
    }

  ], function (err, data) {
    if (err) return next(err);
    res.render('done', {data: JSON.stringify(data)});
  });
});