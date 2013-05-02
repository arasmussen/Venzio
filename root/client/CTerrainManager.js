// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'shared/TerrainManager',
    'client/meshes/TerrainMesh'
  ],
  function(TerrainManager, TerrainMesh) {
    return TerrainManager.extend({
      constructor: function() {
        this.base();
      },

      createTerrain: function(x, z) {
        if (this.terrains[x] == null) {
          this.terrains[x] = {};
        }
        if (this.terrains[x][z] == null) {
          var position = {x: x * this.length, y: 0, z: z * this.length};
          this.terrains[x][z] = new TerrainMesh(position);
        }
      },

      draw: function() {
        var min = {
          x: this.section.x - this.offset,
          z: this.section.z - this.offset
        };
        var max = {
          x: this.section.x + this.offset,
          z: this.section.z + this.offset
        };
        for (var x = min.x; x <= max.x; x++) {
          for (var z = min.z; z <= max.z; z++) {
            this.terrains[x][z].draw();
          }
        }
      }
    });
  }
);
