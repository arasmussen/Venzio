function Cube(position) {
  this.position = position;
  this.shader = null;
  this.vbo = {};
}

Cube.prototype.initialize = function() {
  this.initializeShaders();
  this.initializeBuffers();
};

Cube.prototype.initializeShaders = function() {
  this.shader = new Shader('terrain-vs', 'terrain-fs');
  this.shader.addAttributes(['Position', 'Color']);
  this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
};

Cube.prototype.initializeBuffers = function() {
  this.vbo.position = gl.createBuffer();
  this.vbo.color = gl.createBuffer();

  // fill the position buffer

  var vertices = [];
  var colors = [];
  for (var x = 0; x < 2; x++) {
    for (var y = 0; y < 2; y++) {
      for (var z = 0; z < 2; z++) {
        vertices.push(
          x, y, z,
          (x + 1) % 2, y, z,
          x, (y + 1) % 2, z,
          x, y, z,
          (x + 1) % 2, y, z,
          x, y, (z + 1) % 2,
          x, y, z,
          x, (y + 1) % 2, z,
          x, y, (z + 1) % 2
        );
        colors.push(
          x / 2, y / 2, z / 2, 1.0,
          (x + 1) / 3, y / 2, z / 2, 1.0,
          x / 2, (y + 1) / 3, z / 2, 1.0,
          x / 2, y / 2, z / 2, 1.0,
          (x + 1) / 3, y / 2, z / 2, 1.0,
          x / 2, y / 2, (z + 1) / 3, 1.0,
          x / 2, y / 2, z / 2, 1.0,
          x / 2, (y + 1) / 3, z / 2, 1.0,
          x / 2, y / 2, (z + 1) / 3, 1.0
        );
      }
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.vbo.position.itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  this.vbo.color.itemSize = 4;

  this.vbo.numItems = 72;
};

Cube.prototype.draw = function() {
  this.transform();

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

  this.setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, this.vbo.numItems);

  this.untransform();
};

Cube.prototype.transform = function() {
  var translate = [
    this.position.x,
    this.position.y,
    this.position.z
  ];
  mat4.translate(mvMatrix, translate);
};

Cube.prototype.untransform = function() {
  var translate = [
    -this.position.x,
    -this.position.y,
    -this.position.z
  ];
  mat4.translate(mvMatrix, translate);
};

Cube.prototype.setMatrixUniforms = function() {
  gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
  gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
};
