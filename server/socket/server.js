define([
    'socket.io',
    'server/db',
    'server/ClientManager',
    'shared/PhysicsManager',
    'shared/TerrainManager',
    'shared/WallManager'
  ],
  function(io, db, ClientManager, PhysicsManager, TerrainManager, WallManager) {
    return {
      main: function() {
        // set up socket connect/disconnect hooks
        io = io.listen(8080);
        io.sockets.on('connection', this.onConnect.bind(this));
        io.sockets.on('disconnect', this.onDisconnect.bind(this));

        // connect to db
        db.connect();

        this.intervals = {
          updatePlayer: setInterval(this.updatePlayers.bind(this), 10),
          updateClient: setInterval(this.updateClients.bind(this), 20)
        };

        this.terrainManager = new TerrainManager();
        this.wallManager = new WallManager();
        this.physicsManager = new PhysicsManager(this.terrainManager);
        this.clientManager = new ClientManager(
          this.terrainManager,
          this.wallManager,
          this.physicsManager
        );
      },

      onConnect: function(socket) {
        console.log('connect');
        this.clientManager.addClient(socket);
        socket.emit('init', {id: socket.id});
        socket.on('disconnect', this.onDisconnect.bind(this, socket));
        socket.on('ping', this.onPing.bind(this, socket));
      },

      onDisconnect: function(socket) {
        this.clientManager.removeClient(socket);
      },

      onPing: function(socket, data) {
        var time = (new Date()).valueOf();
        socket.emit('reply', {
          id: data.id,
          offset: time - data.time
        });
      },

      updatePlayers: function() {
        this.clientManager.updatePlayers();
      },

      updateClients: function() {
        this.clientManager.updateClients();
      }
    };
  }
);
