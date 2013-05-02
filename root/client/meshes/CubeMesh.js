// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/Mesh.js'
  ],
  function(Mesh) {
    return Mesh.extend({
      constructor: function(position, rotation) {
        this.base();
        this.position = position;
        this.rotation = rotation;
        this.initialize();
      },

      getPosition: function() {
        return this.position;
      },

      getRotation: function() {
        return this.rotation;
      },

      getAttributes: function() {
        return ['Position', 'Color'];
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          return new Float32Array([
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5
          ]);
        } else if (attrib == 'Color') {
          return new Float32Array([
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 1.0, 1.0
          ]);
        } else if (attrib == 'index') {
          return new Uint16Array([
            0, 1, 2, 1, 2, 3, // left
            2, 3, 6, 3, 6, 7, // top
            6, 7, 4, 7, 4, 5, // right
            4, 5, 0, 5, 0, 1, // bottom
            0, 2, 4, 2, 4, 6, // front
            1, 3, 5, 3, 5, 7 // back
          ]);
        }
      },

      getNumItems: function() {
        return 36;
      },

      isUsingIndices: function() {
        return true;
      }
    });
  }
);
