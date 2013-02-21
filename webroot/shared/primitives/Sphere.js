define(function() {
  return Shape.extend({
    constructor: function(center, radius) {
      this.radius = radius;
      this.rows = 12;
      this.columns = 20;
    }
  });  
});
