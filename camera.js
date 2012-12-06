var camera = {
  position: {x: 0.0, y: 0.0, z: -5.0},
  pitch: 0,
  yaw: 0,

  handleInput: function() {
    var mouseDelta = input.getMouseDelta();
    this.pitch += mouseDelta.y / 180;
    this.yaw += mouseDelta.x / 180;

    var strafe = 0;
    var walk = 0;
    if (input.isKeyPressed(37) || input.isKeyPressed(65)) {
      strafe += 0.1;
    }
    if (input.isKeyPressed(39) || input.isKeyPressed(68)) {
      strafe -= 0.1;
    }
    if (input.isKeyPressed(38) || input.isKeyPressed(87)) {
      walk += 0.1;
    }
    if (input.isKeyPressed(40) || input.isKeyPressed(83)) {
      walk -= 0.1;
    }

    this.position.x += strafe * Math.cos(this.yaw) - walk * Math.sin(this.yaw);
    this.position.y += walk * Math.sin(this.pitch);
    this.position.z += Math.cos(this.pitch) * (
      walk * Math.cos(this.yaw) + strafe * Math.sin(this.yaw)
    );
  },

  transform: function(matrix) {
    var translate = [
      this.position.x,
      this.position.y,
      this.position.z
    ];
    mat4.rotate(mvMatrix, this.pitch, [1, 0, 0]);
    mat4.rotate(mvMatrix, this.yaw, [0, 1, 0]);
    mat4.translate(mvMatrix, translate);
  }
};
