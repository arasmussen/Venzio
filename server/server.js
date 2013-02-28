define([
    'socket.io',
    'server/db',
    'server/SInputManager',
    'shared/PhysicsManager',
    'shared/Player',
    'shared/TerrainManager'
  ],
  function(io, db, InputManager, PhysicsManager, Player, TerrainManager) {
    return {
      main: function() {
        // set up socket connect/disconnect hooks
        io = io.listen(8080);
        io.sockets.on('connection', this.onConnect.bind(this));
        io.sockets.on('disconnect', this.onDisconnect.bind(this));

        // connect to db
        db.connect();

        this.clients = {};
        this.interval = setInterval(this.updateClients.bind(this), 20);
        this.terrainManager = new TerrainManager();
        this.physicsManager = new PhysicsManager(this.terrainManager);
      },

      onConnect: function(socket) {
        this.clients[socket.id] = {
          lastFrame: new Date().getTime(),
          player: new Player(InputManager),
          socket: socket,
          toggles: {
            build: false,
            camera: false
          }
        };

        socket.emit('init', {id: socket.id});
        socket.on('input', this.onInput.bind(this, socket));
        socket.on('disconnect', this.onDisconnect.bind(this, socket));
      },

      onDisconnect: function(socket) {
        delete this.clients[socket.id];
      },

      onInput: function(socket, msg) {
        InputManager.handleInput(msg.msg.input);

        var player = this.clients[socket.id].player;
        player.handleInput();

        var time = new Date().getTime();
        var tslf = time - this.clients[socket.id].lastFrame;
        this.clients[socket.id].lastFrame = time;

        player.update();
        this.physicsManager.movePlayer(player, tslf);
      },

      updateClients: function() {
      }
    };
  }
);
