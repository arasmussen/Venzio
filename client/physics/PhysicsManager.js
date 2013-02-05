// a singleton until i figure out something better to do with it

var PhysicsManager = {
  moveSpeed: 5.0,

  movePlayer: function(player, tslf) {
    var terrainHeight = TerrainManager.getTerrainHeight(player.position);

    if (player.position.y <= terrainHeight) {
      player.velocity.y = 0;
      player.position.y = terrainHeight + 0.0005;
    }

    if (player.onGround && player.position.y - 0.001 <= terrainHeight) {
      if (player.desiredVelocity.y > 0.0) {
        player.velocity.x = this.moveSpeed * player.desiredVelocity.x;
        player.velocity.y = player.desiredVelocity.y;
        player.velocity.z = this.moveSpeed * player.desiredVelocity.z;
        this.movePlayerInAir(player, tslf);
      } else {
        this.movePlayerOnGround(player, tslf);
      }
    } else {
      this.movePlayerInAir(player, tslf);
    }

    player.position.x += player.velocity.x * tslf;
    player.position.y += player.velocity.y * tslf;
    player.position.z += player.velocity.z * tslf;
  },

  jumpPlayer: function(player, tslf) {
  },

  movePlayerOnGround: function(player, tslf) {
    player.onGround = true;
    if (player.desiredVelocity.x == 0.0 && player.desiredVelocity.z == 0.0) {
      player.velocity.x = 0.0;
      player.velocity.y = 0.0;
      player.velocity.z = 0.0;
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
      if (Math.floatEquals(distance, this.moveSpeed * tslf, 0.001)) {
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
    player.onGround = false;
    player.velocity.y -= 32.17 * tslf;

    var testPosition = {
      x: player.position.x + player.velocity.x * tslf,
      y: player.position.y + player.velocity.y * tslf,
      z: player.position.z + player.velocity.z * tslf
    };
    var terrainHeight = TerrainManager.getTerrainHeight(testPosition) + 0.0005;

    // if hit ground
    if (testPosition.y < terrainHeight) {
      player.onGround = true;

      // do a binary search to see where they hit
      var lower = 0;
      var upper = 1;
      var current = 0.5;
      var testVelocity = {};
      for (var i = 0; i < 10; i++) {
        testVelocity.x = player.velocity.x * current;
        testVelocity.y = player.velocity.y * current;
        testVelocity.z = player.velocity.z * current;
        testPosition.x = player.position.x + testVelocity.x * tslf;
        testPosition.y = player.position.y + testVelocity.y * tslf;
        testPosition.z = player.position.z + testVelocity.z * tslf;
        terrainHeight = TerrainManager.getTerrainHeight(testPosition);

        if (Math.floatEquals(testPosition.y, terrainHeight + 0.0005, 0.00025)) {
          player.velocity.x = testVelocity.x;
          player.velocity.y = testVelocity.y;
          player.velocity.z = testVelocity.z;
          return;
        } else if (testPosition.y < terrainHeight + 0.00025) {
          lower = current;
          current = (current + upper) / 2;
        } else {
          upper = current;
          current = (current + lower) / 2;
        }
      }
    }
  }
};