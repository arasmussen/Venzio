var Wall = Drawable.extend({
  constructor: function(attachee) {
    this.base(true);
    this.attachee = attachee;
    this.initialize();
  },

  update: function() {
    var yaw = this.attachee.rotation.yaw;
    var yawComponents = {
      x: Math.sin(yaw),
      z: Math.cos(yaw)
    };
    this.position.x = this.attachee.position.x - 5.0 * yawComponents.x;
    this.position.y = this.attachee.position.y;
    this.position.z = this.attachee.position.z - 5.0 * yawComponents.z;
    this.rotation.yaw = yaw;
  },

  getAttributes: function() {
    return ['Position', 'Color'];
  },

  getData: function(attrib) {
    if (attrib == 'Position') {
      return new Float32Array([
        -1.0, 0.0, -0.2,
        -1.0, 0.0, 0.2,
        -1.0, 1.0, -0.2,
        -1.0, 1.0, 0.2,
        1.0, 0.0, -0.2,
        1.0, 0.0, 0.2,
        1.0, 1.0, -0.2,
        1.0, 1.0, 0.2
      ]);
    } else if (attrib == 'Color') {
      return new Float32Array([
        1.0, 0.0, 0.2, 1.0,
        1.0, 0.0, 0.2, 1.0,
        1.0, 1.0, 0.2, 1.0,
        1.0, 1.0, 0.2, 1.0,
        1.0, 0.0, 0.2, 1.0,
        1.0, 0.0, 0.2, 1.0,
        1.0, 1.0, 0.2, 1.0,
        1.0, 1.0, 0.2, 1.0
      ]);
    } else if (attrib == 'index') {
      return new Uint16Array([
        0, 1, 2, 1, 2, 3, // left
        2, 3, 6, 3, 6, 7, // top
        6, 7, 4, 7, 4, 5, // right
        4, 5, 0, 5, 0, 1, // bottom
        0, 2, 4, 2, 4, 6, // front
        1, 3, 5, 3, 5, 7 // back
      ]);
    }
  },

  getNumItems: function() {
    return 36;
  }
});
