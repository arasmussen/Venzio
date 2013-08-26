// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'client/NetworkManager',
    'client/GraphicsManager',
    'client/CInputManager',
    'client/CTerrainManager',
    'client/Game',
    'client/TextureManager',
    'client/MeshManager',
    'common/Globals'
  ],
  function(NetworkManager, GraphicsManager, InputManager, CTerrainManager, Game, TextureManager, MeshManager, Globals) {
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

    var createGLContext = function(canvas) {
      return (GraphicsManager.initialize(canvas) == GraphicsManager.statusCodes.SUCCESS);
    }

    var loadingHeader = $('#loading h3');
    var loadingDone = $('#loading-done');
    var loadingToDo = $('#loading-todo');
    var imageWidth = 264;

    var updateMessage = function(message) {
      loadingHeader.html(message);
      console.log(message);
    }

    var updateLoadingBar = function(amount) { // amount is between 0 and 1
      var width = Math.floor(amount * imageWidth);
      loadingDone.animate({width: width + 'px'}, 120);
      loadingToDo.animate({width: (imageWidth - width) + 'px', left: width + 'px'}, 120);
    }

    var canvas = document.getElementById('canvas');
    var networkManager = new NetworkManager();
    var terrainManager;
    var game;

    var steps = [
      {
        func: function() {
          var gotWebGL = GraphicsManager.initialize(canvas);
          if (gotWebGL == GraphicsManager.statusCodes.SUCCESS) {
            setTimeout(main.bind(null, true), 0);
          } else {
            setTimeout(main.bind(null, false), 0);
          }
        },
        initMessage: 'Creating WebGL context...',
        successMessage: 'WebGL context created',
        failureMessage: 'Couldn\'t create WebGL context'
      },
      {
        func: function() {
          if (Globals.multiplayer) {
            networkManager.connect(callback);
          } else {
            setTimeout(main.bind(null, true), 0);
          }
        },
        initMessage: 'Connecting to server...',
        successMessage: 'Connected to server',
        failureMessage: 'Couldn\'t connect to server'
      },
      {
        func: function() {
          TextureManager.initialize(main.bind(null, true));
        },
        initMessage: 'Loading textures...',
        successMessage: 'Textures loaded',
        failureMessage: 'Couldn\'t load textures'
      },
      {
        func: function() {
          MeshManager.initialize(main.bind(null, true));
        },
        initMessage: 'Loading meshes...',
        successMessage: 'Meshes loaded',
        failureMeshes: 'Couldn\'t load meshes'
      },
      {
        func: function() {
          InputManager.initialize(canvas);
          setTimeout(main.bind(null, true), 0);
        },
        initMessage: 'Initializing input...',
        successMessage: 'Input initialized',
        failureMessage: 'Couldn\'t initialize input'
      },
      {
        func: function() {
          terrainManager = new CTerrainManager(main);
        },
        initMessage: 'Initializing terrain...',
        successMessage: 'Terrain initialized',
        failureMessage: 'Couldn\'t initialize terrain'
      },
      {
        func: function() {
          game = new Game(networkManager, terrainManager);
          setTimeout(main.bind(null, true), 0);
        },
        initMessage: 'Initializing game...',
        successMessage: 'Game initialized',
        failureMessage: 'Couldn\'t initialize game'
      },
      {
        func: function() {
          game.start();
          setTimeout(main.bind(null, true), 0);
        },
        initMessage: 'Starting game...',
        successMessage: 'Game started',
        failureMessage: 'Couldn\'t start game'
      }
    ];

    var step = 0;
    var main = function(success) {
      if (step > 0 || success != undefined) {
        if (success) {
          updateMessage(steps[step].successMessage);
          step++;
        } else {
          updateMessage(steps[step].failureMessage);
          return; // exit
        }
      }

      if (step < steps.length) {
        updateMessage(steps[step].initMessage);
        updateLoadingBar((step + 1) / steps.length);
        steps[step].func();
      } else {
        $('#loading').remove(); // kill load screen

        var lastFrameTime = new Date();
        var baseLoop = function() {
          window.requestAnimFrame(baseLoop, canvas);

          var currentTime = new Date();
          var tslf = (currentTime.getTime() - lastFrameTime.getTime()) / 1000;
          if (tslf > 0.1) {
            tslf = 0.1;
          }
          lastFrameTime = currentTime;

          game.mainLoop(tslf);
        };
        baseLoop();
      }
    }

    return main;
  }
);
