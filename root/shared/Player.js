define([
    'shared/Wall',
    'shared/InputGlobals',
    'shared/Globals',
    'basejs'
  ],
  function(Wall, InputGlobals, Globals, Base) {
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

        this.inputManager.subscribe(
          InputGlobals.TOGGLE_BUILD,
          this.toggleBuildMode.bind(this)
        );
        this.inputManager.subscribe(
          InputGlobals.TOGGLE_CAMERA,
          this.toggleFreeFloatMode.bind(this)
        );
      },

      handleInput: function() {
        this.inputManager.update();

        this.handlePositionInput();
        this.handleRotationInput();
        this.handleJumpInput();
      },

      handlePositionInput: function() {
        this.strafe = 0;
        this.walk = 0;

        if (this.inputManager.isPressed(InputGlobals.LEFT)) {
          this.strafe -= 0.5;
        }
        if (this.inputManager.isPressed(InputGlobals.RIGHT)) {
          this.strafe += 0.5;
        }
        if (this.inputManager.isPressed(InputGlobals.DOWN)) {
          this.walk -= 0.5;
        }
        if (this.inputManager.isPressed(InputGlobals.UP)) {
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
          if (this.inputManager.isPressed(InputGlobals.SPACE)) {
            this.jump = true;
          }
        }
      },

      toggleFreeFloatMode: function() {
        console.log('hereherehere');
        this.freeFloat = !this.freeFloat;
      },

      toggleBuildMode: function() {
        this.buildMode = !this.buildMode;
      },

      getState: function() {
        return (
          0x0001 * this.buildMode +
          0x0002 * this.freeFloat
        );
      },

      update: function(tslf) {
        // TODO: the freefloat stuff really needs to be moved INTO the physics
        // manager
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
