// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'url',
    'model/player'
  ],
  function(Base, url, playerModel) {
    return Base.extend({
      constructor: function(request, response) {
        urlParams = url.parse(request.url, true).query;
        this.emailOrUsername = urlParams.email_or_username;
        this.password = urlParams.password;
        this.response = response;
      },

      handle: function() {
        playerModel.login(this.emailOrUsername, this.password, this.respond.bind(this));
      },

      respond: function(msg, player) {
        if (player) {
          this.response.writeHead(302, {
            'Content-Type': 'text/plain',
            'Location': '/',
            'Set-Cookie': 'sessid=' + player.getSessionID() + '; HttpOnly'
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
