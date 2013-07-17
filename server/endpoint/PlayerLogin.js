// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'url',
    'model/player'
  ],
  function(Base, url, playerModel) {
    return Base.extend({
      constructor: function(request, response, player) {
        urlParams = url.parse(request.url, true).query;
        this.emailOrUsername = urlParams.email_or_username;
        this.password = urlParams.password;
        this.response = response;
        this.player = player;
      },

      handle: function() {
        // if they're already logged in, redirect them to the homepage
        if (this.player) {
          this.response.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/'
          });
          this.response.end();
          return;
        }

        playerModel.login(this.emailOrUsername, this.password, this.respond.bind(this));
      },

      respond: function(msg, player) {
        if (player) {
          this.response.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/',
            'Set-Cookie': 'sessid=' + player.newSessionID() + '; HttpOnly'
          });
        } else {
          this.response.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/login?failed=true&username=' + encodeURIComponent(this.emailOrUsername)
          });
        }
        this.response.end();
      }
    });
  }
);
