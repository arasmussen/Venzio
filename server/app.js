var server = require('./server.js');

var server_instance = new server();
server_instance.init();

var interval;
var updateData = [];

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
