define(['client/Drawable'], function(Drawable) {
  return Drawable.extend({
    getDrawMode: function() {
      return gl.LINES;
    },

    isUsingIndices: function() {
      return true;
    }
  });
});
