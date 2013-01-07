function Cube(position, rotation) {
  this.position = position;
  this.rotation = rotation;
  this.shader = null;
  this.vbo = {};
  this.ibo = {};

  this.initializeShaders();
  this.initializeBuffers();
}

Cube.prototype.initializeShaders = function() {
  this.shader = new Shader('cube');
  this.shader.addAttributes(['Position', 'Color']);
  this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
};

Cube.prototype.initializeBuffers = function() {
  this.vbo.position = gl.createBuffer();
  this.vbo.color = gl.createBuffer();
  this.ibo = gl.createBuffer();

  // fill the position buffer

  var vertices = [
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, 0.5, 0.5
  ];
  var colors = [
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 1.0, 1.0
  ];
  var indices = [
    0, 1, 2, 1, 2, 3, // left
    2, 3, 6, 3, 6, 7, // top
    6, 7, 4, 7, 4, 5, // right
    4, 5, 0, 5, 0, 1, // bottom
    0, 2, 4, 2, 4, 6, // front
    1, 3, 5, 3, 5, 7 // back
  ];

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.vbo.position.itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  this.vbo.color.itemSize = 4;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  this.ibo.numItems = indices.length;
};

Cube.prototype.draw = function() {
  this.transform();

  this.shader.use();
  this.setMatrixUniforms();

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.position);
  gl.vertexAttribPointer(
    this.shader.getAttribute('Position'),
    this.vbo.position.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.color);
  gl.vertexAttribPointer(
    this.shader.getAttribute('Color'),
    this.vbo.color.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.drawElements(gl.TRIANGLES, this.ibo.numItems, gl.UNSIGNED_SHORT, 0);

  this.untransform();
};

Cube.prototype.transform = function() {
  var translate = [
    -this.position.x,
    -this.position.y,
    -this.position.z
  ];
  mat4.translate(mvMatrix, translate);
  mat4.rotate(mvMatrix, this.rotation.pitch, [1, 0, 0]);
  mat4.rotate(mvMatrix, -this.rotation.yaw, [0, 1, 0]);
};

Cube.prototype.untransform = function() {
  var translate = [
    this.position.x,
    this.position.y,
    this.position.z
  ];
  mat4.rotate(mvMatrix, this.rotation.yaw, [0, 1, 0]);
  mat4.rotate(mvMatrix, -this.rotation.pitch, [1, 0, 0]);
  mat4.translate(mvMatrix, translate);
};

Cube.prototype.setMatrixUniforms = function() {
  gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
  gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
};
