define([
    'basejs',
    'shared/Globals'
  ],
  function(Base, Globals) {
    return Base.extend({
      constructor: function() {
        this.walls = [];
        this.snappingThreshold = 0.3;
        this.candidateThreshold = this.snappingThreshold + 1.0;
      },

      add: function(wall) {
        this.walls.push(wall);
      },

      tryToSnapWall: function(wall) {
        var candidates = [];
        for (var i in this.walls) {
          var testWall = this.walls[i];
          if (Globals.distance(wall.position, testWall.position) < this.candidateThreshold) {
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
                  y: testSides[side2].y - sides[side1].y,
                  z: testSides[side2].z - sides[side1].z
                };
                bestPosition.x = wall.position.x + diff.x;
                bestPosition.y = wall.position.y + diff.y;
                bestPosition.z = wall.position.z + diff.z;
                minDistance = distance;
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
