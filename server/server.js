define(['socket.io', 'db'], function(io, db) {
  return {
    main: function() {
      // set up socket connect/disconnect hooks
      io = io.listen(8080);
      io.sockets.on('connection', this.onConnect.bind(this));
      io.sockets.on('disconnect', this.onDisconnect.bind(this));

      // connect to db
      db.connect();

      this.clients = {};
      this.lastFrame = new Date().getTime();
      this.interval = setInterval(this.update.bind(this), 20);
    },

    onConnect: function(socket) {
      this.clients[socket.id] = {socket: socket};

      socket.emit('init', {id: socket.id});
      socket.on('input', this.onInput.bind(this, socket));
      socket.on('disconnect', this.onDisconnect.bind(this, socket));
    },

    onDisconnect: function(socket) {
      delete this.clients[socket.id];
    },

    onInput: function(socket, msg) {
    },

    update: function() {
      var time = new Date().getTime();
      var tslf = time - this.lastFrame;
      this.lastFrame = time;
    }
  };
});
