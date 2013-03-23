define([
    'client/NetworkManager',
    'client/GraphicsManager',
    'client/CInputManager',
    'client/Game',
    'client/util/Framerate',
    'client/util/Ping'
  ],
  function(NetworkManager, GraphicsManager, InputManager, Game, Framerate, Ping) {
    window.requestAnimFrame = (function() {
      return window.requestAnimationFrame ||
             window.webkitRequestAnimationFrame ||
             window.mozRequestAnimationFrame ||
             window.oRequestAnimationFrame ||
             window.msRequestAnimationFrame ||
             function(callback, element) {
               return window.setTimeout(callback, 1000/60);
             };
    })();
    window.cancelAnimFrame = (function() {
      return window.cancelAnimationFrame ||
             window.webkitCancelAnimationFrame ||
             window.mozCancelAnimationFrame ||
             window.oCancelAnimationFrame ||
             window.msCancelAnimationFrame ||
             window.clearTimeout;
    })();

    return function() {
      // set up WebGL context
      var canvas = document.getElementById('canvas');
      if (GraphicsManager.initialize(canvas) != GraphicsManager.statusCodes.SUCCESS) {
        console.log('Could not initialize WebGL');
        return;
      }

      InputManager.initialize(canvas);

      var game = new Game();
      var framerate = new Framerate('framerate');
      var ping = new Ping('ping', game.networkManager);
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
  }
);
