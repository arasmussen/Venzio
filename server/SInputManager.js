define(function() {
  return {
    up: false,
    left: false,
    down: false,
    right: false,
    space: false,

    subscriptions: {},

    subscribe: function(key, callback) {
      if (this.subscriptions[key] == undefined) {
        this.subscriptions[key] = callback;
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
      return {x: 0, y: 0};
    },

    handleInput: function(bitArray) {
      this.up = (0x01 & bitArray ? true : false);
      this.left = (0x02 & bitArray ? true : false);
      this.down = (0x04 & bitArray ? true : false);
      this.right = (0x08 & bitArray ? true : false);
      this.space = (0x10 & bitArray ? true : false);
    }
  };
});
