// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/lib/Base64',
    'client/Mesh',
    'client/ShaderManager',
  ],
  function(Base64, Mesh, ShaderManager) {
    return {
      meshes: {},

      initialMeshes: {
        'goblin': {scale: 0.55},
        'zombie': {scale: 0.015},
        'gangnam': {scale: 0.015},
        'idle': {scale: 0.015},
      },

      newMesh: function(name) {
        if (!this.meshes.hasOwnProperty(name)) {
          console.error('tried to get mesh "' + name + '" which doesn\'t exist');
          return;
        }
        return (new this.meshes[name]);
      },

      initialize: function(callback) {
        this.initCallback = callback;
        this.initLoadCount = Object.keys(this.initialMeshes).length;
        for (var name in this.initialMeshes) {
          this.loadMesh(name, function() {
            // after all meshes are loaded, callback
            if (--this.initLoadCount == 0) {
              callback();
            }
          }.bind(this));
        }
      },

      loadMesh: function(name, callback) {
        $.ajax({
          'url': '/meshes/' + name + '.mesh',
        }).done(function(response) {
          var binary = Base64.decodeToArray(response);
          var data = this.parseBinaryData(binary);
          this.meshes[name] = this.createMeshClass(data, name);
          callback();
        }.bind(this));
      },

      createMeshClass: function(data, name) {
        var shader_name = ShaderManager.newDynamicShader({
          num_bones: data.num_bones,
          bones_per_vertex: data.bones_per_vertex,
          scale: this.initialMeshes[name].scale,
        });

        return Mesh.extend({
          constructor: function() {
            this.base();
            this.position = {x: 0.0, y: 0.0, z: 0.0};

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
            var frames = data.num_frames;

            if (this.time >= frames) {
              this.time -= frames;
            }

            var frame1 = Math.floor(this.time);
            var frame2 = (frame1 + 1) % frames;
            var weight = this.time - Math.floor(this.time);

            var result = [];
            for (var i = 0; i < data.num_bones; i++) {
              var matrix1 = data.bone_matrices[i][frame1];
              var matrix2 = data.bone_matrices[i][frame2];
              for (var j = 0; j < 16; j++) {
                result[i * 16 + j] = matrix2[j] * weight + matrix1[j] * (1.0 - weight);
              }
            }

            return new Float32Array(result);
          },

          getAttribData: function(attrib) {
            if (attrib == 'Position') {
              return new Float32Array(data.vertices);
            } else if (attrib == 'Normal') {
              return new Float32Array(data.normals);
            } else if (attrib == 'TextureCoord') {
              return new Float32Array(data.texcoords);
            } else if (attrib.indexOf('Bone') !== -1) {
              if (attrib.indexOf('Index') !== -1) {
                var index = parseInt(attrib.substr(attrib.indexOf('Index') + 5)) - 1;
                return new Float32Array(data.bone_indices[index]);
              } else if (attrib.indexOf('Weight') !== -1) {
                var index = parseInt(attrib.substr(attrib.indexOf('Weight') + 6)) - 1;
                return new Float32Array(data.bone_weights[index]);
              } else {
                console.log('unknown attrib');
              }
            } else {
              console.error('unknown attrib');
            }
          },

          getNumItems: function() {
            return data.num_vertices;
          },

          setPosition: function(position) {
            this.position.x = position.x;
            this.position.y = position.y;
            this.position.z = position.z;
          },

          getPosition: function() {
            return this.position;
          },

          getRotation: function() {
            return {pitch: 0.0, yaw: 0.0};
          },

          getShaderName: function() {
            return shader_name;
          }
        });
      },

      parseBinaryData: function(binary) {
        var data = {};

        var array_buffer = new ArrayBuffer(4);
        var byte_view = new Uint8Array(array_buffer);
        var short_view = new Uint16Array(array_buffer);
        var float_view = new Float32Array(array_buffer);

        var index = 0;

        function ReadByte() {
          return binary[index++];
        }

        function ReadShort() {
          byte_view[0] = binary[index++];
          byte_view[1] = binary[index++];
          return short_view[0];
        }

        function ReadFloat() {
          byte_view[0] = binary[index++];
          byte_view[1] = binary[index++];
          byte_view[2] = binary[index++];
          byte_view[3] = binary[index++];
          return float_view[0];
        }

        data.num_vertices = ReadShort();
        data.num_bones = ReadByte();
        data.bones_per_vertex = ReadByte();
        data.num_frames = ReadShort();

        data.vertices = [];
        for (var i = 0; i < data.num_vertices; i++) {
          data.vertices[3 * i + 0] = ReadFloat();
          data.vertices[3 * i + 1] = ReadFloat();
          data.vertices[3 * i + 2] = ReadFloat();
        }

        data.normals = [];
        for (var i = 0; i < data.num_vertices; i++) {
          data.normals[3 * i + 0] = ReadFloat();
          data.normals[3 * i + 1] = ReadFloat();
          data.normals[3 * i + 2] = ReadFloat();
        }

        data.texcoords = [];
        for (var i = 0; i < data.num_vertices; i++) {
          data.texcoords[2 * i + 0] = ReadFloat();
          data.texcoords[2 * i + 1] = ReadFloat();
        }

        data.bone_indices = [];
        for (var i = 0; i < data.bones_per_vertex; i++) {
          data.bone_indices[i] = [];
          for (var j = 0; j < data.num_vertices; j++) {
            data.bone_indices[i][j] = ReadByte();
          }
        }

        data.bone_weights = [];
        for (var i = 0; i < data.bones_per_vertex; i++) {
          data.bone_weights[i] = [];
          for (var j = 0; j < data.num_vertices; j++) {
            data.bone_weights[i][j] = ReadFloat();
          }
        }

        data.bone_matrices = [];
        for (var i = 0; i < data.num_bones; i++) {
          data.bone_matrices[i] = [];
          for (var j = 0; j < data.num_frames; j++) {
            data.bone_matrices[i][j] = [];
            for (var row = 0; row < 4; row++) {
              for (var col = 0; col < 3; col++) {
                var idx = row * 4 + col;
                data.bone_matrices[i][j][idx] = ReadFloat();
              }
            }
            data.bone_matrices[i][j][3] = 0;
            data.bone_matrices[i][j][7] = 0;
            data.bone_matrices[i][j][11] = 0;
            data.bone_matrices[i][j][15] = 1;
          }
        }

        return data;
      },

      getDataSource: function(name) {
        if (!this.meshes.hasOwnProperty(name)) {
          console.error('tried to get source "' + name + '" which doesn\'t exist');
          return;
        }
        return this.meshes[name];
      }
    };
  }
);
