// a singleton until i figure out something better to do with it

var PhysicsManager = {
  movePlayer: function(player, tslf) {
    var section = TerrainManager.worldToSectionCoords(player.position);
    var terrain = TerrainManager.terrains[section.x][section.z];
    var height = terrain.getHeight(player.position.x, player.position.z);

    if (player.position.y <= height) { // under ground
      player.velocity.y = 0;
      player.position.y = height + 0.0005;
    }

    if (player.position.y - 0.001 <= height) { // on ground
      player.velocity = player.desiredVelocity;
    } else {
      player.velocity.y -= 0.016;
    }

    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.position.z += player.velocity.z;
  }
};
