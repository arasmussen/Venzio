// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/Globals',
    'common/OBBCollide',
    'common/WallSnapper'
  ],
  function(Base, Globals, OBBCollide, WallSnapper) {
    return Base.extend({
      constructor: function(terrainManager) {
        this.walls = [];
        this.candidateThreshold = Globals.horizontalSnapThreshold + Globals.walls.width + Globals.walls.depth;
        this.terrainManager = terrainManager;
        this.wallSnapper = new WallSnapper(this.terrainManager);
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

        if (this.wallSnapper.snapWall(wall, candidates)) {
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
