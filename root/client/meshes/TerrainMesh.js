// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/Terrain',
    'client/Mesh'
  ],
  function(Terrain, Mesh) {
    return Mesh.extend({
      constructor: function(coord, heights) {
        this.base();
        this.terrain = new Terrain(coord, heights);
        this.initialize();
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

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var x = 0; x < this.terrain.width; x++) {
            for (var z = 0; z < this.terrain.length; z++) {
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
          return new Float32Array(vertices);
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
          return new Float32Array(colors);
        } else if (attrib == 'TextureCoord') {
          var texCoords = [];
          var offset = {
            x: 0.0,
            z: 0.0
          };
          var factor = 8;
          for (var i = 0; i < this.terrain.width; i++) {
            for (var j = 0; j < this.terrain.length; j++) {
              texCoords.push(
                offset.x, offset.z,
                offset.x + 1 / factor, offset.z,
                offset.x, offset.z + 1 / factor,
                offset.x, offset.z + 1 / factor,
                offset.x + 1 / factor, offset.z,
                offset.x + 1 / factor, offset.z + 1 / factor
              );
              if (j % factor == factor - 1) {
                offset.z = 0;
              } else {
                offset.z += 1 / factor;
              }
            }
            if (i % factor == factor - 1) {
              offset.x = 0;
            } else {
              offset.x += 1 / factor;
            }
          }
          return new Float32Array(texCoords);
        }
      },

      getNumItems: function() {
        return 6 * (this.terrain.width) * (this.terrain.length);
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
