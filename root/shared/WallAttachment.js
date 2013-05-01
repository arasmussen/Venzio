define([
    'basejs',
    'shared/Wall'
  ],
  function(Base, Wall) {
    return Base.extend({
      constructor: function(attachee, terrainManager, wallManager) {
        this.attachee = attachee;
        this.terrainManager = terrainManager;
        this.wallManager = wallManager;
        this.maxDistance = 7.0;

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
        var looking = {
          x: -Math.cos(this.attachee.rotation.pitch) * Math.sin(this.attachee.rotation.yaw),
          y: Math.sin(this.attachee.rotation.pitch),
          z: -Math.cos(this.attachee.rotation.pitch) * Math.cos(this.attachee.rotation.yaw)
        };

        var attacheePosition = {
          x: this.attachee.position.x,
          y: this.attachee.position.y,
          z: this.attachee.position.z
        };
        var terrainHeight = this.terrainManager.getTerrainHeight(this.attachee.position);
        if (terrainHeight > this.attachee.position.y) {
          attacheePosition.y = terrainHeight;
        }

        var interpolate = false;
        for (var distance = 0; distance <= this.maxDistance; distance += 0.1) {
          var terrainHeight = this.terrainManager.getTerrainHeight({
            x: attacheePosition.x + distance * looking.x,
            z: attacheePosition.z + distance * looking.z
          });
          if (terrainHeight > attacheePosition.y + distance * looking.y + 2.0) {
            // wall collides with ground, need to binary search
            interpolate = true;
            break;
          }
        }

        if (interpolate) {
          var lower = distance - 0.1; // not far enough
          var upper = distance; // too far

          while (true) {
            var distance = (lower + upper) / 2.0;
            var terrainHeight = this.terrainManager.getTerrainHeight({
              x: attacheePosition.x + distance * looking.x,
              z: attacheePosition.z + distance * looking.z
            });
            if (attacheePosition.y + distance * looking.y + 2.0 <= terrainHeight) {
              upper = distance;
            } else if (attacheePosition.y + distance * looking.y + 2.0 - terrainHeight <= 0.01) {
              break;
            } else {
              lower = distance;
            }
          }
        } else {
          distance = this.maxDistance;
        }

        this.wall.setPosition({
          x: attacheePosition.x + distance * looking.x,
          y: attacheePosition.y + distance * looking.y + 2.0,
          z: attacheePosition.z + distance * looking.z
        });
        this.wall.setRotation({
          pitch: 0.0,
          yaw: -this.attachee.rotation.yaw
        });
        // this.wallManager.tryToSnapWall(this.wall);

        this.wall.updatePositionData();
      },

      draw: function() {
        this.wall.draw();
      }
    });
  }
);
