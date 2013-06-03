define([
    'basejs',
    'common/InputGlobals'
  ], function(Base, InputGlobals) {
    // TODO: make a base class in common that both client and server input
    // managers both extend
    return Base.extend({
      constructor: function() {
        this.bitArray = 0;
        this.mouseDelta = {
          x: 0,
          y: 0
        };
        this.mouseClicks = {left: 0, right: 0};
        this.subscriptions = [];
        this.processQueue = [];
      },

      subscribe: function(key, callback) {
        if (this.subscriptions[key] == undefined) {
          this.subscriptions[key] = [callback];
        } else {
          if (this.subscriptions[key].indexOf(callback) == -1) {
            this.subscriptions[key].push(callback);
          }
        }
      },

      unsubscribe: function(key, callback) {
        if (this.subscriptions[key] == undefined ||
            this.subscriptions[key].indexOf(callbacK) == -1) {
          return;
        }
        this.subscriptions.splice(this.subscriptions.indexOf(callback), 1);
      },

      isPressed: function(input) {
        return Boolean(input & this.bitArray);
      },

      getMouseDelta: function() {
        var ret = {
          x: this.mouseDelta.x,
          y: this.mouseDelta.y,
        };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return ret;
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

      handleInput: function(input) {
        this.bitArray = input.bitArray;
        this.mouseDelta.x += input.mouseDelta.x;
        this.mouseDelta.y += input.mouseDelta.y;

        // TODO: refactor
        if (this.isPressed(InputGlobals.TOGGLE_BUILD)) {
          if (this.processQueue.indexOf(InputGlobals.TOGGLE_BUILD) == -1) {
            this.processQueue.push(InputGlobals.TOGGLE_BUILD);
          }
        }
        if (this.isPressed(InputGlobals.TOGGLE_CAMERA)) {
          if (this.processQueue.indexOf(InputGlobals.TOGGLE_CAMERA) == -1) {
            this.processQueue.push(InputGlobals.TOGGLE_CAMERA);
          }
        }
      },

      update: function() {
        this.processSubscriptionQueue()
      },

      processSubscriptionQueue: function() {
        // TODO: maybe refactor
        for (var i in this.processQueue) {
          var keyPressed = this.processQueue[i];
          for (var i in this.subscriptions[keyPressed]) {
            this.subscriptions[keyPressed][i]();
          }
        }
        this.processQueue = [];
      }
    });
  }
);
