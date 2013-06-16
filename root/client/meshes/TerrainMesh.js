// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/Terrain',
    'client/Mesh',
    'common/Globals'
  ],
  function(Terrain, Mesh, Globals) {
    return Mesh.extend({
      constructor: function(coords) {
        this.base();
        this.terrain = new Terrain(coords);
      },

      updateNormalMatrix: function() {
        mat4.inverse(mvMatrix, this.uNormalMatrix);
        mat4.transpose(this.uNormalMatrix, this.uNormalMatrix);
      },

      preDraw: function() {
        Mesh.prototype.preDraw.bind(this)();
        this.updateNormalMatrix();
      },

      hasAllData: function() {
        return this.terrain.hasAllData();
      },

      deploy: function() {
        this.initialize();
        this.uNormalMatrix = mat4.create();
        this.updateNormalMatrix();
        this.setUniform('NormalMatrix', this.uNormalMatrix);
        this.setUniform('TerrainQuality', Globals.terrainQuality);
      },

      getPosition: function() {
        return this.terrain.position;
      },

      getRotation: function() {
        return this.terrain.rotation;
      },

      getHeight: function(position) {
        return this.terrain.getHeight(position);
      },

      setHeights: function(row, heights) {
        this.terrain.setHeights(row, heights);
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var x = 0; x <= this.terrain.length; x++) {
            for (var z = 0; z <= this.terrain.length; z++) {
              vertices.push(x, this.terrain.heights[x][z], z);
            }
          }
          return new Float32Array(vertices);
        } else if (attrib == 'Normal') {
          var Normalize = function(vec) {
            var factor = Math.sqrt(
              Math.pow(vec.x, 2) +
              Math.pow(vec.y, 2) +
              Math.pow(vec.z, 2)
            );
            vec.x /= factor;
            vec.y /= factor;
            vec.z /= factor;
          };
          var normals = [];
          for (var x = 0; x <= this.terrain.length; x++) {
            for (var z = 0; z <= this.terrain.length; z++) {
              var normal = {
                x: (this.terrain.heights[x - 1][z] - this.terrain.heights[x + 1][z]) / 2,
                y: 1,
                z: (this.terrain.heights[x][z - 1] - this.terrain.heights[x][z + 1]) / 2
              };
              Normalize(normal);
              normals.push(normal.x, normal.y, normal.z);
            }
          }
          return new Float32Array(normals);
        }
      },

      isUsingIndices: function() {
        return true;
      },

      getIndexData: function() {
        var indices = [];
        for (var x = 0; x < this.terrain.length; x++) {
          for (var z = 0; z < this.terrain.length; z++) {
            var idx = x * (this.terrain.length + 1) + z;
            var even = ((x + z) % 2 == 0);
            if (even) {
              indices.push(
                idx,
                idx + 1,
                idx + this.terrain.length + 1,
                idx + this.terrain.length + 1,
                idx + 1,
                idx + this.terrain.length + 2
              );
            } else {
              indices.push(
                idx,
                idx + 1,
                idx + this.terrain.length + 2,
                idx,
                idx + this.terrain.length + 2,
                idx + this.terrain.length + 1
              );
            }
          }
        }
        return new Uint16Array(indices);
      },

      getNumItems: function() {
        return 6 * this.terrain.length * this.terrain.length;
      },

      getShaderName: function() {
        return 'terrain';
      },

      getTextures: function() {
        return [
          {name: 'dirt', filetype: 'jpg'},
          {name: 'grass', filetype: 'jpg'},
          {name: 'snow', filetype: 'png'}
        ];
      }
    });
  }
);
