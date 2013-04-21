define([
    'basejs'
  ],
  function(Base) {
    return Base.extend({
      constructor: function(attachee, terrainManager, wallManager) {
        this.attachee = attachee;
        this.terrainManager = terrainManager;
        this.wallManager = wallManager;
        this.distance = 5.0;

        this.getNewWall();
        this.update();
      },

      getNewWall: function() {
        this.wall = this.getWall(this.terrainManager);
      },

      getWall: function(terrainManager) {
        return new Wall(terrainManager, {x: 0.0, y: 0.0, z: 0.0}, {pitch: 0.0, yaw: 0.0});
      },

      update: function() {
        var yawComponent = {
          x: Math.sin(this.attachee.rotation.yaw),
          z: Math.cos(this.attachee.rotation.yaw)
        };
        this.wall.setPosition(
          this.attachee.position.x - this.distance * yawComponent.x,
          0.0,
          this.attachee.position.z - this.distance * yawComponent.z
        );
        this.wall.setYaw(-this.attachee.rotation.yaw);
        this.wallManager.tryToSnapWall(this.wall);

        this.wall.updatePositionData();
      },

      draw: function() {
        this.wall.draw();
      }
    });
  }
);
