var mongoose = require('mongoose');

var userSchema = mongoose.Schema({

});

var User = module.exports = mongoose.model('User', userSchema);
