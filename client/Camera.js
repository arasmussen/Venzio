var Camera = Base.extend({
  constructor: function(attachee) {
    this.attachee = attachee;
    this.position = attachee.position;
    this.rotation = attachee.rotation;
    this.rotateSpeed = 1/200;
  },

  update: function() {
    this.position = this.attachee.position;
    this.rotation = this.attachee.rotation;
  },

  transform: function() {
    var translate = [
      -this.position.x,
      -this.position.y,
      -this.position.z
    ];
    mat4.rotate(mvMatrix, -this.rotation.pitch, [1, 0, 0]);
    mat4.rotate(mvMatrix, -this.rotation.yaw, [0, 1, 0]);
    mat4.translate(mvMatrix, translate);
  },

  untransform: function() {
    var translate = [
      this.position.x,
      this.position.y,
      this.position.z
    ];
    mat4.translate(mvMatrix, translate);
    mat4.rotate(mvMatrix, this.rotation.yaw, [0, 1, 0]);
    mat4.rotate(mvMatrix, this.rotation.pitch, [1, 0, 0]);
  }
});
