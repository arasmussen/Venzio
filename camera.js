function Camera(position) {
  this.rotateSpeed = 1/200;
  this.position = position;
  this.pitch = 0;
  this.yaw = 0;
}

Camera.prototype.handleInput = function() {
  this.updateRotation();
  this.updatePosition();
}

Camera.prototype.updateRotation = function() {
  var mouseDelta = input.getMouseDelta();
  var prevPitch = this.pitch;
  var prevYaw = this.yaw;
  if (this.pitch + mouseDelta.y * this.rotateSpeed > Math.PI / 2) {
    this.pitch = Math.PI / 2;
  } else if (this.pitch + mouseDelta.y * this.rotateSpeed < - Math.PI / 2) {
    this.pitch = -Math.PI / 2;
  } else {
    this.pitch += mouseDelta.y * this.rotateSpeed;
  }
  this.yaw += mouseDelta.x * this.rotateSpeed;
};

Camera.prototype.updatePosition = function() {
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
};

Camera.prototype.transform = function() {
  var translate = [
    this.position.x,
    this.position.y,
    this.position.z
  ];
  mat4.rotate(mvMatrix, this.pitch, [1, 0, 0]);
  mat4.rotate(mvMatrix, this.yaw, [0, 1, 0]);
  mat4.translate(mvMatrix, translate);
};
