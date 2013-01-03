require('util.js');

var io = require('socket.io').listen(8080);
var sockets = {};
var multiplayer = false;
var interval;
var updateData = [];

io.sockets.on('connection', function(socket) {
  connect(socket);
  socket.on('disconnect', disconnect.bind(socket));
  socket.on('updateServer', updateServer.bind(socket));
});

function enableMultiplayer() {
  if (!multiplayer) {
    updateData = [{message: 'enabled multiplayer'}];

    multiplayer = true;
    interval = setInterval(updateClients, 30);
  }
}

function disableMultiplayer() {
  if (multiplayer) {
    multiplayer = false;
    clearInterval(interval);

    // flush updateData
    updateData.push({message: 'disabled multiplayer'});
    updateClients();
  }
}

function connect(socket) {
  var id = Math.randomInteger(0, 1000000000);
  sockets[socket] = {id: id};

  socket.emit('setID', {id: id});

  if (!multiplayer && sockets.length > 1) {
    enableMultiplayer();
  }

  if (multiplayer) {
    updateData.push({id: id, message: 'connect'});
  }
}

function disconnect() {
  var id = sockets[socket].id;
  delete sockets[socket];

  if (multiplayer && sockets.length < 2) {
    disableMultiplayer();
  }

  if (multiplayer) {
    updateData.push({id: id, message: 'disconnect'});
  }
}

function updateServer(data) {
  sockets[this].position = data.position;
  updateData.push({
    id: sockets[this].id,
    message: 'position',
    position: data.position
  });
}

function updateClients() {
  for (var socket in sockets) {
    socket.emit('updateClient', updateData);
  }
  updateData.length = 0;
}
