define(['basejs'], function(Base) {
  return Base.extend({
    constructor: function(center, radius) {
      this.position = center;
      this.radius = radius;
    }
  });
});
