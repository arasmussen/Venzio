// a singleton until i figure out something better to do with it

var TerrainManager = {
  initialize: function() {
    this.terrains = {};

    for (var x = -2; x <= 2; x++) {
      for (var z = -2; z <= 2; z++) {
        this.createTerrain(x, z);
      }
    }
  },

  createTerrain: function(x, z) {
    if (this.terrains[x] == null) {
      this.terrains[x] = {};
    }
    if (this.terrains[x][z] == null) {
      var position = {x: x * terrainLength, y: 0, z: z * terrainLength};
      this.terrains[x][z] = new Terrain(position);
    }
  },

  update: function(playerPos) {
    this.section = this.worldToSectionCoords(playerPos);
    for (var x = this.section.x - 2; x <= this.section.x + 2; x++) {
      for (var z = this.section.z - 2; z <= this.section.z + 2; z++) {
        if (this.terrains[x] == null) {
          this.terrains[x] = {};
        }
        if (this.terrains[x][z] == null) {
          this.createTerrain(x, z);
        }
      }
    }
  },

  draw: function() {
    for (var x = this.section.x - 2; x <= this.section.x + 2; x++) {
      for (var z = this.section.z - 2; z <= this.section.z + 2; z++) {
        this.terrains[x][z].draw();
      }
    }
  },

  worldToSectionCoords: function(worldPos) {
    return {
      x: Math.floor((worldPos.x + terrainLength / 2) / terrainLength),
      z: Math.floor((worldPos.z + terrainLength / 2) / terrainLength)
    };
  },

  getTerrainHeight: function(position) {
    var section = this.worldToSectionCoords(position);
    var terrain = this.terrains[section.x][section.z];
    return terrain.getHeight(position);
  }
};
