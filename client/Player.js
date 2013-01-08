var Player = Base.extend({
  constructor: function() {
    this.rotateSpeed = 1/200;
    this.position = {x: 0.0, y: 10.0, z: 0.0};
    this.rotation = {pitch: 0.0, yaw: 0.0};
  },

  update: function(tslf) {
    this.updateRotation();
    this.updatePosition(tslf);
  },

  updateRotation: function() {
    var mouseDelta = input.getMouseDelta();
    var newPitch = this.rotation.pitch - mouseDelta.y * this.rotateSpeed;
    if (newPitch > Math.PI / 2) {
      this.rotation.pitch = Math.PI / 2;
    } else if (newPitch < -Math.PI / 2) {
      this.rotation.pitch = -Math.PI / 2;
    } else {
      this.rotation.pitch = newPitch;
    }
    this.rotation.yaw -= mouseDelta.x * this.rotateSpeed;
  },

  updatePosition: function(tslf) {
    var strafe = 0;
    var walk = 0;
    if (input.isKeyPressed(37) || input.isKeyPressed(65)) {
      strafe -= 1;
    }
    if (input.isKeyPressed(39) || input.isKeyPressed(68)) {
      strafe += 1;
    }
    if (input.isKeyPressed(38) || input.isKeyPressed(87)) {
      walk -= 1;
    }
    if (input.isKeyPressed(40) || input.isKeyPressed(83)) {
      walk += 1;
    }

    this.position.x += strafe * Math.cos(this.rotation.yaw) +
      Math.cos(this.rotation.pitch) * walk * Math.sin(this.rotation.yaw);
    this.position.y -= walk * Math.sin(this.rotation.pitch);
    this.position.z += - strafe * Math.sin(this.rotation.yaw) +
      Math.cos(this.rotation.pitch) * walk * Math.cos(this.rotation.yaw);
  }
});
