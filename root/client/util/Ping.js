// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
  ], function(Base) {
    return Base.extend({
      constructor: function(id, networkManager) {
        this.id = id;
        this.networkManager = networkManager;

        this.interval = 1000;
        setInterval(this.updatePing.bind(this), this.interval);
      },

      updatePing: function() {
        this.networkManager.pingServer(this.pingCallback.bind(this));
      },

      pingCallback: function(ping) {
        document.getElementById(this.id).innerHTML = "ping: " + ping;
      }
    });
  }
);
