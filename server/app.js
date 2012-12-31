var io = require('socket.io').listen(8080);

io.sockets.on('connection', function(socket) {
  io.sockets.emit('this', {will: 'be received by everyone'});

  socket.on('clientMSG', function(from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function() {
    sockets.emit('user disconnected');
  });
});
