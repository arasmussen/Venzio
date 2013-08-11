// Copyright (c) Venzio 2013 All Rights Reserved

define([
    'roots/www/endpoint/Payment',
    'roots/www/endpoint/PlayerLogin',
    'roots/www/endpoint/CreatePlayer',
    'roots/www/endpoint/Logout',
    'roots/www/endpoint/DeveloperSubscribe',
    'roots/www/endpoint/FakeSignup',
  ], function(
    PaymentEndpoint,
    LoginPlayerEndpoint,
    CreatePlayerEndpoint,
    LogoutEndpoint,
    DeveloperSubscribeEndpoint,
    FakeSignupEndpoint
  ) {
    return {
      // loads B when A is requested
      aliases: {
        '/': '/index',
        '/favicon.ico': '/img/favicon.ico',
      },

      // request A loads css files in B
      cssFiles: {
        '/index': ['index'],
        '/demo': ['demo'],
        '/jobs': ['jobs'],
        '/thanks': ['acknowledge'],
        '/sorry': ['acknowledge'],
        '/subscribe': ['form'],
        '/unsubscribe': ['form'],
        '/signup': ['form'],
        '/login': ['form'],
      },

      // request A calls js function B
      endpoints: {
        '/charge': PaymentEndpoint,
        '/playerLogin': LoginPlayerEndpoint,
        '/createPlayer': CreatePlayerEndpoint,
        '/logout': LogoutEndpoint,
        '/developerSubscribe': DeveloperSubscribeEndpoint,
        '/fakeSignup': FakeSignupEndpoint,
      }, 

      // sends a 302 redirect from A to B
      redirects: {
      }
    };
  }
);
