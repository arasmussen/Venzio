// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/meshes/TerrainMesh'
  ],
  function(TerrainMesh) {
    return TerrainMesh.extend({
      constructor: function(position) {
        this.layers = 20;
        this.base(position);
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var x = 0; x < this.terrain.width; x++) {
            for (var z = 0; z < this.terrain.length; z++) {
              for (var layer = 0; layer < this.layers; layer++) {
                vertices.push(
                  x - this.terrain.width / 2, this.terrain.heights[x][z], z - this.terrain.length / 2,
                  x + 1 - this.terrain.width / 2, this.terrain.heights[x + 1][z], z - this.terrain.length / 2,
                  x - this.terrain.width / 2, this.terrain.heights[x][z + 1], z + 1 - this.terrain.length / 2,
                  x - this.terrain.width / 2, this.terrain.heights[x][z + 1], z + 1 - this.terrain.length / 2,
                  x + 1 - this.terrain.width / 2, this.terrain.heights[x + 1][z], z - this.terrain.length / 2,
                  x + 1 - this.terrain.width / 2, this.terrain.heights[x + 1][z + 1], z + 1 - this.terrain.length / 2
                );
              }
            }
          }
          return new Float32Array(vertices);
        /* LEGACY (awesome colors)
        } else if (attrib == 'Color') {
          var colors = [];
          for (var i = 0; i < this.terrain.width; i++) {
            for (var j = 0; j < this.terrain.length; j++) {
              var x = this.terrain.position.x + i;
              var z = this.terrain.position.z + j;
              colors.push(
                Math.sin(x), Math.sin(x + z), Math.sin(z), 1.0,
                Math.sin(x + 1.0), Math.sin(x + z + 1), Math.sin(z), 1.0,
                Math.sin(x), Math.sin(x + z + 1), Math.sin(z + 1), 1.0,
                Math.sin(x), Math.sin(x + z + 1), Math.sin(z + 1), 1.0,
                Math.sin(x + 1.0), Math.sin(x + z + 1), Math.sin(z), 1.0,
                Math.sin(x + 1.0), Math.sin(x + z + 2), Math.sin(z + 1), 1.0
              );
            }
          }
          return new Float32Array(colors); */
        } else if (attrib == 'TextureCoord') {
          var texCoords = [];
          for (var i = 0; i < this.terrain.width; i++) {
            for (var j = 0; j < this.terrain.length; j++) {
              for (var layer = 0; layer < this.layers; layer++) {
                var inverse = {
                  x: i % 2 == 1,
                  z: j % 2 == 1
                };
                if (!inverse.x && !inverse.z) {
                  texCoords.push(
                    0.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    0.0, 1.0,
                    1.0, 0.0,
                    1.0, 1.0
                  );
                } else if (!inverse.x && inverse.z) {
                  texCoords.push(
                    0.0, 1.0,
                    1.0, 1.0,
                    0.0, 0.0,
                    0.0, 0.0,
                    1.0, 1.0,
                    1.0, 0.0
                  );
                } else if (inverse.x && !inverse.z) {
                  texCoords.push(
                    1.0, 0.0,
                    0.0, 0.0,
                    1.0, 1.0,
                    1.0, 1.0,
                    0.0, 0.0,
                    0.0, 1.0
                  );
                } else if (inverse.x && inverse.z) {
                  texCoords.push(
                    1.0, 1.0,
                    0.0, 1.0,
                    1.0, 0.0,
                    1.0, 0.0,
                    0.0, 1.0,
                    0.0, 0.0
                  );
                }
              }
            }
          }
          return new Float32Array(texCoords);
        } else if (attrib == 'Layer') {
          var layerData = [];
          for (var i = 0; i < this.terrain.width; i++) {
            for (var j = 0; j < this.terrain.length; j++) {
              for (var layer = 0; layer < this.layers; layer++) {
                layerData.push(layer, layer, layer, layer, layer, layer);
              }
            }
          }
          return new Float32Array(layerData);
        }
      },

      getNumItems: function() {
        return this.layers * 6 * (this.terrain.width) * (this.terrain.length);
      },

      getShaderName: function() {
        return 'grass';
      },

      getTextures: function() {
        return [
          {name: 'grass', filetype: 'png'}
        ];
      }
    });
  }
);
