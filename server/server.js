define([
    'socket.io',
    'server/db',
    'shared/physics/PhysicsManager',
    'shared/Player'
  ],
  function(io, db, PhysicsManager, Player) {
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
      },

      onConnect: function(socket) {
        this.clients[socket.id] = {
          lastFrame: new Date().getTime(),
          player: new Player(),
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
        var input_bitmap = msg.msg.input;
        var player = this.clients[socket.id].player;

        player.strafe = 0.0;
        player.walk = 0.0;
        player.strafe =
          0.5 * (0x04 & input_bitmap ? 1 : 0) -
          0.5 * (0x02 & input_bitmap ? 1 : 0);
        player.walk =
          0.5 * (0x01 & input_bitmap ? 1 : 0) -
          0.5 * (0x08 & input_bitmap ? 1 : 0);

        if (player.onGround && !player.freeFloat && (0x10 & input_bitmap)) {
          player.jump = true;
        }

        if (0x20 & input_bitmap) {
          if (!this.clients[socket.id].toggles.build) {
            this.client[socket.id].toggles.build = true;
            player.buildMode = !player.buildMode;
          }
        } else {
          this.client[socket.id].toggles.build = false;
        }

        if (0x40 & input_bitmap) {
          if (!this.clients[socket.id].toggles.camera) {
            this.client[socket.id].toggles.camera = true;
            player.freeFloat = !player.freeFloat;
          }
        } else {
          this.client[socket.id].toggles.camera = false;
        }

        var time = new Date().getTime();
        var tslf = time - this.clients[socket.id].lastFrame;
        this.clients[socket.id].lastFrame = time;
        PhysicsManager.movePlayer(player, tslf);
      },

      updateClients: function() {
      }
    };
  }
);
