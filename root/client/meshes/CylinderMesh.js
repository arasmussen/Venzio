// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/primitives/Cylinder',
    'client/meshes/PrimitiveMesh'
  ],
  function(Cylinder, PrimitiveMesh) {
    return PrimitiveMesh.extend({
      constructor: function(bottom, radius, height) {
        this.base();

        this.cylinder = new Cylinder(bottom, radius, height);

        this.rows = 5;
        this.columns = 20;

        this.initialize();
      },

      getPosition: function() {
        return this.cylinder.position;
      },

      getRotation: function() {
        return this.cylinder.rotation;
      },

      updatePosRot: function(pos, rot) {
        this.cylinder.position = pos;
        this.cylinder.rotation = rot;
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var i = 0; i < this.columns; i++) {
            var angle = (i / this.columns) * 2 * Math.PI;
            var x = this.cylinder.radius * Math.cos(angle);
            var z = this.cylinder.radius * Math.sin(angle);
            for (var j = 0; j < this.rows; j++) {
              var y = this.cylinder.height * (j / (this.rows - 1));
              vertices.push(x, y, z);
            }
          }
          vertices.push(0.0, 0.0, 0.0);
          vertices.push(0.0, this.cylinder.height, 0.0);
          return new Float32Array(vertices);
        } else if (attrib == 'Color') {
          var colors = [];
          for (var i = 0; i < this.columns; i++) {
            for (var j = 0; j < this.rows; j++) {
              colors.push(1.0, 0.0, 0.0, 1.0);
            }
          }
          colors.push(1.0, 0.0, 0.0, 1.0);
          colors.push(1.0, 0.0, 0.0, 1.0);
          return new Float32Array(colors);
        }
      },

      getIndexData: function() {
        var indices = [];
        var centerBottom = this.columns * this.rows;
        var centerTop = this.columns * this.rows + 1;
        for (var i = 0; i < this.columns; i++) {
          for (var j = 0; j < this.rows; j++) {
            var current = i * this.rows + j;
            var side = ((i + 1) % this.columns) * this.rows + j;
            indices.push(current, side);

            var above = i * this.rows + j + 1;
            if (j == this.rows - 1) {
              indices.push(current, centerTop);
            } else if (j == 0) {
              indices.push(current, above);
              indices.push(current, centerBottom);
            } else {
              indices.push(current, above);
            }
          }
        }
        return new Uint16Array(indices);
      },

      getNumItems: function() {
        return 2 * this.columns * (2 * this.rows + 1);
      }
    });
  }
);
