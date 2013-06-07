// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/Globals'
  ],
  function(Base, Globals) {
    return Base.extend({
      constructor: function(terrainManager) {
        this.terrainManager = terrainManager;
      },

      snapWall: function(wall, candidates) {
        this.wall = wall;
        this.wall.sides = wall.getSnapData();
        this.wall.snappedWalls = [];

        this.bestPosition = {};
        this.bestRotation = {yaw: this.wall.getYaw(), pitch: 0.0};

        // get side data
        for (var i in candidates) {
          if (candidates[i].sides === undefined) {
            candidates[i].sides = candidates[i].getSnapData();
          }
        }

        // find vertical snaps
        for (var i in candidates) {
          this.checkVerticalSnaps(candidates[i]);
        }

        // if we found vertical snaps, update our position.
        // now find horizontal snaps that work with this position.
        if (this.foundSnaps()) {
          this.wall.setPosition(this.bestPosition);
          this.wall.setRotation(this.bestRotation);
          this.wall.sides = wall.getSnapData();

          for (var i in candidates) {
            this.checkHorizontalSnaps(candidates[i], {moveWall: false});
          }
        } else {
          // otherwise try to snap to horizontal stuff
          for (var i in candidates) {
            this.checkHorizontalSnaps(candidates[i], {moveWall: true});
          }

          if (this.foundSnaps()) {
            this.wall.setPosition(this.bestPosition);
            this.wall.setRotation(this.bestRotation);
            this.wall.sides = wall.getSnapData();
          }
        }

        return this.foundSnaps();
      },

      foundSnaps: function() {
        return (this.wall.snappedWalls.length > 0);
      },

      checkHorizontalSnaps: function(candidate, options) {
        var sides = ['left', 'right'];
        for (var i in sides) {
          for (var j in sides) {
            var wallSide = sides[i];
            var candidateSide = sides[j];

            var distance = Globals.distance(this.wall.sides[wallSide], candidate.sides[candidateSide]);

            if (!options.moveWall) {
              if (distance < Globals.snapEpsilon) {
                this.wall.snappedWalls.push(candidate);
                return;
              }
              continue;
            }

            if (distance < Globals.horizontalSnapThreshold) {
              var diff = {
                x: candidate.sides[candidateSide].x - this.wall.sides[wallSide].x,
                z: candidate.sides[candidateSide].z - this.wall.sides[wallSide].z
              };

              var snapPosition = {
                x: this.wall.position.x + diff.x,
                z: this.wall.position.z + diff.z
              };

              var heightOffTerrain = candidate.position.y - this.terrainManager.getTerrainHeight(candidate.position);
              snapPosition.y = heightOffTerrain + this.terrainManager.getTerrainHeight(snapPosition);

              if (this.foundSnaps() && Globals.distance(this.bestPosition, snapPosition) <= 0.05) {
                this.wall.snappedWalls.push(candidate);
                return;
              }

              this.bestPosition.x = snapPosition.x;
              this.bestPosition.y = snapPosition.y;
              this.bestPosition.z = snapPosition.z;
              this.wall.snappedWalls = [candidate];
              return;
            }
          }
        }
      },

      checkVerticalSnaps: function(candidate) {
        var sides = ['bottom', 'top'];
        for (var i in sides) {
          var wallSide = sides[i];
          var candidateSide = sides[(parseInt(i) + 1) % 2];

          var distance = Globals.distance(this.wall.sides[wallSide], candidate.sides[candidateSide]);
          if (distance < Globals.verticalSnapThreshold) {
            var snapPosition = {
              x: candidate.position.x,
              z: candidate.position.z
            };

            if (wallSide == 'bottom') {
              snapPosition.y = candidate.position.y + Globals.walls.height + 0.0001;
            } else {
              snapPosition.y = candidate.position.y - Globals.walls.height - 0.0001;

              if (snapPosition.y < this.terrainManager.getTerrainHeight(snapPosition)) {
                continue;
              }
            }

            if (this.foundSnaps() && Globals.distance(this.bestPosition, snapPosition) <= Globals.snapEpsilon) {
              this.bestPosition.x = snapPosition.x;
              this.bestPosition.y = snapPosition.y;
              this.bestPosition.z = snapPosition.z;
              this.bestRotation.yaw = candidate.getYaw();
              this.wall.snappedWalls.push(candidate);
              continue;
            }

            this.bestPosition.x = snapPosition.x;
            this.bestPosition.y = snapPosition.y;
            this.bestPosition.z = snapPosition.z;
            this.bestRotation.yaw = candidate.getYaw();
            this.wall.snappedWalls = [candidate];
          }
        }
      }
    });
  }
);
