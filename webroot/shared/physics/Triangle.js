define([
    'shared/physics/Shape'
  ],
  function(Shape) {
    return Shape.extend({
      constructor: function(p1, p2, p3) {
        this.base();
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
      }
    });
  }
);
