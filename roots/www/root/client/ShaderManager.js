// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/Shader',
    'client/ShaderData'
  ],
  function(Shader, ShaderData) {
    return {
      shaders: {},

      getShader: function(name) {
        if (!this.shaders.hasOwnProperty(name)) {
          this.load(name);
        }
        return this.shaders[name];
      },

      load: function(name) {
        var vs = this.getSource('/client/shaders/' + name + '-vs.glsl');
        var fs = this.getSource('/client/shaders/' + name + '-fs.glsl');
        this.newShader(name, vs, fs);
      },

      // TODO refactor this class
      newShader: function(name, vs, fs) {
        var vertexShader = this.createShader(vs, gl.VERTEX_SHADER);
        var fragmentShader = this.createShader(fs, gl.FRAGMENT_SHADER);
        var program = this.createProgram(vertexShader, fragmentShader);
        this.shaders[name] = new Shader(program);
        this.shaders[name].addAttributes(ShaderData[name].attributes);
        this.shaders[name].addUniforms(ShaderData[name].uniforms);
        this.shaders[name].addTextures(ShaderData[name].textures);
      },

      getSource: function(url) {
        var source;
        $.ajax({
          async: false,
          url: url,
          success: function(data) {
            source = data;
          }
        });
        return source;
      },

      createShader: function(source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.log('Compile failed: ' + gl.getShaderInfoLog(shader));
          return null;
        }
        return shader;
      },

      createProgram: function(vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.log('Could not initialize shaders');
          return null;
        }
        return program;
      },

      newDynamicShader: function(config) {
        var name = '__dynamic_' + config.bones_per_vertex + '_' + config.num_bones;
        if (this.shaders.hasOwnProperty(name)) {
          return name;
        }

        var bone_decl = '';
        var skin_calc = '';
        for (var i = 0; i < config.bones_per_vertex; i++) {
          bone_decl += 'attribute float aBoneWeight' + (i + 1) + ';';
          bone_decl += 'attribute float aBoneIndex' + (i + 1) + ';';
          skin_calc += 'aBoneWeight' + (i + 1) + ' * uBoneMatrices[int(aBoneIndex' + (i + 1) + ')]';
          if (i < config.bones_per_vertex - 1) {
            skin_calc += ' + ';
          } else {
            skin_calc += ';';
          }
        }
        var vs_source = [
          'attribute vec4 aPosition;',
          'attribute vec3 aNormal;',
          '',
          bone_decl,
          '',
          'uniform mat4 uBoneMatrices[' + config.num_bones + '];',
          '',
          'uniform mat4 uMVMatrix;',
          'uniform mat4 uPMatrix;',
          'uniform mat4 uNormalMatrix;',
          '',
          'varying vec3 vLighting;',
          '',
          'mat4 getSkinMatrix() {',
          '  return ' + skin_calc,
          '}',
          '',
          '// simply transpose',
          'mat3 getNormalMatrix(in mat4 skin_matrix) {',
          '  return mat3(',
          '    skin_matrix[0][0], skin_matrix[1][0], skin_matrix[2][0],',
          '    skin_matrix[0][1], skin_matrix[1][1], skin_matrix[2][1],',
          '    skin_matrix[0][2], skin_matrix[1][2], skin_matrix[2][2]',
          '  );',
          '}',
          '',
          'void main(void) {',
          '  mat4 skin_matrix = getSkinMatrix();',
          '  vec4 position = skin_matrix * aPosition;',
          '  vec3 normal = normalize(aNormal * getNormalMatrix(skin_matrix));',
          '',
          '  vec3 ambientLight = vec3(0.2, 0.2, 0.2);',
          '  vec3 directionalLight = vec3(1.0, 0.7, 0.7);',
          '  vec3 directionalLightDirection = normalize(vec3(3.0, 3.0, 0.0));',
          '',
          '  vec4 transformedNormal = uNormalMatrix * vec4(normal, 1.0);',
          '  float directional = max(dot(normal, directionalLightDirection), 0.0);',
          '  vLighting = ambientLight + (directionalLight * directional);',
          '',
          '  gl_Position = uPMatrix * uMVMatrix * vec4(position.xyz * ' + config.scale + ', 1.0);',
          '}'
        ].join('\n');
        var fs_source = [
          'precision mediump float;',
          '',
          'varying vec3 vLighting;',
          '',
          'void main(void) {',
          '  vec4 skin = vec4(0.8, 0.6, 0.4, 1.0);',
          '  gl_FragColor = vec4(skin.rgb * vLighting, skin.a);',
          '}'
        ].join('\n');

        ShaderData[name] = {
          attributes: [
            'Position',
            'Normal'
          ],
          uniforms: [
            {
              name: 'MVMatrix',
              type: uniformMatrix4fvNoTranspose
            },
            {
              name: 'PMatrix',
              type: uniformMatrix4fvNoTranspose
            },
            {
              name: 'NormalMatrix',
              type: uniformMatrix4fvNoTranspose
            },
            {
              name: 'BoneMatrices',
              type: uniformMatrix4fvNoTranspose
            }
          ],
          textures: []
        };

        for (var i = 0; i < config.bones_per_vertex; i++) {
          ShaderData[name].attributes.push('BoneWeight' + (i + 1));
          ShaderData[name].attributes.push('BoneIndex' + (i + 1));
        }

        this.newShader(name, vs_source, fs_source);
        return name;
      },
    };
  }
);
