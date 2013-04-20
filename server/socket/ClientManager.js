define([
    'basejs',
    'server/Client'
  ], function(Base, Client) {
    return Base.extend({
      clients: {},
      dataQueue: [],

      constructor: function(terrainManager, physicsManager) {
        this.terrainManager = terrainManager;
        this.physicsManager = physicsManager;
      },

      updatePlayers: function() {
        for (var id in this.clients) {
          var tslf = this.clients[id].update();
          this.terrainManager.update(this.clients[id].player.position);
          this.physicsManager.movePlayer(this.clients[id].player, tslf);
          this.dataQueue.push({
            id: id,
            position: this.clients[id].player.position,
            rotation: this.clients[id].player.rotation,
            velocity: this.clients[id].player.velocity,
            state: this.clients[id].player.getState(),
            time: (new Date()).valueOf()
          });
        }
      },

      updateClients: function() {
        for (var id in this.clients) {
          this.clients[id].socket.emit('msg', this.dataQueue);
        }
        this.dataQueue = [];
      },

      addClient: function(socket) {
        this.clients[socket.id] = new Client(socket, this.terrainManager);
      },

      removeClient: function(socket) {
        delete this.clients[socket.id];
      }
    });
  }
);
