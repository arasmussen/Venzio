// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'model/session',
  ],
  function(Base, sessionModel) {
    return Base.extend({
      constructor: function(request) {
        var urlParams = request.getURLParams();
        this.email = urlParams.email;
        this.password = urlParams.password;
        this.request = request;
      },

      handle: function() {
        var session = this.request.session;
        session.creds.push({email: this.email, password: this.password});
        this.request.respond302('/');
      }
    });
  }
);
