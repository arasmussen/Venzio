define(function() {
  return {
    statusCodes: {
      SUCCESS: 0,
      BAD_BROWSER: 1,
      OTHER_PROBLEM: 2
    },

    initialize: function(canvas) {
      var status = this.setupWebGL(canvas);
      if (status != this.statusCodes.SUCCESS) {
        return status;
      }

      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
      gl.clearColor(0.5, 0.6, 1.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);

      return this.statusCodes.SUCCESS;
    },

    setupWebGL: function(canvas) {
      if (!window.WebGLRenderingContext) {
        return BAD_BROWSER; // http://get.webgl.org
      }

      gl = null;
      var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
      for (var i in names) {
        try {
          gl = canvas.getContext(names[i], null);
        } catch(e) {}
        if (gl) {
          break;
        }
      }

      if (gl == null) {
        return this.statusCodes.OTHER_PROBLEM; // http://get.webgl.org/troubleshooting/
      }

      return this.statusCodes.SUCCESS;
    }
  };
});