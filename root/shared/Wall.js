define([
    'basejs'
  ],
  function(Base) {
    return Base.extend({
      constructor: function(terrainManager, position, rotation) {
        this.terrainManager = terrainManager;

        this.position = position;
        this.rotation = {pitch: 0.0, yaw: 0.0};
        this.yaw = rotation.yaw;

        this.width = 1.0;
        this.depth = 0.1;
        this.height = 1.0;

        this.updatePositionData();
      },

      setPosition: function(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
      },

      setYaw: function(yaw) {
        this.yaw = yaw;
      },

      updatePositionData: function() {
        var width = {
          x: (this.width * Math.cos(this.yaw)) / 2,
          z: (this.width * Math.sin(this.yaw)) / 2
        };
        var depth = {
          x: (this.depth * Math.sin(this.yaw)) / 2,
          z: -(this.depth * Math.cos(this.yaw)) / 2
        };

        var front_left = {
          x: -width.x - depth.x,
          z: -width.z - depth.z
        };
        var front_right = {
          x: width.x - depth.x,
          z: width.z - depth.z
        };
        var back_left = {
          x: -width.x + depth.x,
          z: -width.z + depth.z
        };
        var back_right = {
          x: width.x + depth.x,
          z: width.z + depth.z
        };

        front_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + front_left.x,
          z: this.position.z + front_left.z
        });
        front_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + front_right.x,
          z: this.position.z + front_right.z
        });
        back_left.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + back_left.x,
          z: this.position.z + back_left.z
        });
        back_right.y = this.terrainManager.getTerrainHeight({
          x: this.position.x + back_right.x,
          z: this.position.z + back_right.z
        });

        this.positionData = new Float32Array([
          front_left.x, front_left.y, front_left.z,
          back_left.x, back_left.y, back_left.z,
          front_left.x, front_left.y + this.height, front_left.z,
          back_left.x, back_left.y + this.height, back_left.z,
          front_right.x, front_right.y, front_right.z,
          back_right.x, back_right.y, back_right.z,
          front_right.x, front_right.y + this.height, front_right.z,
          back_right.x, back_right.y + this.height, back_right.z
        ]);
      }
    });
  }
);
