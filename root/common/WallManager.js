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
          wall.setBuildable(false);
        } else {
          wall.setBuildable(true);
        }
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
        var sides = wall.getSnapData();
        var bestPosition = {};
        for (var i in candidates) {
          var testWall = candidates[i];
          var testSides = testWall.getSnapData();
          var sideNames = ['left', 'right'];
          for (var j in sideNames) {
            var side1 = sideNames[j];
            for (var k in sideNames) {
              var side2 = sideNames[k];
              var distance = Globals.distance(sides[side1], testSides[side2]);
              if (distance < this.snappingThreshold) {
                var diff = {
                  x: testSides[side2].x - sides[side1].x,
                  z: testSides[side2].z - sides[side1].z
                };
                minDistance = distance;

                var snapPosition = {
                  x: wall.position.x + diff.x,
                  z: wall.position.z + diff.z
                };

                var testHeightOffGround = testWall.position.y - this.terrainManager.getTerrainHeight(testWall.position);
                snapPosition.y = this.terrainManager.getTerrainHeight(snapPosition) + testHeightOffGround;

                if (snap) {
                  if (Globals.distance(bestPosition, snapPosition) <= 0.01) {
                    wall.snappedWalls.push(testWall);
                    continue;
                  }
                }
                snap = true;
                bestPosition.x = snapPosition.x;
                bestPosition.y = snapPosition.y;
                bestPosition.z = snapPosition.z;
                wall.snappedWalls = [testWall];
              }
            }
          }
        }
        if (snap) {
          wall.position.x = bestPosition.x;
          wall.position.y = bestPosition.y;
          wall.position.z = bestPosition.z;
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
