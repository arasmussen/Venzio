Terrain.prototype = new Drawable('terrain', ['Position', 'Color'], false);
Terrain.prototype.constructor = Terrain;

function Terrain(position) {
  this.position = position;

  this.width = terrainLength;
  this.length = terrainLength;

  this.heights = [];
  this.initializeHeights();

  // Drawable
  this.initialize();
}

Terrain.prototype.initializeHeights = function() {
  for (var x = 0; x < this.width + 1; x++) {
    this.heights[x] = [];
    for (var z = 0; z < this.length + 1; z++) {
      this.heights[x][z] =
        (x - this.width / 2) * (x - this.width / 2) / this.width -
        (z - this.length / 2) / 2;
      this.heights[x][z] = 0;
    }
  }
};

Terrain.prototype.getData = function(attrib) {
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
    for (var x = 0; x < this.width; x++) {
      for (var z = 0; z < this.length; z++) {
        colors.push(
          x % 2, x / this.width, z % 2, 1.0,
          (x + 1) % 2, x / this.width, z % 2, 1.0,
          x % 2, x / this.width, (z + 1) % 2, 1.0,
          x % 2, x / this.width, (z + 1) % 2, 1.0,
          (x + 1) % 2, x / this.width, z % 2, 1.0,
          (x + 1) % 2, x / this.width, (z + 1) % 2, 1.0
        );
      }
    }
    return new Float32Array(colors);
  }
};

Terrain.prototype.getAttribType = function(attrib) {
  return gl.FLOAT;
};

Terrain.prototype.getItemSize = function(attrib) {
  if (attrib == 'Position') {
    return 3;
  } else if (attrib == 'Color') {
    return 4;
  }
};

Terrain.prototype.getNumItems = function() {
  return 6 * (this.width) * (this.length);
};
