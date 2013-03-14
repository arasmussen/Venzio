define([
    'basejs'
  ], function(Base) {
    return Base.extend({
      bitArray: 0,
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

      handleInput: function(input) {
        this.bitArray = input.bitArray;
        this.mouseDelta.x += input.mouseDelta.x;
        this.mouseDelta.y += input.mouseDelta.y;
      }
    });
  }
);
