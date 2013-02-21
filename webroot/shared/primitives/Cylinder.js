define(function() {
  return Base.extend({
    constructor: function(bottom, radius, height) {
      this.radius = radius;
      this.height = height;
      this.rows = 5;
      this.columns = 20;
    }
  });
});
