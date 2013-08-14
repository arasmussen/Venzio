// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/CPlayer',
    'client/Camera',
    'client/CInputManager',
    'common/PhysicsManager',
    'basejs',
    'client/meshes/WallMesh',
    'common/WallManager',
    'client/ui/Framerate',
    'client/ui/Ping',
    'client/ui/Cursor',
    'common/Globals',
    'client/meshes/ManMesh',
    'client/meshes/SkeletonMesh'
  ],
  function(CPlayer, Camera, InputManager, PhysicsManager, Base, Wall, WallManager, Framerate, Ping, Cursor, Globals, ManMesh, SkeletonMesh) {
    return Base.extend({
      constructor: function(networkManager, terrainManager) {
        this.terrainManager = terrainManager;
        this.physicsManager = new PhysicsManager(this.terrainManager);
        this.wallManager = new WallManager(this.terrainManager);
        this.player = new CPlayer(InputManager, this.terrainManager, this.wallManager);
        this.camera = new Camera(this.player);
        this.networkManager = networkManager;
        InputManager.networkManager = this.networkManager;

        this.man = new ManMesh();
        this.man.initialize();
        // this.skeleton = new SkeletonMesh();
        // this.skeleton.initialize();

        this.framerate = new Framerate('framerate');
        this.cursor = new Cursor('cursor');

        if (Globals.multiplayer) {
          this.ping = new Ping('ping', networkManager);
        }
      },

      mainLoop: function(tslf) {
        this.handleInput();
        this.updateWorld(tslf);
        this.drawWorld();
        this.updateUI();
      },

      start: function() {
        if (Globals.multiplayer) {
          this.networkManager.startGame(this.player, this.terrainManager, this.physicsManager);
        }
      },

      handleInput: function() {
        this.player.handleInput();
      },

      updateWorld: function(tslf) {
        this.player.update();
        this.camera.update();
        this.terrainManager.update(this.player.position);

        this.physicsManager.movePlayer(this.player, tslf);
        if (Globals.multiplayer) {
          this.networkManager.snapshot(tslf);
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

        this.man.draw();
        // this.skeleton.draw();

        if (Globals.multiplayer) {
          this.networkManager.drawPeers();
        }
        this.wallManager.drawWalls();
      },

      updateUI: function() {
        this.framerate.snapshot();
        this.cursor.update(!this.player.buildMode);
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
