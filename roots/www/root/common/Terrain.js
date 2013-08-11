// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/Globals',
    'basejs'
  ],
  function(Globals, Base) {
    return Base.extend({
      constructor: function(coords) {
        this.width = Globals.terrainLength;
        this.length = Globals.terrainLength;
        this.position = {x: coords.x * this.length, y: 0, z: coords.z * this.length};
        this.rotation = {yaw: 0.0, pitch: 0.0};
        this.heights = [];
        this.ungeneratedRows = this.length + 3;
        this.generated = false;
      },

      deploy: function() {
        // empty because we use this in the child
      },

      hasAllData: function() {
        return this.generated;
      },

      setHeights: function(row, heights) {
        this.heights[row] = heights;
        if (--this.ungeneratedRows == 0) {
          this.generated = true;
        }
      },

      getHeight: function(position) {
        var offsetWithinTerrain = {
          x: position.x - (this.position.x),
          z: position.z - (this.position.z)
        };
        var indexOfTriangles = {
          x: Math.floor(offsetWithinTerrain.x),
          z: Math.floor(offsetWithinTerrain.z)
        };
        var difference = {
          x: offsetWithinTerrain.x - indexOfTriangles.x,
          z: offsetWithinTerrain.z - indexOfTriangles.z
        };
        var isFirstTriangle = ((difference.x + difference.z) < 1.0);

        var x = indexOfTriangles.x;
        var z = indexOfTriangles.z;
        if (isFirstTriangle) {
          return this.heights[x][z] +
            difference.x * (this.heights[x + 1][z] - this.heights[x][z]) +
            difference.z * (this.heights[x][z + 1] - this.heights[x][z]);
        } else {
          difference.x = 1.0 - difference.x;
          difference.z = 1.0 - difference.z;
          return this.heights[x + 1][z + 1] +
            difference.x * (this.heights[x][z + 1] - this.heights[x + 1][z + 1]) +
            difference.z * (this.heights[x + 1][z] - this.heights[x + 1][z + 1]);
        }
      }
    });
  }
);
