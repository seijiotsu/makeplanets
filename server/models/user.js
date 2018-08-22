var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  auth_id: String,
  username: String,
  tagline: String
});

module.exports = mongoose.model('User', UserSchema);
