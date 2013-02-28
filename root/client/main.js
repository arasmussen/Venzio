define([
    'client/NetworkManager',
    'client/GraphicsManager',
    'client/CInputManager',
    'client/Game'
  ],
  function(NetworkManager, GraphicsManager, InputManager, Game) {
    return function() {
      // connect to the server
      NetworkManager.initialize();

      // set up WebGL context
      var canvas = document.getElementById('canvas');
      if (!GraphicsManager.initialize(canvas)) {
        console.log('Could not initialize WebGL');
        return;
      }

      InputManager.initialize(canvas);

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
  }
);
