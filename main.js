window.onload = init;

var gl;
var shaderProgram;
var pMatrix = mat4.create();
var mvMatrix = mat4.create();
var terrainVBO;
var cameraPosition = [0, 0, -5.0];

function getShader(id) {
  var shaderElement = document.getElementById(id);
  if (!shaderElement) {
    return null;
  }

  var source = "";
  var child = shaderElement.firstChild;
  while (child) {
    if (child.nodeType == 3) {
      source += child.textContent;
    }
    child = child.nextSibling;
  }

  var shader;
  if (shaderElement.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderElement.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function initShaders() {
  var fragmentShader = getShader('shader-fs');
  var vertexShader = getShader('shader-vs');

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Could not initialize shaders');
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    'aVertexPosition'
  );
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(
    shaderProgram,
    'aVertexColor'
  );
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uPMatrix'
  );
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(
    shaderProgram,
    'uMVMatrix'
  );
}

function initBuffer() {
  // create our buffers
  terrainVBO = {
    position: gl.createBuffer(),
    color: gl.createBuffer()
  };

  // fill the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBO.position);
  var vertices = [
    0.0, 2.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  terrainVBO.position.itemSize = 3;

  // fill the color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBO.color);
  var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  terrainVBO.color.itemSize = 4;

  terrainVBO.numItems = 3;
}

function init() {
  // get handle to the canvas
  var canvas = document.getElementById('canvas');

  input.initialize(canvas);

  // create our gl context
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return;
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  initShaders();
  initBuffer();

  var framerate = new Framerate('framerate');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // render loop
  var f = function() {
    // call our render function
    render();

    // update the framerate
    framerate.snapshot();

    // call this function again when we're ready for a new frame
    window.requestAnimFrame(f, canvas);
  }
  f();
}

function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function render() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (input.isKeyPressed(37) || input.isKeyPressed(65)) {
    cameraPosition[0] += 0.1;
  }
  if (input.isKeyPressed(39) || input.isKeyPressed(68)) {
    cameraPosition[0] -= 0.1;
  }
  if (input.isKeyPressed(38) || input.isKeyPressed(87)) {
    cameraPosition[2] += 0.1;
  }
  if (input.isKeyPressed(40) || input.isKeyPressed(83)) {
    cameraPosition[2] -= 0.1;
  }

  mat4.perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, cameraPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBO.position);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    terrainVBO.position.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVBO.color);
  gl.vertexAttribPointer(
    shaderProgram.vertexColorAttribute,
    terrainVBO.color.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, terrainVBO.numItems);
}
