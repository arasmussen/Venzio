define([
    'shared/TerrainManager',
    'shared/Player',
    'client/Camera',
    'client/InputManager',
    'shared/physics/PhysicsManager'
  ],
  function(TerrainManager, Player, Camera, InputManager, PhysicsManager) {
    return Base.extend({
      constructor: function() {
        TerrainManager.initialize();

        this.player = new Player();
        this.camera = new Camera(this.player);
        this.peers = {};
      },

      mainLoop: function(tslf) {
        this.handleInput();
        this.updateWorld(tslf);
        this.drawWorld();
      },

      handleInput: function() {
        InputManager.update();
        this.player.handleInput();
      },

      updateWorld: function(tslf) {
        this.player.update();
        this.camera.update();
        TerrainManager.update(this.player.position);

        if (!this.player.freeFloat) {
          PhysicsManager.movePlayer(this.player, tslf);
        }

        // this.socket.emit('updateServer', {
        //   position: this.player.position,
        //   rotation: this.player.rotation,
        // });
      },

      drawWorld: function() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45.90, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
        mat4.identity(mvMatrix);

        this.camera.transform();
        this.player.draw();
        TerrainManager.draw(this.player.position);

        for (id in this.peers) {
          if (id == this.client_id) {
            continue;
          }
          this.peers[id].draw();
        }
      },

      setID: function(data) {
        this.client_id = data.id;
      },

      updateClient: function(data) {
        while (data.queue.length > 0) {
          var node = data.queue.shift();
          if (node.message == 'connect') {
            if (!this.peers.hasOwnProperty(node.id)) {
              this.peers[node.id] = new Peer(node.id);
            }
          } else if (node.message == 'disconnect') {
            if (this.peers.hasOwnProperty(node.id)) {
              delete this.peers[node.id];
            }
          } else if (node.message == 'enabled multiplayer') {
          } else if (node.message == 'disabled multiplayer') {
          } else if (node.message == 'update peer') {
            if (node.id == this.client_id) {
              continue;
            }

            if (!this.peers.hasOwnProperty(node.id)) {
              this.peers[node.id] = new Peer(node.id);
            }

            this.peers[node.id].updateTransform(node.position, node.rotation);
          }
        }
      }
    });
  }
);