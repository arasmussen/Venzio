var terrain = {
  shader: null,
  vbo: {},
  
  initialize: function() {
    this.initializeShaders();
    this.initializeBuffers();
  },

  initializeShaders: function() {
    this.shader = new Shader('terrain-vs', 'terrain-fs');
    this.shader.addAttributes(['Position', 'Color']);
    this.shader.addUniforms(['uMVMatrix', 'uPMatrix']);
  },

  initializeBuffers: function() {
    this.vbo.position = gl.createBuffer();
    this.vbo.color = gl.createBuffer();

    // fill the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.position);
    var vertices = [
      0.0, 2.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vbo.position.itemSize = 3;

    // fill the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.color);
    var colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    this.vbo.color.itemSize = 4;

    this.vbo.numItems = 3;
  },

  draw: function() {
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
  },

  setMatrixUniforms: function() {
    gl.uniformMatrix4fv(this.shader.getUniform('uPMatrix'), false, pMatrix);
    gl.uniformMatrix4fv(this.shader.getUniform('uMVMatrix'), false, mvMatrix);
  }
};
