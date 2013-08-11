// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'stripe',
    'server/LocalConfig'
  ],
  function(Base, stripe, config) {
    return Base.extend({
      constructor: function(request) {
        var urlParams = request.getURLParams();
        this.amount = urlParams.amount;
        this.token = urlParams.token;
        this.stripe = stripe(config.stripe.secret_key);
        this.request = request;
      },

      handle: function() {
        if (!this.errorCheck()) {
          this.request.respond404();
          return;
        }

        this.stripe.charges.create({card: this.token, amount: this.amount, currency: 'usd'});
        this.request.respond200('', 'text/plain', 'utf8');
      },

      errorCheck: function() {
        if (this.amount == undefined || this.token == undefined) {
          return false;
        }
        if (/^\d+$/.test(this.amount) == false) {
          return false;
        }
        if (this.amount <= 50) {
          return false;
        }
        return true;
      }
    });
  }
);
