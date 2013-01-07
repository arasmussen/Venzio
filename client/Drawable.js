function Drawable(shaderName, attributes, usingIndices) {
  this.position = {x: 0.0, y: 0.0, z: 0.0};
  this.rotation = {pitch: 0.0, yaw: 0.0};
  this.attributes = attributes;
  this.usingIndices = usingIndices;
  this.buffers = {};
  this.shaderName = shaderName;
}

Drawable.prototype.initialize = function() {
  this.initializeShaders();
  this.initializeBuffers();
};

Drawable.prototype.initializeShaders = function() {
  this.shader = new Shader(this.shaderName);
  this.shader.addAttributes(this.attributes);
  this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
};

Drawable.prototype.initializeBuffers = function() {
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
};

Drawable.prototype.draw = function() {
  this.preDraw();

  for (var i in this.attributes) {
    var attrib = this.attributes[i];

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[attrib]);
    gl.vertexAttribPointer(
      this.shader.getAttribute(attrib),
      this.getItemSize(attrib),
      this.getAttribType(attrib),
      false,
      0,
      0
    );
  }

  if (this.usingIndices) {
    gl.drawElements(
      gl.TRIANGLES,
      this.getNumItems(),
      gl.UNSIGNED_SHORT,
      0
    );
  } else {
    gl.drawArrays(gl.TRIANGLES, 0, this.getNumItems());
  }

  this.postDraw();
};

Drawable.prototype.preDraw = function() {
  this.transform();
  this.shader.use();
  this.setMatrixUniforms();
};

Drawable.prototype.postDraw = function() {
  this.untransform();
};

Drawable.prototype.transform = function() {
  var translate = [-this.position.x, -this.position.y, -this.position.z];
  mat4.translate(mvMatrix, translate);
  mat4.rotate(mvMatrix, this.rotation.pitch, [1, 0, 0]);
  mat4.rotate(mvMatrix, -this.rotation.yaw, [0, 1, 0]);
};

Drawable.prototype.untransform = function() {
  var translate = [this.position.x, this.position.y, this.position.z];
  mat4.rotate(mvMatrix, this.rotation.yaw, [0, 1, 0]);
  mat4.rotate(mvMatrix, -this.rotation.pitch, [1, 0, 0]);
  mat4.translate(mvMatrix, translate);
};

Drawable.prototype.setMatrixUniforms = function() {
  gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
  gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
};