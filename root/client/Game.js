define([
    'client/CPlayer',
    'client/CTerrainManager',
    'client/Camera',
    'client/CInputManager',
    'client/NetworkManager',
    'shared/PhysicsManager',
    'basejs'
  ],
  function(CPlayer, CTerrainManager, Camera, InputManager, NetworkManager, PhysicsManager, Base) {
    return Base.extend({
      constructor: function() {
        this.terrainManager = new CTerrainManager();
        this.physicsManager = new PhysicsManager(this.terrainManager);
        this.player = new CPlayer(InputManager, this.terrainManager);
        this.camera = new Camera(this.player);
        this.networkManager = new NetworkManager(
          this.player,
          this.terrainManager
        );
        InputManager.networkManager = this.networkManager;
      },

      mainLoop: function(tslf) {
        this.handleInput();
        this.updateWorld(tslf);
        this.drawWorld();
      },

      handleInput: function() {
        this.player.handleInput();
      },

      updateWorld: function(tslf) {
        this.player.update();
        this.camera.update();
        this.terrainManager.update(this.player.position);

        if (!this.player.freeFloat) {
          this.physicsManager.movePlayer(this.player, tslf);
        }
      },

      drawWorld: function() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45.90, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
        mat4.identity(mvMatrix);

        this.camera.transform();
        this.player.draw();
        this.terrainManager.draw(this.player.position);

        this.networkManager.drawPeers();
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
