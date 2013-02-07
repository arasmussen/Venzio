var GraphicsManager = {
  initialize: function(canvas) {
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
      return false;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.clearColor(0.5, 0.6, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    return true;
  }
};
