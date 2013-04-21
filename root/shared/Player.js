define([
    'shared/WallAttachment',
    'shared/InputGlobals',
    'shared/Globals',
    'basejs'
  ],
  function(Wall, InputGlobals, Globals, Base) {
    return Base.extend({
      constructor: function(inputManager, terrainManager, wallManager) {
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

        var attachmentType = this.getAttachmentType();
        this.buildObject = new attachmentType(this, terrainManager, wallManager);
        this.buildMode = false;

        this.wallManager = wallManager;
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

      getAttachmentType: function() {
        return WallAttachment;
      },

      handleInput: function() {
        this.inputManager.update();

        this.handlePositionInput();
        this.handleRotationInput();
        this.handleJumpInput();
        this.handleBuildInput();
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

      handleBuildInput: function() {
        var mouseClicks = this.inputManager.getMouseClicks();
        if (this.buildMode && mouseClicks > 0) {
          this.build();
        }
      },

      toggleFreeFloatMode: function() {
        this.freeFloat = !this.freeFloat;
      },

      toggleBuildMode: function() {
        this.buildMode = !this.buildMode;
      },

      build: function() {
        this.wallManager.add(this.buildObject.wall);
        this.buildObject.getNewWall();
      },

      getState: function() {
        return (
          0x0001 * this.buildMode +
          0x0002 * this.freeFloat +
          0x0004 * this.onGround
        );
      },

      update: function(tslf) {
        this.desiredVelocity.x = this.strafe * Math.cos(this.rotation.yaw) +
          Math.cos(this.rotation.pitch) * this.walk * Math.sin(this.rotation.yaw);
        this.desiredVelocity.z = -this.strafe * Math.sin(this.rotation.yaw) +
          Math.cos(this.rotation.pitch) * this.walk * Math.cos(this.rotation.yaw);
        if (this.freeFloat) {
          this.desiredVelocity.y = -this.walk * Math.sin(this.rotation.pitch);
          this.desiredVelocity.x *= 10;
          this.desiredVelocity.y *= 10;
          this.desiredVelocity.z *= 10;
        } else {
          this.desiredVelocity.y = 0.0;
          this.desiredVelocity = Globals.normalize(this.desiredVelocity);
          if (this.jump) {
            this.jump = false;
            this.desiredVelocity.y = 12.0;
          }
        }

        if (this.buildMode) {
          this.buildObject.update();
        }
      }
    });
  }
);
