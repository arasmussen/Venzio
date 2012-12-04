function Shader(vertId, fragId) {
  var vertexShader = this.getShader(vertId);
  var fragmentShader = this.getShader(fragId);

  this.program = gl.createProgram();
  gl.attachShader(this.program, vertexShader);
  gl.attachShader(this.program, fragmentShader);
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

Shader.prototype.getShader = function(id) {
  var element = document.getElementById(id);
  if (!element) {
    return null;
  }

  var source = "";
  var child = element.firstChild;
  while (child) {
    if (child.nodeType == 3) {
      source += child.textContent;
    }
    child = child.nextSibling;
  }

  var shader;
  if (element.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (element.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('shader compile failed');
    return null;
  }

  return shader;
};
