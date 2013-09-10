// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'client/ShaderManager',
    'client/Mesh',
  ],
  function(Base, ShaderManager, Mesh) {
    return Base.extend({
      constructor: function(model_data, anims) {
        this.vertices = model_data.vertices;
        this.normals = model_data.normals;
        this.texcoords = model_data.texcoords;
        this.bone_indices = model_data.bone_indices;
        this.bone_weights = model_data.bone_weights;
        this.scale = model_data.scale;
        this.num_bones = model_data.num_bones;
        this.animations = anims;
      },

      getNewInstance: function() {
        if (!this.instance_class) {
          this.instance_class = CreateNewInstance(this);
        }
        return (new this.instance_class());
      },

      getAnimation: function(anim_name) {
        return this.animations[anim_name];
      },

      getNumVertices: function() {
        return this.vertices.length / 3;
      },

      getNumBones: function() {
        return this.num_bones;
      },

      getBonesPerVertex: function() {
        return this.bone_indices.length;
      },
    });

    function CreateNewInstance(model) {
      var shader_name = ShaderManager.newDynamicShader({
        num_bones: model.getNumBones(),
        bones_per_vertex: model.getBonesPerVertex(),
        scale: model.scale
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
          var anim = model.getAnimation('gangnam');
          var frames = anim.getNumFrames();

          if (this.time >= frames) {
            this.time -= frames;
          }

          var frame1 = Math.floor(this.time);
          var frame2 = (frame1 + 1) % frames;
          var weight = this.time - Math.floor(this.time);

          var result = [];
          for (var i = 0; i < model.getNumBones(); i++) {
            var mat1 = anim.bone_matrices[i][frame1];
            var mat2 = anim.bone_matrices[i][frame2];
            for (var j = 0; j < 16; j++) {
              result[i * 16 + j] = mat2[j] * weight + mat1[j] * (1.0 - weight);
            }
          }

          return new Float32Array(result);
        },

        getAttribData: function(attrib) {
          if (attrib == 'Position') {
            return new Float32Array(model.vertices);
          } else if (attrib == 'Normal') {
            return new Float32Array(model.normals);
          } else if (attrib == 'TextureCoord') {
            return new Float32Array(model.texcoords);
          } else if (attrib.indexOf('Bone') !== -1) {
            if (attrib.indexOf('Index') !== -1) {
              var index = parseInt(attrib.substr(attrib.indexOf('Index') + 5)) - 1;
              return new Float32Array(model.bone_indices[index]);
            } else if (attrib.indexOf('Weight') !== -1) {
              var index = parseInt(attrib.substr(attrib.indexOf('Weight') + 6)) - 1;
              return new Float32Array(model.bone_weights[index]);
            } else {
              console.log('unknown attrib');
            }
          } else {
            console.error('unknown attrib');
          }
        },

        getNumItems: function() {
          return model.getNumVertices();
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
    }
  }
);
