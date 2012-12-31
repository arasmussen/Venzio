var io = require('socket.io').listen(8080);
var sockets = [];
var id = 0;

io.sockets.on('connection', function(socket) {
  connect(socket);
  socket.on('disconnect', disconnect.bind(socket));
});

// add socket to array when they connect
function connect(socket) {
  console.log('socket ' + id + ' connected');
  sockets.push({id: id, socket: socket});
  socket.emit('setID', {id: id});
  id = id + 1;
}

// remove socket when they disconnect
function disconnect() {
  for (var i = 0; i < sockets.length; i++) {
    if (this == sockets[i].socket) {
      console.log('socket ' + sockets[i].id + ' disconnected');
      sockets.splice(i, 1);
    }
  }
}
