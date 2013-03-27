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

        this.initializeShaders();
        this.initializeBuffers();
        this.initializeTextures();
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
          this.textures[name].location = this.shader.getUniform(name + '_texture');
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

        this.bindTextures();
        this.bindAttributes();

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
        this.transform();
        this.shader.preDraw();
        this.setMatrixUniforms();
      },

      postDraw: function() {
        this.shader.postDraw();
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

      setMatrixUniforms: function() {
        gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
        gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
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
