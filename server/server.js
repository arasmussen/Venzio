var io = require('socket.io').listen(8080);
var db = require('./db.js');

module.exports = function() {
  this.db = new db();
  this.clients = {};
  this.multiplayer = false;
};

module.exports.initialize = function() {
  this.db.connect();
  io.sockets.on('connection', this.onClientConnect.bind(this));
  io.sockets.on('disconnect', this.onClientDisconnect.bind(this));
};

module.exports.onClientConnect = function(socket) {
  this.clients[socket.id] = {socket: socket};
  socket.emit('init', socket.id);
  socket.on('message', this.onClientMessage.bind(this));

  if (!this.multiplayer && Object.keys(this.clients).length > 1) {
    this.enableMultiplayer();
  }
};

module.exports.onClientDisconnect = function() {
}

module.exports.onClientMessage = function(data) {
};
