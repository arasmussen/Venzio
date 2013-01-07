function Camera(position) {
  this.rotateSpeed = 1/200;
  this.position = position;
  this.rotation = {pitch: 0, yaw: 0};
}

Camera.prototype.handleInput = function() {
  this.updateRotation();
  this.updatePosition();
};

Camera.prototype.updateRotation = function() {
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
  this.rotation.yaw %= 2 * Math.PI;
};

Camera.prototype.updatePosition = function() {
  var strafe = 0;
  var walk = 0;
  if (input.isKeyPressed(37) || input.isKeyPressed(65)) {
    strafe -= 0.1;
  }
  if (input.isKeyPressed(39) || input.isKeyPressed(68)) {
    strafe += 0.1;
  }
  if (input.isKeyPressed(38) || input.isKeyPressed(87)) {
    walk -= 0.1;
  }
  if (input.isKeyPressed(40) || input.isKeyPressed(83)) {
    walk += 0.1;
  }

  this.position.x += strafe * Math.cos(this.rotation.yaw) -
    Math.cos(this.rotation.pitch) * walk * Math.sin(this.rotation.yaw);
  this.position.y += walk * Math.sin(this.rotation.pitch);
  this.position.z += strafe * Math.sin(this.rotation.yaw) +
    Math.cos(this.rotation.pitch) * walk * Math.cos(this.rotation.yaw);
};

Camera.prototype.transform = function() {
  var translate = [
    -this.position.x,
    -this.position.y,
    -this.position.z
  ];
  mat4.rotate(mvMatrix, -this.rotation.pitch, [1, 0, 0]);
  mat4.rotate(mvMatrix, -this.rotation.yaw, [0, 1, 0]);
  mat4.translate(mvMatrix, translate);
};
