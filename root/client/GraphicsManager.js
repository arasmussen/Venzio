// Copyright (c) Venzio 2013 All Rights Reserved

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
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      return this.statusCodes.SUCCESS;
    },

    setupWebGL: function(canvas) {
      if (!window.WebGLRenderingContext) {
        return this.statusCodes.BAD_BROWSER; // http://get.webgl.org
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
