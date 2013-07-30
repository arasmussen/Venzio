// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/Mesh',
    'common/Wall'
  ],
  function(Mesh, Wall) {
    return Mesh.extend({
      constructor: function(terrainManager, position, rotation) {
        this.base();
        this.wall = new Wall(terrainManager, position, rotation);
        this.position = this.wall.position;
        this.rotation = this.wall.rotation;
        this.initialize();
      },

      setPosition: function(position) {
        this.wall.setPosition(position);
      },

      setRotation: function(rotation) {
        this.wall.setRotation(rotation);
      },

      setBuildable: function(buildable) {
        var update = false;
        if (this.wall.buildable != buildable) {
          update = true;
        }
        this.wall.setBuildable(buildable);
        if (update) {
          this.updateBuildState();
        }
      },

      setBuilt: function(built) {
        var update = false;
        if (this.wall.built != built) {
          update = true;
        }
        this.wall.setBuilt(built);
        if (update) {
          this.updateBuildState();
        }
      },

      updateBuildState: function() {
        if (this.wall.built) {
          this.setUniform('BuildState', 0); // built, no changes
        } else {
          if (this.wall.buildable) {
            this.setUniform('BuildState', 1); // not built but buildable, transparenty
          } else {
            this.setUniform('BuildState', 2); // not built or buildable, transparenty red
          }
        }
      },

      getPosition: function() {
        return this.wall.position;
      },

      getRotation: function() {
        return this.wall.rotation;
      },

      getYaw: function() {
        return this.wall.yaw;
      },

      getSnapData: function() {
        return this.wall.getSnapData();
      },

      getPhysicsVertices: function() {
        return this.wall.getPhysicsVertices();
      },

      getPositionOffGround: function() {
        return this.wall.getPositionOffGround();
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
        return 'wall';
      }
    });
  }
);
