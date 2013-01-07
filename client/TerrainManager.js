function TerrainManager() {
  this.terrains = {};

  for (var x = -1; x <= 1; x++) {
    for (var z = -1; z <= 1; z++) {
      this.createTerrain(x, z);
    }
  }
}

TerrainManager.prototype.createTerrain = function(x, z) {
  if (this.terrains[x] == null) {
    this.terrains[x] = {};
  }
  if (this.terrains[x][z] == null) {
    var position = {x: x * terrainLength, y: 0, z: z * terrainLength};
    this.terrains[x][z] = new Terrain(position);
  }
};

TerrainManager.prototype.update = function(playerPos) {
  var section = this.worldToSectionCoords(playerPos);
  for (var x = section.x - 1; x <= section.x + 1; x++) {
    for (var z = section.z - 1; z <= section.z + 1; z++) {
      if (this.terrains[x] == null) {
        this.terrains[x] = {};
      }
      if (this.terrains[x][z] == null) {
        this.createTerrain(x, z);
      }
    }
  }
};

TerrainManager.prototype.draw = function(playerPos) {
  var section = this.worldToSectionCoords(playerPos);
  for (var x = section.x - 1; x <= section.x + 1; x++) {
    for (var z = section.z - 1; z <= section.z + 1; z++) {
      this.terrains[x][z].draw();
    }
  }
};

TerrainManager.prototype.worldToSectionCoords = function(worldPos) {
  return {
    x: Math.floor((worldPos.x + terrainLength / 2) / terrainLength),
    z: Math.floor((worldPos.z + terrainLength / 2) / terrainLength)
  };
};
