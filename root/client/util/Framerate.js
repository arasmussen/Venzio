// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
  ], function(Base) {
    return Base.extend({
      constructor: function(id) {
        this.id = id;

        this.framesSinceUpdate = 0;
        this.interval = 1000;

        setInterval(this.updateFramerate.bind(this), this.interval);
      },

      updateFramerate: function() {
        var framerate = this.framesSinceUpdate / (this.interval / 1000);
        this.framesSinceUpdate = 0;

        framerate = Math.round(framerate);
        document.getElementById(this.id).innerHTML = "fps: " + framerate;
      },

      snapshot: function() {
        this.framesSinceUpdate++;
      }
    });
  }
);
