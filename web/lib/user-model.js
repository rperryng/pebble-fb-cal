var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  facebookUserId: String,
  facebookAccessToken: String,
  timelineToken: String
});

var User = module.exports = mongoose.model('User', userSchema);
