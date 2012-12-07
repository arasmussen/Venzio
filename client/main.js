window.onload = init;

var camera;
var canvas;
var framerate;
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

  camera = new Camera({x: 0.0, y: -10.0, z: -10.0});
  framerate = new Framerate('framerate');

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  render();
}

function render() {
  framerate.snapshot();

  handleInput();
  updateWorld();
  drawWorld();

  window.requestAnimFrame(render, canvas);
}

function handleInput() {
  camera.handleInput();
}

function updateWorld() {
}

function drawWorld() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
  mat4.identity(mvMatrix);

  camera.transform();
  terrain.draw();
}
