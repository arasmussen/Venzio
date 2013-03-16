define([
    'shared/Globals',
    'client/Peer',
    'client/lib/socket.io',
    'basejs'
  ],
  function(Globals, Peer, io, Base) {
    return Base.extend({
      address: Globals.address,
      connected: false,
      peers: {},
      port: Globals.port,
      socket: null,

      constructor: function(player, terrainManager) {
        this.player = player;

        this.socket = new io.connect(this.address, {port: this.port});
        this.socket.on('msg', this.onServerMessage.bind(this));
        this.socket.on('init', this.onServerInit.bind(this));

        this.terrainManager = terrainManager;
      },

      onServerInit: function(data) {
        console.log('connected');
        this.id = data.id;
        this.connected = true;
      },

      onServerMessage: function(data) {
        if (!this.connected) {
          return;
        }

        for (var id in this.peers) {
          this.peers[id].connected = false;
        }

        for (var client in data) {
          var id = data[client].id;
          if (id == this.id) {
            continue;
          }
          if (!this.peers.hasOwnProperty(id)) {
            this.peers[id] = new Peer(
              id,
              data[client].position,
              this.terrainManager
            );
          }
          this.peers[id].connected = true;
          this.peers[id].updateTransform(
            data[client].position,
            data[client].rotation
          );
          this.peers[id].setState(data[client].state);
        }

        for (var id in this.peers) {
          if (this.peers[id].connected == false) {
            delete this.peers[id];
          }
        }
      },

      sendMessage: function(msg) {
        if (!this.connected) {
          return;
        }

        this.socket.emit('input', {
          id: this.id,
          msg: msg
        });
      },

      drawPeers: function() {
        for (var id in this.peers) {
          this.peers[id].draw();
        }
      }
    });
  }
);
