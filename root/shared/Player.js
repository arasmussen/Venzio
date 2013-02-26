define([
    'shared/Wall',
    'shared/Globals',
    'basejs'
  ],
  function(Wall, Globals, Base) {
    return Base.extend({
      constructor: function(inputManager, terrainManager) {
        this.rotateSpeed = 1/250;
        this.position = {x: 0.0, y: 10.0, z: 0.0};
        this.velocity = {x: 0.0, y: 0.0, z: 0.0};
        this.rotation = {pitch: 0.0, yaw: 0.0};

        this.desiredVelocity = {x: 0.0, y: 0.0, z: 0.0};

        this.freeFloat = false;
        this.onGround = false;
        this.jump = false;

        this.strafe = 0;
        this.walk = 0;

        this.buildMode = false;
        this.buildObject = new Wall(this, terrainManager);

        this.inputManager = inputManager;

        this.inputManager.subscribe(66, this.toggleBuildMode.bind(this));
        this.inputManager.subscribe(67, this.toggleFreeFloatMode.bind(this));
      },

      handleInput: function() {
        this.handlePositionInput();
        this.handleRotationInput();
        this.handleJumpInput();
      },

      handlePositionInput: function() {
        this.strafe = 0;
        this.walk = 0;

        if (this.inputManager.isLeftPressed()) {
          this.strafe -= 0.5;
        }
        if (this.inputManager.isRightPressed()) {
          this.strafe += 0.5;
        }
        if (this.inputManager.isDownPressed()) {
          this.walk -= 0.5;
        }
        if (this.inputManager.isUpPressed()) {
          this.walk += 0.5;
        }
      },

      handleRotationInput: function() {
        var mouseDelta = this.inputManager.getMouseDelta();
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

      handleJumpInput: function() {
        if (this.onGround && !this.freeFloat) {
          if (this.inputManager.isSpacePressed()) {
            this.jump = true;
          }
        }
      },

      toggleFreeFloatMode: function() {
        this.freeFloat = !this.freeFloat;
      },

      toggleBuildMode: function() {
        this.buildMode = !this.buildMode;
      },

      update: function(tslf) {
        if (this.freeFloat) {
          this.position.x += this.strafe * Math.cos(this.rotation.yaw) +
            Math.cos(this.rotation.pitch) * this.walk * Math.sin(this.rotation.yaw);
          this.position.y -= this.walk * Math.sin(this.rotation.pitch);
          this.position.z += -this.strafe * Math.sin(this.rotation.yaw) +
            Math.cos(this.rotation.pitch) * this.walk * Math.cos(this.rotation.yaw);
          this.desiredVelocity.x = 0.0;
          this.desiredVelocity.y = 0.0;
          this.desiredVelocity.z = 0.0;
        } else {
          this.desiredVelocity.x = this.strafe * Math.cos(this.rotation.yaw) +
              this.walk * Math.sin(this.rotation.yaw);
          this.desiredVelocity.y = 0.0;
          this.desiredVelocity.z = this.walk * Math.cos(this.rotation.yaw) -
              this.strafe * Math.sin(this.rotation.yaw);
          this.desiredVelocity = Globals.normalize(this.desiredVelocity);
          if (this.jump) {
            this.jump = false;
            this.desiredVelocity.y = 12.0;
          }
        }

        if (this.buildMode) {
          this.buildObject.update();
        }
      },

      draw: function() {
        if (this.buildMode) {
          this.buildObject.draw();
        }
      }
    });
  }
);
