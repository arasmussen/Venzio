// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'model/subscription'
  ],
  function(Base, subscriptionModel) {
    return Base.extend({
      constructor: function(request) {
        var urlParams = request.getURLParams();
        this.email = urlParams.email;
        this.subscribe = urlParams.subscribe;
        this.request = request;
      },

      handle: function() {
        if (this.subscribe) {
          subscriptionModel.subscribe(this.email, this.respond.bind(this));
        } else {
          subscriptionModel.unsubscribe(this.email, this.respond.bind(this));
        }
      },

      respond: function(message) {
        if (this.subscribe) {
          if (message == 'DEVELOPER_SUBSCRIBE_BAD_EMAIL') {
            this.request.respond302('/subscribe?email=' + encodeURIComponent(this.email) + '&failed=true');
          } else if (message == 'DEVELOPER_SUBSCRIBE_EMAIL_ALREADY_EXISTS') {
            this.request.respond302('/subscribe?email=' + encodeURIComponent(this.email) + '&exists=true');
          } else if (message == 'DEVELOPER_SUBSCRIBE_FAIL') {
            this.request.respond302('/subscribe?email=' + encodeURIComponent(this.email) + '&error=true');
          } else if (message == 'DEVELOPER_SUBSCRIBE_SUCCESS') {
            this.request.respond302('/thanks');
          }
        } else {
          if (message == 'DEVELOPER_UNSUBSCRIBE_BAD_EMAIL') {
            this.request.respond302('/unsubscribe?email=' + encodeURIComponent(this.email) + '&failed=true');
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_EMAIL_DOESNT_EXIST') {
            this.request.respond302('/unsubscribe?email=' + encodeURIComponent(this.email) + '&exists=false');
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_FAIL') {
            this.request.respond302('/unsubscribe?email=' + encodeURIComponent(this.email) + '&error=true');
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_SUCCESS') {
            this.request.respond302('/sorry');
          }
        }
      }
    });
  }
);
