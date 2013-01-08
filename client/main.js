window.onload = main;

function main() {
  canvas = document.getElementById('canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return;
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  input.initialize(canvas);

  var game = new Game();
  var framerate = new Framerate('framerate');

  var baseLoop = function() {
    framerate.snapshot();
    game.mainLoop();
    window.requestAnimFrame(baseLoop, canvas);
  };
  baseLoop();
}
