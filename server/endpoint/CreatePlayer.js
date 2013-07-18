// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'model/player'
  ],
  function(Base, playerModel) {
    return Base.extend({
      constructor: function(request) {
        var urlParams = request.getURLParams();
        this.username = urlParams.username;
        this.name = urlParams.name;
        this.email = urlParams.email;
        this.password = urlParams.password;
        this.request = request;
      },

      handle: function() {
        playerModel.create(this.username, this.name, this.email, this.password, this.respond.bind(this));
      },

      respond: function(msg, player) {
        if (!player) {
          this.request.respond302('/signup?failed=true');
          return;
        }

        this.request
          .setCookie('ssid', player.newSessionID())
          .respond302('/');
      }
    });
  }
);
