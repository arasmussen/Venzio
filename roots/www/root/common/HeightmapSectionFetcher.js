// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'common/Globals',
    'common/MurmurHash2'
  ],
  function(Base, Globals, MurmurHash2) {
    var HeightmapSectionFetcher = Base.extend({
      constructor: function(options) {
        this.hasher = new MurmurHash2(options.seed, 256);
        this.terrainLength = Globals.terrainLength;

        this.normalDistance = options.normalDistance;
        this.blurDistance = options.blurDistance;
        this.blurAmount = options.amount;
        this.contrast = options.contrast;
        this.cachedSectionData = {};

        this.calculateBlurConstants();
      },

      fetch: function(coords) {
        var sectionKey = coords.x + ' ' + coords.z;
        if (this.cachedSectionData.hasOwnProperty(sectionKey)) {
          return this.cachedSectionData[sectionKey];
        }

        /*
        var noise = this.getNoiseMatrix(coords);
        var blurred = this.applyBlur(noise);
        var contrasted = this.applyContrast(noise);
        var terrain = this.applyTerrain(noise);
        */

        var terrain = this.getWaveTerrain(coords);

        this.cachedSectionData[sectionKey] = terrain;
        return terrain;
      },

      getWaveTerrain: function(coords) {
        var offset = {
          x: coords.x * this.terrainLength,
          z: coords.z * this.terrainLength
        };

        var matrix = [];
        for (var x = -this.normalDistance; x <= this.terrainLength + this.normalDistance; x++) {
          matrix[x] = [];
          for (var z = -this.normalDistance; z <= this.terrainLength + this.normalDistance; z++) {
            matrix[x][z] =
              1.8 * Math.sin(2 * Math.PI * (x + offset.x) / (4 * this.terrainLength)) +
              1.8 * Math.cos(2 * Math.PI * (z + offset.z) / (4 * this.terrainLength));
          }
        }
        return matrix;
      },

      getNoiseMatrix: function(coords) {
        var x = coords.x;
        var z = coords.z;

        var extra = this.blurDistance + this.normalDistance;
        var offset = {
          x: coords.x * this.terrainLength,
          z: coords.z * this.terrainLength
        };

        var noiseMatrix = [];
        for (var i = -extra; i <= this.terrainLength + extra; i++) {
          noiseMatrix[i] = [];
          for (var j = -extra; j <= this.terrainLength + extra; j++) {
            var vertexKey = (offset.x + i) + ' ' + (offset.z + j);
            noiseMatrix[i][j] = this.hasher.hash(vertexKey) / 255 / 255;
          }
        }

        return noiseMatrix;
      },

      applyBlur: function(noise) {
        var extra = this.blurDistance + this.normalDistance;

        // blur columns
        var blurredColumns = [];
        for (var x = -extra; x <= this.terrainLength + extra; x++) {
          blurredColumns[x] = [];
          for (var z = -this.normalDistance; z <= this.terrainLength + this.normalDistance; z++) {
            blurredColumns[x][z] = 0;
            for (var i in this.blurConstants) {
              blurredColumns[x][z] += this.blurConstants[i] * noise[x][z + parseInt(i)];
            }
          }
        }

        // blur rows
        var blurred = [];
        for (var x = -this.normalDistance; x <= this.terrainLength + this.normalDistance; x++) {
          blurred[x] = [];
          for (var z = -this.normalDistance; z <= this.terrainLength + this.normalDistance; z++) {
            blurred[x][z] = 0;
            for (var i in this.blurConstants) {
              blurred[x][z] += this.blurConstants[i] * blurredColumns[x + parseInt(i)][z];
            }
          }
        }

        return blurred;
      },

      applyContrast: function(matrix) {
        for (var x = -this.normalDistance; x <= this.terrainLength + this.normalDistance; x++) {
          for (var z = -this.normalDistance; z <= this.terrainLength + this.normalDistance; z++) {
            matrix[x][z] = Math.min(Math.max((matrix[x][z] - 0.5) * this.contrast + 0.5, 0.0), 1.0);
          }
        }
        return matrix;
      },

      applyTerrain: function(matrix) {
        for (var x = -this.normalDistance; x <= this.terrainLength + this.normalDistance; x++) {
          for (var z = -this.normalDistance; z <= this.terrainLength + this.normalDistance; z++) {
            var mountainThreshold = 0.6;
            var mountainStartHeight = 60;

            var height;
            if (matrix[x][z] < mountainThreshold) {
              var minHeight = 0;
              var maxHeight = mountainStartHeight;
              var percentage = matrix[x][z] / mountainThreshold;
              height = 255 - (minHeight + (maxHeight - minHeight) * percentage);
            } else { // >= mountainThreshold
              var minHeight = mountainStartHeight;
              var maxHeight = 255;
              var percentage = (matrix[x][z] - mountainThreshold) / (1 - mountainThreshold);
              height = 255 - (minHeight + (maxHeight - minHeight) * percentage);
            }

            matrix[x][z] = height;
          }
        }
        return matrix;
      },

      calculateBlurConstants: function() {
        var total = 0;
        this.blurConstants = [];
        for (var x = -this.blurDistance; x <= this.blurDistance; x++) {
          var amountSquared = Math.pow(this.blurAmount, 2);
          this.blurConstants[x] = Math.pow(Math.E, -Math.pow(x, 2) / amountSquared) / (2 * Math.PI * amountSquared);
          total += this.blurConstants[x];
        }

        var factor = 1 / total;
        for (var x = -this.blurDistance; x <= this.blurDistance; x++) {
          this.blurConstants[x] *= factor;
        }
      }
    });

    var fetchers = {};
    HeightmapSectionFetcher.get = function(seed, distance, amount, contrast) {
      var key = seed + ' ' + distance + ' ' + amount + ' ' + contrast;
      if (!fetchers.hasOwnProperty(key)) {
        fetchers[key] = new HeightmapSectionFetcher(seed, distance, amount, contrast);
      }
      return fetchers[key];
    };

    return HeightmapSectionFetcher;
  }
);
