// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/lib/Base64',
  ],
  function(Base64) {
    return {
      initLoadCount: 0,

      meshes: {},

      initialMeshes: [
        {name: 'man'}
      ],

      initialize: function(callback) {
        this.initCallback = callback;
        this.initLoadCount = this.initialMeshes.length;
        for (var i in this.initialMeshes) {
          this.getMesh(this.initialMeshes[i].name, this.initOnLoaded.bind(this));
        }
      },

      initOnLoaded: function() {
        if (--this.initLoadCount == 0) {
          this.initCallback();
        }
      },

      getMesh: function(name, callback) {
        $.ajax({
          'url': '/meshes/' + name + '.mesh',
        }).done(function(response) {
          var binary = Base64.decodeToArray(response);
          this.meshes[name] = this.parseBinaryData(binary);
          callback();
        }.bind(this));
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
        for (var i = 0; i < 5; i++) {
          data.bone_indices[i] = [];
          for (var j = 0; j < data.num_vertices; j++) {
            data.bone_indices[i][j] = ReadByte();
          }
        }

        data.bone_weights = [];
        for (var i = 0; i < 5; i++) {
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
