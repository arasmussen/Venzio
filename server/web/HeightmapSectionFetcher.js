// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'srand',
    'shared/Globals',
    'server/MurmurHash2'
  ],
  function(Base, srand, Globals, MurmurHash2) {
    var HeightmapSectionFetcher = Base.extend({
      constructor: function(seed) {
        this.hasher = new MurmurHash2(seed, 256);
        this.terrainLength = Globals.terrainLength;

        this.blurIterations = 5;
        this.cachedSectionData = {};
      },

      fetch: function(x, y) {
        var sectionKey = x + ' ' + y;
        if (this.cachedSectionData.hasOwnProperty(sectionKey)) {
          return this.cachedSectionData[sectionKey];
        }

        var matrix = this.applyBlurryContrast(this.getNoiseMatrix(x, y));

        this.cachedSectionData[sectionKey] = matrix;
        return matrix;
      },

      getNoiseMatrix: function(x, y) {
        var noiseMatrixSize = {
          x1: x * this.terrainLength - this.blurIterations,
          x2: (x + 1) * this.terrainLength + this.blurIterations,
          y1: y * this.terrainLength - this.blurIterations,
          y2: (y + 1) * this.terrainLength + this.blurIterations
        };

        var noiseMatrix = [];
        for (var i = noiseMatrixSize.x1; i < noiseMatrixSize.x2; i++) {
          for (var j = noiseMatrixSize.y1; j < noiseMatrixSize.y2; j++) {
            var vertexKey = i + ' ' + j;
            noiseMatrix.push(this.hasher.hash(vertexKey) / 255);
          }
        }

        return noiseMatrix;
      },

      applyBlurryContrast: function(matrix) {
        for (var iteration = 1; iteration <= this.blurIterations; iteration++) {
          var offset = this.blurIterations - iteration;
          var afterIteration = [];
          for (var x = 0; x < this.terrainLength + 2 * offset; x++) {
            for (var y = 0; y < this.terrainLength + 2 * offset; y++) {
              var beforeIdx = (x + 1) * (this.terrainLength + 2 * (offset + 1)) + y + 1;
              var afterIdx = x * (this.terrainLength + 2 * offset) + y;

              var up = -1;
              var down = 1;
              var left = -(this.terrainLength + 2 * (offset + 1));
              var right = this.terrainLength + 2 * (offset + 1);

              // blur
              var after =
                0.2 * matrix[beforeIdx + up] +
                0.2 * matrix[beforeIdx + down] +
                0.2 * matrix[beforeIdx + left] +
                0.2 * matrix[beforeIdx + right] +
                0.2 * matrix[beforeIdx];

              // contrast
              // after = Math.min(Math.max((after - 0.5) * 1.5 + 0.5, 0.0), 1.0);

              afterIteration[afterIdx] = after;
            }
          }
          matrix = afterIteration;
        }

        return matrix;
      }
    });

    var fetchers = {};
    HeightmapSectionFetcher.get = function(seed) {
      if (!fetchers.hasOwnProperty(seed)) {
        fetchers[seed] = new HeightmapSectionFetcher(seed);
      }
      return fetchers[seed];
    };

    return HeightmapSectionFetcher;
  }
);
