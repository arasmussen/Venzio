// Copyright (c) Venzio 2013 All Rights Reserved

define(function() {
  return {
    makePayment: function(amount, item) {
      StripeCheckout.open({
        key: 'pk_test_WerXTKxbpzfgPjrJ3KuAAtqW',
        amount: amount,
        currency: 'usd',
        name: 'Venzio',
        item: item,
        panelLabel: 'Checkout',
        token: this.token.bind(this, amount)
      });
    },

    token: function(amount, token) {
      $.ajax('/charge', {
        data: {
          token: token.id,
          amount: amount
        }
      });
    }
  };
});
