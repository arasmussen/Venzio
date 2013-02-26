define([
    'shared/Globals',
    'basejs'
  ],
  function(Globals, Base) {
    return Base.extend({
      constructor: function(position) {
        this.width = Globals.terrainLength;
        this.length = Globals.terrainLength;
        this.initializeHeights();
        this.position = position;
        this.rotation = {
          yaw: 0.0,
          pitch: 0.0
        };
      },

      initializeHeights: function() {
        this.heights = [];
        for (var x = 0; x < this.width + 1; x++) {
          this.heights[x] = [];
          for (var z = 0; z < this.length + 1; z++) {
            this.heights[x][z] =
              3 * Math.sin(2 * Math.PI * x / (this.width)) +
              2 * Math.cos(2 * Math.PI * z / (this.length));
          }
        }
      },

      getHeight: function(position) {
        var offsetWithinTerrain = {
          x: position.x - (this.position.x - this.width / 2),
          z: position.z - (this.position.z - this.width / 2)
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
