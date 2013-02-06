window.onload = main;

function main() {
  canvas = document.getElementById('canvas');

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return;
  }
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.clearColor(0.5, 0.6, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  input.initialize(canvas);

  var game = new Game();
  var framerate = new Framerate('framerate');
  var lastFrameTime = new Date();

  var baseLoop = function() {
    var currentTime = new Date();
    var tslf = (currentTime.getTime() - lastFrameTime.getTime()) / 1000;
    if (tslf > 0.1) {
      tslf = 0.1;
    }
    lastFrameTime = currentTime;

    framerate.snapshot();
    game.mainLoop(tslf);
    window.requestAnimFrame(baseLoop, canvas);
  };
  baseLoop();
}
