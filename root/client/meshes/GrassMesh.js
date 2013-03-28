define([
    'client/Mesh'
  ],
  function(Mesh) {
    return Mesh.extend({
      constructor: function(position) {
        this.base();

        this.position = position;
        this.rotation = {
          yaw: 0,
          pitch: 0
        };

        this.layers = 16;
        this.layerDistance = 0.02;

        this.initialize();
      },

      getPosition: function() {
        return this.position;
      },

      getRotation: function() {
        return this.rotation;
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          var vertices = [];
          for (var i = 0; i < this.layers; i++) {
            vertices.push(
              -0.5, i * this.layerDistance, -0.5,
              0.5, i * this.layerDistance, -0.5,
              -0.5, i * this.layerDistance, 0.5,
              0.5, i * this.layerDistance, 0.5,
              -0.5, (i + 0.5) * this.layerDistance, -0.5,
              0.5, (i + 0.5) * this.layerDistance, -0.5,
              -0.5, (i + 0.5) * this.layerDistance, 0.5,
              0.5, (i + 0.5) * this.layerDistance, 0.5
            );
          }
          return new Float32Array(vertices);
        } else if (attrib == 'TextureCoord') {
          var texCoords = [];
          for (var i = 0; i < this.layers; i++) {
            texCoords.push(
              0.0, 0.0,
              1.0, 0.0,
              0.0, 1.0,
              1.0, 1.0,
              0.0, 0.0,
              1.0, 0.0,
              0.0, 1.0,
              1.0, 1.0
            );
          }
          return new Float32Array(texCoords);
        } else if (attrib == 'Layer') {
          var layers = [];
          for (var i = 0; i < this.layers; i++) {
            layers.push(
              i,
              i,
              i,
              i,
              i,
              i,
              i,
              i
            );
          }
          return new Float32Array(layers);
        }
      },

      getIndexData: function() {
        var indices = [];
        for (var i = 0; i < this.layers; i++) {
          indices.push(
            8 * i + 0, 8 * i + 1, 8 * i + 2,
            8 * i + 1, 8 * i + 2, 8 * i + 3,
            8 * i + 4, 8 * i + 5, 8 * i + 6,
            8 * i + 5, 8 * i + 6, 8 * i + 7
          );
        }
        return new Uint16Array(indices);
      },

      getNumItems: function() {
        return 12 * this.layers;
      },

      getShaderName: function() {
        return 'grass';
      },

      getTextures: function() {
        var textures = [];
        for (var i = 0; i < this.layers; i++) {
          textures.push({
            name: 'grass_' + i,
            filetype: 'png'
          });
        }
        return textures;
      },

      isUsingIndices: function() {
        return true;
      }
    });
  }
);
