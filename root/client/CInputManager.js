// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'common/InputGlobals',
    'common/Globals'
  ], function(InputGlobals, Globals) {
  return {
    canvas: null,
    keys: [],
    mouseClicks: {left: 0, right: 0},
    mouseDelta: {x: 0, y: 0},
    pointerLocked: false,
    processQueue: [],
    subscriptions: [],

    onKeyDown: function(e) {
      this.keys[e.keyCode] = true;

      // TODO: refactor
      if (e.keyCode == 66) {
        if (this.processQueue.indexOf(InputGlobals.TOGGLE_BUILD)) {
          this.processQueue.push(InputGlobals.TOGGLE_BUILD);
        }
      } else if (e.keyCode == 67) {
        if (this.processQueue.indexOf(InputGlobals.TOGGLE_CAMERA)) {
          this.processQueue.push(InputGlobals.TOGGLE_CAMERA);
        }
      }

      // eat spacebar so it doesn't scroll down
      return !(e.keyCode == 32);
    },

    onKeyUp: function(e) {
      this.keys[e.keyCode] = false;
      return true;
    },

    onMouseUp: function(e) {
      if (this.pointerLocked === true) {
        if (e.button == 0) {
          this.mouseClicks.left++;
        } else if (e.button == 1) {
          this.mouseClicks.right++;
        }
      }
    },

    onMouseDown: function(e) {
      // we'll need this soon
    },

    onMouseMoved: function(e) {
      if (this.pointerLocked === true) {
        var movement = {
          x: e.movementX || e.mozMovementX || e.webkitMovementX || 0,
          y: e.movementY || e.mozMovementY || e.webkitMovementY || 0
        };
        this.mouseDelta.x += movement.x;
        this.mouseDelta.y += movement.y;
      }
    },

    onCanvasClicked: function() {
      this.canvas.requestPointerLock();
    },

    onPointerLockChanged: function() {
      var lockElement =
        document.pointerLockElement ||
        document.mozPointerLockElement ||
        document.webkitPointerLockElement;

      if (lockElement === this.canvas) {
        this.pointerLocked = true;
      } else {
        this.pointerLocked = false;
      }
    },

    update: function() {
      this.sendServerMessage();
      this.processSubscriptionQueue();
    },

    sendServerMessage: function() {
      if (!Globals.multiplayer) {
        return;
      }

      // TODO: refactor
      var bitArray =
        InputGlobals.UP * this.isKeyPressed(40, 83) +
        InputGlobals.LEFT * this.isKeyPressed(37, 65) +
        InputGlobals.DOWN * this.isKeyPressed(38, 87) +
        InputGlobals.RIGHT * this.isKeyPressed(39, 68) +
        InputGlobals.SPACE * this.isKeyPressed(32) +
        InputGlobals.TOGGLE_BUILD *
          (this.processQueue.indexOf(InputGlobals.TOGGLE_BUILD) != -1) +
        InputGlobals.TOGGLE_CAMERA *
          (this.processQueue.indexOf(InputGlobals.TOGGLE_CAMERA) != -1);
      this.networkManager.sendMessage({
        input: {
          bitArray: bitArray,
          mouseDelta: {
            x: this.mouseDelta.x,
            y: this.mouseDelta.y
          }
        }
      });
    },

    processSubscriptionQueue: function() {
      for (var i in this.processQueue) {
        var keyPressed = this.processQueue[i];
        for (var i in this.subscriptions[keyPressed]) {
          this.subscriptions[keyPressed][i]();
        }
      }
      this.processQueue = [];
    },

    initialize: function(canvas) {
      this.canvas = canvas;

      // keyboard stuff
      document.onkeydown = this.onKeyDown.bind(this);
      document.onkeyup = this.onKeyUp.bind(this);

      // mouse stuff
      document.onmousedown = this.onMouseDown.bind(this);
      document.onmouseup = this.onMouseUp.bind(this);
      document.onmousemove = this.onMouseMoved.bind(this);

      // pointer lock stuff
      this.canvas.requestPointerLock =
        this.canvas.requestPointerLock ||
        this.canvas.mozRequestPointerLock ||
        this.canvas.webkitRequestPointerLock;
      this.canvas.onclick = this.onCanvasClicked.bind(this);
      document.onpointerlockchange = this.onPointerLockChanged.bind(this);
      document.onmozpointerlockchange = this.onPointerLockChanged.bind(this);
      document.onwebkitpointerlockchange = this.onPointerLockChanged.bind(this);
    },

    getMouseDelta: function() {
      var delta = {x: this.mouseDelta.x, y: this.mouseDelta.y};
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
      return delta;
    },

    getMouseClicks: function() {
      var clicks = {
        left: this.mouseClicks.left,
        right: this.mouseClicks.right
      };
      this.mouseClicks.left = 0;
      this.mouseClicks.right = 0;
      return clicks;
    },

    // TODO: refactor
    isPressed: function(input) {
      if (input == InputGlobals.LEFT) {
        return this.keys[37] || this.keys[65];
      } else if (input == InputGlobals.RIGHT) {
        return this.keys[39] || this.keys[68];
      } else if (input == InputGlobals.DOWN) {
        return this.keys[38] || this.keys[87];
      } else if (input == InputGlobals.UP) {
        return this.keys[40] || this.keys[83];
      } else if (input == InputGlobals.SPACE) {
        return this.keys[32];
      } else {
        console.log('unknown input...');
        return false;
      }
    },

    // TODO: fix the fact that there are two of these functions...
    isKeyPressed: function() {
      for (var i in arguments) {
        var keyCode = arguments[i];
        if (this.keys[keyCode] == undefined) {
          this.keys[keyCode] = false;
        }
        if (this.keys[keyCode]) {
          return true;
        }
      }
      return false;
    },

    isPointerLocked: function() {
      return this.pointerLocked;
    },

    subscribe: function(keyCode, func) {
      if (this.subscriptions[keyCode] == undefined) {
        this.subscriptions[keyCode] = [func];
      } else {
        if (this.subscriptions[keyCode].indexOf(func) == -1) {
          this.subscriptions[keyCode].push(func);
        }
      }
    },

    unsubscribe: function(keyCode, func) {
      if (this.subscriptions[keyCode] == undefined ||
          this.subscriptions[keyCode].indexOf(func) == -1) {
        return;
      }
      this.subscriptions.splice(this.subscriptions.indexOf(func), 1);
    }
  };
});
