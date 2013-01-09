// a singleton until i figure out something better to do with it

var PhysicsManager = {
  moveSpeed: 20.0,

  // holy shit break this up into multiple functions PLEASE
  movePlayer: function(player, tslf) {
    var terrainHeight = TerrainManager.getTerrainHeight(player.position);

    // you fucked up somewhere last frame and are now below ground level
    if (player.position.y <= terrainHeight) {
      player.velocity.y = 0;
      player.position.y = terrainHeight + 0.0005;
    }

    if (player.position.y - 0.001 <= terrainHeight) {
      this.movePlayerOnGround(player, tslf);
    } else {
      this.movePlayerInAir(player, tslf);
    }

    player.position.x += player.velocity.x * tslf;
    player.position.y += player.velocity.y * tslf;
    player.position.z += player.velocity.z * tslf;
  },

  movePlayerOnGround: function(player, tslf) {
    if (player.desiredVelocity.x == 0.0 && player.desiredVelocity.z == 0.0) {
      return;
    }

    var lower = null;
    var upper = null;
    var current = 1;
    var testVelocity = {};
    var testPosition = {};
    for (var i = 0; i < 10; i++) {
      testVelocity.x = player.desiredVelocity.x * current,
      testVelocity.z = player.desiredVelocity.z * current
      testPosition.x = player.position.x + testVelocity.x * tslf,
      testPosition.z = player.position.z + testVelocity.z * tslf
      testPosition.y = TerrainManager.getTerrainHeight(testPosition) + 0.0005

      var distance = Math.distance(testPosition, player.position);
      if (Math.floatEquals(distance, this.moveSpeed * tslf, 0.002)) {
        break;
      }

      var ratio = this.moveSpeed * tslf / distance;
      if (distance > this.moveSpeed * tslf) {
        if (upper == null || upper > current) {
          upper = current;
        }
        if (lower == null || current * ratio >= lower) {
          current *= ratio; // try to interpolate
        } else {
          current = (current + lower) / 2; // else binary search
        }
      } else {
        if (lower == null || lower < current) {
          lower = current;
        }
        if (upper == null || current * ratio <= upper) {
          current *= ratio; // try to interpolate;
        } else {
          current = (current + upper) / 2; // else binary search
        }
      }
    }
    player.velocity.x = testVelocity.x;
    player.velocity.y = (1 / tslf) * (testPosition.y - player.position.y),
    player.velocity.z = testVelocity.z;
  },

  movePlayerInAir: function(player, tslf) {
    player.velocity.y -= 2;

    var testPosition = {}
    testPosition.x = player.position.x + player.velocity.x * tslf,
    testPosition.y = player.position.y + player.velocity.y * tslf,
    testPosition.z = player.position.z + player.velocity.z * tslf
    var terrainHeight = TerrainManager.getTerrainHeight(testPosition) + 0.0005;

    if (testPosition.y < terrainHeight) {
      for (var i = 0; i < 10; i++) {
        var ratio = (player.position.y - terrainHeight) /
          (player.position.y - testPosition.y);
        player.velocity.x *= ratio;
        player.velocity.y *= ratio;
        player.velocity.z *= ratio;

        testPosition.x = player.position.x + player.velocity.x * tslf,
        testPosition.y = player.position.y + player.velocity.y * tslf,
        testPosition.z = player.position.z + player.velocity.z * tslf
        terrainHeight = TerrainManager.getTerrainHeight(testPosition) + 0.0005;

        if (Math.floatEquals(testPosition.y, terrainHeight, 0.00025)) {
          break;
        }
      }
    }
  }
};
