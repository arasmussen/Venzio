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
    this.height = cylinderHeight;

    this.initialize();
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
  },

  updatePosRot: function(pos, rot) {
    var bottom = {
      x: pos.x,
      y: pos.y + this.radius,
      z: pos.z
    };
    var top = {
      x: pos.x,
      y: pos.y + this.radius + this.height,
      z: pos.z
    };
    this.cylinder.position = bottom;
    this.bottomSphere.position = bottom;
    this.topSphere.position = top;

    this.cylinder.rotation.yaw = rot.yaw;
    this.bottomSphere.rotation.yaw = rot.yaw;
    this.topSphere.rotation.yaw = rot.yaw;
  }
});