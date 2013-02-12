function Shader(program) {
  this.program = program;
  this.attributes = [];
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

Shader.prototype.getAttributes = function() {
  return this.attributes;
};

Shader.prototype.addAttributes = function(attrs) {
  this.use();
  attrs.forEach(function(attr) {
    this.program[attr] = gl.getAttribLocation(this.program, attr);
    gl.enableVertexAttribArray(this.program[attr]);
  }, this);
  this.attributes = attrs;
};

Shader.prototype.addUniforms = function(unis) {
  this.use();
  unis.forEach(function(uni) {
    this.program[uni] = gl.getUniformLocation(this.program, uni);
  }, this);
};
