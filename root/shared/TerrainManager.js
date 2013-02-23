define([
    'shared/Terrain',
    'shared/Globals'
  ],
  function(Terrain, Globals) {
    return {
      initialize: function() {
        this.length = Globals.terrainLength;
        this.offset = Globals.terrainOffset;
        this.terrains = {};

        for (var x = -this.offset; x <= this.offset; x++) {
          for (var z = -this.offset; z <= this.offset; z++) {
            this.createTerrain(x, z);
          }
        }
      },

      createTerrain: function(x, z) {
        if (this.terrains[x] == null) {
          this.terrains[x] = {};
        }
        if (this.terrains[x][z] == null) {
          var position = {x: x * this.length, y: 0, z: z * this.length};
          this.terrains[x][z] = new Terrain(position);
        }
      },

      update: function(playerPos) {
        this.section = this.worldToSectionCoords(playerPos);
        var min = {
          x: this.section.x - this.offset,
          z: this.section.z - this.offset
        };
        var max = {
          x: this.section.x + this.offset,
          z: this.section.z + this.offset
        };
        for (var x = min.x; x <= max.x; x++) {
          for (var z = min.z; z <= max.z; z++) {
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
        var min = {
          x: this.section.x - this.offset,
          z: this.section.z - this.offset
        };
        var max = {
          x: this.section.x + this.offset,
          z: this.section.z + this.offset
        };
        for (var x = min.x; x <= max.x; x++) {
          for (var z = min.z; z <= max.z; z++) {
            this.terrains[x][z].draw();
          }
        }
      },

      worldToSectionCoords: function(worldPos) {
        return {
          x: Math.floor((worldPos.x + this.length / 2) / this.length),
          z: Math.floor((worldPos.z + this.length / 2) / this.length)
        };
      },

      getTerrainHeight: function(position) {
        var section = this.worldToSectionCoords(position);
        var terrain = this.terrains[section.x][section.z];
        return terrain.getHeight(position);
      }
    };
  }
);
