// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/lib/Base64',
    'client/Mesh',
    'client/ShaderManager',
    'client/3d/Model',
    'client/3d/Animation',
  ],
  function(Base64, Mesh, ShaderManager, Model, Animation) {
    return {
      mesh_class: {},

      model_data: {},
      anim_data: {},

      fetch: {
        'man': {
          scale: 0.015,
          anims: [
            'zombie_walk',
            'gangnam',
            'idle',
          ]
        },
        'goblin': {
          scale: 0.55,
          anims: [
            'gangnam',
          ]
        }
      },

      models: {},

      newMesh: function(name) {
        if (!this.models.hasOwnProperty(name)) {
          console.error('tried to get mesh "' + name + '" which doesn\'t exist');
          return;
        }
        return this.models[name].getNewInstance();
      },

      initialize: function(callback) {
        this.init_callback = callback;
        this.meshes_to_load = Object.keys(this.fetch).length;
        this.anims_to_load = 0;
        for (var model_name in this.fetch) {
          this.anim_data[model_name] = {};

          this.anims_to_load += this.fetch[model_name].anims.length;
          this.loadMesh(model_name, function() {
            // when we've loaded everything, callback
            if (--this.meshes_to_load == 0 && this.anims_to_load == 0) {
              this.CreateModelObjects();
              callback();
            }
          }.bind(this));

          for (var i = 0; i < this.fetch[model_name].anims.length; i++) {
            var anim_name = this.fetch[model_name].anims[i];
            this.loadAnim(model_name, anim_name, function() {
              // when we've loaded everything, callback
              if (--this.anims_to_load == 0 && this.meshes_to_load == 0) {
                this.CreateModelObjects();
                callback();
              }
            }.bind(this));
          }
        }
      },

      CreateModelObjects: function() {
        for (var model_name in this.model_data) {
          var anims = {};
          for (var anim_name in this.anim_data[model_name]) {
            anims[anim_name] = new Animation(this.anim_data[model_name][anim_name]);
          }

          this.models[model_name] = new Model(this.model_data[model_name], anims);
        }
      },

      loadMesh: function(model_name, callback) {
        $.ajax({
          'url': '/meshes/' + model_name + '/' + model_name + '.tgz',
        }).done(function(response) {
          var binary = Base64.decodeToArray(response);
          this.model_data[model_name] = this.parseModelData(binary);
          this.model_data[model_name].scale = this.fetch[model_name].scale;
          callback();
        }.bind(this));
      },

      loadAnim: function(model_name, anim_name, callback) {
        $.ajax({
          'url': '/meshes/' + model_name + '/anims/' + anim_name + '.tgz',
        }).done(function(response) {
          var binary = Base64.decodeToArray(response);
          this.anim_data[model_name][anim_name] = this.parseAnimData(binary);
          callback();
        }.bind(this));
      },

      parseAnimData: function(binary) {
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

        var num_frames = ReadShort();
        var num_bones = (binary.length - index) / num_frames / 16;

        data.bone_matrices = [];
        for (var i = 0; i < num_bones; i++) {
          data.bone_matrices[i] = [];
          for (var j = 0; j < num_frames; j++) {
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

      parseModelData: function(binary) {
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

        var num_vertices = ReadShort();
        data.num_bones = ReadByte();
        var bones_per_vertex = ReadByte();

        data.vertices = [];
        for (var i = 0; i < num_vertices; i++) {
          data.vertices[3 * i + 0] = ReadFloat();
          data.vertices[3 * i + 1] = ReadFloat();
          data.vertices[3 * i + 2] = ReadFloat();
        }

        data.normals = [];
        for (var i = 0; i < num_vertices; i++) {
          data.normals[3 * i + 0] = ReadFloat();
          data.normals[3 * i + 1] = ReadFloat();
          data.normals[3 * i + 2] = ReadFloat();
        }

        data.texcoords = [];
        for (var i = 0; i < num_vertices; i++) {
          data.texcoords[2 * i + 0] = ReadFloat();
          data.texcoords[2 * i + 1] = ReadFloat();
        }

        data.bone_indices = [];
        for (var i = 0; i < bones_per_vertex; i++) {
          data.bone_indices[i] = [];
          for (var j = 0; j < num_vertices; j++) {
            data.bone_indices[i][j] = ReadByte();
          }
        }

        data.bone_weights = [];
        for (var i = 0; i < bones_per_vertex; i++) {
          data.bone_weights[i] = [];
          for (var j = 0; j < num_vertices; j++) {
            data.bone_weights[i][j] = ReadFloat();
          }
        }

        return data;
      }
    };
  }
);
