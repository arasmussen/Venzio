var io = require('socket.io').listen(8080);
var db = require('./db.js');

module.exports = function() {
  this.db = new db();
  this.clients = {};
};

module.exports.prototype.init = function() {
  // connect to the db
  this.db.connect();

  // set up our socket connect/disconnect hooks
  io.sockets.on('connection', this.onConnect.bind(this));
  io.sockets.on('disconnect', this.onDisconnect.bind(this));

  // call update every 20 ms
  this.interval = setInterval(this.update.bind(this), 20);

  // init last frame for tslf in update
  this.lastFrame = new Date().getTime();
};

module.exports.prototype.onConnect = function(socket) {
  this.clients[socket.id] = {socket: socket};

  socket.emit('init', {id: socket.id});
  socket.on('input', this.onInput.bind(this, socket));
  socket.on('disconnect', this.onDisconnect.bind(this, socket));
};

module.exports.prototype.onDisconnect = function(socket) {
  delete this.clients[socket.id];
};

module.exports.prototype.onInput = function(socket, data) {
};

module.exports.prototype.update = function() {
  var time = new Date().getTime();
  var tslf = time - this.lastFrame;
  this.lastFrame = time;
};
