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

        this.layers = 10;
        this.layerDistance = 0.01;

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
              0.5, i * this.layerDistance, 0.5
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
            4 * i, 4 * i + 1, 4 * i + 2,
            4 * i + 1, 4 * i + 2, 4 * i + 3
          );
        }
        return new Uint16Array(indices);
      },

      getNumItems: function() {
        return 6 * this.layers;
      },

      getShaderName: function() {
        return 'grass';
      },

      getTextures: function() {
        return [
          {name: 'grass_130', filetype: 'png'},
          {name: 'grass_135', filetype: 'png'},
          {name: 'grass_140', filetype: 'png'},
          {name: 'grass_145', filetype: 'png'},
          {name: 'grass_150', filetype: 'png'},
          {name: 'grass_155', filetype: 'png'},
          {name: 'grass_160', filetype: 'png'},
          {name: 'grass_165', filetype: 'png'},
          {name: 'grass_170', filetype: 'png'},
          {name: 'grass_175', filetype: 'png'}
        ];
      },

      isUsingIndices: function() {
        return true;
      }
    });
  }
);
