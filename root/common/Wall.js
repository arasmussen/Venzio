// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/assert'
  ],
  function(Base, assert) {
    return Base.extend({
      // position is the center of the bottom face of the wall
      // therefore its y should be above the terrain for those x/z coordinates
      constructor: function(terrainManager, position, rotation) {
        this.terrainManager = terrainManager;

        this.position = {};
        this.rotation = {pitch: 0.0, yaw: 0.0};

        this.setPosition(position);
        this.setRotation(rotation);

        this.updatePositionData();
      },

      setPosition: function(position) {
        this.position.x = position.x;
        this.position.y = position.y;
        this.position.z = position.z;
      },

      setRotation: function(rotation) {
        this.yaw = rotation.yaw;
        this.pitch = rotation.pitch;
      },

      getSnapData: function() {
        var width = {
          x: (this.width * Math.cos(this.yaw)) / 2,
          z: (this.width * Math.sin(this.yaw)) / 2
        };
        return {
          left: {
            x: this.position.x - width.x,
            y: this.position.y + this.height / 2.0,
            z: this.position.z - width.z
          },
          right: {
            x: this.position.x + width.x,
            y: this.position.y + this.height / 2.0,
            z: this.position.z + width.z
          }
        };
      },

      updatePositionData: function() {
        var terrainHeight = this.terrainManager.getTerrainHeight(this.position);
        assert(this.position.y >= terrainHeight, "built a wall below terrain level");

        var width = 1.0;
        var depth = 0.1;
        var height = 1.0;

        var widthComponents = {
          x: (width * Math.cos(this.yaw)) / 2.0,
          z: (width * Math.sin(this.yaw)) / 2.0
        };
        var depthComponents = {
          x: (depth * Math.sin(this.yaw)) / 2.0,
          z: (depth * -Math.cos(this.yaw)) / 2.0
        };

        var front_left = {
          x: -widthComponents.x - depthComponents.x,
          z: -widthComponents.z - depthComponents.z
        };
        var front_right = {
          x: widthComponents.x - depthComponents.x,
          z: widthComponents.z - depthComponents.z
        };
        var back_left = {
          x: -widthComponents.x + depthComponents.x,
          z: -widthComponents.z + depthComponents.z
        };
        var back_right = {
          x: widthComponents.x + depthComponents.x,
          z: widthComponents.z + depthComponents.z
        };

        front_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + front_left.x,
          z: this.position.z + front_left.z
        }) - terrainHeight;
        front_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + front_right.x,
          z: this.position.z + front_right.z
        }) - terrainHeight;
        back_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + back_left.x,
          z: this.position.z + back_left.z
        }) - terrainHeight;
        back_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + back_right.x,
          z: this.position.z + back_right.z
        }) - terrainHeight;

        this.positionData = new Float32Array([
          front_left.x, front_left.y, front_left.z,
          back_left.x, back_left.y, back_left.z,
          front_left.x, front_left.y + height, front_left.z,
          back_left.x, back_left.y + height, back_left.z,
          front_right.x, front_right.y, front_right.z,
          back_right.x, back_right.y, back_right.z,
          front_right.x, front_right.y + height, front_right.z,
          back_right.x, back_right.y + height, back_right.z
        ]);
      }
    });
  }
);
