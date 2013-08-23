// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/Mesh',
    'client/MeshManager'
  ],
  function(Mesh, MeshManager) {
    return Mesh.extend({
      constructor: function(position) {
        this.base();

        this.data_source = MeshManager.getDataSource('goblin');
        this.position = position;
        this.time = 0;
        this.normalMatrix = mat4.create();
        mat4.identity(this.normalMatrix);
      },

      initialize: function() {
        Mesh.prototype.initialize.bind(this)();

        this.setUniform('NormalMatrix', this.normalMatrix);
        this.setUniform('BoneMatrices', this.getBoneMatrices());
      },

      update: function(tslf) {
        this.time += tslf * 24;
        this.setUniform('BoneMatrices', this.getBoneMatrices());
      },

      getBoneMatrices: function() {
        var frames = this.data_source.num_frames;

        var frame1 = parseInt(this.time % frames);
        var frame2 = parseInt((this.time + 1) % frames);
        var weight = this.time - parseInt(this.time);

        var result = [];
        for (var i = 0; i < this.data_source.num_bones; i++) {
          var matrix1 = this.data_source.bone_matrices[i][frame1];
          var matrix2 = this.data_source.bone_matrices[i][frame2];
          for (var j = 0; j < 16; j++) {
            result[i * 16 + j] = matrix2[j] * weight + matrix1[j] * (1.0 - weight);
          }
        }

        return new Float32Array(result);
      },

      getAttribData: function(attrib) {
        if (attrib == 'Position') {
          return new Float32Array(this.data_source.vertices);
        } else if (attrib == 'Normal') {
          return new Float32Array(this.data_source.normals);
        } else if (attrib == 'TextureCoord') {
          return new Float32Array(this.data_source.texcoords);
        } else if (attrib == 'BoneIndex1') {
          return new Float32Array(this.data_source.bone_indices[0]);
        } else if (attrib == 'BoneIndex2') {
          return new Float32Array(this.data_source.bone_indices[1]);
        } else if (attrib == 'BoneIndex3') {
          return new Float32Array(this.data_source.bone_indices[2]);
        } else if (attrib == 'BoneIndex4') {
          return new Float32Array(this.data_source.bone_indices[3]);
        } else if (attrib == 'BoneIndex5') {
          return new Float32Array(this.data_source.bone_indices[4]);
        } else if (attrib == 'BoneIndex6') {
          return new Float32Array(this.data_source.bone_indices[5]);
        } else if (attrib == 'BoneIndex7') {
          return new Float32Array(this.data_source.bone_indices[6]);
        } else if (attrib == 'BoneWeight1') {
          return new Float32Array(this.data_source.bone_weights[0]);
        } else if (attrib == 'BoneWeight2') {
          return new Float32Array(this.data_source.bone_weights[1]);
        } else if (attrib == 'BoneWeight3') {
          return new Float32Array(this.data_source.bone_weights[2]);
        } else if (attrib == 'BoneWeight4') {
          return new Float32Array(this.data_source.bone_weights[3]);
        } else if (attrib == 'BoneWeight5') {
          return new Float32Array(this.data_source.bone_weights[4]);
        } else if (attrib == 'BoneWeight6') {
          return new Float32Array(this.data_source.bone_weights[5]);
        } else if (attrib == 'BoneWeight7') {
          return new Float32Array(this.data_source.bone_weights[6]);
        }
      },

      getNumItems: function() {
        return this.data_source.num_vertices;
      },

      getPosition: function() {
        return this.position;
      },

      getRotation: function() {
        return {pitch: 0.0, yaw: 0.0};
      },

      getShaderName: function() {
        return 'man';
      }
    });
  }
);
