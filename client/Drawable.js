var Drawable = Base.extend({
  constructor: function(usingIndices) {
    this.position = {x: 0.0, y: 0.0, z: 0.0};
    this.rotation = {pitch: 0.0, yaw: 0.0};
    this.usingIndices = usingIndices;
    this.buffers = {};
    this.textures = {};
  },

  initialize: function() {
    this.attributes = this.getAttributes();
    this.initializeShaders();
    this.initializeBuffers();
    this.initializeTextures();
  },

  initializeShaders: function() {
    this.shader = new Shader(this.getShaderName());
    this.shader.addAttributes(this.attributes);
    this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
  },

  initializeBuffers: function() {
    for (var i in this.attributes) {
      var attrib = this.attributes[i];

      // create buffer
      this.buffers[attrib] = gl.createBuffer();

      // pass data to gl context
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
      gl.bufferData(gl.ARRAY_BUFFER, this.getData(attrib), gl.STATIC_DRAW);
    }

    if (this.usingIndices) {
      // create the buffer
      this.buffers['index'] = gl.createBuffer();

      // pass data to gl context
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers['index']);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.getData('index'), gl.STATIC_DRAW);
    }
  },

  initializeTextures: function() {
    var textures = this.getTextures();
    var offset = 0;
    for (var i in textures) {
      var name = textures[i].name;
      this.shader.addUniforms([name + '_texture']);
      this.textures[name] = {};
      this.textures[name].texture = gl.createTexture();
      this.textures[name].offset = offset++;
      this.textures[name].location = this.shader.getUniform(name + '_texture');
      this.textures[name].loaded = false;
      this.textures[name].image = new Image();
      this.textures[name].image.onload = function(name) {
        this.onTextureLoaded(this.textures[name]);
      }.bind(this, name);
      this.textures[name].image.src =
        '/textures/' + name + '.' + textures[i].filetype;
    }
  },

  onTextureLoaded: function(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    texture.loaded = true;
  },

  bindTextures: function() {
    for (var name in this.textures) {
      gl.activeTexture(gl.TEXTURE0 + this.textures[name].offset);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[name].texture);
      gl.uniform1i(this.textures[name].location, this.textures[name].offset);
    }
  },

  bindAttributes: function() {
    for (var i in this.attributes) {
      var attrib = this.attributes[i];

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
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers['index']);
    }
  },

  areTexturesLoaded: function() {
    for (var name in this.textures) {
      if (!this.textures[name].loaded) {
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

  getAttributes: function() {
    return [];
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
    return 'default';
  },

  getTextures: function() {
    return [];
  }
});
