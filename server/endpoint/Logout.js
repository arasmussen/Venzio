// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs'
  ],
  function(Base) {
    return Base.extend({
      constructor: function(request) {
        this.request = request;
      },

      handle: function() {
        if (this.request.user) {
          this.request.user.logout();
        }
        this.request
          .setCookie('ssid', '')
          .respond302('/');
      }
    });
  }
);

