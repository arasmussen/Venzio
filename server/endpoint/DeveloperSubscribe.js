// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'basejs',
    'url',
    'model/subscription'
  ],
  function(Base, url, subscriptionModel) {
    return Base.extend({
      constructor: function(request, response) {
        urlParams = url.parse(request.url, true).query;
        this.email = urlParams.email;
        this.subscribe = urlParams.subscribe;
        this.response = response;
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
            this.response.writeHead(302, {
              'Location': '/subscribe?email=' + encodeURIComponent(this.email) + '&failed=true'
            });
          } else if (message == 'DEVELOPER_SUBSCRIBE_EMAIL_ALREADY_EXISTS') {
            this.response.writeHead(302, {
              'Location': '/subscribe?email=' + encodeURIComponent(this.email) + '&exists=true'
            });
          } else if (message == 'DEVELOPER_SUBSCRIBE_FAIL') {
            this.response.writeHead(302, {
              'Location': '/subscribe?email=' + encodeURIComponent(this.email) + '&error=true'
            });
          } else if (message == 'DEVELOPER_SUBSCRIBE_SUCCESS') {
            this.response.writeHead(302, {
              'Location': '/thanks'
            });
          }
        } else {
          if (message == 'DEVELOPER_UNSUBSCRIBE_BAD_EMAIL') {
            this.response.writeHead(302, {
              'Location': '/unsubscribe?email=' + encodeURIComponent(this.email) + '&failed=true'
            });
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_EMAIL_DOESNT_EXIST') {
            this.response.writeHead(302, {
              'Location': '/unsubscribe?email=' + encodeURIComponent(this.email) + '&exists=false'
            });
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_FAIL') {
            this.response.writeHead(302, {
              'Location': '/unsubscribe?email=' + encodeURIComponent(this.email) + '&error=true'
            });
          } else if (message == 'DEVELOPER_UNSUBSCRIBE_SUCCESS') {
            this.response.writeHead(302, {
              'Location': '/sorry'
            });
          }
        }
        this.response.end();
      }
    });
  }
);
