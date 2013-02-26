define(['client/Mesh'], function(Mesh) {
  return Mesh.extend({
    getDrawMode: function() {
      return gl.LINES;
    },

    isUsingIndices: function() {
      return true;
    }
  });
});
