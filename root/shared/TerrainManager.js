// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'shared/Terrain',
    'shared/Globals',
    'shared/HeightmapSectionFetcher'
  ],
  function(Base, Terrain, Globals, HeightmapSectionFetcher) {
    return Base.extend({
      constructor: function() {
        this.length = Globals.terrainLength;
        this.offset = Globals.terrainOffset;
        this.terrains = {};

        var seed = 123;
        var distance = 20;
        var amount = 11;
        var contrast = 16;

        this.sectionFetcher = new HeightmapSectionFetcher(seed, distance, amount, contrast);

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
          var heights = this.sectionFetcher.fetch(x, z);
          var heightMatrix = [];
          for (var i = 0; i < this.length + 1; i++) {
            heightMatrix[i] = [];
            for (var j = 0; j < this.length + 1; j++) {
              var idx = i * (this.length + 1) + j;
              heightMatrix[i][j] = (255 - heights[idx]) / 6 - 8;
            }
          }
          this.terrains[x][z] = this.newTerrain({x: x, z: z}, heightMatrix);
        }
      },

      newTerrain: function(coords, heights) {
        return new Terrain(coords, heights);
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
    });
  }
);
