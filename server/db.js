module.exports = function() {
  this.mongoose = require('mongoose');
  this.db = null;
};

module.exports.prototype.connect = function() {
  this.mongoose.connect('mongodb://localhost/gfx');
  this.db = this.mongoose.connection;
  this.db.on('error', this.error);
  this.db.once('open', this.success);
};

module.exports.prototype.error = function(msg) {
  console.error('connection error:', msg);
};

module.exports.prototype.success = function() {
  console.log('db successfully connected');
};
