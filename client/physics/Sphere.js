var Sphere = Shape.extend({
  constructor: function(center, radius) {
    this.base();
    this.position = center;
    this.radius = radius;

    this.rows = 12;
    this.columns = 20;
  },

  getData: function(attrib) {
    if (attrib == 'Position') {
      var vertices = [];
      for (var i = 1; i < this.rows - 1; i++) {
        var yAngle = (i / (this.rows - 1)) * Math.PI;
        for (var j = 0; j < this.columns; j++) {
          var xzAngle = (j / this.columns) * 2 * Math.PI;
          var x = this.radius * Math.sin(yAngle) * Math.cos(xzAngle);
          var y = -this.radius * Math.cos(yAngle);
          var z = this.radius * Math.sin(yAngle) * Math.sin(xzAngle);
          vertices.push(x, y, z);
        }
      }
      vertices.push(0.0, -this.radius, 0.0);
      vertices.push(0.0, this.radius, 0.0);
      return new Float32Array(vertices);
    } else if (attrib == 'Color') {
      var colors = [];
      for (var i = 1; i < this.rows - 1; i++) {
        for (var j = 0; j < this.columns; j++) {
          colors.push(1.0, 0.0, 0.0, 1.0);
        }
      }
      colors.push(1.0, 0.0, 0.0, 1.0);
      colors.push(1.0, 0.0, 0.0, 1.0);
      return new Float32Array(colors);
    } else if (attrib == 'index') {
      var indices = [];
      var centerBottom = this.columns * (this.rows - 2);
      var centerTop = this.columns * (this.rows - 2) + 1;
      for (var i = 0; i < this.rows - 2; i++) {
        for (var j = 0; j < this.columns; j++) {
          var current = i * this.columns + j;
          var side = i * this.columns + (j + 1) % this.columns;
          indices.push(current, side);

          var above = (i + 1) * this.columns + j;
          if (i == this.rows - 3) {
            indices.push(current, centerTop);
          } else if (i == 0) {
            indices.push(current, centerBottom);
            indices.push(current, above);
          } else {
            indices.push(current, above);
          }
        }
      }
      return new Uint16Array(indices);
    }
  },

  getItemSize: function(attrib) {
    if (attrib == 'Position') {
      return 3;
    } else if (attrib == 'Color') {
      return 4;
    }
  },

  getAttribType: function(attrib) {
    return gl.FLOAT;
  },

  getNumItems: function() {
    return 2 * this.columns * (2 * this.rows - 3);
  },

  getDrawMode: function() {
    return gl.LINES;
  }
});
