// Copyright (c) Venzio 2013 All Rights Reserved

define(['client/Mesh'], function(Mesh) {
  return Mesh.extend({
    constructor: function() {
      this.base();
    },

    getDrawMode: function() {
      return gl.LINES;
    },

    getShaderName: function() {
      return 'color';
    },

    isUsingIndices: function() {
      return true;
    }
  });
});
