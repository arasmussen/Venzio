// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'db',
    'url',
    'model/player'
  ],
  function(Base, db, url, playerModel) {
    return Base.extend({
      constructor: function(request, response, player) {
        this.response = response;
        this.player = player;
      },

      handle: function() {
        this.player.logout();
        this.response.writeHead(302, {
          'Content-Type': 'text/plain',
          'Location': '/',
          'Set-Cookie': 'sessid=; HttpOnly'
        });
        this.response.end();
      }
    });
  }
);

