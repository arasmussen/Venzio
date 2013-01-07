function Terrain(position) {
  this.position = position;
  this.shader = null;
  this.vbo = {};
  this.heights = [];
  this.width = 128;
  this.length = 128;
}

Terrain.prototype.initialize = function() {
  this.initializeShaders();
  this.initializeHeights();
  this.initializeBuffers();
};

Terrain.prototype.initializeShaders = function() {
  this.shader = new Shader('terrain');
  this.shader.addAttributes(['Position', 'Color']);
  this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
};

Terrain.prototype.initializeHeights = function() {
  // make a random cool height function
  for (var x = 0; x < this.width + 1; x++) {
    this.heights[x] = [];
    for (var z = 0; z < this.length + 1; z++) {
      this.heights[x][z] =
        (x - this.width / 2) * (x - this.width / 2) / this.width -
        (z - this.length / 2) / 2;
    }
  }
};

Terrain.prototype.initializeBuffers = function() {
  this.vbo.position = gl.createBuffer();
  this.vbo.color = gl.createBuffer();

  // fill the position buffer

  var vertices = [];
  var colors = [];
  for (var x = 0; x < this.width; x++) {
    for (var z = 0; z < this.length; z++) {
      vertices.push(
        x - this.width / 2, this.heights[x][z], z - this.length / 2,
        x + 1 - this.width / 2, this.heights[x + 1][z], z - this.length / 2,
        x - this.width / 2, this.heights[x][z + 1], z + 1 - this.length / 2,
        x - this.width / 2, this.heights[x][z + 1], z + 1 - this.length / 2,
        x + 1 - this.width / 2, this.heights[x + 1][z], z - this.length / 2,
        x + 1 - this.width / 2, this.heights[x + 1][z + 1], z + 1 - this.length / 2
      );
      colors.push(
        x % 2, x / this.width, z % 2, 1.0,
        (x + 1) % 2, x / this.width, z % 2, 1.0,
        x % 2, x / this.width, (z + 1) % 2, 1.0,
        x % 2, x / this.width, (z + 1) % 2, 1.0,
        (x + 1) % 2, x / this.width, z % 2, 1.0,
        (x + 1) % 2, x / this.width, (z + 1) % 2, 1.0
      );
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  this.vbo.position.itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  this.vbo.color.itemSize = 4;

  this.vbo.numItems = 6 * x * z;
};

Terrain.prototype.draw = function() {
  this.shader.use();

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
};

Terrain.prototype.setMatrixUniforms = function() {
  gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
  gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
};

