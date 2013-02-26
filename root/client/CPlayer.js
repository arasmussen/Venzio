define([
    'client/meshes/WallMesh',
    'shared/Player',
    'shared/Globals'
  ],
  function(WallMesh, Player, Globals) {
    return Player.extend({
      constructor: function(inputManager, terrainManager) {
        this.base(inputManager, terrainManager);
        this.buildObject = new WallMesh(this, terrainManager);
      },

      draw: function() {
        if (this.buildMode) {
          this.buildObject.draw();
        }
      }
    });
  }
);
