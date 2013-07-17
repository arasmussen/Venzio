// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'url',
    'model/player'
  ],
  function(Base, url, player) {
    return Base.extend({
      constructor: function(request, response) {
        urlParams = url.parse(request.url, true).query;
        this.username = urlParams.username;
        this.name = urlParams.name;
        this.email = urlParams.email;
        this.password = urlParams.password;
        this.response = response;
      },

      handle: function() {
        player.create(this.username, this.name, this.email, this.password, this.respond.bind(this));
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
            'Location': '/signup?failed=true'
          });
        }
        this.response.end();
      }
    });
  }
);

