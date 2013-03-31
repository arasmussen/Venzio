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
      serverTimeOffset: null,
      snapshots: [],
      socket: null,

      positionThreshold: 2.0,
      timeThreshold: 8,

      constructor: function(player, terrainManager, physicsManager) {
        this.player = player;
        this.terrainManager = terrainManager;
        this.physicsManager = physicsManager;

        this.socket = new io.connect(this.address, {port: this.port});
        this.socket.on('msg', this.onServerMessage.bind(this));
        this.socket.on('init', this.onServerInit.bind(this));
        this.socket.on('reply', this.onPingReply.bind(this));
      },

      onServerInit: function(data) {
        console.log('connected');
        this.id = data.id;
        this.connected = true;

        this.pingServer(function(ping, serverTime) {
          this.serverTimeOffset = serverTime.valueOf() - (new Date()).valueOf();
        }.bind(this));
      },

      onServerMessage: function(data) {
        if (!this.connected) {
          return;
        }

        // mark all peers
        for (var id in this.peers) {
          this.peers[id].connected = false;
        }

        for (var client in data) {
          var id = data[client].id;
          if (id == this.id) {
            this.updatePlayer(data[client]);
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

        // remove disconnected ones
        for (var id in this.peers) {
          if (this.peers[id].connected == false) {
            delete this.peers[id];
          }
        }
      },

      snapshot: function(tslf) {
        if (!this.connected) {
          return;
        }

        if (this.snapshots.length > 15) {
          console.log('NetworkManager: server taking a while to get back to us');
        }

        var time = (new Date()).valueOf() + this.serverTimeOffset;
        this.snapshots.push({
          time: time,
          position: {
            x: this.player.position.x,
            y: this.player.position.y,
            z: this.player.position.z
          },
          desiredVelocity: {
            x: this.player.desiredVelocity.x,
            y: this.player.desiredVelocity.y,
            z: this.player.desiredVelocity.z
          },
          velocity: {
            x: this.player.velocity.x,
            y: this.player.velocity.y,
            z: this.player.velocity.z
          },
          rotation: {
            pitch: this.player.rotation.pitch,
            yaw: this.player.rotation.yaw
          },
          state: this.player.getState(),
          tslf: tslf
        });
      },

      // client side prediction:
      // for each frame that is rendered, remember significant data about the
      // player (input state, position, etc) to be able to rewind and fast-
      // forward all physics events. then, when we get a message from the server,
      // find the corresponding frame to the server message (by timestamp) in the
      // past. if we're too far off then just snap and fast forward events.
      // otherwise if we're only a little off then interpolate by 10% so that the
      // player doesn't notice the correction, and then fast forward events.
      updatePlayer: function(data) {
        while (this.snapshots.length > 0) {
          var time_difference = Math.abs(this.snapshots[0].time - data.time);
          if (time_difference < this.timeThreshold) {
            break;
          }

          if (this.snapshots[0].time > data.time) {
            break;
          }

          // discard old moves
          this.snapshots.shift();
        }

        if (this.snapshots.length == 0) {
          return;
        }

        var time_difference = Math.abs(this.snapshots[0].time - data.time);
        if (time_difference > this.timeThreshold) {
          return;
        }

        var dummyPlayer = this.snapshots.shift();
        dummyPlayer.freeFloat = Boolean(dummyPlayer.state & 0x0002);
        dummyPlayer.onGround = Boolean(dummyPlayer.state & 0x0004);

        // if we need to correct too much then just snap, otherwise try to
        // interpolate

        // TODO: figure out how to copy objects better
        // var position_difference = Globals.distance(this.snapshots[0].position, data.position);
        // if (position_difference > this.positionThreshold) {
        //   dummyPlayer.position.x = data.position.x;
        //   dummyPlayer.position.y = data.position.y;
        //   dummyPlayer.position.z = data.position.z;
        //   dummyPlayer.velocity.x = data.velocity.x;
        //   dummyPlayer.velocity.y = data.velocity.y;
        //   dummyPlayer.velocity.z = data.velocity.z;
        // } else {
        //   dummyPlayer.position.x = this.snapshots[0].position.x * 0.9 + data.position.x * 0.1;
        //   dummyPlayer.position.y = this.snapshots[0].position.y * 0.9 + data.position.y * 0.1;
        //   dummyPlayer.position.z = this.snapshots[0].position.z * 0.9 + data.position.z * 0.1;
        //   dummyPlayer.velocity.x = this.snapshots[0].velocity.x * 0.9 + data.velocity.x * 0.1;
        //   dummyPlayer.velocity.y = this.snapshots[0].velocity.y * 0.9 + data.velocity.y * 0.1;
        //   dummyPlayer.velocity.z = this.snapshots[0].velocity.z * 0.9 + data.velocity.z * 0.1;
        // }
        // dummyPlayer.onGround = Boolean(this.snapshots[0].state & 0x0004);

        // fast forward through more physics
        for (var i in this.snapshots) {
          var snapshot = this.snapshots[i];

          dummyPlayer.desiredVelocity.x = snapshot.desiredVelocity.x;
          dummyPlayer.desiredVelocity.y = snapshot.desiredVelocity.y;
          dummyPlayer.desiredVelocity.z = snapshot.desiredVelocity.z;
          dummyPlayer.rotation.pitch = snapshot.rotation.pitch;
          dummyPlayer.rotation.yaw = snapshot.rotation.yaw;
          dummyPlayer.freeFloat = Boolean(snapshot.state & 0x0002);

          this.physicsManager.movePlayer(dummyPlayer, snapshot.tslf);
        }

        this.player.position.x = dummyPlayer.position.x;
        this.player.position.x = dummyPlayer.position.x;
        this.player.position.x = dummyPlayer.position.x;
        this.player.velocity.x = dummyPlayer.velocity.x;
        this.player.velocity.x = dummyPlayer.velocity.x;
        this.player.velocity.x = dummyPlayer.velocity.x;
        this.player.onGround = dummyPlayer.onGround;
      },

      pingServer: function(callback) {
        this.pings[this.pingID] = {
          callback: callback,
          start: (new Date()).valueOf()
        };
        this.socket.emit('ping', {id: this.pingID++});
      },

      onPingReply: function(data) {
        var ping = (new Date()).valueOf() - this.pings[data.id].start;
        var callback = this.pings[data.id].callback;
        delete this.pings[data.id];
        var serverTime = new Date(data.time).valueOf() + ping / 2.0;
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
