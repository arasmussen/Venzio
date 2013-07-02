// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/Wall',
    'common/Globals'
  ],
  function(Base, Wall, Globals) {
    return Base.extend({
      constructor: function(attachee, terrainManager, wallManager) {
        this.attachee = attachee;
        this.terrainManager = terrainManager;
        this.wallManager = wallManager;

        this.maxDistance = Globals.buildDistance;

        this.newWall();
        this.update();
      },

      newWall: function() {
        this.wall = new Wall(this.terrainManager, {x: 0.0, y: 0.0, z: 0.0}, {pitch: 0.0, yaw: 0.0});
      },

      build: function() {
        // do not build the wall if it collides with another wall
        if (!this.wallManager.checkBuildability(this.wall)) {
          return;
        }

        this.wall.setBuilt(true);
        this.wallManager.add(this.wall);
        this.newWall();
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
        for (var i = 0; i <= 100; i++) {
          var distance = this.maxDistance * i / 100;
          terrainHeight = this.terrainManager.getTerrainHeight({
            x: attacheePosition.x + distance * looking.x,
            z: attacheePosition.z + distance * looking.z
          });
          if (terrainHeight > attacheePosition.y + distance * looking.y + 2.0 - Globals.walls.height / 2.0) {
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
            if (attacheePosition.y + distance * looking.y + 2.0 - Globals.walls.height / 2.0 <= terrainHeight) {
              upper = distance;
            } else if (attacheePosition.y + distance * looking.y + 2.0 - Globals.walls.height / 2.0 - terrainHeight <= 0.001) {
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
          y: attacheePosition.y + distance * looking.y + 2.0 - Globals.walls.height / 2.0,
          z: attacheePosition.z + distance * looking.z
        });
        this.wall.setRotation({
          pitch: 0.0,
          yaw: -this.attachee.rotation.yaw
        });

        this.wallManager.snapWall(this.wall);
        this.wall.setBuildable(this.wallManager.checkBuildability(this.wall));

        this.wall.updatePositionData();
      },

      draw: function() {
        this.wall.draw();
      }
    });
  }
);
