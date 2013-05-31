// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/Globals',
    'common/OBBCollide'
  ],
  function(Base, Globals, OBBCollide) {
    return Base.extend({
      constructor: function(terrainManager) {
        this.walls = [];
        this.snappingThreshold = Globals.buildSnapThreshold;
        this.candidateThreshold = this.snappingThreshold + Globals.walls.width + Globals.walls.depth;
        this.terrainManager = terrainManager;
      },

      add: function(wall) {
        this.walls.push(wall);
      },

      collides: function(wall) {
        var vertices = [];
        for (var i in this.walls) {
          if (wall.snappedWalls.indexOf(this.walls[i]) != -1) {
            continue;
          }
          if (Globals.distance(wall.getPositionOffGround(), this.walls[i].getPositionOffGround()) > this.candidateThreshold) {
            continue;
          }
          if (OBBCollide(wall.getPhysicsVertices(), this.walls[i].getPhysicsVertices())) {
            return true;
          }
        }
        return false;
      },

      checkBuildability: function(wall) {
        var onGround = (wall.getPosition().y - this.terrainManager.getTerrainHeight(wall.getPosition()) <= 0.01);
        var isSnapping = (wall.snappedWalls.length > 0);

        if ((!onGround && !isSnapping) || this.collides(wall)) {
          return false;
        }
        return true;
      },

      snapWall: function(wall) {
        var candidates = [];
        for (var i in this.walls) {
          var testWall = this.walls[i];
          if (Globals.distance(wall.getPositionOffGround(), testWall.getPositionOffGround()) < this.candidateThreshold) {
            candidates.push(testWall);
          }
        }

        wall.snappedWalls = [];

        var snap = false;
        var wallSides = wall.getSnapData();
        var bestPosition = {};
        var bestYaw = wall.getYaw();
        var minDistance;
        for (var i in candidates) {
          var testWall = candidates[i];
          var testWallSides = testWall.getSnapData();

          var sides = ['left', 'right'];
          for (var i in sides) {
            var side1 = sides[i];
            for (var j in sides) {
              var side2 = sides[j];

              var distance = Globals.distance(wallSides[side1], testWallSides[side2]);
              if (distance < this.snappingThreshold) {
                var diff = {
                  x: testWallSides[side2].x - wallSides[side1].x,
                  z: testWallSides[side2].z - wallSides[side1].z
                };

                var snapPosition = {
                  x: wall.position.x + diff.x,
                  z: wall.position.z + diff.z
                };

                var heightOffTerrain = testWall.getPosition().y - this.terrainManager.getTerrainHeight(testWall.getPosition());
                snapPosition.y = heightOffTerrain + this.terrainManager.getTerrainHeight(snapPosition);

                if (snap && Globals.distance(bestPosition, snapPosition) <= 0.05) {
                  wall.snappedWalls.push(testWall);
                  continue;
                }

                minDistance = distance;
                snap = true;
                bestPosition.x = snapPosition.x;
                bestPosition.y = snapPosition.y;
                bestPosition.z = snapPosition.z;
                bestYaw = wall.getYaw();
                wall.snappedWalls = [testWall];
              }
            }
          }

          var sides = ['top', 'bottom'];
          for (var i in sides) {
            var side1 = sides[i];
            for (var j in sides) {
              var side2 = sides[j];

              if (side1 == side2) {
                continue;
              }

              var distance = Globals.distance(wallSides[side1], testWallSides[side2]);
              if (distance < this.snappingThreshold) {
                var snapPosition = {
                  x: testWall.position.x,
                  z: testWall.position.z
                };

                // wall being built snaps on bottom side
                if (side1 == 'bottom') {
                  snapPosition.y = testWall.position.y + Globals.walls.height;
                } else {
                  snapPosition.y = testWall.position.y - Globals.walls.height;

                  if (snapPosition.y < this.terrainManager.getTerrainHeight(snapPosition)) {
                    continue;
                  }
                }

                if (snap && Globals.distance(bestPosition, snapPosition) <= 0.05) {
                  wall.snappedWalls.push(testWall);
                  continue;
                }

                minDistance = distance;
                snap = true;
                bestPosition.x = snapPosition.x;
                bestPosition.y = snapPosition.y;
                bestPosition.z = snapPosition.z;
                bestYaw = testWall.getYaw();
                wall.snappedWalls = [testWall];
              }
            }
          }
        }
        if (snap) {
          wall.position.x = bestPosition.x;
          wall.position.y = bestPosition.y;
          wall.position.z = bestPosition.z;
          wall.setRotation({yaw: bestYaw, pitch: 0.0});
          return true;
        }
        return false;
      },

      drawWalls: function() {
        for (var i in this.walls) {
          this.walls[i].draw();
        }
      }
    });
  }
);
