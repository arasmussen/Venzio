// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/Globals',
    'client/Peer',
    'client/lib/socket.io',
    'basejs'
  ],
  function(Globals, Peer, io, Base) {
    return Base.extend({
      constructor: function() {
        this.address = Globals.address;
        this.connected = false;
        this.peers = {};
        this.pingID = 0;
        this.pings = [];
        this.port = Globals.port;
        this.serverTimeOffset = null;
        this.snapshots = [];
        this.socket = null;

        this.positionThreshold = 1.0;
        this.timeThreshold = 5;
      },

      connect: function(callback) {
        this.socket = new io.connect(this.address, {port: this.port});
        this.socket.on('msg', this.onServerMessage.bind(this));
        this.socket.on('init', this.onServerInit.bind(this));
        this.socket.on('reply', this.onPingReply.bind(this));

        var checks = 0;
        var maxChecks = 300;
        var checkInterval = 10;

        var checkConnection = function() {
          checks++;
          if (this.connected) {
            setTimeout(callback.bind(null, true), 0);
          } else if (checks < maxChecks) {
            setTimeout(checkConnection.bind(this), checkInterval);
          } else {
            setTimeout(callback.bind(null, false), 0);
          }
        }
        setTimeout(checkConnection.bind(this), checkInterval);
      },

      startGame: function(player, terrainManager, physicsManager) {
        this.player = player;
        this.terrainManager = terrainManager;
        this.physicsManager = physicsManager;
      },

      onServerInit: function(data) {
        this.id = data.id;
        this.pingServer(function(ping, offset) {
          this.serverTimeOffset = offset;
          this.connected = true;
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
        var position_difference = Globals.distance(dummyPlayer.position, data.position);
        if (position_difference > this.positionThreshold) {
          console.log('snapped!');
          dummyPlayer.position.x = data.position.x;
          dummyPlayer.position.y = data.position.y;
          dummyPlayer.position.z = data.position.z;
          dummyPlayer.velocity.x = data.velocity.x;
          dummyPlayer.velocity.y = data.velocity.y;
          dummyPlayer.velocity.z = data.velocity.z;
        } else {
          dummyPlayer.position.x = dummyPlayer.position.x * 0.9 + data.position.x * 0.1;
          dummyPlayer.position.y = dummyPlayer.position.y * 0.9 + data.position.y * 0.1;
          dummyPlayer.position.z = dummyPlayer.position.z * 0.9 + data.position.z * 0.1;
          dummyPlayer.velocity.x = dummyPlayer.velocity.x * 0.9 + data.velocity.x * 0.1;
          dummyPlayer.velocity.y = dummyPlayer.velocity.y * 0.9 + data.velocity.y * 0.1;
          dummyPlayer.velocity.z = dummyPlayer.velocity.z * 0.9 + data.velocity.z * 0.1;
        }

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
        this.player.position.y = dummyPlayer.position.y;
        this.player.position.z = dummyPlayer.position.z;
        this.player.velocity.x = dummyPlayer.velocity.x;
        this.player.velocity.y = dummyPlayer.velocity.y;
        this.player.velocity.z = dummyPlayer.velocity.z;
        this.player.onGround = dummyPlayer.onGround;
      },

      pingServer: function(callback) {
        var time = (new Date()).valueOf();
        this.socket.emit('ping', {id: this.pingID, time: time});
        this.pings[this.pingID++] = {
          callback: callback,
          start: time
        };
      },

      onPingReply: function(data) {
        var ping = (new Date()).valueOf() - this.pings[data.id].start;
        var callback = this.pings[data.id].callback;
        delete this.pings[data.id];
        callback(ping, data.offset);
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
