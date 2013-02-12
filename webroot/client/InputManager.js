var InputManager = {
  canvas: null,
  keys: [],
  mouseDelta: {x: 0, y: 0},
  pointerLocked: false,
  processQueue: [],
  subscriptions: [],

  onKeyDown: function(e) {
    this.keys[e.keyCode] = true;
    if (this.subscriptions[e.keyCode] != undefined) {
      if (this.processQueue.indexOf(e.keyCode) == -1) {
        this.processQueue.push(e.keyCode);
      }
    }
  },

  onKeyUp: function(e) {
    this.keys[e.keyCode] = false;
  },

  onMouseMoved: function(e) {
    if (this.pointerLocked === true) {
      var movement = {
        x: e.movementX || e.mozMovementX || e.webkitMovementX,
        y: e.movementY || e.mozMovementY || e.webkitMovementY
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
    var input_bitmap =
      1 * (this.isKeyPressed(40) || this.isKeyPressed(83)) + // W/up
      2 * (this.isKeyPressed(37) || this.isKeyPressed(65)) + // A/left
      4 * (this.isKeyPressed(38) || this.isKeyPressed(87)) + // S/down
      8 * (this.isKeyPressed(39) || this.isKeyPressed(68)) + // D/right
      16 * (this.isKeyPressed(32)) +                         // space
      32 * (this.processQueue.indexOf(66) != -1) +           // B/build
      64 * (this.processQueue.indexOf(67) != -1);            // C/camera
    NetworkManager.sendMessage({inputBitmap: input_bitmap});
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
    this.mouseDelta = {x: 0, y: 0};
    return delta;
  },

  isKeyPressed: function(keyCode) {
    if (this.keys[keyCode] == undefined) {
      this.keys[keyCode] = false;
    }
    return this.keys[keyCode];
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
}
