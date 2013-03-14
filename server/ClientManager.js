define([
    'basejs',
    'server/Client'
  ], function(Base, Client) {
    return Base.extend({
      clients: {},

      constructor: function(terrainManager, physicsManager) {
        this.terrainManager = terrainManager;
        this.physicsManager = physicsManager;
      },

      updatePlayers: function() {
        for (var id in this.clients) {
          var tslf = this.clients[id].update();
          this.terrainManager.update(this.clients[id].player.position);
          this.physicsManager.movePlayer(this.clients[id].player, tslf);
        }
      },

      updateClients: function() {
        var data = [];
        for (var id in this.clients) {
          data.push({
            id: id,
            position: this.clients[id].player.position,
            rotation: this.clients[id].player.rotation
          });
        }
        for (var id in this.clients) {
          this.clients[id].socket.emit('msg', data);
        }
      },

      addClient: function(socket) {
        this.clients[socket.id] = new Client(socket);
      },

      removeClient: function(socket) {
        delete this.clients[socket.id];
      }
    });
  }
);
