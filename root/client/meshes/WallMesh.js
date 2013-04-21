define([
    'client/Mesh',
    'shared/Wall'
  ],
  function(Mesh, Wall) {
    return Mesh.extend({
      constructor: function(terrainManager, position, rotation) {
        this.base();
        this.wall = new Wall(terrainManager, position, rotation);
        this.position = this.wall.position;
        this.initialize();
      },

      setPosition: function(x, y, z) {
        this.wall.setPosition(x, y, z);
      },

      setYaw: function(yaw) {
        this.wall.setYaw(yaw);
      },

      getPosition: function() {
        return this.wall.position;
      },

      getRotation: function() {
        return this.wall.rotation;
      },

      updatePositionData: function() {
        this.wall.updatePositionData();
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          return new Float32Array(this.wall.positionData);
        } else if (attrib == 'TextureCoord') {
          return new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
          ]);
        }
      },

      getIndexData: function() {
        return new Uint16Array([
          0, 1, 2, 1, 2, 3, // left
          2, 3, 6, 3, 6, 7, // top
          6, 7, 4, 7, 4, 5, // right
          4, 5, 0, 5, 0, 1, // bottom
          0, 2, 4, 2, 4, 6, // front
          1, 3, 5, 3, 5, 7 // back
        ]);
      },

      getTextures: function() {
        return [
          {name: 'wood', filetype: 'jpeg'}
        ];
      },

      isDynamic: function(attrib) {
        if (attrib == 'Position') {
          return true;
        }
        return false;
      },

      isUsingIndices: function() {
        return true;
      },

      getNumItems: function() {
        return 36;
      },

      getShaderName: function() {
        return 'cube';
      }
    });
  }
);
