// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'db',
    'url',
    'model/player'
  ],
  function(Base, db, url, playerModel) {
    return Base.extend({
      constructor: function(request, response) {
        this.response = response;
      },

      handle: function() {
        this.response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': '/',
          'Set-Cookie': 'sessid=; HttpOnly'
        });
        this.response.end();
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

