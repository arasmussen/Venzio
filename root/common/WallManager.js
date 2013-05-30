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
          if (OBBCollide(wall.getPhysicsVertices(), this.walls[i].getPhysicsVertices())) {
            return true;
          }
        }
        return false;
      },

      tryToSnapWall: function(wall) {
        var candidates = [];
        for (var i in this.walls) {
          var testWall = this.walls[i];
          if (Globals.distance(wall.getPositionOffGround(), testWall.getPositionOffGround()) < this.candidateThreshold) {
            candidates.push(testWall);
          }
        }

        var bestPosition = {
          x: wall.position.x,
          y: wall.position.y,
          z: wall.position.z
        };
        var sides = wall.getSnapData();
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

                bestPosition.x = wall.position.x + diff.x;
                bestPosition.z = wall.position.z + diff.z;

                var testHeightOffGround = testWall.position.y - this.terrainManager.getTerrainHeight(testWall.position);
                bestPosition.y = this.terrainManager.getTerrainHeight(bestPosition) + testHeightOffGround;
              }
            }
          }
        }
        wall.position.x = bestPosition.x;
        wall.position.y = bestPosition.y;
        wall.position.z = bestPosition.z;
      },

      drawWalls: function() {
        for (var i in this.walls) {
          this.walls[i].draw();
        }
      }
    });
  }
);
