define([
    'client/Drawable'
  ],
  function(Drawable) {
    return Drawable.extend({
      constructor: function() {
        this.base(true);
      }
    });
  }
);
