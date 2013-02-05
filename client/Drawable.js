var Drawable = Base.extend({
  constructor: function(usingIndices) {
    this.position = {x: 0.0, y: 0.0, z: 0.0};
    this.rotation = {pitch: 0.0, yaw: 0.0};
    this.usingIndices = usingIndices;
    this.buffers = {};
    this.textures = {};
  },

  initialize: function() {
    this.initializeShaders();
    this.initializeBuffers();
    this.initializeTextures();
  },

  initializeShaders: function() {
    this.shader = ShaderManager.getShader(this.getShaderName());
  },

  initializeBuffers: function() {
    var attributes = this.shader.getAttributes();
    for (var i in attributes) {
      var attrib = attributes[i];

      // create buffer
      this.buffers[attrib] = gl.createBuffer();

      // pass data to gl context
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
      gl.bufferData(gl.ARRAY_BUFFER, this.getData(attrib), gl.STATIC_DRAW);
    }

    if (this.usingIndices) {
      // create the buffer
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
    var attributes = this.shader.getAttributes();
    for (var i in attributes) {
      var attrib = attributes[i];

      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
      gl.vertexAttribPointer(
        this.shader.getAttribute(attrib),
        this.getItemSize(attrib),
        gl.FLOAT,
        false,
        0,
        0
      );
    }

    if (this.usingIndices) {
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

    if (this.usingIndices) {
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
    this.shader.use();
    this.setMatrixUniforms();
  },

  postDraw: function() {
    this.untransform();
  },

  transform: function() {
    var translate = [this.position.x, this.position.y, this.position.z];
    mat4.translate(mvMatrix, translate);
    mat4.rotate(mvMatrix, this.rotation.yaw, [0, 1, 0]);
    mat4.rotate(mvMatrix, this.rotation.pitch, [1, 0, 0]);
  },

  untransform: function() {
    var translate = [-this.position.x, -this.position.y, -this.position.z];
    mat4.rotate(mvMatrix, -this.rotation.pitch, [1, 0, 0]);
    mat4.rotate(mvMatrix, -this.rotation.yaw, [0, 1, 0]);
    mat4.translate(mvMatrix, translate);
  },

  setMatrixUniforms: function() {
    gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
    gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
  },

  getDrawMode: function() {
    return gl.TRIANGLES;
  },

  getItemSize: function(attrib) {
    if (attrib == 'Position') {
      return 3;
    } else if (attrib == 'Color') {
      return 4;
    } else if (attrib == 'TextureCoord') {
      return 2;
    }
  },

  getShaderName: function() {
    console.log('forgot to implement getShaderName in child');
    return 'color';
  },

  getTextures: function() {
    return [];
  }
});
