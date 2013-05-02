// Copyright (c) Venzio 2013 All Rights Reserved

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

    var createGLContext = function(canvas, callback) {
      if (GraphicsManager.initialize(canvas) == GraphicsManager.statusCodes.SUCCESS) {
        setTimeout(callback.bind(null, true), 0);
      } else {
        setTimeout(callback.bind(null, false), 0);
      }
    }

    var connectSocket = function(networkManager, callback) {
      networkManager.connect(callback);
    }

    var handleFailure = function(pass) {
      if (pass == -1) {
        console.log('main was called with a value of false');
      } else if (pass == 0) {
        console.log('WebGL context couldn\'t be created');
      } else if (pass == 1) {
        console.log('Couldn\'t connect to the server');
        setTimeout(main.bind(null, true), 0); // play anyways...
      }
    }

    var loadingHeader = $('#loading h3');
    var loadingDone = $('#loading-done');
    var loadingToDo = $('#loading-todo');
    var imageWidth = 265;

    var updateLoadingBar = function(width) {
      loadingDone.animate({width: width + 'px'});
      loadingToDo.animate({width: (imageWidth - width) + 'px', left: width + 'px'});
    }

    var handleSuccess = function(pass) {
      if (pass == -1) {
        updateLoadingBar(imageWidth * 0.2);
        loadingHeader.html('Setting up WebGL context');
      } else if (pass == 0) {
        updateLoadingBar(imageWidth * 0.7);
        loadingHeader.html('Connecting to server');
      } else if (pass == 1) {
        updateLoadingBar(imageWidth);
        setTimeout(function() {$('#loading').remove();}, 500);
        loadingHeader.html('Starting game');
      }
    }

    var pass = -1;
    var canvas = document.getElementById('canvas');
    var networkManager = new NetworkManager();

    var main = function(success) {
      if (!success) {
        handleFailure(pass);
        return;
      } else {
        handleSuccess(pass);
      }

      pass++;

      if (pass == 0) {
        createGLContext(canvas, main, pass);
      } else if (pass == 1) {
        connectSocket(networkManager, main, pass);
      } else {
        InputManager.initialize(canvas);

        var game = new Game(networkManager);
        var framerate = new Framerate('framerate');
        var ping = new Ping('ping', networkManager);
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
    return main;
  }
);
