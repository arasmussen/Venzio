// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'shared/Terrain',
    'shared/Globals',
    'shared/HeightmapSectionFetcher',
    'shared/RequireWorker'
  ],
  function(Base, Terrain, Globals, HeightmapSectionFetcher, RequireWorker) {
    return Base.extend({
      constructor: function(callback) {
        this.length = Globals.terrainLength;
        this.offset = Globals.terrainOffset;
        this.terrains = {};

        var options = {
          seed: 123,
          distance: 20,
          amount: 11,
          contrast: 16
        };

        var numWorkers = 2;
        this.workers = [];
        this.generateQueue = {};

        this.initializing = true;
        this.callback = callback;

        for (var i = 0; i < numWorkers; i++) {
          this.workers[i] = new RequireWorker(this.getWorker(), this.getWorkerPath());
          this.workers[i].count = 0;
          this.workers[i].onmessage = this.onTerrainGenerated.bind(this, i);
          this.workers[i].postMessage({
            'type': 'init',
            'options': options
          });
        }

        for (var x = -this.offset; x <= this.offset; x++) {
          for (var z = -this.offset; z <= this.offset; z++) {
            this.generateTerrain({x: x, z: z});
          }
        }
      },

      keyForCoords: function(coords) {
        return coords.x + '~' + coords.z;
      },

      generateTerrain: function(coords) {
        // assert this.workers.length > 0
        var hash = Math.abs(coords.x + coords.z) % this.workers.length;
        this.workers[hash].postMessage({
          'type': 'fetch',
          'coords': coords
        });
        this.workers[hash].count++;

        var key = this.keyForCoords(coords);
        this.generateQueue[key] = true;
      },

      onTerrainGenerated: function(i, e) {
        var coords = e.data.coords;
        var heights = e.data.heights;
        if (this.terrains[coords.x] == null) {
          this.terrains[coords.x] = {};
        }
        this.terrains[coords.x][coords.z] = this.newTerrain(coords, heights);
        this.workers[i].count--;

        if (this.initializing) {
          for (var i = 0; i < this.workers.length; i++) {
            if (this.workers[i].count != 0) {
              return;
            }
          }
          this.initializing = false;
          setTimeout(this.callback.bind(null, true), 0);
        }
        delete this.generateQueue[this.keyForCoords(coords)];
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
              var coords = {x: x, z: z};
              if (!this.generateQueue.hasOwnProperty(this.keyForCoords(coords))) {
                this.generateTerrain({x: x, z: z});
              }
            }
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
