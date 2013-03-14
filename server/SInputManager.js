define([
    'basejs',
  ], function(Base) {
    return Base.extend({
      up: false,
      left: false,
      down: false,
      right: false,
      space: false,
      mouseDelta: {
        x: 0,
        y: 0
      },

      subscriptions: {},

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

      isLeftPressed: function() {
        return this.left;
      },

      isRightPressed: function() {
        return this.right;
      },

      isDownPressed: function() {
        return this.down;
      },

      isUpPressed: function() {
        return this.up;
      },

      isSpacePressed: function() {
        return this.space;
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

      handleInput: function(input) {
        this.up = (0x01 & input.bitArray ? true : false);
        this.left = (0x02 & input.bitArray ? true : false);
        this.down = (0x04 & input.bitArray ? true : false);
        this.right = (0x08 & input.bitArray ? true : false);
        this.space = (0x10 & input.bitArray ? true : false);
        this.mouseDelta.x += input.mouseDelta.x;
        this.mouseDelta.y += input.mouseDelta.y;
      }
    });
  }
);
