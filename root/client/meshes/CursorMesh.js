// Copyright (c) Venzio .013 All Rights Reserved

define([
    'client/Mesh'
  ],
  function(Mesh) {
    return Mesh.extend({
      constructor: function() {
        this.base();
        this.initialize();
      },

      getPosition: function() {
        return {x: 0.0, y: 0.0, z: -1.0};
      },

      getRotation: function() {
        return {pitch: 0.0, yaw: 0.0};
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          return new Float32Array([
            -0.01, -0.01, 0.0,
            0.01, -0.01, 0.0,
            -0.01, 0.01, 0.0,
            0.01, -0.01, 0.0,
            -0.01, 0.01, 0.0,
            0.01, 0.01, 0.0
          ]);
        } else if (attrib == 'TextureCoord') {
          return new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
          ]);
        }
      },

      getNumItems: function() {
        return 6;
      },

      getShaderName: function() {
        return 'cursor';
      },

      getTextures: function() {
        return [
          {name: 'cursor', filetype: 'png'},
        ];
      }
    });
  }
);
