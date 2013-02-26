define(function() {
  return Shape.extend({
    constructor: function(center, radius) {
      this.position = center;

      this.radius = radius;
    }
  });  
});
