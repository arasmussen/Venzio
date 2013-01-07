var Terrain = Drawable.extend({
  constructor: function(position) {
    this.width = terrainLength;
    this.length = terrainLength;
    this.initializeHeights();
    this.base('terrain', ['Position', 'Color'], false);

    this.position = position;
    this.initialize();
  },

  initializeHeights: function() {
    this.heights = [];
    for (var x = 0; x < this.width + 1; x++) {
      this.heights[x] = [];
      for (var z = 0; z < this.length + 1; z++) {
        this.heights[x][z] =
          (x - this.width / 2) * (x - this.width / 2) / this.width -
          (z - this.length / 2) / 2;
        this.heights[x][z] = 0;
      }
    }
  },

  getData: function(attrib) {
    if (attrib == 'Position') {
      var vertices = [];
      for (var x = 0; x < this.width; x++) {
        for (var z = 0; z < this.length; z++) {
          vertices.push(
            x - this.width / 2, this.heights[x][z], z - this.length / 2,
            x + 1 - this.width / 2, this.heights[x + 1][z], z - this.length / 2,
            x - this.width / 2, this.heights[x][z + 1], z + 1 - this.length / 2,
            x - this.width / 2, this.heights[x][z + 1], z + 1 - this.length / 2,
            x + 1 - this.width / 2, this.heights[x + 1][z], z - this.length / 2,
            x + 1 - this.width / 2, this.heights[x + 1][z + 1], z + 1 - this.length / 2
          );
        }
      }
      return new Float32Array(vertices);
    } else if (attrib == 'Color') {
      var colors = [];
      for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.length; j++) {
          var x = this.position.x + i;
          var z = this.position.z + j;
          colors.push(
            Math.sin(x), Math.sin(x + z), Math.sin(z), 1.0,
            Math.sin(x + 1.0), Math.sin(x + z + 1), Math.sin(z), 1.0,
            Math.sin(x), Math.sin(x + z + 1), Math.sin(z + 1), 1.0,
            Math.sin(x), Math.sin(x + z + 1), Math.sin(z + 1), 1.0,
            Math.sin(x + 1.0), Math.sin(x + z + 1), Math.sin(z), 1.0,
            Math.sin(x + 1.0), Math.sin(x + z + 2), Math.sin(z + 1), 1.0
          );
        }
      }
      return new Float32Array(colors);
    }
  },

  getAttribType: function(attrib) {
    return gl.FLOAT;
  },

  getItemSize: function(attrib) {
    if (attrib == 'Position') {
      return 3;
    } else if (attrib == 'Color') {
      return 4;
    }
  },

  getNumItems: function() {
    return 6 * (this.width) * (this.length);
  }
});
