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
      pingID: 0,
      pings: [],
      port: Globals.port,
      serverTime: null,
      socket: null,

      constructor: function(player, terrainManager) {
        this.player = player;

        this.socket = new io.connect(this.address, {port: this.port});
        this.socket.on('msg', this.onServerMessage.bind(this));
        this.socket.on('init', this.onServerInit.bind(this));
        this.socket.on('reply', this.onPingReply.bind(this));

        this.terrainManager = terrainManager;
      },

      onServerInit: function(data) {
        console.log('connected');
        this.id = data.id;
        this.connected = true;

        this.pingServer(function(ping, serverTime) {
          this.serverTime = serverTime;
        }.bind(this));
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

      pingServer: function(callback) {
        this.pings[this.pingID] = {
          callback: callback,
          start: new Date()
        };
        this.socket.emit('ping', {id: this.pingID++});
      },

      onPingReply: function(data) {
        var ping = (new Date()) - this.pings[data.id].start;
        var callback = this.pings[data.id].callback;
        delete this.pings[data.id];
        var serverTime = new Date(data.time) + ping / 2.0;
        callback(ping, serverTime);
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
