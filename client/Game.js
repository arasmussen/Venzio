var Game = Base.extend({
  constructor: function() {
    this.terrainManager = new TerrainManager();
    this.player = new Player();
    this.camera = new Camera(this.player);
    this.peers = {};

    this.socket = new io.connect('http://gfx.rasmuzen.com', {port: 8080});
    this.socket.on('setID', this.setID.bind(this));
    this.socket.on('updateClient', this.updateClient.bind(this));
  },

  mainLoop: function() {
    this.handleInput();
    this.updateWorld();
    this.drawWorld();
  },

  handleInput: function() {
  },

  updateWorld: function() {
    this.player.update();
    this.camera.update();
    this.terrainManager.update(this.player.position);

    this.socket.emit('updateServer', {
      position: this.player.position,
      rotation: this.player.rotation,
    });
  },

  drawWorld: function() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45.90, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);
    mat4.identity(mvMatrix);

    this.camera.transform();
    this.terrainManager.draw(this.player.position);

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
