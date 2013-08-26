// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/ShaderManager',
    'client/TextureManager',
    'basejs'
  ],
  function(ShaderManager, TextureManager, Base) {
    return Base.extend({
      initialize: function() {
        this.buffers = {};
        this.textures = {};
        this.uniforms = {};

        this.initializeShaders();
        this.initializeBuffers();
        this.initializeTextures();

        this.setUniform('MVMatrix', mvMatrix);
        this.setUniform('PMatrix', pMatrix);
      },

      initializeShaders: function() {
        this.shader = ShaderManager.getShader(this.getShaderName());
      },

      initializeBuffers: function() {
        var attributes = this.shader.attributes;
        for (var i in attributes) {
          var attrib = attributes[i];

          this.buffers[attrib] = gl.createBuffer();

          var buffer_usage = (
            this.isDynamic(attrib) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW
          );

          // pass data to gl context
          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
          gl.bufferData(gl.ARRAY_BUFFER, this.getAttribData(attrib), buffer_usage);
        }

        if (this.isUsingIndices()) {
          this.indexBuffer = gl.createBuffer();

          // pass data to gl context
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
          gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            this.getIndexData(),
            gl.STATIC_DRAW
          );
        }
      },

      initializeTextures: function() {
        var textures = this.getTextures();
        var offset = 0;
        for (var i in textures) {
          var name = textures[i].name;
          var filetype = textures[i].filetype;
          this.textures[name] = {};
          this.textures[name].data = TextureManager.getTexture(name, filetype);
          this.textures[name].offset = offset++;
          this.textures[name].location = this.shader.getTexture(name);
        }
      },

      bindTextures: function() {
        for (var name in this.textures) {
          gl.activeTexture(gl.TEXTURE0 + this.textures[name].offset);
          gl.bindTexture(gl.TEXTURE_2D, this.textures[name].data.texture);
          gl.uniform1i(this.textures[name].location, this.textures[name].offset);
        }
      },

      bindAttributes: function() {
        var attributes = this.shader.attributes;
        for (var i in attributes) {
          var attrib = attributes[i];

          gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
          if (this.isDynamic(attrib)) {
            gl.bufferData(gl.ARRAY_BUFFER, this.getAttribData(attrib), gl.DYNAMIC_DRAW);
          }
          gl.vertexAttribPointer(
            this.shader.getAttribute(attrib),
            this.getItemSize(attrib),
            gl.FLOAT,
            false,
            0,
            0
          );
        }

        if (this.isUsingIndices()) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        }
      },

      bindUniforms: function() {
        for (var i in this.shader.uniforms) {
          var uniform = this.shader.uniforms[i];
          uniform.type.call(
            this,
            this.shader.getUniform(uniform.name),
            this.uniforms[uniform.name]
          );
        }
      },

      setUniform: function(name, value) {
        this.uniforms[name] = value;
      },

      areTexturesLoaded: function() {
        for (var name in this.textures) {
          if (!this.textures[name].data.loaded) {
            return false;
          }
        }
        return true;
      },

      draw: function() {
        if (!this.areTexturesLoaded()) {
          return;
        }

        this.preDraw();

        // bind stuff to shader
        this.bindTextures();
        this.bindAttributes();
        this.bindUniforms();

        if (this.isUsingIndices()) {
          gl.drawElements(
            this.getDrawMode(), this.getNumItems(), gl.UNSIGNED_SHORT, 0
          );
        } else {
          gl.drawArrays(this.getDrawMode(), 0, this.getNumItems());
        }

        this.postDraw();
      },

      preDraw: function() {
        // get shader/camera ready
        this.transform();
        this.shader.preDraw();
      },

      postDraw: function() {
        // cleanup camera
        this.untransform();
      },

      transform: function() {
        var position = this.getPosition();
        var rotation = this.getRotation();
        var translate = [position.x, position.y, position.z];
        mat4.translate(mvMatrix, translate);
        mat4.rotate(mvMatrix, rotation.yaw, [0, 1, 0]);
        mat4.rotate(mvMatrix, rotation.pitch, [1, 0, 0]);
      },

      untransform: function() {
        var position = this.getPosition();
        var rotation = this.getRotation();
        var translate = [-position.x, -position.y, -position.z];
        mat4.rotate(mvMatrix, -rotation.pitch, [1, 0, 0]);
        mat4.rotate(mvMatrix, -rotation.yaw, [0, 1, 0]);
        mat4.translate(mvMatrix, translate);
      },

      getDrawMode: function() {
        return gl.TRIANGLES;
      },

      isDynamic: function(attrib) {
        return false;
      },

      isUsingIndices: function() {
        return false;
      },

      getItemSize: function(attrib) {
        if (attrib == 'Position') {
          return 3;
        } else if (attrib == 'Color') {
          return 4;
        } else if (attrib == 'TextureCoord') {
          return 2;
        } else if (attrib == 'Layer') {
          return 1;
        } else if (attrib == 'Normal') {
          return 3;
        } else if (attrib == 'JointPosition') {
          return 4;
        } else {
          return 1;
        }
      },

      getAttribData: function() {
        console.error('forgot to implement getAttribData in child mesh');
      },

      getShaderName: function() {
        console.error('forgot to implement getShaderName in child mesh');
      },

      getPosition: function() {
        console.error('forgot to implement getPosition in child mesh');
      },

      getRotation: function() {
        console.error('forgot to implement getRotation in child mesh');
      },

      getTextures: function() {
        return [];
      }
    });
  }
);
