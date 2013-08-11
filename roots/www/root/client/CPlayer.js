// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/meshes/WallAttachmentMesh',
    'common/Player'
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
