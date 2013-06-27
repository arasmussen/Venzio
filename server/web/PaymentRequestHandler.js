// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'stripe',
    'url'
  ],
  function(Base, stripe, url) {
    return Base.extend({
      constructor: function(request, response) {
        urlParams = url.parse(request.url, true).query;
        this.amount = urlParams.amount;
        this.token = urlParams.token;
        this.response = response;
        this.stripe = stripe('sk_test_bhh6uKmqdHSUauBObP1RYyFi');
      },

      handle: function() {
        if (!this.errorCheck()) {
          return;
        }

        this.stripe.charges.create({card: this.token, amount: this.amount, currency: 'usd'});

        this.response.writeHead(200, {'Content-Type': 'text/plain'});
        this.response.end();
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
