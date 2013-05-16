// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'shared/Globals',
    'shared/MurmurHash2'
  ],
  function(Base, Globals, MurmurHash2) {
    var HeightmapSectionFetcher = Base.extend({
      constructor: function(seed, distance, amount, contrast) {
        this.hasher = new MurmurHash2(seed, 256);
        this.terrainLength = Globals.terrainLength;

        this.blurDistance = distance;
        this.blurAmount = amount;
        this.contrast = contrast;
        this.cachedSectionData = {};

        this.calculateBlurMatrix();
      },

      fetch: function(x, y) {
        var sectionKey = x + ' ' + y;
        if (this.cachedSectionData.hasOwnProperty(sectionKey)) {
          return this.cachedSectionData[sectionKey];
        }

        var matrix = this.getNoiseMatrix(x, y);
        matrix = this.applyBlur(matrix);
        matrix = this.applyContrast(matrix);
        matrix = this.applyTerrain(matrix);

        this.cachedSectionData[sectionKey] = matrix;
        return matrix;
      },

      getNoiseMatrix: function(x, y) {
        var noiseMatrixSize = {
          x1: x * this.terrainLength - this.blurDistance,
          x2: (x + 1) * this.terrainLength + this.blurDistance + 1,
          y1: y * this.terrainLength - this.blurDistance,
          y2: (y + 1) * this.terrainLength + this.blurDistance + 1
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

      applyBlur: function(unblurred) {
        // blur columns
        var blurredColumns = [];
        for (var x = 0; x < this.terrainLength + 1 + 2 * this.blurDistance; x++) {
          for (var y = 0; y < this.terrainLength + 1; y++) {
            var beforeIdx = x * (2 * this.blurDistance + this.terrainLength + 1) + y + this.blurDistance;
            var afterIdx = x * (this.terrainLength + 1) + y;

            blurredColumns[afterIdx] = 0;
            for (var i in this.blurMatrix) {
              blurredColumns[afterIdx] += this.blurMatrix[i] * unblurred[beforeIdx + parseInt(i)];
            }
          }
        }

        // blur rows
        var blurred = [];
        for (var x = 0; x < (this.terrainLength + 1); x++) {
          for (var y = 0; y < (this.terrainLength + 1); y++) {
            var beforeIdx = (x + this.blurDistance) * (this.terrainLength + 1) + y;
            var afterIdx = x * (this.terrainLength + 1) + y;

            blurred[afterIdx] = 0;
            for (var i in this.blurMatrix) {
              blurred[afterIdx] += this.blurMatrix[i] * blurredColumns[beforeIdx + i * (this.terrainLength + 1)];
            }
          }
        }

        return blurred;
      },

      applyContrast: function(matrix) {
        for (var x = 0; x < (this.terrainLength + 1); x++) {
          for (var y = 0; y < (this.terrainLength + 1); y++) {
            var idx = x * (this.terrainLength + 1) + y;
            matrix[idx] = Math.min(Math.max((matrix[idx] - 0.5) * this.contrast + 0.5, 0.0), 1.0);
          }
        }
        return matrix;
      },

      applyTerrain: function(matrix) {
        var terrainMatrix = [];
        for (var x = 0; x < (this.terrainLength + 1); x++) {
          for (var y = 0; y < (this.terrainLength + 1); y++) {
            var idx = x * (this.terrainLength + 1) + y;

            var mountainThreshold = 0.6;
            var mountainStartHeight = 60;

            var height;
            if (matrix[idx] < mountainThreshold) {
              var minHeight = 0;
              var maxHeight = mountainStartHeight;
              var percentage = matrix[idx] / mountainThreshold;
              height = 255 - parseInt(minHeight + (maxHeight - minHeight) * percentage);
            } else { // >= mountainThreshold
              var minHeight = mountainStartHeight;
              var maxHeight = 255;
              var percentage = (matrix[idx] - mountainThreshold) / (1 - mountainThreshold);
              height = 255 - parseInt(minHeight + (maxHeight - minHeight) * percentage);
            }

            terrainMatrix.push(height);
          }
        }
        return terrainMatrix;
      },

      calculateBlurMatrix: function() {
        var total = 0;
        this.blurMatrix = [];
        for (var x = -this.blurDistance; x <= this.blurDistance; x++) {
          var amountSquared = Math.pow(this.blurAmount, 2);
          this.blurMatrix[x] = Math.pow(Math.E, -Math.pow(x, 2) / amountSquared) / (2 * Math.PI * amountSquared);
          total += this.blurMatrix[x];
        }

        var factor = 1 / total;
        for (var x = -this.blurDistance; x <= this.blurDistance; x++) {
          this.blurMatrix[x] *= factor;
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
