// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/primitives/Sphere',
    'client/meshes/PrimitiveMesh'
  ],
  function(Sphere, PrimitiveMesh) {
    return PrimitiveMesh.extend({
      constructor: function(center, radius) {
        this.base();

        this.sphere = new Sphere(center, radius);

        this.rows = 12;
        this.columns = 20;

        this.initialize();
      },

      getPosition: function() {
        return this.sphere.position;
      },

      getRotation: function() {
        return this.sphere.rotation;
      },

      updatePosRot: function(pos, rot) {
        this.sphere.position = pos;
        this.sphere.rotation = rot;
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var i = 1; i < this.rows - 1; i++) {
            var yAngle = (i / (this.rows - 1)) * Math.PI;
            for (var j = 0; j < this.columns; j++) {
              var xzAngle = (j / this.columns) * 2 * Math.PI;
              var x = this.sphere.radius * Math.sin(yAngle) * Math.cos(xzAngle);
              var y = -this.sphere.radius * Math.cos(yAngle);
              var z = this.sphere.radius * Math.sin(yAngle) * Math.sin(xzAngle);
              vertices.push(x, y, z);
            }
          }
          vertices.push(0.0, -this.sphere.radius, 0.0);
          vertices.push(0.0, this.sphere.radius, 0.0);
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
        }
      },

      getIndexData: function() {
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
      },

      getNumItems: function() {
        return 2 * this.columns * (2 * this.rows - 3);
      }
    });
  }
);
