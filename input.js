var input = {
  canvas: null,
  keys: [],
  mouseDelta: [0, 0],
  pointerLocked: false,

  initialize: function(canvas) {
    this.canvas = canvas;

    this.initializeKeyInput();
    this.initializeMouseInput();
    this.initializePointerLock();
  },

  initializeKeyInput: function() {
    document.onkeydown = function(e) {
      this.keys[e.keyCode] = true;
    }.bind(this);
    document.onkeyup = function(e) {
      this.keys[e.keyCode] = false;
    }.bind(this);
  },

  initializeMouseInput: function() {
    document.onmousemove = function(e) {
      if (this.pointerLocked === true) {
        var movement = {
          x: e.movementX || e.mozMovementX || e.webkitMovementX,
          y: e.movementY || e.mozMovementY || e.webkitMovementY
        };
        this.mouseDelta[0] += movement.x;
        this.mouseDelta[1] += movement.y;
      }
    }.bind(this);
  },

  initializePointerLock: function() {
    this.canvas.requestPointerLock =
      this.canvas.requestPointerLock ||
      this.canvas.mozRequestPointerLock ||
      this.canvas.webkitRequestPointerLock;
    this.canvas.onclick = function() {
      this.canvas.requestPointerLock();
    }.bind(this);

    var pointerLockChangeHandler = function() {
      var lockElement =
        document.pointerLockElement ||
        document.mozPointerLockElement ||
        document.webkitPointerLockElement;

      if (lockElement === this.canvas) {
        this.pointerLocked = true;
      } else {
        this.pointerLocked = false;
      }
    }.bind(this);
    document.onpointerlockchange = pointerLockChangeHandler;
    document.onmozpointerlockchange = pointerLockChangeHandler;
    document.onwebkitpointerlockchange = pointerLockChangeHandler;
  },

  getMouseDelta: function() {
    var temp = this.mouseDelta.slice(0);
    this.mouseDelta[0] = 0;
    this.mouseDelta[1] = 0;
    return temp;
  },

  isKeyPressed: function(keyCode) {
    if (this.keys[keyCode] == undefined) {
      this.keys[keyCode] = false;
    }
    return this.keys[keyCode];
  },

  isPointerLocked: function() {
    return this.pointerLocked;
  }
}
