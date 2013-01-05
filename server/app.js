var io = require('socket.io').listen(8080);
var clients = {};
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
    interval = setInterval(updateClients, 20);
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
  clients[socket.id] = {socket: socket};
  socket.emit('setID', {id: socket.id});

  if (!multiplayer && Object.keys(clients).length > 1) {
    enableMultiplayer();
  }

  if (multiplayer) {
    updateData.push({id: socket.id, message: 'connect'});
  }
}

function disconnect() {
  var id = this.id;
  delete clients[id];

  if (multiplayer && Object.keys(clients).length < 2) {
    disableMultiplayer();
  }

  if (multiplayer) {
    updateData.push({id: id, message: 'disconnect'});
  }
}

function updateServer(data) {
  clients[this.id].position = data.position;
  clients[this.id].rotation = data.rotation;
  updateData.push({
    id: this.id,
    message: 'update peer',
    position: data.position,
    rotation: data.rotation
  });
}

function updateClients() {
  for (var id in clients) {
    clients[id].socket.emit('updateClient', {queue: updateData});
  }
  updateData.length = 0;
}

Math.randomInteger = function(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
};
