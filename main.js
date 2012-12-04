window.onload = init;

var canvas;
var gl;

var pMatrix = mat4.create();
var mvMatrix = mat4.create();

function init() {
  canvas = document.getElementById('canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return;
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  input.initialize();
  terrain.initialize();

  var framerate = new Framerate('framerate');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var f = function() {
    render();
    framerate.snapshot();
    window.requestAnimFrame(f, canvas);
  }
  f();
}

function render() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  handleInput();
  updateWorld();
  drawWorld();
}

function handleInput() {
  camera.handleInput();
}

function updateWorld() {
}

function drawWorld() {
  mat4.perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);

  camera.transform(mvMatrix);
  terrain.draw();
}
