// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'model/player'
  ],
  function(Base, playerModel) {
    return Base.extend({
      constructor: function(request) {
        var urlParams = request.getURLParams();
        this.emailOrUsername = urlParams.email_or_username;
        this.password = urlParams.password;
        this.request = request;
      },

      handle: function() {
        // if they're already logged in, redirect them to the homepage
        if (this.request.user) {
          this.request.respond302('/');
          return;
        }

        playerModel.login(this.emailOrUsername, this.password, this.respond.bind(this));
      },

      respond: function(msg, player) {
        if (!player) {
          this.request.respond302('/login?failed=true&username=' + encodeURIComponent(this.emailOrUsername));
          return;
        }

        this.request
          .setCookie('ssid', player.newSessionID())
          .respond302('/');
      }
    });
  }
);
