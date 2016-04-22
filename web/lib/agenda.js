var Agenda = require('agenda');
var request = require('request');
var querystring = require('querystring');
var User = require('./user-model');
var async = require('async');
var logger = require('../logger');

var agenda = new Agenda({
  db: {
    address: process.env.MONGO_URL
  }
});

agenda.define('sync events', function (job, done) {
  User.find({}, function (err, users) {
    if (err) {
      logger.error('failed to query for users');
      logger.error(err.stack);
      return done();
    }

    async.each(users, function (user, callback) {

      var urlParams = querystring.stringify({
        accessToken: user.facebookAccessToken
      });
      var url = 'https://wwww.graph.facebook.com/v2.5' +
        '/' + user.facebookUserId +
        '/events?' +
        urlParams;

      request(url, function(err, response, body) {
        console.log('got body', body);
      });
      console.log(url);

      console.log(user);
      callback();
    }, function (err) {
      if (!err) logger.info('Done pushing timeline events');
    });
  });
});

agenda.on('ready', function () {
  agenda.start();
  agenda.now('sync events');
});

module.exports = agenda;
