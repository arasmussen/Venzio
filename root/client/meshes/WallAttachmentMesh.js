// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/WallAttachment',
    'client/meshes/WallMesh'
  ],
  function(WallAttachment, WallMesh) {
    return WallAttachment.extend({
      newWall: function() {
        this.wall = new WallMesh(this.terrainManager, {x: 0.0, y: 0.0, z: 0.0}, {pitch: 0.0, yaw: 0.0});
      }
    });
  }
);
