var Capsule = Base.extend({
  constructor: function(cylinderBottom, radius, cylinderHeight) {
    var cylinderTop = {
      x: cylinderBottom.x,
      y: cylinderBottom.y + cylinderHeight,
      z: cylinderBottom.z
    };

    this.cylinder = new Cylinder(cylinderBottom, radius, cylinderHeight);
    this.bottomSphere = new Sphere(cylinderBottom, radius);
    this.topSphere = new Sphere(cylinderTop, radius);

    this.radius = radius;
    this.height = height;
  },

  initialize: function() {
    this.cylinder.initialize();
    this.bottomSphere.initialize();
    this.topSphere.initialize();
  },

  draw: function() {
    this.cylinder.draw();
    this.bottomSphere.draw();
    this.topSphere.draw();
  }
});
