define([
    'client/meshes/WallAttachmentMesh',
    'shared/Player'
  ],
  function(WallAttachmentMesh, Player) {
    return Player.extend({
      getAttachmentType: function() {
        return WallAttachmentMesh;
      },

      draw: function() {
        if (this.buildMode) {
          this.buildObject.draw();
        }
      }
    });
  }
);
