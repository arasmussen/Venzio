function Shader(name) {
  var vSource = this.getShaderSource('/shaders/' + name + '-vs.glsl');
  var vShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vShader, vSource);
  gl.compileShader(vShader);
  if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
    console.log('Compile failed: ' + name + ' [vertex]');
    return null;
  }

  var fSource = this.getShaderSource('/shaders/' + name + '-fs.glsl');
  var fShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fShader, fSource);
  gl.compileShader(fShader);
  if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
    console.log('Compile failed: ' + name + ' [fragment]');
    return null;
  }

  this.program = gl.createProgram();
  gl.attachShader(this.program, vShader);
  gl.attachShader(this.program, fShader);
  gl.linkProgram(this.program);
  if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
    alert('Could not initialize shaders');
  }
}

Shader.prototype.use = function() {
  gl.useProgram(this.program);
};

Shader.prototype.getAttribute = function(attr) {
  return this.program[attr];
};

Shader.prototype.getUniform = function(uni) {
  return this.program[uni];
};

Shader.prototype.addAttributes = function(attrs) {
  this.use();
  attrs.forEach(function(attr) {
    this.program[attr] = gl.getAttribLocation(this.program, attr);
    gl.enableVertexAttribArray(this.program[attr]);
  }, this);
};

Shader.prototype.addUniforms = function(unis) {
  this.use();
  unis.forEach(function(uni) {
    this.program[uni] = gl.getUniformLocation(this.program, uni);
  }, this);
};

Shader.prototype.getShaderSource = function(url) {
  var source;
  $.ajax({
    async: false,
    url: url,
    success: function(data) {
      source = data;
    }
  });
  return source;
};
