define([
    'client/InputManager',
    'shared/Wall.js',
    'shared/Globals.js',
    'basejs'
  ],
  function(InputManager, Wall, Globals, Base) {
    return Base.extend({
      constructor: function() {
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
        this.buildObject = new Wall(this);

        InputManager.subscribe(66, this.toggleBuildMode.bind(this));
        InputManager.subscribe(67, this.toggleFreeFloatMode.bind(this));
      },

      handleInput: function() {
        this.handlePositionInput();
        this.handleRotationInput();
        this.handleJumpInput();
      },

      handlePositionInput: function() {
        this.strafe = 0;
        this.walk = 0;

        // i swear i don't just use obscure numbers....
        if (InputManager.isKeyPressed(37) || InputManager.isKeyPressed(65)) {
          this.strafe -= 0.5;
        }
        if (InputManager.isKeyPressed(39) || InputManager.isKeyPressed(68)) {
          this.strafe += 0.5;
        }
        if (InputManager.isKeyPressed(38) || InputManager.isKeyPressed(87)) {
          this.walk -= 0.5;
        }
        if (InputManager.isKeyPressed(40) || InputManager.isKeyPressed(83)) {
          this.walk += 0.5;
        }
      },

      handleRotationInput: function() {
        var mouseDelta = InputManager.getMouseDelta();
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

      toggleFreeFloatMode: function() {
        this.freeFloat = !this.freeFloat;
      },

      handleJumpInput: function() {
        if (this.onGround && !this.freeFloat && InputManager.isKeyPressed(32)) {
          this.jump = true;
        }
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
