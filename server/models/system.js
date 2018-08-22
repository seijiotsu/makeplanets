var mongoose = require('mongoose');
var Celestial = require('./celestial.js');
var Schema = mongoose.Schema;

var SystemSchema = new mongoose.Schema({
  name: String,
  owner: String,
  celestials: [{ type: Schema.Types.ObjectId, ref: 'Celestial' }]
});

module.exports = mongoose.model('System', SystemSchema);
