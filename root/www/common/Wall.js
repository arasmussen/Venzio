// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/lib/first-party/assert',
    'common/Globals'
  ],
  function(Base, assert, Globals) {
    return Base.extend({
      // position is the center of the bottom face of the wall
      // therefore its y should be above the terrain for those x/z coordinates
      constructor: function(terrainManager, position, rotation) {
        this.terrainManager = terrainManager;

        this.position = {};
        this.rotation = {pitch: 0.0, yaw: 0.0};

        this.built = false;

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

      setBuildable: function(buildable) {
        this.buildable = buildable;
      },

      setBuilt: function(built) {
        this.built = built;
      },

      getYaw: function() {
        return this.yaw;
      },

      getPosition: function() {
        return {
          x: this.position.x,
          y: this.position.y,
          z: this.position.z
        };
      },

      getPositionOffGround: function() {
        var terrainHeight = this.terrainManager.getTerrainHeight(this.position);
        return {
          x: this.position.x,
          y: this.position.y - terrainHeight,
          z: this.position.z
        };
      },

      getSnapData: function() {
        var widthComponents = {
          x: (Globals.walls.width * Math.cos(this.yaw)),
          z: (Globals.walls.width * Math.sin(this.yaw))
        };
        var position = this.getPositionOffGround();

        return {
          left: {
            x: position.x - widthComponents.x / 2.0,
            y: position.y + Globals.walls.height / 2.0,
            z: position.z - widthComponents.z / 2.0
          },
          right: {
            x: position.x + widthComponents.x / 2.0,
            y: position.y + Globals.walls.height / 2.0,
            z: position.z + widthComponents.z / 2.0
          },
          bottom: {
            x: position.x,
            y: position.y,
            z: position.z
          },
          top: {
            x: position.x,
            y: position.y + Globals.walls.height,
            z: position.z
          }
        };
      },

      getCorners: function() {
        var width = Globals.walls.width;
        var depth = Globals.walls.depth;

        var widthComponents = {
          x: (width * Math.cos(this.yaw)) / 2.0,
          z: (width * Math.sin(this.yaw)) / 2.0
        };
        var depthComponents = {
          x: (depth * Math.sin(this.yaw)) / 2.0,
          z: (depth * -Math.cos(this.yaw)) / 2.0
        };

        return {
          front_left: {
            x: -widthComponents.x - depthComponents.x,
            z: -widthComponents.z - depthComponents.z
          },
          front_right: {
            x: widthComponents.x - depthComponents.x,
            z: widthComponents.z - depthComponents.z
          },
          back_left: {
            x: -widthComponents.x + depthComponents.x,
            z: -widthComponents.z + depthComponents.z
          },
          back_right: {
            x: widthComponents.x + depthComponents.x,
            z: widthComponents.z + depthComponents.z
          }
        };
      },

      getPhysicsVertices: function() {
        var height = Globals.walls.height;

        var corners = this.getCorners();

        var position = this.getPositionOffGround();

        return [
          {x: position.x + corners.front_left.x,  y: position.y,          z: position.z + corners.front_left.z},
          {x: position.x + corners.back_left.x,   y: position.y,          z: position.z + corners.back_left.z},
          {x: position.x + corners.front_left.x,  y: position.y + height, z: position.z + corners.front_left.z},
          {x: position.x + corners.back_left.x,   y: position.y + height, z: position.z + corners.back_left.z},
          {x: position.x + corners.front_right.x, y: position.y,          z: position.z + corners.front_right.z},
          {x: position.x + corners.back_right.x,  y: position.y,          z: position.z + corners.back_right.z},
          {x: position.x + corners.front_right.x, y: position.y + height, z: position.z + corners.front_right.z},
          {x: position.x + corners.back_right.x,  y: position.y + height, z: position.z + corners.back_right.z}
        ];
      },


      updatePositionData: function() {
        var terrainHeight = this.terrainManager.getTerrainHeight(this.position);
        // assert(this.position.y >= terrainHeight, "built a wall below terrain level");

        var height = Globals.walls.height;

        var corners = this.getCorners();
        corners.front_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + corners.front_left.x,
          z: this.position.z + corners.front_left.z
        }) - terrainHeight;
        corners.front_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + corners.front_right.x,
          z: this.position.z + corners.front_right.z
        }) - terrainHeight;
        corners.back_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + corners.back_left.x,
          z: this.position.z + corners.back_left.z
        }) - terrainHeight;
        corners.back_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + corners.back_right.x,
          z: this.position.z + corners.back_right.z
        }) - terrainHeight;

        this.positionData = new Float32Array([
          corners.front_left.x,  corners.front_left.y,           corners.front_left.z,
          corners.back_left.x,   corners.back_left.y,            corners.back_left.z,
          corners.front_left.x,  corners.front_left.y + height,  corners.front_left.z,
          corners.back_left.x,   corners.back_left.y + height,   corners.back_left.z,
          corners.front_right.x, corners.front_right.y,          corners.front_right.z,
          corners.back_right.x,  corners.back_right.y,           corners.back_right.z,
          corners.front_right.x, corners.front_right.y + height, corners.front_right.z,
          corners.back_right.x,  corners.back_right.y + height,  corners.back_right.z
        ]);
      }
    });
  }
);
