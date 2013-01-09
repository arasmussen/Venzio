// a singleton until i figure out something better to do with it

var PhysicsManager = {
  moveSpeed: 20.0,

  // holy shit break this up into multiple functions PLEASE
  movePlayer: function(player, tslf) {
    var section = TerrainManager.worldToSectionCoords(player.position);
    var terrain = TerrainManager.terrains[section.x][section.z];
    var height = terrain.getHeight(player.position.x, player.position.z);

    // below the ground - should never get here but just in case
    if (player.position.y <= height) {
      // fix this later...
      // debugger;
      player.velocity.y = 0;
      player.position.y = height + 0.0005;
    }

    // on ground
    if (player.position.y - 0.001 <= height) {
      if (player.desiredVelocity.x != 0.0 || player.desiredVelocity.z != 0.0) {
        var bottom = 0;
        var top = 0;
        var current = 1;
        // refine velocity by interpolating based on heightmap
        for (var i = 0; i < 10; i++) {
          var testVelocity = {
            x: player.desiredVelocity.x * current,
            z: player.desiredVelocity.z * current
          };
          var newPosition = {
            x: player.position.x + testVelocity.x * tslf,
            z: player.position.z + testVelocity.z * tslf
          };
          var newSection = TerrainManager.worldToSectionCoords(
            newPosition
          );
          var newTerrain = TerrainManager.terrains[newSection.x][newSection.z];
          newPosition.y = newTerrain.getHeight(
            newPosition.x, newPosition.z
          ) + 0.0005;
          var distance = Math.distance(newPosition, player.position);

          // acceptable distance
          if (Math.floatEquals(distance, this.moveSpeed * tslf, 0.002)) {
            player.desiredVelocity = {
              x: testVelocity.x,
              y: (1 / tslf) * (newPosition.y - player.position.y),
              z: testVelocity.z
            };
            break;
          }

          var ratio = this.moveSpeed * tslf / distance;
          if (distance > this.moveSpeed * tslf) {
            // too far
            if (top == 0 || top > current) {
              top = current;
            }

            if (current * ratio < bottom && bottom != 0) {
              current = (current + bottom) / 2;
            } else {
              current *= ratio;
            }
          } else {
            // not far enough
            if (bottom == 0 || bottom < current) {
              bottom = current;
            }

            if (current * ratio > top && top != 0) {
              current = (current + top) / 2;
            } else {
              current *= ratio;
            }
          }
        }
      }
      player.velocity = {
        x: player.desiredVelocity.x,
        y: player.desiredVelocity.y,
        z: player.desiredVelocity.z
      };
    } else {
      player.velocity.y -= 2;

      var newPosition = {
        x: player.position.x + player.velocity.x * tslf,
        y: player.position.y + player.velocity.y * tslf,
        z: player.position.z + player.velocity.z * tslf
      };
      var newSection = TerrainManager.worldToSectionCoords(
        newPosition
      );
      var newTerrain = TerrainManager.terrains[newSection.x][newSection.z];
      var newHeight = newTerrain.getHeight(
        newPosition.x, newPosition.z
      ) + 0.0005;

      // hit ground
      if (newPosition.y < newHeight) {
        for (var i = 0; i < 10; i++) {
          var ratio = (player.position.y - newHeight) /
            (player.position.y - newPosition.y);
          player.velocity.x *= ratio;
          player.velocity.y *= ratio;
          player.velocity.z *= ratio;

          newPosition = {
            x: player.position.x + player.velocity.x * tslf,
            y: player.position.y + player.velocity.y * tslf,
            z: player.position.z + player.velocity.z * tslf
          };
          newSection = TerrainManager.worldToSectionCoords(
            newPosition
          );
          newTerrain = TerrainManager.terrains[newSection.x][newSection.z];
          newHeight = newTerrain.getHeight(
            newPosition.x, newPosition.z
          ) + 0.0005;

          if (Math.floatEquals(newPosition.y, newHeight, 0.00025)) {
            break;
          }
        }
      }
    }

    player.position.x += player.velocity.x * tslf;
    player.position.y += player.velocity.y * tslf;
    player.position.z += player.velocity.z * tslf;
  }
};
