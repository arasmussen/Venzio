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
        this.username = urlParams.name;
        this.name = urlParams.name;
        this.email = urlParams.email;
        this.password = urlParams.password;
        this.response = response;
      },

      handle: function() {
        player.create(this.username, this.name, this.email, this.password, this.respond.bind(this));
      },

      respond: function(response) {
        this.response.writeHead(200, {'Content-Type': 'text/plain'});
        this.response.end(response);
      }
    });
  }
);

